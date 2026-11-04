/* Reuses the original Journal's side-view art, lure references and source poses. */
window.KFJSide=(()=>{
 const $=s=>document.querySelector(s),map={ned:'ned-rigged',jerkbait:'hardjerk',softplastic:'wacky',chatterbait:'chatter',crankbait:'crank',spinnerbait:'spinner',fluke:'softjerk',topwater:'plopper',jig:'jig',swimbait:'swim',tube:'tube',buzzbait:'buzz',craw:'creature'};
 const work={
 ned:'M190 346Q218 350 245 339Q260 314 276 343Q296 306 315 289Q337 274 356 301Q377 337 406 340Q422 307 445 333Q473 318 495 322L508 322Q521 335 535 344L640 334',
 jig:'M190 346Q225 350 263 228L305 280Q345 290 381 205L430 316Q469 319 504 240L559 332L640 290',
 craw:'M190 346Q230 350 255 333Q280 330 312 292Q332 270 350 290Q375 340 415 340L470 322L505 322L530 344L640 337',
 tube:'M190 346Q230 350 260 300Q285 260 320 289Q340 260 362 300L410 340Q440 280 480 322L540 342L640 330',
 softplastic:'M190 335Q230 240 280 190Q330 240 360 330Q395 250 440 215Q490 275 535 340L640 260',
 jerkbait:'M190 245L230 235L265 253L310 239L350 251L397 237L440 248L490 238L540 246L640 240',
 fluke:'M190 220C225 175 250 265 285 220S350 175 390 220S455 270 495 220S570 175 640 220',
 crankbait:'M190 145Q235 210 300 290Q335 276 365 302Q415 320 440 310Q480 290 510 315Q570 300 640 270',
 spinnerbait:'M190 255Q320 248 440 265T640 252',chatterbait:'M190 250Q310 244 440 255T640 247',swimbait:'M190 255Q300 240 420 253T640 248',topwater:'M140 126Q350 122 640 126',buzzbait:'M140 126Q350 122 640 126'
 };
 let bait=null,progress=0,playing=false,raf=0,start=0,zoom=false,rendered='',duration=18000;
 const surface=()=>['topwater','buzzbait'].includes(bait?.key);
 const bounds=()=>surface()?[0,.22,.22]:[0,.22,.4];
 function phase(p){return p<.22?0:(!surface()&&p<.4)?1:2}
 function stop(){playing=false;cancelAnimationFrame(raf);raf=0;if($('#playBaitMotion'))$('#playBaitMotion').textContent=progress>=1?'↻ Replay Presentation':'▶ Play Presentation'}
 function setup(b){
  const svg=$('#baitMotion');if(!svg)return;
  if(rendered===b.key)return;
  stop();bait=b;progress=0;rendered=b.key;zoom=false;
  const key=map[b.key],photo=key==='ned-rigged'?{src:'assets/lures/ned-rigged.webp',bounds:'0 0 752 650',width:752,height:650,label:'Rigged Ned-style example · Green Pumpkin',credit:'Lunkerhunt'}:window.WVLureImages[key];
  const pose=window.WVLureOrientation.sourcePose(key);
  const target=surface()?[140,126]:[190,work[b.key]?.includes('M190 145')?145:work[b.key]?.includes('M190 220')?220:work[b.key]?.includes('M190 245')?245:work[b.key]?.includes('M190 250')?250:work[b.key]?.includes('M190 255')?255:work[b.key]?.includes('M190 335')?335:346];
  svg.innerHTML=`<defs><marker id="sideArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 1L6 4L0 7" fill="none" stroke="#7cecff" stroke-width="2"/></marker></defs><image href="assets/river/side.webp" width="760" height="430" preserveAspectRatio="none"/><g fill="none" stroke="#7cecff" stroke-width="3" opacity=".85"><path d="M30 160H180" marker-end="url(#sideArrow)"/><path d="M270 210H420" marker-end="url(#sideArrow)"/><path d="M470 170H620" marker-end="url(#sideArrow)"/></g><g id="sideFlow" fill="#b6f8ff"></g><path id="sideCast" d="M672 108Q388 -19 140 126" fill="none" stroke="#f6d57b" stroke-width="4" stroke-dasharray="9 7"/><path id="sideSettle" d="M140 126Q160 200 ${target[0]} ${target[1]}" fill="none" stroke="#ff976e" stroke-width="3" stroke-dasharray="5 7"/><path id="sideWork" d="${work[b.key]}" fill="none" stroke="#17382c" stroke-width="8"/><path d="${work[b.key]}" fill="none" stroke="#ff976e" stroke-width="4"/><path id="sideLine" stroke="#f7e6ba" stroke-width="1.5" fill="none"/><g id="sideLure"><g id="sideWobble"><g transform="${pose}"><svg x="-44" y="-28" width="88" height="56" viewBox="${photo.bounds}" preserveAspectRatio="xMidYMid meet"><image href="${photo.src}" width="${photo.width}" height="${photo.height}"/></svg></g></g></g><g fill="#fff" stroke="#072e25" stroke-width="3" paint-order="stroke" font-family="sans-serif" font-size="19" font-weight="bold"><text x="18" y="31">WATER COLUMN · SIDE VIEW</text><text x="18" y="115">SURFACE</text><text x="475" y="150">CURRENT →</text></g>`;
  svg.setAttribute('aria-label',b.title+' side-view cast, action and retrieve over rocks and vegetation');
  $('#sideZoom').setAttribute('aria-pressed','false');
  $('#sidePrevious').onclick=()=>seek(bounds()[Math.max(0,phase(progress)-1)]);
  $('#sideNext').onclick=()=>seek(bounds()[Math.min(2,phase(progress)+1)]);
  $('#sideProgress').oninput=e=>seek(+e.target.value/100);
  $('#sideZoom').onclick=()=>{zoom=!zoom;$('#sideZoom').setAttribute('aria-pressed',String(zoom));paint(progress)};
  $('#baitMotion').dataset.photo=photo.src;
 }
 function paced(t){if(!['ned','jig','tube','craw','softplastic','jerkbait','fluke'].includes(bait.key))return t;const n=t*6,i=Math.floor(n),f=n-i;return Math.min(1,(i+Math.min(1,f/.58))/6)}
 function paint(p){
  const svg=$('#baitMotion');if(!svg||!bait)return;progress=Math.max(0,Math.min(1,p));
  const stage=phase(progress),startWork=surface()?.22:.4;
  const path=$(stage===0?'#sideCast':stage===1?'#sideSettle':'#sideWork');
  if(!path?.getTotalLength)return;
  let q=stage===0?progress/.22:stage===1?(progress-.22)/.18:(progress-startWork)/(1-startWork);q=stage===2?paced(q):q;
  const len=path.getTotalLength(),pt=path.getPointAtLength(Math.min(1,q)*len);
  const wobble=stage===2&&playing?Math.sin(progress*Math.PI*(bait.key==='chatterbait'?180:48))*(['chatterbait','swimbait','spinnerbait','buzzbait','topwater'].includes(bait.key)?5:2):0;
  $('#sideLure').setAttribute('transform',`translate(${pt.x} ${pt.y})`);
  $('#sideWobble').setAttribute('transform',`rotate(${wobble})`);
  $('#sideLine').setAttribute('d',`M672 108Q${(672+pt.x)/2} ${Math.max(120,pt.y-35)} ${pt.x} ${pt.y}`);
  $('#sideFlow').innerHTML=[0,1,2,3,4,5].map((_,i)=>`<circle cx="${((progress*1800+i*137)%740)+10}" cy="${180+(i%3)*48}" r="2"/>`).join('');
  $('#sideSettle').setAttribute('opacity',surface()?'0':'.7');
  $('#sideProgress').value=progress*100;
  const label=stage===0?'Cast':stage===1?'Settle / reach depth':'Retrieve / work the bait';
  $('#sideStatus').textContent=label+' · '+(stage===2?bait.retrieve:stage===0?'Cast beyond the target and leave room for the presentation.':surface()?'Keep the bait on the surface.':'Let the bait reach its working depth.');
  $('#sidePrevious').disabled=stage===0;$('#sideNext').disabled=stage===2;
  svg.setAttribute('viewBox',zoom?`${Math.max(0,Math.min(380,pt.x-190))} ${Math.max(0,Math.min(215,pt.y-107))} 380 215`:'0 0 760 430');
 }
 function seek(p){stop();paint(p)}
 function draw(b,p){setup(b);paint(p)}
 function play(b){setup(b);if(progress>=1)progress=0;playing=true;$('#playBaitMotion').textContent='❚❚ Pause';start=performance.now()-progress*duration;
  function tick(now){if(!playing)return;paint((now-start)/duration);if(progress>=1){stop();return}raf=requestAnimationFrame(tick)}raf=requestAnimationFrame(tick)
 }
 function toggle(b){if(playing)stop();else play(b)}
 return {draw,play,stop,toggle};
})();
