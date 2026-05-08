from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid

class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.users

    async def find_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"username": username})

    async def create(self, user_data: Dict[str, Any]) -> str:
        user_data["id"] = str(uuid.uuid4())
        result = await self.collection.insert_one(user_data)
        return str(result.inserted_id)

    async def find_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"id": user_id})