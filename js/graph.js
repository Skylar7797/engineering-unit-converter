const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

const input = document.getElementById("functionInput");
const plotBtn = document.getElementById("plotBtn");
const analysisOutput = document.getElementById("analysisOutput");

const xminInput = document.getElementById("xmin");
const xmaxInput = document.getElementById("xmax");

const SAFE_MATH = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log10,
  ln: Math.log,
  exp: Math.exp,
  sqrt: Math.sqrt,
  abs: Math.abs,
  pi: Math.PI,
  e: Math.E
};

function parseFunction(expr) {
  let safeExpr = expr
    .replace(/\^/g, "**")
    .replace(/([a-z]+)\(/gi, "SAFE_MATH.$1(");

  return new Function("x", "SAFE_MATH", `return ${safeExpr}`);
}

function sampleFunction(f, xmin, xmax, n = 800) {
  const data = [];
  const dx = (xmax - xmin) / n;

  for (let i = 0; i <= n; i++) {
    const x = xmin + i * dx;
    let y = NaN;
    try {
      y = f(x, SAFE_MATH);
    } catch {}
    data.push({ x, y });
  }
  return data;
}

function drawGraph(data) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const ys = data.map(p => p.y).filter(v => isFinite(v));
  const ymin = Math.min(...ys);
  const ymax = Math.max(...ys);

  const pad = 40;
  const scaleX = (canvas.width - 2 * pad) / (data[data.length - 1].x - data[0].x);
  const scaleY = (canvas.height - 2 * pad) / (ymax - ymin || 1);

  ctx.beginPath();
  ctx.strokeStyle = "#1f4fd8";
  ctx.lineWidth = 2;

  data.forEach((p, i) => {
    if (!isFinite(p.y)) return;
    const cx = pad + (p.x - data[0].x) * scaleX;
    const cy = canvas.height - pad - (p.y - ymin) * scaleY;
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });

  ctx.stroke();
}

function analyze(data) {
  let max = { y: -Infinity };
  let min = { y: Infinity };
  let zeros = [];

  for (let i = 1; i < data.length; i++) {
    const p = data[i];
    const prev = data[i - 1];

    if (!isFinite(p.y)) continue;

    if (p.y > max.y) max = p;
    if (p.y < min.y) min = p;

    if (prev.y * p.y < 0) {
      zeros.push(p.x.toFixed(3));
    }
  }

  let trend = data[0].y < data[data.length - 1].y
    ? "Overall increasing"
    : "Overall decreasing";

  return `
Max: ${max.y.toFixed(4)} at x = ${max.x.toFixed(4)}<br>
Min: ${min.y.toFixed(4)} at x = ${min.x.toFixed(4)}<br>
Zeros: ${zeros.length ? zeros.join(", ") : "None detected"}<br>
Trend: ${trend}
`;
}

plotBtn.addEventListener("click", () => {
  try {
    const f = parseFunction(input.value);
    const xmin = parseFloat(xminInput.value);
    const xmax = parseFloat(xmaxInput.value);

    const data = sampleFunction(f, xmin, xmax);
    drawGraph(data);
    analysisOutput.innerHTML = analyze(data);
  } catch (e) {
    analysisOutput.textContent = "Invalid function expression.";
  }
});
