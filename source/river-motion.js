/* Four-stage teaching diagrams over original river photography. Coordinates are illustrative. */
window.KFJRiverMotion=(()=>{
 const scenes={
 seam:{view:'kayak',title:'Current seam',feature:'FAST / SOFT WATER EDGE',focus:[520,320],target:[500,265],alt:[555,315],flow:[[140,260,345,315],[600,260,790,330]],read:'Follow the seam: faster water beside softer holding water.',fish:'Cast upstream of the seam; guide the bait along its edge.',try:'Compare two passes along the seam. Change one variable.'},
 boulder:{view:'overview',title:'Boulder break',feature:'DOWNSTREAM CURRENT BREAK',focus:[310,260],target:[340,290],alt:[370,320],flow:[[110,130,230,185],[350,160,445,245]],read:'Water splits around the rock; a slower pocket forms downstream.',fish:'Stay clear of the rock. Cast past it and work the downstream edge.',try:'Compare the downstream pocket with the outer current edge.'},
 eddy:{view:'overview',title:'Eddies & backwater',feature:'RETURN FLOW / EDDY LINE',focus:[650,330],target:[590,275],alt:[675,365],flow:[[180,180,400,230],[600,180,800,250]],read:'Separate the main flow, rotating pocket and boundary seam.',fish:'Cast to the eddy line. Work the edge before the quiet interior.',try:'Compare the seam with the pocket. Keep clear of the main push.'},
 ledge:{view:'side',title:'Ledge / drop',feature:'SHALLOW SHELF → DEEP EDGE',focus:[530,365],target:[410,340],alt:[650,420],flow:[[120,210,320,210],[590,240,820,265]],read:'The shelf drops into deeper water; look for the transition.',fish:'Cast above the lip. Let the bait reach the drop, then work down it.',try:'Compare the lip with the deeper base; adjust sink time.'},
 riffle:{view:'kayak',title:'Shoal / riffle',feature:'BROKEN WATER → FIRST SOFT POCKET',focus:[490,310],target:[460,290],alt:[570,350],flow:[[140,230,320,300],[570,250,760,345]],read:'Broken surface water moves toward the first softer pocket.',fish:'Position outside the fast lane. Work the transition below the riffle.',try:'Compare the first soft pocket with its outer edge.'},
 tailout:{view:'side',title:'Pool tailout',feature:'POOL EXIT / SHALLOWING BED',focus:[640,365],target:[510,355],alt:[720,365],flow:[[110,220,340,225],[580,225,820,240]],read:'A deeper pool shallows at its exit; the current gathers here.',fish:'Work the exit lane while keeping the kayak clear of the constriction.',try:'Compare the pool edge with the shallowing exit lane.'},
 pool:{view:'side',title:'Deep pool / pocket',feature:'DEEP WATER / POOL MARGIN',focus:[520,405],target:[390,370],alt:[650,400],flow:[[110,220,330,225],[600,245,820,250]],read:'Depth and slower water provide a resting or staging area.',fish:'Work the pool margin, then allow more sink time into the deeper pocket.',try:'Compare shallow and deep passes without changing every variable.'},
 wood:{view:'kayak',title:'Laydowns & wood',feature:'OUTER BRANCH EDGE',focus:[650,310],target:[600,290],alt:[540,345],flow:[[100,240,310,300],[470,280,680,355]],read:'Branches provide cover, shade and small breaks in the flow.',fish:'Use a weedless presentation along the outside, then open gaps.',try:'Compare the outside edge and an open gap. Avoid pinning against wood.'},
 bank:{view:'side',title:'Undercut bank',feature:'SHADED OVERHANG / EDGE',focus:[730,300],target:[700,275],alt:[650,350],flow:[[100,210,330,210],[430,220,670,235]],read:'The bank offers overhead cover beside a feeding lane.',fish:'Keep clear of the overhang; work parallel to the shaded edge.',try:'Compare the shaded edge and its outside lane; keep clear of unstable banks.'}
 };
 let view='auto',cached={},last=null;const TAU=Math.PI*2;
 function picture(key){if(!cached[key]){const im=new Image();cached[key]=im;im.onload=()=>{const note=document.querySelector('#riverImageStatus');if(note)note.textContent='';if(last)draw(...last)};im.onerror=()=>{const note=document.querySelector('#riverImageStatus');if(!im.datasetFallback){im.datasetFallback=true;im.src='assets/river/side.webp';}else if(note){note.textContent='River scenery could not load. Reconnect and reload this lesson.';}};im.src=key==='overview'?'assets/river-hd/overview-v317.webp':'assets/river/side.webp';}return cached[key];}
 function path(ctx,pts,color,width=4,dash=[],offset=0){ctx.save();ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='#001c20';ctx.stroke();ctx.strokeStyle=color;ctx.setLineDash(dash);ctx.lineDashOffset=offset;ctx.stroke();ctx.restore();}
 function arrow(ctx,x,y,X,Y,color='#7feaff',w=5){path(ctx,[[x,y],[X,Y]],'#002126',w+4);path(ctx,[[x,y],[X,Y]],color,w);const a=Math.atan2(Y-y,X-x);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(X,Y);ctx.lineTo(X-17*Math.cos(a-.5),Y-17*Math.sin(a-.5));ctx.lineTo(X-17*Math.cos(a+.5),Y-17*Math.sin(a+.5));ctx.closePath();ctx.fill();}
 function label(ctx,text,x,y,color='#fff2bc'){ctx.save();ctx.font='700 20px system-ui,sans-serif';const w=ctx.measureText(text).width+20;ctx.fillStyle='#02291fe8';ctx.fillRect(x-10,y-24,w,34);ctx.fillStyle=color;ctx.fillText(text,x,y);ctx.restore();}
 function ring(ctx,x,y,t,color='#ffe17c'){ctx.save();ctx.lineWidth=4;ctx.strokeStyle=color;ctx.setLineDash([12,8]);ctx.lineDashOffset=-t*45;ctx.beginPath();ctx.ellipse(x,y,65,30,0,0,TAU);ctx.stroke();ctx.restore();}
 function kayak(ctx,x,y,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.shadowColor='#000';ctx.shadowBlur=10;const g=ctx.createLinearGradient(-28,0,28,0);g.addColorStop(0,'#a98b42');g.addColorStop(.5,'#fff0b8');g.addColorStop(1,'#a98b42');ctx.fillStyle=g;ctx.strokeStyle='#0c3024';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,24,62,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#153527';ctx.fillRect(-13,-10,26,29);ctx.strokeStyle='#b9a66b';ctx.beginPath();ctx.moveTo(-16,-34);ctx.lineTo(16,-34);ctx.moveTo(-15,39);ctx.lineTo(15,39);ctx.stroke();ctx.restore();}
 function bow(ctx){ctx.save();const g=ctx.createLinearGradient(360,450,590,540);g.addColorStop(0,'#eacb6b');g.addColorStop(.5,'#6f7e3b');g.addColorStop(1,'#bda658');ctx.fillStyle=g;ctx.strokeStyle='#1c3828';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(400,540);ctx.quadraticCurveTo(418,470,480,414);ctx.quadraticCurveTo(542,470,560,540);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#253627';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(449-i*6,465+i*18);ctx.lineTo(513+i*6,485+i*14);ctx.stroke();}ctx.restore();}
 function bed(ctx,key){ctx.save();const shapes={ledge:[[0,420],[410,420],[475,350],[540,350],[545,455],[960,455]],pool:[[0,380],[280,380],[390,470],[640,470],[790,375],[960,375]],tailout:[[0,465],[320,465],[500,420],[700,380],[960,360]],bank:[[0,480],[960,480],[960,190],[825,190],[780,250],[875,260],[900,390]]};const pts=shapes[key];if(pts){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.lineTo(960,540);ctx.lineTo(0,540);ctx.closePath();const g=ctx.createLinearGradient(0,300,0,540);g.addColorStop(0,'#8c8663');g.addColorStop(1,'#333f32');ctx.fillStyle=g;ctx.fill();ctx.lineWidth=5;ctx.strokeStyle='#d6c48c';ctx.stroke();for(let i=0;i<32;i++){const x=(i*137)%960,y=500+(i%4)*9;ctx.fillStyle=i%2?'#8c8767':'#4a5945';ctx.beginPath();ctx.ellipse(x,y,7+i%9,4+i%5,.4,0,TAU);ctx.fill();}}ctx.restore();}
 function wood(ctx){ctx.save();ctx.strokeStyle='#382719';ctx.lineWidth=18;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(850,230);ctx.lineTo(570,350);ctx.stroke();ctx.lineWidth=9;for(const [x,y,X,Y]of [[700,295,680,230],[660,310,600,260],[760,275,750,340],[615,330,540,325]]){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(X,Y);ctx.stroke();}ctx.restore();}

 const lureChoices={seam:['swim','Swimbait'],boulder:['tube','Tube'],eddy:['ned-rigged','Ned rig'],ledge:['ned-rigged','Ned rig'],riffle:['swim','Swimbait'],tailout:['hardjerk','Jerkbait'],pool:['jig','Jig'],wood:['creature','Creature bait'],bank:['wacky','Stickbait']},lureImages={};
 function lureImage(scene){const key=(lureChoices[scene]||lureChoices.eddy)[0];if(!lureImages[key]){const im=new Image();lureImages[key]=im;im.onload=()=>{if(last)draw(...last)};im.src='assets/lures/'+key+'.webp';}return lureImages[key];}
 function along(points,p){const lengths=points.slice(1).map((b,i)=>Math.hypot(b[0]-points[i][0],b[1]-points[i][1])),total=lengths.reduce((a,b)=>a+b,0);let distance=Math.min(1,Math.max(0,p))*total;for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]||i===lengths.length-1){const a=points[i],b=points[i+1],f=lengths[i]?Math.min(1,distance/lengths[i]):0;return {point:[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],angle:Math.atan2(b[1]-a[1],b[0]-a[0])};}distance-=lengths[i];}return {point:points[0],angle:0};}
 function motion(scene,mode,step,phase){const cfg=scenes[scene]||scenes.eddy,pass=step===3&&phase>=.5?'B':'A',target=pass==='B'?cfg.alt:cfg.target,origin=mode==='kayak'?[480,434]:mode==='side'?[180,147]:[180,400],tip=[origin[0]+32,origin[1]-(mode==='side'?50:65)],landing=mode==='side'?[target[0],148]:mode==='kayak'?[target[0],Math.max(180,target[1]-60)]:target;
 const cast=Array.from({length:49},(_,i)=>{const p=i/48;return [tip[0]+(landing[0]-tip[0])*p,tip[1]+(landing[1]-tip[1])*p-Math.sin(p*Math.PI)*(mode==='side'?38:120)];});
 const depth=mode==='side',base=depth?[target,[target[0]+55,target[1]+20],[target[0]+110,Math.min(430,target[1]+70)],[target[0]-10,Math.max(220,target[1]-45)],[origin[0]+100,230],[origin[0],165]]:[target,[target[0]+45,target[1]+45],[target[0]-65,target[1]+75],[origin[0]+20,origin[1]-35],origin];
 // Lift over the ledge on the way back rather than send the bait through the shelf.
 if(depth&&scene==='ledge')base.splice(1,base.length-1,[500,350],[580,430],[525,310],[350,245],[origin[0],165]);
 const cycle=step===3?Math.min(.999999,(phase*2)%1):Math.min(.999999,Math.max(0,phase));let stage,p;
 if(cycle<.27){stage='CASTING';p=along(cast,cycle/.27);}else if(cycle<.43){stage=mode!=='overview'?'SINKING':'SETTLE / PAUSE';p=along([landing,target],(cycle-.27)/.16);}else{stage='RETRIEVING';p=along(base,(cycle-.43)/.57);}
 return {...p,stage,cast,retrieve:base,origin,tip,landing,target,pass,cycle};
 }
 function drawLure(ctx,scene,m){const im=lureImage(scene),[x,y]=m.point;ctx.save();ctx.strokeStyle='#fff2c6';ctx.lineWidth=2;ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(...m.tip);ctx.lineTo(x,y);ctx.stroke();ctx.globalAlpha=1;path(ctx,[m.origin,m.tip],'#191d16',7);path(ctx,[m.origin,m.tip],'#ddc996',2);
 ctx.translate(x,y);ctx.rotate(m.angle);ctx.shadowColor='#fff3ba';ctx.shadowBlur=12;ctx.fillStyle='#fff6ce33';ctx.beginPath();ctx.ellipse(0,0,37,21,0,0,TAU);ctx.fill();
 if(im.complete&&im.naturalWidth){const scale=Math.min(76/im.naturalWidth,42/im.naturalHeight),w=im.naturalWidth*scale,h=im.naturalHeight*scale;ctx.drawImage(im,-w/2,-h/2,w,h);}else{ctx.fillStyle='#f3d65c';ctx.strokeStyle='#082f20';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,22,7,0,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(12,4);ctx.quadraticCurveTo(13,19,24,11);ctx.stroke();}
 ctx.restore();return m.stage+' · '+(lureChoices[scene]||lureChoices.eddy)[1]+' example'+(last?.[1]===3?' · Pass '+m.pass:'');
 }
 function draw(scene,step,phase=0,playing=false){
 last=[scene,step,phase,playing];const cfg=scenes[scene]||scenes.eddy,c=document.querySelector('#lessonCanvas');if(!c)return;
 const dpr=Math.min(2,globalThis.devicePixelRatio||1);if(c.width!==960*dpr||c.height!==540*dpr){c.width=960*dpr;c.height=540*dpr;}const ctx=c.getContext('2d');if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,960,540);
 const mode=view==='auto'?cfg.view:view,t=phase*8,im=picture(mode==='overview'?'overview':'side');ctx.fillStyle='#073b37';ctx.fillRect(0,0,960,540);
 if(im.complete&&im.naturalWidth)ctx.drawImage(im,0,0,960,540);
 ctx.fillStyle='#001e2522';ctx.fillRect(0,0,960,540);
 if(mode==='side')bed(ctx,scene);
 if(mode==='kayak'){
  for(let i=0;i<18;i++){const y=183+i*18,x=(i*91+t*12)%960;path(ctx,[[x,y],[x+40+i*2,y+1]],'#c8efe540',1);}
  if(['boulder','riffle','eddy'].includes(scene)){ctx.fillStyle='#7a7d69';ctx.strokeStyle='#b6b096';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(420,310,48,27,-.2,0,TAU);ctx.fill();ctx.stroke();}
 }
 if(scene==='wood'&&mode!=='overview')wood(ctx);
 const focus=mode==='overview'?cfg.focus:scene==='boulder'?[450,360]:cfg.focus;
 const pulse=(Math.sin(t*2)+1)/2;
 // Step 1 locates the feature. Later stages retain it for continuity.
 ring(ctx,...focus,t);label(ctx,cfg.feature,30,107);
 if(step>=1){
 for(const [x,y,X,Y]of cfg.flow){const p=(t*.18)%1;arrow(ctx,x+(X-x)*p*.45,y+(Y-y)*p*.45,X,Y);}
 if(['eddy','boulder'].includes(scene)){ctx.save();ctx.strokeStyle='#7feaff';ctx.lineWidth=5;ctx.setLineDash([14,10]);ctx.lineDashOffset=-t*32;ctx.beginPath();ctx.ellipse(...focus,80,40,.25,.1,TAU-.5);ctx.stroke();ctx.restore();arrow(ctx,focus[0]+65,focus[1]-20,focus[0]+77,focus[1]+10);label(ctx,'SOFTER / RETURN FLOW',Math.min(focus[0]-80,650),focus[1]+70,'#9beeff');}
 if(scene==='seam'){path(ctx,[[445,215],[490,280],[555,360],[620,425]],'#a1ecff',4,[15,10],-t*36);label(ctx,'SEAM',570,365,'#9beeff');}
 }
 const target=step===3&&phase>=.5?cfg.alt:cfg.target,origin=mode==='kayak'?[480,434]:mode==='side'?[180,147]:[180,400];
 if(mode==='kayak')bow(ctx);else if(step>=2)kayak(ctx,...origin,mode==='side'?Math.PI/2:-.4);
 if(step>=2){
 const m=motion(scene,mode,step,phase);
 path(ctx,m.cast,'#ffe17c',4,[16,10],-t*35);ring(ctx,...m.target,t,'#ffe17c');
 if(mode!=='overview')path(ctx,[m.landing,m.target],'#fff2bd',2,[5,8],-t*20);
 path(ctx,m.retrieve,'#ff9a77',4,[12,8],t*32);
 if(m.cycle>.25&&m.cycle<.38){const q=(m.cycle-.25)/.13;ctx.save();ctx.strokeStyle='#e8ffff';ctx.globalAlpha=1-q;ctx.lineWidth=3;for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(m.landing[0],m.landing[1],10+q*35+i*8,3+q*8+i*3,0,0,TAU);ctx.stroke();}ctx.restore();}const lureStage=drawLure(ctx,scene,m);label(ctx,lureStage,30,486);
 c.dataset.lureStage=m.stage;c.dataset.lurePass=m.pass;

 }
 if(step===3){ring(ctx,...cfg.alt,t,'#c9ffb1');path(ctx,[cfg.target,cfg.alt],'#c9ffb1',3,[8,10],-t*20);label(ctx,'A',cfg.target[0]-12,cfg.target[1]-40);label(ctx,'B',cfg.alt[0]-12,cfg.alt[1]-40,'#c9ffb1');}
 ctx.fillStyle='#02261fec';ctx.fillRect(0,0,960,64);ctx.fillStyle='#ffe184';ctx.font='800 23px system-ui,sans-serif';ctx.fillText((step+1)+' / 4  '+['SEE IT','UNDERSTAND IT','FISH IT','TRY IT'][step],22,40);ctx.fillStyle='#fff';ctx.textAlign='right';ctx.font='700 18px system-ui,sans-serif';ctx.fillText(mode==='side'?'SIDE VIEW · illustrative depth':mode==='kayak'?'KAYAK VIEW · underwater cutaway':'RIVER OVERVIEW',937,39);ctx.textAlign='left';
 for(let i=0;i<4;i++){ctx.fillStyle=i<step?'#ffe184':i===step?'#d8ab42':'#739180';ctx.fillRect(i*240,532,i===step?240*phase:240,8);}
 c.setAttribute('aria-label',cfg.title+' — step '+(step+1)+' of 4: '+['See It','Understand It','Fish It','Try It'][step]+'. '+(step===0?cfg.feature:step===1?cfg.read:step===2?cfg.fish:cfg.try));
 const guide=document.querySelector('#riverStageGuide');if(guide){const text=[cfg.feature,cfg.read,cfg.fish,cfg.try][step];if(guide.textContent!==text)guide.textContent=text;}
 const scrub=document.querySelector('#riverScrub');if(scrub&&!scrub.matches(':active'))scrub.value=String((step+phase)*8);
 const status=document.querySelector('#riverPlaybackStatus');if(status)status.textContent='Step '+(step+1)+' of 4 · '+(playing?'Playing':'Paused');
 }
 return {draw,scenes,motion,setView(v){view=['auto','side','kayak','overview'].includes(v)?v:'auto';if(last)draw(...last);},getView:()=>view};
})();
