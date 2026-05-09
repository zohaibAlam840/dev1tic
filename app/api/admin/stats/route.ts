import { NextRequest, NextResponse } from "next/server";
import { getCallerProfile } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller || (caller.role !== "admin" && caller.role !== "manager")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { accountId } = caller;

    const usersSnap = await adminDb
      .collection("users")
      .where("accountId", "==", accountId)
      .get();

    const members = usersSnap.docs.map(d => ({ uid: d.id, ...(d.data() as any) }));
    const uids = members.map(u => u.uid);
    const activeCreators = members.filter(u => u.is_active !== false && u.role !== "admin").length;

    let totalOrders = 0;
    let totalCommission = 0;
    let totalGmv = 0;

    // Firestore whereIn is limited to 30 items per query — batch accordingly
    for (let i = 0; i < uids.length; i += 30) {
      const batch = uids.slice(i, i + 30);
      const [ordersSnap, analyticsSnap] = await Promise.all([
        adminDb.collection("orders").where("userId", "in", batch).get(),
        adminDb.collection("analytics_daily").where("userId", "in", batch).get(),
      ]);

      ordersSnap.docs.forEach(d => {
        const o = d.data() as any;
        totalOrders++;
        if (o.status === "Paid") totalCommission += o.estComm ?? o.commission ?? 0;
      });

      analyticsSnap.docs.forEach(d => {
        const a = d.data() as any;
        totalGmv += a.gmv ?? 0;
      });
    }

    return NextResponse.json({ totalGmv, totalCommission, totalOrders, activeCreators });
  } catch (err: any) {
    console.error("[admin_stats]", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
