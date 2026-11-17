from sqlalchemy import Column, String, Text, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class CorrectiveAction(Base):
    __tablename__ = "corrective_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    risk_id = Column(UUID(as_uuid=True), ForeignKey("risks.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    responsible_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    due_date = Column("due_date", Date, nullable=True)
    status = Column(String(20), default="Ouverte")  # Implementation note.
    closure_date = Column("closed_at", Date, nullable=True)