user_profile = {};
token = localStorage.getItem("token");
roomID = null;
document.addEventListener("DOMContentLoaded", () => {
    console.log("SPA loaded");
    const indicator = document.querySelector(".nav-indicator");
    const contentElement = document.getElementById("content");

    function handleIndicator(el) {
        if (el.classList.contains("nav-item")) {
            const items = document.querySelectorAll(".nav-item"); // Yeni nav-item'ları da dahil et
            items.forEach((item) => {
                item.classList.remove("is-active");
                item.style.color = ""; // Renk sıfırlama
            });

            indicator.style.width = `${el.offsetWidth}px`;
            indicator.style.left = `${el.offsetLeft}px`;
            indicator.style.backgroundColor = el.getAttribute("active-color");

            el.classList.add("is-active");
            el.style.color = el.getAttribute("active-color");
        }
    }

    async function loadPageBasedOnPath(pathname) {
        pathname = rtrim(pathname, "/");
        var pathname_username = null;
        var finduser = false;

        if (pathname.startsWith("/user/") && pathname.length > 6) {
            pathname_username = pathname.substring(6);
            finduser = await findUserAndGetData(pathname_username, token);
            console.log(
                "User found status: ",
                finduser,
                " | username: ",
                pathname_username
            );
            if (finduser) {
                pathname = "/user/";
            } else {
                pathname = "/usernotfound/";
            }
        }
        if (pathname.substring(0, 6) === "/game-") {
            var room_id = pathname.substring(6);
            let matchs = await getAllMatchData();
            matchs.forEach((match) => {
                if (match.room_id === room_id) {
                    console.log("Match found: ", match);
                    fetch("/pages/game-room.html", { cache: "no-cache" })
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
                                document.title = "Game Room: " + room_id + " - " + match.status;
                                window.history.pushState(null, "", pathname);

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
            });
        }
        else if (routes[pathname]) {
            if (gameSocket)
                gameSocket.close();
            fetch(routes[pathname].contentPath, { cache: "no-cache" })
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
                        document.title = routes[pathname].title;
                        if (pathname_username && finduser) {
                            window.history.pushState(null, "", pathname + pathname_username);
                        } else {
                            window.history.pushState(null, "", pathname);
                        }

                        if (pathname === "/profile") {
                            document.getElementById("my-picture").src =
                                user_profile.profile_picture;
                            document.getElementById("my-username").textContent =
                                user_profile.username;
                            document.getElementById("my-firstandlastname").textContent =
                                user_profile.first_name + " " + user_profile.last_name;
                            document.getElementById("my-firstname").textContent =
                                user_profile.first_name;
                            document.getElementById("my-lastname").textContent =
                                user_profile.last_name;
                        } else if (pathname === "/friends") {
                            friend();
                        } else if (pathname === "/user/") {
                            showFoundUserData(finduser);
                        } else if (pathname === "/statistics") {
                            addStatisticsData()
                        } else if (pathname === "/matchs-history") {
                            matchHistoryLeftPanel();
                        } else if (pathname === "/leaderboard/") {
                            loadLeaderboard();
                        }
                        document.getElementById("panel-username").innerHTML =
                            user_profile.username;
                        document.getElementById("panel-pic").src =
                            user_profile.profile_picture;

                        setActiveTabFromURL();
                        loadLanguage();
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
        } else {
            // Eğer route bulunmuyorsa 404 sayfasını yükle
            fetch("/pages/404.html")
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
                        document.title = "404 - Page Not Found";
                        window.history.pushState(null, "", pathname);

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
    }

    function setActiveTabFromURL() {
        const path = window.location.pathname;
        const items = document.querySelectorAll(".nav-item, [data-url-path]");
        let matchingItem = null;

        items.forEach((item) => {
            const targetPath =
                item.getAttribute("data-target-path") ||
                item.getAttribute("data-url-path");
            if (targetPath === path) {
                matchingItem = item;
            }
        });

        if (matchingItem) {
            handleIndicator(matchingItem);
        }
    }

    // MutationObserver ile dinamik olarak eklenen elemanları izleyin
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                const items = document.querySelectorAll(".nav-item, [data-url-path]");
                items.forEach((item) => {
                    item.removeEventListener("click", handleItemClick);
                    item.addEventListener("click", handleItemClick);
                    if (item.classList.contains("is-active")) {
                        handleIndicator(item);
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });


    async function handleItemClick(e) {
        e.preventDefault();
        const targetPath =
            this.getAttribute("data-target-path") ||
            this.getAttribute("data-url-path");
        if (targetPath === "/create-game") {
            roomID = await initialize("", "create");
            await loadPageBasedOnPath("/game-" + roomID);
            handleIndicator(this);
        }
        else if (targetPath === "/join-room") {
            console.log("Join button clicked");
            roomID = await joinButton();
            await loadPageBasedOnPath("/game-" + roomID);
            await initialize(roomID, "join");
            handleIndicator(this);
        }
       else if (targetPath) {
            loadPageBasedOnPath(targetPath);
            handleIndicator(this);
        }
    }

    setActiveTabFromURL();
    loadPageBasedOnPath(window.location.pathname);
    window.onpopstate = function (event) {
        if (event.state) {
            contentElement.classList.remove("show");

            setTimeout(() => {
                contentElement.innerHTML = event.state.html;
                document.title = event.state.pageTitle;

                contentElement.classList.add("show");
            }, 150);
        } else {
            loadPageBasedOnPath(window.location.pathname);
        }
    };
});
