/* ===============================
   Graph Analytic - Tri Functions Fixed (Rad/Deg & Info Box)
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
let scale = 60; // px per unit
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
    .replace(/cot/g, "x=>1/Math.tan(x)")
    .replace(/sec/g, "x=>1/Math.cos(x)")
    .replace(/csc/g, "x=>1/Math.sin(x)")
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
   Detect Tri Functions
================================ */
function isTriFunction(fn) {
  return /sin|cos|tan|cot|sec|csc/.test(fn.expr);
}

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

  // axis labels
  ctx.fillStyle = "#000"; ctx.font = "12px system-ui";
  ctx.textAlign = "center"; ctx.textBaseline = "top";

  const nLeft = Math.floor(origin.x / scale);
  const nRight = Math.floor((canvas.width - origin.x) / scale);
  for (let i = -nLeft; i <= nRight; i++) {
    if (i === 0) continue;
    const xPos = origin.x + i * scale;
    let label = i;
    if (functions.some(isTriFunction)) {
      const pi = Math.PI;
      const val = i * 1; // 단위 scaling
      if (val === 0) label = "0";
      else if (val === 0.5) label = "π/2";
      else if (val === 1) label = "π";
      else if (val === 1.5) label = "3π/2";
      else if (val === 2) label = "2π";
      else label = `${val}π`;
    }
    ctx.fillText(label, xPos, origin.y + 4);
  }

  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  const nUp = Math.floor(origin.y / scale);
  const nDown = Math.floor((canvas.height - origin.y) / scale);
  for (let i = -nUp; i <= nDown; i++) {
    if (i === 0) continue;
    const yPos = origin.y - i * scale;
    ctx.fillText(i, origin.x - 4, yPos);
  }

  ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillText("x", canvas.width - 12, origin.y + 4);
  ctx.fillText("y", origin.x + 4, 2);
}

/* ===============================
   Plot Functions
================================ */
function plotFunctions() {
  functions.forEach((fn, i) => {
    ctx.strokeStyle = "#1e88e5"; // 항상 하늘 파랑
    ctx.lineWidth = 2; ctx.beginPath();
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
    ctx.stroke(); markIntercepts(fn);
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
        const p = toCanvas(x, 0); if (!p) continue;
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
      }
    } catch {}
  }
}

/* ===============================
   Cursor & Info Box
================================ */
function drawCursor() {
  if (!mouse.x) return;
  let m = toMath(mouse.x, mouse.y); let cx = m.x; let cy = m.y;
  if (cursorMode === "follow" && functions[0]) { try { cy = functions[0].func(cx); } catch {} }
  const p = toCanvas(cx, cy); if (!p) return;

  // crosshair
  ctx.strokeStyle = "#aaa"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, canvas.height);
  ctx.moveTo(0, p.y); ctx.lineTo(canvas.width, p.y); ctx.stroke();

  // point
  ctx.fillStyle = "#ff5722"; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI*2); ctx.fill();

  // floating info box
  const boxX = p.x + 12; const boxY = p.y - 48; const boxW = 220; const boxH = 50 + functions.length*18;
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#000"; ctx.lineWidth = 1;
  ctx.fillRect(boxX, boxY, boxW, boxH); ctx.strokeRect(boxX, boxY, boxW, boxH);

  let textY = boxY + 14;
  const boxColors = ["#39ff14","#ff073a","#1e90ff"]; // green/red/blue
  functions.forEach((fn,i)=>{
    try{
      const fy = cursorMode==="follow"?fn.func(cx):cy;
      let slope = cursorMode==="follow"? (fn.func(cx+1e-4)-fn.func(cx-1e-4))/2e-4 : NaN;
      let xDisplay = isTriFunction(fn)? `${cx.toFixed(4)} rad / ${(cx*180/Math.PI).toFixed(2)}°` : cx.toFixed(4);
      ctx.fillStyle = boxColors[i]; ctx.fillText(`f${i+1}: x=${xDisplay}, y=${fy.toFixed(4)}${cursorMode==="follow"? ", dy/dx=" + slope.toFixed(4):""}`, boxX+8,textY);
      textY += 18;
    }catch{}
  });

  // HTML panel
  let html = `<strong>Cursor</strong><br>`;
  functions.forEach((fn,i)=>{
    try{
      const fy = cursorMode==="follow"?fn.func(cx):cy;
      let slope = cursorMode==="follow"? (fn.func(cx+1e-3)-fn.func(cx-1e-3))/2e-3 : NaN;
      let xDisplay = isTriFunction(fn)? `${cx.toFixed(4)} rad / ${(cx*180/Math.PI).toFixed(2)}°` : cx.toFixed(4);
      html+= `<span style="color:${boxColors[i]}">f${i+1}: x=${xDisplay}, y=${fy.toFixed(4)}${cursorMode==="follow"? ", dy/dx=" + slope.toFixed(4):""}</span><br>`;
    }catch{}
  });
  html+= `<em>Scale: ${scale.toFixed(1)} px/unit</em>`; analysisOutput.innerHTML = html;
}

/* ===============================
   Render
================================ */
function render() { drawGrid(); plotFunctions(); drawCursor(); }

/* ===============================
   Events
================================ */
canvas.addEventListener("mousemove",e=>{ const r=canvas.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; render(); });
canvas.addEventListener("mouseleave",()=>{ mouse.x=mouse.y=null; render(); });
canvas.addEventListener("wheel", e=>{ e.preventDefault(); scale*=e.deltaY<0?1.1:0.9; render(); });
plotBtn.addEventListener("click",()=>{
  const exprs=functionInput.value.split(",").slice(0,3);
  functions=exprs.map(e=>({expr:e.trim(),func:parseFunction(e.trim())})); render();
});
modeInputs.forEach(r=>{ r.addEventListener("change", e=>{ cursorMode=e.target.value; render(); }); });
xScaleSelect.addEventListener("change",()=>{ axisScale.x=xScaleSelect.value; render(); });
yScaleSelect.addEventListener("change",()=>{ axisScale.y=yScaleSelect.value; render(); });
presetButtons.forEach(btn=>{ btn.addEventListener("click",()=>{ functionInput.value=btn.dataset.fn; plotBtn.click(); }); });

/* ===============================
   Init
================================ */
render();
