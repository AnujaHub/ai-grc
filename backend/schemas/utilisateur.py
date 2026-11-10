from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

# Implementation note.
class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    mot_de_passe: str
    job_title: str
    role: Optional[str] = "responsable_conformite"
    organisation_id: Optional[UUID] = None

# Payload sent to sign in
class UserLogin(BaseModel):
    email: EmailStr
    mot_de_passe: str

# Response returned by the API (never includes the password)
class UserOut(BaseModel):
    id: UUID
    nom: str
    prenom: str
    email: str
    role: str
    job_title: Optional[str] = None
    organisation_id: Optional[UUID] = None
    statut: str
    creation_date: datetime

    class Config:
        from_attributes = True