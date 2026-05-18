from django.db.models import Prefetch, QuerySet

from .models import Option, Question, Referendum


def referendum_queryset() -> QuerySet[Referendum]:
    """
    Return all referendums with their questions and options eagerly loaded.

    Uses ``Prefetch`` to avoid N+1 queries when serialising nested
    question → options in ``ReferendumSerializer``.
    """
    return Referendum.objects.prefetch_related(
        Prefetch(
            "questions",
            queryset=Question.objects.prefetch_related(
                Prefetch("options", queryset=Option.objects.order_by("order", "id"))
            ).order_by("order", "id"),
        )
    )


def current_referendum_queryset() -> QuerySet[Referendum]:
    """Return the (at most one) currently active referendum."""
    return referendum_queryset().filter(is_current=True).order_by("-created_at")

