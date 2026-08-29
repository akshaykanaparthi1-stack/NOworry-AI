import os
import numpy as np
import pandas as pd
import uuid

def generate_synthetic_dataset(num_samples: int = 50000, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic dataset of revenue leakage transactions (50,000+ records)
    with realistic correlations between features and recovery outcomes.
    
    Relationships:
    - High historical success + long tenure + temporary failure -> increases recovery probability.
    - Repeated failures + low engagement + high churn -> decreases recovery probability.
    """
    np.random.seed(random_state)

    payment_methods = ["CREDIT_CARD", "UPI", "AUTO_DEBIT", "NET_BANKING"]
    pm_probs = [0.45, 0.30, 0.15, 0.10]

    failure_reasons = [
        "CARD_EXPIRED",
        "INSUFFICIENT_FUNDS",
        "AUTH_FAILED",
        "GATEWAY_TIMEOUT",
        "NETWORK_ERROR"
    ]
    fr_probs = [0.25, 0.35, 0.20, 0.12, 0.08]

    # Generate realistic unique customer IDs
    customer_ids = [f"CUST-SYNTH-{idx:06d}" for idx in range(1, num_samples + 1)]

    # Feature distribution generation
    amounts = np.round(np.random.exponential(scale=3500, size=num_samples) + 299, 2)
    amounts = np.clip(amounts, 199.0, 50000.0)

    payment_method_col = np.random.choice(payment_methods, size=num_samples, p=pm_probs)
    failure_reason_col = np.random.choice(failure_reasons, size=num_samples, p=fr_probs)

    tenure_months = np.random.randint(1, 60, size=num_samples)
    historical_success_rate = np.clip(np.random.beta(a=8, b=2, size=num_samples), 0.3, 0.99)
    previous_failures = np.random.poisson(lam=1.2, size=num_samples)
    lifetime_value = np.round(tenure_months * amounts * np.random.uniform(0.5, 1.5, size=num_samples), 2)
    engagement_score = np.clip(np.random.normal(loc=0.7, scale=0.18, size=num_samples), 0.1, 1.0)
    churn_probability = np.clip(1.0 - engagement_score + np.random.normal(loc=0, scale=0.05, size=num_samples), 0.01, 0.95)
    days_since_previous_payment = np.random.randint(1, 90, size=num_samples)

    # Calculate log-odds score for recovery probability
    # Base intercept
    log_odds = 0.5

    # Positive factors (High success + long tenure + temporary failure)
    log_odds += (historical_success_rate - 0.7) * 3.5
    log_odds += (engagement_score - 0.5) * 2.0
    log_odds += np.where(tenure_months > 12, 0.6, -0.2)

    # Reason specific modifiers
    reason_effects = {
        "CARD_EXPIRED": 1.2,        # Easily recoverable via update prompt
        "GATEWAY_TIMEOUT": 1.8,     # Very easily recoverable via quick retry
        "NETWORK_ERROR": 1.5,       # Easily recoverable via quick retry
        "AUTH_FAILED": 0.4,         # Moderately recoverable
        "INSUFFICIENT_FUNDS": -1.1  # Harder to recover immediately
    }
    for reason, effect in reason_effects.items():
        log_odds += np.where(failure_reason_col == reason, effect, 0)

    # Negative factors (Repeated failures + low engagement + high churn)
    log_odds -= (previous_failures * 0.4)
    log_odds -= (churn_probability * 1.5)
    log_odds -= np.where(days_since_previous_payment > 45, 0.5, 0)

    # Convert log-odds to true probability via Sigmoid
    prob_recovered = 1.0 / (1.0 + np.exp(-log_odds))

    # Binary outcome with Bernoulli trial
    recovered = (np.random.uniform(0, 1, size=num_samples) < prob_recovered).astype(int)
    statuses = np.where(recovered == 1, "RECOVERED", "FAILED")

    df = pd.DataFrame({
        "customer_id": customer_ids,
        "amount": amounts,
        "transaction_amount": amounts,
        "payment_method": payment_method_col,
        "status": statuses,
        "failure_reason": failure_reason_col,
        "customer_tenure": tenure_months,
        "historical_success_rate": historical_success_rate,
        "historical_payment_success_rate": historical_success_rate,
        "previous_failures": previous_failures,
        "customer_lifetime_value": lifetime_value,
        "engagement_score": engagement_score,
        "churn_probability": churn_probability,
        "days_since_previous_payment": days_since_previous_payment,
        "recovered": recovered
    })

    return df

if __name__ == "__main__":
    os.makedirs("ml/data", exist_ok=True)
    out_path = "ml/data/synthetic_transactions.csv"
    print(f"Generating 50,000 synthetic transaction records...")
    df = generate_synthetic_dataset(50000)
    df.to_csv(out_path, index=False)
    print(f"Dataset successfully created and saved to {out_path} with shape {df.shape}")
    print(f"Recovery rate in dataset: {df['recovered'].mean() * 100:.2f}%")
