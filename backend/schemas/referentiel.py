from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

class ClauseOut(BaseModel):
    id: UUID
    chapter_id: UUID
    number: str
    title: str
    description: Optional[str] = None
    requirement_type: Optional[str] = None
    sort_order: int
    evaluation_type: str
    suggested_department: Optional[str] = None

    class Config:
        from_attributes = True

class ChapterOut(BaseModel):
    id: UUID
    framework_id: UUID
    number: str
    title: str
    clauses: List[ClauseOut] = []

    class Config:
        from_attributes = True

class ReferenceFrameworkOut(BaseModel):
    id: UUID
    code: str
    name: str
    description: Optional[str] = None
    version: Optional[str] = None
    status: str

    class Config:
        from_attributes = True