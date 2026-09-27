from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class Rapport(Base):
    __tablename__ = "rapports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("evaluations.id"), nullable=False)
    date_generation = Column(DateTime, default=datetime.utcnow)
    score_global = Column(Numeric(5, 2), nullable=True)
    chemin_fichier = Column(String(500), nullable=False)