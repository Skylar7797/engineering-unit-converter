/* ======================================================
   Graph Analytic Engine - Engineering Workbench
   ====================================================== */

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const input = document.getElementById("functionInput");
const plotBtn = document.getElementById("plotBtn");
const analysisOutput = document.getElementById("analysisOutput");

/* ======================
   Graph State
====================== */
let scale = 40;                 // px per unit
let origin = { x: 0, y: 0 };    // graph origin (0,0) in canvas coords
let func = null;
let points = [];

/* ======================
   Utilities
====================== */
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = 400;
  origin.x = canvas.width / 2;
  origin.y = canvas.height / 2;
}

window.addEventListener("resize", () => {
  resizeCanvas();
  draw();
});

/* ======================
   Coordinate Transform
====================== */
function toCanvas(x, y) {
  return {
    x: origin.x + x * scale,
    y: origin.y - y * scale
  };
}

function toMath(cx, cy) {
  return {
    x: (cx - origin.x) / scale,
    y: (origin.y - cy) / scale
  };
}

/* ======================
   Grid & Axes
====================== */
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const step = scale;
  ctx.strokeStyle = "#e1e6ef";
  ctx.lineWidth = 1;

  for (let x = origin.x % step; x < canvas.width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = origin.y % step; y < canvas.height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(0, origin.y);
  ctx.lineTo(canvas.width, origin.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, canvas.height);
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = "#222";
  ctx.font = "12px system-ui";
  ctx.fillText("x", canvas.width - 12, origin.y - 6);
  ctx.fillText("y", origin.x + 6, 12);

  drawGridNumbers();
}

function drawGridNumbers() {
  ctx.fillStyle = "#555";
  ctx.font = "11px system-ui";

  for (let i = -Math.floor(origin.x / scale); i < canvas.width / scale; i++) {
    if (i === 0) continue;
    const p = toCanvas(i, 0);
    ctx.fillText(i, p.x - 4, origin.y + 14);
  }

  for (let i = -Math.floor((canvas.height - origin.y) / scale); i < origin.y / scale; i++) {
    if (i === 0) continue;
    const p = toCanvas(0, i);
    ctx.fillText(i, origin.x + 6, p.y + 4);
  }
}

/* ======================
   Function Parsing
====================== */
function parseFunction(expr) {
  expr = expr.replace(/\^/g, "**");
  return new Function("x", `return ${expr}`);
}

/* ======================
   Plotting
====================== */
function computePoints() {
  points = [];
  for (let px = 0; px < canvas.width; px++) {
    const { x } = toMath(px, 0);
    let y;
    try {
      y = func(x);
      if (isFinite(y)) points.push({ x, y });
    } catch {}
  }
}

function drawFunction() {
  if (!points.length) return;

  ctx.strokeStyle = "#1a4fd8";
  ctx.lineWidth = 2;
  ctx.beginPath();

  points.forEach((p, i) => {
    const c = toCanvas(p.x, p.y);
    if (i === 0) ctx.moveTo(c.x, c.y);
    else ctx.lineTo(c.x, c.y);
  });

  ctx.stroke();
}

/* ======================
   Intercepts
====================== */
function drawIntercepts() {
  ctx.fillStyle = "#d7263d";

  points.forEach((p, i) => {
    if (i === 0) return;
    const prev = points[i - 1];

    // x-intercept
    if (p.y === 0 || (p.y * prev.y < 0)) {
      const x0 = p.x;
      const c = toCanvas(x0, 0);
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // y-intercept
  try {
    const y0 = func(0);
    const c = toCanvas(0, y0);
    ctx.beginPath();
    ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
    ctx.fill();
  } catch {}
}

/* ======================
   Cursor Tracking
====================== */
canvas.addEventListener("mousemove", e => {
  if (!func) return;
  draw();

  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const { x, y } = toMath(cx, cy);

  let dy;
  try {
    const h = 1e-4;
    dy = (func(x + h) - func(x - h)) / (2 * h);
  } catch {}

  const p = toCanvas(x, func(x));

  // marker
  ctx.fillStyle = "#ff7a00";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
  ctx.fill();

  // info box
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(cx + 10, cy + 10, 160, 60);

  ctx.fillStyle = "#fff";
  ctx.font = "12px system-ui";
  ctx.fillText(`x = ${x.toFixed(3)}`, cx + 16, cy + 28);
  ctx.fillText(`y = ${func(x).toFixed(3)}`, cx + 16, cy + 44);
  ctx.fillText(`dy/dx = ${dy?.toFixed(3)}`, cx + 16, cy + 60);
});

/* ======================
   Zoom (Wheel)
====================== */
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  scale *= e.deltaY < 0 ? 1.1 : 0.9;
  scale = Math.max(10, Math.min(scale, 200));
  draw();
});

/* ======================
   Analysis
====================== */
function analyze() {
  let min = Infinity, max = -Infinity;
  points.forEach(p => {
    min = Math.min(min, p.y);
    max = Math.max(max, p.y);
  });

  analysisOutput.innerHTML = `
    <strong>Domain:</strong> visible x-range<br>
    <strong>Range:</strong> [${min.toFixed(3)}, ${max.toFixed(3)}]<br>
    <strong>Scale:</strong> ${scale.toFixed(1)} px/unit
  `;
}

/* ======================
   Main Draw
====================== */
function draw() {
  drawGrid();
  if (func) {
    computePoints();
    drawFunction();
    drawIntercepts();
    analyze();
  }
}

/* ======================
   Events
====================== */
plotBtn.addEventListener("click", () => {
  try {
    func = parseFunction(input.value);
    draw();
  } catch {
    analysisOutput.textContent = "Invalid function expression.";
  }
});

/* ======================
   Init
====================== */
resizeCanvas();
draw();
