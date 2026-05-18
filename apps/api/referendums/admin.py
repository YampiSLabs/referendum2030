from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from simple_history.admin import SimpleHistoryAdmin
from unfold.admin import ModelAdmin, StackedInline, TabularInline

from .models import Option, Question, Referendum


class OptionInline(TabularInline):
    model = Option
    extra = 0


class QuestionInline(StackedInline):
    model = Question
    extra = 0


@admin.register(Referendum)
class ReferendumAdmin(ImportExportModelAdmin, SimpleHistoryAdmin, ModelAdmin):
    list_display = ("title", "slug", "is_current", "starts_at", "ends_at", "created_at")
    list_filter = ("is_current", "created_at")
    date_hierarchy = "created_at"
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "slug", "description")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (
            "Demo referendum",
            {
                "description": (
                    "Simulació fictícia sense validesa legal ni vinculació institucional."
                ),
                "fields": ("title", "slug", "description", "is_current"),
            },
        ),
        ("Schedule", {"fields": ("starts_at", "ends_at")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(ImportExportModelAdmin, SimpleHistoryAdmin, ModelAdmin):
    list_display = ("text", "referendum", "order")
    list_filter = ("referendum",)
    list_select_related = ("referendum",)
    search_fields = ("text", "referendum__title", "referendum__slug")
    inlines = [OptionInline]


@admin.register(Option)
class OptionAdmin(ImportExportModelAdmin, SimpleHistoryAdmin, ModelAdmin):
    list_display = ("label", "question", "order")
    list_filter = ("question__referendum",)
    list_select_related = ("question", "question__referendum")
    search_fields = ("label", "question__text")
