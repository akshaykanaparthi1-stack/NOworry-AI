import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.core.config import settings
from backend.app.core.db import Base, init_db_schema, SessionLocal
from backend.app.models import (
    Customer, Transaction, RecoveryOpportunity, RecoveryAction, AIPrediction, AgentRun, AuditLog, Profile
)

def sync_data_to_target_db(target_engine):
    """
    Syncs local seed data and schemas to target Supabase database.
    """
    print("Creating all tables in target Supabase database...")
    Base.metadata.create_all(bind=target_engine)
    
    TargetSession = sessionmaker(autocommit=False, autoflush=False, bind=target_engine)
    target_db = TargetSession()
    source_db = SessionLocal()
    
    try:
        # 1. Sync User Profiles
        profiles = source_db.query(Profile).all()
        for p in profiles:
            existing = target_db.query(Profile).filter(Profile.email == p.email).first()
            if not existing:
                target_db.add(Profile(
                    auth_user_id=p.auth_user_id,
                    full_name=p.full_name,
                    email=p.email,
                    role=p.role
                ))
        target_db.commit()
        print(f"Synced {len(profiles)} user profiles to Supabase.")

        # 2. Sync Demo Customers
        customers = source_db.query(Customer).limit(500).all()
        for c in customers:
            existing = target_db.query(Customer).filter(Customer.customer_code == c.customer_code).first()
            if not existing:
                target_db.add(Customer(
                    id=c.id,
                    customer_code=c.customer_code,
                    name=c.name,
                    email=c.email,
                    tenure_months=c.tenure_months,
                    lifetime_value=c.lifetime_value,
                    historical_success_rate=c.historical_success_rate,
                    previous_failures_count=c.previous_failures_count,
                    engagement_score=c.engagement_score,
                    segment=c.segment
                ))
        target_db.commit()
        print(f"Synced {len(customers)} customers to Supabase.")

        # 3. Sync Transactions & Demo TX-10492
        transactions = source_db.query(Transaction).limit(500).all()
        for tx in transactions:
            existing = target_db.query(Transaction).filter(Transaction.transaction_code == tx.transaction_code).first()
            if not existing:
                target_db.add(Transaction(
                    id=tx.id,
                    transaction_code=tx.transaction_code,
                    customer_id=tx.customer_id,
                    amount=tx.amount,
                    currency=tx.currency,
                    payment_method=tx.payment_method,
                    status=tx.status,
                    failure_reason=tx.failure_reason,
                    failure_code=tx.failure_code,
                    days_since_previous_payment=tx.days_since_previous_payment,
                    previous_failures_count=tx.previous_failures_count
                ))
        target_db.commit()
        print(f"Synced {len(transactions)} transactions to Supabase.")

        # 4. Sync Opportunities
        opps = source_db.query(RecoveryOpportunity).limit(500).all()
        for opp in opps:
            existing = target_db.query(RecoveryOpportunity).filter(RecoveryOpportunity.transaction_id == opp.transaction_id).first()
            if not existing:
                target_db.add(RecoveryOpportunity(
                    id=opp.id,
                    transaction_id=opp.transaction_id,
                    customer_id=opp.customer_id,
                    amount=opp.amount,
                    failure_reason=opp.failure_reason,
                    recovery_probability=opp.recovery_probability,
                    expected_recovery=opp.expected_recovery,
                    recommended_action=opp.recommended_action,
                    priority=opp.priority,
                    status=opp.status
                ))
        target_db.commit()
        print("Synced recovery opportunities to Supabase.")

    except Exception as e:
        target_db.rollback()
        print(f"Error syncing data to Supabase: {str(e)}")
    finally:
        target_db.close()
        source_db.close()

if __name__ == "__main__":
    db_url = os.environ.get("SUPABASE_DATABASE_URL") or settings.DATABASE_URL
    if not db_url.startswith("postgres"):
        print("Usage: SUPABASE_DATABASE_URL='postgresql://postgres:[PASSWORD]@db.qtulrhuecnrlntbgusqt.supabase.co:5432/postgres' python data/migrate_to_supabase.py")
    else:
        engine = create_engine(db_url, pool_pre_ping=True)
        sync_data_to_target_db(engine)
