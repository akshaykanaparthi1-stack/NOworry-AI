from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from backend.app.core.db import get_db
from backend.app.core.auth import get_current_user, require_roles
from backend.app.models.action import RecoveryAction
from backend.app.models.opportunity import RecoveryOpportunity
from backend.app.models.profile import Profile
from agent.tools.execution_tools import execute_recovery_action

router = APIRouter()

class ExecuteActionRequest(BaseModel):
    opportunity_id: str
    action_type: str
    transaction_id: str

@router.get("", response_model=List[Dict[str, Any]])
def list_recovery_actions(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """
    Returns history of simulated recovery actions executed.
    Requires authentication.
    """
    actions = db.query(RecoveryAction, RecoveryOpportunity)\
        .join(RecoveryOpportunity, RecoveryAction.opportunity_id == RecoveryOpportunity.id)\
        .order_by(RecoveryAction.executed_at.desc()).all()

    res = []
    for act, opp in actions:
        res.append({
            "id": act.id,
            "opportunity_id": opp.id,
            "transaction_id": opp.transaction_id,
            "action_type": act.action_type,
            "status": act.status,
            "execution_mode": act.execution_mode,
            "amount": opp.amount,
            "result_payload": act.result_payload,
            "executed_at": act.executed_at.isoformat() if act.executed_at else ""
        })

    return res

@router.post("/execute", response_model=Dict[str, Any])
def execute_action_manual(
    req: ExecuteActionRequest,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(require_roles(["ADMIN", "OPERATOR"]))
):
    """
    Executes a manual recovery action.
    Requires ADMIN or OPERATOR role.
    """
    result = execute_recovery_action(
        db=db,
        opportunity_id=req.opportunity_id,
        action_type=req.action_type,
        transaction_id=req.transaction_id,
        simulation_override_success=True
    )
    return result
