import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.db import Base

class RecoveryOpportunity(Base):
    __tablename__ = "recovery_opportunities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = Column(String(36), ForeignKey("transactions.id"), nullable=False, unique=True, index=True)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    amount = Column(Float, nullable=False)
    failure_reason = Column(String(100), nullable=False)
    recovery_probability = Column(Float, nullable=False, default=0.0)
    expected_recovery = Column(Float, nullable=False, default=0.0) # Expected Recovery = Amount * Probability
    actual_recovered = Column(Float, nullable=False, default=0.0) # Actual Recovered Money
    recommended_action = Column(String(100), nullable=False, default="NO_ACTION")
    priority = Column(String(20), nullable=False, default="MEDIUM") # HIGH, MEDIUM, LOW
    status = Column(String(50), nullable=False, default="DETECTED") # DETECTED, ANALYZED, PENDING_APPROVAL, IN_PROGRESS, RECOVERED, ESCALATED, CLOSED, FAILED
    
    # Batch Recovery & Bounded Retries tracking
    batch_id = Column(String(36), ForeignKey("batch_runs.id"), nullable=True, index=True)
    attempts_count = Column(Integer, nullable=False, default=0)
    max_attempts = Column(Integer, nullable=False, default=3)
    escalated = Column(Boolean, nullable=False, default=False)
    recovery_timestamp = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    transaction = relationship("Transaction", back_populates="opportunity")
    customer = relationship("Customer", back_populates="opportunities")
    actions = relationship("RecoveryAction", back_populates="opportunity")
    agent_runs = relationship("AgentRun", back_populates="opportunity")
    batch = relationship("BatchRun", back_populates="opportunities")
