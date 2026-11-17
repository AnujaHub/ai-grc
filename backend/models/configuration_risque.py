from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid
from database import Base

class RiskConfiguration(Base):
    __tablename__ = "risk_configurations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, unique=True)

    # Implementation note.
    # Implementation note.
    # Implementation note.
    impact_levels = Column("impact_levels", ARRAY(String), default=["Faible", "Moyen", "Élevé"])
    probability_levels = Column("probability_levels", ARRAY(String), default=["Faible", "Moyen", "Élevée"])