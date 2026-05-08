import pytest

from database.category_repository import CategoryRepository
from database.product_repository import ProductRepository


class FakeInsertResult:
    inserted_id = "mongo-object-id"


class FakeCollection:
    async def insert_one(self, data):
        self.inserted_document = data.copy()
        return FakeInsertResult()


class FakeDatabase:
    def __init__(self):
        self.categories = FakeCollection()
        self.products = FakeCollection()


@pytest.mark.asyncio
async def test_category_create_returns_stored_public_id():
    db = FakeDatabase()
    repo = CategoryRepository(db)

    public_id = await repo.create({"name": "Category", "description": "Desc"})

    assert public_id == db.categories.inserted_document["id"]
    assert public_id != FakeInsertResult.inserted_id


@pytest.mark.asyncio
async def test_product_create_returns_stored_public_id():
    db = FakeDatabase()
    repo = ProductRepository(db)

    public_id = await repo.create({
        "name": "Product",
        "description": "Desc",
        "price": 10.0,
        "category_id": "category-id",
        "stock_quantity": 5,
    })

    assert public_id == db.products.inserted_document["id"]
    assert public_id != FakeInsertResult.inserted_id
