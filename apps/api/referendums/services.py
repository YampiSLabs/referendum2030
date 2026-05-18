from django.db.models import Count
from django.utils import timezone

from votes.models import Vote, VoterToken

from .models import Referendum


def build_results_payload(referendum: Referendum) -> dict:
    """
    Aggregate vote counts per option for the given referendum.

    Uses a single ``Vote.objects.values(...).annotate(total=Count(...))``
    query to compute per-option totals, then overlays zeros for options
    that received no votes. Returns the same shape expected by the
    frontend results widget.
    """
    question = referendum.questions.prefetch_related("options").first()
    if question is None:
        return {
            "referendum": referendum.title,
            "slug": referendum.slug,
            "total_votes": 0,
            "tokens_issued": 0,
            "last_updated": timezone.now().isoformat(),
            "options": [],
        }

    counts = {
        row["option_id"]: row["total"]
        for row in Vote.objects.filter(referendum=referendum)
        .values("option_id")
        .annotate(total=Count("id"))
    }
    options = [
        {
            "option_id": option.id,
            "label": option.label,
            "votes": counts.get(option.id, 0),
        }
        for option in question.options.all()
    ]
    return {
        "referendum": referendum.title,
        "slug": referendum.slug,
        "total_votes": sum(option["votes"] for option in options),
        "tokens_issued": VoterToken.objects.filter(referendum=referendum).count(),
        "last_updated": timezone.now().isoformat(),
        "options": options,
    }

