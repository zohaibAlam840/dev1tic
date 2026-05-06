"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Users, TrendingUp, DollarSign, ShoppingBag, Zap,
  AlertTriangle, Shield, BarChart3, UserPlus,
  X, Mail, User, CheckCircle, Send, Clock,
  Lock, Eye, EyeOff,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// ── Invite Modal ──────────────────────────────────────────────────────────────
function InviteModal({ onClose }: { onClose: () => void }) {
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [role,      setRole]      = useState<"creator" | "admin">("creator");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [done,      setDone]      = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(null);
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/invite", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to invite user.");
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
                <div className="text-[11px] text-gray-400">Their login details will be emailed to them</div>
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
                  <p className="text-xs text-gray-400">Share the login details below with them</p>
                </div>
              </div>

              {/* Credentials to share */}
              <div className="rounded-2xl bg-[#1A1A1A] p-5 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Login URL</p>
                  <p className="text-xs text-gray-400">{typeof window !== "undefined" ? window.location.origin : ""}/login</p>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-bold text-white">{email}</p>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Password</p>
                  <p className="text-xl font-black text-[#FFD567] tracking-wide">{password}</p>
                </div>
              </div>

              <button onClick={onClose} className="w-full rounded-2xl bg-[#1A1A1A] py-3 text-sm font-bold text-white hover:bg-black transition-all">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Full name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Sara Fashion"
                    className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-11 pr-4 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="sara@example.com"
                    className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-11 pr-4 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
                  Set a password
                  <span className="ml-2 text-[10px] font-medium text-gray-400 normal-case tracking-normal">They can change it after logging in</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type={showPw ? "text" : "password"} required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-11 pr-12 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["creator", "admin"] as const).map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className={clsx("rounded-2xl border px-4 py-3 text-sm font-semibold transition-all text-left",
                        role === r ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-[#F7F7F2] text-gray-600 border-[#E9E9E2] hover:border-[#1A1A1A]"
                      )}>
                      <div className="font-bold capitalize">{r}</div>
                      <div className={clsx("text-[10px] mt-0.5", role === r ? "text-white/60" : "text-gray-400")}>
                        {r === "creator" ? "Own data only" : "Full workspace access"}
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
                  : <><Send className="h-4 w-4" /> Send invitation</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

// ── Coming Soon placeholder ───────────────────────────────────────────────────
function ComingSoon({ icon: Icon, title, description }: {
  icon: React.ElementType; title: string; description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-2xl bg-[#F7F7F2] border border-[#E9E9E2] flex items-center justify-center mb-5">
        <Icon className="h-7 w-7 text-gray-300" />
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E9E9E2] bg-white px-3 py-1 mb-4">
        <Clock className="h-3 w-3 text-[#FFD567]" />
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Coming Soon</span>
      </div>
      <h3 className="text-base font-bold text-[#1A1A1A] mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type AdminTab = "overview" | "creators" | "alerts" | "collabs";

export default function AdminPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [tab,         setTab]         = useState<AdminTab>("creators");
  const [inviteOpen,  setInviteOpen]  = useState(false);

  useEffect(() => {
    if (!loading && profile?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, profile, router]);

  if (loading || profile?.role !== "admin") {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="h-6 w-6 rounded-full border-2 border-[#FFD567] border-t-[#1A1A1A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-7 space-y-6">

      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} />}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
          <Shield className="h-5 w-5 text-[#FFD567]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Admin Dashboard</h2>
          <p className="text-xs text-gray-400">Manage your workspace and team</p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="ml-auto flex items-center gap-2 rounded-xl bg-[#FFD567] px-4 py-2.5 text-sm font-bold text-[#1A1A1A] hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          <UserPlus className="h-4 w-4" /> Invite
        </button>
      </div>

      {/* Stats row — live data not yet connected */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total GMV",        icon: TrendingUp,  bg: "bg-[#FFD567]/10 border-[#FFD567]/30" },
          { label: "Total Commission", icon: DollarSign,  bg: "bg-emerald-50 border-emerald-100" },
          { label: "Total Orders",     icon: ShoppingBag, bg: "bg-blue-50 border-blue-100" },
          { label: "Active Creators",  icon: Users,       bg: "bg-white border-gray-200" },
        ].map(({ label, icon: Icon, bg }) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${bg}`}>
            <Icon className="h-5 w-5 text-[#1A1A1A]/30 mb-3" />
            <div className="text-2xl font-bold text-gray-200">—</div>
            <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#E9E9E2] bg-white p-1 w-fit shadow-sm">
        {([
          { id: "overview",  label: "Overview",  icon: BarChart3 },
          { id: "creators",  label: "Creators",  icon: Users },
          { id: "alerts",    label: "Alerts",    icon: AlertTriangle },
          { id: "collabs",   label: "Collabs",   icon: Zap },
        ] as { id: AdminTab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={clsx(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all",
              tab === id ? "bg-[#1A1A1A] text-white shadow" : "text-gray-500 hover:text-[#1A1A1A]"
            )}>
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <ComingSoon
          icon={BarChart3}
          title="Overview analytics coming soon"
          description="GMV breakdowns, creator performance charts, and platform-wide stats will appear here once connected to live data."
        />
      )}

      {/* ── CREATORS TAB ── */}
      {tab === "creators" && (
        <div className="bento-card">
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="h-16 w-16 rounded-2xl bg-[#FFD567]/10 border border-[#FFD567]/30 flex items-center justify-center mb-5">
              <Users className="h-7 w-7 text-[#1A1A1A]/30" />
            </div>
            <h3 className="text-base font-bold text-[#1A1A1A] mb-2">No creators yet</h3>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
              Invite your first creator to your workspace. They&apos;ll get an email to set their password and log in.
            </p>
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-[#1A1A1A] px-6 py-3 text-sm font-bold text-white hover:bg-black active:scale-95 transition-all shadow-sm"
            >
              <UserPlus className="h-4 w-4" /> Invite first creator
            </button>
          </div>
        </div>
      )}

      {/* ── ALERTS TAB ── */}
      {tab === "alerts" && (
        <ComingSoon
          icon={AlertTriangle}
          title="Alerts coming soon"
          description="Payment overdue notices, contract expirations, and post deadlines will surface here automatically."
        />
      )}

      {/* ── COLLABS TAB ── */}
      {tab === "collabs" && (
        <ComingSoon
          icon={Zap}
          title="Collabs overview coming soon"
          description="A cross-creator view of all active collaborations, their stages, and values will be available here."
        />
      )}

    </div>
  );
}
