let winCount = 0;
let lossCount = 0;
let drawCount = 0;

async function getUserMatches() {
    return fetch(`http://127.0.0.1:8000/match/find/${user_profile.username}`, {
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
            return null;
        });
}

async function addStatisticsData() {
    const userMatches = await getUserMatches();
    let textContainers = document.querySelectorAll(".text-container");

    winCount = userMatches.filter(match => match.winner && match.winner.username === user_profile.username).length;
    lossCount = userMatches.filter(match => match.winner && match.winner.username !== user_profile.username).length;
    drawCount = userMatches.filter(match => !match.winner).length;

    textContainers.forEach((container) => {
        const h6Element = container.querySelector("h6[data-lang]");
        const dataLang = h6Element ? h6Element.getAttribute("data-lang") : null;

        if (dataLang) {
            let content = '';
            if (dataLang === "statistics-wins") {
                content = winCount;
            } else if (dataLang === "statistics-losses") {
                content = lossCount;
            } else if (dataLang === "statistics-draws") {
                content = drawCount;
            } else if (dataLang === "statistics-total-number-of-games-played") {
                content = userMatches.length;
            } else if (dataLang === "statistics-longest-winning-streak") {
                let streak = 0;
                let currentStreak = 0;
                userMatches.forEach(match => {
                    if (match.winner === user_profile.username) {
                        currentStreak++;
                        streak = Math.max(streak, currentStreak);
                    } else {
                        currentStreak = 0;
                    }
                });
                content = streak;
            } else if (dataLang === "statistics-win-rate") {
                const totalMatches = winCount + lossCount + drawCount;
                const winRate = totalMatches > 0 ? ((winCount / totalMatches) * 100).toFixed(2) : "0.00";
                content = `${winRate}%`;
            } else if (dataLang === "statistics-player-played-minutes-in-total") {
                //maç süresi eklenecek
            } else if (dataLang === "statistics-total-number-of-tournament-played") {
                //turnuva kazanma oranı eklenecek
            } else if (dataLang === "statistics-win-rate-of-tournament") {
                //turnuva kazanma oranı eklenecek
            }

            const cardNumberElement = container.querySelector("span.card-number");
            if (cardNumberElement) {
                cardNumberElement.innerHTML = content;
            }
        }
    });
}
