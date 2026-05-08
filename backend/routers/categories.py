from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models.categories import CategoryCreate, CategoryUpdate, CategoryResponse
from services.category_service import CategoryService
from auth.dependencies import get_current_user_id

router = APIRouter(prefix="/api/categories", tags=["categories"])
category_service = CategoryService()

@router.get("", response_model=List[CategoryResponse])
async def get_categories(user_id: str = Depends(get_current_user_id)):
    return await category_service.get_all_categories()

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(category_data: CategoryCreate, user_id: str = Depends(get_current_user_id)):
    try:
        return await category_service.create_category(category_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        return await category_service.get_category_by_id(category_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: str, category_data: CategoryUpdate, user_id: str = Depends(get_current_user_id)):
    try:
        return await category_service.update_category(category_id, category_data)
    except ValueError as e:
        if "not found" in str(e):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        await category_service.delete_category(category_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))