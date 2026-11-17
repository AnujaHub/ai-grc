from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID

# Implementation note.
class UserCreate(BaseModel):
    name: str
    first_name: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    job_title: str
    role: Optional[str] = "responsable_conformite"
    organization_id: Optional[UUID] = None

    @field_validator("password")
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
    password: str

# Response returned by the API (never includes the password)
class UserOut(BaseModel):
    id: UUID
    name: str
    first_name: str
    email: str
    role: str
    job_title: Optional[str] = None
    organization_id: Optional[UUID] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True