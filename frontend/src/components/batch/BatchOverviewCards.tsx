"use client";

import React from "react";
import { AlertOctagon, TrendingUp, ShieldCheck, DollarSign, CheckCircle2, AlertTriangle } from "lucide-react";

interface BatchOverviewCardsProps {
  metrics: {
    transactions_analyzed: number;
    revenue_at_risk: number;
    expected_recovery: number;
    actual_recovered: number;
    recovery_rate: number;
    successful_recoveries: number;
    failed_recoveries: number;
    escalated_count: number;
    pending_approval_count: number;
    average_recovery_probability: number;
  } | null;
}

export default function BatchOverviewCards({ metrics }: BatchOverviewCardsProps) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Revenue at Risk */}
      <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Revenue at Risk</span>
          <div className="p-2 bg-rose-50 border border-rose-200 rounded-none text-rose-600">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900">
          ₹{metrics.revenue_at_risk.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
        <p className="text-[11px] text-slate-500 font-medium">
          Across {metrics.transactions_analyzed} analyzed failed transactions
        </p>
      </div>

      {/* 2. Expected Recovery (ML Prediction) */}
      <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expected Recovery</span>
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-none text-blue-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-blue-700">
          ₹{metrics.expected_recovery.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
        <p className="text-[11px] text-slate-500 font-medium">
          ML Probability Average: {(metrics.average_recovery_probability * 100).toFixed(1)}%
        </p>
      </div>

      {/* 3. ACTUAL RECOVERED MONEY */}
      <div className="bg-emerald-950/5 border-2 border-emerald-500 p-5 rounded-none shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800">Actual Money Recovered</span>
          <div className="p-2 bg-emerald-600 rounded-none text-white shadow-xs">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-700">
          ₹{metrics.actual_recovered.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
          <span>Actual Recovery Rate</span>
          <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 rounded-none">
            {metrics.recovery_rate.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 4. Escalations & Stopping Rules */}
      <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Escalated & Bounded</span>
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-none text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900">
          {metrics.escalated_count} <span className="text-xs font-semibold text-slate-500">Txs Escalated</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">
          {metrics.pending_approval_count} Pending Human Approval | Safe Stopping Rules Active
        </p>
      </div>
    </div>
  );
}
