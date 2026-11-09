from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid
from database import Base

class RiskConfiguration(Base):
    __tablename__ = "configurations_risque"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organisation_id = Column(UUID(as_uuid=True), ForeignKey("organisations.id"), nullable=False, unique=True)

    # Implementation note.
    # Implementation note.
    # Implementation note.
    impact_levels = Column("niveaux_impact", ARRAY(String), default=["Faible", "Moyen", "Élevé"])
    probability_levels = Column("niveaux_probabilite", ARRAY(String), default=["Faible", "Moyen", "Élevée"])