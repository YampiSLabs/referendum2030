from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parents[2]

env = environ.Env(
    DEBUG=(bool, False),
    DJANGO_ALLOWED_HOSTS=(list, []),
    CORS_ALLOWED_ORIGINS=(list, []),
    CSRF_TRUSTED_ORIGINS=(list, []),
)
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("SECRET_KEY", default="dev-insecure-referendum2030-change-me")
DEBUG = env("DEBUG")
ALLOWED_HOSTS = env("DJANGO_ALLOWED_HOSTS")

INSTALLED_APPS = [
    "unfold",
    "unfold.contrib.import_export",
    "unfold.contrib.simple_history",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "drf_spectacular",
    "constance",
    "constance.backends.database",
    "import_export",
    "simple_history",
    "core",
    "referendums",
    "votes",
    "audit",
    "users",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "simple_history.middleware.HistoryRequestMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "core.middleware.DemoProjectHeaderMiddleware",
]

ROOT_URLCONF = "referendum2030.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "referendum2030.wsgi.application"

DATABASES = {
    "default": env.db(default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "ca"
TIME_ZONE = "Europe/Madrid"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = env("CORS_ALLOWED_ORIGINS")
CSRF_TRUSTED_ORIGINS = env("CSRF_TRUSTED_ORIGINS")

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "core.pagination.DefaultPageNumberPagination",
    "DEFAULT_THROTTLE_RATES": {
        "anon": "120/minute",
        "demo_token": "20/hour",
        "demo_vote": "60/hour",
    },
    "EXCEPTION_HANDLER": "core.exceptions.api_exception_handler",
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "structured": {
            "format": "{asctime} {levelname} {name} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "structured",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
        "django.security": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
        "django.server": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Referendum 2030 API",
    "DESCRIPTION": (
        "Fictitious referendum simulation API for portfolio and learning. "
        "No legal validity, no official electoral use."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

CONSTANCE_BACKEND = "constance.backends.database.DatabaseBackend"
CONSTANCE_CONFIG = {
    "DEMO_VOTING_ENABLED": (
        True,
        "Allow demo token issuance and demo voting endpoints.",
        bool,
    ),
    "PUBLIC_RESULTS_ENABLED": (
        True,
        "Allow public aggregate results endpoint.",
        bool,
    ),
}

UNFOLD = {
    "SITE_TITLE": "Referendum 2030",
    "SITE_HEADER": "Referendum 2030",
    "SITE_SUBHEADER": "Admin civic demo",
    "SITE_SYMBOL": "how_to_vote",
    "SITE_URL": "/api/v1/docs/",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": False,
    "COLORS": {
        "base": {
            "50": "oklch(99% .01 90)",
            "100": "oklch(97% .02 88)",
            "200": "oklch(93% .03 86)",
            "300": "oklch(87% .04 84)",
            "400": "oklch(74% .05 80)",
            "500": "oklch(59% .05 75)",
            "600": "oklch(46% .05 70)",
            "700": "oklch(35% .04 68)",
            "800": "oklch(25% .035 260)",
            "900": "oklch(18% .035 260)",
            "950": "oklch(12% .03 260)",
        },
        "primary": {
            "50": "oklch(97% .035 25)",
            "100": "oklch(93% .065 25)",
            "200": "oklch(86% .12 25)",
            "300": "oklch(76% .18 25)",
            "400": "oklch(66% .23 25)",
            "500": "oklch(58% .25 25)",
            "600": "oklch(50% .24 25)",
            "700": "oklch(43% .21 25)",
            "800": "oklch(36% .17 25)",
            "900": "oklch(30% .13 25)",
            "950": "oklch(23% .10 25)",
        },
        "font": {
            "subtle-light": "oklch(46% .05 70)",
            "subtle-dark": "oklch(74% .05 80)",
            "default-light": "oklch(35% .04 68)",
            "default-dark": "oklch(93% .03 86)",
            "important-light": "oklch(18% .035 260)",
            "important-dark": "oklch(99% .01 90)",
        },
    },
}
