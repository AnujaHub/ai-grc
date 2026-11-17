from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class AISystemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    owner: Optional[str] = None
    usage_domain: Optional[str] = None
    criticality_level: Optional[str] = "Moyen"
    organization_id: UUID

class AISystemOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    owner: Optional[str] = None
    usage_domain: Optional[str] = None
    criticality_level: str
    status: str
    organization_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True