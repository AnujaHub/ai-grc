from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

# Ce qu'on envoie pour CRÉER un utilisateur (inscription)
class UtilisateurCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    mot_de_passe: str
    role: Optional[str] = "responsable_conformite"
    organisation_id: Optional[UUID] = None

# Ce qu'on envoie pour se CONNECTER
class UtilisateurLogin(BaseModel):
    email: EmailStr
    mot_de_passe: str

# Ce que l'API renvoie (jamais le mot de passe !)
class UtilisateurOut(BaseModel):
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