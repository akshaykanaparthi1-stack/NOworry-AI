from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.app.core.db import get_db
from backend.app.models.action import RecoveryAction
from backend.app.models.opportunity import RecoveryOpportunity

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
def list_recovery_actions(db: Session = Depends(get_db)):
    """
    Returns history of simulated recovery actions executed.
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
