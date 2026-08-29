"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { fetchApi, DashboardSummary, DashboardCharts, OpportunityList } from "@/lib/api";
import { DollarSign, ShieldAlert, CheckCircle2, Cpu, ArrowUpRight, Percent, RefreshCw } from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell 
} from "recharts";
import Link from "next/link";

const COLORS = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed"];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [topOpps, setTopOpps] = useState<OpportunityList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, chartRes, oppRes] = await Promise.all([
        fetchApi<DashboardSummary>("/dashboard/summary"),
        fetchApi<DashboardCharts>("/dashboard/charts"),
        fetchApi<OpportunityList>("/opportunities?page_size=5&sort_by=amount&order=desc")
      ]);
      setSummary(sumRes);
      setCharts(chartRes);
      setTopOpps(oppRes);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 uppercase tracking-wider">
              ENTERPRISE REVENUE RECOVERY
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Executive Dashboard</h2>
            <p className="text-sm text-slate-500 font-medium">Real-time revenue leakage detection, ML recovery predictions, and autonomous agent metrics.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-300 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/agent?tx=TX-10492"
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
            >
              Launch Agent Execution
              <ArrowUpRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>

        {/* Error State Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={loadData} className="underline font-bold">Retry Connection</button>
          </div>
        )}

        {/* Primary 4 Core KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Revenue at Risk */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Revenue at Risk</span>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-slate-900 font-mono">
                ₹{summary ? summary.revenue_at_risk.toLocaleString('en-IN') : "0"}
              </div>
              <p className="text-xs text-rose-600 mt-1 font-semibold">
                Detected revenue leakage pipeline
              </p>
            </div>
          </div>

          {/* 2. Potential Recovery */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Potential Recovery</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-amber-700 font-mono">
                ₹{summary ? summary.potentially_recoverable_revenue.toLocaleString('en-IN') : "0"}
              </div>
              <p className="text-xs text-amber-700 mt-1 font-semibold">
                ML predicted recoverable revenue
              </p>
            </div>
          </div>

          {/* 3. Revenue Recovered */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Revenue Recovered</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-emerald-800 font-mono">
                ₹{summary ? summary.revenue_recovered.toLocaleString('en-IN') : "0"}
              </div>
              <p className="text-xs text-emerald-700 mt-1 font-semibold">
                Successfully captured by agent
              </p>
            </div>
          </div>

          {/* 4. Recovery Rate */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Recovery Rate</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-blue-700 font-mono">
                {summary ? summary.recovery_rate : 0}%
              </div>
              <p className="text-xs text-blue-700 mt-1 font-semibold">
                {summary ? summary.successful_actions : 0} / {summary ? summary.total_ai_actions : 0} Successful Actions
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Trend Chart */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Revenue at Risk vs Recovered Trend</h3>
                <p className="text-xs text-slate-500">Daily execution financial metrics from database</p>
              </div>
            </div>
            <div className="h-64 w-full mt-2">
              {charts && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#ffffff", fontSize: "12px" }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, ""]}
                    />
                    <Bar dataKey="revenue_at_risk" name="Revenue at Risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="recovered_revenue" name="Recovered Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Breakdown Pie Chart */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
            <h3 className="font-extrabold text-slate-900 text-sm mb-1">Revenue Leakage by Cause</h3>
            <p className="text-xs text-slate-500 mb-4 border-b border-slate-100 pb-3">Categorized payment failure diagnostics</p>
            <div className="h-64 w-full flex items-center justify-center">
              {charts && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.leakage_by_reason}
                      dataKey="count"
                      nameKey="reason"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={4}
                    >
                      {charts.leakage_by_reason.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#ffffff", fontSize: "12px" }}
                      formatter={(val: any) => [`${val} Transactions`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Top Opportunities Table */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Top Recovery Opportunities</h3>
              <p className="text-xs text-slate-500">High-priority revenue opportunities requiring agent analysis</p>
            </div>
            <Link href="/opportunities" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              View All Opportunities →
            </Link>
          </div>

          {topOpps && topOpps.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                    <th className="py-3 px-3">Transaction</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Failure Reason</th>
                    <th className="py-3 px-3">ML Probability</th>
                    <th className="py-3 px-3">Expected Recovery</th>
                    <th className="py-3 px-3">Recommended Action</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {topOpps.items.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-bold text-blue-600 font-mono">{opp.transaction_code}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{opp.customer_name}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 font-mono">₹{opp.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-slate-600">{opp.failure_reason}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-extrabold ${
                          opp.recovery_probability >= 0.7 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {(opp.recovery_probability * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-emerald-800 font-bold font-mono">₹{opp.expected_recovery.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">{opp.recommended_action}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          opp.status === "RECOVERED" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}>
                          {opp.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/agent?tx=${opp.transaction_code}`}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold transition shadow-2xs"
                        >
                          Run Agent
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No revenue opportunities found in database.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
