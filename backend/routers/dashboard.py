from fastapi import APIRouter, Depends
from models.dashboard import DashboardStats
from services.dashboard_service import DashboardService
from auth.dependencies import get_current_user_id

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
dashboard_service = DashboardService()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(user_id: str = Depends(get_current_user_id)):
    return await dashboard_service.get_stats()