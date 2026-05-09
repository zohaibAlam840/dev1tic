"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, onAuthStateChanged, deleteUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { TrendingUp, Mail, Lock, Eye, EyeOff, User, ArrowRight, CheckCircle } from "lucide-react";

const PERKS = [
  "Free to start — no credit card",
  "Your own workspace + team management",
  "Creators scoped to your account only",
];

const ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use":  "An account with this email already exists.",
  "auth/invalid-email":         "Please enter a valid email address.",
  "auth/weak-password":         "Password must be at least 6 characters.",
  "auth/operation-not-allowed": "Email/password sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.",
};

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/dashboard");
    });
    return unsub;
  }, []);

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Create account + user docs server-side via Admin SDK
      const idToken       = await credential.user.getIdToken();
      const registerRes   = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          idToken,
          name:     name.trim(),
          email,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      if (!registerRes.ok) {
        await deleteUser(credential.user).catch(() => {});
        throw new Error("register_failed");
      }

      // 3. Create server-side session cookie
      const sessionRes = await fetch("/api/auth/session", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ idToken }),
      });
      if (!sessionRes.ok) {
        // Account created but session cookie failed — send to login so they can sign in normally
        router.push("/login?notice=account_created");
        return;
      }

      // 5. Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      const code = err?.code as string | undefined;
      console.error("[signup] error:", err);
      setError(ERROR_MESSAGES[code ?? ""] ?? `Something went wrong (${err?.message ?? "unknown"}). Please try again.`);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] flex flex-col">

      {/* Nav */}
      <header className="px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-[#1A1A1A]">Crextio</span>
        </Link>
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#1A1A1A] hover:underline">Log in</Link>
        </p>
      </header>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-10 items-center">

          {/* Left — value prop */}
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E9E9E2] bg-white px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFD567]" />
              <span className="text-xs font-semibold text-gray-500">Admin account</span>
            </div>
            <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight leading-tight mb-4">
              Create your workspace.<br />
              <span className="text-gray-400">Add your team.</span><br />
              Run your business.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-8">
              When you sign up you become the Admin of your own Crextio workspace.
              Add creators under your account — each gets their own scoped login and private data view.
            </p>
            <ul className="space-y-3 mb-10">
              {PERKS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="h-6 w-6 rounded-full bg-[#FFD567]/30 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-3.5 w-3.5 text-[#1A1A1A]" />
                  </div>
                  {p}
                </li>
              ))}
            </ul>

            {/* Role diagram */}
            <div className="rounded-2xl border border-[#E9E9E2] bg-white p-5">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Your account structure</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 rounded-xl bg-[#1A1A1A] px-4 py-3">
                  <div className="h-7 w-7 rounded-full bg-[#FFD567] flex items-center justify-center text-[10px] font-black text-[#1A1A1A]">
                    {name ? name.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{name || "You"} (Admin)</div>
                    <div className="text-[10px] text-white/40">Sees all creators + all data</div>
                  </div>
                </div>
                {["Creator 1", "Creator 2"].map((c, i) => (
                  <div key={c} className="flex items-center gap-3 rounded-xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-2.5 ml-4">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-black text-gray-500">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#1A1A1A]">{c}</div>
                      <div className="text-[10px] text-gray-400">Sees only their own records</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div>
            <div className="text-center lg:text-left mb-7">
              <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight mb-2">Create your account</h1>
              <p className="text-sm text-gray-400">You&apos;ll be the Admin of your workspace.</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E9E9E2] shadow-sm p-8">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Full name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input
                      type="text" required autoComplete="name"
                      value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Ali Creator"
                      className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-11 pr-4 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input
                      type="email" required autoComplete="email"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-11 pr-4 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input
                      type={showPw ? "text" : "password"} required autoComplete="new-password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-11 pr-12 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                          password.length >= i * 3
                            ? password.length >= 12 ? "bg-emerald-400"
                              : password.length >= 8 ? "bg-[#FFD567]"
                              : "bg-red-400"
                            : "bg-[#E9E9E2]"
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1A1A1A] py-4 text-sm font-bold text-white hover:bg-black transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading
                    ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <> Create account <ArrowRight className="h-4 w-4" /> </>
                  }
                </button>
              </form>
            </div>

            <p className="text-center text-xs text-gray-400 mt-5">
              By signing up you agree to Crextio&apos;s{" "}
              <a href="#" className="font-medium text-gray-500 hover:text-[#1A1A1A]">Terms</a> and{" "}
              <a href="#" className="font-medium text-gray-500 hover:text-[#1A1A1A]">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
