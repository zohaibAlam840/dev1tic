"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Users, TrendingUp, DollarSign, ShoppingBag, Zap,
  AlertTriangle, Shield, BarChart3, UserPlus,
  X, Mail, User, CheckCircle, Send, Lock, Eye, EyeOff,
  Clock, ArrowRight, MoreVertical, ChevronDown,
  UserX, UserCheck, Trash2, RefreshCw,
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

// ── Types ──────────────────────────────────────────────────────────────────────
type RoleType = "admin" | "manager" | "creator";

type Creator = {
  uid: string; name: string; email: string; role: RoleType;
  is_active: boolean; createdAt: string;
};

type AdminStats = {
  totalGmv: number; totalCommission: number; totalOrders: number; activeCreators: number;
};

type Collab = {
  id: string; brand: string; product?: string; stage: string;
  value?: number; userId: string; createdAt?: string;
};

// ── Role definitions ──────────────────────────────────────────────────────────
const ROLES: { id: RoleType; label: string; desc: string; color: string }[] = [
  {
    id:    "creator",
    label: "Creator",
    desc:  "Sees only their own collabs, orders, and analytics.",
    color: "bg-[#FFD567]/20 border-[#FFD567]/50 text-[#1A1A1A]",
  },
  {
    id:    "manager",
    label: "Manager",
    desc:  "Sees all workspace data. Cannot invite or manage users.",
    color: "bg-violet-50 border-violet-200 text-violet-800",
  },
  {
    id:    "admin",
    label: "Admin",
    desc:  "Full access: workspace data + team management.",
    color: "bg-[#1A1A1A] border-[#1A1A1A] text-[#FFD567]",
  },
];

const ROLE_PILL: Record<RoleType, string> = {
  admin:   "bg-[#1A1A1A] text-[#FFD567]",
  manager: "bg-violet-100 text-violet-700",
  creator: "bg-[#FFD567]/20 border border-[#FFD567]/40 text-[#1A1A1A]",
};

// ── Invite Modal ──────────────────────────────────────────────────────────────
function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited?: () => void }) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [role,     setRole]     = useState<RoleType>("creator");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [done,     setDone]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(null); setLoading(true);
    try {
      const res  = await fetch("/api/admin/invite", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to invite user.");
      onInvited?.();
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button aria-label="close" className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E9E9E2] shadow-2xl overflow-hidden">

          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E9E9E2]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#FFD567] flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-[#1A1A1A]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#1A1A1A]">Invite team member</div>
                <div className="text-[11px] text-gray-400">They can log in immediately</div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-all">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {done ? (
            <div className="px-6 py-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A1A1A]">{name} has been added</p>
                  <p className="text-xs text-gray-400">Share their login credentials below</p>
                </div>
              </div>
              <div className="rounded-2xl bg-[#1A1A1A] p-5 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Login URL</p>
                  <p className="text-xs text-gray-400 font-mono">{typeof window !== "undefined" ? window.location.origin : ""}/login</p>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-bold text-white">{email}</p>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Password</p>
                  <p className="text-xl font-black text-[#FFD567] tracking-wide">{password}</p>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Role</p>
                  <p className="text-sm font-bold text-white capitalize">{role}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-full rounded-2xl bg-[#1A1A1A] py-3 text-sm font-bold text-white hover:bg-black transition-all">Done</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Full name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Sara Fashion"
                    className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-11 pr-4 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="sara@example.com"
                    className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-11 pr-4 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
                  Password
                  <span className="ml-2 text-[10px] font-medium text-gray-400 normal-case tracking-normal">They can change it after logging in</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                    className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-11 pr-12 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Role picker — 3 options */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Role</label>
                <div className="space-y-2">
                  {ROLES.map(r => (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)}
                      className={clsx(
                        "w-full rounded-2xl border px-4 py-3 text-left transition-all",
                        role === r.id
                          ? r.id === "admin"
                            ? "bg-[#1A1A1A] border-[#1A1A1A]"
                            : r.id === "manager"
                            ? "bg-violet-50 border-violet-300"
                            : "bg-[#FFD567]/10 border-[#FFD567]"
                          : "bg-[#F7F7F2] border-[#E9E9E2] hover:border-gray-300"
                      )}>
                      <div className={clsx("font-bold text-sm", role === r.id && r.id === "admin" ? "text-[#FFD567]" : role === r.id && r.id === "manager" ? "text-violet-800" : "text-[#1A1A1A]")}>
                        {r.label}
                      </div>
                      <div className={clsx("text-[11px] mt-0.5", role === r.id && r.id === "admin" ? "text-white/60" : "text-gray-400")}>
                        {r.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1A1A1A] py-4 text-sm font-bold text-white hover:bg-black transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <><Send className="h-4 w-4" /> Add to workspace</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

// ── Member row context menu ───────────────────────────────────────────────────
function MemberMenu({
  member, onRoleChange, onToggleActive, onRemove,
}: {
  member: Creator;
  onRoleChange: (uid: string, role: RoleType) => void;
  onToggleActive: (uid: string, next: boolean) => void;
  onRemove: (uid: string, name: string) => void;
}) {
  const [open,      setOpen]      = useState(false);
  const [roleMenu,  setRoleMenu]  = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false); setRoleMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => { setOpen(v => !v); setRoleMenu(false); }}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all active:scale-95"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-[#E9E9E2] shadow-xl z-20 overflow-hidden py-1">

          {/* Change role submenu trigger */}
          <button
            onClick={() => setRoleMenu(v => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-gray-400" />
              <span>Change role</span>
            </div>
            <ChevronDown className={clsx("h-3.5 w-3.5 text-gray-400 transition-transform", roleMenu && "rotate-180")} />
          </button>

          {roleMenu && (
            <div className="bg-[#F7F7F2] border-y border-[#E9E9E2] py-1">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => { onRoleChange(member.uid, r.id); setOpen(false); setRoleMenu(false); }}
                  className={clsx(
                    "w-full flex items-center gap-2 px-5 py-2 text-xs transition-colors",
                    member.role === r.id
                      ? "font-bold text-[#1A1A1A] bg-[#FFD567]/20"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <span className={clsx("h-2 w-2 rounded-full", member.role === r.id ? "bg-[#1A1A1A]" : "bg-gray-300")} />
                  {r.label}
                  {member.role === r.id && <span className="ml-auto text-[9px] text-gray-400">current</span>}
                </button>
              ))}
            </div>
          )}

          {/* Activate / Deactivate */}
          <button
            onClick={() => { onToggleActive(member.uid, !member.is_active); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            {member.is_active ? (
              <><UserX className="h-3.5 w-3.5 text-amber-500" /><span className="text-amber-600">Deactivate</span></>
            ) : (
              <><UserCheck className="h-3.5 w-3.5 text-emerald-500" /><span className="text-emerald-600">Reactivate</span></>
            )}
          </button>

          <div className="mx-3 my-1 border-t border-[#E9E9E2]" />

          {/* Remove */}
          <button
            onClick={() => { onRemove(member.uid, member.name); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove from workspace
          </button>
        </div>
      )}
    </div>
  );
}

// ── Confirm remove dialog ─────────────────────────────────────────────────────
function ConfirmRemove({
  name, onConfirm, onCancel, loading,
}: {
  name: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <>
      <button aria-label="cancel" className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-3xl border border-[#E9E9E2] shadow-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1A1A]">Remove {name}?</p>
              <p className="text-xs text-gray-400 mt-0.5">Their account will be disabled. This can&apos;t be undone easily.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="flex-1 rounded-2xl border border-[#E9E9E2] py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Stage colors ──────────────────────────────────────────────────────────────
const STAGE_COLORS: Record<string, string> = {
  "Lead":             "bg-gray-100 text-gray-600",
  "Negotiating":      "bg-blue-50 text-blue-700",
  "Accepted":         "bg-indigo-50 text-indigo-700",
  "Contract Signed":  "bg-violet-50 text-violet-700",
  "Product Sent":     "bg-amber-50 text-amber-700",
  "Product Received": "bg-orange-50 text-orange-700",
  "Content Posted":   "bg-pink-50 text-pink-700",
  "Awaiting Payment": "bg-yellow-50 text-yellow-700",
  "Paid":             "bg-emerald-50 text-emerald-700",
  "Completed":        "bg-emerald-100 text-emerald-800",
};

// ── Main Page ─────────────────────────────────────────────────────────────────
type AdminTab = "overview" | "creators" | "alerts" | "collabs";

export default function AdminPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  const [tab,             setTab]             = useState<AdminTab>("creators");
  const [inviteOpen,      setInviteOpen]      = useState(false);
  const [creators,        setCreators]        = useState<Creator[]>([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [refreshKey,      setRefreshKey]      = useState(0);
  const [adminStats,      setAdminStats]      = useState<AdminStats | null>(null);
  const [loadingStats,    setLoadingStats]    = useState(true);
  const [workspaceCollabs,  setWorkspaceCollabs]  = useState<Collab[]>([]);
  const [loadingCollabs,    setLoadingCollabs]    = useState(false);
  const [collabsFetched,    setCollabsFetched]    = useState(false);

  // Confirm remove state
  const [confirmRemove, setConfirmRemove] = useState<{ uid: string; name: string } | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [actionError,   setActionError]   = useState<string | null>(null);

  const canManage = profile?.role === "admin";

  useEffect(() => {
    if (!loading && profile?.role !== "admin" && profile?.role !== "manager") {
      router.replace("/dashboard");
    }
  }, [loading, profile, router]);

  // Fetch creators
  useEffect(() => {
    if (!profile?.accountId) return;
    setCreatorsLoading(true);
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "users"), where("accountId", "==", profile.accountId))
        );
        const list: Creator[] = [];
        snap.forEach(d => {
          if (d.id !== profile.uid) {
            list.push({ uid: d.id, ...(d.data() as Omit<Creator, "uid">) });
          }
        });
        list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
        setCreators(list);
      } finally {
        setCreatorsLoading(false);
      }
    })();
  }, [profile?.accountId, profile?.uid, refreshKey]);

  // Fetch workspace stats
  const fetchStats = useCallback(() => {
    if (!profile?.accountId) return;
    setLoadingStats(true);
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => { if (!d.error) setAdminStats(d); })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, [profile?.accountId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Fetch workspace collabs lazily
  useEffect(() => {
    if (tab !== "collabs" || collabsFetched) return;
    setLoadingCollabs(true);
    fetch("/api/collabs")
      .then(r => r.json())
      .then(d => { if (d.collabs) setWorkspaceCollabs(d.collabs); setCollabsFetched(true); })
      .catch(() => {})
      .finally(() => setLoadingCollabs(false));
  }, [tab, collabsFetched]);

  // ── Member management actions ──────────────────────────────────────────────
  async function handleRoleChange(uid: string, role: RoleType) {
    setActionError(null);
    const res = await fetch("/api/admin/members", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, role }),
    });
    const data = await res.json();
    if (!res.ok) { setActionError(data.error ?? "Failed to update role."); return; }
    setCreators(prev => prev.map(c => c.uid === uid ? { ...c, role } : c));
  }

  async function handleToggleActive(uid: string, nextActive: boolean) {
    setActionError(null);
    const res = await fetch("/api/admin/members", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, is_active: nextActive }),
    });
    const data = await res.json();
    if (!res.ok) { setActionError(data.error ?? "Failed to update."); return; }
    setCreators(prev => prev.map(c => c.uid === uid ? { ...c, is_active: nextActive } : c));
  }

  async function handleRemove() {
    if (!confirmRemove) return;
    setRemoveLoading(true);
    const res = await fetch("/api/admin/members", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: confirmRemove.uid }),
    });
    const data = await res.json();
    setRemoveLoading(false);
    if (!res.ok) { setActionError(data.error ?? "Failed to remove."); setConfirmRemove(null); return; }
    setCreators(prev => prev.filter(c => c.uid !== confirmRemove.uid));
    fetchStats();
    setConfirmRemove(null);
  }

  if (loading || (profile?.role !== "admin" && profile?.role !== "manager")) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="h-6 w-6 rounded-full border-2 border-[#FFD567] border-t-[#1A1A1A] animate-spin" />
      </div>
    );
  }

  const uidToName: Record<string, string> = { [profile.uid]: profile.name ?? "You" };
  creators.forEach(c => { uidToName[c.uid] = c.name; });

  const fmtCurrency = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(2)}`;

  return (
    <div className="p-5 lg:p-7 space-y-6">

      {canManage && inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onInvited={() => { setRefreshKey(k => k + 1); fetchStats(); }}
        />
      )}

      {confirmRemove && (
        <ConfirmRemove
          name={confirmRemove.name}
          onConfirm={handleRemove}
          onCancel={() => setConfirmRemove(null)}
          loading={removeLoading}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
          <Shield className="h-5 w-5 text-[#FFD567]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Admin Dashboard</h2>
          <p className="text-xs text-gray-400">Manage your workspace and team</p>
        </div>
        {canManage && (
          <button
            onClick={() => setInviteOpen(true)}
            className="ml-auto flex items-center gap-2 rounded-xl bg-[#FFD567] px-4 py-2.5 text-sm font-bold text-[#1A1A1A] hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <UserPlus className="h-4 w-4" /> Invite
          </button>
        )}
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-2">
        {ROLES.map(r => (
          <div key={r.id} className={clsx("flex items-center gap-2 rounded-xl border px-3 py-2", r.color)}>
            <span className="text-xs font-bold">{r.label}</span>
            <span className={clsx("text-[11px]", r.id === "admin" ? "text-white/60" : "text-gray-500")}>{r.desc}</span>
          </div>
        ))}
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          <X className="h-3.5 w-3.5 shrink-0" />
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-auto"><X className="h-3 w-3" /></button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: "Total GMV",        icon: TrendingUp,  bg: "bg-[#FFD567]/10 border-[#FFD567]/30", value: loadingStats ? null : fmtCurrency(adminStats?.totalGmv ?? 0) },
          { label: "Total Commission", icon: DollarSign,  bg: "bg-emerald-50 border-emerald-100",    value: loadingStats ? null : fmtCurrency(adminStats?.totalCommission ?? 0) },
          { label: "Total Orders",     icon: ShoppingBag, bg: "bg-blue-50 border-blue-100",          value: loadingStats ? null : String(adminStats?.totalOrders ?? 0) },
          { label: "Active Members",   icon: Users,       bg: "bg-white border-gray-200",            value: loadingStats ? null : String(adminStats?.activeCreators ?? 0) },
        ] as { label: string; icon: React.ElementType; bg: string; value: string | null }[]).map(({ label, icon: Icon, bg, value }) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${bg}`}>
            <Icon className="h-5 w-5 text-[#1A1A1A]/30 mb-3" />
            {value === null
              ? <div className="h-7 w-16 rounded-lg bg-gray-100 animate-pulse mb-1" />
              : <div className="text-2xl font-bold text-[#1A1A1A]">{value}</div>}
            <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#E9E9E2] bg-white p-1 w-fit shadow-sm overflow-x-auto">
        {([
          { id: "overview",  label: "Overview",  icon: BarChart3 },
          { id: "creators",  label: "Team",      icon: Users },
          { id: "alerts",    label: "Alerts",    icon: AlertTriangle },
          { id: "collabs",   label: "Collabs",   icon: Zap },
        ] as { id: AdminTab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={clsx(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap",
              tab === id ? "bg-[#1A1A1A] text-white shadow" : "text-gray-500 hover:text-[#1A1A1A]"
            )}>
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { label: "Workspace GMV",   value: loadingStats ? null : fmtCurrency(adminStats?.totalGmv ?? 0),        sub: "All time · all creators", color: "text-[#1A1A1A]" },
              { label: "Commission",      value: loadingStats ? null : fmtCurrency(adminStats?.totalCommission ?? 0), sub: "From paid orders",        color: "text-emerald-600" },
              { label: "Orders",          value: loadingStats ? null : String(adminStats?.totalOrders ?? 0),          sub: "Across workspace",        color: "text-blue-600" },
              { label: "Active Members",  value: loadingStats ? null : String(adminStats?.activeCreators ?? 0),       sub: "Creators + managers",     color: "text-violet-600" },
            ]).map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-2xl border border-[#E9E9E2] bg-white p-5 shadow-sm">
                {value === null ? <div className="h-8 w-20 rounded-lg bg-gray-100 animate-pulse mb-1" /> : <div className={`text-3xl font-black ${color}`}>{value}</div>}
                <div className="text-sm font-semibold text-[#1A1A1A] mt-1">{label}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>

          {/* Team roster */}
          <div className="bento-card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9E9E2]">
              <div className="text-sm font-bold text-[#1A1A1A]">Team — {creators.length + 1} member{creators.length !== 0 ? "s" : ""}</div>
              {canManage && (
                <button onClick={() => setInviteOpen(true)} className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A] hover:underline">
                  <UserPlus className="h-3.5 w-3.5" /> Invite
                </button>
              )}
            </div>
            <div className="divide-y divide-[#E9E9E2]">
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="h-10 w-10 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0 text-sm font-bold text-[#FFD567]">
                  {(profile.name ?? "A").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#1A1A1A] truncate">{profile.name} <span className="text-[10px] text-gray-400 font-normal">(you)</span></div>
                  <div className="text-xs text-gray-400 truncate">{profile.email}</div>
                </div>
                <span className={clsx("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shrink-0", ROLE_PILL[profile.role as RoleType] ?? "bg-gray-100 text-gray-600")}>{profile.role}</span>
              </div>
              {creators.map(c => (
                <div key={c.uid} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-10 w-10 rounded-full bg-[#FFD567] flex items-center justify-center shrink-0 text-sm font-bold text-[#1A1A1A]">
                    {c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[#1A1A1A] truncate">{c.name}</div>
                    <div className="text-xs text-gray-400 truncate">{c.email}</div>
                  </div>
                  <span className={clsx("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shrink-0", ROLE_PILL[c.role])}>{c.role}</span>
                  <span className={clsx("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shrink-0 hidden sm:inline-flex", c.is_active !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-gray-100 text-gray-500 border border-gray-200")}>
                    {c.is_active !== false ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATORS (TEAM) TAB ── */}
      {tab === "creators" && (
        <div className="bento-card">
          {creatorsLoading ? (
            <div className="flex items-center justify-center py-20">
              <span className="h-6 w-6 rounded-full border-2 border-[#FFD567] border-t-[#1A1A1A] animate-spin" />
            </div>
          ) : creators.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="h-16 w-16 rounded-2xl bg-[#FFD567]/10 border border-[#FFD567]/30 flex items-center justify-center mb-5">
                <Users className="h-7 w-7 text-[#1A1A1A]/30" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A] mb-2">No team members yet</h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
                {canManage
                  ? "Invite creators and managers. Each person gets their own login and is scoped to this workspace."
                  : "The workspace admin hasn't invited any team members yet."}
              </p>
              {canManage && (
                <button onClick={() => setInviteOpen(true)} className="flex items-center gap-2 rounded-2xl bg-[#1A1A1A] px-6 py-3 text-sm font-bold text-white hover:bg-black active:scale-95 transition-all shadow-sm">
                  <UserPlus className="h-4 w-4" /> Invite first member
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9E9E2]">
                <p className="text-sm font-bold text-[#1A1A1A]">{creators.length} member{creators.length !== 1 ? "s" : ""}</p>
                {canManage && (
                  <button onClick={() => setInviteOpen(true)} className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A] hover:underline">
                    <UserPlus className="h-3.5 w-3.5" /> Invite another
                  </button>
                )}
              </div>
              <div className="divide-y divide-[#E9E9E2]">
                {creators.map(c => {
                  const initials = c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  const joined   = c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—";
                  return (
                    <div key={c.uid} className={clsx("flex items-center gap-4 px-6 py-4 transition-colors", !c.is_active && "opacity-60 bg-gray-50/50")}>
                      <div className="h-10 w-10 rounded-full bg-[#FFD567] flex items-center justify-center shrink-0 text-sm font-bold text-[#1A1A1A]">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-[#1A1A1A] truncate">{c.name}</div>
                          {!c.is_active && (
                            <span className="rounded-full bg-gray-100 border border-gray-200 text-gray-500 px-2 py-0.5 text-[9px] font-bold uppercase shrink-0">Inactive</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{c.email}</div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <span className={clsx("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", ROLE_PILL[c.role])}>
                          {c.role}
                        </span>
                      </div>
                      <div className="hidden md:block text-xs text-gray-400 shrink-0 w-28 text-right">
                        Joined {joined}
                      </div>
                      {canManage && <MemberMenu
                        member={c}
                        onRoleChange={handleRoleChange}
                        onToggleActive={handleToggleActive}
                        onRemove={(uid, name) => setConfirmRemove({ uid, name })}
                      />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ALERTS TAB ── */}
      {tab === "alerts" && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#F7F7F2] border border-[#E9E9E2] flex items-center justify-center mb-5">
            <AlertTriangle className="h-7 w-7 text-gray-300" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E9E9E2] bg-white px-3 py-1 mb-4">
            <Clock className="h-3 w-3 text-[#FFD567]" />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Coming Soon</span>
          </div>
          <h3 className="text-base font-bold text-[#1A1A1A] mb-2">Workspace Alerts</h3>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            Payment overdue notices, contract expirations, and post deadlines will surface here automatically.
          </p>
        </div>
      )}

      {/* ── COLLABS TAB ── */}
      {tab === "collabs" && (
        <div className="bento-card">
          {loadingCollabs ? (
            <div className="flex items-center justify-center py-20">
              <span className="h-6 w-6 rounded-full border-2 border-[#FFD567] border-t-[#1A1A1A] animate-spin" />
            </div>
          ) : workspaceCollabs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="h-16 w-16 rounded-2xl bg-[#FFD567]/10 border border-[#FFD567]/30 flex items-center justify-center mb-5">
                <Zap className="h-7 w-7 text-[#1A1A1A]/30" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A] mb-2">No collabs yet</h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
                Once creators start adding collaborations, they&apos;ll all appear here.
              </p>
              <a href="/collabs" className="flex items-center gap-2 rounded-2xl bg-[#1A1A1A] px-6 py-3 text-sm font-bold text-white hover:bg-black active:scale-95 transition-all shadow-sm">
                <Zap className="h-4 w-4" /> Add first collab <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9E9E2]">
                <p className="text-sm font-bold text-[#1A1A1A]">{workspaceCollabs.length} collab{workspaceCollabs.length !== 1 ? "s" : ""}</p>
                <button onClick={() => { setCollabsFetched(false); }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#1A1A1A] transition-colors">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                  <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1.2fr] gap-3 px-6 py-3 border-b border-[#E9E9E2] text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    <div>Brand / Product</div><div>Creator</div><div>Stage</div><div>Value</div><div>Added</div>
                  </div>
                  {workspaceCollabs
                    .slice().sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
                    .map(c => (
                      <div key={c.id} className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1.2fr] gap-3 px-6 py-4 border-b border-[#E9E9E2] hover:bg-gray-50 transition-all items-center last:border-0">
                        <div>
                          <div className="text-sm font-bold text-[#1A1A1A] truncate">{c.brand}</div>
                          {c.product && <div className="text-xs text-gray-400 truncate">{c.product}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-[#FFD567] flex items-center justify-center shrink-0 text-[10px] font-bold text-[#1A1A1A]">
                            {(uidToName[c.userId] ?? "?").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 truncate">{uidToName[c.userId] ?? c.userId.slice(0, 8)}</span>
                        </div>
                        <div>
                          <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold", STAGE_COLORS[c.stage] ?? "bg-gray-100 text-gray-600")}>
                            {c.stage}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-[#1A1A1A]">{c.value ? `$${c.value.toLocaleString()}` : "—"}</div>
                        <div className="text-xs text-gray-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
