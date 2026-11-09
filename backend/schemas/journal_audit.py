from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class AuditLogOut(BaseModel):
    id: UUID
    utilisateur_id: Optional[UUID] = None
    utilisateur_email: Optional[str] = None
    action: str
    ressource_type: str
    ressource_id: Optional[str] = None
    details: Optional[str] = None
    action_date: datetime

    class Config:
        from_attributes = True