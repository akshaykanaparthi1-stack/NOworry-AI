import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.db import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_run_id = Column(String(36), ForeignKey("agent_runs.id"), nullable=False, index=True)
    transaction_id = Column(String(36), ForeignKey("transactions.id"), nullable=False, index=True)
    action = Column(String(100), nullable=False)
    reason = Column(Text, nullable=False)
    approval_status = Column(String(50), nullable=False, default="NOT_REQUIRED")
    execution_result = Column(String(50), nullable=False, default="SUCCESS")
    actor = Column(String(50), nullable=False, default="AI_AGENT") # AI_AGENT, HUMAN_OPERATOR
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    agent_run = relationship("AgentRun", back_populates="audit_logs")
