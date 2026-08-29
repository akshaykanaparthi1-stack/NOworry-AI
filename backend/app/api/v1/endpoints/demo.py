from fastapi import APIRouter
from data.seed_demo_data import seed_database

router = APIRouter()

@router.post("/reset")
def reset_demo_environment():
    """
    Resets database environment and seeds deterministic demo transaction TX-10492.
    """
    seed_database()
    return {
        "status": "success",
        "message": "Demo environment reset and seeded with transaction TX-10492."
    }
