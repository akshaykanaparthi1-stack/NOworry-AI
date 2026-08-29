from typing import Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.audit_log import AuditLog

def create_audit_log(
    db: Session,
    agent_run_id: str,
    transaction_id: str,
    action: str,
    reason: str,
    approval_status: str,
    execution_result: str,
    actor: str = "AI_AGENT"
) -> Dict[str, Any]:
    """
    Records an immutable audit log entry in the database.
    """
    log_entry = AuditLog(
        agent_run_id=agent_run_id,
        transaction_id=transaction_id,
        action=action,
        reason=reason,
        approval_status=approval_status,
        execution_result=execution_result,
        actor=actor,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(log_entry)
    db.commit()

    return {
        "audit_log_id": log_entry.id,
        "agent_run_id": agent_run_id,
        "transaction_id": transaction_id,
        "action": action,
        "reason": reason,
        "approval_status": approval_status,
        "execution_result": execution_result,
        "actor": actor,
        "timestamp": log_entry.timestamp.isoformat()
    }
