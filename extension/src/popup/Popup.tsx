import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, Settings as SettingsIcon, Play, ExternalLink, RefreshCw, Cpu
} from "lucide-react";
import { DashboardSummary, OpportunityItem, AgentRunResult, ExtensionSettings } from "../types";
import { getDashboardSummary, getTopOpportunity, runAgentWorkflow, getSettings } from "../services/api";
import { StepProgress } from "./StepProgress";
import { SettingsModal } from "./SettingsModal";

export const Popup: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [opportunity, setOpportunity] = useState<OpportunityItem | null>(null);
  const [agentResult, setAgentResult] = useState<AgentRunResult | null>(null);
  const [settings, setSettingsState] = useState<ExtensionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [sum, topOpp, setts] = await Promise.all([
        getDashboardSummary(),
        getTopOpportunity(),
        getSettings(),
      ]);
      setSummary(sum);
      setOpportunity(topOpp);
      setSettingsState(setts);
    } catch (err) {
      console.error("Popup load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAgent = async (txCode: string) => {
    setRunningAgent(true);
    try {
      const res = await runAgentWorkflow(txCode, false);
      setAgentResult(res);
      // Reload summary stats
      const sum = await getDashboardSummary();
      setSummary(sum);
    } catch (err: any) {
      alert(`Agent execution error: ${err.message}`);
    } finally {
      setRunningAgent(false);
    }
  };

  const handleOpenDashboard = () => {
    const targetUrl = settings?.webAppUrl || "http://localhost:3000";
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url: `${targetUrl}/dashboard` });
    } else {
      window.open(`${targetUrl}/dashboard`, "_blank");
    }
  };

  return (
    <div className="w-[380px] min-h-[500px] bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      <div>
        {/* Header */}
        <header className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm leading-none">NoWorry AI</h1>
              <p className="text-[10px] text-blue-600 font-bold mt-0.5">Revenue Recovery Agent</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Agent Online
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1 text-slate-400 hover:text-slate-700 transition"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Live Metrics Grid */}
        <div className="p-3 grid grid-cols-3 gap-2">
          <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">At Risk</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              ₹{summary ? summary.revenue_at_risk.toLocaleString('en-IN') : "0"}
            </span>
          </div>

          <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Recoverable</span>
            <span className="text-xs font-bold text-amber-700 block mt-0.5">
              ₹{summary ? summary.potentially_recoverable_revenue.toLocaleString('en-IN') : "0"}
            </span>
          </div>

          <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Recovered</span>
            <span className="text-xs font-bold text-emerald-700 block mt-0.5">
              ₹{summary ? summary.revenue_recovered.toLocaleString('en-IN') : "0"}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-3 space-y-3">
          {/* Active Agent Workflow Execution Visualizer */}
          {agentResult ? (
            <StepProgress agentResult={agentResult} onOpenDashboard={handleOpenDashboard} />
          ) : (
            /* Top Opportunity Card */
            opportunity && (
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Opportunity</span>
                    <span className="text-sm font-bold text-blue-600">{opportunity.transaction_code}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold rounded">
                    {opportunity.priority} PRIORITY
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Customer</span>
                    <span className="font-bold text-slate-900 truncate block">{opportunity.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Amount</span>
                    <span className="font-bold text-slate-900 block">₹{opportunity.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">ML Probability</span>
                    <span className="font-bold text-emerald-700 block">
                      {(opportunity.recovery_probability * 100).toFixed(0)}% High
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Recommended</span>
                    <span className="font-mono text-[10px] font-bold text-slate-800 block truncate">
                      {opportunity.recommended_action}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRunAgent(opportunity.transaction_code)}
                  disabled={runningAgent}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{runningAgent ? "Analyzing with AI..." : "Analyze & Run AI Agent"}</span>
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <footer className="p-3 bg-white border-t border-slate-200 flex items-center justify-between mt-3">
        <button
          onClick={loadData}
          className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>

        <button
          onClick={handleOpenDashboard}
          className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 transition"
        >
          <span>Open Full Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </button>
      </footer>

      {/* Settings Modal */}
      {showSettings && settings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSaved={(newSet) => setSettingsState(newSet)}
        />
      )}
    </div>
  );
};
