// index.js
const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const util = require("util");
const path = require("path");

// Middlewares de logging raw antes del parsing
app.use((req, res, next) => {
  let raw = "";
  req.on("data", chunk => { raw += chunk; });
  req.on("end", () => {
    try {
      console.log("=== RAW REQUEST ===");
      console.log(`${req.method} ${req.originalUrl}`);
      console.log("Headers:", req.headers);
      console.log("Raw body:", raw);
      const logData = {
        kind: "raw",
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        rawBody: raw,
        timestamp: new Date()
      };
      const logString = util.inspect(logData, { depth: null, colors: false, compact: false });
      // intentar escribir, pero no romper si falla
      fs.appendFile(path.resolve("logs.txt"), logString + "\n", err => {
        if (err) {
          console.warn("No se pudo escribir raw log:", err.message);
        }
      });
    } catch (e) {
      console.warn("Error en middleware de logging raw:", e.message);
    }
    next();
  });
});

// JSON parser con manejo de error explícito
app.use(express.json({ strict: true }));

app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    console.error("Error de parsing JSON:", err.message);
    return res.status(400).json({ error: "JSON inválido", detail: err.message });
  }
  next(err);
});

app.use(cors());

// Helper para loguear y persistir
function persistLog(logData) {
  const logString = util.inspect(logData, { depth: null, colors: false, compact: false });
  console.log(logString);
  fs.appendFile(path.resolve("logs.txt"), logString + "\n", err => {
    if (err) {
      console.warn("No se pudo escribir log:", err.message);
    }
  });
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "up", timestamp: new Date() });
});

// Endpoint para POST sin parámetros adicionales
app.post("/interfazpagos/api/notificaciones", (req, res) => {
  const logData = {
    endpoint: "/interfazpagos/api/notificaciones",
    headers: req.headers,
    body: req.body,
    timestamp: new Date()
  };
  persistLog(logData);
  res.json({ message: "POST recibido en /notificaciones", data: logData });
});

// Endpoint para POST con un parámetro
app.post("/interfazpagos/api/notificaciones/:param", (req, res) => {
  const logData = {
    endpoint: `/interfazpagos/api/notificaciones/${req.params.param}`,
    headers: req.headers,
    body: req.body,
    params: req.params,
    timestamp: new Date()
  };
  persistLog(logData);
  res.json({ message: "POST recibido en /notificaciones con parámetro", data: logData });
});

// Endpoint para POST con múltiples segmentos
app.post("/interfazpagos/api/notificaciones/*", (req, res) => {
  const param = req.params[0];
  const logData = {
    endpoint: `/interfazpagos/api/notificaciones/${param}`,
    headers: req.headers,
    body: req.body,
    params: req.params,
    timestamp: new Date()
  };
  persistLog(logData);
  res.json({ message: "POST recibido en /notificaciones con múltiples parámetros", data: logData });
});

// Access log simple
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.listen(3000, () => {
  console.log("Servidor escuchando en el puerto 3000");
});
