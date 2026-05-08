from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = "product_management"

client: AsyncIOMotorClient | None = None

async def get_database():
    global client
    if client is None:
        client = AsyncIOMotorClient(MONGODB_URI)
    return client[DATABASE_NAME]

async def close_database():
    global client
    if client is not None:
        client.close()
        client = None