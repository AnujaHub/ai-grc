from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

class ClauseOut(BaseModel):
    id: UUID
    chapitre_id: UUID
    numero: str
    titre: str
    description: Optional[str] = None
    type_exigence: Optional[str] = None
    ordre: int
    type_evaluation: str
    departement_suggere: Optional[str] = None

    class Config:
        from_attributes = True

class ChapitreOut(BaseModel):
    id: UUID
    referentiel_id: UUID
    numero: str
    titre: str
    clauses: List[ClauseOut] = []

    class Config:
        from_attributes = True

class ReferentielOut(BaseModel):
    id: UUID
    code: str
    nom: str
    description: Optional[str] = None
    version: Optional[str] = None
    statut: str

    class Config:
        from_attributes = True