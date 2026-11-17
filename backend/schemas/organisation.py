from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

# Implementation note.
class OrganizationCreate(BaseModel):
    name: str
    sector: Optional[str] = None
    country: Optional[str] = None

# Response returned by the API when reading an organization
class OrganizationOut(BaseModel):
    id: UUID
    name: str
    sector: Optional[str] = None
    country: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True