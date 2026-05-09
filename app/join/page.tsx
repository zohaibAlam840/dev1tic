"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/user-not-found":     "No account found with this email.",
  "auth/wrong-password":     "Incorrect password.",
  "auth/too-many-requests":  "Too many attempts. Please try again later.",
  "auth/user-disabled":      "This account has been disabled.",
};

export default function JoinPage() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/dashboard");
    });
    return unsub;
  }, []);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
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

      router.push("/dashboard");
    } catch (err: any) {
      const code = err?.code as string | undefined;
      setError(ERROR_MESSAGES[code ?? ""] ?? "Something went wrong. Please try again.");
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
          Are you an admin?{" "}
          <Link href="/login" className="font-bold text-[#1A1A1A] hover:underline">
            Admin login
          </Link>
        </p>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E9E9E2] bg-white px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#FFD567]" />
              <span className="text-xs font-semibold text-gray-500">Creator Portal</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight mb-2">
              Access your workspace
            </h1>
            <p className="text-sm text-gray-400">
              Log in with the credentials your admin sent you
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E9E9E2] shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type="email" required autoComplete="email"
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-11 pr-4 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type={showPw ? "text" : "password"} required autoComplete="current-password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password from your invite"
                    className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] pl-11 pr-12 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <p className="text-right -mt-2">
                <Link href="/login" className="text-xs text-gray-400 font-medium hover:text-[#1A1A1A] transition-colors">
                  Forgot password?
                </Link>
              </p>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1A1A1A] py-4 text-sm font-bold text-white hover:bg-black transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <> Access workspace <ArrowRight className="h-4 w-4" /> </>}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Didn&apos;t receive an invite? Contact your workspace admin.
          </p>
        </div>
      </div>
    </div>
  );
}
