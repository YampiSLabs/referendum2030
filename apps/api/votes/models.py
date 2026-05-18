import secrets

from django.db import models
from simple_history.models import HistoricalRecords


class VoterToken(models.Model):
    """
    A one-time demo token issued for a specific referendum.

    Only the HMAC-SHA256 hash is stored; the plaintext token is returned
    once at issuance and never persisted. ``used_at`` being non-null means
    the token has already been consumed.
    """

    referendum = models.ForeignKey(
        "referendums.Referendum",
        verbose_name="referèndum",
        related_name="tokens",
        on_delete=models.CASCADE,
        db_index=True,
    )
    token_hash = models.CharField("hash del token", max_length=128)
    used_at = models.DateTimeField("utilitzat", null=True, blank=True, db_index=True)
    created_at = models.DateTimeField("creat", auto_now_add=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Token de vot"
        verbose_name_plural = "Tokens de vot"
        ordering = ["-created_at"]
        unique_together = [("referendum", "token_hash")]

    def __str__(self) -> str:
        return f"{self.referendum.slug}:{self.token_hash[:12]}..."


class Vote(models.Model):
    """
    A single cast vote linked to a specific option and a one-time token.

    ``on_delete=models.PROTECT`` ensures referendum, option, and token
    records are never accidentally deleted while votes reference them.
    IP and User-Agent are stored as hashes only — no PII in plain text.
    """

    referendum = models.ForeignKey(
        "referendums.Referendum",
        verbose_name="referèndum",
        related_name="votes",
        on_delete=models.CASCADE,
    )
    option = models.ForeignKey(
        "referendums.Option", verbose_name="opció",
        related_name="votes", on_delete=models.PROTECT,
    )
    voter_token = models.OneToOneField(
        VoterToken, verbose_name="token",
        related_name="vote", on_delete=models.PROTECT,
    )
    receipt_code = models.CharField("codi de rebut", max_length=64, unique=True)
    ip_hash = models.CharField("hash d'IP", max_length=128, blank=True)
    user_agent_hash = models.CharField("hash d'User-Agent", max_length=128, blank=True)
    created_at = models.DateTimeField("creat", auto_now_add=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Vot"
        verbose_name_plural = "Vots"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.receipt_code

    @staticmethod
    def generate_receipt_code() -> str:
        alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        first = "".join(secrets.choice(alphabet) for _ in range(4))
        second = "".join(secrets.choice(alphabet) for _ in range(4))
        return f"RCP-{first}-{second}"
