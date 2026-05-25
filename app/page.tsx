"use client";
import Link from "next/link";
import { useState } from "react";
import {
  TrendingUp, ArrowRight, Menu, X, LayoutDashboard,
  CheckCircle, Star, Moon, Sun,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { label: "Features",     href: "#features"    },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing",      href: "#pricing"      },
];

const TICKER_ITEMS = [
  "Collab Pipeline", "★", "Order Reconciliation", "★",
  "Analytics Tracker", "★", "Samples Manager", "★",
  "Team Workspaces", "★", "OCR Screenshot Import", "★",
  "Inbox Hub", "★", "Role-Based Access", "★",
];

const TESTIMONIALS = [
  {
    quote: "I used to track everything in a Google Sheet. Crextio cut my admin time in half — I can see every collab, every pending payment, in one place.",
    name:  "Aliyah M.",
    role:  "TikTok Creator, 280K followers",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&q=80",
  },
  {
    quote: "Managing 12 creators across brands was chaos. Now I can see everyone's pipeline at once. The OCR import alone saves us hours every week.",
    name:  "Jordan K.",
    role:  "Agency Manager, 12 creators",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&q=80",
  },
];

// Feature previews stay dark in both modes — they represent the app UI
const FEATURES = [
  {
    tag:    "Pipeline CRM",
    title:  "10 stages. First DM to final payment.",
    body:   "Every collab lives on a Kanban board you actually use. Drag it from Negotiating to Paid. Nothing falls through the cracks.",
    accent: "#FF0050",
    preview: (
      <div className="rounded-2xl bg-[#0f0f0f] border border-white/15 p-5 space-y-3">
        <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-4">Collab pipeline</div>
        {[
          { stage: "Negotiating",     n: 3, color: "#FF0050" },
          { stage: "Contract Signed", n: 1, color: "#25F4EE" },
          { stage: "Content Posted",  n: 2, color: "#FFD567"  },
          { stage: "Awaiting Pay",    n: 4, color: "#FF0050"  },
        ].map((s) => (
          <div key={s.stage} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 w-32 shrink-0">
              <div className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-xs text-white/60">{s.stage}</span>
            </div>
            <div className="flex gap-1.5 flex-1 justify-end">
              {Array.from({ length: s.n }).map((_, i) => (
                <div key={i} className="h-6 w-14 rounded-lg bg-white/8 border border-white/12 flex items-center px-2">
                  <div className="h-1.5 flex-1 rounded-full bg-white/20" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag:    "OCR Powered",
    title:  "Upload a screenshot. Get your orders.",
    body:   "Point your camera at any TikTok Shop screenshot. Gemini AI reads every row — product, commission, status. You review and confirm in one click.",
    accent: "#25F4EE",
    preview: (
      <div className="rounded-2xl bg-[#0f0f0f] border border-white/15 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <span className="text-[11px] text-white/40 font-bold uppercase tracking-widest">Extracted Orders</span>
          <div className="ml-auto rounded-full bg-[#25F4EE]/15 border border-[#25F4EE]/30 px-2.5 py-0.5 text-[10px] text-[#25F4EE] font-bold">7 found</div>
        </div>
        <div className="divide-y divide-white/8">
          {[
            { id: "#TK8821", product: "Face Serum",    gmv: "$94",  status: "Paid",    dot: "#25F4EE" },
            { id: "#TK8822", product: "Lip Gloss Set", gmv: "$41",  status: "Missing", dot: "#FF0050" },
            { id: "#TK8823", product: "Eye Cream",     gmv: "$138", status: "Paid",    dot: "#25F4EE" },
          ].map((row) => (
            <div key={row.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-[10px] text-white/30 w-14 shrink-0 font-mono">{row.id}</span>
              <span className="text-xs text-white/70 flex-1">{row.product}</span>
              <span className="text-xs text-white/50 w-10 text-right font-bold">{row.gmv}</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: row.dot }} />
                <span className="text-[10px] font-bold" style={{ color: row.dot }}>{row.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag:    "Analytics",
    title:  "Screenshot in. Chart out.",
    body:   "Upload your TikTok analytics screenshot daily. GMV, commissions, impressions and clicks get extracted and plotted over time automatically.",
    accent: "#FFD567",
    preview: (
      <div className="rounded-2xl bg-[#0f0f0f] border border-white/15 p-5">
        <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-4">Performance — 30 days</div>
        <div className="flex items-end gap-1.5 h-28 mb-4">
          {[28, 42, 35, 58, 51, 70, 82, 61, 78, 69, 88, 100].map((h, i) => (
            <div key={i} className="flex-1 rounded-t" style={{
              height: `${h}%`,
              background: i >= 10 ? "#FF0050" : i >= 8 ? "#25F4EE" : "rgba(255,255,255,0.15)",
            }} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
          {[
            { label: "GMV",        val: "$16,930" },
            { label: "Commission", val: "$1,354"  },
            { label: "Impressions",val: "2.4M"    },
          ].map((m) => (
            <div key={m.label}>
              <div className="text-[10px] text-white/35 mb-1 font-medium">{m.label}</div>
              <div className="text-sm font-black text-white">{m.val}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const DT = {
  bg: "#010101", nav: "rgba(1,1,1,0.92)", card: "#0a0a0a", card2: "#0d0d0d", menu: "#0a0a0a", text: "#ffffff",
  t80: "rgba(255,255,255,0.80)", t70: "rgba(255,255,255,0.70)", t65: "rgba(255,255,255,0.65)",
  t60: "rgba(255,255,255,0.60)", t55: "rgba(255,255,255,0.55)", t50: "rgba(255,255,255,0.50)",
  t45: "rgba(255,255,255,0.45)", t40: "rgba(255,255,255,0.40)", t35: "rgba(255,255,255,0.35)",
  t30: "rgba(255,255,255,0.30)", t25: "rgba(255,255,255,0.25)", t20: "rgba(255,255,255,0.20)",
  t15: "rgba(255,255,255,0.15)", t12: "rgba(255,255,255,0.12)", t10: "rgba(255,255,255,0.10)",
  t08: "rgba(255,255,255,0.08)", t06: "rgba(255,255,255,0.06)", t05: "rgba(255,255,255,0.05)",
  t03: "rgba(255,255,255,0.03)",
};

const LT = {
  bg: "#F7F7F2", nav: "rgba(247,247,242,0.95)", card: "#ffffff", card2: "#EFEFEA", menu: "#F0F0EA", text: "#111111",
  t80: "rgba(0,0,0,0.80)", t70: "rgba(0,0,0,0.70)", t65: "rgba(0,0,0,0.65)",
  t60: "rgba(0,0,0,0.60)", t55: "rgba(0,0,0,0.55)", t50: "rgba(0,0,0,0.50)",
  t45: "rgba(0,0,0,0.45)", t40: "rgba(0,0,0,0.40)", t35: "rgba(0,0,0,0.35)",
  t30: "rgba(0,0,0,0.30)", t25: "rgba(0,0,0,0.25)", t20: "rgba(0,0,0,0.20)",
  t15: "rgba(0,0,0,0.15)", t12: "rgba(0,0,0,0.12)", t10: "rgba(0,0,0,0.10)",
  t08: "rgba(0,0,0,0.08)", t06: "rgba(0,0,0,0.06)", t05: "rgba(0,0,0,0.05)",
  t03: "rgba(0,0,0,0.03)",
};

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const { user, loading } = useAuth();
  const t = isDark ? DT : LT;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "system-ui, -apple-system, sans-serif", transition: "background 0.2s, color 0.2s" }}>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50" style={{ borderBottom: `1px solid ${t.t08}`, background: t.nav, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center h-14 gap-8">

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-lg bg-[#FF0050] flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-black tracking-tight" style={{ color: t.text }}>Crextio</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href}
                className="px-3.5 py-1.5 text-sm rounded-lg transition-colors"
                style={{ color: t.t50 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = t.text; e.currentTarget.style.background = t.t05; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = t.t50; e.currentTarget.style.background = "transparent"; }}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2 ml-auto">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              style={{ color: t.t50, background: t.t05 }}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {!loading && (user ? (
              <Link href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#FF0050] text-sm font-bold text-white hover:opacity-90 transition-opacity">
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-4 py-1.5 text-sm transition-colors" style={{ color: t.t50 }}>
                  Log in
                </Link>
                <Link href="/signup"
                  className="px-4 py-1.5 rounded-lg bg-[#FF0050] text-sm font-bold text-white hover:opacity-90 transition-opacity">
                  Get started free
                </Link>
              </>
            ))}
          </div>

          <div className="md:hidden ml-auto flex items-center gap-1">
            <button onClick={() => setIsDark(!isDark)} className="p-1.5" style={{ color: t.t50 }}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button className="p-1.5" onClick={() => setMenuOpen(!menuOpen)} style={{ color: t.t60 }}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden px-5 py-4 space-y-1" style={{ borderTop: `1px solid ${t.t08}`, background: t.menu }}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm rounded-lg"
                style={{ color: t.t60 }}>
                {l.label}
              </a>
            ))}
            <div className="pt-3 space-y-2">
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl text-sm font-semibold"
                style={{ border: `1px solid ${t.t15}`, color: t.t80 }}>
                Log in
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl bg-[#FF0050] text-sm font-bold text-white">
                Get started free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="px-5 sm:px-8 pt-20 pb-16 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_400px] gap-16 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-7"
              style={{ border: `1px solid ${t.t15}`, background: t.t05 }}>
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF0050]" />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: t.t60 }}>For TikTok Creators & Agencies</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.93] tracking-tight mb-7">
              Stop managing<br />
              your collabs in<br />
              <span className="text-[#FF0050]">a notes app.</span>
            </h1>

            <p className="text-base sm:text-lg max-w-lg leading-relaxed mb-10" style={{ color: t.t55 }}>
              Crextio tracks your collab pipeline, reconciles TikTok orders, and logs your analytics — so nothing slips when you&apos;re managing 20 brands at once.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link href="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#FF0050] text-sm font-black text-white hover:opacity-90 transition-opacity">
                Start free — no card needed <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm font-semibold transition-all"
                style={{ border: `1px solid ${t.t15}`, color: t.t70 }}>
                Already have an account
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              {[
                { val: "$2M+",  label: "GMV tracked" },
                { val: "500+",  label: "Active creators" },
                { val: "10K+",  label: "Orders reconciled" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div className="text-xl font-black" style={{ color: t.text }}>{val}</div>
                  <div className="text-xs font-medium" style={{ color: t.t40 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — dashboard preview */}
          <div className="hidden lg:block">
            <div className="rounded-3xl overflow-hidden" style={{ border: `1px solid ${t.t12}`, background: t.card2 }}>
              <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: `1px solid ${t.t08}`, background: t.card }}>
                <div className="h-2 w-2 rounded-full" style={{ background: t.t15 }} />
                <div className="h-2 w-2 rounded-full" style={{ background: t.t10 }} />
                <div className="h-2 w-2 rounded-full" style={{ background: t.t10 }} />
                <div className="ml-3 flex-1 max-w-[160px] h-4 rounded-md flex items-center px-2" style={{ background: t.t05 }}>
                  <span className="text-[9px]" style={{ color: t.t20 }}>crextio.com/dashboard</span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: "GMV this month", val: "$16,930", color: "#FF0050" },
                    { label: "Pending payout",  val: "$3,200",  color: "#25F4EE" },
                    { label: "Active collabs",  val: "14",      color: "#FFD567" },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="rounded-xl p-3" style={{ border: `1px solid ${t.t08}`, background: t.t03 }}>
                      <div className="text-[9px] mb-1.5" style={{ color: t.t30 }}>{label}</div>
                      <div className="text-base font-black" style={{ color }}>{val}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${t.t08}` }}>
                  <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${t.t06}` }}>
                    <span className="text-[10px] font-bold" style={{ color: t.t30 }}>Collab pipeline</span>
                  </div>
                  {[
                    { brand: "Glow Lab",       product: "Vitamin C Serum",  stage: "Negotiating",     sc: "#FF0050" },
                    { brand: "BYOMA",          product: "Barrier Mist",      stage: "Contract Signed", sc: "#25F4EE" },
                    { brand: "True Botanicals",product: "Face Oil",          stage: "Content Posted",  sc: "#FFD567" },
                    { brand: "Cocokind",       product: "Eye Balm",          stage: "Awaiting Pay",    sc: "#FF0050" },
                  ].map(({ brand, product, stage, sc }, idx, arr) => (
                    <div key={brand} className="flex items-center gap-3 px-4 py-2.5"
                      style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${t.t05}` : "none", background: t.t03 }}>
                      <div className="h-7 w-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: t.t08 }}>
                        <div className="h-3 w-3 rounded" style={{ background: t.t20 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold truncate" style={{ color: t.t80 }}>{brand}</div>
                        <div className="text-[9px] truncate" style={{ color: t.t30 }}>{product}</div>
                      </div>
                      <div className="rounded-md px-2 py-0.5 text-[9px] font-bold shrink-0"
                        style={{ color: sc, background: `${sc}18`, border: `1px solid ${sc}30` }}>
                        {stage}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl p-4" style={{ border: `1px solid ${t.t08}`, background: t.t03 }}>
                  <div className="text-[10px] mb-3 font-bold" style={{ color: t.t30 }}>GMV — last 7 days</div>
                  <div className="flex items-end gap-1 h-14">
                    {[30, 52, 41, 68, 59, 82, 100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t" style={{
                        height: `${h}%`,
                        background: i === 6 ? "#FF0050" : i === 5 ? "rgba(255,0,80,0.4)" : t.t10,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width dashboard wireframe */}
        <div className="mt-16 lg:mt-20 rounded-2xl overflow-hidden" style={{ border: `1px solid ${t.t12}`, background: t.card }}>
          <div className="flex items-center gap-1.5 px-5 py-3.5" style={{ borderBottom: `1px solid ${t.t08}` }}>
            <div className="h-2.5 w-2.5 rounded-full bg-[#FF0050]/70" />
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: t.t15 }} />
            <div className="h-2.5 w-2.5 rounded-full bg-[#25F4EE]/50" />
            <div className="ml-4 flex-1 max-w-sm h-5 rounded-md flex items-center px-3" style={{ background: t.t06 }}>
              <span className="text-[10px]" style={{ color: t.t25 }}>app.crextio.com/dashboard</span>
            </div>
          </div>
          <div className="flex h-60 sm:h-72">
            <div className="w-10 sm:w-44 shrink-0 py-4 flex flex-col gap-0.5 px-2 sm:px-3" style={{ borderRight: `1px solid ${t.t08}` }}>
              <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-3" style={{ background: "rgba(255,0,80,0.12)" }}>
                <div className="h-3.5 w-3.5 rounded bg-[#FF0050]/60 shrink-0" />
                <span className="hidden sm:block text-[11px] font-bold text-[#FF0050]">Dashboard</span>
              </div>
              {["Inbox", "Collabs", "Orders", "Analytics", "Samples"].map((item) => (
                <div key={item} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg">
                  <div className="h-3 w-3 rounded shrink-0" style={{ background: t.t12 }} />
                  <span className="hidden sm:block text-[11px]" style={{ color: t.t35 }}>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 p-4 sm:p-5 overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                {[
                  { label: "GMV",       val: "$16,930", hi: "#FF0050" },
                  { label: "Commission",val: "$1,354",  hi: "#25F4EE" },
                  { label: "Orders",    val: "532",     hi: null      },
                  { label: "Collabs",   val: "6 active",hi: null      },
                ].map((c) => (
                  <div key={c.label} className="rounded-xl p-3" style={{ border: `1px solid ${t.t10}`, background: t.t03 }}>
                    <div className="text-[9px] mb-1" style={{ color: t.t35 }}>{c.label}</div>
                    <div className="text-xs sm:text-sm font-black" style={{ color: c.hi ?? t.text }}>{c.val}</div>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2 rounded-xl p-3" style={{ border: `1px solid ${t.t10}`, background: t.t03 }}>
                  <div className="text-[9px] font-bold uppercase tracking-wide mb-2" style={{ color: t.t30 }}>GMV — last 7 days</div>
                  <div className="flex items-end gap-1 h-12 sm:h-20">
                    {[30, 52, 41, 68, 59, 82, 100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t" style={{
                        height: `${h}%`,
                        background: i === 6 ? "#FF0050" : i === 5 ? "rgba(255,0,80,0.45)" : t.t12,
                      }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ border: `1px solid ${t.t10}`, background: t.t03 }}>
                  <div className="text-[9px] font-bold uppercase tracking-wide mb-3" style={{ color: t.t30 }}>Pipeline</div>
                  {[
                    { s: "Negotiating",  c: "#FF0050", w: "75%" },
                    { s: "Contract",     c: "#25F4EE", w: "40%" },
                    { s: "Awaiting Pay", c: "#FFD567", w: "55%" },
                  ].map((p) => (
                    <div key={p.s} className="mb-2.5">
                      <span className="text-[9px]" style={{ color: t.t35 }}>{p.s}</span>
                      <div className="mt-1 h-1.5 rounded-full" style={{ background: t.t08 }}>
                        <div className="h-1.5 rounded-full" style={{ width: p.w, background: p.c, opacity: 0.7 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="py-4 overflow-hidden select-none" style={{ borderTop: `1px solid ${t.t08}`, borderBottom: `1px solid ${t.t08}` }}>
        <div className="marquee flex whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mx-6 text-sm font-bold shrink-0"
              style={{ color: item === "★" ? "#FF0050" : t.t35 }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-5 sm:px-8 py-24">
        <div className="mb-20">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: t.t35 }}>What it does</p>
          <h2 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight max-w-2xl">
            Built for how creators actually work.
          </h2>
        </div>

        <div className="space-y-28">
          {FEATURES.map(({ tag, title, body, accent, preview }, i) => (
            <div key={tag}
              className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-12 lg:gap-20 items-center`}>
              <div className="flex-1">
                <div className="inline-block text-xs font-black uppercase tracking-widest mb-5 px-2.5 py-1 rounded-md"
                  style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}35` }}>
                  {tag}
                </div>
                <h3 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight mb-5">{title}</h3>
                <p className="text-base leading-relaxed" style={{ color: t.t50 }}>{body}</p>
              </div>
              <div className="flex-1 w-full max-w-md">{preview}</div>
            </div>
          ))}
        </div>

        <div className="mt-28 pt-16" style={{ borderTop: `1px solid ${t.t08}` }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-10" style={{ color: t.t30 }}>Also included</p>
          <div className="grid sm:grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: t.t08 }}>
            {[
              { name: "Inbox Hub",           desc: "All collab inquiries in one place. Email, DM, note — source doesn't matter." },
              { name: "Samples Tracker",     desc: "Free and refundable samples with due dates and content countdown timers."      },
              { name: "Multi-Creator Teams", desc: "Each creator sees only their own data. You as admin see everything."           },
            ].map(({ name, desc }) => (
              <div key={name} className="p-7" style={{ background: t.card }}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-[#25F4EE] shrink-0" />
                  <span className="text-sm font-black">{name}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: t.t40 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-5 sm:px-8 py-24" style={{ borderTop: `1px solid ${t.t08}` }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-12" style={{ color: t.t35 }}>What creators say</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, avatar }) => (
              <div key={name} className="rounded-2xl p-8" style={{ border: `1px solid ${t.t12}`, background: t.card }}>
                <div className="flex gap-1 mb-5">
                  {[0,1,2,3,4].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-[#FFD567] fill-[#FFD567]" />
                  ))}
                </div>
                <p className="text-base leading-relaxed mb-6" style={{ color: t.t65 }}>&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover" style={{ border: `1px solid ${t.t15}` }} />
                  <div>
                    <div className="text-sm font-black">{name}</div>
                    <div className="text-xs" style={{ color: t.t40 }}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="px-5 sm:px-8 py-24" style={{ borderTop: `1px solid ${t.t08}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: t.t35 }}>How it works</p>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight">Three steps.</h2>
          </div>
          <div style={{ borderTop: `1px solid ${t.t08}` }}>
            {[
              { n: "01", title: "Create your workspace", body: "Sign up and you're the Admin. No setup wizard, no sales call. You're in the dashboard in under 2 minutes." },
              { n: "02", title: "Invite your creators",   body: "Add team members from the Admin panel. Give each one a role — Creator, Manager, or Admin. They log in to their scoped view, you see everything." },
              { n: "03", title: "Import, track, and get paid", body: "Upload TikTok screenshots to extract orders and analytics. Move collabs through the pipeline. Mark samples done. Know exactly where every deal stands." },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex flex-col sm:flex-row gap-6 py-12" style={{ borderBottom: `1px solid ${t.t08}` }}>
                <div className="text-5xl font-black w-20 shrink-0" style={{ color: "rgba(255,0,80,0.25)" }}>{n}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-black mb-3">{title}</h3>
                  <p className="text-base leading-relaxed max-w-xl" style={{ color: t.t45 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-5 sm:px-8 py-24" style={{ borderTop: `1px solid ${t.t08}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: t.t35 }}>Pricing</p>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight">
              Start free.<br />
              <span style={{ color: t.t30 }}>Scale when you need to.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="rounded-2xl p-8" style={{ border: `1px solid ${t.t12}`, background: t.card }}>
              <div className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: t.t30 }}>Starter</div>
              <div className="text-5xl font-black mb-1">$0</div>
              <p className="text-xs mb-8" style={{ color: t.t30 }}>Forever free. No tricks.</p>
              <ul className="space-y-3 mb-8">
                {["1 creator account", "Inbox + Collab Pipeline", "Basic analytics view", "CSV export"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: t.t50 }}>
                    <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: t.t30 }} />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup"
                className="block text-center py-3 rounded-xl text-sm font-bold transition-colors"
                style={{ border: `1px solid ${t.t15}`, color: t.text }}>
                Get started
              </Link>
            </div>

            <div className="rounded-2xl p-8 relative" style={{ border: "1px solid rgba(255,0,80,0.30)", background: "rgba(255,0,80,0.05)" }}>
              <div className="absolute top-5 right-5 text-[10px] font-black uppercase tracking-wide text-[#FF0050] border border-[#FF0050]/40 rounded-md px-2 py-0.5">
                Most popular
              </div>
              <div className="text-xs font-black uppercase tracking-widest mb-6 text-[#FF0050]/70">Pro</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-black">$29</span>
                <span className="text-sm mb-2" style={{ color: t.t30 }}>/mo</span>
              </div>
              <p className="text-xs mb-8" style={{ color: t.t30 }}>14-day free trial, cancel anytime.</p>
              <ul className="space-y-3 mb-8">
                {["Unlimited creators", "OCR screenshot imports", "Orders reconciliation", "Full analytics suite", "Priority support"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: t.t70 }}>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#FF0050] shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup"
                className="block text-center py-3 rounded-xl bg-[#FF0050] text-sm font-bold text-white hover:opacity-90 transition-opacity">
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-5 sm:px-8 py-24" style={{ borderTop: `1px solid ${t.t08}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl p-10 sm:p-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 relative overflow-hidden"
            style={{ border: `1px solid ${t.t12}`, background: t.card }}>
            <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: "#FF0050" }} />
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">Ready when you are.</h2>
              <p className="text-base max-w-sm leading-relaxed" style={{ color: t.t45 }}>
                Set up takes two minutes. No sales call, no onboarding wizard. Just you and your workspace.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative">
              <Link href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#FF0050] text-base font-black text-white hover:opacity-90 transition-opacity">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold transition-all"
                style={{ border: `1px solid ${t.t15}`, color: t.t50 }}>
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 sm:px-8 py-8" style={{ borderTop: `1px solid ${t.t08}` }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#FF0050] flex items-center justify-center">
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-black">Crextio</span>
          </Link>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" className="text-xs transition-colors" style={{ color: t.t25 }}>{l}</a>
            ))}
          </div>
          <p className="text-xs" style={{ color: t.t20 }}>© 2026 Crextio. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
