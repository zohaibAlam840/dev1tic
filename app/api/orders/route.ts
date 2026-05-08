import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection("orders")
      .where("userId", "==", userId)
      .get();

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("[orders_get]", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, orders } = body;

    if (!userId || !orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const batch = adminDb.batch();

    orders.forEach((order: any) => {
      // Use a combination of userId and orderId to prevent duplicates in the DB if you want, 
      // or just create new docs. For now, let's use the provided order ID as the doc ID.
      const docRef = adminDb.collection("orders").doc(`${userId}_${order.id}`);
      batch.set(docRef, {
        ...order,
        userId,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    });

    await batch.commit();

    return NextResponse.json({ success: true, count: orders.length });
  } catch (err: any) {
    console.error("[orders_post]", err);
    return NextResponse.json({ error: "Failed to save orders" }, { status: 500 });
  }
}
