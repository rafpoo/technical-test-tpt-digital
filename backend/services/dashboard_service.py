from motor.motor_asyncio import AsyncIOMotorDatabase
from database.product_repository import ProductRepository
from database.category_repository import CategoryRepository
from database.connection import get_database
from models.dashboard import DashboardStats
from models.products import ProductResponse

class DashboardService:
    def __init__(self):
        self.db: AsyncIOMotorDatabase
        self.product_repo: ProductRepository
        self.category_repo: CategoryRepository

    async def initialize(self):
        self.db = await get_database()
        self.product_repo = ProductRepository(self.db)
        self.category_repo = CategoryRepository(self.db)

    async def get_stats(self) -> DashboardStats:
        total_products = len(await self.product_repo.find_all())
        total_categories = len(await self.category_repo.find_all())
        total_inventory_value = await self.product_repo.get_total_inventory_value()
        low_stock_products = await self.product_repo.find_low_stock(threshold=10)

        low_stock_responses = [ProductResponse(**product) for product in low_stock_products]

        return DashboardStats(
            total_products=total_products,
            total_categories=total_categories,
            total_inventory_value=total_inventory_value,
            low_stock_products=low_stock_responses
        )
