"use client";
import { useState } from "react";
import clsx from "clsx";
import { Plus, Search, DollarSign, Calendar, User, MoreHorizontal, LayoutGrid, List } from "lucide-react";

const STAGES = [
  "New Project","Negotiating","Accepted","Contract Signed",
  "Product Sent","Product Received","Content Posted","Awaiting Payment","Paid","Completed",
];

const STAGE_STYLES: Record<string, string> = {
  "New Project":     "bg-gray-100 text-gray-500 border-gray-200",
  "Negotiating":     "bg-amber-100 text-amber-700 border-amber-200",
  "Accepted":        "bg-blue-100 text-blue-700 border-blue-200",
  "Contract Signed": "bg-black text-white border-black",
  "Product Sent":    "bg-orange-100 text-orange-700 border-orange-200",
  "Product Received":"bg-cyan-100 text-cyan-700 border-cyan-200",
  "Content Posted":  "bg-[#FFD567] text-[#1A1A1A] border-[#FFD567]",
  "Awaiting Payment":"bg-red-50 text-red-600 border-red-200",
  "Paid":            "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Completed":       "bg-emerald-600 text-white border-emerald-600",
};

const COLLABS = [
  { id:1, brand:"GlowUp Beauty",  product:"Hydra Serum Launch",    stage:"Awaiting Payment", value:1200, commission:8,  dueDate:"May 15", contact:"Sarah M." },
  { id:2, brand:"FitLife Protein",product:"Summer Protein Pack",   stage:"Content Posted",   value:800,  commission:10, dueDate:"May 18", contact:"Jake R." },
  { id:3, brand:"StyleX Collection",product:"Spring Drop",         stage:"Contract Signed",  value:1500, commission:7,  dueDate:"May 22", contact:"Maya K." },
  { id:4, brand:"NaturaPure",     product:"Organic Skincare Kit",  stage:"Product Received", value:600,  commission:12, dueDate:"May 20", contact:"Tom W." },
  { id:5, brand:"BeautyBlend",    product:"Foundation Campaign",   stage:"Paid",             value:2000, commission:6,  dueDate:"Apr 30", contact:"Anna P." },
  { id:6, brand:"EcoSkin",        product:"Sustainable Launch",    stage:"Negotiating",      value:900,  commission:9,  dueDate:"Jun 1",  contact:"Leo C." },
];

export default function CollabsPage() {
  const [view, setView] = useState<"list" | "board">("list");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");

  const filtered = COLLABS.filter((c) => {
    if (stageFilter !== "All" && c.stage !== stageFilter) return false;
    if (search && !c.brand.toLowerCase().includes(search.toLowerCase()) &&
        !c.product.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalValue  = COLLABS.reduce((s, c) => s + c.value, 0);
  const pendingPay  = COLLABS.filter(c => c.stage === "Awaiting Payment").reduce((s,c) => s + c.value, 0);

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {[
          { label:"Pipeline",  value:`$${totalValue.toLocaleString()}`, icon: DollarSign, bg:"bg-white" },
          { label:"Pending",   value:`$${pendingPay.toLocaleString()}`, icon: Calendar,   bg:"bg-[#FFD567]" },
          { label:"Active",    value:COLLABS.filter(c=>!["Paid","Completed"].includes(c.stage)).length, icon: User, bg:"bg-white" },
          { label:"Closed",    value:COLLABS.filter(c=>c.stage==="Completed").length, icon: CheckCircle, bg:"bg-white" },
        ].map(({ label, value, icon: Icon, bg }) => (
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
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search brand or product..."
              className="w-full rounded-2xl border border-[#E9E9E2] bg-white pl-10 pr-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 outline-none focus:border-[#FFD567] transition-all shadow-sm"
            />
          </div>
          <div className="flex bg-white rounded-2xl border border-[#E9E9E2] p-1 shadow-sm shrink-0">
            <button onClick={() => setView("list")} className={clsx("p-2 rounded-xl transition-all", view === "list" ? "bg-[#1A1A1A] text-white" : "text-gray-400 hover:text-[#1A1A1A]")}>
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setView("board")} className={clsx("p-2 rounded-xl transition-all", view === "board" ? "bg-[#1A1A1A] text-white" : "text-gray-400 hover:text-[#1A1A1A]")}>
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <button className="flex items-center justify-center gap-2 rounded-2xl bg-[#FFD567] px-4 py-2.5 text-sm font-bold text-[#1A1A1A] hover:opacity-90 active:scale-95 transition-all shadow-sm shrink-0">
            <Plus className="h-4 w-4" /><span className="hidden sm:inline">Create New</span>
          </button>
        </div>
        {/* Stage filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["All", ...STAGES.slice(0, 6)].map(s => (
            <button key={s} onClick={() => setStageFilter(s)}
              className={clsx("shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95",
                stageFilter === s ? "bg-[#1A1A1A] text-white" : "bg-white border border-[#E9E9E2] text-gray-500 hover:border-[#1A1A1A]"
              )}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Area */}
      <div className="bento-card overflow-hidden">
        {view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-[#E9E9E2] bg-[#F7F7F2]/50">
                  <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brand & Product</th>
                  <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stage</th>
                  <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Value</th>
                  <th className="hidden sm:table-cell px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due Date</th>
                  <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-[#E9E9E2] hover:bg-[#F7F7F2]/30 transition-all group">
                    <td className="px-4 sm:px-6 py-4">
                       <div className="text-sm font-bold text-[#1A1A1A]">{c.brand}</div>
                       <div className="text-xs text-gray-400 font-medium">{c.product}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                       <span className={clsx("rounded-full px-2.5 py-1 text-[9px] font-bold border uppercase tracking-wider whitespace-nowrap", STAGE_STYLES[c.stage])}>
                          {c.stage}
                       </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                       <div className="text-sm font-bold text-[#1A1A1A]">${c.value.toLocaleString()}</div>
                       <div className="text-[10px] text-gray-400 font-bold">{c.commission}% comm.</div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">
                       {c.dueDate}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                       <button className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] transition-all">
                          <MoreHorizontal className="h-4 w-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 flex gap-6 overflow-x-auto no-scrollbar min-h-[500px]">
             {STAGES.map(stage => {
                const stageCards = COLLABS.filter(c => c.stage === stage);
                if (stageCards.length === 0 && !["New Project", "Negotiating"].includes(stage)) return null;
                return (
                   <div key={stage} className="shrink-0 w-72 flex flex-col">
                      <div className="flex items-center justify-between mb-4 px-2">
                         <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">{stage}</span>
                         <span className="h-5 w-5 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center text-[10px] font-bold text-gray-400">{stageCards.length}</span>
                      </div>
                      <div className="flex-1 space-y-4 p-2 bg-[#F7F7F2]/50 rounded-[24px] border border-[#E9E9E2]">
                         {stageCards.map(c => (
                            <div key={c.id} className="bento-card p-4 bg-white hover:scale-[1.02] cursor-pointer shadow-sm">
                               <div className="text-sm font-bold text-[#1A1A1A] mb-1">{c.brand}</div>
                               <div className="text-[10px] text-gray-400 font-medium mb-4">{c.product}</div>
                               <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-[#1A1A1A]">${c.value.toLocaleString()}</span>
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium"><Calendar className="h-3 w-3"/>{c.dueDate}</span>
                               </div>
                            </div>
                         ))}
                         <button className="w-full py-3 rounded-2xl border-2 border-dashed border-[#E9E9E2] text-gray-400 hover:text-[#1A1A1A] hover:border-[#FFD567] transition-all text-xs font-bold">
                            + Add Card
                         </button>
                      </div>
                   </div>
                );
             })}
          </div>
        )}
      </div>
    </div>
  );
}

// Add missing icon
function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
