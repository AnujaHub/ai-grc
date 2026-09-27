from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class SystemeIACreate(BaseModel):
    nom: str
    description: Optional[str] = None
    proprietaire: Optional[str] = None
    domaine_utilisation: Optional[str] = None
    niveau_criticite: Optional[str] = "Moyen"
    organisation_id: UUID

class SystemeIAOut(BaseModel):
    id: UUID
    nom: str
    description: Optional[str] = None
    proprietaire: Optional[str] = None
    domaine_utilisation: Optional[str] = None
    niveau_criticite: str
    statut: str
    organisation_id: UUID
    date_creation: datetime

    class Config:
        from_attributes = True