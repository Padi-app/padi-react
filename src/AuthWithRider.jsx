import { useState } from "react";
import { useAuth } from "./lib/AuthContext";
import { VendorRegisterForm } from "./VendorAuth";
import { RiderRegisterForm } from "./RiderDashboard";
import { NIGERIAN_UNIVERSITIES } from "./lib/universities";

const AUTH_CSS = `
.uni-select-wrap {
  position: relative;
}

.uni-search {
  background: var(--surface2);
  border: 1.5px solid var(--border);
  border-radius: 13px;
  padding: 14px 16px;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 15px;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
}

.uni-search:focus {
  border-color: var(--brand);
}

.uni-dropdown {
  background: var(--surface2);
  border: 1.5px solid var(--brand);
  border-top: none;
  border-radius: 0 0 13px 13px;
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  width: 100%;
  z-index: 50;
  top: 48px;
}

.uni-option {
  padding: 11px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border);
}

.uni-option:hover {
  background: var(--surface);
}

.uni-option-name {
  font-weight: 600;
  color: var(--text);
}

.uni-option-meta {
  font-size: 11px;
  color: var(--muted);
  margin-top: 1px;
}

.uni-selected {
  background: var(--surface2);
  border: 1.5px solid var(--green);
  border-radius: 13px;
  padding: 13px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.otp-wrap {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 8px 0;
}

.otp-digit {
  width: 46px;
  height: 54px;
  border-radius: 12px;
  background: var(--surface2);
  border: 1.5px solid var(--border);
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s;
}

.otp-digit:focus {
  border-color: var(--brand);
}

.otp-digit.filled {
  border-color: var(--green);
}

.signup-step-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
}

.signup-step-pill {
  flex: 1;
  height: 4px;
  border-radius: 2px;
}

.signup-step-pill.done {
  background: var(--green);
}

.signup-step-pill.active {
  background: var(--brand);
}

.signup-step-pill.pending {
  background: var(--border);
}
`;

// ── University selector ───────────────────────────────────────────────────────
export function UniversitySelector({
  value,
  onChange,
  placeholder = "Search your university...",
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selected = NIGERIAN_UNIVERSITIES.find((u) => u.name === value);

  const filtered = NIGERIAN_UNIVERSITIES.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.shortName.toLowerCase().includes(q) ||
      u.state.toLowerCase().includes(q)
    );
  }).slice(0, 15);

  if (selected) {
    return (
      <div className="uni-selected" onClick={() => onChange("")}>
        <div>
          <div>
            {selected.shortName} — {selected.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              marginTop: 2,
            }}
          >
            {selected.state} · {selected.type}
          </div>
        </div>
        <span style={{ color: "var(--muted)", fontSize: 18 }}>✕</span>
      </div>
    );
  }

  return (
    <div className="uni-select-wrap">
      <input
        className="uni-search"
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />

      {open && search.length > 0 && filtered.length > 0 && (
        <div className="uni-dropdown">
          {filtered.map((u) => (
            <div
              key={u.name}
              className="uni-option"
              onClick={() => {
                onChange(u.name);
                setSearch("");
                setOpen(false);
              }}
            >
              <div className="uni-option-name">
                {u.shortName} — {u.name}
              </div>
              <div className="uni-option-meta">
                {u.state} · {u.type} University
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── OTP input ─────────────────────────────────────────────────────────────────
function OTPInput({ value, onChange, onComplete }) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const focusInput = (index) => {
    const el = document.getElementById(`otp-${index}`);
    if (el) el.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const nextDigits = [...digits];

      if (nextDigits[index]) {
        nextDigits[index] = "";
        onChange(nextDigits.join(""));
        return;
      }

      if (index > 0) {
        nextDigits[index - 1] = "";
        onChange(nextDigits.join(""));
        focusInput(index - 1);
      }
      return;
    }

    if (!/^[0-9]$/.test(e.key)) return;

    e.preventDefault();
    const nextDigits = [...digits];
    nextDigits[index] = e.key;
    const newValue = nextDigits.join("");

    onChange(newValue);

    if (index < 5) {
      focusInput(index + 1);
    }

    if (newValue.length === 6) {
      onComplete?.(newValue);
    }
  };

  return (
    <div className="otp-wrap">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          id={`otp-${i}`}
          className={`otp-digit ${digits[i] ? "filled" : ""}`}
          maxLength={1}
          value={digits[i]}
          onChange={() => {}}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
        />
      ))}
    </div>
  );
}

// ── Student signup ────────────────────────────────────────────────────────────
function StudentSignup() {
  const { register, requestOTP, confirmOTP, error, setError } = useAuth();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!name || !email || !pass) {
      setError("Please fill all required fields.");
      return;
    }

    if (pass.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await requestOTP(email, name);

    if (result?.success) {
      setStep(1);
      startTimer();
    }

    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await confirmOTP(email, otp);

    if (result?.success) {
      setStep(2);
    }

    setLoading(false);
  };

  const handleFinish = async () => {
    if (!university) {
      setError("Please select your university.");
      return;
    }

    setLoading(true);
    setError(null);

    await register(name, email, pass, phone, university);

    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="signup-step-bar">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`signup-step-pill ${
              i < step ? "done" : i === step ? "active" : "pending"
            }`}
          />
        ))}
      </div>

      {error && <div className="error-box">{error}</div>}

      {step === 0 && (
        <>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            Your Details
          </div>

          <div className="input-wrap">
            <div className="input-label">Full Name *</div>
            <input
              className="input"
              placeholder="e.g. Tunde Adeyemi"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-wrap">
            <div className="input-label">Email Address *</div>
            <input
              className="input"
              type="email"
              placeholder="any email — gmail, yahoo, etc."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-wrap">
            <div className="input-label">Password *</div>
            <input
              className="input"
              type="password"
              placeholder="Minimum 6 characters"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>

          <div className="input-wrap">
            <div className="input-label">Phone Number</div>
            <input
              className="input"
              placeholder="08012345678 (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSendOTP}
            disabled={loading || !name || !email || !pass}
          >
            {loading ? "Sending code…" : "Send Verification Code →"}
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            Verify Your Email ✉️
          </div>

          <div
            style={{
              fontSize: 13,
              color: "var(--muted)",
              lineHeight: 1.5,
            }}
          >
            Enter the 6-digit code sent to{" "}
            <strong style={{ color: "var(--text)" }}>{email}</strong>
          </div>

          <OTPInput value={otp} onChange={setOtp} onComplete={handleVerifyOTP} />

          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              textAlign: "center",
            }}
          >
            {timer > 0 ? (
              `Resend in ${timer}s`
            ) : (
              <span
                style={{ color: "var(--brand)", cursor: "pointer" }}
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  await requestOTP(email, name);
                  startTimer();
                  setOtp("");
                  setLoading(false);
                }}
              >
                Resend code
              </span>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying…" : "Verify Code →"}
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => {
              setStep(0);
              setOtp("");
              setError(null);
            }}
          >
            ← Back
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            Your University 🎓
          </div>

          <div
            style={{
              fontSize: 13,
              color: "var(--muted)",
              lineHeight: 1.5,
            }}
          >
            Select your campus to see vendors and riders near you.
          </div>

          <div className="input-wrap">
            <div className="input-label">University *</div>
            <UniversitySelector value={university} onChange={setUniversity} />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleFinish}
            disabled={loading || !university}
          >
            {loading ? "Creating account…" : "Create My Account 🎉"}
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => {
              setStep(1);
              setError(null);
            }}
            disabled={loading}
          >
            ← Back
          </button>
        </>
      )}
    </div>
  );
}

// ── Main exported auth screen ─────────────────────────────────────────────────
export function AuthScreenWithRider({
  login,
  loginWithGoogle,
  error,
  setError,
}) {
  const [mode, setMode] = useState("student");
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendorPending, setVendorPending] = useState(null);
  const [showRiderReg, setShowRiderReg] = useState(false);
  const [riderDone, setRiderDone] = useState(null);

  const handleLogin = async () => {
    if (!email || !pass) return;

    setLoading(true);
    setError(null);
    await login(email, pass);
    setLoading(false);
  };

  if (showRiderReg) {
    return (
      <RiderRegisterForm
        onSuccess={(info) => {
          setRiderDone(info);
          setShowRiderReg(false);
        }}
      />
    );
  }

  if (riderDone) {
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
            <strong>{riderDone.name}</strong>, the admin has been notified.
            You’ll get an email once approved!
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setRiderDone(null);
              setMode("student");
              setTab("login");
            }}
            style={{ width: "100%" }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (vendorPending) {
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            Submitted!
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--muted)",
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            <strong>{vendorPending.businessName}</strong> is under review.
            You’ll get an email on approval!
          </div>
          <div
            style={{
              background: "rgba(255,193,7,.08)",
              border: "1px solid rgba(255,193,7,.2)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              color: "#FFC107",
              marginBottom: 16,
            }}
          >
            ⏱ Review: 24–48 hours
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setVendorPending(null);
              setMode("student");
              setTab("login");
            }}
            style={{ width: "100%" }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
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
      <style>{AUTH_CSS}</style>

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
          ].map((m) => (
            <div
              key={m.key}
              onClick={() => {
                setMode(m.key);
                setError(null);
              }}
              style={{
                flex: 1,
                padding: "10px 4px",
                borderRadius: 11,
                textAlign: "center",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                transition: "all .2s",
                background:
                  mode === m.key
                    ? m.key === "student"
                      ? "var(--surface)"
                      : m.key === "vendor"
                      ? "linear-gradient(135deg,#FF5A1F,#FF8C42)"
                      : "linear-gradient(135deg,#7C3AED,#A855F7)"
                    : "transparent",
                color: mode === m.key ? "#fff" : "var(--muted)",
                boxShadow:
                  mode === m.key ? "0 2px 8px rgba(0,0,0,.3)" : "none",
              }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="h1">
          {mode === "student"
            ? tab === "login"
              ? "Welcome back"
              : "Join PADI"
            : mode === "vendor"
            ? tab === "login"
              ? "Vendor Sign In"
              : "Register Business"
            : tab === "login"
            ? "Rider Sign In"
            : "Become a Rider"}
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
              ? "Order food, rides and more on your campus."
              : "Sign up with any email. No school email needed!"
            : mode === "vendor"
            ? tab === "login"
              ? "Manage your shop and orders."
              : "Reach students across Nigeria."
            : tab === "login"
            ? "Sign in to your rider account."
            : "Earn ₦300 per delivery."}
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
            {mode === "vendor"
              ? "Register Business"
              : mode === "rider"
              ? "Become a Rider"
              : "Create Account"}
          </div>
        </div>

        {error && tab === "login" && <div className="error-box">{error}</div>}

        {mode === "student" && tab === "signup" && <StudentSignup />}

        {mode === "rider" && tab === "signup" && (
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
              takes ~3 minutes.
            </div>

            <button
              className="btn btn-primary"
              style={{
                background: "linear-gradient(135deg,#7C3AED,#A855F7)",
                boxShadow: "0 8px 24px rgba(124,58,237,.3)",
              }}
              onClick={() => setShowRiderReg(true)}
            >
              Start Rider Application →
            </button>
          </div>
        )}

        {tab === "login" && (
          <>
            <div className="input-wrap">
              <div className="input-label">Email Address</div>
              <input
                className="input"
                type="email"
                placeholder="your@email.com"
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
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <button
              className="btn btn-primary"
              style={
                mode === "rider"
                  ? { background: "linear-gradient(135deg,#7C3AED,#A855F7)" }
                  : {}
              }
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Please wait…" : "Sign In"}
            </button>

            {mode === "student" && (
              <>
                <div className="or-row">
                  <div className="or-line" />
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>
                    or
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
          </>
        )}
      </div>
    </div>
  );
}