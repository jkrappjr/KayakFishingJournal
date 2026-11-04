const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={trip:load("kfj2_trip",null),journal:load("kfj2_journal",[]),profile:load("kfj2_profile",{name:"Guest Angler",home:"",about:"",kayak:"",electronics:"",teams:"",sponsors:"",photo:""}),account:load("kfj2_account",null),lessonStep:0,lessonPlaying:false,lessonTimer:null};

const lessons={
eddy:{title:"Eddies & Backwater",scene:"eddy",steps:[
["SEE IT","Find the slow or rotating water and the seam where it meets the main current."],
["UNDERSTAND IT","Bass can hold with less effort while forage is delivered beside them."],
["FISH IT","Keep the kayak outside the prime holding water. Fish seam, center, then exit."],
["TRY IT","Repeat the same angle before changing bait, depth or speed."]
]},
seam:{title:"Current Seam",scene:"seam",steps:[["SEE IT","Find the visible speed or surface-texture line."],["UNDERSTAND IT","Fast water delivers food beside soft holding water."],["FISH IT","Cast across or beyond the seam and let the bait enter naturally."],["TRY IT","Compare upstream, perpendicular and downstream angles."]]},
boulder:{title:"Boulder / Current Break",scene:"boulder",steps:[["SEE IT","Identify the rock and protected pocket."],["UNDERSTAND IT","The obstruction creates current relief."],["FISH IT","Fish upstream edge, pocket and downstream seam."],["TRY IT","Test a natural drift before changing lure."]]},
ledge:{title:"Ledge / Drop",scene:"ledge",steps:[["SEE IT","Find the shallow-to-deep transition."],["UNDERSTAND IT","Fish use the depth break as travel and feeding cover."],["FISH IT","Present along the edge, not only across it."],["TRY IT","Work shallow lip, face and base."]]},
riffle:{title:"Shoal / Riffle",scene:"riffle",steps:[["SEE IT","Locate broken shallow current and the first drop."],["UNDERSTAND IT","Oxygen, forage and current concentrate fish."],["FISH IT","Target pockets and the first deeper water."],["TRY IT","Compare fast pocket vs first drop."]]},
tailout:{title:"Pool Tailout",scene:"tailout",steps:[["SEE IT","Find where the pool narrows and accelerates."],["UNDERSTAND IT","The exit funnels forage and moving fish."],["FISH IT","Work both seams and the center tongue."],["TRY IT","Compare upstream drift with cross-current presentation."]]}
};

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
  if(name==="journal")renderJournal();
  if(name==="on-trip")renderTrip();
  scrollTo(0,0);
}
addEventListener("hashchange",route);

function renderLesson(key){
  const l=lessons[key]||lessons.eddy;
  state.lessonKey=key; state.lessonStep=Math.min(state.lessonStep,3);
  $("#lessonTitle").textContent=l.title;
  $("#lessonSteps").innerHTML=l.steps.map((s,i)=>'<button data-step="'+i+'" class="'+(i===state.lessonStep?"active":"")+'">'+(i+1)+" "+s[0]+'</button>').join("");
  $("#lessonCopy").innerHTML="<h3>"+l.steps[state.lessonStep][0]+"</h3><p>"+l.steps[state.lessonStep][1]+"</p>";
  $("#lessonPhoto").className="lesson-photo scene-"+l.scene+" step-"+state.lessonStep;
  $("#motionOverlay").className="motion-overlay scene-"+l.scene+(state.lessonPlaying?" playing":"")+" step-"+state.lessonStep;
  $("#motionOverlay").innerHTML=sceneMarkup(l.scene,state.lessonStep);
  $$(".steps button").forEach(b=>b.onclick=()=>{state.lessonStep=+b.dataset.step;stopLesson();renderLesson(key)});
}
function sceneMarkup(scene,step){
  const cap=[
    "SEE IT — identify the feature.",
    "UNDERSTAND IT — see how current and fish position relate.",
    "FISH IT — visualize kayak position and cast path.",
    "TRY IT — focus on the highest-percentage target."
  ][step];
  if(scene==="eddy")return '<div class="flow a">➜</div><div class="flow b">➜</div><div class="eddy-ring"></div><div class="target"></div><div class="kayak"></div><div class="scene-label">'+cap+'</div>';
  if(scene==="seam")return '<div class="lane fast"></div><div class="lane slow"></div><div class="seam-line"></div><div class="flow a">➜</div><div class="flow b">➜</div><div class="target seam-target"></div><div class="kayak seam-kayak"></div><div class="scene-label">'+cap+'</div>';
  if(scene==="boulder")return '<div class="rock-shape"></div><div class="flow a">➜</div><div class="flow b">➜</div><div class="soft-pocket"></div><div class="target boulder-target"></div><div class="kayak"></div><div class="scene-label">'+cap+'</div>';
  if(scene==="ledge")return '<div class="ledge-shallow"></div><div class="ledge-deep"></div><div class="ledge-edge"></div><div class="target ledge-target"></div><div class="kayak"></div><div class="scene-label">'+cap+'</div>';
  if(scene==="riffle")return '<div class="riffle-rock r1"></div><div class="riffle-rock r2"></div><div class="riffle-rock r3"></div><div class="flow a">➜</div><div class="flow b">➜</div><div class="target riffle-target"></div><div class="kayak"></div><div class="scene-label">'+cap+'</div>';
  return '<div class="tail-bank left"></div><div class="tail-bank right"></div><div class="flow tail1">↓</div><div class="flow tail2">↓</div><div class="target tail-target"></div><div class="kayak"></div><div class="scene-label">'+cap+'</div>';
}
function stopLesson(){state.lessonPlaying=false;clearInterval(state.lessonTimer);$("#motionOverlay").classList.remove("playing");$("#playLesson").textContent="▶ Play"}
$("#prevLesson").onclick=()=>{state.lessonStep=Math.max(0,state.lessonStep-1);stopLesson();renderLesson(state.lessonKey||"eddy")};
$("#nextLesson").onclick=()=>{state.lessonStep=Math.min(3,state.lessonStep+1);stopLesson();renderLesson(state.lessonKey||"eddy")};
$("#playLesson").onclick=()=>{if(state.lessonPlaying){stopLesson();return}state.lessonPlaying=true;$("#motionOverlay").classList.add("playing");$("#playLesson").textContent="❚❚ Pause";state.lessonTimer=setInterval(()=>{if(state.lessonStep>=3){stopLesson();return}state.lessonStep++;renderLesson(state.lessonKey||"eddy");$("#motionOverlay").classList.add("playing")},2600)};

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