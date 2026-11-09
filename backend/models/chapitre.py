from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class Chapter(Base):
    __tablename__ = "chapitres"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    referentiel_id = Column(UUID(as_uuid=True), ForeignKey("referentiels.id"), nullable=False)
    numero = Column(String(20), nullable=False)
    titre = Column(String(255), nullable=False)

    clauses = relationship("Clause", backref="chapitre")