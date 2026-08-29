const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error ${res.status}: ${errText}`);
  }

  return res.json();
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
