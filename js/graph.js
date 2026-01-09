/* ==============================================
   Graph Analytic - Full Integrated Version
   (X-Axis / Y-Axis Parallel Analysis Included)
   =============================================== */

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const plotBtn = document.getElementById("plotBtn");
const saveImgBtn = document.getElementById("saveImgBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const functionInput = document.getElementById("functionInput");

// 분석 및 설정 컨트롤
const showXLine = document.getElementById("showXLine"); 
const showYLine = document.getElementById("showYLine");
const valCoord = document.getElementById("val-coord");

let functions = [];
let scale = 70; 
let origin = { x: canvas.width / 2, y: canvas.height / 2 };
let mouse = { x: null, y: null };
let cursorMode = "follow"; 
let targetFnIndex = 0; 
const colors = ["#1e88e5", "#ff5722", "#2e7d32"];

// 1. 수식 파싱 엔진
function parseFunction(expr) {
    if (!expr) return null;
    const safe = expr.trim()
        .replace(/\^/g, "**")
        .replace(/sin/g, "Math.sin").replace(/cos/g, "Math.cos").replace(/tan/g, "Math.tan")
        .replace(/exp/g, "Math.exp").replace(/log/g, "Math.log10").replace(/ln/g, "Math.log").replace(/π/g, "Math.PI");
    try { return new Function("x", `return ${safe}`); } catch { return null; }
}

const getUnitFactor = () => (functions.some(f => /sin|cos|tan/.test(f.expr)) ? Math.PI : 1);

const toCanvas = (x, y) => {
    const factor = getUnitFactor();
    return { x: origin.x + (x / factor) * scale, y: origin.y - y * scale };
};

const toMath = (x, y) => {
    const factor = getUnitFactor();
    return { x: ((x - origin.x) / scale) * factor, y: (origin.y - y) / scale };
};

// 수평선 분석용: 특정 Y값에 대응하는 X값 찾기 (수치 해석)
function findXforY(fn, targetY) {
    const startX = toMath(0, 0).x;
    const endX = toMath(canvas.width, 0).x;
    const steps = 400; 
    const stepSize = (endX - startX) / steps;
    
    let closestX = null;
    let minDiff = Infinity;

    for (let i = 0; i <= steps; i++) {
        const x = startX + i * stepSize;
        try {
            const y = fn.func(x);
            const diff = Math.abs(y - targetY);
            if (diff < minDiff) {
                minDiff = diff;
                closestX = x;
            }
        } catch(e) {}
    }
    // 오차 범위 내에 있을 때만 반환
    return minDiff < 0.5 ? closestX : null;
}

// 2. 배경 및 그리드 그리기
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const factor = getUnitFactor();
    const isTrig = factor !== 1;

    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1;
    for (let x = origin.x % scale; x < canvas.width; x += scale) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = origin.y % scale; y < canvas.height; y += scale) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, origin.y); ctx.lineTo(canvas.width, origin.y);
    ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, canvas.height);
    ctx.stroke();

    ctx.fillStyle = "#64748b"; ctx.font = "12px Arial";
    ctx.textAlign = "center";
    const nLeft = Math.floor(origin.x / scale), nRight = Math.floor((canvas.width - origin.x) / scale);
    for (let i = -nLeft; i <= nRight; i++) {
        if (i === 0) continue;
        let label = isTrig ? (i === 1 ? "π" : i === -1 ? "-π" : i + "π") : i;
        ctx.fillText(label, origin.x + i * scale, origin.y + 20);
    }
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    const nUp = Math.floor(origin.y / scale), nDown = Math.floor((canvas.height - origin.y) / scale);
    for (let i = -nUp; i <= nDown; i++) {
        if (i === 0) continue;
        ctx.fillText(i, origin.x - 10, origin.y - i * scale);
    }
}

// 3. 그래프 플로팅
function plotFunctions() {
    functions.forEach((fn, idx) => {
        ctx.strokeStyle = colors[idx];
        ctx.lineWidth = (idx === targetFnIndex && cursorMode === "follow") ? 4 : 2.5;
        ctx.beginPath();
        let started = false;
        for (let px = 0; px < canvas.width; px++) {
            const m = toMath(px, 0);
            try {
                const y = fn.func(m.x);
                const p = toCanvas(m.x, y);
                if (!isFinite(y) || p.y < -500 || p.y > canvas.height + 500) { started = false; continue; }
                if (!started) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
                started = true;
            } catch { started = false; }
        }
        ctx.stroke();
    });
}

// 4. 정보 박스 및 가이드라인 (요구하신 X/Y축 분석 반영)
function drawCursor() {
    if (mouse.x === null || functions.length === 0) return;
    
    const m = toMath(mouse.x, mouse.y);
    const activeFn = functions[targetFnIndex] || functions[0];
    let cx = m.x;
    let cy = (cursorMode === "follow") ? activeFn.func(cx) : m.y;
    const p = toCanvas(cx, cy);

    ctx.setLineDash([5, 5]); ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1;
    if (showYLine.checked) { // 수직선 (X고정)
        ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, canvas.height); ctx.stroke();
    }
    if (showXLine.checked) { // 수평선 (Y고정)
        ctx.beginPath(); ctx.moveTo(0, p.y); ctx.lineTo(canvas.width, p.y); ctx.stroke();
    }
    ctx.setLineDash([]);

    let displayLines = [];
    
    // Y축 평행선 분석 (동일 X값에 대한 각 함수의 Y값들)
    if (showYLine.checked) {
        displayLines.push({ text: `[Vertical: X = ${cx.toFixed(3)}]`, color: "#1e293b", isTitle: true });
        functions.forEach((fn, i) => {
            const vy = fn.func(cx);
            displayLines.push({ text: ` f${i+1} y: ${isFinite(vy) ? vy.toFixed(4) : "N/A"}`, color: colors[i] });
        });
        displayLines.push({ text: ` `, color: "#fff" });
    }

    // X축 평행선 분석 (동일 Y값에 대한 각 함수의 X값들)
    if (showXLine.checked) {
        displayLines.push({ text: `[Horizontal: Y = ${cy.toFixed(3)}]`, color: "#1e293b", isTitle: true });
        functions.forEach((fn, i) => {
            const vx = findXforY(fn, cy);
            displayLines.push({ text: ` f${i+1} x: ${vx !== null ? vx.toFixed(4) : "No Match"}`, color: colors[i] });
        });
    }

    // 아무 가이드도 없을 때 기본 정보
    if (!showXLine.checked && !showYLine.checked) {
        displayLines.push({ text: `Cursor Info`, color: "#333", isTitle: true });
        displayLines.push({ text: `X: ${cx.toFixed(4)}`, color: "#333" });
        displayLines.push({ text: `Y: ${cy.toFixed(4)}`, color: "#333" });
    }

    renderInfoBox(p.x, p.y, displayLines);
    if(valCoord) valCoord.innerText = `(${cx.toFixed(3)}, ${cy.toFixed(3)})`;
}

function renderInfoBox(px, py, lines) {
    ctx.font = "bold 12px Courier New";
    const padding = 12; const lineH = 16;
    let maxW = 160;
    lines.forEach(l => { const w = ctx.measureText(l.text).width; if (w > maxW) maxW = w; });

    const boxW = maxW + (padding * 2);
    const boxH = (lines.length * lineH) + (padding * 2);

    let bx = px + 15; let by = py - boxH - 15;
    if (bx + boxW > canvas.width) bx = px - boxW - 15;
    if (by < 0) by = py + 15;

    ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
    ctx.strokeStyle = (cursorMode === "follow") ? colors[targetFnIndex] : "#64748b";
    ctx.lineWidth = 2;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeRect(bx, by, boxW, boxH);

    ctx.textAlign = "left"; ctx.textBaseline = "top";
    lines.forEach((line, i) => {
        ctx.fillStyle = line.color;
        ctx.font = line.isTitle ? "bold 12px Arial" : "12px Courier New";
        ctx.fillText(line.text, bx + padding, by + padding + (i * lineH));
    });
}

function render() { drawGrid(); plotFunctions(); drawCursor(); }

// 5. 이벤트 리스너 통합 (누락 기능 복구)
canvas.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
    mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    render();
});

canvas.addEventListener("mousedown", e => {
    if (cursorMode !== "follow" || functions.length === 0) return;
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (canvas.width / r.width);
    const my = (e.clientY - r.top) * (canvas.height / r.height);
    const m = toMath(mx, my);
    let bestIdx = targetFnIndex; let minD = 0.5;
    functions.forEach((fn, i) => {
        const d = Math.abs(fn.func(m.x) - m.y);
        if (d < minD) { minD = d; bestIdx = i; }
    });
    targetFnIndex = bestIdx; render();
});

plotBtn.addEventListener("click", () => {
    const exprs = functionInput.value.split(",").slice(0, 3);
    functions = exprs.filter(e => e.trim()).map(e => ({ expr: e.trim(), func: parseFunction(e) })).filter(f => f.func);
    targetFnIndex = 0;
    render();
});

// 프리셋 버튼 로직 복구
document.querySelectorAll(".preset").forEach(btn => {
    btn.addEventListener("click", () => {
        functionInput.value = btn.dataset.fn;
        plotBtn.click();
    });
});

// 이미지 저장 로직 복구
saveImgBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "graph_analysis.png";
    link.href = canvas.toDataURL();
    link.click();
});

// CSV 수출 로직 복구
exportCsvBtn.addEventListener("click", () => {
    if(!functions.length) return;
    let csv = "X," + functions.map((_,i)=>`f${i+1}`).join(",") + "\n";
    for(let x=-10; x<=10; x+=0.5) {
        csv += `${x.toFixed(2)},` + functions.map(f=>f.func(x).toFixed(4)).join(",") + "\n";
    }
    const blob = new Blob([csv], {type: "text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.csv";
    a.click();
});

document.querySelectorAll('input[name="cursorMode"]').forEach(r => {
    r.addEventListener("change", e => { cursorMode = e.target.value; render(); });
});

[showXLine, showYLine].forEach(el => el.addEventListener("change", render));

render();
