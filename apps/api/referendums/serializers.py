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

    class Meta:
        model = Referendum
        fields = ["title", "slug", "description", "is_current", "question"]

    def get_question(self, obj: Referendum) -> dict | None:
        question = next(iter(obj.questions.all()), None)
        if question is None:
            return None
        return QuestionSerializer(question, context=self.context).data

