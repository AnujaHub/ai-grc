from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class Organisation(Base):
    __tablename__ = "organisations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom = Column(String(255), nullable=False)
    secteur = Column(String(100), nullable=True)
    pays = Column(String(100), nullable=True)
    date_creation = Column(DateTime, default=datetime.utcnow)