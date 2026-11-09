from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class Clause(Base):
    __tablename__ = "clauses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chapitre_id = Column(UUID(as_uuid=True), ForeignKey("chapitres.id"), nullable=False)
    numero = Column(String(50), nullable=False)
    titre = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    requirement_type = Column("type_exigence", String(50), nullable=True)
    ordre = Column(Integer, default=0)

    # Implementation note.
    evaluation_type = Column("type_evaluation", String(20), default="Systeme_IA")
    departement_suggere = Column(String(100), nullable=True)    # Implementation note.