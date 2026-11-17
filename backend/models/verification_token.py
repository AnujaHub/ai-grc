from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from database import Base


class VerificationToken(Base):
    __tablename__ = "verification_tokens"
    __table_args__ = (
        UniqueConstraint("user_id", "purpose", name="uq_verification_tokens_user_purpose"),
        CheckConstraint("attempts >= 0", name="ck_verification_tokens_attempts_nonnegative"),
        CheckConstraint("send_count >= 0", name="ck_verification_tokens_send_count_nonnegative"),
        Index("ix_verification_tokens_ip_sent_at", "request_ip", "sent_at"),
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    token_hash = Column(String(64), nullable=False)
    purpose = Column(String(50), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    attempts = Column(Integer, nullable=False, default=0)
    sent_at = Column(DateTime(timezone=True), nullable=False)
    send_count = Column(Integer, nullable=False, default=0)
    window_started_at = Column(DateTime(timezone=True), nullable=False)
    request_ip = Column(String(45), nullable=True)

    user = relationship("User", back_populates="verification_tokens")
