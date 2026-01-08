/* ===============================
   Unit Definitions (Expanded)
================================ */
const units = {

  /* ========== Length ========= */
  Length: {
    m: 1, km: 1e3, dm: 1e-1, cm: 1e-2, mm: 1e-3,
    um: 1e-6, nm: 1e-9, pm: 1e-12, angstrom: 1e-10,
    in: 0.0254, ft: 0.3048, yd: 0.9144, mile: 1609.344, nautical_mile: 1852,
    li: 500, fathom: 1.8288, rod: 5.0292, chain: 20.1168, furlong: 201.168,
    parsec: 3.086e16, lightyear: 9.461e15, au: 1.496e11, cable: 185.2, hand: 0.1016
  },

  /* ========== Area ========= */
  Area: {
    m2: 1, dm2: 1e-2, cm2: 1e-4, mm2: 1e-6, um2: 1e-12, nm2: 1e-18,
    in2: 6.4516e-4, ft2: 0.092903, yd2: 0.836127, acre: 4046.856, hectare: 10000,
    barn: 1e-28, square_mile: 2.59e6, square_yd: 0.836127, square_in: 0.00064516, square_ft: 0.092903
  },

  /* ========== Volume ========= */
  Volume: {
    m3: 1, L: 1e-3, mL: 1e-6, cm3: 1e-6, mm3: 1e-9,
    in3: 1.6387064e-5, ft3: 0.0283168, yd3: 0.764555,
    gallon: 0.00378541, pint: 4.73176e-4, quart: 9.46353e-4,
    barrel: 0.1192405, cubic_mile: 4.168e9, cubic_foot: 0.0283168, cubic_inch: 1.6387e-5
  },

  /* ========== Mass ========= */
  Mass: {
    kg: 1, g: 1e-3, mg: 1e-6, ug: 1e-9, lb: 0.45359237, oz: 0.028349523, tonne: 1000,
    stone: 6.35029, grain: 6.4799e-5, carat: 0.0002, slugs: 14.5939, pennyweight: 0.00155517
  },

  /* ========== Time ========= */
  Time: {
    s: 1, ms: 1e-3, us: 1e-6, ns: 1e-9, min: 60, h: 3600, day: 86400,
    week: 604800, year: 31536000, decade: 3.1536e8, century: 3.1536e9
  },

  /* ========== Temperature (비선형 단위) ========= */
  Temperature: {
    C: { type: "linear", factor: 1, offset: 0 },
    F: { type: "nonlinear", formula: val => (val - 32) * 5/9, display: "(F-32)*5/9" },
    K: { type: "linear", factor: 1, offset: -273.15 },
    R: { type: "nonlinear", formula: val => (val - 491.67) * 5/9, display: "(R-491.67)*5/9" },
    °Re: { type: "nonlinear", formula: val => val * 1.25, display: "Re*1.25" }
  },

  /* ========== Decibel / Log (비선형) ========= */
  Decibel: {
    dB: { type: "nonlinear", formula: val => 10 * Math.log10(val), display: "10*log10(value)" },
    dBm: { type: "nonlinear", formula: val => 10 * Math.log10(val/0.001), display: "10*log10(value/0.001)" },
    dBV: { type: "nonlinear", formula: val => 20 * Math.log10(val), display: "20*log10(value)" },
    neper: { type: "nonlinear", formula: val => val / (20/Math.log10(Math.E)), display: "value/8.686" }
  },

  /* ========== pH (비선형) ========= */
  pH: {
    "pH": { type: "nonlinear", formula: val => -Math.log10(val), display: "-log10([H+])" }
  },

  /* ========== Angle (비선형) ========= */
  Angle: {
    deg: 1, rad: 180/Math.PI, grad: 0.9, arcmin: 1/60, arcsec: 1/3600
  },

  /* ========== Velocity ========= */
  Velocity: { "m/s": 1, "km/h": 0.277778, "ft/s": 0.3048, mph: 0.44704, knot: 0.514444 },

  /* ========== Acceleration ========= */
  Acceleration: { "m/s2": 1, Gal: 0.01, g: 9.80665 },

  /* ========== Force ========= */
  Force: { N: 1, kN: 1e3, mN: 1e-3, dyn: 1e-5, lbf: 4.4482216 },

  /* ========== Pressure ========= */
  Pressure: { Pa: 1, kPa: 1e3, MPa: 1e6, GPa: 1e9, bar: 1e5, atm: 101325, torr: 133.322368, psi: 6894.757 },

  /* ========== Energy ========= */
  Energy: { J: 1, kJ: 1e3, MJ: 1e6, eV: 1.602176634e-19, cal: 4.184, kcal: 4184, kWh: 3.6e6 },

  /* ========== Power ========= */
  Power: { W: 1, mW: 1e-3, kW: 1e3, MW: 1e6, hp: 745.699872 },

  /* ========== Frequency ========= */
  Frequency: { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9, THz: 1e12 },

  /* ========== Voltage ========= */
  Voltage: { V: 1, mV: 1e-3, kV: 1e3 },

  /* ========== Current ========= */
  Current: { A: 1, mA: 1e-3, uA: 1e-6 },

  /* ========== Resistance ========= */
  Resistance: { ohm: 1, kohm: 1e3, Mohm: 1e6 },

  /* ========== Capacitance ========= */
  Capacitance: { F: 1, uF: 1e-6, nF: 1e-9, pF: 1e-12 },

  /* ========== Inductance ========= */
  Inductance: { H: 1, mH: 1e-3, uH: 1e-6 },

  /* ========== Charge ========= */
  Charge: { C: 1, mC: 1e-3, uC: 1e-6, e: 1.602176634e-19 },

  /* ========== Density ========= */
  Density: { "kg/m3": 1, "g/cm3": 1000 },

  /* ========== Wavelength ========= */
  Wavelength: { m: 1, um: 1e-6, nm: 1e-9 },

  /* ========== Wavenumber ========= */
  Wavenumber: { "1/m": 1, "1/cm": 100 }

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
  clearFormula();
}


/* ===============================
   Conversion Logic
================================ */
function convert() {
  const value = parseFloat(inputValue.value);
  if (isNaN(value) || !currentParam) return;

  const from = fromUnit.value;
  const to = toUnit.value;

  const unitObj = units[currentParam][from];
  let result, formulaStr = "";

  if (typeof unitObj === "object" && unitObj.type === "nonlinear") {
    result = unitObj.formula(value);
    formulaStr = unitObj.display;
  } else if (typeof units[currentParam][from] === "number") {
    const base = value * units[currentParam][from];
    result = base / units[currentParam][to];
  }

  displayFormula(formulaStr);
  resultValue.textContent = result.toPrecision(8) + " " + to;
}


/* ===============================
   Formula Display
================================ */
function displayFormula(str) {
  clearFormula();
  if (!str) return;
  const formulaDiv = document.createElement("div");
  formulaDiv.innerHTML = `<span style="color:green;">Formula:</span> <span style="color:red;">${str}</span>`;
  resultValue.parentNode.insertBefore(formulaDiv, resultValue);
}

function clearFormula() {
  const existing = resultValue.parentNode.querySelectorAll("div");
  existing.forEach(el => el.remove());
}


/* ===============================
   Event Bindings
================================ */
convertBtn.addEventListener("click", convert);
document.addEventListener("DOMContentLoaded", initConverter);
