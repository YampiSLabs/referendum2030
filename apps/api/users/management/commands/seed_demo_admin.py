import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create or update the public demo superadmin for Referendum 2030."

    def handle(self, *args, **options):
        username = os.environ.get("DEMO_ADMIN_USERNAME", "yampi")
        password = os.environ.get("DEMO_ADMIN_PASSWORD", "thos")
        email = os.environ.get("DEMO_ADMIN_EMAIL", "yampi@example.test")

        user_model = get_user_model()
        user, created = user_model.objects.get_or_create(
            username=username,
            defaults={"email": email},
        )
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save(update_fields=["email", "is_staff", "is_superuser", "password"])

        verb = "created" if created else "updated"
        self.stdout.write(self.style.SUCCESS(f"Demo superadmin {verb}: {username}"))
        self.stdout.write(
            self.style.WARNING(
                "Demo credentials only. Do not use public credentials with real data "
                "or production secrets."
            )
        )
