import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";

const TVHEADEND_URL = process.env.TVHEADEND_URL || "http://localhost:9981";
const PORT = parseInt(process.env.PORT || "3000", 10);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

// ── Logging ──
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString().slice(0, 19)} ${req.method} ${req.url}`);
  next();
});

// ── API proxy ──
// Directly proxy /api/json/ and /api/dvr/, plus /imagecache/ for channel icons
app.use(["/api", "/imagecache"], async (req, res) => {
  const targetUrl = `${TVHEADEND_URL}${req.originalUrl}`;
  try {
    const fetchOpts = {
      method: req.method,
      headers: {
        ...(req.method !== "GET" && { "Content-Type": "application/json" }),
      },
    };

    // Forward POST/PUT body
    if (req.method === "POST" && req.body && Object.keys(req.body).length > 0) {
      fetchOpts.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOpts);

    // For images, pipe raw binary
    const ct = response.headers.get("content-type") || "";
    if (ct.startsWith("image/")) {
      res.set("Content-Type", ct);
      res.set("Cache-Control", "public, max-age=86400");
      const buf = await response.arrayBuffer();
      res.send(Buffer.from(buf));
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(`Proxy error: ${err.message}`);
    res.status(502).json({ error: "tvheadend unreachable", detail: err.message });
  }
});

// ── DVR: create recording timer via event ID ──
// POST /api/dvr/entry/create_by_event  { event_id, config_uuid }
// We also expose a convenience:
// POST /api/record  { event_id: number, channel_uuid: string }
app.post("/api/record", async (req, res) => {
  try {
    const { event_id } = req.body;
    if (!event_id) {
      return res.status(400).json({ error: "Missing event_id" });
    }

    // 1. Get the default DVR config to find config_uuid
    const configRes = await fetch(`${TVHEADEND_URL}/api/dvr/config/grid`);
    const configData = await configRes.json();
    const defaultConfig = (configData.entries || []).find(c => c.name === "" || !c.name);
    if (!defaultConfig) {
      return res.status(500).json({ error: "No default DVR config found in tvheadend" });
    }
    const config_uuid = defaultConfig.uuid;

    // 2. Create the recording timer
    const createRes = await fetch(`${TVHEADEND_URL}/api/dvr/entry/create_by_event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id, config_uuid }),
    });
    const createData = await createRes.json();
    res.json(createData);
  } catch (err) {
    console.error(`Record error: ${err.message}`);
    res.status(502).json({ error: "tvheadend unreachable", detail: err.message });
  }
});

// ── DVR: delete recording timer ──
// POST /api/record/delete  { dvr_uuid: string }
app.post("/api/record/delete", async (req, res) => {
  try {
    const { dvr_uuid } = req.body;
    if (!dvr_uuid) {
      return res.status(400).json({ error: "Missing dvr_uuid" });
    }
    const delRes = await fetch(`${TVHEADEND_URL}/api/dvr/entry/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid: dvr_uuid }),
    });
    const delData = await delRes.json();
    res.json(delData);
  } catch (err) {
    console.error(`Record delete error: ${err.message}`);
    res.status(502).json({ error: "tvheadend unreachable", detail: err.message });
  }
});

// ── Static frontend ──
app.use(express.static(path.join(__dirname, "public")));

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`tvheadend-epg running on port ${PORT}`);
  console.log(`Proxying API to ${TVHEADEND_URL}`);
});
