from rest_framework import serializers

from .models import AuditEvent


class AuditEventSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    verified = serializers.SerializerMethodField()

    class Meta:
        model = AuditEvent
        fields = ["id", "event_type", "public_message", "created_at", "verified"]

    def get_id(self, obj: AuditEvent) -> str:
        return f"evt_{obj.pk}"

    def get_verified(self, obj: AuditEvent) -> bool:
        return True

