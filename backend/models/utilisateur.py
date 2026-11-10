from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "utilisateurs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    mot_de_passe = Column(String(255), nullable=False)
    google_sub = Column(String(255), unique=True, nullable=True)
    job_title = Column(String(100), nullable=True)
    role = Column(String(50), nullable=False, default="responsable_conformite")
    organisation_id = Column(UUID(as_uuid=True), ForeignKey("organisations.id"), nullable=True)
    statut = Column(String(30), default="actif")
    creation_date = Column("date_creation", DateTime, default=datetime.utcnow)