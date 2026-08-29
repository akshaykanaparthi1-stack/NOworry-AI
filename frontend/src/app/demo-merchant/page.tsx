"use client";

import AppLayout from "@/components/layout/AppLayout";
import { CreditCard, AlertOctagon, User, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function DemoMerchantPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
              CONTROLLED DEMO PAGE
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Merchant Payment Operations Portal</h2>
            <p className="text-sm text-slate-500">Controlled demonstration page for testing NoWorry AI browser extension content script integration.</p>
          </div>
          <Link href="/dashboard" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            ← Back to Main Dashboard
          </Link>
        </div>

        {/* Failed Transaction Card */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Transaction TX-10492</h3>
                <p className="text-xs text-rose-600 font-bold">Status: Failed Authorization</p>
              </div>
            </div>

            <span className="text-2xl font-extrabold text-slate-900">₹9,999.00</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block">Customer Name</span>
              <span className="text-slate-900 font-bold text-sm">Acme Global Solutions</span>
              <span className="text-[10px] text-slate-500 block">finance@acmeglobal.com</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block">Payment Method</span>
              <span className="text-slate-900 font-bold font-mono text-sm">CREDIT_CARD (VISA ending 4920)</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 col-span-2">
              <span className="text-slate-500 font-semibold block">Failure Diagnostics</span>
              <span className="text-rose-700 font-bold">Temporary payment authorization failure</span>
              <p className="text-[11px] text-slate-600 mt-1">
                Bank decline code: AUTH_TIMEOUT. Transaction failed during automated subscription billing retry cycle.
              </p>
            </div>
          </div>

          {/* Target container for Browser Extension Content Script Button */}
          <div id="noworry-demo-container" className="pt-2 border-t border-slate-200">
            {/* The Extension Content Script automatically injects the '⚡ Analyze with NoWorry AI (Extension)' button here */}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
