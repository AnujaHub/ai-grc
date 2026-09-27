from pydantic import BaseModel
from typing import List
from uuid import UUID

class ConfigurationRisqueUpdate(BaseModel):
    niveaux_impact: List[str]
    niveaux_probabilite: List[str]

class ConfigurationRisqueOut(BaseModel):
    id: UUID
    organisation_id: UUID
    niveaux_impact: List[str]
    niveaux_probabilite: List[str]

    class Config:
        from_attributes = True