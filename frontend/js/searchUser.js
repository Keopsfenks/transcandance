document.addEventListener("DOMContentLoaded", function () {
document.getElementById("findFriendSearch").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const inputValue = this.value.trim();
        if (inputValue) {
            const newPath = `/user/${inputValue}`;
            window.location.href = newPath;
        }
    }
});
});

function showFoundUserData(finduser) {
    console.log(finduser);
    document.getElementById("user-profilepicture").src = finduser.profile_picture;
    const userInfo = {
        "username": finduser.username,
        "username2": finduser.username,
        "firstandlastname": finduser.first_name + " " + finduser.last_name,
        "firstname": finduser.first_name,
        "lastname": finduser.last_name,
        "level": finduser.profile.level,
        "grade": finduser.profile.grade,
        "campus": finduser.profile.campus
    };
    Object.entries(userInfo).forEach(([key, value]) => {
        const element = document.getElementById(`user-${key}`);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Element with id "user-${key}" not found.`);
        }
    });
}

async function getAllMatchData() {
    return fetch(`http://127.0.0.1:8000/match`, {
        method: "GET",
        credentials: "include",
        headers: {
            Authorization: `Token ${auth_token}`,
            "Content-Type": "application/json",
        },
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                console.log("Verilere erişilemiyor!");
                return null;
            }
        })
        .then(data => {
            if (data) {
                return data;
            } else {
                return null;
            }
        })
        .catch(error => {
            console.log("Kullanıcı bulunamadı!", error);
            return null;
        });
}

async function findUserAndGetData(username, auth_token) {
    return fetch(`http://127.0.0.1:8000/users`, {
        method: "GET",
        credentials: "include",
        headers: {
            Authorization: `Token ${auth_token}`,
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            console.log("Verilere erişilemiyor!");
            return null;
        }
    })
    .then(data => {
        if (data) {
            const userFound = data.find(user => user.username === username);
            return userFound;
        } else {
            return null;
        }
    })
    .catch(error => {
        console.log("Kullanıcı bulunamadı!", error);
        return null;
    });
}