import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// API Simulation for the Bot
let botStatus = {
  active: false,
  running: false,
  safetyLock: false,
  integrityCheck: "SECURE",
  cpuUsage: "0%",
  latency: "0ms",
  lastFrame: null,
  activeKey: "ROTA_1",
  gameState: {
    p1Char: "Desconhecido",
    cpuChar: "Desconhecido",
    stage: "Desconhecido",
    detectedFrame: 0,
    activeMove: "Idle"
  }
};

app.get("/api/status", (req, res) => {
  // Simulate safety health check
  botStatus.safetyLock = Math.random() > 0.99; // 1% chance of temporary safety alert
  res.json(botStatus);
});

app.post("/api/safety/failsafe", (req, res) => {
  botStatus.running = false;
  botStatus.safetyLock = true;
  res.json({ status: "emergency_stop_triggered" });
});

app.post("/api/scan", (req, res) => {
  // Simulate character detection
  const chars = ["Mario", "Link", "Kirby", "Pikachu", "Sonic", "Ichigo", "Naruto"];
  botStatus.gameState.p1Char = chars[Math.floor(Math.random() * chars.length)];
  botStatus.gameState.cpuChar = chars[Math.floor(Math.random() * chars.length)];
  botStatus.gameState.stage = "Final Destination";
  res.json({ status: "scan_complete", gameState: botStatus.gameState });
});

app.post("/api/start", (req, res) => {
  botStatus.running = true;
  botStatus.active = true;
  res.json({ status: "started" });
});

app.post("/api/stop", (req, res) => {
  botStatus.running = false;
  res.json({ status: "stopped" });
});

app.post("/api/shutdown", (req, res) => {
  botStatus = {
    active: false,
    running: false,
    safetyLock: false,
    integrityCheck: "SECURE",
    cpuUsage: "0%",
    latency: "0ms",
    lastFrame: null,
    activeKey: "ROTA_1",
    gameState: {
      p1Char: "Desconhecido",
      cpuChar: "Desconhecido",
      stage: "Desconhecido",
      detectedFrame: 0,
      activeMove: "Idle"
    }
  };
  res.json({ status: "shutdown_complete" });
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
