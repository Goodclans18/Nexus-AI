import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// API Simulation for the Bot
let botStatus = {
  active: false,
  cpuUsage: "0%",
  latency: "0ms",
  lastFrame: null,
  activeKey: "ROTA_1"
};

app.get("/api/status", (req, res) => {
  res.json(botStatus);
});

app.post("/api/heartbeat", (req, res) => {
  const { cpu, latency, activeKey } = req.body;
  botStatus = { ...botStatus, active: true, cpuUsage: cpu, latency, activeKey };
  res.json({ status: "ok" });
});

app.post("/api/predict", (req, res) => {
  // Simulate IA processing
  const actions = ["UP", "DOWN", "LEFT", "RIGHT", "ATTACK", "SPECIAL", "SHIELD"];
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  const confidence = (Math.random() * 0.4 + 0.6).toFixed(2);
  
  res.json({
    action: randomAction,
    confidence,
    latency: `${(Math.random() * 5 + 2).toFixed(1)}ms`
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
