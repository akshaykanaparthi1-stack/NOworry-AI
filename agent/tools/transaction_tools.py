from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.transaction import Transaction

def get_transaction_details(db: Session, transaction_id: str) -> Dict[str, Any]:
    """
    Retrieves full transaction details by ID or transaction code (e.g. TX-10492).
    """
    tx = db.query(Transaction).filter(
        (Transaction.id == transaction_id) | (Transaction.transaction_code == transaction_id)
    ).first()
    
    if not tx:
        raise ValueError(f"Transaction not found: {transaction_id}")

    return {
        "id": tx.id,
        "transaction_code": tx.transaction_code,
        "customer_id": tx.customer_id,
        "amount": tx.amount,
        "currency": tx.currency,
        "payment_method": tx.payment_method,
        "failure_reason": tx.failure_reason,
        "status": tx.status,
        "days_since_previous_payment": tx.days_since_previous_payment,
        "previous_failures_count": tx.previous_failures_count,
        "created_at": tx.created_at.isoformat() if tx.created_at else None
    }
