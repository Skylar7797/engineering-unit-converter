/* ===============================
   Graph Analytic Engine
   Engineering Workbench
================================ */

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const analysisOutput = document.getElementById("analysisOutput");
const plotBtn = document.getElementById("plotBtn");
const functionInput = document.getElementById("functionInput");

/* ===============================
   State
================================ */
let functions = [];
let scale = 40;              // px per unit
let origin = { x: canvas.width / 2, y: canvas.height / 2 };
let mouse = { x: null, y: null };
const colors = ["#1e88e5", "#e53935", "#43a047"];

/* ===============================
   Math Parsing
================================ */
function parseFunction(expr) {
  const sanitized = expr
    .replace(/\^/g, "**")
    .replace(/sin/g, "Math.sin")
    .replace(/cos/g, "Math.cos")
    .replace(/tan/g, "Math.tan")
    .replace(/log/g, "Math.log10")
    .replace(/ln/g, "Math.log")
    .replace(/exp/g, "Math.exp")
    .replace(/π/g, "Math.PI");

  return new Function("x", `return ${sanitized}`);
}

/* ===============================
   Coordinate Conversion
================================ */
function toCanvas(x, y) {
  return {
    x: origin.x + x * scale,
    y: origin.y - y * scale
  };
}

function toMath(x, y) {
  return {
    x: (x - origin.x) / scale,
    y: (origin.y - y) / scale
  };
}

/* ===============================
   Grid & Axes
================================ */
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#dbe3f0";
  ctx.lineWidth = 1;

  for (let x = origin.x % scale; x <= canvas.width; x += scale) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = origin.y % scale; y <= canvas.height; y += scale) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = "#000";
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
  ctx.fillStyle = "#000";
  ctx.font = "12px system-ui";
  ctx.fillText("x", canvas.width - 12, origin.y - 6);
  ctx.fillText("y", origin.x + 6, 12);

  // Scale numbers
  ctx.fillStyle = "#555";
  for (let i = 1; i < 20; i++) {
    ctx.fillText(i, origin.x + i * scale + 2, origin.y + 12);
    ctx.fillText(-i, origin.x - i * scale + 2, origin.y + 12);
    ctx.fillText(i, origin.x + 4, origin.y - i * scale - 2);
    ctx.fillText(-i, origin.x + 4, origin.y + i * scale - 2);
  }
}

/* ===============================
   Plot Functions
================================ */
function plotFunctions() {
  functions.forEach((fn, index) => {
    ctx.strokeStyle = colors[index];
    ctx.lineWidth = 2;
    ctx.beginPath();

    let prevValid = false;

    for (let px = 0; px < canvas.width; px++) {
      const x = (px - origin.x) / scale;
      let y;

      try {
        y = fn.func(x);
        if (!isFinite(y)) throw "Invalid";
      } catch {
        prevValid = false;
        continue;
      }

      const p = toCanvas(x, y);
      if (!prevValid) {
        ctx.moveTo(p.x, p.y);
        prevValid = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }

    ctx.stroke();

    // Intercepts
    markIntercepts(fn);
  });
}

/* ===============================
   Intercepts
================================ */
function markIntercepts(fn) {
  ctx.fillStyle = "#000";

  for (let x = -10; x <= 10; x += 0.01) {
    let y1 = fn.func(x);
    let y2 = fn.func(x + 0.01);
    if (y1 === undefined || y2 === undefined) continue;

    if (y1 * y2 < 0) {
      const p = toCanvas(x, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  try {
    const y0 = fn.func(0);
    if (isFinite(y0)) {
      const p = toCanvas(0, y0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } catch {}
}

/* ===============================
   Cursor & Tooltip
================================ */
function drawCursorInfo() {
  if (mouse.x === null) return;

  const m = toMath(mouse.x, mouse.y);
  const fn = functions[0];
  if (!fn) return;

  let y;
  try {
    y = fn.func(m.x);
  } catch {
    return;
  }

  const p = toCanvas(m.x, y);

  // Point
  ctx.fillStyle = "#ff5722";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
  ctx.fill();

  // Crosshair
  ctx.strokeStyle = "#aaa";
  ctx.beginPath();
  ctx.moveTo(p.x, 0);
  ctx.lineTo(p.x, canvas.height);
  ctx.moveTo(0, p.y);
  ctx.lineTo(canvas.width, p.y);
  ctx.stroke();

  // Tooltip
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;

  const text = `x=${m.x.toFixed(3)}, y=${y.toFixed(3)}`;
  ctx.fillRect(p.x + 10, p.y - 30, 140, 22);
  ctx.strokeRect(p.x + 10, p.y - 30, 140, 22);
  ctx.fillStyle = "#000";
  ctx.fillText(text, p.x + 14, p.y - 14);
}

/* ===============================
   Analysis
================================ */
function analyze() {
  let html = "";
  functions.forEach((fn, i) => {
    html += `Function ${i + 1}: <strong>${fn.expr}</strong><br>`;
    html += `• Domain: ℝ (approx)<br>`;
    html += `• Intercepts: visualized on graph<br><br>`;
  });
  analysisOutput.innerHTML = html;
}

/* ===============================
   Render
================================ */
function render() {
  drawGrid();
  plotFunctions();
  drawCursorInfo();
}

/* ===============================
   Events
================================ */
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  render();
});

canvas.addEventListener("mouseleave", () => {
  mouse.x = mouse.y = null;
  render();
});

plotBtn.addEventListener("click", () => {
  const exprs = functionInput.value.split(",").slice(0, 3);
  functions = exprs.map((e, i) => ({
    expr: e.trim(),
    func: parseFunction(e.trim()),
    color: colors[i]
  }));
  analyze();
  render();
});

window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") scale *= 1.1;
  if (e.key === "ArrowDown") scale /= 1.1;
  render();
});

/* ===============================
   Init
================================ */
render();
