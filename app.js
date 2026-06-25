// app.js
const playersList = document.getElementById('playersList');
const teamsList = document.getElementById('teamsList');
const searchBar = document.getElementById('searchBar');

let allPlayers = [];
let allTeams = [];

const API_URL = 'https://your-backend-url.com/api/leaderboards'; // Replace with your backend API URL

async function fetchLeaderboards() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    allPlayers = data.players;
    allTeams = data.teams;
    renderLeaderboards();
  } catch (error) {
    console.error('Failed to fetch leaderboards:', error);
  }
}

searchBar.addEventListener('input', () => {
  renderLeaderboards(searchBar.value.trim().toLowerCase());
});

function renderLeaderboards(searchTerm = '') {
  playersList.innerHTML = '';
  teamsList.innerHTML = '';

  const filteredPlayers = allPlayers.filter(p => p.name.toLowerCase().includes(searchTerm));
  const filteredTeams = allTeams.filter(t => t.name.toLowerCase().includes(searchTerm));

  if (filteredPlayers.length === 0) {
    playersList.innerHTML = '<li>No players found.</li>';
  } else {
    filteredPlayers.forEach(({ name, money }) => {
      const li = document.createElement('li');
      li.textContent = name;
      const span = document.createElement('span');
      span.textContent = `$${money.toLocaleString()}`;
      li.appendChild(span);
      playersList.appendChild(li);
    });
  }

  if (filteredTeams.length === 0) {
    teamsList.innerHTML = '<li>No teams found.</li>';
  } else {
    filteredTeams.forEach(({ name, money }) => {
      const li = document.createElement('li');
      li.textContent = name;
      const span = document.createElement('span');
      span.textContent = `$${money.toLocaleString()}`;
      li.appendChild(span);
      teamsList.appendChild(li);
    });
  }
}

// Initial fetch and periodic update every 10 seconds
fetchLeaderboards();
setInterval(fetchLeaderboards, 10000);
