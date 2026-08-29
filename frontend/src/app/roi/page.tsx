"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { fetchApi } from "@/lib/api";
import { Calculator, Sparkles, TrendingUp, DollarSign, ShieldAlert, Award } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from "recharts";

export default function ROIPage() {
  const [monthlyTx, setMonthlyTx] = useState(10000);
  const [avgVal, setAvgVal] = useState(2000);
  const [failureRate, setFailureRate] = useState(10.0);
  const [currentRate, setCurrentRate] = useState(10.0);
  const [projectedRate, setProjectedRate] = useState(60.0);

  const [roiResult, setRoiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function calculateROI() {
    setLoading(true);
    try {
      const res = await fetchApi<any>("/roi/calculate", {
        method: "POST",
        body: JSON.stringify({
          monthly_transactions: monthlyTx,
          avg_transaction_value: avgVal,
          failure_rate_percent: failureRate,
          current_recovery_rate_percent: currentRate,
          projected_ai_recovery_rate_percent: projectedRate,
        }),
      });
      setRoiResult(res);
    } catch (err) {
      console.error("ROI calculation error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    calculateROI();
  }, [monthlyTx, avgVal, failureRate, currentRate, projectedRate]);

  // Comparison Chart Dataset
  const comparisonData = roiResult ? [
    {
      category: "Monthly Recovery",
      Current: roiResult.current_recovered_revenue,
      "NoWorry AI": roiResult.projected_recovered_revenue,
    },
    {
      category: "Annualized Recovery",
      Current: roiResult.current_recovered_revenue * 12,
      "NoWorry AI": roiResult.projected_recovered_revenue * 12,
    }
  ] : [];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Calculator className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Revenue Impact Simulator</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Formula-based revenue recovery calculator evaluating baseline vs NoWorry AI recovery lift.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded bg-blue-100 text-blue-800 text-xs font-black tracking-wide border border-blue-300 uppercase shadow-xs">
              ESTIMATED BUSINESS IMPACT
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-5 p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3 flex items-center justify-between">
              <span>Simulator Parameters</span>
              <span className="text-[11px] text-slate-400 font-normal">Real Formula Math</span>
            </h3>

            {/* 1. Monthly Transactions */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Monthly Transactions</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{monthlyTx.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={monthlyTx}
                onChange={(e) => setMonthlyTx(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* 2. Average Transaction Value */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Average Transaction Value (₹)</span>
                <span className="font-bold text-slate-900 font-mono text-sm">₹{avgVal.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={500}
                max={25000}
                step={500}
                value={avgVal}
                onChange={(e) => setAvgVal(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* 3. Payment Failure Rate */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Payment Failure Rate (%)</span>
                <span className="font-bold text-rose-600 font-mono text-sm">{failureRate}%</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={30.0}
                step={0.5}
                value={failureRate}
                onChange={(e) => setFailureRate(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            {/* 4. Current Baseline Recovery Rate */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Current Baseline Recovery Rate (%)</span>
                <span className="font-bold text-slate-700 font-mono text-sm">{currentRate}%</span>
              </div>
              <input
                type="range"
                min={0.0}
                max={40.0}
                step={1.0}
                value={currentRate}
                onChange={(e) => setCurrentRate(Number(e.target.value))}
                className="w-full accent-slate-500 cursor-pointer"
              />
            </div>

            {/* 5. Projected NoWorry AI Recovery Rate */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>NoWorry AI Recovery Rate (%)</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">{projectedRate}%</span>
              </div>
              <input
                type="range"
                min={30.0}
                max={95.0}
                step={1.0}
                value={projectedRate}
                onChange={(e) => setProjectedRate(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">ESTIMATED BUSINESS IMPACT</h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                Formula Calculated
              </span>
            </div>

            {/* Output Metric Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-semibold block text-[11px]">Monthly Revenue</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block font-mono">
                  ₹{roiResult ? roiResult.monthly_revenue.toLocaleString('en-IN') : 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
                <span className="text-rose-700 font-semibold block text-[11px]">Revenue at Risk</span>
                <span className="text-lg font-bold text-rose-700 mt-0.5 block font-mono">
                  ₹{roiResult ? roiResult.revenue_at_risk.toLocaleString('en-IN') : 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-semibold block text-[11px]">Current Recovered Revenue</span>
                <span className="text-lg font-bold text-slate-700 mt-0.5 block font-mono">
                  ₹{roiResult ? roiResult.current_recovered_revenue.toLocaleString('en-IN') : 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-emerald-800 font-semibold block text-[11px]">Projected Recovered Revenue</span>
                <span className="text-lg font-bold text-emerald-800 mt-0.5 block font-mono">
                  ₹{roiResult ? roiResult.projected_recovered_revenue.toLocaleString('en-IN') : 0}
                </span>
              </div>
            </div>

            {/* Additional Monthly & Annualized Impact */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center">
                  <Sparkles className="w-4 h-4 text-blue-600 mr-1.5" />
                  Additional Monthly Revenue
                </span>
                <span className="text-sm font-black text-blue-900 font-mono">
                  +₹{roiResult ? roiResult.additional_monthly_revenue.toLocaleString('en-IN') : 0}/mo
                </span>
              </div>

              <div className="pt-1 border-t border-blue-200/60 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">Annualized Revenue Impact</span>
                <span className="text-2xl font-black text-blue-950 font-mono">
                  +₹{roiResult ? roiResult.annualized_revenue_impact.toLocaleString('en-IN') : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Chart Section */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Revenue Recovery Comparison</h3>
              <p className="text-xs text-slate-500">Current Manual Baseline vs Projected NoWorry AI Autonomous Recovery</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              {roiResult?.roi_multiplier}x Recovery Multiplier
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, ""]} 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="Current" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Current Manual Baseline" />
                <Bar dataKey="NoWorry AI" fill="#2563eb" radius={[4, 4, 0, 0]} name="Projected NoWorry AI Recovery" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
