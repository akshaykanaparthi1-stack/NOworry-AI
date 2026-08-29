import React from "react";
import { Check, Clock, AlertTriangle, ShieldAlert, Cpu } from "lucide-react";
import { AgentRunResult } from "../types";

const WORKFLOW_STEPS = [
  { id: "DETECT_REVENUE_LOSS", label: "Detect Revenue Loss" },
  { id: "INVESTIGATE_TRANSACTION", label: "Investigate Transaction" },
  { id: "RETRIEVE_CUSTOMER_HISTORY", label: "Retrieve Customer History" },
  { id: "ANALYZE_FAILURE", label: "Analyze Failure Reason" },
  { id: "PREDICT_RECOVERY", label: "Predict Recovery (ML Model)" },
  { id: "CALCULATE_EXPECTED_RECOVERY", label: "Calculate Expected Recovery" },
  { id: "SELECT_RECOVERY_ACTION", label: "Select Recovery Action" },
  { id: "CHECK_APPROVAL_POLICY", label: "Check Approval Policy" },
  { id: "EXECUTE_ACTION", label: "Execute Simulated Action" },
  { id: "VERIFY_RECOVERY", label: "Verify Recovery Result" },
  { id: "CREATE_AUDIT_LOG", label: "Create Audit Log" },
];

interface StepProgressProps {
  agentResult: AgentRunResult;
  onOpenDashboard: () => void;
}

export const StepProgress: React.FC<StepProgressProps> = ({ agentResult, onOpenDashboard }) => {
  const getStepLog = (stepId: string) => {
    return agentResult.logs?.find((l) => l.step === stepId);
  };

  const stepPredict = getStepLog("PREDICT_RECOVERY")?.result;
  const stepExpected = getStepLog("CALCULATE_EXPECTED_RECOVERY")?.result;
  const stepAction = getStepLog("SELECT_RECOVERY_ACTION")?.result;

  return (
    <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <span className="font-bold text-slate-900 block">Agent Run Execution</span>
          <span className="text-[9px] font-mono text-slate-400 block truncate max-w-[180px]">Run ID: {agentResult.agent_run_id}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          agentResult.status === "COMPLETED"
            ? "bg-emerald-100 text-emerald-800"
            : agentResult.status === "WAITING_APPROVAL"
            ? "bg-amber-100 text-amber-800"
            : "bg-blue-100 text-blue-800"
        }`}>
          {agentResult.status}
        </span>
      </div>

      {/* Real Model Key Metric Badges */}
      {stepPredict && (
        <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-blue-900 font-semibold">Recovery Probability:</span>
            <span className="text-emerald-700 font-extrabold text-xs">{(stepPredict.probability * 100).toFixed(2)}%</span>
          </div>
          {stepExpected && (
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-blue-900 font-semibold">Expected Recovery:</span>
              <span className="text-blue-950 font-extrabold">₹{stepExpected.expected_recovery?.toLocaleString('en-IN')}</span>
            </div>
          )}
          {stepAction && (
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-blue-900 font-semibold">Selected Action:</span>
              <span className="text-slate-900 font-mono font-bold">{stepAction.recommended_action}</span>
            </div>
          )}
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {WORKFLOW_STEPS.map((step, idx) => {
          const log = getStepLog(step.id);
          const isCompleted = log?.status === "completed";
          const isWaiting = log?.status === "waiting_approval";
          const isFailed = log?.status === "failed";

          return (
            <div key={step.id} className="flex items-start space-x-2 text-[11px]">
              <div className="mt-0.5 shrink-0">
                {isCompleted ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : isWaiting ? (
                  <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300 animate-pulse">
                    <Clock className="w-2.5 h-2.5" />
                  </div>
                ) : isFailed ? (
                  <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-300">
                    <AlertTriangle className="w-2.5 h-2.5" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[9px] font-bold border border-slate-200">
                    {idx + 1}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${isCompleted ? "text-slate-900" : isWaiting ? "text-amber-900" : "text-slate-500"}`}>
                    {step.label}
                  </span>
                </div>
                {log?.explanation && (
                  <p className="text-[10px] text-slate-500 truncate">{log.explanation}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Approval Required Banner */}
      {agentResult.status === "WAITING_APPROVAL" && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-[11px]">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>⚠ Human Approval Required</span>
          </div>
          <p className="text-[10px] text-amber-800 font-medium">
            {agentResult.policy?.approval_reason || "Policy threshold requires approval before recovery execution."}
          </p>
          <button
            onClick={onOpenDashboard}
            className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded transition"
          >
            Open Dashboard to Approve
          </button>
        </div>
      )}
    </div>
  );
};
