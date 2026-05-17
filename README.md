# Referendum 2030

Referendum 2030 is a fictitious civic demo for a simulated Catalan referendum in 2030. It has no legal validity and no connection with any public institution.

Public name: **Referendum 2030**.

> Aquest projecte es una simulacio ficticia sense validesa legal ni vinculacio amb cap institucio publica.

## Architecture

- `apps/api`: Django 6, Django Ninja, PostgreSQL/SQLite, pytest, ruff.
- `apps/web`: static Astro, TypeScript, Tailwind 4, React islands.
- `packages/contracts`: shared API contract docs and OpenAPI snapshot.
- Local runtime: Docker Compose with PostgreSQL, API, and web.
- Deploy targets: GitHub Pages for static frontend, PythonAnywhere for backend.

All live behavior lives in Django. Astro builds static files only: no SSR, no Astro Actions, no Server Islands, no Astro endpoints.

## Local Development

```bash
docker compose up
```

Services:

- API: `http://localhost:8000`
- Frontend: `http://localhost:4321`
- PostgreSQL: `localhost:5432`

Run migrations and seed data:

```bash
docker compose run --rm api uv run python manage.py migrate
docker compose run --rm api uv run python manage.py seed_demo_referendum
```

Health check:

```bash
curl http://localhost:8000/api/v1/healthz
```

## Useful Commands

```bash
pnpm dev
pnpm dev:web
pnpm dev:api
pnpm lint
pnpm test
```

Backend-only:

```bash
cd apps/api
uv run pytest
uv run ruff check .
```

Frontend-only:

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint
```

## Environment Variables

Backend variables live in `apps/api/.env.example`.

- `SECRET_KEY`: Django secret key. Use a real secret in production.
- `DEBUG`: `True` locally, `False` in production.
- `DATABASE_URL`: PostgreSQL URL or SQLite URL.
- `DJANGO_ALLOWED_HOSTS`: comma-separated hosts.
- `CORS_ALLOWED_ORIGINS`: comma-separated origins, never `*` in production. Local defaults include `http://localhost:4321` and `http://127.0.0.1:4321`.
- `CSRF_TRUSTED_ORIGINS`: optional comma-separated trusted origins.

Frontend variables:

- `PUBLIC_API_BASE_URL`: API base URL, for example `http://localhost:8000/api/v1`.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` builds `apps/web` and publishes `apps/web/dist`.

Set repository Pages source to GitHub Actions. Configure:

```text
PUBLIC_API_BASE_URL=https://your-pythonanywhere-domain.example.com/api/v1
```

as a repository or workflow environment variable when deploying against production.

## PythonAnywhere

Recommended steps:

1. Create a Python 3.12 or 3.13 virtualenv.
2. Install `uv`.
3. Upload or clone this repository.
4. From `apps/api`, install dependencies:

   ```bash
   uv sync --no-dev
   ```

5. Configure environment variables: `SECRET_KEY`, `DEBUG=False`, `DJANGO_SETTINGS_MODULE=referendum2030.settings.production`, `DATABASE_URL`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS=https://cdryampi.github.io`.
6. Run:

   ```bash
   uv run python manage.py migrate
   uv run python manage.py seed_demo_referendum
   uv run python manage.py collectstatic --noinput
   ```

7. Configure the PythonAnywhere WSGI file to import `referendum2030.wsgi.application`.
8. Add the GitHub Pages origin to CORS.

## Privacy and Safety

- No real DNI, email, name, or political identity is collected.
- Demo tokens are returned once and stored only as keyed hashes.
- Results are aggregate only.
- Public audit events avoid sensitive payloads.

## Roadmap

- Improve OpenAPI generation automation.
- Add richer public audit filters.
- Add visual regression checks for the static frontend.
- Add deployment environment examples for PythonAnywhere.
