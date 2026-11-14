
/* =========================================================
   NOVITÀ: ultimo colpo al rallentatore · evoluzioni delle carte · voto di stile
   oggetti nella stanza (barili esplosivi, lampadari, spuntoni) · muri crepati con stanze segrete
   spiegazioni "Novità" la prima volta che si incontra ognuna
   In co-op la disposizione degli oggetti è uguale per tutti (stesso seme); chi fa scattare un oggetto
   lo dice agli altri, e i danni ai nemici li calcola chi ha creato la partita.
   ========================================================= */
const novOn=()=>G.scene==='tower'&&!G.pvp&&!G.tutorial&&!G.horde;

/* ---------- spiegazioni "Novità" (una volta sola ciascuna) ---------- */
const NT={q:[],cur:null,t:0,gap:0,seen:store.get('nt-seen',{})||{}};
// le spiegazioni legate a un piano si buttano se nel frattempo sei passato a un altro (riappariranno la prossima volta)
function ntip(k,title,text){if(NT.seen[k]||(NT.cur&&NT.cur.k===k)||NT.q.some(x=>x.k===k))return;NT.q.push({k,title,text,f:G.scene==='tower'?G.floor:null});}
setInterval(()=>{const free=!G.tutorial&&!G.ctut&&(G.state==='play'||G.state==='cellar')&&!(G.finT>0);const box=$('tutBox');
  if(NT.cur){if(!free){if(!box.hidden)box.hidden=true;return;}
    if(box.hidden){box.hidden=false;}NT.t-=0.25;if(NT.t<=0){box.hidden=true;NT.cur=null;NT.gap=1.2;document.body.classList.remove('ntip-on');}return;}
  if(NT.gap>0){NT.gap-=0.25;return;}
  while(NT.q.length&&NT.q[0].f!=null&&(G.scene!=='tower'||NT.q[0].f!==G.floor))NT.q.shift();
  if(free&&NT.q.length){NT.cur=NT.q.shift();NT.seen[NT.cur.k]=1;store.set('nt-seen',NT.seen);
    box.hidden=false;box.classList.remove('done');$('tutStep').textContent='Novità';$('tutTitle').textContent=NT.cur.title;$('tutText').innerHTML=NT.cur.text;
    box.classList.remove('pop');void box.offsetWidth;box.classList.add('pop');document.body.classList.add('ntip-on');NT.t=Math.min(11,4+NT.cur.text.length/22);sfx('ui');}},250);

/* ---------- stile del voto, del pannello novità e dei suggerimenti ---------- */
{const st=document.createElement('style');st.textContent=`
body.ntip-on #evHud{top:calc(104px + env(safe-area-inset-top,0px))}
#gradeFx{position:fixed;left:50%;top:26%;transform:translate(-50%,-50%);z-index:41;pointer-events:none;text-align:center;font-family:var(--f-display,inherit);opacity:0}
#gradeFx.on{animation:grIn 2.2s ease-out forwards}
#gradeFx .g-l{display:block;font-size:min(22vw,150px);line-height:.9;color:var(--gc,#ffd27a);text-shadow:0 0 24px var(--gc,#ffd27a),0 4px 0 rgba(0,0,0,.6)}
#gradeFx .g-t{display:block;font-size:13px;letter-spacing:.3em;text-transform:uppercase;color:#f3ead7}
#gradeFx .g-b{display:block;margin-top:4px;font-size:15px;color:#ffd27a}
@keyframes grIn{0%{opacity:0;transform:translate(-50%,-50%) scale(2.4) rotate(-8deg)}12%{opacity:1;transform:translate(-50%,-50%) scale(.92) rotate(2deg)}20%{transform:translate(-50%,-50%) scale(1) rotate(0)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-62%) scale(1)}}
#newsBox{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(6,5,10,.72);padding:12px}
#newsBox[hidden]{display:none}
#newsBox .nb{max-width:520px;width:100%;max-height:calc(100vh - 24px);overflow:auto;background:#14111b;border:1px solid rgba(255,210,122,.7);padding:14px 18px 16px;color:#f3ead7;box-shadow:0 10px 40px rgba(0,0,0,.6)}
#newsBox small{display:block;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--ink-2,#a99)}
#newsBox h2{margin:2px 0 10px;font-family:var(--f-display,inherit);font-weight:400;font-size:22px;color:#ffd27a}
#newsBox ul{margin:0;padding:0;list-style:none;display:grid;gap:7px}
#newsBox li{font-size:13px;line-height:1.35}#newsBox li b{color:#ffd27a;font-weight:600}
#newsBox button{margin-top:14px;width:100%}
.card.evo{border-color:#ffd27a;box-shadow:0 0 22px rgba(255,210,122,.45),inset 0 0 18px rgba(255,210,122,.15)}
.card.evo .rar{color:#ffd27a}`;document.head.appendChild(st);}
const gradeFx=document.createElement('div');gradeFx.id='gradeFx';gradeFx.innerHTML='<span class="g-t">Stile</span><span class="g-l"></span><span class="g-b"></span>';document.body.appendChild(gradeFx);

/* ---------- 1. ultimo colpo al rallentatore ---------- */
const _keNov=killEnemy;
killEnemy=function(e){const was=e.dead;const r=_keNov(e);
  try{if(!was&&e.dead&&novOn()&&!e.escaped&&!G.killcam&&G.state==='play'){const boss=e.type==='boss';
    const last=boss||(!G.queue.length&&!G.enemies.some(x=>x!==e&&!x.dead&&!x.summon));
    if(last){G.finT=boss?1.25:0.85;G.finCam={x:e.x,y:e.y+e.h*0.5,boss};sfx('crit');burst(e.x,e.y+e.h/2,0xffffff,20,7,2,0);}}}catch(err){}
  return r;};

/* ---------- 2. evoluzioni delle carte ---------- */
const EVOS=[
  {id:'evo_gelo',  name:'Famiglio di ghiaccio',icon:'snow', need:['famiglio','gelo'],    desc:()=>'Il famiglio spara più spesso: i suoi colpi gelano e trapassano i nemici'},
  {id:'evo_fiamme',name:'Turbine di fiamme',   icon:'fire', need:['turbine','scia'],     desc:()=>'La giravolta è più ampia e lascia un cerchio di fuoco'},
  {id:'evo_tuono', name:'Giudizio del tuono',  icon:'bolt', need:['catena','esecuz'],    desc:()=>'Il fulmine parte ogni 3 colpi, salta su 7 nemici e finisce chi è sotto il 30%'},
  {id:'evo_oro',   name:'Esplosioni d\'oro',   icon:'star', need:['cadaveri','rubini'],  desc:()=>'Le esplosioni sono più grandi e lasciano sempre un rubino'},
  {id:'evo_rovi',  name:'Corazza di rovi',     icon:'shield',need:['spine','hp'],        desc:()=>'Le spine colpiscono tutti i nemici vicini, il doppio più forte, e ti curano'},
].map(o=>Object.assign({max:1,evo:true,apply(){}},o));
const upMax=id=>{const u=UPG.find(x=>x.id===id);return u?u.max:1;};
const evoReady=()=>EVOS.filter(v=>!lvC(v.id)&&v.need.every(id=>lvC(id)>=upMax(id)));
const _ruNov=rollUpgrades;
rollUpgrades=function(n){const out=_ruNov(n);
  try{if(novOn()){const ev=evoReady();if(ev.length){const v=ev[0];out.unshift(v);if(out.length>n)out.pop();
        ntip('evo','Evoluzione!','Hai due carte al massimo che si combinano: prendi la carta dorata per farle evolvere in una versione molto più forte.');}
      if(out.some(u=>CARD_NEW.includes(u.id)))ntip('carte','Carte speciali','Alcune carte cambiano il modo di combattere: fulmini, esplosioni, un famiglio… Si prendono al massimo 2 volte. Se due carte che vanno d\'accordo arrivano al massimo, compare un\'<b>Evoluzione</b>.');}}catch(err){console.warn('evo',err);}
  return out;};
const CARD_NEW=['catena','esecuz','cadaveri','scia','turbine','spine','famiglio','gelo','rubini'];
const _chNov=cardHTML;
cardHTML=function(o,i){if(!o||!o.evo)return _chNov(o,i);
  return `<button class="card evo" data-i="${i}" id="card${i}"><span class="card-key">${i+1}</span><span class="rar">Evoluzione</span><span class="card-icon">${svg(o.icon)}</span><span class="card-name">${o.name}</span><span class="card-desc">${o.desc()}</span><span class="card-lv">${o.need.map(id=>(UPG.find(u=>u.id===id)||{}).name).join(' + ')}</span></button>`;};
// effetti delle evoluzioni (famiglio di ghiaccio e ritmo del fulmine sono dentro 22-carte.js)
const _hitNov=hitEnemy;
hitEnemy=function(e,base,dir,o){o=o||{};
  // giudizio del tuono: i fulmini delle carte finiscono chi è sotto il 30%
  if(lvC('evo_tuono')&&o.card&&o.chain&&e&&e.type!=='boss'&&e.maxHp>0&&e.hp/e.maxHp<0.3&&novOn()){base=Math.max(base,e.hp+10);popNum(e.x,e.y+e.h+0.7,'Fulminato!','crit');}
  return _hitNov(e,base,dir,o);};
function evoTick(dt){if(!novOn()||G.state!=='play')return;
  // turbine di fiamme: quando il turbine scatta (il salto in aria) lascia un cerchio di fuoco
  if(lvC('evo_fiamme')&&!P.onGround&&G.prevAJ2!=null&&P.airJumps<G.prevAJ2&&!P.dead){const x=P.x,y=P.y+1;
    for(const t of foesNear(x,y,3.4,null))cardHit(t,0.6,t.x>=x?1:-1,{kb:8,ky:7,effect:'fuoco'});fxRing(x,y,0,0xff7a2e,3.4,0.45,true);
    for(const dx of [-1.6,0,1.6])addZone({x:clamp(x+dx,-HALF+1,GATE_X-1),r:0.9,t:3,dmg:weaponDamage()*0.25,col:0xff7a2e,eff:'fuoco',h:2.4});}
  G.prevAJ2=P.airJumps;}
// esplosioni d'oro e corazza di rovi
const _omkNov=onMyKill;
onMyKill=function(x,y,e){_omkNov(x,y,e);if(!novOn())return;
  if(lvC('evo_oro')&&lvC('cadaveri')){setTimeout(()=>{if(!novOn())return;addCoins(1,x,y+1.2);for(const t of foesNear(x,y,3.9,e))cardHit(t,0.35,t.x>=x?1:-1,{kb:5,ky:4});fxRing(x,y,0,0xffd27a,3.9,0.35,true);},120);}};
const _hpNov=hurtPlayer;
hurtPlayer=function(d,fx,eff){if(MP.redir>=0||P.dead||!novOn())return _hpNov(d,fx,eff);const h0=P.hp,r=_hpNov(d,fx,eff),lost=Math.max(0,h0-P.hp);
  if(lost>0){G.stDmg=(G.stDmg||0)+lost;
    if(lvC('evo_rovi')&&lvC('spine')){for(const t of foesNear(P.x,P.y+1,3.5,null))cardHit(t,1.6,t.x>=P.x?1:-1,{kb:7});heal(Math.round(S.maxHp*0.03),true);fxRing(P.x,P.y+1,0,0xc9e08a,3.5,0.3,true);}}
  return r;};

/* ---------- 3. voto di stile a fine piano ---------- */
const GRADE_COL={S:'#ffd27a',A:'#7fe08a',B:'#8fd0ff',C:'#d9c8ff',D:'#a99'};
function styleGrade(){const t=G.time-(G.stT0||G.time),par=G.boss0?55:10+3.2*Math.max(3,G.stN||6),hpPct=(G.stDmg||0)/Math.max(1,S.maxHp);
  const sc=40*clamp(1.45-t/par,0,1)+35*clamp(1-hpPct/0.6,0,1)+25*clamp((G.stMax||0)/12,0,1);
  return sc>=85?'S':sc>=70?'A':sc>=55?'B':sc>=38?'C':'D';}
function showGrade(){const g=styleGrade(),f=G.floor,bonus=g==='S'?25+f:g==='A'?12+Math.round(f/2):g==='B'?5:0;
  gradeFx.style.setProperty('--gc',GRADE_COL[g]);gradeFx.querySelector('.g-l').textContent=g;gradeFx.querySelector('.g-b').textContent=bonus?'+'+bonus+' rubini':'';
  gradeFx.classList.remove('on');void gradeFx.offsetWidth;gradeFx.classList.add('on');sfx(g==='S'?'legend':'pick');if(bonus)addCoins(bonus,P.x,P.y+2.4);
  ntip('voto','Voto di stile','Alla fine di ogni piano ricevi un voto da D a S: conta quanto sei veloce, quanta vita perdi e le combo più lunghe. Con A e S guadagni rubini.');}
function gradeTick(){if(!novOn()||G.safe)return;G.stMax=Math.max(G.stMax||0,G.cmb||0);
  if(G.cleared&&!G.stDone&&G.stT0!=null){G.stDone=true;setTimeout(()=>{if(G.scene==='tower')showGrade();},G.finT>0?900:250);}}

/* ---------- 4 e 5. oggetti nella stanza e muri segreti ---------- */
const HZ={barrelG:null};
function hzMats(){if(HZ.m)return HZ.m;const k=m=>{m.userData.keep=true;return m;};
  HZ.m={red:k(toon(0xb8322a)),redD:k(toon(0x6e1c18)),band:k(toon(0xe8c34a,{emissive:0x5a3a00,emissiveIntensity:0.3})),iron:k(toon(0x3c3c44)),
    wax:k(toon(0xf3e7c9)),flame:k(new THREE.MeshBasicMaterial({color:0xffc35a})),spike:k(toon(0x9aa0aa)),base:k(toon(0x2e2e34)),
    glow:k(new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending})),
    dark:k(new THREE.MeshBasicMaterial({color:0x07060a})),crack:k(new THREE.MeshBasicMaterial({color:0x14121a}))};return HZ.m;}
function buildBarrelHz(x){const M=hzMats(),g=new THREE.Group();g.position.set(x,0,-0.7);levelGroup.add(g);
  mesh(new THREE.LatheGeometry(BARREL_PTS,18),M.red,0,0,0,g);for(const y of [0.2,0.85]){const r=mesh(new THREE.TorusGeometry(0.43,0.03,6,24),M.iron,0,y,0,g);r.rotation.x=Math.PI/2;}
  const b=mesh(new THREE.CylinderGeometry(0.445,0.445,0.16,18,1,true),M.band,0,0.52,0,g,true);
  // simbolo della fiamma davanti
  const fl=mesh(new THREE.ConeGeometry(0.12,0.3,4),M.band,0,0.55,0.43,g,true);fl.rotation.x=0.25;
  return {k:'barile',x,g,state:0,t:0};}
function buildChandHz(x){const M=hzMats(),g=new THREE.Group(),y=6.4;g.position.set(x,y,-0.2);levelGroup.add(g);
  mesh(new THREE.CylinderGeometry(0.035,0.035,CEIL-y,6),M.iron,0,(CEIL-y)/2,0,g,true);
  const ring=mesh(new THREE.TorusGeometry(0.95,0.07,6,28),M.iron,0,0,0,g);ring.rotation.x=Math.PI/2;
  for(let i=0;i<4;i++){const a=i/4*TAU;const s=mesh(new THREE.CylinderGeometry(0.025,0.025,1.0,4),M.iron,Math.cos(a)*0.45,0.42,Math.sin(a)*0.45,g,true);s.rotation.z=Math.cos(a)*0.75;s.rotation.x=-Math.sin(a)*0.75;}
  for(let i=0;i<6;i++){const a=i/6*TAU,cx=Math.cos(a)*0.95,cz=Math.sin(a)*0.95;mesh(new THREE.CylinderGeometry(0.06,0.06,0.28,8),M.wax,cx,0.2,cz,g,true);const f=mesh(new THREE.ConeGeometry(0.05,0.16,6),M.flame,cx,0.42,cz,g,true);f.userData.fl=1;}
  mesh(sph(0.6,12,8),M.glow,0,0.3,0,g,true);
  return {k:'lampadario',x,g,y,state:0,vy:0,t:0};}
function buildSpikeHz(x){const M=hzMats(),g=new THREE.Group();g.position.set(x,0,0);levelGroup.add(g);
  mesh(rbox(2.7,0.12,1.9,0.04),M.base,0,0.03,-0.1,g,true);const sp=new THREE.Group();g.add(sp);
  for(let i=0;i<7;i++)for(let j=0;j<3;j++)mesh(new THREE.ConeGeometry(0.1,0.55,5),M.spike,-1.15+i*0.383+(j%2)*0.19,0.27,-0.7+j*0.6,sp,true);
  sp.position.y=-0.5;return {k:'spuntoni',x,g,sp,hit:new Map()};}
function buildWallHz(x,rw){const M=hzMats(),g=new THREE.Group();g.position.set(x,0,-3.05);levelGroup.add(g);
  const niche=mesh(new THREE.PlaneGeometry(2.0,2.8),M.dark,0,1.45,-0.08,g,true);
  const slab=new THREE.Group();g.add(slab);const zc=new THREE.Color(ZONES[zoneIndex(G.floor)].wall),stone=toon(zc.clone().multiplyScalar(0.92)),stoneL=toon(zc.clone().multiplyScalar(1.08));
  const pcs=[];for(let i=0;i<3;i++)for(let j=0;j<4;j++){const p=mesh(rbox(0.78,0.72,0.28,0.06),(i+j)%2?stone:stoneL,-0.8+i*0.8,0.38+j*0.74,0.05,slab);p.rotation.z=rand(-0.04,0.04);pcs.push(p);}
  for(const [cx,cy,l,a] of [[-0.3,1.6,1.4,0.9],[0.25,1.2,1.2,-0.7],[0.0,2.2,0.9,0.2],[0.5,0.7,0.8,1.2]])mesh(new THREE.BoxGeometry(0.08,l,0.06),M.crack,cx,cy,0.22,slab,true).rotation.z=a;
  for(let i=0;i<5;i++)mesh(rbox(rand(0.15,0.3),rand(0.1,0.2),0.2,0.04),stone,rand(-1,1),0.08,0.45+rand(0,0.3),g,true);
  return {k:'muro',x,g,slab,pcs,hp:3,rw,state:0};}
// scelta degli oggetti del piano: stessa per tutti in co-op
function planHazards(f){const out=[];if(isBossFloor(f)||isSafeFloor(f)||f<2||G.horde)return out;
  const used=[GATE_X-1,G.entry?G.entry.x:-HALF+3];const free=()=>{for(let k=0;k<30;k++){const x=rand(-HALF+3,GATE_X-5);if(used.every(u=>Math.abs(u-x)>4.2)){used.push(x);return x;}}return null;};
  const R=Math.random;
  if(R()<0.55){const n=f>=8&&R()<0.4?2:1;for(let i=0;i<n;i++){const x=free();if(x!=null)out.push(['barile',x]);}}
  if(R()<0.4){const x=free();if(x!=null)out.push(['lampadario',x]);}
  if(f>=4&&R()<0.35){const x=free();if(x!=null)out.push(['spuntoni',x]);}
  if(f>=3&&R()<(NT.seen.segreto?0.13:0.35)){const x=free();if(x!=null)out.push(['muro',x,pick(['tesoro','tesoro','santuario','sfida'])]);}
  return out;}
const _sfNov=startFloor;
startFloor=function(f){G.haz=[];G.finT=0;G.finCam=null;G.stDone=false;G.stT0=null;G.stDmg=0;G.stMax=0;G.stN=0;G.boss0=false;
  _sfNov(f);
  try{if(G.scene!=='tower'||G.tutorial||G.pvp)return;G.stT0=G.time;G.stN=G.queue.length;G.boss0=isBossFloor(f);
    const plan=MP.live()?withSeed(MP.seed*577+f*1543,()=>planHazards(f)):planHazards(f);
    plan.forEach(([k,x,rw],i)=>{const h=k==='barile'?buildBarrelHz(x):k==='lampadario'?buildChandHz(x):k==='spuntoni'?buildSpikeHz(x):buildWallHz(x,rw);h.i=i;G.haz.push(h);});
    const has=k=>G.haz.some(h=>h.k===k);
    if(has('barile'))ntip('barile','Barili esplosivi','I barili rossi esplodono se li colpisci: attira i nemici vicino e falli saltare in aria. Stai lontano anche tu!');
    if(has('lampadario'))ntip('lampadario','Lampadari','Salta e colpisci il lampadario: cade e schiaccia i nemici che ci sono sotto.');
    if(has('spuntoni'))ntip('spuntoni','Spuntoni','Ogni tanto gli spuntoni escono dal pavimento: feriscono i nemici sopra, ma anche te. Scaraventaci sopra i nemici!');
    if(has('muro'))ntip('segreto','Muro crepato','Vedi un muro crepato sullo sfondo? Colpiscilo più volte (un colpo forte lo rompe prima): dietro c\'è una stanza segreta con un premio.');
    if(G.safe)ntip('santuari13','Santuari','I santuari ora arrivano ogni 13 piani (13, 26, 39…): riposati, incontra gli altri giocatori e salva la scalata nel letto.');
    if(isBossFloor(f))ntip('bende','Bende contro i guardiani','Durante i guardiani cadono bende quando il boss scende al 75%, 50% e 25% di vita, e ogni tanto se a terra non ce ne sono.');
    if(MP.live())ntip('coopxp','Esperienza in co-op','In co-op l\'esperienza va a chi dà il colpo finale: ognuno guadagna con i nemici che sconfigge lui.');
    if(G.event&&EVENTS[G.event]&&['tempo','ladro','meteore','giganti','furia','campione'].includes(G.event)){const D={tempo:'Un timer in alto: se ripulisci il piano prima che finisca, cade un forziere bonus.',ladro:'Un folletto dorato scappa da te: prendilo prima che sparisca e lascia oggetti e rubini.',meteore:'Le zone segnate a terra stanno per essere colpite da massi infuocati: colpiscono anche i nemici, usale a tuo vantaggio.',giganti:'Meno nemici ma enormi e resistenti: danno il doppio dell\'esperienza.',furia:'Fai il 50% di danno in più, ma arrivano molti più nemici.',campione:'Un élite dorato con un nome ti aspetta: sconfiggilo per un oggetto almeno Raro.'};
      ntip('ev_'+G.event,EVENTS[G.event].n,D[G.event]);}
  }catch(err){console.warn('novità',err);}};
// messaggi co-op: chi fa scattare un oggetto lo dice a tutti
function hzSend(i,a){if(MP.live())MP.bcast({t:'hz',f:G.floor,i,a,p:MP.myPid});}
const _mmNov=mpMsg;
mpMsg=function(m,from){if(m&&m.t==='hz'){if(G.scene==='tower'&&m.f===G.floor){const h=(G.haz||[]).find(h=>h.i===m.i);if(h)hzTrigger(h,m.a,m.p!=null?m.p:from,true);}
    if(MP.host)MP.bcast(Object.assign({},m),from);return;}return _mmNov(m,from);};
// danno ai nemici: solo chi ha creato la partita (o chi gioca da solo); l'esperienza va a chi ha fatto scattare l'oggetto
function hzDamage(x,y,r,fn,by){if(MP.live()&&!MP.host)return;const hf=MP.hitFrom;if(MP.live())MP.hitFrom=by!=null?by:MP.myPid;
  try{for(const e of foes())if(Math.abs(e.x-x)<r+e.w/2&&Math.abs((e.y+e.h/2)-y)<r+e.h/2)fn(e);}finally{MP.hitFrom=hf;}}
const hzHit=(e,d,dir,o)=>hitEnemy(e,d,dir,Object.assign({env:true,card:true,noCombo:true,unblockable:true},o||{}));
function hzTrigger(h,a,by,remote){if(h.state>=2&&h.k!=='muro')return;
  if(h.k==='barile'&&h.state===0){h.state=1;h.t=0.7;h.by=by;sfx('hit');}
  else if(h.k==='lampadario'&&h.state===0){h.state=1;h.vy=0;h.by=by;sfx('slam');burst(h.x,CEIL-0.5,0x8a8279,10,3,1,0.2);}
  else if(h.k==='muro'&&h.state===0){if(a==='rompi')wallBreak(h,by);else{h.hp--;h.slab.position.x=rand(-0.06,0.06);burst(h.x,1.4,0x8a8279,10,4,1,0.3,-2.8);sfx('hit');if(h.hp<=0)wallBreak(h,by);}}
  if(!remote)hzSend(h.i,a);}
function barrelBoom(h){h.state=2;levelGroup.remove(h.g);const x=h.x,y=0.8;
  burst(x,y,0xff7a2e,40,11,4,0.4);burst(x,y,0xffd27a,20,8,3,0.3);spray(x,y,0x3a2a20,20,9,3);fxRing(x,y,0,0xff7a2e,3.4,0.4,true);shake(0.45);sfx('boom');
  for(let i=0;i<9;i++){const m=new THREE.Mesh(chunkGeo,chunkMat(i%2?0xb8322a:0x6e1c18));m.scale.set(0.5,rand(0.6,1.2),0.3);m.position.set(x+rand(-.3,.3),0.7,-0.6);scene.add(m);G.chunks.push({m,vx:rand(-8,8),vy:rand(6,12),vz:rand(-2,2),rx:rand(-12,12),rz:rand(-12,12),t:0});}
  hzDamage(x,y,3.4,e=>hzHit(e,e.type==='boss'?weaponDamage()*3:Math.max(weaponDamage()*3,e.maxHp*0.3),e.x>=x?1:-1,{kb:12,ky:10,effect:'fuoco'}),h.by);
  if(!P.dead&&Math.abs(P.x-x)<2.4&&P.y<3)hurtPlayer(Math.round(S.maxHp*0.12),x);
  for(const o of G.haz)if(o!==h&&o.k==='barile'&&o.state===0&&Math.abs(o.x-x)<3.6)setTimeout(()=>hzTrigger(o,null,h.by,true),180);}   // reazione a catena (ognuno la calcola da sé)
function chandCrash(h){h.state=2;const x=h.x;shake(0.5);sfx('slam');sfx('boom');burst(x,0.4,0x8a8279,30,9,3,0.5);burst(x,0.6,0xffc35a,14,6,2,0.3);
  h.g.position.y=0.15;h.g.rotation.z=0.12;h.t=4;
  hzDamage(x,0.8,1.9,e=>hzHit(e,e.type==='boss'?weaponDamage()*4:Math.max(weaponDamage()*4,e.maxHp*0.45),e.x>=x?1:-1,{kb:4,ky:3,stun:1.6}),h.by);
  if(!P.dead&&Math.abs(P.x-x)<1.6&&P.y<2.5)hurtPlayer(Math.round(S.maxHp*0.15),x);}
function wallBreak(h,by){if(h.state)return;h.state=1;const x=h.x;sfx('slam');shake(0.35);burst(x,1.5,0x8a8279,36,8,3,0.6,-2.7);
  for(const p of h.pcs){const w=new THREE.Vector3();p.getWorldPosition(w);h.slab.remove(p);p.position.copy(w);scene.add(p);G.chunks.push({m:p,vx:rand(-4,4),vy:rand(3,8),vz:rand(2,5),rx:rand(-8,8),rz:rand(-8,8),t:0});}
  h.g.remove(h.slab);
  // la nicchia si illumina e mostra il premio
  const M=hzMats(),glow=mesh(new THREE.PlaneGeometry(1.9,2.7),M.glow,0,1.45,-0.06,h.g,true);glow.material=M.glow;
  popNum(x,3.6,'Stanza segreta!','xp');sfx('legend');
  if(h.rw==='tesoro'){const n=G.chests.length;spawnChest(x,0,false);if(G.chests.length>n){const c=G.chests[G.chests.length-1];c.bonus=true;c.dy=4;c.dvy=0;}}
  else if(h.rw==='santuario'){const r=new THREE.Group();r.position.set(0,1.5,0.4);h.g.add(r);mesh(new THREE.OctahedronGeometry(0.42),M.band,0,0,0,r,true);mesh(sph(0.75,14,10),M.glow,0,0,0,r,true);h.rune=r;h.state=3;}
  else if(h.rw==='sfida'){if(!MP.live()||MP.host)setTimeout(()=>{if(G.scene!=='tower')return;const e=spawnChampAt(x);if(e){e.ename='Custode della stanza segreta';e.champ=true;}},500);}
  ntip('segreto2','Stanza segreta','Dietro i muri crepati trovi un tesoro, un santuario (cura e un potenziamento) oppure un custode da sconfiggere per un oggetto raro.');}
function spawnChampAt(x){const f=G.floor,pool=Object.keys(TYPES).filter(k=>TYPES[k].from<=f&&!TYPES[k].fly&&k!=='imp'&&k!=='fungus');const t=pick(pool.length?pool:['guard']);
  const e=spawnEnemy(t,{x:clamp(x,-HALF+2,GATE_X-2)});if(!e)return null;
  e.elite=true;e.champ=true;e.emod=null;e.hp*=3;e.maxHp=e.hp;e.dmg*=1.25;e.sc=1.35;e.w*=1.15;e.h*=1.15;goldTint(e,0.35);sfx('roar');
  if(G.cleared){G.cleared=false;G.gateOpen=false;}return e;}
const isChampNov=e=>e.ename==='Custode della stanza segreta';
const _keNov2=killEnemy;
killEnemy=function(e){const was=e.dead,cu=!was&&isChampNov(e)&&G.scene==='tower';const r=_keNov2(e);
  if(cu){try{const f=G.floor,o=Math.random()<0.5?makeWeapon(G.cls.weapon,rollRarity(f,2),f):makeGear(pick(Object.keys(GEAR)),rollRarity(f,2),f);dropItem(o,e.x,e.y+1,0,1);addCoins(15+f,e.x,e.y+e.h+1.4);popNum(e.x,e.y+e.h+0.8,'Custode sconfitto!','xp');}catch(err){}}
  return r;};
// colpi del giocatore sugli oggetti (spada e proiettili)
function hzHitCheck(){const A=P.atk;const act=A&&!A.noHit&&A.t>=A.wind&&A.t<=A.wind+A.act+0.05;
  for(const h of G.haz){if(h.k==='spuntoni')continue;if(h.k==='barile'&&h.state!==0)continue;if(h.k==='lampadario'&&h.state!==0)continue;if(h.k==='muro'&&h.state!==0)continue;
    const hy=h.k==='lampadario'?h.y+0.2:h.k==='muro'?1.4:0.6;
    if(act&&h.lastA!==A){const dx=(h.x-P.x)*P.face,dy=Math.abs(hy-(P.y+1.2));if(dx>-0.5&&dx<(h.k==='muro'?3:2.9)&&dy<(h.k==='muro'?2.2:1.9)){h.lastA=A;
        const heavy=A.anim==='heavy'||A.fin;hzTrigger(h,h.k==='muro'&&heavy?'rompi':null,MP.myPid,false);continue;}}
    for(const p of G.projs){if(p.dead||p.owner!=='p')continue;if(Math.abs(p.x-h.x)<0.7+(p.w||0.5)/2&&Math.abs(p.y-hy)<1.1){if(!p.hzHit)p.hzHit=new Set();if(p.hzHit.has(h))continue;p.hzHit.add(h);hzTrigger(h,null,MP.myPid,false);if(!p.pierce)p.dead=true;break;}}}}
function hzTick(dt){if(!G.haz||!G.haz.length||G.scene!=='tower')return;if(G.state==='play'&&!P.dead)hzHitCheck();
  const now=Date.now()/1000;
  for(const h of G.haz){
    if(h.k==='barile'&&h.state===1){h.t-=dt;h.g.scale.setScalar(1+Math.sin(G.time*40)*0.05);if(Math.random()<0.5)burst(h.x,1.15,0xffd27a,1,2,1,0,-0.7);if(h.t<=0)barrelBoom(h);}
    else if(h.k==='lampadario'){if(h.state===0){h.g.rotation.z=Math.sin(G.time*1.3+h.x)*0.04;for(const c of h.g.children)if(c.userData.fl)c.scale.y=1+Math.sin(G.time*14+c.position.x*9)*0.15;}
      else if(h.state===1){h.vy+=GRAV*dt;h.g.position.y+=h.vy*dt;h.g.rotation.z+=dt*0.6;if(h.g.position.y<=0.2)chandCrash(h);}
      else if(h.state===2&&h.t>0){h.t-=dt;if(h.t<=0)levelGroup.remove(h.g);}}
    else if(h.k==='spuntoni'){const ph=(now+h.x*0.13)%3.2,up=ph>2.5,warn=ph>2.1&&!up;const ty=up?0:warn?-0.32:-0.5;h.sp.position.y=lerp(h.sp.position.y,ty,Math.min(1,dt*(up?28:8)));
      if(warn&&Math.random()<0.3)burst(h.x+rand(-1.2,1.2),0.15,0x9aa0aa,1,1.5,1,0);
      if(up){if(!P.dead&&Math.abs(P.x-h.x)<1.35+P.w/2&&P.y<0.5&&!(P.invul>0))hurtPlayer(Math.round(S.maxHp*0.08),h.x);
        if(!MP.live()||MP.host)for(const e of foes()){if(e.fly)continue;if(Math.abs(e.x-h.x)<1.35+e.w/2&&e.y<0.6&&(h.hit.get(e)||0)<now){h.hit.set(e,now+1);
            const hf=MP.hitFrom;if(MP.live())MP.hitFrom=-1;try{hzHit(e,e.type==='boss'?weaponDamage()*2:Math.max(weaponDamage()*1.5,e.maxHp*0.22),e.x>=h.x?1:-1,{kb:3,ky:9,stun:0.5});}finally{MP.hitFrom=hf;}}}}}
    else if(h.k==='muro'&&h.state===0){if(Math.random()<dt*0.8)burst(h.x+rand(-0.8,0.8),rand(0.6,2.6),0xb8ac98,2,1.2,1,0.5,-2.8);}   // polvere che cade dalle crepe: un indizio
    else if(h.k==='muro'&&h.state===3&&h.rune){h.rune.rotation.y+=dt*2;h.rune.position.y=1.5+Math.sin(G.time*3)*0.12;
      if(!P.dead&&G.state==='play'&&Math.abs(P.x-h.x)<1.2){h.state=4;h.g.remove(h.rune);burst(h.x,1.6,0xffd27a,30,6,3,0.3);sfx('legend');heal(Math.round(S.maxHp*0.3));popNum(P.x,P.y+2.8,'Benedizione!','xp');setTimeout(()=>{if(G.state==='play'&&!P.dead)openUpgrade();},350);}}}}

/* ---------- tutto nel giro di ogni fotogramma della torre ---------- */
const _ufNov=updFloor;updFloor=function(dt){_ufNov(dt);try{hzTick(dt);evoTick(dt);gradeTick();}catch(err){console.warn('novità',err);}};
// il mercante: spiegazione dei nuovi prezzi la prima volta che lo apri
const _omNov=openMerch;openMerch=function(){const r=_omNov();ntip('mercante','Prezzi del mercante','Pagare con la vita costa una parte della vita massima: più l\'oggetto è raro, più costa (fino a metà vita per un Leggendario).');return r;};

/* ---------- pannello delle novità nel seminterrato (una volta per aggiornamento) ---------- */
const NEWS_V='2026-11-14b';
const newsBox=document.createElement('div');newsBox.id='newsBox';newsBox.hidden=true;newsBox.innerHTML=`<div class="nb" role="dialog" aria-labelledby="newsT"><small>Aggiornamento</small><h2 id="newsT">Novità nella torre</h2><ul>
<li><b>Eventi nei piani</b>: corsa contro il tempo, ladro di tesori, pioggia di meteore, giganti, furia e campione del piano.</li>
<li><b>9 carte speciali</b>: fulmini, esplosioni, un famiglio, spine… e le <b>Evoluzioni</b> quando due carte compatibili arrivano al massimo.</li>
<li><b>Voto di stile</b> da D a S a fine piano: con A e S guadagni rubini.</li>
<li><b>Barili esplosivi, lampadari e spuntoni</b> da usare contro i nemici.</li>
<li><b>Muri crepati</b>: rompili per trovare stanze segrete.</li>
<li><b>Ultimo colpo al rallentatore</b> quando finisci un piano o un guardiano.</li>
<li>Bende durante i guardiani, santuari ogni 13 piani, più bottino per chi è all'inizio, Golem rifatto, prezzi del mercante e limite a Forza e Cuore di ferro.</li>
</ul><button class="big" id="newsOk">Andiamo!</button></div>`;document.body.appendChild(newsBox);
$('newsOk').onclick=()=>{sfx('ui');newsBox.hidden=true;store.set('news-v',NEWS_V);canvas.focus();};
setInterval(()=>{if(!newsBox.hidden||store.get('news-v','')===NEWS_V)return;
  if(G.scene==='cellar'&&G.state==='cellar'&&!G.ctut&&G.fade<0.05){if(!store.get('tut-done',false)){store.set('news-v',NEWS_V);return;}newsBox.hidden=false;setTimeout(()=>$('newsOk').focus(),50);}},700);
