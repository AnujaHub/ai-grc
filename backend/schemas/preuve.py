from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class EvidenceOut(BaseModel):
    id: UUID
    response_id: UUID
    file_name: str
    file_type: Optional[str] = None
    size_bytes: Optional[int] = None
    description: Optional[str] = None
    upload_date: datetime
    analysis_verdict: Optional[str] = None
    analysis_details: Optional[str] = None
    analysis_date: Optional[datetime] = None

    class Config:
        from_attributes = True