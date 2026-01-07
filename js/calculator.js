/* =========================================================
   Engineering Workbench - Scientific Calculator (Complete)
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

function toRadians(x) {
  return angleMode === "DEG" ? (x * Math.PI) / 180 : x;
}

/* -----------------------------
   Utility Functions
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

/** 괄호 자동 완성: 닫히지 않은 모든 괄호를 닫아줌 */
function autocompleteParentheses(exp) {
  const openCount = (exp.match(/\(/g) || []).length;
  const closeCount = (exp.match(/\)/g) || []).length;
  const missingCount = openCount - closeCount;
  return missingCount > 0 ? exp + ")".repeat(missingCount) : exp;
}

/** 수식 정규화: 기호를 JS Math 함수로 변환 */
function normalizeExpression(exp) {
  if (!exp) return "";
  let res = exp;

  // 1. 기초 상수 및 기호 치환
  res = res.replace(/π/g, "Math.PI");
  res = res.replace(/ANS/g, `(${lastAnswer})`);
  res = res.replace(/\^/g, "**"); // 거듭제곱 연산자

  // 2. 함수명 매핑 (긴 이름부터 매칭하여 asin이 sin으로 치환되는 것 방지)
  const functions = Object.keys(funcMap).sort((a, b) => b.length - a.length);
  functions.forEach(fn => {
    // 단어 경계(\b)를 사용하여 정확한 함수명만 찾아 funcMap.fn( 으로 변경
    const regex = new RegExp(`\\b${fn}\\(`, "g");
    res = res.replace(regex, `funcMap.${fn}(`);
  });

  return res;
}

/* -----------------------------
   Evaluation
----------------------------- */

function evaluateExpression() {
  if (!expression || expression === "Error") return;

  try {
    // 1. 괄호 보정
    let tempExp = autocompleteParentheses(expression);
    
    // 2. 수식 변환
    let finalExp = normalizeExpression(tempExp);

    // 3. 계산 (Function 생성자 사용)
    const result = Function("funcMap", "Math", `return ${finalExp}`)(funcMap, Math);

    // 4. 결과 검증
    if (result === undefined || isNaN(result) || !isFinite(result)) {
      throw new Error("Invalid Calculation");
    }

    // 5. 결과값 정리 (소수점 10자리 제한 및 불필요한 0 제거)
    const formattedResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(10));

    history.push(`${tempExp} = ${formattedResult}`);
    lastAnswer = formattedResult;
    expression = String(formattedResult);

    updateHistory();
    updateDisplay();
  } catch (err) {
    console.error("Eval Error:", err);
    expression = "Error";
    updateDisplay();
  }
}

/* -----------------------------
   Input Handling
----------------------------- */

function appendValue(value) {
  if (expression === "0" || expression === "Error") {
    expression = "";
  }
  expression += value;
  updateDisplay();
}

/* -----------------------------
   Event Listeners
----------------------------- */

// 각 버튼 클릭 이벤트
document.querySelectorAll("[data-key]").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.key;

    switch (key) {
      case "=":
        evaluateExpression();
        break;
      case "C":
        expression = "";
        updateDisplay();
        break;
      case "DEL":
        expression = expression.slice(0, -1);
        updateDisplay();
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
      case "log":
      case "ln":
        appendValue(`${key}(`); // 괄호를 자동으로 붙여줌
        break;
      case "√":
        appendValue("sqrt(");
        break;
      case "pow":
        appendValue("^");
        break;
      case "x2":
        appendValue("^2");
        break;
      case "EXP":
        appendValue("*10^");
        break;
      case "ANS":
        appendValue("ANS");
        break;
      case "π":
        appendValue("π");
        break;
      default:
        appendValue(key);
    }
  });
});

// 각도 모드 변경
angleModeEl.addEventListener("click", () => {
  angleMode = angleMode === "DEG" ? "RAD" : "DEG";
  angleModeEl.textContent = angleMode;
  angleModeEl.style.color = angleMode === "RAD" ? "#ff4757" : "#ffffff";
});

// 키보드 지원
document.addEventListener("keydown", e => {
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
    expression = expression.slice(0, -1);
    updateDisplay();
  } else if (key === "Escape") {
    expression = "";
    updateDisplay();
  }
});
