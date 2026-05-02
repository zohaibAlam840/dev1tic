"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  TrendingUp, Mail, Zap, ShoppingBag, BarChart3, Star,
  Settings, Shield, Bell, ChevronDown, Menu, X, LogOut, Plus, Upload,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", icon: TrendingUp, label: "Dashboard" },
  { href: "/inbox",     icon: Mail,       label: "Inbox",    badge: 3 },
  { href: "/collabs",   icon: Zap,        label: "Collabs" },
  { href: "/orders",    icon: ShoppingBag,label: "Orders" },
  { href: "/analytics", icon: BarChart3,  label: "Analytics" },
  { href: "/samples",   icon: Star,       label: "Samples" },
];

const MORE = [
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/admin",    icon: Shield,    label: "Admin" },
];

const MOBILE_TABS = NAV.slice(0, 5);

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
        "group flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-[#1A1A1A] text-white rounded-full shadow-lg shadow-black/10"
          : "text-gray-500 hover:text-[#1A1A1A]"
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
  const pathname = usePathname();
  const pageTitle = [...NAV, ...MORE].find((n) => pathname === n.href || pathname.startsWith(n.href + "/"))?.label ?? "Dashboard";

  return (
    <div className="h-full flex bg-[#F7F7F2] font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="close sidebar"
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white/80 backdrop-blur-md border-r border-[#E9E9E2] transition-transform duration-300 ease-out",
        "lg:static lg:translate-x-0 lg:w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-[#1A1A1A]">Crextio</div>
            </div>
          </div>
          <button className="lg:hidden p-2 rounded-full hover:bg-gray-100" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Quick actions */}
        <div className="px-4 py-2 mb-4">
          <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FFD567] py-3 text-sm font-bold text-[#1A1A1A] hover:opacity-90 transition-all shadow-sm">
            <Plus className="h-4 w-4" /> New Collab
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {NAV.map((item) => (
            <NavItem key={item.href} {...item} onClick={() => setSidebarOpen(false)} />
          ))}
          <div className="my-4 mx-3 border-t border-[#E9E9E2]" />
          {MORE.map((item) => (
            <NavItem key={item.href} {...item} onClick={() => setSidebarOpen(false)} />
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-6 border-t border-[#E9E9E2]">
          <div className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-gray-50 cursor-pointer transition-all group">
            <div className="h-10 w-10 rounded-full bg-[#FFD567] flex items-center justify-center text-[#1A1A1A] text-xs font-bold shrink-0 border-2 border-white shadow-sm">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#1A1A1A] truncate">Ali Creator</div>
              <div className="text-[11px] text-gray-400 truncate font-medium">ali@creator.com</div>
            </div>
            <LogOut className="h-4 w-4 text-gray-300 group-hover:text-red-400 shrink-0 transition-colors" />
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between px-8 py-5 bg-[#F7F7F2] shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-full border border-[#E9E9E2] bg-white hover:bg-gray-50 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-[#1A1A1A]" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-full border border-[#E9E9E2] bg-white hover:bg-gray-50 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#FFD567] border-2 border-white" />
            </button>
            <button className="hidden sm:flex items-center gap-3 rounded-full border border-[#E9E9E2] bg-white px-4 py-2 hover:bg-gray-50 transition-all shadow-sm">
              <div className="h-7 w-7 rounded-full bg-[#FFD567] flex items-center justify-center text-[#1A1A1A] text-[10px] font-bold">
                A
              </div>
              <span className="text-sm text-[#1A1A1A] font-bold">Ali</span>
              <Settings className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-8 pb-12">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom tabs ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/80 backdrop-blur-md border-t border-[#E9E9E2] flex px-2 py-3 shadow-2xl">
        {MOBILE_TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center justify-center gap-1">
              <div className={clsx(
                "p-2 rounded-2xl transition-all duration-200",
                active ? "bg-[#1A1A1A] text-white shadow-lg shadow-black/10" : "text-gray-400"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={clsx("text-[10px] font-bold", active ? "text-[#1A1A1A]" : "text-gray-400")}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
