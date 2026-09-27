from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class RapportOut(BaseModel):
    id: UUID
    evaluation_id: UUID
    date_generation: datetime
    score_global: Optional[float] = None
    chemin_fichier: str

    class Config:
        from_attributes = True