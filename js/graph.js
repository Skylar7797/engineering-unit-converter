/* ===============================
   Graph Analytic - Final
================================ */

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const plotBtn = document.getElementById("plotBtn");
const functionInput = document.getElementById("functionInput");
const analysisOutput = document.getElementById("analysisOutput");
const modeInputs = document.querySelectorAll('input[name="cursorMode"]');

/* ===============================
   State
================================ */
let functions = [];
let scale = 40;
let origin = { x: canvas.width / 2, y: canvas.height / 2 };
let mouse = { x: null, y: null };
let cursorMode = "follow";
const colors = ["#1e88e5", "#e53935", "#43a047"];

/* ===============================
   Math Parser
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
   Coordinate Conversion
================================ */
const toCanvas = (x, y) => ({
  x: origin.x + x * scale,
  y: origin.y - y * scale
});

const toMath = (x, y) => ({
  x: (x - origin.x) / scale,
  y: (origin.y - y) / scale
});

/* ===============================
   Grid & Axes
================================ */
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#dbe3f0";
  ctx.lineWidth = 1;

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

  ctx.fillStyle = "#000";
  ctx.font = "12px system-ui";
  ctx.fillText("x", canvas.width - 12, origin.y - 6);
  ctx.fillText("y", origin.x + 6, 12);

  ctx.fillStyle = "#555";
  for (let i = -10; i <= 10; i++) {
    if (i === 0) continue;
    ctx.fillText(i, origin.x + i * scale + 2, origin.y + 12);
    ctx.fillText(i, origin.x + 4, origin.y - i * scale - 2);
  }
}

/* ===============================
   Plot
================================ */
function plotFunctions() {
  functions.forEach((fn, i) => {
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = 2;
    ctx.beginPath();

    let started = false;

    for (let px = 0; px < canvas.width; px++) {
      const x = (px - origin.x) / scale;
      let y;

      try {
        y = fn.func(x);
        if (!isFinite(y)) throw "";
      } catch {
        started = false;
        continue;
      }

      const p = toCanvas(x, y);
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
   Intercepts
================================ */
function markIntercepts(fn) {
  ctx.fillStyle = "#000";

  for (let x = -20; x <= 20; x += 0.02) {
    const y1 = fn.func(x);
    const y2 = fn.func(x + 0.02);
    if (y1 * y2 < 0) {
      const p = toCanvas(x, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const y0 = fn.func(0);
  if (isFinite(y0)) {
    const p = toCanvas(0, y0);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ===============================
   Cursor Info
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

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#000";
  ctx.fillRect(p.x + 10, p.y - 32, 170, 26);
  ctx.strokeRect(p.x + 10, p.y - 32, 170, 26);

  ctx.fillStyle = "#000";
  ctx.font = "12px system-ui";
  ctx.fillText(
    `x=${cx.toFixed(3)}, y=${cy.toFixed(3)}`,
    p.x + 14,
    p.y - 14
  );
}

/* ===============================
   Analysis
================================ */
function analyze() {
  let html = "";

  functions.forEach((fn, i) => {
    let y0 = fn.func(0);
    let roots = 0;

    for (let x = -20; x <= 20; x += 0.05) {
      if (fn.func(x) * fn.func(x + 0.05) < 0) roots++;
    }

    html += `
      <strong style="color:${colors[i]}">Function ${i + 1}</strong><br>
      Expression: ${fn.expr}<br>
      y-intercept: ${isFinite(y0) ? y0.toFixed(3) : "N/A"}<br>
      x-intercepts: ${roots > 0 ? "present" : "none"}<br>
      <br>
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
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
  render();
});

canvas.addEventListener("mouseleave", () => {
  mouse.x = mouse.y = null;
  render();
});

canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.1 : 0.9;
  scale *= factor;
  render();
});

plotBtn.addEventListener("click", () => {
  const exprs = functionInput.value.split(",").slice(0, 3);
  functions = exprs.map((e, i) => ({
    expr: e.trim(),
    func: parseFunction(e.trim())
  }));
  analyze();
  render();
});

modeInputs.forEach(radio => {
  radio.addEventListener("change", e => {
    cursorMode = e.target.value;
    render();
  });
});

/* ===============================
   Init
================================ */
render();
