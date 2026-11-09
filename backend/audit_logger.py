from sqlalchemy.orm import Session
from models.journal_audit import AuditLog
from models.utilisateur import User
from uuid import UUID
from typing import Optional


def record_action(
    db: Session,
    utilisateur: User,
    action: str,
    ressource_type: str,
    ressource_id: Optional[str] = None,
    details: Optional[str] = None,
):
    """
    Record an entry in the audit log.
    Call after every sensitive action (creation, update, deletion, sign-in, etc.).
    """
    entry = AuditLog(
        utilisateur_id=utilisateur.id if utilisateur else None,
        utilisateur_email=utilisateur.email if utilisateur else None,
        action=action,
        ressource_type=ressource_type,
        ressource_id=str(ressource_id) if ressource_id else None,
        details=details,
    )
    db.add(entry)
    db.commit()