"use client";

import React from "react";
import { FileText, ShieldCheck, User, Bot, AlertTriangle } from "lucide-react";

interface AuditEntry {
  id: string;
  transaction_id: string;
  action: string;
  reason: string;
  ml_probability: number;
  expected_recovery: number;
  actual_recovered_amount: number;
  policy_decision: string;
  approval_status: string;
  execution_result: string;
  escalation_status: string;
  actor: string;
  user_email?: string;
  timestamp: string;
}

interface BatchAuditLogsProps {
  logs: AuditEntry[];
}

export default function BatchAuditLogs({ logs }: BatchAuditLogsProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Batch Audit Trail & Governance Logs</h3>
        </div>
        <span className="text-xs text-slate-500 font-semibold">{logs.length} Immutable Log Entries</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Action</th>
              <th className="p-3">ML Prob</th>
              <th className="p-3">Expected</th>
              <th className="p-3">Actual Recovered</th>
              <th className="p-3">Policy / Governance</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                  No audit logs recorded for this batch yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp ? log.timestamp.replace("T", " ").slice(0, 19) : "N/A"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-1.5 py-0.5 rounded-none font-bold text-[10px] border flex items-center w-fit space-x-1 ${
                        log.actor === "HUMAN_OPERATOR"
                          ? "bg-blue-50 text-blue-800 border-blue-300"
                          : "bg-slate-100 text-slate-800 border-slate-300"
                      }`}
                    >
                      {log.actor === "HUMAN_OPERATOR" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      <span>{log.actor}</span>
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900">{log.action}</td>
                  <td className="p-3 font-mono font-bold text-blue-700">
                    {(log.ml_probability * 100).toFixed(1)}%
                  </td>
                  <td className="p-3 font-mono font-bold">
                    ₹{log.expected_recovery.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 font-mono font-bold">
                    {log.actual_recovered_amount > 0 ? (
                      <span className="text-emerald-700">
                        ₹{log.actual_recovered_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-slate-400">₹0.00</span>
                    )}
                  </td>
                  <td className="p-3 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">{log.policy_decision}</span>
                    <span className="block text-[10px] text-slate-400 truncate max-w-xs">{log.reason}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 font-bold text-[10px] rounded-none border ${
                        log.execution_result === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : log.escalation_status === "ESCALATED"
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : "bg-slate-100 text-slate-700 border-slate-300"
                      }`}
                    >
                      {log.execution_result}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
