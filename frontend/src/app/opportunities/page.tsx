"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { fetchApi, OpportunityList } from "@/lib/api";
import { Search, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Link from "next/link";

export default function OpportunitiesPage() {
  const [data, setData] = useState<OpportunityList | null>(null);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [sortBy, setSortBy] = useState("amount");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function loadOpportunities() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: "10",
        sort_by: sortBy,
        order: order,
      });
      if (search) params.append("search", search);
      if (priority) params.append("priority", priority);
      if (status) params.append("status", status);
      if (paymentMethod) params.append("payment_method", paymentMethod);

      const res = await fetchApi<OpportunityList>(`/opportunities?${params.toString()}`);
      setData(res);
    } catch (err) {
      console.error("Opportunities fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOpportunities();
  }, [page, priority, status, paymentMethod, sortBy, order]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadOpportunities();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Revenue Opportunities</h2>
            <p className="text-sm text-slate-500 mt-1">Enterprise data grid of identified revenue leakage events.</p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Transaction ID, Customer, Reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Priority filter */}
            <select
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* Status filter */}
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="DETECTED">Detected</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="RECOVERED">Recovered</option>
              <option value="ESCALATED">Escalated</option>
            </select>

            {/* Payment Method filter */}
            <select
              value={paymentMethod}
              onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="">All Payment Methods</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="UPI">UPI</option>
              <option value="AUTO_DEBIT">Auto Debit</option>
              <option value="NET_BANKING">Net Banking</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Apply Filter
            </button>
          </form>
        </div>

        {/* Data Table */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Failure Reason</th>
                  <th className="py-3.5 px-4">Probability</th>
                  <th className="py-3.5 px-4">Expected Recovery</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Execute</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-500">Loading revenue opportunities...</td>
                  </tr>
                ) : data?.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-blue-600">
                      <Link href={`/opportunities/${item.id}`} className="hover:underline">
                        {item.transaction_code}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-900">
                      <div className="font-bold">{item.customer_name}</div>
                      <div className="text-[10px] text-slate-500">{item.customer_email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 font-bold">₹{item.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px]">{item.payment_method}</td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[200px] truncate">{item.failure_reason}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        item.recovery_probability >= 0.7 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {(item.recovery_probability * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">₹{item.expected_recovery.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px]">{item.recommended_action}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.priority === "HIGH" ? "bg-rose-100 text-rose-800 border border-rose-200" : "bg-slate-100 text-slate-700"
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === "RECOVERED" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/agent?tx=${item.transaction_code}`}
                        className="inline-flex items-center px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition"
                      >
                        <Play className="w-3 h-3 mr-1 fill-current" />
                        Run Agent
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div>
              Showing page <span className="font-bold text-slate-900">{data?.page}</span> of{" "}
              <span className="font-bold text-slate-900">{data?.total_pages}</span> ({data?.total} total records)
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={!data || page >= data.total_pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
