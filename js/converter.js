const units = {

  /* ================= Length ================= */
  Length: {
    m: 1,
    km: 1e3,
    dm: 1e-1,
    cm: 1e-2,
    mm: 1e-3,
    um: 1e-6,
    nm: 1e-9,
    pm: 1e-12,
    angstrom: 1e-10,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mile: 1609.344,
    nautical_mile: 1852
  },

  /* ================= Area ================= */
  Area: {
    m2: 1,
    dm2: 1e-2,
    cm2: 1e-4,
    mm2: 1e-6,
    um2: 1e-12,
    nm2: 1e-18,
    in2: 6.4516e-4,
    ft2: 0.092903,
    yd2: 0.836127,
    acre: 4046.856,
    hectare: 10000
  },

  /* ================= Volume ================= */
  Volume: {
    m3: 1,
    dm3: 1e-3,
    L: 1e-3,
    dL: 1e-4,
    mL: 1e-6,
    cm3: 1e-6,
    mm3: 1e-9,
    in3: 1.6387064e-5,
    ft3: 0.0283168,
    yd3: 0.764555
  },

  /* ================= Mass ================= */
  Mass: {
    kg: 1,
    hg: 1e-1,
    g: 1e-3,
    mg: 1e-6,
    ug: 1e-9,
    ng: 1e-12,
    lb: 0.45359237,
    oz: 0.028349523,
    stone: 6.35029,
    ton: 1000,
    tonne: 1000
  },

  /* ================= Time ================= */
  Time: {
    s: 1,
    ms: 1e-3,
    us: 1e-6,
    ns: 1e-9,
    ps: 1e-12,
    fs: 1e-15,
    min: 60,
    h: 3600,
    day: 86400,
    week: 604800
  },

  /* ================= Velocity ================= */
  Velocity: {
    "m/s": 1,
    "km/h": 0.277778,
    "ft/s": 0.3048,
    "mph": 0.44704,
    knot: 0.514444
  },

  /* ================= Acceleration ================= */
  Acceleration: {
    "m/s2": 1,
    Gal: 0.01,
    g: 9.80665
  },

  /* ================= Force ================= */
  Force: {
    N: 1,
    kN: 1e3,
    mN: 1e-3,
    uN: 1e-6,
    dyn: 1e-5,
    lbf: 4.4482216,
    kgf: 9.80665
  },

  /* ================= Pressure / Stress ================= */
  Pressure: {
    Pa: 1,
    hPa: 100,
    kPa: 1e3,
    MPa: 1e6,
    GPa: 1e9,
    bar: 1e5,
    mbar: 100,
    atm: 101325,
    torr: 133.322368,
    mmHg: 133.322368,
    psi: 6894.757
  },

  /* ================= Energy ================= */
  Energy: {
    J: 1,
    kJ: 1e3,
    MJ: 1e6,
    GJ: 1e9,
    eV: 1.602176634e-19,
    keV: 1.602176634e-16,
    MeV: 1.602176634e-13,
    cal: 4.184,
    kcal: 4184,
    Wh: 3600,
    kWh: 3.6e6
  },

  /* ================= Power ================= */
  Power: {
    W: 1,
    mW: 1e-3,
    uW: 1e-6,
    nW: 1e-9,
    kW: 1e3,
    MW: 1e6,
    GW: 1e9,
    hp: 745.699872
  },

  /* ================= Frequency ================= */
  Frequency: {
    Hz: 1,
    kHz: 1e3,
    MHz: 1e6,
    GHz: 1e9,
    THz: 1e12,
    PHz: 1e15
  },

  /* ================= Electric ================= */
  Voltage: {
    V: 1,
    mV: 1e-3,
    uV: 1e-6,
    nV: 1e-9,
    kV: 1e3,
    MV: 1e6
  },

  Current: {
    A: 1,
    mA: 1e-3,
    uA: 1e-6,
    nA: 1e-9,
    pA: 1e-12
  },

  Resistance: {
    ohm: 1,
    kohm: 1e3,
    Mohm: 1e6,
    Gohm: 1e9,
    Tohm: 1e12
  },

  Conductance: {
    S: 1,
    mS: 1e-3,
    uS: 1e-6,
    nS: 1e-9
  },

  Capacitance: {
    F: 1,
    mF: 1e-3,
    uF: 1e-6,
    nF: 1e-9,
    pF: 1e-12,
    fF: 1e-15
  },

  Inductance: {
    H: 1,
    mH: 1e-3,
    uH: 1e-6,
    nH: 1e-9
  },

  Charge: {
    C: 1,
    mC: 1e-3,
    uC: 1e-6,
    nC: 1e-9,
    pC: 1e-12,
    e: 1.602176634e-19
  },

  /* ================= Material ================= */
  Density: {
    "kg/m3": 1,
    "g/cm3": 1000,
    "mg/mm3": 1000
  },

  /* ================= Optics ================= */
  Wavelength: {
    m: 1,
    um: 1e-6,
    nm: 1e-9,
    pm: 1e-12
  },

  Wavenumber: {
    "1/m": 1,
    "1/cm": 100
  }
};


function initConverter(){
  ['A','B'].forEach(id=>{
    const dim = document.getElementById('dim'+id);
    Object.keys(units).forEach(d => dim.add(new Option(d,d)));
    dim.onchange = () => loadUnits(id);
    loadUnits(id);
  });
}

function loadUnits(id){
  const d = document.getElementById('dim'+id).value;
  const f = document.getElementById('from'+id);
  const t = document.getElementById('to'+id);
  f.innerHTML = t.innerHTML = "";
  Object.keys(units[d]).forEach(u=>{
    f.add(new Option(u,u));
    t.add(new Option(u,u));
  });
}

function convert(id){
  const v = parseFloat(document.getElementById('val'+id).value);
  if(isNaN(v)) return;
  const d = document.getElementById('dim'+id).value;
  const f = document.getElementById('from'+id).value;
  const t = document.getElementById('to'+id).value;
  document.getElementById('out'+id).innerText = (v*units[d][f]/units[d][t]).toPrecision(8)+" "+t;
}

document.addEventListener('DOMContentLoaded', initConverter);
