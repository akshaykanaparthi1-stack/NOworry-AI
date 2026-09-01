from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.core.db import get_db
from backend.app.core.auth import get_current_user, require_roles
from backend.app.models import Profile, BatchRun, RecoveryOpportunity, Transaction, AuditLog, Customer
from agent.batch_engine import BatchAgentEngine
from data.seed_batch_recovery import seed_100_transaction_batch

router = APIRouter()

# --- Request / Response Schemas ---

class CreateBatchRequest(BaseModel):
    name: Optional[str] = "Batch Revenue Recovery Run"
    transaction_ids: Optional[List[str]] = None
    limit: Optional[int] = 100

class ApproveBatchItemsRequest(BaseModel):
    approved_opportunity_ids: List[str]
    approved: bool = True

class OpportunityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    transaction_id: str
    transaction_code: str
    customer_name: str
    customer_code: str
    amount: float
    failure_reason: str
    recovery_probability: float
    expected_recovery: float
    actual_recovered: float
    recommended_action: str
    priority: str
    status: str
    attempts_count: int
    max_attempts: int
    escalated: bool

# --- API Endpoints ---

@router.post("/seed-demo", summary="Seed 100-Transaction Demo Batch anchored by TX-10492")
def seed_demo_batch_endpoint(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Seeds a controlled 100-transaction demo batch anchored by TX-10492 into database and executes BatchAgentEngine.
    """
    batch = seed_100_transaction_batch(db)
    return {
        "status": "success",
        "message": "Seeded 100-transaction demo batch anchored by TX-10492.",
        "batch_id": batch.id,
        "total_transactions": batch.total_transactions,
        "revenue_at_risk": batch.revenue_at_risk,
        "expected_recovery": batch.expected_recovery,
        "actual_recovered": batch.actual_recovered,
        "recovery_rate": batch.recovery_rate
    }

@router.post("/create", summary="Create a new Batch Recovery Run")
def create_batch_run(
    payload: CreateBatchRequest,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Creates a new batch recovery run from failed transactions.
    """
    engine = BatchAgentEngine(db)
    batch = engine.create_batch_from_failed_transactions(
        batch_name=payload.name or "Batch Revenue Recovery Run",
        transaction_ids=payload.transaction_ids,
        limit=payload.limit or 100
    )
    return {
        "status": "success",
        "batch_id": batch.id,
        "name": batch.name,
        "total_transactions": batch.total_transactions,
        "revenue_at_risk": batch.revenue_at_risk
    }

@router.post("/{batch_id}/run", summary="Run Autonomous Batch Recovery Engine")
def run_batch_recovery_endpoint(
    batch_id: str,
    payload: Optional[ApproveBatchItemsRequest] = None,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Executes the 12-step autonomous batch recovery pipeline over batch opportunities.
    """
    engine = BatchAgentEngine(db)
    approved_ids = payload.approved_opportunity_ids if payload else None
    result = engine.run_batch_recovery(
        batch_id=batch_id,
        human_approved_opportunity_ids=approved_ids,
        user=current_user
    )
    return result

@router.get("/metrics", summary="Get Global Batch Recovery Performance Metrics")
def get_batch_metrics(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Returns aggregated metrics comparing Revenue at Risk, Expected Recovery, Actual Recovered money, and Recovery Rate.
    """
    batches = db.query(BatchRun).all()
    if not batches:
        # Auto seed if no batches exist
        batch = seed_100_transaction_batch(db)
        batches = [batch]

    total_risk = sum(b.revenue_at_risk for b in batches)
    total_expected = sum(b.expected_recovery for b in batches)
    total_actual = sum(b.actual_recovered for b in batches)
    total_txs = sum(b.total_transactions for b in batches)
    total_successful = sum(b.successful_recoveries for b in batches)
    total_failed = sum(b.failed_recoveries for b in batches)
    total_escalated = sum(b.escalated_count for b in batches)
    total_pending = sum(b.pending_approval_count for b in batches)

    recovery_rate = round((total_actual / total_risk * 100.0) if total_risk > 0 else 0.0, 2)
    avg_prob = round(sum(b.avg_recovery_probability for b in batches) / len(batches), 4) if batches else 0.0

    return {
        "total_batches": len(batches),
        "transactions_analyzed": total_txs,
        "revenue_at_risk": round(total_risk, 2),
        "expected_recovery": round(total_expected, 2),
        "actual_recovered": round(total_actual, 2),
        "recovery_rate": recovery_rate,
        "successful_recoveries": total_successful,
        "failed_recoveries": total_failed,
        "escalated_count": total_escalated,
        "pending_approval_count": total_pending,
        "average_recovery_probability": avg_prob
    }

@router.get("/{batch_id}", summary="Get Batch Details & Status")
def get_batch_details(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Retrieves status, execution logs, and summary metrics for a specific batch.
    """
    batch = db.query(BatchRun).filter(BatchRun.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail=f"Batch not found: {batch_id}")

    return {
        "id": batch.id,
        "name": batch.name,
        "status": batch.status,
        "total_transactions": batch.total_transactions,
        "revenue_at_risk": batch.revenue_at_risk,
        "expected_recovery": batch.expected_recovery,
        "actual_recovered": batch.actual_recovered,
        "recovery_rate": batch.recovery_rate,
        "successful_recoveries": batch.successful_recoveries,
        "failed_recoveries": batch.failed_recoveries,
        "escalated_count": batch.escalated_count,
        "pending_approval_count": batch.pending_approval_count,
        "avg_recovery_probability": batch.avg_recovery_probability,
        "current_step": batch.current_step,
        "execution_logs": batch.execution_logs or [],
        "created_at": batch.created_at.isoformat() if batch.created_at else None,
        "completed_at": batch.completed_at.isoformat() if batch.completed_at else None
    }

@router.get("/{batch_id}/opportunities", summary="List Prioritized Batch Recovery Opportunities")
def get_batch_opportunities(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """
    Returns prioritized recovery opportunities for a batch, sorted by Expected Recovery (Highest first).
    """
    opps = db.query(RecoveryOpportunity).filter(RecoveryOpportunity.batch_id == batch_id).all()
    
    result = []
    for opp in opps:
        tx = opp.transaction
        cust = opp.customer
        result.append({
            "id": opp.id,
            "transaction_id": opp.transaction_id,
            "transaction_code": tx.transaction_code if tx else "TX-UNKNOWN",
            "customer_name": cust.name if cust else "Unknown Customer",
            "customer_code": cust.customer_code if cust else "CUST-UNKNOWN",
            "amount": opp.amount,
            "failure_reason": opp.failure_reason,
            "recovery_probability": opp.recovery_probability,
            "expected_recovery": opp.expected_recovery,
            "actual_recovered": opp.actual_recovered,
            "recommended_action": opp.recommended_action,
            "priority": opp.priority,
            "status": opp.status,
            "attempts_count": opp.attempts_count,
            "max_attempts": opp.max_attempts,
            "escalated": opp.escalated
        })

    # Prioritize: Highest Expected Recovery first
    result.sort(key=lambda x: x["expected_recovery"], reverse=True)
    return result

@router.post("/{batch_id}/approve", summary="Human Approval for Pending Batch Items")
def approve_batch_items(
    batch_id: str,
    payload: ApproveBatchItemsRequest,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Allows human operator to approve pending items in a batch and resumes execution.
    """
    engine = BatchAgentEngine(db)
    result = engine.run_batch_recovery(
        batch_id=batch_id,
        human_approved_opportunity_ids=payload.approved_opportunity_ids,
        user=current_user
    )
    return result

@router.get("/{batch_id}/audit", summary="Get Batch Recovery Audit Trail")
def get_batch_audit_trail(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """
    Returns complete audit trail logs for a batch execution.
    """
    logs = db.query(AuditLog).filter(AuditLog.batch_id == batch_id).order_by(AuditLog.timestamp.desc()).all()
    
    return [
        {
            "id": log.id,
            "transaction_id": log.transaction_id,
            "action": log.action,
            "reason": log.reason,
            "ml_probability": log.ml_probability,
            "expected_recovery": log.expected_recovery,
            "actual_recovered_amount": log.actual_recovered_amount,
            "policy_decision": log.policy_decision,
            "approval_status": log.approval_status,
            "execution_result": log.execution_result,
            "escalation_status": log.escalation_status,
            "actor": log.actor,
            "user_email": log.user_email,
            "user_role": log.user_role,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        }
        for log in logs
    ]
