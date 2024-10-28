from django.urls import path
from .views import MatchListViews, MatchIdDetailView, MatchRoomCreate, FindMatchForUser

urlpatterns = [
    path('match/', MatchListViews.as_view(), name='match-list'),
    path('match/<int:id>/', MatchIdDetailView.as_view(), name='match-detail'),
    path('match/create/', MatchRoomCreate.as_view(), name='create-match'),
    path('match/find/<str:users>', FindMatchForUser.as_view(), name="find-match"),
]