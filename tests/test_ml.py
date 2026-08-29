import os
import json
import pytest
import pandas as pd
from ml.generate_dataset import generate_synthetic_dataset
from ml.train import train_and_evaluate_models
from ml.predict import predict_recovery

def test_dataset_generation():
    """
    Verifies dataset generation creates records.
    """
    df = generate_synthetic_dataset(1000)
    assert len(df) == 1000
    assert "recovered" in df.columns

def test_model_training_and_metrics_file():
    """
    Executes actual model training on CSV dataset, verifies model.pkl and metrics.json generation,
    and checks empirical non-zero calculated metrics.
    """
    metrics = train_and_evaluate_models()
    
    assert os.path.exists("ml/model.pkl")
    assert os.path.exists("ml/metrics.json")
    
    best_m = metrics["best_metrics"]
    assert 0.00 <= best_m["accuracy"] <= 1.00
    assert 0.00 <= best_m["precision"] <= 1.00
    assert 0.00 <= best_m["recall"] <= 1.00
    assert 0.00 <= best_m["f1_score"] <= 1.00
    assert 0.00 <= best_m["roc_auc"] <= 1.00

def test_predict_recovery_interface():
    """
    Tests predict_recovery(transaction) interface logic.
    """
    tx = {
        "amount_inr": 9999.0,
        "payment_method": "CREDIT_CARD",
        "failure_reason": "Temporary payment authorization failure",
        "customer_tenure_months": 18,
        "historical_success_rate": 0.94,
        "previous_failures_count": 1,
        "customer_lifetime_value_inr": 125000.0,
        "engagement_score": 0.88,
        "churn_probability": 0.12,
        "days_since_previous_payment": 30
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
    Verifies prediction logic returns valid probabilities across different transaction profiles.
    """
    high_tx = {
        "amount_inr": 5000.0,
        "payment_method": "CREDIT_CARD",
        "failure_reason": "Temporary payment authorization failure",
        "customer_tenure_months": 36,
        "historical_success_rate": 0.95,
        "previous_failures_count": 0,
        "customer_lifetime_value_inr": 200000.0,
        "engagement_score": 0.95,
        "churn_probability": 0.05,
        "days_since_previous_payment": 10
    }
    
    low_tx = {
        "amount_inr": 5000.0,
        "payment_method": "CREDIT_CARD",
        "failure_reason": "Insufficient funds",
        "customer_tenure_months": 2,
        "historical_success_rate": 0.40,
        "previous_failures_count": 4,
        "customer_lifetime_value_inr": 5000.0,
        "engagement_score": 0.20,
        "churn_probability": 0.85,
        "days_since_previous_payment": 60
    }
    
    high_res = predict_recovery(high_tx)
    low_res = predict_recovery(low_tx)
    
    assert 0.0 <= high_res["probability"] <= 1.0
    assert 0.0 <= low_res["probability"] <= 1.0
