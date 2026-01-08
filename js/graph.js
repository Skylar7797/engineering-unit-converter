const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

const plotBtn = document.getElementById("plotBtn");
const output = document.getElementById("analysisOutput");

function parseFunction(expr) {
  const safeExpr = expr
    .replace(/sin/g, "Math.sin")
    .replace(/cos/g, "Math.cos")
    .replace(/tan/g, "Math.tan")
    .replace(/log/g, "Math.log10")
    .replace(/ln/g, "Math.log")
    .replace(/exp/g, "Math.exp")
    .replace(/sqrt/g, "Math.sqrt")
    .replace(/pi/g, "Math.PI");

  return new Function("x", `return ${safeExpr}`);
}

function drawAxes(xmin, xmax, ymin, ymax) {
  ctx.strokeStyle = "#bbb";
  ctx.lineWidth = 1;

  const x0 = (-xmin / (xmax - xmin)) * canvas.width;
  const y0 = (ymax / (ymax - ymin)) * canvas.height;

  ctx.beginPath();
  ctx.moveTo(0, y0);
  ctx.lineTo(canvas.width, y0);
  ctx.moveTo(x0, 0);
  ctx.lineTo(x0, canvas.height);
  ctx.stroke();
}

plotBtn.onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const expr = document.getElementById("funcInput").value;
  const xmin = parseFloat(document.getElementById("xmin").value);
  const xmax = parseFloat(document.getElementById("xmax").value);

  let f;
  try {
    f = parseFunction(expr);
  } catch {
    output.textContent = "Invalid function expression.";
    return;
  }

  const samples = 1000;
  const dx = (xmax - xmin) / samples;
  let points = [];

  let ymin = Infinity;
  let ymax = -Infinity;
  let minVal = Infinity;
  let maxVal = -Infinity;
  let minX = 0;
  let maxX = 0;

  for (let i = 0; i <= samples; i++) {
    const x = xmin + i * dx;
    let y;
    try {
      y = f(x);
    } catch {
      continue;
    }

    if (!isFinite(y)) continue;

    points.push({ x, y });
    if (y < ymin) ymin = y;
    if (y > ymax) ymax = y;

    if (y < minVal) {
      minVal = y;
      minX = x;
    }
    if (y > maxVal) {
      maxVal = y;
      maxX = x;
    }
  }

  drawAxes(xmin, xmax, ymin, ymax);

  ctx.strokeStyle = "#1b2a6f";
  ctx.lineWidth = 2;
  ctx.beginPath();

  points.forEach((p, i) => {
    const px = ((p.x - xmin) / (xmax - xmin)) * canvas.width;
    const py = ((ymax - p.y) / (ymax - ymin)) * canvas.height;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });

  ctx.stroke();

  output.innerHTML = `
    Max: ${maxVal.toFixed(4)} at x = ${maxX.toFixed(4)}<br/>
    Min: ${minVal.toFixed(4)} at x = ${minX.toFixed(4)}
  `;
};
