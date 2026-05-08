from dotenv import load_dotenv
import os
from motor.motor_asyncio import AsyncIOMotorClient
from auth.security import get_password_hash

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = "product_management"

async def seed_admin_user():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]

    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")

    existing = await db.users.find_one({"username": admin_username})
    if not existing:
        await db.users.insert_one({
            "id": "admin-initial",
            "username": admin_username,
            "password_hash": get_password_hash(admin_password),
            "created_at": "2026-01-01T00:00:00",
            "updated_at": "2026-01-01T00:00:00"
        })
        print(f"Admin user '{admin_username}' created.")
    else:
        print(f"Admin user '{admin_username}' already exists.")

    client.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(seed_admin_user())