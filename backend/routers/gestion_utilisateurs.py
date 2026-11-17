from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.utilisateur import User
from schemas.gestion_utilisateurs import AdminUserCreate, UserUpdate, UserListOut
from security import require_roles, hash_password
from typing import List
from uuid import UUID

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("/", response_model=List[UserListOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur"))
):
    return db.query(User).all()


@router.post("/", response_model=UserListOut)
def create_user(
    data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur"))
):
    existant = db.query(User).filter(User.email == data.email).first()
    if existant:
        raise HTTPException(status_code=400, detail="This email is already in use")

    new_user = User(
        name=data.name,
        first_name=data.first_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        organization_id=data.organization_id,
        email_verified=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.patch("/{user_id}", response_model=UserListOut)
def update_user(
    user_id: UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "administrateur"))
):
    utilisateur = db.query(User).filter(User.id == user_id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="User not found")

    if data.role is not None:
        utilisateur.role = data.role
    if data.status is not None:
        utilisateur.status = data.status
    if data.organization_id is not None:
        utilisateur.organization_id = data.organization_id

    db.commit()
    db.refresh(utilisateur)
    return utilisateur