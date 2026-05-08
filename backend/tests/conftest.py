import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch
import uuid
from datetime import datetime

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.fixture
async def client():
    with patch("database.connection.get_database", return_value=None):
        from main import app
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

@pytest.fixture
async def auth_headers(client):
    from auth.security import create_access_token
    import uuid

    user_id = str(uuid.uuid4())
    token = create_access_token(data={"sub": user_id})
    return {"Authorization": f"Bearer {token}"}
