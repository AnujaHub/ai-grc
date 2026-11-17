from sqlalchemy import Column, String, Date, Numeric, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Implementation note.
    evaluation_type = Column("evaluation_type", String(20), nullable=False, default="Systeme_IA")
    ai_system_id = Column(UUID(as_uuid=True), ForeignKey("ai_systems.id"), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    framework_id = Column(UUID(as_uuid=True), ForeignKey("frameworks.id"), nullable=False)
    responsible_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    start_date = Column("start_date", Date, nullable=True)
    end_date = Column("end_date", Date, nullable=True)
    score = Column(Numeric(5, 2), nullable=True)
    status = Column(String(50), default="Brouillon")
    comment = Column(Text, nullable=True)

    responses = relationship("Response", backref="evaluation", cascade="all, delete-orphan")