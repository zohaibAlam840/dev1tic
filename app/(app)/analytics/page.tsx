"use client";
import { useState, useRef } from "react";
import clsx from "clsx";
import {
  Upload, TrendingUp, DollarSign, ShoppingBag, Eye, MousePointer,
  Download, BarChart2, ImageIcon, X, Plus,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type DailyRow   = { date: string; gmv: number; items: number; commission: number; impressions: number; clicks: number };
type ProductRow = { name: string; gmv: number; items: number; commission: number };
type ManualTab  = "daily" | "products";

// ── Manual analytics entry modal ──────────────────────────────────────────────
function ManualAnalyticsModal({
  onClose,
  onAddDaily,
  onAddProduct,
}: {
  onClose: () => void;
  onAddDaily:   (row: DailyRow) => void;
  onAddProduct: (row: ProductRow) => void;
}) {
  const [tab,          setTab]          = useState<ManualTab>("daily");

  // Daily fields
  const [date,         setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [gmv,          setGmv]          = useState("");
  const [items,        setItems]        = useState("");
  const [commission,   setCommission]   = useState("");
  const [impressions,  setImpressions]  = useState("");
  const [clicks,       setClicks]       = useState("");

  // Product fields
  const [pName,        setPName]        = useState("");
  const [pGmv,         setPGmv]         = useState("");
  const [pItems,       setPItems]       = useState("");
  const [pComm,        setPComm]        = useState("");

  const [error,        setError]        = useState<string | null>(null);

  function submitDaily(e: React.FormEvent) {
    e.preventDefault();
    onAddDaily({
      date,
      gmv:         parseFloat(gmv)         || 0,
      items:       parseInt(items)          || 0,
      commission:  parseFloat(commission)  || 0,
      impressions: parseInt(impressions)   || 0,
      clicks:      parseInt(clicks)        || 0,
    });
    onClose();
  }

  function submitProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!pName.trim()) { setError("Product name is required."); return; }
    onAddProduct({
      name:       pName.trim(),
      gmv:        parseFloat(pGmv)   || 0,
      items:      parseInt(pItems)   || 0,
      commission: parseFloat(pComm)  || 0,
    });
    onClose();
  }

  return (
    <>
      <button aria-label="close" className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-2xl">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <div className="text-sm font-bold text-gray-900">Add Analytics Manually</div>
              <div className="text-xs text-gray-400 mt-0.5">Enter your TikTok stats by hand</div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="h-4 w-4 text-gray-500" /></button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-3 border-b border-gray-100 bg-gray-50">
            {([{ id: "daily", label: "Daily Stats" }, { id: "products", label: "Top Product" }] as { id: ManualTab; label: string }[]).map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setError(null); }}
                className={clsx("flex-1 rounded-lg py-2 text-xs font-semibold transition-all",
                  tab === t.id ? "bg-white text-violet-700 shadow border border-violet-100" : "text-gray-500 hover:text-gray-700"
                )}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "daily" ? (
            <form onSubmit={submitDaily} className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Date</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">GMV ($)</label>
                  <input type="number" step="0.01" min="0" value={gmv} onChange={e => setGmv(e.target.value)} placeholder="1234.56"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Items Sold</label>
                  <input type="number" min="0" value={items} onChange={e => setItems(e.target.value)} placeholder="42"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Commission ($)</label>
                  <input type="number" step="0.01" min="0" value={commission} onChange={e => setCommission(e.target.value)} placeholder="98.76"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Impressions</label>
                  <input type="number" min="0" value={impressions} onChange={e => setImpressions(e.target.value)} placeholder="12400"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Clicks</label>
                  <input type="number" min="0" value={clicks} onChange={e => setClicks(e.target.value)} placeholder="820"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                </div>
              </div>
              <button type="submit" className="w-full rounded-2xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700 transition-all">
                Add Day
              </button>
            </form>
          ) : (
            <form onSubmit={submitProduct} className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Product Name</label>
                <input required value={pName} onChange={e => setPName(e.target.value)} placeholder="Hydra Serum 50ml"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Attr. GMV ($)</label>
                  <input type="number" step="0.01" min="0" value={pGmv} onChange={e => setPGmv(e.target.value)} placeholder="4200"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Items Sold</label>
                  <input type="number" min="0" value={pItems} onChange={e => setPItems(e.target.value)} placeholder="84"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Est. Commission ($)</label>
                  <input type="number" step="0.01" min="0" value={pComm} onChange={e => setPComm(e.target.value)} placeholder="336"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                </div>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button type="submit" className="w-full rounded-2xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700 transition-all">
                Add Product
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default function AnalyticsPage() {
  const [range,    setRange]   = useState("7D");
  const [metric,   setMetric]  = useState<"gmv" | "items" | "commission">("gmv");

  const [dailyData,    setDailyData]    = useState<DailyRow[]>([]);
  const [topProducts,  setTopProducts]  = useState<ProductRow[]>([]);

  const [uploadingDaily,    setUploadingDaily]    = useState(false);
  const [uploadingProducts, setUploadingProducts] = useState(false);
  const [dailyError,        setDailyError]        = useState<string | null>(null);
  const [productsError,     setProductsError]     = useState<string | null>(null);
  const [manualOpen,        setManualOpen]        = useState(false);

  const dailyRef    = useRef<HTMLInputElement>(null);
  const productsRef = useRef<HTMLInputElement>(null);

  // KPIs computed from real uploaded data
  const totalGmv         = dailyData.reduce((s, d) => s + d.gmv, 0);
  const totalComm        = dailyData.reduce((s, d) => s + d.commission, 0);
  const totalItems       = dailyData.reduce((s, d) => s + d.items, 0);
  const totalImpressions = dailyData.reduce((s, d) => s + d.impressions, 0);
  const totalClicks      = dailyData.reduce((s, d) => s + d.clicks, 0);

  const hasData = dailyData.length > 0 || topProducts.length > 0;

  async function handleUpload(file: File, type: "analytics_daily" | "analytics_products") {
    const isDaily = type === "analytics_daily";
    if (isDaily) { setUploadingDaily(true);    setDailyError(null); }
    else          { setUploadingProducts(true); setProductsError(null); }

    try {
      const form = new FormData();
      form.append("image", file);
      form.append("type",  type);

      const res  = await fetch("/api/ocr", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "OCR failed");

      if (isDaily) {
        const d = json.data as DailyRow;
        setDailyData(prev => {
          const idx = prev.findIndex(r => r.date === d.date);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = d;
            return next;
          }
          return [...prev, d].sort((a, b) => a.date.localeCompare(b.date));
        });
      } else {
        setTopProducts(json.data as ProductRow[]);
      }
    } catch (err: any) {
      if (isDaily) setDailyError(err.message);
      else         setProductsError(err.message);
    } finally {
      if (isDaily) setUploadingDaily(false);
      else         setUploadingProducts(false);
    }
  }

  function onFileChange(type: "analytics_daily" | "analytics_products") {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file, type);
      e.target.value = "";
    };
  }

  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000   ? `${(n / 1_000).toFixed(1)}K`
    : n.toString();

  return (
    <div className="p-5 lg:p-7 space-y-6">

      {/* Hidden file inputs */}
      <input ref={dailyRef}    type="file" accept="image/*" className="hidden" onChange={onFileChange("analytics_daily")} />
      <input ref={productsRef} type="file" accept="image/*" className="hidden" onChange={onFileChange("analytics_products")} />

      {manualOpen && (
        <ManualAnalyticsModal
          onClose={() => setManualOpen(false)}
          onAddDaily={row => {
            setDailyData(prev => {
              const idx = prev.findIndex(r => r.date === row.date);
              if (idx >= 0) { const next = [...prev]; next[idx] = row; return next; }
              return [...prev, row].sort((a, b) => a.date.localeCompare(b.date));
            });
          }}
          onAddProduct={row => setTopProducts(prev => [...prev, row])}
        />
      )}

      {/* Import banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-pink-200 bg-pink-50 p-5">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-pink-100 flex items-center justify-center">
          <Upload className="h-5 w-5 text-pink-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 mb-0.5">Import Analytics via Screenshot</div>
          <p className="text-xs text-gray-500">
            Upload your TikTok analytics screenshot — Gemini AI extracts GMV, commission, impressions and clicks automatically.
          </p>
          {dailyError    && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><X className="h-3 w-3" />{dailyError}</p>}
          {productsError && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><X className="h-3 w-3" />{productsError}</p>}
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => dailyRef.current?.click()}
            disabled={uploadingDaily}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm disabled:opacity-60"
          >
            {uploadingDaily
              ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <Upload className="h-4 w-4" />}
            Upload Screenshot
          </button>
          <button
            onClick={() => setManualOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm font-medium text-pink-700 hover:bg-pink-50 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Manually
          </button>
          <button
            onClick={() => productsRef.current?.click()}
            disabled={uploadingProducts}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-60"
          >
            {uploadingProducts
              ? <span className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
              : <BarChart2 className="h-4 w-4" />}
            Upload Products
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 rounded-3xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-6">
            <ImageIcon className="h-10 w-10 text-violet-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No analytics data yet</h3>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-6">
            Upload a screenshot of your TikTok analytics dashboard. Gemini AI will automatically extract all the numbers for you.
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={() => dailyRef.current?.click()}
              disabled={uploadingDaily}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-60"
            >
              {uploadingDaily
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <Upload className="h-4 w-4" />}
              Upload screenshot
            </button>
            <button
              onClick={() => setManualOpen(true)}
              className="flex items-center gap-2 rounded-2xl border border-pink-200 bg-white px-6 py-3 text-sm font-medium text-pink-700 hover:bg-pink-50 transition-all"
            >
              <Plus className="h-4 w-4" /> Add manually
            </button>
          </div>
        </div>
      )}

      {/* Live data views */}
      {hasData && (
        <>
          {/* Range + export */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              {["Today", "7D", "30D", "Custom"].map(d => (
                <button key={d} onClick={() => setRange(d)}
                  className={clsx("px-4 py-2 text-xs font-medium transition-all",
                    range === d ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-50")}>
                  {d}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>

          {/* KPI cards */}
          {dailyData.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: "Attr. GMV",       value: `$${totalGmv.toLocaleString()}`,  icon: TrendingUp,  bg: "bg-violet-50 border-violet-100",    ic: "bg-violet-100 text-violet-600",    tx: "text-violet-700" },
                { label: "Est. Commission", value: `$${totalComm.toFixed(2)}`,        icon: DollarSign,  bg: "bg-pink-50 border-pink-100",        ic: "bg-pink-100 text-pink-600",        tx: "text-pink-700" },
                { label: "Items Sold",      value: totalItems.toLocaleString(),       icon: ShoppingBag, bg: "bg-blue-50 border-blue-100",        ic: "bg-blue-100 text-blue-600",        tx: "text-blue-700" },
                { label: "Impressions",     value: fmt(totalImpressions),             icon: Eye,         bg: "bg-emerald-50 border-emerald-100",  ic: "bg-emerald-100 text-emerald-600",  tx: "text-emerald-700" },
                { label: "Clicks",          value: fmt(totalClicks),                  icon: MousePointer,bg: "bg-amber-50 border-amber-100",      ic: "bg-amber-100 text-amber-600",      tx: "text-amber-700" },
              ].map(({ label, value, icon: Icon, bg, ic, tx }) => (
                <div key={label} className={`rounded-2xl border p-4 ${bg}`}>
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center mb-3 ${ic}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className={`text-xl font-bold ${tx}`}>{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Trend chart */}
          {dailyData.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Performance Trend</div>
                  <div className="text-xs text-gray-400 mt-0.5">{dailyData.length} day{dailyData.length !== 1 ? "s" : ""} of data</div>
                </div>
                <div className="flex rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                  {(["gmv", "items", "commission"] as const).map(m => (
                    <button key={m} onClick={() => setMetric(m)}
                      className={clsx("px-3 py-1.5 text-xs font-medium capitalize transition-all",
                        metric === m ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-white")}>
                      {m === "gmv" ? "GMV" : m === "items" ? "Items Sold" : "Commission"}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px #0001" }} />
                  <Area type="monotone" dataKey={metric} stroke="#7C3AED" strokeWidth={2.5} fill="url(#mGrad)" dot={{ fill: "#7C3AED", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Impressions + Clicks */}
          {dailyData.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-900 mb-1">Impressions &amp; Clicks</div>
              <div className="text-xs text-gray-400 mb-5">{dailyData.length} day{dailyData.length !== 1 ? "s" : ""} of data</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px #0001" }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#6B7280", paddingTop: 8 }} />
                  <Bar dataKey="impressions" name="Impressions" fill="#6366F1" radius={[4, 4, 0, 0]} opacity={0.85} />
                  <Bar dataKey="clicks"      name="Clicks"      fill="#EC4899" radius={[4, 4, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top products */}
          {topProducts.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">Top Products</div>
                <button
                  onClick={() => productsRef.current?.click()}
                  className="text-xs text-violet-600 hover:underline"
                >
                  Update
                </button>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[420px]">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    <div>Product</div><div>Attr. GMV</div><div>Items</div><div>Est. Comm.</div>
                  </div>
                  {topProducts.map((p, i) => (
                    <div key={p.name} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-all items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 shrink-0 rounded-lg bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-700">{i + 1}</div>
                        <span className="text-sm text-gray-900 truncate">{p.name}</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">${p.gmv.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{p.items}</div>
                      <div className="text-sm font-semibold text-emerald-600">+${p.commission}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Prompt to upload products if only daily data exists */}
          {dailyData.length > 0 && topProducts.length === 0 && (
            <div className="flex items-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-white p-5">
              <BarChart2 className="h-8 w-8 text-gray-300 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">No product breakdown yet</div>
                <p className="text-xs text-gray-400 mt-0.5">Upload a top-products screenshot to see per-product GMV and commission.</p>
              </div>
              <button
                onClick={() => productsRef.current?.click()}
                disabled={uploadingProducts}
                className="shrink-0 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-60"
              >
                {uploadingProducts
                  ? <span className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                  : <Upload className="h-4 w-4" />}
                Upload
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
