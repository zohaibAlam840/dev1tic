"use client";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import {
  Plus, Search, Package, Clock, CheckCircle2, XCircle,
  AlertTriangle, Video, Zap, Star, MoreHorizontal, X, ImageIcon, Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type SampleStatus = "Needs content" | "Completed" | "Canceled";
type SampleType   = "Free sample" | "Refundable sample";
type Fulfillment  = "Video" | "Live" | "Both";

type Sample = {
  id: string;
  product: string;
  type: SampleType;
  fulfillment: Fulfillment;
  status: SampleStatus;
  receivedDate: string;
  dueDate: string;
  collab: string | null;
  notes: string;
  userId: string;
  createdAt: string;
};

const STATUS_STYLES: Record<SampleStatus, string> = {
  "Needs content": "bg-amber-50   text-amber-700  border-amber-200",
  "Completed":     "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Canceled":      "bg-red-50     text-red-600     border-red-200",
};
const TYPE_STYLES: Record<SampleType, string> = {
  "Free sample":       "bg-violet-50 text-violet-700 border-violet-200",
  "Refundable sample": "bg-blue-50   text-blue-700   border-blue-200",
};
const FILL_ICONS: Record<Fulfillment, React.ElementType> = { Video, Live: Zap, Both: Star };

type SView = "All" | "Needs content" | "Due soon" | "Completed" | "Canceled";
const VIEWS: SView[] = ["All", "Needs content", "Due soon", "Completed", "Canceled"];

const EMPTY_FORM = {
  product: "", type: "Free sample" as SampleType, fulfillment: "Video" as Fulfillment,
  status: "Needs content" as SampleStatus, receivedDate: "", dueDate: "",
  collab: "", notes: "",
};

function daysUntil(dueDate: string): number {
  if (!dueDate) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
}

function fmtDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  } catch { return iso; }
}

function SampleModal({
  title, form, setForm, saving, onCancel, onSave, saveLabel,
}: {
  title: string;
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
}) {
  const field = (key: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }));

  const inputCls = "w-full rounded-xl border border-[#E9E9E2] px-3 py-2.5 text-sm text-[#1A1A1A] outline-none focus:border-[#FFD567] transition-all bg-white";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
        <div className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl border border-[#E9E9E2] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E9E9E2]">
            <h2 className="text-base font-bold text-[#1A1A1A]">{title}</h2>
            <button onClick={onCancel} className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Product Name *</label>
              <input value={form.product} onChange={field("product")} placeholder="Hydra Serum 50ml" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sample Type</label>
                <select value={form.type} onChange={field("type")} className={inputCls}>
                  <option>Free sample</option>
                  <option>Refundable sample</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Fulfillment</label>
                <select value={form.fulfillment} onChange={field("fulfillment")} className={inputCls}>
                  <option>Video</option>
                  <option>Live</option>
                  <option>Both</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Received Date</label>
                <input type="date" value={form.receivedDate} onChange={field("receivedDate")} className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Due Date</label>
                <input type="date" value={form.dueDate} onChange={field("dueDate")} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
              <select value={form.status} onChange={field("status")} className={inputCls}>
                <option>Needs content</option>
                <option>Completed</option>
                <option>Canceled</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Linked Collab / Brand</label>
              <input value={form.collab} onChange={field("collab")} placeholder="e.g. GlowUp Beauty (optional)" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={field("notes")} rows={3} placeholder="Content requirements, deadlines, links…"
                className="w-full rounded-xl border border-[#E9E9E2] px-3 py-2.5 text-sm text-[#1A1A1A] outline-none focus:border-[#FFD567] transition-all resize-none" />
            </div>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-[#E9E9E2]">
            <button onClick={onCancel}
              className="flex-1 rounded-xl border border-[#E9E9E2] py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={onSave} disabled={saving || !form.product.trim()}
              className="flex-1 rounded-xl bg-[#FFD567] py-2.5 text-sm font-bold text-[#1A1A1A] hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? "Saving…" : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SamplesPage() {
  const { profile } = useAuth();
  const [samples,     setSamples]     = useState<Sample[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [view,        setView]        = useState<SView>("All");
  const [search,      setSearch]      = useState("");
  const [createOpen,  setCreateOpen]  = useState(false);
  const [editSample,  setEditSample]  = useState<Sample | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [menuOpen,    setMenuOpen]    = useState<string | null>(null);
  const [ocrLoading,  setOcrLoading]  = useState(false);
  const [ocrError,    setOcrError]    = useState<string | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    fetchSamples();
  }, [profile]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  async function fetchSamples() {
    setLoading(true);
    try {
      const res  = await fetch("/api/samples");
      const data = await res.json();
      if (data.samples) setSamples(data.samples);
    } finally {
      setLoading(false);
    }
  }

  async function createSample() {
    setSaving(true);
    try {
      const res  = await fetch("/api/samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, collab: form.collab.trim() || null }),
      });
      const data = await res.json();
      if (data.id) {
        await fetchSamples();
        setCreateOpen(false);
        setForm(EMPTY_FORM);
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editSample) return;
    setSaving(true);
    try {
      await fetch("/api/samples", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editSample.id,
          product: form.product, type: form.type, fulfillment: form.fulfillment,
          status: form.status, receivedDate: form.receivedDate, dueDate: form.dueDate,
          collab: form.collab.trim() || null, notes: form.notes,
        }),
      });
      setSamples(prev => prev.map(s =>
        s.id === editSample.id
          ? { ...s, product: form.product, type: form.type, fulfillment: form.fulfillment,
              status: form.status, receivedDate: form.receivedDate, dueDate: form.dueDate,
              collab: form.collab.trim() || null, notes: form.notes }
          : s
      ));
      setEditSample(null);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: SampleStatus) {
    setSamples(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    await fetch("/api/samples", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  async function deleteSample(id: string) {
    setMenuOpen(null);
    setSamples(prev => prev.filter(s => s.id !== id));
    await fetch(`/api/samples?id=${id}`, { method: "DELETE" });
  }

  async function handleOCRUpload(file: File) {
    setOcrLoading(true);
    setOcrError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("type",  "samples");
      const res  = await fetch("/api/ocr", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "OCR failed");

      const d = json.data as { product?: string; collab?: string; receivedDate?: string; dueDate?: string; notes?: string };
      setForm({
        product:      d.product      ?? "",
        type:         "Free sample",
        fulfillment:  "Video",
        status:       "Needs content",
        receivedDate: d.receivedDate ?? "",
        dueDate:      d.dueDate      ?? "",
        collab:       d.collab       ?? "",
        notes:        d.notes        ?? "",
      });
      setCreateOpen(true);
    } catch (err: any) {
      setOcrError(err.message ?? "Could not read screenshot. Try again.");
    } finally {
      setOcrLoading(false);
      if (imgRef.current) imgRef.current.value = "";
    }
  }

  function openEdit(s: Sample) {
    setMenuOpen(null);
    setEditSample(s);
    setForm({
      product: s.product, type: s.type, fulfillment: s.fulfillment,
      status: s.status, receivedDate: s.receivedDate, dueDate: s.dueDate,
      collab: s.collab ?? "", notes: s.notes,
    });
  }

  const filtered = samples.filter(s => {
    if (search && !s.product.toLowerCase().includes(search.toLowerCase())) return false;
    if (view === "All") return true;
    if (view === "Due soon") return s.status === "Needs content" && daysUntil(s.dueDate) <= 7;
    return s.status === view;
  });

  const counts = {
    "Needs content": samples.filter(s => s.status === "Needs content").length,
    "Due soon":      samples.filter(s => s.status === "Needs content" && daysUntil(s.dueDate) <= 7).length,
    "Completed":     samples.filter(s => s.status === "Completed").length,
    "Canceled":      samples.filter(s => s.status === "Canceled").length,
  };

  return (
    <>
      {createOpen && (
        <SampleModal
          title="Add Sample"
          form={form}
          setForm={setForm}
          saving={saving}
          onCancel={() => setCreateOpen(false)}
          onSave={createSample}
          saveLabel="Add Sample"
        />
      )}
      {editSample && (
        <SampleModal
          title="Edit Sample"
          form={form}
          setForm={setForm}
          saving={saving}
          onCancel={() => setEditSample(null)}
          onSave={saveEdit}
          saveLabel="Save Changes"
        />
      )}

      <div className="p-5 lg:p-7 space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Samples Tracker</h2>
            <p className="text-xs text-gray-400 mt-0.5">Track product samples and content deadlines</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* OCR import */}
            <input
              ref={imgRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleOCRUpload(f); }}
            />
            <button
              onClick={() => imgRef.current?.click()}
              disabled={ocrLoading}
              className="flex items-center gap-2 rounded-xl border border-[#E9E9E2] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed w-fit">
              {ocrLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Reading…</>
                : <><ImageIcon className="h-4 w-4" /> Import Screenshot</>
              }
            </button>
            <button
              onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true); }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm shadow-violet-200 w-fit">
              <Plus className="h-4 w-4" /> Add Sample
            </button>
          </div>
        </div>

        {/* OCR error */}
        {ocrError && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-xs font-medium text-red-600">{ocrError}</p>
            <button onClick={() => setOcrError(null)} className="text-red-400 hover:text-red-600 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Needs Content", value: counts["Needs content"], icon: Clock,        bg: "bg-amber-50 border-amber-100",    ic: "bg-amber-100 text-amber-600" },
            { label: "Due Soon (7d)", value: counts["Due soon"],      icon: AlertTriangle, bg: "bg-red-50 border-red-100",        ic: "bg-red-100 text-red-600" },
            { label: "Completed",     value: counts["Completed"],     icon: CheckCircle2,  bg: "bg-emerald-50 border-emerald-100",ic: "bg-emerald-100 text-emerald-600" },
            { label: "Canceled",      value: counts["Canceled"],      icon: XCircle,       bg: "bg-gray-50 border-gray-100",      ic: "bg-gray-100 text-gray-500" },
          ].map(({ label, value, icon: Icon, bg, ic }) => (
            <div key={label} className={`rounded-2xl border p-4 flex items-center gap-3 ${bg}`}>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${ic}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs + search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 overflow-x-auto shadow-sm">
            {VIEWS.map(v => {
              const c = v === "All" ? samples.length : (counts[v as keyof typeof counts] ?? 0);
              return (
                <button key={v} onClick={() => setView(v)}
                  className={clsx("shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    view === v ? "bg-violet-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"
                  )}>
                  {v}
                  {c > 0 && (
                    <span className={clsx("h-4 min-w-4 rounded-full px-1 flex items-center justify-center text-[9px] font-bold",
                      view === v ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500")}>
                      {c}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product name…"
              className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-300 transition-all shadow-sm" />
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            {samples.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-gray-700 mb-1">No samples yet</p>
                <p className="text-xs text-gray-400 mb-5">Add your first sample to start tracking content deadlines.</p>
                <button onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true); }}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all">
                  <Plus className="h-4 w-4" /> Add Sample
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-400">No samples match this filter</p>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(s => {
              const FIcon    = FILL_ICONS[s.fulfillment];
              const days     = daysUntil(s.dueDate);
              const urgent   = s.status === "Needs content" && days <= 3;
              const dueSoon  = s.status === "Needs content" && days <= 7;

              return (
                <div key={s.id} className={clsx(
                  "rounded-2xl border bg-white p-5 hover:shadow-md transition-all shadow-sm relative",
                  urgent ? "border-red-200" : dueSoon ? "border-amber-200" : "border-gray-200"
                )}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 leading-tight">{s.product}</div>
                      {s.collab && <div className="text-xs text-violet-600 mt-0.5">{s.collab}</div>}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === s.id ? null : s.id); }}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                    {menuOpen === s.id && (
                      <div className="absolute right-5 top-12 z-30 bg-white rounded-2xl border border-[#E9E9E2] shadow-xl py-2 w-40"
                        onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(s)}
                          className="w-full text-left px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F7F7F2] font-medium">
                          Edit
                        </button>
                        <button onClick={() => deleteSample(s.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className={clsx("rounded-lg border px-2 py-0.5 text-[10px] font-semibold", TYPE_STYLES[s.type])}>{s.type}</span>
                    <span className={clsx("rounded-lg border px-2 py-0.5 text-[10px] font-semibold", STATUS_STYLES[s.status])}>{s.status}</span>
                    <span className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600">
                      <FIcon className="h-3 w-3" /> {s.fulfillment}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="rounded-xl bg-gray-50 p-2.5">
                      <div className="text-[10px] text-gray-400 mb-0.5">Received</div>
                      <div className="text-xs font-medium text-gray-700">{fmtDate(s.receivedDate)}</div>
                    </div>
                    <div className={clsx("rounded-xl p-2.5", urgent ? "bg-red-50" : "bg-gray-50")}>
                      <div className={clsx("text-[10px] mb-0.5", urgent ? "text-red-500" : "text-gray-400")}>Due Date</div>
                      <div className={clsx("text-xs font-medium", urgent ? "text-red-700" : "text-gray-700")}>{fmtDate(s.dueDate)}</div>
                    </div>
                  </div>

                  {/* Countdown */}
                  {s.status === "Needs content" && s.dueDate && (
                    <div className={clsx("flex items-center gap-2 rounded-xl px-3 py-2 mb-3 border",
                      urgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200")}>
                      <Clock className={clsx("h-3.5 w-3.5 shrink-0", urgent ? "text-red-500" : "text-amber-600")} />
                      <span className={clsx("text-xs font-semibold", urgent ? "text-red-700" : "text-amber-700")}>
                        {days <= 0 ? "Overdue!" : days === 1 ? "Due tomorrow!" : `${days} days left`}
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {s.notes && <p className="text-xs text-gray-400 line-clamp-2 mb-4">{s.notes}</p>}

                  {/* Quick status actions */}
                  {s.status === "Needs content" && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button onClick={() => updateStatus(s.id, "Completed")}
                        className="flex-1 rounded-xl bg-emerald-50 border border-emerald-200 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-all flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Mark Done
                      </button>
                      <button onClick={() => updateStatus(s.id, "Canceled")}
                        className="flex-1 rounded-xl bg-gray-50 border border-gray-200 py-1.5 text-[10px] font-bold text-gray-500 hover:bg-gray-100 transition-all flex items-center justify-center gap-1">
                        <XCircle className="h-3 w-3" /> Cancel
                      </button>
                    </div>
                  )}
                  {s.status !== "Needs content" && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button onClick={() => updateStatus(s.id, "Needs content")}
                        className="flex-1 rounded-xl bg-amber-50 border border-amber-200 py-1.5 text-[10px] font-bold text-amber-700 hover:bg-amber-100 transition-all flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" /> Reopen
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
