from sqlalchemy import Column, String, Date, Numeric, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Implementation note.
    evaluation_type = Column("type_evaluation", String(20), nullable=False, default="Systeme_IA")
    systeme_ia_id = Column(UUID(as_uuid=True), ForeignKey("systemes_ia.id"), nullable=True)
    organisation_id = Column(UUID(as_uuid=True), ForeignKey("organisations.id"), nullable=True)

    referentiel_id = Column(UUID(as_uuid=True), ForeignKey("referentiels.id"), nullable=False)
    responsable_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)
    start_date = Column("date_debut", Date, nullable=True)
    end_date = Column("date_fin", Date, nullable=True)
    score = Column(Numeric(5, 2), nullable=True)
    statut = Column(String(50), default="Brouillon")
    commentaire = Column(Text, nullable=True)

    reponses = relationship("Response", backref="evaluation", cascade="all, delete-orphan")