from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from simple_history.admin import SimpleHistoryAdmin
from unfold.admin import ModelAdmin

from .models import AuditEvent


@admin.register(AuditEvent)
class AuditEventAdmin(ImportExportModelAdmin, SimpleHistoryAdmin, ModelAdmin):
    list_display = ("event_type", "referendum", "created_at")
    list_filter = ("event_type", "referendum")
    date_hierarchy = "created_at"
    list_select_related = ("referendum",)
    readonly_fields = ("event_type", "referendum", "public_message", "metadata", "created_at")
    search_fields = ("public_message", "referendum__title", "referendum__slug")
    fieldsets = (
        (
            "Public demo audit event",
            {
                "description": (
                    "Registre públic fictici; no inclou tokens, IPs ni identitat política real."
                ),
                "fields": ("event_type", "referendum", "public_message", "metadata", "created_at"),
            },
        ),
    )
