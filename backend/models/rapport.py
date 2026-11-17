from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("evaluations.id"), nullable=False)
    generation_date = Column("generated_at", DateTime, default=datetime.utcnow)
    global_score = Column("overall_score", Numeric(5, 2), nullable=True)
    file_path = Column("file_path", String(500), nullable=False)