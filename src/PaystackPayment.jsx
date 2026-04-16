// ─────────────────────────────────────────────────────────────────────────────
// PADI — Paystack Payment Integration
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { auth, db } from "./lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const PAY_CSS = `
.pay-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.7);
  backdrop-filter: blur(6px);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn .2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.pay-modal {
  background: var(--surface);
  border-radius: 24px 24px 0 0;
  padding: 28px 24px 40px;
  width: 100%;
  max-width: 430px;
  border-top: 1px solid var(--border);
  animation: slideUp .3s cubic-bezier(.34,1.56,.64,1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.pay-modal-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: var(--border);
  margin: 0 auto 20px;
}

.pay-modal-title {
  font-family: var(--font-head);
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 4px;
}

.pay-modal-sub {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 24px;
}

.pay-amounts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.pay-amount-btn {
  background: var(--surface2);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 14px 8px;
  text-align: center;
  cursor: pointer;
  transition: all .15s;
}

.pay-amount-btn.selected {
  background: rgba(255,90,31,.1);
  border-color: var(--brand);
}

.pay-amount-label {
  font-family: var(--font-head);
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.pay-amount-sub {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
}

.pay-amount-btn.selected .pay-amount-label {
  color: var(--brand);
}

.pay-custom {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface2);
  border: 1.5px solid var(--border);
  border-radius: 13px;
  padding: 0 16px;
  margin-bottom: 20px;
  transition: border-color .15s;
}

.pay-custom:focus-within {
  border-color: var(--brand);
}

.pay-custom-prefix {
  font-size: 16px;
  font-weight: 700;
  color: var(--muted);
}

.pay-custom-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 14px 0;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 16px;
}

.pay-summary {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
}

.pay-summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 5px 0;
}

.pay-summary-row.total {
  border-top: 1px solid var(--border);
  padding-top: 12px;
  margin-top: 6px;
}

.pay-summary-label {
  color: var(--muted);
}

.pay-summary-val {
  font-weight: 600;
}

.pay-btn {
  background: linear-gradient(135deg, var(--brand), var(--brand2));
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 16px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: opacity .15s;
  box-shadow: 0 8px 24px rgba(255,90,31,.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pay-btn:hover {
  opacity: .9;
}

.pay-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.pay-btn-ghost {
  background: var(--surface2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
  transition: all .15s;
}

.pay-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.pay-method {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--surface2);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all .15s;
}

.pay-method.selected {
  border-color: var(--brand);
  background: rgba(255,90,31,.06);
}

.pay-method-icon {
  font-size: 24px;
  width: 36px;
  text-align: center;
}

.pay-method-info {
  flex: 1;
}

.pay-method-name {
  font-weight: 600;
  font-size: 14px;
}

.pay-method-sub {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}

.pay-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--border);
  transition: all .15s;
  flex-shrink: 0;
}

.pay-radio.checked {
  border-color: var(--brand);
  background: var(--brand);
  box-shadow: inset 0 0 0 3px var(--bg);
}

.pay-success {
  text-align: center;
  padding: 20px 0;
}

.pay-success-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(0,192,127,.12);
  border: 2px solid rgba(0,192,127,.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 16px;
  animation: pop .4s cubic-bezier(.34,1.56,.64,1);
}

@keyframes pop {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

.pay-success-title {
  font-family: var(--font-head);
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 6px;
}

.pay-success-sub {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
}

.wallet-balance-card {
  background: linear-gradient(135deg, #1a0a00, #2d0f00);
  border-radius: 20px;
  border: 1px solid rgba(255,90,31,.2);
  padding: 22px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.wallet-balance-card::before {
  content: "";
  position: absolute;
  top: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,90,31,.2) 0%, transparent 70%);
}

.wallet-balance-label {
  font-size: 11px;
  color: rgba(255,255,255,.5);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.wallet-balance-amount {
  font-family: var(--font-head);
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  margin-top: 4px;
}

.otp-box {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 18px;
}

.otp-title {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 6px;
}

.otp-sub {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 12px;
  line-height: 1.5;
}

.otp-input {
  width: 100%;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  color: var(--text);
  font-size: 15px;
  outline: none;
  margin-bottom: 10px;
}

.otp-input:focus {
  border-color: var(--brand);
}

.otp-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.otp-note {
  font-size: 11px;
  color: var(--muted);
  margin-top: 8px;
}

#recaptcha-container {
  margin-top: 12px;
}

`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadPaystack() {
  return new Promise((resolve) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve(window.PaystackPop);
    document.head.appendChild(script);
  });
}

function generateRef(prefix = "PADI") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

async function saveTransaction({
  userId,
  type,
  amount,
  reference,
  status,
  description,
  metadata = {},
}) {
  await addDoc(collection(db, "transactions"), {
    userId,
    type,
    amount,
    reference,
    status,
    description,
    metadata,
    createdAt: serverTimestamp(),
  });
}

async function initiatePaystack({
  email,
  amount,
  reference,
  metadata,
  onSuccess,
  onClose,
}) {
  const PaystackPop = await loadPaystack();

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100,
    ref: reference,
    metadata,
    callback: (response) => onSuccess(response),
    onClose: () => onClose && onClose(),
  });

  handler.openIframe();
}

// ─────────────────────────────────────────────────────────────────────────────
// WALLET TOP-UP MODAL
// ─────────────────────────────────────────────────────────────────────────────

export function WalletTopUpModal({
  user,
  currentBalance = 0,
  onClose,
  onSuccess,
}) {
  const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;
  const isValid = finalAmount >= 100;

  const handleTopUp = async () => {
    if (!isValid || loading) return;

    setLoading(true);
    const reference = generateRef("TOPUP");

    try {
      await initiatePaystack({
        email: user.email,
        amount: finalAmount,
        reference,
        metadata: {
          userId: user.uid,
          type: "wallet_topup",
          custom_fields: [
            {
              display_name: "Student Name",
              variable_name: "student_name",
              value: user.displayName || "Student",
            },
            {
              display_name: "Purpose",
              variable_name: "purpose",
              value: "PADI Wallet Top-up",
            },
          ],
        },
        onSuccess: async (response) => {
          try {
            await updateDoc(doc(db, "users", user.uid), {
              walletBalance: increment(finalAmount),
              updatedAt: serverTimestamp(),
            });

            await saveTransaction({
              userId: user.uid,
              type: "topup",
              amount: finalAmount,
              reference: response.reference,
              status: "success",
              description: "Wallet top-up via Paystack",
              metadata: { paystackRef: response.reference },
            });

            setPaidAmount(finalAmount);
            setSuccess(true);
            onSuccess?.(finalAmount);
          } catch (error) {
            console.error("Failed to update wallet:", error);
          } finally {
            setLoading(false);
          }
        },
        onClose: () => setLoading(false),
      });
    } catch (error) {
      console.error("Payment error:", error);
      setLoading(false);
    }
  };

  return (
    <div
      className="pay-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{PAY_CSS}</style>

      <div className="pay-modal">
        <div className="pay-modal-handle" />

        {success ? (
          <div className="pay-success">
            <div className="pay-success-icon">✓</div>
            <div className="pay-success-title">Top-up Successful!</div>
            <div className="pay-success-sub">
              ₦{paidAmount.toLocaleString()} has been added to your PADI wallet.
              Your new balance is ₦
              {(currentBalance + paidAmount).toLocaleString()}.
            </div>
            <button
              className="pay-btn"
              onClick={onClose}
              style={{ marginTop: 24 }}
            >
              Done ✓
            </button>
          </div>
        ) : (
          <>
            <div className="pay-modal-title">Top Up Wallet 💳</div>
            <div className="pay-modal-sub">
              Current balance: ₦{currentBalance.toLocaleString()}
            </div>

            <div className="pay-amounts">
              {PRESET_AMOUNTS.map((amount) => (
                <div
                  key={amount}
                  className={`pay-amount-btn ${
                    selectedAmount === amount && !customAmount ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                  }}
                >
                  <div className="pay-amount-label">
                    ₦{amount >= 1000 ? `${amount / 1000}k` : amount}
                  </div>
                  <div className="pay-amount-sub">
                    {amount >= 1000
                      ? `${(amount / 1000).toFixed(0)}k naira`
                      : `${amount} naira`}
                  </div>
                </div>
              ))}
            </div>

            <div className="pay-custom">
              <div className="pay-custom-prefix">₦</div>
              <input
                className="pay-custom-input"
                placeholder="Enter custom amount"
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
              />
            </div>

            <div className="pay-summary">
              <div className="pay-summary-row">
                <span className="pay-summary-label">Top-up amount</span>
                <span className="pay-summary-val">
                  ₦{isValid ? finalAmount.toLocaleString() : "0"}
                </span>
              </div>

              <div className="pay-summary-row">
                <span className="pay-summary-label">Processing fee</span>
                <span
                  className="pay-summary-val"
                  style={{ color: "var(--green)" }}
                >
                  Free
                </span>
              </div>

              <div className="pay-summary-row total">
                <span
                  style={{ fontFamily: "var(--font-head)", fontWeight: 700 }}
                >
                  You'll receive
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-head)",
                    fontWeight: 800,
                    color: "var(--brand)",
                  }}
                >
                  ₦{isValid ? finalAmount.toLocaleString() : "0"}
                </span>
              </div>
            </div>

            <button
              className="pay-btn"
              onClick={handleTopUp}
              disabled={!isValid || loading}
            >
              {loading
                ? "Processing..."
                : `Pay ₦${isValid ? finalAmount.toLocaleString() : "0"} via Paystack`}
            </button>

            <button className="pay-btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT PAYMENT MODAL
// ─────────────────────────────────────────────────────────────────────────────

export function CheckoutPaymentModal({
  user,
  cart = [],
  total,
  onClose,
  onOrderPlaced,
}) {
  const [payMethod, setPayMethod] = useState("paystack");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [checkoutProfile, setCheckoutProfile] = useState(null);

const HIGH_VALUE_THRESHOLD = 10000; 

  useEffect(() => {
    if (!user?.uid) return;

    getDoc(doc(db, "users", user.uid)).then((snapshot) => {
      if (snapshot.exists()) {
        setWalletBalance(snapshot.data().walletBalance || 0);
      }
    });
  }, [user?.uid]);

  useEffect(() => {
  if (!user?.uid) return;

  getDoc(doc(db, "users", user.uid)).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      setCheckoutProfile(data);
      setPhoneNumber(data.phoneNumber || data.phone || "");
      setOtpVerified(Boolean(data.phoneVerified));
    }
  });
}, [user?.uid]);

  const DELIVERY_FEE = 300;
  const PROMO = 150;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const orderTotal = subtotal + DELIVERY_FEE - PROMO;
  const requiresOTP =
    !checkoutProfile?.phoneVerified || orderTotal >= HIGH_VALUE_THRESHOLD;
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
       auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {},
      }
    );
  }
  

  return window.recaptchaVerifier;
};
  const handleSendOtp = async () => {
    if (!phoneNumber) {
      alert("Please add your phone number first.");
      return;
    }

    try {
      setOtpLoading(true);

      const appVerifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

      setConfirmationResult(result);
      setOtpSent(true);
    } catch (error) {
      console.error("OTP send failed:", error);
      alert("Failed to send OTP. Check the number format.");
    } finally {
      setOtpLoading(false);
    }
};

  const handleVerifyOtp = async () => {
    if (!confirmationResult || !otpCode) return;

    try {
      setOtpLoading(true);

      await confirmationResult.confirm(otpCode);

    await updateDoc(doc(db, "users", user.uid), {
      phoneNumber,
      phoneVerified: true,
      phoneVerifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setOtpVerified(true);
    setOtpSent(false);
    setOtpCode("");
    setCheckoutProfile((prev) => ({
      ...prev,
      phoneNumber,
      phoneVerified: true,
    }));
  } catch (error) {
    console.error("OTP verification failed:", error);
    alert("Invalid OTP code.");
  } finally {
    setOtpLoading(false);
  }
};

  const PAY_METHODS = [
    {
      key: "paystack",
      icon: "💳",
      name: "Card / Bank Transfer",
      sub: "Pay securely via Paystack",
      available: true,
    },
    {
      key: "wallet",
      icon: "👛",
      name: "PADI Wallet",
      sub: `Balance: ₦${walletBalance.toLocaleString()}`,
      available: walletBalance >= orderTotal,
    },
    {
      key: "cash",
      icon: "💵",
      name: "Cash on Delivery",
      sub: "Pay when your order arrives",
      available: true,
    },
  ];

  const handlePaystackPayment = async () => {
    setLoading(true);
    const reference = generateRef("ORDER");

    try {
      await initiatePaystack({
        email: user.email,
        amount: orderTotal,
        reference,
        metadata: {
          userId: user.uid,
          type: "order_payment",
          custom_fields: [
            {
              display_name: "Order Items",
              variable_name: "items",
              value: cart.map((item) => `${item.qty}x ${item.name}`).join(", "),
            },
          ],
        },
        onSuccess: async (response) => {
          try {
            await saveTransaction({
              userId: user.uid,
              type: "payment",
              amount: orderTotal,
              reference: response.reference,
              status: "success",
              description: "Order payment",
              metadata: { items: cart, paystackRef: response.reference },
            });

            setSuccess(true);
            onOrderPlaced?.({
              paymentMethod: "paystack",
              reference: response.reference,
            });
          } finally {
            setLoading(false);
          }
        },
        onClose: () => setLoading(false),
      });
    } catch (error) {
      console.error("Paystack payment failed:", error);
      setLoading(false);
    }
  };

  const handleWalletPayment = async () => {
    if (walletBalance < orderTotal) return;

    setLoading(true);

    try {
      const reference = generateRef("WALLET");

      await updateDoc(doc(db, "users", user.uid), {
        walletBalance: increment(-orderTotal),
        updatedAt: serverTimestamp(),
      });

      await saveTransaction({
        userId: user.uid,
        type: "payment",
        amount: orderTotal,
        reference,
        status: "success",
        description: "Order payment via wallet",
        metadata: { items: cart },
      });

      setSuccess(true);
      onOrderPlaced?.({ paymentMethod: "wallet", reference });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    setLoading(true);

    try {
      const reference = generateRef("CASH");

      await saveTransaction({
        userId: user.uid,
        type: "payment",
        amount: orderTotal,
        reference,
        status: "pending",
        description: "Cash on delivery",
        metadata: { items: cart },
      });

      setSuccess(true);
      onOrderPlaced?.({ paymentMethod: "cash", reference });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    if (requiresOtp && !otpVerified) {
      alert("Verify your phone number before checkout.");
      return;
    }

  if (payMethod === "paystack") handlePaystackPayment();
  else if (payMethod === "wallet") handleWalletPayment();
  else if (payMethod === "cash") handleCashPayment();
};

  return (
    <div
      className="pay-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <style>{PAY_CSS}</style>

      <div className="pay-modal">
        <div className="pay-modal-handle" />

        {success ? (
          <div className="pay-success">
            <div className="pay-success-icon">✓</div>
            <div className="pay-success-title">Order Placed! 🎉</div>
            <div className="pay-success-sub">
              Your order has been confirmed and sent to the vendor. Track it in
              real-time!
            </div>
            <button
              className="pay-btn"
              onClick={onClose}
              style={{ marginTop: 24 }}
            >
              Track Order 📍
            </button>
          </div>
        ) : (
          <>
            <div className="pay-modal-title">Complete Payment</div>
            <div className="pay-modal-sub">Choose how you want to pay</div>
            {requiresOtp && !otpVerified && (
  <div className="otp-box">
    <div className="otp-title">Phone Verification Required 📱</div>
    <div className="otp-sub">
      Verify your phone number before checkout.
      {!checkoutProfile?.phoneVerified && " This is required for your first checkout."}
      {orderTotal >= HIGH_VALUE_THRESHOLD && " This order is marked as high value."}
    </div>

    <input
      className="otp-input"
      placeholder="Phone number e.g. +2348012345678"
      value={phoneNumber}
      onChange={(e) => setPhoneNumber(e.target.value)}
    />

    {!otpSent ? (
      <div className="otp-actions">
        <button
          className="pay-btn"
          type="button"
          onClick={handleSendOtp}
          disabled={otpLoading || !phoneNumber}
        >
          {otpLoading ? "Sending OTP..." : "Send OTP"}
        </button>
      </div>
    ) : (
      <>
        <input
          className="otp-input"
          placeholder="Enter OTP code"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
        />

        <div className="otp-actions">
          <button
            className="pay-btn"
            type="button"
            onClick={handleVerifyOtp}
            disabled={otpLoading || !otpCode}
          >
            {otpLoading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            className="pay-btn-ghost"
            type="button"
            onClick={handleSendOtp}
            disabled={otpLoading}
          >
            Resend OTP
          </button>
        </div>
      </>
    )}

    <div className="otp-note">
      Use international format for now, e.g. +2348012345678
    </div>

    <div id="recaptcha-container" />
  </div>
)}

            <div className="pay-summary">
              {cart.map((item, index) => (
                <div className="pay-summary-row" key={index}>
                  <span className="pay-summary-label">
                    {item.qty}x {item.name}
                  </span>
                  <span className="pay-summary-val">
                    ₦{(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="pay-summary-row">
                <span className="pay-summary-label">Delivery fee</span>
                <span className="pay-summary-val">₦{DELIVERY_FEE}</span>
              </div>

              <div className="pay-summary-row">
                <span className="pay-summary-label">Promo (PADI50)</span>
                <span
                  className="pay-summary-val"
                  style={{ color: "var(--green)" }}
                >
                  -₦{PROMO}
                </span>
              </div>

              <div className="pay-summary-row total">
                <span
                  style={{ fontFamily: "var(--font-head)", fontWeight: 700 }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-head)",
                    fontWeight: 800,
                    color: "var(--brand)",
                  }}
                >
                  ₦{orderTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pay-methods">
              {PAY_METHODS.map((method) => (
                <div
                  key={method.key}
                  className={`pay-method ${
                    payMethod === method.key ? "selected" : ""
                  }`}
                  onClick={() => method.available && setPayMethod(method.key)}
                  style={{ opacity: method.available ? 1 : 0.5 }}
                >
                  <div className="pay-method-icon">{method.icon}</div>
                  <div className="pay-method-info">
                    <div className="pay-method-name">{method.name}</div>
                    <div className="pay-method-sub">{method.sub}</div>
                  </div>
                  <div
                    className={`pay-radio ${
                      payMethod === method.key ? "checked" : ""
                    }`}
                  />
                </div>
              ))}
            </div>

            <button
               className="pay-btn"
               onClick={handlePay}
               disabled={loading || (requiresOtp && !otpVerified)}
        >
              {loading
                ? "Processing..."
                : payMethod === "cash"
                ? "Confirm Order — Pay on Delivery"
                : `Pay ₦${orderTotal.toLocaleString()}`}
            </button>

            <button
              className="pay-btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REAL WALLET SCREEN
// ─────────────────────────────────────────────────────────────────────────────

export function RealWalletScreen({ user, showToast }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showTopUp, setShowTopUp] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setBalance(snapshot.data().walletBalance || 0);
      }
    });

    return unsubscribe;
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      setTransactions(
        snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }))
      );
    });

    return unsubscribe;
  }, [user?.uid]);

  return (
    <>
      <style>{PAY_CSS}</style>

      <div className="screen">
        <div className="listing-header">
          <div className="h3">My Wallet</div>
        </div>

        <div style={{ margin: "0 20px 20px" }}>
          <div className="wallet-balance-card">
            <div className="wallet-balance-label">Available Balance</div>
            <div className="wallet-balance-amount">
              ₦{balance.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,.4)",
                marginTop: 4,
              }}
            >
              PADI Wallet
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={() => setShowTopUp(true)}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,.1)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Top Up
              </button>

              <button
                onClick={() => showToast("Coming soon!")}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,.08)",
                  color: "rgba(255,255,255,.7)",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 10,
                  padding: "10px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>
          <div className="label" style={{ marginBottom: 12 }}>
            Transaction History
          </div>

          {transactions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              No transactions yet. Top up your wallet to get started!
            </div>
          ) : (
            transactions.map((tx) => (
              <div className="tx-item" key={tx.id}>
                <div
                  className={`tx-icon ${
                    tx.type === "topup" ? "tx-credit" : "tx-debit"
                  }`}
                >
                  {tx.type === "topup"
                    ? "💰"
                    : tx.type === "payment"
                    ? "🛒"
                    : "💵"}
                </div>

                <div className="tx-info">
                  <div className="tx-name">{tx.description}</div>
                  <div className="tx-date">
                    {tx.createdAt?.toDate?.()?.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) || "Recently"}
                  </div>
                </div>

                <div
                  className={`tx-amount ${
                    tx.type === "topup" ? "credit" : "debit"
                  }`}
                >
                  {tx.type === "topup" ? "+" : "-"}₦
                  {tx.amount?.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showTopUp && (
        <WalletTopUpModal
          user={user}
          currentBalance={balance}
          onClose={() => setShowTopUp(false)}
          onSuccess={(amount) => {
            setShowTopUp(false);
            showToast(`₦${amount.toLocaleString()} added to wallet!`);
          }}
        />
      )}
    </>
  );
}