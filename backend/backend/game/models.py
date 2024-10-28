from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.contrib.auth import get_user_model
from django.conf import settings
from django.db.models import IntegerField
from django.template.defaultfilters import default

from backend.settings import AUTH_USER_MODEL


class Match(models.Model):
    id = models.AutoField(primary_key=True)
    room_id = models.CharField(max_length=100, null=True, blank=True)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='host', null=True, blank=True)
    guest = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='guest', blank=True)
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='winner', null=True, blank=True)
    host_score = models.IntegerField(default=0)
    guest_score = models.IntegerField(default=0)
    status = models.CharField(max_length=50, default='Pending')
    created_date = models.DateTimeField(auto_now_add=True)
    played_time = models.IntegerField(default=0)

    def __str__(self):
        return self.room_id
    