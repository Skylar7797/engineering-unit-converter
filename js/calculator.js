/* ===== Calculator ===== */
const screen=document.getElementById("screen");
const historyBox=document.getElementById("history");
const latestBox=document.getElementById("latest");
const angleBox=document.getElementById("angleMode");

let displayExpr="", evalExpr="", history=[];
let angleMode="RAD";

function __sin(x){return angleMode==="DEG"?Math.sin(x*Math.PI/180):Math.sin(x);}
function __cos(x){return angleMode==="DEG"?Math.cos(x*Math.PI/180):Math.cos(x);}
function __tan(x){return angleMode==="DEG"?Math.tan(x*Math.PI/180):Math.tan(x);}

function toggleAngle(){
 angleMode=angleMode==="RAD"?"DEG":"RAD";
 angleBox.innerText="Angle Mode: "+angleMode;
}

function update(){screen.value=displayExpr||"0";}
function add(v){displayExpr+=v;evalExpr+=v;update();}
function addOp(o){displayExpr+=o;evalExpr+=o;update();}
function addConst(t){
 if(t==="pi"){displayExpr+="π";evalExpr+="Math.PI";}
 if(t==="e"){displayExpr+="e";evalExpr+="Math.E";}
 update();
}
function addFn(f){
 if(displayExpr.endsWith("(")) return;
 displayExpr+=f+"(";
 if(f==="ln") evalExpr+="Math.log(";
 else if(f==="log") evalExpr+="Math.log10(";
 else evalExpr+="__"+f+"(";
 update();
}
function power(){displayExpr+="^";evalExpr+="**";update();}
function sqrt(){displayExpr+="√(";evalExpr+="Math.sqrt(";update();}
function reciprocal(){displayExpr="1/("+displayExpr+")";evalExpr="1/("+evalExpr+")";update();}
function toggleSign(){displayExpr="-("+displayExpr+")";evalExpr="-("+evalExpr+")";update();}

function calc(){
 try{
  const r=Function("return "+evalExpr)();
  const rec=`${displayExpr} = ${r}`;
  history.push(rec); if(history.length>5)history.shift();
  historyBox.innerHTML=history.map((h,i)=>`<div>[${i+1}] ${h}</div>`).join("");
  latestBox.innerText="Latest: "+rec;
  displayExpr=String(r); evalExpr=String(r); update();
 }catch{
  displayExpr="Error"; evalExpr=""; update();
}
}
function clearAll(){displayExpr="";evalExpr="";update();}

screen.addEventListener("input",()=>{
 displayExpr=screen.value;
 evalExpr=displayExpr
  .replace(/√\(/g,"Math.sqrt(")
  .replace(/sin\(/g,"__sin(")
  .replace(/cos\(/g,"__cos(")
  .replace(/tan\(/g,"__tan(")
  .replace(/ln\(/g,"Math.log(")
  .replace(/log\(/g,"Math.log10(")
  .replace(/π/g,"Math.PI")
  .replace(/\^/g,"**");
});
screen.addEventListener("keydown",e=>{
 if(e.key==="Enter"){e.preventDefault();calc();}
});

