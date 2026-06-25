const TEAMS = {
  yellow: { label: 'Yellow Team', members: [] },
  blue:   { label: 'Blue Team',   members: [] },
  green:  { label: 'Green Team',  members: [] },
  red:    { label: 'Red Team',    members: [] },
};

function fmt(n) { return '$' + n.toLocaleString('en-US'); }

function rankDisplay(i) {
  if (i === 0) return '🥇';
  if (i === 1) return '🥈';
  if (i === 2) return '🥉';
  return '#' + (i + 1);
}
function rankClass(i) {
  if (i === 0) return 'rank-1';
  if (i === 1) return 'rank-2';
  if (i === 2) return 'rank-3';
  return 'rank-other';
}

PLAYERS.forEach(p => { if (TEAMS[p.team]) TEAMS[p.team].members.push(p); });
Object.values(TEAMS).forEach(t => t.members.sort((a, b) => b.money - a.money));
const sorted = [...PLAYERS].sort((a, b) => b.money - a.money);

// Team totals
const teamOrder = ['yellow', 'blue', 'green', 'red'];
const teamTotals = {};
teamOrder.forEach(key => {
  teamTotals[key] = TEAMS[key].members.reduce((s, p) => s + p.money, 0);
});
const sortedTeams = [...teamOrder].sort((a, b) => teamTotals[b] - teamTotals[a]);

// Wealth counter
const totalWealth = sorted.reduce((s, p) => s + p.money, 0);
if (totalWealth > 0) {
  const el = document.getElementById('total-wealth');
  let start = null;
  const animate = ts => {
    if (!start) start = ts;
    const prog = Math.min((ts - start) / 1600, 1);
    el.textContent = fmt(Math.floor(prog * totalWealth));
    if (prog < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

// ── LEADERBOARD 1: Players ──
function buildPlayerBoard(containerId, players) {
  const el = document.getElementById(containerId);
  el.innerHTML = `
    <div class="lb-card-header">
      <h3>PLAYER LEADERBOARD</h3>
      <span class="lb-sub">${players.length > 0 ? players.length + ' PLAYERS' : 'AWAITING DATA'}</span>
    </div>
  `;
  if (players.length === 0) {
    for (let i = 0; i < 8; i++) {
      const row = document.createElement('div');
      row.className = 'lb-row';
      row.innerHTML = `
        <span class="rank rank-other">#${i + 1}</span>
        <div class="row-avatar-slot"></div>
        <div style="flex:1"><div class="row-name-slot"></div></div>
        <div class="row-money-slot"></div>
      `;
      el.appendChild(row);
    }
  } else {
    players.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'lb-row';
      row.innerHTML = `
        <span class="rank ${rankClass(i)}">${rankDisplay(i)}</span>
        <div style="flex:1">
          <div class="row-name">${p.name}</div>
          <span class="team-badge team-${p.team}">${p.team.toUpperCase()}</span>
        </div>
        <span class="row-money">${fmt(p.money)}</span>
      `;
      el.appendChild(row);
    });
  }
}

// ── LEADERBOARD 2: Teams ──
function buildTeamBoard(containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = `
    <div class="lb-card-header">
      <h3>TEAM LEADERBOARD</h3>
      <span class="lb-sub">4 TEAMS</span>
    </div>
  `;
  sortedTeams.forEach((key, i) => {
    const total = teamTotals[key];
    const team = TEAMS[key];
    const row = document.createElement('div');
    row.className = 'lb-row';
    row.innerHTML = `
      <span class="rank ${rankClass(i)}">${rankDisplay(i)}</span>
      <div style="flex:1">
        <div class="row-name">${team.label}</div>
        <span class="team-badge team-${key}">${key.toUpperCase()} · ${team.members.length} members</span>
      </div>
      <span class="row-money">${total > 0 ? fmt(total) : '—'}</span>
    `;
    el.appendChild(row);
  });
}

buildPlayerBoard('player-board-a', sorted);
buildTeamBoard('player-board-b');

// ── Team detail cards (bottom section) ──
const teamsGrid = document.getElementById('teams-grid');

teamOrder.forEach(key => {
  const team = TEAMS[key];
  const total = teamTotals[key];
  const wrapper = document.createElement('div');
  wrapper.className = `tc-${key}`;

  const membersHTML = team.members.length > 0
    ? team.members.map(m => `
        <div class="team-member">
          <span class="team-member-name">${m.name}</span>
          <span class="team-member-money">${fmt(m.money)}</span>
        </div>`).join('')
    : [1,2,3].map(() => `
        <div class="team-member-placeholder">
          <div class="ph-name"></div>
          <div class="ph-money"></div>
        </div>`).join('') + `<div class="empty-label">NO MEMBERS YET</div>`;

  wrapper.innerHTML = `
    <div class="team-card">
      <div class="team-card-header">
        <div class="team-name">${team.label.toUpperCase()}</div>
        <div class="team-line"></div>
        ${total > 0 ? `<div class="team-total">${fmt(total)}</div>` : `<div class="team-total-slot"></div>`}
        <div class="team-total-label">TEAM WEALTH</div>
      </div>
      <div class="team-card-members">${membersHTML}</div>
    </div>
  `;
  teamsGrid.appendChild(wrapper);
});

// ── Search ──
const searchInput  = document.getElementById('search-input');
const searchResult = document.getElementById('search-result');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { searchResult.style.display = 'none'; return; }

  if (sorted.length === 0) {
    searchResult.style.display = 'block';
    searchResult.innerHTML = `<div class="no-result">No players have been added yet.</div>`;
    return;
  }

  const match = sorted.find(p => p.name.toLowerCase().includes(q));
  searchResult.style.display = 'block';
  if (match) {
    const rank = sorted.indexOf(match) + 1;
    searchResult.innerHTML = `
      <div class="result-card">
        <div class="player-avatar">👤</div>
        <div class="player-info">
          <h3>${match.name}</h3>
          <span class="team-badge team-${match.team}">${match.team.toUpperCase()}</span>
        </div>
        <div class="player-money">
          <div class="amount">${fmt(match.money)}</div>
          <div class="money-label">RANK #${rank} OF ${sorted.length}</div>
        </div>
      </div>
    `;
  } else {
    searchResult.innerHTML = `<div class="no-result">No player found matching "${searchInput.value}"</div>`;
  }
});
