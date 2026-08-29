from typing import Dict, Any

def select_recovery_action(failure_reason: str, probability: float, amount: float) -> Dict[str, Any]:
    """
    Selects the optimal recovery action based on failure reason, probability, and transaction amount.
    """
    reason_upper = failure_reason.upper()

    if probability < 0.35:
        if amount > 10000:
            recommended_action = "ESCALATE_TO_HUMAN"
            rationale = "Low ML recovery probability (<0.35) for high value transaction warrants human review."
        else:
            recommended_action = "NO_ACTION"
            rationale = "Low ML recovery probability (<0.35); automated recovery not cost-effective."
    elif any(k in reason_upper for k in ["EXPIRED", "CARD_EXPIRED"]):
        recommended_action = "REQUEST_PAYMENT_METHOD_UPDATE"
        rationale = "Card expiration requires customer to update payment credentials."
    elif any(k in reason_upper for k in ["INSUFFICIENT", "FUNDS", "BALANCE"]):
        if probability >= 0.75:
            recommended_action = "SEND_PAYMENT_REMINDER"
            rationale = "High probability customer; gentle payment reminder recommended."
        else:
            recommended_action = "OFFER_RETENTION_DISCOUNT"
            rationale = "Moderate recovery probability; retention discount offered to incentivize payment."
    elif any(k in reason_upper for k in ["AUTH", "AUTHORIZATION", "TIMEOUT", "GATEWAY", "NETWORK"]):
        recommended_action = "RETRY_PAYMENT"
        rationale = "Transient gateway or authorization failure is ideal for automated payment retry."
    else:
        recommended_action = "RETRY_PAYMENT" if probability >= 0.60 else "ESCALATE_TO_HUMAN"
        rationale = "Standard recovery protocol based on probability score."

    return {
        "recommended_action": recommended_action,
        "rationale": rationale,
        "recovery_probability": probability,
        "amount": amount
    }

def check_approval_policy(amount: float, probability: float, action: str) -> Dict[str, Any]:
    """
    Evaluates enterprise governance business policy rules to check if human approval is required.
    
    Policy Rules:
    - Amount < ₹1,000: Auto allowed if probability >= 0.70; else human approval required.
    - ₹1,000 <= Amount <= ₹10,000: Human approval required.
    - Amount > ₹10,000: Mandatory human approval required.
    - Action == ESCALATE_TO_HUMAN: Always requires human review.
    """
    if action == "NO_ACTION":
        return {
            "requires_human_approval": False,
            "policy_applied": "NO_ACTION_RULE",
            "approval_reason": "No execution action specified."
        }

    if action == "ESCALATE_TO_HUMAN":
        return {
            "requires_human_approval": True,
            "policy_applied": "ESCALATION_RULE",
            "approval_reason": "Action explicitly set to human escalation."
        }

    if amount > 10000.0:
        return {
            "requires_human_approval": True,
            "policy_applied": "HIGH_VALUE_MANDATORY_POLICY",
            "approval_reason": f"Transaction amount ₹{amount:,.2f} exceeds ₹10,000 mandatory threshold."
        }

    if 1000.0 <= amount <= 10000.0:
        return {
            "requires_human_approval": True,
            "policy_applied": "MID_VALUE_APPROVAL_POLICY",
            "approval_reason": f"Transaction amount ₹{amount:,.2f} falls within ₹1,000–₹10,000 human review bracket."
        }

    # Amount < ₹1,000
    if probability >= 0.70:
        return {
            "requires_human_approval": False,
            "policy_applied": "LOW_VALUE_AUTO_ALLOW_POLICY",
            "approval_reason": f"Transaction amount ₹{amount:,.2f} is below ₹1,000 with high ML confidence ({probability:.2f})."
        }
    else:
        return {
            "requires_human_approval": True,
            "policy_applied": "LOW_CONFIDENCE_REVIEW_POLICY",
            "approval_reason": f"Transaction amount ₹{amount:,.2f} requires approval due to low recovery probability ({probability:.2f})."
        }
