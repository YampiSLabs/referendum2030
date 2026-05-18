import hashlib
import hmac
import secrets

from django.conf import settings


def generate_demo_token() -> str:
    """
    Return a cryptographically random token of the form ``REF30-XXXX-XXXX``.

    Uses ``secrets.choice`` (CSPRNG) for security. The plaintext is returned
    to the client exactly once; only the HMAC-SHA256 hash is persisted.
    """
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    first = "".join(secrets.choice(alphabet) for _ in range(4))
    second = "".join(secrets.choice(alphabet) for _ in range(4))
    return f"REF30-{first}-{second}"


def hash_value(value: str) -> str:
    """
    Return the HMAC-SHA256 digest of *value* keyed with Django's SECRET_KEY.

    Using a secret key ensures that even if the database is leaked, the
    original values (tokens, IPs, user agents) cannot be reversed.
    """
    if not value:
        return ""
    return hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        value.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def hash_token(token: str) -> str:
    """Normalise and hash a raw token string for storage/comparison."""
    return hash_value(token.strip())
