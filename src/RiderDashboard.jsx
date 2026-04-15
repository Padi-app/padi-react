import { useEffect, useRef, useState } from "react";
import { auth, db } from "./lib/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  listenForMessages,
  requestNotificationPermission,
} from "./notifications";

// ─── CSS ──────────────────────────────────────────────────────────────────────
const RD_CSS = `
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
  --rider: #7C3AED;
  --rider2: #A855F7;
  --bg: #0D0D12;
  --surface: #14141C;
  --surface2: #1C1C28;
  --border: #26263A;
  --text: #F0F0F8;
  --muted: #8A8AA8;
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

/* Root */
.rd-root {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  display: flex;
}

/* Sidebar */
.rd-sidebar {
  width: 230px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  top: 0;
  left: 0;
  z-index: 1100;
}

.rd-sidebar-top {
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.rd-rider-name {
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 800;
  margin-top: 10px;
  line-height: 1.3;
}

.rd-online-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 14px;
  margin-top: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.rd-online-toggle.online {
  background: rgba(0, 192, 127, 0.1);
  border-color: rgba(0, 192, 127, 0.3);
}

.rd-online-label {
  font-size: 13px;
  font-weight: 600;
}

.rd-switch {
  width: 40px;
  height: 22px;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
  flex-shrink: 0;
}

.rd-switch::after {
  content: "";
  position: absolute;
  top: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s;
}

.rd-switch.on {
  background: var(--green);
}

.rd-switch.on::after {
  left: 21px;
}

.rd-switch.off {
  background: var(--border);
}

.rd-switch.off::after {
  left: 3px;
}

.rd-nav {
  flex: 1;
  padding: 8px 0;
}

.rd-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  transition: all 0.15s;
  border-left: 3px solid transparent;
}

.rd-nav-item:hover {
  background: var(--surface2);
  color: var(--text);
}

.rd-nav-item.active {
  background: rgba(124, 58, 237, 0.08);
  color: var(--rider);
  border-left-color: var(--rider);
  font-weight: 600;
}

.rd-nav-icon {
  font-size: 18px;
  width: 22px;
  text-align: center;
}

.rd-nav-badge {
  margin-left: auto;
  background: var(--rider);
  color: #fff;
  border-radius: 100px;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 700;
  animation: pop 0.3s cubic-bezier(.34,1.56,.64,1);
}

@keyframes pop {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

/* Mobile sidebar controls */
.rd-menu-btn {
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

.rd-close-btn {
  display: none;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
}

.rd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  opacity: 0;
  pointer-events: none;
  transition: opacity .2s ease;
  z-index: 1050;
}

.rd-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

/* Main */
.rd-main {
  margin-left: 230px;
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.rd-topbar {
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

.rd-page-title {
  font-family: var(--font-head);
  font-size: 20px;
  font-weight: 700;
}

.rd-page-sub {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}

.rd-content {
  padding: 24px 28px;
  flex: 1;
  min-width: 0;
}

/* Stats */
.rd-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.rd-stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  min-width: 0;
}

.rd-stat-label {
  font-size: 11px;
  color: var(--muted);
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.rd-stat-val {
  font-family: var(--font-head);
  font-size: 26px;
  font-weight: 800;
  word-break: break-word;
}

.rd-earnings-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

/* Order cards */
.rd-orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.rd-order-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.15s;
  min-width: 0;
}

.rd-order-card:hover {
  transform: translateY(-2px);
}

.rd-order-card.available {
  border-color: var(--rider);
  box-shadow: 0 0 0 1px var(--rider), 0 8px 24px rgba(124, 58, 237, 0.15);
  animation: newCard 0.4s ease both;
}

@keyframes newCard {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.rd-order-header {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-bottom: 1px solid var(--border);
  background: var(--surface2);
}

.rd-order-id {
  font-family: var(--font-head);
  font-size: 14px;
  font-weight: 700;
}

.rd-order-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rd-route {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.rd-route-dots {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 3px;
  gap: 3px;
}

.rd-dot-pickup {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--brand);
  flex-shrink: 0;
}

.rd-dot-line {
  width: 2px;
  height: 20px;
  background: var(--border);
}

.rd-dot-deliver {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--green);
  flex-shrink: 0;
}

.rd-route-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.rd-route-point {
  font-size: 13px;
  line-height: 1.3;
}

.rd-route-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--muted);
}

.rd-order-footer {
  padding: 12px 16px;
  background: var(--surface2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.rd-earning {
  font-family: var(--font-head);
  font-size: 16px;
  font-weight: 800;
  color: var(--green);
}

.rd-earning-label {
  font-size: 11px;
  color: var(--muted);
}

.rd-btn-accept {
  background: linear-gradient(135deg, var(--rider), var(--rider2));
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}

.rd-btn-accept:hover {
  opacity: 0.9;
}

.rd-btn-action {
  background: rgba(0, 192, 127, 0.12);
  color: var(--green);
  border: 1px solid rgba(0, 192, 127, 0.25);
  border-radius: 10px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.rd-btn-action:hover {
  background: rgba(0, 192, 127, 0.2);
}

/* Badges */
.rd-badge {
  border-radius: 100px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-transform: capitalize;
}

.rd-badge-available {
  background: rgba(124, 58, 237, 0.12);
  color: var(--rider);
  border: 1px solid rgba(124, 58, 237, 0.2);
}

.rd-badge-accepted {
  background: rgba(255, 193, 7, 0.12);
  color: var(--yellow);
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.rd-badge-picked_up {
  background: rgba(255, 90, 31, 0.12);
  color: var(--brand);
  border: 1px solid rgba(255, 90, 31, 0.2);
}

.rd-badge-delivered {
  background: rgba(0, 192, 127, 0.12);
  color: var(--green);
  border: 1px solid rgba(0, 192, 127, 0.2);
}

/* Earnings */
.rd-earnings-card {
  background: linear-gradient(135deg, #1a0a2e, #0d0d12);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.rd-earnings-card::before {
  content: "";
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%);
}

.rd-earnings-amount {
  font-family: var(--font-head);
  font-size: 42px;
  font-weight: 800;
  color: #fff;
  margin-top: 6px;
  word-break: break-word;
}

.rd-earnings-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}

.rd-earnings-row:last-child {
  border-bottom: none;
}

/* Registration */
.rd-reg-screen {
  min-height: 100vh;
  background: var(--bg);
  overflow-y: auto;
}

.rd-reg-hero {
  background: linear-gradient(160deg, #1a0a2e 0%, var(--bg) 100%);
  padding: 50px 24px 36px;
  position: relative;
  overflow: hidden;
}

.rd-reg-hero::before {
  content: "";
  position: absolute;
  top: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%);
}

.rd-steps {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
}

.rd-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.rd-step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.3s;
  border: 2px solid var(--border);
  color: var(--muted);
  background: var(--surface2);
}

.rd-step-dot.active {
  background: linear-gradient(135deg, var(--rider), var(--rider2));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
}

.rd-step-dot.done {
  background: var(--green);
  color: #fff;
  border-color: transparent;
}

.rd-step-label {
  font-size: 10px;
  color: var(--muted);
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

.rd-step-label.active {
  color: var(--rider);
  font-weight: 700;
}

.rd-step-line {
  flex: 1;
  height: 2px;
  background: var(--border);
  margin-bottom: 16px;
  transition: background 0.3s;
}

.rd-step-line.done {
  background: var(--green);
}

.rd-form {
  padding: 24px 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rd-input {
  background: var(--surface2);
  border: 1.5px solid var(--border);
  border-radius: 13px;
  padding: 14px 16px;
  color: var(--text);
  font-family: var(--font);
  font-size: 15px;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
}

.rd-input:focus {
  border-color: var(--rider);
}

.rd-input::placeholder {
  color: var(--muted);
}

.rd-select {
  background: var(--surface2);
  border: 1.5px solid var(--border);
  border-radius: 13px;
  padding: 14px 16px;
  color: var(--text);
  font-family: var(--font);
  font-size: 15px;
  outline: none;
  width: 100%;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.15s;
}

.rd-select:focus {
  border-color: var(--rider);
}

.rd-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.rd-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.rd-wrap {
  display: flex;
  flex-direction: column;
}

.rd-section-title {
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.rd-section-sub {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 4px;
  line-height: 1.4;
}

.rd-btn-primary {
  background: linear-gradient(135deg, var(--rider), var(--rider2));
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 15px 28px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: opacity 0.15s;
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
}

.rd-btn-primary:hover {
  opacity: 0.9;
}

.rd-btn-primary:disabled {
  opacity: 0.5;
}

.rd-btn-ghost {
  background: var(--surface2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.rd-info-box {
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  color: var(--rider2);
  line-height: 1.5;
}

/* Login */
.rd-login {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.rd-login-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 36px;
  width: 100%;
  max-width: 400px;
}

/* Pending/Suspended */
.rd-status-screen {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.rd-status-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 40px;
  max-width: 440px;
  text-align: center;
  width: 100%;
}

/* Empty */
.rd-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
}

.rd-empty-icon {
  font-size: 52px;
  margin-bottom: 12px;
}

.rd-empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.rd-empty-sub {
  font-size: 13px;
}

/* Toast */
.rd-toast {
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 8px;
  animation: toastIn 0.3s ease both;
  max-width: calc(100vw - 24px);
}

@keyframes toastIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Filter tabs */
.rd-filter-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.rd-filter-tab {
  padding: 7px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border);
  color: var(--muted);
  background: var(--surface2);
  transition: all 0.15s;
}

.rd-filter-tab.active {
  background: rgba(124, 58, 237, 0.12);
  color: var(--rider);
  border-color: rgba(124, 58, 237, 0.3);
}

@media (max-width: 1024px) {
  .rd-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .rd-earnings-stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .rd-root {
    display: block;
  }

  .rd-menu-btn {
    display: flex;
  }

  .rd-close-btn {
    display: inline-block;
  }

  .rd-sidebar {
    width: 260px;
    transform: translateX(-100%);
    transition: transform .25s ease;
  }

  .rd-sidebar.open {
    transform: translateX(0);
  }

  .rd-main {
    margin-left: 0;
    width: 100%;
  }

  .rd-topbar {
    padding: 16px 16px 16px 68px;
    align-items: flex-start;
    flex-direction: column;
  }

  .rd-content {
    padding: 16px;
  }

  .rd-stats,
  .rd-orders-grid,
  .rd-row {
    grid-template-columns: 1fr;
  }

  .rd-login-card,
  .rd-status-card {
    padding: 24px;
  }

  .rd-toast {
    right: 12px;
    left: 12px;
    bottom: 12px;
  }

  .rd-earnings-row {
    flex-direction: column;
    align-items: flex-start;
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

const VEHICLES = ["Motorcycle (Bike)", "Tricycle (Keke)", "Mini Van"];
const BANKS = [
  "Access Bank",
  "GTBank",
  "First Bank",
  "Zenith Bank",
  "UBA",
  "Opay",
  "Palmpay",
  "Kuda Bank",
];
const RIDER_FEE = 300;

// ─── Step Bar ────────────────────────────────────────────────────────────────
function RiderStepBar({ step }) {
  const steps = ["Personal", "Vehicle", "Guarantor", "Bank"];

  return (
    <div className="rd-steps">
      {steps.map((label, i) => (
        <div key={label} style={{ display: "contents" }}>
          <div className="rd-step">
            <div
              className={`rd-step-dot ${
                i < step ? "done" : i === step ? "active" : ""
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <div className={`rd-step-label ${i === step ? "active" : ""}`}>
              {label}
            </div>
          </div>

          {i < steps.length - 1 && (
            <div className={`rd-step-line ${i < step ? "done" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Personal Info ───────────────────────────────────────────────────
function RiderStep1({
  data,
  setData,
  onNext,
  email,
  setEmail,
  password,
  setPassword,
}) {
  const valid =
    data.name && data.phone && data.address && email.trim() && password.trim();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div className="rd-section-title">Personal Info</div>
        <div className="rd-section-sub">
          Tell us about yourself. This will be shown to students.
        </div>
      </div>

      <div className="rd-wrap">
        <div className="rd-label">Full Name *</div>
        <input
          className="rd-input"
          placeholder="e.g. Emeka Okafor"
          value={data.name}
          onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
        />
      </div>

      <div className="rd-row">
        <div className="rd-wrap">
          <div className="rd-label">Phone Number *</div>
          <input
            className="rd-input"
            placeholder="08012345678"
            value={data.phone}
            onChange={(e) => setData((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>

        <div className="rd-wrap">
          <div className="rd-label">WhatsApp</div>
          <input
            className="rd-input"
            placeholder="08012345678"
            value={data.whatsapp}
            onChange={(e) =>
              setData((p) => ({ ...p, whatsapp: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="rd-wrap">
        <div className="rd-label">Home Address *</div>
        <input
          className="rd-input"
          placeholder="Your residential address"
          value={data.address}
          onChange={(e) =>
            setData((p) => ({ ...p, address: e.target.value }))
          }
        />
      </div>

      <div className="rd-wrap">
        <div className="rd-label">Date of Birth</div>
        <input
          className="rd-input"
          type="date"
          value={data.dob}
          onChange={(e) => setData((p) => ({ ...p, dob: e.target.value }))}
        />
      </div>

      <div style={{ height: 1, background: "var(--border)" }} />

      <div className="rd-wrap">
        <div className="rd-label">Email Address *</div>
        <input
          className="rd-input"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="rd-wrap">
        <div className="rd-label">Password *</div>
        <input
          className="rd-input"
          type="password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="rd-btn-primary" onClick={onNext} disabled={!valid}>
        Continue →
      </button>
    </div>
  );
}

// ─── Step 2: Vehicle Info ────────────────────────────────────────────────────
function RiderStep2({ data, setData, onNext, onBack }) {
  const valid = data.vehicleType && data.plateNumber;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div className="rd-section-title">Vehicle Details</div>
        <div className="rd-section-sub">
          Tell us about your delivery vehicle.
        </div>
      </div>

      <div className="rd-wrap">
        <div className="rd-label">Vehicle Type *</div>
        <select
          className="rd-select"
          value={data.vehicleType}
          onChange={(e) =>
            setData((p) => ({ ...p, vehicleType: e.target.value }))
          }
        >
          <option value="">Select vehicle type</option>
          {VEHICLES.map((vehicle) => (
            <option key={vehicle} value={vehicle}>
              {vehicle}
            </option>
          ))}
        </select>
      </div>

      <div className="rd-row">
        <div className="rd-wrap">
          <div className="rd-label">Plate Number *</div>
          <input
            className="rd-input"
            placeholder="e.g. ABC-123XY"
            value={data.plateNumber}
            onChange={(e) =>
              setData((p) => ({
                ...p,
                plateNumber: e.target.value.toUpperCase(),
              }))
            }
          />
        </div>

        <div className="rd-wrap">
          <div className="rd-label">Vehicle Color</div>
          <input
            className="rd-input"
            placeholder="e.g. Red"
            value={data.vehicleColor}
            onChange={(e) =>
              setData((p) => ({ ...p, vehicleColor: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="rd-wrap">
        <div className="rd-label">Vehicle Model / Brand</div>
        <input
          className="rd-input"
          placeholder="e.g. Honda CB125"
          value={data.vehicleModel}
          onChange={(e) =>
            setData((p) => ({ ...p, vehicleModel: e.target.value }))
          }
        />
      </div>

      <div className="rd-info-box">
        🛵 You'll need to present your vehicle documents at verification. Keep
        them handy.
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="rd-btn-ghost" onClick={onBack} style={{ flex: 1 }}>
          ← Back
        </button>
        <button
          className="rd-btn-primary"
          onClick={onNext}
          disabled={!valid}
          style={{ flex: 2 }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Guarantor Info ──────────────────────────────────────────────────
function RiderStep3({ data, setData, onNext, onBack }) {
  const valid =
    data.guarantorName &&
    data.guarantorPhone &&
    data.guarantorRelationship;

  const relationships = [
    "Parent",
    "Sibling",
    "Uncle/Aunt",
    "Employer",
    "Friend",
    "Other",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div className="rd-section-title">Guarantor Info</div>
        <div className="rd-section-sub">
          We need a guarantor who can vouch for you. This is required for trust
          and safety.
        </div>
      </div>

      <div className="rd-info-box">
        🔒 Your guarantor will be contacted for verification. They must be
        reachable.
      </div>

      <div className="rd-wrap">
        <div className="rd-label">Guarantor Full Name *</div>
        <input
          className="rd-input"
          placeholder="e.g. Chukwu Emeka"
          value={data.guarantorName}
          onChange={(e) =>
            setData((p) => ({ ...p, guarantorName: e.target.value }))
          }
        />
      </div>

      <div className="rd-row">
        <div className="rd-wrap">
          <div className="rd-label">Phone Number *</div>
          <input
            className="rd-input"
            placeholder="08012345678"
            value={data.guarantorPhone}
            onChange={(e) =>
              setData((p) => ({ ...p, guarantorPhone: e.target.value }))
            }
          />
        </div>

        <div className="rd-wrap">
          <div className="rd-label">Relationship *</div>
          <select
            className="rd-select"
            value={data.guarantorRelationship}
            onChange={(e) =>
              setData((p) => ({
                ...p,
                guarantorRelationship: e.target.value,
              }))
            }
          >
            <option value="">Select</option>
            {relationships.map((relationship) => (
              <option key={relationship} value={relationship}>
                {relationship}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rd-wrap">
        <div className="rd-label">Guarantor Address</div>
        <input
          className="rd-input"
          placeholder="Guarantor's home address"
          value={data.guarantorAddress}
          onChange={(e) =>
            setData((p) => ({ ...p, guarantorAddress: e.target.value }))
          }
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="rd-btn-ghost" onClick={onBack} style={{ flex: 1 }}>
          ← Back
        </button>
        <button
          className="rd-btn-primary"
          onClick={onNext}
          disabled={!valid}
          style={{ flex: 2 }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Bank Details ────────────────────────────────────────────────────
function RiderStep4({ data, setData, onSubmit, onBack, loading }) {
  const valid = data.bankName && data.accountNumber && data.accountName;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div className="rd-section-title">Bank Details</div>
        <div className="rd-section-sub">
          Your delivery earnings (₦{RIDER_FEE} per order) will be paid here.
        </div>
      </div>

      <div className="rd-info-box">
        🔒 Bank details are encrypted. PADI only uses this for paying your
        earnings.
      </div>

      <div className="rd-wrap">
        <div className="rd-label">Bank Name *</div>
        <select
          className="rd-select"
          value={data.bankName}
          onChange={(e) => setData((p) => ({ ...p, bankName: e.target.value }))}
        >
          <option value="">Select your bank</option>
          {BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
      </div>

      <div className="rd-wrap">
        <div className="rd-label">Account Number *</div>
        <input
          className="rd-input"
          placeholder="10-digit account number"
          maxLength={10}
          value={data.accountNumber}
          onChange={(e) =>
            setData((p) => ({
              ...p,
              accountNumber: e.target.value.replace(/\D/g, ""),
            }))
          }
        />
      </div>

      <div className="rd-wrap">
        <div className="rd-label">Account Name *</div>
        <input
          className="rd-input"
          placeholder="Name on account"
          value={data.accountName}
          onChange={(e) =>
            setData((p) => ({ ...p, accountName: e.target.value }))
          }
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button className="rd-btn-ghost" onClick={onBack} style={{ flex: 1 }}>
          ← Back
        </button>
        <button
          className="rd-btn-primary"
          onClick={onSubmit}
          disabled={!valid || loading}
          style={{ flex: 2 }}
        >
          {loading ? "Submitting..." : "Submit Application 🚀"}
        </button>
      </div>
    </div>
  );
}

// ─── Rider Registration ──────────────────────────────────────────────────────
export function RiderRegisterForm({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [data, setData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    address: "",
    dob: "",
    vehicleType: "",
    plateNumber: "",
    vehicleColor: "",
    vehicleModel: "",
    guarantorName: "",
    guarantorPhone: "",
    guarantorRelationship: "",
    guarantorAddress: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(result.user, { displayName: data.name });

      await setDoc(doc(db, "riders", result.user.uid), {
        uid: result.user.uid,
        email,
        ...data,
        status: "pending",
        role: "rider",
        isOnline: false,
        totalDeliveries: 0,
        totalEarnings: 0,
        rating: 0,
        createdAt: serverTimestamp(),
      });

      onSuccess({ name: data.name });
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rd-reg-screen">
      <style>{RD_CSS}</style>

      <div className="rd-reg-hero">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: "linear-gradient(135deg,var(--rider),var(--rider2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: "#fff",
              fontSize: 16,
            }}
          >
            P
          </div>
          <span
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            PADI Rider
          </span>
        </div>

        <div
          style={{
            fontFamily: "var(--font-head)",
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1.15,
          }}
        >
          Earn delivering
          <br />
          on campus 🛵
        </div>

        <p
          style={{
            color: "var(--muted)",
            marginTop: 8,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          ₦{RIDER_FEE} per delivery. Be your own boss. Join the PADI rider
          network.
        </p>
      </div>

      <div className="rd-form">
        <RiderStepBar step={step} />

        {error && (
          <div
            style={{
              background: "rgba(255,68,68,.1)",
              border: "1px solid rgba(255,68,68,.2)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              color: "var(--red)",
            }}
          >
            {error}
          </div>
        )}

        {step === 0 && (
          <RiderStep1
            data={data}
            setData={setData}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onNext={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <RiderStep2
            data={data}
            setData={setData}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <RiderStep3
            data={data}
            setData={setData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <RiderStep4
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

// ─── Available Orders Page ───────────────────────────────────────────────────
function AvailableOrdersPage({ rider, showToast, isOnline }) {
  const [orders, setOrders] = useState([]);
  const isFirst = useRef(true);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "ready"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const newOrders = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      if (!isFirst.current && newOrders.length > orders.length) {
        showToast("📦 New delivery available!", "var(--rider)");
      }

      isFirst.current = false;
      setOrders(newOrders);
    });

    return unsub;
  }, [orders.length, showToast]);

  const acceptDelivery = async (order) => {
    await updateDoc(doc(db, "orders", order.id), {
      status: "picked_up",
      riderId: rider.uid,
      riderName: rider.name,
      riderPhone: rider.phone,
      riderVehicle: `${rider.vehicleType} · ${rider.plateNumber}`,
      updatedAt: serverTimestamp(),
    });

    showToast("Delivery accepted! Go pick it up 🛵");
  };

  if (!isOnline) {
    return (
      <div className="rd-empty">
        <div className="rd-empty-icon">😴</div>
        <div className="rd-empty-title">You're offline</div>
        <div className="rd-empty-sub">
          Go online to see available deliveries
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rd-empty">
        <div className="rd-empty-icon">📭</div>
        <div className="rd-empty-title">No deliveries available</div>
        <div className="rd-empty-sub">
          New orders will appear here instantly when vendors mark them ready
        </div>
      </div>
    );
  }

  return (
    <div className="rd-orders-grid">
      {orders.map((order) => (
        <div key={order.id} className="rd-order-card available">
          <div className="rd-order-header">
            <div>
              <div className="rd-order-id">
                #{order.id.slice(-6).toUpperCase()}
              </div>
              <div
                style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}
              >
                {order.createdAt?.toDate?.()?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }) || "Just now"}
              </div>
            </div>
            <span className="rd-badge rd-badge-available">Available</span>
          </div>

          <div className="rd-order-body">
            <div className="rd-route">
              <div className="rd-route-dots">
                <div className="rd-dot-pickup" />
                <div className="rd-dot-line" />
                <div className="rd-dot-deliver" />
              </div>

              <div className="rd-route-info">
                <div className="rd-route-point">
                  <div className="rd-route-label">Pickup from</div>
                  <div style={{ fontWeight: 600 }}>{order.vendorName}</div>
                </div>

                <div className="rd-route-point">
                  <div className="rd-route-label">Deliver to</div>
                  <div style={{ fontWeight: 600 }}>
                    {order.deliveryAddress || "Campus Hostel"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    👤 {order.studentName}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                fontSize: 12,
                color: "var(--muted)",
                paddingTop: 4,
              }}
            >
              <span>📦 {(order.items || []).length} item(s)</span>
              <span>💳 {order.paymentMethod || "Wallet"}</span>
            </div>
          </div>

          <div className="rd-order-footer">
            <div>
              <div className="rd-earning">₦{RIDER_FEE}</div>
              <div className="rd-earning-label">Your earning</div>
            </div>

            <button
              className="rd-btn-accept"
              onClick={() => acceptDelivery(order)}
            >
              Accept Delivery 🛵
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── My Deliveries Page ──────────────────────────────────────────────────────
function MyDeliveriesPage({ riderId, showToast }) {
  const [deliveries, setDeliveries] = useState([]);
  const [filter, setFilter] = useState("picked_up");

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("riderId", "==", riderId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setDeliveries(
        snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );
    });

    return unsub;
  }, [riderId]);

  const markDelivered = async (orderId) => {
    await updateDoc(doc(db, "orders", orderId), {
      status: "delivered",
      deliveredAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    showToast("🎉 Delivery completed! ₦300 earned!");
  };

  const filtered = deliveries.filter((delivery) =>
    filter === "all" ? true : delivery.status === filter
  );

  const getBadgeClass = (status) => {
    const map = {
      picked_up: "rd-badge-picked_up",
      delivered: "rd-badge-delivered",
    };

    return map[status] || "rd-badge-available";
  };

  const activeCount = deliveries.filter((d) => d.status === "picked_up").length;

  return (
    <div>
      <div className="rd-filter-tabs">
        {["picked_up", "delivered", "all"].map((f) => (
          <div
            key={f}
            className={`rd-filter-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "picked_up"
              ? "Active"
              : f.charAt(0).toUpperCase() + f.slice(1)}

            {f === "picked_up" && activeCount > 0 && (
              <span
                style={{
                  marginLeft: 5,
                  background: "var(--rider)",
                  color: "#fff",
                  borderRadius: 100,
                  padding: "0 5px",
                  fontSize: 10,
                }}
              >
                {activeCount}
              </span>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rd-empty">
          <div className="rd-empty-icon">🛵</div>
          <div className="rd-empty-title">
            No {filter === "picked_up" ? "active" : filter} deliveries
          </div>
          <div className="rd-empty-sub">
            Accept a delivery from the Available tab
          </div>
        </div>
      ) : (
        <div className="rd-orders-grid">
          {filtered.map((order) => (
            <div key={order.id} className="rd-order-card">
              <div className="rd-order-header">
                <div>
                  <div className="rd-order-id">
                    #{order.id.slice(-6).toUpperCase()}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}
                  >
                    {order.createdAt?.toDate?.()?.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) || ""}
                  </div>
                </div>

                <span className={`rd-badge ${getBadgeClass(order.status)}`}>
                  {order.status.replace("_", " ")}
                </span>
              </div>

              <div className="rd-order-body">
                <div className="rd-route">
                  <div className="rd-route-dots">
                    <div className="rd-dot-pickup" />
                    <div className="rd-dot-line" />
                    <div className="rd-dot-deliver" />
                  </div>

                  <div className="rd-route-info">
                    <div className="rd-route-point">
                      <div className="rd-route-label">Pickup</div>
                      <div style={{ fontWeight: 600 }}>{order.vendorName}</div>
                    </div>

                    <div className="rd-route-point">
                      <div className="rd-route-label">Deliver to</div>
                      <div style={{ fontWeight: 600 }}>
                        {order.deliveryAddress || "Campus Hostel"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        📞 {order.studentName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rd-order-footer">
                <div>
                  <div className="rd-earning">₦{RIDER_FEE}</div>
                  <div className="rd-earning-label">
                    {order.status === "delivered" ? "Earned" : "Pending"}
                  </div>
                </div>

                {order.status === "picked_up" && (
                  <button
                    className="rd-btn-action"
                    onClick={() => markDelivered(order.id)}
                  >
                    Mark Delivered ✓
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Earnings Page ───────────────────────────────────────────────────────────
function EarningsPage({ riderId }) {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("riderId", "==", riderId),
      where("status", "==", "delivered"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setDeliveries(
        snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );
    });

    return unsub;
  }, [riderId]);

  const today = new Date();

  const todayDeliveries = deliveries.filter((delivery) => {
    const date =
      delivery.deliveredAt?.toDate?.() || delivery.createdAt?.toDate?.();
    return date && date.toDateString() === today.toDateString();
  });

  const weekDeliveries = deliveries.filter((delivery) => {
    const date =
      delivery.deliveredAt?.toDate?.() || delivery.createdAt?.toDate?.();
    if (!date) return false;

    const diff = (today - date) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  return (
    <div>
      <div className="rd-earnings-card">
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,.5)",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Total Earnings
        </div>

        <div className="rd-earnings-amount">
          ₦{(deliveries.length * RIDER_FEE).toLocaleString()}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,.4)",
            marginTop: 4,
          }}
        >
          {deliveries.length} deliveries completed
        </div>
      </div>

      <div className="rd-earnings-stats-grid">
        {[
          {
            label: "Today",
            val: todayDeliveries.length,
            earn: todayDeliveries.length * RIDER_FEE,
          },
          {
            label: "This Week",
            val: weekDeliveries.length,
            earn: weekDeliveries.length * RIDER_FEE,
          },
          {
            label: "All Time",
            val: deliveries.length,
            earn: deliveries.length * RIDER_FEE,
          },
        ].map((stat) => (
          <div key={stat.label} className="rd-stat">
            <div className="rd-stat-label">{stat.label}</div>
            <div
              className="rd-stat-val"
              style={{ color: "var(--rider)", fontSize: 22 }}
            >
              {stat.val}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--green)",
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              ₦{stat.earn.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            fontFamily: "var(--font-head)",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          Delivery History
        </div>

        {deliveries.length === 0 ? (
          <div className="rd-empty" style={{ padding: "32px 20px" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💸</div>
            <div className="rd-empty-title">No earnings yet</div>
            <div className="rd-empty-sub">
              Complete deliveries to see your earnings here
            </div>
          </div>
        ) : (
          deliveries.slice(0, 20).map((delivery) => (
            <div
              key={delivery.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                padding: "12px 20px",
                borderBottom: "1px solid var(--border)",
                fontSize: 13,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  #{delivery.id.slice(-6).toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    marginTop: 2,
                  }}
                >
                  {delivery.vendorName} → {delivery.deliveryAddress || "Campus"}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "var(--green)" }}>
                  +₦{RIDER_FEE}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {delivery.deliveredAt?.toDate?.()?.toLocaleDateString() || ""}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Rider Login ─────────────────────────────────────────────────────────────
function RiderLogin({ onLogin, onRegister }) {
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
      const riderDoc = await getDoc(doc(db, "riders", result.user.uid));

      if (!riderDoc.exists()) {
        await signOut(auth);
        setError("No rider account found. Please register first.");
        setLoading(false);
        return;
      }

      onLogin({ uid: result.user.uid, ...riderDoc.data() });
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rd-login">
      <style>{RD_CSS}</style>

      <div className="rd-login-card">
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
              background: "linear-gradient(135deg,var(--rider),var(--rider2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              PADI Rider
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Rider Portal
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
          Welcome back 🛵
        </div>

        <div
          style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}
        >
          Sign in to see available deliveries.
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
            className="rd-input"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="rd-input"
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <button
          className="rd-btn-primary"
          onClick={handleLogin}
          disabled={loading}
          style={{ marginBottom: 12 }}
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <button
          className="rd-btn-ghost"
          onClick={onRegister}
          style={{ width: "100%" }}
        >
          Register as a Rider
        </button>
      </div>
    </div>
  );
}

// ─── Main Rider Dashboard ────────────────────────────────────────────────────
export default function RiderDashboard() {
  const [rider, setRider] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [registered, setRegistered] = useState(null);
  const [page, setPage] = useState("available");
  const [isOnline, setIsOnline] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (msg, color = "var(--green)") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (rider?.uid) {
      requestNotificationPermission(rider.uid, "rider");
      const unsub = listenForMessages((notif) => showToast(notif.title));
      return unsub;
    }
  }, [rider?.uid]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const riderDoc = await getDoc(doc(db, "riders", user.uid));
        if (riderDoc.exists()) {
          const riderData = { uid: user.uid, ...riderDoc.data() };
          setRider(riderData);
          setIsOnline(Boolean(riderData.isOnline));
        }
      } else {
        setRider(null);
        setIsOnline(false);
      }
    });

    return unsub;
  }, []);

  const toggleOnline = async () => {
    const next = !isOnline;
    setIsOnline(next);

    if (rider?.uid) {
      await updateDoc(doc(db, "riders", rider.uid), { isOnline: next });
    }

    showToast(
      next ? "You're now online! 🟢" : "You're now offline 🔴",
      next ? "var(--green)" : "var(--muted)"
    );
  };

  const handleLogout = async () => {
    await signOut(auth);
    setRider(null);
    setIsOnline(false);
  };

  const NAV = [
    { key: "available", icon: "📦", label: "Available" },
    { key: "deliveries", icon: "🛵", label: "My Deliveries" },
    { key: "earnings", icon: "💸", label: "Earnings" },
  ];

  const PAGE_TITLES = {
    available: {
      title: "Available Deliveries",
      sub: isOnline ? "Showing live orders near you" : "Go online to see orders",
    },
    deliveries: {
      title: "My Deliveries",
      sub: "Track your active and past deliveries",
    },
    earnings: {
      title: "Earnings",
      sub: "Your delivery earnings overview",
    },
  };

  if (registered) {
    return (
      <div className="rd-status-screen">
        <style>{RD_CSS}</style>

        <div className="rd-status-card">
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            Application Submitted!
          </div>

          <div
            style={{
              fontSize: 14,
              color: "var(--muted)",
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            <strong>{registered.name}</strong>, your rider application is under
            review. You'll be notified within 24–48 hours once approved!
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
            className="rd-btn-ghost"
            onClick={() => {
              setRegistered(null);
              setShowRegister(false);
            }}
            style={{ width: "100%" }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (showRegister) {
    return (
      <RiderRegisterForm
        onSuccess={(info) => {
          setRegistered(info);
          setShowRegister(false);
        }}
      />
    );
  }

  if (!rider) {
    return (
      <RiderLogin
        onLogin={setRider}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  if (rider.status === "pending") {
    return (
      <div className="rd-status-screen">
        <style>{RD_CSS}</style>

        <div className="rd-status-card">
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
            Your application is being reviewed. Hang tight, {rider.name}!
          </div>

          <button
            className="rd-btn-ghost"
            onClick={handleLogout}
            style={{ width: "100%" }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (rider.status === "suspended") {
    return (
      <div className="rd-status-screen">
        <style>{RD_CSS}</style>

        <div className="rd-status-card">
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
            style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}
          >
            Contact PADI support to resolve this.
          </div>

          <button
            className="rd-btn-ghost"
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
    <div className="rd-root">
      <style>{RD_CSS}</style>

      <button
        className="rd-menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>

      <div
        className={`rd-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`rd-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="rd-sidebar-top">
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
                  background: "linear-gradient(135deg,var(--rider),var(--rider2))",
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
                style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}
              >
                PADI Rider
              </div>
            </div>

            <button
              className="rd-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="rd-rider-name">{rider.name}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            {rider.vehicleType} · {rider.plateNumber}
          </div>

          <div
            className={`rd-online-toggle ${isOnline ? "online" : ""}`}
            onClick={toggleOnline}
          >
            <div
              className="rd-online-label"
              style={{ color: isOnline ? "var(--green)" : "var(--muted)" }}
            >
              {isOnline ? "🟢 Online" : "🔴 Offline"}
            </div>

            <div className={`rd-switch ${isOnline ? "on" : "off"}`} />
          </div>
        </div>

        <div className="rd-nav">
          {NAV.map((item) => (
            <div
              key={item.key}
              className={`rd-nav-item ${page === item.key ? "active" : ""}`}
              onClick={() => {
                setPage(item.key);
                setSidebarOpen(false);
              }}
            >
              <span className="rd-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="rd-nav-badge">{item.badge}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: "0 0 16px" }}>
          <div
            className="rd-nav-item"
            onClick={handleLogout}
            style={{ color: "var(--red)" }}
          >
            <span className="rd-nav-icon">🚪</span>
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      <div className="rd-main">
        <div className="rd-topbar">
          <div>
            <div className="rd-page-title">{PAGE_TITLES[page].title}</div>
            <div className="rd-page-sub">{PAGE_TITLES[page].sub}</div>
          </div>

          {!isOnline && page === "available" && (
            <button className="rd-btn-accept" onClick={toggleOnline}>
              Go Online 🟢
            </button>
          )}
        </div>

        <div className="rd-content">
          {page === "available" && (
            <AvailableOrdersPage
              rider={rider}
              showToast={showToast}
              isOnline={isOnline}
            />
          )}

          {page === "deliveries" && (
            <MyDeliveriesPage riderId={rider.uid} showToast={showToast} />
          )}

          {page === "earnings" && <EarningsPage riderId={rider.uid} />}
        </div>
      </div>

      {toast && (
        <div className="rd-toast" style={{ borderColor: toast.color }}>
          <span style={{ color: toast.color }}>●</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}