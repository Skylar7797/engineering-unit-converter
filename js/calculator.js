/* =========================================================
   Engineering Workbench - Scientific Calculator (Final)
   ========================================================= */

const inputEl = document.getElementById("calc-input");
const historyEl = document.getElementById("calc-history");
const angleModeEl = document.getElementById("angle-mode");

let expression = "";
let history = [];
let angleMode = "DEG"; // DEG | RAD
let shiftMode = false;
let lastAnswer = 0;

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
  asin: x => angleMode === "DEG" ? Math.asin(x) * 180 / Math.PI : Math.asin(x),
  acos: x => angleMode === "DEG" ? Math.acos(x) * 180 / Math.PI : Math.acos(x),
  atan: x => angleMode === "DEG" ? Math.atan(x) * 180 / Math.PI : Math.atan(x),
  log: x => Math.log10(x),
  ln: x => Math.log(x),
  sqrt: x => Math.sqrt(x),
  abs: x => Math.abs(x),
  pow: (a, b) => Math.pow(a, b)
};

/* -----------------------------
   Expression Processing
----------------------------- */

function normalizeExpression(exp) {
  if (!exp) return "";

  let res = exp;
  // 1. 기호 변환
  res = res.replace(/π/g, "Math.PI");
  res = res.replace(/ANS/g, lastAnswer);
  
  // 2. ^ 연산자를 자바스크립트 거듭제곱 연산자(**)로 변환
  res = res.replace(/\^/g, "**");

  // 3. 함수명 매핑 (예: sin( -> funcMap.sin()
  // 단어 경계(\b)를 사용하여 asin과 sin이 겹치지 않게 처리
  const functions = Object.keys(funcMap).sort((a, b) => b.length - a.length); // 긴 이름 우선 매칭
  functions.forEach(fn => {
    const regex = new RegExp(`\\b${fn}\\(`, "g");
    res = res.replace(regex, `funcMap.${fn}(`);
  });

  return res;
}

/** 괄호 자동 완성: 여는 괄호와 닫는 괄호의 개수를 맞춰줌 */
function autocompleteParentheses(exp) {
  const openCount = (exp.match(/\(/g) || []).length;
  const closeCount = (exp.match(/\)/g) || []).length;
  const missingCount = openCount - closeCount;

  if (missingCount > 0) {
    return exp + ")".repeat(missingCount);
  }
  return exp;
}

/* -----------------------------
   Evaluate Expression
----------------------------- */

function evaluateExpression() {
  if (!expression || expression === "Error") return;

  try {
    // 1. 괄호 자동 완성 적용
    let completedExp = autocompleteParentheses(expression);
    
    // 2. 수식 정규화
    let finalExp = normalizeExpression(completedExp);

    // 3. 계산 수행
    const result = Function("funcMap", "Math", `return ${finalExp}`)(funcMap, Math);

    // 4. 결과값 정리 (부동소수점 오차 방지)
    const formattedResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(10));

    // 5. 히스토리 및 디스플레이 업데이트
    history.push(`${completedExp} = ${formattedResult}`);
    lastAnswer = formattedResult;
    expression = String(formattedResult);

    updateHistory();
    updateDisplay();
  } catch (err) {
    console.error(err);
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
  // UI 피드백을 위해 색상 변경 (CSS 클래스로 관리하는 것이 더 좋음)
  angleModeEl.style.color = angleMode === "RAD" ? "#ff4757" : "#ffffff";
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
      case "SHIFT":
        shiftMode = !shiftMode;
        btn.classList.toggle("active", shiftMode);
        break;
      case "sin":
      case "cos":
      case "tan":
        appendValue(shiftMode ? `a${key}(` : `${key}(`);
        shiftMode = false;
        document.querySelector('[data-key="SHIFT"]').classList.remove("active");
        break;
      case "x2":
        appendValue("^2");
        break;
      case "pow":
        appendValue("^");
        break;
      case "√":
        appendValue("sqrt(");
        break;
      case "π":
        appendValue("π");
        break;
      case "EXP":
        appendValue("*10^");
        break;
      case "ANS":
        appendValue("ANS");
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
  // 입력 필드에 포커스가 있을 때는 기본 동작 허용
  if (document.activeElement === inputEl) return;

  const key = e.key;

  if (!isNaN(key) || "+-*/().".includes(key)) {
    appendValue(key);
  } else if (key === "^") {
    appendValue("^");
  } else if (key === "Enter") {
    e.preventDefault();
    evaluateExpression();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearAll();
  }
});
