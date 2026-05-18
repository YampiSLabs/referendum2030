# Referendum 2030 API

Django 6 + Django REST Framework API for the fictitious Referendum 2030 demo.

This is a portfolio/learning simulation. It is not official and has no legal or
electoral validity.

## Local

```bash
uv sync
uv run python manage.py migrate
uv run python manage.py seed_demo_all
uv run python manage.py runserver
```

API docs are exposed by drf-spectacular at `/api/v1/docs/`.

Main public endpoints:

- `GET /api/v1/healthz/`
- `GET /api/v1/referendums/current/`
- `GET /api/v1/referendums/<slug>/`
- `POST /api/v1/referendums/<slug>/tokens/`
- `POST /api/v1/referendums/<slug>/votes/`
- `GET /api/v1/referendums/<slug>/results/`
- `GET /api/v1/referendums/<slug>/logs/`

Admin includes Django Unfold, import/export, simple history, and Constance flags
for enabling/disabling demo voting and public results.

Demo admin access:

- URL: `http://127.0.0.1:8000/admin/`
- Username: `yampi`
- Password: `thos`

The demo admin account is created only by `seed_demo_admin` or `seed_demo_all`.
It is public on purpose for portfolio review, and must not be reused with real
personal data, real secrets, or a production system outside this simulation.

Override credentials when needed:

```bash
DEMO_ADMIN_USERNAME=reviewer DEMO_ADMIN_PASSWORD=change-me uv run python manage.py seed_demo_admin
```

## Tests

```bash
uv run pytest
uv run ruff check .
```

## Docker Production on Hostinger KVM2

The production container runs Gunicorn by default. Root `compose.prod.yml` runs
only backend services: Django API plus PostgreSQL. The frontend is deployed
separately on GitHub Pages.

```bash
cp .env.prod.example .env.prod
docker compose --env-file .env.prod -f compose.prod.yml up -d --build
docker compose --env-file .env.prod -f compose.prod.yml exec api uv run python manage.py seed_demo_all
```

For an HTTP-only first smoke test, keep `SESSION_COOKIE_SECURE=False` and
`CSRF_COOKIE_SECURE=False`. Switch them to `True` after HTTPS is active.
