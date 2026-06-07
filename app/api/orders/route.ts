import { NextRequest, NextResponse } from "next/server";
import { getCallerProfile } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";
import { notifyWorkspace } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snap = await adminDb
      .collection("orders")
      .where("userId", "==", caller.uid)
      .get();

    const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("[orders_get]", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { orders } = body;

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: "Missing orders array" }, { status: 400 });
    }

    const batch = adminDb.batch();
    orders.forEach((order: any) => {
      const docRef = adminDb.collection("orders").doc(`${caller.uid}_${order.id}`);
      batch.set(docRef, {
        ...order,
        userId: caller.uid,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    });
    await batch.commit();

    const paidOrders = orders.filter((o: any) => o.status === "Paid");
    if (paidOrders.length > 0) {
      const totalComm = paidOrders.reduce((sum: number, o: any) => sum + (o.estComm ?? 0), 0);
      await notifyWorkspace(caller.accountId, caller.uid, {
        type:  "new_order",
        title: `${caller.name} logged ${paidOrders.length} paid order${paidOrders.length > 1 ? "s" : ""}`,
        body:  `Est. commission: $${totalComm.toFixed(2)}`,
        link:  "/admin",
      });
    }

    return NextResponse.json({ success: true, count: orders.length });
  } catch (err: any) {
    console.error("[orders_post]", err);
    return NextResponse.json({ error: "Failed to save orders" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (caller.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id  = searchParams.get("id");
    const all = searchParams.get("all");

    if (all === "true") {
      // Delete all orders belonging to this user
      const snap = await adminDb.collection("orders").where("userId", "==", caller.uid).get();
      if (snap.empty) return NextResponse.json({ success: true, deleted: 0 });
      const batch = adminDb.batch();
      snap.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      return NextResponse.json({ success: true, deleted: snap.size });
    }

    if (id) {
      await adminDb.collection("orders").doc(`${caller.uid}_${id}`).delete();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Provide ?id= or ?all=true" }, { status: 400 });
  } catch (err: any) {
    console.error("[orders_delete]", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

    const docId = `${caller.uid}_${id}`;
    await adminDb.collection("orders").doc(docId).update({ status, updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[orders_patch]", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
