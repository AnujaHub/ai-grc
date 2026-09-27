from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class Reponse(Base):
    __tablename__ = "reponses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("evaluations.id"), nullable=False)
    clause_id = Column(UUID(as_uuid=True), ForeignKey("clauses.id"), nullable=False)
    reponse = Column(String(30), nullable=True)
    commentaire = Column(Text, nullable=True)
    date_reponse = Column(DateTime, default=datetime.utcnow)

    # Nouveau : qui a répondu à cette clause précise
    repondant_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=True)