import hashlib
import hmac
import secrets

from django.conf import settings


def generate_demo_token() -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    first = "".join(secrets.choice(alphabet) for _ in range(4))
    second = "".join(secrets.choice(alphabet) for _ in range(4))
    return f"REF30-{first}-{second}"


def hash_value(value: str) -> str:
    if not value:
        return ""
    return hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        value.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def hash_token(token: str) -> str:
    return hash_value(token.strip())
