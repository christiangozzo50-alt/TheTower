
/* =========================================================
   MODALITÀ SPETTATORE
   Chi sta facendo una scalata apre un piccolo "canale" (PeerJS) a cui
   gli amici si collegano per guardarlo: ricevono la posizione dell'eroe
   e i nemici, come un ospite in co-op, ma senza poter giocare.
   Nella sezione Amici, accanto a chi è in scalata, compare l'occhio.
   ========================================================= */
const SPEC_PREFIX='thetower-spec-v1-',SPEC_MAX=6;
const EYE_SVG='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/></svg>';
// chi trasmette (sta scalando)
const SPB={peer:null,conns:[],tk:0,lvSeed:0,inRun:false,fl:0,presT:0};
// chi guarda
const SPEC={on:false,key:'',name:'',peer:null,conn:null,R:null,seed:0,fl:0,built:false,emap:new Map(),tm:0,endT:0,prevFl:1};

/* ---------- stanze uguali per chi scala e per chi guarda ---------- */
// le stanze vengono costruite con un "seme": chi guarda usa lo stesso seme e vede le stesse piattaforme
function specSeeded(seed,f){const zi=zoneIndex(f);if(G.zoneBuilt!==zi)applyZone(zi);return withSeed(seed*131+f*7919,()=>_blSp(f));}
const _blSp=buildLevel;
buildLevel=function(f){
  if(SPEC.on)return specSeeded(SPEC.seed,f);
  if(MP.live()){SPB.lvSeed=MP.seed;return _blSp(f);}
  if(!G.specSeed)G.specSeed=(Math.random()*1e9)|0;
  SPB.lvSeed=G.specSeed;return specSeeded(SPB.lvSeed,f);};
const _srSp=startRun;
startRun=function(){G.specSeed=(Math.random()*1e9)|0;return _srSp.apply(this,arguments);};

/* ---------- presenza: gli amici vedono che sei in scalata e a che piano ---------- */
const specInRun=()=>G.scene==='tower'&&!G.pvp&&!G.tutorial&&!SPEC.on;
const specCan=p=>!!(p&&isOnline(p)&&p.run&&Date.now()-p.run<120000);
function specPresence(){if(!fbOn()||!store.get('nameok',false))return;const run=specInRun();
  fbPatch('players/'+encodeURIComponent(nameKey(MP.name())),{n:MP.name(),pid:PID,t:Date.now(),run:run?Date.now():0,fl:run?G.floor:0}).catch(()=>{});}

/* ---------- chi scala: canale per gli spettatori ---------- */
function specSend(m){for(const c of SPB.conns)if(c.open){try{c.send(m);}catch(e){}}}
function specInfo(){return {t:'si',seed:SPB.lvSeed,fl:G.floor,n:MP.name(),sc:specInRun()?'tower':'cellar',st:G.state,lv:specInRun()?Object.assign({},G.lv):{}};}
function specOpen(){if(SPB.peer||SPB.loading)return;SPB.loading=true;
  mpLib(()=>{SPB.loading=false;if(SPB.peer||!specInRun())return;
    const p=new Peer(SPEC_PREFIX+nameKey(MP.name()));SPB.peer=p;
    p.on('connection',c=>{
      c.on('open',()=>{SPB.conns=SPB.conns.filter(x=>x.open);if(SPB.conns.length>=SPEC_MAX){try{c.send({t:'full'});}catch(e){}setTimeout(()=>c.close(),300);return;}
        SPB.conns.push(c);try{c.send(specInfo());}catch(e){}specCountUi();});
      c.on('data',m=>{if(m&&m.t==='hi'){c.who=String(m.n||'Un amico').slice(0,14);toast(`${c.who} ti sta guardando`,'Ti segue nella scalata');specCountUi();}});
      c.on('close',()=>{SPB.conns=SPB.conns.filter(x=>x!==c);specCountUi();});c.on('error',()=>{});});
    p.on('error',e=>{if(e&&e.type==='unavailable-id'){try{p.destroy();}catch(x){}if(SPB.peer===p)SPB.peer=null;}});
    p.on('disconnected',()=>{try{p.reconnect();}catch(e){}});});}
function specCloseB(){const p=SPB.peer,cs=SPB.conns;SPB.peer=null;SPB.conns=[];
  for(const c of cs){try{c.open&&c.send(specInfo());}catch(e){}}
  setTimeout(()=>{for(const c of cs){try{c.close();}catch(e){}}try{p&&p.destroy();}catch(e){}},400);specCountUi();}
// quanti ti stanno guardando (in alto, durante la scalata)
let specCountEl=null;
function specCountUi(){const n=SPB.conns.filter(c=>c.open).length;
  if(!specCountEl){specCountEl=document.createElement('div');specCountEl.className='spec-count';specCountEl.setAttribute('aria-live','polite');document.body.appendChild(specCountEl);}
  const show=n>0&&G.scene==='tower'&&!$('hud').hidden;specCountEl.hidden=!show;
  if(show){const names=SPB.conns.filter(c=>c.open&&c.who).map(c=>c.who);specCountEl.innerHTML=EYE_SVG+`<span>${n}</span>`;specCountEl.title=names.length?'Ti guardano: '+names.join(', '):'Spettatori';}}
// ogni 2 s: apre o chiude il canale e aggiorna la presenza quando cambia qualcosa
setInterval(()=>{const run=specInRun()&&store.get('nameok',false)&&fbOn();
  if(run&&!SPB.peer)specOpen();else if(!run&&SPB.peer)specCloseB();
  const fl=run?G.floor:0,now=Date.now();
  if(run!==SPB.inRun||fl!==SPB.fl||(run&&now-SPB.presT>40000)){SPB.inRun=run;SPB.fl=fl;SPB.presT=now;specPresence();if(SPB.conns.length)specSend(specInfo());}
  specCountUi();},2000);
// invio a chi guarda: eroe 15 volte al secondo, nemici 7-8 volte al secondo
setInterval(()=>{if(!SPB.conns.length||document.hidden)return;SPB.tk++;
  try{if(G.scene==='tower'){const s=mpMyState();s.sa=Math.round(P.stam||0);s.sx=Math.round(S.stamMax||100);specSend(s);if(SPB.tk%2===0&&!G.pvp)specSend(mpSnap());specSend(specProjMsg());if(FXQ.length){specSend({t:'fx',f:G.floor,l:FXQ.splice(0)});}}
    {const k=specInRun()?JSON.stringify(G.lv||{}):'{}';if(k!==SPB.lvKey){SPB.lvKey=k;specSend({t:'lv',lv:JSON.parse(k)});}}
    if(SPB.tk%15===0)specSend(specInfo());}catch(e){}},66);

/* ---------- mosse speciali, colpi ed effetti: chi scala li registra, chi guarda li rifà ----------
   Si registrano solo gli effetti "di primo livello": quelli fatti dentro un altro effetto registrato
   (o dentro l'animazione degli effetti) li rifà da solo chi guarda, così non escono doppi. */
const FXQ=[],FXQ_MAX=140;let fxDepth=0,fxSfxN=0;
const fxRec=()=>fxDepth===0&&SPB.conns.length>0&&!SPEC.on&&G.scene==='tower'&&!G.pvp;
const f2=v=>typeof v==='number'?Math.round(v*100)/100:v;
function fxPush(e){if(FXQ.length<FXQ_MAX)FXQ.push(e);}
function fxWrap(code,orig,keep){return function(){if(fxRec()&&(!keep||keep.apply(null,arguments)))fxPush([code,...Array.from(arguments).map(f2)]);
  fxDepth++;try{return orig.apply(this,arguments);}finally{fxDepth--;}};}
const FXF={};   // le funzioni originali, per rifarle da chi guarda
FXF.b=burst;burst=fxWrap('b',burst);
FXF.l=lightning;lightning=fxWrap('l',lightning);
FXF.s=spray;spray=fxWrap('s',spray);
FXF.r=fxRing;fxRing=fxWrap('r',fxRing);
FXF.k=fxSpikes;fxSpikes=fxWrap('k',fxSpikes);
FXF.p=fxPillar;fxPillar=fxWrap('p',fxPillar);
FXF.h=fxSlash;fxSlash=fxWrap('h',fxSlash);
FXF.g=fxSigil;fxSigil=fxWrap('g',fxSigil);
FXF.y=fxRays;fxRays=fxWrap('y',fxRays);
// colpo che vola: la funzione finale (danni) resta a chi scala
FXF.o=fxShot;fxShot=function(a,b,col,dur,sz,end){if(fxRec())fxPush(['o',a.map(f2),b.map(f2),col,f2(dur),f2(sz)]);fxDepth++;try{return FXF.o.apply(this,arguments);}finally{fxDepth--;}};
// numeri dei danni
FXF.n=popNum;popNum=fxWrap('n',popNum);
// suoni (al massimo 10 ogni invio)
FXF.u=sfx;sfx=function(n){if(fxRec()&&fxSfxN<10&&n!=='ui'){fxSfxN++;fxPush(['u',n]);}return FXF.u.apply(this,arguments);};
FXF.a=absnd;absnd=function(n){if(fxRec())fxPush(['a',n]);return FXF.a.apply(this,arguments);};
// zone a terra (fiamme, veleno...): solo il disco luminoso, il resto arriva come scintille
const _azSp=addZone;addZone=function(o){if(fxRec()&&o)fxPush(['z',f2(o.x),f2(o.r),o.col,f2(o.t||1)]);return _azSp.apply(this,arguments);};
// la mossa speciale: nome a schermo, cerchi, colonna di luce, sigillo
const _afxSp=abilityFx;abilityFx=function(n,ab){if(fxRec())fxPush(['A',n,ab&&ab.name||'',G.cls.fx||CLS_COL[G.cls.id]||0x7ff0e4,f2(P.x),f2(P.y)]);fxDepth++;try{return _afxSp.apply(this,arguments);}finally{fxDepth--;}};
// gli effetti già in volo si animano da soli anche da chi guarda: quello che fanno lì dentro non si registra
const _uflSp=updFxl;updFxl=function(dt){fxDepth++;try{return _uflSp(dt);}finally{fxDepth--;}};
setInterval(()=>{fxSfxN=0;},66);

// proiettili (di tutti): numerati, si mandano con posizione e velocità
let projN=0;
const _spjSp=spawnProj;spawnProj=function(o){const r=_spjSp.apply(this,arguments);if(o&&o.sid==null)o.sid=++projN;return r;};
function specProjMsg(){const l=[];for(const p of G.projs){if(p.dead||p.sid==null)continue;
  l.push([p.sid,p.kind||'',f2(p.x),f2(p.y),f2(p.vx),f2(p.vy),p.owner==='p'?1:0,p.col||0,f2(p.sz||0),f2(p.scl||0),p.tint==null?-1:p.tint,f2(p.life||0)]);if(l.length>=60)break;}
  return {t:'pj',f:G.floor,l};}

/* ---------- chi guarda: rifà effetti e proiettili ---------- */
const SPX={pj:new Map(),zones:[]};
function specFxPlay(m){if(!SPEC.built||G.state!=='spec'||m.f!==G.floor)return;const R=SPEC.R;
  for(const e of m.l){const c=e[0],a=e.slice(1);
    try{switch(c){
      case 'A':specAbil(R,a[0],a[1],a[2],a[3],a[4]);break;
      case 'z':{const mm=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:a[2],transparent:true,opacity:0.35,depthWrite:false,blending:THREE.AdditiveBlending}));
        mm.scale.set(a[1],1,1.4);mm.position.set(a[0],0.05,0);scene.add(mm);SPX.zones.push({m:mm,t:a[3]});break;}
      case 'o':FXF.o(a[0],a[1],a[2],a[3],a[4]);break;
      default:if(FXF[c])FXF[c].apply(null,a);}}catch(err){}}}
// la mossa speciale rifatta sull'eroe dell'amico (con la sua classe e il suo colore)
function specAbil(R,n,name,col,x,y){const cls=(R&&R.cls)||G.cls;
  const bk={x:P.x,y:P.y},gC=G.cls,gH=hero,lt=later,au=fxAura;
  P.x=x;P.y=y;G.cls=Object.assign({},cls,{fx:col});if(R&&R.hero)hero=R.hero;later=()=>{};   // i colpi ritardati arrivano già da chi scala
  fxAura=(c,dur)=>{const h=R&&R.hero;const o=new THREE.Object3D();return fxAdd(o,dur,(o,k)=>{if(!h)return;for(const mt of h.mats)if(mt.emissive){mt.emissive.setHex(c);mt.emissiveIntensity=0.9*(1-k);}});};
  try{_afxSp(n,{name});}finally{P.x=bk.x;P.y=bk.y;G.cls=gC;hero=gH;later=lt;fxAura=au;}
  G.hitstop=0;}
function specProjSnap(m){if(!SPEC.built||G.state!=='spec'||m.f!==G.floor)return;const seen=new Set(),now=performance.now();
  for(const a of m.l){const id=a[0];seen.add(id);let p=SPX.pj.get(id);
    if(!p){const o={x:a[2],y:a[3],vx:a[4],vy:a[5],kind:a[1],owner:a[6]?'p':'e',col:a[7]||undefined,w:0.5,h:0.5,dmg:0,life:99,g:0,net:true};
      if(a[8])o.sz=a[8];if(a[9])o.scl=a[9];if(a[10]>=0)o.tint=a[10];
      try{_spawnProj(o);}catch(e){continue;}if(!o.mesh)continue;p=o;SPX.pj.set(id,p);}
    bufPush(p,{t:now,x:a[2],y:a[3],z:0,vx:a[4],vy:a[5]});p.vx=a[4];p.vy=a[5];p.life=a[11];}
  for(const [id,p] of SPX.pj)if(!seen.has(id))specProjGone(id,p);}
function specProjGone(id,p){SPX.pj.delete(id);p.dead=true;if(p.mesh)scene.remove(p.mesh);const i=G.projs.indexOf(p);if(i>=0)G.projs.splice(i,1);}
function specProjTick(dt){for(const p of SPX.pj.values()){const s=sampleAt(p.buf,renderT(p));if(s){p.x=s.x;p.y=s.y;}
  const m=p.mesh;if(!m)continue;m.position.set(p.x,p.kind==='shock'?p.y+0.5:p.y,0);
  if(p.kind==='wave')m.material.opacity=Math.min(0.85,(p.life||1)*3);
  else if(p.kind==='arrow'||p.kind==='spear'||p.kind==='knife'||p.kind==='sonic'||p.kind==='bolt')m.rotation.z=Math.atan2(p.vy,p.vx);
  else if(p.kind==='bone')m.rotation.z+=dt*14;}}
function specZoneTick(dt){for(let i=SPX.zones.length-1;i>=0;i--){const z=SPX.zones[i];z.t-=dt;z.m.material.opacity=0.35*Math.max(0,Math.min(1,z.t));z.m.rotation.y+=dt*2;
  if(z.t<=0){scene.remove(z.m);z.m.material.dispose();SPX.zones.splice(i,1);}}}
function specFxClear(){for(const [id,p] of SPX.pj)specProjGone(id,p);for(const z of SPX.zones){scene.remove(z.m);z.m.material.dispose();}SPX.zones.length=0;G.timers=[];try{fxClear();}catch(e){}}

/* ---------- chi guarda ---------- */
let specBar=null;
function specBarUi(){if(!specBar){specBar=document.createElement('div');specBar.id='specBar';specBar.hidden=true;specBar.setAttribute('role','status');
    specBar.innerHTML=`<span class="sb-eye">${EYE_SVG}</span><div class="sb-txt"><b id="sbName"></b><small id="sbInfo"></small><div class="sb-bars" id="sbBars" hidden><div class="sb-row"><span>Vita</span><div class="sb-hp"><i id="sbHp"></i></div><em id="sbHpT"></em></div><div class="sb-row"><span>Stamina</span><div class="sb-st"><i id="sbSt"></i></div><em id="sbStT"></em></div></div></div><button class="mini" id="specExit">Esci</button>`;
    document.body.appendChild(specBar);
    const pk=document.createElement('div');pk.id='specPerks';pk.hidden=true;pk.setAttribute('aria-label','Potenziamenti scelti');pk.innerHTML='<div class="sp-h">Potenziamenti</div><div class="sp-list" id="spList"></div>';document.body.appendChild(pk);
    $('specExit').onclick=()=>{sfx('ui');specExit();};}
  return specBar;}
function specSetInfo(t){specBarUi();$('sbInfo').textContent=t;}
function specStart(k,n){
  if(SPEC.on)return;
  if(MP.live()||MP.reco){toast('Sei in un gruppo','Esci dalla co-op per guardare un amico');return;}
  if(!fbOn()){toast('Non sei online','Serve la connessione per guardare un amico');return;}
  Object.assign(SPEC,{on:true,ready:false,key:k,name:n||k,peer:null,conn:null,R:null,seed:0,fl:0,built:false,emap:new Map(),endT:0,prevFl:G.floor||1});
  sfx('ui');closeFriends();clearInput();G.state='menu';['prompt','bUse','touch','cellarHud'].forEach(id=>$(id).hidden=true);
  specBarUi().hidden=false;$('sbName').textContent=SPEC.name;$('sbBars').hidden=true;SPEC.lv={};SPEC.lvKey='';specPerks();specSetInfo('Mi collego…');
  fadeThen(()=>{if(!SPEC.on)return;showScene('tower');if(hero)hero.root.visible=false;$('hud').hidden=true;showMeds(false);G.pvp=false;G.tutorial=false;G.state='spec';SPEC.ready=true;if(SPEC.built)G.fadeTarget=0;});
  SPEC.tm=setTimeout(()=>{if(SPEC.on&&!SPEC.built)specExit(`Non riesco a guardare ${SPEC.name}`,'Forse ha appena finito la scalata');},12000);
  mpLib(()=>{if(!SPEC.on)return;const p=new Peer();SPEC.peer=p;
    p.on('open',()=>{if(SPEC.peer!==p)return;const c=p.connect(SPEC_PREFIX+k,{reliable:true,serialization:'json'});SPEC.conn=c;
      c.on('open',()=>{try{c.send({t:'hi',n:MP.name()});}catch(e){}});
      c.on('data',m=>{if(SPEC.conn!==c)return;try{specMsg(m);}catch(e){console.warn('spettatore',e);}});
      c.on('close',()=>{if(SPEC.on&&SPEC.conn===c)specExit(`${SPEC.name} non è più raggiungibile`,'');});c.on('error',()=>{});});
    p.on('error',e=>{if(SPEC.peer!==p)return;if(e&&e.type==='peer-unavailable')specExit(`${SPEC.name} non è più in scalata`,'');});});}
function specMsg(m){
  if(m.t==='full'){specExit('Troppi spettatori',`${SPEC.name} ha già ${SPEC_MAX} persone che lo guardano`);return;}
  if(m.t==='si'){SPEC.seed=m.seed;if(m.n)SPEC.name=m.n;$('sbName').textContent=SPEC.name;
    if(m.sc!=='tower'){specExit(`${SPEC.name} ha finito la scalata`,SPEC.fl?`Si è fermato al piano ${SPEC.fl}`:'');return;}
    if(m.lv)specSetLv(m.lv);
    if(m.fl!==SPEC.fl){const f=m.fl;if(!SPEC.built||!SPEC.ready){clearTimeout(SPEC.tm);specFloor(f);if(SPEC.ready)G.fadeTarget=0;}else fadeThen(()=>{if(SPEC.on){specFloor(f);G.fadeTarget=0;}});SPEC.fl=f;}
    return;}
  if(m.t==='s'){if(!SPEC.R)SPEC.R={pid:1,name:SPEC.name,x:0,y:0,z:0,tx:0,ty:0,tz:0,walkT:0,lastStep:0,atk:null,hero:null,hkey:'',ready:false,dead:false,sc:'',fl:0,st:''};
    mpRecvInto(SPEC.R,m);SPEC.R.name=SPEC.name;SPEC.R.sa=m.sa;SPEC.R.sx=m.sx;if(SPEC.R.hero&&!(SPEC.built&&SPEC.ready))SPEC.R.hero.root.visible=false;return;}
  if(m.t==='e'){specApplySnap(m);return;}
  if(m.t==='lv'){specSetLv(m.lv);return;}
  if(m.t==='fx'){specFxPlay(m);return;}
  if(m.t==='pj'){specProjSnap(m);return;}}
function specFloor(f){
  G.floor=f;G.pvp=false;G.tutorial=false;specFxClear();clearActors();SPEC.emap=new Map();G.boss=null;G.bi=null;
  try{buildLevel(f);}catch(e){console.warn('spettatore piano',e);}
  try{towerMood(f);}catch(e){}
  if(safeG){scene.remove(safeG);safeG=null;}G.safe=isSafeFloor(f);if(G.safe){try{buildSafeRoom();}catch(e){}}
  G.queue=[];G.spawnT=1e9;G.cleared=G.safe;G.gateY=0;G.gateOpen=false;G.gateMsg=true;bars.position.y=0;lockM.emissive.setHex(0xff3b1f);lockM.emissiveIntensity=0.7;
  MUS.mood=G.safe?'cellar':'tower';SPEC.built=true;G.snapCam=true;if(SPEC.R)SPEC.R.seen=false;
  if(hero)hero.root.visible=false;$('bossVig').classList.remove('on');
  SPEC.flInfo=G.safe?`Santuario · piano ${f}`:`${isBossFloor(f)?'Guardiano':'Piano'} ${f} · ${ZONES[zoneIndex(f)].name}`;SPEC.upShown=false;specSetInfo(SPEC.flInfo);}
// vita e stamina dell'amico, con i numeri
function specBars(R){$('sbBars').hidden=false;const hp=R.dead?0:Math.max(0,R.hp||0),mh=R.mh||100,sa=Math.max(0,R.sa||0),sx=R.sx||100;
  const k=Math.round(hp)+'/'+mh+'|'+sa+'/'+sx;if(k===SPEC.barKey)return;SPEC.barKey=k;
  $('sbHp').style.transform=`scaleX(${Math.min(1,hp/mh)})`;$('sbHpT').textContent=`${Math.ceil(hp)} / ${mh}`;
  $('sbSt').style.transform=`scaleX(${Math.min(1,sa/sx)})`;$('sbStT').textContent=`${sa} / ${sx}`;}
// potenziamenti scelti, nell'ordine in cui li ha presi; le evoluzioni in oro
const specUp=id=>UPG.find(u=>u.id===id)||(typeof EVOS!=='undefined'?EVOS.find(u=>u.id===id):null);
function specSetLv(lv){lv=lv||{};const k=JSON.stringify(lv);if(k===SPEC.lvKey)return;const old=SPEC.lv||{},first=!SPEC.lvKey;SPEC.lvKey=k;SPEC.lv=lv;
  const nuovi=Object.keys(lv).filter(id=>(lv[id]||0)>(old[id]||0));
  if(!first)for(const id of nuovi){const u=specUp(id);if(u)toast(`${SPEC.name} ha scelto ${u.name}`,u.evo?'Evoluzione!':(lv[id]>1?`Livello ${lv[id]}`:'Nuovo potenziamento'));}
  specPerks(first?[]:nuovi);}
function specPerks(nuovi){specBarUi();const box=$('specPerks'),list=$('spList'),lv=SPEC.lv||{};
  const ids=Object.keys(lv).filter(id=>lv[id]>0&&specUp(id));box.hidden=!SPEC.on||!ids.length;
  list.innerHTML=ids.map(id=>{const u=specUp(id),n=lv[id];
    return `<span class="sp-chip${u.evo?' evo':''}${(nuovi||[]).includes(id)?' new':''}" title="${esc(typeof u.desc==='function'?u.desc():'')}">${svg(u.icon)}<b>${esc(u.name)}</b>${n>1||u.max>1&&u.max<99?`<i>${u.max<99?n+'/'+u.max:'×'+n}</i>`:''}</span>`;}).join('');}
// i nemici arrivano da chi scala: qui sono solo "marionette", e non danno niente a chi guarda
function specApplySnap(s){if(!SPEC.built||G.scene!=='tower'||s.f!==G.floor)return;
  G.queue=s.q.slice();G.spawnT=1e9;const seen=new Set();
  for(const a of s.l){const id=a[0];seen.add(id);let e=SPEC.emap.get(id);if(e&&e.dead)continue;
    if(!e){try{e=_spawnEnemy(a[1],{x:a[2],summon:true});}catch(err){e=null;}if(!e)continue;e.net=true;e.id=id;e.summon=!!a[21];e.x=a[2];e.y=a[3];SPEC.emap.set(id,e);
      if(a[20]){e.elite=true;e.sc=1.2;for(const m of e.parts.mats){m.userData.baseE=ELITE_GOLD;m.userData.baseI=0.25;}}}
    e.nx=a[2];e.ny=a[3];e.vx=a[4];e.vy=a[5];bufPush(e,{t:performance.now(),x:a[2],y:a[3],z:0,vx:a[4],vy:a[5]});e.face=a[6];e.state=a[7];e.t=a[8];e.warn=a[9];e.hp=a[10];e.maxHp=a[11];e.stunT=a[12];e.slowT=a[13];e.onGround=!!a[14];e.phased=!!a[15];
    e.castT=a[16];e.spawnT=a[17];e.hitstun=a[18];e.lastDir=a[19];e.n=a[22];e.phase=a[23];e.landT=a[24];e.hopT=a[25];if(a[26])e.flash=Math.max(e.flash,0.06);e.mode=a[27];e.ename=a[28]||'';e.emod=a[29]||'';}
  for(const e of G.enemies)if(e.net&&!e.dead&&!seen.has(e.id))specKill(e);
  if(s.cl&&!G.cleared&&!G.queue.length&&!G.enemies.some(e=>!e.dead)){G.cleared=true;lockM.emissive.setHex(0x7fe08a);}}
function specKill(e){e.dead=true;
  scene.remove(e.parts.root);disposeObj(e.parts.root);if(G.boss===e)G.boss=null;}
function specExit(t,s){if(!SPEC.on)return;SPEC.on=false;clearTimeout(SPEC.tm);
  const c=SPEC.conn,p=SPEC.peer;SPEC.conn=null;SPEC.peer=null;try{c&&c.close();}catch(e){}try{p&&p.destroy();}catch(e){}
  specFxClear();if(SPEC.R){mpRemoveHero(SPEC.R);SPEC.R=null;}if(specBar)specBar.hidden=true;if($('specPerks'))$('specPerks').hidden=true;if(t)toast(t,s||'');
  clearInput();G.state='menu';
  fadeThen(()=>{SPEC.built=false;if(safeG){scene.remove(safeG);safeG=null;}G.safe=false;G.boss=null;G.floor=SPEC.prevFl;if(hero)hero.root.visible=true;enterCellar();G.fadeTarget=0;});}
// ogni fotogramma: la telecamera segue l'amico, i nemici si muovono, l'eroe dell'amico si anima
const _uhvSp=updHeroVisual;
updHeroVisual=function(dt){if(!SPEC.on)return _uhvSp(dt);
  if(hero)hero.root.visible=false;const R=SPEC.R;if(!R||!SPEC.built||G.state!=='spec')return;
  for(const e of G.enemies)if(!e.dead&&e.net)mpPuppet(e,dt);
  specProjTick(dt);specZoneTick(dt);
  specDraw(R,dt);P.x=R.x;P.y=R.y;P.vx=0;P.vy=0;P.dead=false;P.atk=null;
  specBars(R);
  if(!R.dead&&!SPEC.endT){const up=R.st==='upgrade';if(up!==SPEC.upShown){SPEC.upShown=up;specSetInfo(up?'Sta scegliendo un potenziamento…':SPEC.flInfo||'');}}
  if(R.st==='over'||R.dead){if(!SPEC.endT){SPEC.endT=1;specSetInfo(`È caduto al piano ${G.floor}`);}}};
function specDraw(R,dt){
  const vis=!!R.hero&&R.sc==='tower'&&R.fl===G.floor&&!['intro','waking','cine','select'].includes(R.st)&&!(R.st==='climb'&&R.tz<-3.5);
  if(R.hero)R.hero.root.visible=vis;if(!vis){if(R.tag)R.tag.hidden=true;return;}
  {const s=sampleAt(R.buf,renderT(R));if(s){const px=R.x;R.x=s.x;R.y=s.y;R.z=s.z;const v=dt>0?(R.x-px)/dt:0;R.dvx=R.dvx==null?v:R.dvx+(v-R.dvx)*Math.min(1,dt*12);R.vx=Math.abs(R.dvx)<0.3?0:R.dvx;}}
  if(R.atk){R.atk.t+=dt;if(R.atk.t>=R.atk.wind+R.atk.act+R.atk.rec+0.05&&!R.atk.hold)R.atk=null;}
  for(const a of R.hero.arms)a.wr.scale.setScalar(R.ws||1);
  const bk={};for(const k of RKEYS){bk[k]=P[k];P[k]=R[k];}
  const gH=hero,gW=G.weapon,gC=G.cls,gS=G.state,gE=G.enterT,uT=updTrail,uB=updBear;
  hero=R.hero;G.weapon=R.wobj;G.cls=R.cls;G.state=(R.st==='climb'||R.st==='enter')?R.st:'play';G.enterT=R.et||0;updTrail=()=>{};updBear=()=>{};
  try{_updHeroVisual(dt);}catch(e){}finally{for(const k of RKEYS){R[k]=P[k];P[k]=bk[k];}hero=gH;G.weapon=gW;G.cls=gC;G.state=gS;G.enterT=gE;updTrail=uT;updBear=uB;}
  // nome sopra la testa
  if(!R.tag){R.tag=document.createElement('div');R.tag.className='mp-tag';document.body.appendChild(R.tag);R.tagW=0;}
  if(R.tag.textContent!==R.name){R.tag.textContent=R.name;R.tagW=0;}R.tag.hidden=false;R.tag.style.setProperty('--mc','#7ff0e4');R.tag.classList.toggle('down',!!R.dead);
  if(!R.tagW){R.tagW=R.tag.offsetWidth;R.tagH=R.tag.offsetHeight;}
  const [sx,sy]=toScreen(R.x,R.y+2.75,R.z||0);R.tag.style.transform=`translate3d(${Math.round(sx-R.tagW/2)}px,${Math.round(sy-R.tagH)}px,0)`;}
// chi guarda non ha la barra delle abilità né la vita sua: niente HUD della scalata
const _uhSp=updHud;updHud=function(){if(SPEC.on)return;return _uhSp.apply(this,arguments);};
// Esc o il tasto indietro del controller: esci
addEventListener('keydown',e=>{if(SPEC.on&&(e.key==='Escape'||e.key==='Backspace')){e.preventDefault();e.stopPropagation();specExit();}},true);
const _padBackSp=padBack;padBack=function(){if(SPEC.on){specExit();return true;}return _padBackSp();};

/* ---------- l'occhio nella lista amici, aggiornato mentre la lista è aperta ---------- */
function specEyeHtml(k,p){if(!specCan(p))return '';const n=esc(p.n||k);
  return `<button class="eye" data-spec="${esc(k)}" data-n="${n}" aria-label="Guarda la scalata di ${n}" title="Guarda la scalata">${EYE_SVG}</button><span class="fr-live">Piano ${p.fl||1}</span>`;}
setInterval(async()=>{if(G.state!=='friends'||frTab!=='amici'||!fbOn())return;
  for(const row of document.querySelectorAll('#frBody .fr-r')){const rm=row.querySelector('[data-rm]'),slot=row.querySelector('.fr-n');if(!rm||!slot)continue;const k=rm.dataset.rm;
    let p=null;try{p=await fbGet('players/'+encodeURIComponent(k));}catch(e){continue;}
    const dot=row.querySelector('.dot');if(dot)dot.classList.toggle('on',isOnline(p));
    const html=specEyeHtml(k,p),cur=slot.querySelector('.eye'),lv=slot.querySelector('.fr-live');
    if(!html){cur&&cur.remove();lv&&lv.remove();}
    else if(!cur){slot.insertAdjacentHTML('beforeend',html);}
    else if(lv)lv.textContent='Piano '+(p.fl||1);}},10000);
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{specStart,specExit,specMsg,SPEC:()=>SPEC,SPB:()=>SPB,G:()=>G,P:()=>P,run:()=>fadeThen(()=>{startRun();G.fadeTarget=0;}),key:()=>nameKey(MP.name())});
