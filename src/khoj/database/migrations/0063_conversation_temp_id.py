# Generated by Django 5.0.8 on 2024-09-19 15:53

import uuid

from django.db import migrations, models


def create_uuid(apps, schema_editor):
    Conversation = apps.get_model("database", "Conversation")
    for conversation in Conversation.objects.all():
        conversation.temp_id = uuid.uuid4()
        conversation.save()


def remove_uuid(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("database", "0062_merge_20240913_0222"),
    ]

    operations = [
        migrations.AddField(
            model_name="conversation",
            name="temp_id",
            field=models.UUIDField(default=uuid.uuid4, editable=False),
        ),
        migrations.RunPython(create_uuid, reverse_code=remove_uuid),
        migrations.AlterField(
            model_name="conversation",
            name="temp_id",
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
