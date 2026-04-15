import { useState } from "react";

// ─── CSS ────────────────────────────────────────────────────────────────────
const VENDOR_CSS = `
.v-toggle { display: flex; background: var(--surface2); border-radius: 14px; padding: 4px; margin-bottom: 20px; }
.v-toggle-tab { flex: 1; padding: 11px; border-radius: 11px; text-align: center; font-weight: 700; font-size: 14px; cursor: pointer; transition: all .2s; color: var(--muted); display: flex; align-items: center; justify-content: center; gap: 6px; }
.v-toggle-tab.active { background: var(--surface); color: var(--text); box-shadow: 0 2px 8px rgba(0,0,0,.3); }
.v-toggle-tab.active.vendor { background: linear-gradient(135deg,var(--brand),var(--brand2)); color: #fff; }

.v-steps { display: flex; align-items: center; gap: 0; margin-bottom: 28px; }
.v-step { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
.v-step-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; transition: all .3s; border: 2px solid var(--border); color: var(--muted); background: var(--surface2); }
.v-step-dot.active { background: linear-gradient(135deg,var(--brand),var(--brand2)); color: #fff; border-color: transparent; box-shadow: 0 4px 14px rgba(255,90,31,.4); }
.v-step-dot.done { background: var(--green); color: #fff; border-color: transparent; }
.v-step-label { font-size: 10px; color: var(--muted); font-weight: 500; text-align: center; }
.v-step-label.active { color: var(--brand); font-weight: 700; }
.v-step-line { flex: 1; height: 2px; background: var(--border); margin-bottom: 16px; transition: background .3s; }
.v-step-line.done { background: var(--green); }

.v-section-title { font-family: var(--font-head); font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.v-section-sub { font-size: 13px; color: var(--muted); margin-bottom: 20px; line-height: 1.4; }

.v-row { display: flex; gap: 12px; }
.v-row .input-wrap { flex: 1; }

.v-select { background: var(--surface2); border: 1.5px solid var(--border); border-radius: 13px; padding: 14px 16px; color: var(--text); font-family: var(--font-body); font-size: 15px; outline: none; width: 100%; transition: border-color .15s; appearance: none; cursor: pointer; }
.v-select:focus { border-color: var(--brand); }

.v-menu-item { display: flex; align-items: center; gap: 12px; background: var(--surface2); border: 1.5px solid var(--border); border-radius: 13px; padding: 12px 14px; margin-bottom: 10px; }
.v-menu-item-info { flex: 1; }
.v-menu-item-name { font-weight: 600; font-size: 14px; }
.v-menu-item-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
.v-menu-remove { width: 28px; height: 28px; border-radius: 8px; background: rgba(255,68,68,.12); border: none; color: #FF4444; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.v-add-form { background: var(--surface); border: 1.5px solid rgba(255,90,31,.2); border-radius: 14px; padding: 16px; margin-bottom: 16px; }
.v-add-form-title { font-size: 13px; font-weight: 700; color: var(--brand); margin-bottom: 12px; letter-spacing: .5px; text-transform: uppercase; }

.v-pending { text-align: center; padding: 40px 24px; }
.v-pending-icon { width: 80px; height: 80px; border-radius: 24px; background: rgba(255,90,31,.1); border: 2px solid rgba(255,90,31,.2); display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 16px; }
.v-pending-title { font-family: var(--font-head); font-size: 22px; font-weight: 800; margin-bottom: 8px; }
.v-pending-sub { font-size: 14px; color: var(--muted); line-height: 1.6; }
.v-pending-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,193,7,.12); border: 1px solid rgba(255,193,7,.3); border-radius: 100px; padding: 6px 14px; font-size: 13px; font-weight: 600; color: #FFC107; margin: 16px 0; }
.v-pending-steps { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px; margin-top: 20px; text-align: left; }
.v-pending-step { display: flex; gap: 12px; padding: 8px 0; font-size: 13px; align-items: flex-start; }
.v-pending-step-num { width: 22px; height: 22px; border-radius: 50%; background: var(--surface2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; color: var(--muted); }
`;

const CATEGORIES = [
  "Nigerian Food",
  "Grills & BBQ",
  "Healthy & Salads",
  "Snacks & Pastries",
  "Drinks & Smoothies",
  "Chinese/Continental",
  "Groceries",
  "Pharmacy",
  "Laundry",
  "Other",
];

const BANKS = [
  "Access Bank",
  "GTBank",
  "First Bank",
  "Zenith Bank",
  "UBA",
  "Opay",
  "Palmpay",
  "Kuda Bank",
  "Sterling Bank",
  "Wema Bank",
];

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Business", "Bank", "Menu"];

  return (
    <div className="v-steps">
      {steps.map((s, i) => (
        <div key={s} style={{ display: "contents" }}>
          <div className="v-step">
            <div className={`v-step-dot ${i < step ? "done" : i === step ? "active" : ""}`}>
              {i < step ? "✓" : i + 1}
            </div>
            <div className={`v-step-label ${i === step ? "active" : ""}`}>{s}</div>
          </div>

          {i < steps.length - 1 && (
            <div className={`v-step-line ${i < step ? "done" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Business Info ────────────────────────────────────────────────────
function Step1({ data, setData, onNext }) {
  const valid =
    data.businessName &&
    data.category &&
    data.phone &&
    data.location &&
    data.description;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div className="v-section-title">Business Info</div>
        <div className="v-section-sub">
          Tell students about your business on campus.
        </div>
      </div>

      <div className="input-wrap">
        <div className="input-label">Business Name *</div>
        <input
          className="input"
          placeholder="e.g. Mama Put Central"
          value={data.businessName}
          onChange={(e) =>
            setData((p) => ({ ...p, businessName: e.target.value }))
          }
        />
      </div>

      <div className="input-wrap">
        <div className="input-label">Category *</div>
        <select
          className="v-select"
          value={data.category}
          onChange={(e) =>
            setData((p) => ({ ...p, category: e.target.value }))
          }
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="v-row">
        <div className="input-wrap">
          <div className="input-label">Phone Number *</div>
          <input
            className="input"
            placeholder="08012345678"
            value={data.phone}
            onChange={(e) => setData((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>

        <div className="input-wrap">
          <div className="input-label">WhatsApp</div>
          <input
            className="input"
            placeholder="08012345678"
            value={data.whatsapp}
            onChange={(e) =>
              setData((p) => ({ ...p, whatsapp: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="input-wrap">
        <div className="input-label">Location on Campus *</div>
        <input
          className="input"
          placeholder="e.g. Near Faculty of Engineering, Block C"
          value={data.location}
          onChange={(e) =>
            setData((p) => ({ ...p, location: e.target.value }))
          }
        />
      </div>

      <div className="input-wrap">
        <div className="input-label">Opening Hours</div>
        <div className="v-row">
          <input
            className="input"
            placeholder="Opens e.g. 7:00 AM"
            value={data.opensAt}
            onChange={(e) =>
              setData((p) => ({ ...p, opensAt: e.target.value }))
            }
          />
          <input
            className="input"
            placeholder="Closes e.g. 9:00 PM"
            value={data.closesAt}
            onChange={(e) =>
              setData((p) => ({ ...p, closesAt: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="input-wrap">
        <div className="input-label">Business Description *</div>
        <textarea
          className="input"
          rows={3}
          placeholder="Tell students what makes your business special..."
          style={{ resize: "none", lineHeight: 1.5 }}
          value={data.description}
          onChange={(e) =>
            setData((p) => ({ ...p, description: e.target.value }))
          }
        />
      </div>

      <div className="input-wrap">
        <div className="input-label">Delivery Radius</div>
        <select
          className="v-select"
          value={data.deliveryRadius}
          onChange={(e) =>
            setData((p) => ({ ...p, deliveryRadius: e.target.value }))
          }
        >
          <option value="">Select range</option>
          <option value="on-campus">On campus only</option>
          <option value="1km">Within 1km</option>
          <option value="3km">Within 3km</option>
          <option value="5km">Within 5km</option>
        </select>
      </div>

      <button
        className="btn btn-primary"
        onClick={onNext}
        disabled={!valid}
        style={{ marginTop: 8 }}
      >
        Continue to Bank Details →
      </button>
    </div>
  );
}

// ─── Step 2: Bank Details ─────────────────────────────────────────────────────
function Step2({ data, setData, onNext, onBack }) {
  const valid = data.bankName && data.accountNumber && data.accountName;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div className="v-section-title">Bank Details</div>
        <div className="v-section-sub">
          Your payout information. Funds are transferred after each order.
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,193,7,.08)",
          border: "1px solid rgba(255,193,7,.2)",
          borderRadius: 12,
          padding: "12px 14px",
          fontSize: 13,
          color: "#FFC107",
          lineHeight: 1.5,
        }}
      >
        🔒 Your bank details are encrypted and only used for payouts. PADI never
        charges your account.
      </div>

      <div className="input-wrap">
        <div className="input-label">Bank Name *</div>
        <select
          className="v-select"
          value={data.bankName}
          onChange={(e) =>
            setData((p) => ({ ...p, bankName: e.target.value }))
          }
        >
          <option value="">Select your bank</option>
          {BANKS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="input-wrap">
        <div className="input-label">Account Number *</div>
        <input
          className="input"
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

      <div className="input-wrap">
        <div className="input-label">Account Name *</div>
        <input
          className="input"
          placeholder="Name on account"
          value={data.accountName}
          onChange={(e) =>
            setData((p) => ({ ...p, accountName: e.target.value }))
          }
        />
      </div>

      <div className="input-wrap">
        <div className="input-label">Payout Frequency</div>
        <select
          className="v-select"
          value={data.payoutFreq}
          onChange={(e) =>
            setData((p) => ({ ...p, payoutFreq: e.target.value }))
          }
        >
          <option value="daily">Daily (after each order)</option>
          <option value="weekly">Weekly (every Monday)</option>
          <option value="biweekly">Bi-weekly</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ flex: 1 }}>
          ← Back
        </button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!valid}
          style={{ flex: 2 }}
        >
          Continue to Menu →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Menu Items ───────────────────────────────────────────────────────
function Step3({ data, setData, onSubmit, onBack, loading }) {
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });
  const [showForm, setShowForm] = useState(false);

  const addItem = () => {
    if (!newItem.name || !newItem.price) return;

    setData((p) => ({
      ...p,
      menuItems: [
        ...(p.menuItems || []),
        {
          ...newItem,
          id: Date.now(),
          price: Number(newItem.price),
        },
      ],
    }));

    setNewItem({ name: "", price: "", description: "", category: "" });
    setShowForm(false);
  };

  const removeItem = (id) => {
    setData((p) => ({
      ...p,
      menuItems: p.menuItems.filter((i) => i.id !== id),
    }));
  };

  const menuItems = data.menuItems || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div className="v-section-title">Menu Items</div>
        <div className="v-section-sub">
          Add at least 1 item. You can add more after approval.
        </div>
      </div>

      {menuItems.map((item) => (
        <div className="v-menu-item" key={item.id}>
          <div style={{ fontSize: 28 }}>🍽️</div>
          <div className="v-menu-item-info">
            <div className="v-menu-item-name">{item.name}</div>
            <div className="v-menu-item-meta">
              ₦{Number(item.price).toLocaleString()} ·{" "}
              {item.category || "General"}
            </div>
            {item.description && (
              <div className="v-menu-item-meta" style={{ marginTop: 2 }}>
                {item.description}
              </div>
            )}
          </div>
          <button
            className="v-menu-remove"
            onClick={() => removeItem(item.id)}
          >
            ✕
          </button>
        </div>
      ))}

      {showForm ? (
        <div className="v-add-form">
          <div className="v-add-form-title">+ New Item</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              className="input"
              placeholder="Item name *"
              value={newItem.name}
              onChange={(e) =>
                setNewItem((p) => ({ ...p, name: e.target.value }))
              }
            />

            <div className="v-row">
              <input
                className="input"
                placeholder="Price (₦) *"
                type="number"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, price: e.target.value }))
                }
              />
              <input
                className="input"
                placeholder="Category"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, category: e.target.value }))
                }
              />
            </div>

            <input
              className="input"
              placeholder="Short description (optional)"
              value={newItem.description}
              onChange={(e) =>
                setNewItem((p) => ({ ...p, description: e.target.value }))
              }
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-ghost"
                onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: "11px" }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={addItem}
                disabled={!newItem.name || !newItem.price}
                style={{ flex: 2 }}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-ghost"
          onClick={() => setShowForm(true)}
          style={{
            borderStyle: "dashed",
            borderColor: "rgba(255,90,31,.4)",
            color: "var(--brand)",
          }}
        >
          + Add Menu Item
        </button>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ flex: 1 }}>
          ← Back
        </button>
        <button
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={menuItems.length === 0 || loading}
          style={{ flex: 2 }}
        >
          {loading ? "Submitting..." : "Submit for Approval 🚀"}
        </button>
      </div>
    </div>
  );
}

// ─── Pending Approval Screen ──────────────────────────────────────────────────
export function VendorPendingScreen({ vendorName }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div className="v-pending">
        <div className="v-pending-icon">🏪</div>
        <div className="v-pending-title">You’re almost live!</div>
        <div className="v-pending-sub">
          <strong>{vendorName || "Your business"}</strong> has been submitted
          successfully. Our team will review your application shortly.
        </div>

        <div className="v-pending-badge">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#FFC107",
              display: "inline-block",
            }}
          />
          Pending Review
        </div>

        <div className="v-pending-sub">
          You’ll receive a notification once you’re approved and students can
          start ordering!
        </div>

        <div className="v-pending-steps">
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--muted)",
              letterSpacing: 1,
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            What happens next
          </div>

          {[
            "Our team reviews your business details and menu",
            "We verify your bank account information",
            "Your shop goes live on PADI for students to discover",
            "You start receiving orders and earning! 🎉",
          ].map((s, i) => (
            <div className="v-pending-step" key={i}>
              <div className="v-pending-step-num">{i + 1}</div>
              <div>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Vendor Registration Form ───────────────────────────────────────────
export function VendorRegisterForm({ onSuccess, onSwitchToLogin }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState({
    businessName: "",
    category: "",
    phone: "",
    whatsapp: "",
    location: "",
    description: "",
    opensAt: "",
    closesAt: "",
    deliveryRadius: "on-campus",
    bankName: "",
    accountNumber: "",
    accountName: "",
    payoutFreq: "daily",
    menuItems: [],
  });

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const { auth } = await import("./lib/firebase");
      const { db } = await import("./lib/firebase");
      const { doc, setDoc, serverTimestamp, collection, addDoc } = await import("firebase/firestore");

      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: data.businessName });

      await setDoc(doc(db, "vendors", result.user.uid), {
        uid: result.user.uid,
        email,
        ...data,
        status: "pending",
        role: "vendor",
        rating: 0,
        totalOrders: 0,
        createdAt: serverTimestamp(),
      });

      for (const item of data.menuItems) {
        await addDoc(collection(db, "vendors", result.user.uid, "menu"), {
          ...item,
          vendorId: result.user.uid,
          vendorName: data.businessName,
          available: true,
          createdAt: serverTimestamp(),
        });
      }

      onSuccess({ businessName: data.businessName });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <style>{VENDOR_CSS}</style>

      <div className="auth-hero" style={{ paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: "linear-gradient(135deg,#FF5A1F,#FF8C42)",
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
            PADI for Vendors
          </span>
        </div>

        <div className="h2">Register Your Business</div>
        <p
          style={{
            color: "var(--muted)",
            marginTop: 6,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          Reach hundreds of students on campus. Set up takes less than 5
          minutes.
        </p>
      </div>

      <div className="auth-form" style={{ gap: 0 }}>
        <StepBar step={step} />

        {error && (
          <div className="error-box" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        {step === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <div className="input-wrap">
              <div className="input-label">Business Email *</div>
              <input
                className="input"
                type="email"
                placeholder="business@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-wrap">
              <div className="input-label">Password *</div>
              <input
                className="input"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div
              style={{
                height: 1,
                background: "var(--border)",
                margin: "4px 0",
              }}
            />
          </div>
        )}

        {step === 0 && (
          <Step1 data={data} setData={setData} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <Step2
            data={data}
            setData={setData}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <Step3
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            onBack={() => setStep(1)}
            loading={loading}
          />
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          Already have a vendor account?{" "}
          <span
            style={{ color: "var(--brand)", fontWeight: 600, cursor: "pointer" }}
            onClick={onSwitchToLogin}
          >
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Updated Auth Screen with Student/Vendor Toggle ──────────────────────────
export function AuthScreenWithVendor({
  login,
  register,
  loginWithGoogle,
  error,
  setError,
  onVendorPending,
}) {
  const [mode, setMode] = useState("student");
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendorPending, setVendorPending] = useState(null);

  const handleStudentSubmit = async () => {
    if (!email || !pass) return;

    setLoading(true);
    setError(null);

    if (tab === "login") {
      await login(email, pass);
    } else {
      if (!name) {
        setError("Please enter your name.");
        setLoading(false);
        return;
      }
      await register(name, email, pass, phone);
    }

    setLoading(false);
  };

  if (vendorPending) {
    return (
      <>
        <style>{VENDOR_CSS}</style>
        <VendorPendingScreen vendorName={vendorPending.businessName} />
      </>
    );
  }

  if (mode === "vendor" && tab === "signup") {
    return (
      <VendorRegisterForm
        onSuccess={(info) => setVendorPending(info)}
        onSwitchToLogin={() => setTab("login")}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <style>{VENDOR_CSS}</style>

      <div className="auth-hero">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: "linear-gradient(135deg,#FF5A1F,#FF8C42)",
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
            PADI
          </span>
        </div>

        <div className="v-toggle">
          <div
            className={`v-toggle-tab ${mode === "student" ? "active" : ""}`}
            onClick={() => {
              setMode("student");
              setError(null);
            }}
          >
            🎓 Student
          </div>

          <div
            className={`v-toggle-tab ${mode === "vendor" ? "active vendor" : ""}`}
            onClick={() => {
              setMode("vendor");
              setError(null);
            }}
          >
            🏪 Vendor
          </div>
        </div>

        <div className="h1">
          {mode === "student"
            ? tab === "login"
              ? "Welcome back"
              : "Join PADI"
            : tab === "login"
            ? "Vendor Sign In"
            : "Register Business"}
        </div>

        <p
          style={{
            color: "var(--muted)",
            marginTop: 8,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {mode === "student"
            ? tab === "login"
              ? "Sign in to order food, book rides and more on campus."
              : "Create your account and join thousands of students."
            : tab === "login"
            ? "Sign in to manage your shop and orders."
            : "Start selling to students on campus today."}
        </p>
      </div>

      <div className="auth-form">
        <div className="auth-toggle">
          <div
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => {
              setTab("login");
              setError(null);
            }}
          >
            Sign In
          </div>

          <div
            className={`auth-tab ${tab === "signup" ? "active" : ""}`}
            onClick={() => {
              setTab("signup");
              setError(null);
            }}
          >
            {mode === "vendor" ? "Register Business" : "Create Account"}
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {mode === "student" && tab === "signup" && (
          <>
            <div className="input-wrap">
              <div className="input-label">Full Name</div>
              <input
                className="input"
                placeholder="e.g. Tunde Adeyemi"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="input-wrap">
              <div className="input-label">Phone Number</div>
              <input
                className="input"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="input-wrap">
          <div className="input-label">Email Address</div>
          <input
            className="input"
            type="email"
            placeholder={
              mode === "vendor" ? "business@email.com" : "you@school.edu.ng"
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-wrap">
          <div className="input-label">Password</div>
          <input
            className="input"
            type="password"
            placeholder="Enter your password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStudentSubmit()}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={
            mode === "vendor" && tab === "signup"
              ? () => setMode("vendor")
              : handleStudentSubmit
          }
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : mode === "vendor" && tab === "signup"
            ? "Register My Business →"
            : tab === "login"
            ? "Sign In"
            : "Create Account"}
        </button>

        {mode === "student" && (
          <>
            <div className="or-row">
              <div className="or-line" />
              <span style={{ color: "var(--muted)", fontSize: 13 }}>
                or continue with
              </span>
              <div className="or-line" />
            </div>

            <div
              className="social-btn"
              onClick={async () => {
                setLoading(true);
                await loginWithGoogle();
                setLoading(false);
              }}
            >
              <span style={{ fontWeight: 800, color: "#4285F4" }}>G</span>
              <span>Continue with Google</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}