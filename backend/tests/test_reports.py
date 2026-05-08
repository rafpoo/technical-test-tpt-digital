import pytest
from unittest.mock import patch, AsyncMock

@pytest.mark.asyncio
async def test_export_products_csv(client, auth_headers):
    from routers import reports as report_router
    with patch.object(report_router.report_service, 'generate_products_csv', new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = 'name,description,price,category,stock_quantity\n"Prod1","Desc",10.0,"Cat1",5'
        response = await client.get("/api/reports/products", headers=auth_headers)
        assert response.status_code == 200
        assert "text/csv" in response.headers["content-type"]
        assert "attachment" in response.headers["content-disposition"]
        assert "Prod1" in response.text

@pytest.mark.asyncio
async def test_export_products_empty(client, auth_headers):
    from routers import reports as report_router
    with patch.object(report_router.report_service, 'generate_products_csv', new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = 'name,description,price,category,stock_quantity'
        response = await client.get("/api/reports/products", headers=auth_headers)
        assert response.status_code == 200
        assert "text/csv" in response.headers["content-type"]

@pytest.mark.asyncio
async def test_export_products_unauthorized(client):
    response = await client.get("/api/reports/products")
    assert response.status_code == 401
