
function friend() {
    auth_token = localStorage.getItem("token");
  
    loadFriends();
    document.getElementById("friend-button").addEventListener("click", () => {
      loadFriends();
      console.log("Friend button clicked.");
    });
  
    document
      .getElementById("received-requests-button")
      .addEventListener("click", () => {
        loadReceivedRequests();
        console.log("Received requests button clicked.");
      });
  
    document
      .getElementById("sent-requests-button")
      .addEventListener("click", () => {
        loadSentRequests();
        console.log("Sent requests button clicked.");
      });
  }
  
  function removeFriend(username) {
    fetch(`http://127.0.0.1:8000/remove-friend/${username}`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Token ${auth_token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          alert(`${username} has been removed from friends.`);
          friend();
        } else {
          throw new Error(`Failed to remove ${username} from friends.`);
        }
      })
      .catch((error) => {
        alert(error.message);
      });
  }
  
  function loadFriends() {
    const contentDisplay = document.getElementById("content-display");
    contentDisplay.classList.remove("fade-in-friends");
    contentDisplay.style.opacity = 0;
  
    fetch("http://127.0.0.1:8000/friends", {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Token ${auth_token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Friends list could not be fetched.");
        }
      })
      .then((data) => {
        renderFriends(data, contentDisplay);
  
        setTimeout(() => {
          contentDisplay.classList.add("fade-in-friends");
          contentDisplay.style.opacity = 1;
        }, 10);
      })
      .catch((error) => {
        contentDisplay.innerHTML = `<p>Error: ${error.message}</p>`;
        contentDisplay.classList.add("fade-in-friends");
        contentDisplay.style.opacity = 1;
      });
  }
  
  function loadReceivedRequests() {
    const contentDisplay = document.getElementById("content-display");
    contentDisplay.classList.remove("fade-in-friends");
    contentDisplay.style.opacity = 0;
  
    fetch("http://127.0.0.1:8000/received-requests", {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Token ${auth_token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Received requests could not be fetched.");
        }
      })
      .then((data) => {
        renderRequests(data, contentDisplay, "Received");
        console.log(data);
        // Trigger the fade-in effect after content is updated
        setTimeout(() => {
          contentDisplay.classList.add("fade-in-friends");
          contentDisplay.style.opacity = 1;
        }, 10);
      })
      .catch((error) => {
        contentDisplay.innerHTML = `<p>Error: ${error.message}</p>`;
          contentDisplay.classList.add("fade-in-friends");
          contentDisplay.style.opacity = 1;
      });
  }
  
  function loadSentRequests() {
    const contentDisplay = document.getElementById("content-display");
    contentDisplay.classList.remove("fade-in-friends");
    contentDisplay.style.opacity = 0;
  
    fetch("http://127.0.0.1:8000/sent-requests", {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Token ${auth_token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Sent requests could not be fetched.");
        }
      })
      .then((data) => {
        console.log(data);
        renderRequests(data, contentDisplay, "Sent");
  
        // Trigger the fade-in effect after content is updated
        setTimeout(() => {
          contentDisplay.classList.add("fade-in-friends");
          contentDisplay.style.opacity = 1;
        }, 10);
      })
      .catch((error) => {
        contentDisplay.innerHTML = `<p>Error: ${error.message}</p>`;
          contentDisplay.classList.add("fade-in-friends");
          contentDisplay.style.opacity = 1;
      });
  }
  
  function renderRequests(data, container, requestType) {
    container.innerHTML = "";
    if (data.length === 0) {
      container.innerHTML = `<p>No ${requestType.toLowerCase()} requests found.</p>`;
    } else {
      let table = document.createElement("table");
      let thead = document.createElement("thead");
      let tbody = document.createElement("tbody");
  
      let headers = ["Profile", "Username", "First Name", "Last Name"];
      let headerRow = document.createElement("tr");
      headers.forEach((header) => {
        let th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
  
      data.forEach((request) => {
        let row = document.createElement("tr");
  
        let profileImageCell = document.createElement("td");
        if (request.profile_picture) {
          let img = document.createElement("img");
          img.src = request.profile_picture;
          img.alt = `${request.username}'s profile image`;
          img.classList.add("table-img");
          profileImageCell.appendChild(img);
        } else {
          profileImageCell.textContent = "No Image";
        }
        row.appendChild(profileImageCell);
  
        let usernameCell = document.createElement("td");
        usernameCell.textContent = request.username;
        row.appendChild(usernameCell);
  
        let firstNameCell = document.createElement("td");
        firstNameCell.textContent = request.first_name;
        row.appendChild(firstNameCell);
  
        let lastNameCell = document.createElement("td");
        lastNameCell.textContent = request.last_name;
        row.appendChild(lastNameCell);
  
        let actionCell = document.createElement("td");
  
        actionCell.classList.add("row");
        if (requestType === "Received") {
          let acceptButton = createCoolBtn("Accept");
          acceptButton.classList.add("accept-button");
          acceptButton.classList.add("bg-success");
          
          acceptButton.addEventListener("click", function () {
            acceptRequest(request.username);
          });
          
          let rejectButton = createCoolBtn("Reject");
          rejectButton.classList.add("reject-button");
          rejectButton.classList.add("bg-danger");
          
          rejectButton.addEventListener("click", function () {
            removeFriend(request.username);
          });
  
          actionCell.appendChild(acceptButton);
          actionCell.appendChild(rejectButton);
        } else {
        }
    
        let infoButton = createCoolBtn("⋮")
        infoButton.classList.add("bg-info");
        infoButton.addEventListener("click", function () {
          openPopUpWithUsername(request.username);
        });
        infoButton.style.maxWidth = "35px";
        actionCell.appendChild(infoButton);
        row.appendChild(actionCell);
        tbody.appendChild(row);
      });
  
      table.appendChild(tbody);
      container.appendChild(table);
    }
  }
  
  function renderFriends(data, container) {
    container.innerHTML = "";
    if (data.length === 0) {
      container.innerHTML = "<p data-lang='noFriends'>No friends found.</p>";
    } else {
      let table = document.createElement("table");
      let thead = document.createElement("thead");
      let tbody = document.createElement("tbody");
  
      let headers = [
        "Profile",
        "Username",
        "First Name",
        "Last Name",
        "",
      ];
      let headerRow = document.createElement("tr");
      headers.forEach((header) => {
        let th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      data.forEach((friend) => {
        let row = document.createElement("tr");
        
        let profileImageCell = document.createElement("td");
        if (friend.profile_picture) {
          let img = document.createElement("img");
          img.src = friend.profile_picture;
          img.alt = `${friend.username}'s profile image`;
          img.classList.add("table-img");
          profileImageCell.appendChild(img);
        } else {
          profileImageCell.textContent = "No Image";
        }
        row.appendChild(profileImageCell);
  
        let usernameCell = document.createElement("td");
        usernameCell.textContent = friend.username;
        row.appendChild(usernameCell);
  
        let firstNameCell = document.createElement("td");
        firstNameCell.textContent = friend.first_name;
        row.appendChild(firstNameCell);
  
        let lastNameCell = document.createElement("td");
        lastNameCell.textContent = friend.last_name;
        row.appendChild(lastNameCell);
  
    
        let actionCell = document.createElement("td");
        actionCell.classList.add("row");
        
        let playButton = createCoolBtn("1v1");
  
        let deleteButton = createCoolBtn("X");
        deleteButton.classList.add("bg-danger");
        deleteButton.style.maxWidth = "50px";
      
        let infoButton = createCoolBtn("⋮")
        infoButton.classList.add("bg-info");
        infoButton.type = "button";
        infoButton.style.maxWidth = "35px";
        infoButton.addEventListener("click", function () {
          openPopUpWithUsername(friend.username);
        });
  
        deleteButton.addEventListener("click", function () {
          if (confirm(`Are you sure you want to remove ${friend.username}?`)) {
            removeFriend(friend.username);
          }
        });
  
        actionCell.appendChild(playButton);
        actionCell.appendChild(deleteButton);
        actionCell.appendChild(infoButton);
        row.appendChild(actionCell);
        tbody.appendChild(row);
      });
  
      table.appendChild(tbody);
      container.appendChild(table);
    }
  }
  
  function acceptRequest(username) {
    fetch(`http://127.0.0.1:8000/add-friend/${username}`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Token ${auth_token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          alert(`You have accepted ${username}'s friend request.`);
          loadReceivedRequests();
        } else {
          throw new Error(`Failed to accept the request from ${username}.`);
        }
      })
      .catch((error) => {
        alert(error.message);
      });
  }
  
  function handleButtonClick(clickedButton) {
    const buttons = document.querySelectorAll('.friends-nav');
    buttons.forEach(button => button.classList.remove('active'));
    clickedButton.classList.add('active');
  }
  
  function createCoolBtn (textContent) {
    let button = document.createElement("button");
    button.textContent = textContent;
    button.classList.add("cool-btn");
    button.classList.add("cool-btn-for-table");
    button.classList.add("col");
    return button;
  }