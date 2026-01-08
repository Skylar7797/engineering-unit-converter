const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

const input = document.getElementById("functionInput");
const plotBtn = document.getElementById("plotBtn");
const analysisOutput = document.getElementById("analysisOutput");
const xminInput = document.getElementById("xmin");
const xmaxInput = document.getElementById("xmax");

let functions = [];
let graphData = [];
let scaleMode = "linear"; // linear | logy

const SAFE_MATH = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  log: Math.log10, ln: Math.log,
  exp: Math.exp, sqrt: Math.sqrt,
  abs: Math.abs, pi: Math.PI, e: Math.E
};

function parseFunction(expr) {
  let safe = expr
    .replace(/\^/g, "**")
    .replace(/([a-z]+)\(/gi, "SAFE_MATH.$1(");
  return new Function("x", "SAFE_MATH", `return ${safe}`);
}

function sample(f, xmin, xmax, n = 1500) {
  const dx = (xmax - xmin) / n;
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = xmin + i * dx;
    let y = NaN;
    try { y = f(x, SAFE_MATH); } catch {}
    return { x, y };
  });
}

function drawAxes(xmin, xmax, ymin, ymax, pad) {
  ctx.strokeStyle = "#999";
  ctx.lineWidth = 1;

  const zeroX = pad + (-xmin) * (canvas.width - 2 * pad) / (xmax - xmin);
  const zeroY = canvas.height - pad - (-ymin) * (canvas.height - 2 * pad) / (ymax - ymin);

  ctx.beginPath();
  if (zeroX > pad && zeroX < canvas.width - pad) {
    ctx.moveTo(zeroX, pad);
    ctx.lineTo(zeroX, canvas.height - pad);
  }
  if (zeroY > pad && zeroY < canvas.height - pad) {
    ctx.moveTo(pad, zeroY);
    ctx.lineTo(canvas.width - pad, zeroY);
  }
  ctx.stroke();
}

function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const pad = 50;
  const xmin = +xminInput.value;
  const xmax = +xmaxInput.value;

  let ys = [];
  graphData.forEach(d =>
    d.forEach(p => isFinite(p.y) && ys.push(p.y))
  );

  let ymin = Math.min(...ys);
  let ymax = Math.max(...ys);

  if (scaleMode === "logy") {
    ymin = Math.max(1e-6, ymin);
  }

  drawAxes(xmin, xmax, ymin, ymax, pad);

  graphData.forEach((data, idx) => {
    ctx.beginPath();
    ctx.strokeStyle = ["#1f4fd8", "#d81f1f", "#1fd85f"][idx % 3];
    ctx.lineWidth = 2;

    data.forEach((p, i) => {
      if (!isFinite(p.y)) return;
      let yVal = scaleMode === "logy" ? Math.log10(p.y) : p.y;

      const cx = pad + (p.x - xmin) * (canvas.width - 2 * pad) / (xmax - xmin);
      const cy = canvas.height - pad -
        (yVal - ymin) * (canvas.height - 2 * pad) / (ymax - ymin);

      i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
    });

    ctx.stroke();

    // Zero-crossing markers
    data.forEach((p, i) => {
      if (i > 0 && p.y * data[i - 1].y < 0) {
        const cx = pad + (p.x - xmin) * (canvas.width - 2 * pad) / (xmax - xmin);
        const cy = canvas.height - pad -
          (-ymin) * (canvas.height - 2 * pad) / (ymax - ymin);
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  });
}

function analyze(data) {
  let max = { y: -Infinity }, min = { y: Infinity };
  let zeros = [];

  for (let i = 1; i < data.length - 1; i++) {
    const p = data[i];
    if (!isFinite(p.y)) continue;

    if (p.y > max.y) max = p;
    if (p.y < min.y) min = p;

    if (data[i - 1].y * p.y < 0) zeros.push(p.x.toFixed(3));
  }

  return `
Max: ${max.y.toFixed(4)} @ x=${max.x.toFixed(4)}<br>
Min: ${min.y.toFixed(4)} @ x=${min.x.toFixed(4)}<br>
Zero crossings: ${zeros.length ? zeros.join(", ") : "None"}
`;
}

plotBtn.addEventListener("click", () => {
  try {
    functions = input.value.split(";").map(f => parseFunction(f.trim()));
    graphData = functions.map(f =>
      sample(f, +xminInput.value, +xmaxInput.value)
    );
    drawGraph();
    analysisOutput.innerHTML = analyze(graphData[0]);
  } catch {
    analysisOutput.textContent = "Invalid function input.";
  }
});

/* === 클릭 위치에서 접선 기울기 표시 === */
canvas.addEventListener("click", e => {
  if (!graphData.length) return;

  const rect = canvas.getBoundingClientRect();
  const xRatio = (e.clientX - rect.left - 50) /
    (canvas.width - 100);
  const xVal = +xminInput.value +
    xRatio * (+xmaxInput.value - +xminInput.value);

  const data = graphData[0];
  const idx = data.findIndex(p => p.x > xVal);
  if (idx <= 0) return;

  const slope = (data[idx].y - data[idx - 1].y) /
                (data[idx].x - data[idx - 1].x);

  analysisOutput.innerHTML += `<br>Tangent slope at x=${xVal.toFixed(3)} ≈ ${slope.toFixed(4)}`;
});

/* === CSV Export === */
window.exportCSV = function () {
  let csv = "x,y\n";
  graphData[0].forEach(p => csv += `${p.x},${p.y}\n`);
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "graph_data.csv";
  a.click();
};

/* === Log scale toggle === */
window.toggleLogY = function () {
  scaleMode = scaleMode === "linear" ? "logy" : "linear";
  drawGraph();
};
