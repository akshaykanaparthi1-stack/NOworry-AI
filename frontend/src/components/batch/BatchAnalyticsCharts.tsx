"use client";

import React from "react";
import { BarChart3, PieChart, TrendingUp, AlertTriangle } from "lucide-react";

interface BatchAnalyticsProps {
  metrics: {
    revenue_at_risk: number;
    expected_recovery: number;
    actual_recovered: number;
    recovery_rate: number;
    successful_recoveries: number;
    failed_recoveries: number;
    escalated_count: number;
    pending_approval_count: number;
  } | null;
}

export default function BatchAnalyticsCharts({ metrics }: BatchAnalyticsProps) {
  if (!metrics) return null;

  const totalProcessed = metrics.successful_recoveries + metrics.failed_recoveries + metrics.escalated_count + metrics.pending_approval_count;
  const successPct = totalProcessed > 0 ? (metrics.successful_recoveries / totalProcessed) * 100 : 0;
  const pendingPct = totalProcessed > 0 ? (metrics.pending_approval_count / totalProcessed) * 100 : 0;
  const escalatedPct = totalProcessed > 0 ? (metrics.escalated_count / totalProcessed) * 100 : 0;
  const failedPct = totalProcessed > 0 ? (metrics.failed_recoveries / totalProcessed) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Expected vs Actual Recovery Comparison */}
      <div className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Expected vs Actual Recovery Comparison</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TRACK 03 CORE METRIC</span>
        </div>

        <div className="space-y-4">
          {/* Revenue at Risk Bar */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Total Revenue at Risk</span>
              <span>₹{metrics.revenue_at_risk.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-none overflow-hidden">
              <div className="bg-rose-500 h-full w-full"></div>
            </div>
          </div>

          {/* Expected Recovery Bar */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-bold text-blue-800">
              <span>ML Expected Recovery ($Amount \times Probability$)</span>
              <span>₹{metrics.expected_recovery.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-none overflow-hidden">
              <div
                className="bg-blue-600 h-full"
                style={{
                  width: `${Math.min(100, (metrics.expected_recovery / (metrics.revenue_at_risk || 1)) * 100)}%`
                }}
              ></div>
            </div>
          </div>

          {/* Actual Recovered Bar */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-bold text-emerald-800">
              <span>Actual Recovered Revenue (Verified)</span>
              <span>₹{metrics.actual_recovered.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-none overflow-hidden">
              <div
                className="bg-emerald-600 h-full"
                style={{
                  width: `${Math.min(100, (metrics.actual_recovered / (metrics.revenue_at_risk || 1)) * 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50/50 border border-blue-200 text-[11px] text-blue-900 font-medium">
          <strong>Key Insight:</strong> Expected Recovery represents ML predictive probability ($Amount \times Probability$). Actual Recovery measures verified funds recovered upon execution.
        </div>
      </div>

      {/* 2. Batch Execution Outcomes Distribution */}
      <div className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Batch Recovery Outcomes & Escalations</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">STOPPING RULES ACTIVE</span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Successful */}
          <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-600"></div>
              <span className="font-bold text-emerald-900">Successful Recoveries</span>
            </div>
            <span className="font-mono font-bold text-emerald-900">
              {metrics.successful_recoveries} ({successPct.toFixed(1)}%)
            </span>
          </div>

          {/* Pending Human Approval */}
          <div className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-500"></div>
              <span className="font-bold text-amber-900">Pending Human Governance Approval</span>
            </div>
            <span className="font-mono font-bold text-amber-900">
              {metrics.pending_approval_count} ({pendingPct.toFixed(1)}%)
            </span>
          </div>

          {/* Escalated (Stopping Rule Reached) */}
          <div className="flex items-center justify-between p-2 bg-rose-50 border border-rose-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-rose-600"></div>
              <span className="font-bold text-rose-900">Escalated to Operator (Max Retries Reached)</span>
            </div>
            <span className="font-mono font-bold text-rose-900">
              {metrics.escalated_count} ({escalatedPct.toFixed(1)}%)
            </span>
          </div>

          {/* Retryable Failed */}
          <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-400"></div>
              <span className="font-bold text-slate-700">Retryable Failed Attempts</span>
            </div>
            <span className="font-mono font-bold text-slate-700">
              {metrics.failed_recoveries} ({failedPct.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
