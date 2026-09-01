"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import BatchOverviewCards from "@/components/batch/BatchOverviewCards";
import BatchPrioritizedTable from "@/components/batch/BatchPrioritizedTable";
import BatchAgentProgress from "@/components/batch/BatchAgentProgress";
import BatchAuditLogs from "@/components/batch/BatchAuditLogs";
import BatchAnalyticsCharts from "@/components/batch/BatchAnalyticsCharts";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function BatchRecoveryPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [batchDetails, setBatchDetails] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seedAndLoadDemoBatch = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Seed 100-Tx Demo Batch
      const seedData = await fetchApi<any>("/batch/seed-demo", { method: "POST" });
      const batchId = seedData.batch_id;

      // 2. Fetch batch details, opportunities, and audit logs
      await loadBatchDetails(batchId);
    } catch (err: any) {
      setError(err.message || "An error occurred while seeding demo batch.");
    } finally {
      setLoading(false);
    }
  };

  const loadBatchDetails = async (batchId: string) => {
    try {
      // Details
      const bData = await fetchApi<any>(`/batch/${batchId}`);
      setBatchDetails(bData);

      // Opportunities
      const oData = await fetchApi<any[]>(`/batch/${batchId}/opportunities`);
      setOpportunities(oData);

      // Audit
      const aData = await fetchApi<any[]>(`/batch/${batchId}/audit`);
      setAuditLogs(aData);

      // Global Metrics
      const mData = await fetchApi<any>("/batch/metrics");
      setMetrics(mData);
    } catch (err: any) {
      console.error("Error loading batch details:", err);
    }
  };

  const handleRunBatchWorkflow = async () => {
    if (!batchDetails) {
      await seedAndLoadDemoBatch();
      return;
    }

    setLoading(true);
    try {
      await fetchApi<any>(`/batch/${batchDetails.id}/run`, {
        method: "POST",
        body: JSON.stringify({})
      });
      await loadBatchDetails(batchDetails.id);
    } catch (err: any) {
      setError(err.message || "Failed to execute batch recovery workflow.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSelected = async (approvedOpportunityIds: string[]) => {
    if (!batchDetails || approvedOpportunityIds.length === 0) return;

    setLoading(true);
    try {
      await fetchApi<any>(`/batch/${batchDetails.id}/approve`, {
        method: "POST",
        body: JSON.stringify({
          approved_opportunity_ids: approvedOpportunityIds,
          approved: true
        })
      });
      await loadBatchDetails(batchDetails.id);
    } catch (err: any) {
      setError(err.message || "Failed to approve selected batch opportunities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    seedAndLoadDemoBatch();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-none bg-blue-600 text-white text-xs font-black uppercase tracking-wider">
                TRACK 03: AI REVENUE RECOVERY
              </span>
              <span className="px-2 py-0.5 rounded-none bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                ACTIVE BATCH SYSTEM
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Batch Revenue Recovery</h2>
            <p className="text-sm text-slate-500 font-medium">
              Autonomous multi-transaction revenue recovery engine with ML prediction, risk-based prioritization, policy gating, safe bounded retries, and actual money tracking.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={seedAndLoadDemoBatch}
              disabled={loading}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-none shadow-xs transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Seed 100-Tx Demo Batch</span>
            </button>

            <button
              onClick={() => batchDetails && loadBatchDetails(batchDetails.id)}
              className="p-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-none shadow-xs"
              title="Refresh Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-none flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Overview Metrics Cards */}
        <BatchOverviewCards metrics={metrics} />

        {/* 2. Analytics Charts */}
        <BatchAnalyticsCharts metrics={metrics} />

        {/* 3. Batch Agent Progress Visualizer */}
        <BatchAgentProgress
          currentStep={batchDetails?.current_step || "INITIATED"}
          status={batchDetails?.status || "CREATED"}
          logs={batchDetails?.execution_logs || []}
          onRunBatch={handleRunBatchWorkflow}
          loading={loading}
        />

        {/* 4. Prioritized Opportunities Table */}
        <BatchPrioritizedTable
          opportunities={opportunities}
          onApproveSelected={handleApproveSelected}
          loading={loading}
        />

        {/* 5. Batch Audit Logs */}
        <BatchAuditLogs logs={auditLogs} />
      </div>
    </AppLayout>
  );
}
