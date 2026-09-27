from sqlalchemy.orm import Session
from models.journal_audit import JournalAudit
from models.utilisateur import Utilisateur
from uuid import UUID
from typing import Optional


def enregistrer_action(
    db: Session,
    utilisateur: Utilisateur,
    action: str,
    ressource_type: str,
    ressource_id: Optional[str] = None,
    details: Optional[str] = None,
):
    """
    Enregistre une entrée dans le journal d'audit.
    À appeler après chaque action sensible (création, modification, suppression, connexion...).
    """
    entree = JournalAudit(
        utilisateur_id=utilisateur.id if utilisateur else None,
        utilisateur_email=utilisateur.email if utilisateur else None,
        action=action,
        ressource_type=ressource_type,
        ressource_id=str(ressource_id) if ressource_id else None,
        details=details,
    )
    db.add(entree)
    db.commit()