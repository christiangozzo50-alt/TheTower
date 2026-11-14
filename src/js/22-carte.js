
/* =========================================================
   CARTE CHE CAMBIANO IL MODO DI GIOCARE (si prendono come gli altri potenziamenti)
   Fulmine a catena · Esecuzione · Cadaveri esplosivi · Scia di fuoco · Turbine
   Spine · Famiglio · Gelo critico · Calamita di rubini
   Ogni carta legge il suo livello da G.lv (0 = non presa); i colpi delle carte hanno card:true
   così non fanno scattare altre carte all'infinito.
   ========================================================= */
const lvC=id=>(G.lv&&G.lv[id])||0;
const cardOn=()=>G.scene==='tower'&&!G.pvp&&!G.tutorial;
UPG.push(
  {id:'catena', name:"Fulmine a catena",   icon:'bolt',  max:2, desc:()=>nxLv('catena')>1?"Il fulmine parte ogni 4 colpi e salta su 5 nemici":"Ogni 5 colpi un fulmine salta su 3 nemici vicini", apply(){}},
  {id:'esecuz', name:"Esecuzione",         icon:'skull', max:2, desc:()=>nxLv('esecuz')>1?"Uccidi al primo colpo i nemici sotto il 25% di vita":"Uccidi al primo colpo i nemici sotto il 15% di vita (non i guardiani)", apply(){}},
  {id:'cadaveri',name:"Cadaveri esplosivi",icon:'meteor',max:2, desc:()=>nxLv('cadaveri')>1?"Le esplosioni sono più grandi e fanno più danno":"I nemici che uccidi esplodono e feriscono quelli vicini", apply(){}},
  {id:'scia',   name:"Scia di fuoco",      icon:'fire',  max:2, desc:()=>nxLv('scia')>1?"Le fiamme durano di più e bruciano più forte":"Lo scatto lascia fiamme a terra che bruciano i nemici", apply(){}},
  {id:'turbine',name:"Turbine",            icon:'spin',  max:2, desc:()=>nxLv('turbine')>1?"La giravolta è più ampia e scaraventa via i nemici":"Il salto in aria fa una giravolta che colpisce tutto intorno", apply(){}},
  {id:'spine',  name:"Spine",              icon:'shield',max:2, desc:()=>nxLv('spine')>1?"Le spine fanno quasi il doppio del danno":"Chi ti colpisce da vicino subisce danno", apply(){}},
  {id:'famiglio',name:"Famiglio",          icon:'orbit', max:2, desc:()=>nxLv('famiglio')>1?"Il famiglio spara più spesso e più forte":"Uno spirito ti segue e spara ai nemici", apply(){}},
  {id:'gelo',   name:"Gelo critico",       icon:'snow',  max:2, desc:()=>nxLv('gelo')>1?"Il gelo dei critici arriva più lontano":"I colpi critici rallentano i nemici intorno", apply(){}},
  {id:'rubini', name:"Calamita di rubini", icon:'star',  max:2, desc:()=>nxLv('rubini')>1?"I rubini cadono più spesso e sono di più":"I nemici che uccidi a volte lasciano rubini", apply(){}}
);
const cardHit=(e,mul,dir,o)=>hitEnemy(e,Math.max(1,weaponDamage()*mul),dir,Object.assign({noCombo:true,card:true,unblockable:true},o||{}));
const foesNear=(x,y,r,skip)=>foes().filter(e=>e!==skip&&Math.hypot(e.x-x,(e.y+e.h/2)-y)<r+e.w/2);

/* ---------- Esecuzione e Fulmine a catena: dentro il colpo ---------- */
const _hitCard=hitEnemy;
hitEnemy=function(e,base,dir,o){o=o||{};
  if(!e||!cardOn()||e.pvp!=null||o.env)return _hitCard(e,base,dir,o);
  const lx=lvC('esecuz');
  if(lx&&!o.card&&base>0&&e.type!=='boss'&&!e.dead&&!(e.spawnT>0)&&e.maxHp>0&&e.hp/e.maxHp<(lx>1?0.25:0.15)){
    base=Math.max(base,e.hp+10);o=Object.assign({},o,{unblockable:true});popNum(e.x,e.y+e.h+0.7,'Esecuzione!','crit');fxSlash(e.x,e.y+e.h*0.55,0,0xff4d6d,1.3,0,0.6,0.3);}
  const r=_hitCard(e,base,dir,o);
  const lc=lvC('catena');
  if(lc&&o.melee&&!o.card){G.chainN=(G.chainN||0)+1;if(G.chainN>=(lc>1?4:5)){G.chainN=0;let from=e;const list=foesNear(e.x,e.y+e.h/2,8,e).sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x)).slice(0,lc>1?5:3);
      sfx('zap');for(const t of list){lightning(from.x,from.y+from.h/2,t.x,t.y+t.h/2);cardHit(t,0.6,t.x>=from.x?1:-1,{kb:2,stun:0.25});burst(t.x,t.y+t.h/2,0xfff27a,8,4,1,0.2);from=t;}}}
  return r;};

/* ---------- Gelo critico: chiamato dai colpi critici ---------- */
function cardCrit(e,dir){const lg=lvC('gelo');if(!lg||!cardOn()||!e||(G.frostT||0)>G.time)return;G.frostT=G.time+0.35;
  const r=lg>1?3.6:2.5,x=e.x,y=e.y+e.h/2;fxRing(x,y,0,0x8fdcff,r,0.4,true);burst(x,y,0xbfeaff,16,5,1,0.2);
  for(const t of foesNear(x,y,r,null))cardHit(t,0.12,t.x>=x?1:-1,{effect:'gelo',kb:0.5});}

/* ---------- uccisioni tue: cadaveri esplosivi e rubini ---------- */
function onMyKill(x,y,e){if(!cardOn())return;
  const lk=lvC('cadaveri');if(lk&&!(e&&e.type==='boss')){const r=lk>1?3:2.2,mul=lk>1?0.8:0.5;
    setTimeout(()=>{if(!cardOn())return;burst(x,y,0xff7a2e,22,7,3,0.3);burst(x,y,0xffd27a,10,5,2,0.2);fxRing(x,y,0,0xff7a2e,r,0.35,true);sfx('boom');shake(0.15);
      for(const t of foesNear(x,y,r,e))cardHit(t,mul,t.x>=x?1:-1,{kb:7,ky:5});},90);}
  const lr=lvC('rubini');if(lr&&Math.random()<(lr>1?0.28:0.15))addCoins((lr>1?2:1)+Math.floor(G.floor/12)+(e&&e.elite?3:0),x,y+1.2);}
const _keCard=killEnemy;
killEnemy=function(e){const was=e.dead;const r=_keCard(e);
  if(!was&&e.dead&&!e.escaped&&!e.net&&e.pvp==null&&cardOn()&&(!MP.live()||(MP.host&&(e.lastBy==null||e.lastBy===MP.myPid))))onMyKill(e.x,e.y+e.h*0.5,e);
  return r;};
// gli ospiti sanno di aver ucciso quando l'host gli manda l'esperienza
const _mmCard=mpMsg;
mpMsg=function(m,from){const r=_mmCard(m,from);if(m&&m.t==='xp'&&!MP.host&&G.scene==='tower'&&m.f===G.floor)onMyKill(m.x,m.y,null);return r;};

/* ---------- Spine: chi ti colpisce da vicino si fa male ---------- */
const _hpCard=hurtPlayer;
hurtPlayer=function(d,fx,eff){if(MP.redir>=0||!lvC('spine')||!cardOn()||P.dead)return _hpCard(d,fx,eff);
  const h0=P.hp,r=_hpCard(d,fx,eff);
  if(P.hp<h0&&fx!=null){const near=foes().filter(e=>Math.abs(e.x-fx)<1.2&&Math.abs(e.x-P.x)<3.2).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0];
    if(near){cardHit(near,lvC('spine')>1?1.3:0.7,near.x>=P.x?1:-1,{kb:6});fxSpikes(P.x,P.y,0,0xc9e08a,7,1.2,0.9,0.35);}}
  return r;};

/* ---------- ogni fotogramma nella torre: scia di fuoco, turbine, famiglio ---------- */
const PET={g:null,x:0,y:0,cd:1};
function petBuild(){const g=new THREE.Group(),c=new THREE.MeshBasicMaterial({color:0xdffaff}),h=new THREE.MeshBasicMaterial({color:0x7fe0ff,transparent:true,opacity:0.35,depthWrite:false,blending:THREE.AdditiveBlending});
  g.add(new THREE.Mesh(sph(0.16,14,10),c));const halo=new THREE.Mesh(sph(0.34,14,10),h);g.add(halo);
  for(const s of [-1,1]){const w=new THREE.Mesh(sph(0.12,10,8),h);w.scale.set(1.6,0.5,0.6);w.position.set(s*0.2,0.06,-0.05);g.add(w);g.userData['w'+s]=w;}
  g.userData.halo=halo;scene.add(g);return g;}
function cardTick(dt){if(!cardOn()||G.state!=='play'){return;}
  // scia di fuoco
  const ls=lvC('scia');if(ls&&P.dashT>0&&!P.dead){G.trailD=(G.trailD||0)+Math.abs(P.vx)*dt;if(G.trailD>1.1&&P.y<2.5){G.trailD=0;
      addZone({x:clamp(P.x,-HALF+1,GATE_X-1),r:0.85,t:ls>1?3.5:2.5,dmg:weaponDamage()*(ls>1?0.28:0.18),col:0xff7a2e,eff:'fuoco',h:2.2});}}else G.trailD=0.6;
  // turbine: il salto a mezz'aria
  const lt=lvC('turbine');if(lt&&!P.onGround&&G.prevAJ!=null&&P.airJumps<G.prevAJ&&!P.dead){const r=lt>1?2.9:2.2,x=P.x,y=P.y+1;
    fxRing(x,y,0,0x7ff0e4,r,0.35,true);fxSlash(x,y,0,0x7ff0e4,r*0.7,0,0,0.25);burst(x,y,0x7ff0e4,16,6,1,0.1);sfx('swing');
    for(const t of foesNear(x,y,r,null))cardHit(t,lt>1?1.0:0.7,t.x>=x?1:-1,{kb:lt>1?11:7,ky:lt>1?9:6});}
  G.prevAJ=P.airJumps;
  // famiglio
  const lf=lvC('famiglio');
  if(lf&&!P.dead){if(!PET.g){PET.g=petBuild();PET.x=P.x;PET.y=P.y+2.4;}PET.g.visible=true;
    const tx=P.x-P.face*0.9,ty=P.y+2.3+Math.sin(G.time*3)*0.18,k=Math.min(1,dt*6);PET.x+=(tx-PET.x)*k;PET.y+=(ty-PET.y)*k;PET.g.position.set(PET.x,PET.y,0.5);
    PET.g.userData.halo.scale.setScalar(1+Math.sin(G.time*8)*0.12);for(const s of [-1,1])PET.g.userData['w'+s].rotation.z=s*Math.sin(G.time*18)*0.6;
    PET.cd-=dt;if(PET.cd<=0){const t=foes().filter(e=>Math.abs(e.x-PET.x)<12).sort((a,b)=>Math.abs(a.x-PET.x)-Math.abs(b.x-PET.x))[0];
      if(t){PET.cd=lf>1?0.9:1.4;const ax=t.x-PET.x,ay=(t.y+t.h/2)-PET.y,l=Math.hypot(ax,ay)||1;
        pProj({x:PET.x,y:PET.y,vx:ax/l*15,vy:ay/l*15,kind:'bolt',col:0x9ef0ff,sz:0.5,dmg:weaponDamage()*(lf>1?0.5:0.35),homing:8,life:1.6,kb:2});burst(PET.x,PET.y,0x9ef0ff,5,2,0,0);}
      else PET.cd=0.3;}}
  else if(PET.g)PET.g.visible=false;}
const _ufCard=updFloor;updFloor=function(dt){_ufCard(dt);try{cardTick(dt);}catch(err){console.warn('carte',err);}};
setInterval(()=>{if(PET.g&&(G.scene!=='tower'||!lvC('famiglio')||P.dead))PET.g.visible=false;},300);
