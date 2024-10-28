let loadedScripts = [];
let lastData;
// Sayfa içeriğini fetch ile yükle
function loadPage(pageUrl) {
  fetch(pageUrl)
    .then((response) => response.text())
    .then((html) => {
      if (lastData == pageUrl) {
        return;
      } else {
        removeLoadedScripts();
      }
      document.getElementById("pageBody").innerHTML = html;
      if (pageUrl == "/pages/login/login.html") {
        forLogin();
      } else {
        forLoggedIn(); // Scriptleri yükle
      }

      lastData = pageUrl;
    });
}

// Tüm external scriptleri sırayla yükleyen fonksiyon
function forLoggedIn() {
  scriptsLoaded = true;
  loadExternalScript("https://code.jquery.com/jquery-3.5.1.slim.min.js")
    .then(() =>
      loadExternalScript(
        "https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"
      )
    )
    .then(() =>
      loadExternalScript(
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"
      )
    )
    .then(() => loadExternalScript("./js/SPA.js"))
    .then(() => loadExternalScript("./js/mainpage.js"))
    .then(() => loadExternalScript("./js/mainpage_chat.js"))
    .then(() => loadExternalScript("./js/routes.js"))
    .then(() => loadExternalScript("./js/mylib.js"))
    .then(() => loadExternalScript("./js/profileDetailPopup.js"))
    .then(() => loadExternalScript("./js/searchUser.js"))
    .then(() => loadExternalScript("./js/leaderboard.js"))
    .then(() => loadExternalScript("./js/friends.js"))
    .then(() => loadExternalScript("./js/profile.js"))
    .then(() => loadExternalScript("./js/statistics.js"))
    .then(() => loadExternalScript("./js/matchs-history.js"))
    .then(() => loadExternalScript("./js/base_background.js"))
    .then(() => loadExternalScript("./js/home.js"))
    .then(() => loadExternalScript("./js/game-room.js"))
    .then(() => loadExternalScript("./js/language.js"))
    .then(() => {
      const event = new Event("DOMContentLoaded", {});
      document.dispatchEvent(event);
    })
    .catch((error) => {
      console.error("Bir script yüklenirken hata oluştu:", error);
    });
}

function forLogin() {
  scriptsLoaded = true;
  loadExternalScript("https://code.jquery.com/jquery-3.5.1.slim.min.js")
    .then(() =>
      loadExternalScript(
        "https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"
      )
    )
    .then(() =>
      loadExternalScript(
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"
      )
    )
    .then(() => loadExternalScript("/js/login.js"))
    .then(() => {
      // Tüm scriptler yüklendikten sonra DOMContentLoaded olayını manuel tetikle
      const event = new Event("DOMContentLoaded", {
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    })
    .catch((error) => {
      console.error("Bir script yüklenirken hata oluştu:", error);
    });
}

function loadExternalScript(scriptUrl) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${scriptUrl}?v=${new Date().getTime()}`;
    script.async = true;

    script.onload = () => {
      loadedScripts.push(script);
      resolve();
    };

    script.onerror = () => {
      console.error(`Failed to load ${scriptUrl}`);
      reject(new Error(`Failed to load ${scriptUrl}`));
    };

    document.body.appendChild(script);
  });
}

// Scriptleri kaldıran fonksiyon
function removeLoadedScripts() {
  loadedScripts.forEach((script) => {
    document.body.removeChild(script); // Script etiketini kaldır
  });
  loadedScripts = []; // Diziyi temizle
}

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  let token = localStorage.getItem("token");

  if (urlParams.has("token")) {
    token = urlParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      console.log("Token stored in localStorage:", token);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      console.log("No token found in URL.");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      loadPage("/pages/login/login.html");
      return;
    }
  }

  // If not logged in, redirect to login page
  if (!token) {
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    loadPage("/pages/login/login.html");
    return;
  }

  fetch("http://127.0.0.1:8000/api/home/", {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        loadPage("/pages/login/login.html");
        throw new Error("Failed to check authentication.");
      }
    })
    .then((data) => {
      if (!data.is_authenticated) {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
          loadPage("/pages/login/login.html");
        }
      } else {
        loadPage("/pages/login/logged-in.html");
        user_profile = data["user"];
      }
    })
    .catch((error) => {
      console.error("Error during authentication check:", error);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
        loadPage("/pages/login/login.html");
      }
    });
});
