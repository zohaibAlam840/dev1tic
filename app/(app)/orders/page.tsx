"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import clsx from "clsx";
import {
  Upload, Search, Download, CheckCircle2, XCircle,
  AlertTriangle, Clock, Flag, RefreshCw, ChevronDown,
  ShoppingBag, DollarSign, FileSpreadsheet, AlertCircle,
  CheckCheck, HelpCircle, ArrowUpDown, X, ImageIcon, Plus,
} from "lucide-react";

type ReconStatus = "Paid" | "Missing" | "Returned/Canceled" | "Flag";
type Tab = "reconciliation" | "orders" | "settled" | "ineligible" | "csv-check";

type Order = {
  id: string;
  product: string;
  commBase: number;
  estComm: number;
  date: string;
  status: ReconStatus;
};

type CSVRow = { id: string; product: string; date: string; gmv: number; commission: number };
type CompareResult = {
  id: string; product: string; date: string;
  result: "matched" | "not_in_system" | "not_in_csv";
  gmv?: number; commission?: number; commBase?: number; estComm?: number;
};

const STATUS_STYLES: Record<ReconStatus, string> = {
  Paid:                "bg-emerald-50 text-emerald-700 border-emerald-200",
  Missing:             "bg-amber-50   text-amber-700   border-amber-200",
  "Returned/Canceled": "bg-red-50     text-red-600     border-red-200",
  Flag:                "bg-orange-50  text-orange-700  border-orange-200",
};
const STATUS_ICONS: Record<ReconStatus, React.ElementType> = {
  Paid: CheckCircle2, Missing: Clock, "Returned/Canceled": XCircle, Flag: Flag,
};
const RESULT_STYLES: Record<string, string> = {
  matched:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  not_in_system: "bg-red-50     text-red-600     border-red-200",
  not_in_csv:    "bg-amber-50   text-amber-700   border-amber-200",
};
const RESULT_ICONS:  Record<string, React.ElementType> = { matched: CheckCheck, not_in_system: AlertCircle, not_in_csv: HelpCircle };
const RESULT_LABELS: Record<string, string>            = { matched: "Matched", not_in_system: "Not in System", not_in_csv: "Not in CSV" };
const ALL_STATUSES: ReconStatus[] = ["Paid", "Missing", "Returned/Canceled", "Flag"];
const DATE_FILTERS = ["Today", "Yesterday", "7D", "Custom"];

// ── Manual order entry modal ──────────────────────────────────────────────────
function ManualOrderModal({ onClose, onAdd }: { onClose: () => void; onAdd: (o: Order) => void }) {
  const [id,       setId]       = useState("");
  const [product,  setProduct]  = useState("");
  const [date,     setDate]     = useState(new Date().toISOString().split("T")[0]);
  const [commBase, setCommBase] = useState("");
  const [estComm,  setEstComm]  = useState("");
  const [status,   setStatus]   = useState<ReconStatus>("Paid");
  const [error,    setError]    = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id.trim() || !product.trim()) { setError("Order ID and product name are required."); return; }
    onAdd({ id: id.trim(), product: product.trim(), date, commBase: parseFloat(commBase) || 0, estComm: parseFloat(estComm) || 0, status });
    onClose();
  }

  return (
    <>
      <button aria-label="close" className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-2xl">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <div className="text-sm font-bold text-gray-900">Add Order Manually</div>
              <div className="text-xs text-gray-400 mt-0.5">Fill in the order details below</div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="h-4 w-4 text-gray-500" /></button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Order ID</label>
                <input required value={id} onChange={e => setId(e.target.value)} placeholder="ORD-1234"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Date</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Product Name</label>
              <input required value={product} onChange={e => setProduct(e.target.value)} placeholder="Hydra Serum 50ml"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Comm. Base ($)</label>
                <input type="number" step="0.01" min="0" value={commBase} onChange={e => setCommBase(e.target.value)} placeholder="42.00"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Est. Commission ($)</label>
                <input type="number" step="0.01" min="0" value={estComm} onChange={e => setEstComm(e.target.value)} placeholder="3.36"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {(["Paid","Missing","Returned/Canceled","Flag"] as ReconStatus[]).map(s => (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    className={clsx("rounded-xl border px-3 py-2 text-xs font-semibold transition-all text-left",
                      status === s ? STATUS_STYLES[s] + " ring-1 ring-inset" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                    )}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button type="submit" className="w-full rounded-2xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700 transition-all">
              Add Order
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function runComparison(csvRows: CSVRow[], sysOrders: Order[]): CompareResult[] {
  const results: CompareResult[] = [];
  const csvIds = new Set(csvRows.map(r => r.id));
  const sysIds = new Set(sysOrders.map(o => o.id));

  for (const row of csvRows) {
    if (sysIds.has(row.id)) {
      results.push({ id: row.id, product: row.product, date: row.date, result: "matched",       gmv: row.gmv, commission: row.commission });
    } else {
      results.push({ id: row.id, product: row.product, date: row.date, result: "not_in_system", gmv: row.gmv, commission: row.commission });
    }
  }
  for (const order of sysOrders) {
    if (!csvIds.has(order.id)) {
      results.push({ id: order.id, product: order.product, date: order.date, result: "not_in_csv", commBase: order.commBase, estComm: order.estComm });
    }
  }
  return results;
}

export default function OrdersPage() {
  const [dateFilter,   setDateFilter]   = useState("7D");
  const [statusFilter, setStatusFilter] = useState<ReconStatus | "All">("All");
  const [search,       setSearch]       = useState("");
  const [tab,          setTab]          = useState<Tab>("reconciliation");

  const { profile } = useAuth();
  const userId = profile?.uid;

  const [systemOrders,    setSystemOrders]    = useState<Order[]>([]);
  const [pendingOrders,  setPendingOrders]  = useState<Order[] | null>(null);
  const [uploadingOrders, setUploadingOrders] = useState(false);
  const [loadingOrders,   setLoadingOrders]   = useState(true);
  const [ordersError,     setOrdersError]     = useState<string | null>(null);
  const [manualOpen,      setManualOpen]      = useState(false);

  // Initial Fetch from Firestore
  useEffect(() => {
    if (!userId) return;
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (res.ok) setSystemOrders(json.orders);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [userId]);

  const ordersRef  = useRef<HTMLInputElement>(null);
  const settledRef = useRef<HTMLInputElement>(null);

  // CSV state
  const [csvUploaded,     setCsvUploaded]     = useState(false);
  const [csvRows,         setCsvRows]         = useState<CSVRow[]>([]);
  const [compareResults,  setCompareResults]  = useState<CompareResult[]>([]);
  const [resultFilter,    setResultFilter]    = useState<"all" | "matched" | "not_in_system" | "not_in_csv">("all");
  const [csvMonth,        setCsvMonth]        = useState("May 2026");
  const [csvParseError,   setCsvParseError]   = useState<string | null>(null);
  const [isDragging,      setIsDragging]      = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Derived
  const filtered   = systemOrders.filter(o => {
    if (statusFilter !== "All" && o.status !== statusFilter) return false;
    if (search && !o.product.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const counts = {
    Paid:                systemOrders.filter(o => o.status === "Paid").length,
    Missing:             systemOrders.filter(o => o.status === "Missing").length,
    "Returned/Canceled": systemOrders.filter(o => o.status === "Returned/Canceled").length,
    Flag:                systemOrders.filter(o => o.status === "Flag").length,
  };
  const totalComm = systemOrders.filter(o => o.status === "Paid").reduce((s, o) => s + o.estComm, 0);

  const matchedCount  = compareResults.filter(r => r.result === "matched").length;
  const notInSysCount = compareResults.filter(r => r.result === "not_in_system").length;
  const notInCSVCount = compareResults.filter(r => r.result === "not_in_csv").length;
  const filteredResults = compareResults.filter(r => resultFilter === "all" || r.result === resultFilter);

  // OCR upload handler
  async function handleOCRUpload(file: File) {
    setUploadingOrders(true);
    setOrdersError(null);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("type",  "orders");
      const res  = await fetch("/api/ocr", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "OCR failed");

      const rows = json.data as { id: string; product: string; date: string; gmv: number; commission: number; status: string }[];
      const newOrders: Order[] = rows.map(r => ({
        id:       r.id,
        product:  r.product,
        date:     r.date,
        commBase: r.gmv,
        estComm:  r.commission,
        status:   (["Paid","Missing","Returned/Canceled","Flag"].includes(r.status) ? r.status : "Flag") as ReconStatus,
      }));

      setPendingOrders(newOrders);
    } catch (err: any) {
      setOrdersError(err.message);
    } finally {
      setUploadingOrders(false);
    }
  }

  async function confirmPendingOrders() {
    if (!pendingOrders || !userId) return;
    setUploadingOrders(true);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: pendingOrders }),
      });

      setSystemOrders(prev => {
        const existing = new Set(prev.map(o => o.id));
        const merged   = [...prev, ...pendingOrders.filter(o => !existing.has(o.id))];
        return merged;
      });
      setPendingOrders(null);
    } catch (err: any) {
      setOrdersError("Failed to save confirmed orders.");
    } finally {
      setUploadingOrders(false);
    }
  }

  function onOCRFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleOCRUpload(file);
    e.target.value = "";
  }

  // CSV parsing
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
      const product = col(row, "product name", "productname", "product_name", "item name", "sku name");
      const dateRaw = col(row, "order create time", "order date", "date", "created at", "order_date");
      const gmvRaw  = col(row, "gmv", "settlement amount", "order amount", "total amount", "commission base amount", "item price");
      const commRaw = col(row, "estimated commission", "commission", "est. commission", "estimated_commission");
      rows.push({
        id,
        product: product || "—",
        date:    dateRaw  || "—",
        gmv:        parseFloat(gmvRaw.replace(/[^0-9.]/g, ""))  || 0,
        commission: parseFloat(commRaw.replace(/[^0-9.]/g, "")) || 0,
      });
    }
    if (rows.length === 0) throw new Error("No valid order rows found. Check that your CSV contains an 'Order ID' column.");
    return rows;
  }

  const processFile = useCallback((file: File) => {
    setCsvParseError(null);
    if (!file.name.toLowerCase().endsWith(".csv")) { setCsvParseError("Please upload a .csv file."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text    = e.target?.result as string;
        const rows    = parseCSVText(text);
        setCsvRows(rows);
        const results = runComparison(rows, systemOrders);
        setCompareResults(results);
        setCsvUploaded(true);
      } catch (err: any) {
        setCsvParseError(err.message ?? "Failed to parse CSV.");
      }
    };
    reader.onerror = () => setCsvParseError("Could not read the file.");
    reader.readAsText(file);
  }, [systemOrders]);

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }
  function resetCSV() {
    setCsvUploaded(false); setCsvRows([]); setCompareResults([]); setResultFilter("all"); setCsvParseError(null);
  }

  return (
    <div className="p-5 lg:p-7 space-y-5">

      {/* Hidden OCR file inputs */}
      <input ref={ordersRef}  type="file" accept="image/*" className="hidden" onChange={onOCRFileChange} />
      <input ref={settledRef} type="file" accept="image/*" className="hidden" onChange={onOCRFileChange} />

      {manualOpen && (
        <ManualOrderModal
          onClose={() => setManualOpen(false)}
          onAdd={async order => {
            // Save to DB
            await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orders: [order] }),
            });
            setSystemOrders(prev => {
              if (prev.find(o => o.id === order.id)) return prev;
              return [...prev, order];
            });
          }}
        />
      )}

      {/* Import banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-violet-200 bg-violet-50 p-5">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-violet-100 flex items-center justify-center">
          <Upload className="h-5 w-5 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 mb-0.5">Import Orders via Screenshot</div>
          <p className="text-xs text-gray-500">Upload your TikTok Shop screenshot — Gemini AI auto-extracts all order rows for review.</p>
          {ordersError && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><X className="h-3 w-3" />{ordersError}</p>}
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => ordersRef.current?.click()}
            disabled={uploadingOrders}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm disabled:opacity-60"
          >
            {uploadingOrders
              ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <Upload className="h-4 w-4" />}
            Upload Screenshot
          </button>
          <button
            onClick={() => setManualOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-50 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Manually
          </button>
          <button
            onClick={() => settledRef.current?.click()}
            disabled={uploadingOrders}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" /> Upload Settled
          </button>
        </div>
      </div>

      {/* Pending Review UI */}
      {pendingOrders && (
        <div className="rounded-3xl border-2 border-[#FFD567] bg-[#FFD567]/5 p-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-[#1A1A1A] mb-1">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold">Review Extracted Orders</h2>
              </div>
              <p className="text-xs text-gray-500 font-medium">Gemini found {pendingOrders.length} orders. Check them before adding to system.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPendingOrders(null)} className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-all">
                Discard
              </button>
              <button
                onClick={confirmPendingOrders}
                disabled={uploadingOrders}
                className="flex items-center gap-2 rounded-2xl bg-[#1A1A1A] px-6 py-2.5 text-sm font-bold text-white hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50"
              >
                {uploadingOrders ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Plus className="h-4 w-4" />}
                Add to System
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[#FFD567]/20 bg-white shadow-sm">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-[#FFD567]/10 text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">
                <div>ID</div><div>Product</div><div>GMV</div><div>Comm</div><div>Status</div>
              </div>
              {pendingOrders.map(o => (
                <div key={o.id} className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr] gap-4 px-5 py-4 border-b border-gray-100 last:border-0 items-center">
                  <div className="text-[10px] font-mono font-bold text-violet-600">{o.id}</div>
                  <div className="text-xs font-bold text-[#1A1A1A] truncate">{o.product}</div>
                  <div className="text-xs font-medium text-gray-600">${o.commBase.toFixed(2)}</div>
                  <div className="text-xs font-bold text-emerald-600">+${o.estComm.toFixed(2)}</div>
                  <div>
                    <span className={clsx("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase", STATUS_STYLES[o.status])}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ALL_STATUSES.map(status => {
          const Icon = STATUS_ICONS[status];
          return (
            <button key={status} onClick={() => setStatusFilter(statusFilter === status ? "All" : status)}
              className={clsx("rounded-2xl border p-4 text-left transition-all hover:shadow-md",
                statusFilter === status ? STATUS_STYLES[status] + " ring-1 ring-inset ring-current/20" : "border-gray-200 bg-white shadow-sm"
              )}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={clsx("h-5 w-5",
                  statusFilter === status
                    ? (status === "Paid" ? "text-emerald-600" : status === "Missing" ? "text-amber-600" : status === "Flag" ? "text-orange-600" : "text-red-600")
                    : "text-gray-300"
                )} />
                <span className="text-2xl font-bold text-gray-900">{counts[status]}</span>
              </div>
              <div className="text-xs text-gray-500">{status}</div>
              {status === "Paid" && totalComm > 0 && <div className="text-[10px] text-emerald-600 mt-0.5">${totalComm.toFixed(2)} earned</div>}
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 w-fit shadow-sm overflow-x-auto">
        {([
          { id: "reconciliation", label: "Reconciliation" },
          { id: "orders",         label: "Orders" },
          { id: "settled",        label: "Settled" },
          { id: "ineligible",     label: "Ineligible" },
          { id: "csv-check",      label: "CSV Check" },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={clsx("shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition-all flex items-center gap-1.5",
              tab === t.id ? "bg-violet-600 text-white shadow" : "text-gray-500 hover:text-gray-900"
            )}>
            {t.id === "csv-check" && <FileSpreadsheet className="h-3.5 w-3.5" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CSV CHECK TAB ── */}
      {tab === "csv-check" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-1">TikTok CSV vs System Check</div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Export your orders CSV from TikTok Shop and upload it here. The system compares every order ID in the CSV
                  against your imported orders and shows what matches, what&apos;s missing, and what&apos;s extra.
                </p>
                <div className="mt-3 grid sm:grid-cols-3 gap-2">
                  {[
                    { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCheck,  label: "Matched",       desc: "In both CSV & system" },
                    { color: "bg-red-100     text-red-700     border-red-200",     icon: AlertCircle, label: "Not in System",  desc: "In CSV but missing from system" },
                    { color: "bg-amber-100   text-amber-700   border-amber-200",   icon: HelpCircle,  label: "Not in CSV",     desc: "In system but not in TikTok CSV" },
                  ].map(({ color, icon: Icon, label, desc }) => (
                    <div key={label} className={`rounded-xl border p-3 ${color}`}>
                      <div className="flex items-center gap-1.5 mb-1">
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
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={clsx(
                "rounded-2xl border-2 border-dashed bg-white p-10 text-center transition-all",
                isDragging ? "border-violet-400 bg-violet-50/50 scale-[1.01]" : "border-gray-300 hover:border-violet-300 hover:bg-violet-50/30"
              )}>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileInputChange} />
              <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className={clsx("h-8 w-8", isDragging ? "text-violet-500" : "text-gray-400")} />
              </div>
              <div className="text-base font-semibold text-gray-900 mb-1">Upload TikTok Orders CSV</div>
              <p className="text-xs text-gray-500 mb-1">Export from TikTok Shop → Creator Center → Orders → Export CSV</p>
              <p className="text-[10px] text-gray-400 mb-5">Supports all TikTok Shop CSV formats · compares against {systemOrders.length} imported orders</p>

              {csvParseError && (
                <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 max-w-md mx-auto text-left">
                  <X className="h-4 w-4 shrink-0" /> {csvParseError}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mb-6">
                <label className="text-xs text-gray-500">CSV Period label:</label>
                <input
                  type="text" value={csvMonth} onChange={e => setCsvMonth(e.target.value)}
                  placeholder="e.g. May 2026"
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-violet-300 w-32"
                />
              </div>

              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 mx-auto rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm"
              >
                <Upload className="h-4 w-4" /> Choose CSV File
              </button>
              <p className="mt-2 text-[10px] text-gray-400">or drag &amp; drop here</p>
              {systemOrders.length === 0 && (
                <p className="mt-4 text-[10px] text-amber-600">
                  Tip: Upload orders via screenshot first so the comparison has something to match against.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">CSV Check — {csvMonth}</div>
                    <div className="text-xs text-gray-400">{csvRows.length} orders in CSV · {systemOrders.length} orders in system</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={resetCSV} className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100 transition-all">
                    <X className="h-3.5 w-3.5" /> Reset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "matched",       label: "Matched",       count: matchedCount,  icon: CheckCheck,  color: "bg-emerald-50 border-emerald-200 text-emerald-700", ic: "bg-emerald-100 text-emerald-600" },
                  { key: "not_in_system", label: "Not in System", count: notInSysCount, icon: AlertCircle, color: "bg-red-50 border-red-200 text-red-700",             ic: "bg-red-100 text-red-600" },
                  { key: "not_in_csv",    label: "Not in CSV",    count: notInCSVCount, icon: HelpCircle,  color: "bg-amber-50 border-amber-200 text-amber-700",       ic: "bg-amber-100 text-amber-600" },
                ].map(({ key, label, count, icon: Icon, color, ic }) => (
                  <button key={key}
                    onClick={() => setResultFilter(resultFilter === key ? "all" : key as typeof resultFilter)}
                    className={clsx("rounded-2xl border p-4 text-left transition-all hover:shadow-md",
                      resultFilter === key ? color + " ring-1 ring-inset" : "border-gray-200 bg-white shadow-sm"
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

              {notInSysCount > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-red-700">{notInSysCount} orders from TikTok are missing from your system.</span>
                    <p className="text-xs text-red-600 mt-0.5">These exist in your TikTok CSV but were never imported.</p>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
                  <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {resultFilter === "all" ? "All Results" : RESULT_LABELS[resultFilter]}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">{filteredResults.length} rows</span>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[520px]">
                    <div className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      <div>Order ID</div><div>Product</div><div>Date</div><div>Commission</div><div>Result</div>
                    </div>
                    {filteredResults.length === 0 ? (
                      <div className="py-12 text-center text-sm text-gray-400">No results in this category</div>
                    ) : filteredResults.map(r => {
                      const Icon = RESULT_ICONS[r.result];
                      return (
                        <div key={r.id + r.result} className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr] gap-4 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all items-center last:border-0">
                          <div className="text-xs font-mono text-violet-600 font-semibold">{r.id}</div>
                          <div className="text-sm text-gray-900 truncate">{r.product}</div>
                          <div className="text-xs text-gray-500">{r.date}</div>
                          <div className="text-sm font-semibold text-emerald-600">+${(r.commission ?? r.estComm ?? 0).toFixed(2)}</div>
                          <div>
                            <span className={clsx("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium", RESULT_STYLES[r.result])}>
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
      )}

      {/* ── OTHER TABS ── */}
      {tab !== "csv-check" && (
        <>
          {systemOrders.length === 0 ? (
            /* Empty state — no orders uploaded yet */
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-gray-300 bg-white">
              <div className="h-16 w-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-5">
                <ImageIcon className="h-8 w-8 text-violet-300" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
                Upload a screenshot of your TikTok Shop orders list. Gemini AI will extract all order rows automatically.
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <button
                  onClick={() => ordersRef.current?.click()}
                  disabled={uploadingOrders}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-60"
                >
                  {uploadingOrders
                    ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <Upload className="h-4 w-4" />}
                  Upload screenshot
                </button>
                <button
                  onClick={() => setManualOpen(true)}
                  className="flex items-center gap-2 rounded-2xl border border-violet-200 bg-white px-6 py-3 text-sm font-medium text-violet-700 hover:bg-violet-50 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add manually
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID or product..."
                    className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-300 transition-all shadow-sm" />
                </div>
                <div className="flex gap-2">
                  <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                    {DATE_FILTERS.map(d => (
                      <button key={d} onClick={() => setDateFilter(d)}
                        className={clsx("px-3 py-2.5 text-xs font-medium transition-all", dateFilter === d ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-50")}>
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
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1.2fr_40px] gap-4 px-5 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      <div>Order ID</div><div>Product</div><div>Comm. Base</div><div>Est. Comm.</div><div>Status</div><div />
                    </div>
                    {filtered.length === 0 ? (
                      <div className="py-16 text-center text-sm text-gray-400">No orders match your filters</div>
                    ) : filtered.map(o => {
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
                </div>
              </div>

              {/* Totals */}
              <div className="flex flex-wrap gap-5 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                {[
                  { label: "Total Orders",      value: systemOrders.length,          icon: ShoppingBag, color: "text-violet-600" },
                  { label: "Commission Earned", value: `$${totalComm.toFixed(2)}`,   icon: DollarSign,  color: "text-emerald-600" },
                  { label: "Missing Orders",    value: counts.Missing,               icon: Clock,       color: "text-amber-600" },
                  { label: "Flagged",           value: counts.Flag,                  icon: Flag,        color: "text-orange-600" },
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
        </>
      )}
    </div>
  );
}
