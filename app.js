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


const ANGLERS=[{"key":"austin-lilly","name":"Austin Lilly","home":"Hinton WV","trips":3,"catches":109,"hours":15,"largest":"17.25 in","photo":"data:image/webp;base64,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"},{"key":"john-rapp","name":"John Rapp","home":"","trips":null,"catches":null,"hours":null,"largest":null,"photo":"data:image/webp;base64,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"},{"key":"greg-harper","name":"Greg Harper","home":"","trips":null,"catches":null,"hours":null,"largest":null,"photo":"data:image/webp;base64,UklGRvQEAABXRUJQVlA4IOgEAACQFwCdASpQAFAAPrFInUonJCKhsLYvUOAWCWQAwB+cyOCavTnLfXrmGfq8PVeytZihE7RdoQ4aK2ROeWB1GFUFw6RnEuu1lGywwXSu3IVg6EZBTxk9O4Nh46oblJyoBF1CZw6M4Lymek9cdb8FXehGZztj9BP0fEBCpl78183LEeSfzd2U1oVMvQlZu/4Zs+kemRUr2IUlwUOC+7xi7okw3CVucSMTrLTZof/Gz2/d9waB4RVCplJzUENHGCSd6Tl9lrV1AAD+5W3w2GTIpD+F/mrtfmZmZaRIoxv8f7sJXeRSSVfT9dC5HlCaf/DIcIBzPIzeEA4lQek+m4GEZ3TDGMwNdELQAE4K/D5EKGfirWn7TrcIgqeKXYy2OtiLK44f3d/Egvci+YRbOeUrn/3UjwkousbUOL7mZ3wbw85PMEgRhUZvkgN51BXhQVeXGTG29Jw4FBJqlYV1gxzZhWO+jYNkVonGHfpYGhrQcrqGX4FlALeqkbVVj58C6WKgameCYH+pofWczmpCWmuwtWH3xwNLbwPcg7mzBiNUnf47takoWsP5Ldl9uKyy9eFjsbpRjzmvZRPRLsEWWaJc85X46e8deCkylHWiNxmkNjSjpBi6n/Bx/DgPOHBpObvrJS/VHFwJ1SsogsivvnqSq2QBIA59IsPVObh0v4erou5lH8PLB4sLQrAcVAUkUF7ihSxgoQdNHRB53fJuk+K83/y33ipX58CW7Yk1HTJRokCEpxclKiv5J959xaECL2+G9rbH8vLWeJ8ovo1TQSjoFWPoT0FkzcTIqySVChRUBBF2VhbvazNG6+48zXqWRVABGOpNYDjqco7CQD1d6at0KAyYy7r4kP6WQoHhiXNKyDzR2SRYYBRGLBcBtobJlegtzNBJRPxUu3d118amdAlMMDxRQLN2b1SPQa2Fni8rYE0hOuETOJ+SBjCBZRSfP33SgI4FlPWlO3kz1ZWG/uSSz/a/sMln5JaI/IWsF1w67MD4lXLDOBtTHB1WYtWqvVbLXXmQ1GxGDPxv4klF1Edyw/WJnp1y7LbNJzGawu8xWhg8lF/i6o9xteAfNaJRDTTEp2MI3Od0KlDcXQBmKbXsI1eadQVKjPJawOSfifJI+Z7a086t1u02CV2CCIdP2erkJqbcOa1zFG2ZCiJYi6nBQsgZBQ8E2OqAjIUTzUDg7S+lKMxNEu7KQVCKg+0iNW0ZaVFlqCeLO/DGlt7cKJiDPleRctWe/GGcNL6/RN+0ow0BJmKqvPmd86AQYy6g5BI6XDb7EqHJ3ZxZ2hCrAYLMe+Z3YLgZbxACgiZEY+mwu3CrbgtyEObS5fPn03C86oYaa2VOr0Dtht7F57IVN8rTtnyV6O85KTeSv3OIPFHYYmVBXqAxxEuaLPsrJC6t38F0knARZTsoLP68KjE9Ebkh+Enn155/QFCU7H6ITwmiBeoHkZPpJJJcDyV1ecQCf5CzlVJ975S/XE0PsCdBkqCS//jDB4WlZvgKrZI7/NW+VWsZA4NGjT5oq5BcMpMlZ24QxFbDuVanJk6AwoC/7GdPk9yMo7B/rXlPRpcq38xVPO+Ew4inZjthPnmcR1Ly52ad96QgdS50yXqSbHUXULAy+CdnvLpUMlJrXez5lr9h3cAoW86fs1edWb1bcQBLdPMWki+IIpv9qHvAAA=="},{"key":"alex-worley","name":"Alex Worley","home":"","trips":null,"catches":null,"hours":null,"largest":null,"photo":"data:image/webp;base64,UklGRuYEAABXRUJQVlA4INoEAACQGACdASpQAFAAPrlQoUwnJKMiK5VcAOAXCWZbllFHkI5zaAwO3kH1sb+qzcM+YDzrnIq6I+FvmYEjG0H3oY7hlzJJQ25huDfFs2N6INCAL//Jz1kKZJd6V5rmBqPz3wi/3TwLpC79EkEnQe5frscEiAPCH/5lbbqi6FyTCFHh0JiPC6+0CQxroAb5FF7nkwUwJXPvMY7sufnf/Wfz+Umx7ZchzM+WbsL5kke7RqI9pFiAviLDtIvkN8lIIQc32sl+oeMrfrYvaH1CpNgAAP79XXHDr/+HkX5VnoYvke/4c5MsaSaRJHm2ipjyJSHO/6ytguAqdNwet78oD7Gg/5QC4W27dU6DFZsPyX+O4FxJlfxOgPe+WKV7lH1JJMj1bxd7rnwWx9tFTq+MANzuVA4UE1WgtOg2BM4kH7rmj4ekBEH+yn+m4cdcC3a3bxOpTY4n9VIDanzpWEL3ETWlTTxgiH/S/SaAPHJg8lJA6xYx7VvvRiV69d1fwMP00bGDUki3ixcTzNVE+c8Upk+TI/8JdNhDlqkMg7WoG/Xlje8gZgoiSd4buz8Ckeih1hYkkLvoILjciFCzAliKSf+vpbekULtJhb2Ud8LtJoJmimnzwS0K3fHBGdG3jHZvHeX4O30I6xfKURxIt0Xqv3L2ZUtjJl4ycYizbJFMO6jTQ5MQG6npofGTraaawicrMkoQVrbpllHuk5fbaljrrmv7qiVFHYqjuldc0N1Di/Fa6hwPD5T8solfBwCarOq3AJnqyYAhp/1WjQ+CqNpevX2cUeQN7rCuZyXNAyVxAMNJUxUtTFC9bNKdoH/yQl3G9zCBROJy4fVMiZjW4MWLcmrTStjUrDrAvOBqislDspwmAFJXGD843P1XW1PWd7x51iPHFcxMdx919Dqv2BDzjSiThRMEE+5rleVczl3P2h3Ke3Rm85bOy7doGqvbqcIyoY5hV2WI0WAujtOjUrijNjwCg81OWg9EMdo7lphi1d+R2hA53vEelW2foPM6FZaKy1dOEtlNVinxyoQWOiU5iWcKoB+5yj9ZZKSdf/Shnt13VsPHECFvfTR3kPue0zx9vuFlig26mLk1whG3ZO/VT+LYQNVRqlKlL8eRlc2X6VpEusbQnxiZPsDHphe2BDHvbU3JXDw/C5+zZY4Wneu3reH5/sXl4n7rXRqKisKVvfs0Yhzl/XJKAOGaFbhc7Go2HJwmNDOxrSpOVh7F2SnbtXLHOEtFXhsftLUU2FLa4ZJhVo9TaGGBvvYdD/PTR3T19iu0YmQ8lFHM8mcuHg6L99M4nDqqd60Vs/qQwkCQdb0XWcTzzfLpFWC3xl8jZzBdakTWkrk/nlsZxb/gOR7EqZxTI4YWaxhPHmFs14zSqTaYZC5gfLq8mMyYPIcqYQQLsHnJGIAduuo++fjjk4zM3PJk1Oc0OMjk8aHL+oi49mhCVHvkX5LCRr6hynxYMWwmyzyhwHr5lsBYIkgDsvENE9sC3SqwN3zANRi3IdGoEQHYk4Dc6gLD1HJXD91QZ5AH/izBEAM/cFAWJpxYb5z88+BniPVWxYbOQmTH321DcgNziLsiGCsCiJeC6Lc3KGEbzb/+tA3AVSgtYNucWoCgxWXI85U8SRKF3h1y2f0jVfHWFU3/dNh0Z2KgCQu4AAA=="},{"key":"jared-terry","name":"Jared Terry","home":"","trips":null,"catches":null,"hours":null,"largest":null,"photo":"data:image/webp;base64,UklGRuAEAABXRUJQVlA4INQEAABwFwCdASpQAFAAPrlSoEsnJKMhrhXa2OAXCWYArz+YEaygec6Pm8m+V8XT10Ho/vxWRGzVVu57qJWpFI/uCkALDjpJNHr+4tZVSRbTeXBl+M70BYP6tapMqX7eBbWfwpA/rTUfb3ETEtqdyJrp0hrAIabJ0pN26+zktirt8yIpphUdhmymlypU56pd79xqhjj+US5Glmsf1IN7NzMdQSsYszHOdjLAIT+zo6FQjGsgw0sjRLYgLKuYIbsvM5DaVLXTsggAAP75xfakX07v/6O+krojIH+2B/z72mpDlXoH/+UxDr3S2RD2H6y+HcoRo/8+6oQtusplDO/ir1hHUd5awfWj/e2caPPvH/QkDC1GRiopys8pCfCEGsHCnE2K27YGMT1AIaUinMiXW8xlsourQal4cKyAuhBO4jJmR1A7YQf00dk0EaYliuXHnirCSxmsl5SMHIe4KXylmKtGu+U/zZOH6gSemF3kshtblA/OtU1NCJKqNV9DNlrZ6R2wN15IliKkeQBMQUFnLk92l+v76WIwAgIlJGk+TGmtki+OYrrS4pnWIpLvo6XZXoF18rX1uf19m7GPWvbNkOseUjw5rIDkZnXQlv2vaJujC+8rgB3OUgsKpJbg0QMbbA8wlHz3pBtaOqqgITnODsGHaDQ619Y0n7Z8uuZGF4xWYXOUsa45umFLy+dLbZEd2L4+97qEUGZN2LvxJlm6F4fwaxTt8W0a9wfzCVTIsZ8NzgCOi7Wd21yYAc5JkFgkgq0LovdnyLa7JSF9nyrqKp98xnq2xXwkLpg26fHwIUNvOP8vp7FpFFKY7OCcZz+/rKrY8w5A7T9/KCjc4JaVaWulLYazs16aiAl60HKa5V1LuDR67O9q/NNDyWDTpgvjKBMm2qcrCN4utmfFX1eUsDzDkIhknH/k818P4vWjOntL8jtJnoIsoL/+KPU3EL3GquB/c+5cmNIGD0vktlRISVNkKFTSJhkj+uXoA2ws05Fea10M+EuTQPjQfdh5geBvfCOKGp3XdlQMh1S94QmXHopI8F63bTTR60LJHKFYHDS1ADTYdnIBXMDjgT5V/NUKVgBg3eIeO8oZ82tkAigG5KCk33xeygQ2UbUYBIAlzte+EtH3BGPcqP9k6p6ABpj0t/O5dlg5TekKr++9B8L+FeXcFc7dM9KZBzmRfFkVtKm+510Yr5lTcwr7CFFjJw/cB2lSvWTpQ3sR1KJBEZ1ktlgnD+gJi+Mo4Rvaf7sUu/5x9SzbX3RomD+U5cPzFFdBDC4N1/BIXJXaxh9hX+0/Wbpczp9+rCWlRoGPR65Ajzn65nEMHGgpU5TEYXyZ87+0v6VXdvm1bIshSkpd3/hcbmHymULVubrdt5aPJPXzshnKbQG6QDvFcStRwm9rjOtajcu3knCJxhxSDC5PZWwwuS9fzGB3QtlbXRMmMSliBdRKcr7RgEtSJfywJNhLbRsNhzI1/WbAHbHJARsNeXSvQUBUpmBZhKiMTeTsPjz7qcTr0c0ql96pp1DeU/bgvHnderi3gwIps+Fb4AIHS3WTztCy0Sci0YduLbgHnfBLQRgffYjmHlH05NQTjMpMxFWA3ymloVh/QK+I0y+pyrPXMV+Fd/nIK+ZkKyEJKcXzVFPrVoSqCYOXaAA=="},{"key":"clint-kissner","name":"Clint Kissner","home":"","trips":null,"catches":null,"hours":null,"largest":null,"photo":"data:image/webp;base64,UklGRoIFAABXRUJQVlA4IHYFAAAQGgCdASpQAFAAPrVGnkonI6KhsfpLoOAWiWQAwQ/7Up+c+57lZ1DcMc835/8HKyg+3u9fyiAljizu5f+nIaeWD/PMHVtLcLKYah8XeRROReRX4kA+3j70G/AhV1TN3bmvK53xUnuwnu1zB3xIzA+73HMfgNRkhOZkZvGyNgx8gO5eXy1fbwjKFv/2vh6oRgHxZCLXNQet7LuLtNpUDOfGLw8+nB67aH33WJznc+ci7v7d0VnJ42TsLqYQGUaVrDaZ8BqjaFmrkzZnqwXZETWj6Mk1cxBKoKYAAP75wiANsftsPv/9QnIrbzf/l7YFCV0AAJ/XD/CUpQtbBQxyXX/xnIYBR/SSYC3oh1L/JH7vq1Xhz+Mv84uwgb2hmvMKd3vYovEz9ESkP9AtjRgyMi33kUJARNVEOlfGjzHXZRGSmS/KC4FtiwDBXRz6E9ZdhnAdsNb5VjspimW5E6jda1sZ4XQtD7ycm0FPhmnCBIqTwy7waC/A3Vgj086Km94ONeKMwAnbHtNIClrCnbP65VYfAdKXhuNGM1NlZGwY0zGC9XXmkNN4eVqeSq++stWDWtVHn2/HTJ2OLEFp3zxypv+QuBErsq+ILsq2PNjz5sUOI3zam6DoCCCzvgYYwa0Ru40/GVTW3ObJ0Z6uqszzSbUGWhreYS2x7tPF8pN21cHb0b0QYMv15tzZoiz163mUev60HzPCxX7E9dk7JLJqV6WF0t9kJUx1WOZxqf8UqDCXjm2DstdJgG3HDrRkXJRKO9M3FGBdjCrhAJu4SI2e92dmFqUXiQA0o0XKiOOLqeMvYu2M0mWtH6HNaNLeYKWauKeKkvAq5ihtZ+9CBjnWC9Hk7haHfoVyOY8LqxQzN0v8eAw2LIfV/F1Fc47ZDHF76VQxcPI6bi+wQArumMygCtt8gFJllGw5dRqnmipQlKJU0Nu4OSZQMX7RiNwas/NiW3snI7rxlSI/jfwRg2T6wLcWNaglbevw+Tb3gqF5efTivyBRV/LzjR9Mjn5Bvf8DfEfZBgzzVqBwT6abrTOq/dmVxitHsfbPXbqQSpSxpkXFkB0WbVSNj3ez+6HT3KcTMDogMfvH2L+QI3OgdDj9uTPeXndx3uIjVHxJPj4T6LjTdzN9gxcX4jCBGtjk9YC811gDL99lpmEgFQmy0dUw9StqhH0b4ebx48v/9208DAvydE9tk7XvY4ZywSDZU1+fRYM1zegy4Diu9ckVVj4gWxK7lUObzk5cDnMxFL2883S5kZjil+ibqMIDmIy2a2r0E/Q2tOwnn8pZCd96acsjf8jjA2mI2az6GwaTM2g6lScUsEFUtrpBUUxfbUMdv2hu6DcoKradMVOuQZJXlO+ON3dXDnuIGhblMknRRs1vyRANZsV4TqVtEQLMNLtIEK6/HOGCN0SlmVzh3h/r+g6tuRoMqEezMZ+8J6c8Q1mOpPGrDV7F1XDls1QpV6bqXWxK71Zqp+ufR6sZFI4y9MTUpkIirA5FDuTRSucFwcW0TJ8JDlTBGRkboOIqwH0CE4HWEbDgd1w0vP1R/WqUBlOAn57hHPWnaR2DJZM2aFgm8cc7tsqwyJ0K/S1MIFG3f277Q8sbcsbyEky3WOBQRYvvhj15T2Jlmkv3M545C1/goIzdZ6psCsdODhv9mRZHz2hgORn5SLu5kwc2lsVnpuZY/cZ6HXwVOfn+AAZwJdA2R+FM5vYnlPqmlPoEgsPuXyXLJDc7So+5i1+RNMPN5vrmGVbGXv6RJpWvm8f0jDN+NHyv1DjrZ97cQBxM3U7KQbqWvDg/oFN8PaS4MrujW+vLRghx1Dxz6v9mDv4/dmLap7WxNAvtBsNLkitit4R8GBPpK8qcr8wAAAA=="},{"key":"jason-arthur","name":"Jason Arthur","home":"","trips":null,"catches":null,"hours":null,"largest":null,"photo":"data:image/webp;base64,UklGRp4FAABXRUJQVlA4IJIFAAAQGgCdASpQAFAAPrFKnkonJKMhszd8AOAWCWoAuGPkCjygbh2yY39ir1i7gDnj9OWlGek/x7hN2mbL49dDMcU/bYiW939BM/dYO3U/J4SjJ0tbi+qmyV6zoTyqJ81lo/W5UF1e87uDoPZpMCmCbm9ML1uwQIk6XIcrfYbQyFgftJ/s+W/w/sN8qO+jjVTgCGwbY9WrObbgDBpIyIwBFdj6UjyrrfjKBOb6ABwRBgKSchvmVbBEdqErxWrmz0s2r03l6GVQiuZRDNiB/jZfZ7fWDaMk+CnqjXRAAP7+oKGpmI/5F/+h/x/rStU8v/nTX83t4YNQGN0s4Ff6rOrZ4YyB2ZP+BYTUKao/94Wm3sqrwTjtJROEx7EokrS929xh9r5R+6JrZBJumSGa7UdRXACr0+dqjDqMYxUdQZzgyNbNF+33bZRitPkNDIGQCaRgcN7pYXtj9S0z+uT2wEoHVoekeVFxZs5kqJ8fFLPqrORFYLRxi6bcbzYWuUDKWFwtc5ziSR8ccrjqS53Z64RMW9GCjeIcKaBUXbKPF/Xa1EyRTpx1vdfctwfkdV8QTMwpAKKtRABOhbNK6X7sV2VubN1SE8auJLPmGWiUJDWN/Ji5bdjJmmT1updSmoeRfQcZvkqWhqf1j4hYmAfSE1UbzbGacxgspWxmw5kI3A/zGHPgQB2yBNFlB+i7634oxbUx+q9Bc89/P+EOe9tSbUApMEB1WBrbiV4IN/GUbEBWtbJmRkbmgaDh6SWR/lc+u9XxHtBGuI7KavZtpxRTcntRQI9U68UWGlen6knDp1rfHgkz7ZoT5MOLj/vLzg2Pke5NnHLLCRiydLb6PHi8yi55h1MfTHt3QvM+n9ErAXpvBpfpU+oPfnybOKIxfb724Sm4xPViD54bOA4XaibEPy4FTQs8oYO55HLLKKm4isRyi51fac44yVzuHry4tgq7dL4zaEvb64hI71E8sScY+4zBXwo3e0Eid2DfhcXCpWYnzwRpssusDwbawm05T8FOrKVXYrtb6EsqZe6QTnzSlQ6JYWeQhyya/BXwI8NU0rHgdFkESjL6rG+yWyEXSgk44xqpkzbj0b5glHuvfJexMAg6Fe+ocaplXPwIRARb9yrmEEFfmX0siUHK9Rea9kvnpz2u1pe+fgaYEL+txF7hOId/Kvahrd0CGnp9ght8bSKohxs2e7Joc8Uv/sncID6lDHcCQs7VGWIZ5BqcFCKHPfTVQePutB54/L2zUuzcU/ZnBMZrWcfln/n66iAvOPiZOTeG9SPREoSGW9AkrG8xBGjrwrx90+jRjTu3V7NHuuuqrwKaDGAGmLZ9WOfsLLzgtepwjhnWVPRCkrin5e/efntpsaJmtsD8YeKdsvE2NXcmRomiuKXiKknQXB/mTocaCoGub++v9W8J9hHVshXbzdZJIJ1vGPnRJwiBeA93yKujZU4Oc3IEu32SAP9y744OiCguGZ76up/rQhFOGdtsxs0BWaeJ6z2lbChzIsPVZ2lCFKCBjufWKSOlgp/fT+8pYilckABRRFWmNAY7wEPUM1USeUNh6KpRUKIJtOpX2r2Io9i0r5N9UVh+gb+X5EzghHjFtd+C3lh/m3SffeG1Blogbx966kfqz+mWaXtkHztLRRQZ1Ym479itZzk8iFSQW+6OXu//gjdCszux4W/MEPj3QLh7KcxYE46l2on5Hj/o+NejccWhfT11ttNX6stfAZjl9CODeAgy/otza7SDOTckAAX0KN6h5iLPnVLyUy0shobg2zLQyFDeFtuWLtQrnBAlFRXe86GT6kgwZTA0r5dAh8YtahyXmGRtFRy477WH9oAWKU9ZOMgDHay6tZhalsFljDnOrhVconXD10rKnXcCsjfKlrFHbCWYWoBVidwV09gKAAAA"},{"key":"eric-shuman","name":"Eric Shuman","home":"","trips":null,"catches":null,"hours":null,"largest":null,"photo":"data:image/webp;base64,UklGRgAFAABXRUJQVlA4IPQEAADQGACdASpQAFAAPrlOn0qnJCKhrNgMyOAXCWYApLNfCuSZ8A469jn1obgjxM/XFeffAHZBbkFfUCd1mrm7deLFq/0siIFvT5EBne3KmYRqk57LaOea4pnlYX4vgJAs/00MUOLeJhPNCkgs8oR8jEOJamq0MEAK+z6VQY3MSzg+Iv2/mTURfXFAb4//aPxqSlozdKnYUa96ZlMwdtY0zslXdhbfrey4tBPvHG5sBAKCbOB0J77qLXai6/Npf21Lb2v5H4d80BFQPS1jqlrDuAAA/t+N4ruOprDu7j/8f6+yRRY/s39LiF3aPb6IkRvbC9X4e0P88P4RXM9w/uMk3pD/5EBwFRcPIt/ThijtEbr/+0ArxcFd+8NwGX8e1cmf8q64IR6kSfynj3e81FQBKi2qIvAr5Hj3aCPy+RRwUn8qkAz66EAy2CIyFY1M1eMXeGpog8++C6Eg1QO+f1fWW/fWHasqdmg6khdSPPv/RZBUiA4ZyZu80rPg5KGJ6oWXF32hbC0Z7eLh3iVmBP/t9InjUmekmoiddfE+1zJV1sqTgYyJCZC6JBVx9g9IoP2GU2Js+1HjlRPY1GY/qKqq3IYPNkJNulk8KER/XKFE06uycKZ48WUOovc1D3e0T5qvi9UJ7VrXAPfW/1Hwi4+B9a5EH4Qv19eHcY8TkvVIWIr63VEaG5ms6INX3CJTgS1XKO9MUH78wx+eR2/2CXWWnDU0JLxRa/OyMfqjE19//b+K0IyrcQWKOM5cgFVfo4QmxcjV5ZMigRC3oEfaD31K5YyqZB1SERQ/NeCH8UYetrDq4k6yOqxAGKDehdDHfHV6NqcfxI6iRTrQWFujhAtFoguxTDikyDxcYgYmKDOC34yKCs/WC2HDpCY9wcc5tGI3aGBcZf/S679X8BFpQSV7mdgh8aA4iFMkVLXqNB6ORlxXTg8EsGhWYS99/doLb9EmkzUT0Rut8ZzaIrNQWre0Ev7j9ITM/4epS4mIJPieNFVj9iGdS1TRK573kJJdWOc7LsUtIwf5LQ3x7EzFMXK7uDopxN4I74TAhF4WAMkynTk1GsJAW/SHeno/oFt5juKDmELRryEEK6LD6/AelH5yun8c7yibO05kvqH9uaV423RTFx6gEyLPE2O5KL/rAbiAxfnkeFeBEsv0/lG7xa7S/qcwTHuOtFY2nIpQKVBXBFMGzVI6pBy5P3OgMzBCQ5rljmI+jYKRjcOaEnhKujrfMmgZzi1B3Lpj3LC5a9OHnBihffaiI4L4wFC4q2JEpNtD/F0LKMInTkpFupS/Z8hkZhlDp7QheQ+ndjHmhcnbqjpEoDhfQ6tzNGvvcmvWOC9c/Qt9H7NS9n/sZqX46JCE3RZWeqn3cSBGs8Iyh3aas4UFkg1M/DSgcTlq63w348KBltUoaKbTR2shd9kbQXhHx6RX4e1sasbC/5/EbjVFdyFZ78FY4GAG+H54dtLRzms1JUrYEYC8EANToszuS0r9hNr4ZukZVPaqeixQ3ah32zP93TYa+jzNpvRZMsGmZKKakcLL97EAGACdjCnfjSrJxSm+/YvzgcFXA3ekCcHUlKaY9iIQRIooTJj0M1kGan7kl3jytRMqKF9rJCySewT8Dsyv1zje0P3j+n6Z9374xl2cFXGr4ygS5zSTIUCNU8fA1eCTZymn8+xs9ud9fT7rKKTIalHgAA=="},{"key":"lj-ashcraft","name":"L.J. Ashcraft","home":"","trips":null,"catches":null,"hours":null,"largest":null,"photo":"data:image/webp;base64,UklGRjYFAABXRUJQVlA4ICoFAADQGACdASpQAFAAPrlQoEqnJKMhr1VbEOAXCWQAtdXsV7wPl6btYUrcP88g8wd/2xxzsiGVdD/102sacR+W9DDDdjNt445fqZ1kG6kVkY8Kvibl6BUj3SMV4l5myxvF3PlVUYTeaOOlx4gQ29MK7zZbDGXkZ/xkMdpsNLYqponsDU8Hvv6Q3R/s2veljfEL6af8z70cgaLlqAubBf1jegMFpImhcpltCYUtXsbVAPrsIYm7v0qkwWFK4bjfTXOSIMxaESgdOvDx/Q10qt+VqgAA/u6f+8ufA+lDZEg5m/9MfIJXMpIrYfp7vDBwz7gvWgN1QT2RteyfN5bpWw2YM9/vZ4X/CDf5N/sN57/RBv8my/9+Bh763GM0naW4xQjny/hLdVxCnQsQymcIn2iIKqRv7CZzzf0FAXTD1EvfNeMALBTdIGiu55r+o3wiT5a5xZ7ctB57Vw/Y5AveqNosaLgs6lB57+nfQNNsE7FsT41ii+ojLlh7OD7UKgzFOuQVXAD2w0s/HDwm3jjfPq+2vWi0WmySb4G1HzgjY+CLeW5FE79lCIq3zpICeBjXWKxOSwqb83CCuG3o0k9wJBc7YHtC5P7AUiTwgE/tOhGXmvJwcXadM63sYmZdX0D4tcjGIVa41soDizqvTqlQMt5i9dn2YQyCTKbDxLJ/HKO8yfzc0yiR6rI4x8GhZVo0yTjm7QSK+dwOWAjknGswA4S8pelqArJx4aWPQXdXah1IukXrss9oR6JLTtLa9K2vK54b2v81HplbPOWGfXRlTIzLoLzaMge7xQ8++tm3GgRkKwbQzqEqfK/XWt4Ah3TUw5Uw/H6rHF1vO1S9bsxHyMhbjBPkkk0qm/jN9wA9TWx1tW5p6aTGnV6swV6l12DheU4zGGELrjdqkv9f/cHj6BZ/wxmymx5GPc5PWJthVKzSqIoIaRhki0GfTjsAEVYoEZbD+ridQO7HsFsP5fcQuxVcGdSeeZofuf6nW0DtpoqrzfNGL8S6ZhXVr1izvu0PJOpGlvKmIYG31nbPXm8Z/vHZ2fnQy8c5I4YaA8U7FV3bPoYZKtiFkfZrBk5dwYtwG1Qk+sYBuyJNA+3TmIZPmXOT5EaAgX87lqrlbjXQXAjkLb/dvLpPb8xeezorEGIGYWuLNe2eNiugOb2j5Mt+l7Xw9zkUiC/YAD2Ec/d4l55nxMhjwsaGfZ7oJPS8R6/x2AJe8umZSqOQBSrKmV2vKBMQH0goVLdDHy1GtjHGTxfu8AmInPMQPCr1Ls4MD4w1ynCbrX1VMMpug7ey9XaGZFYak4odxuTmlHw8WREKemE1nOcwqq2IP4taZ8EDcz6k/CXH5Mxsm1c2wS5uELiTgyFFpc1FPWK6EPEDA8WC65dy/u8uQUp2I2axjPzp4BPrtix4HYJM5GSaDejOT9csRkIjnfvgdZ4h+bFXnQhkQtcE2HAOykU3np8qrsUqCbv1T9EA2Co2aaLhgyDUxAEBNshC9QNmApybNjeVRQdpqI0R622A70jr/ZU9D7phuOIJt+0jcKonKXMNCui4LM9wu4veErrIybyXCjH9RQ/P8xNhB1QPUjlboPdSQBx+gtxJd6ITTLHOpKJfp1ggmnEKivRyLSWplWwClZE4GGCUK3/bSNMC6pS/vaXW5N1c2aupv0ljrWe8WxY+lATZyGpZ/p/CdW+iGIopjNvaMqbtX+dELR16pgDaZ1nzK/eCMIRgpMzlsFSbtHoyi6WUrmHXzK1e3D/QvhgZIXoumGeAAA=="},{"key":"rick-garavaglia","name":"Rick Garavaglia","home":"","trips":null,"catches":null,"hours":null,"largest":null,"photo":"data:image/webp;base64,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"},{"key":"beth-rapp","name":"Beth Rapp","home":"","trips":null,"catches":null,"hours":null,"largest":null,"photo":"data:image/webp;base64,UklGRsYFAABXRUJQVlA4ILoFAACQGQCdASpQAFAAPrlQoEunJKMhq5Vc+OAXCWgAuzOrDXgZOzH7fTpt6OeiccqxHzy/J5I5xnVX9gHn3MXiZpq3nE8RajgbBROfODGzrhenIA13uH+kj1ZIKWIUrclOYbf1xADZ8jeSixHBPp94E12VsKRpXnlomdqDvpDT91fkJpaGAuXPgLwrUQL3gUXOy6NM0SGB0UNvEvVBIYzqvj7KQkfPW/O3QOJ48bxjyY2KkunBSbMgvGXmpghtdXp8t/xinvsY1nHkKgX9N4BmaDDrYRb1WgAA/u7b/h5Z2IAdYqD3Df8QE3RcT3A+guf8oecTbF9rBlhTy3Mr55vLelPHAlyZ9wKB/D+KKPC9Rf953/Kh5rP+BXvscTmWozvyvu6z73SK5Z1t2Bxley3wTVeeAqwEKJlPsC6fJjN8BI+BU1icuM9DnCsjbhiosgrIDwl57kCk+NIRh/4f6wE+QPvCSJOKwomGpn2Sk/7AKDUrQfYSej/jwC12Sd70Q+6/iMSxRyo1/1D+A0o1ZxoUGImnySXArC3uXTVgQTAu7jxLngGByK9xOXooRV6bK8R+QFYzYfK3JoWHT3L4GBT2BdD3iTODwJxAuQNXQn7Ka4TOti4TGe7V0ZE/ss14Mev6iPnsPxZY/2axxd2ZOeGcLw0Eci6dlwTXihA39RgCvk4X/YpiioSarl/173NYE/Om4a/yv8keSHFgyrKegwjk1jjSVEwy+xAS1ZlSDYm9RIMNG4989BdPUilgRB72MQ/6BeE2Yje0bIONgY1/izv3YBwrba3AVxvGnbBo+Q4LLyCUccO07Dy9/0kmhA9uQesSE5PdlXq+nbZHfgJX71npm3h3VPV6JK3t13ugFJMbZnqxH8ClSW+xob++c4MvY77z0aP/c14V0rQvanq5PwJtMtt9UiJz3Tmcjpl2kzj58S8XAyNninPrEs9YI0ksE24ST+y1nyx/UwVMC9GbUdp+tf6KxkJSanwFb7ONg78pcOIlDW0UyuRR/kvsQIdSjKHqgdJy8fMRHlBpaRTNDzGdUDdEMAB0Y1VJh7S1skPe7kFWt0pAgLc+FzFWSC8luAo75W+gtpwIA080jsy5Cf9gG4pCIWsyLFvcvqO1F0XrNB9F9TUuR/3vfUXOF5CDMGFYwhp5cunB6qX+rPe3Zw+yEmcFMw9pJbm1oDoynlQcgNnG/gB0d6xWwLyfqEr6fq1BpTBkdBVfJoaY8M7PNsFumHhdQbmG/q1p1APO27O/OBhMFikZfA0Vje86TfD7gpfWuvcsRw9L44SfwXH2u8xj8fSFW4Ym0PwzZFO8vSDsT+GXibvkVnwGJEPoF+7jaP/2BJbts4gaRHPUgwQFV1KADRNZoj0eP7W997ClNovZEAKsadqILGaUoArDq2DWW/rFmoJTUIUzfha9KMw2D5oY7ldPEeS2mhgJji7RooGWgazD/8sVT3y6kkCzuWUoNFtczyMPmn6iXAjIbxGzaGYGcNsFaq+g6m5DY46Vcsrc/A2vLfGjzuqMUEXN+FBy8vwUynGxZ8vecLuMw1k/ECjsW6eDCzLKYCif9xDDYdgy5m1dsaSPoC8gOe9ICea097ONkcex8i7FTvZ/ehmhELUFzh8VmFNIn0ujNX4NQ+H/ZDhkmfhO31Q6MrrpVSko4kA0fMf2LUjql0hNgbDS8WBztmp5skQPLL6fShNquAJC4aujzGwQpmNiCycHwwnDw8aAGYeQjru4aQxiZWU2+yWAqbTNsvVtWLgnUeHiJXaWzvKP+zDTwvTt4dqtByf57PpOC74ZcoN5XoY/MeSXkGdCe+0f+Pn38SSghSfB3XC5BHc+SmnB4Wl5IZhpvDyH1RabvuqHA60KUZmtfX5anwNHfMYUA52wogEuzdXZNkdQ6xjxZicbVw5ragjr2CpYESuvFE/u6JC86kEKjGgfFiqFyaSOxPim4PgJuWAAAA=="}];

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