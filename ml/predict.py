import os
import joblib
import pandas as pd
from typing import Dict, Any

MODEL_PATH = "ml/model.pkl"
_model_cache = None

def get_model():
    global _model_cache
    if _model_cache is None:
        if not os.path.exists(MODEL_PATH):
            if os.path.exists("ml/models/best_model.joblib"):
                MODEL_PATH_USE = "ml/models/best_model.joblib"
            else:
                from ml.train import train_and_evaluate_models
                train_and_evaluate_models()
                MODEL_PATH_USE = MODEL_PATH
        else:
            MODEL_PATH_USE = MODEL_PATH
            
        _model_cache = joblib.load(MODEL_PATH_USE)
    return _model_cache

def predict_recovery(transaction: Dict[str, Any]) -> Dict[str, float]:
    """
    Predicts the probability that a failed transaction can be recovered.
    
    Returns:
    - probability: float (0.0 to 1.0)
    - confidence: float (0.5 to 1.0)
    - expected_recovery: float (transaction_amount * recovery_probability)
    """
    model = get_model()

    amount = float(transaction.get("transaction_amount", transaction.get("amount", 1000.0)))
    
    input_df = pd.DataFrame([{
        "transaction_amount": amount,
        "payment_method": transaction.get("payment_method", "CREDIT_CARD"),
        "failure_reason": transaction.get("failure_reason", "CARD_EXPIRED"),
        "customer_tenure": int(transaction.get("customer_tenure", transaction.get("tenure_months", 12))),
        "historical_payment_success": float(transaction.get("historical_payment_success", transaction.get("historical_success_rate", 0.90))),
        "previous_failures": int(transaction.get("previous_failures", transaction.get("previous_failures_count", 0))),
        "customer_lifetime_value": float(transaction.get("customer_lifetime_value", transaction.get("lifetime_value", 10000.0))),
        "engagement_score": float(transaction.get("engagement_score", 0.8)),
        "churn_probability": float(transaction.get("churn_probability", 0.15)),
        "days_since_previous_payment": int(transaction.get("days_since_previous_payment", 30)),
        "transaction_history": int(transaction.get("transaction_history", transaction.get("total_transactions", 15)))
    }])

    prob_raw = float(model.predict_proba(input_df)[0][1])
    prob = round(prob_raw, 4)
    
    # Calculate confidence based on decision boundary distance from 0.50
    confidence = round(min(1.0, 0.50 + abs(prob_raw - 0.50) * 0.90), 4)
    expected_recovery = round(amount * prob, 2)

    return {
        "probability": prob,
        "confidence": confidence,
        "expected_recovery": expected_recovery
    }
