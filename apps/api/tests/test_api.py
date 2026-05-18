import re

import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import Client
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from audit.models import AuditEvent
from referendums.models import Referendum
from votes.models import Vote, VoterToken

pytestmark = pytest.mark.django_db


def seed_demo() -> Referendum:
    call_command("seed_demo_referendum")
    return Referendum.objects.get(slug="referendum-2030")


def test_health_check_returns_ok():
    response = Client().get("/api/v1/healthz/")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_seed_demo_referendum_is_idempotent():
    seed_demo()
    seed_demo()

    referendum = Referendum.objects.get(slug="referendum-2030")
    assert referendum.title == "Referèndum 2030"
    assert referendum.questions.count() == 1
    assert referendum.questions.first().options.count() == 3
    assert AuditEvent.objects.filter(
        referendum=referendum,
        event_type=AuditEvent.REFERENDUM_CREATED,
    ).count() == 1


def test_seed_demo_admin_creates_idempotent_superuser_and_admin_login_works():
    call_command("seed_demo_admin")
    call_command("seed_demo_admin")

    user = get_user_model().objects.get(username="yampi")

    assert user.email == "yampi@example.test"
    assert user.is_staff is True
    assert user.is_superuser is True
    assert get_user_model().objects.filter(username="yampi").count() == 1
    assert Client().login(username="yampi", password="thos") is True


def test_seed_demo_all_creates_demo_backend_without_duplicating_votes_or_admin():
    call_command("seed_demo_all")
    first_vote_count = Vote.objects.count()
    first_token_count = VoterToken.objects.count()
    call_command("seed_demo_all")

    assert Referendum.objects.filter(slug="referendum-2030").count() == 1
    assert get_user_model().objects.filter(username="yampi").count() == 1
    assert first_vote_count >= 1
    assert first_token_count >= first_vote_count
    assert Vote.objects.count() == first_vote_count
    assert VoterToken.objects.count() == first_token_count


def test_create_token_returns_plain_token_but_stores_only_hash():
    seed_demo()

    response = Client().post("/api/v1/referendums/referendum-2030/tokens/")

    assert response.status_code == 201
    token = response.json()["token"]
    stored = VoterToken.objects.get()
    assert re.fullmatch(r"REF30-[A-Z0-9]{4}-[A-Z0-9]{4}", token)
    assert response.json()["valid"] is True
    assert stored.token_hash != token


def test_vote_once_with_demo_token():
    referendum = seed_demo()
    option = referendum.questions.first().options.first()
    client = Client(HTTP_USER_AGENT="pytest")
    token = client.post("/api/v1/referendums/referendum-2030/tokens/").json()["token"]

    response = client.post(
        "/api/v1/referendums/referendum-2030/votes/",
        {"token": token, "option_id": option.id},
        content_type="application/json",
    )

    assert response.status_code == 201
    assert response.json()["success"] is True
    assert re.fullmatch(r"RCP-[A-Z0-9]{4}-[A-Z0-9]{4}", response.json()["receipt_code"])
    assert response.json()["registered_at"]


def test_second_vote_with_same_token_is_rejected():
    referendum = seed_demo()
    option = referendum.questions.first().options.first()
    client = Client()
    token = client.post("/api/v1/referendums/referendum-2030/tokens/").json()["token"]

    first = client.post(
        "/api/v1/referendums/referendum-2030/votes/",
        {"token": token, "option_id": option.id},
        content_type="application/json",
    )
    second = client.post(
        "/api/v1/referendums/referendum-2030/votes/",
        {"token": token, "option_id": option.id},
        content_type="application/json",
    )

    assert first.status_code == 201
    assert second.status_code == 409


def test_results_return_aggregate_totals_only():
    referendum = seed_demo()
    option = referendum.questions.first().options.first()
    client = Client()
    token = client.post("/api/v1/referendums/referendum-2030/tokens/").json()["token"]
    client.post(
        "/api/v1/referendums/referendum-2030/votes/",
        {"token": token, "option_id": option.id},
        content_type="application/json",
    )

    response = client.get("/api/v1/referendums/referendum-2030/results/")

    assert response.status_code == 200
    body = response.json()
    assert body["total_votes"] == 1
    assert body["tokens_issued"] == 1
    assert body["last_updated"]
    assert body["options"][0]["votes"] == 1
    assert "votes" not in body or isinstance(body["options"], list)
    assert token not in str(body)
    assert VoterToken.objects.get().token_hash not in str(body)


def test_public_audit_logs_match_frontend_contract():
    seed_demo()
    response = Client().get("/api/v1/referendums/referendum-2030/logs/")

    assert response.status_code == 200
    event = response.json()[0]
    assert event["id"].startswith("evt_")
    assert event["verified"] is True


def test_invalid_token_is_rejected_without_creating_vote_or_vote_audit_event():
    referendum = seed_demo()
    option = referendum.questions.first().options.first()

    response = Client().post(
        "/api/v1/referendums/referendum-2030/votes/",
        {"token": "demo_invalid_token_123", "option_id": option.id},
        content_type="application/json",
    )

    assert response.status_code == 404
    assert Vote.objects.count() == 0
    assert not AuditEvent.objects.filter(
        referendum=referendum,
        event_type=AuditEvent.VOTE_CAST,
    ).exists()


def test_invalid_option_is_rejected_and_token_remains_usable():
    referendum = seed_demo()
    option = referendum.questions.first().options.first()
    client = Client()
    token = client.post("/api/v1/referendums/referendum-2030/tokens/").json()["token"]

    invalid = client.post(
        "/api/v1/referendums/referendum-2030/votes/",
        {"token": token, "option_id": 999999},
        content_type="application/json",
    )
    valid = client.post(
        "/api/v1/referendums/referendum-2030/votes/",
        {"token": token, "option_id": option.id},
        content_type="application/json",
    )

    assert invalid.status_code == 400
    assert valid.status_code == 201
    assert Vote.objects.count() == 1


def test_public_payloads_do_not_leak_token_or_request_hashes():
    referendum = seed_demo()
    option = referendum.questions.first().options.first()
    client = Client(HTTP_USER_AGENT="pytest-agent", REMOTE_ADDR="203.0.113.10")
    token = client.post("/api/v1/referendums/referendum-2030/tokens/").json()["token"]
    client.post(
        "/api/v1/referendums/referendum-2030/votes/",
        {"token": token, "option_id": option.id},
        content_type="application/json",
    )
    vote = Vote.objects.get()

    public_payload = {
        "results": client.get("/api/v1/referendums/referendum-2030/results/").json(),
        "audit": client.get("/api/v1/referendums/referendum-2030/audit/").json(),
    }
    public_text = str(public_payload)

    assert token not in public_text
    assert VoterToken.objects.get().token_hash not in public_text
    assert vote.ip_hash not in public_text
    assert vote.user_agent_hash not in public_text


def test_api_responses_include_machine_readable_demo_disclaimer_header():
    seed_demo()

    response = Client().get("/api/v1/referendums/current/")

    assert response.status_code == 200
    assert response.headers["X-Referendum-2030-Demo"] == "fictitious-no-legal-validity"


def test_current_referendum_exposes_live_schedule_and_status():
    referendum = seed_demo()
    now = timezone.now()
    referendum.starts_at = now - timezone.timedelta(hours=1)
    referendum.ends_at = now + timezone.timedelta(hours=1)
    referendum.save(update_fields=["starts_at", "ends_at"])

    response = Client().get("/api/v1/referendums/current/")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "open"
    assert parse_datetime(body["starts_at"]) == referendum.starts_at
    assert parse_datetime(body["ends_at"]) == referendum.ends_at


def test_current_referendum_status_closes_outside_schedule_window():
    referendum = seed_demo()
    now = timezone.now()
    referendum.starts_at = now + timezone.timedelta(days=1)
    referendum.ends_at = now + timezone.timedelta(days=2)
    referendum.save(update_fields=["starts_at", "ends_at"])

    response = Client().get("/api/v1/referendums/current/")

    assert response.status_code == 200
    assert response.json()["status"] == "closed"
