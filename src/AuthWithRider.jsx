import { useState } from "react";
import { RiderRegisterForm } from "./RiderDashboard";
import { VendorRegisterForm } from "./VendorAuth";

export function AuthScreenWithRider({
  login,
  register,
  loginWithGoogle,
  error,
  setError,
}) {
  const [mode, setMode] = useState("student"); // "student" | "vendor" | "rider"
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendorPending, setVendorPending] = useState(null);
  const [showRiderRegister, setShowRiderRegister] = useState(false);
  const [riderRegistered, setRiderRegistered] = useState(null);

  const resetError = () => setError(null);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    resetError();
  };

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    resetError();
  };

  const handleStudentSubmit = async () => {
    if (!email || !pass) return;

    setLoading(true);
    setError(null);

    try {
      if (tab === "login") {
        await login(email, pass);
      } else {
        if (!name) {
          setError("Please enter your name.");
          return;
        }

        await register(name, email, pass, phone);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  const pageTitle =
    mode === "student"
      ? tab === "login"
        ? "Welcome back"
        : "Join PADI"
      : mode === "vendor"
      ? tab === "login"
        ? "Vendor Sign In"
        : "Register Business"
      : tab === "login"
      ? "Rider Sign In"
      : "Become a Rider";

  const pageSubtitle =
    mode === "student"
      ? tab === "login"
        ? "Sign in to order food, book rides and more."
        : "Create your account and join thousands of students."
      : mode === "vendor"
      ? tab === "login"
        ? "Sign in to manage your shop and orders."
        : "Start selling to students on campus today."
      : tab === "login"
      ? "Sign in to see available deliveries."
      : "Earn ₦300 per delivery. Join the PADI network.";

  const emailPlaceholder =
    mode === "vendor"
      ? "business@email.com"
      : mode === "rider"
      ? "your@email.com"
      : "you@school.edu.ng";

  const signupLabel =
    mode === "vendor"
      ? "Register Business"
      : mode === "rider"
      ? "Become a Rider"
      : "Create Account";

  if (showRiderRegister) {
    
    return (
      <RiderRegisterForm
        onSuccess={(info) => {
          setRiderRegistered(info);
          setShowRiderRegister(false);
        }}
      />
    );
  }

  if (riderRegistered) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 40,
            maxWidth: 400,
            textAlign: "center",
          }}
        >
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
            <strong>{riderRegistered.name}</strong>, your rider application is
            under review. You'll be notified within 24–48 hours!
          </div>

          <button
            className="btn btn-ghost"
            style={{ width: "100%" }}
            onClick={() => {
              setRiderRegistered(null);
              setMode("student");
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (vendorPending) {
    return (
      <>
        <style>{`
          .v-pending {
            text-align: center;
            padding: 40px 24px;
          }

          .v-pending-icon {
            width: 80px;
            height: 80px;
            border-radius: 24px;
            background: rgba(255, 90, 31, 0.1);
            border: 2px solid rgba(255, 90, 31, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            margin: 0 auto 16px;
          }

          .v-pending-title {
            font-family: var(--font-head);
            font-size: 22px;
            font-weight: 800;
            margin-bottom: 8px;
          }

          .v-pending-sub {
            font-size: 14px;
            color: var(--muted);
            line-height: 1.6;
          }

          .v-pending-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 193, 7, 0.12);
            border: 1px solid rgba(255, 193, 7, 0.3);
            border-radius: 100px;
            padding: 6px 14px;
            font-size: 13px;
            font-weight: 600;
            color: #ffc107;
            margin: 16px 0;
          }
        `}</style>

        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div className="v-pending">
            <div className="v-pending-icon">🏪</div>
            <div className="v-pending-title">You're almost live!</div>

            <div className="v-pending-sub">
              <strong>{vendorPending.businessName}</strong> has been submitted.
              Our team will review it shortly.
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
          </div>
        </div>
      </>
    );
  }

  if (mode === "vendor" && tab === "signup") {
    
    return (
      <VendorRegisterForm
        onSuccess={(info) => setVendorPending(info)}
        onSwitchToLogin={() => {
          setTab("login");
          setMode("vendor");
        }}
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
      <div className="auth-hero">
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
              background: "linear-gradient(135deg, #FF5A1F, #FF8C42)",
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

        <div
          style={{
            display: "flex",
            background: "var(--surface2)",
            borderRadius: 14,
            padding: 4,
            marginBottom: 20,
          }}
        >
          {[
            { key: "student", label: "🎓 Student" },
            { key: "vendor", label: "🏪 Vendor" },
            { key: "rider", label: "🛵 Rider" },
          ].map((item) => {
            const isActive = mode === item.key;

            const activeBackground =
              item.key === "student"
                ? "var(--surface)"
                : item.key === "vendor"
                ? "linear-gradient(135deg, #FF5A1F, #FF8C42)"
                : "linear-gradient(135deg, #7C3AED, #A855F7)";

            return (
              <div
                key={item.key}
                onClick={() => handleModeChange(item.key)}
                style={{
                  flex: 1,
                  padding: "10px 4px",
                  borderRadius: 11,
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all .2s",
                  background: isActive ? activeBackground : "transparent",
                  color: isActive
                    ? item.key === "student"
                      ? "var(--text)"
                      : "#fff"
                    : "var(--muted)",
                  boxShadow: isActive ? "0 2px 8px rgba(0,0,0,.3)" : "none",
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>

        <div className="h1">{pageTitle}</div>

        <p
          style={{
            color: "var(--muted)",
            marginTop: 8,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {pageSubtitle}
        </p>
      </div>

      <div className="auth-form">
        <div className="auth-toggle">
          <div
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => handleTabChange("login")}
          >
            Sign In
          </div>

          <div
            className={`auth-tab ${tab === "signup" ? "active" : ""}`}
            onClick={() => handleTabChange("signup")}
          >
            {signupLabel}
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {mode === "rider" && tab === "signup" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "rgba(124,58,237,.08)",
                border: "1px solid rgba(124,58,237,.2)",
                borderRadius: 12,
                padding: "14px 16px",
                fontSize: 13,
                color: "#A855F7",
                lineHeight: 1.6,
              }}
            >
              🛵 Earn <strong>₦300 per delivery</strong> on campus. Registration
              takes about 3 minutes and requires your vehicle info and guarantor
              details.
            </div>

            <button
              className="btn btn-primary"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                boxShadow: "0 8px 24px rgba(124,58,237,.3)",
              }}
              onClick={() => setShowRiderRegister(true)}
            >
              Start Rider Application →
            </button>
          </div>
        ) : (
          <>
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
                placeholder={emailPlaceholder}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleStudentSubmit();
                }}
              />
            </div>

            <button
              className="btn btn-primary"
              style={
                mode === "rider"
                  ? {
                      background:
                        "linear-gradient(135deg, #7C3AED, #A855F7)",
                      boxShadow: "0 8px 24px rgba(124,58,237,.3)",
                    }
                  : {}
              }
              onClick={handleStudentSubmit}
              disabled={loading}
            >
              {loading
                ? "Please wait..."
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

                <div className="social-btn" onClick={handleGoogleLogin}>
                  <span style={{ fontWeight: 800, color: "#4285F4" }}>G</span>
                  <span>Continue with Google</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}