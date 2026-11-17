from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.referentiel import ReferenceFramework
from models.chapitre import Chapter
from models.clause import Clause
from models.utilisateur import User
from schemas.referentiel import ReferenceFrameworkOut, ChapterOut
from security import get_current_user
from typing import List
from uuid import UUID

router = APIRouter(prefix="/frameworks", tags=["Frameworks"])

# Implementation note.
@router.get("/", response_model=List[ReferenceFrameworkOut])
def list_referentiels(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ReferenceFramework).all()

# Implementation note.
@router.get("/{framework_id}/chapters", response_model=List[ChapterOut])
def get_chapters(
    framework_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chapters = db.query(Chapter).filter(Chapter.framework_id == framework_id).all()
    if not chapters:
        raise HTTPException(status_code=404, detail="No chapters found for this framework")
    return chapters