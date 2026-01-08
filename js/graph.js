/* ===============================
   Graph Analytic - Final Precision Version
================================ */

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const plotBtn = document.getElementById("plotBtn");
const saveImgBtn = document.getElementById("saveImgBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const functionInput = document.getElementById("functionInput");
const dataTableBody = document.querySelector("#dataTable tbody");

// 분석 수치 필드
const valCoord = document.getElementById("val-coord");
const valSlope = document.getElementById("val-slope");
const valUnit = document.getElementById("val-unit");
const valAxis = document.getElementById("val-axis");

/* State */
let functions = [];
let scale = 70; 
let origin = { x: canvas.width / 2, y: canvas.height / 2 };
let mouse = { x: null, y: null };
let cursorMode = "follow";
let axisScale = { x: "linear", y: "linear" };
const colors = ["#1e88e5", "#ff5722", "#2e7d32"]; // Blue, Orange, Green

/* Math Parser */
function parseFunction(expr) {
  const safe = expr.trim()
    .replace(/\^/g, "**")
    .replace(/sin/g, "Math.sin").replace(/cos/g, "Math.cos").replace(/tan/g, "Math.tan")
    .replace(/exp/g, "Math.exp").replace(/log/g, "Math.log10").replace(/ln/g, "Math.log").replace(/π/g, "Math.PI");
  try { return new Function("x", `return ${safe}`); } catch { return null; }
}

const isTriFunction = (fn) => fn && /sin|cos|tan/.test(fn.expr);
const getUnitFactor = () => (functions.some(isTriFunction) ? Math.PI : 1);

/* Coordinate Mapping */
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

/* Rendering Grid */
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

  ctx.fillStyle = "#333"; ctx.font = "12px Arial"; ctx.textAlign = "center";
  const nLeft = Math.floor(origin.x / scale), nRight = Math.floor((canvas.width - origin.x) / scale);
  for (let i = -nLeft; i <= nRight; i++) {
    if (i === 0) continue;
    let label = isTrig ? (i === 1 ? "π" : i === -1 ? "-π" : i + "π") : i;
    ctx.fillText(label, origin.x + i * scale, origin.y + 18);
  }
}

/* Plotting Functions */
function plotFunctions() {
  functions.forEach((fn, idx) => {
    ctx.strokeStyle = colors[idx]; ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px < canvas.width; px++) {
      const m = toMath(px, origin.y);
      let y;
      try { y = fn.func(m.x); if (!isFinite(y)) throw ""; } catch { started = false; continue; }
      const p = toCanvas(m.x, y);
      if (!p || p.y < -1000 || p.y > canvas.height + 1000) { started = false; continue; }
      if (!started) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      started = true;
    }
    ctx.stroke();
  });
}

/* Cursor with Multi-Function Info (Overflow Safe) */
function drawCursor() {
  if (mouse.x === null || functions.length === 0) return;
  const m = toMath(mouse.x, mouse.y);
  const cx = m.x;
  
  // Follow 모드 기준값 (첫 번째 함수)
  let cy = (cursorMode === "follow") ? functions[0].func(cx) : m.y;
  const p = toCanvas(cx, cy);
  if (!p) return;

  // 가이드라인
  ctx.setLineDash([4, 4]); ctx.strokeStyle = "#bbb";
  ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, canvas.height);
  ctx.moveTo(0, p.y); ctx.lineTo(canvas.width, p.y); ctx.stroke();
  ctx.setLineDash([]);

  // 박스 크기 동적 계산
  const lineH = 22; const padding = 12;
  const boxW = 260;
  const boxH = (functions.length * (cursorMode === "follow" ? 4 : 3) * lineH) + (padding * 2);
  
  let bx = p.x + 15, by = p.y - boxH - 15;
  if (bx + boxW > canvas.width) bx = p.x - boxW - 15;
  if (by < 0) by = p.y + 15;
  if (by + boxH > canvas.height) by = canvas.height - boxH - 5;

  ctx.fillStyle = "rgba(255, 255, 255, 0.95)"; ctx.strokeStyle = "#ff0000"; ctx.lineWidth = 2;
  ctx.fillRect(bx, by, boxW, boxH); ctx.strokeRect(bx, by, boxW, boxH);

  ctx.font = "bold 13px Arial"; ctx.textBaseline = "top";
  let ty = by + padding;

  functions.forEach((fn, i) => {
    const fy = fn.func(cx);
    ctx.fillStyle = colors[i];
    ctx.fillText(`[f${i+1}] ${fn.expr}`, bx + padding, ty); ty += lineH;
    ctx.fillStyle = "#333";
    ctx.fillText(` X: ${cx.toFixed(3)}`, bx + padding + 10, ty); ty += lineH;
    ctx.fillText(` Y: ${isFinite(fy) ? fy.toFixed(4) : "NaN"}`, bx + padding + 10, ty); ty += lineH;
    if (cursorMode === "follow") {
        const slope = (fn.func(cx + 0.001) - fn.func(cx - 0.001)) / 0.002;
        ctx.fillText(` Slope: ${slope.toFixed(4)}`, bx + padding + 10, ty); ty += lineH;
    }
    ty += 5;
  });

  // Analysis 카드 업데이트 (f1 기준)
  const f1y = functions[0].func(cx);
  valCoord.innerText = `(${cx.toFixed(3)}, ${f1y.toFixed(3)})`;
  valUnit.innerText = `${(cx * 180 / Math.PI).toFixed(2)}° (deg)`;
  const s = (functions[0].func(cx+0.001) - functions[0].func(cx-0.001)) / 0.002;
  valSlope.innerText = s.toFixed(4);
}

/* 데이터 테이블 업데이트 */
function updateDataTable() {
  dataTableBody.innerHTML = "";
  const startX = toMath(0, 0).x;
  const endX = toMath(canvas.width, 0).x;
  const step = (endX - startX) / 15; // 15개 샘플

  for (let i = 0; i <= 15; i++) {
    const x = startX + (step * i);
    const row = document.createElement("tr");
    let cols = `<td>${x.toFixed(3)}</td>`;
    functions.forEach(fn => {
        const y = fn.func(x);
        cols += `<td>${isFinite(y) ? y.toFixed(4) : "-"}</td>`;
    });
    // 빈 칸 채우기
    for(let j=functions.length; j<3; j++) cols += `<td>-</td>`;
    row.innerHTML = cols;
    dataTableBody.appendChild(row);
  }
}

/* 이미지 및 CSV 저장 */
function saveImage() {
  const link = document.createElement("a");
  link.download = "engineering_graph.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function exportCSV() {
    let csv = "X Value," + functions.map((_,i) => `f${i+1}_Y`).join(",") + "\n";
    const startX = -10, endX = 10, step = 0.5; // 고정 범위 샘플링
    for(let x=startX; x<=endX; x+=step) {
        csv += `${x.toFixed(2)},` + functions.map(fn => fn.func(x).toFixed(4)).join(",") + "\n";
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'graph_data.csv'; a.click();
}

/* Events */
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
  functions = exprs.filter(e => e.trim()).map(e => ({ expr: e.trim(), func: parseFunction(e) })).filter(f => f.func);
  updateDataTable();
  render();
});

document.querySelectorAll(".preset").forEach(btn => btn.addEventListener("click", () => { functionInput.value = btn.dataset.fn; plotBtn.click(); }));
xScaleSelect.addEventListener("change", () => { axisScale.x = xScaleSelect.value; valAxis.innerText = `X:${axisScale.x} / Y:${axisScale.y}`; render(); });
yScaleSelect.addEventListener("change", () => { axisScale.y = yScaleSelect.value; valAxis.innerText = `X:${axisScale.x} / Y:${axisScale.y}`; render(); });
saveImgBtn.addEventListener("click", saveImage);
exportCsvBtn.addEventListener("click", exportCSV);

render();
