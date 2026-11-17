from sqlalchemy.orm import Session
from models.journal_audit import AuditLog
from models.utilisateur import User
from uuid import UUID
from typing import Optional


def record_action(
    db: Session,
    utilisateur: User,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: Optional[str] = None,
):
    """
    Record an entry in the audit log.
    Call after every sensitive action (creation, update, deletion, sign-in, etc.).
    """
    entry = AuditLog(
        user_id=utilisateur.id if utilisateur else None,
        user_email=utilisateur.email if utilisateur else None,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else None,
        details=details,
    )
    db.add(entry)
    db.commit()