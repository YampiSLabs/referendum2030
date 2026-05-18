from rest_framework import serializers

from .models import AuditEvent


class AuditEventSerializer(serializers.ModelSerializer):
    """
    Public-facing audit event representation.

    ``id`` is prefixed with ``evt_`` to match the frontend receipt format.
    ``verified`` is currently a placeholder — every event produced by the
    demo backend is considered authentic.
    """

    id = serializers.SerializerMethodField()
    verified = serializers.SerializerMethodField()

    class Meta:
        model = AuditEvent
        fields = ["id", "event_type", "public_message", "created_at", "verified"]

    def get_id(self, obj: AuditEvent) -> str:
        return f"evt_{obj.pk}"

    def get_verified(self, obj: AuditEvent) -> bool:
        return True

