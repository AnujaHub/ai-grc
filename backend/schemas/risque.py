from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from uuid import UUID

# ---------- Action corrective ----------
class CorrectiveActionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    responsible_id: Optional[UUID] = None
    due_date: Optional[date] = None

class CorrectiveActionOut(BaseModel):
    id: UUID
    risk_id: UUID
    title: str
    description: Optional[str] = None
    responsible_id: Optional[UUID] = None
    due_date: Optional[date] = None
    status: str
    closure_date: Optional[date] = None

    class Config:
        from_attributes = True

# ---------- Risque ----------
class RiskCreate(BaseModel):
    evaluation_id: UUID
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    impact: Optional[str] = "Moyen"
    probability: Optional[str] = "Moyen"

class RiskOut(BaseModel):
    id: UUID
    evaluation_id: UUID
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    impact: str
    probability: str
    risk_level: str
    status: str
    identification_date: date

    class Config:
        from_attributes = True

class RiskDetailOut(RiskOut):
    corrective_actions: List[CorrectiveActionOut] = []