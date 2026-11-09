from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.organisation import Organization
from models.utilisateur import User
from schemas.organisation import OrganizationCreate, OrganizationOut
from security import get_current_user, require_roles
from typing import List
from uuid import UUID

router = APIRouter(prefix="/organisations", tags=["Organisations"])

@router.post("/", response_model=OrganizationOut)
def create_organization(
    org: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("administrateur", "super_admin"))
):
    new_organization = Organization(nom=org.nom, secteur=org.secteur, pays=org.pays)
    db.add(new_organization)
    db.commit()
    db.refresh(new_organization)

    from audit_logger import record_action
    record_action(db, current_user, "creation", "Organisation", str(new_organization.id), f"Name:  {new_organization.nom}")

    return new_organization

@router.get("/", response_model=List[OrganizationOut])
def list_organizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Organization).all()

@router.get("/{org_id}", response_model=OrganizationOut)
def get_organization(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org