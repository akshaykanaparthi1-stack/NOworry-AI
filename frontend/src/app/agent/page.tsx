"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { fetchApi, AgentRunResult } from "@/lib/api";
import { 
  Bot, Clock, ShieldAlert, AlertTriangle, Play, UserCheck, Check, FileText, Cpu, CheckCircle2, ShieldCheck, Database, ArrowRight
} from "lucide-react";

const PIPELINE_PHASES = [
  "DETECT",
  "INVESTIGATE",
  "PREDICT",
  "DECIDE",
  "ACT",
  "VERIFY",
  "AUDIT"
];

const WORKFLOW_STEPS = [
  { id: "DETECT_REVENUE_LOSS", label: "Detect Revenue Loss", phase: "DETECT", desc: "Identify transaction failure & revenue at risk" },
  { id: "INVESTIGATE_TRANSACTION", label: "Investigate Transaction", phase: "INVESTIGATE", desc: "Retrieve transaction metadata & gateway status" },
  { id: "RETRIEVE_CUSTOMER_HISTORY", label: "Retrieve Customer History", phase: "INVESTIGATE", desc: "Fetch tenure, LTV, success rate & prior failures" },
  { id: "ANALYZE_FAILURE", label: "Analyze Failure Reason", phase: "INVESTIGATE", desc: "Diagnose root cause category & recoverability" },
  { id: "PREDICT_RECOVERY", label: "Predict Recovery (ML Model)", phase: "PREDICT", desc: "Invoke Scikit-learn GradientBoosting model" },
  { id: "CALCULATE_EXPECTED_RECOVERY", label: "Calculate Expected Recovery", phase: "PREDICT", desc: "Compute probability-adjusted recoverable value" },
  { id: "SELECT_RECOVERY_ACTION", label: "Select Recovery Action", phase: "DECIDE", desc: "Determine optimal strategy (Retry / Reminder / Update)" },
  { id: "CHECK_APPROVAL_POLICY", label: "Check Approval Policy", phase: "DECIDE", desc: "Apply enterprise governance rules (Auto vs Human)" },
  { id: "EXECUTE_ACTION", label: "Execute Simulated Action", phase: "ACT", desc: "Trigger sandboxed recovery attempt" },
  { id: "VERIFY_RECOVERY", label: "Verify Recovery Result", phase: "VERIFY", desc: "Verify transaction resolution status" },
  { id: "CREATE_AUDIT_LOG", label: "Create Audit Log", phase: "AUDIT", desc: "Write immutable execution audit record" },
];

function AgentPageContent() {
  const searchParams = useSearchParams();
  const txCodeParam = searchParams.get("tx") || "TX-10492";

  const [txCode, setTxCode] = useState(txCodeParam);
  const [agentResult, setAgentResult] = useState<AgentRunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [approving, setApproving] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

  const runWorkflow = async (humanApproved: boolean = false) => {
    setRunning(true);
    try {
      const res = await fetchApi<AgentRunResult>("/agent/run", {
        method: "POST",
        body: JSON.stringify({
          transaction_code_or_id: txCode,
          human_approved: humanApproved,
        }),
      });
      setAgentResult(res);
    } catch (err: any) {
      alert(`Agent execution error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleApprove = async (approved: boolean) => {
    if (!agentResult) return;
    setApproving(true);
    try {
      const res = await fetchApi<AgentRunResult>("/agent/approve", {
        method: "POST",
        body: JSON.stringify({
          agent_run_id: agentResult.agent_run_id,
          approved: approved,
        }),
      });
      setAgentResult(res);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setApproving(false);
    }
  };

  useEffect(() => {
    if (txCodeParam) {
      runWorkflow(false);
    }
  }, [txCodeParam]);

  const getStepLog = (stepId: string) => {
    if (!agentResult?.logs) return null;
    return agentResult.logs.find((l) => l.step === stepId);
  };

  const stepInvestigate = getStepLog("INVESTIGATE_TRANSACTION")?.result;
  const stepCustomer = getStepLog("RETRIEVE_CUSTOMER_HISTORY")?.result;
  const stepFailure = getStepLog("ANALYZE_FAILURE")?.result;
  const stepPredict = getStepLog("PREDICT_RECOVERY")?.result;
  const stepExpected = getStepLog("CALCULATE_EXPECTED_RECOVERY")?.result;
  const stepAction = getStepLog("SELECT_RECOVERY_ACTION")?.result;
  const stepPolicy = getStepLog("CHECK_APPROVAL_POLICY")?.result;
  const stepExec = getStepLog("EXECUTE_ACTION")?.result;
  const stepVerify = getStepLog("VERIFY_RECOVERY")?.result;
  const stepAudit = getStepLog("CREATE_AUDIT_LOG")?.result;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Bot className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Autonomous AI Recovery Agent</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Multi-step structured agent engine executing real tool calling, ML predictions, policy validation, and audit logging.
          </p>
        </div>

        {/* Transaction input selector */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={txCode}
            onChange={(e) => setTxCode(e.target.value)}
            placeholder="e.g. TX-10492"
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold w-36 shadow-xs"
          />
          <button
            onClick={() => runWorkflow(false)}
            disabled={running}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
            {running ? "Executing Workflow..." : "Run Agent"}
          </button>
        </div>
      </div>

      {/* Primary Pipeline Header Bar: DETECT -> INVESTIGATE -> PREDICT -> DECIDE -> ACT -> VERIFY -> AUDIT */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
          Agent Execution Pipeline Phases
        </span>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {PIPELINE_PHASES.map((phase, i) => (
            <div key={phase} className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-md text-xs font-black tracking-wider border ${
                agentResult?.status === "COMPLETED"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : agentResult?.status === "WAITING_APPROVAL" && (phase === "ACT" || phase === "VERIFY" || phase === "AUDIT")
                  ? "bg-slate-100 text-slate-400 border-slate-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
              }`}>
                {phase}
              </div>
              {i < PIPELINE_PHASES.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Human Approval Gating Banner */}
      {agentResult?.status === "WAITING_APPROVAL" && (
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-300 shadow-sm flex flex-wrap items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">⚠ Human Operator Approval Required</h4>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">
                {agentResult.policy?.approval_reason || "Transaction policy requires operator sign-off before proceeding with simulated recovery action."}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleApprove(false)}
              disabled={approving}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition"
            >
              Reject & Escalate
            </button>
            <button
              onClick={() => handleApprove(true)}
              disabled={approving}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center"
            >
              <UserCheck className="w-4 h-4 mr-1.5" />
              Approve & Resume Agent
            </button>
          </div>
        </div>
      )}

      {/* Actual Execution Progress & Real Values Panel */}
      {agentResult && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Actual Tool Execution Output</h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              Agent Run ID: <span className="text-blue-600 font-bold">{agentResult.agent_run_id}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* 1. Transaction Retrieved */}
            {stepInvestigate && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  <span>✓ Transaction Retrieved</span>
                </div>
                <p className="text-slate-900 font-extrabold font-mono text-xs">{stepInvestigate.transaction_code}</p>
                <p className="text-slate-500 font-medium">Amount: ₹{stepInvestigate.amount?.toLocaleString('en-IN')} | Method: {stepInvestigate.payment_method}</p>
              </div>
            )}

            {/* 2. Customer History Retrieved */}
            {stepCustomer && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  <span>✓ Customer History Retrieved</span>
                </div>
                <p className="text-slate-900 font-extrabold">{stepCustomer.name}</p>
                <p className="text-slate-500 font-medium">Tenure: {stepCustomer.tenure_months}m | LTV: ₹{stepCustomer.lifetime_value?.toLocaleString('en-IN')} | Success: {(stepCustomer.historical_success_rate * 100).toFixed(0)}%</p>
              </div>
            )}

            {/* 3. Failure Analyzed */}
            {stepFailure && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  <span>✓ Failure Analyzed</span>
                </div>
                <p className="text-slate-900 font-extrabold">{stepFailure.category}</p>
                <p className="text-slate-500 font-medium truncate">{stepFailure.root_cause_explanation}</p>
              </div>
            )}

            {/* 4. ML Prediction Complete */}
            {stepPredict && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 space-y-1">
                <div className="flex items-center text-blue-800 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  <span>✓ ML Prediction Complete</span>
                </div>
                <p className="text-blue-950 font-black text-sm">
                  Recovery Probability: <span className="text-emerald-700 font-black">{(stepPredict.probability * 100).toFixed(2)}%</span>
                </p>
                <p className="text-blue-700 font-semibold text-[11px]">Confidence: {(stepPredict.confidence * 100).toFixed(1)}%</p>
              </div>
            )}

            {/* 5. Expected Recovery Calculated */}
            {stepExpected && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="flex items-center text-emerald-800 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span>✓ Expected Recovery Calculated</span>
                </div>
                <p className="text-emerald-950 font-black text-sm">
                  Expected Recovery: <span className="text-emerald-800 font-black">₹{stepExpected.expected_recovery?.toLocaleString('en-IN')}</span>
                </p>
                <p className="text-emerald-700 font-medium text-[11px]">Formula: Amount (₹{stepExpected.transaction_amount?.toLocaleString('en-IN')}) × Probability</p>
              </div>
            )}

            {/* 6. Action Selected */}
            {stepAction && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  <span>✓ Action Selected</span>
                </div>
                <p className="text-slate-900 font-extrabold font-mono">{stepAction.recommended_action}</p>
                <p className="text-slate-500 font-medium truncate">{stepAction.rationale}</p>
              </div>
            )}

            {/* 7. Policy Checked */}
            {stepPolicy && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                <div className="flex items-center text-amber-800 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  <span>✓ Policy Checked</span>
                </div>
                <p className="text-amber-900 font-extrabold">{stepPolicy.policy_applied || "Standard Policy"}</p>
                <p className="text-amber-700 font-medium text-[11px] truncate">{stepPolicy.approval_reason}</p>
              </div>
            )}

            {/* 8. Simulated Recovery Executed */}
            {stepExec && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  <span>✓ Simulated Recovery Executed</span>
                </div>
                <p className="text-slate-900 font-extrabold">Status: {stepExec.status}</p>
                <p className="text-slate-500 font-medium">Recovered: ₹{stepExec.amount_recovered?.toLocaleString('en-IN')} (Mode: {stepExec.execution_mode})</p>
              </div>
            )}

            {/* 9. Recovery Verified & Audit Log */}
            {stepAudit && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center text-emerald-700 font-bold">
                  <Database className="w-3.5 h-3.5 mr-1" />
                  <span>✓ Audit Log Created</span>
                </div>
                <p className="text-slate-900 font-extrabold font-mono text-[11px] truncate">Audit ID: {stepAudit.audit_log_id}</p>
                <p className="text-slate-500 font-medium">Actor: {stepAudit.actor} | Status: {stepAudit.execution_result}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workflow Visual Stepper Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stepper List */}
        <div className="lg:col-span-7 space-y-3">
          {WORKFLOW_STEPS.map((step, idx) => {
            const log = getStepLog(step.id);
            const isCompleted = log?.status === "completed";
            const isWaiting = log?.status === "waiting_approval";
            const isFailed = log?.status === "failed";
            const isSelected = selectedStepIndex === idx;

            return (
              <div
                key={step.id}
                onClick={() => setSelectedStepIndex(idx)}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between ${
                  isSelected
                    ? "bg-blue-50/80 border-blue-500 shadow-sm"
                    : isWaiting
                    ? "bg-amber-50 border-amber-300"
                    : isCompleted
                    ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                    : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon Status */}
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : isWaiting ? (
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    ) : isFailed ? (
                      <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold border border-slate-300">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-xs">{step.label}</h4>
                      {isWaiting && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-900">
                          Gated
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{log?.explanation || step.desc}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isCompleted ? "text-emerald-700 bg-emerald-50" : isWaiting ? "text-amber-700 bg-amber-50" : isFailed ? "text-rose-700 bg-rose-50" : "text-slate-400"
                  }`}>
                    {log?.status || "Pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Step Output Details & Logs */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4 sticky top-20 h-fit">
          <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm border-b border-slate-200 pb-3">
            <FileText className="w-4 h-4" />
            <span>Tool Execution Payload</span>
          </div>

          {selectedStepIndex !== null && WORKFLOW_STEPS[selectedStepIndex] ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block font-semibold">Step Name</span>
                <span className="text-slate-900 font-bold">{WORKFLOW_STEPS[selectedStepIndex].label}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Step Description</span>
                <span className="text-slate-700 font-medium">{WORKFLOW_STEPS[selectedStepIndex].desc}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold mb-1">Result Payload JSON</span>
                <pre className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-64 shadow-inner">
                  {JSON.stringify(getStepLog(WORKFLOW_STEPS[selectedStepIndex].id)?.result || { status: "Pending execution" }, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              Click any workflow step on the left to inspect its tool output and raw payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgentPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading AI Agent interface...</div>}>
        <AgentPageContent />
      </Suspense>
    </AppLayout>
  );
}
