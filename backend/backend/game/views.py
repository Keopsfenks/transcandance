import math

from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

import json
from .models import Match
from .serializers import MatchSerializer
from users.models import User


class MatchListViews(generics.ListCreateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    authentication_classes = [TokenAuthentication]

class MatchIdDetailView(generics.RetrieveAPIView):
    authentication_classes = [TokenAuthentication]

    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    lookup_field = 'id'

class FindMatchForUser(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    serializer_class = MatchSerializer

    def get_queryset(self):
        try:
            user = User.objects.get(username=self.kwargs['users'])
        except User.DoesNotExist:
            return Match.objects.none()

        matches = Match.objects.filter(
            host=user
        ) | Match.objects.filter(
            guest__username=user.username
        )

        print(matches)
        return matches.distinct()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response({"error": "No matches found for this user."}, status=status.HTTP_404_NOT_FOUND)
        return super().list(request, *args, **kwargs)


class MatchRoomCreate(APIView):
    authentication_classes = [TokenAuthentication]
    serializer_class = MatchSerializer
    def post(self, request):
        try:
            match = Match.objects.create(
                room_id=request.data['room_id'],
                host_score=0,
                guest_score=0,
            )
            serializer = MatchSerializer(match)

            return Response({"data": serializer.data}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class GamePlay:
    def __init__(self):
        self.initialBallSpeedX = 10
        self.initialBallSpeedY = 10
        self.ballSpeedY = self.initialBallSpeedY
        self.ballSpeedX = self.initialBallSpeedX
        self.ballRadius = 10
        self.lastCollision = False
        self.canvasWidth = 600
        self.canvasHeight = 400
        self.paddleWidth = 10
        self.paddleHeight = 80
        self.paddleSpeed = 15
        self.leftPlayer = self.canvasHeight / 2 - self.paddleHeight / 2
        self.rightPlayer = self.canvasHeight / 2 - self.paddleHeight / 2
        self.leftPlayerScore = 0
        self.rightPlayerScore = 0
        self.maxScore = 5
        self.BallX = self.canvasWidth / 2
        self.BallY = self.canvasHeight / 2
        self.gameOver = False
        self.started_time = 0

    def leftPlayerMoveUp(self):
        self.leftPlayer -= self.paddleSpeed
        if self.leftPlayer < 0:
            self.leftPlayer = 0

    def leftPlayerMoveDown(self):
        self.leftPlayer += self.paddleSpeed
        if self.leftPlayer + self.paddleHeight > self.canvasHeight:
            self.leftPlayer = self.canvasHeight - self.paddleHeight

    def rightPlayerMoveUp(self):
        self.rightPlayer -= self.paddleSpeed
        if self.rightPlayer < 0:
            self.rightPlayer = 0

    def rightPlayerMoveDown(self):
        self.rightPlayer += self.paddleSpeed
        if self.rightPlayer + self.paddleHeight > self.canvasHeight:
            self.rightPlayer = self.canvasHeight - self.paddleHeight


    def checkCollision(self, paddleC, isLeftPlayer):
        paddlePosX = self.paddleWidth if isLeftPlayer else self.canvasWidth - self.paddleWidth
        if abs(self.BallX - paddlePosX) < self.ballRadius + self.paddleWidth / 2:
            withinPaddle = self.BallY > paddleC and self.BallY < paddleC + self.paddleHeight
            if withinPaddle and not self.lastCollision:

                collisionPoint = self.BallY - (paddleC + self.paddleHeight / 2)
                normalizedPoint = collisionPoint / (self.paddleHeight / 2)
                bounceAngle = normalizedPoint * (math.pi / 4)

                if abs(normalizedPoint) > 1:
                    normalizedPoint = 1 if normalizedPoint > 0 else -1
                    bounceAngle = normalizedPoint * (math.pi / 4)

                self.ballSpeedX = -self.ballSpeedX * 1.1
                self.ballSpeedY = self.ballSpeedX * math.tan(bounceAngle)
                self.lastCollision = True
            else:
                self.lastCollision = False
        else:
            self.lastCollision = False


    def resetBall(self):
        self.BallX = self.canvasWidth / 2
        self.BallY = self.canvasHeight / 2
        #self.ballSpeedX = -self.ballSpeedX
        self.ballSpeedX = self.initialBallSpeedX
        self.ballSpeedY = self.initialBallSpeedY