from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

class ClauseOut(BaseModel):
    id: UUID
    chapitre_id: UUID
    numero: str
    titre: str
    description: Optional[str] = None
    requirement_type: Optional[str] = None
    ordre: int
    evaluation_type: str
    departement_suggere: Optional[str] = None

    class Config:
        from_attributes = True

class ChapterOut(BaseModel):
    id: UUID
    referentiel_id: UUID
    numero: str
    titre: str
    clauses: List[ClauseOut] = []

    class Config:
        from_attributes = True

class ReferenceFrameworkOut(BaseModel):
    id: UUID
    code: str
    nom: str
    description: Optional[str] = None
    version: Optional[str] = None
    statut: str

    class Config:
        from_attributes = True