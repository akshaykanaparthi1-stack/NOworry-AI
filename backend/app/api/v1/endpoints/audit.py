from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.db import get_db
from backend.app.models.audit_log import AuditLog
from backend.app.models.transaction import Transaction
from backend.app.models.customer import Customer
from backend.app.schemas.audit import AuditLogListResponse, AuditLogItemResponse

router = APIRouter()

@router.get("", response_model=AuditLogListResponse)
def list_audit_logs(
    search: str = None,
    db: Session = Depends(get_db)
):
    """
    Returns complete immutable audit trail of all agent actions and human decisions.
    """
    query = db.query(AuditLog, Transaction, Customer)\
        .join(Transaction, AuditLog.transaction_id == Transaction.id)\
        .join(Customer, Transaction.customer_id == Customer.id)\
        .order_by(AuditLog.timestamp.desc())

    if search:
        s_fmt = f"%{search}%"
        query = query.filter(
            (Transaction.transaction_code.ilike(s_fmt)) |
            (Customer.name.ilike(s_fmt)) |
            (AuditLog.action.ilike(s_fmt))
        )

    results = query.all()

    items = []
    for log, tx, cust in results:
        items.append(AuditLogItemResponse(
            id=log.id,
            agent_run_id=log.agent_run_id,
            transaction_id=log.transaction_id,
            transaction_code=tx.transaction_code,
            customer_name=cust.name,
            action=log.action,
            reason=log.reason,
            approval_status=log.approval_status,
            execution_result=log.execution_result,
            actor=log.actor,
            timestamp=log.timestamp.isoformat() if log.timestamp else ""
        ))

    return AuditLogListResponse(items=items, total=len(items))
