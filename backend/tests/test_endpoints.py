import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://localhost") as ac:
        yield ac


@pytest.mark.anyio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "services" in data


@pytest.mark.anyio
async def test_root_endpoint(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["service"] == "CVBER Free API"


@pytest.mark.anyio
async def test_api_ai_status(client: AsyncClient):
    response = await client.get("/api/ai-status")
    assert response.status_code == 200
    data = response.json()
    assert "ai_service" in data
    assert "environment" in data


@pytest.mark.anyio
async def test_diagnostics_all_requires_auth(client: AsyncClient):
    response = await client.get("/diagnostics/all")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_register_invalid_input(client: AsyncClient):
    response = await client.post(
        "/auth/register",
        json={"email": "", "password": ""}
    )
    assert response.status_code in (400, 422)


@pytest.mark.anyio
async def test_login_invalid_input(client: AsyncClient):
    response = await client.post(
        "/auth/login",
        json={"email": "nonexistent@test.com", "password": "wrongpass"}
    )
    assert response.status_code in (401, 422)
