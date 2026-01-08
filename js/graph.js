/* ===============================
   Graph Analytic - Baseline
================================ */

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const plotBtn = document.getElementById("plotBtn");
const functionInput = document.getElementById("functionInput");
const analysisOutput = document.getElementById("analysisOutput");
const modeInputs = document.querySelectorAll('input[name="cursorMode"]');

const xScaleSel = document.getElementById("xScale");
const yScaleSel = document.getElementById("yScale");
const presetBtns = document.querySelectorAll(".preset");

/* ===============================
   State
================================ */
let functions = [];
let scale = 40;
let origin = { x: canvas.width / 2, y: canvas.height / 2 };
let mouse = { x: null, y: null };
let cursorMode = "follow";
const colors = ["#1e88e5", "#e53935", "#43a047"];

let axisScale = { x: "linear", y: "linear" };

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
   Axis Scale Extension
================================ */
function sx(x) {
  if (axisScale.x === "log") {
    if (x <= 0) return null;
    return Math.log10(x);
  }
  return x;
}

function sy(y) {
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
  const X = sx(x);
  const Y = sy(y);
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
   Grid (DENSITY EXTENDED)
================================ */
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#eef3fb";
  ctx.lineWidth = 1;

  for (let i = -50; i <= 50; i++) {
    const x = origin.x + i * scale / 2;
    const y = origin.y + i * scale / 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
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
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, canvas.height);
  ctx.stroke();
}

/* ===============================
   Plot (UNCHANGED CORE)
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
        if (!isFinite(y)) continue;
      } catch { continue; }

      const p = toCanvas(m.x, y);
      if (!p) continue;

      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  });
}

/* ===============================
   Cursor + Analysis (EXTENDED)
================================ */
function drawCursor() {
  if (!mouse.x) return;

  const m = toMath(mouse.x, mouse.y);
  let html = `<strong>Cursor</strong><br>x=${m.x.toFixed(4)}<br>`;

  functions.forEach((fn, i) => {
    let y;
    try { y = fn.func(m.x); }
    catch { return; }

    const dy =
      (fn.func(m.x + 1e-3) - fn.func(m.x - 1e-3)) / 2e-3;

    html += `
      <span style="color:${colors[i]}">
      f${i+1}(x)=${y.toFixed(4)}, slope=${dy.toFixed(4)}
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
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
  render();
});

canvas.addEventListener("wheel", e => {
  e.preventDefault();
  scale *= e.deltaY < 0 ? 1.1 : 0.9;
  render();
});

plotBtn.onclick = () => {
  const exprs = functionInput.value.split(",").slice(0, 3);
  functions = exprs.map(e => ({
    expr: e.trim(),
    func: parseFunction(e.trim())
  }));
  render();
};

presetBtns.forEach(b => {
  b.onclick = () => {
    functionInput.value = b.dataset.fn;
    plotBtn.click();
  };
});

modeInputs.forEach(r =>
  r.onchange = e => cursorMode = e.target.value
);

xScaleSel.onchange = () => {
  axisScale.x = xScaleSel.value;
  render();
};

yScaleSel.onchange = () => {
  axisScale.y = yScaleSel.value;
  render();
};

render();
