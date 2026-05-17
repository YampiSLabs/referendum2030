from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("referendums", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="AuditEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "event_type",
                    models.CharField(
                        choices=[
                            ("referendum_created", "Referendum created"),
                            ("token_issued", "Token issued"),
                            ("vote_cast", "Vote cast"),
                            ("results_viewed", "Results viewed"),
                        ],
                        max_length=40,
                    ),
                ),
                ("public_message", models.CharField(max_length=240)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "referendum",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="audit_events",
                        to="referendums.referendum",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]

