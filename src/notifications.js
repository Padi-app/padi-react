import { messaging, db, auth } from "./lib/firebase";
import {
getToken,
onMessage,
} from "firebase/messaging";
import {
doc,
updateDoc,
collection,
addDoc,
serverTimestamp,
query,
where,
getDocs,
} from "firebase/firestore";

const VAPID_KEY = "BHXvanz8oXad8HhpHsV1IYKIzoVH5utOXc9FZTBbHAzwtMigNDVzTmTu9g96217gh99dPey3Qaxy-8kTXEhe5KY";

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST PERMISSION + GET FCM TOKEN
// Call this once after user logs in
// ─────────────────────────────────────────────────────────────────────────────
export async function requestNotificationPermission(userId, role = "student") {
try {
// Ask user for permission
const permission = await Notification.requestPermission();
if (permission !== "granted") {
console.log("Notification permission denied");
return null;
}

```
// Get FCM token
const token = await getToken(messaging, { vapidKey: VAPID_KEY });
if (!token) return null;

// Save token to correct Firestore collection based on role
const collectionName =
  role === "vendor" ? "vendors" :
  role === "rider" ? "riders" : "users";

await updateDoc(doc(db, collectionName, userId), {
  fcmToken: token,
  notificationsEnabled: true,
  tokenUpdatedAt: serverTimestamp(),
});

console.log("FCM token saved for", role, userId);
return token;
```

} catch (error) {
console.error("Failed to get notification permission:", error);
return null;
}
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTEN FOR FOREGROUND MESSAGES
// Call this in your app root to handle notifications when app is open
// ─────────────────────────────────────────────────────────────────────────────
export function listenForMessages(onNotification) {
if (!messaging) return;
return onMessage(messaging, (payload) => {
console.log("Foreground notification:", payload);
onNotification && onNotification({
title: payload.notification?.title || "PADI",
body: payload.notification?.body || "",
data: payload.data || {},
});
});
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE NOTIFICATION TO FIRESTORE
// Creates a record so users can see notification history
// ─────────────────────────────────────────────────────────────────────────────
export async function saveNotification({ userId, title, body, type, data = {} }) {
try {
await addDoc(collection(db, "notifications"), {
userId,
title,
body,
type,       // "order" | "payment" | "system" | "promo"
data,
read: false,
createdAt: serverTimestamp(),
});
} catch (e) {
console.error("Failed to save notification:", e);
}
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION TRIGGERS
// Call these at the right moments in your app
// ─────────────────────────────────────────────────────────────────────────────

// When student places an order → notify vendor
export async function notifyVendorNewOrder({ vendorId, orderId, studentName, items }) {
await saveNotification({
userId: vendorId,
title: "🔔 New Order!",
body: `${studentName} just placed an order. Tap to view.`,
type: "order",
data: { orderId, screen: "orders" },
});
}

// When vendor accepts order → notify student
export async function notifyStudentOrderAccepted({ studentId, vendorName, orderId }) {
await saveNotification({
userId: studentId,
title: "✅ Order Accepted!",
body: `${vendorName} accepted your order and is preparing it now.`,
type: "order",
data: { orderId, screen: "track" },
});
}

// When vendor marks order ready → notify available riders
export async function notifyRidersOrderReady({ orderId, vendorName, deliveryAddress }) {
try {
// Get all online approved riders
const q = query(
collection(db, "riders"),
where("status", "==", "active"),
where("isOnline", "==", true)
);
const snap = await getDocs(q);

for (const riderDoc of snap.docs) {
  await saveNotification({
    userId: riderDoc.id,
    title: "📦 New Delivery Available!",
    body: `Pickup from ${vendorName} → ${deliveryAddress}. ₦300 earning.`,
    type: "order",
    data: { orderId, screen: "available" },
  });
}

} catch (e) {
console.error("Failed to notify riders:", e);
}
}

// When rider picks up order → notify student
export async function notifyStudentRiderAssigned({ studentId, riderName, orderId }) {
await saveNotification({
userId: studentId,
title: "🛵 Rider on the way!",
body: `${riderName} has picked up your order. Track it live!`,
type: "order",
data: { orderId, screen: "track" },
});
}

// When order is delivered → notify student
export async function notifyStudentOrderDelivered({ studentId, vendorName, orderId }) {
await saveNotification({
userId: studentId,
title: "🎉 Order Delivered!",
body: `Your order from ${vendorName} has been delivered. Enjoy!`,
type: "order",
data: { orderId, screen: "home" },
});
}

// When admin approves vendor
export async function notifyVendorApproved({ vendorId, businessName }) {
await saveNotification({
userId: vendorId,
title: "🏪 Your shop is live!",
body: `${businessName} has been approved! Students can now order from you.`,
type: "system",
data: { screen: "overview" },
});
}

// When admin approves rider
export async function notifyRiderApproved({ riderId, riderName }) {
await saveNotification({
userId: riderId,
title: "🛵 You’re approved!",
body: `Welcome ${riderName}! Go online to start earning ₦300 per delivery.`,
type: "system",
data: { screen: "available" },
});
}

// When wallet is topped up
export async function notifyWalletTopUp({ userId, amount }) {
await saveNotification({
userId,
title: "💳 Wallet Top-up Successful!",
body: `₦${Number(amount).toLocaleString()} has been added to your PADI wallet.`,
type: "payment",
data: { screen: "wallet" },
});
}