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
