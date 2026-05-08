import pytest
from datetime import datetime
from unittest.mock import AsyncMock, patch
import uuid

@pytest.mark.asyncio
async def test_login_success(client, auth_headers):
    from routers import auth as auth_router
    with patch.object(auth_router.auth_service, 'login', new_callable=AsyncMock) as mock_login:
        mock_login.return_value = {
            "access_token": "test-token",
            "token_type": "bearer",
            "user": {
                "id": str(uuid.uuid4()),
                "username": "admin",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
        response = await client.post("/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200
        assert "access_token" in response.json()

@pytest.mark.asyncio
async def test_login_wrong_credentials(client):
    from routers import auth as auth_router
    with patch.object(auth_router.auth_service, 'login', new_callable=AsyncMock) as mock_login:
        mock_login.side_effect = ValueError("Incorrect username or password")
        response = await client.post("/api/auth/login", json={
            "username": "admin",
            "password": "wrong"
        })
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_verify_token_valid(client, auth_headers):
    response = await client.get("/api/auth/verify", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["valid"] == True

@pytest.mark.asyncio
async def test_verify_token_invalid(client):
    response = await client.get("/api/auth/verify", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 401