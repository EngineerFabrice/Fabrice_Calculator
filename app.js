const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve frontend

// Arithmetic operations
app.post("/calculate", (req, res) => {
  const { a, b, operation } = req.body;

  if (typeof a !== "number" || typeof b !== "number") {
    return res.status(400).json({ error: "Please provide numbers" });
  }

  let result;

  switch (operation) {
    case "add": result = a + b; break;
    case "subtract": result = a - b; break;
    case "multiply": result = a * b; break;
    case "divide": 
      if (b === 0) return res.status(400).json({ error: "Cannot divide by zero" });
      result = a / b; 
      break;
    case "and": result = a & b; break;
    case "or": result = a | b; break;
    case "xor": result = a ^ b; break;
    default: return res.status(400).json({ error: "Invalid operation" });
  }

  res.json({ result });
});

// Unit conversions
app.post("/convert", (req, res) => {
  const { value, type } = req.body;
  if (typeof value !== "number") return res.status(400).json({ error: "Value must be a number" });

  let result;
  switch(type) {
    // Distance
    case "km-to-m": result = value * 1000; break;
    case "m-to-km": result = value / 1000; break;
    // Weight
    case "kg-to-g": result = value * 1000; break;
    case "g-to-kg": result = value / 1000; break;
    // Temperature
    case "c-to-f": result = (value * 9/5) + 32; break;
    case "f-to-c": result = (value - 32) * 5/9; break;
    // Currency (example: USD to EUR ~0.91)
    case "usd-to-eur": result = value * 0.91; break;
    case "eur-to-usd": result = value / 0.91; break;
    default: return res.status(400).json({ error: "Invalid conversion type" });
  }

  res.json({ result });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Fabrice Calculator running on port ${PORT}`));
