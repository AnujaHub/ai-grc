from sqlalchemy import Column, String, Text, Date
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class ReferenceFramework(Base):
    __tablename__ = "referentiels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), nullable=False)
    nom = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    version = Column(String(50), nullable=True)
    statut = Column(String(20), default="actif")