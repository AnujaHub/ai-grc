from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class ReportOut(BaseModel):
    id: UUID
    evaluation_id: UUID
    generation_date: datetime
    global_score: Optional[float] = None
    file_path: str

    class Config:
        from_attributes = True