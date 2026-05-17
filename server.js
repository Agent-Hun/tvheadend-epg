import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";

const TVHEADEND_URL = process.env.TVHEADEND_URL || "http://localhost:9981";
const PORT = parseInt(process.env.PORT || "3000", 10);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Log every request
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString().slice(0, 19)} ${req.method} ${req.url}`);
  next();
});

// Proxy all /api/* calls to tvheadend
app.use("/api", async (req, res) => {
  const targetUrl = `${TVHEADEND_URL}${req.originalUrl}`;
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        Accept: "application/json",
        ...(req.headers["content-type"] && {
          "Content-Type": req.headers["content-type"],
        }),
      },
      body: req.method !== "GET" && req.method !== "HEAD"
        ? JSON.stringify(req.body)
        : undefined,
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(`Proxy error: ${(err).message}`);
    res.status(502).json({ error: "tvheadend unreachable", detail: (err).message });
  }
});

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`tvheadend-epg running on port ${PORT}`);
  console.log(`Proxying API to ${TVHEADEND_URL}`);
});
