from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class AdminUserCreate(BaseModel):
    name: str
    first_name: str
    email: EmailStr
    password: str
    role: str
    organization_id: Optional[UUID] = None

class UserUpdate(BaseModel):
    role: Optional[str] = None
    status: Optional[str] = None
    organization_id: Optional[UUID] = None

class UserListOut(BaseModel):
    id: UUID
    name: str
    first_name: str
    email: str
    role: str
    organization_id: Optional[UUID] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True