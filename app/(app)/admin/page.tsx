"use client";
import { useState } from "react";
import clsx from "clsx";
import {
  Users, TrendingUp, DollarSign, ShoppingBag, Zap, Star,
  Search, MoreHorizontal, CheckCircle2, AlertTriangle,
  Shield, BarChart3, Eye, UserPlus, Download, Filter,
  ArrowUpRight, ArrowDownRight, Clock, XCircle, Activity,
} from "lucide-react";

type CreatorStatus = "active" | "inactive" | "suspended";

const CREATORS = [
  {
    id: 1, name: "Ali Creator",  email: "ali@creator.com",   handle: "@alicreator",
    status: "active"    as CreatorStatus, joined: "Jan 2024",
    gmv: 16900, commission: 1354, collabs: 12, orders: 284, samples: 7,
    lastActive: "2h ago", tier: "Premium",
  },
  {
    id: 2, name: "Sara Fashion", email: "sara@fashion.com",  handle: "@sarafashion",
    status: "active"    as CreatorStatus, joined: "Feb 2024",
    gmv: 12400, commission: 992,  collabs: 9,  orders: 201, samples: 4,
    lastActive: "1d ago", tier: "Standard",
  },
  {
    id: 3, name: "Mike Fitness",  email: "mike@fitness.com",  handle: "@mikefitness",
    status: "active"    as CreatorStatus, joined: "Mar 2024",
    gmv: 9800,  commission: 784,  collabs: 7,  orders: 156, samples: 3,
    lastActive: "3h ago", tier: "Standard",
  },
  {
    id: 4, name: "Layla Beauty",  email: "layla@beauty.com",  handle: "@laylabeauty",
    status: "inactive"  as CreatorStatus, joined: "Apr 2024",
    gmv: 5200,  commission: 416,  collabs: 4,  orders: 89,  samples: 2,
    lastActive: "2w ago", tier: "Standard",
  },
  {
    id: 5, name: "Tom Tech",      email: "tom@techreviews.com", handle: "@tomtech",
    status: "suspended" as CreatorStatus, joined: "Jan 2024",
    gmv: 3100,  commission: 248,  collabs: 2,  orders: 44,  samples: 0,
    lastActive: "1mo ago", tier: "Standard",
  },
];

const ALERTS = [
  { id: 1, creator: "Ali Creator",  type: "Payment Overdue",   severity: "high",   time: "1h ago",  collab: "GlowUp Beauty" },
  { id: 2, creator: "Sara Fashion", type: "Contract Pending",  severity: "medium", time: "3h ago",  collab: "StyleX Drop" },
  { id: 3, creator: "Mike Fitness", type: "Post Due",          severity: "high",   time: "5h ago",  collab: "FitLife Protein" },
  { id: 4, creator: "Layla Beauty", type: "Collab Expiring",   severity: "low",    time: "1d ago",  collab: "NaturaPure Kit" },
  { id: 5, creator: "Ali Creator",  type: "Response Needed",   severity: "medium", time: "2h ago",  collab: "EcoSkin" },
];

const RECENT_COLLABS = [
  { creator: "Ali Creator",  brand: "GlowUp Beauty",  stage: "Awaiting Payment", value: 1200 },
  { creator: "Sara Fashion", brand: "StyleX Collection", stage: "Content Posted",  value: 1500 },
  { creator: "Mike Fitness", brand: "FitLife Protein",  stage: "Contract Signed", value: 800 },
  { creator: "Layla Beauty", brand: "NaturaPure",        stage: "Negotiating",     value: 600 },
];

const STATUS_STYLES: Record<CreatorStatus, string> = {
  active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive:  "bg-gray-50    text-gray-500    border-gray-200",
  suspended: "bg-red-50     text-red-600     border-red-200",
};

const SEVERITY_STYLES: Record<string, string> = {
  high:   "bg-red-50    text-red-600    border-red-200",
  medium: "bg-amber-50  text-amber-700  border-amber-200",
  low:    "bg-blue-50   text-blue-700   border-blue-200",
};

const STAGE_STYLES: Record<string, string> = {
  "Awaiting Payment": "bg-red-50 text-red-600 border-red-200",
  "Content Posted":   "bg-[#FFD567]/20 text-[#1A1A1A] border-[#FFD567]/40",
  "Contract Signed":  "bg-gray-900 text-white border-gray-900",
  "Negotiating":      "bg-amber-50 text-amber-700 border-amber-200",
};

type AdminTab = "overview" | "creators" | "alerts" | "collabs";

export default function AdminPage() {
  const [tab, setTab]               = useState<AdminTab>("overview");
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<CreatorStatus | "All">("All");

  const totalGMV        = CREATORS.reduce((s, c) => s + c.gmv, 0);
  const totalCommission = CREATORS.reduce((s, c) => s + c.commission, 0);
  const totalOrders     = CREATORS.reduce((s, c) => s + c.orders, 0);
  const totalCollabs    = CREATORS.reduce((s, c) => s + c.collabs, 0);
  const activeCount     = CREATORS.filter(c => c.status === "active").length;
  const alertCount      = ALERTS.filter(a => a.severity === "high").length;

  const filteredCreators = CREATORS.filter(c => {
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.email.toLowerCase().includes(search.toLowerCase()) &&
        !c.handle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-5 lg:p-7 space-y-6">

      {/* Admin badge */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
          <Shield className="h-5 w-5 text-[#FFD567]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Admin Dashboard</h2>
          <p className="text-xs text-gray-400">Full platform overview · {CREATORS.length} creators</p>
        </div>
        {alertCount > 0 && (
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" /> {alertCount} urgent alerts
          </span>
        )}
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total GMV",        value: `$${(totalGMV / 1000).toFixed(1)}k`,   icon: TrendingUp,  change: "+18.4%", up: true,  bg: "bg-[#FFD567]/10 border-[#FFD567]/30" },
          { label: "Total Commission", value: `$${(totalCommission / 1000).toFixed(1)}k`, icon: DollarSign, change: "+12.1%", up: true,  bg: "bg-emerald-50 border-emerald-100" },
          { label: "Total Orders",     value: totalOrders,                             icon: ShoppingBag, change: "+8.3%",  up: true,  bg: "bg-blue-50 border-blue-100" },
          { label: "Active Creators",  value: `${activeCount}/${CREATORS.length}`,    icon: Users,       change: `${alertCount} alerts`, up: alertCount === 0, bg: "bg-white border-gray-200" },
        ].map(({ label, value, icon: Icon, change, up, bg }) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${bg}`}>
            <div className="flex items-center justify-between mb-3">
              <Icon className="h-5 w-5 text-[#1A1A1A]/60" />
              <span className={clsx("text-xs font-bold flex items-center gap-0.5", up ? "text-emerald-600" : "text-red-500")}>
                {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {change}
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1A1A1A]">{value}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#E9E9E2] bg-white p-1 w-fit shadow-sm">
        {([
          { id: "overview",  label: "Overview",  icon: BarChart3 },
          { id: "creators",  label: "Creators",  icon: Users },
          { id: "alerts",    label: "Alerts",    icon: AlertTriangle },
          { id: "collabs",   label: "Collabs",   icon: Zap },
        ] as { id: AdminTab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={clsx(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all",
              tab === id ? "bg-[#1A1A1A] text-white shadow" : "text-gray-500 hover:text-[#1A1A1A]"
            )}>
            <Icon className="h-3.5 w-3.5" />
            {label}
            {id === "alerts" && ALERTS.length > 0 && (
              <span className={clsx("h-4 min-w-4 rounded-full px-1 flex items-center justify-center text-[9px] font-bold",
                tab === id ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
              )}>{ALERTS.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Creator breakdown */}
          <div className="bento-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-[#1A1A1A]">Creator Performance</h3>
              <span className="text-xs text-gray-400">{CREATORS.length} total</span>
            </div>
            <div className="space-y-4">
              {CREATORS.filter(c => c.status === "active").map((c, i) => {
                const pct = Math.round((c.gmv / totalGMV) * 100);
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-[#FFD567] flex items-center justify-center text-[10px] font-bold text-[#1A1A1A]">
                          {c.name[0]}
                        </div>
                        <span className="font-medium text-gray-700">{c.name}</span>
                      </div>
                      <span className="font-bold text-[#1A1A1A]">${c.gmv.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FFD567] to-[#1A1A1A]/20 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-400">{pct}% of total GMV</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform summary */}
          <div className="space-y-4">
            <div className="bento-card p-6">
              <h3 className="text-sm font-bold text-[#1A1A1A] mb-4">Platform Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Collabs",  value: totalCollabs,              icon: Zap,        color: "text-violet-600",  bg: "bg-violet-50" },
                  { label: "Total Samples",  value: CREATORS.reduce((s,c)=>s+c.samples,0), icon: Star, color: "text-amber-600",   bg: "bg-amber-50" },
                  { label: "Active Alerts",  value: ALERTS.length,             icon: Activity,   color: "text-red-600",     bg: "bg-red-50" },
                  { label: "Avg. Commission",value: `$${Math.round(totalCommission/activeCount)}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className={`rounded-2xl p-4 ${bg} flex items-center gap-3`}>
                    <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                    <div>
                      <div className="text-lg font-bold text-[#1A1A1A]">{value}</div>
                      <div className="text-[10px] text-gray-500 font-medium">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status breakdown */}
            <div className="bento-card p-6">
              <h3 className="text-sm font-bold text-[#1A1A1A] mb-4">Creator Status</h3>
              {(["active","inactive","suspended"] as CreatorStatus[]).map(s => {
                const count = CREATORS.filter(c => c.status === s).length;
                const pct   = Math.round((count / CREATORS.length) * 100);
                return (
                  <div key={s} className="flex items-center gap-3 py-2.5 border-b border-[#E9E9E2] last:border-0">
                    <div className={clsx("h-2.5 w-2.5 rounded-full", s==="active"?"bg-emerald-500":s==="inactive"?"bg-gray-300":"bg-red-500")} />
                    <span className="flex-1 text-sm capitalize text-gray-700 font-medium">{s}</span>
                    <span className="text-sm font-bold text-[#1A1A1A]">{count}</span>
                    <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATORS TAB ── */}
      {tab === "creators" && (
        <div className="space-y-4">

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search creator name, email or handle..."
                className="w-full rounded-xl border border-[#E9E9E2] bg-white pl-9 pr-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 outline-none focus:border-[#FFD567] transition-all shadow-sm" />
            </div>
            <div className="flex gap-2">
              <div className="flex rounded-xl border border-[#E9E9E2] bg-white overflow-hidden shadow-sm">
                {(["All","active","inactive","suspended"] as (CreatorStatus|"All")[]).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={clsx("px-3 py-2.5 text-xs font-medium capitalize transition-all",
                      statusFilter===s ? "bg-[#1A1A1A] text-white" : "text-gray-600 hover:bg-gray-50"
                    )}>
                    {s}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 rounded-xl border border-[#E9E9E2] bg-white px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                <UserPlus className="h-4 w-4" /> Invite
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-[#E9E9E2] bg-white px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bento-card overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[680px]">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_40px] gap-4 px-6 py-3 border-b border-[#E9E9E2] bg-[#F7F7F2]/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <div>Creator</div><div>Email / Handle</div><div>GMV</div><div>Collabs</div><div>Orders</div><div>Status</div><div/>
            </div>

            {filteredCreators.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">No creators found</div>
            ) : filteredCreators.map(c => (
              <div key={c.id}
                className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_40px] gap-4 px-6 py-5 border-b border-[#E9E9E2] last:border-0 hover:bg-[#F7F7F2]/30 transition-all items-center">

                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-[#FFD567] flex items-center justify-center text-[#1A1A1A] text-sm font-bold border-2 border-white shadow-sm">
                    {c.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#1A1A1A] truncate">{c.name}</div>
                    <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {c.lastActive}
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="text-xs text-gray-600 truncate">{c.email}</div>
                  <div className="text-[10px] text-violet-600 font-medium truncate">{c.handle}</div>
                </div>

                <div>
                  <div className="text-sm font-bold text-[#1A1A1A]">${c.gmv.toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-600 font-medium">${c.commission} comm.</div>
                </div>

                <div className="text-sm font-bold text-[#1A1A1A]">{c.collabs}</div>
                <div className="text-sm font-bold text-[#1A1A1A]">{c.orders}</div>

                <div>
                  <span className={clsx("rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider capitalize", STATUS_STYLES[c.status])}>
                    {c.status}
                  </span>
                </div>

                <button className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] transition-all">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ALERTS TAB ── */}
      {tab === "alerts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{ALERTS.length} active alerts across all creators</p>
            <button className="text-xs font-bold text-gray-400 hover:text-[#1A1A1A] transition-colors">Mark All Read</button>
          </div>
          {ALERTS.map(a => (
            <div key={a.id} className={clsx(
              "flex items-start gap-4 rounded-2xl border p-5 transition-all hover:shadow-sm",
              a.severity === "high" ? "bg-red-50 border-red-200" : a.severity === "medium" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"
            )}>
              <div className={clsx("h-9 w-9 shrink-0 rounded-xl flex items-center justify-center",
                a.severity==="high" ? "bg-red-100" : a.severity==="medium" ? "bg-amber-100" : "bg-blue-100"
              )}>
                <AlertTriangle className={clsx("h-4 w-4",
                  a.severity==="high" ? "text-red-600" : a.severity==="medium" ? "text-amber-700" : "text-blue-600"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-bold text-[#1A1A1A]">{a.type}</span>
                  <span className={clsx("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", SEVERITY_STYLES[a.severity])}>
                    {a.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  <span className="text-violet-600">{a.creator}</span> · {a.collab}
                </p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0 font-medium">{a.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── COLLABS TAB ── */}
      {tab === "collabs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">All active collabs across creators</p>
            <button className="flex items-center gap-2 rounded-xl border border-[#E9E9E2] bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm text-xs">
              <Download className="h-3.5 w-3.5" /> Export All
            </button>
          </div>
          <div className="bento-card overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
            <div className="grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr] gap-4 px-6 py-3 border-b border-[#E9E9E2] bg-[#F7F7F2]/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <div>Creator</div><div>Brand / Collab</div><div>Stage</div><div>Value</div><div/>
            </div>
            {RECENT_COLLABS.map((c, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr] gap-4 px-6 py-5 border-b border-[#E9E9E2] last:border-0 hover:bg-[#F7F7F2]/30 transition-all items-center">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-[#FFD567] flex items-center justify-center text-[10px] font-bold text-[#1A1A1A]">
                    {c.creator[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{c.creator}</span>
                </div>
                <div className="text-sm font-bold text-[#1A1A1A]">{c.brand}</div>
                <div>
                  <span className={clsx("rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider", STAGE_STYLES[c.stage] ?? "bg-gray-100 text-gray-600 border-gray-200")}>
                    {c.stage}
                  </span>
                </div>
                <div className="text-sm font-bold text-[#1A1A1A]">${c.value.toLocaleString()}</div>
                <button className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors">
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
              </div>
            ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
