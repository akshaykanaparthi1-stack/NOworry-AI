from pydantic import BaseModel
from typing import List, Optional

class AuditLogItemResponse(BaseModel):
    id: str
    agent_run_id: str
    transaction_id: str
    transaction_code: str
    customer_name: str
    action: str
    reason: str
    approval_status: str
    execution_result: str
    actor: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    user_role: Optional[str] = None
    timestamp: str

class AuditLogListResponse(BaseModel):
    items: List[AuditLogItemResponse]
    total: int
