/* ==============================================
   Graph Analytic - Integrated Professional Version
   =============================================== */

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const plotBtn = document.getElementById("plotBtn");
const saveImgBtn = document.getElementById("saveImgBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const functionInput = document.getElementById("functionInput");

// 가이드라인 및 모드 컨트롤
const showXLine = document.getElementById("showXLine");
const showYLine = document.getElementById("showYLine");
const valCoord = document.getElementById("val-coord");

let functions = [];
let scale = 70; 
let origin = { x: canvas.width / 2, y: canvas.height / 2 };
let mouse = { x: null, y: null };
let cursorMode = "follow"; 
let targetFnIndex = 0; // 클릭으로 선택된 추적 대상 함수
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

const isTriFunction = (fn) => fn && /sin|cos|tan/.test(fn.expr);
const getUnitFactor = () => (functions.some(isTriFunction) ? Math.PI : 1);

const toCanvas = (x, y) => {
    const factor = getUnitFactor();
    return { x: origin.x + (x / factor) * scale, y: origin.y - y * scale };
};

const toMath = (x, y) => {
    const factor = getUnitFactor();
    return { x: ((x - origin.x) / scale) * factor, y: (origin.y - y) / scale };
};

// 2. 배경 그리드 렌더링
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const factor = getUnitFactor();
    const isTrig = factor !== 1;

    ctx.strokeStyle = "#e2e8f0"; 
    ctx.lineWidth = 1;
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

// 3. 함수 그래프 렌더링
function plotFunctions() {
    functions.forEach((fn, idx) => {
        ctx.strokeStyle = colors[idx]; ctx.lineWidth = (idx === targetFnIndex && cursorMode === "follow") ? 4 : 2.5;
        ctx.beginPath();
        let started = false;
        for (let px = 0; px < canvas.width; px++) {
            const m = toMath(px, 0);
            let y;
            try { y = fn.func(m.x); if (!isFinite(y)) throw ""; } catch { started = false; continue; }
            const p = toCanvas(m.x, y);
            if (!p || p.y < -500 || p.y > canvas.height + 500) { started = false; continue; }
            if (!started) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
            started = true;
        }
        ctx.stroke();
    });
}

// 4. 커서 및 정보 박스 (핵심 수정)
function drawCursor() {
    if (mouse.x === null || functions.length === 0) return;
    
    const m = toMath(mouse.x, mouse.y);
    const activeFn = functions[targetFnIndex] || functions[0];
    
    let cx = m.x;
    let cy = (cursorMode === "follow") ? activeFn.func(cx) : m.y;
    const p = toCanvas(cx, cy);

    // 가이드라인 그리기
    ctx.setLineDash([5, 5]); ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1;
    if (showYLine.checked) { // 수직선 (X고정)
        ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, canvas.height); ctx.stroke();
    }
    if (showXLine.checked) { // 수평선 (Y고정)
        ctx.beginPath(); ctx.moveTo(0, p.y); ctx.lineTo(canvas.width, p.y); ctx.stroke();
    }
    ctx.setLineDash([]);

    // 정보 데이터 구성
    let displayLines = [];
    if (cursorMode === "follow") {
        const fy = activeFn.func(cx);
        const slope = (activeFn.func(cx + 0.001) - activeFn.func(cx - 0.001)) / 0.002;
        displayLines = [
            { text: `[Focus: f${targetFnIndex + 1}]`, color: colors[targetFnIndex], isTitle: true },
            { text: ` X: ${cx.toFixed(4)}`, color: "#333" },
            { text: ` Y: ${isFinite(fy) ? fy.toFixed(4) : "NaN"}`, color: "#333" },
            { text: ` Slope: ${slope.toFixed(4)}`, color: "#666" }
        ];
    } else {
        displayLines.push({ text: `Cursor Pos`, color: "#1e293b", isTitle: true });
        displayLines.push({ text: ` X: ${cx.toFixed(4)}`, color: "#333" });
        functions.forEach((fn, i) => {
            const valY = fn.func(cx);
            displayLines.push({ text: ` f${i+1}(y): ${isFinite(valY) ? valY.toFixed(4) : "N/A"}`, color: colors[i] });
        });
    }

    renderInfoBox(p.x, p.y, displayLines);
    if(valCoord) valCoord.innerText = `(${cx.toFixed(3)}, ${cy.toFixed(3)})`;
}

// 정보 박스 UI 렌더러
function renderInfoBox(px, py, lines) {
    ctx.font = "bold 13px Courier New";
    const padding = 12;
    const lineH = 18;
    let maxW = 150;
    lines.forEach(l => {
        const w = ctx.measureText(l.text).width;
        if (w > maxW) maxW = w;
    });

    const boxW = maxW + (padding * 2);
    const boxH = (lines.length * lineH) + (padding * 2);

    let bx = px + 15;
    let by = py - boxH - 15;
    if (bx + boxW > canvas.width) bx = px - boxW - 15;
    if (by < 0) by = py + 15;

    ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
    ctx.strokeStyle = (cursorMode === "follow") ? colors[targetFnIndex] : "#ef4444";
    ctx.lineWidth = 2;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeRect(bx, by, boxW, boxH);

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    lines.forEach((line, i) => {
        ctx.fillStyle = line.color;
        ctx.font = line.isTitle ? "bold 13px Arial" : "13px Courier New";
        ctx.fillText(line.text, bx + padding, by + padding + (i * lineH));
    });
}

function render() { drawGrid(); plotFunctions(); drawCursor(); }

// 5. 이벤트 리스너 통합
canvas.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
    mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    render();
});

// 클릭 시 함수 선택 기능
canvas.addEventListener("mousedown", e => {
    if (cursorMode !== "follow" || functions.length === 0) return;
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (canvas.width / r.width);
    const my = (e.clientY - r.top) * (canvas.height / r.height);
    const mathPos = toMath(mx, my);

    let closestIdx = targetFnIndex;
    let minDiff = 0.5; // 클릭 감지 허용 오차

    functions.forEach((fn, i) => {
        const yVal = fn.func(mathPos.x);
        const diff = Math.abs(yVal - mathPos.y);
        if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
        }
    });
    targetFnIndex = closestIdx;
    render();
});

document.querySelectorAll('input[name="cursorMode"]').forEach(r => {
    r.addEventListener("change", e => { cursorMode = e.target.value; render(); });
});

[showXLine, showYLine].forEach(el => el.addEventListener("change", render));

plotBtn.addEventListener("click", () => {
    const exprs = functionInput.value.split(",").slice(0, 3);
    functions = exprs.filter(e => e.trim()).map(e => ({ expr: e.trim(), func: parseFunction(e) })).filter(f => f.func);
    targetFnIndex = 0;
    render();
});

// 프리셋 기능
document.querySelectorAll(".preset").forEach(btn => {
    btn.addEventListener("click", () => {
        functionInput.value = btn.dataset.fn;
        plotBtn.click();
    });
});

saveImgBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "graph_analysis.png";
    link.href = canvas.toDataURL();
    link.click();
});

render();
