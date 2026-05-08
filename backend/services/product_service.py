from typing import List, Optional
from datetime import datetime
from database.product_repository import ProductRepository
from database.category_repository import CategoryRepository
from database.connection import get_database
from models.products import ProductCreate, ProductUpdate, ProductResponse

class ProductService:
    def __init__(self):
        self.db = None
        self.product_repo = None
        self.category_repo = None

    async def initialize(self):
        self.db = await get_database()
        self.product_repo = ProductRepository(self.db)
        self.category_repo = CategoryRepository(self.db)

    async def get_all_products(self, category_id: Optional[str] = None) -> List[ProductResponse]:
        products = await self.product_repo.find_all(category_id)
        return [ProductResponse(**product) for product in products]

    async def get_product_by_id(self, product_id: str) -> ProductResponse:
        product = await self.product_repo.find_by_id(product_id)
        if not product:
            raise ValueError("Product not found")
        return ProductResponse(**product)

    async def create_product(self, product_data: ProductCreate) -> ProductResponse:
        category = await self.category_repo.find_by_id(product_data.category_id)
        if not category:
            raise ValueError("Category not found")

        product_dict = product_data.dict()
        product_dict["created_at"] = datetime.utcnow()
        product_dict["updated_at"] = datetime.utcnow()

        product_id = await self.product_repo.create(product_dict)
        product_dict["id"] = product_id
        return ProductResponse(**product_dict)

    async def update_product(self, product_id: str, product_data: ProductUpdate) -> ProductResponse:
        existing_product = await self.product_repo.find_by_id(product_id)
        if not existing_product:
            raise ValueError("Product not found")

        update_dict = product_data.dict(exclude_unset=True)
        if "category_id" in update_dict:
            category = await self.category_repo.find_by_id(update_dict["category_id"])
            if not category:
                raise ValueError("Category not found")

        update_dict["updated_at"] = datetime.utcnow()
        await self.product_repo.update(product_id, update_dict)

        updated_product = await self.product_repo.find_by_id(product_id)
        return ProductResponse(**updated_product)

    async def delete_product(self, product_id: str) -> bool:
        product = await self.product_repo.find_by_id(product_id)
        if not product:
            raise ValueError("Product not found")

        return await self.product_repo.delete(product_id)