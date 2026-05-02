"use client";
import { useState, useRef } from "react";
import clsx from "clsx";
import {
  Upload, Search, Download, CheckCircle2, XCircle,
  AlertTriangle, Clock, Flag, RefreshCw, ChevronDown,
  ShoppingBag, DollarSign, FileSpreadsheet, AlertCircle,
  CheckCheck, HelpCircle, ArrowUpDown, X,
} from "lucide-react";

type ReconStatus = "Paid" | "Missing" | "Returned/Canceled" | "Flag";
type Tab = "reconciliation" | "orders" | "settled" | "ineligible" | "csv-check";

// Orders already in the system
const SYSTEM_ORDERS = [
  { id:"ORD-8821", product:"Hydra Serum 50ml",       commBase:42, estComm:3.36, date:"May 2", status:"Paid"                as ReconStatus },
  { id:"ORD-8822", product:"FitLife Protein 1kg",    commBase:65, estComm:6.50, date:"May 2", status:"Paid"                as ReconStatus },
  { id:"ORD-8823", product:"StyleX Blazer",          commBase:89, estComm:6.23, date:"May 2", status:"Missing"             as ReconStatus },
  { id:"ORD-8824", product:"NaturaPure Face Oil",    commBase:38, estComm:4.56, date:"May 2", status:"Returned/Canceled"   as ReconStatus },
  { id:"ORD-8825", product:"Hydra Serum 100ml",      commBase:68, estComm:5.44, date:"May 3", status:"Paid"                as ReconStatus },
  { id:"ORD-8826", product:"VitaGlow Vitamin C",     commBase:45, estComm:3.60, date:"May 3", status:"Flag"                as ReconStatus },
  { id:"ORD-8827", product:"EcoSkin Moisturizer",    commBase:52, estComm:4.68, date:"May 3", status:"Paid"                as ReconStatus },
  { id:"ORD-8828", product:"LuxHair Shampoo",        commBase:29, estComm:3.19, date:"May 3", status:"Missing"             as ReconStatus },
  { id:"ORD-8829", product:"FitLife BCAA",           commBase:35, estComm:3.50, date:"May 4", status:"Paid"                as ReconStatus },
  { id:"ORD-8830", product:"BeautyBlend Foundation", commBase:72, estComm:4.32, date:"May 4", status:"Returned/Canceled"   as ReconStatus },
];

// Simulated TikTok CSV export — some overlap, some new, some missing
const MOCK_TIKTOK_CSV = [
  { id:"ORD-8821", product:"Hydra Serum 50ml",       gmv:42.00,  commission:3.36,  date:"2026-05-02" },
  { id:"ORD-8822", product:"FitLife Protein 1kg",    gmv:65.00,  commission:6.50,  date:"2026-05-02" },
  { id:"ORD-8823", product:"StyleX Blazer",          gmv:89.00,  commission:6.23,  date:"2026-05-02" },
  { id:"ORD-8825", product:"Hydra Serum 100ml",      gmv:68.00,  commission:5.44,  date:"2026-05-03" },
  { id:"ORD-8827", product:"EcoSkin Moisturizer",    gmv:52.00,  commission:4.68,  date:"2026-05-03" },
  { id:"ORD-8829", product:"FitLife BCAA",           gmv:35.00,  commission:3.50,  date:"2026-05-04" },
  { id:"ORD-8831", product:"GlowUp Toner 200ml",     gmv:55.00,  commission:4.40,  date:"2026-05-04" }, // new - not in system
  { id:"ORD-8832", product:"StyleX Sneakers",        gmv:120.00, commission:8.40,  date:"2026-05-05" }, // new - not in system
  { id:"ORD-8833", product:"NaturaPure Cleanser",    gmv:38.00,  commission:3.04,  date:"2026-05-05" }, // new - not in system
];

type CSVRow = typeof MOCK_TIKTOK_CSV[0];
type CompareResult = {
  id: string;
  product: string;
  date: string;
  result: "matched" | "not_in_system" | "not_in_csv";
  gmv?: number;
  commission?: number;
  commBase?: number;
  estComm?: number;
};

const STATUS_STYLES: Record<ReconStatus, string> = {
  Paid:                "bg-emerald-50 text-emerald-700 border-emerald-200",
  Missing:             "bg-amber-50  text-amber-700  border-amber-200",
  "Returned/Canceled": "bg-red-50    text-red-600    border-red-200",
  Flag:                "bg-orange-50 text-orange-700 border-orange-200",
};
const STATUS_ICONS: Record<ReconStatus, React.ElementType> = {
  Paid: CheckCircle2, Missing: Clock, "Returned/Canceled": XCircle, Flag: Flag,
};

const DATE_FILTERS = ["Today","Yesterday","7D","Custom"];
const ALL_STATUSES: ReconStatus[] = ["Paid","Missing","Returned/Canceled","Flag"];

function runComparison(csvRows: CSVRow[]): CompareResult[] {
  const results: CompareResult[] = [];
  const csvIds = new Set(csvRows.map(r => r.id));
  const sysIds = new Set(SYSTEM_ORDERS.map(o => o.id));

  // Orders in CSV → check if in system
  for (const row of csvRows) {
    if (sysIds.has(row.id)) {
      results.push({ id: row.id, product: row.product, date: row.date, result: "matched", gmv: row.gmv, commission: row.commission });
    } else {
      results.push({ id: row.id, product: row.product, date: row.date, result: "not_in_system", gmv: row.gmv, commission: row.commission });
    }
  }

  // Orders in system NOT in CSV
  for (const order of SYSTEM_ORDERS) {
    if (!csvIds.has(order.id)) {
      results.push({ id: order.id, product: order.product, date: order.date, result: "not_in_csv", commBase: order.commBase, estComm: order.estComm });
    }
  }

  return results;
}

const RESULT_STYLES: Record<string, string> = {
  matched:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  not_in_system: "bg-red-50     text-red-600     border-red-200",
  not_in_csv:    "bg-amber-50   text-amber-700   border-amber-200",
};
const RESULT_ICONS: Record<string, React.ElementType> = {
  matched:       CheckCheck,
  not_in_system: AlertCircle,
  not_in_csv:    HelpCircle,
};
const RESULT_LABELS: Record<string, string> = {
  matched:       "Matched",
  not_in_system: "Not in System",
  not_in_csv:    "Not in CSV",
};

export default function OrdersPage() {
  const [dateFilter, setDateFilter]     = useState("7D");
  const [statusFilter, setStatusFilter] = useState<ReconStatus | "All">("All");
  const [search, setSearch]             = useState("");
  const [tab, setTab]                   = useState<Tab>("reconciliation");

  // CSV state
  const [csvUploaded, setCsvUploaded]   = useState(false);
  const [csvRows, setCsvRows]           = useState<CSVRow[]>([]);
  const [compareResults, setCompareResults] = useState<CompareResult[]>([]);
  const [resultFilter, setResultFilter] = useState<"all"|"matched"|"not_in_system"|"not_in_csv">("all");
  const [csvMonth, setCsvMonth]         = useState("May 2026");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = SYSTEM_ORDERS.filter(o => {
    if (statusFilter !== "All" && o.status !== statusFilter) return false;
    if (search && !o.product.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    Paid: SYSTEM_ORDERS.filter(o=>o.status==="Paid").length,
    Missing: SYSTEM_ORDERS.filter(o=>o.status==="Missing").length,
    "Returned/Canceled": SYSTEM_ORDERS.filter(o=>o.status==="Returned/Canceled").length,
    Flag: SYSTEM_ORDERS.filter(o=>o.status==="Flag").length,
  };
  const totalComm = SYSTEM_ORDERS.filter(o=>o.status==="Paid").reduce((s,o)=>s+o.estComm,0);

  function handleCSVUpload() {
    // Simulate parsing — in production this reads the real file
    const rows = MOCK_TIKTOK_CSV;
    setCsvRows(rows);
    const results = runComparison(rows);
    setCompareResults(results);
    setCsvUploaded(true);
  }

  function resetCSV() {
    setCsvUploaded(false);
    setCsvRows([]);
    setCompareResults([]);
    setResultFilter("all");
  }

  const filteredResults = compareResults.filter(r => resultFilter === "all" || r.result === resultFilter);
  const matchedCount     = compareResults.filter(r=>r.result==="matched").length;
  const notInSysCount    = compareResults.filter(r=>r.result==="not_in_system").length;
  const notInCSVCount    = compareResults.filter(r=>r.result==="not_in_csv").length;

  return (
    <div className="p-5 lg:p-7 space-y-5">

      {/* Import banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-violet-200 bg-violet-50 p-5">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-violet-100 flex items-center justify-center">
          <Upload className="h-5 w-5 text-violet-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900 mb-0.5">Import Orders via Screenshot</div>
          <p className="text-xs text-gray-500">Upload your TikTok Shop screenshot — OCR auto-extracts all order rows for review.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm shadow-violet-200">
            <Upload className="h-4 w-4" /> Upload Orders
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <RefreshCw className="h-4 w-4" /> Upload Settled
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ALL_STATUSES.map(status => {
          const Icon = STATUS_ICONS[status];
          return (
            <button key={status} onClick={()=>setStatusFilter(statusFilter===status ? "All" : status)}
              className={clsx("rounded-2xl border p-4 text-left transition-all hover:shadow-md",
                statusFilter===status ? STATUS_STYLES[status]+" ring-1 ring-inset ring-current/20" : "border-gray-200 bg-white shadow-sm"
              )}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={clsx("h-5 w-5",
                  statusFilter===status
                    ? (status==="Paid"?"text-emerald-600":status==="Missing"?"text-amber-600":status==="Flag"?"text-orange-600":"text-red-600")
                    : "text-gray-300"
                )} />
                <span className="text-2xl font-bold text-gray-900">{counts[status]}</span>
              </div>
              <div className="text-xs text-gray-500">{status}</div>
              {status==="Paid" && <div className="text-[10px] text-emerald-600 mt-0.5">${totalComm.toFixed(2)} earned</div>}
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 w-fit shadow-sm overflow-x-auto">
        {([
          { id:"reconciliation", label:"Reconciliation" },
          { id:"orders",         label:"Orders" },
          { id:"settled",        label:"Settled" },
          { id:"ineligible",     label:"Ineligible" },
          { id:"csv-check",      label:"CSV Check" },
        ] as { id: Tab; label: string }[]).map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={clsx("shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition-all flex items-center gap-1.5",
              tab===t.id ? "bg-violet-600 text-white shadow" : "text-gray-500 hover:text-gray-900"
            )}>
            {t.id==="csv-check" && <FileSpreadsheet className="h-3.5 w-3.5" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CSV CHECK TAB ── */}
      {tab==="csv-check" && (
        <div className="space-y-5">

          {/* Explainer */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-1">TikTok CSV vs System Check</div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Export your orders CSV from TikTok Shop (any date range) and upload it here.
                  The system will compare every order ID in the CSV against your system records and tell you:
                </p>
                <div className="mt-3 grid sm:grid-cols-3 gap-2">
                  {[
                    { color:"bg-emerald-100 text-emerald-700 border-emerald-200", icon:CheckCheck,  label:"Matched", desc:"In both CSV & system" },
                    { color:"bg-red-100 text-red-700 border-red-200",             icon:AlertCircle, label:"Not in System", desc:"In CSV but missing from system" },
                    { color:"bg-amber-100 text-amber-700 border-amber-200",       icon:HelpCircle,  label:"Not in CSV", desc:"In system but not in TikTok CSV" },
                  ].map(({ color, icon: Icon, label, desc }) => (
                    <div key={label} className={`rounded-xl border p-3 ${color}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">{label}</span>
                      </div>
                      <p className="text-[10px] opacity-80">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {!csvUploaded ? (
            /* Upload area */
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-10 text-center hover:border-violet-300 hover:bg-violet-50/30 transition-all">
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
              <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-base font-semibold text-gray-900 mb-1">Upload TikTok Orders CSV</div>
              <p className="text-xs text-gray-500 mb-2">Export from TikTok Shop → Creator Center → Orders → Export CSV</p>

              {/* Month picker */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <label className="text-xs text-gray-500">CSV Period:</label>
                <input
                  type="text"
                  value={csvMonth}
                  onChange={e => setCsvMonth(e.target.value)}
                  placeholder="e.g. May 2026"
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-violet-300 w-32"
                />
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleCSVUpload}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm shadow-violet-200"
                >
                  <Upload className="h-4 w-4" /> Select CSV File
                </button>
                <span className="text-xs text-gray-400">or drag and drop</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-4">Demo: clicking the button will load a sample CSV for preview</p>
            </div>
          ) : (
            /* Results */
            <div className="space-y-4">

              {/* Result header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">CSV Check — {csvMonth}</div>
                    <div className="text-xs text-gray-400">{csvRows.length} orders in CSV · {SYSTEM_ORDERS.length} orders in system</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>{}} className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-all">
                    <Download className="h-3.5 w-3.5" /> Export Report
                  </button>
                  <button onClick={resetCSV} className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100 transition-all">
                    <X className="h-3.5 w-3.5" /> Reset
                  </button>
                </div>
              </div>

              {/* Summary counts */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key:"matched",       label:"Matched",       count:matchedCount,  icon:CheckCheck,  color:"bg-emerald-50 border-emerald-200 text-emerald-700", ic:"bg-emerald-100 text-emerald-600" },
                  { key:"not_in_system", label:"Not in System", count:notInSysCount, icon:AlertCircle, color:"bg-red-50 border-red-200 text-red-700",             ic:"bg-red-100 text-red-600" },
                  { key:"not_in_csv",    label:"Not in CSV",    count:notInCSVCount, icon:HelpCircle,  color:"bg-amber-50 border-amber-200 text-amber-700",       ic:"bg-amber-100 text-amber-600" },
                ].map(({ key, label, count, icon: Icon, color, ic }) => (
                  <button key={key}
                    onClick={()=>setResultFilter(resultFilter===key ? "all" : key as typeof resultFilter)}
                    className={clsx("rounded-2xl border p-4 text-left transition-all hover:shadow-md",
                      resultFilter===key ? color+" ring-1 ring-inset" : "border-gray-200 bg-white shadow-sm"
                    )}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${ic}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{count}</span>
                    </div>
                    <div className="text-xs text-gray-600 font-medium">{label}</div>
                  </button>
                ))}
              </div>

              {/* Alert for not-in-system orders */}
              {notInSysCount > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-red-700">{notInSysCount} orders from TikTok are missing from your system.</span>
                    <p className="text-xs text-red-600 mt-0.5">These exist in your TikTok CSV but were never imported. Import them to reconcile your earnings correctly.</p>
                  </div>
                  <button className="shrink-0 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-all">
                    Import All Missing
                  </button>
                </div>
              )}

              {/* Results table */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
                  <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {resultFilter==="all" ? "All Results" : RESULT_LABELS[resultFilter]}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">{filteredResults.length} rows</span>
                </div>

                <div className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <div>Order ID</div><div>Product</div><div>Date</div><div>Commission</div><div>Result</div>
                </div>

                {filteredResults.length===0 ? (
                  <div className="py-12 text-center text-sm text-gray-400">No results in this category</div>
                ) : filteredResults.map(r => {
                  const Icon = RESULT_ICONS[r.result];
                  return (
                    <div key={r.id+r.result} className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr] gap-4 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all items-center last:border-0">
                      <div className="text-xs font-mono text-violet-600 font-semibold">{r.id}</div>
                      <div className="text-sm text-gray-900 truncate">{r.product}</div>
                      <div className="text-xs text-gray-500">{r.date}</div>
                      <div className="text-sm font-semibold text-emerald-600">
                        +${(r.commission ?? r.estComm ?? 0).toFixed(2)}
                      </div>
                      <div>
                        <span className={clsx("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium", RESULT_STYLES[r.result])}>
                          <Icon className="h-3 w-3" />
                          {RESULT_LABELS[r.result]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── OTHER TABS (reconciliation / orders / settled / ineligible) ── */}
      {tab !== "csv-check" && (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search order ID or product..."
                className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-300 transition-all shadow-sm" />
            </div>
            <div className="flex gap-2">
              <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                {DATE_FILTERS.map(d=>(
                  <button key={d} onClick={()=>setDateFilter(d)}
                    className={clsx("px-3 py-2.5 text-xs font-medium transition-all", dateFilter===d ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-50")}>
                    {d}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1.2fr_40px] gap-4 px-5 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <div>Order ID</div><div>Product</div><div>Comm. Base</div><div>Est. Comm.</div><div>Status</div><div/>
            </div>
            {filtered.length===0 ? (
              <div className="py-16 text-center text-sm text-gray-400">No orders found</div>
            ) : filtered.map(o=>{
              const Icon = STATUS_ICONS[o.status];
              return (
                <div key={o.id} className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1.2fr_40px] gap-4 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all items-center last:border-0">
                  <div className="text-xs font-mono text-violet-600 font-semibold">{o.id}</div>
                  <div>
                    <div className="text-sm text-gray-900">{o.product}</div>
                    <div className="text-xs text-gray-400">{o.date}</div>
                  </div>
                  <div className="text-sm text-gray-700">${o.commBase.toFixed(2)}</div>
                  <div className="text-sm font-semibold text-emerald-600">+${o.estComm.toFixed(2)}</div>
                  <div>
                    <span className={clsx("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium", STATUS_STYLES[o.status])}>
                      <Icon className="h-3 w-3" />{o.status}
                    </span>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="flex flex-wrap gap-5 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            {[
              { label:"Total Orders",      value:SYSTEM_ORDERS.length,    icon:ShoppingBag, color:"text-violet-600" },
              { label:"Commission Earned", value:`$${totalComm.toFixed(2)}`, icon:DollarSign,color:"text-emerald-600" },
              { label:"Missing Orders",    value:counts.Missing,          icon:Clock,       color:"text-amber-600" },
              { label:"Flagged",           value:counts.Flag,             icon:Flag,        color:"text-orange-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs text-gray-500">{label}:</span>
                <span className="text-sm font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
