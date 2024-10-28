function toggleEdit(editMode) {
  const elements = document.querySelectorAll(
    "#my-gamename",
  );
  const button = document.querySelector(".cool-btn");

  if (editMode) {
    elements.forEach((element) => {
      const input = document.createElement("input");
      input.value = element.textContent;
      input.className = "form-control";
      input.setAttribute("data-id", element.id);
      input.id = element.id;
      element.replaceWith(input);
    });
    button.textContent = "Save";
    button.onclick = () => toggleEdit(false);
  } else {
    elements.forEach((input) => {
      const td = document.createElement("td");
      td.textContent = input.value;
      td.id = input.getAttribute("data-id");
      input.replaceWith(td);
    });
    button.textContent = "Edit";
    button.onclick = () => toggleEdit(true);
  }
}

function logout() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("No token found. Redirecting to login page.");
    window.location.href = "/login";
    return;
  }

  fetch("http://127.0.0.1:8000/api/logout/", {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        throw new Error("Logout request failed.");
      }
    })
    .catch((error) => {
      console.error("Error during logout process:", error);
      window.location.href = "/login";
    });
}

function addFriend() {
  const token = localStorage.getItem("token");
  var friendUsername = document.getElementById("friendUsername").value;

  if (!token) {
    alert("You must be logged in to add a friend.");
    return;
  }

  if (!friendUsername) {
    alert("Please enter a username!");
    return;
  }

  fetch(`http://127.0.0.1:8000/add-friend/${friendUsername}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        alert("Friend request sent!");
      }
      return response.json();
    })
    .then((data) => {
      if (data.message) {
        alert(data.message);
      } else if (data.error) {
        alert("Error adding friend: " + (data.error || "Unknown error"));
      } else {
        alert("Unexpected response from server.");
      }
    })
    .catch((error) => {
      alert("An error occurred: " + error.message);
    });
}
