// Frontend-safe verification helpers for calling PADI backend

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// ── Email verification ────────────────────────────────────────────────────────
export async function sendEmailVerificationCode({ email, name }) {
  return apiRequest("/auth/send-email-code", {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });
}

export async function verifyEmailVerificationCode({ email, code }) {
  return apiRequest("/auth/verify-email-code", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

// ── Checkout phone OTP ────────────────────────────────────────────────────────
export async function sendCheckoutPhoneOtp({
  token,
  phoneNumber,
  orderTotal,
}) {
  return apiRequest("/auth/send-checkout-otp", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phoneNumber, orderTotal }),
  });
}

export async function verifyCheckoutPhoneOtp({
  token,
  phoneNumber,
  code,
  orderTotal,
}) {
  return apiRequest("/auth/verify-checkout-otp", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phoneNumber, code, orderTotal }),
  });
}