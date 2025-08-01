const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const util = require("util");
const path = require("path");

// Middleware para loguear llegada de cualquier request (antes de cualquier parser)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);

  // Detectar si se aborta la request
  req.on('aborted', () => {
    console.warn(`Request aborted: ${req.method} ${req.originalUrl}`);
  });

  req.on('error', (err) => {
    console.error(`Request error: ${err.message}`);
  });

  next();
});

// Middleware para capturar el raw body junto con el parseo JSON
app.use(express.json({
  strict: true,
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Middleware para loguear el raw body y headers después del parseo
app.use((req, res, next) => {
  try {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      rawBody: req.rawBody || "",
      parsedBody: req.body,
      timestamp: new Date()
    };
    const logString = util.inspect(logData, { depth: null, colors: false, compact: false });
    console.log("=== LOG DE REQUEST ===");
    console.log(logString);
    fs.appendFile(path.resolve("logs.txt"), logString + "\n", err => {
      if (err) console.warn("No se pudo escribir log:", err.message);
    });
  } catch (e) {
    console.warn("Error en logging middleware:", e.message);
  }
  next();
});

// Middleware para manejo explícito de error de JSON inválido
app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    console.error("Error de parsing JSON:", err.message);
    return res.status(400).json({ error: "JSON inválido", detail: err.message });
  }
  next(err);
});

app.use(cors());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "up", timestamp: new Date() });
});

// Endpoints POST
app.post("/interfazpagos/api/notificaciones", (req, res) => {
  res.json({ message: "POST recibido en /notificaciones", data: req.body });
});
app.post("/interfazpagos/api/notificaciones/:param", (req, res) => {
  res.json({ message: `POST recibido en /notificaciones/${req.params.param}`, data: req.body });
});
app.post("/interfazpagos/api/notificaciones/*", (req, res) => {
  res.json({ message: "POST recibido en /notificaciones con múltiples parámetros", data: req.body });
});

app.listen(3000, () => {
  console.log("Servidor escuchando en el puerto 3000");
});