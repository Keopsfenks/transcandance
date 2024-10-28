// TABBAR JS
document.addEventListener("DOMContentLoaded", () => {
    const indicator = document.querySelector(".nav-indicator");
    const items = document.querySelectorAll(".nav-item");
    const contentElement = document.getElementById("content");

    function handleIndicator(el) {
        // Sadece nav-item'lar için göstergeyi güncelle
        if (el.classList.contains("nav-item")) {
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


    function loadPageBasedOnPath(pathname) {

        if (!pathname) {
            console.error("Invalid pathname:", pathname);
            return;  // Prevent further execution if pathname is invalid
        }
    
        console.log("Attempting to load path:", pathname);  // Debugging log
        
        // Handle dynamic routes like /user/123
        if (pathname.startsWith("/user/")) {
            pathname = "/user/";
        }
    
        if (routes[pathname]) {
            console.log("Found route, loading:", routes[pathname]);
            fetch(routes[pathname].contentPath)
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
                        window.history.pushState(null, "", pathname);
                        setActiveTabFromURL();
                        contentElement.classList.add("fade-in");
                        contentElement.style.opacity = 1;
                    }, 100);
                })
                .catch((error) => console.error("Fetch operation error:", error));
        } else {
            console.error("404: Page not found for", pathname);
        }
    }
    
    
    
    
    

    function setActiveTabFromURL() {
        const path = window.location.pathname || "/home"; // Fallback to a default path
        console.log("Setting active tab based on URL path:", path);
    
        let matchingItem = null;
    
        items.forEach((item) => {
            const targetPath = item.getAttribute("data-target-path");
            if (path.startsWith(targetPath)) {
                matchingItem = item;
            }
        });
    
        if (matchingItem) {
            handleIndicator(matchingItem);
        }
    }
    

    setActiveTabFromURL();

    items.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault(); // Sayfanın yenilenmesini önler
            const targetPath = item.getAttribute("data-target-path");
            loadPageBasedOnPath(targetPath); // İçeriği yükler ve tabbar'ı günceller

            handleIndicator(item); // Butona tıklanıldığında göstergede değişiklik yap
        });

        if (item.classList.contains("is-active")) {
            handleIndicator(item);
        }
    });

    window.onpopstate = function () {
        loadPageBasedOnPath(window.location.pathname); // URL değiştiğinde içerik ve tabbar güncellenir
    };
});

//Chatbox JS
document.addEventListener("DOMContentLoaded", function () {});