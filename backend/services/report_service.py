from motor.motor_asyncio import AsyncIOMotorDatabase
from database.product_repository import ProductRepository
from database.category_repository import CategoryRepository
from database.connection import get_database

class ReportService:
    def __init__(self):
        self.db: AsyncIOMotorDatabase
        self.product_repo: ProductRepository
        self.category_repo: CategoryRepository

    async def initialize(self):
        self.db = await get_database()
        self.product_repo = ProductRepository(self.db)
        self.category_repo = CategoryRepository(self.db)

    async def generate_products_csv(self) -> str:
        products = await self.product_repo.find_all()
        categories = await self.category_repo.find_all()
        category_map = {cat["id"]: cat["name"] for cat in categories}

        csv_lines = ["name,description,price,category,stock_quantity"]

        for product in products:
            category_name = category_map.get(product["category_id"], "Unknown")
            line = f'"{product["name"]}","{product.get("description", "")}",{product["price"]},"{category_name}",{product["stock_quantity"]}'
            csv_lines.append(line)

        return "\n".join(csv_lines)
