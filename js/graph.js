/* ===============================
   Graph Analytic - Final (Extended)
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
   State (BASELINE 유지)
================================ */
let functions = [];
let scale = 40;
let origin = { x: canvas.width / 2, y: canvas.height / 2 };
let mouse = { x: null, y: null };
let cursorMode = "follow";
const colors = ["#1e88e5", "#e53935", "#43a047"];

/* ===============================
   Axis Scale State (ADDED)
================================ */
let axisScale = {
  x: "linear",
  y: "linear"
};

/* ===============================
   Math Parser (UNCHANGED)
================================ */
function parseFunction(expr) {
  const safe = expr
    .replace(/\^/g, "**")
    .replace(/sin/g, "Math.sin")
    .replace(/cos/g, "Math.cos")
    .replace(/tan/g, "Math.tan")
    .replace(/log/g, "Math.log10")
    .replace(/ln/g, "Math.log")
    .replace(/exp/g, "Math.exp")
    .replace(/π/g, "Math.PI");

  return new Function("x", `return ${safe}`);
}

/* ===============================
   Axis Transform (ADDED)
================================ */
function tx(x) {
  if (axisScale.x === "log") {
    if (x <= 0) return null;
    return Math.log10(x);
  }
  return x;
}

function ty(y) {
  if (axisScale.y === "log") {
    if (y <= 0) return null;
    return Math.log10(y);
  }
  return y;
}

/* ===============================
   Coordinate Conversion (EXTENDED)
================================ */
const toCanvas = (x, y) => {
  const X = tx(x);
  const Y = ty(y);
  if (X === null || Y === null) return null;

  return {
    x: origin.x + X * scale,
    y: origin.y - Y * scale
  };
};

const toMath = (x, y) => {
  const mx = (x - origin.x) / scale;
  const my = (origin.y - y) / scale;

  return {
    x: axisScale.x === "log" ? Math.pow(10, mx) : mx,
    y: axisScale.y === "log" ? Math.pow(10, my) : my
  };
};

/* ===============================
   Grid & Axes (DENSITY EXTENDED)
================================ */
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // minor grid
  ctx.strokeStyle = "#edf2fa";
  ctx.lineWidth = 1;

  const minor = scale / 2;
  for (let x = origin.x % minor; x < canvas.width; x += minor) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = origin.y % minor; y < canvas.height; y += minor) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // major grid
  ctx.strokeStyle = "#dbe3f0";
  ctx.lineWidth = 1.2;

  for (let x = origin.x % scale; x < canvas.width; x += scale) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = origin.y % scale; y < canvas.height; y += scale) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // axes
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, origin.y);
  ctx.lineTo(canvas.width, origin.y);
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, canvas.height);
  ctx.stroke();
}

/* ===============================
   Plot (BASELINE 유지 + scale 적용)
================================ */
function plotFunctions() {
  functions.forEach((fn, i) => {
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = 2;
    ctx.beginPath();

    let started = false;

    for (let px = 0; px < canvas.width; px++) {
      const m = toMath(px, origin.y);
      let y;

      try {
        y = fn.func(m.x);
        if (!isFinite(y)) throw "";
      } catch {
        started = false;
        continue;
      }

      const p = toCanvas(m.x, y);
      if (!p) {
        started = false;
        continue;
      }

      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }

    ctx.stroke();
    markIntercepts(fn);
  });
}

/* ===============================
   Intercepts (BASELINE 유지)
================================ */
function markIntercepts(fn) {
  ctx.fillStyle = "#000";

  for (let x = -20; x <= 20; x += 0.05) {
    try {
      const y1 = fn.func(x);
      const y2 = fn.func(x + 0.05);
      if (y1 * y2 < 0) {
        const p = toCanvas(x, 0);
        if (!p) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } catch {}
  }
}

/* ===============================
   Cursor Info (EXTENDED ANALYSIS)
================================ */
function drawCursor() {
  if (!mouse.x) return;

  const m = toMath(mouse.x, mouse.y);
  let cx = m.x;
  let cy = m.y;

  if (cursorMode === "follow" && functions[0]) {
    try {
      cy = functions[0].func(cx);
    } catch {
      return;
    }
  }

  const p = toCanvas(cx, cy);
  if (!p) return;

  ctx.strokeStyle = "#aaa";
  ctx.beginPath();
  ctx.moveTo(p.x, 0);
  ctx.lineTo(p.x, canvas.height);
  ctx.moveTo(0, p.y);
  ctx.lineTo(canvas.width, p.y);
  ctx.stroke();

  ctx.fillStyle = "#ff5722";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
  ctx.fill();

  // realtime analysis
  let html = `<strong>Cursor</strong><br>x=${cx.toFixed(4)}<br>`;

  functions.forEach((fn, i) => {
    let y, slope;
    try {
      y = fn.func(cx);
      slope =
        (fn.func(cx + 1e-3) - fn.func(cx - 1e-3)) / 2e-3;
    } catch {
      return;
    }

    html += `
      <span style="color:${colors[i]}">
      f${i + 1}(x)=${y.toFixed(4)}, slope=${slope.toFixed(4)}
      </span><br>
    `;
  });

  html += `<em>Scale: ${scale.toFixed(1)} px/unit</em>`;
  analysisOutput.innerHTML = html;
}

/* ===============================
   Render
================================ */
function render() {
  drawGrid();
  plotFunctions();
  drawCursor();
}

/* ===============================
   Events
================================ */
canvas.addEventListener("mousemove", e => {
  const r = canvas.getBoundingClientRect();
  mouse.x =
