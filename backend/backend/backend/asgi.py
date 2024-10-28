import chat.routing
import game.routing

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            [
                *chat.routing.websocket_urlpatterns,
                *game.routing.websocket_urlpatterns,
            ]
        )
    ),
})