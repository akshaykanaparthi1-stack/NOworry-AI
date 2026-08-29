from pydantic import BaseModel
from typing import List, Optional, Any

class AgentRunRequest(BaseModel):
    transaction_code_or_id: str
    human_approved: bool = False

class AgentRunResponse(BaseModel):
    agent_run_id: str
    status: str
    opportunity_id: str
    transaction_code: str
    current_step: str
    logs: List[dict]
    policy: Optional[dict] = None

class HumanApprovalRequest(BaseModel):
    agent_run_id: str
    approved: bool
    comments: Optional[str] = None
