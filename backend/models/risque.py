from sqlalchemy import Column, String, Text, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import date
from database import Base

class Risque(Base):
    __tablename__ = "risques"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("evaluations.id"), nullable=False)
    titre = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    categorie = Column(String(100), nullable=True)
    impact = Column(String(20), default="Moyen")       # Faible, Moyen, Élevé
    probabilite = Column(String(20), default="Moyen")  # Faible, Moyen, Élevée
    niveau_risque = Column(String(20), default="Moyen") # calculé à partir d'impact + probabilité
    statut = Column(String(20), default="Ouvert")       # Ouvert, En cours, Clos
    date_identification = Column(Date, default=date.today)

    actions_correctives = relationship("ActionCorrective", backref="risque", cascade="all, delete-orphan")