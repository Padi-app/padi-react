import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { auth, db } from "./firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const normalizeEmail = (email) => email.trim().toLowerCase();

  const findAccountByEmail = async (email) => {
    const normalizedEmail = normalizeEmail(email);

    const collectionsToCheck = [
      { name: "vendors", role: "vendor" },
      { name: "riders", role: "rider" },
      { name: "users", role: "student" },
    ];

    for (const item of collectionsToCheck) {
      const q = query(
        collection(db, item.name),
        where("email", "==", normalizedEmail),
        limit(1)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        const foundDoc = snap.docs[0];
        return {
          exists: true,
          role: item.role,
          collection: item.name,
          uid: foundDoc.id,
          data: foundDoc.data(),
        };
      }
    }

    return {
      exists: false,
      role: null,
      collection: null,
      uid: null,
      data: null,
    };
  };

  const resolveProfile = async (firebaseUser) => {
    if (!firebaseUser) return null;

    const { uid, displayName, email } = firebaseUser;

    try {
      const vendorSnap = await getDoc(doc(db, "vendors", uid));
      if (vendorSnap.exists()) {
        return {
          ...vendorSnap.data(),
          role: "vendor",
          uid,
        };
      }

      const riderSnap = await getDoc(doc(db, "riders", uid));
      if (riderSnap.exists()) {
        return {
          ...riderSnap.data(),
          role: "rider",
          uid,
        };
      }

      const userSnap = await getDoc(doc(db, "users", uid));
      if (userSnap.exists()) {
        return {
          ...userSnap.data(),
          role: "student",
          uid,
        };
      }

      return {
        uid,
        name: displayName || "",
        email: email ? normalizeEmail(email) : "",
        role: "student",
      };
    } catch (err) {
      console.error("Profile resolve error:", err);
      return {
        uid,
        name: displayName || "",
        email: email ? normalizeEmail(email) : "",
        role: "student",
      };
    }
  };

  // ── Auth state watcher ─────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      try {
        await firebaseUser.getIdToken(true);
        const resolved = await resolveProfile(firebaseUser);
        setProfile(resolved);
      } catch (err) {
        console.error("Auth state profile error:", err);
        setProfile({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email ? normalizeEmail(firebaseUser.email) : "",
          role: "student",
        });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ── Login (student portal only) ────────────────────────────────────────────
  const login = async (email, password) => {
  setError(null);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const resolved = await resolveProfile(result.user);

    // Instead of signing out, redirect to correct portal
    if (resolved.role === "rider") {
      window.location.href = "/rider";
      return { success: true };
    }

    if (resolved.role === "vendor") {
      window.location.href = "/vendor";
      return { success: true };
    }

    setProfile(resolved);
    return { success: true };
  } catch (err) {
    let message = "Login failed. Please check your credentials.";
    switch (err.code) {
      case "auth/user-not-found": message = "No account found with this email."; break;
      case "auth/wrong-password": message = "Incorrect password."; break;
      case "auth/too-many-requests": message = "Too many attempts. Try again later."; break;
      case "auth/invalid-credential": message = "Invalid email or password."; break;
    }
    setError(message);
    return { success: false, error: message };
  }
};

  // ── Register (students only, with cross-role protection) ──────────────────
  const register = async (name, email, password, phone = "") => {
    setError(null);

    const normalizedEmail = normalizeEmail(email);

    try {
      // Check if this email already exists in ANY role collection
      const existingAccount = await findAccountByEmail(normalizedEmail);

      if (existingAccount.exists) {
        let message = "This email is already in use.";

        if (existingAccount.role === "vendor") {
          message =
            "This email is already registered as a vendor. Please sign in through the Vendor portal.";
        } else if (existingAccount.role === "rider") {
          message =
            "This email is already registered as a rider. Please sign in through the Rider portal.";
        } else if (existingAccount.role === "student") {
          message =
            "A student account with this email already exists. Please sign in instead.";
        }

        setError(message);
        return { success: false, error: message };
      }

      const result = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

      await updateProfile(result.user, { displayName: name });

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name,
        email: normalizedEmail,
        phone,
        role: "student",
        walletBalance: 0,
        createdAt: serverTimestamp(),
      });

      setProfile({
        uid: result.user.uid,
        name,
        email: normalizedEmail,
        phone,
        role: "student",
        walletBalance: 0,
      });

      return { success: true };
    } catch (err) {
      let message = "Registration failed.";

      switch (err.code) {
        case "auth/email-already-in-use":
          message = "An account with this email already exists.";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          message = "Password should be at least 6 characters.";
          break;
        default:
          message = err.message || message;
      }

      setError(message);
      return { success: false, error: message };
    }
  };

  // ── Google sign-in (student portal only, with cross-role protection) ──────
  const loginWithGoogle = async () => {
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const firebaseUser = result.user;
      const normalizedEmail = firebaseUser.email
        ? normalizeEmail(firebaseUser.email)
        : "";

      // First check by UID
      const resolved = await resolveProfile(firebaseUser);

      if (resolved.role === "rider") {
  window.location.href = "/rider";
  return { success: true };
}

if (resolved.role === "vendor") {
  window.location.href = "/vendor";
  return { success: true };
}

      // Then check if same email exists under another role
      const existingAccount = await findAccountByEmail(normalizedEmail);

      if (
        existingAccount.exists &&
        existingAccount.uid !== firebaseUser.uid &&
        existingAccount.role !== "student"
      ) {
        await signOut(auth);

        const message =
          existingAccount.role === "vendor"
            ? "This Google email is already linked to an account."
            : "This Google email is already linked to an account."
        setError(message);
        return { success: false, error: message };
      }

      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: normalizedEmail,
          phone: "",
          role: "student",
          walletBalance: 0,
          createdAt: serverTimestamp(),
        });
      }

      setProfile({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "",
        email: normalizedEmail,
        phone: "",
        role: "student",
        walletBalance: userSnap.exists()
          ? userSnap.data().walletBalance || 0
          : 0,
      });

      return { success: true };
    } catch (err) {
      let message = "Google sign-in failed.";

      if (err.code === "auth/popup-closed-by-user") {
        message = "Google sign-in was cancelled.";
      } else if (err.code === "auth/popup-blocked") {
        message = "Popup was blocked. Please allow popups and try again.";
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
      return { success: false, error: message };
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      setUser(null);
      setProfile(null);
      setError(null);
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    setError,
    register,
    login,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}