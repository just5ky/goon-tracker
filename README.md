# Goon Tracker

Real-time Escape from Tarkov Goon location tracker — OBS overlay + web dashboard, powered by the [tarkov.dev](https://tarkov.dev) community API.

---

## Features

- Live OBS overlay showing current Goon map location
- Web dashboard with last 10 reported locations
- **PvE and PvP mode toggle** — switch on the website or overlay, saved automatically
- Auto-refreshes every 6 minutes (respects tarkov.dev 5-min cache)
- Dual in-game Tarkov clock (both server pools, millisecond precision)
- Staleness colour coding (fresh / warning / stale)
- Random Knight / Big Pipe / Bird's Eye image rotation

---

## Who Are the Goons?

The Goons (Knight, Big Pipe, and Bird's Eye) are a roaming squad of Scavs that spawn on a single map per raid cycle. Knowing their last reported location gives you a heads-up before loading in.

---

## How to Report Sightings

**In-game:** Use [Tarkov Monitor](https://tarkov.dev/tarkov-monitor) — a background app that submits your goon sightings to tarkov.dev automatically while you play. Runs silently alongside the game.

**Discord:** The [Stash Discord Bot](https://tarkov.dev/stash-discord-bot) lets you look up and report goon locations directly from any Discord server.

---

## Setup

### 1. Add character images

Drop three images into the `images/` folder. Filenames must match exactly:

| File | Character |
|---|---|
| `images/knight.png` | Knight |
| `images/bigpipe.png` | Big Pipe |
| `images/birdseye.png` | Bird's Eye |

Any format works (`.png`, `.jpg`, `.webp`) as long as the extension matches.

---

### 2. OBS Overlay

1. In OBS, add a **Browser Source**
2. Check **Local file** and point to `overlay.html`
   - Local path: `file:///C:/path/to/goon-tracker/overlay.html`
   - Or if hosted: `https://yourdomain.com/overlay.html`
3. Set width `355`, height `104` (adjust to taste)
4. Enable **Shutdown source when not visible** (optional, saves resources)

![](/images/overlay.png)

The overlay refreshes automatically every 6 minutes.

#### PvE vs PvP mode

Use the **PvE / PvP** buttons inside the overlay to switch modes. Your selection is saved in the browser and persists across reloads.

To lock a mode via URL (no in-overlay clicking needed):

| Mode | URL |
|---|---|
| PvE (default) | `https://yourdomain.com/overlay.html` |
| PvP | `https://yourdomain.com/overlay.html?mode=regular` |

The URL parameter takes priority over any saved preference.

---

### 3. Website

Open `index.html` in a browser or host the folder on any static server. Use the **PvE / PvP** toggle in the header to switch between game modes. The selection is saved automatically.

---

### 4. Colour Guide

| Colour | Meaning |
|---|---|
| White | Reported within the last 30 minutes |
| Amber | Reported 30 minutes – 2 hours ago |
| Red | Reported more than 2 hours ago — likely stale |

---

## Hosting

### GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source** → `Deploy from branch` → `main` / `/ (root)`
3. Edit `CNAME` to set your custom domain (or remove it to use `yourusername.github.io/repo-name`)
4. Add a DNS `CNAME` record pointing your domain to `yourusername.github.io`

OBS overlay URL: `https://yourdomain.com/overlay.html`

### Docker + Traefik

```bash
# Edit docker-compose.yml — set your domain and Traefik network name
docker compose up -d --build
```

See [docker-compose.yml](docker-compose.yml) for Traefik label configuration.

---

## Data Source

All data sourced from the [tarkov.dev GraphQL API](https://api.tarkov.dev) — a free, community-maintained Escape from Tarkov database. Goon reports are player-submitted.

```graphql
{
  goonReports(gameMode: pve, lang: en, limit: 10) {
    timestamp
    map {
      name
      raidDuration
      wiki
    }
  }
}
```

The `gameMode` field accepts `pve` or `pvp`.

---

## Project Structure

```
goon-tracker/
├── index.html       — web dashboard (last 10 reports)
├── overlay.html     — OBS browser source
├── style.css        — shared base styles
├── site.css         — dashboard styles
├── overlay.css      — overlay styles
├── site.js          — dashboard logic
├── overlay.js       — overlay logic
├── app.js           — standalone overlay logic (legacy, not loaded by default)
├── nginx.conf       — nginx config for Docker
├── Dockerfile
├── docker-compose.yml
└── images/          — drop knight.png, bigpipe.png, birdseye.png here
```

---

## Contributing

Issues and PRs welcome — see [bug reports](.github/ISSUE_TEMPLATE/bug_report.yml) and [feature requests](.github/ISSUE_TEMPLATE/feature_request.yml) templates.

This project is open source: [github.com/just5ky/goon-tracker](https://github.com/just5ky/goon-tracker)

---

## Credits

- Data: [tarkov.dev](https://tarkov.dev) community API
- Reporting: [Tarkov Monitor](https://tarkov.dev/tarkov-monitor)
- Game: Escape from Tarkov by Battlestate Games
