from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

NUMERIC_FEATURES = [
    "transaction_amount",
    "customer_tenure",
    "historical_payment_success",
    "previous_failures",
    "customer_lifetime_value",
    "engagement_score",
    "churn_probability",
    "days_since_previous_payment",
    "transaction_history"
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
