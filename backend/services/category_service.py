from typing import List
from datetime import datetime
from database.category_repository import CategoryRepository
from database.connection import get_database
from models.categories import CategoryCreate, CategoryUpdate, CategoryResponse

class CategoryService:
    def __init__(self):
        self.db = None
        self.category_repo = None

    async def initialize(self):
        self.db = await get_database()
        self.category_repo = CategoryRepository(self.db)

    async def get_all_categories(self) -> List[CategoryResponse]:
        categories = await self.category_repo.find_all()
        return [CategoryResponse(**category) for category in categories]

    async def get_category_by_id(self, category_id: str) -> CategoryResponse:
        category = await self.category_repo.find_by_id(category_id)
        if not category:
            raise ValueError("Category not found")
        return CategoryResponse(**category)

    async def create_category(self, category_data: CategoryCreate) -> CategoryResponse:
        existing_category = await self.category_repo.find_by_name(category_data.name)
        if existing_category:
            raise ValueError("Category name already exists")

        category_dict = category_data.dict()
        category_dict["created_at"] = datetime.utcnow()
        category_dict["updated_at"] = datetime.utcnow()

        category_id = await self.category_repo.create(category_dict)
        category_dict["id"] = category_id
        return CategoryResponse(**category_dict)

    async def update_category(self, category_id: str, category_data: CategoryUpdate) -> CategoryResponse:
        existing_category = await self.category_repo.find_by_id(category_id)
        if not existing_category:
            raise ValueError("Category not found")

        update_dict = category_data.dict(exclude_unset=True)
        if "name" in update_dict:
            name_check = await self.category_repo.find_by_name(update_dict["name"])
            if name_check and name_check["id"] != category_id:
                raise ValueError("Category name already exists")

        update_dict["updated_at"] = datetime.utcnow()
        await self.category_repo.update(category_id, update_dict)

        updated_category = await self.category_repo.find_by_id(category_id)
        return CategoryResponse(**updated_category)

    async def delete_category(self, category_id: str) -> bool:
        category = await self.category_repo.find_by_id(category_id)
        if not category:
            raise ValueError("Category not found")

        return await self.category_repo.delete(category_id)