// ─────────────────────────────────────────────────────────────────────────────
// PADI — Real Data Layer + Vendor Dashboard + Real Order Flow
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { auth, db } from "./lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { VendorVideoUploader } from "./VideoCatalogue";
import {
  listenForMessages,
  requestNotificationPermission,
  notifyStudentOrderAccepted,
  notifyRidersOrderReady,
  notifyStudentOrderDelivered,
} from "./notifications";

// ─── CSS ──────────────────────────────────────────────────────────────────────
const VD_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --brand: #FF5A1F;
  --brand2: #FF8C42;
  --green: #00C07F;
  --red: #FF4444;
  --yellow: #FFC107;
  --blue: #3B82F6;

  --bg: #0D0D10;
  --surface: #16161C;
  --surface2: #1E1E26;
  --border: #28283A;
  --text: #F2F2F8;
  --muted: #64647A;

  --font: 'DM Sans', sans-serif;
  --font-head: 'Syne', sans-serif;
}

html, body, #root {
  width: 100%;
  min-height: 100%;
}

img, video {
  max-width: 100%;
  height: auto;
}

button, input, textarea, select {
  font: inherit;
}

.vd-root {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  display: flex;
}

/* ── Sidebar ── */
.vd-sidebar {
  width: 230px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 0;
  flex-shrink: 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  top: 0;
  left: 0;
}

.vd-sidebar-top {
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.vd-shop-name {
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 800;
  margin-top: 10px;
  line-height: 1.3;
}

.vd-shop-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}

.vd-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.vd-nav {
  flex: 1;
  padding: 8px 0;
}

.vd-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  transition: all .15s;
  border-left: 3px solid transparent;
}

.vd-nav-item:hover {
  background: var(--surface2);
  color: var(--text);
}

.vd-nav-item.active {
  background: rgba(255,90,31,.08);
  color: var(--brand);
  border-left-color: var(--brand);
  font-weight: 600;
}

.vd-nav-icon {
  font-size: 18px;
  width: 22px;
  text-align: center;
}

.vd-nav-badge {
  margin-left: auto;
  background: var(--brand);
  color: #fff;
  border-radius: 100px;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 700;
  animation: badgePop .3s cubic-bezier(.34,1.56,.64,1);
}

@keyframes badgePop {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

.vd-nav-section {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--muted);
  padding: 14px 20px 4px;
  text-transform: uppercase;
}

/* ── Mobile controls ── */
.vd-menu-btn {
  display: none;
  position: fixed;
  top: 14px;
  left: 14px;
  z-index: 1200;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  color: var(--text);
  font-size: 22px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

.vd-close-btn {
  display: none;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
}

.vd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  opacity: 0;
  pointer-events: none;
  transition: opacity .2s ease;
  z-index: 1050;
}

.vd-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

/* ── Main ── */
.vd-main {
  margin-left: 230px;
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.vd-topbar {
  padding: 16px 28px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
  gap: 16px;
}

.vd-page-title {
  font-family: var(--font-head);
  font-size: 20px;
  font-weight: 700;
}

.vd-page-sub {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}

.vd-content {
  padding: 24px 28px;
  flex: 1;
  min-width: 0;
}

/* ── Stats ── */
.vd-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.vd-stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  min-width: 0;
}

.vd-stat-label {
  font-size: 11px;
  color: var(--muted);
  font-weight: 600;
  letter-spacing: .5px;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.vd-stat-val {
  font-family: var(--font-head);
  font-size: 26px;
  font-weight: 800;
  word-break: break-word;
}

.vd-orders-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

/* ── Order cards ── */
.vd-orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.vd-order-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  transition: transform .15s;
  min-width: 0;
}

.vd-order-card:hover {
  transform: translateY(-2px);
}

.vd-order-card.new {
  border-color: var(--brand);
  box-shadow: 0 0 0 1px var(--brand), 0 8px 24px rgba(255,90,31,.15);
  animation: newOrder .5s ease both;
}

@keyframes newOrder {
  from { opacity: 0; transform: scale(.95); }
  to { opacity: 1; transform: scale(1); }
}

.vd-order-header {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-bottom: 1px solid var(--border);
}

.vd-order-id {
  font-family: var(--font-head);
  font-size: 13px;
  font-weight: 700;
}

.vd-order-time {
  font-size: 11px;
  color: var(--muted);
}

.vd-order-body {
  padding: 14px 16px;
}

.vd-order-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  padding: 4px 0;
}

.vd-order-footer {
  padding: 12px 16px;
  background: var(--surface2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.vd-order-total {
  font-family: var(--font-head);
  font-size: 16px;
  font-weight: 700;
  color: var(--brand);
}

.vd-order-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.vd-btn-accept {
  background: rgba(0,192,127,.15);
  color: var(--green);
  border: 1px solid rgba(0,192,127,.3);
  border-radius: 9px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
}

.vd-btn-accept:hover {
  background: rgba(0,192,127,.25);
}

.vd-btn-reject {
  background: rgba(255,68,68,.1);
  color: var(--red);
  border: 1px solid rgba(255,68,68,.2);
  border-radius: 9px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
}

.vd-btn-reject:hover {
  background: rgba(255,68,68,.2);
}

/* ── Status badges ── */
.vd-badge {
  border-radius: 100px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-transform: capitalize;
}

.vd-badge-pending {
  background: rgba(255,193,7,.12);
  color: var(--yellow);
  border: 1px solid rgba(255,193,7,.2);
}

.vd-badge-accepted {
  background: rgba(0,192,127,.12);
  color: var(--green);
  border: 1px solid rgba(0,192,127,.2);
}

.vd-badge-preparing {
  background: rgba(255,90,31,.12);
  color: var(--brand);
  border: 1px solid rgba(255,90,31,.2);
}

.vd-badge-ready {
  background: rgba(59,130,246,.12);
  color: var(--blue);
  border: 1px solid rgba(59,130,246,.2);
}

.vd-badge-delivered {
  background: rgba(100,100,122,.12);
  color: var(--muted);
  border: 1px solid var(--border);
}

.vd-badge-rejected {
  background: rgba(255,68,68,.08);
  color: var(--red);
  border: 1px solid rgba(255,68,68,.15);
}

/* ── Menu management ── */
.vd-menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.vd-menu-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  min-width: 0;
}

.vd-menu-card-body {
  padding: 14px;
}

.vd-menu-card-name {
  font-family: var(--font-head);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
}

.vd-menu-card-desc {
  font-size: 12px;
  color: var(--muted);
  margin-top: 3px;
  line-height: 1.4;
}

.vd-menu-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  background: var(--surface2);
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.vd-menu-price {
  font-family: var(--font-head);
  font-size: 16px;
  font-weight: 800;
  color: var(--brand);
}

.vd-menu-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.vd-btn-sm {
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--text);
  transition: all .15s;
}

.vd-btn-sm:hover {
  background: var(--surface);
}

.vd-btn-sm.danger {
  color: var(--red);
  border-color: rgba(255,68,68,.2);
}

.vd-toggle-avail {
  width: 36px;
  height: 20px;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  transition: background .2s;
  position: relative;
  flex-shrink: 0;
}

.vd-toggle-avail::after {
  content: '';
  position: absolute;
  top: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: left .2s;
}

.vd-toggle-avail.on {
  background: var(--green);
}

.vd-toggle-avail.on::after {
  left: 18px;
}

.vd-toggle-avail.off {
  background: var(--border);
}

.vd-toggle-avail.off::after {
  left: 2px;
}

/* ── Add item form ── */
.vd-add-form {
  background: var(--surface);
  border: 1.5px solid rgba(255,90,31,.25);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.vd-add-form-title {
  font-family: var(--font-head);
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
}

.vd-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.vd-input {
  background: var(--surface2);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 11px 14px;
  color: var(--text);
  font-family: var(--font);
  font-size: 14px;
  outline: none;
  width: 100%;
  transition: border-color .15s;
}

.vd-input:focus {
  border-color: var(--brand);
}

.vd-input::placeholder {
  color: var(--muted);
}

.vd-btn-primary {
  background: linear-gradient(135deg, var(--brand), var(--brand2));
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity .15s;
}

.vd-btn-primary:hover {
  opacity: .9;
}

.vd-btn-primary:disabled {
  opacity: .5;
}

.vd-btn-ghost {
  background: var(--surface2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 11px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
}

/* ── Filter tabs ── */
.vd-filter-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.vd-filter-tab {
  padding: 7px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border);
  color: var(--muted);
  background: var(--surface2);
  transition: all .15s;
  user-select: none;
}

.vd-filter-tab.active {
  background: rgba(255,90,31,.12);
  color: var(--brand);
  border-color: rgba(255,90,31,.3);
}

/* ── Login ── */
.vd-login {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.vd-login-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 36px;
  width: 100%;
  max-width: 400px;
}

/* ── Empty ── */
.vd-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
}

.vd-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.vd-empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.vd-empty-sub {
  font-size: 13px;
}

/* ── Toast ── */
.vd-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1300;
  box-shadow: 0 8px 32px rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  gap: 8px;
  animation: toastIn .3s ease both;
  max-width: calc(100vw - 24px);
}

@keyframes toastIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Pending ── */
.vd-pending {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.vd-pending-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 40px;
  max-width: 440px;
  text-align: center;
  width: 100%;
}

.vd-overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 1024px) {
  .vd-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .vd-orders-stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .vd-root {
    display: block;
  }

  .vd-menu-btn {
    display: flex;
  }

  .vd-close-btn {
    display: inline-block;
  }

  .vd-sidebar {
    width: 260px;
    transform: translateX(-100%);
    transition: transform .25s ease;
    z-index: 1100;
  }

  .vd-sidebar.open {
    transform: translateX(0);
  }

  .vd-main {
    margin-left: 0;
    width: 100%;
  }

  .vd-topbar {
    padding: 16px 16px 16px 68px;
    align-items: flex-start;
    flex-direction: column;
  }

  .vd-content {
    padding: 16px;
  }

  .vd-stats,
  .vd-orders-stats-grid,
  .vd-overview-grid,
  .vd-orders-grid,
  .vd-menu-grid,
  .vd-form-row {
    grid-template-columns: 1fr;
  }

  .vd-login-card,
  .vd-pending-card {
    padding: 24px;
  }

  .vd-toast {
    right: 12px;
    left: 12px;
    bottom: 12px;
  }
}

::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
`;

// ─── Firestore Helpers ────────────────────────────────────────────────────────

export async function fetchVendors() {
  const snap = await getDocs(
    query(collection(db, "vendors"), where("status", "==", "active"))
  );

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchAllMenuItems() {
  const vendorSnap = await getDocs(
    query(collection(db, "vendors"), where("status", "==", "active"))
  );

  const allItems = [];

  for (const vendorDoc of vendorSnap.docs) {
    const menuSnap = await getDocs(
      query(
        collection(db, "vendors", vendorDoc.id, "menu"),
        where("available", "==", true)
      )
    );

    menuSnap.docs.forEach((d) => {
      allItems.push({
        id: d.id,
        vendorId: vendorDoc.id,
        vendorName: vendorDoc.data().businessName,
        ...d.data(),
      });
    });
  }

  return allItems;
}

export async function placeOrder({
  studentId,
  studentName,
  items,
  vendorId,
  vendorName,
  paymentMethod,
  deliveryAddress,
  total,
}) {
  const orderRef = await addDoc(collection(db, "orders"), {
    studentId,
    studentName,
    vendorId,
    vendorName,
    items,
    total,
    paymentMethod,
    deliveryAddress,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return orderRef.id;
}

// ─── useVendors hook ──────────────────────────────────────────────────────────
export function useVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "vendors"), where("status", "==", "active"));

    const unsub = onSnapshot(q, (snap) => {
      setVendors(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsub;
  }, []);

  return { vendors, loading };
}

// ─── useMenuItems hook ────────────────────────────────────────────────────────
export function useMenuItems(vendorId = null) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);

      try {
        if (vendorId) {
          const q = query(
            collection(db, "vendors", vendorId, "menu"),
            where("available", "==", true)
          );

          const snap = await getDocs(q);
          setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } else {
          const allItems = await fetchAllMenuItems();
          setItems(allItems);
        }
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    };

    fetchItems();
  }, [vendorId]);

  return { items, loading };
}

// ─── Vendor Login ─────────────────────────────────────────────────────────────
function VendorLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) return;

    setLoading(true);
    setError("");

    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const vendorDoc = await getDoc(doc(db, "vendors", result.user.uid));

      if (!vendorDoc.exists()) {
        await signOut(auth);
        setError("No vendor account found. Please register first.");
        setLoading(false);
        return;
      }

      onLogin({ uid: result.user.uid, ...vendorDoc.data() });
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Login failed. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="vd-login">
      <style>{VD_CSS}</style>

      <div className="vd-login-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg,#FF5A1F,#FF8C42)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-head)",
              fontWeight: 800,
              color: "#fff",
              fontSize: 18,
            }}
          >
            P
          </div>

          <div>
            <div
              style={{
                fontFamily: "var(--font-head)",
                fontWeight: 800,
                fontSize: 17,
              }}
            >
              PADI for Vendors
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Vendor Portal
            </div>
          </div>
        </div>

        <div
          style={{
            fontFamily: "var(--font-head)",
            fontSize: 22,
            fontWeight: 800,
            marginBottom: 6,
          }}
        >
          Welcome back 👋
        </div>

        <div
          style={{
            fontSize: 14,
            color: "var(--muted)",
            marginBottom: 24,
          }}
        >
          Sign in to manage your shop and orders.
        </div>

        {error && (
          <div
            style={{
              background: "rgba(255,68,68,.1)",
              border: "1px solid rgba(255,68,68,.2)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              color: "var(--red)",
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <input
            className="vd-input"
            type="email"
            placeholder="Business email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="vd-input"
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <button
          className="vd-btn-primary"
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? "Signing in..." : "Sign In to Dashboard →"}
        </button>

        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          Don't have an account?{" "}
          <a href="/" style={{ color: "var(--brand)", fontWeight: 600 }}>
            Register on PADI
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Pending Approval Screen ──────────────────────────────────────────────────
function VendorPending({ vendor, onLogout }) {
  return (
    <div className="vd-pending">
      <style>{VD_CSS}</style>

      <div className="vd-pending-card">
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>

        <div
          style={{
            fontFamily: "var(--font-head)",
            fontSize: 22,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          Under Review
        </div>

        <div
          style={{
            fontSize: 14,
            color: "var(--muted)",
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          <strong>{vendor.businessName}</strong> is being reviewed by the PADI
          team. You’ll be notified once approved and your shop goes live for
          students!
        </div>

        <div
          style={{
            background: "rgba(255,193,7,.08)",
            border: "1px solid rgba(255,193,7,.2)",
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: 13,
            color: "var(--yellow)",
            marginBottom: 20,
          }}
        >
          ⏱ Review typically takes 24–48 hours
        </div>

        <button
          className="vd-btn-ghost"
          onClick={onLogout}
          style={{ width: "100%" }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────
function OrdersPage({ vendorId, vendorName, showToast }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("pending");
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("vendorId", "==", vendorId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const newOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (!isFirstLoad.current) {
        snap.docChanges().forEach((change) => {
          if (change.type === "added") {
            showToast("🔔 New order received!");
          }
        });
      }

      isFirstLoad.current = false;
      setOrders(newOrders);
    });

    return unsub;
  }, [vendorId, showToast]);

  const updateOrderStatus = async (order, newStatus) => {
    await updateDoc(doc(db, "orders", order.id), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    if (newStatus === "accepted") {
      await notifyStudentOrderAccepted({
        studentId: order.studentId,
        vendorName: vendorName || "Vendor",
        orderId: order.id,
      });
    }

    if (newStatus === "ready") {
      await notifyRidersOrderReady({
        orderId: order.id,
        vendorName: vendorName || "Vendor",
        deliveryAddress: order.deliveryAddress,
      });
    }

    if (newStatus === "delivered") {
      await notifyStudentOrderDelivered({
        studentId: order.studentId,
        vendorName: vendorName || "Vendor",
        orderId: order.id,
      });
    }
  };

  const filtered = orders.filter((o) =>
    filter === "all" ? true : o.status === filter
  );

  const counts = {
    pending: orders.filter((o) => o.status === "pending").length,
    accepted: orders.filter((o) => o.status === "accepted").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
  };

  const getBadgeClass = (status) => {
    const map = {
      pending: "vd-badge-pending",
      accepted: "vd-badge-accepted",
      preparing: "vd-badge-preparing",
      ready: "vd-badge-ready",
      delivered: "vd-badge-delivered",
      rejected: "vd-badge-rejected",
    };

    return map[status] || "vd-badge-pending";
  };

  const getNextAction = (status) => {
    const map = {
      accepted: "preparing",
      preparing: "ready",
      ready: "delivered",
    };

    return map[status];
  };

  const getNextLabel = (status) => {
    const map = {
      accepted: "Mark Preparing",
      preparing: "Mark Ready",
      ready: "Mark Delivered",
    };

    return map[status];
  };

  return (
    <div>
      <div className="vd-orders-stats-grid">
        {[
          { label: "Pending", val: counts.pending, color: "var(--yellow)" },
          { label: "Accepted", val: counts.accepted, color: "var(--green)" },
          { label: "Preparing", val: counts.preparing, color: "var(--brand)" },
          { label: "Ready", val: counts.ready, color: "var(--blue)" },
        ].map((s) => (
          <div
            key={s.label}
            className="vd-stat"
            style={{ borderTop: `3px solid ${s.color}` }}
          >
            <div className="vd-stat-label">{s.label}</div>
            <div className="vd-stat-val" style={{ color: s.color }}>
              {s.val}
            </div>
          </div>
        ))}
      </div>

      <div className="vd-filter-tabs">
        {[
          "pending",
          "accepted",
          "preparing",
          "ready",
          "delivered",
          "rejected",
          "all",
        ].map((f) => (
          <div
            key={f}
            className={`vd-filter-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {counts[f] > 0 && (
              <span
                style={{
                  marginLeft: 5,
                  background: "var(--brand)",
                  color: "#fff",
                  borderRadius: 100,
                  padding: "0 5px",
                  fontSize: 10,
                }}
              >
                {counts[f]}
              </span>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="vd-empty">
          <div className="vd-empty-icon">📦</div>
          <div className="vd-empty-title">No {filter} orders</div>
          <div className="vd-empty-sub">
            {filter === "pending"
              ? "New orders will appear here instantly"
              : "Nothing here yet"}
          </div>
        </div>
      ) : (
        <div className="vd-orders-grid">
          {filtered.map((order) => (
            <div
              key={order.id}
              className={`vd-order-card ${
                order.status === "pending" ? "new" : ""
              }`}
            >
              <div className="vd-order-header">
                <div>
                  <div className="vd-order-id">
                    #{order.id.slice(-6).toUpperCase()}
                  </div>
                  <div className="vd-order-time">
                    {order.createdAt
                      ?.toDate?.()
                      ?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) || "Just now"}
                  </div>
                </div>

                <span className={`vd-badge ${getBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="vd-order-body">
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  👤 {order.studentName || "Student"} ·{" "}
                  {order.deliveryAddress || "Campus"}
                </div>

                {(order.items || []).map((item, i) => (
                  <div className="vd-order-item" key={i}>
                    <span>
                      {item.qty}x {item.name}
                    </span>
                    <span style={{ color: "var(--brand)", fontWeight: 600 }}>
                      ₦{(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                ))}

                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 8,
                  }}
                >
                  💳 {order.paymentMethod || "Wallet"}
                </div>
              </div>

              <div className="vd-order-footer">
                <div className="vd-order-total">
                  ₦{(order.total || 0).toLocaleString()}
                </div>

                <div className="vd-order-actions">
                  {order.status === "pending" && (
                    <>
                      <button
                        className="vd-btn-accept"
                        onClick={() => updateOrderStatus(order, "accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="vd-btn-reject"
                        onClick={() => updateOrderStatus(order, "rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {getNextAction(order.status) && (
                    <button
                      className="vd-btn-accept"
                      onClick={() =>
                        updateOrderStatus(order, getNextAction(order.status))
                      }
                    >
                      {getNextLabel(order.status)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Menu Management Page ─────────────────────────────────────────────────────
function MenuPage({ vendorId, showToast }) {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    const q = collection(db, "vendors", vendorId, "menu");

    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, [vendorId]);

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      description: "",
      category: "",
    });
    setEditItem(null);
    setShowForm(false);
  };

  const saveItem = async () => {
    if (!form.name || !form.price) return;

    setSaving(true);

    try {
      if (editItem) {
        await updateDoc(doc(db, "vendors", vendorId, "menu", editItem.id), {
          ...form,
          price: Number(form.price),
          updatedAt: serverTimestamp(),
        });

        showToast("Item updated!");
      } else {
        await addDoc(collection(db, "vendors", vendorId, "menu"), {
          ...form,
          price: Number(form.price),
          available: true,
          vendorId,
          createdAt: serverTimestamp(),
        });

        showToast("Item added!");
      }

      resetForm();
    } catch (e) {
      showToast("Failed to save item.", "var(--red)");
    }

    setSaving(false);
  };

  const toggleAvail = async (item) => {
    await updateDoc(doc(db, "vendors", vendorId, "menu", item.id), {
      available: !item.available,
    });

    showToast(
      item.available ? "Item hidden from students" : "Item now visible!"
    );
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Delete this item?")) return;

    await deleteDoc(doc(db, "vendors", vendorId, "menu", itemId));
    showToast("Item deleted.");
  };

  const startEdit = (item) => {
    setForm({
      name: item.name,
      price: String(item.price),
      description: item.description || "",
      category: item.category || "",
    });
    setEditItem(item);
    setShowForm(true);
  };

  return (
    <div>
      {showVideoUpload && (
        <VendorVideoUploader
          vendorId={vendorId}
          onClose={() => setShowVideoUpload(false)}
          showToast={showToast}
        />
      )}

      {showForm ? (
        <div className="vd-add-form">
          <div className="vd-add-form-title">
            {editItem ? "✏️ Edit Item" : "➕ Add New Item"}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div className="vd-form-row">
              <input
                className="vd-input"
                placeholder="Item name *"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
              <input
                className="vd-input"
                placeholder="Price (₦) *"
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm((p) => ({ ...p, price: e.target.value }))
                }
              />
            </div>

            <div className="vd-form-row">
              <input
                className="vd-input"
                placeholder="Category (e.g. Rice dishes)"
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
              />
              <input
                className="vd-input"
                placeholder="Short description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="vd-btn-ghost" onClick={resetForm}>
                Cancel
              </button>

              <button
                className="vd-btn-primary"
                onClick={saveItem}
                disabled={!form.name || !form.price || saving}
              >
                {saving ? "Saving..." : editItem ? "Update Item" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <button
            className="vd-btn-primary"
            onClick={() => setShowForm(true)}
            style={{ marginBottom: 20 }}
          >
            + Add Menu Item
          </button>

          <button
            className="vd-btn-primary"
            onClick={() => setShowVideoUpload(true)}
            style={{
              marginBottom: 20,
              background: "linear-gradient(135deg,#7C3AED,#A855F7)",
            }}
          >
            🎬 Record Food Video
          </button>

          {items.length === 0 ? (
            <div className="vd-empty">
              <div className="vd-empty-icon">🍽️</div>
              <div className="vd-empty-title">No menu items yet</div>
              <div className="vd-empty-sub">Add your first item above</div>
            </div>
          ) : (
            <div className="vd-menu-grid">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="vd-menu-card"
                  style={{ opacity: item.available ? 1 : 0.6 }}
                >
                  <div className="vd-menu-card-body">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <div className="vd-menu-card-name">{item.name}</div>

                      <button
                        className={`vd-toggle-avail ${
                          item.available ? "on" : "off"
                        }`}
                        onClick={() => toggleAvail(item)}
                        title={
                          item.available
                            ? "Hide from students"
                            : "Show to students"
                        }
                      />
                    </div>

                    {item.description && (
                      <div className="vd-menu-card-desc">
                        {item.description}
                      </div>
                    )}

                    {item.category && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--brand)",
                          fontWeight: 600,
                          marginTop: 6,
                        }}
                      >
                        {item.category}
                      </div>
                    )}
                  </div>

                  <div className="vd-menu-card-footer">
                    <div className="vd-menu-price">
                      ₦{Number(item.price).toLocaleString()}
                    </div>

                    <div className="vd-menu-actions">
                      <button
                        className="vd-btn-sm"
                        onClick={() => startEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="vd-btn-sm danger"
                        onClick={() => deleteItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Overview Page ────────────────────────────────────────────────────────────
function VendorOverview({ vendor, orders }) {
  const today = new Date();

  const todayOrders = orders.filter((o) => {
    const d = o.createdAt?.toDate?.();
    return d && d.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders
    .filter((o) => o.status !== "rejected")
    .reduce((a, o) => a + (o.total || 0), 0);

  const totalRevenue = orders
    .filter((o) => o.status !== "rejected")
    .reduce((a, o) => a + (o.total || 0), 0);

  return (
    <div>
      <div className="vd-stats">
        {[
          {
            label: "Today’s Orders",
            val: todayOrders.length,
            color: "var(--brand)",
          },
          {
            label: "Today’s Revenue",
            val: `₦${todayRevenue.toLocaleString()}`,
            color: "var(--green)",
          },
          {
            label: "Total Orders",
            val: orders.length,
            color: "var(--blue)",
          },
          {
            label: "Total Revenue",
            val: `₦${totalRevenue.toLocaleString()}`,
            color: "var(--yellow)",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="vd-stat"
            style={{ borderTop: `3px solid ${s.color}` }}
          >
            <div className="vd-stat-label">{s.label}</div>
            <div
              className="vd-stat-val"
              style={{
                color: s.color,
                fontSize: typeof s.val === "string" ? 20 : 26,
              }}
            >
              {s.val}
            </div>
          </div>
        ))}
      </div>

      <div className="vd-overview-grid">
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid var(--border)",
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Recent Orders
          </div>

          {orders.slice(0, 5).length === 0 ? (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              No orders yet
            </div>
          ) : (
            orders.slice(0, 5).map((o) => (
              <div
                key={o.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 18px",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 13,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    #{o.id.slice(-6).toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      marginTop: 2,
                    }}
                  >
                    {o.studentName || "Student"}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--brand)",
                    }}
                  >
                    ₦{(o.total || 0).toLocaleString()}
                  </div>
                  <span
                    style={{ fontSize: 11 }}
                    className={`vd-badge vd-badge-${o.status}`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 16,
            }}
        
          >
            Shop Info
          </div>

          {[
            { label: "Category", val: vendor.category },
            { label: "Location", val: vendor.location },
            { label: "Phone", val: vendor.phone },
            {
              label: "Hours",
              val:
                vendor.opensAt && vendor.closesAt
                  ? `${vendor.opensAt} – ${vendor.closesAt}`
                  : "Not set",
            },
            {
              label: "Delivery Radius",
              val: vendor.deliveryRadius || "On campus",
            },
          ].map((r) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "9px 0",
                borderBottom: "1px solid var(--border)",
                fontSize: 13,
              }}
            >
              <span style={{ color: "var(--muted)" }}>{r.label}</span>
              <span style={{ fontWeight: 500, textAlign: "right" }}>
                {r.val || "N/A"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Vendor Dashboard ────────────────────────────────────────────────────
export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [page, setPage] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (msg, color = "var(--green)") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (vendor?.uid) {
      requestNotificationPermission(vendor.uid, "vendor");
      const unsub = listenForMessages((notif) => showToast(notif.title));
      return unsub;
    }
  }, [vendor?.uid]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const vendorDoc = await getDoc(doc(db, "vendors", user.uid));

        if (vendorDoc.exists()) {
          setVendor({ uid: user.uid, ...vendorDoc.data() });
        } else {
          setVendor(null);
        }
      } else {
        setVendor(null);
      }
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (!vendor?.uid) return;

    const q = query(
      collection(db, "orders"),
      where("vendorId", "==", vendor.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, [vendor?.uid]);

  const handleLogout = async () => {
    await signOut(auth);
    setVendor(null);
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const NAV = [
    { key: "overview", icon: "📊", label: "Overview" },
    { key: "orders", icon: "📦", label: "Orders", badge: pendingCount },
    { key: "menu", icon: "🍽️", label: "Menu" },
  ];

  const PAGE_TITLES = {
    overview: {
      title: "Dashboard",
      sub: `Welcome back, ${vendor?.businessName || "Vendor"} 👋`,
    },
    orders: {
      title: "Orders",
      sub: "Real-time order management",
    },
    menu: {
      title: "Menu Management",
      sub: "Add, edit or hide menu items",
    },
  };

  if (!vendor) return <VendorLogin onLogin={setVendor} />;

  if (vendor.status === "pending") {
    return <VendorPending vendor={vendor} onLogout={handleLogout} />;
  }

  if (vendor.status === "suspended") {
    return (
      <div className="vd-pending">
        <style>{VD_CSS}</style>

        <div className="vd-pending-card">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>

          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            Account Suspended
          </div>

          <div
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            Your account has been suspended. Please contact PADI support to
            resolve this.
          </div>

          <button
            className="vd-btn-ghost"
            onClick={handleLogout}
            style={{ width: "100%" }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vd-root">
      <style>{VD_CSS}</style>

      <button
        className="vd-menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>

      <div
        className={`vd-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`vd-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="vd-sidebar-top">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#FF5A1F,#FF8C42)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  color: "#fff",
                  fontSize: 15,
                }}
              >
                P
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  fontWeight: 600,
                }}
              >
                PADI Vendor
              </div>
            </div>

            <button
              className="vd-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="vd-shop-name">{vendor.businessName}</div>

          <div className="vd-shop-status">
            <div
              className="vd-status-dot"
              style={{
                background: isOnline ? "var(--green)" : "var(--muted)",
              }}
            />
            <span
              style={{
                color: isOnline ? "var(--green)" : "var(--muted)",
                fontSize: 12,
              }}
            >
              {isOnline ? "Open for orders" : "Shop closed"}
            </span>
          </div>

          <button
            onClick={() => setIsOnline((p) => !p)}
            style={{
              marginTop: 10,
              background: isOnline
                ? "rgba(255,68,68,.1)"
                : "rgba(0,192,127,.1)",
              color: isOnline ? "var(--red)" : "var(--green)",
              border: `1px solid ${
                isOnline ? "rgba(255,68,68,.2)" : "rgba(0,192,127,.2)"
              }`,
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
            }}
          >
            {isOnline ? "Close Shop" : "Open Shop"}
          </button>
        </div>

        <div className="vd-nav">
          <div className="vd-nav-section">Main</div>

          {NAV.map((n) => (
            <div
              key={n.key}
              className={`vd-nav-item ${page === n.key ? "active" : ""}`}
              onClick={() => {
                setPage(n.key);
                setSidebarOpen(false);
              }}
            >
              <span className="vd-nav-icon">{n.icon}</span>
              <span>{n.label}</span>
              {n.badge > 0 && <span className="vd-nav-badge">{n.badge}</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: "0 0 16px" }}>
          <div
            className="vd-nav-item"
            onClick={handleLogout}
            style={{ color: "var(--red)" }}
          >
            <span className="vd-nav-icon">🚪</span>
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      <div className="vd-main">
        <div className="vd-topbar">
          <div>
            <div className="vd-page-title">{PAGE_TITLES[page].title}</div>
            <div className="vd-page-sub">{PAGE_TITLES[page].sub}</div>
          </div>

          {pendingCount > 0 && (
            <div
              onClick={() => setPage("orders")}
              style={{
                background: "rgba(255,90,31,.1)",
                border: "1px solid rgba(255,90,31,.3)",
                borderRadius: 10,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--brand)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                animation: "badgePop .3s ease",
              }}
            >
              🔔 {pendingCount} new order{pendingCount > 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div className="vd-content">
          {page === "overview" && (
            <VendorOverview vendor={vendor} orders={orders} />
          )}
          {page === "orders" && (
            <OrdersPage
              vendorId={vendor.uid}
              vendorName={vendor.businessName}
              showToast={showToast}
            />
          )}
          {page === "menu" && (
            <MenuPage vendorId={vendor.uid} showToast={showToast} />
          )}
        </div>
      </div>

      {toast && (
        <div className="vd-toast" style={{ borderColor: toast.color }}>
          <span style={{ color: toast.color }}>●</span> {toast.msg}
        </div>
      )}
    </div>
  );
}