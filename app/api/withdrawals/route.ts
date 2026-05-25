import { NextRequest, NextResponse } from "next/server";
import { getCallerProfile } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snap = await adminDb
      .collection("withdrawals")
      .where("userId", "==", caller.uid)
      .get();

    const withdrawals = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ withdrawals });
  } catch (err: any) {
    console.error("[withdrawals_get]", err);
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { date, amount, notes } = await req.json();
    if (!date || !amount) {
      return NextResponse.json({ error: "Date and amount are required" }, { status: 400 });
    }

    const docRef = adminDb.collection("withdrawals").doc();
    await docRef.set({
      userId:    caller.uid,
      accountId: caller.accountId,
      date,
      amount:    Number(amount),
      notes:     notes?.trim() || "",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (err: any) {
    console.error("[withdrawals_post]", err);
    return NextResponse.json({ error: "Failed to save withdrawal" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const snap = await adminDb.collection("withdrawals").doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if ((snap.data() as any).userId !== caller.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminDb.collection("withdrawals").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[withdrawals_delete]", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
