from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import json
from sqlalchemy.orm import Session

from backend.app.models.transaction import Transaction
from backend.app.models.opportunity import RecoveryOpportunity
from backend.app.models.agent_run import AgentRun
from backend.app.models.profile import Profile
from agent.tools.transaction_tools import get_transaction_details
from agent.tools.customer_tools import get_customer_history
from agent.tools.analysis_tools import analyze_failure_reason
from agent.tools.ml_tools import predict_recovery_probability, calculate_expected_recovery
from agent.tools.policy_tools import select_recovery_action, check_approval_policy
from agent.tools.execution_tools import execute_recovery_action, verify_recovery
from agent.tools.audit_tools import create_audit_log

WORKFLOW_STEPS = [
    "DETECT_REVENUE_LOSS",
    "INVESTIGATE_TRANSACTION",
    "RETRIEVE_CUSTOMER_HISTORY",
    "ANALYZE_FAILURE",
    "PREDICT_RECOVERY",
    "CALCULATE_EXPECTED_RECOVERY",
    "SELECT_RECOVERY_ACTION",
    "CHECK_APPROVAL_POLICY",
    "EXECUTE_ACTION",
    "VERIFY_RECOVERY",
    "CREATE_AUDIT_LOG"
]

class AutonomousAgentEngine:
    """
    Deterministic multi-step state machine agent that executes structured recovery workflows using agent tools.
    """

    def __init__(self, db: Session):
        self.db = db

    def run_agent_workflow(
        self,
        transaction_code_or_id: str,
        human_approved: bool = False,
        user: Optional[Profile] = None
    ) -> Dict[str, Any]:
        """
        Executes or resumes the 11-step autonomous revenue recovery agent workflow.
        """
        # Fetch transaction
        tx = self.db.query(Transaction).filter(
            (Transaction.id == transaction_code_or_id) | (Transaction.transaction_code == transaction_code_or_id)
        ).first()

        if not tx:
            raise ValueError(f"Transaction not found: {transaction_code_or_id}")

        opp = self.db.query(RecoveryOpportunity).filter(RecoveryOpportunity.transaction_id == tx.id).first()
        if not opp:
            opp = RecoveryOpportunity(
                transaction_id=tx.id,
                customer_id=tx.customer_id,
                amount=tx.amount,
                failure_reason=tx.failure_reason,
                status="DETECTED"
            )
            self.db.add(opp)
            self.db.commit()

        # Check existing agent run or create new
        agent_run = self.db.query(AgentRun).filter(AgentRun.opportunity_id == opp.id).first()
        if not agent_run:
            agent_run = AgentRun(
                opportunity_id=opp.id,
                transaction_id=tx.id,
                current_step="DETECT_REVENUE_LOSS",
                status="RUNNING",
                execution_logs=[]
            )
            self.db.add(agent_run)
            self.db.commit()

        logs: List[Dict[str, Any]] = agent_run.execution_logs if agent_run.execution_logs else []
        state_context: Dict[str, Any] = {}

        def record_step(step_name: str, status: str, result: Any, explanation: str):
            entry = {
                "step": step_name,
                "status": status,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "result": result,
                "explanation": explanation
            }
            logs.append(entry)
            agent_run.execution_logs = list(logs)
            agent_run.current_step = step_name
            self.db.commit()

        try:
            # Step 1: Detect Revenue Loss
            record_step(
                "DETECT_REVENUE_LOSS",
                "completed",
                {"transaction_code": tx.transaction_code, "amount": tx.amount, "failure_reason": tx.failure_reason},
                f"Detected revenue loss of ₹{tx.amount:,.2f} for transaction {tx.transaction_code}."
            )

            # Step 2: Investigate Transaction
            tx_details = get_transaction_details(self.db, tx.id)
            state_context["tx_details"] = tx_details
            record_step(
                "INVESTIGATE_TRANSACTION",
                "completed",
                tx_details,
                f"Retrieved transaction metadata: Method {tx_details['payment_method']}, failure '{tx_details['failure_reason']}'."
            )

            # Step 3: Retrieve Customer History
            cust_history = get_customer_history(self.db, tx.customer_id)
            state_context["cust_history"] = cust_history
            record_step(
                "RETRIEVE_CUSTOMER_HISTORY",
                "completed",
                cust_history,
                f"Customer {cust_history['name']} ({cust_history['customer_code']}): LTV ₹{cust_history['lifetime_value']:,.2f}, Historical Success Rate {cust_history['historical_success_rate']*100:.1f}%."
            )

            # Step 4: Analyze Failure Reason
            analysis = analyze_failure_reason(tx.failure_reason)
            state_context["analysis"] = analysis
            record_step(
                "ANALYZE_FAILURE",
                "completed",
                analysis,
                f"Failure analyzed as category '{analysis['category']}': {analysis['root_cause_explanation']}"
            )

            # Step 5: Predict Recovery (ML Model)
            ml_input = {
                "amount": tx.amount,
                "payment_method": tx.payment_method,
                "failure_reason": analysis.get("category", "AUTH_FAILED"),
                "tenure_months": cust_history["tenure_months"],
                "historical_success_rate": cust_history["historical_success_rate"],
                "previous_failures_count": tx.previous_failures_count,
                "lifetime_value": cust_history["lifetime_value"],
                "engagement_score": cust_history["engagement_score"],
                "churn_probability": round(1.0 - cust_history["engagement_score"], 2),
                "days_since_previous_payment": tx.days_since_previous_payment
            }
            pred_res = predict_recovery_probability(ml_input)
            state_context["pred_res"] = pred_res
            record_step(
                "PREDICT_RECOVERY",
                "completed",
                pred_res,
                f"ML model predicted recovery probability of {pred_res['probability']*100:.1f}% (confidence: {pred_res['confidence']*100:.1f}%)."
            )

            # Step 6: Calculate Expected Recovery
            exp_res = calculate_expected_recovery(tx.amount, pred_res["probability"])
            state_context["exp_res"] = exp_res
            record_step(
                "CALCULATE_EXPECTED_RECOVERY",
                "completed",
                exp_res,
                f"Calculated expected recoverable revenue: ₹{exp_res['expected_recovery']:,.2f} out of ₹{tx.amount:,.2f}."
            )

            # Step 7: Select Recovery Action
            action_sel = select_recovery_action(tx.failure_reason, pred_res["probability"], tx.amount)
            state_context["action_sel"] = action_sel
            record_step(
                "SELECT_RECOVERY_ACTION",
                "completed",
                action_sel,
                f"Recommended recovery action: '{action_sel['recommended_action']}' — {action_sel['rationale']}"
            )

            # Step 8: Check Approval Policy
            policy_res = check_approval_policy(tx.amount, pred_res["probability"], action_sel["recommended_action"])
            state_context["policy_res"] = policy_res

            if policy_res["requires_human_approval"] and not human_approved:
                agent_run.status = "WAITING_APPROVAL"
                opp.status = "PENDING_APPROVAL"
                self.db.commit()
                record_step(
                    "CHECK_APPROVAL_POLICY",
                    "waiting_approval",
                    policy_res,
                    f"POLICY GATED: {policy_res['approval_reason']} Workflow paused for human operator approval."
                )
                return {
                    "agent_run_id": agent_run.id,
                    "status": "WAITING_APPROVAL",
                    "opportunity_id": opp.id,
                    "transaction_code": tx.transaction_code,
                    "current_step": "CHECK_APPROVAL_POLICY",
                    "policy": policy_res,
                    "logs": logs
                }
            else:
                approval_status_txt = "APPROVED_BY_HUMAN" if human_approved else "AUTO_APPROVED_BY_POLICY"
                record_step(
                    "CHECK_APPROVAL_POLICY",
                    "completed",
                    {**policy_res, "approval_status": approval_status_txt},
                    f"Policy check passed: {approval_status_txt} — {policy_res['approval_reason']}"
                )

            # Step 9: Execute Simulated Action
            exec_res = execute_recovery_action(
                self.db,
                opportunity_id=opp.id,
                action_type=action_sel["recommended_action"],
                transaction_id=tx.id,
                simulation_override_success=True
            )
            state_context["exec_res"] = exec_res
            record_step(
                "EXECUTE_ACTION",
                "completed",
                exec_res,
                f"Executed simulated recovery action '{exec_res['action_type']}': Result = {exec_res['status']}."
            )

            # Step 10: Verify Recovery
            ver_res = verify_recovery(self.db, tx.id)
            state_context["ver_res"] = ver_res
            record_step(
                "VERIFY_RECOVERY",
                "completed",
                ver_res,
                f"Verified transaction status: {ver_res['status']} (Verified Recovered = {ver_res['is_verified_recovered']})."
            )

            # Step 11: Create Audit Log
            u_id = user.auth_user_id if user else None
            u_email = user.email if user else None
            u_role = user.role if user else None
            
            audit_res = create_audit_log(
                self.db,
                agent_run_id=agent_run.id,
                transaction_id=tx.id,
                action=action_sel["recommended_action"],
                reason=action_sel["rationale"],
                approval_status="APPROVED_BY_HUMAN" if human_approved else "AUTO_APPROVED",
                execution_result=exec_res["status"],
                actor="HUMAN_OPERATOR" if human_approved else "AI_AGENT",
                user_id=u_id,
                user_email=u_email,
                user_role=u_role
            )
            record_step(
                "CREATE_AUDIT_LOG",
                "completed",
                audit_res,
                f"Created immutable audit log {audit_res['audit_log_id']} for user {u_email or 'SYSTEM'}."
            )

            agent_run.status = "COMPLETED"
            agent_run.completed_at = datetime.now(timezone.utc)
            opp.status = "RECOVERED"
            opp.recovery_probability = pred_res["probability"]
            opp.expected_recovery = exp_res["expected_recovery"]
            opp.recommended_action = action_sel["recommended_action"]
            self.db.commit()

            return {
                "agent_run_id": agent_run.id,
                "status": "COMPLETED",
                "opportunity_id": opp.id,
                "transaction_code": tx.transaction_code,
                "current_step": "CREATE_AUDIT_LOG",
                "logs": logs
            }

        except Exception as e:
            agent_run.status = "FAILED"
            self.db.commit()
            record_step(
                agent_run.current_step,
                "failed",
                {"error": str(e)},
                f"Workflow execution failed: {str(e)}"
            )
            raise e
