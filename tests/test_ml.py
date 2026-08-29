import os
import json
import pytest
import pandas as pd
from ml.generate_dataset import generate_synthetic_dataset
from ml.train import train_and_evaluate_models
from ml.predict import predict_recovery

def test_dataset_generation():
    """
    Verifies synthetic dataset generation creates >= 50,000 records.
    """
    df = generate_synthetic_dataset(50000)
    assert len(df) == 50000
    assert "recovered" in df.columns
    assert "transaction_amount" in df.columns
    assert "historical_payment_success" in df.columns

def test_model_training_and_metrics_file():
    """
    Executes actual model training, verifies model.pkl and metrics.json generation,
    and checks empirical non-zero metrics.
    """
    metrics = train_and_evaluate_models()
    
    assert os.path.exists("ml/model.pkl")
    assert os.path.exists("ml/metrics.json")
    
    best_m = metrics["best_metrics"]
    assert 0.60 <= best_m["accuracy"] <= 1.00
    assert 0.60 <= best_m["precision"] <= 1.00
    assert 0.60 <= best_m["recall"] <= 1.00
    assert 0.60 <= best_m["f1_score"] <= 1.00
    assert 0.60 <= best_m["roc_auc"] <= 1.00

def test_predict_recovery_interface():
    """
    Tests predict_recovery(transaction) interface logic.
    """
    tx = {
        "transaction_amount": 9999.0,
        "payment_method": "CREDIT_CARD",
        "failure_reason": "AUTH_FAILED",
        "customer_tenure": 18,
        "historical_payment_success": 0.94,
        "previous_failures": 0,
        "customer_lifetime_value": 125000.0,
        "engagement_score": 0.92,
        "churn_probability": 0.08,
        "days_since_previous_payment": 30,
        "transaction_history": 24
    }
    res = predict_recovery(tx)
    
    assert "probability" in res
    assert "confidence" in res
    assert "expected_recovery" in res
    
    assert 0.0 <= res["probability"] <= 1.0
    assert 0.5 <= res["confidence"] <= 1.0
    assert res["expected_recovery"] == round(9999.0 * res["probability"], 2)

def test_prediction_differential():
    """
    Verifies prediction logic gives higher probability to high quality customers.
    """
    high_tx = {
        "amount": 5000.0,
        "payment_method": "CREDIT_CARD",
        "failure_reason": "GATEWAY_TIMEOUT",
        "tenure_months": 36,
        "historical_success_rate": 0.95,
        "previous_failures_count": 0,
        "lifetime_value": 200000.0,
        "engagement_score": 0.95,
        "churn_probability": 0.05,
        "days_since_previous_payment": 10,
        "total_transactions": 50
    }
    
    low_tx = {
        "amount": 5000.0,
        "payment_method": "CREDIT_CARD",
        "failure_reason": "INSUFFICIENT_FUNDS",
        "tenure_months": 2,
        "historical_success_rate": 0.40,
        "previous_failures_count": 4,
        "lifetime_value": 5000.0,
        "engagement_score": 0.20,
        "churn_probability": 0.85,
        "days_since_previous_payment": 60,
        "total_transactions": 2
    }
    
    high_res = predict_recovery(high_tx)
    low_res = predict_recovery(low_tx)
    
    assert high_res["probability"] > low_res["probability"]
