"use client";
import { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import Link from "next/link";
import {
  Mail, Image as ImageIcon, FileText, Plus, Search,
  Zap, CheckCircle, Link2, X, Reply, ChevronRight, Trash2,
} from "lucide-react";

type Source = "Email" | "TikTok Screenshot" | "Note";
type Status = "open" | "in_progress" | "done";
type SourceFilter = "All" | Source;
type StatusFilter = "all" | Status;

type InboxItem = {
  id: string;
  source: Source;
  subject: string;
  from: string;
  body: string;
  status: Status;
  needsReply: boolean;
  collabId: string | null;
  collabName: string | null;
  createdAt: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const SOURCE_ICONS: Record<Source, React.ElementType> = {
  Email: Mail,
  "TikTok Screenshot": ImageIcon,
  Note: FileText,
};
const SOURCE_COLORS: Record<Source, string> = {
  Email: "text-blue-500",
  "TikTok Screenshot": "text-pink-500",
  Note: "text-amber-500",
};
const STATUS_STYLES: Record<Status, string> = {
  open:        "bg-amber-50  text-amber-600  border-amber-200",
  in_progress: "bg-gray-50   text-[#1A1A1A]  border-gray-200",
  done:        "bg-emerald-50 text-emerald-600 border-emerald-200",
};
const STATUS_LABELS: Record<Status, string> = {
  open: "Open", in_progress: "In Progress", done: "Done",
};

// ── Collab types ─────────────────────────────────────────────────────────────
const COLLAB_TYPES = [
  "TikTok Shop Affiliate", "Fixed Pay", "Fixed Pay + Commission",
  "Creator Marketplace", "Monthly Retainer", "Product Exchange", "UGC Only", "Other",
];

// ── Create Collab Modal ───────────────────────────────────────────────────────
function CreateCollabModal({
  item, onClose, onCreated,
}: {
  item: InboxItem;
  onClose: () => void;
  onCreated: (collabId: string, collabName: string) => void;
}) {
  const [extracting, setExtracting] = useState(true);
  const [extractError, setExtractError] = useState("");
  const [brand, setBrand] = useState("");
  const [product, setProduct] = useState("");
  const [value, setValue] = useState("");
  const [commission, setCommission] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [contact, setContact] = useState("");
  const [collabType, setCollabType] = useState("");
  const [notes, setNotes] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function extract() {
      if (!item.body?.trim()) { setExtracting(false); return; }
      try {
        const res = await fetch("/api/extract-collab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: item.body }),
        });
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            setBrand(data.brand || "");
            setProduct(data.product || "");
            setValue(data.value ? String(data.value) : "");
            setCommission(data.commission ? String(data.commission) : "");
            setDueDate(data.dueDate || "");
            setContact(data.contact || "");
            setCollabType(data.collabType || "");
            setNotes(data.notes || "");
            setDeliverables(data.deliverables || "");
          }
        } else {
          setExtractError("Could not extract — fill in manually.");
        }
      } catch {
        setExtractError("Could not extract — fill in manually.");
      } finally {
        setExtracting(false);
      }
    }
    extract();
  }, [item.body]);

  async function handleSave() {
    if (!brand.trim() || !product.trim()) { setError("Brand and product are required."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/collabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, product, value, commission, dueDate, contact, collabType, notes, deliverables }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      const { id } = await res.json();
      onCreated(id, `${brand.trim()} — ${product.trim()}`);
    } catch (e: any) {
      setError(e.message || "Failed to create collab.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">Create Collab</h3>
            {!extracting && !extractError && item.body?.trim() && (
              <p className="text-xs text-emerald-600 font-bold mt-0.5">✓ AI pre-filled from message</p>
            )}
            {extractError && <p className="text-xs text-amber-600 font-bold mt-0.5">{extractError}</p>}
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {extracting ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-8 w-8 rounded-full border-2 border-[#FFD567] border-t-transparent animate-spin" />
            <p className="text-sm font-bold text-gray-400">Extracting details from message...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brand *</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Brand name"
                  className="mt-1 w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-2.5 text-sm text-[#1A1A1A] outline-none focus:bg-white focus:border-[#1A1A1A] transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign / Product *</label>
                <input value={product} onChange={e => setProduct(e.target.value)} placeholder="Product or campaign"
                  className="mt-1 w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-2.5 text-sm text-[#1A1A1A] outline-none focus:bg-white focus:border-[#1A1A1A] transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deal Value ($)</label>
                <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="0"
                  className="mt-1 w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-2.5 text-sm text-[#1A1A1A] outline-none focus:bg-white focus:border-[#1A1A1A] transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commission (%)</label>
                <input type="number" value={commission} onChange={e => setCommission(e.target.value)} placeholder="0"
                  className="mt-1 w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-2.5 text-sm text-[#1A1A1A] outline-none focus:bg-white focus:border-[#1A1A1A] transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-2.5 text-sm text-[#1A1A1A] outline-none focus:bg-white focus:border-[#1A1A1A] transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</label>
                <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Contact person"
                  className="mt-1 w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-2.5 text-sm text-[#1A1A1A] outline-none focus:bg-white focus:border-[#1A1A1A] transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Collab Type</label>
                <select value={collabType} onChange={e => setCollabType(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-2.5 text-sm text-[#1A1A1A] outline-none focus:bg-white focus:border-[#1A1A1A] transition-all">
                  <option value="">Select type...</option>
                  {COLLAB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deliverables</label>
                <textarea value={deliverables} onChange={e => setDeliverables(e.target.value)} rows={2}
                  placeholder="What content is required..."
                  className="mt-1 w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-2.5 text-sm text-[#1A1A1A] outline-none focus:bg-white focus:border-[#1A1A1A] transition-all resize-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  placeholder="Additional details..."
                  className="mt-1 w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-2.5 text-sm text-[#1A1A1A] outline-none focus:bg-white focus:border-[#1A1A1A] transition-all resize-none" />
              </div>
            </div>
            {error && <p className="text-xs font-bold text-red-500">{error}</p>}
            <button onClick={handleSave} disabled={saving}
              className="w-full rounded-2xl bg-[#1A1A1A] py-3.5 text-sm font-bold text-white hover:bg-black transition-all disabled:opacity-50 mt-2">
              {saving ? "Creating..." : "Create Collab"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add Message Modal ─────────────────────────────────────────────────────────
function AddModal({
  onClose, onSave,
}: {
  onClose: () => void;
  onSave: (payload: Partial<InboxItem>) => Promise<void>;
}) {
  const [tab, setTab] = useState<Source>("Email");
  const [subject, setSubject] = useState("");
  const [from, setFrom] = useState("");
  const [body, setBody] = useState("");
  const [needsReply, setNeedsReply] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!subject.trim()) { setError("Subject is required."); return; }
    setSaving(true);
    try {
      await onSave({ source: tab, subject, from, body, needsReply });
      onClose();
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-lg font-bold text-[#1A1A1A]">Add Message</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="flex gap-1 px-6 mb-5">
          {(["Email", "TikTok Screenshot", "Note"] as Source[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={clsx("flex-1 rounded-2xl py-2 text-xs font-bold transition-all",
                tab === t ? "bg-[#1A1A1A] text-white" : "bg-[#F7F7F2] text-gray-500 hover:bg-gray-200"
              )}>
              {t === "TikTok Screenshot" ? "TikTok" : t}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6 space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject *</label>
            <input
              value={subject} onChange={e => setSubject(e.target.value)}
              placeholder={tab === "Note" ? "Note title..." : tab === "Email" ? "Email subject..." : "DM subject..."}
              className="mt-1 w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-2.5 text-sm text-[#1A1A1A] outline-none focus:bg-white focus:border-[#1A1A1A] transition-all"
            />
          </div>

          {tab !== "Note" && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {tab === "Email" ? "From (email)" : "From (handle / brand)"}
              </label>
              <input
                value={from} onChange={e => setFrom(e.target.value)}
                placeholder={tab === "Email" ? "brand@example.com" : "@brandhandle or Brand Name"}
                className="mt-1 w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-2.5 text-sm text-[#1A1A1A] outline-none focus:bg-white focus:border-[#1A1A1A] transition-all"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {tab === "Note" ? "Notes" : "Message body"}
            </label>
            <textarea
              value={body} onChange={e => setBody(e.target.value)} rows={4}
              placeholder={
                tab === "TikTok Screenshot" ? "Paste DM text here..." :
                tab === "Email" ? "Paste email content..." :
                "Write your note..."
              }
              className="mt-1 w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-2.5 text-sm text-[#1A1A1A] outline-none focus:bg-white focus:border-[#1A1A1A] transition-all resize-none"
            />
          </div>

          {tab !== "Note" && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                className={clsx("h-5 w-9 rounded-full transition-all relative", needsReply ? "bg-[#1A1A1A]" : "bg-gray-200")}
                onClick={() => setNeedsReply(v => !v)}
              >
                <div className={clsx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", needsReply ? "translate-x-4" : "translate-x-0.5")} />
              </div>
              <span className="text-sm font-medium text-[#1A1A1A]">Needs reply</span>
            </label>
          )}

          {error && <p className="text-xs font-bold text-red-500">{error}</p>}

          <button
            onClick={handleSave} disabled={saving}
            className="w-full rounded-2xl bg-[#1A1A1A] py-3.5 text-sm font-bold text-white hover:bg-black transition-all disabled:opacity-50 mt-2"
          >
            {saving ? "Saving..." : "Save Message"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const [items, setItems]           = useState<InboxItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected]     = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]         = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/inbox");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter(m => {
    if (sourceFilter !== "All" && m.source !== sourceFilter) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.subject.toLowerCase().includes(q) && !m.from.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selectedItem = items.find(m => m.id === selected);

  async function handleAdd(payload: Partial<InboxItem>) {
    const res = await fetch("/api/inbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed");
    await fetchItems();
  }

  async function patchItem(id: string, updates: Partial<InboxItem>) {
    setActionBusy(true);
    await fetch("/api/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    setItems(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    setActionBusy(false);
  }

  async function handleDelete(id: string) {
    setActionBusy(true);
    await fetch(`/api/inbox?id=${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(m => m.id !== id));
    setSelected(null);
    setActionBusy(false);
  }

  return (
    <>
      {showModal && <AddModal onClose={() => setShowModal(false)} onSave={handleAdd} />}
      {showCollabModal && selectedItem && (
        <CreateCollabModal
          item={selectedItem}
          onClose={() => setShowCollabModal(false)}
          onCreated={(collabId, collabName) => {
            patchItem(selectedItem.id, { collabId, collabName });
            setShowCollabModal(false);
          }}
        />
      )}

      <div className="flex h-[calc(100dvh-180px)] lg:h-[calc(100vh-130px)] gap-4 sm:gap-6">

        {/* ── List panel ── */}
        <div className={clsx("flex flex-col bento-card overflow-hidden", selected ? "hidden lg:flex lg:w-[400px]" : "flex-1")}>
          <div className="p-6 border-b border-[#E9E9E2] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1A1A1A]">Inbox</h2>
              <button
                onClick={() => setShowModal(true)}
                className="h-9 w-9 rounded-full bg-[#FFD567] flex items-center justify-center text-[#1A1A1A] hover:opacity-90 transition-all shadow-sm"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-10 pr-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 outline-none focus:bg-white transition-all"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {(["All", "Email", "TikTok Screenshot", "Note"] as SourceFilter[]).map(f => (
                <button key={f} onClick={() => setSourceFilter(f)}
                  className={clsx("shrink-0 rounded-xl px-4 py-1.5 text-xs font-bold transition-all",
                    sourceFilter === f ? "bg-[#1A1A1A] text-white" : "bg-[#F7F7F2] text-gray-500 hover:bg-gray-200"
                  )}>
                  {f === "TikTok Screenshot" ? "TikTok" : f}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5">
              {(["all", "open", "in_progress", "done"] as StatusFilter[]).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={clsx("rounded-xl px-3 py-1 text-[11px] font-bold transition-all",
                    statusFilter === s ? "bg-[#1A1A1A] text-white" : "bg-[#F7F7F2] text-gray-500 hover:bg-gray-200"
                  )}>
                  {s === "all" ? "All" : STATUS_LABELS[s as Status]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 rounded-full border-2 border-[#FFD567] border-t-transparent animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <Mail className="h-12 w-12 text-gray-200 mb-4" />
                <p className="text-sm font-bold text-gray-400">
                  {items.length === 0 ? "No messages yet" : "No messages match"}
                </p>
                {items.length === 0 && (
                  <button onClick={() => setShowModal(true)} className="mt-4 text-xs font-bold text-[#1A1A1A] underline">
                    Add your first message
                  </button>
                )}
              </div>
            ) : filtered.map(msg => {
              const Icon = SOURCE_ICONS[msg.source];
              const isActive = selected === msg.id;
              return (
                <button key={msg.id} onClick={() => setSelected(msg.id)}
                  className={clsx("w-full text-left px-6 py-5 transition-all border-b border-[#E9E9E2] last:border-0",
                    isActive ? "bg-[#FFD567]/10" : "hover:bg-[#F7F7F2]"
                  )}>
                  <div className="flex items-start gap-4">
                    <div className={clsx("mt-1 h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white bg-white", SOURCE_COLORS[msg.source])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-[#1A1A1A] truncate">{msg.subject}</span>
                        <span className="text-[10px] font-bold text-gray-400 shrink-0">{timeAgo(msg.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium line-clamp-1 mb-2">
                        {msg.from || msg.body || "No content"}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={clsx("rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border", STATUS_STYLES[msg.status])}>
                          {STATUS_LABELS[msg.status]}
                        </span>
                        {msg.needsReply && (
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                    <ChevronRight className={clsx("h-4 w-4 mt-1 transition-colors", isActive ? "text-[#1A1A1A]" : "text-gray-300")} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Detail panel ── */}
        {selected && selectedItem ? (
          <div className="flex-1 flex flex-col bento-card overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-[#E9E9E2]">
              <button onClick={() => setSelected(null)} className="lg:hidden flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
                <X className="h-5 w-5" /> Back
              </button>
              <div className="hidden lg:block text-xs font-bold text-gray-400 uppercase tracking-widest">Message Details</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => patchItem(selectedItem.id, { needsReply: !selectedItem.needsReply })}
                  title="Toggle needs reply"
                  className={clsx("p-2 rounded-full transition-all",
                    selectedItem.needsReply ? "bg-red-50 text-red-500" : "hover:bg-gray-100 text-gray-400"
                  )}
                >
                  <Reply className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(selectedItem.id)}
                  disabled={actionBusy}
                  className="p-2 rounded-full hover:bg-red-50 text-red-400 transition-all disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-2xl font-bold text-[#1A1A1A] mb-2">{selectedItem.subject}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {selectedItem.from && (
                      <>
                        <span className="text-gray-400 font-bold">From:</span>
                        <span className="text-[#1A1A1A] font-bold bg-[#FFD567]/20 px-2 py-0.5 rounded-lg">{selectedItem.from}</span>
                        <span className="text-gray-300">•</span>
                      </>
                    )}
                    <span className="text-gray-400">{timeAgo(selectedItem.createdAt)}</span>
                  </div>
                </div>
                <div className={clsx("shrink-0 rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border", STATUS_STYLES[selectedItem.status])}>
                  {STATUS_LABELS[selectedItem.status]}
                </div>
              </div>

              {selectedItem.body && (
                <div className="rounded-[32px] border border-[#E9E9E2] bg-[#F7F7F2]/50 p-6 sm:p-8">
                  <p className="text-base text-[#1A1A1A] leading-relaxed font-medium whitespace-pre-wrap">
                    {selectedItem.body}
                  </p>
                </div>
              )}

              {selectedItem.collabName && (
                <div className="flex items-center justify-between rounded-[24px] border border-[#FFD567]/30 bg-[#FFD567]/5 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#FFD567] flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-[#1A1A1A]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Linked Collab</div>
                      <div className="text-sm font-bold text-[#1A1A1A]">{selectedItem.collabName}</div>
                    </div>
                  </div>
                  <Link href="/collabs" className="text-xs font-bold text-[#1A1A1A] underline">View Collabs</Link>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {(["open", "in_progress", "done"] as Status[]).map(s => (
                  <button key={s}
                    onClick={() => patchItem(selectedItem.id, { status: s })}
                    disabled={selectedItem.status === s || actionBusy}
                    className={clsx("rounded-2xl px-4 py-2 text-xs font-bold border transition-all",
                      selectedItem.status === s
                        ? STATUS_STYLES[s] + " cursor-default"
                        : "bg-white border-[#E9E9E2] text-gray-500 hover:border-[#1A1A1A] hover:text-[#1A1A1A] disabled:opacity-40"
                    )}>
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 sm:p-6 border-t border-[#E9E9E2] bg-white flex items-center gap-3">
              {selectedItem.source === "Email" && selectedItem.from ? (
                <a
                  href={`mailto:${selectedItem.from}`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#1A1A1A] py-4 text-sm font-bold text-white hover:bg-black transition-all shadow-lg shadow-black/10"
                >
                  <Reply className="h-4 w-4" /> Send Reply
                </a>
              ) : (
                <div className="flex-1" />
              )}
              <button
                onClick={() => setShowCollabModal(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#FFD567] py-4 text-sm font-bold text-[#1A1A1A] hover:opacity-90 transition-all shadow-lg shadow-amber-200/50"
              >
                <Zap className="h-4 w-4" /> Create Collab
              </button>
              <button
                onClick={() => patchItem(selectedItem.id, { status: "done" })}
                disabled={selectedItem.status === "done" || actionBusy}
                className="h-14 w-14 rounded-2xl border border-[#E9E9E2] bg-white flex items-center justify-center hover:bg-[#F7F7F2] transition-all disabled:opacity-30"
              >
                <CheckCircle className={clsx("h-6 w-6", selectedItem.status === "done" ? "text-emerald-500" : "text-gray-300")} />
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center flex-col gap-4 bento-card bg-white/50">
            <div className="h-20 w-20 rounded-[32px] border border-[#E9E9E2] bg-white flex items-center justify-center shadow-sm">
              <Mail className="h-8 w-8 text-gray-200" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select a conversation</p>
          </div>
        )}
      </div>
    </>
  );
}
