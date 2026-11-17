from sqlalchemy import Column, String, Text, BigInteger, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    response_id = Column(UUID(as_uuid=True), ForeignKey("responses.id"), nullable=False)
    file_name = Column("file_name", String(255), nullable=False)
    file_path = Column("file_path", Text, nullable=False)
    file_type = Column("file_type", String(50), nullable=True)
    size_bytes = Column(BigInteger, nullable=True)
    description = Column(Text, nullable=True)
    upload_date = Column("uploaded_at", DateTime, default=datetime.utcnow)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Implementation note.
    analysis_verdict = Column(String(30), nullable=True)  # Implementation note.
    analysis_details = Column("analysis_details", Text, nullable=True)
    analysis_date = Column("analyzed_at", DateTime, nullable=True)