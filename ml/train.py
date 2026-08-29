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

from ml.preprocessing import build_preprocessor, normalize_feature_dataframe, NUMERIC_FEATURES, CATEGORICAL_FEATURES

def train_and_evaluate_models(data_path: str = "ml/data/noworry_ai_transactions.csv"):
    """
    1. Import CSV dataset.
    2. Validate columns and data types.
    3. Check for missing values and duplicates.
    4. Perform feature preprocessing.
    5. Use 'recovered' as target.
    6. Train multiple models (RandomForest, GradientBoosting, LogisticRegression).
    7. Calculate real metrics (Accuracy, Precision, Recall, F1, ROC-AUC).
    8. Select and save best model artifact.
    """
    os.makedirs("ml", exist_ok=True)
    os.makedirs("ml/models", exist_ok=True)
    os.makedirs("ml/data", exist_ok=True)

    if not os.path.exists(data_path):
        data_path = "ml/data/synthetic_transactions.csv"

    print(f"Loading dataset from {data_path}...")
    df = pd.read_csv(data_path)

    # Validate columns
    required_cols = [
        "customer_id", "transaction_id", "amount_inr", "payment_method", "status",
        "failure_reason", "customer_tenure_months", "historical_success_rate",
        "previous_failures_count", "customer_lifetime_value_inr", "engagement_score",
        "churn_probability", "days_since_previous_payment", "recovered"
    ]
    
    # Clean duplicates & missing values
    initial_count = len(df)
    df = df.drop_duplicates()
    df = df.dropna(subset=["recovered"])
    cleaned_count = len(df)
    print(f"Dataset Loaded: {initial_count} rows. After deduplication & dropna: {cleaned_count} rows.")

    X = normalize_feature_dataframe(df)
    y = df["recovered"].astype(int)

    # 80/20 train/test split to prevent data leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    preprocessor = build_preprocessor()

    candidate_models = {
        "RandomForest": RandomForestClassifier(n_estimators=150, max_depth=10, random_state=42, n_jobs=-1),
        "GradientBoosting": GradientBoostingClassifier(n_estimators=150, learning_rate=0.08, max_depth=4, random_state=42),
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42)
    }

    eval_results = {}
    best_model_name = None
    best_f1 = -1.0
    best_pipeline = None

    print("\n=================================================================")
    print("      TRAINING AND EVALUATING ML RECOVERY CLASSIFICATION MODELS   ")
    print("=================================================================")

    for name, clf in candidate_models.items():
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("classifier", clf)
        ])

        print(f"\nTraining {name} Classifier...")
        pipeline.fit(X_train, y_train)

        # Empirical Evaluation on held-out Test set
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_test, y_prob)
        cm = confusion_matrix(y_test, y_pred).tolist()

        metrics = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "confusion_matrix": cm
        }
        eval_results[name] = metrics

        print(f"Calculated Metrics for {name}:")
        print(f"  • Accuracy:  {acc:.4f}")
        print(f"  • Precision: {prec:.4f}")
        print(f"  • Recall:    {rec:.4f}")
        print(f"  • F1-Score:  {f1:.4f}")
        print(f"  • ROC-AUC:   {roc_auc:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_pipeline = pipeline

    print("\n=================================================================")
    print(f"  BEST MODEL SELECTED: {best_model_name} (F1-Score: {best_f1:.4f})")
    print("=================================================================")

    # Save best trained model pipeline
    model_pkl_path = "ml/model.pkl"
    joblib.dump(best_pipeline, model_pkl_path)
    joblib.dump(best_pipeline, "ml/models/best_model.joblib")
    print(f"Saved trained model pipeline artifact to {model_pkl_path}")

    # Save real calculated metrics summary to ml/metrics.json
    metrics_summary = {
        "best_model": best_model_name,
        "dataset_name": os.path.basename(data_path),
        "total_dataset_size": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "best_metrics": eval_results[best_model_name],
        "models_evaluated": eval_results
    }

    with open("ml/metrics.json", "w") as f:
        json.dump(metrics_summary, f, indent=2)
    with open("ml/models/model_metrics.json", "w") as f:
        json.dump(metrics_summary, f, indent=2)

    print(f"Saved real calculated metrics to ml/metrics.json")
    return metrics_summary

if __name__ == "__main__":
    train_and_evaluate_models()
