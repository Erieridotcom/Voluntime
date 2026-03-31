"""JWT authentication utilities for VoluntaRed."""
import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Cookie, HTTPException, status
from jose import JWTError, jwt

SECRET_KEY = os.getenv("SESSION_SECRET", "voluntared-dev-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
COOKIE_NAME = "voluntared_token"

_BCRYPT_ROUNDS = 12  # ~250ms per hash — strong but usable


def hash_password(password: str) -> str:
    """Hash a password using bcrypt (all new accounts use this)."""
    # bcrypt truncates at 72 bytes; pre-hashing with SHA-256 handles longer passwords
    prepared = hashlib.sha256(password.encode()).digest()
    return bcrypt.hashpw(prepared, bcrypt.gensalt(rounds=_BCRYPT_ROUNDS)).decode("utf-8")


def _sha256_hash(password: str) -> str:
    """Legacy SHA-256 hash from the original Node.js backend."""
    return hashlib.sha256((password + "voluntared_salt").encode()).hexdigest()


def _is_bcrypt(stored_hash: str) -> bool:
    return stored_hash.startswith("$2b$") or stored_hash.startswith("$2a$")


def verify_password(plain: str, stored_hash: str) -> bool:
    """
    Verify a password against a stored hash.
    Supports both bcrypt (new) and SHA-256 (legacy Node.js accounts).
    """
    if _is_bcrypt(stored_hash):
        prepared = hashlib.sha256(plain.encode()).digest()
        try:
            return bcrypt.checkpw(prepared, stored_hash.encode("utf-8"))
        except Exception:
            return False
    else:
        # Constant-time comparison for legacy SHA-256
        return hmac.compare_digest(_sha256_hash(plain), stored_hash)


def needs_rehash(stored_hash: str) -> bool:
    """Returns True if the hash should be upgraded from SHA-256 to bcrypt."""
    return not _is_bcrypt(stored_hash)


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
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
    voluntared_token: Optional[str] = Cookie(default=None),
) -> int:
    if not voluntared_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    user_id = decode_token(voluntared_token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")
    return user_id


def get_optional_user_id(
    voluntared_token: Optional[str] = Cookie(default=None),
) -> Optional[int]:
    if not voluntared_token:
        return None
    return decode_token(voluntared_token)
