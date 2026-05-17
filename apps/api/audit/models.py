from django.db import models


class AuditEvent(models.Model):
    REFERENDUM_CREATED = "referendum_created"
    TOKEN_ISSUED = "token_issued"
    VOTE_CAST = "vote_cast"
    RESULTS_VIEWED = "results_viewed"

    EVENT_TYPES = [
        (REFERENDUM_CREATED, "Referendum created"),
        (TOKEN_ISSUED, "Token issued"),
        (VOTE_CAST, "Vote cast"),
        (RESULTS_VIEWED, "Results viewed"),
    ]

    referendum = models.ForeignKey(
        "referendums.Referendum",
        related_name="audit_events",
        on_delete=models.CASCADE,
    )
    event_type = models.CharField(max_length=40, choices=EVENT_TYPES)
    public_message = models.CharField(max_length=240)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.event_type}:{self.referendum.slug}"

