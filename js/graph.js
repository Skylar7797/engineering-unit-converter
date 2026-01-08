/* ===============================
   Graph Analytic - Final Workbench Integrated
================================ */

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const plotBtn = document.getElementById("plotBtn");
const saveImgBtn = document.getElementById("saveImgBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const functionInput = document.getElementById("functionInput");
const dataTableBody = document.querySelector("#dataTable tbody");

// 분석 수치 필드 (HTML 내 ID와 일치 확인)
const valCoord = document.getElementById("val-coord");
const valSlope = document.getElementById("val-slope");
const valUnit = document.getElementById("val-unit");

/* State */
let functions = [];
let scale = 70; 
let origin = { x: canvas.width / 2, y: canvas.height / 2 };
let mouse = { x: null, y: null };
let cursorMode = "follow"; 
let axisScale = { x: "linear", y: "linear" };
const colors = ["#1e88e5", "#ff5722", "#2e7d32"]; // f1: Blue, f2: Orange, f3: Green

/* Math Parser */
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

/* Coordinate Mapping */
const toCanvas = (x, y) => {
    const factor = getUnitFactor();
    return { x: origin.x + (x / factor) * scale, y: origin.y - y * scale };
};

const toMath = (x, y) => {
    const factor = getUnitFactor();
    return {
        x: ((x - origin.x) / scale) * factor,
        y: (origin.y - y) / scale
    };
};

/* 1. Rendering Grid & Axis (Y축 숫자 및 선명도 개선) */
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const factor = getUnitFactor();
    const isTrig = factor !== 1;

    // 배경 그리드 (기존보다 약간 더 선명하게 #e0e6ed)
    ctx.strokeStyle = "#e0e6ed"; 
    ctx.lineWidth = 1;
    
    for (let x = origin.x % scale; x < canvas.width; x += scale) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = origin.y % scale; y < canvas.height; y += scale) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // 메인 축 (검정색)
    ctx.strokeStyle = "#333"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, origin.y); ctx.lineTo(canvas.width, origin.y); // X축
    ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, canvas.height); // Y축
    ctx.stroke();

    // 좌표 숫자 표시
    ctx.fillStyle = "#555"; ctx.font = "12px Arial";
    
    // X축 레이블
    ctx.textAlign = "center";
    const nLeft = Math.floor(origin.x / scale), nRight = Math.floor((canvas.width - origin.x) / scale);
    for (let i = -nLeft; i <= nRight; i++) {
        if (i === 0) continue;
        let label = isTrig ? (i === 1 ? "π" : i === -1 ? "-π" : i + "π") : i;
        ctx.fillText(label, origin.x + i * scale, origin.y + 20);
    }

    // Y축 레이블 (수정됨)
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    const nUp = Math.floor(origin.y / scale), nDown = Math.floor((canvas.height - origin.y) / scale);
    for (let i = -nUp; i <= nDown; i++) {
        if (i === 0) continue;
        ctx.fillText(i, origin.x - 8, origin.y - i * scale);
    }
}

/* 2. Plotting (3개 함수 구분) */
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
            if (!p || p.y < -500 || p.y > canvas.height + 500) { started = false; continue; }
            if (!started) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
            started = true;
        }
        ctx.stroke();
    });
}

/* 3. Cursor & Info Box (모드 구분 및 넘침 방지 완벽 수정) */
function drawCursor() {
    if (mouse.x === null || functions.length === 0) return;
    
    const m = toMath(mouse.x, mouse.y);
    let cx = m.x;
    // Follow 모드: f1의 y값 추적 / Free 모드: 마우스 y좌표 그대로 사용
    let cy = (cursorMode === "follow") ? functions[0].func(cx) : m.y;
    const p = toCanvas(cx, cy);

    // 가이드 십자선
    ctx.setLineDash([5, 5]); ctx.strokeStyle = "#999";
    ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, canvas.height);
    ctx.moveTo(0, p.y); ctx.lineTo(canvas.width, p.y); ctx.stroke();
    ctx.setLineDash([]);

    // 박스 동적 크기 및 위치 계산
    const lineH = 22; const padding = 15;
    const boxW = 280; 
    const boxH = (functions.length * (cursorMode === "follow" ? 4 : 3) * lineH) + (padding * 2);
    
    let bx = p.x + 15, by = p.y - boxH - 15;
    // 캔버스 경계 체크 (넘침 방지)
    if (bx + boxW > canvas.width) bx = p.x - boxW - 15;
    if (by < 0) by = p.y + 15;
    if (by + boxH > canvas.height) by = canvas.height - boxH - 10;

    // 정보 박스 그리기
    ctx.fillStyle = "rgba(255, 255, 255, 0.98)"; ctx.strokeStyle = "#ff0000"; ctx.lineWidth = 2;
    ctx.fillRect(bx, by, boxW, boxH); ctx.strokeRect(bx, by, boxW, boxH);

    ctx.font = "bold 13px Arial"; ctx.textBaseline = "top";
    let ty = by + padding;

    functions.forEach((fn, i) => {
        const fy = fn.func(cx);
        ctx.fillStyle = colors[i];
        ctx.fillText(`[f${i+1}] ${fn.expr}`, bx + padding, ty); ty += lineH;
        ctx.fillStyle = "#333";
        ctx.fillText(` X: ${cx.toFixed(4)}`, bx + padding + 5, ty); ty += lineH;
        ctx.fillText(` Y: ${isFinite(fy) ? fy.toFixed(5) : "NaN"}`, bx + padding + 5, ty); ty += lineH;
        // Follow 모드일 때만 기울기 표시
        if (cursorMode === "follow") {
            const s = (fn.func(cx + 0.001) - fn.func(cx - 0.001)) / 0.002;
            ctx.fillText(` Slope: ${s.toFixed(5)}`, bx + padding + 5, ty); ty += lineH;
        }
        ty += 5; 
    });

    // 하단 Analysis 섹션 업데이트
    if (valCoord) valCoord.innerText = `(${cx.toFixed(3)}, ${cy.toFixed(3)})`;
    if (valUnit) valUnit.innerText = `${(cx * 180 / Math.PI).toFixed(2)}°`;
    if (valSlope && functions[0]) {
        const s0 = (functions[0].func(cx+0.0001)-functions[0].func(cx-0.0001))/0.0002;
        valSlope.innerText = s0.toFixed(5);
    }
}

/* 4. Data Table & CSV (추천 기능) */
function updateDataTable() {
    if (!dataTableBody) return;
    dataTableBody.innerHTML = "";
    const startX = toMath(0, 0).x, endX = toMath(canvas.width, 0).x;
    const step = (endX - startX) / 15;

    for (let i = 0; i <= 15; i++) {
        const x = startX + (step * i);
        const row = document.createElement("tr");
        let cols = `<td>${x.toFixed(3)}</td>`;
        functions.forEach(fn => {
            const y = fn.func(x);
            cols += `<td>${isFinite(y) ? y.toFixed(4) : "-"}</td>`;
        });
        for(let j=functions.length; j<3; j++) cols += `<td>-</td>`;
        row.innerHTML = cols;
        dataTableBody.appendChild(row);
    }
}

/* 5. Events & Exports */
function render() { drawGrid(); plotFunctions(); drawCursor(); }

canvas.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
    mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    render();
});

// Cursor Mode Toggle 기능 수정
document.querySelectorAll('input[name="cursorMode"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
        cursorMode = e.target.value;
        render();
    });
});

plotBtn.addEventListener("click", () => {
    const exprs = functionInput.value.split(",").slice(0, 3);
    functions = exprs.filter(e => e.trim()).map(e => ({ expr: e.trim(), func: parseFunction(e) })).filter(f => f.func);
    updateDataTable();
    render();
});

// 이미지 다운로드 (Fix)
saveImgBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "graph_analytic.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});

// CSV 다운로드 (Fix)
exportCsvBtn.addEventListener("click", () => {
    if(functions.length === 0) return alert("Please plot a function first.");
    let csv = "X," + functions.map((_, i) => `f${i+1}`).join(",") + "\n";
    for (let x = -10; x <= 10; x += 0.5) {
        let row = [x.toFixed(2)];
        functions.forEach(fn => row.push(fn.func(x).toFixed(4)));
        csv += row.join(",") + "\n";
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "graph_data.csv";
    link.click();
});

// 초기 실행
render();
