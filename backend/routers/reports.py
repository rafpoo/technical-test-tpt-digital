from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from services.report_service import ReportService
from auth.dependencies import get_current_user_id

router = APIRouter(prefix="/api/reports", tags=["reports"])
report_service = ReportService()

@router.on_event("startup")
async def startup_event():
    await report_service.initialize()

@router.get("/products")
async def export_products_csv(user_id: str = Depends(get_current_user_id)):
    try:
        csv_content = await report_service.generate_products_csv()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=products.csv"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))