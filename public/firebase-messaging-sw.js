importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBF82Rda5BPPuDk4GsIbTJuSuZwZBlTYg8",
  authDomain: "padi-app-ddf82.firebaseapp.com",
  projectId: "padi-app-ddf82",
  storageBucket: "padi-app-ddf82.firebasestorage.app",
  messagingSenderId: "548823562188",
  appId: "1:548823562188:web:850301598405b9004d8f69",
});

const messaging = firebase.messaging();

// ── Handle background messages ───────────────────────────────────────────────
messaging.onBackgroundMessage((payload) => {
  console.log("Background notification received:", payload);

  const { title, body } = payload.notification || {};
  const data = payload.data || {};

  self.registration.showNotification(title || "PADI", {
    body: body || "You have a new notification",
    icon: "/padi-icon.png",   // Add a 192x192 icon to your public/ folder
    badge: "/padi-badge.png", // Add a 72x72 badge icon to your public/ folder
    tag: data.orderId || "padi-notification",
    data,
    actions: [
      { action: "open", title: "View" },
      { action: "dismiss", title: "Dismiss" },
    ],
  });
});

// ── Handle notification click ────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const data = event.notification.data || {};
  const screen = data.screen || "";

  const urlMap = {
    track: "/?tab=track",
    orders: "/vendor",
    available: "/rider",
    wallet: "/?tab=wallet",
    home: "/",
  };

  const url = urlMap[screen] || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }

      return null;
    })
  );
});