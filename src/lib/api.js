import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({ baseURL: BASE_URL });

// Automatically attach Firebase token to every request
api.interceptors.request.use(async (config) => {
try {
const { auth } = await import("./firebase");
const user = auth.currentUser;
if (user) {
const token = await user.getIdToken();
config.headers.Authorization = "Bearer " + token;
}
} catch (e) {
console.log("No auth token available");
}
return config;
});

// ── AUTH ──────────────────────────────────────────────
export const registerUser = (data) =>
api.post("/auth/register", data);

export const getProfile = () =>
api.get("/auth/profile");

export const updateProfile = (data) =>
api.put("/auth/profile", data);

// ── ORDERS ────────────────────────────────────────────
export const createOrder = (data) =>
api.post("/orders/create", data);

export const getMyOrders = () =>
api.get("/orders/my-orders");

export const getOrder = (orderId) =>
api.get("/orders/" + orderId);

export const updateOrderStatus = (orderId, status) =>
api.put("/orders/" + orderId + "/status", { status });

export const cancelOrder = (orderId) =>
api.delete("/orders/" + orderId + "/cancel");

// ── WALLET ────────────────────────────────────────────
export const getWalletBalance = () =>
api.get("/wallet/balance");

export const getTransactions = () =>
api.get("/wallet/transactions");

export const topUpWallet = (amount) =>
api.post("/wallet/topup", { amount });

export const transferFunds = (data) =>
api.post("/wallet/transfer", data);

// ── CHAT ──────────────────────────────────────────────
export const getConversations = () =>
api.get("/chat/conversations");

export const getMessages = (conversationId) =>
api.get("/chat/" + conversationId + "/messages");

export const sendMessage = (conversationId, text) =>
api.post("/chat/" + conversationId + "/send", { text });

export const startConversation = (data) =>
api.post("/chat/start", data);

// ── VENDORS ───────────────────────────────────────────
export const getAllVendors = () =>
api.get("/vendor/all");

export const getVendor = (vendorId) =>
api.get("/vendor/" + vendorId);

// ── RIDER ─────────────────────────────────────────────
export const getAvailableOrders = () =>
api.get("/rider/available-orders");

export const acceptDelivery = (orderId) =>
api.post("/rider/accept/" + orderId);

export const confirmDelivery = (orderId) =>
api.put("/rider/deliver/" + orderId);

export default api;