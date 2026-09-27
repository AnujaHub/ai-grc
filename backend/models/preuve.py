from sqlalchemy import Column, String, Text, BigInteger, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class Preuve(Base):
    __tablename__ = "preuves"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reponse_id = Column(UUID(as_uuid=True), ForeignKey("reponses.id"), nullable=False)
    nom_fichier = Column(String(255), nullable=False)
    chemin_fichier = Column(Text, nullable=False)
    type_fichier = Column(String(50), nullable=True)
    taille = Column(BigInteger, nullable=True)
    description = Column(Text, nullable=True)
    date_upload = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)

    # Résultat de l'analyse IA (calculé à la demande)
    analyse_verdict = Column(String(30), nullable=True)  # "Pertinente", "Insuffisante", "Non liée"
    analyse_details = Column(Text, nullable=True)
    analyse_date = Column(DateTime, nullable=True)