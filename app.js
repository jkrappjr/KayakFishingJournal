const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={trip:load("kfj2_trip",null),journal:load("kfj2_journal",[]),profile:load("kfj2_profile",{name:"Guest Angler",home:"",about:"",kayak:"",electronics:"",teams:"",sponsors:"",photo:""}),account:load("kfj2_account",null),lessonStep:0,lessonPlaying:false,lessonTimer:null,knotKey:"palomar",knotStep:0,knotPlaying:false,knotTimer:null,anglerKey:"austin-lilly"};

const SITE_DATA=window.WVKA_LEARN_DATA||{water:{},techniques:{},science:{},knots:{}};
const WATER_SCENES={seam:"seam",boulder:"boulder",ledge:"ledge",eddy:"eddy",shoal:"riffle",tailout:"tailout",pool:"tailout"};
function siteLesson(key){
  const d=SITE_DATA.water[key]||SITE_DATA.water.eddy||{};
  return {title:d.title||key,scene:WATER_SCENES[key]||"eddy",steps:[
    ["SEE IT",d.see||""],["UNDERSTAND IT",d.understand||""],["FISH IT",d.fish||""],["TRY IT",d.try||""]
  ],summary:d.summary||"",deep:d.deep||""};
}
const lessons={seam:siteLesson("seam"),boulder:siteLesson("boulder"),ledge:siteLesson("ledge"),eddy:siteLesson("eddy"),riffle:siteLesson("shoal"),tailout:siteLesson("tailout"),pool:siteLesson("pool")};

function load(k,f){try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}

function route(){
  let hash=location.hash||"#/home";
  let parts=hash.replace(/^#\//,"").split("/");
  let name=parts[0]||"home";
  $$(".page").forEach(p=>p.classList.remove("active"));
  let page=$('[data-route="'+(name==="lesson"?"lesson":name)+'"]')||$('[data-route="home"]');
  page.classList.add("active");
  $$(".bottom-nav a").forEach(a=>a.classList.toggle("active",a.getAttribute("href")===("#/"+name)));
  if(name==="lesson")renderLesson(parts[1]||"eddy");
  if(name==="profile")renderProfile();
  if(name==="directory")renderDirectory();
  if(name==="journal")renderJournal();
  if(name==="on-trip")renderTrip();
  if(name==="techniques")renderLearningLibrary("techniques","#techniqueList");
  if(name==="science")renderLearningLibrary("science","#scienceList");
  if(name==="knots")renderKnots();
  scrollTo(0,0);
}
addEventListener("hashchange",route);

function renderLesson(key){
  const l=lessons[key]||lessons.eddy;
  state.lessonKey=key; state.lessonStep=Math.min(state.lessonStep,3);
  $("#lessonTitle").textContent=l.title;
  $("#lessonSteps").innerHTML=l.steps.map((s,i)=>'<button data-step="'+i+'" class="'+(i===state.lessonStep?"active":"")+'">'+(i+1)+" "+s[0]+'</button>').join("");
  $("#lessonCopy").innerHTML="<h3>"+l.steps[state.lessonStep][0]+"</h3><p>"+l.steps[state.lessonStep][1]+"</p>";
  drawLessonFrame(l.scene,state.lessonStep*1.5+.55);
  $$(".steps button").forEach(b=>b.onclick=()=>{state.lessonStep=+b.dataset.step;stopLesson();renderLesson(key)});
}
function stopLesson(){
  state.lessonPlaying=false;
  if(state.lessonRAF)cancelAnimationFrame(state.lessonRAF);
  $("#playLesson").textContent="▶ Play";
}
function drawArrow(ctx,x1,y1,x2,y2,color,width=5){
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=width;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  const a=Math.atan2(y2-y1,x2-x1),s=13;
  ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-s*Math.cos(a-.55),y2-s*Math.sin(a-.55));ctx.lineTo(x2-s*Math.cos(a+.55),y2-s*Math.sin(a+.55));ctx.closePath();ctx.fill();
}
function drawKayak(ctx,x,y,ang=0){
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  ctx.fillStyle="#d98327";ctx.strokeStyle="#17251f";ctx.lineWidth=3;
  ctx.beginPath();ctx.ellipse(0,0,34,10,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle="#17251f";ctx.beginPath();ctx.arc(0,-17,5,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawTarget(ctx,x,y,p){
  ctx.strokeStyle="#ffdc3b";ctx.lineWidth=6;ctx.beginPath();ctx.arc(x,y,21+6*p,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle="#ffdc3b";ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();
}
function drawDashedEllipse(ctx,x,y,rx,ry,phase){
  ctx.save();ctx.strokeStyle="#ffdc3b";ctx.lineWidth=6;ctx.setLineDash([18,14]);ctx.lineDashOffset=-phase;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function drawCast(ctx,x1,y1,x2,y2,phase){
  ctx.save();ctx.strokeStyle="#ffdc3b";ctx.lineWidth=5;ctx.setLineDash([14,10]);ctx.lineDashOffset=-phase;ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo((x1+x2)/2,y1-55,x2,y2);ctx.stroke();ctx.restore();
}
function drawLessonFrame(scene,t){
  const c=$("#lessonCanvas"); if(!c)return;
  const ctx=c.getContext("2d"),W=c.width,H=c.height;
  const step=Math.min(3,Math.floor(t/1.5)),p=(Math.sin(t*5)+1)/2,move=(t*75)%180;
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#77b9c7");g.addColorStop(.55,"#2f7584");g.addColorStop(1,"#214f5b");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#31533a";ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,0);ctx.lineTo(W,70);ctx.lineTo(520,56);ctx.lineTo(440,80);ctx.lineTo(330,60);ctx.lineTo(220,85);ctx.lineTo(110,64);ctx.lineTo(0,88);ctx.closePath();ctx.fill();
  const cyan="#63e6ff",gold="#ffdc3b";
  if(scene==="eddy"){
    for(let j=0;j<3;j++)drawArrow(ctx,590-move+j*70,120+j*34,520-move+j*70,120+j*34,cyan,5);
    drawDashedEllipse(ctx,350,205,95,52,t*45); drawKayak(ctx,220,306,-.12); drawTarget(ctx,470,225,p);
    if(step>=2)drawCast(ctx,245,295,470,225,t*32);
    ctx.fillStyle=gold;ctx.font="bold 22px sans-serif";ctx.fillText("EDDY",315,205);
  }else if(scene==="seam"){
    ctx.fillStyle="rgba(92,205,230,.23)";ctx.fillRect(345,75,295,285);ctx.fillStyle="rgba(31,87,68,.22)";ctx.fillRect(0,75,345,285);
    ctx.strokeStyle="rgba(255,255,255,.9)";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(345,78);ctx.lineTo(345,350);ctx.stroke();
    for(const y of [125,190,255])drawArrow(ctx,620-move,y,520-move,y,cyan,5);
    drawKayak(ctx,185,305,-.05);drawTarget(ctx,358,210,p);if(step>=2)drawCast(ctx,215,295,358,210,t*32);
    ctx.fillStyle="#fff";ctx.font="bold 20px sans-serif";ctx.fillText("CURRENT SEAM",365,105);
  }else if(scene==="boulder"){
    ctx.fillStyle="#65675b";ctx.beginPath();ctx.ellipse(350,196,66,50,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#9c9b84";ctx.beginPath();ctx.ellipse(333,180,40,28,0,0,Math.PI*2);ctx.fill();
    for(const y of [120,158,248])drawArrow(ctx,620-move,y,520-move,y,cyan,5);
    drawDashedEllipse(ctx,405,265,78,34,t*45);drawKayak(ctx,180,305,-.1);drawTarget(ctx,465,265,p);if(step>=2)drawCast(ctx,210,295,465,265,t*32);
    ctx.fillStyle="#fff";ctx.font="bold 20px sans-serif";ctx.fillText("CURRENT BREAK",275,115);
  }else if(scene==="ledge"){
    ctx.fillStyle="rgba(121,155,109,.35)";ctx.fillRect(0,75,340,285);ctx.fillStyle="rgba(16,54,95,.5)";ctx.fillRect(340,75,300,285);
    ctx.strokeStyle=gold;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(340,78);ctx.lineTo(340,360);ctx.stroke();
    drawKayak(ctx,175,305,-.05);drawTarget(ctx,395,210,p);if(step>=2)drawCast(ctx,205,295,395,210,t*32);
    ctx.fillStyle=gold;ctx.font="bold 20px sans-serif";ctx.fillText("DROP EDGE",275,110);
  }else if(scene==="riffle"){
    [[250,175,28],[355,138,34],[455,205,27],[525,155,22]].forEach(([x,y,r])=>{ctx.fillStyle="#5f6258";ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.fillStyle="#929488";ctx.beginPath();ctx.arc(x-7,y-7,r*.55,0,Math.PI*2);ctx.fill()});
    for(const y of [120,185,250])drawArrow(ctx,620-move,y,520-move,y,cyan,5);
    drawKayak(ctx,165,305,-.05);drawTarget(ctx,505,260,p);if(step>=2)drawCast(ctx,195,295,505,260,t*32);
    ctx.fillStyle=gold;ctx.font="bold 18px sans-serif";ctx.fillText("FIRST DROP",465,230);
  }else{
    ctx.fillStyle="rgba(44,74,49,.85)";ctx.beginPath();ctx.moveTo(0,75);ctx.lineTo(190,105);ctx.lineTo(245,360);ctx.lineTo(0,360);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(640,75);ctx.lineTo(450,105);ctx.lineTo(395,360);ctx.lineTo(640,360);ctx.closePath();ctx.fill();
    drawArrow(ctx,305,130+move*.25,305,215+move*.25,cyan,5);drawArrow(ctx,365,165+move*.25,365,250+move*.25,cyan,5);
    drawKayak(ctx,320,310,0);drawTarget(ctx,345,250,p);if(step>=2)drawCast(ctx,320,295,345,250,t*32);
    ctx.fillStyle=gold;ctx.font="bold 20px sans-serif";ctx.fillText("TAILOUT FUNNEL",248,110);
  }
  ctx.fillStyle="rgba(4,47,34,.9)";ctx.fillRect(0,0,W,48);ctx.fillStyle="#ffe184";ctx.font="bold 22px sans-serif";ctx.fillText((lessons[state.lessonKey]||lessons.eddy).title.toUpperCase(),18,31);
  const labels=["SEE IT","UNDERSTAND IT","FISH IT","TRY IT"];ctx.fillStyle="rgba(4,47,34,.92)";ctx.fillRect(15,H-43,230,30);ctx.fillStyle="#fff";ctx.font="bold 18px sans-serif";ctx.fillText(labels[step],28,H-22);
}
function playLesson(){
  if(state.lessonPlaying){stopLesson();return}
  state.lessonPlaying=true;$("#playLesson").textContent="❚❚ Pause";
  const startT=state.lessonStep*1.5, started=performance.now()-startT*1000;
  const tick=now=>{
    if(!state.lessonPlaying)return;
    let t=(now-started)/1000;
    if(t>=6){state.lessonStep=3;drawLessonFrame((lessons[state.lessonKey]||lessons.eddy).scene,5.9);stopLesson();renderLesson(state.lessonKey||"eddy");return}
    const newStep=Math.min(3,Math.floor(t/1.5));
    if(newStep!==state.lessonStep){state.lessonStep=newStep;const l=lessons[state.lessonKey]||lessons.eddy;$("#lessonSteps").querySelectorAll("button").forEach((b,i)=>b.classList.toggle("active",i===newStep));$("#lessonCopy").innerHTML="<h3>"+l.steps[newStep][0]+"</h3><p>"+l.steps[newStep][1]+"</p>"}
    drawLessonFrame((lessons[state.lessonKey]||lessons.eddy).scene,t);
    state.lessonRAF=requestAnimationFrame(tick);
  };
  state.lessonRAF=requestAnimationFrame(tick);
}
$("#prevLesson").onclick=()=>{state.lessonStep=Math.max(0,state.lessonStep-1);stopLesson();renderLesson(state.lessonKey||"eddy")};
$("#nextLesson").onclick=()=>{state.lessonStep=Math.min(3,state.lessonStep+1);stopLesson();renderLesson(state.lessonKey||"eddy")};
$("#playLesson").onclick=playLesson;


const ANGLERS=[
 {key:"austin-lilly",name:"Austin Lilly",home:"Hinton WV",trips:3,catches:109,hours:15,largest:"17.25 in",about:"Public Kayak Fishing Journal angler profile."},
 {key:"john-rapp",name:"John Rapp",home:"Mount Nebo, West Virginia",about:"Public Kayak Fishing Journal angler profile."},
 {key:"greg-harper",name:"Greg Harper",home:"West Virginia",about:"Public Kayak Fishing Journal angler profile."},
 {key:"alex-worley",name:"Alex Worley",home:"West Virginia",about:"Public Kayak Fishing Journal angler profile."},
 {key:"jared-terry",name:"Jared Terry",home:"West Virginia",about:"Public Kayak Fishing Journal angler profile."},
 {key:"clint-kissner",name:"Clint Kissner",home:"West Virginia",about:"Public Kayak Fishing Journal angler profile."},
 {key:"jason-arthur",name:"Jason Arthur",home:"West Virginia",about:"Public Kayak Fishing Journal angler profile."},
 {key:"eric-shuman",name:"Eric Shuman",home:"West Virginia",about:"Public Kayak Fishing Journal angler profile."},
 {key:"lj-ashcraft",name:"L.J. Ashcraft",home:"West Virginia",about:"Public Kayak Fishing Journal angler profile."},
 {key:"rick-garavaglia",name:"Rick Garavaglia",home:"West Virginia",about:"Public Kayak Fishing Journal angler profile."},
 {key:"beth-rapp",name:"Beth Rapp",home:"West Virginia",about:"Public Kayak Fishing Journal angler profile."}
];

function initials(name){return name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()}
function renderDirectory(filter=""){
  const grid=$("#anglerGrid"),feature=$("#featuredAngler"); if(!grid||!feature)return;
  const q=(filter||"").trim().toLowerCase();
  const list=ANGLERS.filter(a=>!q||a.name.toLowerCase().includes(q));
  grid.innerHTML=list.map(a=>'<button class="angler-row" data-angler="'+a.key+'"><span class="angler-avatar">'+initials(a.name)+'</span><span><b>'+a.name+'</b><small>'+a.home+'</small></span><strong>›</strong></button>').join("") || '<div class="card"><b>No matching anglers.</b></div>';
  $$(".angler-row").forEach(b=>b.onclick=()=>{state.anglerKey=b.dataset.angler;renderDirectory($("#anglerSearch")?.value||"")});
  const a=ANGLERS.find(x=>x.key===state.anglerKey)||ANGLERS[0];
  const hasStats=Number.isFinite(a.trips);
  feature.innerHTML='<div class="featured-avatar">'+initials(a.name)+'</div><div class="featured-copy"><small>FEATURED ANGLER</small><h3>'+a.name+'</h3><p>📍 '+a.home+'</p></div>'+
    (hasStats?'<div class="angler-stats"><div><small>Total Trips</small><b>'+a.trips+'</b></div><div><small>Total Catches</small><b>'+a.catches+'</b></div><div><small>Hours Fished</small><b>'+a.hours+'</b></div><div><small>Largest Recorded</small><b>'+a.largest+'</b></div></div>':'<div class="profile-pending">Public profile available. Detailed journal statistics will appear as verified profile data is synced.</div>');
  if($("#anglerSearch")&&!$("#anglerSearch").dataset.wired){
    $("#anglerSearch").dataset.wired="1";
    $("#anglerSearch").addEventListener("input",e=>renderDirectory(e.target.value));
    $("#findAnglersBtn").onclick=()=>renderDirectory($("#anglerSearch").value);
  }
}

const KNOTS={
 palomar:{title:"Palomar Knot",subtitle:"Mono / fluoro / braid",steps:[
  {title:"Double and thread",text:"Feed the doubled loop through the eye.",draw:"palomar1"},
  {title:"Tie loose overhand",text:"Tie an overhand knot in the doubled line, leaving a large loop.",draw:"palomar2"},
  {title:"Pass lure through",text:"Pass the hook or lure completely through the doubled loop.",draw:"palomar3"},
  {title:"Wet and cinch",text:"Moisten the line and pull both standing line and tag until the knot seats.",draw:"palomar4"}
 ]},
 alberto:{title:"Alberto Knot",subtitle:"Leader connection",steps:[
  {title:"Form leader loop",text:"Fold the leader into a loop and pass the braid through it.",draw:"alberto1"},
  {title:"Wrap away",text:"Wrap the braid around both leader legs several times away from the loop.",draw:"alberto2"},
  {title:"Wrap back",text:"Reverse direction and wrap back toward the leader loop.",draw:"alberto3"},
  {title:"Exit and cinch",text:"Exit through the same side of the loop, wet, and pull all lines tight.",draw:"alberto4"}
 ]},
 doubleuni:{title:"Double Uni Knot",subtitle:"Mono-to-braid connection",steps:[
  {title:"Overlap lines",text:"Overlap the two lines with tag ends pointing in opposite directions.",draw:"double1"},
  {title:"Tie first uni",text:"Form a loop with the first tag and make wraps around both lines.",draw:"double2"},
  {title:"Tie second uni",text:"Repeat the uni knot on the second line.",draw:"double3"},
  {title:"Pull together",text:"Pull the standing lines so both knots slide together firmly.",draw:"double4"}
 ]},
 fg:{title:"FG Knot",subtitle:"Slim braid-to-leader",steps:[
  {title:"Cross under tension",text:"Keep the leader under tension and cross the braid over it.",draw:"fg1"},
  {title:"Alternate wraps",text:"Alternate braid wraps over and under the leader to build the grip.",draw:"fg2"},
  {title:"Lock the weave",text:"Finish the weave with locking half hitches around both lines.",draw:"fg3"},
  {title:"Trim and finish",text:"Trim the leader closely and add final half hitches on the braid.",draw:"fg4"}
 ]}
};

function knotSvg(kind){
 const eye='<path class="hook" d="M180 180 q0 28 22 28 q20 0 20-22 q0-18-17-18" />';
 const blue='stroke="#65dff6"', gold='stroke="#f5cf58"';
 const path=(d,c=blue,w=8)=>'<path class="knot-line" d="'+d+'" fill="none" '+c+' stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';
 const circle=(cx,cy,r)=>'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#e7e2d0" stroke-width="7"/>';
 switch(kind){
  case"palomar1":return circle(180,180,20)+path("M105 42 L105 135 Q105 176 150 176 L178 176")+path("M125 42 L125 130 Q125 155 154 155 L178 155",gold);
  case"palomar2":return circle(180,180,20)+path("M92 48 C92 100 120 110 150 88 C180 66 210 84 218 112 C225 140 205 155 180 154 C145 152 126 132 112 112")+path("M118 50 C118 92 140 103 160 92",gold);
  case"palomar3":return circle(180,180,20)+path("M82 54 C120 68 140 96 135 125 C132 150 150 164 180 164 C212 164 235 143 238 112")+path("M110 55 C152 72 175 105 170 136 C168 153 183 166 204 166",gold);
  case"palomar4":return circle(180,180,20)+path("M115 45 L154 142 Q160 158 180 160 L214 45")+path("M140 45 L166 140 Q170 151 183 153 L197 45",gold);
  case"alberto1":return path("M72 110 Q130 62 194 110 Q130 158 72 110",gold)+path("M110 42 L110 110 L286 110");
  case"alberto2":return path("M72 110 Q130 62 194 110 Q130 158 72 110",gold)+path("M112 42 L112 110 C142 75 162 146 188 82 C210 136 232 82 258 112");
  case"alberto3":return path("M72 110 Q130 62 194 110 Q130 158 72 110",gold)+path("M112 42 L112 110 C142 75 162 146 188 82 C210 136 232 82 258 112 C230 148 205 76 180 142 C155 84 135 140 112 110");
  case"alberto4":return path("M62 110 L290 110",gold)+path("M76 96 C110 70 132 146 158 82 C182 144 208 78 236 112 C250 126 265 118 288 110");
  case"double1":return path("M60 100 L300 100")+path("M60 132 L300 132",gold);
  case"double2":return path("M60 100 L300 100")+path("M60 132 L300 132",gold)+path("M110 132 C86 160 112 178 142 154 C160 140 145 116 125 116",gold,6);
  case"double3":return path("M60 100 L300 100")+path("M60 132 L300 132",gold)+path("M110 132 C86 160 112 178 142 154 C160 140 145 116 125 116",gold,6)+path("M250 100 C278 72 252 54 222 76 C204 90 220 114 242 114",blue,6);
  case"double4":return path("M60 116 L145 116 C155 92 169 140 180 116 C192 92 205 140 218 116 L300 116")+path("M145 116 C155 92 169 140 180 116",gold,7);
  case"fg1":return path("M65 118 L295 118",gold,10)+path("M110 55 C120 88 135 92 150 118 C164 145 177 150 190 180");
  case"fg2":return path("M65 118 L295 118",gold,10)+path("M105 55 C118 88 132 92 145 118 C157 145 169 148 181 118 C193 88 205 92 217 118 C230 145 242 148 255 118");
  case"fg3":return path("M65 118 L295 118",gold,10)+path("M105 55 C118 88 132 92 145 118 C157 145 169 148 181 118 C193 88 205 92 217 118 C230 145 242 148 255 118")+path("M252 118 q18 -28 34 0 q-18 28-34 0");
  default:return path("M65 118 L295 118",gold,10)+path("M120 55 C132 88 145 92 157 118 C169 145 181 148 193 118 C205 88 217 92 229 118 C241 145 253 148 265 118")+path("M258 118 q18 -26 32 0 q-18 26-32 0");
 }
}

function renderKnots(){
 const root=$("#knotList"); if(!root)return;
 root.innerHTML=Object.entries(KNOTS).map(([key,k])=>'<button class="knot-card '+(key===state.knotKey?"active":"")+'" data-knot="'+key+'"><div class="knot-mini">'+knotSvg(k.steps[3].draw)+'</div><b>'+k.title+'</b><span>'+k.subtitle+'</span><strong>Practice · 4 steps</strong></button>').join("");
 $$(".knot-card").forEach(b=>b.onclick=()=>{state.knotKey=b.dataset.knot;state.knotStep=0;stopKnot();renderKnots()});
 renderKnotStep();
 wireKnotControls();
}
function stopKnot(){state.knotPlaying=false;clearInterval(state.knotTimer);if($("#knotPlayBtn"))$("#knotPlayBtn").textContent="▶ Play steps"}
function renderKnotStep(){
 const k=KNOTS[state.knotKey],s=k.steps[state.knotStep]; if(!k||!$("#knotSvg"))return;
 $("#knotGuideTitle").textContent=k.title+" · "+s.title;
 $("#knotStepCount").textContent="Step "+(state.knotStep+1)+" of 4";
 $("#knotStepText").textContent=s.text;
 $("#knotSvg").innerHTML=knotSvg(s.draw);
 $("#knotSvg").classList.remove("animate");void $("#knotSvg").offsetWidth;$("#knotSvg").classList.add("animate");
 $("#knotDots").innerHTML=k.steps.map((_,i)=>'<button class="knot-dot '+(i===state.knotStep?"active":"")+'" data-knot-step="'+i+'" aria-label="Step '+(i+1)+'"></button>').join("");
 $$(".knot-dot").forEach(b=>b.onclick=()=>{state.knotStep=+b.dataset.knotStep;stopKnot();renderKnotStep()});
}
function wireKnotControls(){
 if(!$("#knotPlayBtn")||$("#knotPlayBtn").dataset.wired)return;
 $("#knotPlayBtn").dataset.wired="1";
 $("#knotPrevBtn").onclick=()=>{state.knotStep=Math.max(0,state.knotStep-1);stopKnot();renderKnotStep()};
 $("#knotNextBtn").onclick=()=>{state.knotStep=Math.min(3,state.knotStep+1);stopKnot();renderKnotStep()};
 $("#knotReplayBtn").onclick=()=>renderKnotStep();
 $("#knotPlayBtn").onclick=()=>{if(state.knotPlaying){stopKnot();return}state.knotPlaying=true;$("#knotPlayBtn").textContent="❚❚ Pause";state.knotTimer=setInterval(()=>{if(state.knotStep>=3){stopKnot();return}state.knotStep++;renderKnotStep()},1700)};
}
function renderLearningLibrary(group,selector){
  const root=$(selector); if(!root)return;
  const source=SITE_DATA[group]||{};
  const entries=Object.entries(source);
  root.innerHTML=entries.map(([key,d])=>{
    const title=d.title||key;
    const summary=d.summary||(
      group==="techniques"?"Technique lesson from the Kayak Fishing Journal learning library.":
      group==="science"?"Fishing-condition lesson from the Kayak Fishing Journal learning library.":
      "Knot lesson from the Kayak Fishing Journal learning library."
    );
    return '<article class="card learn-library-card"><b>'+title+'</b><span>'+summary+'</span></article>';
  }).join("")||'<article class="card"><b>Library unavailable offline.</b><span>Reconnect once to cache the learning dataset.</span></article>';
}
function renderProfile(){
  const p=state.profile,a=state.account;
  $("#profileName").textContent=p.name||"Guest Angler";
  $("#profileHome").textContent=a?(p.home||a.email):"Not signed in";
  $("#signinCard").hidden=!!a; $("#profileCard").hidden=!a;
  if(p.photo){$("#profileImage").src=p.photo;$("#profileImage").hidden=false;$("#profileFallback").hidden=true}else{$("#profileImage").hidden=true;$("#profileFallback").hidden=false}
  $("#nameInput").value=p.name==="Guest Angler"?"":p.name||"";
  if(a){
    $("#homeInput").value=p.home||"";$("#aboutInput").value=p.about||"";$("#kayakInput").value=p.kayak||"";$("#electronicsInput").value=p.electronics||"";$("#teamsInput").value=p.teams||"";$("#sponsorsInput").value=p.sponsors||"";
  }
}
$("#showPasswordBtn").onclick=()=>{const p=$("#passwordInput");const show=p.type==="password";p.type=show?"text":"password";$("#showPasswordBtn").textContent=show?"Hide":"Show"};
$("#signinBtn").onclick=()=>{const email=$("#emailInput").value.trim(),name=$("#nameInput").value.trim(),pw=$("#passwordInput").value;if(!email.includes("@"))return $("#signinStatus").textContent="Enter a valid email.";if(pw.length<6)return $("#signinStatus").textContent="Password must be at least 6 characters.";state.account={email};if(name)state.profile.name=name;save("kfj2_account",state.account);save("kfj2_profile",state.profile);$("#signinStatus").textContent="Signed in.";renderProfile()};
$("#signoutBtn").onclick=()=>{state.account=null;save("kfj2_account",null);renderProfile()};
$("#profilePhotoInput").onchange=async e=>{const f=e.target.files[0];if(!f)return;state.profile.photo=await compressImage(f,500,.72);renderProfile()};
$("#saveProfileBtn").onclick=()=>{state.profile.home=$("#homeInput").value.trim();state.profile.about=$("#aboutInput").value.trim();state.profile.kayak=$("#kayakInput").value.trim();state.profile.electronics=$("#electronicsInput").value.trim();state.profile.teams=$("#teamsInput").value.trim();state.profile.sponsors=$("#sponsorsInput").value.trim();save("kfj2_profile",state.profile);renderProfile()};
function compressImage(file,max,q){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{let w=im.width,h=im.height,s=Math.min(1,max/Math.max(w,h));w=Math.round(w*s);h=Math.round(h*s);const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(im,0,0,w,h);resolve(c.toDataURL("image/jpeg",q))};im.onerror=reject;im.src=r.result};r.onerror=reject;r.readAsDataURL(file)})}

function renderTrip(){
  const t=state.trip;
  $("#catchCount").textContent=t?.catches?.length||0;
  const vals=t?.catches?.map(c=>+c.length||0).filter(Boolean)||[];
  $("#largestCatch").textContent=vals.length?Math.max(...vals).toFixed(2)+'″':"—";
  if(t?.active&&t.start){const mins=Math.max(1,Math.round((Date.now()-t.start)/60000));$("#minCatch").textContent=t.catches.length?(mins/t.catches.length).toFixed(1):"—"}else $("#minCatch").textContent="—";
}
$("#startTripBtn").onclick=()=>{state.trip={active:true,start:Date.now(),catches:[],photos:[],notes:""};save("kfj2_trip",state.trip);renderTrip()};
$("#logCatchBtn").onclick=()=>{if(!state.trip?.active)return alert("Start a trip first.");const len=prompt("Fish length in inches (optional):","");state.trip.catches.push({length:len||""});save("kfj2_trip",state.trip);renderTrip()};
$("#tripPhotoBtn").onclick=()=>alert("Trip photo capture is the next module in the clean rebuild.");
$("#endTripBtn").onclick=()=>{if(!state.trip?.active)return;state.trip.active=false;state.trip.end=Date.now();state.journal.unshift(state.trip);save("kfj2_journal",state.journal);save("kfj2_trip",null);state.trip=null;renderTrip();location.hash="#/journal"};
setInterval(()=>{if(state.trip?.active&&state.trip.start){const s=Math.floor((Date.now()-state.trip.start)/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;$("#tripTimer").textContent=[h,m,sec].map(v=>String(v).padStart(2,"0")).join(":")}},1000);
function renderJournal(){
  const el=$("#journalList");
  el.innerHTML=state.journal.length?state.journal.map((t,i)=>'<article class="card"><b>'+(t.location||"Saved Trip")+'</b><span>'+new Date(t.start).toLocaleDateString()+' • '+(t.catches?.length||0)+' catches</span></article>').join(""):'<article class="card"><b>No saved trips yet.</b><span>Start a trip and your journal will build here.</span></article>';
}
route(); renderProfile(); renderTrip(); renderJournal();
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});