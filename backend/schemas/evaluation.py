from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

class ResponseCreate(BaseModel):
    clause_id: UUID
    reponse: str
    commentaire: Optional[str] = None

class ResponseOut(BaseModel):
    id: UUID
    evaluation_id: UUID
    clause_id: UUID
    reponse: Optional[str] = None
    commentaire: Optional[str] = None
    response_date: datetime
    repondant_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class EvaluationCreate(BaseModel):
    evaluation_type: str  # "Organisation" ou "Systeme_IA"
    systeme_ia_id: Optional[UUID] = None
    organisation_id: Optional[UUID] = None
    referentiel_id: UUID

class EvaluationOut(BaseModel):
    id: UUID
    evaluation_type: str
    systeme_ia_id: Optional[UUID] = None
    organisation_id: Optional[UUID] = None
    referentiel_id: UUID
    responsable_id: Optional[UUID] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    score: Optional[float] = None
    statut: str
    commentaire: Optional[str] = None

    class Config:
        from_attributes = True

class EvaluationDetailOut(EvaluationOut):
    reponses: List[ResponseOut] = []