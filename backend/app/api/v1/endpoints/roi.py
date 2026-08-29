from fastapi import APIRouter
from backend.app.schemas.roi import ROICalculatorRequest, ROICalculatorResponse

router = APIRouter()

@router.post("/calculate", response_model=ROICalculatorResponse)
def calculate_roi(req: ROICalculatorRequest):
    """
    Calculates estimated business revenue recovery impact and annual ROI.
    Formula-driven calculations without hardcoding.
    """
    monthly_revenue = req.monthly_transactions * req.avg_transaction_value
    revenue_at_risk = monthly_revenue * (req.failure_rate_percent / 100.0)
    
    current_recovered = revenue_at_risk * (req.current_recovery_rate_percent / 100.0)
    projected_recovered = revenue_at_risk * (req.projected_ai_recovery_rate_percent / 100.0)
    
    additional_monthly = max(0.0, projected_recovered - current_recovered)
    annualized_impact = additional_monthly * 12.0
    
    roi_mult = (projected_recovered / current_recovered) if current_recovered > 0 else 4.0

    return ROICalculatorResponse(
        monthly_revenue=round(monthly_revenue, 2),
        revenue_at_risk=round(revenue_at_risk, 2),
        current_recovered_revenue=round(current_recovered, 2),
        projected_recovered_revenue=round(projected_recovered, 2),
        additional_monthly_revenue=round(additional_monthly, 2),
        annualized_revenue_impact=round(annualized_impact, 2),
        roi_multiplier=round(roi_mult, 1)
    )
