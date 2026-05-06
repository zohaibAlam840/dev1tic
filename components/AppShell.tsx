"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import {
  TrendingUp, Mail, Zap, ShoppingBag, BarChart3, Star,
  Settings, Shield, Bell, Menu, X, LogOut, Plus,
  FileSpreadsheet, MoreHorizontal,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", icon: TrendingUp,     label: "Dashboard" },
  { href: "/inbox",     icon: Mail,            label: "Inbox",     badge: 3 },
  { href: "/collabs",   icon: Zap,             label: "Collabs" },
  { href: "/orders",    icon: ShoppingBag,     label: "Orders" },
  { href: "/analytics", icon: BarChart3,       label: "Analytics" },
  { href: "/samples",   icon: Star,            label: "Samples" },
];

const MORE_BASE = [
  { href: "/csv-check", icon: FileSpreadsheet, label: "CSV Check" },
  { href: "/settings",  icon: Settings,        label: "Settings" },
];
const ADMIN_ITEM = { href: "/admin", icon: Shield, label: "Admin" };

// Bottom tabs: 4 core + a "More" button that opens the sidebar
const MOBILE_TABS = NAV.slice(0, 4);

function NavItem({ href, icon: Icon, label, badge, onClick }: {
  href: string; icon: React.ElementType; label: string; badge?: number; onClick?: () => void;
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
      {badge ? (
        <span className={clsx(
          "h-5 min-w-5 rounded-full px-1.5 text-[10px] font-bold flex items-center justify-center",
          active ? "bg-white text-[#1A1A1A]" : "bg-[#FFD567] text-[#1A1A1A]"
        )}>
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname  = usePathname();
  const { profile, signOut } = useAuth();
  const isAdmin   = profile?.role === "admin";
  const MORE      = isAdmin ? [...MORE_BASE, ADMIN_ITEM] : MORE_BASE;
  const allNav    = [...NAV, ...MORE];
  const pageTitle = allNav.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"))?.label ?? "Dashboard";

  const displayName   = profile?.name ?? "User";
  const displayInitial = displayName.charAt(0).toUpperCase();
  const displayEmail   = profile?.email ?? "";

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
          <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FFD567] py-3 text-sm font-bold text-[#1A1A1A] hover:opacity-90 active:scale-95 transition-all shadow-sm">
            <Plus className="h-4 w-4" /> New Collab
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {NAV.map((item) => (
            <NavItem key={item.href} {...item} onClick={() => setSidebarOpen(false)} />
          ))}
          <div className="my-3 mx-2 border-t border-[#E9E9E2]" />
          {MORE.map((item) => (
            <NavItem key={item.href} {...item} onClick={() => setSidebarOpen(false)} />
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-5 border-t border-[#E9E9E2]">
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
            <button className="relative p-2.5 rounded-full border border-[#E9E9E2] bg-white hover:bg-gray-50 active:scale-95 transition-all">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#FFD567] border-2 border-white" />
            </button>
            <button className="hidden sm:flex items-center gap-2 rounded-full border border-[#E9E9E2] bg-white px-3 py-1.5 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
              <div className="h-7 w-7 rounded-full bg-[#FFD567] flex items-center justify-center text-[#1A1A1A] text-[10px] font-bold">
                {displayInitial}
              </div>
              <span className="text-sm text-[#1A1A1A] font-bold">{displayName.split(" ")[0]}</span>
            </button>
          </div>
        </header>

        {/* Page content — pb-24 leaves room for the mobile bottom nav */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 pb-24 lg:pb-10">
          <div className="max-w-[1600px] mx-auto pt-4 sm:pt-6">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom tabs ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E9E9E2] flex items-stretch shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {MOBILE_TABS.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative active:scale-95 transition-transform">
              <div className={clsx(
                "p-1.5 rounded-xl transition-all duration-200",
                active ? "bg-[#1A1A1A] text-white shadow-md" : "text-gray-400"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              {badge && !active && (
                <span className="absolute top-2 right-[calc(50%-14px)] h-4 w-4 rounded-full bg-[#FFD567] text-[#1A1A1A] text-[8px] font-black flex items-center justify-center">
                  {badge}
                </span>
              )}
              <span className={clsx("text-[9px] font-bold tracking-tight", active ? "text-[#1A1A1A]" : "text-gray-400")}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* "More" button opens sidebar */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 active:scale-95 transition-transform">
          <div className="p-1.5 rounded-xl text-gray-400">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <span className="text-[9px] font-bold tracking-tight text-gray-400">More</span>
        </button>
      </nav>
    </div>
  );
}
