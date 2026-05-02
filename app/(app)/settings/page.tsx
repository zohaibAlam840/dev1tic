"use client";
import { useState } from "react";
import clsx from "clsx";
import { User, Mail, Bell, Shield, Link2, Palette, CheckCircle, Smartphone, Lock, Eye, EyeOff, Save, Zap } from "lucide-react";

const SECTIONS = [
  { id:"profile",       label:"Profile",        icon:User },
  { id:"notifications", label:"Notifications",  icon:Bell },
  { id:"integrations",  label:"Integrations",   icon:Link2 },
  { id:"security",      label:"Security",        icon:Shield },
  { id:"appearance",    label:"Appearance",      icon:Palette },
];

const ALERT_TYPES = ["Response Needed","Ship Pending","Post Due","Payment Overdue","Collab Expiring","TikTok Notice","Contract Pending"];

export default function SettingsPage() {
  const [section, setSection]             = useState("profile");
  const [showPass, setShowPass]           = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(true);
  const [alerts, setAlerts]               = useState<Record<string,boolean>>(Object.fromEntries(ALERT_TYPES.map(t=>[t,true])));
  const [theme, setTheme]                 = useState("light");

  return (
    <div className="p-5 lg:p-7">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Nav sidebar */}
        <div className="lg:w-52 shrink-0">
          <div className="rounded-2xl border border-gray-200 bg-white p-2 space-y-0.5 shadow-sm">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={()=>setSection(id)}
                className={clsx("w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all text-left",
                  section===id ? "bg-violet-50 text-violet-700 border border-violet-200" : "text-gray-600 hover:bg-gray-50 border border-transparent"
                )}>
                <Icon className={clsx("h-4 w-4 shrink-0", section===id ? "text-violet-600" : "text-gray-400")} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ── Profile ── */}
          {section==="profile" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-semibold text-gray-900">Profile Information</h3>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-violet-200">
                  A
                </div>
                <div>
                  <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all">Change Avatar</button>
                  <p className="text-[10px] text-gray-400 mt-1.5">JPG, PNG up to 2MB</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label:"Full Name",      placeholder:"Ali Creator",         type:"text" },
                  { label:"Email Address",  placeholder:"ali@creator.com",     type:"email" },
                  { label:"TikTok Handle",  placeholder:"@alicreator",         type:"text" },
                  { label:"Timezone",       placeholder:"UTC+5:00 Karachi",    type:"text" },
                ].map(({ label, placeholder, type }) => (
                  <div key={label}>
                    <label className="block text-xs font-medium text-gray-500 mb-2">{label}</label>
                    <input type={type} defaultValue={placeholder}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-300 focus:bg-white transition-all" />
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm shadow-violet-200">
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          )}

          {/* ── Notifications ── */}
          {section==="notifications" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Alert Preferences</h3>
              <p className="text-xs text-gray-400 mb-5">Choose which alerts you want to receive</p>
              <div className="space-y-0">
                {ALERT_TYPES.map(type=>(
                  <div key={type} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{type}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Notify for {type.toLowerCase()} alerts</div>
                    </div>
                    <button onClick={()=>setAlerts(a=>({...a,[type]:!a[type]}))}
                      className={clsx("relative h-6 w-11 rounded-full transition-all", alerts[type] ? "bg-violet-600" : "bg-gray-200")}>
                      <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", alerts[type] ? "left-5.5" : "left-0.5")} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Integrations ── */}
          {section==="integrations" && (
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
                      <button onClick={()=>setGmailConnected(true)}
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
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">A</div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">ali@creator.com</div>
                            <div className="text-xs text-gray-400">Connected · Auto-syncing</div>
                          </div>
                          <button onClick={()=>setGmailConnected(false)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Disconnect</button>
                        </div>
                        <div className="text-xs text-gray-500">Your inbox email: <span className="font-mono text-violet-600">ali-inbox@creatoros.app</span></div>
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
                        <Smartphone className="h-4 w-4 text-pink-500" /> @alicreator
                        <button onClick={()=>setTiktokConnected(false)} className="ml-2 text-xs text-red-500 hover:text-red-700 transition-colors">Disconnect</button>
                      </div>
                    ) : (
                      <button onClick={()=>setTiktokConnected(true)}
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
          {section==="security" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-semibold text-gray-900">Security Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Current Password</label>
                  <div className="relative">
                    <input type={showPass?"text":"password"} placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-300 focus:bg-white pr-10 transition-all" />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={()=>setShowPass(!showPass)}>
                      {showPass ? <EyeOff className="h-4 w-4 text-gray-400"/> : <Eye className="h-4 w-4 text-gray-400"/>}
                    </button>
                  </div>
                </div>
                {["New Password","Confirm New Password"].map(label=>(
                  <div key={label}>
                    <label className="block text-xs font-medium text-gray-500 mb-2">{label}</label>
                    <input type="password" placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-300 focus:bg-white transition-all" />
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm shadow-violet-200">
                <Lock className="h-4 w-4" /> Update Password
              </button>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Two-Factor Authentication</div>
                  <div className="text-xs text-gray-400">Add an extra layer of security</div>
                </div>
                <button className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-all">Enable 2FA</button>
              </div>
            </div>
          )}

          {/* ── Appearance ── */}
          {section==="appearance" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-semibold text-gray-900">Appearance</h3>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-3">Theme</div>
                <div className="grid grid-cols-3 gap-3">
                  {["dark","light","system"].map(t=>(
                    <button key={t} onClick={()=>setTheme(t)}
                      className={clsx("rounded-xl border p-4 text-sm font-medium capitalize transition-all",
                        theme===t ? "border-violet-300 bg-violet-50 text-violet-700" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
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
                    {color:"bg-violet-500",name:"Violet"},
                    {color:"bg-pink-500",name:"Pink"},
                    {color:"bg-blue-500",name:"Blue"},
                    {color:"bg-emerald-500",name:"Emerald"},
                    {color:"bg-orange-500",name:"Orange"},
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
