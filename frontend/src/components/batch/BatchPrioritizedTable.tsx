"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertOctagon, CheckCircle2, Clock, Zap, UserCheck, AlertTriangle } from "lucide-react";

interface Opportunity {
  id: string;
  transaction_id: string;
  transaction_code: string;
  customer_name: string;
  customer_code: string;
  amount: number;
  failure_reason: string;
  recovery_probability: number;
  expected_recovery: number;
  actual_recovered: number;
  recommended_action: string;
  priority: string;
  status: string;
  attempts_count: number;
  max_attempts: number;
  escalated: boolean;
}

interface BatchPrioritizedTableProps {
  opportunities: Opportunity[];
  onApproveSelected: (selectedIds: string[]) => void;
  loading: boolean;
}

export default function BatchPrioritizedTable({
  opportunities,
  onApproveSelected,
  loading
}: BatchPrioritizedTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const pendingItems = opportunities.filter((o) => o.status === "PENDING_APPROVAL");

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAllPending = () => {
    if (selectedIds.length === pendingItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingItems.map((o) => o.id));
    }
  };

  const filteredOpps = opportunities.filter(
    (o) =>
      o.transaction_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.failure_reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900">Prioritized Recovery Opportunities</h3>
            <span className="px-2 py-0.5 bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-black rounded-none">
              SORTED BY EXPECTED RECOVERY
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Ranked by expected recovery value ($Amount \times Probability$). Enforces safe bounded retries (Max {opportunities[0]?.max_attempts || 3}).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Search code, customer, failure..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-none text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
          />

          {pendingItems.length > 0 && (
            <button
              onClick={() => onApproveSelected(selectedIds.length > 0 ? selectedIds : pendingItems.map((p) => p.id))}
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-none shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>Approve ({selectedIds.length > 0 ? selectedIds.length : pendingItems.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <th className="p-3 w-8">
                {pendingItems.length > 0 && (
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === pendingItems.length}
                    onChange={toggleSelectAllPending}
                    className="rounded-none accent-blue-600 cursor-pointer"
                  />
                )}
              </th>
              <th className="p-3">Rank / Priority</th>
              <th className="p-3">Transaction</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Amount</th>
              <th className="p-3">ML Probability</th>
              <th className="p-3">Expected Recovery</th>
              <th className="p-3">Actual Recovered</th>
              <th className="p-3">Attempts (Max)</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {filteredOpps.map((opp, idx) => (
              <tr
                key={opp.id}
                className={`hover:bg-slate-50 transition ${
                  opp.status === "PENDING_APPROVAL" ? "bg-amber-50/40" : opp.status === "ESCALATED" ? "bg-rose-50/40" : ""
                }`}
              >
                <td className="p-3">
                  {opp.status === "PENDING_APPROVAL" && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(opp.id)}
                      onChange={() => toggleSelect(opp.id)}
                      className="rounded-none accent-blue-600 cursor-pointer"
                    />
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-400 font-bold">#{idx + 1}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-black rounded-none border uppercase ${
                        opp.priority === "HIGH"
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : opp.priority === "MEDIUM"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-slate-100 text-slate-700 border-slate-300"
                      }`}
                    >
                      {opp.priority}
                    </span>
                  </div>
                </td>
                <td className="p-3 font-mono font-bold text-slate-900">
                  {opp.transaction_code}
                  <span className="block text-[10px] font-normal text-slate-500 font-sans truncate max-w-[140px]">
                    {opp.failure_reason}
                  </span>
                </td>
                <td className="p-3 font-bold">
                  {opp.customer_name}
                  <span className="block text-[10px] text-slate-400 font-mono font-normal">{opp.customer_code}</span>
                </td>
                <td className="p-3 font-bold text-slate-900">
                  ₹{opp.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-12 bg-slate-200 h-1.5 rounded-none overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${Math.min(100, opp.recovery_probability * 100)}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-blue-700">{(opp.recovery_probability * 100).toFixed(1)}%</span>
                  </div>
                </td>
                <td className="p-3 font-bold text-blue-700 font-mono">
                  ₹{opp.expected_recovery.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 font-bold font-mono">
                  {opp.actual_recovered > 0 ? (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded-none">
                      ₹{opp.actual_recovered.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  ) : (
                    <span className="text-slate-400">₹0.00</span>
                  )}
                </td>
                <td className="p-3 font-mono text-center font-bold">
                  <span className={opp.attempts_count >= opp.max_attempts ? "text-rose-600" : "text-slate-700"}>
                    {opp.attempts_count} / {opp.max_attempts}
                  </span>
                </td>
                <td className="p-3">
                  {opp.status === "RECOVERED" && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] rounded-none">
                      RECOVERED
                    </span>
                  )}
                  {opp.status === "PENDING_APPROVAL" && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-none flex items-center w-fit space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>APPROVAL REQ</span>
                    </span>
                  )}
                  {opp.status === "ESCALATED" && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[10px] rounded-none flex items-center w-fit space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>ESCALATED</span>
                    </span>
                  )}
                  {opp.status === "FAILED" && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[10px] rounded-none">
                      FAILED (RETRYABLE)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
