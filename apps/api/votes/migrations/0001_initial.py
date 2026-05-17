from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("referendums", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="VoterToken",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("token_hash", models.CharField(max_length=128, unique=True)),
                ("used_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "referendum",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="tokens",
                        to="referendums.referendum",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="Vote",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("receipt_code", models.CharField(max_length=64, unique=True)),
                ("ip_hash", models.CharField(blank=True, max_length=128)),
                ("user_agent_hash", models.CharField(blank=True, max_length=128)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "option",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="votes",
                        to="referendums.option",
                    ),
                ),
                (
                    "referendum",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="votes",
                        to="referendums.referendum",
                    ),
                ),
                (
                    "voter_token",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="vote",
                        to="votes.votertoken",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]

