from typing import Any

from django.db import transaction
from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import NinjaAPI, Schema
from ninja.errors import HttpError

from audit.models import AuditEvent
from referendums.models import Option, Referendum
from votes.models import Vote, VoterToken
from votes.security import generate_demo_token, hash_token, hash_value

api = NinjaAPI(title="Referendum 2030 API", version="1.0.0")


class HealthSchema(Schema):
    status: str


class OptionSchema(Schema):
    id: int
    label: str
    order: int


class QuestionSchema(Schema):
    text: str
    options: list[OptionSchema]


class ReferendumSchema(Schema):
    title: str
    slug: str
    description: str
    is_current: bool
    question: QuestionSchema


class TokenResponseSchema(Schema):
    token: str


class VoteInSchema(Schema):
    token: str
    option_id: int


class VoteReceiptSchema(Schema):
    receipt_code: str


class ResultOptionSchema(Schema):
    option_id: int
    label: str
    votes: int


class ResultsSchema(Schema):
    referendum: str
    slug: str
    total_votes: int
    options: list[ResultOptionSchema]


class AuditEventSchema(Schema):
    event_type: str
    public_message: str
    created_at: str


def referendum_to_dict(referendum: Referendum) -> dict[str, Any]:
    question = referendum.questions.prefetch_related("options").first()
    if question is None:
        raise HttpError(404, "Referendum question not found")
    return {
        "title": referendum.title,
        "slug": referendum.slug,
        "description": referendum.description,
        "is_current": referendum.is_current,
        "question": {
            "text": question.text,
            "options": [
                {"id": option.id, "label": option.label, "order": option.order}
                for option in question.options.all()
            ],
        },
    }


def get_client_ip(request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def record_event(referendum: Referendum, event_type: str, public_message: str) -> None:
    AuditEvent.objects.create(
        referendum=referendum,
        event_type=event_type,
        public_message=public_message,
        metadata={},
    )


@api.get("/healthz", response=HealthSchema)
def healthz(request):
    return {"status": "ok"}


@api.get("/referendums/current", response=ReferendumSchema)
def current_referendum(request):
    referendum = get_object_or_404(
        Referendum.objects.filter(is_current=True).order_by("-created_at")
    )
    return referendum_to_dict(referendum)


@api.get("/referendums/{slug}", response=ReferendumSchema)
def referendum_detail(request, slug: str):
    referendum = get_object_or_404(Referendum.objects.filter(slug=slug))
    return referendum_to_dict(referendum)


@api.post("/referendums/{slug}/tokens", response=TokenResponseSchema)
def issue_token(request, slug: str):
    referendum = get_object_or_404(Referendum.objects.filter(slug=slug))
    token = generate_demo_token()
    VoterToken.objects.create(referendum=referendum, token_hash=hash_token(token))
    record_event(referendum, AuditEvent.TOKEN_ISSUED, "S'ha emes un token demo.")
    return {"token": token}


@api.post("/referendums/{slug}/vote", response=VoteReceiptSchema)
@transaction.atomic
def cast_vote(request, slug: str, payload: VoteInSchema):
    referendum = get_object_or_404(Referendum.objects.select_for_update().filter(slug=slug))
    token_hash = hash_token(payload.token)
    voter_token = get_object_or_404(
        VoterToken.objects.select_for_update().filter(referendum=referendum, token_hash=token_hash)
    )
    if voter_token.used_at is not None:
        raise HttpError(409, "This demo token has already voted")

    option = get_object_or_404(
        Option.objects.filter(id=payload.option_id, question__referendum=referendum)
    )
    ip_hash = hash_value(get_client_ip(request))
    user_agent_hash = hash_value(request.headers.get("user-agent", ""))
    receipt_code = Vote.generate_receipt_code()
    Vote.objects.create(
        referendum=referendum,
        option=option,
        voter_token=voter_token,
        receipt_code=receipt_code,
        ip_hash=ip_hash,
        user_agent_hash=user_agent_hash,
    )
    voter_token.used_at = timezone.now()
    voter_token.save(update_fields=["used_at"])
    record_event(referendum, AuditEvent.VOTE_CAST, "S'ha registrat un vot demo.")
    return {"receipt_code": receipt_code}


@api.get("/referendums/{slug}/results", response=ResultsSchema)
def referendum_results(request, slug: str):
    referendum = get_object_or_404(Referendum.objects.filter(slug=slug))
    question = referendum.questions.first()
    if question is None:
        raise HttpError(404, "Referendum question not found")
    counts = {
        row["option_id"]: row["total"]
        for row in Vote.objects.filter(referendum=referendum)
        .values("option_id")
        .annotate(total=Count("id"))
    }
    options = [
        {"option_id": option.id, "label": option.label, "votes": counts.get(option.id, 0)}
        for option in question.options.all()
    ]
    total_votes = sum(option["votes"] for option in options)
    record_event(referendum, AuditEvent.RESULTS_VIEWED, "S'han consultat els resultats agregats.")
    return {
        "referendum": referendum.title,
        "slug": referendum.slug,
        "total_votes": total_votes,
        "options": options,
    }


@api.get("/referendums/{slug}/audit", response=list[AuditEventSchema])
def referendum_audit(request, slug: str):
    referendum = get_object_or_404(Referendum.objects.filter(slug=slug))
    return [
        {
            "event_type": event.event_type,
            "public_message": event.public_message,
            "created_at": event.created_at.isoformat(),
        }
        for event in referendum.audit_events.order_by("-created_at")[:100]
    ]
