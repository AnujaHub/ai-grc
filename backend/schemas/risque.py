from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from uuid import UUID

# ---------- Action corrective ----------
class CorrectiveActionCreate(BaseModel):
    titre: str
    description: Optional[str] = None
    responsable_id: Optional[UUID] = None
    due_date: Optional[date] = None

class CorrectiveActionOut(BaseModel):
    id: UUID
    risque_id: UUID
    titre: str
    description: Optional[str] = None
    responsable_id: Optional[UUID] = None
    due_date: Optional[date] = None
    statut: str
    closure_date: Optional[date] = None

    class Config:
        from_attributes = True

# ---------- Risque ----------
class RiskCreate(BaseModel):
    evaluation_id: UUID
    titre: str
    description: Optional[str] = None
    categorie: Optional[str] = None
    impact: Optional[str] = "Moyen"
    probabilite: Optional[str] = "Moyen"

class RiskOut(BaseModel):
    id: UUID
    evaluation_id: UUID
    titre: str
    description: Optional[str] = None
    categorie: Optional[str] = None
    impact: str
    probabilite: str
    risk_level: str
    statut: str
    identification_date: date

    class Config:
        from_attributes = True

class RiskDetailOut(RiskOut):
    corrective_actions: List[CorrectiveActionOut] = []