import os
import json
import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix

def evaluate_saved_model(model_path: str = "ml/model.pkl", data_path: str = "ml/data/synthetic_transactions.csv"):
    """
    Evaluates the saved model pipeline on dataset and prints metrics summary.
    """
    if not os.path.exists(model_path):
        from ml.train import train_and_evaluate_models
        train_and_evaluate_models()

    pipeline = joblib.load(model_path)
    df = pd.read_csv(data_path)

    feature_cols = [
        "transaction_amount",
        "payment_method",
        "failure_reason",
        "customer_tenure",
        "historical_payment_success",
        "previous_failures",
        "customer_lifetime_value",
        "engagement_score",
        "churn_probability",
        "days_since_previous_payment",
        "transaction_history"
    ]

    X = df[feature_cols]
    y = df["recovered"]

    y_pred = pipeline.predict(X)

    print("\n========================================================")
    print("      NoWorry AI Model Evaluation Report")
    print("========================================================")
    print(f"Model Path: {model_path}")
    print(f"Total Dataset Records Evaluated: {len(df)}")
    print("\nClassification Report:")
    print(classification_report(y, y_pred, digits=4))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y, y_pred))

    if os.path.exists("ml/metrics.json"):
        with open("ml/metrics.json", "r") as f:
            metrics = json.load(f)
            print("\nSaved Test Set Empirical Metrics:")
            print(json.dumps(metrics.get("best_metrics", {}), indent=2))

if __name__ == "__main__":
    evaluate_saved_model()
