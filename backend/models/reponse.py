from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class Response(Base):
    __tablename__ = "responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("evaluations.id"), nullable=False)
    clause_id = Column(UUID(as_uuid=True), ForeignKey("clauses.id"), nullable=False)
    response = Column(String(30), nullable=True)
    comment = Column(Text, nullable=True)
    response_date = Column("responded_at", DateTime, default=datetime.utcnow)

    # Implementation note.
    respondent_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)