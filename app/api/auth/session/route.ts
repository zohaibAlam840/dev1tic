import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    const res = NextResponse.json({ status: "ok" });
    res.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      path:     "/",
      maxAge:   SESSION_DURATION_MS / 1000,
      sameSite: "lax",
    });
    return res;
  } catch (err) {
    console.error("[/api/auth/session]", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ status: "ok" });
  res.cookies.delete("__session");
  return res;
}
