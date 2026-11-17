from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.journal_audit import AuditLog
from models.utilisateur import User
from schemas.journal_audit import AuditLogOut
from security import require_roles
from typing import List, Optional

router = APIRouter(prefix="/journal-audit", tags=["Audit Log"])


@router.get("/", response_model=List[AuditLogOut])
def list_audit_log(
    limite: int = 100,
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur", "auditeur"))
):
    query = db.query(AuditLog)
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    return query.order_by(AuditLog.action_date.desc()).limit(limite).all()