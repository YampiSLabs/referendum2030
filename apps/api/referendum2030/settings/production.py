# ruff: noqa: F403
"""
Production Django settings for Referendum 2030.

Reads every secret and domain from environment variables (django-environ).
``SECURE_PROXY_SSL_HEADER`` is already set in base.py so Django correctly
detects HTTPS when running behind the Traefik reverse proxy.
"""

from environ import Env

from .base import *  # noqa: F403, I001

_env = Env(
    DJANGO_ALLOWED_HOSTS=(list, []),
    CORS_ALLOWED_ORIGINS=(list, []),
    CSRF_TRUSTED_ORIGINS=(list, []),
)

DEBUG = False
SECRET_KEY = _env("SECRET_KEY")
ALLOWED_HOSTS = _env("DJANGO_ALLOWED_HOSTS")
CORS_ALLOWED_ORIGINS = _env("CORS_ALLOWED_ORIGINS")
CSRF_TRUSTED_ORIGINS = _env("CSRF_TRUSTED_ORIGINS", default=[])

SESSION_COOKIE_SECURE = _env.bool("SESSION_COOKIE_SECURE", default=True)
CSRF_COOKIE_SECURE = _env.bool("CSRF_COOKIE_SECURE", default=True)
SECURE_SSL_REDIRECT = _env.bool("SECURE_SSL_REDIRECT", default=False)
SECURE_HSTS_SECONDS = _env.int("SECURE_HSTS_SECONDS", default=0)
SECURE_HSTS_INCLUDE_SUBDOMAINS = _env.bool("SECURE_HSTS_INCLUDE_SUBDOMAINS", default=False)
SECURE_HSTS_PRELOAD = _env.bool("SECURE_HSTS_PRELOAD", default=False)

# Disable DRF's browsable API in production — only JSON responses.
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [  # noqa: F405
    "rest_framework.renderers.JSONRenderer",
]
