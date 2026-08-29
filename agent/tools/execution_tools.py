from typing import Dict, Any
from datetime import datetime, timezone
import random
from sqlalchemy.orm import Session
from backend.app.models.transaction import Transaction
from backend.app.models.opportunity import RecoveryOpportunity
from backend.app.models.action import RecoveryAction

def execute_recovery_action(
    db: Session,
    opportunity_id: str,
    action_type: str,
    transaction_id: str,
    simulation_override_success: bool = True
) -> Dict[str, Any]:
    """
    Executes a SIMULATED recovery action.
    Clearly labeled as SIMULATION environment.
    """
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    opp = db.query(RecoveryOpportunity).filter(RecoveryOpportunity.id == opportunity_id).first()

    if not tx or not opp:
        raise ValueError(f"Transaction or Opportunity not found: tx={transaction_id}, opp={opportunity_id}")

    # Controlled deterministic simulation logic:
    # High recovery probability or simulation override results in SUCCESS
    if simulation_override_success or opp.recovery_probability >= 0.60:
        result_status = "SUCCESS"
        simulated_message = f"Simulated recovery action '{action_type}' executed successfully. Payment authorized."
    else:
        result_status = "FAILED"
        simulated_message = f"Simulated recovery action '{action_type}' failed to recover payment on retry."

    action_record = RecoveryAction(
        opportunity_id=opp.id,
        action_type=action_type,
        status=result_status,
        execution_mode="SIMULATION",
        result_payload={
            "simulation": True,
            "environment": "DEMO_SIMULATION",
            "message": simulated_message,
            "amount_recovered": opp.amount if result_status == "SUCCESS" else 0.0,
            "executed_at": datetime.now(timezone.utc).isoformat()
        }
    )
    db.add(action_record)

    if result_status == "SUCCESS":
        tx.status = "RECOVERED"
        opp.status = "RECOVERED"
    else:
        opp.status = "ESCALATED"

    db.commit()

    return {
        "action_id": action_record.id,
        "action_type": action_type,
        "status": result_status,
        "execution_mode": "SIMULATION",
        "message": simulated_message,
        "amount_recovered": opp.amount if result_status == "SUCCESS" else 0.0
    }

def verify_recovery(db: Session, transaction_id: str) -> Dict[str, Any]:
    """
    Verifies the status of a transaction recovery attempt.
    """
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise ValueError(f"Transaction not found: {transaction_id}")

    is_recovered = (tx.status == "RECOVERED")
    return {
        "transaction_id": tx.id,
        "transaction_code": tx.transaction_code,
        "status": tx.status,
        "is_verified_recovered": is_recovered,
        "verification_time": datetime.now(timezone.utc).isoformat()
    }
