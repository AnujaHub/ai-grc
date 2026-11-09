from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class AISystem(Base):
    __tablename__ = "systemes_ia"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    proprietaire = Column(String(255), nullable=True)
    domaine_utilisation = Column(String(255), nullable=True)
    criticality_level = Column("niveau_criticite", String(20), default="Moyen")
    statut = Column(String(20), default="actif")
    organisation_id = Column(UUID(as_uuid=True), ForeignKey("organisations.id"), nullable=False)
    creation_date = Column("date_creation", DateTime, default=datetime.utcnow)