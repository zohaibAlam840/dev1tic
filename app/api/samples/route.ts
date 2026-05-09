import { NextRequest, NextResponse } from "next/server";
import { getCallerProfile } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";
import { notifyWorkspace } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const isWS = caller.role === "admin" || caller.role === "manager";
    const q = isWS
      ? adminDb.collection("samples").where("accountId", "==", caller.accountId)
      : adminDb.collection("samples").where("userId", "==", caller.uid);

    const snap = await q.get();
    const samples = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ samples });
  } catch (err: any) {
    console.error("[samples_get]", err);
    return NextResponse.json({ error: "Failed to fetch samples" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { product, type, fulfillment, status, receivedDate, dueDate, collab, notes } = await req.json();

    if (!product?.trim()) {
      return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const docRef = adminDb.collection("samples").doc();
    await docRef.set({
      userId: caller.uid,
      accountId: caller.accountId,
      product: product.trim(),
      type: type || "Free sample",
      fulfillment: fulfillment || "Video",
      status: status || "Needs content",
      receivedDate: receivedDate || "",
      dueDate: dueDate || "",
      collab: collab?.trim() || null,
      notes: notes?.trim() || "",
      createdAt: now,
      updatedAt: now,
    });

    await notifyWorkspace(caller.accountId, caller.uid, {
      type:  "new_sample",
      title: "New sample added",
      body:  `${caller.name} added a sample: ${product.trim()}.`,
      link:  "/samples",
      metadata: { sampleId: docRef.id },
    });

    return NextResponse.json({ id: docRef.id });
  } catch (err: any) {
    console.error("[samples_post]", err);
    return NextResponse.json({ error: "Failed to create sample" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const snap = await adminDb.collection("samples").doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = snap.data() as any;
    if (caller.role !== "admin" && caller.role !== "manager" && data.userId !== caller.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminDb.collection("samples").doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[samples_patch]", err);
    return NextResponse.json({ error: "Failed to update sample" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const snap = await adminDb.collection("samples").doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = snap.data() as any;
    if (caller.role !== "admin" && caller.role !== "manager" && data.userId !== caller.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminDb.collection("samples").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[samples_delete]", err);
    return NextResponse.json({ error: "Failed to delete sample" }, { status: 500 });
  }
}
