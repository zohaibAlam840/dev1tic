import { NextRequest, NextResponse } from "next/server";
import { getCallerProfile } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";
import { notifyWorkspace } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snap = await adminDb
      .collection("inbox")
      .where("userId", "==", caller.uid)
      .get();

    const items = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error("[inbox_get]", err);
    return NextResponse.json({ error: "Failed to fetch inbox" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { source, subject, from, body, needsReply, collabId, collabName } = await req.json();

    if (!subject?.trim()) {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const docRef = adminDb.collection("inbox").doc();
    await docRef.set({
      userId: caller.uid,
      accountId: caller.accountId,
      source: source || "Note",
      subject: subject.trim(),
      from: from?.trim() || "",
      body: body?.trim() || "",
      status: "open",
      needsReply: needsReply ?? false,
      collabId: collabId || null,
      collabName: collabName || null,
      createdAt: now,
      updatedAt: now,
    });

    if (needsReply) {
      await notifyWorkspace(caller.accountId, caller.uid, {
        type:  "needs_reply",
        title: `${caller.name} has a message that needs a reply`,
        body:  subject.trim(),
        link:  "/admin",
      });
    }

    return NextResponse.json({ id: docRef.id });
  } catch (err: any) {
    console.error("[inbox_post]", err);
    return NextResponse.json({ error: "Failed to create inbox item" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const snap = await adminDb.collection("inbox").doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = snap.data() as any;
    if (data.userId !== caller.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminDb.collection("inbox").doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[inbox_patch]", err);
    return NextResponse.json({ error: "Failed to update inbox item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const snap = await adminDb.collection("inbox").doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = snap.data() as any;
    if (data.userId !== caller.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminDb.collection("inbox").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[inbox_delete]", err);
    return NextResponse.json({ error: "Failed to delete inbox item" }, { status: 500 });
  }
}
