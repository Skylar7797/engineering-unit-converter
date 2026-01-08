/* =========================================================
   Engineering Workbench - Scientific Calculator (Full Version)
   ========================================================= */

const inputEl = document.getElementById("calc-input");
const historyEl = document.getElementById("calc-history");
const angleModeEl = document.getElementById("angle-mode");

let expression = "";
let history = [];
let angleMode = "DEG"; // DEG | RAD
let shiftMode = false;
let lastAnswer = 0;

// 직접 입력을 위해 readonly 제거
inputEl.removeAttribute("readonly");

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
  inputEl.value = expression; 
}

function updateHistory() {
  historyEl.innerHTML = history
    .slice(-5)
    .map(h => `<div class="history-item">${h}</div>`)
    .join("");
}

function autocompleteParentheses(exp) {
  const openCount = (exp.match(/\(/g) || []).length;
  const closeCount = (exp.match(/\)/g) || []).length;
  const missingCount = openCount - closeCount;
  return missingCount > 0 ? exp + ")".repeat(missingCount) : exp;
}

function normalizeExpression(exp) {
  if (!exp) return "";
  let res = exp;

  // 1. 기호 및 상수 변환 (대소문자 구분 없이 처리하기 위해 i 플래그 고려 가능)
  res = res.replace(/π/g, "Math.PI");
  res = res.replace(/ANS/g, `(${lastAnswer})`);
  res = res.replace(/\^/g, "**");
  res = res.replace(/÷/g, "/");
  res = res.replace(/×/g, "*");

  // 2. 함수 매핑
  const functions = Object.keys(funcMap).sort((a, b) => b.length - a.length);
  functions.forEach(fn => {
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
    let rawExp = expression;
    rawExp = autocompleteParentheses(rawExp);
    const finalExp = normalizeExpression(rawExp);

    const result = Function("funcMap", "Math", `return ${finalExp}`)(funcMap, Math);

    if (result === undefined || isNaN(result) || !isFinite(result)) {
      throw new Error("Invalid Output");
    }

    const formattedResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(10));

    history.push(`${rawExp} = ${formattedResult}`);
    lastAnswer = formattedResult;
    expression = String(formattedResult);

    updateHistory();
    updateDisplay();
  } catch (err) {
    console.error("Calc Error:", err);
    expression = "Error";
    updateDisplay();
  }
}

/* -----------------------------
   Event Listeners
----------------------------- */

// [A] 입력창 직접 타이핑 동기화
inputEl.addEventListener("input", (e) => {
  expression = e.target.value;
});

// [B] 버튼 클릭 처리
function appendValue(value) {
  // 에러 상태거나 0일 때 새로 입력하면 비워줌
  if (expression === "0" || expression === "Error") expression = "";
  expression += value;
  updateDisplay();
}

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
        expression = String(expression).slice(0, -1);
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
        const shiftBtn = document.querySelector('[data-key="SHIFT"]');
        if (shiftBtn) shiftBtn.classList.remove("active");
        break;
      case "log":
      case "ln":
        appendValue(`${key}(`);
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

// [C] 각도 모드 변경
angleModeEl.addEventListener("click", () => {
  angleMode = angleMode === "DEG" ? "RAD" : "DEG";
  angleModeEl.textContent = angleMode;
  angleModeEl.style.color = angleMode === "RAD" ? "#ff4757" : "#ffffff";
});

// [D] 키보드 단축키 처리
document.addEventListener("keydown", (e) => {
  // 1. 현재 포커스가 Unit Converter의 입력창이나 메모장(textarea)에 있다면 계산기 단축키 작동 방지
  const activeTag = document.activeElement.tagName;
  const activeId = document.activeElement.id;

  if (activeId === "inputValue" || activeTag === "TEXTAREA") {
    return; // 함수 종료 (계산기에 입력되지 않음)
  }

  // Enter 키 처리
  if (e.key === "Enter") {
    e.preventDefault();
    evaluateExpression();
  } 
  // ESC 키 처리
  else if (e.key === "Escape") {
    expression = "";
    updateDisplay();
  }
  
  // 계산기 입력창(inputEl) 자체가 아닌 다른 곳에 포커스가 있을 때만 실행 
  // (입력창 자체에 있을 때는 브라우저 기본 입력 기능 사용)
  if (document.activeElement !== inputEl) {
    if (!isNaN(e.key) || "+-*/().^".includes(e.key)) {
      appendValue(e.key);
    } else if (e.key === "Backspace") {
      expression = String(expression).slice(0, -1);
      updateDisplay();
    }
  }
});
