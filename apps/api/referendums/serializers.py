from rest_framework import serializers

from .models import Option, Question, Referendum


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "label", "order"]


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["text", "options"]


class ReferendumSerializer(serializers.ModelSerializer):
    question = serializers.SerializerMethodField()

    class Meta:
        model = Referendum
        fields = ["title", "slug", "description", "is_current", "question"]

    def get_question(self, obj: Referendum) -> dict | None:
        question = next(iter(obj.questions.all()), None)
        if question is None:
            return None
        return QuestionSerializer(question, context=self.context).data

