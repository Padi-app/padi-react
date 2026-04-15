import { useState, useEffect } from "react";
import { db } from "./lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { notifyVendorNewOrder } from "./notifications";

// ─── Hook: Live vendors from Firestore ───────────────────────────────────────
export function useVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "vendors"),
      where("status", "==", "active")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setVendors(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            // Map to format the student UI expects
            emoji: doc.data().emoji || "🍽️",
            tag: doc.data().category,
            rating: doc.data().rating || "New",
            time: doc.data().deliveryTime || "15-25 min",
            color: "#1a0800",
          }))
        );
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching vendors:", error);
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  return { vendors, loading };
}

// ─── Hook: Live menu items from Firestore ────────────────────────────────────
export function useMenuItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        // Get all active vendors first
        const vendorSnap = await getDocs(
          query(collection(db, "vendors"), where("status", "==", "active"))
        );

        const allItems = [];

        const promises = vendorSnap.docs.map(async (vendorDoc) => {
          const menuSnap = await getDocs(
            query(
              collection(db, "vendors", vendorDoc.id, "menu"),
              where("available", "==", true)
            )
          );

          menuSnap.docs.forEach((doc) => {
            allItems.push({
              id: doc.id,
              vendorId: vendorDoc.id,
              vendor: vendorDoc.data().businessName || vendorDoc.data().name,
              // Map to format student UI expects
              name: doc.data().name,
              emoji: doc.data().emoji || "🍽️",
              desc: doc.data().description || "",
              price: doc.data().price,
              ...doc.data(),
            });
          });
        });

        await Promise.all(promises);
        setItems(allItems);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { items, loading };
}

// ─── Hook: Student’s own orders (real-time) ──────────────────────────────────
export function useStudentOrders(studentId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("studentId", "==", studentId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching student orders:", error);
        setLoading(false);
      }
    );

    return unsub;
  }, [studentId]);

  return { orders, loading };
}

// ─── Place order function ─────────────────────────────────────────────────────
export async function placeRealOrder({
  student,
  cart,
  paymentMethod,
  deliveryAddress,
}) {
  if (!cart?.length) {
    throw new Error("Cart is empty");
  }

  // Group cart items by vendor
  const vendorGroups = {};

  cart.forEach((item) => {
    const vendorId = item.vendorId || "unknown";

    if (!vendorGroups[vendorId]) {
      vendorGroups[vendorId] = {
        vendorId,
        vendorName: item.vendor || item.vendorName || "PADI Vendor",
        items: [],
      };
    }

    vendorGroups[vendorId].items.push({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
      emoji: item.emoji || "🍽️",
    });
  });

  const DELIVERY_FEE = 300;
  const PROMO = 150;

  const subtotal = cart.reduce((acc, item) => {
    return acc + item.price * item.qty;
  }, 0);

  const total = subtotal + DELIVERY_FEE - PROMO;

  // Create one order per vendor
  const orderIds = [];

  for (const group of Object.values(vendorGroups)) {
    const vendorSubtotal = group.items.reduce((acc, item) => {
      return acc + item.price * item.qty;
    }, 0);

    const ref = await addDoc(collection(db, "orders"), {
      studentId: student.uid,
      studentName: student.name || student.displayName || "Student",
      studentEmail: student.email || "",
      vendorId: group.vendorId,
      vendorName: group.vendorName,
      items: group.items,
      subtotal: vendorSubtotal,
      deliveryFee: DELIVERY_FEE,
      total: vendorSubtotal + DELIVERY_FEE - PROMO,
      paymentMethod,
      deliveryAddress: deliveryAddress || "Campus Hostel",
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Notify vendor of new order
    await notifyVendorNewOrder({
      vendorId: group.vendorId,
      orderId: ref.id,
      studentName: student.name || student.displayName || "A student",
      items: group.items,
    });

    orderIds.push(ref.id);
  }

  return { orderIds, total };
}