const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Calculator routes
app.post("/add", (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== "number" || typeof b !== "number") return res.status(400).send({ error: "Please provide numbers" });
  res.send({ result: a + b });
});

app.post("/subtract", (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== "number" || typeof b !== "number") return res.status(400).send({ error: "Please provide numbers" });
  res.send({ result: a - b });
});

app.post("/multiply", (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== "number" || typeof b !== "number") return res.status(400).send({ error: "Please provide numbers" });
  res.send({ result: a * b });
});

app.post("/divide", (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== "number" || typeof b !== "number") return res.status(400).send({ error: "Please provide numbers" });
  if (b === 0) return res.status(400).send({ error: "Cannot divide by zero" });
  res.send({ result: a / b });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Calculator server running on http://localhost:${PORT}`));
