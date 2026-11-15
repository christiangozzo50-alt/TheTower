/* =========================================================
   FILMATO INTRODUTTIVO v2
   Stesso racconto di prima (tre eroi difendono la Torre, vengono sopraffatti dal Capitano,
   finiscono in prigione e uno si libera), girato in tre modi:
     A "L'assedio"      — racconto epico in ordine, con stacchi e un momento per ogni eroe
     B "Senza stacchi"  — un'unica ripresa continua in mezzo alla battaglia
     C "Il ricordo"     — si parte dalle prigioni: ogni eroe ricorda il suo duello col Capitano
   Gli eroi sono mossi dalle animazioni vere del gioco (stessi attacchi, stesse abilità).
   Scelta della regia: #intro=A|B|C nell'indirizzo, oppure il valore salvato "intro-var".
   ========================================================= */
const fmVar=()=>{const m=/intro=([abc])/i.exec(location.hash);return (m&&m[1].toUpperCase())||window.__FM_VAR||store.get('intro-var','A');};

/* ---------- elementi a schermo in più: vignetta, lampo, titolo ---------- */
{const ci=$('cine');for(const id of ['cineFlash','cineVig']){const d=document.createElement('div');d.id=id;ci.insertBefore(d,ci.firstChild);}
  const t=document.createElement('div');t.id='cineTitle';$('cineBlack').after(t);}
function fmTitle(txt){const el=$('cineTitle');if(!txt){el.classList.remove('on');return;}el.textContent=txt;el.classList.add('on');}
function fmGrade(k){canvas.classList.remove('fm-mem','fm-cold','fm-epic');if(k)canvas.classList.add('fm-'+k);}

/* ---------- eroi: scheletro e dati come quelli del giocatore, scambiati al volo ---------- */
const FM_KEYS=[...RKEYS,'combo','comboT','hitStr','hitBack','atkCd','plunge','kbT'];
const FM_R0=()=>({x:0,y:0,z:0,vx:0,vy:0,face:1,onGround:true,dead:false,flipT:0,stretchT:0,landT:0,dashT:0,hurtT:0,invul:0,shieldT:0,rageT:0,bearT:0,dragon:null,chargeT:0,spinT:0,throwT:0,skidT:0,climbTurn:0,atk:null,walkT:0,lastStep:0,combo:0,comboT:0,hitStr:0,hitBack:false,atkCd:0,plunge:false,kbT:0});
function fmHero(id,i){const c=CLASSES.find(c=>c.id===id),R=Object.assign({pid:-30-i,hero:null,hkey:''},FM_R0());
  mpMakeHero(R,id,[c.weapon,1,0,''],SKINPICK[id]||0);
  return {i,id,c,R,col:HCOL[id],q:[],tm:[],calm:false,mode:'idle',home:0,leash:3.2,lock:0,rest:0,strQ:null,si:0,sn:i,resp:null,pose:null,poseT:0,yaw:null,yawK:0,trail:false,spinTick:0,ghostT:0,spdK:1,kills:0,on:true};}
// esegue fn come se l'eroe del filmato fosse quello del giocatore (così vale tutto il codice delle animazioni e degli effetti)
function fmAs(h,fn){const R=h.R,bk={};for(const k of FM_KEYS){bk[k]=P[k];P[k]=R[k];}
  const gH=hero,gW=G.weapon,gC=G.cls,gS=G.state,gSc=G.scene,gSo=G.solids,gT=G.timers,lc=window.__LABCALM,sp=S.atkSpd;
  hero=R.hero;G.weapon=R.wobj;G.cls=R.cls;G.state='play';G.scene='tower';G.solids=[];G.timers=h.tm;window.__LABCALM=!!h.calm;S.atkSpd=h.spdK||1;
  try{return fn();}catch(e){if(!fmAs.err){fmAs.err=1;console.warn('filmato',e);}}
  finally{for(const k of FM_KEYS){R[k]=P[k];P[k]=bk[k];}hero=gH;G.weapon=gW;G.cls=gC;G.state=gS;G.scene=gSc;G.solids=gSo;G.timers=gT;window.__LABCALM=lc;S.atkSpd=sp;}}
function fmDraw(h,dt){const R=h.R,H=R.hero;if(!H)return;H.root.visible=h.on;if(!h.on){fmRibOff(H);return;}
  if(h.pose){   // posa di regia (in ginocchio, alle sbarre, urlo...)
    const tg=tgBase(),W=WREST[h.c.weapon]||{},B=BREST[h.id]||BREST_DEF;Object.assign(tg,{shF:W.sh,elF:W.el,wrF:W.wr,shB:B.sh,elB:B.el,wrB:B.wr});
    h.poseT+=dt;h.pose(tg,h,h.poseT);H.root.position.set(R.x,R.y,R.z);H.root.rotation.z=0;H.model.rotation.y=R.face*Math.PI/2;H.model.scale.set(R.face,1,1);
    fmAs(h,()=>applyPose(H,tg,Math.min(1,dt*12),Math.min(1,dt*14)));
    for(const mm of H.mats){mm.emissive.copy(mm.userData.baseE);mm.emissiveIntensity=mm.userData.baseI;}fmRibOff(H);}
  else fmAs(h,()=>{const uB=updBear;updBear=()=>{};
    try{if(H.an&&H.an.wc&&H.arms){H.arms[0].wr.rotation.x-=H.an.wc;H.an.wc=0;}
      _updHeroVisual(dt);if(AV2()){spinModel(H);twoHands(H,anOf(H),dt);weaponFloor(H,anOf(H));deathRoot(H,anOf(H),dt);}}
    finally{updBear=uB;}});
  // scudo alzato per parare (senza l'abilità)
  if(h.blockT>0&&!h.pose&&!R.atk){const b=H.arms[1];b.sh.rotation.x=-1.25;b.el.rotation.x=-0.85;}
  // girato verso la cinepresa invece che di profilo
  h.yawK=approach(h.yawK,h.yaw!=null?1:0,dt*4);if(h.yaw!=null)h.yawV=h.yaw;
  if(h.yawK>0&&!(R.spinT>0)){const e=easeInOutCubic(h.yawK);H.model.rotation.y=lerp(R.face*Math.PI/2,h.yawV,e);H.model.scale.x=Math.abs(H.model.scale.x);}}
const _uhvFM=updHeroVisual;
updHeroVisual=function(dt){_uhvFM(dt);const C=G.cine;if(G.state==='cine'&&C&&C.v2){bubble.visible=false;for(const h of C.heroes)fmDraw(h,C.stop>0?0:dt);}};
const _ucFM=updCamera;
updCamera=function(dt){_ucFM(dt);const C=G.cine;if(G.state==='cine'&&C&&C.v2&&C.roll)camera.rotateZ(C.roll);};

// la scia dell'arma di un eroe del filmato: va spenta quando l'eroe smette di essere animato dal gioco
function fmRibOff(H,kill){const rib=H&&H.an&&H.an.rib;if(!rib)return;rib.m.visible=false;rib.s.length=0;if(kill){scene.remove(rib.m);rib.m.geometry.dispose();rib.m.material.dispose();H.an.rib=null;}}
/* ---------- pose di regia ---------- */
const fmPoseKneel=(tg,h,k)=>{const q=clamp(k/0.5,0,1),b=Math.sin(G.time*1.6+h.i);Object.assign(tg,{crouch:0.45*q,kF:2*q,hF:-0.6*q,kB:2.2*q,hB:-0.2*q,lean:0.35*q+b*0.02,head:(h.headUp?-0.05:0.5)*q+b*0.03,shF:lerp(tg.shF,0.3,q),elF:lerp(tg.elF,-1.4,q),shB:lerp(tg.shB,0.3,q),elB:lerp(tg.elB,-1.4,q)});};
const fmPoseGrip=(tg)=>{Object.assign(tg,{shF:-1.45,elF:-0.3,shB:-1.45,elB:-0.3,lean:0.1+Math.sin(G.time*30)*0.05,hF:-0.3,kF:0.4,hB:0.3,kB:0.3,crouch:0.06});};
const fmPoseWin=(tg)=>{Object.assign(tg,{shF:-2.9,elF:-0.2,head:-0.25,crouch:0.1,hF:-0.4,kF:0.5,hB:0.4,kB:0.35});};
const fmPoseRoar=(tg,h,k)=>{const q=clamp(k/0.18,0,1);Object.assign(tg,{shF:-2.8*q,elF:-0.2,shB:-2.8*q,elB:-0.2,head:-0.45*q,lean:-0.25*q,crouch:0.15,hF:-0.4,kF:0.5,hB:0.4,kB:0.4});if(Math.random()<0.7)burst(h.R.x+rand(-.4,.4),rand(0.3,2),h.col,1,1,2,-0.4,h.R.z);};

/* ---------- tempo: arresto sul colpo, rallentatore, cose da fare più tardi ---------- */
function fmStop(t){const C=G.cine;if(C)C.stop=Math.max(C.stop,t);}
function fmSlow(t){G.abilSlow=Math.max(G.abilSlow||0,t);}
function fmLater(t,fn){G.cine.tm.push({t,fn});}
function fmFlash(v){const C=G.cine;C.flash=Math.max(C.flash,v);}

/* ---------- nemici ---------- */
function fmMon(type,x,o){o=o||{};const b=burst;burst=()=>{};let e;try{e=spawnEnemy(type,{x});}finally{burst=b;}if(!e)return null;
  e.spawnT=0;e.onGround=true;e.y=0;e.vy=0;e.vx=0;e.state='move';e.hp=e.maxHp;e.parts.bar.visible=false;
  e.cm=Object.assign({mode:'walk',tx:x,spd:5,cz:0,kvx:0,stag:0,cd:rand(0.1,0.9),hp:type==='knight'?5:type==='slime'?2:3,guard:type==='knight'?2:0,rot:0,rv:0,atkT:0},o);
  if(o.sc){e.sc=o.sc;e.w*=o.sc;e.h*=o.sc;}
  if(o.face)e.face=o.face;
  if(o.y){e.y=o.y;e.onGround=false;e.cm.mode='air';e.cm.enter=1;}
  e.parts.root.visible=G.cine.set==='hall';G.cine.mons.push(e);return e;}
function fmRemove(e){if(e.cm.gone)return;e.cm.gone=1;e.dead=true;scene.remove(e.parts.root);disposeObj(e.parts.root);G.corpses=G.corpses.filter(c=>c.e!==e);}
const fmReach=e=>(e.type==='guard'?2.15:e.type==='slime'?1.25:1.75)*(e.sc||1);
function fmSplat(x,z,col,k){const C=G.cine;if(!C||C.set!=='hall'||C.splats.length>46)return;
  const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.75,depthWrite:false})),r=rand(0.15,0.4)*k;
  m.scale.set(r*rand(1,2),1,r);m.position.set(x,0.03+Math.random()*0.004,z);cineHall.g.add(m);C.splats.push(m);}
function fmShatter(e){const cols=e.parts.mats.slice(0,4).map(m=>m.color?m.color.getHex():e.color),n=Math.round(11*(e.sc||1)),z=e.cm.cz||0;
  for(let i=0;i<n;i++){const m=new THREE.Mesh(chunkGeo,chunkMat(cols[i%cols.length]));m.scale.setScalar(rand(0.55,1.3)*(e.sc||1));m.position.set(e.x+rand(-.3,.3),e.y+rand(0.2,e.h),z+rand(-.3,.3));scene.add(m);
    G.chunks.push({m,vx:e.lastDir*rand(2,8)+rand(-2,2),vy:rand(4,11),vz:rand(-2.5,2.5),rx:rand(-14,14),rz:rand(-14,14),t:0});}
  burst(e.x,e.y+e.h/2,0xf3ead7,18,7,3,1,z);}
function fmKill(e){const C=G.cine,m=e.cm;if(e.dead)return;e.dead=true;m.mode='dead';const bony=e.type==='guard'||e.type==='archer';
  burst(e.x,e.y+e.h*0.5,e.color,10,5,3,1,m.cz||0);
  if(bony&&m.killHeavy){sfx('bones');fmShatter(e);fmRemove(e);return;}
  sfx(bony?'bones':'die');G.corpses.push({e,t:0,vy:0});C.bodies.push(e);
  if(C.bodies.length>10)fmRemove(C.bodies.shift());}
// colpo a un nemico: sangue, spinta, lancio in aria, arresto sul colpo. Niente numeri: è un film
function fmHit(e,dir,o){const m=e.cm;o=o||{};if(e.dead||m.gone||m.bg||m.dying&&m.mode!=='air')return false;
  if(e.type==='knight'&&m.guard>0&&!o.unblock&&e.face===-dir&&m.mode!=='air'&&!(e.stunT>0)){   // il cavaliere nero para i colpi leggeri che arrivano da davanti
    m.guard--;e.flash=0.05;m.kvx=dir*(m.boss?1.2:2.5);if(!m.boss&&m.mode==='walk'){m.mode='stag';m.stag=0.16;}sfx('block');burst(e.x+e.face*0.6*e.sc,e.y+1.2*e.sc,0xdfe5ec,8,4,1,1,m.cz||0);fmStop(0.03);return true;}
  e.flash=0.1;e.flinch=0.2;e.lastDir=dir;m.hp-=o.dmg||1;
  const bc=BLOOD[e.type]||[0xb01020,0x6a0812],x=e.x-dir*0.15,y=e.y+e.h*rand(0.45,0.7),z=m.cz||0,n=o.heavy?20:10;
  burst(x,y,0xffffff,o.heavy?8:4,6,2,1,z);burst(x,y,bc[0],n,7,3,1.3,z);burst(x,y,bc[1],Math.round(n*0.6),5,2,1.6,z);fmSplat(e.x+dir*rand(0.3,1.4),z+rand(-0.7,0.7),bc[1],o.heavy?1.5:1);
  sfx((WSND[o.wt]||{}).hit||'hit');if(o.heavy)sfx('crit');
  if(m.boss){m.kvx=dir*(o.bossKb||(o.kb||6)*0.3);fmStop(o.heavy?0.07:0.04);shake(o.heavy?0.2:0.1);return true;}
  if(m.mode==='atk'){m.mode='walk';e.warn=0;m.wind=0;m.onStrike=null;e.state='move';}   // il colpo interrompe la carica del nemico
  const dead=m.hp<=0;let kb=(o.kb||6)*(dead?1.3:1),ky=o.ky||0;if(dead&&!ky)ky=o.heavy?7:4.5;if(dead){m.dying=1;m.killHeavy=!!o.heavy;}
  m.kvx=dir*kb;m.stag=Math.max(0.22,o.hs||0.2);m.cd=Math.max(m.cd,0.6);
  if(ky){e.vy=Math.max(e.vy||0,ky);e.y+=0.02;e.onGround=false;m.mode='air';m.enter=0;m.rv=-dir*(dead?rand(5,9):2);}
  else if(m.mode!=='air')m.mode='stag';
  if(o.stun&&!dead){e.stunT=o.stun;m.stag=Math.max(m.stag,o.stun);}
  fmStop(dead?(o.heavy?0.09:0.06):(o.heavy?0.06:0.035));shake(dead?0.2:o.heavy?0.15:0.06);
  if(dead&&o.by)o.by.kills++;
  return true;}
function fmAoe(x,r,o){let n=0;for(const e of G.cine.mons){if(e.dead||e.cm.gone||e.y>3)continue;const dx=e.x-x;if(Math.abs(dx)<r+e.w/2&&fmHit(e,dx>=0?1:-1,o))n++;}return n;}
// onda che corre sul pavimento ai due lati
function fmWave(x,col,n,z){for(let i=1;i<=n;i++)fmLater(i*0.08,()=>{for(const s of [-1,1])fxSpikes(x+s*i*1.5,0,z||0,col,4,0.6,0.7+i*0.2,0.5);});}
function fmMonUpd(e,dt){const m=e.cm;if(e.dead||m.gone)return;e.flash=(e.flash||0)-dt;e.flinch=(e.flinch||0)-dt;if(e.stunT>0)e.stunT-=dt;m.cd-=dt;
  if(m.mode==='air'){e.vy-=34*dt;e.y+=e.vy*dt;e.x+=m.kvx*dt;m.rot+=m.rv*dt;e.vx=0;e.state=m.leap?'wind':'move';if(m.leap)e.warn=1;
    if(e.y<=0&&e.vy<0){e.y=0;e.vy=0;e.onGround=true;burst(e.x,0.15,0xb9ad98,10,4,2,1,m.cz||0);
      if(m.dying){fmKill(e);return;}
      m.rot=0;m.rv=0;
      if(m.leap){const f=m.leap;m.leap=null;m.kvx=0;m.tx=e.x;m.mode=m.hold?'hold':'walk';e.warn=0;m.showT=0.55;f(e);}
      else if(m.enter){m.enter=0;m.kvx=0;m.mode='walk';}
      else{m.mode='stag';m.stag=Math.max(m.stag,0.4);m.kvx*=0.4;}}
    return;}
  if(m.kvx){e.x+=m.kvx*dt;m.kvx*=Math.pow(0.004,dt);if(Math.abs(m.kvx)<0.3)m.kvx=0;}
  if(m.showT>0){m.showT-=dt;e.state='strike';e.vx=0;return;}
  if(m.mode==='stag'){m.stag-=dt;e.vx=0;e.state='move';if(m.stag<=0)m.mode=m.hold?'hold':'walk';return;}
  if(m.mode==='atk'){m.atkT+=dt;e.vx=0;const W=m.windD||0.45;
    if(m.atkT<W){e.state='wind';e.warn=m.atkT/W;m.wind=1;}
    else if(m.atkT<W+0.26){if(m.wind){m.wind=0;e.warn=0;m.kvx=e.face*(m.lungeV!=null?m.lungeV:4.5);sfx(e.type==='guard'?'thrust':'heavy');const f=m.onStrike;m.onStrike=null;if(f)f(e);}e.state='strike';}
    else if(m.atkT<W+0.26+(m.restD||0.35))e.state=e.type==='knight'?'rest':'move';
    else{m.mode=m.hold?'hold':'walk';m.cd=rand(1.0,1.9);}
    return;}
  if(m.mode==='hold'){e.vx=0;e.state='move';if(m.look!=null)e.face=Math.sign(m.look-e.x)||e.face;return;}
  const d=m.tx-e.x;e.vx=Math.abs(d)>0.08?Math.sign(d)*Math.min(m.spd,Math.abs(d)*6):0;e.x+=e.vx*dt;
  if(Math.abs(e.vx)>0.3)e.face=Math.sign(e.vx);else if(m.look!=null)e.face=Math.sign(m.look-e.x)||e.face;e.state='move';
  if(m.tz!=null)m.cz=approach(m.cz||0,m.tz,dt*2.5);
  if(m.exit&&Math.abs(d)<0.3)fmRemove(e);}
cineAfterSync=function(){const C=G.cine;if(!C)return;for(const e of C.mons){const m=e.cm;if(m.gone)continue;const r=e.parts.root;r.position.z=m.cz||0;if(!e.dead&&m.mode==='air'&&m.rot)r.rotation.z=m.rot;}};
// il nemico carica il colpo e poi colpisce; onStrike decide cosa succede
function fmEAtk(e,h,onStrike,windD){const m=e.cm;m.mode='atk';m.atkT=0;m.tgt=h;m.onStrike=onStrike;m.windD=windD||0;if(h)e.face=Math.sign(h.R.x-e.x)||e.face;}
function fmBlockFx(h,e){const R=h.R,s=Math.sign(e.x-R.x)||1,m=e.cm;burst(R.x+s*0.7,R.y+1.35,0xfff2b0,18,6,1,1,R.z);burst(R.x+s*0.7,R.y+1.35,0xffffff,6,4,1,1,R.z);sfx('block');
  if(!m.boss){m.kvx=s*3.5;m.mode='stag';m.stag=0.55;}R.vx=-s*(m.boss?5:1.8);fmStop(0.05);shake(m.boss?0.3:0.12);h.rest=0.05;}
function fmHurt(h,dir,pow){const R=h.R;R.hurtT=0.25;R.hitStr=pow;R.hitBack=dir===R.face;R.vx=dir*6*pow;R.atk=null;h.strQ=null;h.resp=null;h.rest=0.3;h.goX=null;
  burst(R.x,R.y+1.3,0xb01020,12,6,2,1.3,R.z);burst(R.x,R.y+1.3,0xffffff,5,5,1,1,R.z);sfx('hurt');fmStop(0.07);shake(0.22);}
// l'eroe va al tappeto
function fmDown(h,dir,pow){const R=h.R;R.dead=true;R.atk=null;R.dragon=null;R.spinT=0;R.chargeT=0;R.shieldT=0;R.rageT=0;R.hitBack=dir===R.face;R.vx=dir*7*pow;R.vy=5.5*pow;R.y+=0.02;R.onGround=false;
  h.mode='idle';h.strQ=null;h.resp=null;h.goX=null;h.lock=99;burst(R.x,R.y+1.3,0xb01020,22,8,3,1.3,R.z);burst(R.x,R.y+1.3,0xffffff,10,7,2,1,R.z);sfx('hurt');sfx('crit');fmStop(0.12);shake(0.5);}
// reazione dell'eroe al colpo in arrivo: dipende dal suo stile
function fmReact(h,e){const R=h.R;if(h.lock>0||R.dead)return;const r=Math.random(),id=h.id;let k;
  if(h.forceHit){h.forceHit=0;k='hit';}
  else if(R.atk&&R.atk.t<R.atk.wind+R.atk.act)k=id==='cavaliere'?'block':'hit';
  else k=id==='cavaliere'?(r<0.7?'block':r<0.9?'stuff':'hit'):id==='berserker'?(r<0.5?'stuff':r<0.75?'hit':'dodge'):(r<0.6?'dodge':r<0.9?'stuff':'hit');
  h.resp={e,k};}
function fmEStrike(e){const h=e.cm.tgt,R=h&&h.R;if(!h||R.dead||!h.on)return;const dx=R.x-e.x,side=Math.sign(dx)||1;
  if(Math.abs(dx)>fmReach(e)+0.75||R.y>1.6||side!==e.face)return;      // a vuoto
  if(R.spinT>0||R.chargeT>0||R.dragon||R.invul>0)return;
  if(R.shieldT>0||h.blockT>0){fmBlockFx(h,e);if(h.mode==='brawl'&&!h.lock){h.tgt=e;fmString(h,true);}return;}
  h.resp=null;fmHurt(h,side,e.cm.pow||0.8);}

/* ---------- attacchi degli eroi: le mosse vere del gioco ---------- */
function fmAtk(h,mv,o){o=o||{};const R=h.R;for(const x of G.cine.heroes)x.trail=x===h;
  fmAs(h,()=>{P.atk=null;if(o.combo){P.combo=o.combo-1;P.comboT=1;}else P.comboT=0;if(o.spd)S.atkSpd=o.spd;startAttack(true,mv);
    if(o.fin&&P.atk){P.atk.fin=true;P.atk.act*=1.15;P.atk.rec*=1.2;}});
  const A=R.atk;if(A){A.fm=o;A.hitSet=new Set();}return A;}
function fmSweep(h,A){const R=h.R,T=WTYPES[h.c.weapon],M=MOVES[A.mv],L=T.hit[1],o=A.fm;let x1,x2,y1,y2;
  if(M.box){x1=M.box[0]*L;x2=M.box[1]*L;y1=M.box[2];y2=M.box[3];}else{x1=T.hit[0];x2=T.hit[1];y1=T.hit[2];y2=T.hit[3];}
  if(R.face<0){const a=-x2;x2=-x1;x1=a;}x1+=R.x;x2+=R.x;y1+=R.y;y2+=R.y;const heavy=A.fin||A.anim==='heavy'||o.heavy;
  for(const e of G.cine.mons){if(e.dead||e.cm.gone||A.hitSet.has(e)||Math.abs((e.cm.cz||0)-R.z)>1.3)continue;if(e.x+e.w/2<x1||e.x-e.w/2>x2||e.y+e.h<y1||e.y>y2)continue;A.hitSet.add(e);
    const dir=A.mv==='na'?(e.x>=R.x?1:-1):R.face;
    fmHit(e,dir,{dmg:o.dmg!=null?o.dmg:(heavy?2:1)+(A.fin?1:0),kb:(M.kb!=null?M.kb:T.kb)*(A.fin?1.6:1),ky:M.ky||(A.fin?7:0),hs:M.hs||(A.fin?0.45:0.18),heavy,unblock:M.unblock||A.fin||o.unblock||A.mv==='ul',wt:h.c.weapon,by:h,bossKb:o.bossKb});
    if(o.onHit)o.onHit(e);}}
const FM_STR={cavaliere:[[['nl'],['nl'],['nl',{fin:1}]],[['nl'],['ul']],[['dl'],['nl',{fin:1}]],[['sl'],['nl']]],
  berserker:[[['nl'],['nl',{fin:1}]],[['ul']],[['dl'],['nl',{fin:1}]]],
  lanciere:[[['nl'],['nl'],['sl']],[['nl'],['ul']],[['sl'],['nl',{fin:1}]]]};
function fmString(h,first){const L=FM_STR[h.id];if(first)h.strQ=L[0];else{h.sn=(h.sn+1)%L.length;h.strQ=L[h.sn];}h.si=0;fmNext(h);}
function fmNext(h){const R=h.R,t=h.tgt,s=h.strQ&&h.strQ[h.si];if(!s||!t||t.dead||t.cm.gone){h.strQ=null;h.rest=0.15;return;}
  R.face=Math.sign(t.x-R.x)||R.face;const last=h.si===h.strQ.length-1;h.si++;
  fmAtk(h,s[0],Object.assign({combo:h.si-1,chain:!last,done:hh=>{if(last){hh.strQ=null;hh.rest=rand(0.15,0.35);}}},s[1]||{}));}
function fmJump(h,vy,vx){const R=h.R;R.vy=vy;R.vx=vx||0;R.onGround=false;R.y+=0.02;}
function fmGo(h,x,spd,fn){h.goX=x;h.spd=spd||8.4;h.onGo=fn||null;}

/* ---------- le abilità speciali, come in gioco ---------- */
function fmAbil(h,n,lock){const ab=h.c[SLOT[n].k],C=G.cine;h.lock=Math.max(h.lock,lock==null?0.5:lock);h.strQ=null;h.resp=null;h.goX=null;
  fmAs(h,()=>{G.inAbil=true;try{abilityFx(n,ab);}finally{G.inAbil=false;}});absnd(n);$('abilSplash').classList.remove('on','big');
  cineCard(h.i,ab.name);C.cardT=1.7;return ab;}
// Cavaliere — Egida specchio: bolla che ferma tutto e rimanda indietro le sfere magiche
function fmEgida(h,dur){fmAbil(h,1,0.3);h.R.shieldT=dur||2;}
// Cavaliere — Ariete d'acciaio: carica dietro lo scudo
function fmAriete(h,dir,dist,o){fmAbil(h,2,0.7);const R=h.R;R.face=dir;R.atk=null;h.chargeV=dist/0.42;R.chargeT=0.42;R.invul=0.5;h.chargeSet=new Set();h.chargeO=o||{};sfx('dash');}
// Cavaliere — Fortezza vivente: pianta lo scudo, onda d'urto che respinge e stordisce
function fmFortezza(h){fmAbil(h,3,0.8);const R=h.R;R.atk=null;fmLater(0.14,()=>{R.landT=0.16;shake(0.5);sfx('slam');burst(R.x,0.3,0x7fc8ff,40,10,1,0.4,R.z);fxRing(R.x,0.06,R.z,0x7fc8ff,5.5,0.6);
    fmAoe(R.x,4.8,{dmg:1,kb:13,ky:5,stun:1.6,heavy:1,unblock:1,by:h});fmWave(R.x,0x7fc8ff,3,R.z);});}
// Berserker — Furia sanguinaria
function fmFuria(h){fmAbil(h,1,0.75);const R=h.R;R.rageT=7;h.spdK=1.45;h.pose=fmPoseRoar;h.poseT=0;sfx('roar');fmLater(0.7,()=>{if(h.pose===fmPoseRoar)h.pose=null;});}
// Berserker — Turbine di sangue
function fmTurbine(h,v){fmAbil(h,2,1.5);const R=h.R;R.atk=null;R.spinT=1.4;h.spinTick=0;h.spinV=v||0;}
// Berserker — Spaccaterra: tre colpi a terra, onde sempre più grandi
function fmSpaccaterra(h,o){o=o||{};fmAbil(h,3,1.6);const R=h.R;
  for(let i=0;i<3;i++)fmLater(0.12+i*0.44,()=>{if(R.dead)return;fmAtk(h,'nl',{spd:1.6,fin:i===2,hit:()=>{R.landT=0.16;shake(0.3+i*0.2);sfx('slam');const x=R.x+R.face*1.1;
      burst(x,0.1,0xb9ad98,20+i*10,6+i*2,2,1,R.z);fxRing(x,0.06,R.z,h.col,2.5+i*1.3,0.5);fxSpikes(x,0,R.z,0x8a7a6a,6+i*2,1.2+i*0.9,0.8+i*0.3,0.8);fmWave(x,0x8a7a6a,1+i,R.z);
      if(o.pre)o.pre(i,x);fmAoe(x,2.6+i*1.3,{dmg:1+i,kb:8,ky:7+i*2.5,hs:0.5,heavy:1,unblock:1,by:h,wt:'ascia'});if(o.onSlam)o.onSlam(i,x);}});});}
// Lanciere — Volo del drago
function fmDrago(h,vx){fmAbil(h,1,1.6);const R=h.R;R.atk=null;R.dragon='up';R.vy=21;R.vx=vx||0;R.onGround=false;R.y+=0.02;burst(R.x,0.2,0x7ff0e4,16,5,2,1,R.z);sfx('jump');}
function fmDragonHit(h){const R=h.R;R.dragon=null;R.vx=0;shake(0.6);sfx('slam');burst(R.x,0.2,0x7ff0e4,30,9,3,1,R.z);burst(R.x,0.2,0xb9ad98,18,7,2,1,R.z);fxRing(R.x,0.06,R.z,0x7ff0e4,4.6,0.5);fxSpikes(R.x,0,R.z,0x7ff0e4,7,1.6,1.2,0.8);
  fmAoe(R.x,4.6,{dmg:3,kb:10,ky:9,hs:0.5,heavy:1,unblock:1,by:h,wt:'lancia'});fmWave(R.x,0x7ff0e4,2,R.z);h.lock=Math.min(h.lock,0.35);}
// Lanciere — Lancia fulminea: lancia di luce che trapassa tutti sulla sua strada
function fmFulminea(h,dir,len,o){o=o||{};fmAbil(h,2,0.6);const R=h.R;R.face=dir;R.atk=null;R.throwT=0.32;sfx('thrust');
  fmLater(0.1,()=>{const a=[R.x+dir*0.8,R.y+1.5,R.z],b=o.to||[R.x+dir*len,R.y+1.5,R.z],L=Math.hypot(b[0]-a[0],b[1]-a[1]),dur=L/32;fxShot(a,b,0x7ff0e4,dur,1.9,o.end);G.cine.shot={a,b,t:0,dur};
    if(!o.to)for(const e of G.cine.mons){if(e.dead||e.cm.gone||e.cm.boss)continue;const d=(e.x-a[0])*dir;if(d>0&&d<len&&e.y<2.2)fmLater(d/32,()=>fmHit(e,dir,{dmg:3,kb:9,ky:4,hs:0.4,heavy:1,unblock:1,wt:'lancia',by:h}));}});}
// Lanciere — Diluvio di lance
function fmDiluvio(h,xs){fmAbil(h,3,0.9);const R=h.R;R.throwT=0.32;sfx('thrust');
  xs.forEach((x,i)=>fmLater(0.3+0.09*i,()=>{fxShot([x+1.2,13,R.z],[x,0.1,R.z],0x7ff0e4,0.24,1.7,()=>{fxSpikes(x,0,R.z,0x7ff0e4,4,0.5,1.4,0.6);fxRing(x,0.06,R.z,0x7ff0e4,1.6,0.4);sfx('pierce');shake(0.12);
      fmAoe(x,1.3,{dmg:3,kb:3,ky:6,heavy:1,unblock:1,wt:'lancia',by:h});});}));}

/* ---------- aggiornamento di un eroe: tempi, attacco in corso, movimento ---------- */
function fmHeroUpd(h,dt){const R=h.R,C=G.cine;if(!h.on)return;
  for(const k of ['flipT','stretchT','landT','hurtT','invul','shieldT','rageT','throwT','skidT','comboT'])if(R[k]>0)R[k]=Math.max(0,R[k]-dt);
  if(h.rest>0)h.rest-=dt;if(h.lock>0&&h.lock<90)h.lock-=dt;if(h.blockT>0)h.blockT-=dt;if(!(R.rageT>0))h.spdK=1;
  for(const k of h.tm){k.t-=dt;if(k.t<=0&&!k.done){k.done=true;fmAs(h,k.fn);}}if(h.tm.some(k=>k.done))h.tm=h.tm.filter(k=>!k.done);
  const A=R.atk;
  if(A&&A.fm){A.t+=dt;const o=A.fm;
    if(!A.fmFired&&A.t>=A.wind){A.fmFired=true;fmAs(h,()=>wsfx(A.fin));const M=MOVES[A.mv],An=ANIM[A.anim];
      if(R.onGround)R.vx+=R.face*(o.lunge!=null?o.lunge:(M.lunge!=null?M.lunge:(An.lunge||0)));
      if(o.hit)o.hit(h,A);}
    if(A.fmFired&&!o.hit&&A.t<A.wind+A.act+0.03)fmSweep(h,A);
    if(A.t>=A.wind+A.act+A.rec*(o.chain?0.4:1)){R.atk=null;if(o.done)o.done(h);}}
  if(R.dashT>0){R.dashT-=dt;R.vx=(h.dashDir||R.face)*22;R.vy=0;}
  else if(R.chargeT>0){R.chargeT-=dt;R.vx=R.face*h.chargeV;h.ghostT-=dt;if(h.ghostT<=0){h.ghostT=0.045;fmAs(h,()=>spawnGhost(0x7fc8ff));}
    for(const e of C.mons){if(e.dead||e.cm.gone||h.chargeSet.has(e)||Math.abs(e.x-R.x)>1.3*(e.sc||1)||e.y>2)continue;h.chargeSet.add(e);const f=h.chargeO.onHit;
      if(f&&f(e)===false)continue;fmHit(e,R.face,{dmg:2,kb:13,ky:6.5,hs:0.5,heavy:1,unblock:1,wt:'pugni',by:h,bossKb:15});}
    if(R.chargeT<=0){R.vx=R.face*5;const f=h.chargeO.done;if(f)f(h);}}
  else if(h.goX!=null&&!R.atk&&R.onGround&&!R.dead){const d=h.goX-R.x;
    if(Math.abs(d)<0.14){h.goX=null;R.vx=0;const f=h.onGo;h.onGo=null;if(f)f(h);}else{R.face=Math.sign(d);R.vx=approach(R.vx,Math.sign(d)*Math.min(h.spd||8.4,Math.abs(d)*9+1.5),70*dt);}}
  else if(R.onGround&&!(R.spinT>0))R.vx=approach(R.vx,0,(R.dead?14:45)*dt);
  if(R.spinT>0){R.spinT-=dt;h.spinTick-=dt;R.vx=R.face*(h.spinV||0);if(Math.random()<0.6)burst(R.x+rand(-1.6,1.6),R.y+rand(0.5,1.6),0xff4a2e,1,2,1,0,R.z);
    if(h.spinTick<=0){h.spinTick=0.18;sfx('swing');fmAoe(R.x,2.7,{dmg:1,kb:5,ky:4.5,hs:0.3,unblock:0,wt:'ascia',by:h,bossKb:3.2});}
    if(R.spinT<=0)h.lock=Math.min(h.lock,0.15);}
  if(!R.onGround){R.vy-=42*dt;if(R.dragon==='up'&&R.vy<=2){R.dragon='down';R.vy=-34;}
    if(R.dragon){h.ghostT-=dt;if(h.ghostT<=0){h.ghostT=0.045;fmAs(h,()=>spawnGhost(0x7ff0e4));}}
    R.y+=R.vy*dt;
    if(R.y<=0){R.y=0;R.vy=0;R.onGround=true;R.landT=0.16;if(R.dragon==='down')fmDragonHit(h);else burst(R.x,0.1,0xb9ad98,8,4,1.5,1,R.z);const f=h.onLand;h.onLand=null;if(f)f(h);}}
  R.x+=R.vx*dt;
  const cap=C.cap;if(cap&&!cap.dead&&!cap.cm.gone&&cap.y<1&&R.y<2&&!R.dead){const d=R.x-cap.x,mn=cap.w*0.5+0.5;if(Math.abs(d)<mn){R.x=cap.x+(Math.sign(d)||-1)*mn;if(R.chargeT<=0)R.vx=0;}}}
// combattimento libero: i nemici si fanno sotto uno per lato, l'eroe para, schiva, incassa e risponde con le sue combo
function fmBrawl(h){const R=h.R;if(R.dead||h.lock>0||!h.on)return;
  const live=h.q.filter(e=>!e.dead&&!e.cm.gone&&!e.cm.dying);
  for(const s of [-1,1]){const side=live.filter(e=>(Math.sign(e.x-R.x)||e.cm.side||1)===s&&e.cm.mode==='walk'&&!e.cm.hold).sort((a,b)=>Math.abs(a.x-R.x)-Math.abs(b.x-R.x));
    side.forEach((e,k)=>{const m=e.cm;m.look=R.x;if(k===0){m.tx=R.x+s*fmReach(e);m.tz=0;
        if(Math.abs(e.x-m.tx)<0.25&&m.cd<=0&&R.onGround&&!(R.hurtT>0)&&!live.some(o=>o.cm.mode==='atk')){fmEAtk(e,h,fmEStrike);fmReact(h,e);}}
      else{m.tx=R.x+s*(fmReach(e)+1.5+k*1.25);m.tz=(k%2?-1:1)*0.7;}});}
  if(R.atk||!R.onGround||R.hurtT>0||R.dashT>0)return;
  const rs=h.resp;
  if(rs){const e=rs.e,m=e.cm;
    if(e.dead||m.mode!=='atk')h.resp=null;
    else if(rs.k==='stuff'){h.resp=null;h.tgt=e;fmString(h,true);return;}
    else if(rs.k==='dodge'){if(m.atkT>(m.windD||0.45)-0.14){const s=Math.sign(R.x-e.x)||1;h.resp=null;R.face=-s;fmJump(h,5.2,s*7);sfx('dash');h.onLand=hh=>{hh.tgt=e;hh.strQ=[['sl']];hh.si=0;fmNext(hh);};}return;}
    else if(rs.k==='block'){R.face=Math.sign(e.x-R.x)||R.face;h.blockT=0.25;return;}
    else return;}
  if(h.rest>0)return;
  if(h.strQ&&h.si<h.strQ.length){fmNext(h);return;}
  let t=h.tgt;if(!t||t.dead||t.cm.gone||t.cm.dying||t.cm.mode==='air'||Math.abs(t.x-R.x)>7){t=live.filter(e=>e.cm.mode!=='air').sort((a,b)=>Math.abs(a.x-R.x)-Math.abs(b.x-R.x))[0];h.tgt=t;}
  if(!t){if(Math.abs(R.x-h.home)>0.8)h.goX=h.home;return;}
  const d=t.x-R.x,rc=WTYPES[h.c.weapon].hit[1]*0.82;R.face=Math.sign(d)||R.face;
  if(Math.abs(d)>rc){const gx=clamp(t.x-Math.sign(d)*rc*0.85,h.home-h.leash,h.home+h.leash);if(Math.abs(gx-R.x)>0.3)h.goX=gx;return;}
  h.goX=null;fmString(h);}

/* ---------- scene: salone e prigioni ---------- */
function fmSet(C,set){C.set=set;const hall=set==='hall';MUS.mood=hall?'boss':'cellar';cineHall.g.visible=hall;cinePrison.g.visible=!hall;for(const e of C.mons)if(!e.cm.gone)e.parts.root.visible=hall;bubble.visible=false;G.snapCam=true;C.cut=true;}
function fmClearMons(C){for(const e of C.mons)fmRemove(e);C.mons.length=0;C.bodies.length=0;for(const s of C.splats){cineHall.g.remove(s);s.material.dispose();}C.splats.length=0;}
function fmResetHero(h,x,face){const H=h.R.hero;fmRibOff(H);Object.assign(h.R,FM_R0(),{x,face:face||1});if(H.an){if(H.an.drop)weaponBack(H,H.an);H.an.deathT=null;}H.root.rotation.z=0;
  Object.assign(h,{q:[],tm:[],mode:'idle',lock:0,rest:0,strQ:null,resp:null,goX:null,pose:null,poseT:0,yaw:null,spdK:1,on:true,onLand:null,onGo:null,blockT:0,tgt:null,calm:false});}
// le tre gabbie: gli eroi dentro, in ginocchio. dropped=false: le gabbie calano dall'alto
function fmPrison(C,dropped){fmSet(C,'prison');fmClearMons(C);C.cap=null;fmGrade(C.var==='C'?'cold':null);C.dimT=1;C.dim=1;C.roll=0;
  C.heroes.forEach((h,i)=>{fmResetHero(h,(i-1)*4,1);h.pose=fmPoseKneel;h.poseT=1;h.yaw=0.45;h.yawK=1;
    if(!h.cage)h.cage=makeCineCage(h.R.x,cinePrison.g);h.cage.t=dropped?9:-0.3-i*0.35;h.cage.landed=!!dropped;h.cage.g.position.y=dropped?0:14;});}
function fmCages(C,dt){for(const h of C.heroes){const c=h.cage;if(!c||c.broken)continue;c.t+=dt;const y=c.t<0?14:Math.max(0,14-c.t*c.t*38);c.g.position.y=y;
    if(y===0&&!c.landed){c.landed=true;shake(0.45);sfx('slam');burst(h.R.x,0.2,0xb9ad98,26,6,2);}}}

/* ---------- cinepresa ---------- */
const fmV=(a,b,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k),lerp(a[2],b[2],k)];
function fmCamApply(C,s,rdt){   // s={p,l,fov,roll,k,hh,cut}
  const cut=s.cut||C.cut||s.id!==C.shotId;C.cut=false;
  if(s.id!==C.shotId){C.shotId=s.id;if(s.flashCut){const f=$('cineCut');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');}}
  const k=cut?1:damp(rdt,s.k||6);C.camP.lerp(new THREE.Vector3(...s.p),k);C.camL.lerp(new THREE.Vector3(...s.l),k);
  C.fovV=cut?(s.fov||38):lerp(C.fovV,s.fov||38,damp(rdt,s.k||5));C.roll=cut?(s.roll||0):lerp(C.roll,s.roll||0,damp(rdt,4));
  const hh=reduced?0:(s.hh==null?0.035:s.hh),tm=performance.now()*0.001;   // cinepresa a mano: un respiro leggero
  C.cp.set(C.camP.x+Math.sin(tm*1.3)*hh,C.camP.y+Math.sin(tm*1.9+1)*hh*0.7,C.camP.z);C.cl.set(C.camL.x+Math.sin(tm*1.1+2)*hh*0.5,C.camL.y+Math.cos(tm*1.6)*hh*0.4,C.camL.z);G.snapCam=true;
  // schermo più stretto di 16:9: si allarga l'angolo in verticale così l'inquadratura resta la stessa, dentro bande nere più alte
  const fit=Math.max(1,(16/9)/camera.aspect),fv=fit>1.02?Math.min(150,2*Math.atan(Math.tan(C.fovV*Math.PI/360)*fit)*180/Math.PI):C.fovV;
  if(Math.abs(camera.fov-fv)>0.01){camera.fov=fv;camera.updateProjectionMatrix();}
  const bar=fit>1.02?Math.round((innerHeight-innerWidth*9/16)/2):0;if(bar!==C.bar){C.bar=bar;$('cine').style.setProperty('--fmbar',bar+'px');}}

/* =========================================================
   LE TRE REGIE — ognuna: setup(C), cam(C,t), eventi a tempo, tChoice
   ========================================================= */
const FM_DIR={};
function fmDoors(C,tL,tR,rdt){for(const d of cineHall.doors){const tt=C.t-(d.s<0?tL:tR);d.pv.rotation.y=tt>0?lerp(d.pv.rotation.y,d.k*d.s*-1.6,Math.min(1,rdt*7)):0;}}
function fmWaveIn(C,h,side,list,o){o=o||{};return list.map((ty,i)=>{const e=fmMon(ty,side*(28.5+i*1.5),Object.assign({side,spd:o.spd||6,tx:side*(o.tx||16+i*1.3)},o.cm||{}));if(e&&h)h.q.push(e);return e;});}
function fmCapSpawn(C,x,o){C.cap=fmMon('knight',x,Object.assign({sc:2.3,boss:1,hp:99,guard:99,spd:2.6,pow:1.2,cd:99},o));return C.cap;}
function fmCapLeap(e,tx,T,cb){const m=e.cm;m.mode='air';m.enter=0;m.leap=cb;e.onGround=false;e.y=0.02;e.vy=34*T/2;m.kvx=(tx-e.x)/T;m.rot=0;m.rv=0;e.face=Math.sign(tx-e.x)||e.face;sfx('roar');}
function fmSlam(C,x,pow){shake(1);sfx('boom');fxRing(x,0.06,0,0xff4a2e,9*pow,0.8);fxRing(x,1.2,0,0xffffff,5*pow,0.5,true,0);burst(x,0.3,0xb9ad98,60,12,3);fxSpikes(x,0,0,0x5a5260,10,2.4,1.4,0.9);fmWave(x,0x5a5260,3);fmFlash(0.5);}
// lo stregone lancia una sfera: se l'eroe ha l'Egida, torna indietro
function fmOrb(C,e,h){fmEAtk(e,h,()=>{const R=h.R,s=Math.sign(R.x-e.x)||1,a=[e.x+s*0.7,1.75,0],b=[R.x-s*1.25,1.3,0];sfx('orb');
    fxShot(a,b,0xa77be0,Math.abs(b[0]-a[0])/15,1.5,()=>{if(R.shieldT>0){sfx('block');burst(b[0],b[1],0x7fc8ff,24,7,1,0.3);fxRing(b[0],b[1],0,0x7fc8ff,1.6,0.3,true,Math.PI/2);fmStop(0.06);
        fxShot(b,[e.x,1.4,0],0x7fc8ff,0.22,1.7,()=>fmHit(e,-s,{dmg:9,kb:11,ky:8,heavy:1,unblock:1,wt:'bastone',by:h}));}
      else if(!R.dead)fmHurt(h,s,1);});},0.8);e.cm.lungeV=0;}

// ---------- A · L'ASSEDIO ----------
FM_DIR.A={name:"L'assedio",tChoice:52.0,tPrison:46.0,
  setup(C){fmSet(C,'hall');fmGrade('epic');const [hc,hb,hl]=C.heroes;C.heroes.forEach((h,i)=>{fmResetHero(h,(i-1)*1.9,i===2?1:-1);h.calm=true;h.yaw=0;h.yawK=1;});
    hc.home=-7;hb.home=0;hl.home=7;
    const S=[],at=(t,f)=>S.push([t,f]);
    at(0,()=>{const op=$('opener');op.hidden=false;op.classList.remove('go');op.classList.add('cineview');opPixel.restart&&opPixel.restart();});
    at(0.5,()=>cineSay('Sulla cima del mondo sorge la Torre.'));
    at(2.7,()=>cineSay('Tre eroi giurarono di proteggerla.'));
    at(4.6,()=>{const op=$('opener');op.hidden=true;op.classList.remove('cineview');});
    at(5.7,()=>cineSay('Finché, una notte, i portoni cedettero.'));
    at(7.6,()=>{shake(0.7);sfx('boom');for(let i=0;i<14;i++)burst(rand(-9,9),rand(8,11),0xb9ad98,3,1,-2,0.6,rand(-3,2));
      C.heroes.forEach(h=>{h.calm=false;h.yaw=null;});hc.R.face=-1;hb.R.face=-1;hl.R.face=1;cineSay('Ai vostri posti!','Cavaliere');
      C.wL=fmWaveIn(C,null,-1,['guard','guard','knight','guard','guard']);C.mage=fmMon('mage',-31,{side:-1,spd:4,tx:-18.5,hold:0,hp:1});
      C.wR=fmWaveIn(C,null,1,['guard','knight','guard','guard','guard']);});
    at(8.9,()=>{sfx('boom');shake(0.45);});
    at(10,()=>{fmGo(hc,-7);fmGo(hl,7);for(const e of C.wL)hc.q.push(e);hc.mode='brawl';for(const e of C.wR){e.cm.tx=13+C.wR.indexOf(e)*1.3;e.cm.spd=3;}});
    // --- Cavaliere: parate, combo, Egida specchio, Ariete d'acciaio
    at(11.2,()=>cineCard(0));at(12.9,()=>cineCard(null));
    at(14.7,()=>{const e=C.mage;if(e&&!e.dead){e.cm.tx=hc.R.x-8.5;e.cm.spd=6;}});
    at(15.3,()=>{const e=C.mage;if(e&&!e.dead){hc.lock=2.2;hc.R.atk=null;hc.R.face=-1;fmOrb(C,e,hc);}});
    at(15.75,()=>fmEgida(hc,1.9));
    at(17.2,()=>{hc.R.face=-1;fmAriete(hc,-1,8.5);});
    at(18.0,()=>{for(const e of C.wR)hl.q.push(e);hl.mode='brawl';for(const e of C.wR)e.cm.spd=6;});
    // --- Lanciere: affondi, Lancia fulminea, Volo del drago
    at(18.4,()=>cineCard(2));at(20,()=>cineCard(null));
    at(21.2,()=>{hl.lock=1.2;hl.R.atk=null;fmWaveIn(C,hl,1,['guard','guard','knight'],{spd:7,tx:12.5});});
    at(21.5,()=>fmFulminea(hl,1,15));
    at(23.1,()=>fmDrago(hl,4.2));
    at(24.5,()=>{C.jump=[-2.6,2.4,-3.9,3.7].map((x,i)=>{const e=fmMon(i===1?'knight':'guard',x,{y:7,side:Math.sign(x),cz:0});hb.q.push(e);return e;});});
    // --- Berserker: incassa, Furia sanguinaria, Turbine, Spaccaterra
    at(25.2,()=>{hb.mode='brawl';hb.forceHit=1;cineCard(1);});at(26.8,()=>cineCard(null));
    at(27.7,()=>{fmFuria(hb);cineSay('AAARGH!','Berserker');});
    at(28.4,()=>{fmWaveIn(C,hb,-1,['guard','guard'],{spd:8,tx:5});fmWaveIn(C,hb,1,['guard','knight'],{spd:8,tx:5});});
    at(30.5,()=>{fmTurbine(hb,0);fmWaveIn(C,hb,-1,['guard','guard','guard'],{spd:8,tx:5});fmWaveIn(C,hb,1,['guard','guard'],{spd:8,tx:5});});
    at(32.3,()=>{hb.R.face=1;fmSpaccaterra(hb);});
    at(33.9,()=>{for(const e of C.mons)if(!e.dead&&!e.cm.gone&&e.cm.mode!=='air'){e.cm.mode='walk';e.cm.hold=0;e.cm.tx=(e.x<0?-1:1)*31;e.cm.spd=8;e.cm.exit=1;e.cm.look=null;}
      C.heroes.forEach(h=>{h.mode='idle';h.q=[];h.strQ=null;h.resp=null;});fmGo(hc,-2.2);fmGo(hl,2.2);fmGo(hb,0);cineSay('Per un istante, sembrò finita.');});
    // --- il Capitano
    at(35.4,()=>fmCapSpawn(C,27.5,{tx:14.5,spd:3.6,side:1}));
    at(36.0,()=>{C.dimT=0.3;shake(0.3);sfx('boom');C.heroes.forEach(h=>{h.R.face=1;});});
    at(36.7,()=>{shake(0.3);sfx('boom');});at(37.4,()=>{shake(0.35);sfx('boom');});at(38.1,()=>{shake(0.4);sfx('boom');});
    at(37.7,()=>cineSay('Tutto qui?','Capitano'));
    at(39.0,()=>{const cap=C.cap;fmAriete(hc,1,cap.x-2.1-hc.R.x,{onHit:e=>e!==cap});   // l'ariete si ferma contro la sua lama
      fmEAtk(cap,hc,()=>{burst(cap.x-2,1.6,0xfff2b0,30,9,2);sfx('block');sfx('boom');fmFlash(0.35);fmSlow(0.35);hc.R.chargeT=0;fmDown(hc,-1,1.5);},0.4);cap.cm.lungeV=2;});
    at(40.0,()=>fmGo(hl,8.6,10.5));
    at(40.65,()=>{const cap=C.cap;hl.goX=null;fmDrago(hl,(cap.x-1.4-hl.R.x)/0.6);fmEAtk(cap,hl,()=>{if(hl.R.dead)return;burst(hl.R.x,hl.R.y+1,0xfff2b0,30,9,2);sfx('boom');fmFlash(0.3);fmSlow(0.35);fmDown(hl,-1,1.6);},0.5);cap.cm.lungeV=0;});
    at(42.3,()=>{hb.R.rageT=4;hb.spdK=1.45;sfx('roar');cineSay('AAAARGH!','Berserker');fmGo(hb,C.cap.x-6,9.5);});
    at(42.6,()=>{const cap=C.cap;fmCapLeap(cap,cap.x-5.2,0.95,()=>{fmSlam(C,cap.x-1,1);fmSlow(0.5);fmDown(hb,-1,1.7);cineSay('Erano troppi. E lui era troppo forte.');});});
    at(44.7,()=>cineSay('Gettateli nelle prigioni.','Capitano'));
    at(45.5,()=>$('cineBlack').classList.add('on'));
    at(46.0,()=>{fmPrison(C,false);$('cineBlack').classList.remove('on');});
    at(46.5,()=>cineSay('Li gettarono nelle prigioni sotto la Torre…'));
    at(49.2,()=>cineSay('…ma uno di loro non si sarebbe arreso.'));
    C.script=S;},
  upd(C,dt,rdt){fmDoors(C,8.1,9.0,rdt);const hl=C.heroes[2];
    if(C.t>21.2&&C.t<21.5)hl.R.face=1;},
  cam(C,t){const [hc,hb,hl]=C.heroes,cap=C.cap,X=h=>h.R.x;
    if(t<4.6)return {id:'ext',p:[0,4,12],l:[0,1.4,0]};
    if(t<8.0){const k=easeInOutCubic(clamp((t-4.6)/3,0,1));return {id:'hall',p:[0,lerp(9,1.9,k),lerp(20,9.2,k)],l:[0,lerp(3.4,1.5,k),0],fov:lerp(40,33,k),k:9};}
    if(t<9.0)return {id:'dL',flashCut:1,p:[-15.5-(t-8)*0.8,1.0,6.6],l:[-24,2.7,0.8],fov:36,hh:0.07};
    if(t<10.0)return {id:'dR',flashCut:1,p:[15.5+(t-9)*0.8,1.0,6.6],l:[24,2.7,0.8],fov:36,hh:0.07};
    if(t<11.2)return {id:'wide',flashCut:1,p:[0,6.2-(t-10)*0.5,22],l:[0,1.4,0],fov:38};
    if(t<15.0)return {id:'cav',flashCut:1,p:[X(hc)+1.4,1.7,6.9],l:[X(hc)-1.3,1.35,0],fov:36,k:5};
    if(t<17.1)return {id:'cav2',p:[X(hc)-1.5,1.9,8.6],l:[X(hc)-4.2,1.4,0],fov:36,k:3};
    if(t<18.4)return {id:'cav3',flashCut:1,p:[X(hc)+2.5,1.2,7.2],l:[X(hc)-1,1.3,0],fov:40,k:7};
    if(t<21.2)return {id:'lan',flashCut:1,p:[X(hl)-1.6,1.7,7.2],l:[X(hl)+1.4,1.35,0],fov:36,k:5};
    if(t<23.0)return {id:'lan2',flashCut:1,p:[X(hl)-3.4,2.0,2.7],l:[X(hl)+9,1.25,0],fov:46,k:6};
    if(t<25.2)return {id:'lan3',flashCut:1,p:[X(hl)+0.5,1.6+hl.R.y*0.8,11],l:[X(hl)+1,1.3+hl.R.y*0.75,0],fov:40,k:9};
    if(t<27.6)return {id:'ber',flashCut:1,p:[X(hb)+1.2,1.4,7.4],l:[X(hb),1.5,0],fov:36,k:5};
    if(t<28.6)return {id:'ber2',p:[X(hb)+0.7,1.25,4.4],l:[X(hb),1.65,0],fov:32,k:3.5};
    if(t<30.4)return {id:'ber3',p:[X(hb)-1.4,1.6,7.8],l:[X(hb),1.4,0],fov:36,k:4};
    if(t<32.2){const a=(t-30.4)*1.1-0.6;return {id:'ber4',p:[X(hb)+Math.sin(a)*6,1.1,Math.cos(a)*6],l:[X(hb),1.5,0],fov:38,k:8};}
    if(t<34.0)return {id:'ber5',flashCut:1,p:[X(hb)+2,0.9,10.5],l:[X(hb)+1.5,2.0,0],fov:42,k:5};
    if(t<36.9)return {id:'wide2',flashCut:1,p:[0,9.5-(t-34)*0.6,24-(t-34)*0.8],l:[0,1.2,0],fov:38};
    if(t<38.9){const cx=cap?cap.x:20;return {id:'cap',flashCut:1,p:[cx-9,0.8,11.5],l:[cx-0.5,2.5,0],fov:36,k:4,hh:0.05};}
    if(t<40.0)return {id:'cap2',flashCut:1,p:[7,2.4,17.5],l:[7.2,2.0,0],fov:38};
    if(t<42.2)return {id:'cap3',p:[lerp(X(hl),cap.x,0.5),2.2+hl.R.y*0.45,14],l:[lerp(X(hl),cap.x,0.5),1.7+hl.R.y*0.55,0],fov:38,k:5};
    if(t<44.5)return {id:'cap4',flashCut:1,p:[cap.x-7.5,1.3+cap.y*0.3,14.5],l:[cap.x-3,2.4+cap.y*0.95,0],fov:38,k:7};
    if(t<46.0)return {id:'cap5',flashCut:1,p:[cap.x-9,0.5,7.5],l:[cap.x-1,2.4,0],fov:34,k:3};
    if(t<49.0)return {id:'pr1',p:[0,0.6,7.5],l:[0,lerp(6,2,clamp((t-46.0)/2,0,1)),0],k:9};
    const k=easeInOutCubic(clamp((t-49.0)/3,0,1));return {id:'pr2',flashCut:1,p:[lerp(-7,0,k),2.5,lerp(10,7.5,k)],l:[0,1.3,0],k:9};}};

// ---------- B · SENZA STACCHI ----------
FM_DIR.B={name:'Senza stacchi',tChoice:38.6,tPrison:32.6,
  setup(C){fmSet(C,'hall');fmGrade('epic');const [hc,hb,hl]=C.heroes;for(const d of cineHall.doors)d.pv.rotation.y=d.k*d.s*-1.6;
    fmResetHero(hc,-8,-1);fmResetHero(hb,0,1);fmResetHero(hl,8,1);hc.home=-8;hb.home=0;hl.home=8;hc.leash=2.6;hb.leash=2.4;hl.leash=2.6;
    const put=(h,list)=>list.forEach(([ty,x,o])=>{const e=fmMon(ty,x,Object.assign({side:Math.sign(x-h.R.x)},o));h.q.push(e);return e;});
    put(hc,[['guard',-10.4],['guard',-12.4],['knight',-14],['guard',-15.6]]);
    put(hb,[['knight',-2.9],['guard',-4.3],['guard',-5.6],['guard',2.6],['knight',4.1],['guard',5.3]]);
    put(hl,[['guard',10.4],['guard',12.2],['knight',13.8],['guard',15.4]]);
    $('cineBlack').classList.add('on');
    const S=[],at=(t,f)=>S.push([t,f]);
    at(0.15,()=>{fmTitle("La notte dell'assedio");sfx('block');});at(0.5,()=>sfx('slash'));at(0.85,()=>sfx('block'));
    at(1.3,()=>{fmTitle(null);$('cineBlack').classList.remove('on');C.heroes.forEach(h=>h.mode='brawl');});
    // il Cavaliere sfonda la linea: l'ultimo nemico vola fino al Berserker
    at(5.6,()=>{hc.lock=0.5;hc.R.atk=null;hc.R.face=1;});
    at(5.9,()=>{const L=C.mons.filter(e=>!e.dead&&!e.cm.gone&&!e.cm.dying&&e.x>hc.R.x+0.5&&e.x<hb.R.x-0.8).sort((a,b)=>b.x-a.x),tgt=L[0];
      fmAriete(hc,1,(tgt?tgt.x:hb.R.x-2.6)-hc.R.x-0.4,{onHit:e=>{if(e===tgt){C.pass=e;e.cm.hp=9;fmHit(e,1,{dmg:1,kb:7,ky:10,hs:0.9,heavy:1,unblock:1,wt:'pugni'});e.cm.hp=1;return false;}},done:()=>{hc.home=-6.5;hc.lock=0.35;fmLater(0.35,()=>fmGo(hc,-6.5,9));}});hb.lock=1.2;hb.R.atk=null;hb.strQ=null;hb.R.face=-1;});
    at(7.4,()=>fmWaveIn(C,hl,1,['guard','guard'],{spd:8,tx:12}));
    at(8.6,()=>{hb.forceHit=1;fmWaveIn(C,hb,-1,['guard'],{spd:7,tx:-3});});
    at(9.9,()=>fmFuria(hb));
    at(11.5,()=>{fmWaveIn(C,hb,1,['guard','guard'],{spd:8,tx:4.5});});
    at(12.1,()=>{hb.R.face=1;fmSpaccaterra(hb,{pre:(i,x)=>{if(i===2){   // l'ultimo colpo lancia un nemico in aria: ci pensa la lancia
          const e=C.mons.filter(e=>!e.dead&&!e.cm.gone&&!e.cm.dying&&e.x>x&&e.x<x+5.5).sort((a,b)=>a.x-b.x)[0];if(e){e.cm.hp=30;C.fly=e;}}},
        onSlam:(i,x)=>{const e=C.fly;if(i!==2||!e)return;e.vy=15.5;e.cm.kvx=3;e.cm.rv=-3;hl.lock=1.3;hl.R.atk=null;hl.strQ=null;hl.R.face=-1;
          fmLater(0.5,()=>fmFulminea(hl,-1,0,{to:[e.x+1.6,Math.max(1.6,e.y+0.4),0],end:()=>{e.cm.hp=0;fmHit(e,-1,{dmg:9,kb:13,ky:3,heavy:1,unblock:1,wt:'lancia',by:hl});fmFlash(0.25);}}));}});});
    at(12.6,()=>fmWaveIn(C,hl,1,['guard','knight','guard'],{spd:8,tx:12}));
    at(15.2,()=>fmWaveIn(C,hl,1,['guard','guard','guard'],{spd:8,tx:12}));
    at(16.6,()=>fmWaveIn(C,hl,1,['guard','knight','guard'],{spd:9,tx:11.5}));
    at(17.6,()=>fmDrago(hl,4.5));
    at(19.2,()=>{fmWaveIn(C,hc,-1,['guard','guard','knight'],{spd:8,tx:9});fmWaveIn(C,hl,1,['guard','guard','guard'],{spd:8,tx:11});fmWaveIn(C,hb,1,['guard'],{spd:9,tx:4});fmWaveIn(C,hb,-1,['guard'],{spd:9,tx:4});});
    at(20.0,()=>{hl.R.face=1;fmDiluvio(hl,C.mons.filter(e=>!e.dead&&!e.cm.gone&&e.x>hl.R.x+1).map(e=>e.x).slice(0,6));});
    at(21.5,()=>fmFortezza(hc));at(21.9,()=>fmTurbine(hb,0));at(22.4,()=>{hl.R.face=1;fmFulminea(hl,1,14);});
    // buio: i bracieri si spengono uno dopo l'altro
    at(23.6,()=>{C.dimSweep=C.t;sfx('boom');shake(0.3);for(const e of C.mons)if(!e.dead&&!e.cm.gone&&e.cm.mode!=='air'){e.cm.mode='walk';e.cm.hold=0;e.cm.tx=-31;e.cm.spd=8.5;e.cm.exit=1;e.cm.look=null;}
      C.heroes.forEach(h=>{h.mode='idle';h.q=[];h.strQ=null;h.resp=null;});fmGo(hc,-2.3);fmGo(hb,0);fmGo(hl,2.3,8.4,h=>{h.R.face=1;});fmLater(1.1,()=>C.heroes.forEach(h=>{h.R.face=1;}));
      fmCapSpawn(C,28,{tx:15,spd:2.5,side:1});});
    at(24.5,()=>{shake(0.3);sfx('boom');});at(25.2,()=>{shake(0.35);sfx('boom');});at(25.9,()=>{shake(0.4);sfx('boom');});at(26.6,()=>{shake(0.45);sfx('boom');});
    at(26.8,()=>cineSay('Avete finito?','Capitano'));
    at(27.9,()=>{const cap=C.cap;fmCapLeap(cap,1.2,1.2,()=>{fmSlam(C,cap.x,1.2);fmFlash(1);fmSlow(0.7);fmDown(hc,-1,1.0);fmDown(hb,-1,0.6);fmDown(hl,1,1.0);C.fallen=C.t;});});
    at(30.6,()=>{const cap=C.cap;cap.cm.mode='walk';cap.cm.tx=-0.6;cap.cm.spd=1.6;});
    at(31.2,()=>cineSay('Portateli giù.','Capitano'));
    at(32.1,()=>$('cineBlack').classList.add('on'));
    at(32.6,()=>{fmPrison(C,false);$('cineBlack').classList.remove('on');});
    at(33.1,()=>cineSay('Li gettarono nelle prigioni sotto la Torre…'));
    at(35.8,()=>cineSay('…ma uno di loro non si sarebbe arreso.'));
    C.script=S;},
  upd(C,dt,rdt){const hb=C.heroes[1],e=C.pass;
    // il nemico lanciato dall'ariete arriva in volo: il Berserker lo accoglie con il Montante del drago
    if(e&&!e.dead&&!C.passHit&&e.x>hb.R.x-3.3){C.passHit=1;hb.R.face=-1;fmAtk(hb,'ul',{dmg:9,heavy:1});fmSlow(0.25);}
    if(C.dimSweep!=null){const k=(C.t-C.dimSweep)/1.6;cineHall.L.forEach(l=>{const x=l.l.position.x;l.off=k>(x+14)/28*0.8+0.1;});C.dimT=0.45;}},
  cam(C,t){const [hc,hb,hl]=C.heroes,cap=C.cap,X=h=>h.R.x,s={id:'take',k:4.2,hh:0.06,fov:37};
    if(t>=this.tPrison){if(t<35.6)return {id:'pr1',p:[0,0.6,7.5],l:[0,lerp(6,2,clamp((t-this.tPrison)/2,0,1)),0],k:9};
      const k=easeInOutCubic(clamp((t-35.6)/3,0,1));return {id:'pr2',p:[lerp(-7,0,k),2.5,lerp(10,7.5,k)],l:[0,1.3,0],k:4};}
    if(t<5.7){s.p=[X(hc)+2.6,1.65,6.4];s.l=[X(hc)-1.0,1.3,0];}
    else if(t<7.9){const e=C.pass,fx=e&&!e.cm.gone?clamp(e.x,X(hc),X(hb)):X(hc)+2;s.p=[fx+0.5,1.9,7.4];s.l=[fx+0.8,1.5+(e&&!e.dead?e.y*0.4:0),0];s.k=6;}
    else if(t<13.4){s.p=[X(hb)-1.7,1.45,7.0];s.l=[X(hb)+0.6,1.45,0];if(t>12.0){s.p=[X(hb)-2.5,1.1,8.6];s.l=[X(hb)+2.2,2.2,0];s.fov=41;}}
    else if(t<14.6){const e=C.fly,k=easeInOutCubic(clamp((t-13.4)/1.1,0,1)),fx=lerp(e?e.x:4,X(hl),k);s.p=[fx-1.2,2,7.2];s.l=[fx+0.8,lerp(e?Math.max(1.4,e.y):2,1.4,k),0];s.k=7;}
    else if(t<19.6){s.p=[X(hl)-2.4,1.75+hl.R.y*0.8,6.8+hl.R.y*0.45];s.l=[X(hl)+0.9,1.3+hl.R.y*0.75,0];s.k=hl.R.y>0.5?9:4.2;}
    else if(t<23.9){const k=easeInOutCubic(clamp((t-19.6)/2.4,0,1));s.p=[lerp(X(hl)-2.4,0,k),lerp(1.75,5.2,k),lerp(6.8,20,k)];s.l=[lerp(X(hl)+0.9,0,k),lerp(1.3,1.5,k),0];s.k=5;}
    else if(t<27.9){const k=easeInOutCubic(clamp((t-23.9)/2.6,0,1)),cx=cap?cap.x:20;s.p=[lerp(0,cx-8.5,k),lerp(5.2,0.9,k),lerp(20,9,k)];s.l=[lerp(0,cx-0.5,k),lerp(1.5,2.6,k),0];s.fov=lerp(37,34,k);s.k=3.2;}
    else if(C.fallen==null){s.p=[cap.x-6.5,1.1+cap.y*0.25,13];s.l=[cap.x-1.5,2.3+cap.y*0.9,0];s.k=7;s.fov=38;}
    else{const k=easeOutCubic(clamp((t-C.fallen)/0.9,0,1));s.p=[lerp(cap.x-6.5,X(hc)-2.4,k),lerp(1.1,0.3,k),lerp(9.5,4.4,k)];s.l=[lerp(cap.x-1,cap.x-1.5,k),lerp(2,1.5,k),0];s.roll=0.45*k;s.fov=42;s.k=7;s.hh=0.015;}
    return s;}};

// ---------- C · IL RICORDO ----------
// ogni ricordo: l'eroe da solo contro il Capitano, con le guardie in cerchio a guardare
function fmMemory(C,i,T,steps){const h=C.heroes[i],at=(t,f)=>C.script.push([T+t,f]);
  at(-0.9,()=>{h.headUp=1;});
  at(0,()=>{fmFlash(1);sfx('ability');fmSet(C,'hall');fmClearMons(C);fmGrade('mem');C.dimT=0.8;C.dim=0.8;C.mem=i;C.heroes.forEach(x=>{x.on=x===h;});
    fmResetHero(h,-3.2,1);const cap=fmCapSpawn(C,4.2,{mode:'hold',hold:1,face:-1,look:-3,sc:1.9});
    [-8.5,-6.4,-4.2,-1.4,1.2,3.6,6,8.4].forEach((x,k)=>fmMon(k%3===1?'knight':'guard',x,{mode:'hold',hold:1,bg:1,cz:-2.5-(k%2)*0.7,look:0,cd:99}));
    cineCard(i,'Il ricordo');C.cardT=1.6;});
  steps(h,()=>C.cap,at);
  at(steps.end,()=>{fmFlash(1);sfx('ability');C.mem=null;fmPrison(C,true);C.heroes.forEach(x=>{x.on=true;x.headUp=0;});h.poseT=0;});}
FM_DIR.C={name:'Il ricordo',tChoice:38.4,tPrison:0,
  setup(C){const [hc,hb,hl]=C.heroes;fmPrison(C,true);C.script=[];const at=(t,f)=>C.script.push([t,f]);
    at(0.5,()=>cineSay('Tre eroi. Tre gabbie. Una sola notte.'));
    at(3.1,()=>cineSay('Ognuno di loro la ricorda bene.'));
    // --- Cavaliere: para, risponde, carica... e lo scudo va in pezzi
    const A=function(h,cap,at){
      at(0.4,()=>{const c=cap();c.cm.hold=0;c.cm.mode='walk';c.cm.tx=h.R.x+3.1;c.cm.spd=4.2;});
      at(1.0,()=>{h.blockT=0.9;fmEAtk(cap(),h,e=>{fmBlockFx(h,e);},0.5);});
      at(2.2,()=>{h.blockT=0.8;const c=cap();c.cm.tx=h.R.x+3.0;fmEAtk(c,h,e=>{fmBlockFx(h,e);h.tgt=e;e.cm.guard=1;h.strQ=[['nl'],['nl',{fin:1,bossKb:7}]];h.si=0;fmNext(h);},0.42);});
      at(3.2,()=>{if(h.strQ)fmNext(h);});
      at(4.1,()=>{const c=cap();fmAriete(h,1,c.x-1.9-h.R.x);});
      at(5.0,()=>{const c=cap();c.cm.tx=h.R.x+3.2;c.cm.mode='walk';c.cm.spd=3.2;});
      at(5.5,()=>{const c=cap();h.R.face=1;fmEAtk(c,h,e=>{h.R.shieldT=0;burst(h.R.x+0.6,1.3,0x7fc8ff,70,12,2,0.4);burst(h.R.x+0.6,1.3,0xffffff,24,9,2);fxRing(h.R.x,1.1,0,0x7fc8ff,3.4,0.5,true,Math.PI/2);sfx('boom');sfx('block');fmFlash(0.6);fmSlow(0.55);fmDown(h,-1,0.9);},1.05);c.cm.lungeV=3;});
      at(5.75,()=>fmEgida(h,3));
      at(7.4,()=>cineSay('Il mio scudo non bastò.','Cavaliere'));};A.end=8.9;
    // --- Berserker: furia, scambio di colpi, turbine, spaccaterra... e il Capitano gli piomba addosso
    const B=function(h,cap,at){
      at(0.3,()=>{fmFuria(h);});
      at(1.1,()=>{fmGo(h,cap().x-2.5,9.5,hh=>{hh.tgt=cap();cap().cm.guard=1;hh.strQ=[['nl'],['nl',{fin:1,bossKb:8}]];hh.si=0;fmNext(hh);});});
      at(1.55,()=>{const c=cap();fmEAtk(c,h,e=>{if(Math.abs(h.R.x-e.x)<5){const A=h.R.atk;fmHurt(h,-1,0.45);h.R.vx=-1.5;h.rest=0;}},0.5);c.cm.lungeV=1.5;});
      at(2.35,()=>{h.tgt=cap();h.R.face=1;cap().cm.guard=0;h.strQ=[['nl',{bossKb:5}],['nl',{fin:1,bossKb:9}]];h.si=0;fmNext(h);});
      at(3.05,()=>{if(h.strQ)fmNext(h);});
      at(3.9,()=>{h.R.face=1;cap().cm.guard=99;fmTurbine(h,3.2);});
      at(5.5,()=>{h.R.face=1;const c=cap();c.cm.tx=h.R.x+4;c.cm.mode='walk';fmSpaccaterra(h);});
      at(6.0,()=>{const c=cap();fmCapLeap(c,h.R.x+1.1,0.85,e=>{fmSlam(C,e.x-0.6,0.9);fmSlow(0.55);fmDown(h,-1,0.9);});});
      at(7.9,()=>cineSay('La mia furia non bastò.','Berserker'));};B.end=9.4;
    // --- Lanciere: lancia deviata, affondi veloci, montante, volo del drago... preso al volo
    const L=function(h,cap,at){
      at(0.4,()=>{const c=cap();fmFulminea(h,1,0,{to:[c.x-1.5,1.6,0],end:()=>{burst(c.x-1.5,1.6,0xfff2b0,24,8,2);sfx('block');fmStop(0.06);shake(0.2);c.cm.showT=0.3;fxShot([c.x-1.5,1.6,0],[c.x+4,10,-4],0x7ff0e4,0.3,1.4);}});});
      at(1.4,()=>{sfx('dash');fmGo(h,cap().x-3.3,14);});
      at(1.75,()=>{h.goX=null;h.tgt=cap();cap().cm.guard=2;h.strQ=[['nl'],['nl'],['sl',{unblock:1,bossKb:7}]];h.si=0;fmNext(h);});
      at(2.2,()=>{if(h.strQ)fmNext(h);});at(2.6,()=>{if(h.strQ)fmNext(h);});
      at(3.2,()=>{const c=cap();c.cm.tx=h.R.x+2.9;fmEAtk(c,h,fmEStrike,0.45);h.resp={e:c,k:'dodge'};h.mode='brawl';h.q=[c];c.cm.cd=99;});
      at(4.6,()=>{h.mode='idle';h.strQ=null;h.R.atk=null;h.R.face=1;h.tgt=cap();fmAtk(h,'ul',{bossKb:6});});
      at(5.0,()=>{h.strQ=null;h.R.atk=null;const c=cap();fmDrago(h,(c.x-1.6-h.R.x)/0.6);fmEAtk(c,h,e=>{if(h.R.dead)return;burst(h.R.x,h.R.y+1,0xfff2b0,30,9,2);sfx('boom');fmFlash(0.5);fmSlow(0.55);fmDown(h,-1,1.0);},0.5);c.cm.lungeV=0;});
      at(7.3,()=>cineSay('La mia lancia non bastò.','Lanciere'));};L.end=8.8;
    C.memT=[5.6,16.0,26.9];
    fmMemory(C,0,C.memT[0],A);fmMemory(C,1,C.memT[1],B);fmMemory(C,2,C.memT[2],L);
    at(36.0,()=>cineSay('Ma uno di loro si sarebbe rialzato.'));
    C.script.sort((a,b)=>a[0]-b[0]);},
  upd(C,dt,rdt){},
  cam(C,t){const H=C.heroes,cap=C.cap;
    if(C.mem!=null&&cap){const h=H[C.mem],mx=(h.R.x+cap.x)/2,sp=Math.abs(cap.x-h.R.x),lt=t-C.memT[C.mem],a=Math.sin(lt*0.35)*0.5;
      return {id:'mem'+C.mem,p:[mx+a*2-0.4,1.9+Math.max(h.R.y,cap.y)*0.45,7+sp*0.4+cap.y*0.6],l:[mx,1.85+Math.max(h.R.y,cap.y)*0.7,0],fov:35,k:4.5,hh:0.07};}
    const nx=C.memT.findIndex(T=>t<T);            // prossimo ricordo: la cinepresa si stringe su quella gabbia
    if(nx>=0){const T=C.memT[nx],hx=H[nx].R.x,k=easeInOutCubic(clamp((t-(T-1.6))/1.5,0,1)),w=nx===0?easeInOutCubic(clamp(t/4,0,1)):1;
      const base=nx===0?{p:[lerp(-2,0,w),lerp(3.2,2.3,w),lerp(13,9.5,w)],l:[0,1.5,0]}:{p:[H[nx-1].R.x+1.1,1.3,3.6],l:[H[nx-1].R.x,0.95,0]};
      return {id:'prC',p:fmV(base.p,[hx+0.9,1.25,3.3],k),l:fmV(base.l,[hx,0.95,0],k),fov:lerp(nx===0?38:32,31,k),k:5,hh:0.03};}
    const k=easeInOutCubic(clamp((t-35.7)/2.6,0,1));return {id:'prC',p:fmV([H[2].R.x+1.1,1.3,3.6],[0,2.5,7.5],k),l:fmV([H[2].R.x,0.95,0],[0,1.3,0],k),fov:lerp(32,38,k),k:5};}};

/* =========================================================
   AVVIO, CICLO, SCELTA, EVASIONE, FINE
   ========================================================= */
startCine=function(replay,o){o=o||{};
  G.state='cine';clearActors();showScene('tower');G.scene='cine';towerG.visible=false;levelGroup.visible=false;cellarG.visible=false;G.floor=1;G.solids=[];G.queue=[];G.timers=[];
  if(!cineHall)cineHall=buildCineHall();if(!cinePrison)cinePrison=buildCinePrison();
  G.cineLights=[hemi.intensity,sun.intensity];hemi.intensity=0.25;sun.intensity=0.15;scene.fog.near=60;scene.fog.far=120;
  ['cellarHud','hud','touch','prompt','bUse','settings','classes','tutBox'].forEach(id=>$(id).hidden=true);showMeds(false);setHint('',0);
  for(const d of cineHall.doors)d.pv.rotation.y=0;for(const l of cineHall.L)l.off=false;{const op=$('opener');op.hidden=true;op.classList.remove('cineview');}
  const v=o.v||fmVar(),D=FM_DIR[v]||FM_DIR.A;
  const C=G.cine={v2:true,var:v,D,t:0,replay,demo:!!o.demo,heroes:[],mons:[],bodies:[],splats:[],tm:[],cap:null,set:'hall',
    cp:new THREE.Vector3(0,4,12),cl:new THREE.Vector3(0,1.4,0),camP:new THREE.Vector3(0,4,12),camL:new THREE.Vector3(0,1.4,0),fovV:38,roll:0,shotId:null,cut:true,
    hover:1,chosen:null,ct:0,choice:false,done:false,si:0,stop:0,flash:0,dim:1,dimT:1,cardT:0,script:[]};
  C.heroes=STARTERS.map((id,i)=>fmHero(id,i));
  D.setup(C);C.script.sort((a,b)=>a[0]-b[0]);
  $('cine').hidden=false;$('cine').classList.add('on','v2');$('cineSkip').hidden=false;$('cineChoice').hidden=true;cineSub('');cineCard(null);MUS.mood='boss';G.fade=1;G.fadeTarget=0;G.fadeSpd=1.2;G.snapCam=true;
};
const _updCineOld=updCine;
updCine=function(rdt){const C=G.cine;if(!C)return;if(!C.v2)return _updCineOld(rdt);const D=C.D;
  let dt=G.abilSlow>0?rdt*0.35:rdt;if(C.stop>0){C.stop-=rdt;dt=0;}
  C.t+=dt;const t=C.t;
  while(C.si<C.script.length&&t>=C.script[C.si][0]){const f=C.script[C.si][1];C.si++;f();}
  for(const k of C.tm){k.t-=dt;if(k.t<=0&&!k.done){k.done=true;k.fn();}}if(C.tm.some(k=>k.done))C.tm=C.tm.filter(k=>!k.done);
  if(dt>0){D.upd(C,dt,rdt);
    for(const h of C.heroes){if(h.mode==='brawl')fmBrawl(h);fmHeroUpd(h,dt);}
    for(const e of C.mons)fmMonUpd(e,dt);fmCages(C,dt);}
  if(C.cardT>0){C.cardT-=rdt;if(C.cardT<=0)cineCard(null);}
  // luci: bracieri che tremolano, buio quando arriva il Capitano
  C.dim=lerp(C.dim,C.dimT,Math.min(1,rdt*1.4));
  for(const l of cineHall.L){const f=1+Math.sin(G.time*13+l.seed)*0.1+Math.random()*0.06;l.k=lerp(l.k==null?1:l.k,l.off?0:1,Math.min(1,rdt*6));l.l.intensity=1.6*f*C.dim*l.k;l.f.scale.set(l.k,f*l.k,l.k);}
  for(const l of cinePrison.L){l.l.intensity=0.4*(1+Math.sin(G.time*11+l.seed)*0.08+Math.random()*0.05);}
  C.flash=Math.max(0,C.flash-rdt*2.6);$('cineFlash').style.opacity=C.flash>0.01?Math.min(1,C.flash):0;
  // cinepresa
  if(C.chosen==null&&t>=D.tChoice){const hx=C.heroes[C.hover].R.x;fmCamApply(C,{id:'choice',p:[hx,2.3,6.8],l:[hx,1.1,0],k:5,hh:0.02},rdt);}
  else if(C.chosen==null)fmCamApply(C,D.cam(C,t),rdt);
  if(t>=D.tChoice&&C.chosen==null&&!C.choice){C.choice=true;C.heroes.forEach(h=>{h.headUp=1;});
    if(C.replay&&!C.demo)cineChoose(Math.max(0,STARTERS.indexOf(UNL.starter||'cavaliere')),true);
    else{const el=$('cineChoice');el.hidden=false;$('cineSkip').hidden=true;cineSay('');setTimeout(()=>{const b=el.querySelector('.cc[data-i="1"]');if(b)b.focus();},50);}}
  if(C.chosen!=null)fmBreakout(C,rdt);
};
// evasione: afferra le sbarre, la gabbia esplode e l'eroe salta fuori
function fmBreakout(C,rdt){const ct0=C.ct;C.ct+=rdt;const ct=C.ct,h=C.heroes[C.chosen],R=h.R,hx=R.x,at=x=>ct0<x&&ct>=x;
  if(at(0.5)){h.pose=fmPoseGrip;h.yaw=0;sfx('block');}
  if(ct<1.6)fmCamApply(C,{id:'bo1',p:[hx+1.3,1.7,2.8],l:[hx,1.4,0],fov:36,k:5,hh:0.05},rdt);
  else{const k=clamp((ct-1.6)/2,0,1);fmCamApply(C,{id:'bo2',flashCut:1,p:[hx,lerp(0.9,2.6,k),lerp(7,10,k)],l:[hx,lerp(2.2,1.4,k),lerp(0,1,k)],fov:38,k:9},rdt);}
  if(at(0.8)||at(1.15)){sfx('block');shake(0.15);burst(hx,1.5,0xffe2b0,10,4,1);}
  if(at(1.25)){fmAs(h,()=>{G.inAbil=true;try{abilityFx(1,h.c.ability);}finally{G.inAbil=false;}});$('abilSplash').classList.remove('on','big');absnd(2);}
  if(at(1.6)){sfx('boom');shake(0.6);fmFlash(0.5);fmGrade(null);burst(hx,1.4,0xffffff,50,9,3);burst(hx,1.4,h.col,30,8,3);h.cage.broken=true;
    const parts=[...h.cage.bars,h.cage.top,h.cage.chain];for(const b of parts){h.cage.g.remove(b);const m=new THREE.Mesh(chunkGeo,chunkMat(0x3a3a44));
      if(b===h.cage.top)m.scale.set(1.6,0.25,1.6);else if(b===h.cage.chain)m.scale.set(0.2,2,0.2);else m.scale.set(0.4,2.2,0.4);m.position.set(hx+b.position.x,b===h.cage.top?2.75:1.4,b.position.z);scene.add(m);
      const a=Math.atan2(b.position.z||0.001,b.position.x||0.001);G.chunks.push({m,vx:Math.cos(a)*rand(5,11),vy:rand(6,12),vz:Math.sin(a)*3,rx:rand(-8,8),rz:rand(-8,8),t:0});}
    h.pose=null;h.yaw=0.25;h.yawK=1;fmJump(h,11,0);h.jz=0;h.onLand=()=>{h.pose=fmPoseWin;h.poseT=0;sfx('land');fxRing(R.x,0.06,1.6,h.col,2.6,0.5);cineCard(C.chosen,'È ora di fuggire!');C.cardT=9;cineSay('Spezzò le sbarre. Ora tocca a te.');};}
  if(h.jz!=null&&h.jz<1.6){h.jz=Math.min(1.6,h.jz+rdt*2.4);R.z=h.jz;}
  if(ct>=4.6&&!C.done){C.done=true;cineCard(null);fadeThen(cineEnd);}}
cineChoose=function(i,auto){const C=G.cine;if(!C||C.chosen!=null)return;C.chosen=i;C.ct=0;$('cineChoice').hidden=true;sfx('pick');
  if(!auto&&!C.demo){const id=STARTERS[i];UNL.starter=id;UNL.u[id]=true;saveUnl();store.set('intro-seen',true);store.set('class',CLASSES.findIndex(c=>c.id===id));}};
// "Salta": la prima volta porta alla scelta dell'eroe, nel replay chiude il filmato
function fmSkip(){const C=G.cine;if(!C||C.done)return;
  if(C.replay&&!C.demo){C.done=true;cineCard(null);fadeThen(cineEnd);return;}
  if(C.chosen!=null||C.choice)return;
  fadeThen(()=>{C.tm=[];C.si=C.script.length;C.stop=0;G.abilSlow=0;C.mem=null;C.heroes.forEach(h=>{h.on=true;});fmTitle(null);$('cineBlack').classList.remove('on');cineCard(null);cineSay('');
    {const op=$('opener');if(op.classList.contains('cineview')){op.hidden=true;op.classList.remove('cineview');}}
    fmPrison(C,true);C.t=C.D.tChoice;G.fadeTarget=0;});}
$('cineSkip').onclick=()=>{if(G.bi){finishBossIntro();return;}const C=G.cine;if(!C||C.done)return;if(C.v2){fmSkip();return;}C.done=true;cineCard(null);fadeThen(cineEnd);};
const _cineEndOld=cineEnd;
cineEnd=function(){const C=G.cine;if(!C||!C.v2)return _cineEndOld();
  $('cine').hidden=true;$('cine').classList.remove('on','v2');cineSub('');cineCard(null);fmTitle(null);fmGrade(null);$('cineFlash').style.opacity=0;$('cineBlack').classList.remove('on');
  {const op=$('opener');if(op.classList.contains('cineview')){op.hidden=true;op.classList.remove('cineview');}}
  $('cine').style.removeProperty('--fmbar');cineHall.g.visible=false;cinePrison.g.visible=false;bubble.visible=false;if(G.cineLights){hemi.intensity=G.cineLights[0];sun.intensity=G.cineLights[1];}scene.fog.near=30;scene.fog.far=62;
  camera.fov=38;camera.updateProjectionMatrix();G.abilSlow=0;G.hitstop=0;G.timers=[];
  fmClearMons(C);G.enemies=G.enemies.filter(e=>!e.cm);
  const hc=C.heroes[C.chosen!=null?C.chosen:0],others=C.heroes.filter(o=>o!==hc),keep=!C.replay&&!C.demo;
  for(const o of C.heroes){const H=o.R.hero;fmRibOff(H,true);if(H&&H.an&&H.an.drop)weaponBack(H,H.an);if(o.cage&&o.cage.g.parent)o.cage.g.parent.remove(o.cage.g);
    if(!keep||o===hc)mpRemoveHero(o.R);}
  if(C.demo){G.cine=null;fmDemoMenu();return;}
  if(C.replay){G.cine=null;enterCellar();G.fadeTarget=0;return;}
  clearActors();G.cine=null;showScene('tower');G.floor=1;buildLevel(1);
  // gli altri due restano nelle loro gabbie, nella stanza del tutorial
  for(const o of others){const H=o.R.hero;scene.remove(H.root);levelGroup.add(H.root);H.root.position.set(o.R.x,0,0);if(o.cage){levelGroup.add(o.cage.g);o.cage.g.position.set(o.R.x,0,0);}}
  setClass(CLASSES.findIndex(c=>c.id===hc.id));startTutorial(hc.R.x,others.map(o=>({x:o.R.x})));G.fadeTarget=0;};

/* ---------- anteprima delle tre regie (solo con #anteprima-intro o nella pagina di prova) ---------- */
function fmDemoMenu(){let el=$('fmDemo');
  if(!el){el=document.createElement('div');el.id='fmDemo';el.innerHTML='<div class="fd-box"><small>The Tower · filmato introduttivo</small><h2>Tre regie, stessa storia</h2><div class="fd-row">'+
      [['A',"L'assedio",'Racconto epico in ordine: un momento per ogni eroe, poi arriva il Capitano.'],['B','Senza stacchi','Un\'unica ripresa continua in mezzo alla battaglia, da un eroe all\'altro.'],['C','Il ricordo','Si parte dalle prigioni: ogni eroe ricorda il suo duello col Capitano.']]
        .map(([k,n,d])=>`<button class="fd-btn" data-v="${k}"><i>${k}</i><b>${n}</b><span>${d}</span><em>circa ${({A:55,B:45,C:40})[k]} secondi</em></button>`).join('')+
      '</div><p>Tocca una regia per guardarla (meglio con l\'audio acceso e il telefono in orizzontale). Alla fine scegli un eroe per vedere l\'evasione; «Salta» porta subito alla scelta.</p></div>';
    document.body.appendChild(el);
    el.addEventListener('click',e=>{const b=e.target.closest('.fd-btn');if(!b)return;audioInit();sfx('ui');el.hidden=true;fadeThen(()=>{startCine(true,{demo:true,v:b.dataset.v});G.fadeTarget=0;});});}
  document.body.classList.add('fm-demo');fmDemoRes();G.state='menu';G.fade=1;G.fadeTarget=1;el.hidden=false;const op=$('opener');op.hidden=true;['installGate','nameGate','newsBox','account','rotate'].forEach(id=>{const x=$(id);if(x)x.hidden=true;});}
function fmDemoRes(){if(!document.body.classList.contains('fm-demo'))return;const h=innerHeight,band=Math.min(h,innerWidth*9/16),q=clamp(band/300,1.5,4)/clamp(h/300,1.5,4);
  if(Math.abs((window.__qRes||1)-q)>0.01){window.__qRes=q;resize();}}
addEventListener('resize',fmDemoRes);
if(window.__FM_DEMO||/anteprima-intro/.test(location.hash))setTimeout(fmDemoMenu,60);
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{fmDemoMenu,FM_DIR,fmSkip,cineChoose:i=>cineChoose(i),fmStart:v=>startCine(true,{demo:true,v}),fmReal:(r,v)=>startCine(r,{v}),fmC:()=>G.cine});
