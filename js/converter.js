const units = {
  Length:{m:1,km:1000,cm:0.01,mm:0.001,in:0.0254,ft:0.3048},
  Area:{m2:1,cm2:1e-4,mm2:1e-6,ft2:0.092903},
  Volume:{m3:1,L:0.001,cm3:1e-6,ft3:0.0283168},
  Mass:{kg:1,g:0.001,mg:1e-6,lb:0.453592},
  Time:{s:1,min:60,h:3600},
  Force:{N:1,kN:1000,lbf:4.44822},
  Pressure:{Pa:1,kPa:1000,MPa:1e6,bar:1e5,psi:6894.76},
  Energy:{J:1,kJ:1000,Wh:3600,eV:1.602e-19},
  Power:{W:1,kW:1000,hp:745.7}
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
