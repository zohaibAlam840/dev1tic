import { NextRequest, NextResponse } from "next/server";
import { getCallerProfile } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [dailySnap, productsSnap] = await Promise.all([
      adminDb.collection("analytics_daily").where("userId", "==", caller.uid).get(),
      adminDb.collection("analytics_products").where("userId", "==", caller.uid).get(),
    ]);

    const daily = dailySnap.docs
      .map(d => d.data())
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    const products = productsSnap.docs.map(d => d.data());

    return NextResponse.json({ daily, products });
  } catch (err: any) {
    console.error("[analytics_get]", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { type, data } = await req.json();

    // Upsert a single daily row (keyed by userId + date)
    if (type === "daily") {
      const row = data as { date: string; gmv: number; items: number; commission: number; impressions: number; clicks: number };
      if (!row.date) return NextResponse.json({ error: "Missing date" }, { status: 400 });

      await adminDb.collection("analytics_daily").doc(`${caller.uid}_${row.date}`).set({
        ...row,
        userId: caller.uid,
        accountId: caller.accountId,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      return NextResponse.json({ success: true });
    }

    // Replace all product rows for this user with the given array
    if (type === "products") {
      const rows = data as { name: string; gmv: number; items: number; commission: number }[];

      const existing = await adminDb.collection("analytics_products")
        .where("userId", "==", caller.uid)
        .get();

      const batch = adminDb.batch();
      existing.docs.forEach(d => batch.delete(d.ref));
      rows.forEach((row, i) => {
        const ref = adminDb.collection("analytics_products").doc(`${caller.uid}_${i}`);
        batch.set(ref, {
          ...row,
          userId: caller.uid,
          accountId: caller.accountId,
          updatedAt: new Date().toISOString(),
        });
      });
      await batch.commit();

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type. Use 'daily' or 'products'." }, { status: 400 });
  } catch (err: any) {
    console.error("[analytics_post]", err);
    return NextResponse.json({ error: "Failed to save analytics" }, { status: 500 });
  }
}
