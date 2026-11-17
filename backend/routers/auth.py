import os
import secrets
import hashlib
import hmac
import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from authlib.integrations.base_client.errors import OAuthError
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from database import get_db
from models.utilisateur import User
from models.verification_token import VerificationToken
from schemas.utilisateur import (
    EmailVerificationRequest,
    EmailVerificationResend,
    UserCreate,
    UserOut,
    UserLogin,
)
from security import hash_password, verify_password, create_access_token, get_current_user
from email_service import (
    EmailDeliveryError,
    send_verification_email,
    validate_email_configuration,
)


router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

EMAIL_VERIFICATION_PURPOSE = "email_verification"
EMAIL_VERIFICATION_TTL = timedelta(minutes=10)
EMAIL_VERIFICATION_RESEND_COOLDOWN = timedelta(seconds=60)
EMAIL_VERIFICATION_SEND_WINDOW = timedelta(hours=1)
EMAIL_VERIFICATION_MAX_SENDS = 5
EMAIL_VERIFICATION_MAX_SENDS_PER_IP = 10
EMAIL_VERIFICATION_MAX_ATTEMPTS = 5
REGISTRATION_RESPONSE = {
    "message": "If this address can be registered, verification instructions will be sent."
}

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


def _normalized_email(email: str) -> str:
    return email.strip().lower()


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _email_otp_secret() -> bytes:
    secret = os.getenv("EMAIL_OTP_HASH_SECRET")
    if not secret or len(secret) < 32:
        raise RuntimeError("EMAIL_OTP_HASH_SECRET must contain at least 32 characters")
    return secret.encode("utf-8")


def _hash_email_code(user_id, code: str) -> str:
    message = f"{EMAIL_VERIFICATION_PURPOSE}:{user_id}:{code}".encode("utf-8")
    return hmac.new(_email_otp_secret(), message, hashlib.sha256).hexdigest()


def _new_email_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def _ensure_verification_configured() -> None:
    try:
        _email_otp_secret()
        validate_email_configuration()
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Email verification is not configured correctly: {exc}",
        ) from exc


def _send_email_code(user: User, challenge: VerificationToken, db: Session) -> None:
    code = _new_email_code()
    try:
        challenge.token_hash = _hash_email_code(user.id, code)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail="Email verification is not configured on the server.",
        ) from exc
    challenge.expires_at = datetime.now(timezone.utc) + EMAIL_VERIFICATION_TTL
    challenge.attempts = 0
    db.commit()

    try:
        send_verification_email(user.email, code)
    except (EmailDeliveryError, RuntimeError) as exc:
        logger.exception("Could not send email verification message")
        challenge.sent_at = datetime.now(timezone.utc) - EMAIL_VERIFICATION_RESEND_COOLDOWN
        db.commit()
        raise HTTPException(
            status_code=503,
            detail="Your registration is saved, but the verification email could not be sent. Please try again.",
        ) from exc

    challenge.sent_at = datetime.now(timezone.utc)
    db.commit()


def _get_or_create_challenge(user: User, db: Session, now: datetime) -> VerificationToken:
    challenge = (
        db.query(VerificationToken)
        .filter(
            VerificationToken.user_id == user.id,
            VerificationToken.purpose == EMAIL_VERIFICATION_PURPOSE,
        )
        .with_for_update()
        .first()
    )
    if challenge is None:
        challenge = VerificationToken(
            user_id=user.id,
            token_hash="",
            purpose=EMAIL_VERIFICATION_PURPOSE,
            expires_at=now,
            attempts=0,
            sent_at=now - EMAIL_VERIFICATION_RESEND_COOLDOWN,
            send_count=0,
            window_started_at=now,
        )
        db.add(challenge)
        db.flush()
    return challenge


def _ip_send_limit_reached(db: Session, request_ip: str | None, now: datetime) -> bool:
    if not request_ip:
        return False
    recent_sends = (
        db.query(func.count(VerificationToken.id))
        .filter(
            VerificationToken.request_ip == request_ip,
            VerificationToken.sent_at >= now - EMAIL_VERIFICATION_SEND_WINDOW,
        )
        .scalar()
    )
    return recent_sends >= EMAIL_VERIFICATION_MAX_SENDS_PER_IP


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
        logger.exception("Google OAuth callback failed")
        raise HTTPException(
            status_code=401,
            detail=f"Google authentication failed: {exc}"
        ) from exc

    email = google_user.get("email")
    google_sub = google_user.get("sub")

    if not email or not google_sub or not google_user.get("email_verified", False):
        raise HTTPException(status_code=400, detail="Google account email is not verified")

    email = _normalized_email(email)

    user = db.query(User).filter(User.google_sub == google_sub).first()

    if not user:
        user = db.query(User).filter(func.lower(User.email) == email).first()

    if user:
        user.google_sub = google_sub
        user.email_verified = True

        if user.status == "en_attente_approbation":
            user.status = "actif"

        db.query(VerificationToken).filter(
            VerificationToken.user_id == user.id,
            VerificationToken.purpose == EMAIL_VERIFICATION_PURPOSE,
        ).delete(synchronize_session=False)

        db.commit()
        db.refresh(user)

    else:
        user = User(
            name=google_user.get("family_name") or "Google",
            first_name=google_user.get("given_name") or "User",
            email=email,
            password_hash=hash_password(secrets.token_urlsafe(32)),
            google_sub=google_sub,
            job_title="Other",
            role="responsable_conformite",
            status="actif",
            email_verified=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )

    return RedirectResponse(
        f"{FRONTEND_URL}/auth/google/callback#access_token={access_token}",
        status_code=303,
    )


# Register a new password-based user and send an email verification code.
@router.post("/register")
def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    _ensure_verification_configured()
    email = _normalized_email(str(user.email))
    now = datetime.now(timezone.utc)
    request_ip = request.client.host if request.client else None
    if _ip_send_limit_reached(db, request_ip, now):
        raise HTTPException(status_code=429, detail="Registration email limit reached. Try again later.")

    existing_user = db.query(User).filter(func.lower(User.email) == email).first()
    if existing_user:
        if not existing_user.email_verified:
            challenge = _get_or_create_challenge(existing_user, db, now)
            if now - _as_utc(challenge.sent_at) >= EMAIL_VERIFICATION_RESEND_COOLDOWN:
                if now - _as_utc(challenge.window_started_at) >= EMAIL_VERIFICATION_SEND_WINDOW:
                    challenge.window_started_at = now
                    challenge.send_count = 0
                if challenge.send_count < EMAIL_VERIFICATION_MAX_SENDS:
                    challenge.send_count += 1
                    challenge.sent_at = now
                    challenge.request_ip = request_ip
                    db.commit()
                    _send_email_code(existing_user, challenge, db)
        return REGISTRATION_RESPONSE

    new_user = User(
        name=user.name,
        first_name=user.first_name,
        email=email,
        password_hash=hash_password(user.password),
        job_title=user.job_title,
        role="responsable_conformite",
        organization_id=user.organization_id,
        status="en_attente_approbation",
        email_verified=False,
    )
    try:
        db.add(new_user)
        db.flush()
        challenge = VerificationToken(
            user_id=new_user.id,
            token_hash="",
            purpose=EMAIL_VERIFICATION_PURPOSE,
            expires_at=now,
            attempts=0,
            sent_at=now - EMAIL_VERIFICATION_RESEND_COOLDOWN,
            send_count=1,
            window_started_at=now,
            request_ip=request_ip,
        )
        db.add(challenge)
        db.commit()
    except IntegrityError:
        db.rollback()
        if db.query(User).filter(func.lower(User.email) == email).first():
            return REGISTRATION_RESPONSE
        raise

    _send_email_code(new_user, challenge, db)
    return REGISTRATION_RESPONSE


@router.post("/verify-email")
def verify_email(data: EmailVerificationRequest, db: Session = Depends(get_db)):
    email = _normalized_email(str(data.email))
    now = datetime.now(timezone.utc)
    user = db.query(User).filter(func.lower(User.email) == email).with_for_update().first()
    if user is None or user.email_verified:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")

    challenge = (
        db.query(VerificationToken)
        .filter(
            VerificationToken.user_id == user.id,
            VerificationToken.purpose == EMAIL_VERIFICATION_PURPOSE,
        )
        .with_for_update()
        .first()
    )
    if challenge is None or _as_utc(challenge.expires_at) <= now:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    if challenge.attempts >= EMAIL_VERIFICATION_MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many incorrect codes. Request a new code.")

    try:
        expected_hash = _hash_email_code(user.id, data.code)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail="Email verification is not configured on the server.",
        ) from exc
    if not hmac.compare_digest(challenge.token_hash, expected_hash):
        challenge.attempts += 1
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")

    user.email_verified = True
    user.status = "actif"
    db.delete(challenge)
    db.commit()
    return {"message": "Email verified. You can now sign in."}


@router.post("/resend-verification")
def resend_verification(
    data: EmailVerificationResend,
    request: Request,
    db: Session = Depends(get_db),
):
    _ensure_verification_configured()
    email = _normalized_email(str(data.email))
    user = db.query(User).filter(func.lower(User.email) == email).with_for_update().first()
    if user is None or user.email_verified:
        return {"message": "If this address needs verification, a code will be sent."}

    now = datetime.now(timezone.utc)
    request_ip = request.client.host if request.client else None
    challenge = _get_or_create_challenge(user, db, now)
    if now - _as_utc(challenge.sent_at) < EMAIL_VERIFICATION_RESEND_COOLDOWN:
        return {"message": "If this address needs verification, a code will be sent."}
    if _ip_send_limit_reached(db, request_ip, now):
        return {"message": "If this address needs verification, a code will be sent."}

    if now - _as_utc(challenge.window_started_at) >= EMAIL_VERIFICATION_SEND_WINDOW:
        challenge.window_started_at = now
        challenge.send_count = 0
    if challenge.send_count >= EMAIL_VERIFICATION_MAX_SENDS:
        return {"message": "If this address needs verification, a code will be sent."}

    challenge.send_count += 1
    challenge.sent_at = now
    challenge.request_ip = request_ip
    db.commit()
    _send_email_code(user, challenge, db)
    return {"message": "If this address needs verification, a code will be sent."}

# Sign in a user
@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    email = _normalized_email(str(credentials.email))
    user = db.query(User).filter(func.lower(User.email) == email).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.email_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before signing in")

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    from audit_logger import record_action
    record_action(db, user, "connexion", "Utilisateur", str(user.id))

    return {
        "access_token": token,
        "token_type": "bearer",
        "utilisateur": {
            "id": str(user.id),
            "name": user.name,
            "first_name": user.first_name,
            "email": user.email,
            "role": user.role
        }
    }

from fastapi.security import OAuth2PasswordRequestForm

@router.post("/token")
def login_for_swagger(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = _normalized_email(form_data.username)
    user = db.query(User).filter(func.lower(User.email) == email).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.email_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before signing in")


    token = create_access_token(data={"sub": str(user.id), "role": user.role})

    return {"access_token": token, "token_type": "bearer"}

from pydantic import BaseModel

class ChangementMotDePasse(BaseModel):
    current_password: str
    new_password: str


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
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="The new password must contain at least 6 characters")

    current_user.password_hash = hash_password(data.new_password)
    db.commit()

    return {"message": "Password changed successfully"}