import os
import secrets
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from authlib.integrations.base_client.errors import OAuthError
from sqlalchemy.orm import Session
from database import get_db
from models.utilisateur import User
from schemas.utilisateur import UserCreate, UserOut, UserLogin
from security import hash_password, verify_password, create_access_token, get_current_user


router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "http://127.0.0.1:8000/auth/google/callback",
)


@router.get("/google/login")
async def google_login(request: Request):
    if not os.getenv("GOOGLE_CLIENT_ID") or not os.getenv("GOOGLE_CLIENT_SECRET"):
        raise HTTPException(status_code=503, detail="Google authentication is not configured")
    return await oauth.google.authorize_redirect(
        request,
        GOOGLE_REDIRECT_URI,
    )


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
        google_user = token.get("userinfo")
        if not google_user:
            google_user = await oauth.google.userinfo(token=token)
    except OAuthError as exc:
        raise HTTPException(status_code=401, detail="Google authentication failed") from exc

    email = google_user.get("email")
    google_sub = google_user.get("sub")
    if not email or not google_sub or not google_user.get("email_verified", False):
        raise HTTPException(status_code=400, detail="Google account email is not verified")

    user = db.query(User).filter(User.google_sub == google_sub).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()

    if user:
        if user.google_sub != google_sub:
            user.google_sub = google_sub
            db.commit()
            db.refresh(user)
    else:
        user = User(
            nom=google_user.get("family_name") or "Google",
            prenom=google_user.get("given_name") or "User",
            email=email,
            mot_de_passe=hash_password(secrets.token_urlsafe(32)),
            google_sub=google_sub,
            job_title="Other",
            role="responsable_conformite",
            statut="en_attente_approbation",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return RedirectResponse(
        f"{FRONTEND_URL}/auth/google/callback#access_token={access_token}",
        status_code=303,
    )

# Register a new user
@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Implementation note.
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="This email is already in use")

    new_user = User(
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        mot_de_passe=hash_password(user.mot_de_passe),
        job_title=user.job_title,
        role=user.role,
        organisation_id=user.organisation_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Sign in a user
@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.mot_de_passe, user.mot_de_passe):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    from audit_logger import record_action
    record_action(db, user, "connexion", "Utilisateur", str(user.id))

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
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.mot_de_passe):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(data={"sub": str(user.id), "role": user.role})

    return {"access_token": token, "token_type": "bearer"}

from pydantic import BaseModel

class ChangementMotDePasse(BaseModel):
    ancien_mot_de_passe: str
    nouveau_mot_de_passe: str


@router.get("/moi", response_model=UserOut)
def get_mon_profil(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.post("/changer-mot-de-passe")
def change_password(
    data: ChangementMotDePasse,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.ancien_mot_de_passe, current_user.mot_de_passe):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(data.nouveau_mot_de_passe) < 6:
        raise HTTPException(status_code=400, detail="The new password must contain at least 6 characters")

    current_user.mot_de_passe = hash_password(data.nouveau_mot_de_passe)
    db.commit()

    return {"message": "Password changed successfully"}