from django.core.management.base import BaseCommand
from django.db import transaction

from referendums.models import Option, Question, Referendum


class Command(BaseCommand):
    help = "Seed the fictitious Referendum 2030 demo data."

    @transaction.atomic
    def handle(self, *args, **options):
        Referendum.objects.exclude(slug="referendum-2030").update(is_current=False)
        referendum, _ = Referendum.objects.update_or_create(
            slug="referendum-2030",
            defaults={
                "title": "Referèndum 2030",
                "description": (
                    "Simulació cívica fictícia sobre un procés constituent digital. "
                    "No té validesa legal ni vinculació institucional."
                ),
                "is_current": True,
            },
        )
        question, _ = Question.objects.update_or_create(
            referendum=referendum,
            order=1,
            defaults={
                "text": "Vols que Catalunya iniciï un procés constituent digital l'any 2030?"
            },
        )
        for order, label in enumerate(["Sí", "No", "En blanc"], start=1):
            Option.objects.update_or_create(
                question=question,
                label=label,
                defaults={"order": order},
            )
        self.stdout.write(self.style.SUCCESS("Referendum demo ready: referendum-2030"))
