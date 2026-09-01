import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, JSON
from sqlalchemy.orm import relationship
from backend.app.core.db import Base

class BatchRun(Base):
    __tablename__ = "batch_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="CREATED") # CREATED, RUNNING, WAITING_APPROVAL, COMPLETED, FAILED, ESCALATED
    
    total_transactions = Column(Integer, nullable=False, default=0)
    revenue_at_risk = Column(Float, nullable=False, default=0.0)
    expected_recovery = Column(Float, nullable=False, default=0.0) # Sum of expected recoveries (Amount * Probability)
    actual_recovered = Column(Float, nullable=False, default=0.0) # Sum of actual recovered money
    recovery_rate = Column(Float, nullable=False, default=0.0) # (actual_recovered / revenue_at_risk) * 100
    
    successful_recoveries = Column(Integer, nullable=False, default=0)
    failed_recoveries = Column(Integer, nullable=False, default=0)
    escalated_count = Column(Integer, nullable=False, default=0)
    pending_approval_count = Column(Integer, nullable=False, default=0)
    
    avg_recovery_probability = Column(Float, nullable=False, default=0.0)
    avg_recovery_time_seconds = Column(Float, nullable=False, default=0.0)
    
    current_step = Column(String(100), nullable=False, default="INITIATED")
    execution_logs = Column(JSON, nullable=True, default=list)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    opportunities = relationship("RecoveryOpportunity", back_populates="batch")
