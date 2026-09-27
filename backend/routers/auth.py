from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.utilisateur import Utilisateur
from schemas.utilisateur import UtilisateurCreate, UtilisateurOut, UtilisateurLogin
from security import hash_password, verify_password, create_access_token
from security import hash_password, verify_password, create_access_token, get_current_user


router = APIRouter(prefix="/auth", tags=["Authentification"])

# Inscription d'un nouvel utilisateur
@router.post("/register", response_model=UtilisateurOut)
def register(user: UtilisateurCreate, db: Session = Depends(get_db)):
    # Vérifier que l'email n'existe pas déjà
    existing_user = db.query(Utilisateur).filter(Utilisateur.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    nouvel_utilisateur = Utilisateur(
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        mot_de_passe=hash_password(user.mot_de_passe),
        role=user.role,
        organisation_id=user.organisation_id
    )
    db.add(nouvel_utilisateur)
    db.commit()
    db.refresh(nouvel_utilisateur)
    return nouvel_utilisateur

# Connexion d'un utilisateur
@router.post("/login")
def login(credentials: UtilisateurLogin, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.email == credentials.email).first()

    if not user or not verify_password(credentials.mot_de_passe, user.mot_de_passe):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    from audit_logger import enregistrer_action
    enregistrer_action(db, user, "connexion", "Utilisateur", str(user.id))

    return {
        "access_token": token,
        "token_type": "bearer",
        "utilisateur": {
            "id": str(user.id),
            "nom": user.nom,
            "prenom": user.prenom,
            "email": user.email,
            "role": user.role
        }
    }

from fastapi.security import OAuth2PasswordRequestForm

@router.post("/token")
def login_for_swagger(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.mot_de_passe):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token = create_access_token(data={"sub": str(user.id), "role": user.role})

    return {"access_token": token, "token_type": "bearer"}

from pydantic import BaseModel

class ChangementMotDePasse(BaseModel):
    ancien_mot_de_passe: str
    nouveau_mot_de_passe: str


@router.get("/moi", response_model=UtilisateurOut)
def get_mon_profil(
    current_user: Utilisateur = Depends(get_current_user)
):
    return current_user


@router.post("/changer-mot-de-passe")
def changer_mot_de_passe(
    data: ChangementMotDePasse,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    if not verify_password(data.ancien_mot_de_passe, current_user.mot_de_passe):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")

    if len(data.nouveau_mot_de_passe) < 6:
        raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit contenir au moins 6 caractères")

    current_user.mot_de_passe = hash_password(data.nouveau_mot_de_passe)
    db.commit()

    return {"message": "Mot de passe modifié avec succès"}