import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.core.db import Base

class RecoveryAction(Base):
    __tablename__ = "recovery_actions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    opportunity_id = Column(String(36), ForeignKey("recovery_opportunities.id"), nullable=False, index=True)
    action_type = Column(String(100), nullable=False) # RETRY_PAYMENT, SEND_PAYMENT_REMINDER, REQUEST_PAYMENT_METHOD_UPDATE, OFFER_RETENTION_DISCOUNT, ESCALATE_TO_HUMAN, NO_ACTION
    status = Column(String(50), nullable=False, default="PENDING") # PENDING, APPROVED, EXECUTING, SUCCESS, FAILED
    execution_mode = Column(String(20), nullable=False, default="SIMULATION")
    result_payload = Column(JSON, nullable=True)
    executed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    opportunity = relationship("RecoveryOpportunity", back_populates="actions")
