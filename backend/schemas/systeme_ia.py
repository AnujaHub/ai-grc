from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class AISystemCreate(BaseModel):
    nom: str
    description: Optional[str] = None
    proprietaire: Optional[str] = None
    domaine_utilisation: Optional[str] = None
    criticality_level: Optional[str] = "Moyen"
    organisation_id: UUID

class AISystemOut(BaseModel):
    id: UUID
    nom: str
    description: Optional[str] = None
    proprietaire: Optional[str] = None
    domaine_utilisation: Optional[str] = None
    criticality_level: str
    statut: str
    organisation_id: UUID
    creation_date: datetime

    class Config:
        from_attributes = True