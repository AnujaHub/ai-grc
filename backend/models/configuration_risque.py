from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid
from database import Base

class ConfigurationRisque(Base):
    __tablename__ = "configurations_risque"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organisation_id = Column(UUID(as_uuid=True), ForeignKey("organisations.id"), nullable=False, unique=True)

    # Liste ordonnée des niveaux, du plus faible au plus élevé
    # Exemple 3 niveaux : ["Faible", "Moyen", "Élevé"]
    # Exemple 5 niveaux : ["Très faible", "Faible", "Moyen", "Élevé", "Très élevé"]
    niveaux_impact = Column(ARRAY(String), default=["Faible", "Moyen", "Élevé"])
    niveaux_probabilite = Column(ARRAY(String), default=["Faible", "Moyen", "Élevée"])