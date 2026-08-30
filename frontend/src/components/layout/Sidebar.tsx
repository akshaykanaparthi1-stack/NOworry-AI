"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Bot, 
  Zap, 
  BarChart3, 
  Calculator, 
  FileText, 
  Settings, 
  ShieldCheck 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Opportunities", href: "/opportunities", icon: TrendingUp },
  { name: "AI Recovery Agent", href: "/agent", icon: Bot },
  { name: "Recovery Actions", href: "/actions", icon: Zap },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "ROI Simulator", href: "/roi", icon: Calculator },
  { name: "Audit Logs", href: "/audit-logs", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-screen shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight leading-none text-lg">NoWorry AI</h1>
            <p className="text-xs text-blue-600 font-semibold mt-1">Autonomous Recovery</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Environment Badge */}
      <div className="p-4 m-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Environment</span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
            ACTIVE PLATFORM
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2 font-medium">Tagline: Detect. Decide. Recover.</p>
      </div>
    </aside>
  );
}
