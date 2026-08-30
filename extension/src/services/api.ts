import { DashboardSummary, OpportunityList, OpportunityItem, AgentRunResult, ExtensionSettings } from "../types";

export const DEFAULT_SETTINGS: ExtensionSettings = {
  backendUrl: "https://noworry-ai-api.onrender.com/api/v1",
  webAppUrl: "https://noworry-ai.vercel.app",
  notificationsEnabled: true,
  demoMode: true,
};

export async function getSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["backendUrl", "webAppUrl", "notificationsEnabled", "demoMode"], (res) => {
        resolve({
          backendUrl: res.backendUrl || DEFAULT_SETTINGS.backendUrl,
          webAppUrl: res.webAppUrl || DEFAULT_SETTINGS.webAppUrl,
          notificationsEnabled: res.notificationsEnabled !== undefined ? res.notificationsEnabled : DEFAULT_SETTINGS.notificationsEnabled,
          demoMode: res.demoMode !== undefined ? res.demoMode : DEFAULT_SETTINGS.demoMode,
        });
      });
    } else {
      resolve(DEFAULT_SETTINGS);
    }
  });
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(settings, () => resolve());
    } else {
      resolve();
    }
  });
}

export async function extensionFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const settings = await getSettings();
  const url = `${settings.backendUrl}${endpoint}`;
  
  // Retrieve token from extension storage if available
  let token: string | null = null;
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    const storedToken = await new Promise<string | null>((res) => {
      chrome.storage.local.get(["authToken"], (data) => res(data.authToken || null));
    });
    token = storedToken;
  }
  
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    let parsedErr = `API Error ${res.status}`;
    try {
      const jsonErr = JSON.parse(errText);
      parsedErr = jsonErr.detail || parsedErr;
    } catch {
      parsedErr = errText || parsedErr;
    }
    throw new Error(parsedErr);
  }

  return res.json();
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return extensionFetch<DashboardSummary>("/dashboard/summary");
}

export async function getTopOpportunity(): Promise<OpportunityItem | null> {
  const list = await extensionFetch<OpportunityList>("/opportunities?page_size=1&sort_by=amount&order=desc");
  return list.items[0] || null;
}

export async function runAgentWorkflow(transactionCode: string, humanApproved: boolean = false): Promise<AgentRunResult> {
  return extensionFetch<AgentRunResult>("/agent/run", {
    method: "POST",
    body: JSON.stringify({
      transaction_code_or_id: transactionCode,
      human_approved: humanApproved,
    }),
  });
}

export async function approveAgentWorkflow(agentRunId: string, approved: boolean): Promise<AgentRunResult> {
  return extensionFetch<AgentRunResult>("/agent/approve", {
    method: "POST",
    body: JSON.stringify({
      agent_run_id: agentRunId,
      approved: approved,
    }),
  });
}
