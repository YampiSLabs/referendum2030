import pytest
from django.core.management import call_command
from django.test import Client

from referendums.models import Referendum
from votes.models import VoterToken

pytestmark = pytest.mark.django_db


def seed_demo() -> Referendum:
    call_command("seed_demo_referendum")
    return Referendum.objects.get(slug="referendum-2030")


def test_health_check_returns_ok():
    response = Client().get("/api/v1/healthz")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_seed_demo_referendum_is_idempotent():
    seed_demo()
    seed_demo()

    referendum = Referendum.objects.get(slug="referendum-2030")
    assert referendum.title == "Referèndum 2030"
    assert referendum.questions.count() == 1
    assert referendum.questions.first().options.count() == 3


def test_create_token_returns_plain_token_but_stores_only_hash():
    seed_demo()

    response = Client().post("/api/v1/referendums/referendum-2030/tokens")

    assert response.status_code == 200
    token = response.json()["token"]
    stored = VoterToken.objects.get()
    assert token.startswith("demo_")
    assert stored.token_hash != token


def test_vote_once_with_demo_token():
    referendum = seed_demo()
    option = referendum.questions.first().options.first()
    client = Client(HTTP_USER_AGENT="pytest")
    token = client.post("/api/v1/referendums/referendum-2030/tokens").json()["token"]

    response = client.post(
        "/api/v1/referendums/referendum-2030/vote",
        {"token": token, "option_id": option.id},
        content_type="application/json",
    )

    assert response.status_code == 200
    assert response.json()["receipt_code"].startswith("R2030-")


def test_second_vote_with_same_token_is_rejected():
    referendum = seed_demo()
    option = referendum.questions.first().options.first()
    client = Client()
    token = client.post("/api/v1/referendums/referendum-2030/tokens").json()["token"]

    first = client.post(
        "/api/v1/referendums/referendum-2030/vote",
        {"token": token, "option_id": option.id},
        content_type="application/json",
    )
    second = client.post(
        "/api/v1/referendums/referendum-2030/vote",
        {"token": token, "option_id": option.id},
        content_type="application/json",
    )

    assert first.status_code == 200
    assert second.status_code == 409


def test_results_return_aggregate_totals_only():
    referendum = seed_demo()
    option = referendum.questions.first().options.first()
    client = Client()
    token = client.post("/api/v1/referendums/referendum-2030/tokens").json()["token"]
    client.post(
        "/api/v1/referendums/referendum-2030/vote",
        {"token": token, "option_id": option.id},
        content_type="application/json",
    )

    response = client.get("/api/v1/referendums/referendum-2030/results")

    assert response.status_code == 200
    body = response.json()
    assert body["total_votes"] == 1
    assert body["options"][0]["votes"] == 1
    assert "votes" not in body or isinstance(body["options"], list)
    assert "token" not in str(body).lower()
