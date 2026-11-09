from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

# Implementation note.
class OrganizationCreate(BaseModel):
    nom: str
    secteur: Optional[str] = None
    pays: Optional[str] = None

# Response returned by the API when reading an organization
class OrganizationOut(BaseModel):
    id: UUID
    nom: str
    secteur: Optional[str] = None
    pays: Optional[str] = None
    creation_date: datetime

    class Config:
        from_attributes = True