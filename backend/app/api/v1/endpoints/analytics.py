from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any

from backend.app.core.db import get_db
from backend.app.models.opportunity import RecoveryOpportunity
from backend.app.models.transaction import Transaction
from backend.app.models.customer import Customer
from backend.app.models.action import RecoveryAction

router = APIRouter()

@router.get("/metrics", response_model=Dict[str, Any])
def get_analytics_metrics(db: Session = Depends(get_db)):
    """
    Detailed analytics breakdown across failure reasons, payment methods, customer segments, and ML recovery accuracy.
    """
    # 1. Total KPI totals
    total_at_risk = db.query(func.sum(RecoveryOpportunity.amount)).scalar() or 0.0
    total_recovered = db.query(func.sum(RecoveryOpportunity.amount)).filter(RecoveryOpportunity.status == "RECOVERED").scalar() or 0.0
    avg_recovery_val = db.query(func.avg(RecoveryOpportunity.amount)).filter(RecoveryOpportunity.status == "RECOVERED").scalar() or 0.0

    # 2. Payment Method efficiency
    pm_stats = db.query(
        Transaction.payment_method,
        func.count(Transaction.id),
        func.sum(Transaction.amount)
    ).group_by(Transaction.payment_method).all()

    by_payment_method = [
        {"method": r[0], "count": r[1], "revenue": round(r[2] or 0.0, 2)} for r in pm_stats
    ]

    # 3. Failure Reason analysis
    fr_stats = db.query(
        RecoveryOpportunity.failure_reason,
        func.count(RecoveryOpportunity.id),
        func.sum(RecoveryOpportunity.expected_recovery)
    ).group_by(RecoveryOpportunity.failure_reason).all()

    by_failure_reason = [
        {"reason": r[0], "count": r[1], "expected_recovery": round(r[2] or 0.0, 2)} for r in fr_stats
    ]

    return {
        "revenue_at_risk": round(total_at_risk, 2),
        "total_recovered": round(total_recovered, 2),
        "avg_recovery_value": round(avg_recovery_val, 2),
        "overall_recovery_rate": round((total_recovered / total_at_risk * 100.0) if total_at_risk > 0 else 0.0, 1),
        "by_payment_method": by_payment_method,
        "by_failure_reason": by_failure_reason
    }
