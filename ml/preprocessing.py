import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

NUMERIC_FEATURES = [
    "amount_inr",
    "customer_tenure_months",
    "historical_success_rate",
    "previous_failures_count",
    "customer_lifetime_value_inr",
    "engagement_score",
    "churn_probability",
    "days_since_previous_payment"
]

CATEGORICAL_FEATURES = [
    "payment_method",
    "failure_reason"
]

def build_preprocessor() -> ColumnTransformer:
    """
    Constructs ColumnTransformer for preprocessing numeric and categorical features
    without data leakage (fit only on training set).
    """
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES)
        ]
    )
    return preprocessor

def normalize_feature_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Ensures input DataFrame column names match standard feature column names.
    Handles aliases seamlessly.
    """
    df_clean = df.copy()
    rename_map = {
        "transaction_amount": "amount_inr",
        "amount": "amount_inr",
        "customer_tenure": "customer_tenure_months",
        "tenure_months": "customer_tenure_months",
        "historical_payment_success": "historical_success_rate",
        "previous_failures": "previous_failures_count",
        "customer_lifetime_value": "customer_lifetime_value_inr",
        "lifetime_value": "customer_lifetime_value_inr",
    }
    for old_col, new_col in rename_map.items():
        if old_col in df_clean.columns and new_col not in df_clean.columns:
            df_clean[new_col] = df_clean[old_col]

    # Fill defaults for missing numeric/categorical columns if needed
    defaults = {
        "amount_inr": 10000.0,
        "customer_tenure_months": 12,
        "historical_success_rate": 0.85,
        "previous_failures_count": 1,
        "customer_lifetime_value_inr": 50000.0,
        "engagement_score": 0.70,
        "churn_probability": 0.20,
        "days_since_previous_payment": 30,
        "payment_method": "CREDIT_CARD",
        "failure_reason": "Temporary payment authorization failure"
    }

    for col, default_val in defaults.items():
        if col not in df_clean.columns:
            df_clean[col] = default_val

    return df_clean[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
