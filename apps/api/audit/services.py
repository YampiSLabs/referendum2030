from referendums.models import Referendum

from .models import AuditEvent


def record_event(
    *,
    referendum: Referendum,
    event_type: str,
    public_message: str,
    metadata: dict | None = None,
) -> AuditEvent:
    """
    Persist a new entry in the public audit log.

    Callers should pass ``event_type`` using the class constants defined
    on ``AuditEvent`` (e.g. ``AuditEvent.VOTE_CAST``) for type safety.
    """
    return AuditEvent.objects.create(
        referendum=referendum,
        event_type=event_type,
        public_message=public_message,
        metadata=metadata or {},
    )

