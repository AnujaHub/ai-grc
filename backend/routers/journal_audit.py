from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.journal_audit import JournalAudit
from models.utilisateur import Utilisateur
from schemas.journal_audit import JournalAuditOut
from security import require_roles
from typing import List, Optional

router = APIRouter(prefix="/journal-audit", tags=["Journal d'audit"])


@router.get("/", response_model=List[JournalAuditOut])
def lister_journal(
    limite: int = 100,
    ressource_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("super_admin", "administrateur", "auditeur"))
):
    query = db.query(JournalAudit)
    if ressource_type:
        query = query.filter(JournalAudit.ressource_type == ressource_type)
    return query.order_by(JournalAudit.date_action.desc()).limit(limite).all()