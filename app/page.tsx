"use client";
import Link from "next/link";
import { useState } from "react";
import {
  TrendingUp, Zap, ShoppingBag, BarChart3, Star, Mail,
  ArrowRight, CheckCircle, Menu, X, Shield, Users,
  DollarSign, Package, Bell, ChevronRight,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

const FEATURES = [
  {
    icon: Mail,
    color: "bg-blue-50 text-blue-600",
    title: "Inbox Hub",
    desc: "Capture every collab opportunity — Gmail, TikTok DMs, and manual notes in one smart inbox.",
    tag: "Centralized",
  },
  {
    icon: Zap,
    color: "bg-[#FFD567]/20 text-amber-600",
    title: "Collab Pipeline",
    desc: "10-stage Kanban board from New Project to Paid. Never lose track of where a deal stands.",
    tag: "Pipeline CRM",
  },
  {
    icon: ShoppingBag,
    color: "bg-violet-50 text-violet-600",
    title: "Orders & Reconciliation",
    desc: "Upload TikTok screenshots — OCR extracts every order. Auto-reconcile Paid, Missing, and Flagged.",
    tag: "OCR Powered",
  },
  {
    icon: BarChart3,
    color: "bg-pink-50 text-pink-600",
    title: "Analytics Dashboard",
    desc: "Daily GMV, commissions, impressions, clicks. Upload your analytics screenshots and we handle the rest.",
    tag: "Daily Insights",
  },
  {
    icon: Star,
    color: "bg-emerald-50 text-emerald-600",
    title: "Samples Tracker",
    desc: "Track every free and refundable sample with due dates, fulfillment types, and content deadlines.",
    tag: "Never Miss a Deadline",
  },
  {
    icon: Users,
    color: "bg-gray-100 text-gray-600",
    title: "Multi-Creator Teams",
    desc: "Add your entire team. Each creator sees only their own data. Admins see everything.",
    tag: "Role-Based Access",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Sign up as Admin",
    desc: "Create your workspace in 30 seconds. Your account is the hub — you control who's in it.",
  },
  {
    n: "02",
    title: "Add your creators",
    desc: "Invite team members from your admin panel. Assign roles. Each creator logs in to their own scoped view.",
  },
  {
    n: "03",
    title: "Import and manage",
    desc: "Upload TikTok screenshots, manage collabs through the pipeline, reconcile earnings — all in one place.",
  },
];

const STATS = [
  { value: "10", label: "Pipeline stages", icon: Zap },
  { value: "3×", label: "Faster reconciliation", icon: DollarSign },
  { value: "100%", label: "Data privacy per creator", icon: Shield },
  { value: "5 min", label: "Average setup time", icon: CheckCircle },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F7F2] font-sans">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#F7F7F2]/90 backdrop-blur-md border-b border-[#E9E9E2]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#1A1A1A]">Crextio</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-[#1A1A1A] hover:bg-white transition-all">
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#1A1A1A] hover:bg-white border border-transparent hover:border-[#E9E9E2] transition-all">
              Log in
            </Link>
            <Link href="/signup"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A1A1A] text-sm font-semibold text-white hover:bg-black transition-all shadow-sm">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-xl hover:bg-white transition-all" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-[#E9E9E2] px-5 py-4 space-y-1">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-[#F7F7F2] transition-all">
                {l.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="w-full text-center py-3 rounded-xl border border-[#E9E9E2] text-sm font-semibold text-[#1A1A1A] hover:bg-[#F7F7F2] transition-all">
                Log in
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-[#1A1A1A] text-sm font-semibold text-white hover:bg-black transition-all">
                Get started free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#1A1A1A] px-5 sm:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Yellow glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FFD567]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD567] animate-pulse" />
            <span className="text-xs font-semibold text-white/70 tracking-wide">TikTok Creator Management Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            The operating system<br />
            <span className="text-[#FFD567]">for TikTok creators</span>
          </h1>

          <p className="text-base sm:text-lg text-white/50 max-w-xl mx-auto leading-relaxed mb-10">
            Manage collabs, reconcile orders, track analytics and samples — all in one workspace built for creators and their teams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-[#FFD567] px-7 py-4 text-base font-bold text-[#1A1A1A] hover:opacity-90 transition-all shadow-lg shadow-[#FFD567]/20">
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-base font-bold text-white hover:bg-white/10 transition-all">
              Log in to dashboard
            </Link>
          </div>

          <p className="mt-5 text-xs text-white/30">No credit card required · Setup in under 5 minutes</p>
        </div>

        {/* Mock dashboard preview */}
        <div className="relative max-w-5xl mx-auto mt-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/40 backdrop-blur-sm">
            <div className="rounded-2xl bg-[#F7F7F2] overflow-hidden">
              {/* Fake browser bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-white border-b border-[#E9E9E2]">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-4 rounded-lg bg-[#F7F7F2] h-6 flex items-center px-3">
                  <span className="text-[10px] text-gray-400 font-medium">app.crextio.com/dashboard</span>
                </div>
              </div>
              {/* Mini dashboard */}
              <div className="flex h-52 sm:h-72">
                {/* Sidebar */}
                <div className="w-14 sm:w-40 shrink-0 bg-white border-r border-[#E9E9E2] p-2 sm:p-3 flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-[#1A1A1A] mb-2">
                    <div className="h-4 w-4 rounded bg-[#FFD567]" />
                    <span className="hidden sm:block text-[10px] text-white font-bold">Dashboard</span>
                  </div>
                  {["Inbox","Collabs","Orders","Analytics","Samples"].map((item) => (
                    <div key={item} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#F7F7F2]">
                      <div className="h-3 w-3 rounded bg-gray-200 shrink-0" />
                      <span className="hidden sm:block text-[10px] text-gray-400">{item}</span>
                    </div>
                  ))}
                </div>
                {/* Main content */}
                <div className="flex-1 p-3 sm:p-4 overflow-hidden">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {[
                      { label: "GMV", val: "$16,930", color: "bg-violet-50" },
                      { label: "Commission", val: "$1,354", color: "bg-pink-50" },
                      { label: "Orders", val: "532", color: "bg-blue-50" },
                      { label: "Collabs", val: "6 active", color: "bg-[#FFD567]/20" },
                    ].map((card) => (
                      <div key={card.label} className={`rounded-xl ${card.color} p-2 sm:p-3 border border-white`}>
                        <div className="text-[9px] text-gray-400 mb-0.5">{card.label}</div>
                        <div className="text-xs sm:text-sm font-bold text-[#1A1A1A]">{card.val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2 rounded-xl bg-white border border-[#E9E9E2] p-3 h-20 sm:h-28">
                      <div className="text-[9px] text-gray-400 mb-2 font-semibold uppercase tracking-wide">GMV Trend</div>
                      <div className="flex items-end gap-1 h-10 sm:h-16">
                        {[40,65,50,80,70,90,100].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t bg-violet-200"
                            style={{ height: `${h}%`, opacity: 0.6 + i * 0.06 }} />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white border border-[#E9E9E2] p-3 h-20 sm:h-28">
                      <div className="text-[9px] text-gray-400 mb-2 font-semibold uppercase tracking-wide">Pipeline</div>
                      {["Negotiating","Contract","Content Posted"].map((s, i) => (
                        <div key={s} className="flex items-center gap-1.5 mb-1">
                          <div className={`h-1.5 flex-1 rounded-full ${i===0?"bg-amber-300":i===1?"bg-black":"bg-[#FFD567]"}`} />
                          <span className="text-[8px] text-gray-400 hidden sm:block">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b border-[#E9E9E2] bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#F7F7F2] flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-[#1A1A1A]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#1A1A1A]">{value}</div>
                <div className="text-xs text-gray-400 font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E9E9E2] bg-white px-4 py-1.5 mb-5">
            <Zap className="h-3.5 w-3.5 text-[#1A1A1A]" />
            <span className="text-xs font-semibold text-gray-500 tracking-wide">Everything you need</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-4">
            One platform, every workflow
          </h2>
          <p className="text-base text-gray-400 max-w-lg mx-auto">
            From the first DM to the final payment — Crextio covers every step of the creator business.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, color, title, desc, tag }) => (
            <div key={title}
              className="group rounded-3xl border border-[#E9E9E2] bg-white p-7 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between mb-5">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-[#E9E9E2] bg-[#F7F7F2] px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  {tag}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A] mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-[#1A1A1A] px-5 sm:px-8 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Up and running in minutes
            </h2>
            <p className="text-base text-white/40 max-w-md mx-auto">
              No complex onboarding. No spreadsheets. Just sign up and go.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="rounded-3xl border border-white/10 bg-white/5 p-7">
                <div className="text-4xl font-black text-[#FFD567] mb-5">{n}</div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing placeholder ── */}
      <section id="pricing" className="max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-base text-gray-400 max-w-md mx-auto">
            Start free. Scale as your team grows.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="rounded-3xl border border-[#E9E9E2] bg-white p-8">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Starter</div>
            <div className="text-4xl font-black text-[#1A1A1A] mb-1">$0</div>
            <div className="text-xs text-gray-400 mb-7">per month, forever</div>
            <ul className="space-y-3 mb-8">
              {["1 creator account","Inbox + Collabs","Basic analytics","CSV exports"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/signup"
              className="block w-full text-center py-3.5 rounded-2xl border border-[#E9E9E2] text-sm font-bold text-[#1A1A1A] hover:bg-[#F7F7F2] transition-all">
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-3xl border-2 border-[#1A1A1A] bg-[#1A1A1A] p-8 relative overflow-hidden">
            <div className="absolute top-5 right-5 rounded-full bg-[#FFD567] px-3 py-1 text-[10px] font-black text-[#1A1A1A] uppercase tracking-wide">
              Popular
            </div>
            <div className="text-sm font-bold text-white/40 uppercase tracking-widest mb-2">Pro</div>
            <div className="text-4xl font-black text-white mb-1">$29</div>
            <div className="text-xs text-white/30 mb-7">per month</div>
            <ul className="space-y-3 mb-8">
              {["Unlimited creators","OCR screenshot imports","Orders reconciliation","Full analytics suite","Priority support"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                  <CheckCircle className="h-4 w-4 text-[#FFD567] shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/signup"
              className="block w-full text-center py-3.5 rounded-2xl bg-[#FFD567] text-sm font-bold text-[#1A1A1A] hover:opacity-90 transition-all">
              Start 14-day free trial
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-5 sm:px-8 pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto rounded-3xl bg-[#1A1A1A] px-8 py-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-[#FFD567]/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to run your creator business properly?
          </h2>
          <p className="relative text-base text-white/40 max-w-md mx-auto mb-8">
            Join creators and agencies already managing their TikTok business with Crextio.
          </p>
          <Link href="/signup"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#FFD567] px-8 py-4 text-base font-bold text-[#1A1A1A] hover:opacity-90 transition-all shadow-lg shadow-[#FFD567]/20">
            Create your free account <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-xs text-white/20">No credit card required</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E9E9E2] px-5 sm:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-xl bg-[#1A1A1A] flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-[#1A1A1A]">Crextio</span>
          </div>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" className="text-xs text-gray-400 hover:text-[#1A1A1A] transition-colors font-medium">{l}</a>
            ))}
          </div>
          <p className="text-xs text-gray-300">© 2026 Crextio. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
