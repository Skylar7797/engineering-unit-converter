/* =========================================================
   Engineering Workbench - Scientific Calculator
   calculator.js
   ========================================================= */

const inputEl = document.getElementById("calc-input");
const historyEl = document.getElementById("calc-history");
const angleModeEl = document.getElementById("angle-mode");

let expression = "";
let history = [];
let angleMode = "DEG"; // DEG | RAD

/* -----------------------------
   Utility
----------------------------- */

function updateDisplay() {
  inputEl.value = expression || "0";
}

function updateHistory() {
  historyEl.innerHTML = history
    .slice(-5)
    .map(h => `<div class="history-item">${h}</div>`)
    .join("");
}

function toRadians(x) {
  return angleMode === "DEG" ? (x * Math.PI) / 180 : x;
}

/* -----------------------------
   Math Function Mapping
----------------------------- */

const funcMap = {
  sin: x => Math.sin(toRadians(x)),
  cos: x => Math.cos(toRadians(x)),
  tan: x => Math.tan(toRadians(x)),
  asin: x => angleMode === "DEG" ? (Math.asin(x) * 180) / Math.PI : Math.asin(x),
  acos: x => angleMode === "DEG" ? (Math.acos(x) * 180) / Math.PI : Math.acos(x),
  atan: x => angleMode === "DEG" ? (Math.atan(x) * 180) / Math.PI : Math.atan(x),
  log: x => Math.log10(x),
  ln: x => Math.log(x),
  sqrt: x => Math.sqrt(x),
  abs: x => Math.abs(x)
};

/* -----------------------------
   Expression Evaluation
----------------------------- */

function evaluateExpression() {
  if (!expression) return;

  try {
    let exp = expression;

    // 함수 치환
    Object.keys(funcMap).forEach(fn => {
      exp = exp.replace(
        new RegExp(`${fn}\\(`, "g"),
        `funcMap.${fn}(`
      );
    });

    const result = Function("funcMap", `return ${exp}`)(funcMap);

    history.push(`${expression} = ${result}`);
    expression = String(result);

    updateHistory();
    updateDisplay();
  } catch (e) {
    expression = "Error";
    updateDisplay();
  }
}

/* -----------------------------
   Input Handling
----------------------------- */

function appendValue(value) {
  if (expression === "Error") expression = "";
  expression += value;
  updateDisplay();
}

function clearAll() {
  expression = "";
  updateDisplay();
}

function backspace() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

/* -----------------------------
   Angle Mode Toggle
----------------------------- */

angleModeEl.addEventListener("click", () => {
  angleMode = angleMode === "DEG" ? "RAD" : "DEG";
  angleModeEl.textContent = angleMode;
  angleModeEl.style.color = "red";
});

/* -----------------------------
   Button Click Support
----------------------------- */

document.querySelectorAll("[data-key]").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.key;

    switch (key) {
      case "=":
        evaluateExpression();
        break;
      case "C":
        clearAll();
        break;
      case "DEL":
        backspace();
        break;
      default:
        appendValue(key);
    }
  });
});

/* -----------------------------
   Keyboard Support
----------------------------- */

document.addEventListener("keydown", e => {
  const key = e.key;

  if (!isNaN(key) || "+-*/().".includes(key)) {
    appendValue(key);
  } else if (key === "Enter") {
    e.preventDefault();
    evaluateExpression();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearAll();
  }
});
