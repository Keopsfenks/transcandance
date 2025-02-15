# Generated by Django 5.1.1 on 2024-10-08 05:00

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('room_id', models.CharField(blank=True, max_length=100, null=True)),
                ('host_score', models.IntegerField(default=0)),
                ('quest_score', models.IntegerField(default=0)),
                ('status', models.CharField(default='Pending', max_length=50)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('guest', models.ManyToManyField(blank=True, null=True, related_name='guest', to=settings.AUTH_USER_MODEL)),
                ('host', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='host', to=settings.AUTH_USER_MODEL)),
                ('winner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='winner', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
