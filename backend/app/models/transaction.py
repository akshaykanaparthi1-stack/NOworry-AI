import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.db import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_code = Column(String(64), unique=True, index=True, nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False, default="INR")
    payment_method = Column(String(50), nullable=False) # CREDIT_CARD, UPI, AUTO_DEBIT, NET_BANKING
    failure_reason = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="FAILED") # FAILED, RECOVERED, IN_RECOVERY, UNRECOVERABLE
    days_since_previous_payment = Column(Integer, nullable=False, default=30)
    previous_failures_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    customer = relationship("Customer", back_populates="transactions")
    opportunity = relationship("RecoveryOpportunity", back_populates="transaction", uselist=False)
