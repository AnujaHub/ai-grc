from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

class ReponseCreate(BaseModel):
    clause_id: UUID
    reponse: str
    commentaire: Optional[str] = None

class ReponseOut(BaseModel):
    id: UUID
    evaluation_id: UUID
    clause_id: UUID
    reponse: Optional[str] = None
    commentaire: Optional[str] = None
    date_reponse: datetime
    repondant_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class EvaluationCreate(BaseModel):
    type_evaluation: str  # "Organisation" ou "Systeme_IA"
    systeme_ia_id: Optional[UUID] = None
    organisation_id: Optional[UUID] = None
    referentiel_id: UUID

class EvaluationOut(BaseModel):
    id: UUID
    type_evaluation: str
    systeme_ia_id: Optional[UUID] = None
    organisation_id: Optional[UUID] = None
    referentiel_id: UUID
    responsable_id: Optional[UUID] = None
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None
    score: Optional[float] = None
    statut: str
    commentaire: Optional[str] = None

    class Config:
        from_attributes = True

class EvaluationDetailOut(EvaluationOut):
    reponses: List[ReponseOut] = []