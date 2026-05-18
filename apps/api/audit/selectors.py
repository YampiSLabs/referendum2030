from django.db.models import QuerySet

from referendums.models import Referendum

from .models import AuditEvent


def public_audit_events(referendum: Referendum) -> QuerySet[AuditEvent]:
    return referendum.audit_events.order_by("-created_at")[:100]

