from rest_framework import serializers
import base64, os
from django.conf import settings

from .models import Match
from users.serializers import CustomUserSerializer

class MatchSerializer(serializers.ModelSerializer):
    host = CustomUserSerializer()
    guest = CustomUserSerializer(many=True)
    winner = CustomUserSerializer()
    class Meta:
        model = Match
        fields = 'room_id', 'host', 'guest', 'winner', 'host_score', 'guest_score', 'status', 'created_date', 'played_time'