from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

class ResponseCreate(BaseModel):
    clause_id: UUID
    response: str
    comment: Optional[str] = None

class ResponseOut(BaseModel):
    id: UUID
    evaluation_id: UUID
    clause_id: UUID
    response: Optional[str] = None
    comment: Optional[str] = None
    response_date: datetime
    respondent_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class EvaluationCreate(BaseModel):
    evaluation_type: str  # "Organisation" ou "Systeme_IA"
    ai_system_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None
    framework_id: UUID

class EvaluationOut(BaseModel):
    id: UUID
    evaluation_type: str
    ai_system_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None
    framework_id: UUID
    responsible_id: Optional[UUID] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    score: Optional[float] = None
    status: str
    comment: Optional[str] = None

    class Config:
        from_attributes = True

class EvaluationDetailOut(EvaluationOut):
    responses: List[ResponseOut] = []