"use client";
import { useEffect, useState } from "react";
import {
  TrendingUp, DollarSign, ShoppingBag, Zap,
  AlertTriangle, Calendar, Shield, Clock,
} from "lucide-react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type DashData = {
  orders:   { total: number; commission: number; missing: number; flagged: number };
  collabs:  { active: number; pipelineValue: number; awaitingPayment: number; pipelineByStage: Record<string, number> };
  samples:  { needsContent: number; dueSoon: number };
  analytics:{ totalGmv: number; chartData: { day: string; gmv: number; commission: number }[] };
};

const PIPELINE_DOTS: Record<string, string> = {
  "Negotiating":      "bg-amber-400",
  "Accepted":         "bg-blue-400",
  "Contract Signed":  "bg-black",
  "Product Sent":     "bg-orange-400",
  "Product Received": "bg-cyan-400",
  "Content Posted":   "bg-[#FFD567]",
  "Awaiting Payment": "bg-amber-500",
};

function StatSkeleton() {
  return (
    <div className="bento-card p-6 flex flex-col justify-between min-h-[140px] animate-pulse">
      <div className="h-10 w-10 rounded-2xl bg-gray-100" />
      <div className="mt-4 space-y-2">
        <div className="h-8 w-24 rounded bg-gray-100" />
        <div className="h-3 w-20 rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { profile }  = useAuth();
  const firstName    = profile?.name?.split(" ")[0] ?? "there";
  const isAdmin      = profile?.role === "admin";

  const [data,          setData]          = useState<DashData | null>(null);
  const [loadingDash,   setLoadingDash]   = useState(true);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [ownerName,     setOwnerName]     = useState<string | null>(null);

  // Fetch aggregated dashboard stats
  useEffect(() => {
    if (!profile) return;
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(json => { if (!json.error) setData(json); })
      .catch(err => console.error("[dashboard fetch]", err))
      .finally(() => setLoadingDash(false));
  }, [profile]);

  // Creator: fetch workspace name + owner from the account doc
  useEffect(() => {
    if (!profile || profile.role === "admin" || !profile.accountId) return;
    (async () => {
      const accountSnap = await getDoc(doc(db, "accounts", profile.accountId));
      if (!accountSnap.exists()) return;
      const { name: wName, ownerUid } = accountSnap.data();
      setWorkspaceName(wName);
      if (ownerUid) {
        const ownerSnap = await getDoc(doc(db, "users", ownerUid));
        if (ownerSnap.exists()) setOwnerName(ownerSnap.data().name);
      }
    })();
  }, [profile]);

  const now         = new Date();
  const monthLabel  = now.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const stats = data ? [
    {
      label:  "GMV This Period",
      value:  data.analytics.totalGmv > 0 ? `$${data.analytics.totalGmv.toLocaleString()}` : "—",
      change: null,
      icon:   TrendingUp,
      accent: "yellow",
    },
    {
      label:  "Est. Commission",
      value:  data.orders.commission > 0 ? `$${data.orders.commission.toFixed(2)}` : "—",
      change: null,
      icon:   DollarSign,
      accent: "dark",
    },
    {
      label:  "Total Orders",
      value:  data.orders.total > 0 ? String(data.orders.total) : "—",
      change: data.orders.missing > 0 ? `${data.orders.missing} missing` : null,
      up:     false,
      icon:   ShoppingBag,
      accent: "grey",
    },
    {
      label:  "Active Collabs",
      value:  data.collabs.active > 0 ? String(data.collabs.active) : "—",
      change: data.collabs.awaitingPayment > 0 ? `${data.collabs.awaitingPayment} awaiting pay` : null,
      up:     true,
      icon:   Zap,
      accent: "yellow",
    },
  ] : [];

  const pipelineEntries = data
    ? Object.entries(data.collabs.pipelineByStage).filter(([, count]) => count > 0)
    : [];

  const chartData = data?.analytics.chartData ?? [];

  return (
    <div className="space-y-8">

      {/* Workspace banner — shown to invited creators */}
      {!isAdmin && ownerName && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#E9E9E2] bg-white px-5 py-3.5 shadow-sm">
          <div className="h-8 w-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-[#FFD567]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium">
              You&apos;re working in{" "}
              <span className="font-bold text-[#1A1A1A]">{workspaceName ?? "a workspace"}</span>
              {" "}managed by{" "}
              <span className="font-bold text-[#1A1A1A]">{ownerName}</span>
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[#FFD567]/20 border border-[#FFD567]/40 px-3 py-1 text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">
            Creator
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              Welcome, {firstName}
            </h2>
            {isAdmin && (
              <span className="rounded-full bg-[#1A1A1A] px-3 py-1 text-[10px] font-bold text-[#FFD567] uppercase tracking-wider">
                Admin
              </span>
            )}
          </div>
          {data && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 font-medium">
                {data.samples.dueSoon > 0 && (
                  <>You have <span className="text-[#1A1A1A] font-bold">{data.samples.dueSoon} deadline{data.samples.dueSoon !== 1 ? "s" : ""}</span> coming up</>
                )}
                {data.samples.dueSoon === 0 && (
                  <span className="text-gray-400">No urgent deadlines right now</span>
                )}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-[#E9E9E2] rounded-2xl flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
            <Calendar className="h-4 w-4" /> {monthLabel}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loadingDash
          ? [0, 1, 2, 3].map(i => <StatSkeleton key={i} />)
          : stats.map(({ label, value, change, icon: Icon, accent }) => (
            <div key={label} className="bento-card p-6 flex flex-col justify-between min-h-[140px]">
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${accent === "yellow" ? "bg-[#FFD567]" : accent === "dark" ? "bg-[#1A1A1A]" : "bg-gray-100"}`}>
                  <Icon className={`h-5 w-5 ${accent === "dark" ? "text-white" : "text-[#1A1A1A]"}`} />
                </div>
                {change && (
                  <span className="text-xs font-bold text-amber-500">{change}</span>
                )}
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-[#1A1A1A]">{value}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">{label}</div>
              </div>
            </div>
          ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left: Chart + Activity bento */}
        <div className="lg:col-span-2 space-y-8">

          {/* GMV Chart */}
          <div className="bento-card p-4 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Performance Over Time</h3>
                <p className="text-sm text-gray-400 font-medium">GMV &amp; Commission from analytics</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#FFD567]" />
                  <span className="text-xs font-bold text-[#1A1A1A]">GMV</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#1A1A1A]" />
                  <span className="text-xs font-bold text-[#1A1A1A]">Commission</span>
                </div>
              </div>
            </div>

            {loadingDash ? (
              <div className="h-[220px] flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-[#FFD567] border-t-transparent animate-spin" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-[220px] flex flex-col items-center justify-center text-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">No analytics data yet</p>
                <Link href="/analytics" className="text-xs text-[#1A1A1A] font-bold underline underline-offset-2">
                  Upload TikTok screenshot →
                </Link>
              </div>
            ) : (
              <div className="h-[220px] sm:h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#FFD567" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FFD567" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#1A1A1A" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 600 }} />
                    <Tooltip contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", padding: "12px 16px" }} />
                    <Area type="monotone" dataKey="gmv"        stroke="#FFD567" strokeWidth={4} fillOpacity={1} fill="url(#colorGmv)" />
                    <Area type="monotone" dataKey="commission" stroke="#1A1A1A" strokeWidth={4} fillOpacity={1} fill="url(#colorComm)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Pipeline + Quick Actions */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bento-card p-6">
              <h4 className="text-sm font-bold text-[#1A1A1A] mb-4">Pipeline Status</h4>
              {loadingDash ? (
                <div className="space-y-4">
                  {[0, 1, 2, 3].map(i => <div key={i} className="h-5 rounded bg-gray-100 animate-pulse" />)}
                </div>
              ) : pipelineEntries.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-gray-400">No active collabs</p>
                  <Link href="/collabs" className="text-xs font-bold text-[#1A1A1A] underline underline-offset-2 mt-1 block">
                    Create a collab →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {pipelineEntries.map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${PIPELINE_DOTS[stage] ?? "bg-gray-400"}`} />
                        <span className="text-sm font-medium text-gray-600">{stage}</span>
                      </div>
                      <span className="text-sm font-bold text-[#1A1A1A]">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bento-card p-6 bg-[#1A1A1A] text-white">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold">Quick Actions</h4>
                <Zap className="h-4 w-4 text-[#FFD567]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/samples"
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left block">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Samples</div>
                  <div className="text-lg font-bold">
                    {loadingDash ? "—" : `${data?.samples.needsContent ?? 0} Due`}
                  </div>
                </Link>
                <Link href="/orders"
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left block">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Missing</div>
                  <div className="text-lg font-bold">
                    {loadingDash ? "—" : `${data?.orders.missing ?? 0} Orders`}
                  </div>
                </Link>
                <Link href="/collabs"
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left block">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Awaiting</div>
                  <div className="text-lg font-bold">
                    {loadingDash ? "—" : `$${data?.collabs.awaitingPayment ? data.collabs.pipelineValue.toLocaleString() : "0"}`}
                  </div>
                </Link>
                <Link href="/analytics"
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left block">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pipeline</div>
                  <div className="text-lg font-bold">
                    {loadingDash ? "—" : `${data?.collabs.active ?? 0} Active`}
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-8">

          {/* Deadlines */}
          <div className="bento-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Upcoming</h3>
              <Link href="/samples" className="text-xs font-bold text-gray-400 hover:text-[#1A1A1A]">View All</Link>
            </div>
            {loadingDash ? (
              <div className="space-y-4">
                {[0, 1, 2].map(i => <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />)}
              </div>
            ) : (data?.samples.needsContent ?? 0) === 0 ? (
              <div className="py-8 text-center">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">✓</span>
                </div>
                <p className="text-sm font-bold text-gray-700">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No pending content to create.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data && data.samples.dueSoon > 0 && (
                  <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-amber-700">
                        {data.samples.dueSoon} sample{data.samples.dueSoon !== 1 ? "s" : ""} due within 7 days
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                  <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-gray-700">
                      {data?.samples.needsContent} sample{(data?.samples.needsContent ?? 0) !== 1 ? "s" : ""} need content
                    </div>
                    <Link href="/samples" className="text-[10px] text-violet-600 hover:underline">Go to Samples →</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile card */}
          <div className="bento-card p-6 bg-[#1A1A1A] text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-[#FFD567] flex items-center justify-center text-xl font-black text-[#1A1A1A]">
                {profile?.name?.[0]?.toUpperCase() ?? "C"}
              </div>
              <div>
                <div className="text-sm font-bold">{profile?.name ?? "Creator"}</div>
                <div className="text-xs text-gray-400">{profile?.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Orders</div>
                <div className="text-lg font-bold">{loadingDash ? "—" : (data?.orders.total ?? 0)}</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Commission</div>
                <div className="text-lg font-bold">
                  {loadingDash ? "—" : `$${data?.orders.commission.toFixed(0) ?? "0"}`}
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-[#FFD567] p-3">
              <div className="text-[10px] text-[#1A1A1A]/60 font-bold uppercase tracking-wider mb-1">Pipeline Value</div>
              <div className="text-xl font-black text-[#1A1A1A]">
                {loadingDash ? "—" : `$${(data?.collabs.pipelineValue ?? 0).toLocaleString()}`}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
