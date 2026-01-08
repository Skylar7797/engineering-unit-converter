/* ===============================
   Unit Definitions (Fully Expanded)
================================ */
const units = {

  /* Length */
  Length: {
    m: 1, km: 1e3, dm: 1e-1, cm: 1e-2, mm: 1e-3,
    um: 1e-6, nm: 1e-9, pm: 1e-12, angstrom: 1e-10,
    in: 0.0254, ft: 0.3048, yd: 0.9144,
    mile: 1609.344, nautical_mile: 1852,
    fathom: 1.8288, rod: 5.0292, chain: 20.1168
  },

  /* Area */
  Area: {
    m2: 1, dm2: 1e-2, cm2: 1e-4, mm2: 1e-6,
    um2: 1e-12, nm2: 1e-18,
    in2: 6.4516e-4, ft2: 0.092903,
    yd2: 0.836127, acre: 4046.856, hectare: 10000,
    sq_mile: 2.59e6, sq_nautical_mile: 3.429e6
  },

  /* Volume */
  Volume: {
    m3: 1, L: 1e-3, mL: 1e-6,
    cm3: 1e-6, mm3: 1e-9,
    in3: 1.6387064e-5, ft3: 0.0283168, yd3: 0.764555,
    gallon: 0.00378541, quart: 0.000946353, pint: 0.000473176,
    cup: 0.000236588, fluid_oz: 2.9574e-5, tbsp: 1.4787e-5, tsp: 4.9289e-6
  },

  /* Mass */
  Mass: {
    kg: 1, g: 1e-3, mg: 1e-6, ug: 1e-9,
    lb: 0.45359237, oz: 0.028349523, tonne: 1000,
    stone: 6.35029, grain: 6.4799e-5
  },

  /* Time */
  Time: {
    s: 1, ms: 1e-3, us: 1e-6, ns: 1e-9,
    min: 60, h: 3600, day: 86400,
    week: 604800, month: 2.628e6, year: 3.154e7
  },

  /* Velocity */
  Velocity: {
    "m/s": 1, "km/h": 0.277778, "ft/s": 0.3048,
    mph: 0.44704, knot: 0.514444, mach: 340.29
  },

  /* Acceleration */
  Acceleration: {
    "m/s2": 1, Gal: 0.01, g: 9.80665
  },

  /* Force */
  Force: {
    N: 1, kN: 1e3, mN: 1e-3,
    dyn: 1e-5, lbf: 4.4482216, kgf: 9.80665
  },

  /* Pressure */
  Pressure: {
    Pa: 1, kPa: 1e3, MPa: 1e6, GPa: 1e9,
    bar: 1e5, atm: 101325, torr: 133.322368, psi: 6894.757,
    mmHg: 133.322, inHg: 3386.39
  },

  /* Energy */
  Energy: {
    J: 1, kJ: 1e3, MJ: 1e6,
    eV: 1.602176634e-19,
    cal: 4.184, kcal: 4184, kWh: 3.6e6, BTU: 1055.06
  },

  /* Power */
  Power: {
    W: 1, mW: 1e-3, kW: 1e3, MW: 1e6, hp: 745.699872
  },

  /* Frequency */
  Frequency: {
    Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9, THz: 1e12, rpm: 1/60
  },

  /* Voltage */
  Voltage: {
    V: 1, mV: 1e-3, kV: 1e3, MV: 1e6
  },

  /* Current */
  Current: {
    A: 1, mA: 1e-3, uA: 1e-6, nA: 1e-9
  },

  /* Resistance */
  Resistance: {
    ohm: 1, kohm: 1e3, Mohm: 1e6
  },

  /* Capacitance */
  Capacitance: {
    F: 1, uF: 1e-6, nF: 1e-9, pF: 1e-12
  },

  /* Inductance */
  Inductance: {
    H: 1, mH: 1e-3, uH: 1e-6
  },

  /* Charge */
  Charge: {
    C: 1, mC: 1e-3, uC: 1e-6, nC: 1e-9, e: 1.602176634e-19
  },

  /* Density */
  Density: {
    "kg/m3": 1, "g/cm3": 1000
  },

  /* Wavelength */
  Wavelength: {
    m: 1, um: 1e-6, nm: 1e-9, pm: 1e-12
  },

  /* Wavenumber */
  Wavenumber: {
    "1/m": 1, "1/cm": 100
  },

  /* ================= Nonlinear Units (with formula) ================= */
  Temperature: {
    "°C": {toBase: v => v, fromBase: v => v, formula: "°C = °C"},
    "K":  {toBase: v => v - 273.15, fromBase: v => v + 273.15, formula: "K = °C + 273.15"},
    "°F": {toBase: v => (v - 32) * 5/9, fromBase: v => v * 9/5 + 32, formula: "°F = °C × 9/5 + 32"},
    "°R": {toBase: v => (v - 491.67) * 5/9, fromBase: v => v * 9/5 + 491.67, formula: "°R = °C × 9/5 + 491.67"}
  },

  Decibel: {
    dB: {toBase: v => Math.pow(10, v/10), fromBase: v => 10*Math.log10(v), formula: "dB = 10 log10(P/P0)"}
  }

};

/* ===============================
   DOM Elements
================================ */
const paramList = document.getElementById("paramList");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const inputValue = document.getElementById("inputValue");
const resultValue = document.getElementById("resultValue");
const convertBtn = document.getElementById("convertBtn");

let currentParam = null;

/* ===============================
   Initialization
================================ */
function initConverter() {
  Object.keys(units).forEach((param, index) => {
    const btn = document.createElement("button");
    btn.textContent = param;
    btn.onclick = () => selectParameter(param, btn);
    if (index === 0) {
      btn.classList.add("active");
      selectParameter(param, btn);
    }
    paramList.appendChild(btn);
  });
}

function selectParameter(param, button) {
  currentParam = param;
  [...paramList.children].forEach(b => b.classList.remove("active"));
  button.classList.add("active");
  loadUnits(param);
}

function loadUnits(param) {
  fromUnit.innerHTML = "";
  toUnit.innerHTML = "";

  Object.keys(units[param]).forEach(u => {
    fromUnit.add(new Option(u, u));
    toUnit.add(new Option(u, u));
  });

  resultValue.textContent = "—";
}

/* ===============================
   Conversion Logic
================================ */
function convert() {
  const value = parseFloat(inputValue.value);
  if (isNaN(value) || !currentParam) return;

  const from = fromUnit.value;
  const to = toUnit.value;
  const paramUnits = units[currentParam];

  let resultText;

  // 비선형 단위
  if (paramUnits[from].toBase && paramUnits[from].fromBase) {
    const base = paramUnits[from].toBase(value);
    const result = paramUnits[to].fromBase(base);
    const formula = paramUnits[to].formula || "";
    resultText = `${result.toPrecision(6)} ${to} (${formula})`;
  } else {
    // 선형 단위
    const base = value * paramUnits[from];
    const result = base / paramUnits[to];
    resultText = `${result.toPrecision(8)} ${to}`;
  }

  resultValue.textContent = resultText;
}

/* ===============================
   Event Bindings
================================ */
convertBtn.addEventListener("click", convert);
document.addEventListener("DOMContentLoaded", initConverter);
