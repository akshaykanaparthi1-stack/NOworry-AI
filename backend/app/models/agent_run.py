import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.core.db import Base

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    opportunity_id = Column(String(36), ForeignKey("recovery_opportunities.id"), nullable=False, index=True)
    transaction_id = Column(String(36), ForeignKey("transactions.id"), nullable=False)
    current_step = Column(String(50), nullable=False, default="DETECT")
    status = Column(String(50), nullable=False, default="PENDING") # PENDING, RUNNING, COMPLETED, FAILED, WAITING_APPROVAL
    execution_logs = Column(JSON, nullable=False, default=list)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    opportunity = relationship("RecoveryOpportunity", back_populates="agent_runs")
    audit_logs = relationship("AuditLog", back_populates="agent_run")
