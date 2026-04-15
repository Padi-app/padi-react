import { useState, useEffect } from "react";
import { useAuth } from "./lib/AuthContext";
import { requestNotificationPermission, listenForMessages } from "./notifications";
import { ChatScreen, PadiBotFloat, PadiBotOverlay } from "./PadiChat";
import { AuthScreenWithRider } from "./AuthWithRider";
import { useVendors, useMenuItems, placeRealOrder } from "./useRealData";
import { CheckoutPaymentModal, RealWalletScreen } from "./PaystackPayment";
import { VideoCatalogueScreen } from "./VideoCatalogue";

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } :root { --brand: #FF5A1F; --brand2: #FF8C42; --green: #00C07F; --bg: #0E0E10; --surface: #18181C; --surface2: #222228; --border: #2E2E36; --text: #F4F4F5; --muted: #71717A; --pill: rgba(255,90,31,.12); --font-head: 'Syne', sans-serif; --font-body: 'DM Sans', sans-serif; --nav-h: 64px; } html, body { height: 100%; background: var(--bg); } .app { width: 100%; max-width: 430px; height: 100dvh; margin: 0 auto; background: var(--bg); display: flex; flex-direction: column; font-family: var(--font-body); color: var(--text); overflow: hidden; position: relative; } .screen { flex: 1; overflow-y: auto; overflow-x: hidden; padding-bottom: calc(var(--nav-h) + 16px); scroll-behavior: smooth; } .screen::-webkit-scrollbar { display: none; } .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; height: var(--nav-h); background: rgba(14,14,16,.95); backdrop-filter: blur(20px); border-top: 1px solid var(--border); display: flex; align-items: flex-start; justify-content: space-around; padding-top: 10px; z-index: 100; } .nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; flex: 1; padding: 4px 0; transition: all .2s; } .nav-icon { font-size: 22px; transition: transform .2s; } .nav-label { font-size: 10px; font-weight: 500; color: var(--muted); transition: color .2s; } .nav-item.active .nav-label { color: var(--brand); } .nav-item.active .nav-icon { transform: translateY(-2px); } .h1 { font-family: var(--font-head); font-size: 28px; font-weight: 800; line-height: 1.15; } .h2 { font-family: var(--font-head); font-size: 22px; font-weight: 700; } .h3 { font-family: var(--font-head); font-size: 17px; font-weight: 700; } .label { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); } .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 14px; font-family: var(--font-body); font-weight: 600; cursor: pointer; border: none; transition: all .18s; white-space: nowrap; } .btn-primary { background: linear-gradient(135deg, var(--brand), var(--brand2)); color: #fff; padding: 15px 28px; font-size: 15px; width: 100%; box-shadow: 0 8px 24px rgba(255,90,31,.3); } .btn-primary:active { transform: scale(.97); } .btn-primary:disabled { opacity: .6; } .btn-ghost { background: var(--surface2); color: var(--text); padding: 12px 20px; font-size: 14px; border: 1px solid var(--border); } .btn-icon { background: var(--surface2); border-radius: 12px; padding: 10px; font-size: 18px; cursor: pointer; border: 1px solid var(--border); transition: all .15s; display: flex; align-items: center; justify-content: center; } .input-wrap { display: flex; flex-direction: column; gap: 6px; } .input-label { font-size: 12px; font-weight: 600; color: var(--muted); letter-spacing: .5px; } .input { background: var(--surface2); border: 1.5px solid var(--border); border-radius: 13px; padding: 14px 16px; color: var(--text); font-family: var(--font-body); font-size: 15px; outline: none; width: 100%; transition: border-color .15s; } .input:focus { border-color: var(--brand); } .input::placeholder { color: var(--muted); } .chip { display: inline-flex; align-items: center; gap: 5px; background: var(--surface2); border: 1px solid var(--border); border-radius: 100px; padding: 6px 13px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; white-space: nowrap; } .chip.active { background: var(--pill); border-color: var(--brand); color: var(--brand); } .badge { background: var(--brand); color: #fff; border-radius: 100px; padding: 2px 7px; font-size: 11px; font-weight: 700; } .avatar { border-radius: 50%; background: linear-gradient(135deg, var(--brand), var(--brand2)); display: flex; align-items: center; justify-content: center; font-family: var(--font-head); font-weight: 700; color: #fff; flex-shrink: 0; } .splash { width: 100%; height: 100dvh; background: var(--bg); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; } .splash-logo { width: 80px; height: 80px; border-radius: 24px; background: linear-gradient(135deg, var(--brand), var(--brand2)); display: flex; align-items: center; justify-content: center; font-family: var(--font-head); font-size: 36px; font-weight: 800; color: #fff; box-shadow: 0 20px 60px rgba(255,90,31,.4); animation: pop .6s cubic-bezier(.34,1.56,.64,1) forwards; } @keyframes pop { from { transform: scale(.4); opacity: 0 } to { transform: scale(1); opacity: 1 } } .splash-name { font-family: var(--font-head); font-size: 38px; font-weight: 800; background: linear-gradient(135deg, var(--brand), var(--brand2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: fadein .5s .3s both; } @keyframes fadein { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } } .splash-pulse { width: 40px; height: 4px; border-radius: 2px; background: var(--border); margin-top: 24px; overflow: hidden; } .splash-pulse::after { content: ''; display: block; height: 100%; width: 40%; background: var(--brand); border-radius: 2px; animation: slide 1.2s ease-in-out infinite; } @keyframes slide { 0% { transform: translateX(-100%) } 100% { transform: translateX(350%) } } .auth-hero { background: linear-gradient(160deg, #1a0a00 0%, var(--bg) 100%); padding: 60px 24px 40px; position: relative; overflow: hidden; } .auth-hero::before { content: ''; position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(255,90,31,.25) 0%, transparent 70%); } .auth-form { padding: 28px 24px 40px; flex: 1; display: flex; flex-direction: column; gap: 18px; } .auth-toggle { display: flex; background: var(--surface2); border-radius: 12px; padding: 4px; } .auth-tab { flex: 1; padding: 10px; border-radius: 9px; text-align: center; font-weight: 600; font-size: 14px; cursor: pointer; transition: all .2s; color: var(--muted); } .auth-tab.active { background: var(--surface); color: var(--text); } .social-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; border-radius: 13px; background: var(--surface2); border: 1px solid var(--border); cursor: pointer; font-weight: 500; font-size: 14px; transition: all .15s; } .or-row { display: flex; align-items: center; gap: 12px; } .or-line { flex: 1; height: 1px; background: var(--border); } .error-box { background: rgba(255,68,68,.1); border: 1px solid rgba(255,68,68,.3); border-radius: 12px; padding: 12px 16px; font-size: 13px; color: #FF6B6B; } .home-header { padding: 20px 20px 16px; background: linear-gradient(180deg, rgba(255,90,31,.06) 0%, transparent 100%); } .search-bar { margin: 0 20px 16px; display: flex; align-items: center; gap: 10px; background: var(--surface2); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 16px; cursor: pointer; } .search-bar span { color: var(--muted); font-size: 14px; } .hero-banner { margin: 0 20px 20px; border-radius: 20px; overflow: hidden; background: linear-gradient(135deg, #FF3D00, #FF8C42); padding: 22px 20px; position: relative; } .hero-banner h3 { font-family: var(--font-head); font-size: 20px; font-weight: 800; color: #fff; } .hero-banner p { color: rgba(255,255,255,.8); font-size: 13px; margin: 4px 0 14px; } .hero-cta { display: inline-flex; background: rgba(255,255,255,.2); color: #fff; border-radius: 100px; padding: 8px 18px; font-size: 13px; font-weight: 600; cursor: pointer; } .section-header { display: flex; align-items: center; justify-content: space-between; padding: 0 20px; margin-bottom: 12px; } .see-all { color: var(--brand); font-size: 13px; font-weight: 600; cursor: pointer; } .category-row { display: flex; gap: 10px; padding: 0 20px; overflow-x: auto; padding-bottom: 4px; } .category-row::-webkit-scrollbar { display: none; } .cat-item { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; min-width: 68px; } .cat-icon { width: 58px; height: 58px; border-radius: 18px; background: var(--surface2); border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 26px; transition: all .15s; } .cat-label { font-size: 11px; font-weight: 600; color: var(--muted); text-align: center; } .vendor-row { display: flex; gap: 14px; padding: 0 20px; overflow-x: auto; } .vendor-row::-webkit-scrollbar { display: none; } .vendor-card { min-width: 200px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; cursor: pointer; transition: transform .15s; flex-shrink: 0; } .vendor-card:active { transform: scale(.97); } .vendor-img { height: 110px; display: flex; align-items: center; justify-content: center; font-size: 48px; } .vendor-info { padding: 10px 12px 12px; } .vendor-name { font-family: var(--font-head); font-size: 15px; font-weight: 700; } .vendor-meta { display: flex; gap: 8px; margin-top: 4px; align-items: center; } .vendor-tag { font-size: 11px; color: var(--muted); } .section { margin-bottom: 28px; } .listing-header { display: flex; align-items: center; gap: 14px; padding: 16px 20px; position: sticky; top: 0; background: rgba(14,14,16,.9); backdrop-filter: blur(12px); z-index: 10; } .filter-row { padding: 0 20px 16px; display: flex; gap: 8px; overflow-x: auto; } .filter-row::-webkit-scrollbar { display: none; } .food-grid { display: flex; flex-direction: column; gap: 12px; padding: 0 20px; } .food-item { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; display: flex; cursor: pointer; transition: transform .15s; } .food-item:active { transform: scale(.98); } .food-thumb { width: 90px; height: 90px; display: flex; align-items: center; justify-content: center; font-size: 38px; flex-shrink: 0; background: var(--surface2); } .food-details { padding: 12px 14px; flex: 1; } .food-name { font-family: var(--font-head); font-size: 15px; font-weight: 700; } .food-desc { font-size: 12px; color: var(--muted); margin: 3px 0 8px; line-height: 1.4; } .food-footer { display: flex; align-items: center; justify-content: space-between; } .food-price { font-weight: 700; color: var(--brand); font-size: 15px; } .add-btn { width: 30px; height: 30px; border-radius: 9px; background: linear-gradient(135deg, var(--brand), var(--brand2)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; cursor: pointer; flex-shrink: 0; border: none; transition: transform .15s; } .add-btn:active { transform: scale(.88); } .cart-item { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border); align-items: center; } .cart-info { flex: 1; } .cart-name { font-weight: 600; font-size: 15px; } .cart-vendor { font-size: 12px; color: var(--muted); margin-top: 2px; } .qty-ctrl { display: flex; align-items: center; gap: 10px; margin-top: 8px; } .qty-btn { width: 28px; height: 28px; border-radius: 8px; background: var(--surface2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; font-weight: 700; transition: all .15s; } .qty-btn:active { transform: scale(.88); } .qty-val { font-weight: 700; font-size: 15px; min-width: 20px; text-align: center; } .cart-price { font-weight: 700; font-size: 15px; color: var(--brand); } .summary-row { display: flex; justify-content: space-between; padding: 10px 0; } .summary-row.total { border-top: 1px solid var(--border); margin-top: 4px; padding-top: 14px; } .track-map-mock { height: 220px; background: var(--surface2); margin: 16px; border-radius: 18px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; position: relative; overflow: hidden; } .track-map-mock::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,.02) 20px, rgba(255,255,255,.02) 40px); } .rider-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--brand); box-shadow: 0 0 0 4px rgba(255,90,31,.2), 0 0 0 8px rgba(255,90,31,.1); animation: pulse 1.5s ease-in-out infinite; } @keyframes pulse { 0%,100% { box-shadow: 0 0 0 4px rgba(255,90,31,.2), 0 0 0 8px rgba(255,90,31,.1) } 50% { box-shadow: 0 0 0 8px rgba(255,90,31,.2), 0 0 0 16px rgba(255,90,31,.05) } } .track-step { display: flex; gap: 14px; padding: 12px 0; align-items: flex-start; } .step-dot-col { display: flex; flex-direction: column; align-items: center; width: 20px; } .step-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; } .step-line { width: 2px; flex: 1; min-height: 24px; margin-top: 4px; } .step-done { background: var(--green); } .step-active { background: var(--brand); box-shadow: 0 0 0 4px var(--pill); } .step-pending { background: var(--border); } .step-line-done { background: var(--green); } .step-line-pending { background: var(--border); } .step-title { font-weight: 600; font-size: 14px; } .step-sub { font-size: 12px; color: var(--muted); margin-top: 2px; } .profile-hero { padding: 32px 20px 24px; text-align: center; background: linear-gradient(180deg, rgba(255,90,31,.06) 0%, transparent 100%); } .profile-avatar { width: 80px; height: 80px; border-radius: 24px; margin: 0 auto 12px; background: linear-gradient(135deg, var(--brand), var(--brand2)); display: flex; align-items: center; justify-content: center; font-family: var(--font-head); font-size: 32px; font-weight: 800; color: #fff; box-shadow: 0 12px 32px rgba(255,90,31,.3); } .profile-stats { display: flex; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; margin: 0 20px 20px; overflow: hidden; } .stat-item { flex: 1; padding: 16px 12px; text-align: center; } .stat-item + .stat-item { border-left: 1px solid var(--border); } .stat-val { font-family: var(--font-head); font-size: 22px; font-weight: 800; color: var(--brand); } .stat-label { font-size: 11px; color: var(--muted); margin-top: 2px; font-weight: 500; } .menu-section { padding: 0 20px; } .menu-item { display: flex; align-items: center; gap: 14px; padding: 15px 0; border-bottom: 1px solid var(--border); cursor: pointer; transition: all .15s; } .menu-item:last-child { border-bottom: none; } .menu-item:active { opacity: .7; } .menu-label { flex: 1; font-weight: 500; font-size: 15px; } .menu-arrow { color: var(--muted); font-size: 16px; } .toast { position: fixed; bottom: calc(var(--nav-h) + 16px); left: 50%; transform: translateX(-50%); background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 12px 20px; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; z-index: 200; box-shadow: 0 8px 32px rgba(0,0,0,.4); animation: toastIn .3s cubic-bezier(.34,1.56,.64,1) forwards; white-space: nowrap; } @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(20px) } to { opacity: 1; transform: translateX(-50%) translateY(0) } } .empty { text-align: center; padding: 60px 20px; } .empty-icon { font-size: 56px; margin-bottom: 12px; } .empty-text { font-size: 16px; font-weight: 600; } .empty-sub { font-size: 14px; color: var(--muted); margin-top: 6px; } .tx-item { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border); align-items: center; } .tx-icon { width: 42px; height: 42px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; } .tx-debit { background: rgba(255,90,31,.12); } .tx-credit { background: rgba(0,192,127,.12); } .tx-info { flex: 1; } .tx-name { font-weight: 600; font-size: 14px; } .tx-date { font-size: 12px; color: var(--muted); margin-top: 2px; } .tx-amount { font-weight: 700; font-size: 15px; } .tx-amount.debit { color: var(--brand); } .tx-amount.credit { color: var(--green); }`;

// ─── Static Data ──────────────────────────────────────────────────────────────
const CATEGORIES = [
{ label: "Food", emoji: "🍔" },
{ label: "Groceries", emoji: "🛒" },
{ label: "Bike", emoji: "🏍️" },
{ label: "Delivery", emoji: "📦" },
{ label: "Pharmacy", emoji: "💊" },
{ label: "Laundry", emoji: "👕" },
];

const TRACK_STEPS = [
{ label: "Order Confirmed", sub: "Your order was placed successfully" },
{ label: "Preparing", sub: "Vendor is preparing your order" },
{ label: "Rider Assigned", sub: "A rider has picked up your order" },
{ label: "On the Way", sub: "About 5 minutes away" },
{ label: "Delivered", sub: "Enjoy your meal!" },
];

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg }) => (

  <div className="toast">
    <span style={{ color: "var(--green)" }}>✓</span> {msg}
  </div>
);

// ─── Splash ───────────────────────────────────────────────────────────────────
function SplashScreen() {
return (
<div className="splash">
<div className="splash-logo">P</div>
<div className="splash-name">PADI</div>
<div style={{ color: "var(–muted)", fontSize: 15 }}>Your campus super app</div>
<div className="splash-pulse" />
</div>
);
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({ onAddToCart, setTab }) {
const { vendors, loading } = useVendors();
const { profile } = useAuth();
const firstName = profile?.name?.split(" ")[0] || "there";

return (
<div className="screen">
<div className="home-header">
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
<div>
<div style={{ fontSize: 11, color: "var(–muted)", letterSpacing: .5 }}>Good afternoon</div>
<div className="h2" style={{ marginTop: 2 }}>{firstName}</div>
</div>
<div style={{ width: 40, height: 40, borderRadius: 12, background: "var(–surface2)", border: "1px solid var(–border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer", position: "relative" }}>
🔔
<div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "var(–brand)", border: "2px solid var(–bg)" }} />
</div>
</div>
</div>

```
  <div className="search-bar">
    <span>🔍</span>
    <span>Search food, groceries, services...</span>
  </div>

  <div className="hero-banner">
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,.7)", textTransform: "uppercase", marginBottom: 6 }}>Today's Special</div>
    <h3>50% off your<br />first delivery!</h3>
    <p>Use code <strong>PADI50</strong> at checkout</p>
    <div className="hero-cta" onClick={() => setTab("food")}>Order Now</div>
  </div>

  <div className="section">
    <div className="section-header"><div className="h3">Services</div></div>
    <div className="category-row">
      {CATEGORIES.map(c => (
        <div className="cat-item" key={c.label}>
          <div className="cat-icon">{c.emoji}</div>
          <div className="cat-label">{c.label}</div>
        </div>
      ))}
    </div>
  </div>

  <div className="section">
    <div className="section-header">
      <div className="h3">Vendors Near You</div>
      <div className="see-all" onClick={() => setTab("food")}>See all</div>
    </div>
    {loading ? (
      <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Loading vendors...</div>
    ) : vendors.length === 0 ? (
      <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>No vendors available yet</div>
    ) : (
      <div className="vendor-row">
        {vendors.map(v => (
          <div className="vendor-card" key={v.id} onClick={() => setTab("food")}>
            <div className="vendor-img" style={{ background: "#1a0800" }}>
              {v.emoji || "🍽️"}
            </div>
            <div className="vendor-info">
              <div className="vendor-name">{v.businessName || v.name}</div>
              <div className="vendor-meta">
                <span style={{ color: "#F59E0B", fontSize: 12 }}>★</span>
                <span className="vendor-tag">{v.rating || "New"}</span>
                <span className="vendor-tag">·</span>
                <span className="vendor-tag">{v.deliveryTime || "15-25 min"}</span>
              </div>
              <div style={{ marginTop: 6 }}>
                <span className="chip" style={{ padding: "4px 10px", fontSize: 11 }}>{v.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

);
}

// ─── Food Screen ──────────────────────────────────────────────────────────────
function FoodScreen({ onAddToCart }) {
const { items: foods, loading } = useMenuItems();
const [filter, setFilter] = useState("All");

const filtered = filter === "All"
? foods
: foods.filter(f => f.category?.toLowerCase().includes(filter.toLowerCase()));

return (
<div className="screen" style={{ paddingTop: 0 }}>
<div className="listing-header">
<div style={{ flex: 1 }}>
<div className="h3">Food & Groceries</div>
<div style={{ color: "var(–muted)", fontSize: 11, marginTop: 2 }}>
{loading ? "Loading..." : `${foods.length} items available`}
</div>
</div>
</div>

```
  <div className="filter-row">
    {["All", "Nigerian", "Grills", "Healthy", "Snacks", "Drinks"].map(f => (
      <div className={`chip ${filter === f ? "active" : ""}`} key={f} onClick={() => setFilter(f)}>{f}</div>
    ))}
  </div>

  {loading ? (
    <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Loading menu...</div>
  ) : filtered.length === 0 ? (
    <div className="empty">
      <div className="empty-icon">🍽️</div>
      <div className="empty-text">No items found</div>
      <div className="empty-sub">Try a different filter</div>
    </div>
  ) : (
    <div className="food-grid">
      {filtered.map(f => (
        <div className="food-item" key={f.id}>
          <div className="food-thumb">{f.emoji || "🍽️"}</div>
          <div className="food-details">
            <div className="food-name">{f.name}</div>
            <div className="food-desc">{f.desc || f.description}</div>
            <div className="food-footer">
              <div className="food-price">₦{Number(f.price).toLocaleString()}</div>
              <button className="add-btn" onClick={() => onAddToCart(f)}>+</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
  <div style={{ height: 16 }} />
</div>

);
}

// ─── Cart Screen ──────────────────────────────────────────────────────────────
function CartScreen({ cart, setCart, showToast, setTab, user }) {
const [showPayment, setShowPayment] = useState(false);
const [ordering, setOrdering] = useState(false);

const updateQty = (id, delta) =>
setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));

const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
const delivery = 300;
const promo = 150;
const total = subtotal + delivery - promo;

if (!cart.length) return (
<div className="screen">
<div className="listing-header"><div className="h3">Your Cart</div></div>
<div className="empty">
<div className="empty-icon">🛒</div>
<div className="empty-text">Your cart is empty</div>
<div className="empty-sub">Add items from the Food tab</div>
<button className="btn btn-primary" style={{ maxWidth: 200, margin: "20px auto 0" }} onClick={() => setTab("food")}>
Browse Food
</button>
</div>
</div>
);

return (
<div className="screen">
<div className="listing-header">
<div className="h3">Your Cart</div>
<div className="badge">{cart.reduce((a, i) => a + i.qty, 0)}</div>
</div>

```
  <div style={{ padding: "0 20px" }}>
    {cart.map(item => (
      <div className="cart-item" key={item.id}>
        <div style={{ fontSize: 32, flexShrink: 0 }}>{item.emoji || "🍽️"}</div>
        <div className="cart-info">
          <div className="cart-name">{item.name}</div>
          <div className="cart-vendor">{item.vendor || item.vendorName}</div>
          <div className="qty-ctrl">
            <div className="qty-btn" onClick={() => updateQty(item.id, -1)}>-</div>
            <div className="qty-val">{item.qty}</div>
            <div className="qty-btn" onClick={() => updateQty(item.id, +1)}>+</div>
          </div>
        </div>
        <div className="cart-price">₦{(item.price * item.qty).toLocaleString()}</div>
      </div>
    ))}

    <div style={{ marginTop: 20 }}>
      <div className="label" style={{ marginBottom: 14 }}>Order Summary</div>
      <div className="summary-row"><span style={{ color: "var(--muted)" }}>Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
      <div className="summary-row"><span style={{ color: "var(--muted)" }}>Delivery Fee</span><span>₦{delivery}</span></div>
      <div className="summary-row"><span style={{ color: "var(--muted)", fontSize: 13 }}>Promo (PADI50)</span><span style={{ color: "var(--green)" }}>-₦{promo}</span></div>
      <div className="summary-row total">
        <span style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800 }}>Total</span>
        <span style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800, color: "var(--brand)" }}>₦{total.toLocaleString()}</span>
      </div>
    </div>

    <div style={{ height: 16 }} />
    <button className="btn btn-primary" onClick={() => setShowPayment(true)} disabled={ordering}>
      {ordering ? "Placing Order..." : `Proceed to Payment  ₦${total.toLocaleString()}`}
    </button>
    <div style={{ height: 8 }} />
  </div>

  {showPayment && (
    <CheckoutPaymentModal
      user={user}
      cart={cart}
      total={total}
      onClose={() => setShowPayment(false)}
      onOrderPlaced={async ({ paymentMethod, reference }) => {
        setOrdering(true);
        try {
          await placeRealOrder({
            student: user,
            cart,
            paymentMethod,
            deliveryAddress: "Campus Hostel",
          });
          setShowPayment(false);
          showToast("Order placed successfully! 🎉");
          setTimeout(() => { setCart([]); setTab("home"); setOrdering(false); }, 1500);
        } catch (e) {
          showToast("Order failed. Try again.");
          setOrdering(false);
        }
      }}
    />
  )}
</div>

);
}

// ─── Tracking Screen ──────────────────────────────────────────────────────────
function TrackingScreen() {
const [step, setStep] = useState(3);
useEffect(() => {
if (step < 4) { const t = setTimeout(() => setStep(s => s + 1), 3000); return () => clearTimeout(t); }
}, [step]);

return (
<div className="screen">
<div className="listing-header">
<div style={{ flex: 1 }}>
<div className="h3">Live Tracking</div>
<div style={{ color: "var(–muted)", fontSize: 11, marginTop: 2 }}>Order #PADI-2847</div>
</div>
</div>
<div className="track-map-mock">
<div className="rider-dot" />
<div style={{ fontSize: 12, color: "var(–muted)", marginTop: 8 }}>Rider is on the way</div>
<div style={{ position: "absolute", top: 14, right: 14, background: "var(–bg)", borderRadius: 10, padding: "6px 12px", border: "1px solid var(–border)", fontSize: 12, fontWeight: 600 }}>~5 min away</div>
</div>
<div style={{ padding: "20px 20px 0" }}>
<div className="label" style={{ marginBottom: 16 }}>Order Progress</div>
{TRACK_STEPS.map((s, i) => (
<div className="track-step" key={s.label}>
<div className="step-dot-col">
<div className={`step-dot ${i < step ? "step-done" : i === step ? "step-active" : "step-pending"}`} />
{i < TRACK_STEPS.length - 1 && <div className={`step-line ${i < step ? "step-line-done" : "step-line-pending"}`} />}
</div>
<div style={{ flex: 1 }}>
<div className="step-title" style={{ color: i > step ? "var(–muted)" : "var(–text)" }}>{s.label}</div>
<div className="step-sub">{s.sub}</div>
</div>
{i < step && <span style={{ color: "var(–green)", fontSize: 13, fontWeight: 700 }}>✓</span>}
</div>
))}
</div>
</div>
);
}

// ─── Profile Screen ───────────────────────────────────────────────────────────
function ProfileScreen() {
const { logout, profile } = useAuth();
const name = profile?.name || "Student";
const email = profile?.email || "";
const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

return (
<div className="screen">
<div className="profile-hero">
<div className="profile-avatar">{initials}</div>
<div style={{ fontFamily: "var(–font-head)", fontSize: 22, fontWeight: 800 }}>{name}</div>
<div style={{ fontSize: 14, color: "var(–muted)", marginTop: 4 }}>{email}</div>
<div style={{ marginTop: 12 }}><span className="chip active">Student</span></div>
</div>
<div className="profile-stats">
{[["—", "Orders"], ["—", "Rating"], ["₦0", "Rewards"]].map(([val, label]) => (
<div className="stat-item" key={label}>
<div className="stat-val">{val}</div>
<div className="stat-label">{label}</div>
</div>
))}
</div>
<div className="menu-section">
{["Saved Addresses", "Order History", "Refer & Earn", "Notifications", "Help & Support"].map(m => (
<div className="menu-item" key={m}>
<div className="menu-label">{m}</div>
<div className="menu-arrow">›</div>
</div>
))}
<div className="menu-item" onClick={logout} style={{ marginTop: 8 }}>
<div className="menu-label" style={{ color: "#FF4444" }}>Sign Out</div>
<div className="menu-arrow">›</div>
</div>
</div>
</div>
);
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function PADIApp() {
  const {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    error,
    setError,
    profile,
  } = useAuth();

  const [phase, setPhase] = useState("splash");
  const [tab, setTab] = useState("home");
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [botOpen, setBotOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPhase("ready"), 2200);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (user && profile?.role === "student") {
      requestNotificationPermission(user.uid, "student");
      const unsub = listenForMessages((notif) => showToast(notif.title));
      return unsub;
    }
  }, [user, profile?.role]);

  const addToCart = (food) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === food.id);

      if (existing) {
        return prev.map((item) =>
          item.id === food.id ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [...prev, { ...food, qty: 1 }];
    });

    showToast(`${food.name} added to cart`);
  };

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  const NAV = [
    { key: "home", label: "Home", icon: "🏠" },
    { key: "food", label: "Food", icon: "🍔" },
    { key: "catalogue", label: "Reels", icon: "🎬" },
    { key: "cart", label: "Cart", icon: "🛒" },
    { key: "profile", label: "Profile", icon: "👤" },
  ];

  if (phase === "splash") {
    return (
      <>
        <style>{CSS}</style>
        <div className="app">
          <SplashScreen />
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="app">
          <div className="splash">
            <div className="splash-pulse" />
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <style>{CSS}</style>
        <div className="app" style={{ overflowY: "auto" }}>
          <AuthScreenWithRider
            login={login}
            register={register}
            loginWithGoogle={loginWithGoogle}
            error={error}
            setError={setError}
          />
        </div>
      </>
    );
  }

  if (profile?.role === "vendor") {
    window.location.href = "/vendor";
    return null;
  }

  if (profile?.role === "rider") {
    window.location.href = "/rider";
    return null;
  }

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <style>{CSS}</style>

        <div className="app">
          {tab === "home" && (
            <HomeScreen onAddToCart={addToCart} setTab={setTab} />
          )}

          {tab === "food" && <FoodScreen onAddToCart={addToCart} />}

          {tab === "catalogue" && (
            <VideoCatalogueScreen onAddToCart={addToCart} />
          )}

          {tab === "chat" && (
            <ChatScreen openBot={() => setBotOpen(true)} />
          )}

          {tab === "cart" && (
            <CartScreen
              cart={cart}
              setCart={setCart}
              showToast={showToast}
              setTab={setTab}
              user={user}
            />
          )}

          {tab === "wallet" && (
            <RealWalletScreen user={user} showToast={showToast} />
          )}

          {tab === "track" && <TrackingScreen />}

          {tab === "profile" && <ProfileScreen />}

          <div className="bottom-nav">
            {NAV.map((item) => (
              <div
                key={item.key}
                className={`nav-item ${tab === item.key ? "active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                <div
                  className="nav-icon"
                  style={{ position: "relative", fontSize: 20 }}
                  dangerouslySetInnerHTML={{
                    __html:
                      item.icon +
                      (item.key === "cart" && cartCount > 0
                        ? `<div style="position:absolute;top:-6px;right:-8px;background:var(--brand);color:#fff;border-radius:100px;padding:1px 5px;font-size:9px;font-weight:700;border:2px solid var(--bg)">${cartCount}</div>`
                        : ""),
                  }}
                />
                <div className="nav-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 80, right: 12, zIndex: 99 }}>
          <PadiBotFloat onOpen={() => setBotOpen(true)} />
        </div>

        {botOpen && <PadiBotOverlay onClose={() => setBotOpen(false)} />}
        {toast && <Toast msg={toast} />}
      </div>
    </div>
  );
}