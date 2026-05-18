FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:0.9.13 /uv /uvx /usr/local/bin/
COPY pyproject.toml README.md ./
RUN uv sync

COPY . .

EXPOSE 8000

CMD ["uv", "run", "gunicorn", "referendum2030.wsgi:application", "--bind", "0.0.0.0:8000"]
