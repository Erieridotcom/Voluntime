import re
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User
from backend.auth_utils import (
    hash_password,
    verify_password,
    needs_rehash,
    create_access_token,
    get_current_user_id,
    COOKIE_NAME,
)
from backend.rate_limit import check_rate_limit

router = APIRouter(prefix="/auth", tags=["auth"])

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")


class RegisterBody(BaseModel):
    email: str
    password: str
    name: str
    userType: str
    organizationName: str | None = None
    organizationDescription: str | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_RE.match(v):
            raise ValueError("Correo electrónico inválido")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if len(v) > 128:
            raise ValueError("La contraseña es demasiado larga")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        if len(v) > 100:
            raise ValueError("El nombre es demasiado largo")
        return v

    @field_validator("userType")
    @classmethod
    def validate_user_type(cls, v: str) -> str:
        if v not in ("volunteer", "organization"):
            raise ValueError("Tipo de usuario inválido")
        return v


class LoginBody(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


def _user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "userType": user.user_type,
        "organizationName": user.organization_name,
        "createdAt": user.created_at.isoformat(),
    }


def _set_auth_cookie(response: Response, token: str) -> None:
    is_production = bool(os.getenv("PRODUCTION"))
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=7 * 24 * 3600,
        secure=is_production,
        path="/",
    )


import os


@router.post("/register", status_code=201)
def register(
    body: RegisterBody,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    # Rate limit: max 10 registrations per IP per hour
    check_rate_limit(request, "register", max_calls=10, window_seconds=3600)

    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(409, "Este correo ya tiene una cuenta registrada")

    if body.userType == "organization" and not body.organizationName:
        raise HTTPException(400, "El nombre de la organización es requerido")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
        user_type=body.userType,
        organization_name=body.organizationName.strip() if body.organizationName else None,
        organization_description=body.organizationDescription,
        skills=[],
        interests=[],
        accessibility_needs=[],
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    _set_auth_cookie(response, token)

    return {"user": _user_to_dict(user), "message": "Registro exitoso"}


@router.post("/login")
def login(
    body: LoginBody,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    # Rate limit: max 10 login attempts per IP per 15 minutes
    check_rate_limit(request, "login", max_calls=10, window_seconds=900)

    user = db.query(User).filter(User.email == body.email).first()

    # Constant-time failure to prevent user enumeration
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Correo o contraseña incorrectos")

    # Transparently upgrade legacy SHA-256 hashes to bcrypt on login
    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(body.password)
        db.commit()

    token = create_access_token(user.id)
    _set_auth_cookie(response, token)

    return {"user": _user_to_dict(user), "message": "Inicio de sesión exitoso"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"message": "Sesión cerrada"}


@router.get("/me")
def me(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(401, "Usuario no encontrado")
    return _user_to_dict(user)
