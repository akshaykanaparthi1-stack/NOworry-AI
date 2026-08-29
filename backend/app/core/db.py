import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Check for placeholder password in DATABASE_URL
if "YOUR_SUPABASE_PASSWORD" in db_url or "YOUR-SUPABASE-PASSWORD" in db_url:
    print("[WARNING] Placeholder password found in DATABASE_URL. Falling back to local SQLite database.")
    db_url = "sqlite:///./noworry_ai.db"

connect_args = {}
engine_kwargs = {"echo": False}

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    engine_kwargs["connect_args"] = connect_args
else:
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(db_url, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db_schema():
    global engine, SessionLocal, Base
    from backend.app.models import (
        Customer, Transaction, RecoveryOpportunity, RecoveryAction, AIPrediction, AgentRun, AuditLog, Profile
    )
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[WARNING] Database connection error: {e}. Falling back to SQLite database...")
        fallback_url = "sqlite:///./noworry_ai.db"
        engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
