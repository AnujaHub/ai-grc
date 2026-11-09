from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.systeme_ia import AISystem
from models.utilisateur import User
from schemas.systeme_ia import AISystemCreate, AISystemOut
from security import get_current_user
from typing import List
from uuid import UUID
from security import require_roles

router = APIRouter(prefix="/systemes-ia", tags=["AI Systems"])

@router.post("/", response_model=AISystemOut)
def create_systeme_ia(
    systeme: AISystemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur", "responsable_conformite"))
):
    new_system = AISystem(**systeme.dict())
    db.add(new_system)
    db.commit()
    db.refresh(new_system)
    return new_system

@router.get("/", response_model=List[AISystemOut])
def list_ai_systems(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(AISystem).all()

@router.get("/{systeme_id}", response_model=AISystemOut)
def get_ai_system(
    systeme_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    systeme = db.query(AISystem).filter(AISystem.id == systeme_id).first()
    if not systeme:
        raise HTTPException(status_code=404, detail="AI system not found")
    return systeme