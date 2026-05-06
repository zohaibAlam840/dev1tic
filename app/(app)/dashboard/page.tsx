"use client";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Zap, Star, Eye, MousePointer, ArrowRight, Clock,
  CheckCircle2, AlertTriangle, Package, Calendar, User,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const gmvData = [
  { day: "Mon", gmv: 1200, commission: 96 },
  { day: "Tue", gmv: 1900, commission: 152 },
  { day: "Wed", gmv: 1400, commission: 112 },
  { day: "Thu", gmv: 2800, commission: 224 },
  { day: "Fri", gmv: 3200, commission: 256 },
  { day: "Sat", gmv: 2600, commission: 208 },
  { day: "Sun", gmv: 3800, commission: 304 },
];

const STATS = [
  { label: "GMV This Week",    value: "$16,900", change: "+18.4%", up: true,  icon: TrendingUp,  accent: "yellow" },
  { label: "Est. Commission",  value: "$1,352",  change: "+12.1%", up: true,  icon: DollarSign,  accent: "dark" },
  { label: "Orders",           value: "284",     change: "-3.2%",  up: false, icon: ShoppingBag, accent: "grey" },
  { label: "Active Collabs",   value: "12",      change: "+2",     up: true,  icon: Zap,         accent: "yellow" },
];

const PIPELINE = [
  { stage: "Negotiating",      count: 3, dot: "bg-amber-400" },
  { stage: "Contract Signed",  count: 2, dot: "bg-black" },
  { stage: "Content Posted",   count: 4, dot: "bg-gray-400" },
  { stage: "Awaiting Payment", count: 3, dot: "bg-amber-500" },
];

const ACTIVITY = [
  { icon: CheckCircle2, color: "text-emerald-500", text: "Collab with GlowUp Beauty marked Paid",     time: "2h ago" },
  { icon: AlertTriangle, color: "text-amber-500",  text: "3 orders flagged for reconciliation",       time: "4h ago" },
  { icon: Package,       color: "text-black",      text: "Sample received from NaturaPure",           time: "6h ago" },
  { icon: Clock,         color: "text-amber-600",  text: "Content due tomorrow for StyleX Collab",    time: "8h ago" },
];

export default function DashboardPage() {
  const { profile } = useAuth();
  const firstName   = profile?.name?.split(" ")[0] ?? "there";
  const isAdmin     = profile?.role === "admin";

  return (
    <div className="space-y-8">

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
          <div className="flex items-center gap-4 mt-4">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-[#F7F7F2] bg-[#FFD567] flex items-center justify-center text-[10px] font-bold">A</div>
                ))}
             </div>
             <p className="text-sm text-gray-500 font-medium">You have <span className="text-[#1A1A1A] font-bold">3 unread messages</span> and <span className="text-[#1A1A1A] font-bold">2 deadlines</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-white border border-[#E9E9E2] rounded-2xl flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
              <Calendar className="h-4 w-4" /> Sept 2024
           </div>
        </div>
      </div>

      {/* Stat cards - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map(({ label, value, change, up, icon: Icon, accent }) => (
          <div key={label} className="bento-card p-6 flex flex-col justify-between min-h-[140px]">
            <div className="flex items-start justify-between">
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${accent === 'yellow' ? 'bg-[#FFD567]' : accent === 'dark' ? 'bg-[#1A1A1A]' : 'bg-gray-100'}`}>
                <Icon className={`h-5 w-5 ${accent === 'dark' ? 'text-white' : 'text-[#1A1A1A]'}`} />
              </div>
              <span className={`text-xs font-bold ${up ? "text-emerald-600" : "text-red-500"}`}>
                {change}
              </span>
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
        
        {/* Progress / Chart Section */}
        <div className="lg:col-span-2 space-y-8">
           {/* Chart */}
           <div className="bento-card p-4 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A]">Performance Over Time</h3>
                  <p className="text-sm text-gray-400 font-medium">GMV & Commission analytics</p>
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
              <div className="h-[220px] sm:h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gmvData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFD567" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FFD567" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                    />
                    <Area type="monotone" dataKey="gmv" stroke="#FFD567" strokeWidth={4} fillOpacity={1} fill="url(#colorGmv)" />
                    <Area type="monotone" dataKey="commission" stroke="#1A1A1A" strokeWidth={4} fillOpacity={1} fill="url(#colorComm)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Activity Mini Bento */}
           <div className="grid md:grid-cols-2 gap-8">
              <div className="bento-card p-6">
                 <h4 className="text-sm font-bold text-[#1A1A1A] mb-4">Pipeline Status</h4>
                 <div className="space-y-4">
                    {PIPELINE.map(p => (
                       <div key={p.stage} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className={`h-2 w-2 rounded-full ${p.dot}`} />
                             <span className="text-sm font-medium text-gray-600">{p.stage}</span>
                          </div>
                          <span className="text-sm font-bold text-[#1A1A1A]">{p.count}</span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="bento-card p-6 bg-[#1A1A1A] text-white">
                 <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-bold">Quick Actions</h4>
                    <Zap className="h-4 w-4 text-[#FFD567]" />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <button className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left">
                       <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Samples</div>
                       <div className="text-lg font-bold">7 Due</div>
                    </button>
                    <button className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left">
                       <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Messages</div>
                       <div className="text-lg font-bold">3 New</div>
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar / List Section */}
        <div className="space-y-8">
           {/* Recent Activity */}
           <div className="bento-card p-6">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold text-[#1A1A1A]">Activity</h3>
                 <button className="text-xs font-bold text-gray-400 hover:text-[#1A1A1A]">View All</button>
              </div>
              <div className="space-y-6">
                 {ACTIVITY.map((a, i) => (
                    <div key={i} className="flex gap-4">
                       <div className={`h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0`}>
                          <a.icon className={`h-5 w-5 ${a.color}`} />
                       </div>
                       <div className="flex-1">
                          <div className="text-sm font-bold text-[#1A1A1A] leading-tight">{a.text}</div>
                          <div className="text-[11px] text-gray-400 mt-1 font-medium">{a.time}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* User Profile Card - Like the one in the image */}
           <div className="bento-card overflow-hidden group">
              <div className="relative h-48 bg-gray-100">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                 <div className="absolute bottom-4 left-4 z-20">
                    <div className="text-white font-bold">Ali Creator</div>
                    <div className="text-white/70 text-xs font-medium">Premium Member</div>
                 </div>
                 <div className="absolute top-4 right-4 z-20">
                    <div className="bg-[#FFD567] text-[#1A1A1A] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                       $12.4k Monthly
                    </div>
                 </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}
