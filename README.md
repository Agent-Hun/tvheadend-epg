# tvheadend-epg

Modern grid-style EPG (Electronic Program Guide) for tvheadend.  
Single Docker image, zero build step, dark-themed minimal UI.

![EPG Preview](https://github.com/wubbl0rz/EpgChamp/raw/master/screenshot.jpg)  
*Reference style — similar dark grid layout*

## Quick Start

```bash
# 1. Clone
git clone https://github.com/Agent-Hun/tvheadend-epg.git
cd tvheadend-epg

# 2. Edit TVHEADEND_URL in docker-compose.yaml to point to your tvheadend
#    e.g. TVHEADEND_URL=http://192.168.1.100:9981

# 3. Start
docker compose up -d

# 4. Open
#    http://localhost:3000
```

### Without docker-compose

```bash
docker build -t tvheadend-epg .
docker run -d --name tvheadend-epg \
  -p 3000:3000 \
  -e TVHEADEND_URL=http://192.168.1.100:9981 \
  tvheadend-epg
```

## Configuration

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `TVHEADEND_URL` | `http://localhost:9981` | tvheadend server URL |
| `PORT` | `3000` | Web UI port |

## Features

- 📺 **Channel sidebar** with logos and channel numbers
- 🎨 **Genre-colored** program blocks (movies, news, sports, culture, etc.)
- 🔴 **Red "now line"** with diamond indicator — shows where you are in the timeline
- 📅 **7-day navigation** with pill buttons (keyboard arrows too)
- 🖱️ **Click program** → detail popup with full description
- 🔴 **One-click recording** — schedules a DVR timer on tvheadend
- ✅ **Recording indicator** — programs with active timers show a red outline
- ❌ **Cancel recordings** from the detail popup
- 🔄 **Auto-refresh** every 5 minutes
- 🌑 **Dark theme** — clean, modern, TV-room friendly
- 🐳 **Single Docker image** (~60MB) — no build step, no framework

## API Endpoints

The Express server proxies tvheadend's JSON API plus adds:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/record` | POST | Schedule a recording — body: `{ "event_id": 12345 }` |
| `/api/record/delete` | POST | Cancel a recording — body: `{ "dvr_uuid": "abc123" }` |
| `/api/*` | * | Proxied to tvheadend JSON API |
| `/imagecache/*` | GET | Proxied channel icons with caching |

## Tech Stack

- **Node.js 20** (Express) — proxy + static server
- **Vanilla HTML/CSS/JS** — no frameworks, no bundlers, no build step
- **Alpine Linux** Docker base — minimal image size
