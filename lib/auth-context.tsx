"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useRouter } from "next/navigation";

export type UserProfile = {
  uid:       string;
  email:     string;
  name:      string;
  role:      "admin" | "creator";
  accountId: string;
  is_active: boolean;
};

type AuthContextType = {
  user:     User | null;
  profile:  UserProfile | null;
  loading:  boolean;
  signOut:  () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null, profile: null, loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          setProfile({ uid: firebaseUser.uid, ...snap.data() } as UserProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function signOut() {
    await firebaseSignOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
