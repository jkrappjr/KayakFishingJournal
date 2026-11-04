const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={trip:load("kfj2_trip",null),journal:load("kfj2_journal",[]),profile:load("kfj2_profile",{name:"Guest Angler",home:"",about:"",kayak:"",electronics:"",teams:"",sponsors:"",photo:""}),account:load("kfj2_account",null),lessonStep:0,lessonPlaying:false,lessonTimer:null,knotKey:"palomar",knotStep:0,knotPlaying:false,knotTimer:null,anglerKey:"austin-lilly",baitKey:"ned",baitTab:"quick",baitPlaying:false,baitRAF:null};

const SITE_DATA=window.WVKA_LEARN_DATA||{water:{},techniques:{},science:{},knots:{}};
const BAIT_DATA=window.KFJ_BAITS||{source:{anglers:80,selections:240},families:[]};
const BAITS=BAIT_DATA.families||[];
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
  if(name==="techniques")renderBaitLibrary();
  if(name==="technique")renderBaitTutorial(parts[1]||"ned");
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


const ANGLERS=window.KFJ_ANGLERS||[];

function initials(name){return name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()}
function renderDirectory(filter=""){
  const grid=$("#anglerGrid"),feature=$("#featuredAngler"); if(!grid||!feature)return;
  const q=(filter||"").trim().toLowerCase();
  const list=ANGLERS.filter(a=>!q||a.name.toLowerCase().includes(q));
  grid.innerHTML=list.map(a=>'<button class="angler-row" data-angler="'+a.key+'"><img class="angler-thumb" src="'+a.photo+'" alt=""><span><b>'+a.name+'</b></span><strong>›</strong></button>').join("") || '<div class="card"><b>No matching anglers.</b></div>';
  $$(".angler-row").forEach(b=>b.onclick=()=>{state.anglerKey=b.dataset.angler;renderDirectory($("#anglerSearch")?.value||"")});
  const a=ANGLERS.find(x=>x.key===state.anglerKey)||ANGLERS[0];
  const stat=(v)=>v==null?"—":v;
  feature.innerHTML='<div class="featured-photo-wrap"><img class="featured-photo" src="'+a.photo+'" alt="'+a.name+'"></div>'+
    '<div class="featured-copy"><small>FEATURED ANGLER</small><h3>'+a.name+'</h3>'+(a.home?'<p>📍 '+a.home+'</p>':'')+'</div>'+
    '<div class="angler-stats"><div><small>Total Trips</small><b>'+stat(a.trips)+'</b></div><div><small>Total Catches</small><b>'+stat(a.catches)+'</b></div><div><small>Hours Fished</small><b>'+stat(a.hours)+'</b></div><div><small>Largest Recorded</small><b>'+stat(a.largest)+'</b></div></div>';
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
 const blue="#65dff6",gold="#f5cf58",white="#f3efe2";
 const line=(id,d,color=blue,w=8,cls="")=>'<path id="'+id+'" class="knot-line '+cls+'" d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';
 const dot=(x,y,color=gold)=>'<circle class="guide-dot" cx="'+x+'" cy="'+y+'" r="7" fill="'+color+'"/>';
 const eye='<circle cx="180" cy="180" r="20" fill="none" stroke="'+white+'" stroke-width="7"/>';
 switch(kind){
  case"palomar1":
   return eye+
    line("p1a","M105 42 L105 118 Q105 155 145 165 L178 176",blue,9,"base-line")+
    line("p1b","M125 42 L125 116 Q125 145 151 154 L178 160",gold,9,"moving-line")+
    dot(125,42);
  case"palomar2":
   return eye+
    line("p2base","M105 45 L105 150 Q105 168 128 168 L180 168",blue,9,"base-line")+
    line("p2move","M125 45 C125 95 155 105 185 82 C215 60 248 82 248 116 C248 150 216 164 184 154 C155 146 140 127 126 110",gold,9,"moving-line")+
    dot(125,45);
  case"palomar3":
   return eye+
    line("p3loop","M90 50 C112 65 132 92 130 120 C127 153 151 170 183 170 C220 170 246 145 245 106",blue,9,"base-line")+
    line("p3move","M115 53 C154 73 176 106 170 137 C167 158 186 174 208 168",gold,9,"moving-line")+
    '<path class="hook-shape" d="M180 200 q0 35 25 35 q25 0 25-25 q0-18-18-18" fill="none" stroke="'+white+'" stroke-width="9" stroke-linecap="round"/>'+
    dot(115,53);
  case"palomar4":
   return eye+
    line("p4a","M110 44 L154 140 Q163 158 180 160",blue,9,"cinch-left")+
    line("p4b","M220 44 L198 140 Q193 154 181 160",gold,9,"cinch-right")+
    line("p4wrap","M156 156 C165 142 178 140 188 147 C196 153 196 164 184 170",gold,7,"wrap-line");
  case"alberto1":
   return line("a1leader","M70 110 Q130 62 195 110 Q130 158 70 110",gold,10,"base-line")+
    line("a1braid","M110 42 L110 110 L288 110",blue,8,"moving-line")+dot(110,42);
  case"alberto2":
   return line("a2leader","M70 110 Q130 62 195 110 Q130 158 70 110",gold,10,"base-line")+
    line("a2braid","M112 42 L112 110 C140 78 160 146 186 82 C210 136 232 82 260 112",blue,8,"moving-line")+dot(112,42);
  case"alberto3":
   return line("a3leader","M70 110 Q130 62 195 110 Q130 158 70 110",gold,10,"base-line")+
    line("a3braid","M112 42 L112 110 C140 78 160 146 186 82 C210 136 232 82 260 112 C232 146 208 78 182 142 C156 86 135 140 112 110",blue,8,"moving-line")+dot(260,112);
  case"alberto4":
   return line("a4leader","M62 110 L292 110",gold,10,"cinch-right")+
    line("a4braid","M76 96 C110 72 132 144 158 82 C182 144 208 80 236 112 C252 128 268 118 290 110",blue,8,"cinch-left");
  case"double1":
   return line("d1a","M60 100 L300 100",blue,9,"base-line")+line("d1b","M60 132 L300 132",gold,9,"base-line");
  case"double2":
   return line("d2a","M60 100 L300 100",blue,9,"base-line")+line("d2b","M60 132 L300 132",gold,9,"base-line")+
    line("d2move","M110 132 C86 160 112 178 142 154 C160 140 145 116 125 116",gold,7,"moving-line")+dot(110,132);
  case"double3":
   return line("d3a","M60 100 L300 100",blue,9,"base-line")+line("d3b","M60 132 L300 132",gold,9,"base-line")+
    line("d3left","M110 132 C86 160 112 178 142 154 C160 140 145 116 125 116",gold,7,"base-line")+
    line("d3move","M250 100 C278 72 252 54 222 76 C204 90 220 114 242 114",blue,7,"moving-line")+dot(250,100,blue);
  case"double4":
   return line("d4a","M60 116 L145 116 C155 92 169 140 180 116 C192 92 205 140 218 116 L300 116",blue,9,"cinch-left")+
    line("d4b","M145 116 C155 92 169 140 180 116",gold,7,"cinch-right");
  case"fg1":
   return line("f1leader","M65 118 L295 118",gold,11,"base-line")+line("f1braid","M110 55 C120 88 135 92 150 118 C164 145 177 150 190 180",blue,7,"moving-line")+dot(110,55,blue);
  case"fg2":
   return line("f2leader","M65 118 L295 118",gold,11,"base-line")+line("f2braid","M105 55 C118 88 132 92 145 118 C157 145 169 148 181 118 C193 88 205 92 217 118 C230 145 242 148 255 118",blue,7,"moving-line")+dot(105,55,blue);
  case"fg3":
   return line("f3leader","M65 118 L295 118",gold,11,"base-line")+line("f3braid","M105 55 C118 88 132 92 145 118 C157 145 169 148 181 118 C193 88 205 92 217 118 C230 145 242 148 255 118 M252 118 q18 -28 34 0 q-18 28-34 0",blue,7,"moving-line")+dot(252,118,blue);
  default:
   return line("f4leader","M65 118 L295 118",gold,11,"cinch-right")+line("f4braid","M120 55 C132 88 145 92 157 118 C169 145 181 148 193 118 C205 88 217 92 229 118 C241 145 253 148 265 118 M258 118 q18 -26 32 0 q-18 26-32 0",blue,7,"cinch-left");
 }
}

function prepareKnotMotion(){
 const svg=$("#knotSvg"); if(!svg)return;
 svg.classList.remove("animate","slow-demo");
 void svg.offsetWidth;
 svg.classList.add("slow-demo");
 const movers=[...svg.querySelectorAll(".moving-line")];
 movers.forEach(p=>{
   const len=p.getTotalLength();
   p.style.strokeDasharray=len;
   p.style.strokeDashoffset=len;
 });
}

function playCurrentKnotStep(){
 stopKnot();
 const svg=$("#knotSvg"); if(!svg)return;
 state.knotPlaying=true;
 $("#knotPlayBtn").textContent="❚❚ Pause";
 prepareKnotMotion();
 const movers=[...svg.querySelectorAll(".moving-line")];
 const dots=[...svg.querySelectorAll(".guide-dot")];
 const cinch=[...svg.querySelectorAll(".cinch-left,.cinch-right")];
 const duration=9000, hold=1400, start=performance.now();
 function frame(now){
   if(!state.knotPlaying)return;
   const elapsed=now-start;
   const t=Math.max(0,Math.min(1,elapsed/duration));
   const eased=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
   movers.forEach(p=>{const len=p.getTotalLength();p.style.strokeDashoffset=len*(1-eased)});
   dots.forEach(d=>{
     const p=movers[0];
     if(p){
       const len=p.getTotalLength(),pt=p.getPointAtLength(len*eased);
       d.setAttribute("cx",pt.x);d.setAttribute("cy",pt.y);
     }
   });
   cinch.forEach((p,i)=>{
     const amt=Math.max(0,(t-.45)/.55);
     const dir=p.classList.contains("cinch-left")?-1:1;
     p.style.transformOrigin="180px 160px";
     p.style.transform="translateX("+(dir*22*amt)+"px)";
   });
   if(t<1){state.knotRAF=requestAnimationFrame(frame)}
   else{
     state.knotHold=setTimeout(()=>{
       if(state.knotPlaying){state.knotPlaying=false;$("#knotPlayBtn").textContent="▶ Play step"}
     },hold);
   }
 }
 state.knotRAF=requestAnimationFrame(frame);
}
function renderKnots(){
 const root=$("#knotList"); if(!root)return;
 root.innerHTML=Object.entries(KNOTS).map(([key,k])=>'<button class="knot-card '+(key===state.knotKey?"active":"")+'" data-knot="'+key+'"><div class="knot-mini">'+knotSvg(k.steps[3].draw)+'</div><b>'+k.title+'</b><span>'+k.subtitle+'</span><strong>Practice · 4 steps</strong></button>').join("");
 $$(".knot-card").forEach(b=>b.onclick=()=>{state.knotKey=b.dataset.knot;state.knotStep=0;stopKnot();renderKnots()});
 renderKnotStep();
 wireKnotControls();
}
function stopKnot(){state.knotPlaying=false;clearInterval(state.knotTimer);clearTimeout(state.knotHold);if(state.knotRAF)cancelAnimationFrame(state.knotRAF);if($("#knotPlayBtn"))$("#knotPlayBtn").textContent="▶ Play step"}
function renderKnotStep(){
 const k=KNOTS[state.knotKey],s=k.steps[state.knotStep]; if(!k||!$("#knotSvg"))return;
 $("#knotGuideTitle").textContent=k.title+" · "+s.title;
 $("#knotStepCount").textContent="Step "+(state.knotStep+1)+" of 4";
 $("#knotStepText").textContent=s.text;
 $("#knotSvg").innerHTML=knotSvg(s.draw);
 prepareKnotMotion();
 $("#knotDots").innerHTML=k.steps.map((_,i)=>'<button class="knot-dot '+(i===state.knotStep?"active":"")+'" data-knot-step="'+i+'" aria-label="Step '+(i+1)+'"></button>').join("");
 $$(".knot-dot").forEach(b=>b.onclick=()=>{state.knotStep=+b.dataset.knotStep;stopKnot();renderKnotStep()});
}
function wireKnotControls(){
 if(!$("#knotPlayBtn")||$("#knotPlayBtn").dataset.wired)return;
 $("#knotPlayBtn").dataset.wired="1";
 $("#knotPrevBtn").onclick=()=>{state.knotStep=Math.max(0,state.knotStep-1);stopKnot();renderKnotStep()};
 $("#knotNextBtn").onclick=()=>{state.knotStep=Math.min(3,state.knotStep+1);stopKnot();renderKnotStep()};
 $("#knotReplayBtn").onclick=()=>renderKnotStep();
 $("#knotPlayBtn").onclick=()=>{if(state.knotPlaying){stopKnot();return}playCurrentKnotStep()};
}

function getBait(key){return BAITS.find(b=>b.key===key)||BAITS[0]||null}

function lureSvg(type,mini=false){
 const w=mini?140:260,h=mini?72:130,stroke="#191c19",body="#f3d665",accent="#63d2ec";
 const common='viewBox="0 0 '+w+' '+h+'" aria-hidden="true"';
 const hook='<path d="M188 72 q18 18 2 32 q-14 11-24-1" fill="none" stroke="#ddd7c8" stroke-width="4"/>';
 let inner="";
 switch(type){
  case"ned":inner='<rect x="56" y="51" width="88" height="24" rx="12" fill="#6d7d41"/><circle cx="49" cy="63" r="15" fill="#403f33"/><path d="M49 78 q0 28 20 27" fill="none" stroke="#ddd7c8" stroke-width="4"/>';break;
  case"jerkbait":inner='<path d="M36 65 Q82 35 156 57 Q190 65 205 52 Q195 77 155 79 Q80 89 36 65Z" fill="#e9e5cf" stroke="'+stroke+'" stroke-width="3"/><circle cx="172" cy="60" r="5" fill="#e44738"/>'+hook+'<path d="M78 78 q0 23-15 25" fill="none" stroke="#ddd7c8" stroke-width="4"/>';break;
  case"worm":inner='<path d="M35 63 C65 35 95 88 126 59 C155 32 186 82 218 55" fill="none" stroke="#7a6d42" stroke-width="17" stroke-linecap="round"/>';break;
  case"chatter":inner='<polygon points="72,43 104,57 88,82 55,68" fill="#d7d1ba" stroke="'+stroke+'" stroke-width="3"/><circle cx="110" cy="66" r="14" fill="#5e6843"/><g stroke="#e6c94f" stroke-width="5"><path d="M119 72 l48 35"/><path d="M113 78 l26 43"/><path d="M126 65 l57 20"/></g>'+hook;break;
  case"crank":inner='<ellipse cx="118" cy="62" rx="55" ry="32" fill="#6eb5c6" stroke="'+stroke+'" stroke-width="3"/><circle cx="154" cy="55" r="5" fill="#ec493d"/><polygon points="70,70 34,91 75,79" fill="#ddd7c8" stroke="'+stroke+'" stroke-width="3"/>'+hook;break;
  case"spinner":inner='<path d="M56 45 L132 78 L182 36" fill="none" stroke="#ddd7c8" stroke-width="4"/><ellipse cx="192" cy="31" rx="23" ry="11" fill="#e4d06f" stroke="'+stroke+'" stroke-width="3"/><circle cx="130" cy="79" r="15" fill="#6c7148"/><g stroke="#f2d44f" stroke-width="5"><path d="M133 90 l38 27"/><path d="M124 91 l8 34"/><path d="M142 85 l48 15"/></g>'+hook;break;
  case"fluke":inner='<path d="M34 66 Q75 42 146 51 Q176 55 206 42 L188 65 L208 88 Q176 76 145 80 Q75 89 34 66Z" fill="#f3f0dc" stroke="'+stroke+'" stroke-width="3"/>';break;
  case"topwater":inner='<path d="M38 67 Q85 43 160 56 Q191 60 207 48 Q196 80 158 81 Q86 88 38 67Z" fill="#f0e4c2" stroke="'+stroke+'" stroke-width="3"/><circle cx="174" cy="58" r="5" fill="#e2453e"/><path d="M206 65 l25 -10 l-10 15 l12 12 l-27-4" fill="#ddd7c8" stroke="'+stroke+'" stroke-width="2"/>'+hook;break;
  case"jig":inner='<circle cx="95" cy="62" r="18" fill="#504b3c"/><g stroke="#6f7a42" stroke-width="6"><path d="M106 70 l62 42"/><path d="M101 75 l37 52"/><path d="M112 66 l76 25"/></g><path d="M94 45 q25 -22 42 0" fill="none" stroke="#ddd7c8" stroke-width="4"/>';break;
  case"swim":inner='<path d="M38 67 Q80 42 144 52 Q172 56 190 48 L211 65 L190 82 Q170 74 144 79 Q80 89 38 67Z" fill="#9ab2aa" stroke="'+stroke+'" stroke-width="3"/><circle cx="156" cy="58" r="4" fill="#e0473d"/>';break;
  case"tube":inner='<rect x="56" y="49" width="94" height="31" rx="15" fill="#6a7042"/><g stroke="#6a7042" stroke-width="7"><path d="M143 54 l55-27"/><path d="M144 61 l66-3"/><path d="M143 69 l59 25"/><path d="M139 76 l42 42"/></g>';break;
  case"buzz":inner='<path d="M58 43 L124 76 L177 37" fill="none" stroke="#ddd7c8" stroke-width="4"/><polygon points="181,26 211,37 182,49 165,38" fill="#d8d1bc" stroke="'+stroke+'" stroke-width="3"/><circle cx="124" cy="78" r="14" fill="#30322c"/><g stroke="#eee7cd" stroke-width="5"><path d="M132 87 l44 30"/><path d="M123 92 l15 34"/></g>'+hook;break;
  default:inner='<ellipse cx="106" cy="65" rx="46" ry="25" fill="#7a6d42"/><path d="M145 64 l50-27 l-16 30 l20 30 l-54-23" fill="#7a6d42"/><path d="M80 77 q25 25 55 5" fill="none" stroke="#ddd7c8" stroke-width="4"/>';
 }
 return '<svg '+common+'><g transform="'+(mini?'scale(.53) translate(5 0)':'')+'">'+inner+'</g></svg>';
}

function renderBaitLibrary(){
 const root=$("#techniqueList"); if(!root)return;
 root.innerHTML=BAITS.map(b=>{
   const stat=b.count!=null?'<span class="bait-stat-badge">'+b.count+' picks · '+b.pct+'%</span>':'<span class="bait-stat-badge secondary">Community bait</span>';
   return '<a class="bait-card" href="#/technique/'+b.key+'"><div class="bait-thumb">'+lureSvg(b.icon,true)+'</div><div class="bait-card-copy"><b>'+b.title+'</b>'+stat+'<small>'+b.examples.slice(0,2).join(" • ")+'</small></div><strong>›</strong></a>';
 }).join("");
}

function renderBaitTutorial(key){
 const b=getBait(key); if(!b)return;
 state.baitKey=b.key;
 $("#baitTitle").textContent=b.title.toUpperCase();
 $("#baitCategoryKicker").textContent=b.count!=null?b.count+" OF 240 COMMUNITY PICKS · "+b.pct+"%":"COMMUNITY BAIT TUTORIAL";
 $("#baitArt").innerHTML=lureSvg(b.icon,false);
 $("#baitCommunityStat").innerHTML='<b>'+b.title+'</b><span>'+b.examples.join(" • ")+'</span>';
 $$(".bait-tab").forEach(btn=>{btn.classList.toggle("active",btn.dataset.baitTab===state.baitTab);btn.onclick=()=>{state.baitTab=btn.dataset.baitTab;renderBaitTutorial(b.key)}});
 renderBaitLesson(b);
 drawBaitMotion(b,0);
 if($("#playBaitMotion"))$("#playBaitMotion").onclick=()=>state.baitPlaying?stopBaitMotion():playBaitMotion();
}

function renderBaitLesson(b){
 const root=$("#baitLessonContent");if(!root)return;
 if(state.baitTab==="quick"){
  root.innerHTML='<article class="bait-info-panel"><h3>HOW TO FISH IT</h3><p>'+b.retrieve+'</p><div class="bait-chip-row">'+b.colors.map(x=>'<span>'+x+'</span>').join("")+'</div></article>';
 }else if(state.baitTab==="learn"){
  root.innerHTML='<article class="bait-info-panel"><h3>WHERE IT SHINES</h3><div class="bait-water-grid">'+b.water.map(x=>'<span>✓ '+x+'</span>').join("")+'</div><h3>WHY IT WORKS</h3><p>'+b.why+'</p></article>';
 }else{
  const stat=b.count!=null?'<div class="community-proof"><b>'+b.count+'</b><span>of 240 WV angler selections<br>'+b.pct+'% of the dataset</span></div>':'';
  root.innerHTML='<article class="bait-info-panel">'+stat+'<h3>COMMUNITY EXAMPLES</h3><ul>'+b.examples.map(x=>'<li>'+x+'</li>').join("")+'</ul><h3>APPLICATION</h3><p>'+b.retrieve+' Match the presentation to the current speed, depth, cover and fish activity shown in the River Tutorials and Science sections.</p></article>';
 }
}

function baitMotionShape(b){
 return lureSvg(b.icon,false).replace('<svg viewBox="0 0 260 130" aria-hidden="true">','<g id="movingBait" transform="translate(0 0)">').replace('</svg>','</g>');
}
function drawBaitMotion(b,t){
 const svg=$("#baitMotion");if(!svg)return;
 const progress=Math.max(0,Math.min(1,t));
 let x=70+progress*470,y=145,rot=0;
 if(b.key==="ned"||b.key==="jig"||b.key==="craw"){y=230-Math.abs(Math.sin(progress*Math.PI*5))*70;rot=-8+Math.sin(progress*Math.PI*5)*10}
 else if(b.key==="jerkbait"){x=70+progress*470+Math.sin(progress*Math.PI*10)*22;y=120+Math.sin(progress*Math.PI*6)*8;rot=Math.sin(progress*Math.PI*10)*5}
 else if(b.key==="softplastic"||b.key==="tube"){y=75+progress*155+Math.sin(progress*Math.PI*6)*10;rot=progress*210}
 else if(b.key==="crankbait"){y=80+Math.sin(progress*Math.PI)*125;rot=8}
 else if(b.key==="topwater"||b.key==="buzzbait"){y=72+Math.sin(progress*Math.PI*10)*7;rot=Math.sin(progress*Math.PI*8)*3}
 else if(b.key==="fluke"){y=100+Math.sin(progress*Math.PI*4)*36;rot=Math.sin(progress*Math.PI*5)*10}
 else if(b.key==="chatterbait"||b.key==="spinnerbait"){y=145+Math.sin(progress*Math.PI*18)*6;rot=Math.sin(progress*Math.PI*18)*5}
 else if(b.key==="swimbait"){y=145+Math.sin(progress*Math.PI*8)*13;rot=Math.sin(progress*Math.PI*8)*4}
 svg.innerHTML='<defs><linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d91a4"/><stop offset="1" stop-color="#123f4a"/></linearGradient></defs><rect width="640" height="300" fill="url(#water)"/><path d="M0 245 Q90 225 170 244 T340 242 T510 246 T680 238 V300 H0Z" fill="#6b644a"/><path d="M0 252 Q110 235 210 252 T420 249 T650 248" fill="none" stroke="#91866b" stroke-width="8"/><path d="M32 55 C150 36 250 64 360 48 S545 45 620 58" fill="none" stroke="#b8edf4" stroke-width="5" stroke-dasharray="18 15" opacity=".8"/><g transform="translate('+x+' '+y+') rotate('+rot+') scale(.62) translate(-130 -65)">'+baitMotionShape(b)+'</g><text x="20" y="28" fill="#f8db75" font-size="18" font-weight="800">'+b.title+'</text>';
}
function stopBaitMotion(){state.baitPlaying=false;if(state.baitRAF)cancelAnimationFrame(state.baitRAF);if($("#playBaitMotion"))$("#playBaitMotion").textContent="▶ Play Presentation"}
function playBaitMotion(){
 const b=getBait(state.baitKey);if(!b)return;
 state.baitPlaying=true;$("#playBaitMotion").textContent="❚❚ Pause";
 const start=performance.now(),duration=6500;
 const tick=now=>{if(!state.baitPlaying)return;const t=(now-start)/duration;if(t>=1){drawBaitMotion(b,1);stopBaitMotion();return}drawBaitMotion(b,t);state.baitRAF=requestAnimationFrame(tick)};
 state.baitRAF=requestAnimationFrame(tick);
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