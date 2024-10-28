async function joinButton() {
    var roomInput = document.getElementById("room-number");
    var roomID = roomInput.value;
    try {

        return roomID;
    }
    catch (error) {
        console.error("There was a problem with your fetch operation:", error);
    }
}