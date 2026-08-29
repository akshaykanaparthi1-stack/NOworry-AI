import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from backend.app.core.db import Base

class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = Column(String(36), ForeignKey("transactions.id"), nullable=False, index=True)
    model_version = Column(String(50), nullable=False, default="v1.0.0-RandomForest")
    recovery_probability = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False, default=0.85)
    expected_recovery = Column(Float, nullable=False)
    feature_vector = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
