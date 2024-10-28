from django.urls import path
from .views import HomeAPIView, LoginAPIView, OAuthCallbackAPIView, LogoutAPIView, UserLoginAPIView, UserCreateAPIView

app_name = 'myauth'
urlpatterns = [
    path('api/home/', HomeAPIView.as_view(), name='home'),
    path('api/login-auth/', LoginAPIView.as_view(), name='authlogin'),
    path('oauth/callback/', OAuthCallbackAPIView.as_view(), name='oauth_callback'),
    path('api/logout/', LogoutAPIView.as_view(), name='logout'),
    path('api/login/', UserLoginAPIView.as_view(), name='login'),
    path('api/register/', UserCreateAPIView.as_view(), name='register'),
]