const GOON_IMAGES = [
  'images/knight.png',
  'images/bigpipe.png',
  'images/birdseye.png',
];

const POLL_INTERVAL_MS = 180_000; // 3 minutes

// Mode: URL param > localStorage > default pve
// API uses 'pve' or 'regular' (PvP). 'pvp' is a legacy alias.
const _resolveMode = raw => {
  if (raw === 'pve') return 'pve';
  if (raw === 'regular' || raw === 'pvp') return 'regular';
  return 'pve';
};
const _urlMode = new URLSearchParams(window.location.search).get('mode');
let currentMode = _urlMode
  ? _resolveMode(_urlMode)
  : _resolveMode(localStorage.getItem('goonMode'));

function getQuery() {
  return `{
    goonReports(gameMode: ${currentMode}, lang: en, limit: 1) {
      timestamp
      map {
        name
      }
    }
  }`;
}

function setMode(mode) {
  currentMode = mode;
  localStorage.setItem('goonMode', mode);
  document.querySelectorAll('.mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode));
  fetchGoonReport();
}

// Guaranteed no consecutive repeat
let lastImage = null;
function pickRandomImage() {
  const available = GOON_IMAGES.filter(img => img !== lastImage);
  lastImage = available[Math.floor(Math.random() * available.length)];
  return lastImage;
}

// API returns timestamp in milliseconds
function timeAgo(timestamp) {
  const diffMs = Date.now() - parseInt(timestamp, 10);
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
}

function stalenessClass(timestamp) {
  const diffMin = (Date.now() - parseInt(timestamp, 10)) / 60_000;
  if (diffMin < 30) return 'fresh';
  if (diffMin < 120) return 'warning';
  return 'stale';
}

async function fetchGoonReport() {
  try {
    const res = await fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: getQuery() }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const reports = json?.data?.goonReports;

    if (!reports || reports.length === 0) {
      showError('No reports found');
      return;
    }

    const { timestamp, map } = reports[0];
    updateDisplay(map.name, timestamp);
  } catch (err) {
    console.error('Fetch failed:', err);
    showError('Failed to fetch');
  }
}

function updateDisplay(mapName, timestamp) {
  const imgEl = document.getElementById('goon-image');
  const mapEl = document.getElementById('map-name');
  const seenEl = document.getElementById('last-seen');

  imgEl.src = pickRandomImage();
  mapEl.textContent = mapName;

  const ago = timeAgo(timestamp);
  const cls = stalenessClass(timestamp);

  seenEl.textContent = `Last reported ${ago}`;
  seenEl.className = cls;
}

function showError(msg) {
  const mapEl = document.getElementById('map-name');
  const seenEl = document.getElementById('last-seen');
  mapEl.textContent = 'Unknown';
  seenEl.textContent = msg;
  seenEl.className = 'stale';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === currentMode));
});
fetchGoonReport();
setInterval(fetchGoonReport, POLL_INTERVAL_MS);
