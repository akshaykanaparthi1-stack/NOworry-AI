import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

from ml.generate_dataset import generate_synthetic_dataset
from ml.preprocessing import build_preprocessor

def train_and_evaluate_models(data_path: str = "ml/data/synthetic_transactions.csv"):
    """
    Trains and compares multiple ML classification models on synthetic data.
    Calculates exact empirical metrics (Accuracy, Precision, Recall, F1, ROC-AUC).
    Saves trained pipeline to ml/model.pkl and metrics to ml/metrics.json.
    """
    os.makedirs("ml", exist_ok=True)
    os.makedirs("ml/models", exist_ok=True)
    os.makedirs("ml/data", exist_ok=True)
    
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Generating 50,000 dataset...")
        df = generate_synthetic_dataset(50000)
        df.to_csv(data_path, index=False)
    else:
        print(f"Loading dataset from {data_path}...")
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

    # 80/20 train/test split to prevent data leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    preprocessor = build_preprocessor()

    candidate_models = {
        "RandomForest": RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1),
        "GradientBoosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42),
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42)
    }

    eval_results = {}
    best_model_name = None
    best_f1 = -1.0
    best_pipeline = None

    print("\n--- Training and Evaluating Classification Models ---")
    for name, clf in candidate_models.items():
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("classifier", clf)
        ])

        print(f"\nTraining {name}...")
        pipeline.fit(X_train, y_train)

        # Empirical Predictions on held-out Test set
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_prob)
        cm = confusion_matrix(y_test, y_pred).tolist()

        metrics = {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1_score": float(f1),
            "roc_auc": float(roc_auc),
            "confusion_matrix": cm
        }
        eval_results[name] = metrics

        print(f"Empirical Results for {name}:")
        print(f"  Accuracy:  {acc:.4f}")
        print(f"  Precision: {prec:.4f}")
        print(f"  Recall:    {rec:.4f}")
        print(f"  F1-Score:  {f1:.4f}")
        print(f"  ROC-AUC:   {roc_auc:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_pipeline = pipeline

    print(f"\nBest Model Selected: {best_model_name} (F1-Score: {best_f1:.4f})")

    # Save trained model artifact to ml/model.pkl and ml/models/best_model.joblib
    model_pkl_path = "ml/model.pkl"
    joblib.dump(best_pipeline, model_pkl_path)
    joblib.dump(best_pipeline, "ml/models/best_model.joblib")
    print(f"Saved trained model pipeline to {model_pkl_path}")

    # Save metrics summary to ml/metrics.json
    metrics_summary = {
        "best_model": best_model_name,
        "dataset_size": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "best_metrics": eval_results[best_model_name],
        "models_evaluated": eval_results
    }
    
    with open("ml/metrics.json", "w") as f:
        json.dump(metrics_summary, f, indent=2)
    with open("ml/models/model_metrics.json", "w") as f:
        json.dump(metrics_summary, f, indent=2)
    
    print(f"Saved metrics summary to ml/metrics.json")

    return metrics_summary

if __name__ == "__main__":
    train_and_evaluate_models()
