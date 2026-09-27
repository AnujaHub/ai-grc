from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from uuid import UUID

# ---------- Action corrective ----------
class ActionCorrectiveCreate(BaseModel):
    titre: str
    description: Optional[str] = None
    responsable_id: Optional[UUID] = None
    date_echeance: Optional[date] = None

class ActionCorrectiveOut(BaseModel):
    id: UUID
    risque_id: UUID
    titre: str
    description: Optional[str] = None
    responsable_id: Optional[UUID] = None
    date_echeance: Optional[date] = None
    statut: str
    date_cloture: Optional[date] = None

    class Config:
        from_attributes = True

# ---------- Risque ----------
class RisqueCreate(BaseModel):
    evaluation_id: UUID
    titre: str
    description: Optional[str] = None
    categorie: Optional[str] = None
    impact: Optional[str] = "Moyen"
    probabilite: Optional[str] = "Moyen"

class RisqueOut(BaseModel):
    id: UUID
    evaluation_id: UUID
    titre: str
    description: Optional[str] = None
    categorie: Optional[str] = None
    impact: str
    probabilite: str
    niveau_risque: str
    statut: str
    date_identification: date

    class Config:
        from_attributes = True

class RisqueDetailOut(RisqueOut):
    actions_correctives: List[ActionCorrectiveOut] = []