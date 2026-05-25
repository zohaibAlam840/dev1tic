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
type Tab = "reconciliation" | "orders" | "settled" | "ineligible" | "csv-check" | "earnings" | "withdrawals";
type EarningsType = "Daily Revenue" | "Flat Fee" | "Rewards";
const EARNINGS_TYPES: EarningsType[] = ["Daily Revenue", "Flat Fee", "Rewards"];

type EarningsRecord = { id: string; date: string; amount: number; type: EarningsType; notes: string };
type Withdrawal     = { id: string; date: string; amount: number; notes: string };

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

// ── Earnings batch review ─────────────────────────────────────────────────────
function EarningsBatchReview({
  records: initial, onClose, onConfirm,
}: {
  records: Omit<EarningsRecord, "id">[];
  onClose: () => void;
  onConfirm: (r: Omit<EarningsRecord, "id">[]) => Promise<void>;
}) {
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);

  const update = (i: number, key: string, val: string | number) =>
    setItems(prev => prev.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  const remove = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  async function handleConfirm() {
    if (!items.length) return;
    setSaving(true);
    try { await onConfirm(items); } finally { setSaving(false); }
  }

  const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-all";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[24px] shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-base font-bold text-gray-900">Review Extracted Earnings</h2>
              <p className="text-xs text-emerald-600 font-bold mt-0.5">✓ {items.length} entr{items.length !== 1 ? "ies" : "y"} detected — edit before importing</p>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {items.map((r, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 p-4 space-y-3 relative">
                <button onClick={() => remove(i)} className="absolute right-4 top-4 h-6 w-6 rounded-full hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all">
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Entry {i + 1}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Date</label>
                    <input type="date" value={r.date} onChange={e => update(i, "date", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Amount ($)</label>
                    <input type="number" step="0.01" value={r.amount} onChange={e => update(i, "amount", parseFloat(e.target.value) || 0)} className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Type</label>
                    <select value={r.type} onChange={e => update(i, "type", e.target.value)} className={inputCls}>
                      {EARNINGS_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-center text-sm text-gray-400 py-8">All entries removed.</p>}
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
            <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={handleConfirm} disabled={saving || items.length === 0}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all">
              {saving ? "Importing…" : `Import ${items.length} Entr${items.length !== 1 ? "ies" : "y"}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

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
  const [statusMenu,   setStatusMenu]   = useState<string | null>(null);

  const { profile } = useAuth();
  const userId = profile?.uid;

  const [systemOrders,    setSystemOrders]    = useState<Order[]>([]);
  const [pendingOrders,  setPendingOrders]  = useState<Order[] | null>(null);
  const [uploadingOrders, setUploadingOrders] = useState(false);
  const [loadingOrders,   setLoadingOrders]   = useState(true);
  const [ordersError,     setOrdersError]     = useState<string | null>(null);
  const [manualOpen,      setManualOpen]      = useState(false);

  // Close status menu on outside click
  useEffect(() => {
    if (!statusMenu) return;
    const close = () => setStatusMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [statusMenu]);

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

  // Earnings state
  const [earnings,        setEarnings]        = useState<EarningsRecord[]>([]);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [earningsError,   setEarningsError]   = useState<string | null>(null);
  const [earningsOcrBusy, setEarningsOcrBusy] = useState(false);
  const [pendingEarnings, setPendingEarnings] = useState<Omit<EarningsRecord,"id">[] | null>(null);
  const [earningsTypeFilter, setEarningsTypeFilter] = useState<EarningsType | "All">("All");
  const [earningsForm,    setEarningsForm]    = useState({ date: new Date().toISOString().split("T")[0], amount: "", type: "Daily Revenue" as EarningsType, notes: "" });
  const [earningsFormOpen,setEarningsFormOpen]= useState(false);
  const earningsOcrRef = useRef<HTMLInputElement>(null);

  // Withdrawals state
  const [withdrawals,        setWithdrawals]        = useState<Withdrawal[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [wdForm,             setWdForm]             = useState({ date: new Date().toISOString().split("T")[0], amount: "", notes: "" });
  const [wdFormOpen,         setWdFormOpen]         = useState(false);
  const [wdSaving,           setWdSaving]           = useState(false);

  const ordersRef  = useRef<HTMLInputElement>(null);
  const settledRef = useRef<HTMLInputElement>(null);

  // Fetch earnings when tab opens
  useEffect(() => {
    if (tab !== "earnings" || !userId || earnings.length > 0) return;
    setEarningsLoading(true);
    fetch("/api/earnings").then(r => r.json()).then(d => {
      if (d.earnings) setEarnings(d.earnings);
    }).finally(() => setEarningsLoading(false));
  }, [tab, userId]);

  // Fetch withdrawals when tab opens
  useEffect(() => {
    if (tab !== "withdrawals" || !userId || withdrawals.length > 0) return;
    setWithdrawalsLoading(true);
    fetch("/api/withdrawals").then(r => r.json()).then(d => {
      if (d.withdrawals) setWithdrawals(d.withdrawals);
    }).finally(() => setWithdrawalsLoading(false));
  }, [tab, userId]);

  async function handleEarningsOCR(file: File) {
    setEarningsOcrBusy(true);
    setEarningsError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("type", "earnings");
      const res  = await fetch("/api/ocr", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "OCR failed");
      const raw = json.data;
      const arr = (Array.isArray(raw) ? raw : [raw]).map((r: any) => ({
        date:   r.date   || new Date().toISOString().split("T")[0],
        amount: Number(r.amount) || 0,
        type:   (EARNINGS_TYPES.includes(r.type) ? r.type : "Daily Revenue") as EarningsType,
        notes:  r.notes  || "",
      }));
      setPendingEarnings(arr);
    } catch (err: any) {
      setEarningsError(err.message ?? "Could not read screenshot.");
    } finally {
      setEarningsOcrBusy(false);
      if (earningsOcrRef.current) earningsOcrRef.current.value = "";
    }
  }

  async function confirmEarnings(records: Omit<EarningsRecord,"id">[]) {
    const res  = await fetch("/api/earnings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    setEarnings([]);
    setPendingEarnings(null);
    setEarningsLoading(true);
    fetch("/api/earnings").then(r => r.json()).then(d => {
      if (d.earnings) setEarnings(d.earnings);
    }).finally(() => setEarningsLoading(false));
  }

  async function saveManualEarning() {
    if (!earningsForm.amount) return;
    await confirmEarnings([{
      date:   earningsForm.date,
      amount: Number(earningsForm.amount),
      type:   earningsForm.type,
      notes:  earningsForm.notes,
    }]);
    setEarningsForm({ date: new Date().toISOString().split("T")[0], amount: "", type: "Daily Revenue", notes: "" });
    setEarningsFormOpen(false);
  }

  async function deleteEarning(id: string) {
    setEarnings(prev => prev.filter(e => e.id !== id));
    await fetch(`/api/earnings?id=${id}`, { method: "DELETE" });
  }

  async function saveWithdrawal() {
    if (!wdForm.amount) return;
    setWdSaving(true);
    try {
      const res  = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: wdForm.date, amount: Number(wdForm.amount), notes: wdForm.notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const newWd: Withdrawal = { id: json.id, date: wdForm.date, amount: Number(wdForm.amount), notes: wdForm.notes };
      setWithdrawals(prev => [newWd, ...prev]);
      setWdForm({ date: new Date().toISOString().split("T")[0], amount: "", notes: "" });
      setWdFormOpen(false);
    } finally {
      setWdSaving(false);
    }
  }

  async function deleteWithdrawal(id: string) {
    setWithdrawals(prev => prev.filter(w => w.id !== id));
    await fetch(`/api/withdrawals?id=${id}`, { method: "DELETE" });
  }

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
  const filtered = systemOrders.filter(o => {
    if (tab === "settled"    && o.status !== "Paid")              return false;
    if (tab === "ineligible" && o.status !== "Returned/Canceled") return false;
    if (tab === "reconciliation" || tab === "orders") {
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
    }
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

  async function updateOrderStatus(orderId: string, status: ReconStatus) {
    setSystemOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    setStatusMenu(null);
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status }),
    });
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
      <input ref={ordersRef}      type="file" accept="image/*" className="hidden" onChange={onOCRFileChange} />
      <input ref={settledRef}     type="file" accept="image/*" className="hidden" onChange={onOCRFileChange} />
      <input ref={earningsOcrRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleEarningsOCR(f); e.target.value = ""; }} />

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-[#1A1A1A] mb-1">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold">Review Extracted Orders</h2>
              </div>
              <p className="text-xs text-gray-500 font-medium">Gemini found {pendingOrders.length} orders. Edit anything, remove rows you don&apos;t need, then confirm.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setPendingOrders(null)} className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-all">
                Discard
              </button>
              <button
                onClick={confirmPendingOrders}
                disabled={uploadingOrders || pendingOrders.length === 0}
                className="flex items-center gap-2 rounded-2xl bg-[#1A1A1A] px-6 py-2.5 text-sm font-bold text-white hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50"
              >
                {uploadingOrders ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Plus className="h-4 w-4" />}
                Add {pendingOrders.length} to System
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[#FFD567]/20 bg-white shadow-sm">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-[1.4fr_2.5fr_1fr_1fr_1.3fr_32px] gap-3 px-4 py-3 bg-[#FFD567]/10 text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">
                <div>Order ID</div><div>Product</div><div>GMV ($)</div><div>Comm ($)</div><div>Status</div><div />
              </div>
              {pendingOrders.map((o, i) => (
                <div key={i} className="grid grid-cols-[1.4fr_2.5fr_1fr_1fr_1.3fr_32px] gap-3 px-4 py-3 border-b border-gray-100 last:border-0 items-center">
                  <input
                    value={o.id}
                    onChange={e => setPendingOrders(prev => prev!.map((r, idx) => idx === i ? { ...r, id: e.target.value } : r))}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] font-mono text-violet-600 outline-none focus:border-violet-400 focus:bg-white transition-all"
                  />
                  <input
                    value={o.product}
                    onChange={e => setPendingOrders(prev => prev!.map((r, idx) => idx === i ? { ...r, product: e.target.value } : r))}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-violet-400 focus:bg-white transition-all"
                  />
                  <input
                    type="number" step="0.01" value={o.commBase}
                    onChange={e => setPendingOrders(prev => prev!.map((r, idx) => idx === i ? { ...r, commBase: parseFloat(e.target.value) || 0 } : r))}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-violet-400 focus:bg-white transition-all"
                  />
                  <input
                    type="number" step="0.01" value={o.estComm}
                    onChange={e => setPendingOrders(prev => prev!.map((r, idx) => idx === i ? { ...r, estComm: parseFloat(e.target.value) || 0 } : r))}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-emerald-600 font-semibold outline-none focus:border-violet-400 focus:bg-white transition-all"
                  />
                  <select
                    value={o.status}
                    onChange={e => setPendingOrders(prev => prev!.map((r, idx) => idx === i ? { ...r, status: e.target.value as ReconStatus } : r))}
                    className={clsx("w-full rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold outline-none transition-all cursor-pointer", STATUS_STYLES[o.status])}>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => setPendingOrders(prev => prev!.filter((_, idx) => idx !== i))}
                    className="h-7 w-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {pendingOrders.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-400">All rows removed. Discard or upload again.</div>
              )}
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
          { id: "reconciliation", label: "Reconciliation", count: null },
          { id: "orders",         label: "Orders",          count: systemOrders.length },
          { id: "settled",        label: "Settled",         count: counts.Paid },
          { id: "ineligible",     label: "Ineligible",      count: counts["Returned/Canceled"] },
          { id: "earnings",       label: "Earnings",        count: earnings.length || null },
          { id: "withdrawals",    label: "Withdrawals",     count: withdrawals.length || null },
          { id: "csv-check",      label: "CSV Check",       count: null },
        ] as { id: Tab; label: string; count: number | null }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={clsx("shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition-all flex items-center gap-1.5",
              tab === t.id ? "bg-violet-600 text-white shadow" : "text-gray-500 hover:text-gray-900"
            )}>
            {t.id === "csv-check" && <FileSpreadsheet className="h-3.5 w-3.5" />}
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className={clsx("h-4 min-w-4 rounded-full px-1 flex items-center justify-center text-[9px] font-bold",
                tab === t.id ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500")}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── EARNINGS TAB ── */}
      {tab === "earnings" && (
        <div className="space-y-5">
          {/* OCR pending review */}
          {pendingEarnings && (
            <EarningsBatchReview
              records={pendingEarnings}
              onClose={() => setPendingEarnings(null)}
              onConfirm={confirmEarnings}
            />
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 mb-0.5">Earnings History</div>
              <p className="text-xs text-gray-500">Track daily revenue, flat fees, and rewards. Import via screenshot or add manually.</p>
              {earningsError && <p className="mt-1 text-xs text-red-600">{earningsError}</p>}
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              <button onClick={() => earningsOcrRef.current?.click()} disabled={earningsOcrBusy}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm disabled:opacity-60">
                {earningsOcrBusy
                  ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <ImageIcon className="h-4 w-4" />}
                Import Screenshot
              </button>
              <button onClick={() => setEarningsFormOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm">
                <Plus className="h-4 w-4" /> Add Manually
              </button>
            </div>
          </div>

          {/* Manual entry form */}
          {earningsFormOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setEarningsFormOpen(false)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-2xl">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="text-sm font-bold text-gray-900">Add Earnings Entry</div>
                    <button onClick={() => setEarningsFormOpen(false)} className="p-2 rounded-full hover:bg-gray-100"><X className="h-4 w-4 text-gray-500" /></button>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Date</label>
                        <input type="date" value={earningsForm.date} onChange={e => setEarningsForm(p => ({ ...p, date: e.target.value }))}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Amount ($)</label>
                        <input type="number" step="0.01" min="0" value={earningsForm.amount} onChange={e => setEarningsForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {EARNINGS_TYPES.map(t => (
                          <button key={t} type="button" onClick={() => setEarningsForm(p => ({ ...p, type: t }))}
                            className={clsx("rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
                              earningsForm.type === t ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                            )}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Notes</label>
                      <input value={earningsForm.notes} onChange={e => setEarningsForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional note…"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                    </div>
                    <button onClick={saveManualEarning} disabled={!earningsForm.amount}
                      className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all disabled:opacity-50">
                      Save Entry
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Summary + filter */}
          {earnings.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex gap-2 flex-wrap">
                {(["All", ...EARNINGS_TYPES] as (EarningsType | "All")[]).map(t => (
                  <button key={t} onClick={() => setEarningsTypeFilter(t)}
                    className={clsx("rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border",
                      earningsTypeFilter === t ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
                    )}>{t}</button>
                ))}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                Total: <span className="text-emerald-600">${earnings.filter(e => earningsTypeFilter === "All" || e.type === earningsTypeFilter).reduce((s, e) => s + e.amount, 0).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Table */}
          {earningsLoading ? (
            <div className="flex items-center justify-center py-16"><div className="h-8 w-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" /></div>
          ) : earnings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-gray-300 bg-white">
              <DollarSign className="h-12 w-12 text-gray-200 mb-3" />
              <p className="text-sm font-semibold text-gray-700 mb-1">No earnings recorded yet</p>
              <p className="text-xs text-gray-400 mb-5">Import a screenshot or add an entry manually.</p>
              <button onClick={() => setEarningsFormOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-all">
                <Plus className="h-4 w-4" /> Add Entry
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                  <div className="grid grid-cols-[1fr_1fr_1fr_2fr_40px] gap-4 px-5 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    <div>Date</div><div>Type</div><div>Amount</div><div>Notes</div><div />
                  </div>
                  {earnings.filter(e => earningsTypeFilter === "All" || e.type === earningsTypeFilter).map(e => (
                    <div key={e.id} className="grid grid-cols-[1fr_1fr_1fr_2fr_40px] gap-4 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all items-center last:border-0">
                      <div className="text-sm text-gray-700">{e.date}</div>
                      <div>
                        <span className={clsx("rounded-lg border px-2.5 py-1 text-xs font-semibold",
                          e.type === "Daily Revenue" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                          e.type === "Flat Fee"      ? "bg-blue-50 border-blue-200 text-blue-700" :
                                                       "bg-violet-50 border-violet-200 text-violet-700"
                        )}>{e.type}</span>
                      </div>
                      <div className="text-sm font-semibold text-emerald-600">+${e.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-400 truncate">{e.notes || "—"}</div>
                      <button onClick={() => deleteEarning(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <X className="h-3.5 w-3.5 text-gray-300 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WITHDRAWALS TAB ── */}
      {tab === "withdrawals" && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Download className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 mb-0.5">Withdrawals</div>
              <p className="text-xs text-gray-500">Record your payout withdrawals for bookkeeping. No calculations — just history.</p>
            </div>
            <button onClick={() => setWdFormOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-all shadow-sm shrink-0">
              <Plus className="h-4 w-4" /> Add Withdrawal
            </button>
          </div>

          {/* Manual entry form */}
          {wdFormOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setWdFormOpen(false)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-2xl">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="text-sm font-bold text-gray-900">Add Withdrawal</div>
                    <button onClick={() => setWdFormOpen(false)} className="p-2 rounded-full hover:bg-gray-100"><X className="h-4 w-4 text-gray-500" /></button>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Date</label>
                        <input type="date" value={wdForm.date} onChange={e => setWdForm(p => ({ ...p, date: e.target.value }))}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Amount ($)</label>
                        <input type="number" step="0.01" min="0" value={wdForm.amount} onChange={e => setWdForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Reference / Notes</label>
                      <input value={wdForm.notes} onChange={e => setWdForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. TikTok Shop payout, May 2026…"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white transition-all" />
                    </div>
                    <button onClick={saveWithdrawal} disabled={wdSaving || !wdForm.amount}
                      className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600 transition-all disabled:opacity-50">
                      {wdSaving ? "Saving…" : "Save Withdrawal"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Summary */}
          {withdrawals.length > 0 && (
            <div className="flex items-center justify-end">
              <span className="text-sm font-semibold text-gray-900">
                Total withdrawn: <span className="text-amber-600">${withdrawals.reduce((s, w) => s + w.amount, 0).toFixed(2)}</span>
              </span>
            </div>
          )}

          {/* Table */}
          {withdrawalsLoading ? (
            <div className="flex items-center justify-center py-16"><div className="h-8 w-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" /></div>
          ) : withdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-gray-300 bg-white">
              <Download className="h-12 w-12 text-gray-200 mb-3" />
              <p className="text-sm font-semibold text-gray-700 mb-1">No withdrawals recorded</p>
              <p className="text-xs text-gray-400 mb-5">Log your payouts for record keeping.</p>
              <button onClick={() => setWdFormOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-all">
                <Plus className="h-4 w-4" /> Add Withdrawal
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[400px]">
                  <div className="grid grid-cols-[1fr_1fr_2fr_40px] gap-4 px-5 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    <div>Date</div><div>Amount</div><div>Reference</div><div />
                  </div>
                  {withdrawals.map(w => (
                    <div key={w.id} className="grid grid-cols-[1fr_1fr_2fr_40px] gap-4 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all items-center last:border-0">
                      <div className="text-sm text-gray-700">{w.date}</div>
                      <div className="text-sm font-semibold text-amber-600">${w.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-400 truncate">{w.notes || "—"}</div>
                      <button onClick={() => deleteWithdrawal(w.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <X className="h-3.5 w-3.5 text-gray-300 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
                          <div className="relative">
                            <button
                              onClick={e => { e.stopPropagation(); setStatusMenu(statusMenu === o.id ? null : o.id); }}
                              className={clsx("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all hover:opacity-80", STATUS_STYLES[o.status])}>
                              <Icon className="h-3 w-3" />{o.status}
                              <ChevronDown className="h-3 w-3 ml-0.5 opacity-60" />
                            </button>
                            {statusMenu === o.id && (
                              <div className="absolute left-0 top-full mt-1 z-30 bg-white rounded-2xl border border-gray-200 shadow-xl py-1.5 w-44"
                                onClick={e => e.stopPropagation()}>
                                {ALL_STATUSES.map(s => {
                                  const SIcon = STATUS_ICONS[s];
                                  return (
                                    <button key={s} onClick={() => updateOrderStatus(o.id, s)}
                                      className={clsx("w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-all hover:bg-gray-50",
                                        o.status === s ? "opacity-40 cursor-default" : ""
                                      )}>
                                      <SIcon className="h-3.5 w-3.5" />
                                      {s}
                                      {o.status === s && <span className="ml-auto text-[9px] text-gray-400">current</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div />
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
