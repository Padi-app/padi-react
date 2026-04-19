import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import {
  collection, 
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

const API_BASE=`${import.meta.env.VITE_API_URL}/api/admin`;

// ─── CSS ─────────────────────────────────────────────────────────────────────
const ADMIN_CSS = `

- { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
  –brand: #FF5A1F; –brand2: #FF8C42; –green: #00C07F; –red: #FF4444;
  –yellow: #FFC107; –blue: #3B82F6;
  –bg: #0A0A0C; –surface: #13131A; –surface2: #1C1C26;
  –border: #2A2A38; –text: #F0F0F5; –muted: #6B6B80;
  –font: ‘DM Sans’, sans-serif; –font-head: ‘Syne’, sans-serif;
  }
  @import url(‘https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap’);
  .admin-root { min-height: 100vh; background: var(–bg); color: var(–text); font-family: var(–font); display: flex; }

/* Sidebar */
.admin-sidebar { width: 220px; background: var(–surface); border-right: 1px solid var(–border); display: flex; flex-direction: column; padding: 20px 0; flex-shrink: 0; position: fixed; height: 100vh; overflow-y: auto; }
.admin-logo { display: flex; align-items: center; gap: 10px; padding: 0 20px 24px; border-bottom: 1px solid var(–border); margin-bottom: 8px; }
.admin-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,var(–brand),var(–brand2)); display: flex; align-items: center; justify-content: center; font-family: var(–font-head); font-weight: 800; color: #fff; font-size: 16px; }
.admin-logo-text { font-family: var(–font-head); font-weight: 800; font-size: 16px; }
.admin-logo-badge { font-size: 10px; background: rgba(255,90,31,.15); color: var(–brand); border-radius: 4px; padding: 2px 6px; font-weight: 700; margin-left: 2px; }
.admin-nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 20px; cursor: pointer; transition: all .15s; font-size: 14px; font-weight: 500; color: var(–muted); border-left: 3px solid transparent; }
.admin-nav-item:hover { background: var(–surface2); color: var(–text); }
.admin-nav-item.active { background: rgba(255,90,31,.08); color: var(–brand); border-left-color: var(–brand); }
.admin-nav-icon { font-size: 17px; width: 20px; text-align: center; }
.admin-nav-badge { margin-left: auto; background: var(–brand); color: #fff; border-radius: 100px; padding: 1px 7px; font-size: 11px; font-weight: 700; }
.admin-nav-section { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: var(–muted); padding: 16px 20px 6px; text-transform: uppercase; }

/* Main content */
.admin-main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
.admin-topbar { padding: 16px 28px; background: var(–surface); border-bottom: 1px solid var(–border); display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
.admin-page-title { font-family: var(–font-head); font-size: 20px; font-weight: 700; }
.admin-page-sub { font-size: 12px; color: var(–muted); margin-top: 2px; }
.admin-content { padding: 24px 28px; flex: 1; }

/* Stats grid */
.admin-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.admin-stat-card { background: var(–surface); border: 1px solid var(–border); border-radius: 16px; padding: 20px; }
.admin-stat-label { font-size: 12px; color: var(–muted); font-weight: 600; letter-spacing: .5px; margin-bottom: 8px; }
.admin-stat-val { font-family: var(–font-head); font-size: 28px; font-weight: 800; }
.admin-stat-change { font-size: 12px; margin-top: 4px; }

/* Cards */
.admin-card { background: var(–surface); border: 1px solid var(–border); border-radius: 16px; overflow: hidden; margin-bottom: 20px; }
.admin-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(–border); }
.admin-card-title { font-family: var(–font-head); font-size: 15px; font-weight: 700; }

/* Table */
.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(–muted); text-transform: uppercase; padding: 12px 20px; text-align: left; border-bottom: 1px solid var(–border); background: var(–surface2); }
.admin-table td { padding: 14px 20px; border-bottom: 1px solid var(–border); font-size: 14px; vertical-align: middle; }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover td { background: rgba(255,255,255,.02); }

/* Badges */
.badge-pending { background: rgba(255,193,7,.12); color: #FFC107; border: 1px solid rgba(255,193,7,.2); border-radius: 100px; padding: 3px 10px; font-size: 12px; font-weight: 600; }
.badge-active { background: rgba(0,192,127,.12); color: var(–green); border: 1px solid rgba(0,192,127,.2); border-radius: 100px; padding: 3px 10px; font-size: 12px; font-weight: 600; }
.badge-suspended { background: rgba(255,68,68,.12); color: var(–red); border: 1px solid rgba(255,68,68,.2); border-radius: 100px; padding: 3px 10px; font-size: 12px; font-weight: 600; }
.badge-rejected { background: rgba(107,107,128,.12); color: var(–muted); border: 1px solid var(–border); border-radius: 100px; padding: 3px 10px; font-size: 12px; font-weight: 600; }

/* Buttons */
.btn-approve { background: rgba(0,192,127,.15); color: var(–green); border: 1px solid rgba(0,192,127,.3); border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
.btn-approve:hover { background: rgba(0,192,127,.25); }
.btn-reject { background: rgba(255,68,68,.1); color: var(–red); border: 1px solid rgba(255,68,68,.2); border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; margin-left: 6px; }
.btn-reject:hover { background: rgba(255,68,68,.2); }
.btn-suspend { background: rgba(255,193,7,.1); color: var(–yellow); border: 1px solid rgba(255,193,7,.2); border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
.btn-suspend:hover { background: rgba(255,193,7,.2); }
.btn-unsuspend { background: rgba(59,130,246,.1); color: var(–blue); border: 1px solid rgba(59,130,246,.2); border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 600; cursor: pointer; }

/* Filter tabs */
.filter-tabs { display: flex; gap: 6px; margin-bottom: 16px; }
.filter-tab { padding: 7px 16px; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; border: 1px solid var(–border); color: var(–muted); background: var(–surface2); }
.filter-tab.active { background: rgba(255,90,31,.12); color: var(–brand); border-color: rgba(255,90,31,.3); }

/* Login screen */
.admin-login { min-height: 100vh; background: var(–bg); display: flex; align-items: center; justify-content: center; }
.admin-login-card { background: var(–surface); border: 1px solid var(–border); border-radius: 20px; padding: 40px; width: 100%; max-width: 380px; }
.admin-login-title { font-family: var(–font-head); font-size: 24px; font-weight: 800; margin-bottom: 6px; }
.admin-login-sub { font-size: 14px; color: var(–muted); margin-bottom: 28px; }
.admin-input { background: var(–surface2); border: 1.5px solid var(–border); border-radius: 12px; padding: 13px 16px; color: var(–text); font-family: var(–font); font-size: 14px; outline: none; width: 100%; transition: border-color .15s; margin-bottom: 12px; }
.admin-input:focus { border-color: var(–brand); }
.admin-btn-primary { background: linear-gradient(135deg,var(–brand),var(–brand2)); color: #fff; border: none; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 700; cursor: pointer; width: 100%; transition: opacity .15s; }
.admin-btn-primary:hover { opacity: .9; }
.admin-btn-primary:disabled { opacity: .6; }

/* Empty state */
.admin-empty { text-align: center; padding: 48px 20px; color: var(–muted); }
.admin-empty-icon { font-size: 40px; margin-bottom: 12px; }
.admin-empty-text { font-size: 15px; font-weight: 600; color: var(–text); }
.admin-empty-sub { font-size: 13px; margin-top: 4px; }

/* Dispute card */
.dispute-card { background: var(–surface2); border: 1px solid var(–border); border-radius: 14px; padding: 16px; margin-bottom: 12px; }
.dispute-type { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
.dispute-desc { font-size: 14px; margin-bottom: 10px; line-height: 1.5; }
.dispute-meta { font-size: 12px; color: var(–muted); }
.dispute-actions { display: flex; gap: 8px; margin-top: 12px; }

/* Analytics */
.analytics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.analytics-card { background: var(–surface); border: 1px solid var(–border); border-radius: 16px; padding: 20px; }
.analytics-title { font-size: 13px; font-weight: 600; color: var(–muted); margin-bottom: 12px; text-transform: uppercase; letter-spacing: .5px; }
.analytics-big { font-family: var(–font-head); font-size: 36px; font-weight: 800; color: var(–brand); }
.analytics-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(–border); font-size: 13px; }
.analytics-row:last-child { border-bottom: none; }

/* Toast */
.admin-toast { position: fixed; bottom: 24px; right: 24px; background: var(–surface); border: 1px solid var(–border); border-radius: 12px; padding: 12px 20px; font-size: 14px; font-weight: 500; z-index: 999; box-shadow: 0 8px 32px rgba(0,0,0,.4); display: flex; align-items: center; gap: 8px; animation: toastIn .3s ease both; }
@keyframes toastIn { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform: translateY(0) } }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(–border); border-radius: 3px; }
`;

// ─── Mock disputes (replace with Firestore later) ─────────────────────────────
const MOCK_DISPUTES = [
{ id: 1, type: "fraud", typeColor: "#FF4444", desc: "Student reported vendor charged twice for same order #PADI-2841.", user: "Student: tunde@school.edu.ng", vendor: "Campus Grill", time: "2 hours ago", status: "open" },
{ id: 2, type: "stuck order", typeColor: "#FFC107", desc: "Order #PADI-2839 has been ‘On the Way’ for 90 minutes with no update.", user: "Student: amaka@school.edu.ng", vendor: "Mama Put Central", time: "3 hours ago", status: "open" },
{ id: 3, type: "abuse", typeColor: "#FF5A1F", desc: "Vendor reported sending offensive messages to a student customer.", user: "Fresh Bites", vendor: "Vendor", time: "Yesterday", status: "resolved" },
];

// ─── Admin Login ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);

      const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || "")
        .toLowerCase()
        .trim();

      if (res.user.email.toLowerCase() !== adminEmail) {
        await signOut(auth);
        setError("Not authorized as admin");
        setLoading(false);
        return;
      }

      onLogin();
    } catch (err) {
      setError("Invalid credentials");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>PADI Admin Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />

      <button onClick={handleLogin}>
        {loading ? "Signing in..." : "Login"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

// ─── Overview Page ────────────────────────────────────────────────────────────
function OverviewPage({ stats }) {
return (
<div>
<div className="admin-stats">
{[
{ label: "Total Students", val: stats.students, change: "+12 this week", color: "var(–blue)" },
{ label: "Active Vendors", val: stats.activeVendors, change: `${stats.pendingVendors} pending`, color: "var(–brand)" },
{ label: "Total Orders", val: stats.orders, change: "All time", color: "var(–green)" },
{ label: "Pending Approvals", val: stats.pendingVendors + stats.pendingRiders, change: "Needs action", color: "var(–yellow)" },
].map(s => (
<div className="admin-stat-card" key={s.label} style={{ borderTop: `3px solid ${s.color}` }}>
<div className="admin-stat-label">{s.label}</div>
<div className="admin-stat-val" style={{ color: s.color }}>{s.val}</div>
<div className="admin-stat-change" style={{ color: "var(–muted)" }}>{s.change}</div>
</div>
))}
</div>

```
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">Platform Health</div>
      </div>
      <div style={{ padding: 20 }}>
        {[
          { label: "Vendor Approval Rate", val: "87%", color: "var(--green)" },
          { label: "Order Completion Rate", val: "94%", color: "var(--green)" },
          { label: "Average Delivery Time", val: "22 min", color: "var(--blue)" },
          { label: "Active Disputes", val: "2", color: "var(--yellow)" },
          { label: "Suspended Accounts", val: stats.suspended, color: "var(--red)" },
        ].map(r => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
            <span style={{ color: "var(--muted)" }}>{r.label}</span>
            <span style={{ fontWeight: 700, color: r.color }}>{r.val}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">Recent Activity</div>
      </div>
      <div style={{ padding: "8px 0" }}>
        {[
          { icon: "🏪", text: "New vendor registered: Buka Express", time: "5 min ago", color: "var(--brand)" },
          { icon: "🎓", text: "New student joined: Tunde A.", time: "12 min ago", color: "var(--blue)" },
          { icon: "📦", text: "Order #PADI-2847 delivered", time: "18 min ago", color: "var(--green)" },
          { icon: "⚠️", text: "Dispute filed on order #PADI-2841", time: "2 hrs ago", color: "var(--yellow)" },
          { icon: "✅", text: "Campus Grill approved and live", time: "Yesterday", color: "var(--green)" },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "12px 20px", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
            <div style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{a.text}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

);
}

// ─── Vendors Page ─────────────────────────────────────────────────────────────
function VendorsPage({ vendors, onAction, loading }) {
const [filter, setFilter] = useState("pending");
const filtered = vendors.filter(v => filter === "all" ? true : v.status === filter);

return (
<div>
<div className="filter-tabs">
{["pending", "active", "suspended", "rejected", "all"].map(f => (
<div key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
{f.charAt(0).toUpperCase() + f.slice(1)}
{f === "pending" && vendors.filter(v => v.status === "pending").length > 0 && (
<span style={{ marginLeft: 6, background: "var(–brand)", color: "#fff", borderRadius: 100, padding: "1px 6px", fontSize: 11 }}>
{vendors.filter(v => v.status === "pending").length}
</span>
)}
</div>
))}
</div>

```
  <div className="admin-card">
    {filtered.length === 0 ? (
      <div className="admin-empty">
        <div className="admin-empty-icon">🏪</div>
        <div className="admin-empty-text">No {filter} vendors</div>
        <div className="admin-empty-sub">Check back later</div>
      </div>
    ) : (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Business</th>
            <th>Category</th>
            <th>Location</th>
            <th>Registered</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(v => (
            <tr key={v.id}>
              <td>
                <div style={{ fontWeight: 600 }}>{v.businessName}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{v.email}</div>
              </td>
              <td style={{ color: "var(--muted)" }}>{v.category}</td>
              <td style={{ color: "var(--muted)", fontSize: 13 }}>{v.location}</td>
              <td style={{ color: "var(--muted)", fontSize: 12 }}>
                {v.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
              </td>
              <td>
                <span className={`badge-${v.status}`}>{v.status}</span>
              </td>
              <td>
                {v.status === "pending" && (
                  <>
                    <button className="btn-approve" onClick={() => onAction(v.id, "active", "vendors")} disabled={loading}>Approve</button>
                    <button className="btn-reject" onClick={() => onAction(v.id, "rejected", "vendors")} disabled={loading}>Reject</button>
                  </>
                )}
                {v.status === "active" && (
                  <button className="btn-suspend" onClick={() => onAction(v.id, "suspended", "vendors")} disabled={loading}>Suspend</button>
                )}
                {v.status === "suspended" && (
                  <button className="btn-unsuspend" onClick={() => onAction(v.id, "active", "vendors")} disabled={loading}>Reinstate</button>
                )}
                {v.status === "rejected" && (
                  <button className="btn-approve" onClick={() => onAction(v.id, "active", "vendors")} disabled={loading}>Approve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
</div>

);
}

// ─── Riders Page ──────────────────────────────────────────────────────────────
function RidersPage({ riders, onAction, loading }) {
const [filter, setFilter] = useState("pending");
const filtered = riders.filter(r => filter === "all" ? true : r.status === filter);

return (
<div>
<div className="filter-tabs">
{["pending", "active", "suspended", "all"].map(f => (
<div key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
{f.charAt(0).toUpperCase() + f.slice(1)}
</div>
))}
</div>

```
  <div className="admin-card">
    {filtered.length === 0 ? (
      <div className="admin-empty">
        <div className="admin-empty-icon">🛵</div>
        <div className="admin-empty-text">No {filter} riders</div>
        <div className="admin-empty-sub">Riders will appear here once they register</div>
      </div>
    ) : (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Rider</th>
            <th>Phone</th>
            <th>Vehicle</th>
            <th>Registered</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.id}>
              <td>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.email}</div>
              </td>
              <td style={{ color: "var(--muted)" }}>{r.phone}</td>
              <td style={{ color: "var(--muted)" }}>{r.vehicle || "N/A"}</td>
              <td style={{ color: "var(--muted)", fontSize: 12 }}>
                {r.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
              </td>
              <td><span className={`badge-${r.status}`}>{r.status}</span></td>
              <td>
                {r.status === "pending" && (
                  <>
                    <button className="btn-approve" onClick={() => onAction(r.id, "active", "riders")} disabled={loading}>Approve</button>
                    <button className="btn-reject" onClick={() => onAction(r.id, "rejected", "riders")} disabled={loading}>Reject</button>
                  </>
                )}
                {r.status === "active" && (
                  <button className="btn-suspend" onClick={() => onAction(r.id, "suspended", "riders")} disabled={loading}>Suspend</button>
                )}
                {r.status === "suspended" && (
                  <button className="btn-unsuspend" onClick={() => onAction(r.id, "active", "riders")} disabled={loading}>Reinstate</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
</div>

);
}

// ─── Students Page ────────────────────────────────────────────────────────────
function StudentsPage({ students, onAction, loading }) {
return (
<div className="admin-card">
{students.length === 0 ? (
<div className="admin-empty">
<div className="admin-empty-icon">🎓</div>
<div className="admin-empty-text">No students yet</div>
</div>
) : (
<table className="admin-table">
<thead>
<tr>
<th>Student</th>
<th>Phone</th>
<th>University</th>
<th>Joined</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{students.map(s => (
<tr key={s.id}>
<td>
<div style={{ fontWeight: 600 }}>{s.name}</div>
<div style={{ fontSize: 12, color: "var(–muted)" }}>{s.email}</div>
</td>
<td style={{ color: "var(–muted)" }}>{s.phone || "N/A"}</td>
<td style={{ color: "var(–muted)" }}>{s.university || "N/A"}</td>
<td style={{ color: "var(–muted)", fontSize: 12 }}>
{s.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
</td>
<td><span className={s.status === "suspended" ? "badge-suspended" : "badge-active"}>{s.status || "active"}</span></td>
<td>
{s.status === "suspended" ? (
<button className="btn-unsuspend" onClick={() => onAction(s.id, "active", "users")} disabled={loading}>Reinstate</button>
) : (
<button className="btn-suspend" onClick={() => onAction(s.id, "suspended", "users")} disabled={loading}>Suspend</button>
)}
</td>
</tr>
))}
</tbody>
</table>
)}
</div>
);
}

// ─── Disputes Page ────────────────────────────────────────────────────────────
function DisputesPage() {
const [disputes, setDisputes] = useState(MOCK_DISPUTES);
const [filter, setFilter] = useState("open");
const filtered = disputes.filter(d => filter === "all" ? true : d.status === filter);

const resolve = (id) => setDisputes(p => p.map(d => d.id === id ? { ...d, status: "resolved" } : d));
const dismiss = (id) => setDisputes(p => p.map(d => d.id === id ? { ...d, status: "dismissed" } : d));

return (
<div>
<div className="filter-tabs">
{["open", "resolved", "dismissed", "all"].map(f => (
<div key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
{f.charAt(0).toUpperCase() + f.slice(1)}
</div>
))}
</div>

```
  {filtered.length === 0 ? (
    <div className="admin-card">
      <div className="admin-empty">
        <div className="admin-empty-icon">✅</div>
        <div className="admin-empty-text">No {filter} disputes</div>
        <div className="admin-empty-sub">Platform is running smoothly</div>
      </div>
    </div>
  ) : (
    filtered.map(d => (
      <div className="dispute-card" key={d.id}>
        <div className="dispute-type" style={{ color: d.typeColor }}>⚠ {d.type.toUpperCase()}</div>
        <div className="dispute-desc">{d.desc}</div>
        <div className="dispute-meta">
          👤 {d.user} · 🏪 {d.vendor} · 🕐 {d.time}
        </div>
        {d.status === "open" && (
          <div className="dispute-actions">
            <button className="btn-approve" onClick={() => resolve(d.id)}>Mark Resolved</button>
            <button className="btn-reject" onClick={() => dismiss(d.id)}>Dismiss</button>
            <button className="btn-suspend" style={{ marginLeft: 0 }}>Suspend Vendor</button>
          </div>
        )}
        {d.status !== "open" && (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
            {d.status === "resolved" ? "✅ Resolved" : "❌ Dismissed"}
          </div>
        )}
      </div>
    ))
  )}
</div>

);
}

// ─── Analytics Page ───────────────────────────────────────────────────────────
function AnalyticsPage({ stats }) {
return (
<div className="analytics-grid">
<div className="analytics-card">
<div className="analytics-title">Total Revenue</div>
<div className="analytics-big">₦{(stats.orders * 1350).toLocaleString()}</div>
<div style={{ fontSize: 13, color: "var(–muted)", marginTop: 4 }}>Estimated from {stats.orders} orders</div>
</div>

```
  <div className="analytics-card">
    <div className="analytics-title">Platform Commission (10%)</div>
    <div className="analytics-big" style={{ color: "var(--green)" }}>₦{(stats.orders * 135).toLocaleString()}</div>
    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>PADI earnings</div>
  </div>

  <div className="analytics-card" style={{ gridColumn: "1 / -1" }}>
    <div className="analytics-title">Breakdown</div>
    {[
      { label: "Total Students", val: stats.students, color: "var(--blue)" },
      { label: "Active Vendors", val: stats.activeVendors, color: "var(--brand)" },
      { label: "Pending Vendors", val: stats.pendingVendors, color: "var(--yellow)" },
      { label: "Suspended Accounts", val: stats.suspended, color: "var(--red)" },
      { label: "Total Orders", val: stats.orders, color: "var(--green)" },
      { label: "Open Disputes", val: 2, color: "var(--yellow)" },
    ].map(r => (
      <div className="analytics-row" key={r.label}>
        <span>{r.label}</span>
        <span style={{ fontWeight: 700, color: r.color }}>{r.val}</span>
      </div>
    ))}
  </div>
</div>

);
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [riders, setRiders] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg) => alert(msg);

  /* ─── AUTH LISTENER ─── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthed(!!user);
    });

    return () => unsub();
  }, []);

  /* ─── FETCH DATA ─── */
  const fetchAll = async () => {
    setLoading(true);

    try {
      const [vendorSnap, userSnap] = await Promise.all([
        getDocs(query(collection(db, "vendors"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"))),
      ]);

      const vendorData = vendorSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const userData = userSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setVendors(vendorData);
      setRiders(userData.filter((u) => u.role === "rider"));
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (authed) fetchAll();
  }, [authed]);

  /* ─── HANDLE ACTION ─── */
  const handleAction = async (id, newStatus, collectionName) => {
  setActionLoading(true);

  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Admin not authenticated");

    const token = await user.getIdToken();

    const actionMap = {
      active: "approve",
      rejected: "reject",
      suspended: "suspend",
    };

    const action = actionMap[newStatus];

    const endpoint =
      collectionName === "vendors"
        ? "vendor-action"
        : "rider-action";

    const body =
      collectionName === "vendors"
        ? { vendorId: id, action }
        : { riderId: id, action };

    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Action failed");
    }

    await fetchAll();
    showToast(data.message || "Action successful!");
  } catch (e) {
    console.error(e);
    showToast(e.message, "var(--red)");
  }

  setActionLoading(false);
};

  /* ─── SIGN OUT ─── */
  const logout = async () => {
    await signOut(auth);
    setAuthed(false);
  };

  /* ─── UI ─── */
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  return (
    <div style={{ padding: 30 }}>
      <h1>PADI Admin Dashboard</h1>

      <button onClick={logout}>Logout</button>

      {loading && <p>Loading...</p>}

      {/* ─── VENDORS ─── */}
      <h2>Vendors</h2>
      {vendors.map((v) => (
        <div key={v.id} style={{ marginBottom: 10 }}>
          <strong>{v.businessName}</strong> — {v.status}

          {v.status === "pending" && (
            <>
              <button onClick={() => handleAction(v.id, "active", "vendors")}>
                Approve
              </button>
              <button onClick={() => handleAction(v.id, "rejected", "vendors")}>
                Reject
              </button>
            </>
          )}

          {v.status === "active" && (
            <button onClick={() => handleAction(v.id, "suspended", "vendors")}>
              Suspend
            </button>
          )}

          {v.status === "suspended" && (
            <button onClick={() => handleAction(v.id, "active", "vendors")}>
              Reinstate
            </button>
          )}
        </div>
      ))}

      {/* ─── RIDERS ─── */}
      <h2>Riders</h2>
      {riders.map((r) => (
        <div key={r.id} style={{ marginBottom: 10 }}>
          <strong>{r.name}</strong> — {r.status}

          {r.status === "pending" && (
            <>
              <button onClick={() => handleAction(r.id, "active", "riders")}>
                Approve
              </button>
              <button onClick={() => handleAction(r.id, "rejected", "riders")}>
                Reject
              </button>
            </>
          )}

          {r.status === "active" && (
            <button onClick={() => handleAction(r.id, "suspended", "riders")}>
              Suspend
            </button>
          )}

          {r.status === "suspended" && (
            <button onClick={() => handleAction(r.id, "active", "riders")}>
              Reinstate
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
