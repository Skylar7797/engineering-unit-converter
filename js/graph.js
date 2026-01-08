/* ===============================
   Graph Analytic - Final (Corrected)
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
let scale = 60; // 기본 확대 정도
let origin = { x: canvas.width / 2, y: canvas.height / 2 };
let mouse = { x: null, y: null };
let cursorMode = "follow";
const colors = ["#1e88e5", "#e53935", "#43a047"];
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
    .replace(/log/g, "Math.log10")
    .replace(/ln/g, "Math.log")
    .replace(/exp/g, "Math.exp")
    .replace(/π/g, "Math.PI");
  return new Function("x", `return ${safe}`);
}

/* ===============================
   Axis Transform
================================ */
function tx(x) {
  if (axisScale.x === "log") return x <= 0 ? null : Math.log10(x);
  return x;
}
function ty(y) {
  if (axisScale.y === "log") return y <= 0 ? null : Math.log10(y);
  return y;
}

/* ===============================
   Coordinate Conversion
================================ */
const toCanvas = (x, y) => {
  const X = tx(x);
  const Y = ty(y);
  if (X === null || Y === null) return null;
  return { x: origin.x + X * scale, y: origin.y - Y * scale };
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
   Grid & Axes
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

  // axis labels
  ctx.fillStyle = "#000";
  ctx.font = "12px system-ui";

  // X-axis
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const nLeft = Math.floor(origin.x / scale);
  const nRight = Math.floor((canvas.width - origin.x) / scale);
  for (let i = -nLeft; i <= nRight; i++) {
    if (i === 0) continue;
    const xPos = origin.x + i * scale;
    let label = i;

    if (functions.some(f => /sin|cos/.test(f.expr))) {
      label = (i / 2 === 1) ? "π/2" :
              (i / 2 === 2) ? "π" :
              (i / 2 === 3) ? "3π/2" :
              (i / 2 === 4) ? "2π" :
              (i / 2 === -1) ? "-π/2" :
              (i / 2 === -2) ? "-π" :
              (i / 2 === -3) ? "-3π/2" :
              (i / 2 === -4) ? "-2π" :
              (i / 2) + "π";
    }

    ctx.fillText(label, xPos, origin.y + 4);
  }

  // Y-axis
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const nUp = Math.floor(origin.y / scale);
  const nDown = Math.floor((canvas.height - origin.y) / scale);
  for (let i = -nUp; i <= nDown; i++) {
    if (i === 0) continue;
    const yPos = origin.y - i * scale;
    ctx.fillText(i, origin.x - 4, yPos);
  }

  // axis names
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("x", canvas.width - 12, origin.y + 4);
  ctx.fillText("y", origin.x + 4, 2);
}

/* ===============================
   Plot Functions
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
      if (!started) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
      started = true;
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
   Cursor & Info Box
================================ */
function drawCursor() {
  if (!mouse.x) return;

  const m = toMath(mouse.x, mouse.y);
  let cx = m.x;
  let cy = m.y;

  if (cursorMode === "follow" && functions[0]) {
    try {
      cy = functions[0].func(cx);
    } catch {}
  }

  const p = toCanvas(cx, cy);
  if (!p) return;

  // crosshair
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p.x, 0);
  ctx.lineTo(p.x, canvas.height);
  ctx.moveTo(0, p.y);
  ctx.lineTo(canvas.width, p.y);
  ctx.stroke();

  // point
  ctx.fillStyle = "#ff5722";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
  ctx.fill();

  // floating info box
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  const boxX = p.x + 12;
  const boxY = p.y - 48;
  const boxW = 190;
  const boxH = 42 + functions.length * 14;
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  ctx.fillStyle = "#000";
  ctx.font = "12px system-ui";
  let textY = boxY + 14;
  ctx.fillText(`x = ${cx.toFixed(4)}`, boxX + 8, textY);
  textY += 14;

  functions.forEach((fn, i) => {
    try {
      const fy = cursorMode === "follow" ? fn.func(cx) : cy;
      let slope = NaN;
      if (cursorMode === "follow") {
        slope = (fn.func(cx + 1e-4) - fn.func(cx - 1e-4)) / 2e-4;
      }
      ctx.fillStyle = colors[i];
      ctx.fillText(
        `f${i + 1}(x)=${fy.toFixed(4)}${cursorMode === "follow" ? ", dy/dx=" + slope.toFixed(4) : ""}`,
        boxX + 8,
        textY
      );
      textY += 14;
    } catch {}
  });

  // HTML panel update
  let html = `<strong>Cursor</strong><br>x=${cx.toFixed(4)}<br>`;
  functions.forEach((fn, i) => {
    try {
      const fy = cursorMode === "follow" ? fn.func(cx) : cy;
      let slope = NaN;
      if (cursorMode === "follow") slope = (fn.func(cx + 1e-3) - fn.func(cx - 1e-3)) / 2e-3;
      html += `<span style="color:${colors[i]}">f${i + 1}(x)=${fy.toFixed(
        4
      )}${cursorMode === "follow" ? ", slope=" + slope.toFixed(4) : ""}</span><br>`;
    } catch {}
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
  scale *= e.deltaY < 0 ? 1.1 : 0.9;
  render();
});
plotBtn.addEventListener("click", () => {
  const exprs = functionInput.value.split(",").slice(0, 3);
  functions = exprs.map(e => ({ expr: e.trim(), func: parseFunction(e.trim()) }));
  render();
});
modeInputs.forEach(radio => {
  radio.addEventListener("change", e => {
    cursorMode = e.target.value;
    render();
  });
});
xScaleSelect.addEventListener("change", () => { axisScale.x = xScaleSelect.value; render(); });
yScaleSelect.addEventListener("change", () => { axisScale.y = yScaleSelect.value; render(); });
presetButtons.forEach(btn => {
  btn.addEventListener("click", () => { functionInput.value = btn.dataset.fn; plotBtn.click(); });
});

/* ===============================
   Init
================================ */
render();
