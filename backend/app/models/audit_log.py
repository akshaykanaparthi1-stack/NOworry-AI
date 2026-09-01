import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.db import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_run_id = Column(String(36), ForeignKey("agent_runs.id"), nullable=True, index=True)
    batch_id = Column(String(36), ForeignKey("batch_runs.id"), nullable=True, index=True)
    transaction_id = Column(String(36), ForeignKey("transactions.id"), nullable=False, index=True)
    action = Column(String(100), nullable=False)
    reason = Column(Text, nullable=False)
    
    # Financial & Model Tracking
    ml_probability = Column(Float, nullable=False, default=0.0)
    expected_recovery = Column(Float, nullable=False, default=0.0)
    actual_recovered_amount = Column(Float, nullable=False, default=0.0)
    
    # Governance & Execution Tracking
    policy_decision = Column(String(100), nullable=True)
    approval_status = Column(String(50), nullable=False, default="NOT_REQUIRED")
    execution_result = Column(String(50), nullable=False, default="SUCCESS")
    escalation_status = Column(String(50), nullable=True)
    actor = Column(String(50), nullable=False, default="AI_AGENT") # AI_AGENT, HUMAN_OPERATOR
    
    # Authenticated user tracking
    user_id = Column(String(100), nullable=True)
    user_email = Column(String(255), nullable=True)
    user_role = Column(String(50), nullable=True)
    
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    agent_run = relationship("AgentRun", back_populates="audit_logs")
