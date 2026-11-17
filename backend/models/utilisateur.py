from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, false
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    first_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    google_sub = Column(String(255), unique=True, nullable=True)
    job_title = Column(String(100), nullable=True)
    role = Column(String(50), nullable=False, default="responsable_conformite")
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    status = Column(String(30), default="actif")
    created_at = Column("created_at", DateTime, default=datetime.utcnow)
    email_verified = Column(Boolean, nullable=False, default=False, server_default=false())
    verification_tokens = relationship(
        "VerificationToken",
        back_populates="user",
        cascade="all, delete-orphan",
    )
