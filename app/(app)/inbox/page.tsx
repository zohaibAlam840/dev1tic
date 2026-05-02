"use client";
import { useState } from "react";
import clsx from "clsx";
import {
  Mail, Image as ImageIcon, FileText, Plus, Search,
  Zap, CheckCircle, Clock, Link2, X, Reply, ChevronRight,
} from "lucide-react";

type SourceType = "All" | "Email" | "TikTok Screenshot" | "Note";
type StatusType = "all" | "open" | "in_progress" | "done";

const MESSAGES = [
  { id: 1, source: "Email",             subject: "Collab Proposal — GlowUp Beauty x Ali",  preview: "Hi Ali! We'd love to collaborate on our new serum launch. We're offering $800 flat fee plus 8% commission...", from: "sarah@glowupbeauty.com", time: "2h ago",  status: "open",        needsReply: true,  collab: null },
  { id: 2, source: "TikTok Screenshot", subject: "TikTok DM — FitLife Protein",             preview: "Hey! We saw your recent content and think you'd be perfect for our new protein launch campaign...",             from: "TikTok DM",            time: "5h ago",  status: "in_progress", needsReply: false, collab: "FitLife Collab" },
  { id: 3, source: "Email",             subject: "Contract Ready — StyleX Collection",      preview: "Please find attached the influencer agreement for the StyleX Spring Collection campaign...",                   from: "contracts@stylex.co",  time: "1d ago",  status: "open",        needsReply: true,  collab: "StyleX Collab" },
  { id: 4, source: "Note",              subject: "Follow-up reminder — NaturaPure",         preview: "Need to follow up on the NaturaPure sample shipment. Expected delivery was 3 days ago.",                      from: "Manual Note",           time: "2d ago",  status: "done",        needsReply: false, collab: "NaturaPure Collab" },
  { id: 5, source: "Email",             subject: "Payment Confirmation — BeautyBlend",      preview: "Your payment of $1,200 for the BeautyBlend collaboration has been processed...",                              from: "payments@beautyblend.com", time: "3d ago", status: "done",       needsReply: false, collab: "BeautyBlend Collab" },
];

const SOURCE_ICONS: Record<string, React.ElementType> = {
  Email: Mail, "TikTok Screenshot": ImageIcon, Note: FileText,
};
const STATUS_STYLES: Record<string, string> = {
  open:        "bg-amber-50  text-amber-600  border-amber-200",
  in_progress: "bg-gray-50 text-[#1A1A1A] border-gray-200",
  done:        "bg-emerald-50 text-emerald-600 border-emerald-200",
};
const STATUS_LABELS: Record<string, string> = {
  open: "Open", in_progress: "In Progress", done: "Done",
};

export default function InboxPage() {
  const [sourceFilter, setSourceFilter] = useState<SourceType>("All");
  const [statusFilter, setStatusFilter] = useState<StatusType>("all");
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = MESSAGES.filter((m) => {
    if (sourceFilter !== "All" && m.source !== sourceFilter) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (search && !m.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedMsg = MESSAGES.find((m) => m.id === selected);

  return (
    <div className="flex h-[calc(100dvh-180px)] lg:h-[calc(100vh-130px)] gap-4 sm:gap-6">
      {/* List panel */}
      <div className={clsx("flex flex-col bento-card overflow-hidden", selected ? "hidden lg:flex lg:w-[400px]" : "flex-1")}>
        <div className="p-6 border-b border-[#E9E9E2] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Inbox</h2>
            <button className="h-9 w-9 rounded-full bg-[#FFD567] flex items-center justify-center text-[#1A1A1A] hover:opacity-90 transition-all shadow-sm">
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-10 pr-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 outline-none focus:bg-white transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(["All", "Email", "TikTok Screenshot", "Note"] as SourceType[]).map((f) => (
              <button key={f} onClick={() => setSourceFilter(f)}
                className={clsx("shrink-0 rounded-xl px-4 py-1.5 text-xs font-bold transition-all",
                  sourceFilter === f ? "bg-[#1A1A1A] text-white" : "bg-[#F7F7F2] text-gray-500 hover:bg-gray-200"
                )}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <Mail className="h-12 w-12 text-gray-200 mb-4" />
              <p className="text-sm font-bold text-gray-400">No messages found</p>
            </div>
          ) : filtered.map((msg) => {
            const Icon = SOURCE_ICONS[msg.source] ?? Mail;
            const isActive = selected === msg.id;
            return (
              <button key={msg.id} onClick={() => setSelected(msg.id)}
                className={clsx("w-full text-left px-6 py-5 transition-all border-b border-[#E9E9E2] last:border-0",
                  isActive ? "bg-[#FFD567]/10" : "hover:bg-[#F7F7F2]"
                )}>
                <div className="flex items-start gap-4">
                  <div className={clsx("mt-1 h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white",
                    msg.source === "Email" ? "bg-white text-blue-500" :
                    msg.source === "TikTok Screenshot" ? "bg-white text-pink-500" :
                    "bg-white text-amber-500"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-bold text-[#1A1A1A] truncate">{msg.subject}</span>
                      <span className="text-[10px] font-bold text-gray-400 shrink-0">{msg.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium line-clamp-1 mb-2">{msg.preview}</p>
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

      {/* Detail panel */}
      {selected && selectedMsg ? (
        <div className="flex-1 flex flex-col bento-card overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-[#E9E9E2]">
            <button onClick={() => setSelected(null)} className="lg:hidden flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
              <X className="h-5 w-5" /> Back
            </button>
            <div className="hidden lg:block text-xs font-bold text-gray-400 uppercase tracking-widest">Message Details</div>
            <div className="flex items-center gap-3">
               <button className="p-2 rounded-full hover:bg-gray-100"><Reply className="h-4 w-4 text-gray-500" /></button>
               <button className="p-2 rounded-full hover:bg-gray-100 text-red-500"><X className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-[#1A1A1A] mb-2">{selectedMsg.subject}</h3>
                <div className="flex items-center gap-2 text-sm font-medium">
                   <span className="text-gray-400 font-bold">From:</span>
                   <span className="text-[#1A1A1A] font-bold bg-[#FFD567]/20 px-2 py-0.5 rounded-lg">{selectedMsg.from}</span>
                   <span className="text-gray-300 mx-1">•</span>
                   <span className="text-gray-400">{selectedMsg.time}</span>
                </div>
              </div>
              <div className={clsx("rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border", STATUS_STYLES[selectedMsg.status])}>
                {STATUS_LABELS[selectedMsg.status]}
              </div>
            </div>

            <div className="rounded-[32px] border border-[#E9E9E2] bg-[#F7F7F2]/50 p-8">
              <p className="text-base text-[#1A1A1A] leading-relaxed font-medium">
                 {selectedMsg.preview}
              </p>
              <div className="h-px bg-[#E9E9E2] my-8" />
              <p className="text-base text-[#1A1A1A] leading-relaxed font-medium">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <div className="mt-8 flex gap-3">
                 <div className="h-24 w-32 rounded-2xl bg-gray-100 border border-[#E9E9E2] flex items-center justify-center text-gray-400 font-bold text-xs">IMG_023.jpg</div>
                 <div className="h-24 w-32 rounded-2xl bg-gray-100 border border-[#E9E9E2] flex items-center justify-center text-gray-400 font-bold text-xs">IMG_024.jpg</div>
              </div>
            </div>

            {selectedMsg.collab && (
              <div className="flex items-center justify-between rounded-[24px] border border-[#FFD567]/30 bg-[#FFD567]/5 px-6 py-4">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-[#FFD567] flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-[#1A1A1A]" />
                   </div>
                   <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Linked Collab</div>
                      <div className="text-sm font-bold text-[#1A1A1A]">{selectedMsg.collab}</div>
                   </div>
                </div>
                <button className="text-xs font-bold text-[#1A1A1A] underline">View Collab</button>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-6 border-t border-[#E9E9E2] bg-white flex items-center justify-center gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#1A1A1A] py-4 text-sm font-bold text-white hover:bg-black transition-all shadow-lg shadow-black/10">
              <Reply className="h-4 w-4" /> Send Reply
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#FFD567] py-4 text-sm font-bold text-[#1A1A1A] hover:opacity-90 transition-all shadow-lg shadow-amber-200/50">
              <Zap className="h-4 w-4" /> Create Campaign
            </button>
            <button className="h-14 w-14 rounded-2xl border border-[#E9E9E2] bg-white flex items-center justify-center hover:bg-[#F7F7F2] transition-all">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
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
  );
}
