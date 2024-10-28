import json
import asyncio
import time

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer


from users.models import User
from .models import Match
from .views import GamePlay

room_counters = {}
games = {}

class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.match = None
        self.username = None
        self.room_group_name = None
        self.room_name = None

    async def connect(self):
        print(games)

        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.username = self.scope['url_route']['kwargs']['username']
        self.room_group_name = 'game_%s' % self.room_name

        try:
            self.user = await database_sync_to_async(User.objects.get)(username=self.username)
            self.match = await database_sync_to_async(Match.objects.get)(room_id=self.room_name)

            # Oda varsa yeniden oluşturma, sadece güncelle
            if self.room_name not in games:
                games[self.room_name] = {
                    "game_id": self.room_name,
                    "player1": None,
                    "player1Data": None,
                    "player2": None,
                    "player2Data": None,
                    "game": None,
                    "loop": None
                }

        except User.DoesNotExist or Match.DoesNotExist:
            print("User or Match not found")
            return

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        room_counters[self.room_name] = room_counters.get(self.room_name, 0) + 1
        print(f"Room {self.room_name} has {room_counters[self.room_name]} players")

        try:
            if room_counters.get(self.room_name, 0) == 1:
                if self.match.host is None:
                    print("Player1 is connected")
                    games[self.room_name].update({"player1": self.channel_name})
                    games[self.room_name].update({"player1Data": self.user})
                    self.match.host = self.user
                    await database_sync_to_async(self.match.save)()
                else:
                    print("Player2 is connected")
                    games[self.room_name].update({"player2": self.channel_name})
                    games[self.room_name].update({"player2Data": self.user})
                    await database_sync_to_async(self.match.guest.add)(self.user)
                    await database_sync_to_async(self.match.save)()

            elif room_counters.get(self.room_name, 0) == 2:
                print("Both players are connected")
                if games[self.room_name]["player1"] == self.channel_name:
                    self.match.host = self.user
                    games[self.room_name].update({"player1": self.channel_name})
                    games[self.room_name].update({"player1Data": self.user})
                else:
                    games[self.room_name].update({"player2": self.channel_name})
                    games[self.room_name].update({"player2Data": self.user})
                    await database_sync_to_async(self.match.guest.add)(self.user)

                self.match.status = "playing"
                await database_sync_to_async(self.match.save)()

                if games[self.room_name]["game"] is None:
                    games[self.room_name].update({"game": GamePlay()})

            await self.accept()
        except Exception as e:
            print("Connect Error", e)
            return

        print(games[self.room_name])

    async def disconnect(self, close_code):
        print("girdi")
        room_counters[self.room_name] = room_counters.get(self.room_name, 0) - 1
        print(f"Room {self.room_name} has {room_counters[self.room_name]} players")
        try:
            if games[self.room_name]["game"].gameOver == False:
                if room_counters.get(self.room_name, 0) == 0:
                    print("Room is empty")
                    if hasattr(self, "game_loop_task"):
                        self.game_loop_task.cancel()
                    del games[self.room_name]
                    del room_counters[self.room_name]

                    await database_sync_to_async(self.match.guest.clear)()
                    await database_sync_to_async(self.match.delete)()
                else:
                    if games[self.room_name]["player1"] == self.channel_name:
                        games[self.room_name].update({"player1": None})
                    else:
                        games[self.room_name].update({"player2": None})

                await self.channel_layer.group_discard(self.room_name, self.channel_name)
        except Exception as e:
            print("Disconnect Error", e)
            return

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data['message']
            match data['mode']:
                case "move":
                    if self.channel_name == games[self.room_name]["player1"]:
                        print("Player1")
                        if message == "w" or message == "ArrowUp":
                            games[self.room_name]["game"].leftPlayerMoveUp()
                        elif message == "s" or message == "ArrowDown":
                            games[self.room_name]["game"].leftPlayerMoveDown()
                    elif self.channel_name == games[self.room_name]["player2"]:
                        print("Player2")
                        if message == "w" or message == "ArrowUp":
                            games[self.room_name]["game"].rightPlayerMoveUp()
                        elif message == "s" or message == "ArrowDown":
                            games[self.room_name]["game"].rightPlayerMoveDown()
                case "start-button":
                    print("Start Button")
                    print(room_counters.get(self.room_name, 0))
                    if room_counters.get(self.room_name, 0) == 2:
                        print(games[self.room_name]["game"].gameOver)
                        if not games[self.room_name]["game"].gameOver:
                            await self.channel_layer.group_send(
                                self.room_name,
                                {
                                    'type': 'send_message',
                                    'mode': 'game_start',
                                    'message': ""
                                }
                            )
                            if games[self.room_name]["loop"] is None:
                                games[self.room_name].update({"loop": asyncio.create_task(GameConsumer.game_loop(self))})
                                print(games[self.room_name]["loop"])
                    else:
                        print("Waiting for player2")
                        await self.send(text_data=json.dumps({
                            'mode': 'waiting',
                            'message': 'Waiting for player2'
                        })),
                case "surrender":
                    print("Surrender")
                    host_player = await database_sync_to_async(lambda: self.match.host)()
                    guest_player = await database_sync_to_async(lambda: self.match.guest.first())()
                    surrenderPlayer = await database_sync_to_async(User.objects.get)(username=message)
                    self.match.status = "ended"
                    self.match.host_score = games[self.room_name]["game"].leftPlayerScore
                    self.match.guest_score = games[self.room_name]["game"].rightPlayerScore
                    self.match.winner = host_player if surrenderPlayer == guest_player else guest_player

                    await database_sync_to_async(self.match.save)()
                    games[self.room_name]["game"].gameOver = True
                    await self.channel_layer.group_send(
                        self.room_name,
                        {
                            'type': 'send_message',
                            'mode': 'end_game',
                            'message': {
                                "leftPlayer": games[self.room_name]["game"].leftPlayer,
                                "leftPlayerData": games[self.room_name]["player1Data"].username,
                                "rightPlayer": games[self.room_name]["game"].rightPlayer,
                                "rightPlayerData": games[self.room_name]["player2Data"].username,
                                "BallX": games[self.room_name]["game"].BallX,
                                "BallY": games[self.room_name]["game"].BallY,
                                "leftPlayerScore": games[self.room_name]["game"].leftPlayerScore,
                                "rightPlayerScore": games[self.room_name]["game"].rightPlayerScore,
                                "gameOver": games[self.room_name]["game"].gameOver
                            }
                        }
                    )
                    if hasattr(self, "game_loop_task"):
                        self.game_loop_task.cancel()
        except Exception as e:
            print("Receive Error:", e)
            return

    async def send_message(self, event):
        message = event['message']
        mode = event['mode']
        await self.send(text_data=json.dumps({
            'mode': mode,
            'message': message
        }))

    async def end_game(self):
        print("End Game")
        host_player = await database_sync_to_async(lambda: self.match.host)()
        guest_player = await database_sync_to_async(lambda: self.match.guest.first())()
        if hasattr(self, "game_loop_task"):
            self.game_loop_task.cancel()

        self.match.status = "ended"
        self.match.host_score = games[self.room_name]["game"].leftPlayerScore
        self.match.guest_score = games[self.room_name]["game"].rightPlayerScore
        self.match.winner = host_player if games[self.room_name]["game"].leftPlayerScore > games[self.room_name]["game"].rightPlayerScore else guest_player

        self.match.winner.score += 1
        self.match.played_time = time.time() - games[self.room_name]["game"].started_time
        await database_sync_to_async(self.match.save)()
        games[self.room_name]["game"].gameOver = True
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'send_message',
                'mode': 'end_game',
                'message': {
                    "leftPlayer": games[self.room_name]["game"].leftPlayer,
                    "leftPlayerData": games[self.room_name]["player1Data"].username,
                    "rightPlayer": games[self.room_name]["game"].rightPlayer,
                    "rightPlayerData": games[self.room_name]["player2Data"].username,
                    "BallX": games[self.room_name]["game"].BallX,
                    "BallY": games[self.room_name]["game"].BallY,
                    "leftPlayerScore": games[self.room_name]["game"].leftPlayerScore,
                    "rightPlayerScore": games[self.room_name]["game"].rightPlayerScore,
                    "gameOver": games[self.room_name]["game"].gameOver
                }
            }
        )

    async def game_loop(self):
        print("Game Loop")
        gameData = games[self.room_name]["game"]
        print(games[self.room_name]["player1Data"])
        print(games[self.room_name]["player2Data"])
        gameData.started_time = time.time()
        while self.match.status == "playing":
            gameData.BallX += gameData.ballSpeedX
            gameData.BallY += gameData.ballSpeedY

            if gameData.BallY + gameData.ballRadius > gameData.canvasHeight or gameData.BallY - gameData.ballRadius < 0:
                gameData.ballSpeedY =- gameData.ballSpeedY
            gameData.checkCollision(gameData.leftPlayer, True)
            gameData.checkCollision(gameData.rightPlayer, False)

            if gameData.BallX - gameData.ballRadius < 0:
                gameData.rightPlayerScore += 1
                gameData.resetBall()

            elif gameData.BallX + gameData.ballRadius > gameData.canvasWidth:
                gameData.leftPlayerScore += 1
                gameData.resetBall()

            if gameData.leftPlayerScore == gameData.maxScore or gameData.rightPlayerScore == gameData.maxScore:
                await self.end_game()

            await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': 'send_message',
                    'mode': 'game',
                    'message': {
                        "leftPlayer": games[self.room_name]["game"].leftPlayer,
                        "leftPlayerData": games[self.room_name]["player1Data"].username,
                        "rightPlayer": games[self.room_name]["game"].rightPlayer,
                        "rightPlayerData": games[self.room_name]["player2Data"].username,
                        "BallX": gameData.BallX,
                        "BallY": gameData.BallY,
                        "BallRadius": gameData.ballRadius,
                        "paddleWidth": gameData.paddleWidth,
                        "paddleHeight": gameData.paddleHeight,
                        "leftPlayerScore": gameData.leftPlayerScore,
                        "rightPlayerScore": gameData.rightPlayerScore,
                        "gameOver": gameData.gameOver
                    }
                }
            )
            await asyncio.sleep(0.03)

