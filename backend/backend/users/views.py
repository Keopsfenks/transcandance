from rest_framework import generics, status
from .models import User
from rest_framework.authentication import TokenAuthentication
from .serializers import CustomUserSerializer, FriendUserSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Friendship


class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomUserSerializer

    def get_object(self):
        return self.request.user

class UserByUsernameView(generics.RetrieveAPIView):
    authentication_classes = [TokenAuthentication]
    
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    lookup_field = 'username'


class AddFriendView(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request, *args, **kwargs):
        username = kwargs.get('username')
        try:
            to_user = User.objects.get(username=username)
            if request.user == to_user:
                return Response({"error": "The user cannot be friends with himself."}, status=status.HTTP_400_BAD_REQUEST)
            if Friendship.objects.filter(from_user=request.user, to_user=to_user).exists():
                return Response({"error": "You are already friends."}, status=status.HTTP_400_BAD_REQUEST)
            Friendship.objects.create(from_user=request.user, to_user=to_user)
            if Friendship.objects.filter(from_user=to_user, to_user=request.user).exists():
                return Response({"message": "Friend Added!"}, status=status.HTTP_201_CREATED)
            return Response({"message": "Friendship request sent."}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class RemoveFriendView(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request, *args, **kwargs):
        username = kwargs.get('username')
        try:
            to_user = User.objects.get(username=username)
            from_friendship = Friendship.objects.filter(from_user=request.user, to_user=to_user)
            to_friendship = Friendship.objects.filter(from_user=to_user, to_user=request.user)
            if from_friendship.exists() and to_friendship.exists():
                to_friendship.delete()
                from_friendship.delete()
                return Response({"message": f"{to_user.username} removed."}, status=status.HTTP_200_OK)
            elif to_friendship.exists():
                to_friendship.delete()
                return Response({"message": f"{to_user.username} request rejected."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Friendship not found."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class FriendListView(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]

    serializer_class = FriendUserSerializer

    def get_queryset(self):
        user = self.request.user

        received_users = user.received_friendships.values_list('from_user_id', flat=True)
        sent_users = user.sent_friendships.values_list('to_user_id', flat=True)
        common_user_ids = set(received_users).intersection(set(sent_users))

        return User.objects.filter(id__in=common_user_ids)


class ReceivedRequestListView(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]

    serializer_class = FriendUserSerializer

    def get_queryset(self):
        user = self.request.user

        received_user_ids = user.received_friendships.values_list('from_user_id', flat=True)
        sent_user_ids = user.sent_friendships.values_list('to_user_id', flat=True)
        filtered_received_user_ids = set(received_user_ids) - set(sent_user_ids)

        return User.objects.filter(id__in=filtered_received_user_ids)


class SentRequestListView(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]

    serializer_class = FriendUserSerializer

    def get_queryset(self):
        user = self.request.user

        received_user_ids = user.received_friendships.values_list('from_user_id', flat=True)
        sent_user_ids = user.sent_friendships.values_list('to_user_id', flat=True)
        filtered_sent_user_ids = set(sent_user_ids) - set(received_user_ids)

        return User.objects.filter(id__in=filtered_sent_user_ids)
