from typing import Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.customer import Customer

def get_customer_history(db: Session, customer_id: str) -> Dict[str, Any]:
    """
    Retrieves customer history, segment, LTV, and historical payment success rate.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise ValueError(f"Customer not found: {customer_id}")

    return {
        "id": customer.id,
        "customer_code": customer.customer_code,
        "name": customer.name,
        "email": customer.email,
        "segment": customer.segment,
        "tenure_months": customer.tenure_months,
        "lifetime_value": customer.lifetime_value,
        "historical_success_rate": customer.historical_success_rate,
        "total_transactions": customer.total_transactions,
        "engagement_score": customer.engagement_score
    }
