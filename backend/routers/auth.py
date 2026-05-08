from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.auth import LoginRequest, LoginResponse
from services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

auth_service = AuthService()

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    try:
        return await auth_service.login(login_data.username, login_data.password)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/verify")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = await auth_service.verify_token(credentials.credentials)
        if payload:
            return {"valid": True, "user_id": payload.get("sub")}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )