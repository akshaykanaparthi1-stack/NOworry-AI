"use client";

import { useState } from "react";
import { RefreshCw, Play, Sparkles } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function Header() {
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState("");

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
        {msg && <span className="text-xs text-emerald-600 font-semibold animate-fade-in">{msg}</span>}

        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${resetting ? "animate-spin" : ""}`} />
          Reset TX-10492 Demo
        </button>

        <a
          href="/agent?tx=TX-10492"
          className="flex items-center px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
          Run Demo Agent Workflow
        </a>
      </div>
    </header>
  );
}
