from django.db.models.signals import post_save
from django.dispatch import receiver

from audit.services import record_event

from .models import Referendum


@receiver(post_save, sender=Referendum)
def record_referendum_created(sender, instance: Referendum, created: bool, **kwargs) -> None:
    if created:
        record_event(
            referendum=instance,
            event_type="referendum_created",
            public_message="S'ha creat el referendum demo.",
        )
