const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

const input = document.getElementById("functionInput");
const plotBtn = document.getElementById("plotBtn");
const analysisOutput = document.getElementById("analysisOutput");

const PAD = 60;
let xmin = -10, xmax = 10;
let ymin, ymax;

let func = null;
let data = [];

const SAFE_MATH = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  log: Math.log10, ln: Math.log,
  exp: Math.exp, sqrt: Math.sqrt,
  abs: Math.abs, pi: Math.PI, e: Math.E
};

/* ===============================
   Coordinate Transform
================================ */
function xToCanvas(x) {
  return PAD + (x - xmin) * (canvas.width - 2 * PAD) / (xmax - xmin);
}
function yToCanvas(y) {
  return canvas.height - PAD -
    (y - ymin) * (canvas.height - 2 * PAD) / (ymax - ymin);
}
function canvasToX(cx) {
  return xmin + (cx - PAD) * (xmax - xmin) / (canvas.width - 2 * PAD);
}
function canvasToY(cy) {
  return ymin + (canvas.height - PAD - cy) * (ymax - ymin) / (canvas.height - 2 * PAD);
}

/* ===============================
   Function Parsing
================================ */
function parseFunction(expr) {
  let safe = expr
    .replace(/\^/g, "**")
    .replace(/([a-z]+)\(/gi, "SAFE_MATH.$1(");
  return new Function("x", "SAFE_MATH", `return ${safe}`);
}

/* ===============================
   Sampling
================================ */
function sample(f, n = 3000) {
  const dx = (xmax - xmin) / n;
  data = [];
  for (let i = 0; i <= n; i++) {
    const x = xmin + i * dx;
    let y = NaN;
    try { y = f(x, SAFE_MATH); } catch {}
    data.push({ x, y });
  }

  const ys = data.filter(p => isFinite(p.y)).map(p => p.y);
  ymin = Math.min(...ys);
  ymax = Math.max(...ys);

  const margin = (ymax - ymin) * 0.1;
  ymin -= margin;
  ymax += margin;
}

/* ===============================
   Grid & Axes
================================ */
function drawGrid() {
  ctx.strokeStyle = "#dde3f0";
  ctx.lineWidth = 1;

  const xStep = (xmax - xmin) / 10;
  const yStep = (ymax - ymin) / 10;

  for (let i = 0; i <= 10; i++) {
    const x = xmin + i * xStep;
    const cx = xToCanvas(x);
    ctx.beginPath();
    ctx.moveTo(cx, PAD);
    ctx.lineTo(cx, canvas.height - PAD);
    ctx.stroke();
  }

  for (let i = 0; i <= 10; i++) {
    const y = ymin + i * yStep;
    const cy = yToCanvas(y);
    ctx.beginPath();
    ctx.moveTo(PAD, cy);
    ctx.lineTo(canvas.width - PAD, cy);
    ctx.stroke();
  }
}

function drawAxes() {
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1.5;

  // Y-axis
  if (xmin < 0 && xmax > 0) {
    const cx = xToCanvas(0);
    ctx.beginPath();
    ctx.moveTo(cx, PAD);
    ctx.lineTo(cx, canvas.height - PAD);
    ctx.stroke();
  }

  // X-axis
  if (ymin < 0 && ymax > 0) {
    const cy = yToCanvas(0);
    ctx.beginPath();
    ctx.moveTo(PAD, cy);
    ctx.lineTo(canvas.width - PAD, cy);
    ctx.stroke();
  }

  // Axis labels
  ctx.fillStyle = "#222";
  ctx.font = "13px system-ui";
  ctx.fillText("x", canvas.width - PAD + 10, yToCanvas(0) + 4);
  ctx.fillText("y", xToCanvas(0) - 10, PAD - 10);
}

/* ===============================
   Graph
================================ */
function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawAxes();

  ctx.strokeStyle = "#1b2a6f";
  ctx.lineWidth = 2;
  ctx.beginPath();

  let first = true;
  data.forEach(p => {
    if (!isFinite(p.y)) {
      first = true;
      return;
    }
    const cx = xToCanvas(p.x);
    const cy = yToCanvas(p.y);
    if (first) {
      ctx.moveTo(cx, cy);
      first = false;
    } else {
      ctx.lineTo(cx, cy);
    }
  });
  ctx.stroke();

  drawIntercepts();
}

/* ===============================
   Intercepts
================================ */
function drawIntercepts() {
  ctx.fillStyle = "#d32f2f";
  ctx.font = "12px system-ui";

  for (let i = 1; i < data.length; i++) {
    const p1 = data[i - 1];
    const p2 = data[i];
    if (p1.y * p2.y < 0) {
      const x0 = p2.x;
      const cx = xToCanvas(x0);
      const cy = yToCanvas(0);
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`(${x0.toFixed(2)}, 0)`, cx + 6, cy - 6);
    }
  }

  if (xmin < 0 && xmax > 0) {
    const y0 = func(0, SAFE_MATH);
    if (isFinite(y0)) {
      const cx = xToCanvas(0);
      const cy = yToCanvas(y0);
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`(0, ${y0.toFixed(2)})`, cx + 6, cy - 6);
    }
  }
}

/* ===============================
   Hover Tooltip (Exact Match)
================================ */
canvas.addEventListener("mousemove", e => {
  if (!data.length) return;

  drawGraph();

  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  if (cx < PAD || cx > canvas.width - PAD) return;
  if (cy < PAD || cy > canvas.height - PAD) return;

  const x = canvasToX(cx);
  const y = func(x, SAFE_MATH);

  if (!isFinite(y)) return;

  const px = xToCanvas(x);
  const py = yToCanvas(y);

  const dx = 1e-4;
  const slope = (func(x + dx, SAFE_MATH) - func(x - dx, SAFE_MATH)) / (2 * dx);

  // Marker
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fill();

  // Tooltip
  const lines = [
    `x = ${x.toFixed(4)}`,
    `y = ${y.toFixed(4)}`,
    `dy/dx ≈ ${slope.toFixed(4)}`
  ];

  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(px + 10, py - 55, 160, 50);

  ctx.fillStyle = "#fff";
  ctx.font = "12px system-ui";
  lines.forEach((t, i) =>
    ctx.fillText(t, px + 16, py - 36 + i * 14)
  );
});

/* ===============================
   Plot Trigger
================================ */
plotBtn.addEventListener("click", () => {
  try {
    func = parseFunction(input.value.trim());
    sample(func);
    drawGraph();
    analysisOutput.textContent = "Hover over the graph to inspect values.";
  } catch {
    analysisOutput.textContent = "Invalid function.";
  }
});
