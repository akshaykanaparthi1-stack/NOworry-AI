from typing import Dict, Any

def analyze_failure_reason(failure_reason_str: str) -> Dict[str, Any]:
    """
    Analyzes transaction failure reason string and categorizes the underlying root cause.
    """
    reason_upper = failure_reason_str.upper()

    if any(k in reason_upper for k in ["EXPIRED", "CARD_EXPIRED", "EXPIRED_CARD"]):
        category = "CREDENTIAL_EXPIRATION"
        root_cause = "Customer's stored payment card has expired or is invalid."
        recommended_strategy = "REQUEST_PAYMENT_METHOD_UPDATE"
        recoverability_tier = "HIGH"

    elif any(k in reason_upper for k in ["INSUFFICIENT", "FUNDS", "BALANCE", "INSUFFICIENT_FUNDS"]):
        category = "INSUFFICIENT_FUNDS"
        root_cause = "Account balance was insufficient at time of automated billing."
        recommended_strategy = "SEND_PAYMENT_REMINDER"
        recoverability_tier = "MEDIUM"

    elif any(k in reason_upper for k in ["TIMEOUT", "GATEWAY", "NETWORK", "HANDSHAKE"]):
        category = "TRANSIENT_INFRASTRUCTURE"
        root_cause = "Payment gateway network timeout or temporary bank infrastructure outage."
        recommended_strategy = "RETRY_PAYMENT"
        recoverability_tier = "VERY_HIGH"

    elif any(k in reason_upper for k in ["AUTH", "AUTHORIZATION", "AUTHENTICATION", "DECLINED"]):
        category = "TEMPORARY_AUTHORIZATION"
        root_cause = "Temporary card issuer authorization freeze or 3D-Secure challenge timeout."
        recommended_strategy = "RETRY_PAYMENT"
        recoverability_tier = "HIGH"

    else:
        category = "UNKNOWN_GATEWAY_ERROR"
        root_cause = "Unspecified payment gateway decline code."
        recommended_strategy = "ESCALATE_TO_HUMAN"
        recoverability_tier = "LOW"

    return {
        "failure_reason": failure_reason_str,
        "category": category,
        "root_cause_explanation": root_cause,
        "recommended_strategy": recommended_strategy,
        "recoverability_tier": recoverability_tier
    }
