function fixedPlayedTime(playedTime) {
    if (playedTime > 60) {
        const minutes = Math.floor(playedTime / 60);
        const seconds = playedTime % 60;
    }
    const minutes = 0
    const seconds = playedTime
    return { minutes, seconds };
}

function infoPanel(winner, date, playedTime) {
    const time = timeSince(date);
    const fixedDate = new Date(date);
    const gameTime = fixedPlayedTime(playedTime);
    return `
           <div class="info-panel-item">
               <p>Maç Tarihi</p>
               <p>${fixedDate.getDate()}.${fixedDate.getMonth()}.${fixedDate.getFullYear()}</p>
           </div>
           <div class="info-panel-item">
               <p>Maç Saati</p>
               <p>${time.hours}:${time.minutes}</p>
           </div>
           <div class="info-panel-item">
               <p>Maç Süresi</p>
               <p>${gameTime.minutes}:${gameTime.seconds} saniye</p>
           </div>
           <div class="info-panel-item">
               <p>Kazanan</p>
               <p>${winner.username}</p>
           </div>
       `;
}

function getButtonMatch(match) {
    const host = match.host;
    const guest = match.guest.filter(g => g.username !== host.username)[0];
    console.log(match);
    return `
        <div class="players-panel">
            <div class="match-player">
                <img src="${host.profile_picture}" alt="Player 1" class="table-img square-image">
                <p>${host.username}</p>
            </div>
            <div class="match-score-center">
                <h3>${match.host_score} - ${match.guest_score}</h3>
            </div>
            <div class="match-player">
                <img src="${guest.profile_picture}" alt="Player 2" class="table-img square-image">
                <p>${guest.username}</p>
            </div>
        </div>
        <div class="graph-panel">
            <div class="bar" style="height: ${match.host_score * 20}px; background-color: rgba(255, 99, 132, 0.8);">
                <span>${match.host_score}</span>
            </div>
            <div class="bar" style="height: ${match.guest_score * 20}px; background-color: rgba(54, 162, 235, 0.8);">
                <span>${match.guest_score}</span>
            </div>
        </div>
        <div class="info-panel">
            <p>${infoPanel(match.winner, match.created_date, match.played_time)}</p>
        </div>
    `;
}

async function selectItem(element) {
    const usetMatches = await getUserMatches();
    const matchId = element.querySelector(".match-title").innerText.split(" - ")[1];
    let matchContainer = document.querySelector(".match-card");

    matchContainer.innerHTML = getButtonMatch(usetMatches.find(match => match.room_id === matchId));

}


function timeSince(dateString) {
    const pastDate = new Date(dateString);
    const now = new Date();

    const diffInMilliseconds = now - pastDate;

    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

    const days = Math.floor(diffInSeconds / (3600 * 24));
    const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);

    return { days, hours, minutes};
}

function getButtonHistory(roomID, status, created_at) {
    const parsedStatus = JSON.parse(status);
    const date = timeSince(created_at);
    return `
        <div class="cool-btn match-btn" onclick="selectItem(this)">
            <div class="match-title">Match - ${roomID}</div>
            <div class="match-time">${date.days} gün ${date.hours} saat önce</div>
            <span class="match-score">${parsedStatus.host} - ${parsedStatus.guest}</span>
        </div>
    `;
}

async function matchHistoryLeftPanel() {
    let userMatches = await getUserMatches();
    let historyContainer = document.querySelector(".match-tournament-histories");

    historyContainer.innerHTML = '';

    userMatches.forEach(match => {
        let matchButton = getButtonHistory(match.room_id, JSON.stringify({ host: match.host_score, guest: match.guest_score }), match.created_date);
        historyContainer.innerHTML += matchButton;
    });
}
