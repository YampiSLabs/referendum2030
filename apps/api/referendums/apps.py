from django.apps import AppConfig


class ReferendumsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "referendums"

    def ready(self) -> None:
        import referendums.signals  # noqa: F401
