from django.utils import timezone
from rest_framework import serializers

from .models import Option, Question, Referendum


class OptionSerializer(serializers.ModelSerializer):
    """Public facing serializer for a single voting option (Sí / No / En blanc)."""

    class Meta:
        model = Option
        fields = ["id", "label", "order"]


class QuestionSerializer(serializers.ModelSerializer):
    """Wraps a question plus its nested options in a single response."""

    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["text", "options"]


class ReferendumSerializer(serializers.ModelSerializer):
    """
    Top-level referendum representation.

    ``question`` is a ``SerializerMethodField`` that picks the first question
    from the prefetched ``questions`` queryset. The ViewSet already applies
    ``prefetch_related`` so this does not cause an N+1 query.
    """

    question = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Referendum
        fields = [
            "title",
            "slug",
            "description",
            "is_current",
            "starts_at",
            "ends_at",
            "status",
            "question",
        ]

    def get_question(self, obj: Referendum) -> dict | None:
        question = next(iter(obj.questions.all()), None)
        if question is None:
            return None
        return QuestionSerializer(question, context=self.context).data

    def get_status(self, obj: Referendum) -> str:
        now = timezone.now()
        starts_at = obj.starts_at
        ends_at = obj.ends_at

        if not obj.is_current:
            return "closed"
        if starts_at is not None and now < starts_at:
            return "closed"
        if ends_at is not None and now > ends_at:
            return "closed"
        return "open"
