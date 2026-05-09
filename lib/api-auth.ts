import { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export type CallerProfile = {
  uid: string;
  accountId: string;
  role: "admin" | "manager" | "creator";
  name: string;
  email: string;
  [key: string]: any;
};

export async function getCallerProfile(req: NextRequest): Promise<CallerProfile | null> {
  const sessionCookie = req.cookies.get("__session")?.value;
  if (!sessionCookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const snap = await adminDb.collection("users").doc(decoded.uid).get();
    if (!snap.exists) return null;
    return { uid: decoded.uid, ...(snap.data() as Omit<CallerProfile, "uid">) } as CallerProfile;
  } catch {
    return null;
  }
}
