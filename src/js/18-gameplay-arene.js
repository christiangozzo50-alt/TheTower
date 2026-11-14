/* =========================================================
   GAMEPLAY PIÙ VIVO
   1) combo con livelli, barra che si svuota, premi in rubini; si azzera se ti colpiscono
   2) schivata perfetta: scattare attraverso un colpo → rallentatore e contrattacco critico
   3) rubini che schizzano fuori e volano verso l'eroe
   ========================================================= */
/* ---------- 1 · combo ---------- */
const CMB_W=1.6;
const CMB_TIERS=[{n:10,t:'Bene!',r:2},{n:20,t:'Ottimo!',r:4},{n:35,t:'Furioso!',r:7},{n:50,t:'Inarrestabile!',r:10},{n:75,t:'Leggendario!',r:15},{n:100,t:'Divino!',r:25}];
(function(){const c=$('combo');if(!c)return;const bar=document.createElement('i');bar.id='comboBar';c.appendChild(bar);const tt=document.createElement('em');tt.id='comboTier';c.appendChild(tt);})();
G.cmbTier=0;
const _heJ=hitEnemy;
hitEnemy=function(e,base,dir,o){o=o||{};
  // contrattacco dopo una schivata perfetta: critico sicuro e +50%
  if(P.pdT>0&&o.melee&&!e.dead){o.crit=true;base*=1.5;P.pdT=0;popNum(P.x,P.y+2.7,'Contrattacco!','crit');G.hitstop=Math.max(G.hitstop,0.09);shake(0.35);}
  const before=G.cmb;const r=_heJ.call(this,e,base,dir,o);
  if(G.cmb!==before){if(G.cmb<before||G.cmb===1)G.cmbTier=0;
    const T=CMB_TIERS[G.cmbTier];if(T&&G.cmb>=T.n&&G.scene==='tower'&&!G.pvp){G.cmbTier++;
      popNum(P.x,P.y+3,T.t+' ×'+G.cmb,'crit');sfx('crit');burst(P.x,P.y+1.4,0xffb347,18,6,3);
      if(!G.horde)addCoins(Math.ceil(T.r/3),P.x,P.y+2.2);const c=$('combo');c.dataset.tier=G.cmbTier;}}
  return r;};
function comboUi(){const c=$('combo');if(!c)return;const left=1-(G.time-G.cmbT)/CMB_W,on=G.cmb>=2&&left>0;
  const b=$('comboBar');if(b)b.style.transform=`scaleX(${on?Math.max(0,left):0})`;
  if(!on&&G.cmbTier){G.cmbTier=0;delete c.dataset.tier;}
  const tt=$('comboTier');if(tt){const T=CMB_TIERS[Math.max(0,G.cmbTier-1)];tt.textContent=G.cmbTier&&on?T.t:'';}}

/* ---------- 2 · schivata perfetta ---------- */
P.pdT=0;P.dashN=0;
const _hpJ=hurtPlayer;
hurtPlayer=function(dmg,fromX,eff){
  if(P.dashT>0&&!P.dead&&G.state==='play'&&P.pdDash!==P.dashN&&!G.pvp){P.pdDash=P.dashN;perfectDodge(fromX);return;}
  const hp0=P.hp;const r=_hpJ.apply(this,arguments);
  if(P.hp<hp0&&!P.dead){if(G.cmb>=5){popNum(P.x,P.y+3,'Combo persa','info');}G.cmb=0;G.cmbTier=0;const c=$('combo');if(c)delete c.dataset.tier;}
  return r;};
function perfectDodge(fromX){P.pdT=1.6;G.abilSlow=Math.max(G.abilSlow||0,0.55);sfx('crit');shake(0.15);
  popNum(P.x,P.y+2.8,'Schivata perfetta!','crit');burst(P.x,P.y+1.1,0x7ff0e4,26,7,2,0.3);burst(P.x,P.y+1.1,0xffffff,10,4,1);
  const f=$('pdFx');if(f){f.classList.remove('on');void f.offsetWidth;f.classList.add('on');}
  STATS.pdodge=(STATS.pdodge||0)+1;}
(function(){const d=document.createElement('div');d.id='pdFx';document.body.appendChild(d);})();

/* ---------- 3 · rubini che volano verso l'eroe ---------- */
const GEM_GEO=new THREE.OctahedronGeometry(0.11,0);GEM_GEO.userData.keep=true;
const GEM_MAT=new THREE.MeshBasicMaterial({color:0xff2a4a});GEM_MAT.userData.keep=true;
const GEM_MAT2=new THREE.MeshBasicMaterial({color:0xff9aa8});GEM_MAT2.userData.keep=true;
const GEMS=[];
function gemFly(x,y,n){if(G.scene!=='tower'&&G.scene!=='cellar')return;const k=Math.min(10,Math.max(2,Math.ceil(n/3)));
  for(let i=0;i<k;i++){let g=GEMS.find(q=>!q.on);if(!g){if(GEMS.length>40)break;const m=new THREE.Mesh(GEM_GEO,Math.random()<0.25?GEM_MAT2:GEM_MAT);scene.add(m);g={m};GEMS.push(g);}
    g.on=true;g.t=0;g.m.visible=true;g.m.position.set(x+rand(-0.2,0.2),y-0.4+rand(-0.1,0.2),0.3);g.vx=rand(-3.5,3.5);g.vy=rand(4,8);g.vz=rand(-0.5,1);g.delay=rand(0.28,0.45);}}
function updGems(dt){for(const g of GEMS){if(!g.on)continue;g.t+=dt;const p=g.m.position;g.m.rotation.y+=dt*9;g.m.rotation.x+=dt*5;
  if(g.t<g.delay){g.vy-=26*dt;p.x+=g.vx*dt;p.y+=g.vy*dt;p.z+=g.vz*dt;const fl=groundAt(p.x,p.y+0.2)+0.1;if(p.y<fl){p.y=fl;g.vy=Math.abs(g.vy)*0.35;g.vx*=0.6;}}
  else{const tx=P.x,ty=P.y+1.2,dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy),sp=8+(g.t-g.delay)*40;
    if(d<0.35||g.t>2){g.on=false;g.m.visible=false;burst(tx,ty,0xff4a64,3,2,1);const ch=document.querySelector('.hud-right .coin-chip');if(ch){ch.classList.remove('bump');void ch.offsetWidth;ch.classList.add('bump');}continue;}
    p.x+=dx/d*sp*dt;p.y+=dy/d*sp*dt;p.z+=(0.3-p.z)*Math.min(1,dt*6);}}}
const _acJ=addCoins;addCoins=function(n,x,y){_acJ(n,x,y);if(x!=null&&n>0)gemFly(x,y,n);};
const _upPJ=updParticles;updParticles=function(dt){_upPJ(dt);updGems(dt);};

/* ---------- aggiornamento ---------- */
const _upJ=update;
update=function(dt){_upJ(dt);if(P.pdT>0)P.pdT-=dt;if(P.dashT>0&&!P.wasDash)P.dashN++;P.wasDash=P.dashT>0;};
const _hudJ=updHud;updHud=function(){_hudJ.apply(this,arguments);comboUi();};
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{perfectDodge,gemFly,hitEnemy:(...a)=>hitEnemy(...a),hurtPlayer:(...a)=>hurtPlayer(...a)});

/* =========================================================
   NEMICI PIÙ VIVI · MUSICA DI BATTAGLIA
   ========================================================= */
/* ---------- camminata dei nemici con il nuovo ciclo a pose chiave, piedi piatti ---------- */
let CUR_E=null;
function enemyWalk(tg,e,sp,dt){const amp=Math.min(1,sp/5.5),sc=(e.parts&&e.parts.rigScale)||1,len=RUN_LEN*(0.4+0.6*amp)*sc;
  e.cyc=((e.cyc||0)+dt*sp/len)%1;const G2=runLegs(e.cyc),bl=(b,v)=>b+(v-b)*amp*0.85;
  tg.hF=bl(-0.1,G2.a[0]);tg.kF=bl(0.2,G2.a[1]);tg.fF=bl(-0.1,G2.a[2]);tg.hB=bl(0.08,G2.b[0]);tg.kB=bl(0.16,G2.b[1]);tg.fB=bl(-0.24,G2.b[2]);
  tg.crouch=bl(0.02,0.95-G2.H);tg.lean=(tg.lean||0)+0.14*amp;tg.twist=Math.sin(2*Math.PI*e.cyc-Math.PI)*0.14*amp;}
const _apE=applyPose;
applyPose=function(R,t,k,ka){_apE(R,t,k,ka);
  if(!AV2()||!CUR_E||R!==CUR_E.parts.rig)return;const gr=CUR_E.onGround,flat=(h,kn)=>clamp(-(h+kn),-0.9,0.9);
  const fF=t.fF!=null?t.fF:(gr?flat(t.hF,t.kF):0.35),fB=t.fB!=null?t.fB:(gr?flat(t.hB,t.kB):0.25);
  const j=(o,v)=>{if(o)o.rotation.x+=wrapA(v-o.rotation.x)*k;};if(R.legs){j(R.legs[0].foot,fF);j(R.legs[1].foot,fB);}};
// colpo ricevuto: contraccolpo nella direzione del colpo, testa che scatta, braccio che vola
const _srE=syncRig;
syncRig=function(e,p,dt,t,fl,k,w,st){const R=p.rig;
  if(e.rOff&&R){R.torso.rotation.x-=e.rOff.l;R.head.rotation.x-=e.rOff.h;R.arms[1].sh.rotation.x-=e.rOff.a;e.rOff=null;}
  CUR_E=e;try{_srE(e,p,dt,t,fl,k,w,st);}finally{CUR_E=null;}
  if(!AV2()||!R||!(fl>0)||e.dead)return;const s=e.lastDir===e.face?1:-1,q=fl*fl;
  const o={l:0.55*q*s,h:-0.5*q*s,a:-1.1*q};R.torso.rotation.x+=o.l;R.head.rotation.x+=o.h;R.arms[1].sh.rotation.x+=o.a;e.rOff=o;};
/* ---------- musica di battaglia: batteria e basso che entrano quando ci sono nemici ---------- */
const BAT={I:0};
function battleLayer(s,t,sd,d,ch){const I=BAT.I;if(I<0.08)return;
  if(s%4===0)note(58,{dur:.2,vol:.26*I,f2:36,at:t,dest:d});
  if(s%8===4){hiss({dur:.13,vol:.13*I,f:1900,f2:700,q:1,at:t,dest:d});note(190,{type:'triangle',dur:.07,vol:.05*I,f2:120,at:t,dest:d});}
  if(I>0.45)hiss({dur:.035,vol:(s%2?0.022:0.04)*I,f:7500,q:.8,at:t,dest:d});
  if(I>0.3&&s%2===0)note(mtof(ch[0]-24+(s%8===6?7:0)),{type:'sawtooth',dur:sd*0.85,vol:.05*I,at:t,dest:d,lp:520});
  if(I>0.75&&s%8===0)note(mtof(ch[1]+12),{type:'square',dur:sd*0.6,vol:.028*I,at:t,dest:d,lp:1600});}
function battleIntensity(dt){let tgt=0;
  if(G.scene==='tower'&&(G.state==='play'||G.state==='upgrade')&&MUS.mood==='tower'&&!G.safe){const alive=(G.enemies||[]).filter(e=>!e.dead).length,q=(G.queue||[]).length;
    if(alive>0||(!G.cleared&&q>0))tgt=Math.min(1,0.45+alive*0.07+Math.min(0.25,(G.cmb||0)*0.012)+(G.horde?0.2:0));}
  BAT.I+=(tgt-BAT.I)*Math.min(1,dt*(tgt>BAT.I?2.5:0.8));}
const _upE=update;update=function(dt){_upE(dt);battleIntensity(dt);};
const _ecE=enterCellar;enterCellar=function(){BAT.I=0;return _ecE.apply(this,arguments);};

/* =========================================================
   ARENE PvP A TEMA: 3 mappe per l'1 contro 1 e 3 per il 2 contro 2, a rotazione
   + schermata con i nomi e le classi dei combattenti prima di iniziare
   ========================================================= */
let ARENA=null;
const aBasic=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c,fog:false},o||{}));
const aGlow=(c,op)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op==null?0.9:op,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
function aRng(seed){let s=(seed>>>0)||1;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
// pezzi comuni
// facciata del pavimento verso la telecamera: blocchi di pietra invece di una parete piatta
function aBlocks(col){const [cn,x]=cv(64,64),k=new THREE.Color(col),d=k.clone().multiplyScalar(0.62),m=k.clone().multiplyScalar(0.4);
  x.fillStyle='#'+d.getHexString();x.fillRect(0,0,64,64);x.fillStyle='#'+m.getHexString();
  x.fillRect(0,0,64,3);x.fillRect(0,32,64,3);x.fillRect(0,0,3,32);x.fillRect(32,32,3,32);
  x.fillStyle='rgba(255,255,255,0.06)';x.fillRect(3,3,61,4);x.fillRect(0,35,64,4);
  const t=new THREE.CanvasTexture(cn);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;return t;}
function aFloor(g,c,hw,col,front){const W=hw*2+14;mesh(new THREE.BoxGeometry(W,6,7.8),toon(col),c,-3,0.6,g);
  const t=aBlocks(col);t.repeat.set(W/1.8,6/1.8);mesh(new THREE.PlaneGeometry(W,6),new THREE.MeshLambertMaterial({map:t}),c,-3,4.51,g,true);
  mesh(new THREE.BoxGeometry(W,0.14,0.16),toon(front||new THREE.Color(col).multiplyScalar(0.8).getHex()),c,-0.07,4.52,g,true);}
function aBack(g,c,hw,col,h){mesh(new THREE.BoxGeometry(hw*2+14,h||14,0.6),toon(col),c,(h||14)/2,-3.3,g);}
function aSky(g,c,col,top){mesh(new THREE.PlaneGeometry(160,70),aBasic(col),c,12,-24,g,true);if(top!=null)mesh(new THREE.PlaneGeometry(160,30),aBasic(top,{transparent:true,opacity:0.6}),c,26,-23.5,g,true);}
function aPlat(g,x,y,w,col,edge){mesh(rbox(w,0.36,1.9,0.06),toon(col),x,y-0.18,-0.2,g);if(edge)mesh(rbox(w+0.08,0.07,1.96,0.02),toon(edge),x,y-0.02,-0.2,g);G.solids.push({x1:x-w/2,x2:x+w/2,y1:y-0.5,y2:y});}
function aTorch(g,x,y,z,col){mesh(new THREE.CylinderGeometry(0.05,0.07,0.6,6),toon(0x4a3524),x,y,z,g);const f=mesh(new THREE.ConeGeometry(0.13,0.36,7),aGlow(col||0xffa040),x,y+0.45,z,g,true);
  mesh(sph(0.1,8,6),aGlow(0xffe0a0),x,y+0.36,z,g,true);ARENA.flames.push(f);}
function aLight(g,x,y,z,col,int,dist){const l=new THREE.PointLight(col,int,dist||10);l.position.set(x,y,z);g.add(l);ARENA.lights.push({l,b:int});return l;}
function aSide(g,x,col,h,cap){mesh(rbox(1.0,h,3.4,0.06),toon(col),x,h/2,-0.2,g);if(cap)mesh(rbox(1.2,0.3,3.6,0.05),toon(cap),x,h+0.15,-0.2,g);}
function aBanner(g,x,y,col,emb){const b=mesh(new THREE.PlaneGeometry(1.1,2.6),toon(col,{side:THREE.DoubleSide}),x,y,-2.95,g);mesh(rbox(1.3,0.08,0.08,0.02),toon(0xd9b45a),x,y+1.32,-2.9,g);
  if(emb)mesh(new THREE.CircleGeometry(0.28,12),toon(emb),x,y+0.3,-2.93,g,true);ARENA.cloth.push(b);return b;}
/* ---------- 1 contro 1 ---------- */
const ARENAS1=[
 {id:'colosseo',name:'Fossa del colosseo',sky:0x2a1712,fog:0x2a1712,hemi:0xffd8a8,build(g,c,hw,r){
   aSky(g,c,0x3a2016,0x1a0e0c);aFloor(g,c,hw,0xc9a46a);
   // muro della fossa con archi
   mesh(new THREE.BoxGeometry(hw*2+14,5.2,0.6),toon(0x8a7a64),c,2.6,-3.3,g);mesh(new THREE.BoxGeometry(hw*2+14,0.35,0.9),toon(0x6e604e),c,5.3,-3.2,g);
   for(let x=c-hw-4;x<=c+hw+4;x+=3.2){mesh(new THREE.BoxGeometry(1.5,2.1,0.1),toon(0x1c140f),x,1.05,-2.98,g,true);mesh(new THREE.CircleGeometry(0.75,14,0,Math.PI),toon(0x1c140f),x,2.1,-2.98,g,true);}
   // spalti con il pubblico
   for(let k=0;k<3;k++){const z=-4.6-k*1.6,y=5.6+k*1.5;mesh(new THREE.BoxGeometry(hw*2+30,1.5,1.6),toon(0x5a4e40),c,y-0.75,z,g);
     for(let x=c-hw-12;x<=c+hw+12;x+=0.62+r()*0.3){const col=[0x3a2a22,0x4a3020,0x2e2630,0x503a28][Math.floor(r()*4)];
       mesh(new THREE.CapsuleGeometry?new THREE.CapsuleGeometry(0.17,0.3,3,6):new THREE.CylinderGeometry(0.17,0.2,0.6,6),toon(col),x,y+0.35+r()*0.08,z+0.2,g,true);mesh(sph(0.15,6,5),toon(0x6a5040),x,y+0.82,z+0.2,g,true);}}
   for(let x=c-hw-3;x<=c+hw+3;x+=4.8){aTorch(g,x,3.6,-2.9);}aLight(g,c-hw*0.5,4,-1.5,0xffa040,1.2,14);aLight(g,c+hw*0.5,4,-1.5,0xffa040,1.2,14);
   aBanner(g,c-hw+1.4,3.3,0xc0392b,0xd9b45a);aBanner(g,c+hw-1.4,3.3,0x2e5fc0,0xd9b45a);
   aSide(g,c-hw-0.5,0x7a6a54,5.6,0x5e5040);aSide(g,c+hw+0.5,0x7a6a54,5.6,0x5e5040);
   aPlat(g,c,2.7,3.2,0x8a7a64,0x5e5040);}},
 {id:'ponte',name:'Ponte sospeso',sky:0x0b0f18,fog:0x0b0f18,hemi:0x9fb4d8,build(g,c,hw,r){
   aSky(g,c,0x101826,0x05070c);mesh(new THREE.CircleGeometry(1.6,28),aBasic(0xdfe6ff),c-hw*0.6,13,-22,g,true);mesh(new THREE.CircleGeometry(2.6,28),aGlow(0x9fb4ff,0.15),c-hw*0.6,13,-22.2,g,true);
   for(let i=0;i<60;i++)mesh(new THREE.PlaneGeometry(0.09,0.09),aBasic(0xffffff,{transparent:true,opacity:0.4+r()*0.6}),c+(r()-0.5)*90,4+r()*22,-23,g,true);
   mesh(new THREE.BoxGeometry(hw*2+14,1.2,4.6),toon(0x6a6470),c,-0.6,0.4,g);         // impalcato
   for(let x=c-hw-6;x<=c+hw+6;x+=3.4){mesh(new THREE.CylinderGeometry(0.5,0.9,14,8),toon(0x3e3a44),x,-7.8,0.4,g);}  // piloni nel vuoto
   for(let i=0;i<6;i++)mesh(new THREE.PlaneGeometry(40,3),aBasic(0x9fb0c8,{transparent:true,opacity:0.08+r()*0.06,depthWrite:false}),c+(r()-0.5)*20,-1.5-r()*3,-4-i*2,g,true);   // nebbia
   for(let i=0;i<5;i++){const x=c+(i-2)*16+(r()-0.5)*6;mesh(new THREE.ConeGeometry(4+r()*3,14+r()*8,5),toon(0x1a1e28),x,-2,-20-r()*6,g,true);}   // rupi lontane
   for(const s of [-1,1])for(let x=c-hw;x<=c+hw;x+=1.2){mesh(new THREE.CylinderGeometry(0.05,0.05,0.9,5),toon(0x2c2a30),x,0.45,s<0?-1.75:2.55,g,true);}
   for(const z of [-1.75,2.55])mesh(new THREE.BoxGeometry(hw*2,0.08,0.08),toon(0x2c2a30),c,0.92,z,g,true);
   aSide(g,c-hw-0.5,0x4a4652,7,0x35323c);aSide(g,c+hw+0.5,0x4a4652,7,0x35323c);
   for(const x of [c-hw-0.5,c+hw+0.5]){const ch=mesh(new THREE.CylinderGeometry(0.04,0.04,9,5),toon(0x2c2a30),(x+c)/2,4.5,-1.8,g,true);ch.rotation.z=(x<c?-1:1)*1.05;}
   for(const x of [c-hw*0.55,c,c+hw*0.55]){mesh(new THREE.CylinderGeometry(0.02,0.02,3.2,4),toon(0x2c2a30),x,7.4,-1.6,g,true);mesh(rbox(0.32,0.42,0.32,0.05),aGlow(0xffd27a,0.95),x,5.6,-1.6,g,true);aLight(g,x,5.4,-1.2,0xffc070,0.9,9);}
   aPlat(g,c,2.6,3.0,0x6a4a2e,0x3e2715);
   for(const s of [-1,1])mesh(new THREE.BoxGeometry(0.16,2.6,0.16),toon(0x4a3220),c+s*1.3,1.3,-0.9,g);}},
 {id:'trono',name:'Sala del trono',sky:0x120a10,fog:0x150a12,hemi:0xffc8d8,build(g,c,hw,r){
   aSky(g,c,0x120a10);aFloor(g,c,hw,0x2a2228);
   const [cn,x2]=cv(64,64);for(let i=0;i<2;i++)for(let j=0;j<2;j++){x2.fillStyle=(i+j)%2?'#e8e0d0':'#2a2430';x2.fillRect(i*32,j*32,32,32);}
   const tx=new THREE.CanvasTexture(cn);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set((hw*2+14)/1.6,7.8/1.6);tx.magFilter=THREE.NearestFilter;
   const fl=mesh(new THREE.PlaneGeometry(hw*2+14,7.8),new THREE.MeshLambertMaterial({map:tx}),c,0.005,0.6,g,true);fl.rotation.x=-Math.PI/2;
   const cp=mesh(new THREE.PlaneGeometry(hw*2+14,1.3),toon(0xa01e2e),c,0.012,0.3,g,true);cp.rotation.x=-Math.PI/2;
   aBack(g,c,hw,0x3a1420);
   for(let x=c-hw-3;x<=c+hw+3;x+=3.6){mesh(new THREE.CylinderGeometry(0.38,0.44,11,10),toon(0xcfc6b8),x,5.5,-2.7,g);mesh(rbox(1.1,0.4,1.1,0.05),toon(0xd9b45a),x,0.2,-2.7,g);}
   const gl=[0xff4a6a,0x4aa0ff,0xffd27a,0x7fe08a,0xb48cff];
   for(let x=c-hw-1.2;x<=c+hw+1.2;x+=3.6){for(let i=0;i<4;i++)for(let j=0;j<2;j++)mesh(new THREE.PlaneGeometry(0.55,1.1),aGlow(gl[Math.floor(r()*gl.length)],0.55),x+(j-0.5)*0.6,4.2+i*1.15,-2.98,g,true);
     mesh(new THREE.CircleGeometry(0.62,16,0,Math.PI),aGlow(0xffd27a,0.5),x,8.8,-2.98,g,true);}
   // trono sullo sfondo
   mesh(rbox(1.6,0.5,1.0,0.05),toon(0x6a1020),c,0.25,-2.4,g);mesh(rbox(1.5,0.9,0.9,0.05),toon(0xd9b45a),c,0.95,-2.4,g);mesh(rbox(1.6,2.6,0.25,0.05),toon(0xd9b45a),c,2.0,-2.85,g);
   mesh(rbox(1.2,2.1,0.1,0.05),toon(0x8a1428),c,1.9,-2.7,g);mesh(new THREE.ConeGeometry(0.3,0.6,4),toon(0xd9b45a),c,3.6,-2.85,g);
   aSide(g,c-hw-0.5,0x5a1a2a,9,0xd9b45a);aSide(g,c+hw+0.5,0x5a1a2a,9,0xd9b45a);
   for(const x of [c-hw*0.6,c+hw*0.6]){aTorch(g,x,2.8,-2.6,0xffc070);aLight(g,x,4,-1.2,0xffb070,1.0,12);}
   aBanner(g,c-hw+1.4,4.6,0xc0392b,0xd9b45a);aBanner(g,c+hw-1.4,4.6,0x2e5fc0,0xd9b45a);
   aPlat(g,c,2.8,3.4,0x4a2a1c,0xd9b45a);}}];
/* ---------- 2 contro 2 ---------- */
const ARENAS2=[
 {id:'tempesta',name:'Terrazza della tempesta',sky:0x0a1022,fog:0x0a1022,hemi:0xa8c0ff,storm:true,build(g,c,hw,r){
   aSky(g,c,0x0e1630,0x05080f);aFloor(g,c,hw,0x5d5a66,0x3e3c46);
   mesh(new THREE.CircleGeometry(2.4,32),aBasic(0xe8ecff),c+hw*0.55,12,-20,g,true);mesh(new THREE.CircleGeometry(3.6,32),aGlow(0x9fb4ff,0.18),c+hw*0.55,12,-20.2,g,true);
   for(let i=0;i<10;i++){const cl=mesh(sph(1,10,8),aBasic(0x1c2440,{transparent:true,opacity:0.85}),c+(r()-0.5)*70,9+r()*7,-17-r()*3,g,true);cl.scale.set(4+r()*5,0.9+r()*0.8,1);}
   // parapetto merlato
   mesh(new THREE.BoxGeometry(hw*2+14,1.1,0.5),toon(0x4a4752),c,0.55,-2.7,g);for(let x=c-hw-6;x<=c+hw+6;x+=1.1)mesh(new THREE.BoxGeometry(0.55,0.5,0.5),toon(0x4a4752),x,1.35,-2.7,g);
   aSide(g,c-hw-0.6,0x4a4752,8,0x35323c);aSide(g,c+hw+0.6,0x4a4752,8,0x35323c);
   for(const x of [c-hw-0.6,c+hw+0.6])mesh(new THREE.ConeGeometry(0.9,1.6,4),toon(0x2a2440),x,8.8,-0.2,g);
   for(const x of [c-hw*0.7,c,c+hw*0.7]){aTorch(g,x,1.7,-2.4,0x8fdcff);aLight(g,x,2.6,-1.4,0x8fb4ff,0.8,11);}
   // fulmine
   const pts=[];let x=0,y=0;for(let i=0;i<8;i++){pts.push(new THREE.Vector3(x,y,0));x+=(r()-0.5)*2.4;y-=1.6;}
   const bolt=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xe8f0ff,fog:false,transparent:true}));bolt.position.set(c,22,-18);bolt.visible=false;g.add(bolt);ARENA.bolt=bolt;
   aBanner(g,c-hw+1.6,3.2,0xc0392b,0xe8ecff);aBanner(g,c+hw-1.6,3.2,0x2e5fc0,0xe8ecff);
   aPlat(g,c-hw*0.5,2.6,3.4,0x6a6676,0x3e3c46);aPlat(g,c+hw*0.5,2.6,3.4,0x6a6676,0x3e3c46);aPlat(g,c,4.9,3.0,0x6a6676,0x3e3c46);}},
 {id:'tempio',name:'Tempio in rovina',sky:0x0c1a12,fog:0x0e1c14,hemi:0xc8f0b0,build(g,c,hw,r){
   aSky(g,c,0x10241a,0x07120c);aFloor(g,c,hw,0x6a7058,0x4a5040);
   for(let i=0;i<14;i++){const x=c+(r()-0.5)*80;mesh(new THREE.ConeGeometry(2+r()*2,10+r()*8,6),toon(0x12301c),x,4,-14-r()*8,g,true);}
   mesh(new THREE.BoxGeometry(hw*2+14,4.5,0.6),toon(0x7a7c66),c,2.25,-3.3,g);
   for(let x=c-hw-4;x<=c+hw+4;x+=2.8){const h=r()<0.4?2+r()*3:7+r()*2;mesh(new THREE.CylinderGeometry(0.42,0.48,h,10),toon(0x9a9a80),x,h/2,-2.6,g);
     if(h>6)mesh(rbox(1.2,0.4,1.2,0.05),toon(0x86866e),x,h+0.2,-2.6,g);else mesh(new THREE.DodecahedronGeometry(0.5),toon(0x86866e),x+0.6,0.3,-1.9,g);}
   for(let i=0;i<16;i++){const x=c+(r()-0.5)*(hw*2+6),L=1+r()*2.5;mesh(new THREE.BoxGeometry(0.08,L,0.08),toon(0x3f7a3a),x,4.6-L/2,-2.95,g,true);
     mesh(sph(0.16,6,5),toon(0x4f9a46),x,4.6-L,-2.92,g,true);}
   for(let i=0;i<20;i++)mesh(new THREE.ConeGeometry(0.12,0.3,4),toon(0x5f9a4a),c+(r()-0.5)*(hw*2),0.15,-1.8+r()*4,g,true);
   aSide(g,c-hw-0.6,0x86866e,6,0x6a6c58);aSide(g,c+hw+0.6,0x86866e,6,0x6a6c58);
   for(const x of [c-hw*0.65,c+hw*0.65]){aTorch(g,x,2.2,-2.3,0xffc870);aLight(g,x,3,-1.3,0xffd890,0.9,12);}
   aBanner(g,c-hw+1.6,3.0,0xc0392b,0xd9b45a);aBanner(g,c+hw-1.6,3.0,0x2e5fc0,0xd9b45a);
   aPlat(g,c-hw*0.5,2.6,3.2,0x86866e,0x5a6a48);aPlat(g,c+hw*0.5,2.6,3.2,0x86866e,0x5a6a48);aPlat(g,c,4.9,3.4,0x9a9a80,0x5a6a48);}},
 {id:'fucina',name:'Fucina di lava',sky:0x1a0806,fog:0x1e0a06,hemi:0xffb080,lava:true,build(g,c,hw,r){
   aSky(g,c,0x2a0c06,0x0a0302);aFloor(g,c,hw,0x2e2a2a,0xff6a1a);
   for(let x=c-hw-6;x<=c+hw+6;x+=0.9)for(const z of [-1.8,3.6])mesh(sph(0.05,5,4),toon(0x6a6060),x,0.02,z,g,true);
   const lv=mesh(new THREE.PlaneGeometry(160,6),aGlow(0xff6a1a,0.9),c,0.5,-12,g,true);ARENA.lava.push(lv);
   const lv2=mesh(new THREE.PlaneGeometry(160,14),aGlow(0xff3a0a,0.25),c,4,-12.5,g,true);ARENA.lava.push(lv2);
   aBack(g,c,hw,0x241a18,9);
   for(let i=0;i<10;i++){const x=c+(r()-0.5)*(hw*2+8),y=1+r()*6,L=0.8+r()*1.6;const b=mesh(new THREE.BoxGeometry(L,0.07,0.05),aGlow(0xff7a2a,0.85),x,y,-2.98,g,true);b.rotation.z=(r()-0.5)*1.6;ARENA.lava.push(b);}
   // fornace al centro
   mesh(rbox(3.2,4.2,1.2,0.1),toon(0x3a2a24),c,2.1,-2.6,g);const mo=mesh(new THREE.CircleGeometry(0.9,16,0,Math.PI),aGlow(0xffa040,0.95),c,1.2,-1.98,g,true);ARENA.lava.push(mo);
   mesh(new THREE.BoxGeometry(1.8,1.2,0.05),aGlow(0xff7a2a,0.9),c,0.6,-1.98,g,true);aLight(g,c,1.6,-0.8,0xff7a2a,1.6,12);
   for(const x of [c-hw*0.75,c-hw*0.3,c+hw*0.3,c+hw*0.75])mesh(new THREE.CylinderGeometry(0.05,0.05,6,5),toon(0x3a3434),x,9,-2.2,g,true);
   for(const x of [c-hw*0.6,c+hw*0.6]){mesh(rbox(0.9,0.35,0.4,0.05),toon(0x4a4444),x,0.75,-2.1,g);mesh(rbox(0.4,0.55,0.35,0.04),toon(0x3a3434),x,0.3,-2.1,g);aLight(g,x,3,-1.4,0xff8a3a,0.9,10);}
   aSide(g,c-hw-0.6,0x3a2e2a,8,0x2a201c);aSide(g,c+hw+0.6,0x3a2e2a,8,0x2a201c);
   aBanner(g,c-hw+1.6,3.6,0xc0392b,0x2a201c);aBanner(g,c+hw-1.6,3.6,0x2e5fc0,0x2a201c);
   aPlat(g,c-hw*0.5,2.6,3.2,0x4a4444,0xff6a1a);aPlat(g,c+hw*0.5,2.6,3.2,0x4a4444,0xff6a1a);aPlat(g,c,4.9,3.0,0x4a4444,0xff6a1a);}}];
function buildArena(mode,c,hw,idx){const list=mode==='1v1'?ARENAS1:ARENAS2,T=list[idx!=null?idx:((MP.seed>>>0)+(mode==='1v1'?0:7))%list.length];
  while(levelGroup.children.length){const o=levelGroup.children.pop();disposeObj(o);}
  G.solids=[];for(const b of G.barrels||[])b.dead=true;G.barrels=[];for(const p of G.pickups||[]){const o=p.m||p.g;if(o&&o.parent)o.parent.remove(o);}G.pickups=[];
  ARENA={T,flames:[],lights:[],cloth:[],lava:[],bolt:null,boltT:2+Math.random()*3,flash:0};
  towerG.visible=false;const g=new THREE.Group();levelGroup.add(g);T.build(g,c,hw,aRng((MP.seed||1)*31+7));
  scene.background.setHex(T.sky);scene.fog.color.setHex(T.fog);scene.fog.near=26;scene.fog.far=70;hemi.color.setHex(T.hemi);G.zoneBuilt=-1;
  const z=$('zoneName');if(z)z.textContent=T.name;return T;}
function arenaOff(){if(ARENA){ARENA=null;hemi.intensity=0.85;}towerG.visible=true;}
function arenaTick(dt){const A=ARENA;if(!A)return;const t=G.time;
  for(let i=0;i<A.flames.length;i++){const f=A.flames[i];f.scale.set(1,0.85+Math.sin(t*13+i*1.7)*0.18,1);}
  for(let i=0;i<A.lights.length;i++){const L=A.lights[i];L.l.intensity=L.b*(0.88+Math.sin(t*9+i*2.3)*0.08)+A.flash*2.5;}
  for(let i=0;i<A.cloth.length;i++)A.cloth[i].rotation.y=Math.sin(t*1.4+i)*0.12;
  for(let i=0;i<A.lava.length;i++){const m=A.lava[i].material;m.opacity=(m.userData.o0??(m.userData.o0=m.opacity))*(0.8+0.2*Math.sin(t*2.2+i*0.9));}
  if(A.T.storm){A.boltT-=dt;A.flash=Math.max(0,A.flash-dt*4);if(A.boltT<=0){A.boltT=3+Math.random()*5;A.flash=1;if(A.bolt){A.bolt.visible=true;A.bolt.position.x=(PVA.c||0)+(Math.random()-0.5)*30;}
      later(0.12,()=>{if(ARENA&&ARENA.bolt)ARENA.bolt.visible=false;});later(0.25,()=>{if(ARENA)ARENA.flash=0.6;});sfx('zap');}
    hemi.intensity=0.85+A.flash*0.6;}}
/* ---------- schermata dei combattenti ---------- */
(function(){const d=document.createElement('div');d.id='pvpVs';d.hidden=true;document.body.appendChild(d);})();
const clsName=id=>{const c=CLASSES.find(k=>k.id===id);return c?c.name:'…';};
function vsRender(T){const me=MP.myPid,rows=Object.keys(PV.teams).map(Number),team=t=>rows.filter(p=>PV.teams[p]===t).sort((a,b)=>a-b);
  const card=pid=>{const R=MP.players.get(pid),cid=pid===me?G.cls.id:(R&&R.c),nm=pid===me?(PV.names[pid]||store.get('mpname','Tu')):(PV.names[pid]||pName(pid));
    return `<div class="vs-p${pid===me?' me':''}"><b>${esc(nm)}</b><span>${esc(clsName(cid))}</span></div>`;};
  $('pvpVs').innerHTML=`<div class="vs-arena"><small>${PV.mode==='1v1'?'1 contro 1':'2 contro 2'}</small><b>${esc(T.name)}</b></div>
    <div class="vs-row"><div class="vs-team t0">${team(0).map(card).join('')}</div><div class="vs-mid">VS</div><div class="vs-team t1">${team(1).map(card).join('')}</div></div>`;}
const _paA=pvpArena;
pvpArena=function(){const hw=PV.mode==='1v1'?9:14,L=-HALF+0.6,R=GATE_X-0.5,c=(L+R)/2;PVA={l:c-hw,r:c+hw,c};G.bounds.left=PVA.l;
  _paS();const T=buildArena(PV.mode,c,hw);
  pvpRound();clearTimeout(PV.rt);$('pvpCount').hidden=true;      // prima la presentazione, poi il conto alla rovescia
  const v=$('pvpVs');vsRender(T);v.hidden=false;v.classList.remove('on','out');void v.offsetWidth;v.classList.add('on');sfx('roar');
  let n=0;const iv=setInterval(()=>{if(++n>20||!PV.on){clearInterval(iv);return;}vsRender(T);},120);   // le classi degli altri arrivano dalla rete
  clearTimeout(PV.vsT);PV.vsT=setTimeout(()=>{v.classList.add('out');setTimeout(()=>{v.hidden=true;v.classList.remove('on','out');},450);if(PV.on)pvpRound();},2700);};
const _upA=update;update=function(dt){_upA(dt);if(G.pvp&&ARENA)arenaTick(dt);};
const _ecAr=enterCellar;enterCellar=function(){arenaOff();const v=$("pvpVs");if(v)v.hidden=true;return _ecAr.apply(this,arguments);};
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{buildArena,ARENAS1,ARENAS2,arena:()=>ARENA,vsRender,PV:()=>PV});
const _blAr=buildLevel;buildLevel=function(){if(!G.pvp&&(ARENA||!towerG.visible))arenaOff();return _blAr.apply(this,arguments);};
// il muro destro dell'arena blocca davvero (prima si poteva attraversare fino al cancello)
const _sbAr=stepBody;stepBody=function(b,h){_sbAr(b,h);if(G.pvp&&ARENA&&PVA&&PVA.r!=null){const R=PVA.r-b.w/2;if(b.x>R){b.x=R;b.hitWall=1;if(b.vx>0)b.vx=0;}}};

