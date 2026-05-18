from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from simple_history.admin import SimpleHistoryAdmin
from unfold.admin import ModelAdmin

from .models import Vote, VoterToken


@admin.register(VoterToken)
class VoterTokenAdmin(ImportExportModelAdmin, SimpleHistoryAdmin, ModelAdmin):
    list_display = ("referendum", "masked_token_hash", "used_at", "created_at")
    list_filter = ("referendum", "used_at")
    date_hierarchy = "created_at"
    list_select_related = ("referendum",)
    readonly_fields = ("masked_token_hash", "created_at", "used_at")
    exclude = ("token_hash",)
    search_fields = ("token_hash",)

    @admin.display(description="Token hash")
    def masked_token_hash(self, obj: VoterToken) -> str:
        return f"{obj.token_hash[:12]}..."


@admin.register(Vote)
class VoteAdmin(ImportExportModelAdmin, SimpleHistoryAdmin, ModelAdmin):
    list_display = ("referendum", "option", "receipt_code", "created_at")
    list_filter = ("referendum", "option")
    date_hierarchy = "created_at"
    list_select_related = ("referendum", "option", "voter_token")
    readonly_fields = ("receipt_code", "masked_ip_hash", "masked_user_agent_hash", "created_at")
    exclude = ("ip_hash", "user_agent_hash")
    search_fields = ("receipt_code",)

    @admin.display(description="IP hash")
    def masked_ip_hash(self, obj: Vote) -> str:
        return f"{obj.ip_hash[:12]}..." if obj.ip_hash else ""

    @admin.display(description="User agent hash")
    def masked_user_agent_hash(self, obj: Vote) -> str:
        return f"{obj.user_agent_hash[:12]}..." if obj.user_agent_hash else ""
