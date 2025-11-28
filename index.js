let currentInput = "";
let a = null;
let b = null;
let operation = null;

const display = document.getElementById("display");
const resultDiv = document.getElementById("result");

document.querySelectorAll(".num").forEach(button => {
  button.addEventListener("click", () => {
    currentInput += button.innerText;
    display.value = currentInput;
  });
});

document.querySelectorAll(".op").forEach(button => {
  button.addEventListener("click", () => {
    if (!currentInput) return;

    // If user already pressed operator before, calculate previous operation first
    if (a !== null && operation !== null) {
      b = parseFloat(currentInput);
      calculateServer(a, b, operation).then(res => {
        a = res;
        display.value = a;   // show result in display
      });
    } else {
      a = parseFloat(currentInput);
    }

    operation = button.getAttribute("data-op");
    currentInput = "";   // now user can type next number
  });
});

document.getElementById("equals").addEventListener("click", () => {
  if (!operation || !currentInput) return;
  b = parseFloat(currentInput);

  calculateServer(a, b, operation).then(res => {
    display.value = res;
    resultDiv.innerText = `Result: ${res}`;
    a = res;          // keep result for next calculation
    currentInput = "";
    operation = null;
  });
});

document.getElementById("clear").addEventListener("click", () => {
  currentInput = "";
  a = null;
  b = null;
  operation = null;
  display.value = "";
  resultDiv.innerText = "";
});

// Function to call Node.js server
async function calculateServer(a, b, operation) {
  try {
    const response = await fetch(`http://localhost:3000/${operation}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a, b })
    });
    const data = await response.json();
    if (data.error) {
      resultDiv.innerText = `Error: ${data.error}`;
      return 0;
    }
    return data.result;
  } catch (err) {
    resultDiv.innerText = "Server error. Make sure Node.js server is running.";
    console.error(err);
    return 0;
  }
}
