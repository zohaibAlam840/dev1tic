import { NextRequest, NextResponse } from "next/server";
import { getCallerProfile } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";
import { notifyWorkspace } from "@/lib/notifications";

const isWorkspaceScope = (role: string) => role === "admin" || role === "manager";

export async function GET(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const q = isWorkspaceScope(caller.role)
      ? adminDb.collection("collabs").where("accountId", "==", caller.accountId)
      : adminDb.collection("collabs").where("userId", "==", caller.uid);

    const snap = await q.get();
    const collabs = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ collabs });
  } catch (err: any) {
    console.error("[collabs_get]", err);
    return NextResponse.json({ error: "Failed to fetch collabs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { brand, product, stage = "New Project", value, commission, dueDate, contact, notes } = await req.json();

    if (!brand?.trim() || !product?.trim()) {
      return NextResponse.json({ error: "Brand and product are required." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const docRef = adminDb.collection("collabs").doc();
    await docRef.set({
      userId:    caller.uid,
      accountId: caller.accountId,
      brand:     brand.trim(),
      product:   product.trim(),
      stage,
      value:      Number(value) || 0,
      commission: Number(commission) || 0,
      dueDate:   dueDate || "",
      contact:   contact?.trim() || "",
      notes:     notes?.trim() || "",
      createdAt: now,
      updatedAt: now,
    });

    // Notify admins/managers (skip if the creator IS an admin/manager adding their own)
    await notifyWorkspace(caller.accountId, caller.uid, {
      type:  "new_collab",
      title: "New collab added",
      body:  `${caller.name} added "${brand.trim()} — ${product.trim()}" to the pipeline.`,
      link:  "/collabs",
      metadata: { collabId: docRef.id },
    });

    return NextResponse.json({ id: docRef.id });
  } catch (err: any) {
    console.error("[collabs_post]", err);
    return NextResponse.json({ error: "Failed to create collab" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const snap = await adminDb.collection("collabs").doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = snap.data() as any;
    if (!isWorkspaceScope(caller.role) && data.userId !== caller.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const prevStage = data.stage;
    await adminDb.collection("collabs").doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    // Notify admins/managers when a creator moves a stage
    if (updates.stage && updates.stage !== prevStage && caller.role === "creator") {
      await notifyWorkspace(caller.accountId, caller.uid, {
        type:  "stage_change",
        title: "Collab stage updated",
        body:  `${caller.name} moved "${data.brand} — ${data.product}" from ${prevStage} → ${updates.stage}.`,
        link:  "/collabs",
        metadata: { collabId: id, from: prevStage, to: updates.stage },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[collabs_patch]", err);
    return NextResponse.json({ error: "Failed to update collab" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const snap = await adminDb.collection("collabs").doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = snap.data() as any;
    if (!isWorkspaceScope(caller.role) && data.userId !== caller.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminDb.collection("collabs").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[collabs_delete]", err);
    return NextResponse.json({ error: "Failed to delete collab" }, { status: 500 });
  }
}
