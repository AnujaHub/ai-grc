from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

# Configuration du hachage des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Clé secrète pour signer les tokens JWT (à ne jamais partager publiquement)
SECRET_KEY = "keystone_stage"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Hacher un mot de passe (avant de le stocker en base)
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Vérifier qu'un mot de passe correspond au hash stocké
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Créer un token JWT après une connexion réussie
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session
from database import get_db
from models.utilisateur import Utilisateur

# Indique à FastAPI où se trouve la route de login (pour la doc /docs)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from models.utilisateur import Utilisateur  # import local pour éviter les conflits circulaires

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants invalides ou expirés",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user

def require_roles(*roles_autorises):
    """
    Crée une dépendance FastAPI qui vérifie que l'utilisateur connecté
    a bien l'un des rôles autorisés. Sinon, renvoie une erreur 403.
    Usage : current_user: Utilisateur = Depends(require_roles("administrateur", "responsable_conformite"))
    """
    def verificateur(current_user: Utilisateur = Depends(get_current_user)):
        if current_user.role not in roles_autorises:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action réservée aux rôles : {', '.join(roles_autorises)}"
            )
        return current_user
    return verificateur