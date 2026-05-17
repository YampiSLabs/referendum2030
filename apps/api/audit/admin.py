from django.contrib import admin

from .models import AuditEvent


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ("event_type", "referendum", "created_at")
    list_filter = ("event_type", "referendum")
    readonly_fields = ("event_type", "referendum", "public_message", "metadata", "created_at")

