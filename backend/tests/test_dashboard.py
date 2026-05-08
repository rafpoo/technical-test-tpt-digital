import pytest
import uuid
from unittest.mock import patch, AsyncMock
from datetime import datetime

@pytest.mark.asyncio
async def test_get_dashboard_stats(client, auth_headers):
    from routers import dashboard as dash_router
    with patch.object(dash_router.dashboard_service, 'get_stats', new_callable=AsyncMock) as mock_stats:
        mock_stats.return_value = {
            "total_products": 10,
            "total_categories": 3,
            "total_inventory_value": 1000.0,
            "low_stock_products": []
        }
        response = await client.get("/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_products"] == 10
        assert data["total_categories"] == 3
        assert data["total_inventory_value"] == 1000.0

@pytest.mark.asyncio
async def test_dashboard_with_low_stock(client, auth_headers):
    from routers import dashboard as dash_router
    with patch.object(dash_router.dashboard_service, 'get_stats', new_callable=AsyncMock) as mock_stats:
        cat_id = str(uuid.uuid4())
        mock_stats.return_value = {
            "total_products": 5,
            "total_categories": 2,
            "total_inventory_value": 500.0,
            "low_stock_products": [
                {
                    "id": str(uuid.uuid4()), "name": "Low Stock Item",
                    "description": "Desc", "price": 10.0,
                    "category_id": cat_id, "stock_quantity": 3,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            ]
        }
        response = await client.get("/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()["low_stock_products"]) == 1