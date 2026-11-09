from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class AdminUserCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    mot_de_passe: str
    role: str
    organisation_id: Optional[UUID] = None

class UserUpdate(BaseModel):
    role: Optional[str] = None
    statut: Optional[str] = None
    organisation_id: Optional[UUID] = None

class UserListOut(BaseModel):
    id: UUID
    nom: str
    prenom: str
    email: str
    role: str
    organisation_id: Optional[UUID] = None
    statut: str
    creation_date: datetime

    class Config:
        from_attributes = True