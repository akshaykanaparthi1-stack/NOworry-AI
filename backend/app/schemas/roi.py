from pydantic import BaseModel

class ROICalculatorRequest(BaseModel):
    monthly_transactions: int = 10000
    avg_transaction_value: float = 2500.0
    failure_rate_percent: float = 8.5
    current_recovery_rate_percent: float = 15.0
    projected_ai_recovery_rate_percent: float = 65.0

class ROICalculatorResponse(BaseModel):
    monthly_revenue: float
    revenue_at_risk: float
    current_recovered_revenue: float
    projected_recovered_revenue: float
    additional_monthly_revenue: float
    annualized_revenue_impact: float
    roi_multiplier: float
