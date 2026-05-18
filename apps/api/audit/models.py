from django.db import models
from simple_history.models import HistoricalRecords


class AuditEvent(models.Model):
    """
    Immutable public audit log entry for every meaningful action.

    ``event_type`` uses class-level constants for type-safe comparisons.
    ``metadata`` stores action-specific context (JSON) without sensitive data.
    """

    REFERENDUM_CREATED = "referendum_created"
    TOKEN_ISSUED = "token_issued"
    VOTE_CAST = "vote_cast"
    RESULTS_VIEWED = "results_viewed"

    EVENT_TYPES = [
        (REFERENDUM_CREATED, "Referendum creat"),
        (TOKEN_ISSUED, "Token emès"),
        (VOTE_CAST, "Vot registrat"),
        (RESULTS_VIEWED, "Resultats consultats"),
    ]

    referendum = models.ForeignKey(
        "referendums.Referendum",
        verbose_name="referèndum",
        related_name="audit_events",
        on_delete=models.CASCADE,
    )
    event_type = models.CharField(
        "tipus", max_length=40, choices=EVENT_TYPES, db_index=True,
    )
    public_message = models.CharField("missatge públic", max_length=240)
    metadata = models.JSONField("metadades", default=dict, blank=True)
    created_at = models.DateTimeField("creat", auto_now_add=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Esdeveniment d'auditoria"
        verbose_name_plural = "Esdeveniments d'auditoria"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.event_type}:{self.referendum.slug}"
