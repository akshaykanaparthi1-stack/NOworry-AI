from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.db import get_db
from backend.app.core.auth import get_current_user, require_roles
from backend.app.models.agent_run import AgentRun
from backend.app.models.opportunity import RecoveryOpportunity
from backend.app.models.profile import Profile
from backend.app.schemas.agent import AgentRunRequest, AgentRunResponse, HumanApprovalRequest
from agent.engine import AutonomousAgentEngine

router = APIRouter()

@router.post("/run", response_model=AgentRunResponse)
def trigger_agent_run(
    req: AgentRunRequest,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(require_roles(["ADMIN", "OPERATOR"]))
):
    """
    Triggers autonomous multi-step agent workflow execution for a given transaction.
    Requires ADMIN or OPERATOR role.
    """
    try:
        engine = AutonomousAgentEngine(db)
        result = engine.run_agent_workflow(
            req.transaction_code_or_id,
            human_approved=req.human_approved,
            user=current_user
        )
        return AgentRunResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent execution error: {str(e)}")

@router.post("/approve", response_model=AgentRunResponse)
def approve_agent_run(
    req: HumanApprovalRequest,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(require_roles(["ADMIN", "OPERATOR"]))
):
    """
    Submits human operator approval for a gated transaction and resumes execution.
    Requires ADMIN or OPERATOR role.
    """
    agent_run = db.query(AgentRun).filter(AgentRun.id == req.agent_run_id).first()
    if not agent_run:
        raise HTTPException(status_code=404, detail="Agent run not found")

    if not req.approved:
        agent_run.status = "ESCALATED"
        opp = db.query(RecoveryOpportunity).filter(RecoveryOpportunity.id == agent_run.opportunity_id).first()
        if opp:
            opp.status = "ESCALATED"
        db.commit()
        return AgentRunResponse(
            agent_run_id=agent_run.id,
            status="ESCALATED",
            opportunity_id=agent_run.opportunity_id,
            transaction_code="",
            current_step="CHECK_APPROVAL_POLICY",
            logs=agent_run.execution_logs
        )

    # Resume workflow with human_approved = True
    engine = AutonomousAgentEngine(db)
    result = engine.run_agent_workflow(
        agent_run.transaction_id,
        human_approved=True,
        user=current_user
    )
    return AgentRunResponse(**result)

@router.get("/run/{run_id}", response_model=AgentRunResponse)
def get_agent_run_status(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """
    Retrieves latest status and step logs for an agent run.
    """
    agent_run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not agent_run:
        raise HTTPException(status_code=404, detail="Agent run not found")

    return AgentRunResponse(
        agent_run_id=agent_run.id,
        status=agent_run.status,
        opportunity_id=agent_run.opportunity_id,
        transaction_code="",
        current_step=agent_run.current_step,
        logs=agent_run.execution_logs or []
    )
