import { NextRequest, NextResponse } from "next/server";
import { getCallerProfile } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";

// GET /api/notifications — last 40 notifications for the caller
export async function GET(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snap = await adminDb
      .collection("notifications")
      .where("toUid", "==", caller.uid)
      .orderBy("createdAt", "desc")
      .limit(40)
      .get();

    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ notifications });
  } catch (err: any) {
    console.error("[notifications_get]", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// PATCH /api/notifications — mark as read
// body: { ids: string[] }  OR  { all: true }
export async function PATCH(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (body.all) {
      const snap = await adminDb
        .collection("notifications")
        .where("toUid", "==", caller.uid)
        .where("read", "==", false)
        .get();

      const batch = adminDb.batch();
      snap.docs.forEach(d => batch.update(d.ref, { read: true }));
      await batch.commit();
      return NextResponse.json({ updated: snap.size });
    }

    if (Array.isArray(body.ids) && body.ids.length > 0) {
      const batch = adminDb.batch();
      for (const id of body.ids as string[]) {
        const ref = adminDb.collection("notifications").doc(id);
        batch.update(ref, { read: true });
      }
      await batch.commit();
      return NextResponse.json({ updated: body.ids.length });
    }

    return NextResponse.json({ updated: 0 });
  } catch (err: any) {
    console.error("[notifications_patch]", err);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
