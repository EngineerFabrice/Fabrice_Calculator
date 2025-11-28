// app.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Simple currency conversion endpoint (example rates)
app.post("/api/convert-currency", (req, res) => {
  const { value, from, to } = req.body;
  if (typeof value !== "number") return res.status(400).json({ error: "Value must be a number" });

  // Example static rates (for demo). Replace with real API if needed.
  // Rates relative to USD
  const rates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.81,
    RWF: 1450 // example (not accurate)
  };

  if (!rates[from] || !rates[to]) return res.status(400).json({ error: "Unsupported currency" });

  const usd = value / rates[from];
  const converted = usd * rates[to];
  res.json({ result: Number(converted.toFixed(4)), rate: Number((rates[to]/rates[from]).toFixed(6)) });
});

// Fallback root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 404 json
app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Fabrice Calculator running on port ${PORT}`));
