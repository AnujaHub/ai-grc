from sqlalchemy import Column, String, Text, BigInteger, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class Evidence(Base):
    __tablename__ = "preuves"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reponse_id = Column(UUID(as_uuid=True), ForeignKey("reponses.id"), nullable=False)
    file_name = Column("nom_fichier", String(255), nullable=False)
    file_path = Column("chemin_fichier", Text, nullable=False)
    file_type = Column("type_fichier", String(50), nullable=True)
    taille = Column(BigInteger, nullable=True)
    description = Column(Text, nullable=True)
    upload_date = Column("date_upload", DateTime, default=datetime.utcnow)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)

    # Implementation note.
    analyse_verdict = Column(String(30), nullable=True)  # Implementation note.
    analysis_details = Column("analyse_details", Text, nullable=True)
    analysis_date = Column("analyse_date", DateTime, nullable=True)