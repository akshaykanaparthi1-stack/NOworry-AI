"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { fetchApi } from "@/lib/api";

export default function RecoveryActionsPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActions() {
      try {
        const res = await fetchApi<any[]>("/actions");
        setActions(res);
      } catch (err) {
        console.error("Actions fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadActions();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recovery Actions Engine</h2>
          <p className="text-sm text-slate-500 mt-1">Audit of simulated recovery action executions and payload responses.</p>
        </div>

        {/* Actions grid */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Action ID</th>
                  <th className="py-3.5 px-4">Action Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4">Amount Recovered</th>
                  <th className="py-3.5 px-4">Executed At</th>
                  <th className="py-3.5 px-4">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">Loading recovery actions...</td>
                  </tr>
                ) : actions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">No simulated actions executed yet. Run an agent workflow to generate actions.</td>
                  </tr>
                ) : actions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{act.id.slice(0, 8)}...</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600 font-mono text-[11px]">{act.action_type}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        act.status === "SUCCESS" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800"
                      }`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-700 text-[10px]">
                      {act.execution_mode}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">
                      ₹{(act.result_payload?.amount_recovered || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(act.executed_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                      {act.result_payload?.message || "Action executed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
