from referendums.models import Referendum

from .models import AuditEvent


def record_event(
    *,
    referendum: Referendum,
    event_type: str,
    public_message: str,
    metadata: dict | None = None,
) -> AuditEvent:
    return AuditEvent.objects.create(
        referendum=referendum,
        event_type=event_type,
        public_message=public_message,
        metadata=metadata or {},
    )

