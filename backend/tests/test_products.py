import pytest
from unittest.mock import patch, AsyncMock
import uuid

@pytest.mark.asyncio
async def test_get_all_products(client, auth_headers):
    from routers import products as prod_router
    with patch.object(prod_router.product_service, 'get_all_products', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = [
            {"id": str(uuid.uuid4()), "name": "Prod1", "description": "Desc",
             "price": 10.0, "category_id": str(uuid.uuid4()),
             "stock_quantity": 5, "created_at": "2026-01-01", "updated_at": "2026-01-01"}
        ]
        response = await client.get("/api/products", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()) == 1

@pytest.mark.asyncio
async def test_get_products_with_category_filter(client, auth_headers):
    from routers import products as prod_router
    with patch.object(prod_router.product_service, 'get_all_products', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = []
        cat_id = str(uuid.uuid4())
        response = await client.get(f"/api/products?category_id={cat_id}", headers=auth_headers)
        assert response.status_code == 200
        mock_get.assert_called_once_with(cat_id)

@pytest.mark.asyncio
async def test_create_product(client, auth_headers):
    from routers import products as prod_router
    with patch.object(prod_router.product_service, 'create_product', new_callable=AsyncMock) as mock_create:
        prod_id = str(uuid.uuid4())
        cat_id = str(uuid.uuid4())
        mock_create.return_value = {
            "id": prod_id, "name": "New Prod", "description": "Desc",
            "price": 99.99, "category_id": cat_id,
            "stock_quantity": 10, "created_at": "2026-01-01", "updated_at": "2026-01-01"
        }
        response = await client.post("/api/products", json={
            "name": "New Prod",
            "price": 99.99,
            "category_id": cat_id,
            "stock_quantity": 10
        }, headers=auth_headers)
        assert response.status_code == 201
        assert response.json()["name"] == "New Prod"

@pytest.mark.asyncio
async def test_get_product_by_id(client, auth_headers):
    from routers import products as prod_router
    with patch.object(prod_router.product_service, 'get_product_by_id', new_callable=AsyncMock) as mock_get:
        prod_id = str(uuid.uuid4())
        mock_get.return_value = {
            "id": prod_id, "name": "Prod1", "description": "Desc",
            "price": 10.0, "category_id": str(uuid.uuid4()),
            "stock_quantity": 5, "created_at": "2026-01-01", "updated_at": "2026-01-01"
        }
        response = await client.get(f"/api/products/{prod_id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["id"] == prod_id

@pytest.mark.asyncio
async def test_update_product(client, auth_headers):
    from routers import products as prod_router
    with patch.object(prod_router.product_service, 'update_product', new_callable=AsyncMock) as mock_update:
        prod_id = str(uuid.uuid4())
        mock_update.return_value = {
            "id": prod_id, "name": "Updated", "description": "Desc",
            "price": 15.0, "category_id": str(uuid.uuid4()),
            "stock_quantity": 10, "created_at": "2026-01-01", "updated_at": "2026-01-01"
        }
        response = await client.put(f"/api/products/{prod_id}", json={
            "name": "Updated"
        }, headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["name"] == "Updated"

@pytest.mark.asyncio
async def test_delete_product(client, auth_headers):
    from routers import products as prod_router
    with patch.object(prod_router.product_service, 'delete_product', new_callable=AsyncMock) as mock_delete:
        mock_delete.return_value = True
        response = await client.delete(f"/api/products/{str(uuid.uuid4())}", headers=auth_headers)
        assert response.status_code == 204