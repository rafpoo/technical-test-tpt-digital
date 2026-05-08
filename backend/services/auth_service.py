from typing import Optional
from datetime import datetime
from database.user_repository import UserRepository
from database.connection import get_database
from auth.security import verify_password, get_password_hash, create_access_token
from models.auth import UserCreate, UserResponse, LoginResponse

class AuthService:
    def __init__(self):
        self.db = None
        self.user_repo = None

    async def initialize(self):
        self.db = await get_database()
        self.user_repo = UserRepository(self.db)

    async def register(self, user_data: UserCreate) -> UserResponse:
        existing_user = await self.user_repo.find_by_username(user_data.username)
        if existing_user:
            raise ValueError("Username already exists")

        user_dict = user_data.dict()
        user_dict["password_hash"] = get_password_hash(user_dict.pop("password"))
        user_dict["created_at"] = datetime.utcnow()
        user_dict["updated_at"] = datetime.utcnow()

        user_id = await self.user_repo.create(user_dict)
        user_dict["id"] = user_id
        return UserResponse(**user_dict)

    async def login(self, username: str, password: str) -> LoginResponse:
        user = await self.user_repo.find_by_username(username)
        if not user or not verify_password(password, user["password_hash"]):
            raise ValueError("Incorrect username or password")

        access_token = create_access_token(data={"sub": user["id"]})
        user_response = UserResponse(**user)
        return LoginResponse(access_token=access_token, user=user_response)

    async def verify_token(self, token: str) -> Optional[dict]:
        from auth.security import decode_access_token
        return decode_access_token(token)