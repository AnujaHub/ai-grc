from pydantic import BaseModel
from typing import List
from uuid import UUID

class RiskConfigurationUpdate(BaseModel):
    impact_levels: List[str]
    probability_levels: List[str]

class RiskConfigurationOut(BaseModel):
    id: UUID
    organisation_id: UUID
    impact_levels: List[str]
    probability_levels: List[str]

    class Config:
        from_attributes = True