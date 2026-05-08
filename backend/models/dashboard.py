from pydantic import BaseModel
from typing import List
from models.products import ProductResponse

class DashboardStats(BaseModel):
    total_products: int
    total_categories: int
    total_inventory_value: float
    low_stock_products: List[ProductResponse]