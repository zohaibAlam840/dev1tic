"use client";
import { useState } from "react";
import clsx from "clsx";
import { Plus, Search, Package, Clock, CheckCircle2, XCircle, AlertTriangle, Video, Zap, Star, MoreHorizontal } from "lucide-react";

type SampleStatus = "Needs content" | "Completed" | "Canceled";

const STATUS_STYLES: Record<SampleStatus, string> = {
  "Needs content": "bg-amber-50  text-amber-700  border-amber-200",
  "Completed":     "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Canceled":      "bg-red-50    text-red-600    border-red-200",
};
const TYPE_STYLES: Record<string, string> = {
  "Free sample":       "bg-violet-50 text-violet-700 border-violet-200",
  "Refundable sample": "bg-blue-50   text-blue-700   border-blue-200",
};
const FILL_ICONS: Record<string, React.ElementType> = { Video, Live: Zap, Both: Star };

const SAMPLES = [
  { id:1, product:"Hydra Serum 50ml",    type:"Free sample",       daysLeft:3,  receivedDate:"Apr 28", dueDate:"May 5",  fulfillment:"Video", status:"Needs content" as SampleStatus, collab:"GlowUp Beauty",  notes:"Post 1 TikTok video min 30s." },
  { id:2, product:"FitLife Protein",     type:"Refundable sample", daysLeft:7,  receivedDate:"Apr 30", dueDate:"May 9",  fulfillment:"Both",  status:"Needs content" as SampleStatus, collab:"FitLife Collab", notes:"Video + live stream required." },
  { id:3, product:"NaturaPure Oil",      type:"Free sample",       daysLeft:1,  receivedDate:"Apr 25", dueDate:"May 3",  fulfillment:"Video", status:"Needs content" as SampleStatus, collab:null,             notes:"URGENT — deadline tomorrow." },
  { id:4, product:"StyleX Jacket",       type:"Free sample",       daysLeft:12, receivedDate:"May 1",  dueDate:"May 14", fulfillment:"Live",  status:"Needs content" as SampleStatus, collab:"StyleX Collab",  notes:"Live showcase required." },
  { id:5, product:"VitaGlow Serum",      type:"Refundable sample", daysLeft:0,  receivedDate:"Apr 20", dueDate:"Apr 30", fulfillment:"Video", status:"Completed"     as SampleStatus, collab:"VitaGlow",       notes:"Posted May 1st." },
  { id:6, product:"EcoSkin Lotion",      type:"Free sample",       daysLeft:0,  receivedDate:"Apr 15", dueDate:"Apr 25", fulfillment:"Video", status:"Completed"     as SampleStatus, collab:null,             notes:"Great engagement." },
  { id:7, product:"LuxHair Mask",        type:"Free sample",       daysLeft:0,  receivedDate:"Apr 10", dueDate:"Apr 20", fulfillment:"Video", status:"Canceled"      as SampleStatus, collab:null,             notes:"Brand cancelled campaign." },
];

type SView = "All" | "Needs content" | "Due soon" | "Completed" | "Canceled";
const VIEWS: SView[] = ["All","Needs content","Due soon","Completed","Canceled"];

export default function SamplesPage() {
  const [view, setView]     = useState<SView>("All");
  const [search, setSearch] = useState("");

  const filtered = SAMPLES.filter(s => {
    if (search && !s.product.toLowerCase().includes(search.toLowerCase())) return false;
    if (view==="All") return true;
    if (view==="Due soon") return s.status==="Needs content" && s.daysLeft<=7;
    return s.status===view;
  });

  const counts = {
    "Needs content": SAMPLES.filter(s=>s.status==="Needs content").length,
    "Due soon": SAMPLES.filter(s=>s.status==="Needs content" && s.daysLeft<=7).length,
    "Completed": SAMPLES.filter(s=>s.status==="Completed").length,
    "Canceled": SAMPLES.filter(s=>s.status==="Canceled").length,
  };

  return (
    <div className="p-5 lg:p-7 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Samples Tracker</h2>
          <p className="text-xs text-gray-400 mt-0.5">Track product samples and content deadlines</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm shadow-violet-200 w-fit">
          <Plus className="h-4 w-4" /> Add Sample
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Needs Content", value:counts["Needs content"], icon:Clock,        bg:"bg-amber-50 border-amber-100",   ic:"bg-amber-100 text-amber-600" },
          { label:"Due Soon (7d)", value:counts["Due soon"],      icon:AlertTriangle, bg:"bg-red-50 border-red-100",       ic:"bg-red-100 text-red-600" },
          { label:"Completed",     value:counts["Completed"],     icon:CheckCircle2,  bg:"bg-emerald-50 border-emerald-100",ic:"bg-emerald-100 text-emerald-600" },
          { label:"Canceled",      value:counts["Canceled"],      icon:XCircle,       bg:"bg-gray-50 border-gray-100",     ic:"bg-gray-100 text-gray-500" },
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

      {/* View tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 overflow-x-auto shadow-sm">
          {VIEWS.map(v=>{
            const c = v==="All" ? SAMPLES.length : (counts[v as keyof typeof counts] ?? 0);
            return (
              <button key={v} onClick={()=>setView(v)}
                className={clsx("shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  view===v ? "bg-violet-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"
                )}>
                {v}
                {c>0 && <span className={clsx("h-4 min-w-4 rounded-full px-1 flex items-center justify-center text-[9px] font-bold",
                  view===v ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500")}>{c}</span>}
              </button>
            );
          })}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search product name..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-300 transition-all shadow-sm" />
        </div>
      </div>

      {/* Cards */}
      {filtered.length===0 ? (
        <div className="py-20 text-center">
          <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No samples in this view</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s=>{
            const FIcon = FILL_ICONS[s.fulfillment];
            const urgent = s.status==="Needs content" && s.daysLeft<=3;
            return (
              <div key={s.id} className={clsx("rounded-2xl border bg-white p-5 hover:shadow-md transition-all shadow-sm",
                urgent ? "border-red-200" : "border-gray-200"
              )}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 leading-tight">{s.product}</div>
                    {s.collab && <div className="text-xs text-violet-600 mt-0.5">{s.collab}</div>}
                  </div>
                  <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className={clsx("rounded-lg border px-2 py-0.5 text-[10px] font-semibold", TYPE_STYLES[s.type])}>{s.type}</span>
                  <span className={clsx("rounded-lg border px-2 py-0.5 text-[10px] font-semibold", STATUS_STYLES[s.status])}>{s.status}</span>
                  <span className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600">
                    <FIcon className="h-3 w-3" /> {s.fulfillment}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-xl bg-gray-50 p-2.5">
                    <div className="text-[10px] text-gray-400 mb-0.5">Received</div>
                    <div className="text-xs font-medium text-gray-700">{s.receivedDate}</div>
                  </div>
                  <div className={clsx("rounded-xl p-2.5", urgent ? "bg-red-50" : "bg-gray-50")}>
                    <div className={clsx("text-[10px] mb-0.5", urgent ? "text-red-500" : "text-gray-400")}>Due Date</div>
                    <div className={clsx("text-xs font-medium", urgent ? "text-red-700" : "text-gray-700")}>{s.dueDate}</div>
                  </div>
                </div>

                {s.status==="Needs content" && (
                  <div className={clsx("flex items-center gap-2 rounded-xl px-3 py-2 mb-3 border", urgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200")}>
                    <Clock className={clsx("h-3.5 w-3.5 shrink-0", urgent ? "text-red-500" : "text-amber-600")} />
                    <span className={clsx("text-xs font-semibold", urgent ? "text-red-700" : "text-amber-700")}>
                      {s.daysLeft===0 ? "Due today!" : `${s.daysLeft} day${s.daysLeft!==1?"s":""} left`}
                    </span>
                  </div>
                )}

                {s.notes && <p className="text-xs text-gray-400 line-clamp-2">{s.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
