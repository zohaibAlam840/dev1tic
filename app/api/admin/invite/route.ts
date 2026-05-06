import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  let createdUid: string | null = null;

  try {
    // 1. Verify the caller is an authenticated admin
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded    = await adminAuth.verifySessionCookie(sessionCookie, true);
    const callerSnap = await adminDb.collection("users").doc(decoded.uid).get();
    if (!callerSnap.exists || callerSnap.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { accountId } = callerSnap.data()!;

    // 2. Parse body
    const { name, email, password, role = "creator" } = await req.json();
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // 3. Create Firebase Auth user
    const newUser = await adminAuth.createUser({
      email:       email.trim(),
      displayName: name.trim(),
      password,
    });
    createdUid = newUser.uid;

    // 4. Write Firestore user doc under the same account
    await adminDb.collection("users").doc(newUser.uid).set({
      accountId,
      name:      name.trim(),
      email:     email.trim(),
      role,
      is_active: true,
      timezone:  "UTC",
      createdAt: new Date().toISOString(),
      createdBy: decoded.uid,
    });

    return NextResponse.json({ uid: newUser.uid, email: email.trim() });

  } catch (err: any) {
    // Rollback: delete Auth user if Firestore write failed
    if (createdUid) {
      try { await adminAuth.deleteUser(createdUid); } catch {}
    }
    if (err.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }
    console.error("[/api/admin/invite]", err);
    return NextResponse.json({ error: "Failed to create user. Please try again." }, { status: 500 });
  }
}
