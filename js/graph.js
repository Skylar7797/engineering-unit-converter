const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

const plotBtn = document.getElementById("plotBtn");
const input = document.getElementById("functionInput");
const output = document.getElementById("analysisOutput");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

function clearCanvas() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function drawAxes() {
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1;

  // x-axis
  ctx.beginPath();
  ctx.moveTo(0, HEIGHT / 2);
  ctx.lineTo(WIDTH, HEIGHT / 2);
  ctx.stroke();

  // y-axis
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
}

function plotFunction(expr) {
  clearCanvas();
  drawAxes();

  let f;
  try {
    f = new Function("x", `return ${expr}`);
  } catch {
    output.textContent = "Invalid function expression.";
    return;
  }

  ctx.strokeStyle = "#1b2a6f";
  ctx.lineWidth = 2;
  ctx.beginPath();

  let first = true;
  for (let px = 0; px < WIDTH; px++) {
    const x = (px - WIDTH / 2) / 40;
    let y;

    try {
      y = f(x);
    } catch {
      continue;
    }

    const py = HEIGHT / 2 - y * 40;

    if (first) {
      ctx.moveTo(px, py);
      first = false;
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.stroke();
  output.textContent = "Function plotted successfully.";
}

plotBtn.addEventListener("click", () => {
  const expr = input.value.replace(/\^/g, "**");
  plotFunction(expr);
});
