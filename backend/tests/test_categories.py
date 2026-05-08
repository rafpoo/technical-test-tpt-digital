import pytest
from unittest.mock import AsyncMock, patch
import uuid

@pytest.mark.asyncio
async def test_get_all_categories(client, auth_headers):
    from routers import categories as cat_router
    with patch.object(cat_router.category_service, 'get_all_categories', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = [
            {"id": str(uuid.uuid4()), "name": "Cat1", "description": "Desc1", "created_at": "2026-01-01", "updated_at": "2026-01-01"}
        ]
        response = await client.get("/api/categories", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()) == 1

@pytest.mark.asyncio
async def test_create_category(client, auth_headers):
    from routers import categories as cat_router
    with patch.object(cat_router.category_service, 'create_category', new_callable=AsyncMock) as mock_create:
        cat_id = str(uuid.uuid4())
        mock_create.return_value = {
            "id": cat_id, "name": "New Cat", "description": "Desc",
            "created_at": "2026-01-01", "updated_at": "2026-01-01"
        }
        response = await client.post("/api/categories", json={
            "name": "New Cat",
            "description": "Desc"
        }, headers=auth_headers)
        assert response.status_code == 201
        assert response.json()["name"] == "New Cat"

@pytest.mark.asyncio
async def test_get_category_by_id(client, auth_headers):
    from routers import categories as cat_router
    with patch.object(cat_router.category_service, 'get_category_by_id', new_callable=AsyncMock) as mock_get:
        cat_id = str(uuid.uuid4())
        mock_get.return_value = {
            "id": cat_id, "name": "Cat1", "description": "Desc1",
            "created_at": "2026-01-01", "updated_at": "2026-01-01"
        }
        response = await client.get(f"/api/categories/{cat_id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["id"] == cat_id

@pytest.mark.asyncio
async def test_update_category(client, auth_headers):
    from routers import categories as cat_router
    with patch.object(cat_router.category_service, 'update_category', new_callable=AsyncMock) as mock_update:
        cat_id = str(uuid.uuid4())
        mock_update.return_value = {
            "id": cat_id, "name": "Updated", "description": "Desc",
            "created_at": "2026-01-01", "updated_at": "2026-01-01"
        }
        response = await client.put(f"/api/categories/{cat_id}", json={
            "name": "Updated"
        }, headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["name"] == "Updated"

@pytest.mark.asyncio
async def test_delete_category(client, auth_headers):
    from routers import categories as cat_router
    with patch.object(cat_router.category_service, 'delete_category', new_callable=AsyncMock) as mock_delete:
        mock_delete.return_value = True
        response = await client.delete(f"/api/categories/{str(uuid.uuid4())}", headers=auth_headers)
        assert response.status_code == 204