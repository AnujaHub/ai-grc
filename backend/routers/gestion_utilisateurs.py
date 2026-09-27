from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.utilisateur import Utilisateur
from schemas.gestion_utilisateurs import UtilisateurAdminCreate, UtilisateurUpdate, UtilisateurListOut
from security import require_roles, hash_password
from typing import List
from uuid import UUID

router = APIRouter(prefix="/utilisateurs", tags=["Gestion des utilisateurs"])


@router.get("/", response_model=List[UtilisateurListOut])
def lister_utilisateurs(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("administrateur"))
):
    return db.query(Utilisateur).all()


@router.post("/", response_model=UtilisateurListOut)
def creer_utilisateur(
    data: UtilisateurAdminCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("administrateur"))
):
    existant = db.query(Utilisateur).filter(Utilisateur.email == data.email).first()
    if existant:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    nouvel_utilisateur = Utilisateur(
        nom=data.nom,
        prenom=data.prenom,
        email=data.email,
        mot_de_passe=hash_password(data.mot_de_passe),
        role=data.role,
        organisation_id=data.organisation_id,
    )
    db.add(nouvel_utilisateur)
    db.commit()
    db.refresh(nouvel_utilisateur)
    return nouvel_utilisateur


@router.patch("/{utilisateur_id}", response_model=UtilisateurListOut)
def modifier_utilisateur(
    utilisateur_id: UUID,
    data: UtilisateurUpdate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("administrateur"))
):
    utilisateur = db.query(Utilisateur).filter(Utilisateur.id == utilisateur_id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    if data.role is not None:
        utilisateur.role = data.role
    if data.statut is not None:
        utilisateur.statut = data.statut
    if data.organisation_id is not None:
        utilisateur.organisation_id = data.organisation_id

    db.commit()
    db.refresh(utilisateur)
    return utilisateur