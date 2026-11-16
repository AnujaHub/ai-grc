from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID

# Implementation note.
class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    mot_de_passe: str = Field(min_length=8, max_length=72)
    job_title: str
    organisation_id: Optional[UUID] = None

    @field_validator("mot_de_passe")
    @classmethod
    def password_fits_bcrypt(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must not exceed 72 UTF-8 bytes")
        return value


class EmailVerificationRequest(BaseModel):
    email: EmailStr
    code: str = Field(pattern=r"^\d{6}$")


class EmailVerificationResend(BaseModel):
    email: EmailStr


# Payload sent to sign in
class UserLogin(BaseModel):
    email: EmailStr
    mot_de_passe: str

# Response returned by the API (never includes the password)
class UserOut(BaseModel):
    id: UUID
    nom: str
    prenom: str
    email: str
    role: str
    job_title: Optional[str] = None
    organisation_id: Optional[UUID] = None
    statut: str
    creation_date: datetime

    class Config:
        from_attributes = True