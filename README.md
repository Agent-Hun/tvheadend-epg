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
docker run -d --name tvheadend-epg \
  -p 3000:3000 \
  -e TVHEADEND_URL=http://192.168.1.100:9981 \
  ghcr.io/agent-hun/tvheadend-epg:latest
```

## Configuration

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `TVHEADEND_URL` | `http://localhost:9981` | tvheadend server URL |
| `PORT` | `3000` | Web UI port |

## Features

- 🟦 Channel sidebar with logos
- 🟪 Genre-colored program blocks (movies, news, sports, etc.)
- 🔴 Red "now line" with current time indicator
- ⬅️➡️ Day navigation (keyboard arrows or buttons)
- 🖱️ Click program → detail popup with description
- 🔄 Auto-refresh every 60 seconds
- 🌑 Dark theme — clean, modern, TV-room friendly
- 🐳 Single Docker image (~60MB)

## Building Locally

```bash
docker build -t tvheadend-epg .
docker run -p 3000:3000 -e TVHEADEND_URL=http://your-tvheadend:9981 tvheadend-epg
```

## Tech Stack

- **Node.js 20** (Express) — single proxy backend
- **Vanilla HTML/CSS/JS** — no frameworks, no bundlers, no build step
- **Alpine Linux** Docker base — minimal image size
