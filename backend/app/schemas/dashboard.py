from pydantic import BaseModel
from typing import List, Dict, Any

class DashboardSummaryResponse(BaseModel):
    revenue_at_risk: float
    potentially_recoverable_revenue: float
    revenue_recovered: float
    recovery_rate: float
    total_opportunities: int
    total_ai_actions: int
    successful_actions: int

class TrendChartPoint(BaseModel):
    date: str
    revenue_at_risk: float
    recovered_revenue: float
    recovery_rate: float

class DashboardChartsResponse(BaseModel):
    revenue_trend: List[TrendChartPoint]
    leakage_by_reason: List[Dict[str, Any]]
    recovery_actions_distribution: List[Dict[str, Any]]
    recovery_by_segment: List[Dict[str, Any]]
