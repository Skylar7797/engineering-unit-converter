const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

const input = document.getElementById("functionInput");
const plotBtn = document.getElementById("plotBtn");
const analysisOutput = document.getElementById("analysisOutput");

const PAD = 50;
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
function sample(f, n = 2000) {
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
}

/* ===============================
   Drawing
================================ */
function drawAxes() {
  ctx.strokeStyle = "#999";
  ctx.lineWidth = 1;

  // Y-axis (x = 0)
  if (xmin < 0 && xmax > 0) {
    const cx = xToCanvas(0);
    ctx.beginPath();
    ctx.moveTo(cx, PAD);
    ctx.lineTo(cx, canvas.height - PAD);
    ctx.stroke();
  }

  // X-axis (y = 0)
  if (ymin < 0 && ymax > 0) {
    const cy = yToCanvas(0);
    ctx.beginPath();
    ctx.moveTo(PAD, cy);
    ctx.lineTo(canvas.width - PAD, cy);
    ctx.stroke();
  }
}

function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAxes();

  ctx.strokeStyle = "#1b2a6f";
  ctx.lineWidth = 2;
  ctx.beginPath();

  data.forEach((p, i) => {
    if (!isFinite(p.y)) return;
    const cx = xToCanvas(p.x);
    const cy = yToCanvas(p.y);
    i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
  });
  ctx.stroke();

  // Zero crossings
  ctx.fillStyle = "#000";
  for (let i = 1; i < data.length; i++) {
    if (data[i - 1].y * data[i].y < 0) {
      const cx = xToCanvas(data[i].x);
      const cy = yToCanvas(0);
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* ===============================
   Analysis
================================ */
function analyze() {
  let max = { y: -Infinity }, min = { y: Infinity };
  let zeros = [];

  for (let i = 1; i < data.length; i++) {
    const p = data[i];
    if (!isFinite(p.y)) continue;

    if (p.y > max.y) max = p;
    if (p.y < min.y) min = p;
    if (data[i - 1].y * p.y < 0) zeros.push(p.x.toFixed(4));
  }

  analysisOutput.innerHTML = `
    Max: ${max.y.toFixed(4)} @ x=${max.x.toFixed(4)}<br>
    Min: ${min.y.toFixed(4)} @ x=${min.x.toFixed(4)}<br>
    Zero crossings: ${zeros.join(", ") || "None"}
  `;
}

/* ===============================
   Tooltip (Hover Info)
================================ */
canvas.addEventListener("mousemove", e => {
  if (!data.length) return;

  drawGraph();

  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const x = canvasToX(cx);

  const idx = data.findIndex(p => p.x > x);
  if (idx <= 0) return;

  const p1 = data[idx - 1];
  const p2 = data[idx];
  if (!isFinite(p1.y) || !isFinite(p2.y)) return;

  const slope = (p2.y - p1.y) / (p2.x - p1.x);
  const cy = yToCanvas(p1.y);

  // Marker
  ctx.fillStyle = "#d32f2f";
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();

  // Info box
  const text = [
    `x = ${x.toFixed(4)}`,
    `y = ${p1.y.toFixed(4)}`,
    `dy/dx ≈ ${slope.toFixed(4)}`
  ];

  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(cx + 10, cy - 50, 160, 48);

  ctx.fillStyle = "#fff";
  ctx.font = "12px system-ui";
  text.forEach((t, i) =>
    ctx.fillText(t, cx + 16, cy - 32 + i * 14)
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
    analyze();
  } catch {
    analysisOutput.textContent = "Invalid function.";
  }
});
