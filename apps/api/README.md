# Referendum 2030 API

Django 6 API for the fictitious Referendum 2030 demo.

## Local

```bash
uv sync
uv run python manage.py migrate
uv run python manage.py seed_demo_referendum
uv run python manage.py runserver
```

API docs are exposed by Django Ninja at `/api/v1/docs`.

## Tests

```bash
uv run pytest
uv run ruff check .
```

