"use client";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import {
  Plus, Search, DollarSign, Calendar, User,
  MoreHorizontal, LayoutGrid, List, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const STAGES = [
  "New Project", "Negotiating", "Accepted", "Contract Signed",
  "Product Sent", "Product Received", "Content Posted",
  "Awaiting Payment", "Paid", "Completed",
];

const STAGE_STYLES: Record<string, string> = {
  "New Project":      "bg-gray-100 text-gray-500 border-gray-200",
  "Negotiating":      "bg-amber-100 text-amber-700 border-amber-200",
  "Accepted":         "bg-blue-100 text-blue-700 border-blue-200",
  "Contract Signed":  "bg-black text-white border-black",
  "Product Sent":     "bg-orange-100 text-orange-700 border-orange-200",
  "Product Received": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "Content Posted":   "bg-[#FFD567] text-[#1A1A1A] border-[#FFD567]",
  "Awaiting Payment": "bg-red-50 text-red-600 border-red-200",
  "Paid":             "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Completed":        "bg-emerald-600 text-white border-emerald-600",
};

type Collab = {
  id: string;
  brand: string;
  product: string;
  stage: string;
  value: number;
  commission: number;
  dueDate: string;
  contact: string;
  notes?: string;
  userId: string;
  createdAt: string;
};

const EMPTY_FORM = {
  brand: "", product: "", stage: "New Project",
  value: "", commission: "", dueDate: "", contact: "", notes: "",
};

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CollabForm({
  form,
  setForm,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
}) {
  const field = (key: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: "Brand Name *", key: "brand", placeholder: "e.g. GlowUp Beauty", span: true },
        { label: "Campaign / Product *", key: "product", placeholder: "e.g. Hydra Serum Launch", span: true },
        { label: "Deal Value ($)", key: "value", placeholder: "1200", type: "number" },
        { label: "Commission (%)", key: "commission", placeholder: "8", type: "number" },
        { label: "Due Date", key: "dueDate", type: "date" },
        { label: "Contact Person", key: "contact", placeholder: "Sarah M." },
      ].map(({ label, key, placeholder, type, span }) => (
        <div key={key} className={span ? "col-span-2" : ""}>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
          <input
            type={type || "text"}
            value={form[key as keyof typeof EMPTY_FORM]}
            onChange={field(key as keyof typeof EMPTY_FORM)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-[#E9E9E2] px-3 py-2.5 text-sm text-[#1A1A1A] outline-none focus:border-[#FFD567] transition-all"
          />
        </div>
      ))}
      <div className="col-span-2">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stage</label>
        <select value={form.stage} onChange={field("stage")}
          className="w-full rounded-xl border border-[#E9E9E2] px-3 py-2.5 text-sm text-[#1A1A1A] outline-none focus:border-[#FFD567] transition-all bg-white">
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="col-span-2">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Notes</label>
        <textarea value={form.notes} onChange={field("notes")} rows={3} placeholder="Optional notes…"
          className="w-full rounded-xl border border-[#E9E9E2] px-3 py-2.5 text-sm text-[#1A1A1A] outline-none focus:border-[#FFD567] transition-all resize-none" />
      </div>
    </div>
  );
}

function CollabModal({
  title,
  form,
  setForm,
  saving,
  onCancel,
  onSave,
  saveLabel,
}: {
  title: string;
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
        <div className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl border border-[#E9E9E2] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E9E9E2]">
            <h2 className="text-base font-bold text-[#1A1A1A]">{title}</h2>
            <button onClick={onCancel}
              className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <CollabForm form={form} setForm={setForm} />
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-[#E9E9E2]">
            <button onClick={onCancel}
              className="flex-1 rounded-xl border border-[#E9E9E2] py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={onSave}
              disabled={saving || !form.brand.trim() || !form.product.trim()}
              className="flex-1 rounded-xl bg-[#FFD567] py-2.5 text-sm font-bold text-[#1A1A1A] hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? "Saving…" : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CollabsPage() {
  const { profile } = useAuth();
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "board">("list");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [editCollab, setEditCollab] = useState<Collab | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    fetchCollabs();
  }, [profile]);

  // Close context menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  async function fetchCollabs() {
    setLoading(true);
    try {
      const res = await fetch("/api/collabs");
      const data = await res.json();
      if (data.collabs) setCollabs(data.collabs);
    } finally {
      setLoading(false);
    }
  }

  async function createCollab() {
    setSaving(true);
    try {
      const res = await fetch("/api/collabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: Number(form.value) || 0,
          commission: Number(form.commission) || 0,
        }),
      });
      const data = await res.json();
      if (data.id) {
        await fetchCollabs();
        setCreateOpen(false);
        setForm(EMPTY_FORM);
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editCollab) return;
    setSaving(true);
    try {
      await fetch("/api/collabs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editCollab.id,
          brand: form.brand,
          product: form.product,
          stage: form.stage,
          value: Number(form.value) || 0,
          commission: Number(form.commission) || 0,
          dueDate: form.dueDate,
          contact: form.contact,
          notes: form.notes,
        }),
      });
      setCollabs(prev => prev.map(c =>
        c.id === editCollab.id
          ? { ...c, brand: form.brand, product: form.product, stage: form.stage,
              value: Number(form.value) || 0, commission: Number(form.commission) || 0,
              dueDate: form.dueDate, contact: form.contact, notes: form.notes }
          : c
      ));
      setEditCollab(null);
    } finally {
      setSaving(false);
    }
  }

  async function updateStage(id: string, stage: string) {
    setCollabs(prev => prev.map(c => c.id === id ? { ...c, stage } : c));
    await fetch("/api/collabs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stage }),
    });
  }

  async function deleteCollab(id: string) {
    setMenuOpen(null);
    setCollabs(prev => prev.filter(c => c.id !== id));
    await fetch(`/api/collabs?id=${id}`, { method: "DELETE" });
  }

  function openCreate(defaultStage?: string) {
    setForm({ ...EMPTY_FORM, stage: defaultStage ?? "New Project" });
    setCreateOpen(true);
  }

  function openEdit(c: Collab) {
    setMenuOpen(null);
    setEditCollab(c);
    setForm({
      brand: c.brand, product: c.product, stage: c.stage,
      value: String(c.value), commission: String(c.commission),
      dueDate: c.dueDate, contact: c.contact, notes: c.notes || "",
    });
  }

  function onDragStart(id: string) { dragId.current = id; }
  function onDrop(stage: string) {
    if (!dragId.current) return;
    updateStage(dragId.current, stage);
    dragId.current = null;
  }

  const filtered = collabs.filter(c => {
    if (stageFilter !== "All" && c.stage !== stageFilter) return false;
    const q = search.toLowerCase();
    if (q && !c.brand.toLowerCase().includes(q) && !c.product.toLowerCase().includes(q)) return false;
    return true;
  });

  const totalValue = collabs.reduce((s, c) => s + c.value, 0);
  const pendingPay = collabs.filter(c => c.stage === "Awaiting Payment").reduce((s, c) => s + c.value, 0);
  const active     = collabs.filter(c => !["Paid", "Completed"].includes(c.stage)).length;
  const closed     = collabs.filter(c => c.stage === "Completed").length;

  return (
    <>
      {createOpen && (
        <CollabModal
          title="New Collaboration"
          form={form}
          setForm={setForm}
          saving={saving}
          onCancel={() => setCreateOpen(false)}
          onSave={createCollab}
          saveLabel="Create Collab"
        />
      )}
      {editCollab && (
        <CollabModal
          title="Edit Collaboration"
          form={form}
          setForm={setForm}
          saving={saving}
          onCancel={() => setEditCollab(null)}
          onSave={saveEdit}
          saveLabel="Save Changes"
        />
      )}

      <div className="space-y-5 sm:space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {[
            { label: "Pipeline", value: `$${totalValue.toLocaleString()}`, Icon: DollarSign, bg: "bg-white" },
            { label: "Pending",  value: `$${pendingPay.toLocaleString()}`, Icon: Calendar,   bg: "bg-[#FFD567]" },
            { label: "Active",   value: active,                            Icon: User,        bg: "bg-white" },
            { label: "Closed",   value: closed,                            Icon: CheckCircleIcon, bg: "bg-white" },
          ].map(({ label, value, Icon, bg }) => (
            <div key={label} className={clsx("bento-card p-6 flex items-center gap-4", bg)}>
              <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center">
                <Icon className="h-5 w-5 text-[#1A1A1A]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#1A1A1A]">{value}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search brand or product…"
                className="w-full rounded-2xl border border-[#E9E9E2] bg-white pl-10 pr-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 outline-none focus:border-[#FFD567] transition-all shadow-sm" />
            </div>
            <div className="flex bg-white rounded-2xl border border-[#E9E9E2] p-1 shadow-sm shrink-0">
              <button onClick={() => setView("list")}
                className={clsx("p-2 rounded-xl transition-all", view === "list" ? "bg-[#1A1A1A] text-white" : "text-gray-400 hover:text-[#1A1A1A]")}>
                <List className="h-4 w-4" />
              </button>
              <button onClick={() => setView("board")}
                className={clsx("p-2 rounded-xl transition-all", view === "board" ? "bg-[#1A1A1A] text-white" : "text-gray-400 hover:text-[#1A1A1A]")}>
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
            <button onClick={() => openCreate()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#FFD567] px-4 py-2.5 text-sm font-bold text-[#1A1A1A] hover:opacity-90 active:scale-95 transition-all shadow-sm shrink-0">
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">Create New</span>
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["All", ...STAGES].map(s => (
              <button key={s} onClick={() => setStageFilter(s)}
                className={clsx("shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95",
                  stageFilter === s ? "bg-[#1A1A1A] text-white" : "bg-white border border-[#E9E9E2] text-gray-500 hover:border-[#1A1A1A]"
                )}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bento-card p-16 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-[#FFD567] border-t-transparent animate-spin" />
          </div>
        ) : collabs.length === 0 ? (
          <div className="bento-card p-16 flex flex-col items-center justify-center text-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#FFD567]/20 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-[#FFD567]" />
            </div>
            <div>
              <p className="font-bold text-[#1A1A1A] text-base">No collaborations yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first collab to start tracking brand deals.</p>
            </div>
            <button onClick={() => openCreate()}
              className="rounded-2xl bg-[#FFD567] px-6 py-2.5 text-sm font-bold text-[#1A1A1A] hover:opacity-90 transition-all">
              + Create First Collab
            </button>
          </div>
        ) : (
          <div className="bento-card overflow-hidden">
            {view === "list" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[560px]">
                  <thead>
                    <tr className="border-b border-[#E9E9E2] bg-[#F7F7F2]/50">
                      {["Brand & Product", "Stage", "Value", "Due Date", "Action"].map((h, i) => (
                        <th key={h} className={clsx(
                          "px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest",
                          i === 3 && "hidden sm:table-cell"
                        )}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id} className="border-b border-[#E9E9E2] hover:bg-[#F7F7F2]/30 transition-all">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm font-bold text-[#1A1A1A]">{c.brand}</div>
                          <div className="text-xs text-gray-400 font-medium">{c.product}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <select value={c.stage}
                            onChange={e => updateStage(c.id, e.target.value)}
                            className={clsx(
                              "rounded-full px-2.5 py-1 text-[9px] font-bold border uppercase tracking-wider cursor-pointer outline-none",
                              STAGE_STYLES[c.stage]
                            )}>
                            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm font-bold text-[#1A1A1A]">${c.value.toLocaleString()}</div>
                          <div className="text-[10px] text-gray-400 font-bold">{c.commission}% comm.</div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">
                          {c.dueDate}
                        </td>
                        <td className="px-4 sm:px-6 py-4 relative">
                          <button
                            onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === c.id ? null : c.id); }}
                            className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {menuOpen === c.id && (
                            <div className="absolute right-4 top-full mt-1 z-30 bg-white rounded-2xl border border-[#E9E9E2] shadow-xl py-2 w-36"
                              onClick={e => e.stopPropagation()}>
                              <button onClick={() => openEdit(c)}
                                className="w-full text-left px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F7F7F2] font-medium">
                                Edit
                              </button>
                              <button onClick={() => deleteCollab(c.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium">
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 flex gap-6 overflow-x-auto no-scrollbar min-h-[500px]">
                {STAGES.map(stage => {
                  const cards = filtered.filter(c => c.stage === stage);
                  return (
                    <div key={stage} className="shrink-0 w-72 flex flex-col"
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => onDrop(stage)}>
                      <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">{stage}</span>
                        <span className="h-5 w-5 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center text-[10px] font-bold text-gray-400">
                          {cards.length}
                        </span>
                      </div>
                      <div className="flex-1 space-y-4 p-2 bg-[#F7F7F2]/50 rounded-[24px] border border-[#E9E9E2]">
                        {cards.map(c => (
                          <div key={c.id} draggable
                            onDragStart={() => onDragStart(c.id)}
                            className="bento-card p-4 bg-white hover:scale-[1.02] cursor-grab active:cursor-grabbing shadow-sm">
                            <div className="text-sm font-bold text-[#1A1A1A] mb-1">{c.brand}</div>
                            <div className="text-[10px] text-gray-400 font-medium mb-4">{c.product}</div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#1A1A1A]">${c.value.toLocaleString()}</span>
                              <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                <Calendar className="h-3 w-3" />{c.dueDate}
                              </span>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => openCreate(stage)}
                          className="w-full py-3 rounded-2xl border-2 border-dashed border-[#E9E9E2] text-gray-400 hover:text-[#1A1A1A] hover:border-[#FFD567] transition-all text-xs font-bold">
                          + Add Card
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
