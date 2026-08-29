from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OpportunityItemResponse(BaseModel):
    id: str
    transaction_id: str
    transaction_code: str
    customer_id: str
    customer_name: str
    customer_email: str
    amount: float
    payment_method: str
    failure_reason: str
    recovery_probability: float
    expected_recovery: float
    recommended_action: str
    priority: str
    status: str
    created_at: str

class OpportunityListResponse(BaseModel):
    items: List[OpportunityItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class OpportunityDetailResponse(OpportunityItemResponse):
    customer_segment: str
    customer_tenure: int
    customer_ltv: float
    customer_success_rate: float
    agent_run_id: Optional[str] = None
    agent_run_status: Optional[str] = None
    agent_logs: Optional[List[dict]] = None
