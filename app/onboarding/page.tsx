"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import clsx from "clsx";

const PLATFORMS  = ["TikTok", "Instagram", "YouTube", "Multiple"];
const TEAM_SIZES = ["Just me", "2–5", "6–20", "20+"];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile } = useAuth();

  const [workspaceName, setWorkspaceName] = useState("");
  const [platform,      setPlatform]      = useState("");
  const [teamSize,      setTeamSize]      = useState("");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const initialized = useRef(false);
  useEffect(() => {
    if (profile?.name && !initialized.current) {
      initialized.current = true;
      setWorkspaceName(`${profile.name}'s Workspace`);
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceName.trim()) {
      setError("Please enter a workspace name.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ workspaceName: workspaceName.trim(), platform, teamSize }),
      });
      if (!res.ok) throw new Error("save_failed");
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] flex flex-col">

      {/* Nav */}
      <header className="px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-[#1A1A1A]">Crextio</span>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg">

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E9E9E2] bg-white px-4 py-1.5 mb-5">
              <span className="h-2 w-2 rounded-full bg-[#FFD567]" />
              <span className="text-xs font-semibold text-gray-500">Account created</span>
            </div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight mb-2">
              Set up your workspace.
            </h1>
            <p className="text-sm text-gray-400">
              You&apos;re the Admin. Takes 30 seconds — you can change any of this later.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E9E9E2] shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-7">

              {/* Workspace name */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
                  Workspace name
                </label>
                <input
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="My Creator Studio"
                  className="w-full rounded-2xl border border-[#E9E9E2] bg-[#F7F7F2] px-4 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-300 outline-none focus:bg-white focus:border-[#1A1A1A] transition-all"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  The name of your organization — your creators will see this.
                </p>
              </div>

              {/* Primary platform */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
                  Primary platform
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(prev => prev === p ? "" : p)}
                      className={clsx(
                        "rounded-2xl border py-3 px-4 text-sm font-bold transition-all text-left",
                        platform === p
                          ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                          : "border-[#E9E9E2] bg-[#F7F7F2] text-gray-500 hover:border-gray-300 hover:bg-white"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team size */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
                  Creators you manage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TEAM_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTeamSize(prev => prev === s ? "" : s)}
                      className={clsx(
                        "rounded-2xl border py-3 px-4 text-sm font-bold transition-all text-left",
                        teamSize === s
                          ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                          : "border-[#E9E9E2] bg-[#F7F7F2] text-gray-500 hover:border-gray-300 hover:bg-white"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1A1A1A] py-4 text-sm font-bold text-white hover:bg-black transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <> Go to my dashboard <ArrowRight className="h-4 w-4" /> </>
                }
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Platform and team size are optional — they help us tailor your experience.
          </p>
        </div>
      </div>
    </div>
  );
}
