from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import NotFound, ValidationError

from audit.models import AuditEvent
from audit.services import record_event
from core.exceptions import Conflict
from core.utils import get_client_ip
from referendums.models import Option, Referendum

from .models import Vote, VoterToken
from .security import generate_demo_token, hash_token, hash_value


def issue_demo_token(*, referendum: Referendum) -> dict:
    token = generate_demo_token()
    VoterToken.objects.create(referendum=referendum, token_hash=hash_token(token))
    record_event(
        referendum=referendum,
        event_type=AuditEvent.TOKEN_ISSUED,
        public_message="S'ha emes un token demo.",
    )
    return {"token": token, "valid": True}


@transaction.atomic
def cast_demo_vote(*, referendum: Referendum, token: str, option_id: int, request) -> dict:
    referendum = Referendum.objects.select_for_update().get(pk=referendum.pk)
    token_hash = hash_token(token)

    try:
        voter_token = VoterToken.objects.select_for_update().get(
            referendum=referendum,
            token_hash=token_hash,
        )
    except VoterToken.DoesNotExist as exc:
        raise NotFound("Token no reconegut o no valid per a aquest simulacre.") from exc

    if voter_token.used_at is not None:
        raise Conflict("Aquest token ja ha estat utilitzat per emetre un vot.")

    try:
        option = Option.objects.get(id=option_id, question__referendum=referendum)
    except Option.DoesNotExist as exc:
        raise ValidationError("Opcio de vot no valida per a aquest referendum.") from exc

    registered_at = timezone.now()
    vote = Vote.objects.create(
        referendum=referendum,
        option=option,
        voter_token=voter_token,
        receipt_code=Vote.generate_receipt_code(),
        ip_hash=hash_value(get_client_ip(request)),
        user_agent_hash=hash_value(request.headers.get("user-agent", "")),
    )
    voter_token.used_at = registered_at
    voter_token.save(update_fields=["used_at"])
    record_event(
        referendum=referendum,
        event_type=AuditEvent.VOTE_CAST,
        public_message="S'ha registrat un vot demo.",
    )
    return {
        "success": True,
        "receipt_code": vote.receipt_code,
        "registered_at": registered_at,
    }
