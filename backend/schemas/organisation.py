from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

# Ce que le client doit envoyer pour CRÉER une organisation
class OrganisationCreate(BaseModel):
    nom: str
    secteur: Optional[str] = None
    pays: Optional[str] = None

# Ce que l'API renvoie quand on LIT une organisation
class OrganisationOut(BaseModel):
    id: UUID
    nom: str
    secteur: Optional[str] = None
    pays: Optional[str] = None
    date_creation: datetime

    class Config:
        from_attributes = True