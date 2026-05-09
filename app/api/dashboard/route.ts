import { NextRequest, NextResponse } from "next/server";
import { getCallerProfile } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { uid, accountId, role } = caller;
    const isAdmin = role === "admin" || role === "manager";

    // All queries run in parallel
    const [ordersSnap, collabsSnap, samplesSnap, analyticsSnap] = await Promise.all([
      adminDb.collection("orders").where("userId", "==", uid).get(),
      isAdmin
        ? adminDb.collection("collabs").where("accountId", "==", accountId).get()
        : adminDb.collection("collabs").where("userId", "==", uid).get(),
      isAdmin
        ? adminDb.collection("samples").where("accountId", "==", accountId).get()
        : adminDb.collection("samples").where("userId", "==", uid).get(),
      adminDb.collection("analytics_daily").where("userId", "==", uid).get(),
    ]);

    // ── Orders ──────────────────────────────────────────────────────────────
    const orders = ordersSnap.docs.map(d => d.data() as any);
    const totalCommission = orders
      .filter(o => o.status === "Paid")
      .reduce((s, o) => s + (o.estComm ?? o.commission ?? 0), 0);

    // ── Collabs ──────────────────────────────────────────────────────────────
    const collabs = collabsSnap.docs.map(d => d.data() as any);
    const pipelineValue = collabs.reduce((s, c) => s + (c.value ?? 0), 0);

    const pipelineByStage: Record<string, number> = {};
    const ACTIVE_STAGES = ["Negotiating", "Accepted", "Contract Signed", "Product Sent", "Product Received", "Content Posted", "Awaiting Payment"];
    ACTIVE_STAGES.forEach(s => { pipelineByStage[s] = 0; });
    collabs.forEach(c => {
      if (ACTIVE_STAGES.includes(c.stage)) {
        pipelineByStage[c.stage] = (pipelineByStage[c.stage] ?? 0) + 1;
      }
    });

    // ── Samples ──────────────────────────────────────────────────────────────
    const samples = samplesSnap.docs.map(d => d.data() as any);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueSoon = samples.filter(s => {
      if (s.status !== "Needs content" || !s.dueDate) return false;
      const diff = Math.ceil((new Date(s.dueDate).getTime() - today.getTime()) / 86_400_000);
      return diff >= 0 && diff <= 7;
    });

    // ── Analytics ────────────────────────────────────────────────────────────
    const dailyRows = analyticsSnap.docs
      .map(d => d.data() as any)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    const totalGmv = dailyRows.reduce((s, d) => s + (d.gmv ?? 0), 0);

    const chartData = dailyRows.map(d => ({
      day: formatChartLabel(d.date),
      gmv: d.gmv ?? 0,
      commission: d.commission ?? 0,
    }));

    return NextResponse.json({
      orders: {
        total:      orders.length,
        commission: totalCommission,
        missing:    orders.filter(o => o.status === "Missing").length,
        flagged:    orders.filter(o => o.status === "Flag").length,
      },
      collabs: {
        active:       collabs.filter(c => !["Paid", "Completed"].includes(c.stage)).length,
        pipelineValue,
        awaitingPayment: collabs.filter(c => c.stage === "Awaiting Payment").length,
        pipelineByStage,
      },
      samples: {
        needsContent: samples.filter(s => s.status === "Needs content").length,
        dueSoon:      dueSoon.length,
      },
      analytics: {
        totalGmv,
        chartData,
      },
    });
  } catch (err: any) {
    console.error("[dashboard_get]", err);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}

function formatChartLabel(isoDate: string): string {
  try {
    const d = new Date(isoDate + "T12:00:00Z");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  } catch {
    return isoDate;
  }
}
