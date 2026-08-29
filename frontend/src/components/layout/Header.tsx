"use client";

import { useState } from "react";
import { RefreshCw, Play, Sparkles, User, LogOut, Settings as SettingsIcon, ChevronDown, Shield } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Header() {
  const { user, logout } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await fetchApi("/demo/reset", { method: "POST" });
      setMsg("TX-10492 Demo transaction reset!");
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err: any) {
      setMsg(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center space-x-3">
        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Enterprise Recovery Console</span>
        <span className="text-slate-300">|</span>
        <div className="flex items-center text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-medium">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-600 animate-pulse" />
          Autonomous Agent System Active
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {msg && <span className="text-xs text-emerald-600 font-semibold">{msg}</span>}

        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${resetting ? "animate-spin" : ""}`} />
          Reset Demo
        </button>

        <a
          href="/agent?tx=TX-10492"
          className="flex items-center px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
          Run Agent
        </a>

        {/* User Account Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded-lg hover:bg-slate-100 border border-slate-200 text-xs transition"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                {user.full_name ? user.full_name[0].toUpperCase() : "U"}
              </div>
              <div className="text-left hidden sm:block">
                <span className="font-bold text-slate-900 block leading-none">{user.full_name}</span>
                <span className="text-[10px] text-slate-400 block font-semibold">{user.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-30 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900 leading-tight">{user.full_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <div className="mt-1.5">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-black border border-blue-200">
                      ROLE: {user.role}
                    </span>
                  </div>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  <SettingsIcon className="w-4 h-4 mr-2 text-slate-400" />
                  Account & Settings
                </Link>

                <button
                  onClick={logout}
                  className="w-full flex items-center px-3 py-2 text-rose-600 hover:bg-rose-50 font-bold border-t border-slate-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
