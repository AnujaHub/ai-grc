from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class AISystem(Base):
    __tablename__ = "ai_systems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner = Column(String(255), nullable=True)
    usage_domain = Column(String(255), nullable=True)
    criticality_level = Column("criticality_level", String(20), default="Moyen")
    status = Column(String(20), default="actif")
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    created_at = Column("created_at", DateTime, default=datetime.utcnow)