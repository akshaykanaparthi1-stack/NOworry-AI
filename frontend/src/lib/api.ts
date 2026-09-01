function getBaseUrl(): string {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    if (!process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL.includes("localhost")) {
      return "https://noworry-ai-api.onrender.com/api/v1";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  // Attach token from localStorage if available, or fallback role token
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("noworry_auth_token") || localStorage.getItem("token") || "role_token_OPERATOR";
  } else {
    token = "role_token_OPERATOR";
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    ...(options?.headers as Record<string, string> || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (res.status === 401 && typeof window !== "undefined" && !endpoint.includes("/auth/")) {
    localStorage.removeItem("noworry_auth_token");
    localStorage.removeItem("noworry_auth_user");
    window.location.href = "/login";
  }

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

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "ADMIN" | "ANALYST" | "OPERATOR";
  created_at?: string;
}

export interface DashboardSummary {
  revenue_at_risk: number;
  potentially_recoverable_revenue: number;
  revenue_recovered: number;
  recovery_rate: number;
  total_opportunities: number;
  total_ai_actions: number;
  successful_actions: number;
}

export interface DashboardCharts {
  revenue_trend: Array<{ date: string; revenue_at_risk: number; recovered_revenue: number; recovery_rate: number }>;
  leakage_by_reason: Array<{ reason: string; count: number; revenue_at_risk: number }>;
  recovery_actions_distribution: Array<{ action: string; count: number }>;
  recovery_by_segment: Array<{ segment: string; revenue_at_risk: number; opportunity_count: number }>;
}

export interface OpportunityItem {
  id: string;
  transaction_id: string;
  transaction_code: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  payment_method: string;
  failure_reason: string;
  recovery_probability: number;
  expected_recovery: number;
  recommended_action: string;
  priority: string;
  status: string;
  created_at: string;
}

export interface OpportunityList {
  items: OpportunityItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface OpportunityDetail extends OpportunityItem {
  customer_segment: string;
  customer_tenure: number;
  customer_ltv: number;
  customer_success_rate: number;
  agent_run_id?: string;
  agent_run_status?: string;
  agent_logs?: Array<{ step: string; status: string; timestamp: string; result: any; explanation: string }>;
}

export interface AgentRunResult {
  agent_run_id: string;
  status: string;
  opportunity_id: string;
  transaction_code: string;
  current_step: string;
  logs: Array<{ step: string; status: string; timestamp: string; result: any; explanation: string }>;
  policy?: any;
}
