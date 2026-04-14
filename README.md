# Goon Tracker

Real-time Escape from Tarkov Goon location tracker — OBS overlay + web dashboard, powered by the [tarkov.dev](https://tarkov.dev) community API.

---

## Features

- Live OBS overlay showing current Goon map location
- Web dashboard with last 10 reported locations
- PVE mode
- Auto-refreshes every 3 minutes
- Staleness colour coding (fresh / old / stale)
- Random Knight / Big Pipe / Bird's Eye image rotation

---

## Who Are the Goons?

The Goons (Knight, Big Pipe, and Bird's Eye) are a roaming squad of Scavs that can spawn on different maps each raid. Knowing their last reported location gives you a heads-up before loading in.

---

## Setup

### 1. Add character images

Drop three images into the `images/` folder. Filenames must match exactly:

| File | Character |
|---|---|
| `images/knight.png` | Knight |
| `images/bigpipe.png` | Big Pipe |
| `images/birdseye.png` | Bird's Eye |

Any format works (`.png`, `.jpg`, `.webp`) as long as the extension matches what you set.

---

### 2. OBS Overlay

1. In OBS, add a **Browser Source**
2. Check **Local file** and point to `overlay.html`
   - Local path: `file:///C:/path/to/goon-tracker/overlay.html`
   - Or if hosted: `https://yourdomain.com/overlay.html`
3. Set width `300`, height `100` (adjust to taste)
4. Enable **Shutdown source when not visible** (optional, saves resources)

The overlay refreshes automatically every 3 minutes. No interaction needed.

---

### 3. Colour Guide

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
    }
  }
}
```

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
├── nginx.conf       — nginx config for Docker
├── Dockerfile
├── docker-compose.yml
└── images/          — drop knight.png, bigpipe.png, birdseye.png here
```

---

## Credits

- Data: [tarkov.dev](https://tarkov.dev) community API
- Game: Escape from Tarkov by Battlestate Games
