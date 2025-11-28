const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static frontend

// Calculator API routes
app.post("/add", (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== "number" || typeof b !== "number") return res.status(400).json({ error: "Please provide numbers" });
  res.json({ result: a + b });
});

app.post("/subtract", (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== "number" || typeof b !== "number") return res.status(400).json({ error: "Please provide numbers" });
  res.json({ result: a - b });
});

app.post("/multiply", (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== "number" || typeof b !== "number") return res.status(400).json({ error: "Please provide numbers" });
  res.json({ result: a * b });
});

app.post("/divide", (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== "number" || typeof b !== "number") return res.status(400).json({ error: "Please provide numbers" });
  if (b === 0) return res.status(400).json({ error: "Cannot divide by zero" });
  res.json({ result: a / b });
});

// Logical operations
app.post("/and", (req, res) => {
  const { a, b } = req.body;
  res.json({ result: a & b });
});

app.post("/or", (req, res) => {
  const { a, b } = req.body;
  res.json({ result: a | b });
});

app.post("/xor", (req, res) => {
  const { a, b } = req.body;
  res.json({ result: a ^ b });
});

// Unit conversions
app.post("/convert", (req, res) => {
  const { value, type } = req.body;
  let result;
  switch (type) {
    case "km-m": result = value * 1000; break;
    case "m-km": result = value / 1000; break;
    case "c-f": result = (value * 9/5) + 32; break;
    case "f-c": result = (value - 32) * 5/9; break;
    case "kg-g": result = value * 1000; break;
    case "g-kg": result = value / 1000; break;
    default: return res.status(400).json({ error: "Invalid conversion type" });
  }
  res.json({ result });
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Calculator running on port ${PORT}`));
