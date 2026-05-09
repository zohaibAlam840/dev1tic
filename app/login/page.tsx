"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential":    "Incorrect email or password.",
  "auth/user-not-found":        "No account found with this email.",
  "auth/wrong-password":        "Incorrect password.",
  "auth/too-many-requests":     "Too many attempts. Please try again later.",
  "auth/user-disabled":         "This account has been disabled.",
};

const RESET_ERROR_MESSAGES: Record<string, string> = {
  "auth/user-not-found":    "No account found with this email.",
  "auth/invalid-email":     "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
};

function LoginContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("from") ?? "/dashboard";
  const notice       = searchParams.get("notice");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/dashboard");
    });
    return unsub;
  }, []);

  const [mode, setMode] = useState<"login" | "reset">("login");

  // Login state
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Reset state
  const [resetEmail,   setResetEmail]   = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError,   setResetError]   = useState<string | null>(null);
  const [resetSent,    setResetSent]    = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken    = await credential.user.getIdToken();

      const sessionRes = await fetch("/api/auth/session", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ idToken }),
      });
      if (!sessionRes.ok) throw new Error("session_failed");

      router.push(redirectTo);
    } catch (err: any) {
      const code = err?.code as string | undefined;
      setError(ERROR_MESSAGES[code ?? ""] ?? "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setResetError(null);
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
    } catch (err: any) {
      const code = err?.code as string | undefined;
      setResetError(RESET_ERROR_MESSAGES[code ?? ""] ?? "Something went wrong. Please try again.");
    } finally {
      setResetLoading(false);
    }
  }

  function openReset() {
    setResetEmail(email); // pre-fill if they already typed their email
    setResetError(null);
    setResetSent(false);
    setMode("reset");
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
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <Link href="/join" className="flex items-center gap-1.5 font-bold text-[#1A1A1A] hover:underline">
            <span className="h-2 w-2 rounded-full bg-[#FFD567] inline-block" />
            Been invited?
          </Link>
          <span>·</span>
          <Link href="/signup" className="font-bold text-[#1A1A1A] hover:underline">
            Sign up free
          </Link>
        </div>
      </header>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">

          {notice === "invite_accepted" && mode === "login" && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
              Password created! Log in below with your email and new password to access your workspace.
            </div>
          )}

          {notice === "account_created" && mode === "login" && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
              Account created! Log in with your new credentials.
            </div>
          )}

          {/* ── Login mode ── */}
          {mode === "login" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight mb-2">Welcome back</h1>
                <p className="text-sm text-gray-400">Log in to your Crextio workspace</p>
              </div>

              <div className="bg-white rounded-3xl border border-[#E9E9E2] shadow-sm p-8">
                <form onSubmit={handleLogin} className="space-y-5">

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

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Password</label>
                      <button
                        type="button"
                        onClick={openReset}
                        className="text-xs font-medium text-gray-400 hover:text-[#1A1A1A] transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                      <input
                        type={showPw ? "text" : "password"} required autoComplete="current-password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-11 pr-12 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
                      : <> Log in <ArrowRight className="h-4 w-4" /> </>
                    }
                  </button>
                </form>
              </div>

              <p className="text-center text-xs text-gray-400 mt-6">
                By continuing you agree to Crextio&apos;s{" "}
                <a href="#" className="font-medium text-gray-500 hover:text-[#1A1A1A]">Terms</a> and{" "}
                <a href="#" className="font-medium text-gray-500 hover:text-[#1A1A1A]">Privacy Policy</a>.
              </p>
            </>
          )}

          {/* ── Reset mode ── */}
          {mode === "reset" && (
            <>
              <button
                onClick={() => setMode("login")}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A1A1A] transition-colors mb-8"
              >
                <ArrowLeft className="h-4 w-4" /> Back to login
              </button>

              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight mb-2">Reset password</h1>
                <p className="text-sm text-gray-400">We&apos;ll email you a link to reset your password.</p>
              </div>

              <div className="bg-white rounded-3xl border border-[#E9E9E2] shadow-sm p-8">
                {resetSent ? (
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A] mb-1">Check your inbox</p>
                      <p className="text-xs text-gray-400">
                        We sent a reset link to <span className="font-semibold text-[#1A1A1A]">{resetEmail}</span>.
                        Check your spam folder if you don&apos;t see it.
                      </p>
                    </div>
                    <button
                      onClick={() => setMode("login")}
                      className="mt-2 text-xs font-bold text-[#1A1A1A] hover:underline"
                    >
                      Back to login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReset} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                        <input
                          type="email" required autoComplete="email"
                          value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-11 pr-4 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all"
                        />
                      </div>
                    </div>

                    {resetError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                        {resetError}
                      </div>
                    )}

                    <button type="submit" disabled={resetLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1A1A1A] py-4 text-sm font-bold text-white hover:bg-black transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                      {resetLoading
                        ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        : <> Send reset link <ArrowRight className="h-4 w-4" /> </>
                      }
                    </button>
                  </form>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F7F2] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-[#1A1A1A]/10 border-t-[#1A1A1A] animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
