/* =========================================================
   EVENTI NEI PIANI v2: corsa contro il tempo, ladro di tesori, pioggia di meteore,
   piano dei giganti, furia, campione del piano (in co-op li gestisce chi ha creato la partita)
   ========================================================= */
function runXpMul(){return G.event==='giganti'&&G.scene==='tower'?2:1;}
const evHud=document.createElement('div');evHud.id='evHud';evHud.hidden=true;document.body.appendChild(evHud);
{const st=document.createElement('style');st.textContent='#evHud{position:fixed;top:calc(58px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);z-index:40;pointer-events:none;font-family:var(--f-display,inherit);font-size:15px;letter-spacing:.04em;color:#ffd27a;background:rgba(12,10,18,.72);border:2px solid rgba(255,210,122,.45);padding:4px 14px;border-radius:10px;white-space:nowrap}#evHud.warn{color:#ff6a5a;border-color:rgba(255,106,90,.6);animation:evPulse .5s ease-in-out infinite alternate}@keyframes evPulse{to{transform:translateX(-50%) scale(1.08)}}';document.head.appendChild(st);}
const evSolo=()=>MP.host||!MP.live();
function evHudSet(t,warn){if(evHud.textContent!==t)evHud.textContent=t;if(evHud.hidden)evHud.hidden=false;evHud.classList.toggle('warn',!!warn);}
setInterval(()=>{if((G.scene!=='tower'||!G.event||G.state==='over')&&!evHud.hidden)evHud.hidden=true;},400);
const _sfEv=startFloor;
startFloor=function(f){G.evT=null;G.evDone=false;G.evSpawned=false;G.evStart=G.time;G.evMt=2.5;G.evThief=null;evHud.hidden=true;
  _sfEv(f);if(G.event==='tempo')G.evT=Math.round(20+2.6*Math.max(4,G.queue.length));};
const _bqEv=buildQueue;
buildQueue=function(f){const q=_bqEv(f);if(!q.length||q[0]==='boss')return q;
  if(G.event==='giganti')return q.slice(0,Math.max(3,Math.ceil(q.length*0.55)));
  if(G.event==='furia'){const n=Math.round(q.length*0.6);for(let i=0;i<n;i++)q.push(q[Math.floor(Math.random()*q.length)]);}
  return q;};
const _hitEv=hitEnemy;
hitEnemy=function(e,base,dir,o){if(G.event==='furia'&&G.scene==='tower'&&e&&e.pvp==null&&base>0&&!(o&&o.env))base*=1.5;return _hitEv(e,base,dir,o);};
// ladro e campione si riconoscono anche dagli ospiti grazie al nome che arriva con i nemici
const isThief=e=>e.thief||e.ename==='Ladro di tesori',isChamp=e=>e.champ||/ il Campione$/.test(e.ename||'');
function goldTint(e,k){for(const m of e.parts.mats){m.userData.baseE=ELITE_GOLD;m.userData.baseI=k;}}
function spawnThief(){let x=P.x<0?GATE_X-4:-HALF+4;const e=spawnEnemy('imp',{x});if(!e)return;
  e.thief=true;e.ename='Ladro di tesori';e.hp*=3;e.maxHp=e.hp;e.speed=7.2;e.escT=17;e.sc=1.15;goldTint(e,0.55);G.evThief=e;sfx('legend');popNum(x,2.6,'Prendilo!','xp');}
function spawnChamp(){const f=G.floor,pool=Object.keys(TYPES).filter(k=>TYPES[k].from<=f&&!TYPES[k].fly&&k!=='imp'&&k!=='fungus');const t=pick(pool.length?pool:['guard']);
  const e=spawnEnemy(t,{x:P.x<0?GATE_X-5:-HALF+5});if(!e)return;
  e.elite=true;e.champ=true;e.ename=pick(EL_NAMES)+' il Campione';e.emod=null;e.hp*=3.4;e.maxHp=e.hp;e.dmg*=1.3;e.sc=1.4;e.w*=1.15;e.h*=1.15;goldTint(e,0.35);sfx('roar');}
function meteorDrop(){const pl=[];if(!P.dead)pl.push(P.x);for(const R of MP.players.values())if(R.sc==='tower'&&R.fl===G.floor&&!R.dead)pl.push(R.x);
  const x=clamp(pl.length&&Math.random()<0.45?pick(pl)+rand(-1.2,1.2):rand(-HALF+2,GATE_X-2),-HALF+1.5,GATE_X-1.5),dmg=8+G.floor*0.9;
  addWarn(x,2.4,1.1,()=>{spawnProj({owner:'e',x,y:CEIL,vx:0,vy:-30,w:1.2,h:1.2,dmg,life:2,kind:'meteor'});
    setTimeout(()=>{if(G.scene!=='tower')return;const hf=MP.hitFrom;if(MP.live())MP.hitFrom=-1;   // i massi non danno esperienza a nessuno
      try{for(const e of foes())if(Math.abs(e.x-x)<1.7+e.w/2&&e.y<2.6)hitEnemy(e,dmg*2.4,e.x<x?-1:1,{kb:8,ky:7,noCombo:true,env:true});}finally{MP.hitFrom=hf;}},430);});}
function evTick(dt){const ev=G.event;if(!ev||G.scene!=='tower'||G.state!=='play'||G.tutorial)return;
  if(ev==='tempo'&&G.evT!=null){
    if(!G.evDone){if(G.cleared){G.evDone=true;if(G.evT>0){toast('In tempo!','Forziere bonus');sfx('legend');const n=G.chests.length,x=clamp(P.x+(P.x<GATE_X-6?2.5:-2.5),-HALF+2,GATE_X-2);spawnChest(x,0,false);
          if(G.chests.length>n){const c=G.chests[G.chests.length-1];c.bonus=true;c.dy=9;c.dvy=0;}}}
      else{G.evT-=dt;if(G.evT<=0){G.evT=0;G.evDone=true;toast('Tempo scaduto','Niente forziere questa volta');sfx('tired');}}}
    if(G.evDone&&G.evT<=0){evHud.hidden=true;}else evHudSet(G.evDone?'✓ Forziere bonus':'⏱ '+Math.ceil(G.evT)+' s',!G.evDone&&G.evT<10);}
  if(ev==='meteore'&&!G.cleared&&evSolo()){G.evMt-=dt;if(G.evMt<=0){G.evMt=rand(1.6,2.6);meteorDrop();}}
  if(ev==='ladro'){if(!G.evSpawned&&evSolo()&&G.time-G.evStart>2.5){G.evSpawned=true;spawnThief();}
    const th=G.enemies.find(e=>!e.dead&&isThief(e));if(th&&th.escT!=null)evHudSet('Ladro: '+Math.ceil(Math.max(0,th.escT))+' s',th.escT<5);else if(th)evHudSet('Prendi il ladro!');else evHud.hidden=true;}
  if(ev==='campione'&&!G.evSpawned&&evSolo()&&G.time-G.evStart>1.5){G.evSpawned=true;spawnChamp();}}
const _ufEv=updFloor;updFloor=function(dt){_ufEv(dt);try{evTick(dt);}catch(err){console.warn('evento',err);}};
// il ladro scappa: corre via da chi lo insegue, salta oltre se è messo all'angolo, dopo un po' sparisce
function thiefAI(e,dt){e.t+=dt;e.flash-=dt;e.flinch-=dt;e.escT-=dt;e.cd-=dt;
  let tx=P.dead?null:P.x,bd=P.dead?1e9:Math.abs(P.x-e.x);for(const R of MP.players.values())if(R.sc==='tower'&&R.fl===G.floor&&!R.dead&&Math.abs(R.x-e.x)<bd){bd=Math.abs(R.x-e.x);tx=R.x;}
  let dir=tx==null?(e.face||1):(e.x>=tx?1:-1);const L=-HALF+1.6,Rr=GATE_X-1.6;
  if((e.x<L+1&&dir<0)||(e.x>Rr-1&&dir>0)){if(e.onGround&&bd<4){e.vy=13;dir=-dir;e.vx=dir*e.speed*1.2;}else if(bd>=4)dir=0;}
  if(dir)e.face=dir;if(e.kbT>0){e.kbT-=dt;e.vx*=0.88;}else e.vx=approach(e.vx,dir*e.speed,28*dt);
  if(e.onGround&&e.cd<=0&&bd<6&&Math.random()<0.02){e.vy=9;e.cd=1;}
  e.vy+=GRAV*dt;moveBody(e,dt);if(Math.random()<0.25)burst(e.x,e.y+0.5,0xffd27a,1,1.5,1,0.3);
  if(e.escT<=0){e.dead=true;e.escaped=true;burst(e.x,e.y+0.6,0xffd27a,30,6,3,0.3);sfx('gate');popNum(e.x,e.y+2,'È scappato!','info');
    if(e.parts){e.parts.bar.visible=false;scene.remove(e.parts.root);}if(MP.host&&MP.live())MP.bcast({t:'evesc',f:G.floor,id:e.id});}}
const _ueEv=updEnemy;
updEnemy=function(e,dt){if(e.thief&&!e.net&&!e.dead&&!(e.spawnT>0)&&!(e.stunT>0)&&!(e.hitstun>0)){thiefAI(e,dt);return;}return _ueEv(e,dt);};
const _mmEv=mpMsg;
mpMsg=function(m,from){if(m&&m.t==='evesc'){if(!MP.host&&G.scene==='tower'&&m.f===G.floor){const e=G.enemies.find(x=>x.id===m.id&&!x.dead);if(e){e.escaped=true;e.dead=true;burst(e.x,e.y+0.6,0xffd27a,30,6,3,0.3);popNum(e.x,e.y+2,'È scappato!','info');if(e.parts){scene.remove(e.parts.root);}}}return;}return _mmEv(m,from);};
// premi: ogni giocatore riceve il suo bottino
const _keEv=killEnemy;
killEnemy=function(e){const was=e.dead,th=!was&&!e.escaped&&G.scene==='tower'&&isThief(e),ch=!was&&G.scene==='tower'&&isChamp(e);const r=_keEv(e);
  try{const f=G.floor;
    if(th){const n=2+(Math.random()<0.4?1:0);for(let i=0;i<n;i++){const o=Math.random()<0.4?makeWeapon(G.cls.weapon,rollRarity(f,1),f):makeGear(pick(Object.keys(GEAR)),rollRarity(f,1),f);dropItem(o,e.x,e.y+1,i,n);}
      addCoins(30+f*2,e.x,e.y+e.h+1.4);popNum(e.x,e.y+e.h+0.8,'Tesoro!','xp');sfx('legend');}
    if(ch){const o=Math.random()<0.5?makeWeapon(G.cls.weapon,rollRarity(f,2),f):makeGear(pick(Object.keys(GEAR)),rollRarity(f,2),f);dropItem(o,e.x,e.y+1,0,1);addCoins(15+f,e.x,e.y+e.h+1.4);popNum(e.x,e.y+e.h+0.8,'Campione sconfitto!','xp');}
  }catch(err){console.warn('premio evento',err);}
  return r;};
const _syEv=syncEnemy;syncEnemy=function(e,dt){if(!e._evT&&e.ename==='Ladro di tesori'&&e.parts){e._evT=1;goldTint(e,0.55);}return _syEv(e,dt);};
