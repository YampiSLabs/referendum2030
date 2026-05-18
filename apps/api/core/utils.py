"""
Shared utility functions used across apps.
"""

from django.http import HttpRequest


def get_client_ip(request: HttpRequest) -> str:
    """
    Extract the originating client IP from the request.

    Respects the ``X-Forwarded-For`` header set by the Traefik reverse proxy.
    If the header contains multiple IPs (comma-separated), the first one is
    the original client. Falls back to ``REMOTE_ADDR`` for direct connections.
    """
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")

