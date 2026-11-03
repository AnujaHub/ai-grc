from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.organisation import Organisation
from models.utilisateur import Utilisateur
from schemas.organisation import OrganisationCreate, OrganisationOut
from security import get_current_user, require_roles
from typing import List
from uuid import UUID

router = APIRouter(prefix="/organisations", tags=["Organisations"])

@router.post("/", response_model=OrganisationOut)
def create_organisation(
    org: OrganisationCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(require_roles("administrateur", "super_admin"))
):
    nouvelle_org = Organisation(nom=org.nom, secteur=org.secteur, pays=org.pays)
    db.add(nouvelle_org)
    db.commit()
    db.refresh(nouvelle_org)

    from audit_logger import enregistrer_action
    enregistrer_action(db, current_user, "creation", "Organisation", str(nouvelle_org.id), f"Nom : {nouvelle_org.nom}")

    return nouvelle_org

@router.get("/", response_model=List[OrganisationOut])
def list_organisations(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    return db.query(Organisation).all()

@router.get("/{org_id}", response_model=OrganisationOut)
def get_organisation(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    org = db.query(Organisation).filter(Organisation.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation non trouvée")
    return org