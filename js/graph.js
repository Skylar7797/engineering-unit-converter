/* ===============================
   Graph Analytic - Full Restored Version
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
let scale = 60; 
let origin = { x: canvas.width / 2, y: canvas.height / 2 };
let mouse = { x: null, y: null };
let cursorMode = "follow";
const boxColors = ["#1e88e5", "#e53935", "#43a047"]; // f1, f2, f3 색상
let axisScale = { x: "linear", y: "linear" };

/* ===============================
   Math Parser (Restored)
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
    .replace(/log/g, "Math.log10")
    .replace(/ln/g, "Math.log")
    .replace(/exp/g, "Math.exp")
    .replace(/π/g, "Math.PI");
  return new Function("x", `return ${safe}`);
}

function isTriFunction(fn) {
  return /sin|cos|tan|cot|sec|csc/.test(fn.expr);
}

// 핵심 수정: 삼각함수 여부에 따른 단위 배수
const getUnitFactor = () => (functions.some(isTriFunction) ? Math.PI : 1);

/* ===============================
   Coordinate Conversion (PI Fixed)
================================ */
function tx(x) { if (axisScale.x === "log") return x <= 0 ? null : Math.log10(x); return x; }
function ty(y) { if (axisScale.y === "log") return y <= 0 ? null : Math.log10(y); return y; }

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
   Grid & Axes (Restored Minor Grid)
================================ */
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const factor = getUnitFactor();
  const isTrig = factor !== 1;

  // minor grid
  ctx.strokeStyle = "#edf2fa"; ctx.lineWidth = 1;
  const minor = scale / 2;
  for (let x = origin.x % minor; x < canvas.width; x += minor) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = origin.y % minor; y < canvas.height; y += minor) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // major grid
  ctx.strokeStyle = "#dbe3f0"; ctx.lineWidth = 1.2;
  for (let x = origin.x % scale; x < canvas.width; x += scale) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = origin.y % scale; y < canvas.height; y += scale) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // axes
  ctx.strokeStyle = "#000"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, origin.y); ctx.lineTo(canvas.width, origin.y);
  ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, canvas.height);
  ctx.stroke();

  // labels
  ctx.fillStyle = "#000"; ctx.font = "12px system-ui";
  ctx.textAlign = "center";
  const nLeft = Math.floor(origin.x / scale);
  const nRight = Math.floor((canvas.width - origin.x) / scale);
  for (let i = -nLeft; i <= nRight; i++) {
    if (i === 0) continue;
    let label = isTrig ? (i === 1 ? "π" : i === -1 ? "-π" : i + "π") : i;
    ctx.fillText(label, origin.x + i * scale, origin.y + 16);
  }
}

/* ===============================
   Plot & Intercepts (Restored)
================================ */
function markIntercepts(fn) {
  ctx.fillStyle = "#000";
  const factor = getUnitFactor();
  // 넉넉한 범위 탐색
  for (let x = -20 * factor; x <= 20 * factor; x += 0.05 * factor) {
    try {
      const y1 = fn.func(x); const y2 = fn.func(x + 0.05 * factor);
      if (y1 * y2 < 0) {
        const p = toCanvas(x, 0); if (p) { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill(); }
      }
    } catch {}
  }
}

function plotFunctions() {
  functions.forEach((fn, idx) => {
    ctx.strokeStyle = boxColors[idx % 3]; ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px < canvas.width; px++) {
      const m = toMath(px, origin.y);
      let y;
      try { y = fn.func(m.x); if (!isFinite(y)) throw ""; } catch { started = false; continue; }
      const p = toCanvas(m.x, y);
      if (!p) { started = false; continue; }
      if (!started) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      started = true;
    }
    ctx.stroke();
    markIntercepts(fn);
  });
}

/* ===============================
   Cursor & Info Box (Full Restored)
================================ */
function drawCursor() {
  if (mouse.x === null) return;
  const m = toMath(mouse.x, mouse.y);
  let cx = m.x; let cy = m.y;
  
  if (cursorMode === "follow" && functions[0]) {
    try { cy = functions[0].func(cx); } catch {}
  }
  
  const p = toCanvas(cx, cy); if (!p) return;

  // Crosshair
  ctx.setLineDash([4, 4]); ctx.strokeStyle = "#aaa";
  ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, canvas.height);
  ctx.moveTo(0, p.y); ctx.lineTo(canvas.width, p.y); ctx.stroke();
  ctx.setLineDash([]);

  // Point
  ctx.fillStyle = "#ff5722"; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI*2); ctx.fill();

  // Floating Info Box on Canvas
  const boxW = 220; const boxH = 40 + functions.length * 20;
  let bx = p.x + 10; let by = p.y - boxH - 10;
  if (bx + boxW > canvas.width) bx = p.x - boxW - 10;
  if (by < 0) by = p.y + 10;

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)"; ctx.strokeStyle = "#333";
  ctx.fillRect(bx, by, boxW, boxH); ctx.strokeRect(bx, by, boxW, boxH);

  ctx.fillStyle = "#000"; ctx.textAlign = "left"; ctx.font = "11px monospace";
  let tyOffset = by + 15;
  
  functions.forEach((fn, i) => {
    const fy = cursorMode === "follow" ? fn.func(cx) : cy;
    const slope = (fn.func(cx + 0.0001) - fn.func(cx - 0.0001)) / 0.0002;
    const xDisp = isTriFunction(fn) ? `${cx.toFixed(2)}rad` : cx.toFixed(2);
    ctx.fillStyle = boxColors[i % 3];
    ctx.fillText(`f${i+1}: x=${xDisp}, y=${fy.toFixed(3)}`, bx+8, tyOffset);
    if(cursorMode === "follow") ctx.fillText(`    dy/dx=${slope.toFixed(3)}`, bx+8, tyOffset + 12);
    tyOffset += 22;
  });

  // HTML Analysis Panel
  let html = `<strong>Cursor Analysis</strong><br>`;
  functions.forEach((fn, i) => {
    const fy = cursorMode === "follow" ? fn.func(cx) : cy;
    const isTrig = isTriFunction(fn);
    const xText = isTrig ? `${cx.toFixed(4)} rad / ${(cx*180/Math.PI).toFixed(2)}°` : cx.toFixed(4);
    html += `<span style="color:${boxColors[i%3]}">f${i+1}: x=${xText}, y=${fy.toFixed(4)}</span><br>`;
  });
  analysisOutput.innerHTML = html;
}

/* ===============================
   Render & Events
================================ */
function render() { drawGrid(); plotFunctions(); drawCursor(); }

canvas.addEventListener("mousemove", e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  render();
});

canvas.addEventListener("mouseleave", () => { mouse.x = null; render(); });
canvas.addEventListener("wheel", e => { e.preventDefault(); scale *= e.deltaY < 0 ? 1.1 : 0.9; render(); });

plotBtn.addEventListener("click", () => {
  const exprs = functionInput.value.split(",").slice(0, 3);
  functions = exprs.filter(e => e.trim() !== "").map(e => ({ expr: e.trim(), func: parseFunction(e.trim()) }));
  render();
});

modeInputs.forEach(r => r.addEventListener("change", e => { cursorMode = e.target.value; render(); }));
xScaleSelect.addEventListener("change", () => { axisScale.x = xScaleSelect.value; render(); });
yScaleSelect.addEventListener("change", () => { axisScale.y = yScaleSelect.value; render(); });
presetButtons.forEach(btn => btn.addEventListener("click", () => { functionInput.value = btn.dataset.fn; plotBtn.click(); }));

render();
