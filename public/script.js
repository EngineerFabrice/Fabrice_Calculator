// Theme toggle
const themeBtn = document.getElementById("themeToggle");
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

// Arithmetic & Logical calculation
document.getElementById("calcBtn").addEventListener("click", async () => {
    const a = parseFloat(document.getElementById("num1").value);
    const b = parseFloat(document.getElementById("num2").value);
    const operation = document.getElementById("operation").value;

    const res = await fetch("/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a, b, operation })
    });
    const data = await res.json();
    document.getElementById("calcResult").innerText = data.result ?? data.error;
});

// Unit conversion
document.getElementById("convBtn").addEventListener("click", async () => {
    const value = parseFloat(document.getElementById("convValue").value);
    const type = document.getElementById("convType").value;

    const res = await fetch("/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, type })
    });
    const data = await res.json();
    document.getElementById("convResult").innerText = data.result ?? data.error;
});
