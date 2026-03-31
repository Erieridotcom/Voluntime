"""
Simple in-memory rate limiter — no external dependencies.
Limits requests per IP address within a sliding time window.
"""
import time
from collections import defaultdict
from threading import Lock
from fastapi import HTTPException, Request

_lock = Lock()
# { (ip, action): [timestamp, ...] }
_log: dict[tuple[str, str], list[float]] = defaultdict(list)


def check_rate_limit(request: Request, action: str, max_calls: int, window_seconds: int) -> None:
    """
    Raises HTTP 429 if the client has exceeded max_calls within window_seconds.

    Args:
        action: Identifier for the rate-limited endpoint (e.g. "login")
        max_calls: Maximum allowed calls
        window_seconds: Time window in seconds
    """
    ip = request.client.host if request.client else "unknown"
    key = (ip, action)
    now = time.monotonic()
    cutoff = now - window_seconds

    with _lock:
        # Remove outdated entries
        _log[key] = [t for t in _log[key] if t > cutoff]
        if len(_log[key]) >= max_calls:
            raise HTTPException(
                status_code=429,
                detail=f"Demasiados intentos. Espera {window_seconds // 60} minuto(s) e intenta de nuevo."
            )
        _log[key].append(now)
