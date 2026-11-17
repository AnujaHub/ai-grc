from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class AuditLogOut(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    user_email: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[str] = None
    action_date: datetime

    class Config:
        from_attributes = True