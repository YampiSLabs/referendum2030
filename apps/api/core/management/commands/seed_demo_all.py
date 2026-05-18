from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction
from django.http import HttpRequest

from referendums.models import Referendum
from votes.models import Vote
from votes.services import cast_demo_vote, issue_demo_token


class Command(BaseCommand):
    help = "Seed the full public Referendum 2030 demo backend."

    @transaction.atomic
    def handle(self, *args, **options):
        call_command("seed_demo_referendum")
        call_command("seed_demo_admin")

        referendum = Referendum.objects.prefetch_related("questions__options").get(
            slug="referendum-2030",
        )
        if not Vote.objects.filter(referendum=referendum).exists():
            question = referendum.questions.first()
            if question is not None:
                for option in question.options.all():
                    token = issue_demo_token(referendum=referendum)["token"]
                    request = HttpRequest()
                    request.META["REMOTE_ADDR"] = "127.0.0.1"
                    request.META["HTTP_USER_AGENT"] = "seed-demo-all"
                    cast_demo_vote(
                        referendum=referendum,
                        token=token,
                        option_id=option.id,
                        request=request,
                    )

        self.stdout.write(self.style.SUCCESS("Full demo backend ready."))
