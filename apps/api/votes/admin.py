from django.contrib import admin

from .models import Vote, VoterToken


@admin.register(VoterToken)
class VoterTokenAdmin(admin.ModelAdmin):
    list_display = ("referendum", "token_hash", "used_at", "created_at")
    list_filter = ("referendum", "used_at")
    readonly_fields = ("token_hash", "created_at", "used_at")
    search_fields = ("token_hash",)


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ("referendum", "option", "receipt_code", "created_at")
    list_filter = ("referendum", "option")
    readonly_fields = ("receipt_code", "ip_hash", "user_agent_hash", "created_at")

