from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class SystemeIA(Base):
    __tablename__ = "systemes_ia"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    proprietaire = Column(String(255), nullable=True)
    domaine_utilisation = Column(String(255), nullable=True)
    niveau_criticite = Column(String(20), default="Moyen")  # Faible, Moyen, Élevé
    statut = Column(String(20), default="actif")
    organisation_id = Column(UUID(as_uuid=True), ForeignKey("organisations.id"), nullable=False)
    date_creation = Column(DateTime, default=datetime.utcnow)