import { NextRequest, NextResponse } from "next/server";
import { getCallerProfile } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snap = await adminDb
      .collection("earnings")
      .where("userId", "==", caller.uid)
      .get();

    const earnings = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ earnings });
  } catch (err: any) {
    console.error("[earnings_get]", err);
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { records } = await req.json();
    if (!records || !Array.isArray(records)) {
      return NextResponse.json({ error: "Missing records array" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const batch = adminDb.batch();
    records.forEach((r: any) => {
      const docRef = adminDb.collection("earnings").doc();
      batch.set(docRef, {
        userId:    caller.uid,
        accountId: caller.accountId,
        date:      r.date || "",
        amount:    Number(r.amount) || 0,
        type:      r.type || "Daily Revenue",
        notes:     r.notes?.trim() || "",
        createdAt: now,
      });
    });
    await batch.commit();

    return NextResponse.json({ success: true, count: records.length });
  } catch (err: any) {
    console.error("[earnings_post]", err);
    return NextResponse.json({ error: "Failed to save earnings" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const snap = await adminDb.collection("earnings").doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if ((snap.data() as any).userId !== caller.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminDb.collection("earnings").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[earnings_delete]", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
