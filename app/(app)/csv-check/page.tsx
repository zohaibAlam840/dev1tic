"use client";
import { useState, useRef, useCallback } from "react";
import clsx from "clsx";
import {
  Upload, FileSpreadsheet, CheckCheck, AlertCircle, HelpCircle,
  AlertTriangle, X, Download, ArrowUpDown, RefreshCw,
} from "lucide-react";

// These represent orders already in the system (in production: fetched from DB)
const SYSTEM_ORDERS = [
  { id: "ORD-8821", product: "Hydra Serum 50ml",       estComm: 3.36, date: "May 2" },
  { id: "ORD-8822", product: "FitLife Protein 1kg",    estComm: 6.50, date: "May 2" },
  { id: "ORD-8823", product: "StyleX Blazer",          estComm: 6.23, date: "May 2" },
  { id: "ORD-8824", product: "NaturaPure Face Oil",    estComm: 4.56, date: "May 2" },
  { id: "ORD-8825", product: "Hydra Serum 100ml",      estComm: 5.44, date: "May 3" },
  { id: "ORD-8826", product: "VitaGlow Vitamin C",     estComm: 3.60, date: "May 3" },
  { id: "ORD-8827", product: "EcoSkin Moisturizer",    estComm: 4.68, date: "May 3" },
  { id: "ORD-8828", product: "LuxHair Shampoo",        estComm: 3.19, date: "May 3" },
  { id: "ORD-8829", product: "FitLife BCAA",           estComm: 3.50, date: "May 4" },
  { id: "ORD-8830", product: "BeautyBlend Foundation", estComm: 4.32, date: "May 4" },
];

const DEMO_CSV = [
  { id: "ORD-8821", product: "Hydra Serum 50ml",    date: "2026-05-02", gmv: 42.00, commission: 3.36 },
  { id: "ORD-8822", product: "FitLife Protein 1kg", date: "2026-05-02", gmv: 65.00, commission: 6.50 },
  { id: "ORD-8823", product: "StyleX Blazer",       date: "2026-05-02", gmv: 89.00, commission: 6.23 },
  { id: "ORD-8825", product: "Hydra Serum 100ml",   date: "2026-05-03", gmv: 68.00, commission: 5.44 },
  { id: "ORD-8827", product: "EcoSkin Moisturizer", date: "2026-05-03", gmv: 52.00, commission: 4.68 },
  { id: "ORD-8829", product: "FitLife BCAA",        date: "2026-05-04", gmv: 35.00, commission: 3.50 },
  { id: "ORD-8831", product: "GlowUp Toner 200ml",  date: "2026-05-04", gmv: 55.00, commission: 4.40 },
  { id: "ORD-8832", product: "StyleX Sneakers",     date: "2026-05-05", gmv: 120.00, commission: 8.40 },
  { id: "ORD-8833", product: "NaturaPure Cleanser", date: "2026-05-05", gmv: 38.00, commission: 3.04 },
];

type CSVRow = { id: string; product: string; date: string; gmv: number; commission: number };
type ResultType = "matched" | "not_in_system" | "not_in_csv";
type CompareResult = {
  id: string; product: string; date: string; result: ResultType;
  gmv?: number; commission?: number; estComm?: number;
};

const RESULT_STYLES: Record<ResultType, string> = {
  matched:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  not_in_system: "bg-red-50     text-red-600     border-red-200",
  not_in_csv:    "bg-amber-50   text-amber-700   border-amber-200",
};
const RESULT_ICONS: Record<ResultType, React.ElementType> = {
  matched: CheckCheck, not_in_system: AlertCircle, not_in_csv: HelpCircle,
};
const RESULT_LABELS: Record<ResultType, string> = {
  matched: "Matched", not_in_system: "Not in System", not_in_csv: "Not in CSV",
};

function runComparison(csvRows: CSVRow[]): CompareResult[] {
  const results: CompareResult[] = [];
  const csvIds = new Set(csvRows.map(r => r.id));
  const sysIds = new Set(SYSTEM_ORDERS.map(o => o.id));

  for (const row of csvRows) {
    results.push({
      id: row.id, product: row.product, date: row.date,
      result: sysIds.has(row.id) ? "matched" : "not_in_system",
      gmv: row.gmv, commission: row.commission,
    });
  }
  for (const order of SYSTEM_ORDERS) {
    if (!csvIds.has(order.id)) {
      results.push({ id: order.id, product: order.product, date: order.date, result: "not_in_csv", estComm: order.estComm });
    }
  }
  return results;
}

function parseCSVText(text: string): CSVRow[] {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error("CSV has no data rows.");
  const headers = lines[0].split(",").map(h => h.replace(/['"]/g, "").trim().toLowerCase());

  function col(row: string[], ...candidates: string[]): string {
    for (const c of candidates) {
      const idx = headers.indexOf(c);
      if (idx !== -1 && row[idx] !== undefined) return row[idx].replace(/['"]/g, "").trim();
    }
    return "";
  }

  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].match(/(".*?"|[^",]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g)
                  ?.map(v => v.replace(/^"|"$/g, "").trim()) ?? lines[i].split(",");
    const id = col(row, "order id", "orderid", "order_id", "id");
    if (!id) continue;
    rows.push({
      id,
      product:    col(row, "product name", "productname", "product_name", "item name", "sku name") || "—",
      date:       col(row, "order create time", "order date", "date", "created at", "order_date") || "—",
      gmv:        parseFloat(col(row, "gmv", "settlement amount", "order amount", "total amount", "item price").replace(/[^0-9.]/g, "")) || 0,
      commission: parseFloat(col(row, "estimated commission", "commission", "est. commission", "estimated_commission").replace(/[^0-9.]/g, "")) || 0,
    });
  }
  if (rows.length === 0) throw new Error("No valid rows found. Make sure the CSV has an 'Order ID' column.");
  return rows;
}

export default function CSVCheckPage() {
  const [csvUploaded, setCsvUploaded]     = useState(false);
  const [csvRows, setCsvRows]             = useState<CSVRow[]>([]);
  const [compareResults, setCompareResults] = useState<CompareResult[]>([]);
  const [resultFilter, setResultFilter]   = useState<"all" | ResultType>("all");
  const [parseError, setParseError]       = useState<string | null>(null);
  const [isDragging, setIsDragging]       = useState(false);
  const [csvLabel, setCsvLabel]           = useState("May 2026");
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setParseError(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setParseError("Please upload a .csv file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSVText(e.target?.result as string);
        setCsvRows(rows);
        setCompareResults(runComparison(rows));
        setCsvUploaded(true);
      } catch (err: any) {
        setParseError(err.message ?? "Failed to parse CSV.");
      }
    };
    reader.onerror = () => setParseError("Could not read the file.");
    reader.readAsText(file);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }

  function loadDemo() {
    setCsvRows(DEMO_CSV);
    setParseError(null);
    setCompareResults(runComparison(DEMO_CSV));
    setCsvUploaded(true);
  }

  function reset() {
    setCsvUploaded(false);
    setCsvRows([]);
    setCompareResults([]);
    setResultFilter("all");
    setParseError(null);
  }

  const filtered      = compareResults.filter(r => resultFilter === "all" || r.result === resultFilter);
  const matchedCount  = compareResults.filter(r => r.result === "matched").length;
  const notInSys      = compareResults.filter(r => r.result === "not_in_system").length;
  const notInCSV      = compareResults.filter(r => r.result === "not_in_csv").length;

  return (
    <div className="space-y-5">

      {/* Explainer */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-1">TikTok CSV vs System Check</div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Export your orders CSV from TikTok Shop (Creator Center → Orders → Export CSV) and upload it here.
              The system compares every order ID against your records instantly.
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCheck,  label: "Matched",       desc: "In both CSV & system" },
                { color: "bg-red-100 text-red-700 border-red-200",             icon: AlertCircle, label: "Not in System", desc: "In CSV, missing from system" },
                { color: "bg-amber-100 text-amber-700 border-amber-200",       icon: HelpCircle,  label: "Not in CSV",    desc: "In system, not in TikTok CSV" },
              ].map(({ color, icon: Icon, label, desc }) => (
                <div key={label} className={`rounded-xl border p-2.5 ${color}`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className="h-3.5 w-3.5" /><span className="text-xs font-semibold">{label}</span>
                  </div>
                  <p className="text-[10px] opacity-80">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!csvUploaded ? (
        /* ── Upload zone ── */
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={clsx(
            "rounded-2xl border-2 border-dashed bg-white p-8 sm:p-12 text-center transition-all",
            isDragging ? "border-violet-400 bg-violet-50/50 scale-[1.01]" : "border-gray-300 hover:border-violet-300 hover:bg-violet-50/20"
          )}>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

          <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className={clsx("h-8 w-8", isDragging ? "text-violet-500" : "text-gray-400")} />
          </div>
          <div className="text-base font-semibold text-gray-900 mb-1">Upload TikTok Orders CSV</div>
          <p className="text-xs text-gray-500 mb-1">Export from TikTok Shop → Creator Center → Orders → Export CSV</p>
          <p className="text-[10px] text-gray-400 mb-5">All TikTok Shop CSV formats supported · multiple regions</p>

          {parseError && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 max-w-md mx-auto text-left">
              <X className="h-4 w-4 shrink-0" />{parseError}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            <label className="text-xs text-gray-500">CSV period label:</label>
            <input
              type="text" value={csvLabel} onChange={e => setCsvLabel(e.target.value)}
              placeholder="e.g. May 2026"
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-violet-300 w-28"
            />
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-violet-200"
            >
              <Upload className="h-4 w-4" /> Choose CSV File
            </button>
            <span className="text-xs text-gray-400 hidden sm:block">or drag &amp; drop here</span>
          </div>
          <button onClick={loadDemo} className="mt-4 text-[10px] text-gray-400 underline hover:text-gray-600 transition-colors">
            Load sample data for demo
          </button>
        </div>
      ) : (
        /* ── Results ── */
        <div className="space-y-4">

          {/* Result header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">CSV Check — {csvLabel}</div>
                <div className="text-xs text-gray-400">{csvRows.length} orders in CSV · {SYSTEM_ORDERS.length} orders in system</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
              <button onClick={reset} className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100 active:scale-95 transition-all">
                <RefreshCw className="h-3.5 w-3.5" /> New Check
              </button>
            </div>
          </div>

          {/* Summary counts */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "matched",       label: "Matched",       count: matchedCount, icon: CheckCheck,  color: "bg-emerald-50 border-emerald-200 text-emerald-700", ic: "bg-emerald-100 text-emerald-600" },
              { key: "not_in_system", label: "Not in System", count: notInSys,     icon: AlertCircle, color: "bg-red-50 border-red-200 text-red-700",             ic: "bg-red-100 text-red-600" },
              { key: "not_in_csv",    label: "Not in CSV",    count: notInCSV,     icon: HelpCircle,  color: "bg-amber-50 border-amber-200 text-amber-700",       ic: "bg-amber-100 text-amber-600" },
            ].map(({ key, label, count, icon: Icon, color, ic }) => (
              <button key={key}
                onClick={() => setResultFilter(resultFilter === key ? "all" : key as ResultType)}
                className={clsx("rounded-2xl border p-3 sm:p-4 text-left transition-all active:scale-95",
                  resultFilter === key ? color + " ring-1 ring-inset" : "border-gray-200 bg-white shadow-sm hover:shadow-md"
                )}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-xl flex items-center justify-center ${ic}`}>
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">{count}</span>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 font-medium leading-tight">{label}</div>
              </button>
            ))}
          </div>

          {/* Alert for missing orders */}
          {notInSys > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-red-700">{notInSys} orders in TikTok CSV are missing from your system.</span>
                <p className="text-xs text-red-600 mt-0.5">Import them to keep your reconciliation accurate.</p>
              </div>
              <button className="shrink-0 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 active:scale-95 transition-all">
                Import All
              </button>
            </div>
          )}

          {/* Results table */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-gray-100">
              <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {resultFilter === "all" ? "All Results" : RESULT_LABELS[resultFilter as ResultType]}
              </span>
              <span className="ml-auto text-xs text-gray-400">{filtered.length} rows</span>
            </div>

            {/* Table with horizontal scroll on mobile */}
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
                <div className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr] gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                  <div>Order ID</div><div>Product</div><div>Date</div><div>Commission</div><div>Result</div>
                </div>
                {filtered.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-400">No results in this category</div>
                ) : filtered.map(r => {
                  const Icon = RESULT_ICONS[r.result];
                  return (
                    <div key={r.id + r.result}
                      className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr] gap-3 px-4 sm:px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all items-center last:border-0">
                      <div className="text-xs font-mono text-violet-600 font-semibold truncate">{r.id}</div>
                      <div className="text-sm text-gray-900 truncate">{r.product}</div>
                      <div className="text-xs text-gray-500">{r.date}</div>
                      <div className="text-sm font-semibold text-emerald-600">
                        +${(r.commission ?? r.estComm ?? 0).toFixed(2)}
                      </div>
                      <div>
                        <span className={clsx("inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium", RESULT_STYLES[r.result])}>
                          <Icon className="h-3 w-3" />
                          <span className="hidden sm:inline">{RESULT_LABELS[r.result]}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
