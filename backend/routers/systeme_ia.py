from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.systeme_ia import SystemeIA
from models.utilisateur import Utilisateur
from schemas.systeme_ia import SystemeIACreate, SystemeIAOut
from security import get_current_user
from typing import List
from uuid import UUID
from security import require_roles

router = APIRouter(prefix="/systemes-ia", tags=["Systèmes IA"])

@router.post("/", response_model=SystemeIAOut)
def create_systeme_ia(
    systeme: SystemeIACreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("administrateur", "responsable_conformite"))
):
    nouveau_systeme = SystemeIA(**systeme.dict())
    db.add(nouveau_systeme)
    db.commit()
    db.refresh(nouveau_systeme)
    return nouveau_systeme

@router.get("/", response_model=List[SystemeIAOut])
def list_systemes_ia(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    return db.query(SystemeIA).all()

@router.get("/{systeme_id}", response_model=SystemeIAOut)
def get_systeme_ia(
    systeme_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    systeme = db.query(SystemeIA).filter(SystemeIA.id == systeme_id).first()
    if not systeme:
        raise HTTPException(status_code=404, detail="Système IA non trouvé")
    return systeme