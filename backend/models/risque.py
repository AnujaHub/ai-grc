from sqlalchemy import Column, String, Text, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import date
from database import Base

class Risk(Base):
    __tablename__ = "risks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("evaluations.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    impact = Column(String(20), default="Moyen")       # Implementation note.
    probability = Column(String(20), default="Moyen")  # Implementation note.
    risk_level = Column("risk_level", String(20), default="Moyen")
    status = Column(String(20), default="Ouvert")       # Ouvert, En cours, Clos
    identification_date = Column("identified_at", Date, default=date.today)

    corrective_actions = relationship("CorrectiveAction", backref="risque", cascade="all, delete-orphan")