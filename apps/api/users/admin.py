from django.contrib import admin
from django.contrib.admin.sites import NotRegistered
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

User = get_user_model()

try:
    admin.site.unregister(User)
except NotRegistered:
    pass


@admin.register(User)
class DemoUserAdmin(DjangoUserAdmin):
    list_display = ("username", "email", "is_staff", "is_superuser", "last_login")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email")
    readonly_fields = ("last_login", "date_joined")
    fieldsets = (
        (
            "Demo admin account",
            {
                "description": (
                    "Aquest usuari existeix només per mostrar el panell admin de la "
                    "simulació fictícia Referèndum 2030."
                ),
                "fields": ("username", "password"),
            },
        ),
        ("Contact", {"fields": ("email",)}),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
