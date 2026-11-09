from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class AuditLog(Base):
    __tablename__ = "journal_audit"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)
    utilisateur_email = Column(String(255), nullable=True)  # Implementation note.
    action = Column(String(100), nullable=False)  # ex: "creation", "modification", "suppression", "connexion"
    ressource_type = Column(String(100), nullable=False)  # e.g. "Organization", "Assessment", "Risk"
    ressource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    action_date = Column("date_action", DateTime, default=datetime.utcnow)