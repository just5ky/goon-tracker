const GOON_IMAGES = [
  'images/knight.png',
  'images/bigpipe.png',
  'images/birdseye.png',
];

const POLL_INTERVAL_MS = 360_000; // 6 minutes — tarkov.dev caches data for 5 min

// API uses 'pve' or 'regular' (PvP). 'pvp' is a legacy alias.
const _resolveMode = raw => {
  if (raw === 'pve') return 'pve';
  if (raw === 'regular' || raw === 'pvp') return 'regular';
  return 'pve';
};
let currentMode = _resolveMode(localStorage.getItem('goonMode'));

function getQuery() {
  return `{
    goonReports(gameMode: ${currentMode}, lang: en, limit: 10) {
      timestamp
      map {
        name
        raidDuration
        wiki
      }
    }
  }`;
}

function setMode(mode) {
  currentMode = mode;
  localStorage.setItem('goonMode', mode);
  document.querySelectorAll('.mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode));
  loadReports();
}

// Guaranteed no consecutive repeat
let lastImage = null;
function pickRandomImage() {
  const available = GOON_IMAGES.filter(img => img !== lastImage);
  lastImage = available[Math.floor(Math.random() * available.length)];
  return lastImage;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

// Tarkov clock runs at 7× real speed. Two server pools 12 hrs apart.
// Using full Unix timestamp × 7 approach (matches tarkov.dev).
function getTarkovTimes() {
  const nowMs = Date.now();
  const MOSCOW_OFFSET_MS = 3 * 3_600_000; // UTC+3 — game epoch anchored to Moscow
  const leftMs  = (nowMs * 7 + MOSCOW_OFFSET_MS) % 86_400_000;
  const rightMs = (nowMs * 7 + MOSCOW_OFFSET_MS + 43_200_000) % 86_400_000;

  function fmt(ms) {
    const h    = Math.floor(ms / 3_600_000);
    const m    = Math.floor((ms % 3_600_000) / 60_000);
    const s    = Math.floor((ms % 60_000) / 1_000);
    const msec = Math.floor(ms % 1_000);
    return (
      `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:` +
      `${String(s).padStart(2, '0')}.${String(msec).padStart(3, '0')}`
    );
  }

  return { left: fmt(leftMs), right: fmt(rightMs) };
}

function updateTarkovClock() {
  const { left, right } = getTarkovTimes();
  document.getElementById('tarkov-left').textContent  = left;
  document.getElementById('tarkov-right').textContent = right;
}

async function loadReports() {
  const statusEl = document.getElementById('update-status');
  const bodyEl = document.getElementById('report-body');
  const btn = document.getElementById('refresh-btn');

  if (!statusEl || !bodyEl || !btn) return;

  statusEl.textContent = 'Updating...';
  btn.disabled = true;

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
      bodyEl.innerHTML = '<tr><td colspan="3" class="loading-row stale">No reports found</td></tr>';
      statusEl.textContent = 'No data';
      return;
    }

    bodyEl.innerHTML = reports
      .map(({ timestamp, map }, i) => {
        const cls = stalenessClass(timestamp);
        const safeName = escapeHtml(map.name);
        const safeWiki = map.wiki && map.wiki.startsWith('https://') ? map.wiki : null;
        const mapLink = safeWiki
          ? `<a href="${escapeHtml(safeWiki)}" target="_blank" rel="noopener" class="map-link">${safeName}</a>`
          : safeName;
        const meta = map.raidDuration ? `${parseInt(map.raidDuration, 10)} min raid` : '';

        return `<tr>
          <td class="row-num">${i + 1}</td>
          <td class="map-cell">
            <span class="map-name">${mapLink}</span>
            ${meta ? `<span class="map-meta">${meta}</span>` : ''}
          </td>
          <td class="${cls}">${timeAgo(timestamp)}</td>
        </tr>`;
      })
      .join('');

    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
    statusEl.textContent = `Updated ${now}`;

    document.getElementById('header-goon').src = pickRandomImage();

  } catch (err) {
    console.error('Fetch failed:', err);
    bodyEl.innerHTML = '<tr><td colspan="3" class="loading-row stale">Failed to fetch data</td></tr>';
    statusEl.textContent = 'Error';
  } finally {
    btn.disabled = false;
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === currentMode));
});
loadReports();
setInterval(loadReports, POLL_INTERVAL_MS);

updateTarkovClock();
setInterval(updateTarkovClock, 50); // 50ms real = ~350ms Tarkov time per tick
