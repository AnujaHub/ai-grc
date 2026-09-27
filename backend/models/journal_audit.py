from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class JournalAudit(Base):
    __tablename__ = "journal_audit"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)
    utilisateur_email = Column(String(255), nullable=True)  # copie, au cas où l'utilisateur soit supprimé plus tard
    action = Column(String(100), nullable=False)  # ex: "creation", "modification", "suppression", "connexion"
    ressource_type = Column(String(100), nullable=False)  # ex: "Organisation", "Evaluation", "Risque"
    ressource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    date_action = Column(DateTime, default=datetime.utcnow)