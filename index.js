// index.js
const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Endpoint para POST sin parámetros adicionales
app.post("/interfazpagos/api/notificaciones", (req, res) => {
  const logData = {
    endpoint: "/interfazpagos/api/notificaciones",
    headers: req.headers,
    body: req.body,
    timestamp: new Date()
  };
  console.log(logData);
  fs.appendFileSync("logs.txt", JSON.stringify(logData) + "\n");
  res.json({ message: "POST recibido en /notificaciones", data: logData });
});

// Endpoint para POST con parámetros
app.post("/interfazpagos/api/notificaciones/:param", (req, res) => {
  const logData = {
    endpoint: `/interfazpagos/api/notificaciones/${req.params.param}`,
    headers: req.headers,
    body: req.body,
    params: req.params,
    timestamp: new Date()
  };
  console.log(logData);
  fs.appendFileSync("logs.txt", JSON.stringify(logData) + "\n");
  res.json({ message: "POST recibido en /notificaciones con parámetro", data: logData });
});

// Endpoint para POST con multiples parámetros
app.post("/interfazpagos/api/notificaciones/*", (req, res) => {
  const param = req.params[0]; // Captura lo que sigue a '/interfazpagos/api/notificaciones/'
  const logData = {
    endpoint: `/interfazpagos/api/notificaciones/${param}`,
    headers: req.headers,
    body: req.body,
    params: req.params,
    timestamp: new Date()
  };
  console.log(logData);
  fs.appendFileSync("logs.txt", JSON.stringify(logData) + "\n");
  res.json({ message: "POST recibido en /notificaciones con multiples parámetros", data: logData });
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.listen(3000, () => {
  console.log("Servidor escuchando en el puerto 3000");
});
