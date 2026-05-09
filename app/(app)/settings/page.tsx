"use client";
import { useState, useEffect } from "react";
import clsx from "clsx";
import {
  User, Mail, Bell, Shield, Link2, Palette,
  CheckCircle, Smartphone, Lock, Eye, EyeOff, Save, Zap,
} from "lucide-react";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const SECTIONS = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations",  label: "Integrations",  icon: Link2 },
  { id: "security",      label: "Security",       icon: Shield },
  { id: "appearance",    label: "Appearance",     icon: Palette },
];

const ALERT_TYPES = [
  "Response Needed", "Ship Pending", "Post Due",
  "Payment Overdue", "Collab Expiring", "TikTok Notice", "Contract Pending",
];

type Msg = { type: "success" | "error"; text: string };

export default function SettingsPage() {
  const [section, setSection] = useState("profile");

  // ── Profile ──
  const [profileName,   setProfileName]   = useState("");
  const [profileEmail,  setProfileEmail]  = useState("");
  const [profileHandle, setProfileHandle] = useState("");
  const [profileTz,     setProfileTz]     = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving,  setProfileSaving]  = useState(false);
  const [profileMsg,     setProfileMsg]     = useState<Msg | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        setProfileName(data.name         ?? "");
        setProfileEmail(data.email       ?? "");
        setProfileHandle(data.tiktokHandle ?? "");
        setProfileTz(data.timezone       ?? "");
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: profileName, tiktokHandle: profileHandle, timezone: profileTz }),
      });
      if (!res.ok) throw new Error();
      setProfileMsg({ type: "success", text: "Profile saved." });
    } catch {
      setProfileMsg({ type: "error", text: "Failed to save. Please try again." });
    } finally {
      setProfileSaving(false);
    }
  }

  // ── Security ──
  const [currentPass, setCurrentPass] = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [secSaving,   setSecSaving]   = useState(false);
  const [secMsg,      setSecMsg]      = useState<Msg | null>(null);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setSecMsg(null);
    if (newPass.length < 8) {
      setSecMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPass !== confirmPass) {
      setSecMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    setSecSaving(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("not_logged_in");
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      setSecMsg({ type: "success", text: "Password updated successfully." });
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
    } catch (err: any) {
      const code = err?.code as string | undefined;
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setSecMsg({ type: "error", text: "Current password is incorrect." });
      } else if (code === "auth/too-many-requests") {
        setSecMsg({ type: "error", text: "Too many attempts. Try again later." });
      } else {
        setSecMsg({ type: "error", text: "Failed to update password. Please try again." });
      }
    } finally {
      setSecSaving(false);
    }
  }

  // ── Notifications ──
  const [alerts, setAlerts] = useState<Record<string, boolean>>(
    Object.fromEntries(ALERT_TYPES.map(t => [t, true]))
  );

  // ── Integrations ──
  const [gmailConnected,  setGmailConnected]  = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(false);

  // ── Appearance ──
  const [theme, setTheme] = useState("light");

  const avatarLetter = profileName ? profileName.charAt(0).toUpperCase() : "?";

  return (
    <div className="p-5 lg:p-7">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar nav */}
        <div className="lg:w-52 shrink-0">
          <div className="rounded-2xl border border-gray-200 bg-white p-2 space-y-0.5 shadow-sm">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setSection(id)}
                className={clsx(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all text-left",
                  section === id
                    ? "bg-violet-50 text-violet-700 border border-violet-200"
                    : "text-gray-600 hover:bg-gray-50 border border-transparent"
                )}>
                <Icon className={clsx("h-4 w-4 shrink-0", section === id ? "text-violet-600" : "text-gray-400")} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ── Profile ── */}
          {section === "profile" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-semibold text-gray-900">Profile Information</h3>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-violet-200">
                  {avatarLetter}
                </div>
              </div>

              {profileLoading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
                  <span className="h-4 w-4 rounded-full border-2 border-gray-200 border-t-violet-500 animate-spin" />
                  Loading…
                </div>
              ) : (
                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">Full Name</label>
                      <input
                        type="text" required value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-300 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">Email Address</label>
                      <input
                        type="email" value={profileEmail} disabled
                        className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">TikTok Handle</label>
                      <input
                        type="text" value={profileHandle}
                        onChange={e => setProfileHandle(e.target.value)}
                        placeholder="@yourhandle"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-300 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">Timezone</label>
                      <input
                        type="text" value={profileTz}
                        onChange={e => setProfileTz(e.target.value)}
                        placeholder="e.g. Asia/Karachi"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-300 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {profileMsg && (
                    <div className={clsx(
                      "rounded-xl border px-4 py-3 text-xs font-medium",
                      profileMsg.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-600"
                    )}>
                      {profileMsg.text}
                    </div>
                  )}

                  <button type="submit" disabled={profileSaving}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm shadow-violet-200 disabled:opacity-60">
                    {profileSaving
                      ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      : <Save className="h-4 w-4" />
                    }
                    Save Changes
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── Notifications ── */}
          {section === "notifications" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Alert Preferences</h3>
              <p className="text-xs text-gray-400 mb-5">Choose which alerts you want to receive</p>
              <div className="space-y-0">
                {ALERT_TYPES.map(type => (
                  <div key={type} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{type}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Notify for {type.toLowerCase()} alerts</div>
                    </div>
                    <button onClick={() => setAlerts(a => ({ ...a, [type]: !a[type] }))}
                      className={clsx("relative h-6 w-11 rounded-full transition-all", alerts[type] ? "bg-violet-600" : "bg-gray-200")}>
                      <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", alerts[type] ? "left-5.5" : "left-0.5")} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Integrations ── */}
          {section === "integrations" && (
            <div className="space-y-4">
              {/* Gmail */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-semibold text-gray-900">Gmail Integration</div>
                      {gmailConnected && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                          <CheckCircle className="h-3 w-3" /> Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Auto-pull brand deal emails directly into your inbox.</p>
                    {!gmailConnected ? (
                      <button onClick={() => setGmailConnected(true)}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Connect Google Account
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                            {avatarLetter}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{profileEmail}</div>
                            <div className="text-xs text-gray-400">Connected · Auto-syncing</div>
                          </div>
                          <button onClick={() => setGmailConnected(false)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Disconnect</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TikTok */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-pink-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-semibold text-gray-900">TikTok Account</div>
                      {tiktokConnected && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                          <CheckCircle className="h-3 w-3" /> Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Link your TikTok account for seamless data reference.</p>
                    {tiktokConnected ? (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Smartphone className="h-4 w-4 text-pink-500" />
                        {profileHandle || "@yourhandle"}
                        <button onClick={() => setTiktokConnected(false)} className="ml-2 text-xs text-red-500 hover:text-red-700 transition-colors">Disconnect</button>
                      </div>
                    ) : (
                      <button onClick={() => setTiktokConnected(true)}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm">
                        <Zap className="h-4 w-4" /> Connect TikTok
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {section === "security" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-semibold text-gray-900">Change Password</h3>
              <form onSubmit={changePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"} required
                      value={currentPass} onChange={e => setCurrentPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-300 focus:bg-white pr-10 transition-all"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">New Password</label>
                  <input
                    type="password" required
                    value={newPass} onChange={e => setNewPass(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-300 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Confirm New Password</label>
                  <input
                    type="password" required
                    value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-300 focus:bg-white transition-all"
                  />
                </div>

                {secMsg && (
                  <div className={clsx(
                    "rounded-xl border px-4 py-3 text-xs font-medium",
                    secMsg.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-600"
                  )}>
                    {secMsg.text}
                  </div>
                )}

                <button type="submit" disabled={secSaving}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm shadow-violet-200 disabled:opacity-60">
                  {secSaving
                    ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <Lock className="h-4 w-4" />
                  }
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* ── Appearance ── */}
          {section === "appearance" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-semibold text-gray-900">Appearance</h3>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-3">Theme</div>
                <div className="grid grid-cols-3 gap-3">
                  {["dark", "light", "system"].map(t => (
                    <button key={t} onClick={() => setTheme(t)}
                      className={clsx(
                        "rounded-xl border p-4 text-sm font-medium capitalize transition-all",
                        theme === t
                          ? "border-violet-300 bg-violet-50 text-violet-700"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                      )}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-3">Accent Color</div>
                <div className="flex gap-3">
                  {[
                    { color: "bg-violet-500",  name: "Violet" },
                    { color: "bg-pink-500",    name: "Pink" },
                    { color: "bg-blue-500",    name: "Blue" },
                    { color: "bg-emerald-500", name: "Emerald" },
                    { color: "bg-orange-500",  name: "Orange" },
                  ].map(({ color, name }) => (
                    <button key={name} title={name}
                      className={`h-8 w-8 rounded-full ${color} ring-2 ring-offset-2 ring-offset-white hover:ring-gray-400 transition-all ring-transparent`} />
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
