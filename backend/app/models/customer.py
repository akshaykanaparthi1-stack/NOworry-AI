import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.orm import relationship
from backend.app.core.db import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_code = Column(String(32), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    segment = Column(String(50), nullable=False, default="Enterprise")
    tenure_months = Column(Integer, nullable=False, default=12)
    lifetime_value = Column(Float, nullable=False, default=0.0)
    historical_success_rate = Column(Float, nullable=False, default=0.90)
    total_transactions = Column(Integer, nullable=False, default=10)
    engagement_score = Column(Float, nullable=False, default=0.8)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    transactions = relationship("Transaction", back_populates="customer")
    opportunities = relationship("RecoveryOpportunity", back_populates="customer")
