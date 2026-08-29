from typing import Dict, Any
from ml.predict import predict_recovery

def predict_recovery_probability(feature_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calls the trained Scikit-learn ML model to predict recovery probability.
    """
    res = predict_recovery(feature_dict)
    return res

def calculate_expected_recovery(amount: float, probability: float) -> Dict[str, float]:
    """
    Calculates expected recoverable revenue = amount * recovery_probability.
    """
    expected = round(amount * probability, 2)
    return {
        "transaction_amount": amount,
        "recovery_probability": probability,
        "expected_recovery": expected
    }
