"""JWT authentication utilities para Voluntime."""
import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Cookie, HTTPException, Request, status
from jose import JWTError, jwt

SECRET_KEY = os.getenv("SESSION_SECRET", "voluntared-dev-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
COOKIE_NAME = "voluntared_token"

_BCRYPT_ROUNDS = 12

def hash_password(password: str) -> str:
    prepared = hashlib.sha256(password.encode()).digest()
    return bcrypt.hashpw(prepared, bcrypt.gensalt(rounds=_BCRYPT_ROUNDS)).decode("utf-8")

def _sha256_hash(password: str) -> str:
    return hashlib.sha256((password + "voluntared_salt").encode()).hexdigest()

def _is_bcrypt(stored_hash: str) -> bool:
    return stored_hash.startswith("$2b$") or stored_hash.startswith("$2a$")

def verify_password(plain: str, stored_hash: str) -> bool:
    if _is_bcrypt(stored_hash):
        prepared = hashlib.sha256(plain.encode()).digest()
        try:
            return bcrypt.checkpw(prepared, stored_hash.encode("utf-8"))
        except Exception:
            return False
    else:
        return hmac.compare_digest(_sha256_hash(plain), stored_hash)

def needs_rehash(stored_hash: str) -> bool:
    return not _is_bcrypt(stored_hash)

def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire, "iat": datetime.now(timezone.utc)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return int(user_id)
    except JWTError:
        return None

def get_current_user_id(
    request: Request,
    voluntared_token: Optional[str] = Cookie(default=None),
) -> int:
    token = None
    auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[len("Bearer "):]
    if not token:
        token = voluntared_token
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    user_id = decode_token(token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")
    return user_id

def get_optional_user_id(
    request: Request,
    voluntared_token: Optional[str] = Cookie(default=None),
) -> Optional[int]:
    token = None
    auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[len("Bearer "):]
    if not token:
        token = voluntared_token
    if not token:
        return None
    return decode_token(token)
