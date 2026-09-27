from sqlalchemy import Column, String, Text, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class ActionCorrective(Base):
    __tablename__ = "actions_correctives"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    risque_id = Column(UUID(as_uuid=True), ForeignKey("risques.id"), nullable=False)
    titre = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    responsable_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)
    date_echeance = Column(Date, nullable=True)
    statut = Column(String(20), default="Ouverte")  # Ouverte, En cours, Terminée
    date_cloture = Column(Date, nullable=True)