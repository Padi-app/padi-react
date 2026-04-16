import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

const AuthContext = createContext(null);

const API = "http://localhost:5000/api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeEmail = (email = "") => email.trim().toLowerCase();

  const resolveProfile = async (firebaseUser) => {
    if (!firebaseUser) return null;

    const { uid, displayName, email } = firebaseUser;

    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      if (userSnap.exists()) {
        return { ...userSnap.data(), role: "student", uid };
      }

      const vendorSnap = await getDoc(doc(db, "vendors", uid));
      if (vendorSnap.exists()) {
        return { ...vendorSnap.data(), role: "vendor", uid };
      }

      const riderSnap = await getDoc(doc(db, "riders", uid));
      if (riderSnap.exists()) {
        return { ...riderSnap.data(), role: "rider", uid };
      }

      return {
        uid,
        name: displayName || "",
        email: normalizeEmail(email),
        role: "student",
      };
    } catch (err) {
      console.error("Profile resolve error:", err);
      return {
        uid,
        name: displayName || "",
        email: normalizeEmail(email),
        role: "student",
      };
    }
  };

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
        const resolved = await resolveProfile(firebaseUser);
        setProfile(resolved);
      } catch (err) {
        console.error("Auth listener profile error:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const requestOTP = async (email, name) => {
    setError(null);

    try {
      const res = await fetch(`${API}/send-email-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizeEmail(email), name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send code");
      }

      return { success: true, message: data.message };
    } catch (err) {
      const message = err.message || "Failed to send code";
      setError(message);
      return { success: false, error: message };
    }
  };

  const confirmOTP = async (email, code) => {
    setError(null);

    try {
      const res = await fetch(`${API}/verify-email-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizeEmail(email),
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid code");
      }

      return { success: true, message: data.message };
    } catch (err) {
      const message = err.message || "Invalid code";
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, phone = "", university = "") => {
    setError(null);

    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: normalizeEmail(email),
          password,
          phone,
          university,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // sign in immediately after backend account creation
      const loginResult = await signInWithEmailAndPassword(
        auth,
        normalizeEmail(email),
        password
      );

      const resolved = await resolveProfile(loginResult.user);
      setProfile(resolved);

      return { success: true, data };
    } catch (err) {
      const message = err.message || "Registration failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const login = async (email, password) => {
    setError(null);

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        normalizeEmail(email),
        password
      );

      const resolved = await resolveProfile(result.user);

      if (resolved?.role === "vendor") {
        window.location.href = "/vendor";
        return { success: true };
      }

      if (resolved?.role === "rider") {
        window.location.href = "/rider";
        return { success: true };
      }

      setProfile(resolved);
      return { success: true };
    } catch (err) {
      const message = "Invalid email or password";
      setError(message);
      return { success: false, error: message };
    }
  };

  const loginWithGoogle = async () => {
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userRef = doc(db, "users", result.user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          name: result.user.displayName || "Student",
          email: normalizeEmail(result.user.email || ""),
          phone: "",
          university: "",
          role: "student",
          walletBalance: 0,
          emailVerifiedByCode: true,
          phoneVerified: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      const resolved = await resolveProfile(result.user);
      setProfile(resolved);

      return { success: true };
    } catch (err) {
      const message = "Google sign-in failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      setUser(null);
      setProfile(null);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        setError,
        requestOTP,
        confirmOTP,
        register,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}