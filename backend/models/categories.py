from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
import uuid

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=200)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=200)

class CategoryResponse(CategoryBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)