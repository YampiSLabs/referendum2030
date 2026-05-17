from django.contrib import admin

from .models import Option, Question, Referendum


class OptionInline(admin.TabularInline):
    model = Option
    extra = 0


class QuestionInline(admin.StackedInline):
    model = Question
    extra = 0


@admin.register(Referendum)
class ReferendumAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "is_current", "created_at")
    list_filter = ("is_current",)
    prepopulated_fields = {"slug": ("title",)}
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("text", "referendum")
    inlines = [OptionInline]


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ("label", "question", "order")
    list_filter = ("question__referendum",)

