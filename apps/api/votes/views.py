from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.serializers import ModelSerializer

from .models import Vote


class VoteAdminSerializer(ModelSerializer):
    class Meta:
        model = Vote
        fields = ["id", "referendum", "option", "receipt_code", "created_at"]


class VoteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Vote.objects.select_related("referendum", "option").order_by("-created_at")
    serializer_class = VoteAdminSerializer
    permission_classes = [IsAdminUser]
