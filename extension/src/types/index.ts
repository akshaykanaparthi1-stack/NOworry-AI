export interface DashboardSummary {
  revenue_at_risk: number;
  potentially_recoverable_revenue: number;
  revenue_recovered: number;
  recovery_rate: number;
  total_opportunities: number;
  total_ai_actions: number;
  successful_actions: number;
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

export interface AgentRunResult {
  agent_run_id: string;
  status: string;
  opportunity_id: string;
  transaction_code: string;
  current_step: string;
  logs: Array<{ step: string; status: string; timestamp: string; result: any; explanation: string }>;
  policy?: {
    requires_human_approval: boolean;
    policy_applied: string;
    approval_reason: string;
  };
}

export interface ExtensionSettings {
  backendUrl: string;
  webAppUrl: string;
  notificationsEnabled: boolean;
  demoMode: boolean;
}
