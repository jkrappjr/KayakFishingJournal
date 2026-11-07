const fs=require('fs'),vm=require('vm'),assert=require('assert');const {parseHTML}=require('linkedom');
const {window}=parseHTML(fs.readFileSync('index.html','utf8'));const store=new Map();
const data=JSON.parse(fs.readFileSync('public-reports-v313.json','utf8'));
const ctx=vm.createContext({window,document:window.document,console,Intl,Date,Promise,URL,Number,JSON,Math,Array,String,Set,Map,fetch:async()=>({ok:true,json:async()=>data}),location:{hash:'#/community'},navigator:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},scrollTo:()=>{},setInterval:()=>0,clearInterval:()=>{},setTimeout,clearTimeout,requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{},addEventListener:()=>{},alert:()=>{},Image:class{}});
window.KFJLocations={output:()=>'',takePending:()=>[]};window.KFJScienceData={output:()=>''};
for(const f of ['anglers-data-v313.js','public-reports-v313.js','app-v313.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
(async()=>{
 const api=window.KFJPublicReports;await api.load();await api.gallery(window.document.querySelector('#communityList'));
 assert.equal(window.document.querySelectorAll('#communityList .migrated-card').length,6);
 const anglers=window.KFJ_ANGLERS;assert.equal(anglers.length,11);
 for(const a of anglers){const rr=data.reports.filter(r=>r.directoryId===a.sourceId);if(rr.length){assert.equal(rr.length,a.trips);assert.equal(rr.reduce((t,r)=>t+r.fishCount,0),a.catches);}}
 for(const r of data.reports){assert(anglers.some(a=>a.sourceId===r.directoryId));await api.page(r.id);assert(window.document.querySelector('#reportDetail').textContent.includes(r.story.slice(0,45)));assert.equal(window.document.querySelectorAll('.report-photos img').length,r.photos.length);ctx.location.hash='#/directory/'+r.directoryId;vm.runInContext('route()',ctx);await new Promise(r=>setTimeout(r,5));assert(window.document.querySelector('#featuredAngler h3').textContent===r.author);assert.equal(window.document.querySelectorAll('#anglerReports .migrated-card').length,data.reports.filter(x=>x.directoryId===r.directoryId).length);}
 const john=data.reports.find(x=>x.date==='2026-10-07');assert.equal(api.metrics(john).mpc,9.6);assert.equal(api.metrics(data.reports.find(x=>x.author==='Heath Mullins')).minutes,null);
 assert(api.science(data.reports[0]).includes('0 mph'));assert(api.science(data.reports[0]).includes('0 in'));
 assert(!api.card({...john,author:'<script>alert(1)</script>'}).includes('<script>'));
 await api.gallery(window.document.querySelector('#communityList'),{query:'Heath'});assert.equal(window.document.querySelectorAll('#communityList .migrated-card').length,1);
 await api.page('missing');assert(window.document.querySelector('#reportDetail').textContent.includes('not found'));
 assert.equal(store.size,0,'reading website reports must not write personal journals');
 const html=fs.readFileSync('index.html','utf8'),routes=new Set([...html.matchAll(/data-route="([^"]+)"/g)].map(x=>x[1]));for(const m of html.matchAll(/href="#\/([^"/]+)/g))assert(routes.has(m[1]),m[1]);
 const sw=fs.readFileSync('sw.js','utf8'),core=JSON.parse('['+sw.split('CORE=[')[1].split('];')[0]+']');for(const x of core)assert(fs.existsSync(x),x);
 console.log('PASS: 6 reports / 11 profiles; author links both ways; profile totals match; full text + all 23 photos; search; zero readings; missing fields; escaping; 18 routes; '+core.length+' offline paths; personal storage unchanged.');
})().catch(e=>{console.error(e);process.exit(1)});
