from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.referentiel import Referentiel
from models.chapitre import Chapitre
from models.clause import Clause
from models.utilisateur import Utilisateur
from schemas.referentiel import ReferentielOut, ChapitreOut
from security import get_current_user
from typing import List
from uuid import UUID

router = APIRouter(prefix="/referentiels", tags=["Référentiels"])

# Lister tous les référentiels disponibles
@router.get("/", response_model=List[ReferentielOut])
def list_referentiels(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    return db.query(Referentiel).all()

# Voir les chapitres + clauses d'un référentiel précis
@router.get("/{referentiel_id}/chapitres", response_model=List[ChapitreOut])
def get_chapitres(
    referentiel_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    chapitres = db.query(Chapitre).filter(Chapitre.referentiel_id == referentiel_id).all()
    if not chapitres:
        raise HTTPException(status_code=404, detail="Aucun chapitre trouvé pour ce référentiel")
    return chapitres