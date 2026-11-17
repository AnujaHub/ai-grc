from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class Clause(Base):
    __tablename__ = "clauses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id"), nullable=False)
    number = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    requirement_type = Column("requirement_type", String(50), nullable=True)
    sort_order = Column(Integer, default=0)

    # Implementation note.
    evaluation_type = Column("evaluation_type", String(20), default="Systeme_IA")
    suggested_department = Column(String(100), nullable=True)    # Implementation note.