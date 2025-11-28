const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Homepage route
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Fabrice Calculator</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f0f2f5; text-align: center; padding: 50px; }
          h1 { color: #333; }
          p { color: #555; font-size: 18px; }
          .endpoint { margin: 10px 0; font-size: 16px; }
          a { color: #007bff; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .container { background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to Fabrice Calculator</h1>
          <p>A simple REST API calculator built with Node.js and Express.</p>
          <div class="endpoint">POST <code>/add</code> - Add two numbers</div>
          <div class="endpoint">POST <code>/subtract</code> - Subtract two numbers</div>
          <div class="endpoint">POST <code>/multiply</code> - Multiply two numbers</div>
          <div class="endpoint">POST <code>/divide</code> - Divide two numbers</div>
          <p>Use <a href="https://www.postman.com/" target="_blank">Postman</a> or similar tool to test the API.</p>
        </div>
      </body>
    </html>
  `);
});

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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Calculator server running on port ${PORT}`));
