from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Implementation note.
SECRET_KEY = "keystone_stage"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Hash a password before storing it in the database
def hash_password(mot_de_passe: str) -> str:
    return pwd_context.hash(mot_de_passe)

# Implementation note.
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Implementation note.
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
from models.utilisateur import User

# Implementation note.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from models.utilisateur import User  # Implementation note.

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user

def require_roles(*authorized_roles):
    """
    Create a FastAPI dependency that verifies the authenticated user
    has one of the authorized roles. Otherwise, return a 403 error.
    Usage: current_user: User = Depends(require_roles("administrateur", "responsable_conformite"))
    """
    def verifier(current_user: User = Depends(get_current_user)):
        if current_user.role not in authorized_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action restricted to roles: {', '.join(authorized_roles)}"
            )
        return current_user
    return verifier