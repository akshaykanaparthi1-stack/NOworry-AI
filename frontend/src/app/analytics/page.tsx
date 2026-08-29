"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { fetchApi } from "@/lib/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetchApi<any>("/analytics/metrics");
        setData(res);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Revenue Recovery Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">Deep analytics across payment methods, root cause failure reasons, and AI model performance.</p>
        </div>

        {/* Analytics KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold uppercase">Total Revenue at Risk</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              ₹{data ? data.revenue_at_risk.toLocaleString('en-IN') : 0}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold uppercase">Total Recovered</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-2">
              ₹{data ? data.total_recovered.toLocaleString('en-IN') : 0}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold uppercase">Recovery Rate</span>
            <div className="text-2xl font-extrabold text-blue-700 mt-2">
              {data ? data.overall_recovery_rate : 0}%
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold uppercase">Avg Recovery Value</span>
            <div className="text-2xl font-extrabold text-amber-700 mt-2">
              ₹{data ? data.avg_recovery_value.toLocaleString('en-IN') : 0}
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Payment Method */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-4">Revenue at Risk by Payment Method</h3>
            <div className="h-64 w-full">
              {data && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.by_payment_method}>
                    <XAxis dataKey="method" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* By Failure Reason */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-4">Expected Recovery by Failure Reason</h3>
            <div className="h-64 w-full">
              {data && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.by_failure_reason} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                    <YAxis type="category" dataKey="reason" stroke="#64748b" fontSize={11} width={130} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, "Expected Recovery"]}
                    />
                    <Bar dataKey="expected_recovery" fill="#059669" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
