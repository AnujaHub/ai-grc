from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class JournalAuditOut(BaseModel):
    id: UUID
    utilisateur_id: Optional[UUID] = None
    utilisateur_email: Optional[str] = None
    action: str
    ressource_type: str
    ressource_id: Optional[str] = None
    details: Optional[str] = None
    date_action: datetime

    class Config:
        from_attributes = True