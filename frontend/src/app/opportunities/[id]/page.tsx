"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { fetchApi, OpportunityDetail } from "@/lib/api";
import { User, CreditCard, Cpu, ArrowLeft, Play } from "lucide-react";
import Link from "next/link";

export default function OpportunityDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [detail, setDetail] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await fetchApi<OpportunityDetail>(`/opportunities/${id}`);
        setDetail(res);
      } catch (err) {
        console.error("Fetch detail error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDetail();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-slate-500 font-medium">Loading opportunity details...</div>
      </AppLayout>
    );
  }

  if (!detail) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-rose-600 font-bold">Opportunity not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation back */}
        <Link href="/opportunities" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Opportunities
        </Link>

        {/* Header summary */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{detail.transaction_code}</h2>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {detail.status}
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                {detail.priority} PRIORITY
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Customer: <span className="text-slate-900 font-bold">{detail.customer_name}</span> ({detail.customer_email})
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/agent?tx=${detail.transaction_code}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center"
            >
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
              Execute Agent Workflow
            </Link>
          </div>
        </div>

        {/* 2 Column Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer & Transaction Profile */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm border-b border-slate-200 pb-3">
              <User className="w-4 h-4" />
              <span>Customer Profile & History</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Customer Segment</span>
                <span className="text-slate-900 font-bold text-sm">{detail.customer_segment}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Tenure</span>
                <span className="text-slate-900 font-bold text-sm">{detail.customer_tenure} Months</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Lifetime Value</span>
                <span className="text-emerald-700 font-bold text-sm">₹{detail.customer_ltv.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Historical Success Rate</span>
                <span className="text-slate-900 font-bold text-sm">{(detail.customer_success_rate * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm border-b border-slate-200 pt-4 pb-3">
              <CreditCard className="w-4 h-4" />
              <span>Transaction Information</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Amount at Risk</span>
                <span className="text-slate-900 font-extrabold text-sm">₹{detail.amount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Payment Method</span>
                <span className="text-slate-900 font-mono text-xs font-bold">{detail.payment_method}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block font-medium">Failure Reason</span>
                <span className="text-rose-600 font-bold text-xs">{detail.failure_reason}</span>
              </div>
            </div>
          </div>

          {/* AI Analysis & Prediction */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm border-b border-slate-200 pb-3">
              <Cpu className="w-4 h-4" />
              <span>AI Recovery Prediction & Reasoning</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Recovery Probability</span>
                <span className="text-emerald-700 font-extrabold text-base">{(detail.recovery_probability * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${detail.recovery_probability * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600 font-semibold">Expected Recovery Value</span>
                <span className="text-emerald-700 font-bold">₹{detail.expected_recovery.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-500 block font-semibold">Recommended Recovery Action</span>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold">
                {detail.recommended_action}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-500 block font-semibold">Governance Policy Rule</span>
              <p className="text-slate-700 font-medium text-xs">
                {detail.amount >= 1000 ? "Requires explicit Human Approval before automated execution." : "Automatic simulated execution permitted by policy."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
