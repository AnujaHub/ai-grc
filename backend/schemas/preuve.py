from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class PreuveOut(BaseModel):
    id: UUID
    reponse_id: UUID
    nom_fichier: str
    type_fichier: Optional[str] = None
    taille: Optional[int] = None
    description: Optional[str] = None
    date_upload: datetime
    analyse_verdict: Optional[str] = None
    analyse_details: Optional[str] = None
    analyse_date: Optional[datetime] = None

    class Config:
        from_attributes = True