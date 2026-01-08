/* ===============================
   Graph Analytic - UI/UX Perfected Version
================================ */

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const plotBtn = document.getElementById("plotBtn");
const saveImgBtn = document.getElementById("saveImgBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const functionInput = document.getElementById("functionInput");

// 분석 필드
const valCoord = document.getElementById("val-coord");
const valSlope = document.getElementById("val-slope");
const valUnit = document.getElementById("val-unit");

let functions = [];
let scale = 70; 
let origin = { x: canvas.width / 2, y: canvas.height / 2 };
let mouse = { x: null, y: null };
let cursorMode = "follow"; 
const colors = ["#1e88e5", "#ff5722", "#2e7d32"];

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

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const factor = getUnitFactor();
    const isTrig = factor !== 1;

    // 그리드 선명도 개선
    ctx.strokeStyle = "#e2e8f0"; 
    ctx.lineWidth = 1;
    for (let x = origin.x % scale; x < canvas.width; x += scale) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = origin.y % scale; y < canvas.height; y += scale) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // 축
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, origin.y); ctx.lineTo(canvas.width, origin.y);
    ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, canvas.height);
    ctx.stroke();

    // 레이블 (X, Y축 숫자 모두 포함)
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

function plotFunctions() {
    functions.forEach((fn, idx) => {
        ctx.strokeStyle = colors[idx]; ctx.lineWidth = 2.5;
        ctx.beginPath();
        let started = false;
        for (let px = 0; px < canvas.width; px++) {
            const m = toMath(px, 0);
            let y;
            try { y = fn.func(m.x); if (!isFinite(y)) throw ""; } catch { started = false; continue; }
            const p = toCanvas(m.x, y);
            if (!p || p.y < -100 || p.y > canvas.height + 100) { started = false; continue; }
            if (!started) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
            started = true;
        }
        ctx.stroke();
    });
}

/* --- 핵심 수정: 정보 박스 로직 --- */
function drawCursor() {
    if (mouse.x === null || functions.length === 0) return;
    
    const m = toMath(mouse.x, mouse.y);
    let cx = m.x;
    let cy = (cursorMode === "follow") ? functions[0].func(cx) : m.y;
    const p = toCanvas(cx, cy);

    // 십자선
    ctx.setLineDash([5, 5]); ctx.strokeStyle = "#cbd5e1";
    ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, canvas.height);
    ctx.moveTo(0, p.y); ctx.lineTo(canvas.width, p.y); ctx.stroke();
    ctx.setLineDash([]);

    // 1. 텍스트 내용 미리 준비 및 최대 너비 측정
    ctx.font = "bold 13px Courier New"; // 가변폭 방지를 위해 모노스페이스 계열 권장
    const padding = 15;
    const lineH = 20;
    let maxContentWidth = 150; // 최소 너비

    const displayData = functions.map((fn, i) => {
        const fy = fn.func(cx);
        const slope = (fn.func(cx + 0.001) - fn.func(cx - 0.001)) / 0.002;
        const lines = [
            { text: `[f${i+1}] ${fn.expr}`, color: colors[i], isTitle: true },
            { text: ` X: ${cx.toFixed(4)}`, color: "#333" },
            { text: ` Y: ${isFinite(fy) ? fy.toFixed(4) : "NaN"}`, color: "#333" }
        ];
        if (cursorMode === "follow") {
            lines.push({ text: ` S: ${slope.toFixed(4)}`, color: "#666" });
        }
        
        // 각 줄의 실제 캔버스 픽셀 너비 측정
        lines.forEach(l => {
            const metrics = ctx.measureText(l.text);
            if (metrics.width > maxContentWidth) maxContentWidth = metrics.width;
        });
        return lines;
    });

    // 2. 박스 크기 결정
    const boxW = maxContentWidth + (padding * 2);
    const boxH = (displayData.flat().length * lineH) + (padding * 2) + (functions.length - 1) * 10;
    
    // 3. 박스 위치 (넘침 방지)
    let bx = p.x + 15;
    let by = p.y - boxH - 15;
    if (bx + boxW > canvas.width) bx = p.x - boxW - 15;
    if (by < 0) by = p.y + 15;
    if (by + boxH > canvas.height) by = canvas.height - boxH - 10;

    // 4. 박스 렌더링
    ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
    ctx.strokeStyle = "#ef4444"; // 빨간색 테두리
    ctx.lineWidth = 2;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeRect(bx, by, boxW, boxH);

    // 5. 텍스트 렌더링 (박스 내부 좌표 기준)
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    let currentY = by + padding;

    displayData.forEach((group, gIdx) => {
        group.forEach(line => {
            ctx.fillStyle = line.color;
            ctx.font = line.isTitle ? "bold 13px Arial" : "13px Courier New";
            ctx.fillText(line.text, bx + padding, currentY);
            currentY += lineH;
        });
        currentY += 10; // 함수 그룹 간 여백
    });

    // 하단 Analysis 업데이트
    if(valCoord) valCoord.innerText = `(${cx.toFixed(3)}, ${cy.toFixed(3)})`;
}

function render() { drawGrid(); plotFunctions(); drawCursor(); }

// 이벤트 리스너
canvas.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
    mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    render();
});

document.querySelectorAll('input[name="cursorMode"]').forEach(r => {
    r.addEventListener("change", e => { cursorMode = e.target.value; render(); });
});

plotBtn.addEventListener("click", () => {
    const exprs = functionInput.value.split(",").slice(0, 3);
    functions = exprs.filter(e => e.trim()).map(e => ({ expr: e.trim(), func: parseFunction(e) })).filter(f => f.func);
    render();
});

saveImgBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "analysis.png";
    link.href = canvas.toDataURL();
    link.click();
});

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

render();
