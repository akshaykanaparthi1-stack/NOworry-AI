"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Shield, Cpu } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Configuration</h2>
          <p className="text-sm text-slate-500 mt-1">Configure business rules, model parameters, and governance approval thresholds.</p>
        </div>

        <div className="space-y-6">
          {/* Governance Policies */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm border-b border-slate-200 pb-3">
              <Shield className="w-4 h-4" />
              <span>Governance Approval Policies</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Auto-Execution Policy (&lt; ₹1,000)</span>
                  <span className="text-slate-600">Automated recovery execution permitted if ML probability &ge; 70%.</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">ACTIVE</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Human Approval Bracket (₹1,000 – ₹10,000)</span>
                  <span className="text-slate-600">Requires explicit sign-off from human operator before action.</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-bold">REQUIRED</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Mandatory Review Threshold (&gt; ₹10,000)</span>
                  <span className="text-slate-600">Mandatory human review for high-value revenue recovery.</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 font-bold">MANDATORY</span>
              </div>
            </div>
          </div>

          {/* Model Configuration */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm border-b border-slate-200 pb-3">
              <Cpu className="w-4 h-4" />
              <span>Machine Learning & Agent Engine Configuration</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-semibold">Active Classification Model</span>
                <span className="text-slate-900 font-bold text-sm">RandomForest (Scikit-Learn)</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-semibold">LLM Engine Abstraction</span>
                <span className="text-emerald-700 font-bold text-sm">Deterministic Rule Fallback</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-semibold">Synthetic Training Dataset</span>
                <span className="text-slate-900 font-bold text-sm">50,000 Records</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-semibold">Simulation Mode</span>
                <span className="text-amber-700 font-bold text-sm">ENABLED (Sandbox)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
