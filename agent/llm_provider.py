import os
from typing import Dict, Any, List, Optional
from backend.app.core.config import settings

class LLMProviderService:
    """
    Provider-independent AI Service Abstraction supporting:
    - Deterministic Rule-Based Tool Engine (Default zero-dependency fallback)
    - Google Gemini AI Service
    - OpenAI Service
    """

    def __init__(self, provider: Optional[str] = None):
        self.provider = provider or settings.LLM_PROVIDER

    def get_tool_declarations(self) -> List[Dict[str, Any]]:
        """
        Returns JSON schema tool declarations for LLM function calling.
        """
        return [
            {
                "name": "get_transaction_details",
                "description": "Retrieve metadata and failure reason for a transaction.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "transaction_id": {"type": "string", "description": "Transaction ID or code"}
                    },
                    "required": ["transaction_id"]
                }
            },
            {
                "name": "get_customer_history",
                "description": "Retrieve customer tenure, LTV, and historical payment success rate.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "customer_id": {"type": "string", "description": "Customer ID"}
                    },
                    "required": ["customer_id"]
                }
            },
            {
                "name": "predict_recovery_probability",
                "description": "Invoke Scikit-learn ML model to predict recovery probability.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "amount": {"type": "number"},
                        "payment_method": {"type": "string"},
                        "failure_reason": {"type": "string"}
                    },
                    "required": ["amount", "payment_method", "failure_reason"]
                }
            },
            {
                "name": "check_approval_policy",
                "description": "Check governance policy rules for human operator approval requirements.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "amount": {"type": "number"},
                        "probability": {"type": "number"},
                        "action": {"type": "string"}
                    },
                    "required": ["amount", "probability", "action"]
                }
            }
        ]

    def generate_agent_reasoning(self, step_name: str, context: Dict[str, Any]) -> str:
        """
        Generates natural language reasoning summary for agent steps.
        If Gemini/OpenAI API key is configured, uses LLM API; otherwise returns deterministic rationale.
        """
        if self.provider == "gemini" and settings.GEMINI_API_KEY:
            # Placeholder for live Google Gemini SDK call
            return f"[Gemini AI] Evaluated step '{step_name}' with probability score {context.get('probability', 'N/A')}."
        elif self.provider == "openai" and settings.OPENAI_API_KEY:
            # Placeholder for live OpenAI SDK call
            return f"[OpenAI] Evaluated step '{step_name}' with rationale: {context.get('rationale', 'Standard protocol')}."
        else:
            # Deterministic Engine Rationale
            return f"Step '{step_name}' executed deterministically according to system policy rules."
