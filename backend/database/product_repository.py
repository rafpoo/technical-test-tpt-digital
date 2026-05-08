from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid

class ProductRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.products

    async def find_all(self, category_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query = {}
        if category_id:
            query["category_id"] = category_id
        return await self.collection.find(query).to_list(length=None)

    async def find_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"id": product_id})

    async def create(self, product_data: Dict[str, Any]) -> str:
        product_data["id"] = str(uuid.uuid4())
        await self.collection.insert_one(product_data)
        return product_data["id"]

    async def update(self, product_id: str, product_data: Dict[str, Any]) -> bool:
        result = await self.collection.update_one(
            {"id": product_id},
            {"$set": product_data}
        )
        return result.modified_count > 0

    async def delete(self, product_id: str) -> bool:
        result = await self.collection.delete_one({"id": product_id})
        return result.deleted_count > 0

    async def find_low_stock(self, threshold: int = 10) -> List[Dict[str, Any]]:
        return await self.collection.find(
            {"stock_quantity": {"$lt": threshold}}
        ).to_list(length=None)

    async def get_total_inventory_value(self) -> float:
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": {"$multiply": ["$price", "$stock_quantity"]}}
                }
            }
        ]
        result = await self.collection.aggregate(pipeline).to_list(length=1)
        return result[0]["total"] if result else 0.0
