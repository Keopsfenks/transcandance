from django.urls import path
from .views import UserListView, UserDetailView, AddFriendView, RemoveFriendView, FriendListView, \
    ReceivedRequestListView, SentRequestListView, UserByUsernameView


urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/me/', UserDetailView.as_view(), name='user-detail'),
    path('users/<str:username>/', UserByUsernameView.as_view(), name='user-by-username'),
    path('add-friend/<str:username>', AddFriendView.as_view(), name='add-friend'),
    path('remove-friend/<str:username>', RemoveFriendView.as_view(), name='remove-friend'),
    path('received-requests/', ReceivedRequestListView.as_view(), name='received-request-list'),
    path('sent-requests/', SentRequestListView.as_view(), name='sent-request-list'),
    path('friends/', FriendListView.as_view(), name='friend-list'),
]