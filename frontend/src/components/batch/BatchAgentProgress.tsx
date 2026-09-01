"use client";

import React from "react";
import { CheckCircle2, Play, AlertCircle, Bot } from "lucide-react";

interface LogEntry {
  step: string;
  status: string;
  timestamp: string;
  summary: string;
  details?: any;
}

interface BatchAgentProgressProps {
  currentStep: string;
  status: string;
  logs: LogEntry[];
  onRunBatch: () => void;
  loading: boolean;
}

const STEPS = [
  "DETECT_BATCH_OPPORTUNITIES",
  "INVESTIGATE_BATCH_TRANSACTIONS",
  "RETRIEVE_CUSTOMER_HISTORIES",
  "ANALYZE_FAILURE_REASONS",
  "PREDICT_BATCH_RECOVERIES",
  "CALCULATE_EXPECTED_RECOVERIES",
  "PRIORITIZE_BATCH_OPPORTUNITIES",
  "APPLY_POLICY_CHECKS",
  "EXECUTE_BOUNDED_RECOVERIES",
  "VERIFY_BATCH_RESULTS",
  "CALCULATE_ACTUAL_MONEY_RECOVERED",
  "CREATE_BATCH_AUDIT_LOGS"
];

export default function BatchAgentProgress({
  currentStep,
  status,
  logs,
  onRunBatch,
  loading
}: BatchAgentProgressProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-600 text-white rounded-none">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Autonomous Batch Recovery Engine</h3>
            <p className="text-xs text-slate-500 font-medium">12-Step Batch Workflow Execution & Policy Enforcement</p>
          </div>
        </div>

        <button
          onClick={onRunBatch}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-none shadow-xs transition flex items-center space-x-2 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{loading ? "Executing Batch..." : "Run Batch Workflow"}</span>
        </button>
      </div>

      {/* Steps Visualizer */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-[10px] font-bold">
        {STEPS.map((step, idx) => {
          const isDone = logs.some((l) => l.step === step && l.status === "completed");
          const isCurrent = currentStep === step;

          return (
            <div
              key={step}
              className={`p-2 border rounded-none flex items-center space-x-1.5 ${
                isDone
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : isCurrent
                  ? "bg-blue-50 border-blue-400 text-blue-900 animate-pulse"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              <span className="font-mono text-[9px] opacity-60">{idx + 1}.</span>
              <span className="truncate">{step.replace(/_/g, " ")}</span>
            </div>
          );
        })}
      </div>

      {/* Execution Console Logs */}
      <div className="bg-slate-950 text-slate-200 p-4 rounded-none font-mono text-xs max-h-48 overflow-y-auto space-y-1.5 border border-slate-800">
        {logs.length === 0 ? (
          <span className="text-slate-500 italic">// Ready to execute batch revenue recovery workflow...</span>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-[11px]">
              <span className="text-slate-500 shrink-0">[{log.timestamp.slice(11, 19)}]</span>
              <span className="text-blue-400 font-bold shrink-0">{log.step}:</span>
              <span className="text-slate-300">{log.summary}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
