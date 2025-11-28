const num1 = document.getElementById("num1");
const num2 = document.getElementById("num2");
const result = document.getElementById("result");
const buttons = document.querySelectorAll(".buttons button");
const convertBtn = document.getElementById("convertBtn");
const convertValue = document.getElementById("convertValue");
const convertType = document.getElementById("convertType");
const toggleThemeBtn = document.getElementById("toggleTheme");

// API operation buttons
buttons.forEach(btn => {
  btn.addEventListener("click", async () => {
    const op = btn.dataset.op;
    const a = Number(num1.value);
    const b = Number(num2.value);

    const res = await fetch(`/${op}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a, b })
    });

    const data = await res.json();
    result.textContent = data.error ? `Error: ${data.error}` : `Result: ${data.result}`;
  });
});

// Unit conversion
convertBtn.addEventListener("click", async () => {
  const value = Number(convertValue.value);
  const type = convertType.value;

  const res = await fetch("/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value, type })
  });

  const data = await res.json();
  result.textContent = data.error ? `Error: ${data.error}` : `Result: ${data.result}`;
});

// Theme toggle
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
