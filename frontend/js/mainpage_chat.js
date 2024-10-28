document.addEventListener("DOMContentLoaded", () => {
  let chatSocket = null; // WebSocket bağlantısı
  let currentChatId = "general"; // Hangi sohbetin aktif olduğunu takip etmek için

  function selectItem2(chatItem) {
    const allChatItems = document.querySelectorAll('.chat-changing');
    allChatItems.forEach(item => {
        item.classList.remove('inactive');
    });
    console.log(chatItem.innerText);
    chatItem.classList.add('inactive');
  }

  /* CHAT DROPDOWN */

  const dropdownTrigger = document.querySelector(".match-general-chat-btn");
  const dropdownMenu = document.querySelector(".match-dropdown-menu");

  dropdownTrigger.addEventListener("click", function () {
    // Dropdown menüsünü açıp kapama işlemi
    dropdownMenu.style.left = `${-17.5}vw`;
    dropdownMenu.style.transform = "translate(0px, 0px)";
    dropdownMenu.classList.toggle("show");
  });

  // Varsayılan olarak "General Chat" kanalına bağlan
  loadChatRoom({ username: "general", room_id: "general" }, true);

  // Arkadaş listesini API'den çekiyoruz
  fetch("http://127.0.0.1:8000/friends", {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const user_data = data; // Backend'den gelen kullanıcı verileri
      const chatList = document.getElementById("chat-list"); // Dropdown'daki chat listesi

      const generalChatItem = document.createElement("li");
      generalChatItem.className =
        "match-dropdown-item d-flex align-items-center chat-changing";
      generalChatItem.style = "justify-content: flex-start;";
      generalChatItem.onclick = () =>
        loadChatRoom({ username: "general", room_id: "general" }, true);
        selectItem2(generalChatItem);
      generalChatItem.innerHTML = `
                  <img src="/img/world.png" class="chat-img shadow me-2" alt="General Chat">
                  <a data-lang="general-chat-pop">General Chat</a>
                  `;
      chatList.appendChild(generalChatItem);

      user_data.forEach((user) => {
        const chatItem = document.createElement("li");
        chatItem.className = "match-dropdown-item d-flex align-items-center chat-changing";
        chatItem.onclick = () => {loadChatRoom(user); selectItem2(chatItem);};
        const profileImage =
          user.profile_picture !== "null" ? user.profile_picture : "/img/defaultpp.jpg";

        chatItem.innerHTML = `
          <img src="${profileImage}" class="chat-img shadow me-2" alt="Profile Image">
          <a>${user.username}</a>
        `;
        /* <button class="cool-btn d-flex m-3" data-url-path="/play-with-friends">Invite</button> INVITE BUTTON */
        // const inviteButton = chatItem.querySelector("button");
        // inviteButton.addEventListener("click", (event) => {
        //   event.stopPropagation();
        //   const urlPath = inviteButton.getAttribute("data-url-path");
        //   console.log(`Invite button clicked for ${user.username}. URL: ${urlPath}`);
        // });
      
        chatList.appendChild(chatItem);
      });
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });

  function loadChatRoom(friend, isGeneral = false) {
    const friendUsername = friend.username;

    const chatRoomName = isGeneral
      ? "general"
      : `room_${[user_profile.username, friendUsername].sort().join("_")}`;

    if (chatSocket) {
      chatSocket.close();
    }

    // WebSocket bağlantısını başlat
    chatSocket = new WebSocket(
      "ws://" + "localhost:8000" + "/ws/chat/" + chatRoomName + "/"
    );
    chatSocket.onopen = function () {
      currentChatId = chatRoomName;
      console.log(`Connected to chat room: ${chatRoomName}`);
      document.getElementById("chat-log").innerHTML = "";

      if (isGeneral) {
        document.getElementsByClassName("dropdown-chat-name")[0].innerText =
          "General Chat";
        document.getElementsByClassName("chat-img-general")[0].src =
          "/img/world.png";
      } else {
        document.getElementsByClassName("dropdown-chat-name")[0].innerText =
          friend.username;

        const profileImage =
          friend.profile_picture !== "null"
            ? friend.profile_picture
            : "/img/ogenc.png";
        document.getElementsByClassName("chat-img-general")[0].src =
          profileImage;

      }
    };

    chatSocket.onclose = function () {
      console.error(`Chat socket closed for chat room: ${chatRoomName}`);
    };

    chatSocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      const message = data["message"];
      const username = data["username"];
      const messageElement = document.createElement("div");
      messageElement.innerHTML = `<strong>${username}</strong>: ${message}`;
      document.getElementById("chat-log").appendChild(messageElement);
    };

    const sendButton = document.getElementById("send-button");
    sendButton.onclick = function () {
      const messageInput = document.getElementById("message-input");
      const message = messageInput.value;

      if (chatSocket) {
        chatSocket.send(
          JSON.stringify({
            username: user_profile.username,
            message: message,
          })
        );
        messageInput.value = "";
      }
    };

    currentChatId = chatRoomName;
  }
});
