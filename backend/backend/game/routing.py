# your_app/routing.py

from django.urls import re_path
from .consumers import GameConsumer

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<room_name>[A-Za-z0-9_]+)/(?P<username>[A-Za-z0-9_]+)/$', GameConsumer.as_asgi()),
]