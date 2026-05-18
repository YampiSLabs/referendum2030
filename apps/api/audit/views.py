from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from .models import AuditEvent
from .serializers import AuditEventSerializer


class AuditEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditEvent.objects.select_related("referendum").order_by("-created_at")
    serializer_class = AuditEventSerializer
    permission_classes = [IsAdminUser]
