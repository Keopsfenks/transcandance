auth_token = localStorage.getItem("token");
let gameSocket = null;

async function createRoom(roomID) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/match/create/`, {
            method: "POST",
            credentials: "include",
            headers: {
                Authorization: `Token ${auth_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ room_id: roomID }),
        });
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("There has been a problem with your fetch operation:", error);
    }
}
function createSixDigitRandomNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

async function initialize(roomID, type) {
    var matches = await getAllMatchData();
    if (type === "create") {
        roomID = createSixDigitRandomNumber();
        await createRoom(roomID);
    }
    else if (type === "join") {
        var flag = false;
        matches.forEach((element) => {
            if (element.room_id === roomID) {
                flag = true;
            }
        });
        if (flag === false) {
            alert("Room not found");
            return;
        }
    }
    try {
        gameSocket = new WebSocket(
            "ws://" + "localhost:8000" + "/ws/game/" + roomID + "/" + user_profile.username + "/"
        );
        gameSocket.onclose = function (e) {
            console.error("Game socket closed unexpectedly");
        };
        gameSocket.onmessage = function (e) {
            let gameData = null;
            const data = JSON.parse(e.data);
            console.log("Serverdan gelen mesaj:", data);
            const contentElement = document.getElementById("content");
            if (data["mode"] === "game_start") {
                console.log("Game start mesajı geldi");
                fetch("/pages/play-with-friends.html", { cache: "no-cache" })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Network response was not ok");
                        }
                        return response.text();
                    })
                    .then((html) => {
                        contentElement.classList.remove("fade-in");
                        contentElement.style.opacity = 0;
                        setTimeout(() => {
                            contentElement.innerHTML = html;
                            document.title = "Game Room: " + roomID;
                            contentElement.classList.add("fade-in");
                            contentElement.style.opacity = 1;
                        }, 100);
                    })
                    .catch((error) =>
                        console.error(
                            "There has been a problem with your fetch operation:",
                            error
                        )
                    );
            }
            else if (data["mode"] === "game") {
                gameData = data["message"];
                let canvas = document.getElementById("canvas");
                let ctx = canvas.getContext("2d");

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "#FFF";
                ctx.font = "15px Arial";

                // Draw middle line
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, 0);
                ctx.lineTo(canvas.width / 2, canvas.height);
                ctx.strokeStyle = "#FFF";
                ctx.stroke();
                ctx.closePath();

                // Draw ball
                ctx.beginPath();
                ctx.arc(gameData.BallX, gameData.BallY, gameData.BallRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();

                // Draw left paddle
                ctx.fillRect(0, gameData.leftPlayer, gameData.paddleWidth, gameData.paddleHeight);

                // Draw right paddle
                ctx.fillRect(canvas.width - gameData.paddleWidth, gameData.rightPlayer, gameData.paddleWidth, gameData.paddleHeight);

                // Draw scores
                ctx.fillText("Score: " + gameData.leftPlayerScore, 10, 20);
                ctx.fillText("Score: " + gameData.rightPlayerScore, canvas.width - 70, 20);
            }
            else if (data["mode"] === "end_game") {
                gameData = data["message"];
                if (gameData.gameOver === true) {
                    alert("Game Over");
                    if (gameSocket) {
                        gameSocket.close();
                    }
                    window.location.href = "/home";
                }
            }
            else if (data["mode"] === "waiting") {
                alert("Waiting for other player to join");
            }
        }
        return roomID;
    } catch (error) {
        console.error("Oda oluşturma işlemi başarısız:", error);
    }
}

function surrenderButtonClicked() {
    if (gameSocket) {
        gameSocket.send(JSON.stringify({ mode: "surrender", message: user_profile.username }));
    }
}

function startButtonClciked() {
    let startButton = document.getElementById("start-button");

    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            startButton.innerHTML = 3 - i;
            if (i === 2) {
                gameSocket.send(JSON.stringify({ mode: "start-button", message: "" }));
            }
        }, i * 1000);
    }
}

document.addEventListener("keydown" , function(event){
    console.log("Keydown event:", event);
    console.log(gameSocket);
    if (gameSocket) {
        if (event.key === "w") {
            gameSocket.send(JSON.stringify({mode: "move", message: "w"}));
        }
        else if (event.key === "s") {
            gameSocket.send(JSON.stringify({mode: "move", message: "s"}));
        }
        else if (event.key === "ArrowUp") {
            gameSocket.send(JSON.stringify({mode: "move", message: "ArrowUp"}));
        }
        else if (event.key === "ArrowDown") {
            gameSocket.send(JSON.stringify({mode: "move", message: "ArrowDown"}));
        }
    }
});