"use client";
import { useState } from "react";
import clsx from "clsx";
import { Upload, TrendingUp, DollarSign, ShoppingBag, Eye, MousePointer, Download, BarChart2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const DAILY_DATA = [
  { date:"Apr 26", gmv:980,  items:42, commission:78,  impressions:12400, clicks:820  },
  { date:"Apr 27", gmv:1340, items:58, commission:107, impressions:15200, clicks:1010 },
  { date:"Apr 28", gmv:1120, items:49, commission:90,  impressions:13800, clicks:890  },
  { date:"Apr 29", gmv:2100, items:87, commission:168, impressions:22000, clicks:1540 },
  { date:"Apr 30", gmv:1890, items:76, commission:151, impressions:19500, clicks:1320 },
  { date:"May 1",  gmv:2400, items:96, commission:192, impressions:25000, clicks:1680 },
  { date:"May 2",  gmv:3100, items:124,commission:248, impressions:31000, clicks:2100 },
];

const TOP_PRODUCTS = [
  { name:"Hydra Serum 50ml",    gmv:4200, items:84,  commission:336 },
  { name:"FitLife Protein 1kg", gmv:3100, items:48,  commission:310 },
  { name:"VitaGlow Vitamin C",  gmv:2800, items:62,  commission:224 },
  { name:"StyleX Blazer",       gmv:2200, items:25,  commission:154 },
  { name:"EcoSkin Moisturizer", gmv:1900, items:38,  commission:152 },
];

const KPIS = [
  { label:"Attr. GMV",      value:"$16,930", change:"+18.4%", icon:TrendingUp,  bg:"bg-violet-50 border-violet-100", ic:"bg-violet-100 text-violet-600", tx:"text-violet-700" },
  { label:"Est. Commission",value:"$1,354",  change:"+12.1%", icon:DollarSign,  bg:"bg-pink-50 border-pink-100",     ic:"bg-pink-100 text-pink-600",     tx:"text-pink-700" },
  { label:"Items Sold",     value:"532",     change:"+8.3%",  icon:ShoppingBag, bg:"bg-blue-50 border-blue-100",     ic:"bg-blue-100 text-blue-600",     tx:"text-blue-700" },
  { label:"Impressions",    value:"139.9K",  change:"+22.6%", icon:Eye,         bg:"bg-emerald-50 border-emerald-100",ic:"bg-emerald-100 text-emerald-600",tx:"text-emerald-700" },
  { label:"Clicks",         value:"9,360",   change:"+15.2%", icon:MousePointer,bg:"bg-amber-50 border-amber-100",   ic:"bg-amber-100 text-amber-600",   tx:"text-amber-700" },
];

export default function AnalyticsPage() {
  const [range, setRange]   = useState("7D");
  const [metric, setMetric] = useState<"gmv"|"items"|"commission">("gmv");

  return (
    <div className="p-5 lg:p-7 space-y-6">

      {/* Import banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-pink-200 bg-pink-50 p-5">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-pink-100 flex items-center justify-center">
          <Upload className="h-5 w-5 text-pink-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900 mb-0.5">Import Daily Analytics</div>
          <p className="text-xs text-gray-500">Upload your TikTok analytics screenshot — OCR extracts GMV, commissions, impressions and clicks automatically.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm shadow-pink-200">
            <Upload className="h-4 w-4" /> Upload Daily
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <BarChart2 className="h-4 w-4" /> Upload Products
          </button>
        </div>
      </div>

      {/* Range + export */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {["Today","7D","30D","Custom"].map(d=>(
            <button key={d} onClick={()=>setRange(d)}
              className={clsx("px-4 py-2 text-xs font-medium transition-all", range===d ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-50")}>
              {d}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {KPIS.map(({ label, value, change, icon: Icon, bg, ic, tx }) => (
          <div key={label} className={`rounded-2xl border p-4 ${bg}`}>
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center mb-3 ${ic}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className={`text-xl font-bold ${tx}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            <div className="text-xs font-semibold text-emerald-600 mt-1">{change}</div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <div className="text-sm font-semibold text-gray-900">Performance Trend</div>
            <div className="text-xs text-gray-400 mt-0.5">Last 7 days</div>
          </div>
          <div className="flex rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            {(["gmv","items","commission"] as const).map(m=>(
              <button key={m} onClick={()=>setMetric(m)}
                className={clsx("px-3 py-1.5 text-xs font-medium capitalize transition-all", metric===m ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-white")}>
                {m==="gmv" ? "GMV" : m==="items" ? "Items Sold" : "Commission"}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={DAILY_DATA} margin={{ top:0, right:0, left:-20, bottom:0 }}>
            <defs>
              <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="date" tick={{ fill:"#9CA3AF", fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"#9CA3AF", fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:12, fontSize:12, boxShadow:"0 4px 16px #0001" }} labelStyle={{ color:"#374151" }} itemStyle={{ color:"#111827" }} />
            <Area type="monotone" dataKey={metric} stroke="#7C3AED" strokeWidth={2.5} fill="url(#mGrad)" dot={{ fill:"#7C3AED", r:3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Impressions + Clicks */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-gray-900 mb-1">Impressions &amp; Clicks</div>
        <div className="text-xs text-gray-400 mb-5">Last 7 days</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={DAILY_DATA} margin={{ top:0, right:0, left:-20, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="date" tick={{ fill:"#9CA3AF", fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:"#9CA3AF", fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:12, fontSize:12, boxShadow:"0 4px 16px #0001" }} labelStyle={{ color:"#374151" }} itemStyle={{ color:"#111827" }} />
            <Legend wrapperStyle={{ fontSize:11, color:"#6B7280", paddingTop:8 }} />
            <Bar dataKey="impressions" name="Impressions" fill="#6366F1" radius={[4,4,0,0]} opacity={0.85} />
            <Bar dataKey="clicks" name="Clicks" fill="#EC4899" radius={[4,4,0,0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top products */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">Top Products</div>
          <div className="text-xs text-gray-400">Last 7 days</div>
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <div>Product</div><div>Attr. GMV</div><div>Items</div><div>Est. Comm.</div>
        </div>
        {TOP_PRODUCTS.map((p,i)=>(
          <div key={p.name} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-all items-center">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-lg bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-700">{i+1}</div>
              <span className="text-sm text-gray-900">{p.name}</span>
            </div>
            <div className="text-sm font-semibold text-gray-900">${p.gmv.toLocaleString()}</div>
            <div className="text-sm text-gray-600">{p.items}</div>
            <div className="text-sm font-semibold text-emerald-600">+${p.commission}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
