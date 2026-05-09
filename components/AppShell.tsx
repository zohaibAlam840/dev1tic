"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import {
  collection, query, where, orderBy, limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  TrendingUp, Mail, Zap, ShoppingBag, BarChart3, Star,
  Settings, Shield, Bell, Menu, X, LogOut, Plus,
  FileSpreadsheet, MoreHorizontal,
  UserPlus, ArrowRight, Star as StarIcon,
  CheckCheck,
} from "lucide-react";

// ── Notification types ────────────────────────────────────────────────────────
type NotifType =
  | "welcome" | "member_joined" | "new_collab" | "stage_change"
  | "new_sample" | "new_order" | "needs_reply" | "role_changed" | "system";

type Notification = {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string | null;
};

const NOTIF_ICON: Record<NotifType, React.ElementType> = {
  welcome:       UserPlus,
  member_joined: UserPlus,
  new_collab:    Zap,
  stage_change:  ArrowRight,
  new_sample:    StarIcon,
  new_order:     ShoppingBag,
  needs_reply:   Mail,
  role_changed:  Shield,
  system:        Bell,
};

const NOTIF_COLOR: Record<NotifType, string> = {
  welcome:       "bg-[#FFD567] text-[#1A1A1A]",
  member_joined: "bg-emerald-100 text-emerald-700",
  new_collab:    "bg-violet-100 text-violet-700",
  stage_change:  "bg-blue-100 text-blue-700",
  new_sample:    "bg-pink-100 text-pink-700",
  new_order:     "bg-emerald-100 text-emerald-700",
  needs_reply:   "bg-amber-100 text-amber-700",
  role_changed:  "bg-orange-100 text-orange-700",
  system:        "bg-gray-100 text-gray-600",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return "just now";
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ── Notification Panel ────────────────────────────────────────────────────────
function NotificationPanel({
  notifications, unreadCount, onMarkAll, onMarkOne, onClose,
}: {
  notifications: Notification[];
  unreadCount: number;
  onMarkAll: () => void;
  onMarkOne: (id: string, link?: string | null) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl border border-[#E9E9E2] shadow-2xl z-[60] overflow-hidden"
      style={{ maxHeight: "480px", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9E9E2] shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#1A1A1A]" />
          <span className="text-sm font-bold text-[#1A1A1A]">Notifications</span>
          {unreadCount > 0 && (
            <span className="h-5 min-w-5 rounded-full bg-[#FFD567] text-[#1A1A1A] text-[10px] font-black flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAll}
            className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-[#1A1A1A] transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Bell className="h-5 w-5 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">All caught up</p>
            <p className="text-xs text-gray-300 mt-0.5">No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map(n => {
              const Icon = NOTIF_ICON[n.type] ?? Bell;
              const color = NOTIF_COLOR[n.type] ?? "bg-gray-100 text-gray-600";
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    onMarkOne(n.id, n.link);
                    if (n.link) router.push(n.link);
                    onClose();
                  }}
                  className={clsx(
                    "w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-[#E9E9E2] last:border-0 transition-colors hover:bg-gray-50 active:bg-gray-100",
                    !n.read && "bg-[#FFFDF0]"
                  )}
                >
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-[#1A1A1A] leading-snug">{n.title}</p>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-[#FFD567] shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-gray-300 mt-1 font-medium">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
const NAV = [
  { href: "/dashboard", icon: TrendingUp, label: "Dashboard" },
  { href: "/inbox",     icon: Mail,       label: "Inbox" },
  { href: "/collabs",   icon: Zap,        label: "Collabs" },
  { href: "/orders",    icon: ShoppingBag, label: "Orders" },
  { href: "/analytics", icon: BarChart3,  label: "Analytics" },
  { href: "/samples",   icon: Star,       label: "Samples" },
];

const MORE_BASE  = [
  { href: "/csv-check", icon: FileSpreadsheet, label: "CSV Check" },
  { href: "/settings",  icon: Settings,        label: "Settings" },
];
const ADMIN_ITEM = { href: "/admin", icon: Shield, label: "Admin" };

const MOBILE_TABS = NAV.slice(0, 4);

function NavItem({ href, icon: Icon, label, onClick, badge }: {
  href: string; icon: React.ElementType; label: string; onClick?: () => void; badge?: number;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "group flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200",
        active
          ? "bg-[#1A1A1A] text-white shadow-lg shadow-black/10"
          : "text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-50"
      )}
    >
      <Icon className={clsx("h-4 w-4 shrink-0", active ? "text-white" : "text-gray-400 group-hover:text-[#1A1A1A]")} />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className={clsx(
          "h-5 min-w-5 rounded-full text-[10px] font-black flex items-center justify-center px-1",
          active ? "bg-white text-[#1A1A1A]" : "bg-[#FFD567] text-[#1A1A1A]"
        )}>
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

// ── AppShell ──────────────────────────────────────────────────────────────────
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inboxBadge,    setInboxBadge]    = useState(0);

  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const isAdmin   = profile?.role === "admin";
  const isManager = profile?.role === "manager";
  const MORE      = (isAdmin || isManager) ? [...MORE_BASE, ADMIN_ITEM] : MORE_BASE;
  const allNav    = [...NAV, ...MORE];
  const pageTitle = allNav.find(n => pathname === n.href || pathname.startsWith(n.href + "/"))?.label ?? "Dashboard";

  const displayName    = profile?.name ?? "User";
  const displayInitial = displayName.charAt(0).toUpperCase();
  const displayEmail   = profile?.email ?? "";

  // Real-time notification listener
  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("toUid", "==", profile.uid),
      orderBy("createdAt", "desc"),
      limit(40)
    );

    const unsub = onSnapshot(q, snap => {
      setNotifications(
        snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification))
      );
    });

    return unsub;
  }, [profile?.uid]);

  // Inbox badge — needsReply items that aren't done (single-field query, no composite index needed)
  useEffect(() => {
    if (!profile?.uid) return;
    const q = query(
      collection(db, "inbox"),
      where("userId", "==", profile.uid)
    );
    const unsub = onSnapshot(q, snap => {
      setInboxBadge(
        snap.docs.filter(d => {
          const data = d.data();
          return data.needsReply === true && data.status !== "done";
        }).length
      );
    });
    return unsub;
  }, [profile?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAll = useCallback(async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }, []);

  const markOne = useCallback(async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
  }, []);

  return (
    <div className="h-full flex bg-[#F7F7F2] font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="close sidebar"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white border-r border-[#E9E9E2] transition-transform duration-300 ease-out",
        "lg:static lg:translate-x-0 lg:w-64",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div className="text-base font-bold tracking-tight text-[#1A1A1A]">Crextio</div>
          </div>
          <button className="lg:hidden p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Quick action */}
        <div className="px-4 pb-4">
          <Link
            href="/collabs"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FFD567] py-3 text-sm font-bold text-[#1A1A1A] hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" /> New Collab
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {NAV.map(item => (
            <NavItem key={item.href} {...item} onClick={() => setSidebarOpen(false)}
              badge={item.href === "/inbox" ? inboxBadge : undefined} />
          ))}
          <div className="my-3 mx-2 border-t border-[#E9E9E2]" />
          {MORE.map(item => (
            <NavItem key={item.href} {...item} onClick={() => setSidebarOpen(false)} />
          ))}
        </nav>

        {/* Role badge + user footer */}
        <div className="px-4 py-5 border-t border-[#E9E9E2]">
          {/* Role pill */}
          {profile?.role && (
            <div className="mb-3 px-3">
              <span className={clsx(
                "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                profile.role === "admin"   && "bg-[#1A1A1A] text-[#FFD567]",
                profile.role === "manager" && "bg-violet-100 text-violet-700",
                profile.role === "creator" && "bg-[#FFD567]/30 text-[#1A1A1A]",
              )}>
                {profile.role}
              </span>
            </div>
          )}
          <button onClick={signOut} className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-all group active:scale-95">
            <div className="h-9 w-9 rounded-full bg-[#FFD567] flex items-center justify-center text-[#1A1A1A] text-xs font-bold shrink-0 border-2 border-white shadow-sm">
              {displayInitial}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-bold text-[#1A1A1A] truncate">{displayName}</div>
              <div className="text-[11px] text-gray-400 truncate font-medium">{displayEmail}</div>
            </div>
            <LogOut className="h-4 w-4 text-gray-300 group-hover:text-red-400 shrink-0 transition-colors" />
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-[#F7F7F2]/90 backdrop-blur-sm shrink-0 border-b border-[#E9E9E2]/60 lg:border-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl border border-[#E9E9E2] bg-white hover:bg-gray-50 active:scale-95 transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-[#1A1A1A]" />
            </button>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Bell — relative wrapper so dropdown is positioned correctly */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(v => !v)}
                className="relative p-2.5 rounded-full border border-[#E9E9E2] bg-white hover:bg-gray-50 active:scale-95 transition-all"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-[#FFD567] text-[#1A1A1A] text-[9px] font-black flex items-center justify-center px-0.5 border border-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <NotificationPanel
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAll={markAll}
                  onMarkOne={markOne}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </div>

            <button className="hidden sm:flex items-center gap-2 rounded-full border border-[#E9E9E2] bg-white px-3 py-1.5 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
              <div className="h-7 w-7 rounded-full bg-[#FFD567] flex items-center justify-center text-[#1A1A1A] text-[10px] font-bold">
                {displayInitial}
              </div>
              <span className="text-sm text-[#1A1A1A] font-bold">{displayName.split(" ")[0]}</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 pb-24 lg:pb-10">
          <div className="max-w-[1600px] mx-auto pt-4 sm:pt-6">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom tabs ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E9E9E2] flex items-stretch shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {MOBILE_TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const badge  = href === "/inbox" ? inboxBadge : 0;
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative active:scale-95 transition-transform">
              <div className={clsx(
                "p-1.5 rounded-xl transition-all duration-200 relative",
                active ? "bg-[#1A1A1A] text-white shadow-md" : "text-gray-400"
              )}>
                <Icon className="h-5 w-5" />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#FFD567] text-[#1A1A1A] text-[8px] font-black flex items-center justify-center border border-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={clsx("text-[9px] font-bold tracking-tight", active ? "text-[#1A1A1A]" : "text-gray-400")}>
                {label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={() => setSidebarOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 active:scale-95 transition-transform relative">
          <div className="p-1.5 rounded-xl text-gray-400">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          {unreadCount > 0 && (
            <span className="absolute top-2 right-[calc(50%-18px)] h-4 w-4 rounded-full bg-[#FFD567] text-[#1A1A1A] text-[8px] font-black flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="text-[9px] font-bold tracking-tight text-gray-400">More</span>
        </button>
      </nav>
    </div>
  );
}
