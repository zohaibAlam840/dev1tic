import { NextRequest, NextResponse } from "next/server";
import { getCallerProfile } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snap = await adminDb.collection("users").doc(caller.uid).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = snap.data() as any;
    return NextResponse.json({
      name:         data.name         ?? "",
      email:        data.email        ?? "",
      tiktokHandle: data.tiktokHandle ?? "",
      timezone:     data.timezone     ?? "",
    });
  } catch (err: any) {
    console.error("[settings_get]", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, tiktokHandle, timezone } = await req.json();

    const updates: Record<string, string> = {};
    if (typeof name         === "string") updates.name         = name.trim();
    if (typeof tiktokHandle === "string") updates.tiktokHandle = tiktokHandle.trim();
    if (typeof timezone     === "string") updates.timezone     = timezone.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    await adminDb.collection("users").doc(caller.uid).update(updates);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[settings_patch]", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
