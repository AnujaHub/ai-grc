from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class UtilisateurAdminCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    mot_de_passe: str
    role: str
    organisation_id: Optional[UUID] = None

class UtilisateurUpdate(BaseModel):
    role: Optional[str] = None
    statut: Optional[str] = None
    organisation_id: Optional[UUID] = None

class UtilisateurListOut(BaseModel):
    id: UUID
    nom: str
    prenom: str
    email: str
    role: str
    organisation_id: Optional[UUID] = None
    statut: str
    date_creation: datetime

    class Config:
        from_attributes = True