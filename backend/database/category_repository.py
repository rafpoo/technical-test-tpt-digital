from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid

class CategoryRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.categories

    async def find_all(self) -> List[Dict[str, Any]]:
        return await self.collection.find().to_list(length=None)

    async def find_by_id(self, category_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"id": category_id})

    async def find_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"name": name})

    async def create(self, category_data: Dict[str, Any]) -> str:
        category_data["id"] = str(uuid.uuid4())
        await self.collection.insert_one(category_data)
        return category_data["id"]

    async def update(self, category_id: str, category_data: Dict[str, Any]) -> bool:
        result = await self.collection.update_one(
            {"id": category_id},
            {"$set": category_data}
        )
        return result.modified_count > 0

    async def delete(self, category_id: str) -> bool:
        result = await self.collection.delete_one({"id": category_id})
        return result.deleted_count > 0
