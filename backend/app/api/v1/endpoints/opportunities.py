from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional

from backend.app.core.db import get_db
from backend.app.models.opportunity import RecoveryOpportunity
from backend.app.models.transaction import Transaction
from backend.app.models.customer import Customer
from backend.app.models.agent_run import AgentRun
from backend.app.schemas.opportunity import OpportunityListResponse, OpportunityDetailResponse, OpportunityItemResponse

router = APIRouter()

@router.get("", response_model=OpportunityListResponse)
def list_opportunities(
    search: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    payment_method: Optional[str] = None,
    sort_by: str = Query("created_at", enum=["created_at", "amount", "recovery_probability", "expected_recovery"]),
    order: str = Query("desc", enum=["asc", "desc"]),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Paginated enterprise list of revenue recovery opportunities with multi-field search and filtering.
    """
    query = db.query(RecoveryOpportunity, Transaction, Customer)\
        .join(Transaction, RecoveryOpportunity.transaction_id == Transaction.id)\
        .join(Customer, RecoveryOpportunity.customer_id == Customer.id)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Transaction.transaction_code.ilike(search_fmt),
                Customer.name.ilike(search_fmt),
                Customer.email.ilike(search_fmt),
                RecoveryOpportunity.failure_reason.ilike(search_fmt)
            )
        )

    if priority:
        query = query.filter(RecoveryOpportunity.priority == priority)

    if status:
        query = query.filter(RecoveryOpportunity.status == status)

    if payment_method:
        query = query.filter(Transaction.payment_method == payment_method)

    # Sorting
    sort_attr = getattr(RecoveryOpportunity, sort_by, RecoveryOpportunity.created_at)
    if order == "desc":
        query = query.order_by(desc(sort_attr))
    else:
        query = query.order_by(asc(sort_attr))

    total = query.count()
    total_pages = (total + page_size - 1) // page_size

    results = query.offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for opp, tx, cust in results:
        items.append(OpportunityItemResponse(
            id=opp.id,
            transaction_id=tx.id,
            transaction_code=tx.transaction_code,
            customer_id=cust.id,
            customer_name=cust.name,
            customer_email=cust.email,
            amount=opp.amount,
            payment_method=tx.payment_method,
            failure_reason=opp.failure_reason,
            recovery_probability=opp.recovery_probability,
            expected_recovery=opp.expected_recovery,
            recommended_action=opp.recommended_action,
            priority=opp.priority,
            status=opp.status,
            created_at=opp.created_at.isoformat() if opp.created_at else ""
        ))

    return OpportunityListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{id}", response_model=OpportunityDetailResponse)
def get_opportunity_detail(id: str, db: Session = Depends(get_db)):
    """
    Retrieves full details of a specific revenue opportunity.
    """
    res = db.query(RecoveryOpportunity, Transaction, Customer)\
        .join(Transaction, RecoveryOpportunity.transaction_id == Transaction.id)\
        .join(Customer, RecoveryOpportunity.customer_id == Customer.id)\
        .filter((RecoveryOpportunity.id == id) | (Transaction.transaction_code == id)).first()

    if not res:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    opp, tx, cust = res

    # Retrieve agent run details if available
    agent_run = db.query(AgentRun).filter(AgentRun.opportunity_id == opp.id).first()

    return OpportunityDetailResponse(
        id=opp.id,
        transaction_id=tx.id,
        transaction_code=tx.transaction_code,
        customer_id=cust.id,
        customer_name=cust.name,
        customer_email=cust.email,
        amount=opp.amount,
        payment_method=tx.payment_method,
        failure_reason=opp.failure_reason,
        recovery_probability=opp.recovery_probability,
        expected_recovery=opp.expected_recovery,
        recommended_action=opp.recommended_action,
        priority=opp.priority,
        status=opp.status,
        created_at=opp.created_at.isoformat() if opp.created_at else "",
        customer_segment=cust.segment,
        customer_tenure=cust.tenure_months,
        customer_ltv=cust.lifetime_value,
        customer_success_rate=cust.historical_success_rate,
        agent_run_id=agent_run.id if agent_run else None,
        agent_run_status=agent_run.status if agent_run else None,
        agent_logs=agent_run.execution_logs if agent_run else []
    )
