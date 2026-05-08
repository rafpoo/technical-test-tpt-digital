from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from models.products import ProductCreate, ProductUpdate, ProductResponse
from services.product_service import ProductService
from auth.dependencies import get_current_user_id

router = APIRouter(prefix="/api/products", tags=["products"])
product_service = ProductService()

@router.on_event("startup")
async def startup_event():
    await product_service.initialize()

@router.get("", response_model=List[ProductResponse])
async def get_products(
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    user_id: str = Depends(get_current_user_id)
):
    return await product_service.get_all_products(category_id)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product_data: ProductCreate, user_id: str = Depends(get_current_user_id)):
    try:
        return await product_service.create_product(product_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        return await product_service.get_product_by_id(product_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, product_data: ProductUpdate, user_id: str = Depends(get_current_user_id)):
    try:
        return await product_service.update_product(product_id, product_data)
    except ValueError as e:
        if "not found" in str(e):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        await product_service.delete_product(product_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))