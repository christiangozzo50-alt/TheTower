/* =========================================================
   AGGIUNTE: salvataggio al letto, scala con conferma, porta online
   (co-op / 1v1 / 2v2 con ricerca automatica), classifica co-op,
   spettatore, armature in stile classe e piccoli ritocchi
   ========================================================= */

/* ---------- salvataggio al letto (si perde se muori) ---------- */
function saveRun(){if(G.tutorial||G.pvp)return;
  store.set('runsave',{v:1,f:G.floor,cls:G.cls.id,weapon:G.weapon,gear:G.gear,lv:G.lv,kills:G.kills,runTime:G.runTime,runXp:G.runXp,upKills:G.upKills,upNeed:G.upNeed,t:Date.now()});}
const getSave=()=>{const s=store.get('runsave',null);return s&&s.v===1&&s.f>1?s:null;};
const clearSave=()=>store.set('runsave',null);
function resumeRun(sv){
  const i=CLASSES.findIndex(c=>c.id===sv.cls);if(i>=0&&G.cls.id!==sv.cls)setClass(i);
  RESUMING=true;_startRun();RESUMING=false;
  for(const k in G.gear)gearMod(G.gear[k],-1);G.gear=sv.gear||G.gear;G.weapon=sv.weapon||G.weapon;fixVamp(G.weapon);resetStats();
  G.lv=sv.lv||{};for(const u of UPG){if(u.id==='heal')continue;const n=Math.min(u.max,G.lv[u.id]||0);G.lv[u.id]=n;for(let k=0;k<n;k++)u.apply();}
  attachWeapon();refreshGearVisual();
  Object.assign(G,{kills:sv.kills||0,runTime:sv.runTime||0,runXp:sv.runXp||0,upKills:sv.upKills||0,upNeed:sv.upNeed||14});
  P.hp=S.maxHp;P.stam=S.stamMax;setupAbilUi();startFloor(sv.f);
  toast('Bentornato nel Santuario',`Riprendi dal piano ${sv.f}`);}
let RESUMING=false;
const _pdSave=playerDie;
playerDie=function(){if(!G.pvp&&!G.tutorial)clearSave();return _pdSave();};

/* ---------- conferma prima di salire la torre ---------- */
function openClimbAsk(){if(G.state!=='cellar')return;G.state='climbask';clearInput();['prompt','bUse','touch'].forEach(id=>$(id).hidden=true);
  const sv=getSave(),solo=!MP.live();
  $('caResume').hidden=!(sv&&solo);$('caNew').textContent=sv&&solo?'Nuova scalata':'Inizia la scalata';
  $('caText').innerHTML=MP.live()?(MP.host?`Partite tutti insieme (${MP.count()} giocatori).`:'La scalata parte quando chi ha creato la partita è pronto.')
    :sv?`Hai un salvataggio al <b>piano ${sv.f}</b> (${(CLASSES.find(c=>c.id===sv.cls)||{}).name||''}). Una nuova scalata lo cancella.`:`Sali come <b>${G.cls.name}</b>. Se muori ricominci dal piano 1.`;
  if(sv&&solo)$('caResume').textContent=`Riprendi dal piano ${sv.f}`;
  $('climbAsk').hidden=false;setTimeout(()=>{const b=sv&&solo?$('caResume'):$('caNew');if(b&&(PAD.on||!isTouch))b.focus();},60);}
function closeClimbAsk(){$('climbAsk').hidden=true;if(G.state==='climbask'){G.state='cellar';$('touch').hidden=!isTouch;canvas.focus();}}
$('caCancel').onclick=()=>{sfx('ui');closeClimbAsk();};
$('caNew').onclick=()=>{sfx('ui');$('climbAsk').hidden=true;if(!MP.live())clearSave();G.state='menu';fadeThen(()=>{startRun();G.fadeTarget=0;});};
$('caResume').onclick=()=>{const sv=getSave();if(!sv)return;sfx('ui');$('climbAsk').hidden=true;G.state='menu';fadeThen(()=>{resumeRun(sv);G.fadeTarget=0;});};
{const st=INTER.find(i=>i.id==='stairs');if(st){st.act=openClimbAsk;st.sub=()=>'Freccia su per salire';}}
let upWas=false;
const _updCellar=updCellar;
updCellar=function(dt){_updCellar(dt);
  const up=!!input.up,edge=up&&!upWas;upWas=up;
  if(nearInter&&nearInter.id==='stairs'&&G.state==='cellar'){if(!touchUI())$('promptKey').textContent='↑';if(isTouch)$('bUse').textContent='Sali la torre';if(edge)openClimbAsk();}};

/* ---------- porta online in fondo al seminterrato ---------- */
const ONLINE_X=12.45;
(function(){const C=cellarG,g=new THREE.Group();g.position.set(13.05,0,-0.4);g.rotation.y=-Math.PI/2;C.add(g);
  // portellone rotondo di ottone della fucina, con la ruota della valvola che gira
  const ironD=toon(0x2a2a32),brass=toon(0xc8963a),glow=new THREE.MeshBasicMaterial({color:0x7ff0e4});
  mesh(rbox(2.0,3.2,0.3,0.04),ironD,0,1.6,0,g);mesh(new THREE.CylinderGeometry(0.95,0.95,0.2,32),brass,0,1.6,0.1,g).rotation.x=Math.PI/2;
  mesh(new THREE.CylinderGeometry(0.8,0.8,0.24,32),toon(0x6a5a3a),0,1.6,0.12,g).rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){const a=i/12*TAU;mesh(sph(0.05,6,4),toon(0x5a4020),Math.cos(a)*0.88,1.6+Math.sin(a)*0.88,0.22,g,true);}
  const wh=new THREE.Group();wh.position.set(0,1.6,0.3);g.add(wh);mesh(new THREE.TorusGeometry(0.4,0.05,8,28),glow,0,0,0,wh,true);
  for(let i=0;i<4;i++)mesh(rbox(0.8,0.06,0.06,0.02),glow,0,0,0,wh,true).rotation.z=i*Math.PI/4;
  cellarAnims.push(dt=>{wh.rotation.z+=dt*0.9;});
  const [cv2,cx]=cv(256,64);cx.fillStyle='#2a2010';cx.fillRect(0,0,256,64);cx.font='bold 34px monospace';cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle='#7ff0e4';cx.fillText('ONLINE',128,34);
  const tex=new THREE.CanvasTexture(cv2);tex.magFilter=THREE.NearestFilter;mesh(new THREE.PlaneGeometry(1.4,0.35),new THREE.MeshBasicMaterial({map:tex}),0,3.45,0.16,g,true);
  const ol=new THREE.PointLight(0x7ff0e4,0.6,4,1.6);ol.position.set(12.4,1.8,-0.4);C.add(ol);cellarLights.push({light:ol,base:0.6,seed:2,steady:true});
  const r=mesh(new THREE.TorusGeometry(1.0,0.035,8,48),new THREE.MeshBasicMaterial({color:0x7ff0e4,transparent:true,opacity:0,depthWrite:false}),ONLINE_X,0.03,-0.2,C,true);r.rotation.x=Math.PI/2;r.scale.set(1,0.55,1);
  INTER.push({id:'online',x:ONLINE_X,y:3.6,name:'Porta online',sub:()=>'Co-op, 1 contro 1, 2 contro 2',ring:r,act:openOnline});})();
function openOnline(){if(G.state!=='cellar')return;G.state='online';clearInput();['prompt','bUse','touch'].forEach(id=>$(id).hidden=true);$('online').hidden=false;onUi();}
function closeOnline(){$('online').hidden=true;if(G.state==='online'){G.state='cellar';$('touch').hidden=!isTouch;canvas.focus();}}
function onUi(){const s=MM.on;$('onSearch').hidden=!s;$('onModes').hidden=s;if(!s)$('onStatus').textContent=MP.live()?'Sei già in una partita co-op: escine per cercare avversari.':'';}
$('onCoop').onclick=()=>{sfx('ui');closeOnline();openCoop();};
$('on1v1').onclick=()=>{sfx('ui');mmStart('1v1');};
$('on2v2').onclick=()=>{sfx('ui');mmStart('2v2');};
$('onCancel').onclick=()=>{sfx('ui');mmCancel();};
$('onClose').onclick=()=>{sfx('ui');if(!MM.on)closeOnline();else{mmCancel();closeOnline();}};
addEventListener('keydown',e=>{if(e.key==='Escape'){if(G.state==='online'){e.preventDefault();$('onClose').click();}else if(G.state==='climbask'){e.preventDefault();closeClimbAsk();}}},true);
// il controller chiude anche queste finestre
const _padBack=padBack;padBack=function(){for(const id of ['onClose','caCancel','coopClose','pvpBack']){const b=$(id);if(b&&b.offsetParent!==null&&!b.closest('[hidden]')){b.click();return true;}}return _padBack();};

/* ---------- ricerca automatica degli avversari ---------- */
const MM={on:false,mode:'',region:'',slot:0,t0:0,hosting:false,started:false,tm:null};
const MM_NEED={'1v1':2,'2v2':4};
function mmRegion(){let tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';}catch(e){}const lang=(navigator.language||'it').slice(0,2).toLowerCase();return lang+'-'+(tz.split('/')[0]||'x').toLowerCase();}
const mmId=()=>`thetower-mm-v1-${MM.mode}-${MM.region}-${MM.slot}`;
function mmSay(t){$('onStatus').textContent=t;}
function mmStart(mode){if(MP.live()){mmSay('Esci prima dalla partita co-op.');return;}mpLeave(true);
  Object.assign(MM,{on:true,mode,region:mmRegion(),slot:0,t0:Date.now(),hosting:false,started:false});onUi();
  $('onMode').textContent=mode==='1v1'?'1 contro 1 · 3 vite':'2 contro 2 · 3 vite a testa';mmSay('Cerco giocatori vicino a te…');mpLib(mmTry);}
function mmCancel(){MM.on=false;clearTimeout(MM.tm);mpLeave(true);onUi();mmSay('Ricerca annullata.');}
function mmTry(){if(!MM.on||MP.on)return;
  if(MM.slot>5){MM.slot=0;if(MM.region!=='all'&&Date.now()-MM.t0>15000){MM.region='all';mmSay('Allargo la ricerca a tutti i paesi…');}}
  let p;try{p=new Peer();}catch(e){mmSay('Rete non disponibile.');return;}MM.peer=p;let done=false;
  const fail=next=>{if(done)return;done=true;try{p.destroy();}catch(_){}if(!MM.on)return;if(next)setTimeout(next,150);};
  p.on('open',()=>{if(!MM.on){fail();return;}const c=p.connect(mmId(),{reliable:true,serialization:'json'});
    const to=setTimeout(()=>fail(mmClaim),4000);
    c.on('open',()=>{});
    c.on('data',m=>{
      if(m.t==='full'){clearTimeout(to);MM.slot++;fail(mmTry);return;}
      if(m.t==='welcome'&&!done){clearTimeout(to);done=true;MP.host=false;MP.peer=p;MP.conn=c;MP.on=true;MP.code=mmId();
        c.on('close',()=>{if(MP.conn===c)mpDrop();});try{c.send({t:'hi',n:MP.name()});}catch(_){}
        mmSay('Partita trovata! Aspetto gli altri giocatori…');}
      if(MP.conn===c){try{mpMsg(m,0);}catch(e){console.warn(e);}}});});
  p.on('error',e=>{if(e&&e.type==='peer-unavailable')fail(mmClaim);else if(!done&&e&&e.type!=='peer-unavailable')fail(()=>{MM.slot++;mmTry();});});}
function mmClaim(){if(!MM.on||MP.on)return;let p;try{p=new Peer(mmId());}catch(e){return;}
  p.on('open',()=>{if(!MM.on){try{p.destroy();}catch(_){}return;}MP.host=true;MP.peer=p;MP.on=true;MP.myPid=0;MP.code=mmId();MP.seed=(Math.random()*1e9)|0;MM.hosting=true;
    mmSay(`In attesa di avversari (${MM.region==='all'?'tutti i paesi':'vicino a te'})…`);
    p.on('connection',c=>{const open=MP.conns.filter(x=>x.c.open).length;if(MM.started||open>=MM_NEED[MM.mode]-1){c.on('open',()=>{try{c.send({t:'full'});}catch(_){}setTimeout(()=>c.close(),300);});return;}mpHostWire(c);});
    clearTimeout(MM.tm);MM.tm=setTimeout(function chk(){if(!MM.on||MM.started)return;
      if(MP.count()===1&&MM.region!=='all'){mpLeave(true);MM.region='all';MM.slot=0;mmSay('Allargo la ricerca a tutti i paesi…');mmTry();}else MM.tm=setTimeout(chk,15000);},20000);});
  p.on('error',e=>{if(e&&e.type==='unavailable-id'){try{p.destroy();}catch(_){}setTimeout(mmTry,200+Math.random()*400);}});}

/* ---------- PvP: arena, vite, colpi tra giocatori ---------- */
const PV={on:false,mode:'',teams:{},lives:{},names:{},by:{},dmg:0,kos:{}};
function pvpTeamOf(pid){return PV.teams[pid];}
function pvpSpawnX(){const t=pvpTeamOf(MP.myPid)||0,L=-HALF+3,R=GATE_X-3,mates=Object.keys(PV.teams).filter(k=>PV.teams[k]===t).map(Number).sort();
  const off=mates.indexOf(MP.myPid)*1.4;return t===0?L+off:R-off;}
function pvpBegin(m){
  MM.on=false;clearTimeout(MM.tm);Object.assign(PV,{on:true,mode:m.mode,teams:m.teams,lives:{},names:m.names||{},by:{},dmg:0,kos:{}});
  for(const k in m.teams)PV.lives[k]=3;MP.seed=m.seed;
  ['online','coop','climbAsk','over','pause','settings','classes'].forEach(id=>{const el=$(id);if(el)el.hidden=true;});
  clearInput();G.state='menu';fadeThen(()=>{G.pvp=true;RESUMING=true;_startRun();RESUMING=false;pvpArena();G.fadeTarget=0;});}
function pvpArena(){
  G.queue=[];G.spawnT=1e9;for(const e of G.enemies){if(!e.dead){scene.remove(e.parts.root);e.dead=true;}}G.enemies=[];
  for(const c of G.chests||[]){if(c.g&&c.g.parent)c.g.parent.remove(c.g);}G.chests=[];
  P.x=pvpSpawnX();P.face=P.x<0?1:-1;
  $('floorNum').textContent='⚔';const z=$('zoneName');if(z)z.textContent=PV.mode==='1v1'?'Arena · 1 contro 1':'Arena · 2 contro 2';
  for(const k in PV.teams){const pid=+k;if(pid===MP.myPid||PV.teams[k]===pvpTeamOf(MP.myPid))continue;
    const e=_spawnEnemy('slime',{x:pid*2,summon:true});e.pvp=pid;e.hp=e.maxHp=1e9;e.w=0.8;e.h=2.05;e.id=-1-pid;e.parts.root.visible=false;}
  $('pvpHud').hidden=false;pvpHud();toast(PV.mode==='1v1'?'1 contro 1':'2 contro 2','3 vite a testa: vince la squadra che resta in piedi');}
function pvpHud(){if(!PV.on)return;const me=MP.myPid,rows=Object.keys(PV.teams).map(Number).sort((a,b)=>PV.teams[a]-PV.teams[b]||a-b);
  $('pvpHud').innerHTML=rows.map(pid=>{const n=pid===me?'Tu':(PV.names[pid]||pName(pid)),l=PV.lives[pid]||0,t=PV.teams[pid];
    return `<span class="pv t${t}${pid===me?' me':''}"><b>${n}</b> ${'♥'.repeat(l)}<i>${'♥'.repeat(Math.max(0,3-l))}</i></span>`;}).join('');}
const _ueP=updEnemy;
updEnemy=function(e,dt){if(e.pvp!=null){const R=MP.players.get(e.pvp);if(R){e.x=R.x;e.y=R.y;e.face=R.face;e.vx=R.vx;e.vy=R.vy;}
  e.hp=e.maxHp;e.spawnT=0;return;}return _ueP(e,dt);};
const _syncP=syncEnemy;
syncEnemy=function(e,dt){_syncP(e,dt);if(e.pvp!=null)e.parts.root.visible=false;};
const _hitP=hitEnemy;
hitEnemy=function(e,base,dir,o){
  if(e.pvp!=null){o=o||{};if(e.dead||e.spawnT>0)return false;const R=MP.players.get(e.pvp);if(!R||R.dead||(PV.lives[e.pvp]||0)<=0||R.invul>0||R.dashT>0)return false;
    const crit=!!o.crit||Math.random()<S.crit+(o.critBonus||0),d=Math.max(1,Math.round(base*(crit?2:1)*0.45));
    popNum(e.x,e.y+e.h+0.3,String(d),crit?'crit':'');burst(e.x-dir*0.1,e.y+1.1,crit?0xffb347:0xff5d67,crit?8:5,6,2);
    if(o.melee){G.hitstop=Math.max(G.hitstop,0.04);sfx((WSND[G.weapon.type]||{}).hit||'hit');}else sfx('hit');if(crit)shake(0.15);
    PV.dmg+=d;MP.send({t:'pvphit',to:e.pvp,from:MP.myPid,d,dir,fx:P.x});return true;}
  // statistiche per la classifica co-op
  const h0=e.hp;if(MP.host&&!e.pvp)e.lastBy=MP.hitFrom!=null?MP.hitFrom:MP.myPid;
  const r=_hitP(e,base,dir,o);if(MP.hitFrom==null){const dd=Math.max(0,h0-Math.max(0,e.hp));RK.dmg+=dd;if(MP.host)RK.dmgBy[MP.myPid]=(RK.dmgBy[MP.myPid]||0)+dd;}return r;};
function pvpDie(){_playerDie();G.overT=1e9;const me=MP.myPid;PV.lives[me]=Math.max(0,(PV.lives[me]||1)-1);
  MP.send({t:'pvpdie',pid:me,lives:PV.lives[me],by:PV.lastBy});pvpHud();
  if(PV.lives[me]>0){toast('Sei stato abbattuto',`Vite rimaste: ${PV.lives[me]} · rientri tra poco`);
    setTimeout(()=>{if(!PV.on||!G.pvp)return;mpRevive();P.hp=S.maxHp;P.stam=S.stamMax;P.x=pvpSpawnX();P.y=0;P.vx=P.vy=0;P.invul=2;burst(P.x,1,0x7ff0e4,30,5,3);sfx('lvl');},2600);}
  else toast('Eliminato','Guarda come va a finire');
  if(MP.host)pvpCheck();}
const _pdP=playerDie;
playerDie=function(){if(G.pvp)return pvpDie();return _pdP();};
function pvpCheck(){if(!MP.host||!PV.on)return;const alive=new Set();for(const k in PV.teams)if((PV.lives[k]||0)>0)alive.add(PV.teams[k]);
  if(alive.size<=1){const win=alive.size?[...alive][0]:-1;MP.bcast({t:'pvpend',win,lives:PV.lives});pvpEnd(win);}}
function pvpEnd(win){if(!PV.on)return;PV.on=false;const mine=pvpTeamOf(MP.myPid);
  $('pvpTitle').textContent=win===mine?'Vittoria!':'Sconfitta';$('pvpTitle').className=win===mine?'win':'lose';
  const rows=Object.keys(PV.teams).map(Number).sort((a,b)=>PV.teams[a]-PV.teams[b]);
  $('pvpList').innerHTML=rows.map(pid=>`<div class="pv t${PV.teams[pid]}${PV.teams[pid]===win?' won':''}"><b>${pid===MP.myPid?'Tu':(PV.names[pid]||pName(pid))}</b><span>${PV.teams[pid]===win?'vincitore':'sconfitto'}</span><span>${'♥'.repeat(PV.lives[pid]||0)||'—'}</span></div>`).join('');
  setTimeout(()=>{G.state='pvpend';clearInput();$('touch').hidden=true;showMeds(false);$('pvpHud').hidden=true;$('pvpEnd').hidden=false;sfx(win===mine?'lvl':'boom');},900);}
$('pvpBack').onclick=()=>{sfx('ui');$('pvpEnd').hidden=true;pvpQuit();};
function pvpQuit(){PV.on=false;G.pvp=false;$('pvpHud').hidden=true;mpLeave(true);$('deathFx').classList.remove('on');G.deathSlow=0;G.state='menu';fadeThen(()=>{enterCellar();G.fadeTarget=0;});}
const _mpMsgX=mpMsg;
mpMsg=function(m,from){
  switch(m.t){
  case 'hi':_mpMsgX(m,from);
    if(MP.host&&MM.on&&MM.hosting&&!MM.started&&MP.count()>=MM_NEED[MM.mode]){MM.started=true;clearTimeout(MM.tm);
      const pids=[0,...MP.conns.filter(x=>x.c.open).map(x=>x.pid)].sort((a,b)=>a-b),teams={},names={0:MP.name()};
      pids.forEach((pid,i)=>{teams[pid]=MM.mode==='1v1'?i:(i<2?0:1);if(pid)names[pid]=pName(pid);});
      const msg={t:'pvpgo',mode:MM.mode,seed:(Math.random()*1e9)|0,teams,names};setTimeout(()=>{MP.bcast(msg);pvpBegin(msg);},600);}
    else if(MP.host&&MM.on&&MM.hosting)mmSay(`Giocatori: ${MP.count()} di ${MM_NEED[MM.mode]}…`);
    return;
  case 'pvpgo':if(!MP.host)pvpBegin(m);return;
  case 'pvphit':if(MP.host&&m.to!==0){MP.sendTo(m.to,m);return;}if(m.to!==MP.myPid)return;
    if(PV.teams[m.from]!=null&&PV.teams[m.from]===PV.teams[MP.myPid])return;   // niente fuoco amico
    if(G.pvp&&!P.dead&&G.state==='play'){PV.lastBy=m.from;_hurtPlayer(m.d,m.fx,null);}return;
  case 'pvpdie':{const pid=MP.host?from:m.pid;PV.lives[pid]=m.lives;(PV.down=PV.down||{})[pid]=true;if(MP.host){m.pid=pid;MP.bcast(m,pid);}pvpHud();
    if(m.by===MP.myPid)toast('Colpo decisivo!',`Hai abbattuto ${PV.names[pid]||pName(pid)}`);
    const R=MP.players.get(pid);if(R)R.respawn=m.lives>0;if(MP.host)pvpCheck();return;}
  case 'pvpend':if(!MP.host){PV.lives=m.lives||PV.lives;pvpEnd(m.win);}return;
  case 'stats':{const pid=MP.host?from:m.pid;if(MP.host){m.pid=pid;MP.bcast(m,pid);MP.bcast({t:'kills',k:RK.killsBy,d:RK.dmgBy});}RANK[pid]=m;rankRender();return;}
  case 'kills':if(!MP.host){RK.killsBy=m.k||{};RK.dmgBy=m.d||{};rankRender();}return;
  }
  return _mpMsgX(m,from);
};
const _drop2=mpDrop;
mpDrop=function(){if(G.state==='pvpend'){MP.on=false;MP.conn=null;for(const R of MP.players.values())mpRemoveHero(R);MP.players.clear();return;}
  if(G.pvp||PV.on){PV.on=false;G.pvp=false;$('pvpHud').hidden=true;$('pvpEnd').hidden=true;}if(MM.on&&!MM.started){MM.on=false;}return _drop2();};
const _gone2=mpPlayerGone;
mpPlayerGone=function(pid){_gone2(pid);if(PV.on&&MP.host){PV.lives[pid]=0;MP.bcast({t:'pvpdie',pid,lives:0});pvpHud();pvpCheck();}};
const _ecP=enterCellar;
enterCellar=function(){G.pvp=false;PV.on=false;$('pvpHud').hidden=true;$('specHud').hidden=true;$('mpRank').hidden=true;return _ecP();};

/* ---------- classifica a fine partita co-op ---------- */
const RK={dmg:0,taken:0,cmb:0,lastHp:0,killsBy:{},dmgBy:{}};let RANK={};
const _srR=startRun;
startRun=function(){if(!RESUMING){Object.assign(RK,{dmg:0,taken:0,cmb:0,lastHp:0,killsBy:{},dmgBy:{}});RANK={};$('mpRank').hidden=true;}return _srR();};
const _keR=killEnemy;
killEnemy=function(e){if(MP.host&&MP.live()&&!e.dead&&!e.net&&e.pvp==null){const p=e.lastBy!=null?e.lastBy:0;RK.killsBy[p]=(RK.killsBy[p]||0)+1;}return _keR(e);};
const _goR=gameOver;
gameOver=function(){
  if(G.items&&G.items.length)collectAllItems();   // l'equipaggiamento trovato va comunque nell'armadio
  _goR();
  if(MP.live()&&!G.pvp){const me={t:'stats',pid:MP.myPid,n:MP.name(),cls:G.cls.name,dmg:Math.round(RK.dmg),taken:Math.round(RK.taken),cmb:RK.cmb,fl:G.floor};
    RANK[MP.myPid]=me;MP.send(me);if(MP.host)MP.bcast({t:'kills',k:RK.killsBy,d:RK.dmgBy});rankRender();
    if(MP.host)setTimeout(()=>MP.bcast({t:'kills',k:RK.killsBy,d:RK.dmgBy}),1500);}};
function rankRender(){const box=$('mpRank');const rows=Object.values(RANK);if(!rows.length){box.hidden=true;return;}
  const K=pid=>RK.killsBy[pid]||0,D=r=>RK.dmgBy[r.pid]!=null?Math.round(RK.dmgBy[r.pid]):r.dmg,score=r=>K(r.pid)*60+D(r)/4+r.cmb*5-r.taken/6;rows.sort((a,b)=>score(b)-score(a));
  box.innerHTML=`<div class="rk-h">Classifica della squadra</div><div class="rk-t"><span></span><span>Giocatore</span><span>Uccisioni</span><span>Danni</span><span>Subiti</span><span>Combo</span></div>`+
    rows.map((r,i)=>`<div class="rk-r${r.pid===MP.myPid?' me':''}"><span>${i===0?'👑':i+1}</span><span><b>${r.pid===MP.myPid?'Tu':r.n}</b><small>${r.cls}</small></span><span>${K(r.pid)}</span><span>${D(r)}</span><span>${r.taken}</span><span>${r.cmb}</span></div>`).join('');
  box.hidden=false;}

/* ---------- spettatore: vita di chi stai guardando ---------- */
setInterval(()=>{
  if(G.state==='play'&&G.scene==='tower'&&!P.dead){if(P.hp<RK.lastHp)RK.taken+=RK.lastHp-P.hp;RK.lastHp=P.hp;RK.cmb=Math.max(RK.cmb,G.cmb||0);}else RK.lastHp=P.dead?0:P.hp;
  const sh=$('specHud');let R=null;
  if(MP.live()&&P.dead&&G.scene==='tower'&&!(G.deathSlow>0)&&G.state==='play')for(const r of MP.players.values())if(r.sc==='tower'&&r.fl===G.floor&&!r.dead){R=r;break;}
  if(!R){sh.hidden=true;return;}
  sh.hidden=false;$('specName').textContent=R.name||pName(R.pid);$('specHp').textContent=`${Math.max(0,R.hp)} / ${R.mh}`;$('specFill').style.transform=`scaleX(${Math.max(0,R.hp/(R.mh||100))})`;
},50);

/* ---------- assassino: il teletrasporto ignora i mostri in volo ---------- */
const _ssA=shadowStep;
shadowStep=function(target,noCrit){if(target&&target.fly)return;
  const fl=G.enemies.filter(e=>!e.dead&&e.fly&&e.spawnT<=0);for(const e of fl)e.spawnT=0.001;
  try{return _ssA(target,noCrit);}finally{for(const e of fl)e.spawnT=0;}};

/* ---------- i colpi magici rompono i barili quando non ci sono nemici ---------- */
function breakBarrel(b,dir){if(b.dead)return;const bx=b.g.position.x;b.hp--;b.g.rotation.z=dir*-0.15;burst(bx,0.8,0xc9a06a,10,4,1,0.4,b.g.position.z);sfx('hit');
  if(b.hp>0)return;b.dead=true;levelGroup.remove(b.g);sfx('slam');shake(0.15);burst(bx,0.7,0x8a6a3a,26,7,3,0.6,b.g.position.z);
  for(let i=0;i<7;i++){const m=new THREE.Mesh(chunkGeo,chunkMat(i%3?0x7a5a3a:0x55443a));m.scale.set(0.5,rand(0.6,1.3),0.25);m.position.set(bx+rand(-.3,.3),0.6,b.g.position.z);scene.add(m);
    G.chunks.push({m,vx:rand(-5,5)+dir*3,vy:rand(4,9),vz:rand(-1.5,2),rx:rand(-10,10),rz:rand(-10,10),t:0});}
  barrelLoot(bx);}
const _upP=updProjs;
updProjs=function(dt){
  const bs=(G.barrels||[]).filter(b=>!b.dead);
  if(bs.length&&!G.pvp){const noFoes=!foes().length;
    for(const p of G.projs){if(p.dead||p.owner!=='p')continue;
      if(noFoes&&p.homing){let b=null,bd=14;for(const q of bs){const d=Math.hypot(q.g.position.x-p.x,0.7-p.y);if(d<bd){bd=d;b=q;}}
        if(b){const a=Math.atan2(0.7-p.y,b.g.position.x-p.x),cur=Math.atan2(p.vy,p.vx),s=Math.hypot(p.vx,p.vy),k=Math.max(p.homing,3),na=cur+clamp(wrapA(a-cur),-k*dt,k*dt);p.vx=Math.cos(na)*s;p.vy=Math.sin(na)*s;}}
      for(const b of bs){if(b.dead)continue;if(Math.abs(b.g.position.x-p.x)<0.6+p.w/2&&p.y<1.5&&p.y>-0.2){if(!p.bHit)p.bHit=new Set();if(p.bHit.has(b))continue;p.bHit.add(b);breakBarrel(b,p.vx>0?1:-1);
        if(!p.pierce&&p.kind!=='shock'&&p.kind!=='wave'){p.dead=true;burst(p.x,p.y,p.col||0xb48cff,10,4,1);if(p.boom)boomAt(p.x,Math.max(0.4,p.y),p.boom,p.dmg,p.effect,p.col||0xff7a2e);}break;}}}}
  return _upP(dt);};

/* ---------- armature intonate al personaggio ---------- */
const GEAR_STYLE={mago:'cloth',criomante:'cloth',tempesta:'cloth',druido:'cloth',astromante:'cloth',negromante:'cloth',assassino:'light',arciere:'light',monaco:'light'};
const mixHex=(a,b,t)=>{const ch=(c,s)=>(c>>s)&255,m=s=>Math.round(ch(a,s)+(ch(b,s)-ch(a,s))*t);return (m(16)<<16)|(m(8)<<8)|m(0);};
refreshGearVisual=function(){
  if(!hero)return;for(const o of hero.gearObjs||[]){if(o.parent)o.parent.remove(o);disposeObj(o);}hero.gearObjs=[];
  const c=G.cls,cc=c.colors||{},st=GEAR_STYLE[c.id]||'heavy';
  for(const k in G.gear){const g=G.gear[k];if(!g)continue;const rc=RARITY[g.rarity].hex,add=o=>{hero.gearObjs.push(o);return o;};
    const acc=toon(rc,{emissive:rc,emissiveIntensity:0.22+g.rarity*0.08});
    const base=st==='heavy'?toon(mixHex(0x9aa0aa,cc.trim||0x888888,0.4),{emissive:rc,emissiveIntensity:0.03})
      :st==='light'?toon(mixHex(0x5a3e2a,cc.main||0x555555,0.45))
      :toon(mixHex(cc.cape||cc.main||0x444466,0x000000,0.15));
    if(k==='elmo'){const grp=add(new THREE.Group());hero.head.add(grp);
      if(st==='cloth'){M(grp,G3.hring(0.245,0.016,1.04),acc,[0,0.1,-0.005]);M(grp,G3.ell(0.032,0.038,0.022),new THREE.MeshBasicMaterial({color:rc}),[0,0.11,0.255],{ol:0});}
      else if(st==='light'){M(grp,G3.hring(0.245,0.038,1.05),base,[0,0.06,-0.005]);if(g.rarity>=2)M(grp,G3.ell(0.03,0.03,0.02),acc,[0,0.07,0.256],{ol:0});}
      else{M(grp,G3.hring(0.25,0.034,1.05),base,[0,0.07,-0.005]);M(grp,G3.hring(0.252,0.012,1.06),acc,[0,0.104,-0.005],{ol:0});
        if(g.rarity>=2&&c.id!=='paladino'&&c.id!=='samurai')for(const s of [-1,1])M(grp,G3.tube([[s*0.22,0.08,-0.02],[s*0.29,0.14,-0.05],[s*0.32,0.25,-0.08]],0.03,0.004,16,10),base,null);
        if(g.rarity>=3)M(grp,G3.ell(0.035,0.04,0.025),acc,[0,0.08,0.255],{ol:0});}}
    else if(k==='guanti'){const r1=st==='cloth'?0.066:0.072,r2=st==='cloth'?0.056:0.06,len=st==='cloth'?0.12:0.17;
      for(const a of hero.arms){add(M(a.el,G3.limb(r1,r2,len,0),base,[0,-0.19,0]));add(M(a.el,G3.hring(0.07,0.013,1),acc,[0,-0.1,0],{ol:0}));}}
    else{add(M(hero.torso,torsoGeo(hero.B||1,st==='cloth'?0.028:st==='light'?0.036:0.045,0.2,0.66),base));
      if(st==='heavy'&&g.rarity>=2)for(const a of hero.arms)add(M(a.sh,G3.dome(0.12,0.5,0.7,1.15),base,[a===hero.arms[0]?-0.012:0.012,0.035,0],{r:[0,0,(a===hero.arms[0]?1:-1)*0.35]}));
      if(st!=='cloth'&&g.rarity>=3)for(const a of hero.arms)add(M(a.sh,G3.hring(0.1,0.012,1),acc,[0,-0.02,0],{ol:0}));}
  }
};
if(hero)refreshGearVisual();

/* ---------- potenziamenti col controller: croce/levetta per scegliere, A per prendere ---------- */
let upSel=0,upOpenT=0,upPrev={};
const _openUp=openUpgrade;
openUpgrade=function(){_openUp();upSel=0;upOpenT=performance.now();upPrev={};upMark();};
function upMark(){const cs=[...document.querySelectorAll('#cards .card')];cs.forEach((c,i)=>c.classList.toggle('padsel',PAD.on&&i===upSel));if(PAD.on&&cs[upSel])cs[upSel].focus({preventScroll:true});}
const _pollPadU=pollPad;
pollPad=function(){
  if(G.state!=='upgrade'||$('upgrade').hidden)return _pollPadU();
  const gp=padGet();
  if(!gp)return _pollPadU();
  const B=i=>padBtn(gp.buttons[i])||!!PAD.latch[i],ax=gp.axes[0]||0,ay=gp.axes[1]||0,hat=padHat(gp);
  const st={l:B(14)||ax<-0.5||B(12)||ay<-0.6||hat.x<0||hat.y<0,r:B(15)||ax>0.5||B(13)||ay>0.6||hat.x>0||hat.y>0,a:B(0)||B(7)||B(5),one:B(2),two:B(3),three:B(1)};
  const ready=performance.now()-upOpenT>400,ed=k=>{const v=st[k]&&!upPrev[k];return v;};
  const n=document.querySelectorAll('#cards .card').length||3;
  if(ready){
    if(ed('l')){upSel=(upSel-1+n)%n;sfx('ui');upMark();}
    if(ed('r')){upSel=(upSel+1)%n;sfx('ui');upMark();}
    if(ed('a'))pickCard(upSel);
    else if(ed('one'))pickCard(0);else if(ed('two'))pickCard(1);else if(ed('three'))pickCard(2);
  }
  upPrev=st;if(!PAD.on){PAD.on=true;upMark();}
};

/* ---------- sul telefono si gioca solo dall'app installata sulla Home ---------- */
(function(){
  const ua=navigator.userAgent,iOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),android=/Android/i.test(ua),mobile=iOS||android||/Mobi/i.test(ua);
  const mm=q=>window.matchMedia&&matchMedia(q).matches,standalone=mm('(display-mode: standalone)')||mm('(display-mode: fullscreen)')||mm('(display-mode: minimal-ui)')||navigator.standalone===true;
  if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
  let deferred=null;
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;const b=$('instBtn');if(b&&!$('installGate').hidden)b.hidden=false;});
  addEventListener('appinstalled',()=>{$('igSteps').innerHTML='<li><b>Fatto!</b> Ora chiudi il browser e apri <b>The Tower</b> dalla schermata Home.</li>';$('instBtn').hidden=true;});
  if(!mobile||standalone||/[?&]noapp/.test(location.search))return;
  const share='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 11v9h14v-9"/></svg>';
  $('installGate').hidden=false;
  if(iOS){const other=/CriOS|FxiOS|EdgiOS/.test(ua);
    $('igSteps').innerHTML=`<li>Tocca il tasto <b>Condividi</b> ${share} ${other?'(in alto a destra o nel menu)':'nella barra di Safari'}.</li><li>Scorri e scegli <b>Aggiungi alla schermata Home</b>.</li><li>Tocca <b>Aggiungi</b>, poi apri <b>The Tower</b> dalla Home.</li>`;
    $('igNote').textContent=other?'Se non trovi la voce, apri questo link con Safari.':'L\'icona compare tra le tue app: da lì il gioco parte a schermo intero.';}
  else{$('igSteps').innerHTML='<li>Tocca il menu <b>⋮</b> in alto a destra del browser.</li><li>Scegli <b>Installa app</b> (o <b>Aggiungi a schermata Home</b>).</li><li>Conferma, poi apri <b>The Tower</b> dalla Home.</li>';
    $('igNote').textContent='Se vedi il pulsante "Installa l\'app" qui sopra, basta toccarlo.';if(deferred)$('instBtn').hidden=false;}
  $('instBtn').onclick=async()=>{if(!deferred)return;deferred.prompt();try{const r=await deferred.userChoice;if(r.outcome==='accepted')$('igSteps').innerHTML='<li><b>Installata!</b> Ora apri <b>The Tower</b> dalla schermata Home.</li>';}catch(e){}deferred=null;$('instBtn').hidden=true;};
})();

