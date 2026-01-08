/* ===============================
   Unit Definitions
================================ */
const units = {

  Length: {
    m: 1, km: 1e3, dm: 1e-1, cm: 1e-2, mm: 1e-3,
    um: 1e-6, nm: 1e-9, pm: 1e-12, angstrom: 1e-10,
    in: 0.0254, ft: 0.3048, yd: 0.9144,
    mile: 1609.344, nautical_mile: 1852
  },

  Area: {
    m2: 1, dm2: 1e-2, cm2: 1e-4, mm2: 1e-6,
    um2: 1e-12, nm2: 1e-18,
    in2: 6.4516e-4, ft2: 0.092903,
    yd2: 0.836127, acre: 4046.856, hectare: 10000
  },

  Volume: {
    m3: 1, L: 1e-3, mL: 1e-6,
    cm3: 1e-6, mm3: 1e-9,
    in3: 1.6387064e-5, ft3: 0.0283168, yd3: 0.764555
  },

  Mass: {
    kg: 1, g: 1e-3, mg: 1e-6, ug: 1e-9,
    lb: 0.45359237, oz: 0.028349523, tonne: 1000
  },

  Time: {
    s: 1, ms: 1e-3, us: 1e-6, ns: 1e-9,
    min: 60, h: 3600, day: 86400
  },

  Velocity: {
    "m/s": 1, "km/h": 0.277778,
    "ft/s": 0.3048, mph: 0.44704, knot: 0.514444
  },

  Acceleration: {
    "m/s2": 1, Gal: 0.01, g: 9.80665
  },

  Force: {
    N: 1, kN: 1e3, mN: 1e-3,
    dyn: 1e-5, lbf: 4.4482216
  },

  Pressure: {
    Pa: 1, kPa: 1e3, MPa: 1e6, GPa: 1e9,
    bar: 1e5, atm: 101325, torr: 133.322368, psi: 6894.757
  },

  Energy: {
    J: 1, kJ: 1e3, MJ: 1e6,
    eV: 1.602176634e-19,
    cal: 4.184, kcal: 4184, kWh: 3.6e6
  },

  Power: {
    W: 1, mW: 1e-3, kW: 1e3, MW: 1e6, hp: 745.699872
  },

  Frequency: {
    Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9, THz: 1e12
  },

  Voltage: {
    V: 1, mV: 1e-3, kV: 1e3
  },

  Current: {
    A: 1, mA: 1e-3, uA: 1e-6
  },

  Resistance: {
    ohm: 1, kohm: 1e3, Mohm: 1e6
  },

  Capacitance: {
    F: 1, uF: 1e-6, nF: 1e-9, pF: 1e-12
  },

  Inductance: {
    H: 1, mH: 1e-3, uH: 1e-6
  },

  Charge: {
    C: 1, mC: 1e-3, uC: 1e-6, e: 1.602176634e-19
  },

  Density: {
    "kg/m3": 1, "g/cm3": 1000
  },

  Wavelength: {
    m: 1, um: 1e-6, nm: 1e-9
  },

  Wavenumber: {
    "1/m": 1, "1/cm": 100
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

  const base = value * units[currentParam][from];
  const result = base / units[currentParam][to];

  resultValue.textContent = result.toPrecision(8) + " " + to;
}


/* ===============================
   Event Bindings
================================ */
convertBtn.addEventListener("click", convert);
document.addEventListener("DOMContentLoaded", initConverter);
