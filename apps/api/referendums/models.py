from django.db import models
from simple_history.models import HistoricalRecords


class Referendum(models.Model):
    """
    A civic referendum simulation. Only one should have is_current=True at a time.

    The starts_at / ends_at window determines availability of voting actions,
    while is_current controls public listing visibility.
    """

    title = models.CharField("títol", max_length=160)
    slug = models.SlugField("identificador únic", unique=True)
    description = models.TextField("descripció", blank=True)
    is_current = models.BooleanField("és actiu", default=False, db_index=True)
    starts_at = models.DateTimeField("inici", null=True, blank=True)
    ends_at = models.DateTimeField("final", null=True, blank=True)
    created_at = models.DateTimeField("creat", auto_now_add=True)
    updated_at = models.DateTimeField("actualitzat", auto_now=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Referèndum"
        verbose_name_plural = "Referèndums"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class Question(models.Model):
    """
    A question belongs to one referendum and holds the text citizens vote on.

    Ordering is explicit via the ``order`` field; ties are broken by PK.
    """

    referendum = models.ForeignKey(
        Referendum, verbose_name="referèndum", related_name="questions",
        on_delete=models.CASCADE, db_index=True,
    )
    text = models.TextField("text de la pregunta")
    order = models.PositiveIntegerField("ordre", default=1)
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Pregunta"
        verbose_name_plural = "Preguntes"
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return self.text[:80]


class Option(models.Model):
    """
    A possible answer (Sí / No / En blanc) inside a Question.

    The (question, label) pair must be unique to prevent duplicate entries.
    """

    question = models.ForeignKey(
        Question, verbose_name="pregunta", related_name="options",
        on_delete=models.CASCADE, db_index=True,
    )
    label = models.CharField("etiqueta", max_length=80)
    order = models.PositiveIntegerField("ordre", default=1)
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Opció"
        verbose_name_plural = "Opcions"
        ordering = ["order", "id"]
        unique_together = [("question", "label")]

    def __str__(self) -> str:
        return self.label
