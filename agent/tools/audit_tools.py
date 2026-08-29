from typing import Dict, Any, Optional
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
    actor: str = "AI_AGENT",
    user_id: Optional[str] = None,
    user_email: Optional[str] = None,
    user_role: Optional[str] = None
) -> Dict[str, Any]:
    """
    Records an immutable audit log entry in the database with optional authenticated user tracking.
    """
    log_entry = AuditLog(
        agent_run_id=agent_run_id,
        transaction_id=transaction_id,
        action=action,
        reason=reason,
        approval_status=approval_status,
        execution_result=execution_result,
        actor=actor,
        user_id=user_id,
        user_email=user_email,
        user_role=user_role,
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
        "user_id": user_id,
        "user_email": user_email,
        "user_role": user_role,
        "timestamp": log_entry.timestamp.isoformat()
    }
