/* ===============================
   Graph Analytic - Final Precision Version
================================ */

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const plotBtn = document.getElementById("plotBtn");
const functionInput = document.getElementById("functionInput");
const analysisOutput = document.getElementById("analysisOutput");
const modeInputs = document.querySelectorAll('input[name="cursorMode"]');
const xScaleSelect = document.getElementById("xScale");
const yScaleSelect = document.getElementById("yScale");
const presetButtons = document.querySelectorAll(".preset");

/* ===============================
   State
================================ */
let functions = [];
let scale = 70; 
let origin = { x: canvas.width / 2, y: canvas.height / 2 };
let mouse = { x: null, y: null };
let cursorMode = "follow";
let axisScale = { x: "linear", y: "linear" };

/* ===============================
   Math Parser
================================ */
function parseFunction(expr) {
  const safe = expr
    .replace(/\^/g, "**")
    .replace(/sin/g, "Math.sin")
    .replace(/cos/g, "Math.cos")
    .replace(/tan/g, "Math.tan")
    .replace(/cot/g, "(x => 1/Math.tan(x))")
    .replace(/sec/g, "(x => 1/Math.cos(x))")
    .replace(/csc/g, "(x => 1/Math.sin(x))")
    .replace(/exp/g, "Math.exp")
    .replace(/log/g, "Math.log10")
    .replace(/ln/g, "Math.log")
    .replace(/π/g, "Math.PI");
  return new Function("x", `return ${safe}`);
}

const isTriFunction = (fn) => /sin|cos|tan|cot|sec|csc/.test(fn.expr);
const getUnitFactor = () => (functions.some(isTriFunction) ? Math.PI : 1);

/* ===============================
   Coordinate Conversion
================================ */
const tx = (x) => (axisScale.x === "log" ? (x <= 0 ? null : Math.log10(x)) : x);
const ty = (y) => (axisScale.y === "log" ? (y <= 0 ? null : Math.log10(y)) : y);

const toCanvas = (x, y) => {
  const factor = getUnitFactor();
  const X = tx(x); const Y = ty(y);
  if (X === null || Y === null) return null;
  return { x: origin.x + (X / factor) * scale, y: origin.y - Y * scale };
};

const toMath = (x, y) => {
  const factor = getUnitFactor();
  const mx = (x - origin.x) / scale;
  const my = (origin.y - y) / scale;
  return {
    x: axisScale.x === "log" ? Math.pow(10, mx * factor) : mx * factor,
    y: axisScale.y === "log" ? Math.pow(10, my) : my
  };
};

/* ===============================
   Grid & Labels
================================ */
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const factor = getUnitFactor();
  const isTrig = factor !== 1;

  ctx.strokeStyle = "#eef2f8"; ctx.lineWidth = 1;
  for (let x = origin.x % scale; x < canvas.width; x += scale) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = origin.y % scale; y < canvas.height; y += scale) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  ctx.strokeStyle = "#444"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, origin.y); ctx.lineTo(canvas.width, origin.y);
  ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, canvas.height);
  ctx.stroke();

  ctx.fillStyle = "#333"; ctx.font = "12px Arial";
  ctx.textAlign = "center";
  
  const nLeft = Math.floor(origin.x / scale);
  const nRight = Math.floor((canvas.width - origin.x) / scale);
  for (let i = -nLeft; i <= nRight; i++) {
    if (i === 0) continue;
    let label = isTrig ? (i === 1 ? "π" : i === -1 ? "-π" : i + "π") : i;
    ctx.fillText(label, origin.x + i * scale, origin.y + 18);
  }

  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  const nUp = Math.floor(origin.y / scale);
  const nDown = Math.floor((canvas.height - origin.y) / scale);
  for (let i = -nUp; i <= nDown; i++) {
    if (i === 0) continue;
    ctx.fillText(i, origin.x - 6, origin.y - i * scale);
  }
}

/* ===============================
   Plot & Intercepts
================================ */
function markIntercepts(fn) {
  ctx.fillStyle = "#000";
  const factor = getUnitFactor();
  const step = 0.02 * factor; 
  for (let x = -25 * factor; x <= 25 * factor; x += step) {
    try {
      const y1 = fn.func(x); const y2 = fn.func(x + step);
      if (y1 * y2 <= 0) {
        const exactX = x - y1 * (step / (y2 - y1));
        const p = toCanvas(exactX, 0);
        if (p && p.x >= 0 && p.x <= canvas.width) {
          ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
        }
      }
    } catch {}
  }
}

function plotFunctions() {
  const colors = ["#1e88e5", "#ff5722", "#4caf50"];
  functions.forEach((fn, idx) => {
    ctx.strokeStyle = colors[idx % colors.length]; ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px < canvas.width; px++) {
      const m = toMath(px, origin.y);
      let y;
      try { y = fn.func(m.x); if (!isFinite(y)) throw ""; } catch { started = false; continue; }
      const p = toCanvas(m.x, y);
      if (!p || p.y < -500 || p.y > canvas.height + 500) { started = false; continue; }
      if (!started) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      started = true;
    }
    ctx.stroke();
    markIntercepts(fn);
  });
}

/* ===============================
   수정된 커서 정보 박스 (넘침 방지)
================================ */
function drawCursor() {
  if (mouse.x === null || functions.length === 0) return;
  const m = toMath(mouse.x, mouse.y);
  let cx = m.x;
  let cy = (cursorMode === "follow") ? functions[0].func(cx) : m.y;
  const p = toCanvas(cx, cy);
  if (!p) return;

  // 십자선 가이드
  ctx.setLineDash([4, 4]); ctx.strokeStyle = "#bbb";
  ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, canvas.height);
  ctx.moveTo(0, p.y); ctx.lineTo(canvas.width, p.y); ctx.stroke();
  ctx.setLineDash([]);

  // 박스 크기 동적 계산
  const lineH = 22; // 한 줄당 높이
  const boxPadding = 12;
  const numFunctions = functions.length;
  const linesPerFunc = (cursorMode === "follow") ? 4 : 3; // 함수명, X, Y + (Slope)
  
  const boxW = 260; // 넉넉한 너비
  const boxH = (numFunctions * linesPerFunc * lineH) + (boxPadding * 2);
  
  // 박스 위치 결정 (캔버스 경계 감지)
  let bx = p.x + 15;
  let by = p.y - boxH - 15;
  if (bx + boxW > canvas.width) bx = p.x - boxW - 15;
  if (by < 0) by = p.y + 15;
  if (by + boxH > canvas.height) by = canvas.height - boxH - 10;

  // 박스 배경 및 테두리 (빨간색 테두리)
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 2;
  ctx.fillRect(bx, by, boxW, boxH);
  ctx.strokeRect(bx, by, boxW, boxH);

  // 텍스트 출력
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  
  let currentY = by + boxPadding;

  functions.forEach((fn, i) => {
    const fy = (cursorMode === "follow") ? fn.func(cx) : cy;
    const isTrig = isTriFunction(fn);
    const xText = isTrig ? `${cx.toFixed(3)} rad` : cx.toFixed(3);
    
    // 1. 함수 제목
    ctx.fillStyle = "#ff0000";
    ctx.fillText(`[Function f${i+1}]`, bx + boxPadding, currentY);
    currentY += lineH;

    // 2. X값
    ctx.fillStyle = "#333";
    ctx.fillText(`X: ${xText}`, bx + boxPadding + 10, currentY);
    currentY += lineH;

    // 3. Y값
    ctx.fillText(`Y: ${fy.toFixed(4)}`, bx + boxPadding + 10, currentY);
    currentY += lineH;
    
    // 4. Slope (Follow 모드일 때만)
    if (cursorMode === "follow") {
      const slope = (fn.func(cx + 0.001) - fn.func(cx - 0.001)) / 0.002;
      ctx.fillText(`Slope: ${slope.toFixed(4)}`, bx + boxPadding + 10, currentY);
      currentY += lineH;
    }
    
    currentY += 5; // 함수 간 여백
  });

  // 하단 Analysis 섹션 업데이트
  const isTrig = isTriFunction(functions[0]);
  const deg = (cx * 180 / Math.PI).toFixed(2);
  analysisOutput.innerHTML = `<strong>Current:</strong> X=${cx.toFixed(4)}${isTrig ? ` (${deg}°)` : ""}, Y=${cy.toFixed(4)}`;
}

/* ===============================
   Events
================================ */
function render() { drawGrid(); plotFunctions(); drawCursor(); }

canvas.addEventListener("mousemove", e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
  mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
  render();
});

canvas.addEventListener("wheel", e => {
  e.preventDefault();
  scale *= e.deltaY < 0 ? 1.1 : 0.9;
  if (scale < 5) scale = 5;
  render();
});

plotBtn.addEventListener("click", () => {
  const exprs = functionInput.value.split(",").slice(0, 3);
  functions = exprs.filter(e => e.trim()).map(e => ({ expr: e.trim(), func: parseFunction(e.trim()) }));
  render();
});

presetButtons.forEach(btn => btn.addEventListener("click", () => { functionInput.value = btn.dataset.fn; plotBtn.click(); }));
modeInputs.forEach(r => r.addEventListener("change", e => { cursorMode = e.target.value; render(); }));
xScaleSelect.addEventListener("change", () => { axisScale.x = xScaleSelect.value; render(); });
yScaleSelect.addEventListener("change", () => { axisScale.y = yScaleSelect.value; render(); });

// 초기 렌더링
render();
