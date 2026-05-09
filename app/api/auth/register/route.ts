import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const { idToken, name, email, timezone } = await req.json();

    if (!idToken || !name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const accountRef = adminDb.collection("accounts").doc();
    const now = new Date().toISOString();

    await accountRef.set({
      ownerUid:  uid,
      name:      name.trim() + "'s Workspace",
      plan:      "free",
      createdAt: now,
    });

    await adminDb.collection("users").doc(uid).set({
      accountId: accountRef.id,
      name:      name.trim(),
      email:     email.trim(),
      role:      "admin",
      is_active: true,
      timezone:  timezone || "UTC",
      createdAt: now,
      createdBy: uid,
    });

    await createNotification({
      toUid:     uid,
      accountId: accountRef.id,
      type:      "welcome",
      title:     "Welcome to Crextio!",
      body:      "Your workspace is ready. Invite your creators from the Admin panel.",
      link:      "/admin",
    });

    return NextResponse.json({ accountId: accountRef.id });
  } catch (err: any) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
