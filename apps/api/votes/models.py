import secrets

from django.db import models
from simple_history.models import HistoricalRecords


class VoterToken(models.Model):
    referendum = models.ForeignKey(
        "referendums.Referendum",
        related_name="tokens",
        on_delete=models.CASCADE,
    )
    token_hash = models.CharField(max_length=128, unique=True)
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    history = HistoricalRecords()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.referendum.slug}:{self.token_hash[:12]}"


class Vote(models.Model):
    referendum = models.ForeignKey(
        "referendums.Referendum",
        related_name="votes",
        on_delete=models.CASCADE,
    )
    option = models.ForeignKey("referendums.Option", related_name="votes", on_delete=models.PROTECT)
    voter_token = models.OneToOneField(VoterToken, related_name="vote", on_delete=models.PROTECT)
    receipt_code = models.CharField(max_length=64, unique=True)
    ip_hash = models.CharField(max_length=128, blank=True)
    user_agent_hash = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    history = HistoricalRecords()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.receipt_code

    @staticmethod
    def generate_receipt_code() -> str:
        alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        first = "".join(secrets.choice(alphabet) for _ in range(4))
        second = "".join(secrets.choice(alphabet) for _ in range(4))
        return f"RCP-{first}-{second}"
