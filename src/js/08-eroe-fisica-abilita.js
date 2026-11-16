/* =========================================================
   EROE E ARMA EQUIPAGGIATA
   ========================================================= */
let hero=null;
function setHero(cls){if(hero){scene.remove(hero.root);disposeObj(hero.root);}hero=buildHero(cls);scene.add(hero.root);if(G.weapon)attachWeapon();refreshGearVisual();}
// ogni tipo d'arma ha 4 modelli (con carattere e forma propri); il nome cambia anche con la rarità
const WMODELS={
  spada:[{n:'Spada'},{n:'Spadone',dmg:1.12,cd:1.1,len:1.2},{n:'Sciabola',dmg:0.93,cd:0.9,crit:0.03,len:0.95},{n:'Stocco',dmg:0.95,crit:0.06,len:1.1,wid:0.7}],
  ascia:[{n:'Ascia'},{n:'Bipenne',dmg:1.1,cd:1.08,wid:1.2},{n:'Accetta',dmg:0.9,cd:0.88,len:0.85},{n:'Ascia barbuta',crit:0.04,wid:1.1}],
  lancia:[{n:'Lancia'},{n:'Alabarda',dmg:1.1,cd:1.1,wid:1.2},{n:'Picca',dmg:0.95,cd:0.94,len:1.15},{n:'Tridente',crit:0.04,wid:1.1}],
  pugnali:[{n:'Pugnali'},{n:'Kunai',dmg:0.94,cd:0.9},{n:'Stiletti',crit:0.06,wid:0.7},{n:'Coltellacci',dmg:1.1,cd:1.05,len:1.15}],
  martello:[{n:'Martello'},{n:'Maglio',dmg:1.12,cd:1.1,wid:1.2},{n:'Mazza',dmg:0.92,cd:0.9,len:0.9},{n:'Mazza chiodata',crit:0.04}],
  falce:[{n:'Falce'},{n:'Falce da guerra',dmg:1.1,cd:1.06,len:1.1},{n:'Mietitrice',crit:0.05},{n:'Falcetto',dmg:0.92,cd:0.9,len:0.85}],
  katana:[{n:'Katana'},{n:'Nodachi',dmg:1.12,cd:1.1,len:1.2},{n:'Wakizashi',dmg:0.92,cd:0.9,len:0.85},{n:'Tachi',crit:0.05}],
  pugni:[{n:'Tirapugni'},{n:'Guanti chiodati',crit:0.05},{n:'Cesti',dmg:1.1,cd:1.05,wid:1.2},{n:'Artigli',dmg:0.95,cd:0.9,len:1.2}],
  arco:[{n:'Arco'},{n:'Arco lungo',dmg:1.12,cd:1.1,len:1.2},{n:'Arco corto',dmg:0.92,cd:0.9,len:0.85},{n:'Arco ricurvo',crit:0.05}],
  bastone:[{n:'Sfera'},{n:'Cristallo',crit:0.05},{n:'Focus runico',dmg:1.1,cd:1.05},{n:'Gemma',dmg:0.94,cd:0.9}],
};
const RSUF=[['di ferro','di bronzo','di legno'],["d'acciaio",'del veterano','della guardia'],['delle rune','del mago','di cristallo'],["d'ossidiana",'del Vuoto',"dell'Inferno"],["dell'Alba",'della Fenice','del Sole nero'],['del Titano','dei Re antichi',"dell'Abisso"],['degli Immortali','del Firmamento','della Creazione']];
const wModel=w=>(WMODELS[w.type]||[{}])[w.v||0]||{};
function applyVariant(a,w){if(!w||!a||!a.g)return a;const m=wModel(w),L=m.len||1,Wd=m.wid||1,map=WNEW[w.type]||[];
  const d=map.length?map[(w.v||0)<map.length?(w.v||0):0]:null;
  if(d!=null){if(a.g.parent)a.g.parent.remove(a.g);disposeObj(a.g);const b=buildWeapon2(w.type,d,w.rarity||0,w.effect,true);if(L!==1)b.g.scale.set(1,L,1);wfxAdd(b.g,w);return b;}
  if(L!==1||Wd!==1)a.g.scale.set(Wd,L,Wd);
  if(w.type==='bastone'){const f=wfxCatalyst(a,w);wfxAdd(a.g,w,[f]);}
  return a;}
function makeWeapon(type,rarity,floor,v){const T=WTYPES[type],R=RARITY[rarity],mods=WMODELS[type]||[{n:T.names[rarity]}];v=v==null?Math.floor(Math.random()*mods.length):v;const m=mods[v]||{};
  const w={type,rarity,v,name:m.n?`${m.n} ${pick(RSUF[rarity])}`:T.names[Math.min(rarity,T.names.length-1)],dmg:Math.round(T.dmg*R.mul*(m.dmg||1)*(1+0.05*(floor-1))),cdMul:m.cd||1,critB:m.crit||0,effect:null,bonusReach:rarity>=4};
  if(rarity>=2)w.effect=pick(rarity>=3?['fuoco','gelo','fulmine','vampiro']:['fuoco','gelo']);
  if(rarity>=2){const pool=Object.keys(PERKS).filter(k=>floor>=PERKS[k].from&&rarity>=PERKS[k].minR);if(pool.length&&Math.random()<[0,0,0.15,0.35,0.8,0.9,1][rarity])w.perk=pick(pool);}
  return w;}
// se il modello di un'arma non si costruisce (combinazione rara/mitica non prevista) non deve bloccare la scalata: ripiego
function safeWeaponBuild(w){
  try{return applyVariant(buildWeaponMesh(w.type,w.rarity,w.effect),w);}
  catch(e){console.error('Modello arma non costruibile, ripiego:',w&&w.type,w&&w.rarity,e);
    const g=new THREE.Group(),R=RARITY[(w&&w.rarity)||0]||RARITY[0];
    mesh(rbox(0.09,1.3,0.09,0.02),toon(R.hex,{emissive:R.hex,emissiveIntensity:0.25}),0,0.65,0,g,true);
    mesh(rbox(0.26,0.09,0.12,0.03),toon(0x4a4a54),0,0.02,0,g,true);
    const tip=new THREE.Object3D();tip.position.set(0,1.32,0);g.add(tip);return {g,tip};}
}
function attachWeapon(){
  for(const a of hero.arms)for(const c of [...a.wr.children])if(!c.userData.skin){a.wr.remove(c);disposeObj(c);}
  const w=G.weapon,a=safeWeaponBuild(w);hero.arms[0].wr.add(a.g);hero.wpnF=a.g;hero.tipF=a.tip;hero.tipB=null;
  hero.wpnB=null;if(w.type==='pugnali'){const b=safeWeaponBuild(w);hero.arms[1].wr.add(b.g);hero.tipB=b.tip;hero.wpnB=b.g;}
  const col=w.effect?EFFECTS[w.effect].color:(w.rarity?RARITY[w.rarity].hex:0xffe2b0);
  trailMat.uniforms.uColor.value.setHex(col);streakMat.uniforms.uColor.value.setHex(col);refreshWeaponScale();
}
const weaponScale=()=>1+(S.reach*(G.weapon&&G.weapon.bonusReach?1.15:1)-1)*0.85;
function refreshWeaponScale(){if(!hero||!G.weapon)return;const sc=weaponScale();for(const a of hero.arms)a.wr.scale.setScalar(sc);}
const weaponDamage=()=>G.weapon.dmg*S.dmgMul*(1+S.lvDmg)*(G.inAbil?1+0.15*(G.cls.tier||0):1)*(P.rageT>0?1.3:1)*(P.bearT>0?1.35:1);

/* =========================================================
   FISICA COMUNE
   ========================================================= */
const overlap=(ax1,ax2,ay1,ay2,b)=>ax2>b.x-b.w/2&&ax1<b.x+b.w/2&&ay2>b.y&&ay1<b.y+b.h;
function rightBound(b){if(G.pvp&&G.scene==='tower'&&typeof PVA!=='undefined')return PVA.r;if(G.scene==='tower')return(b.isEnemy||!G.gateOpen)?GATE_X-0.5:HALF-0.6;return G.bounds.right;}
function moveBody(b,dt){
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(b.vx),Math.abs(b.vy))*dt/0.25)),h=dt/steps;
  b.onGround=false;b.hitWall=0;b.bonk=false;for(let i=0;i<steps;i++)stepBody(b,h);
}
function stepBody(b,h){
  b.x+=b.vx*h;
  const L=G.bounds.left+b.w/2,R=rightBound(b)-b.w/2;
  if(b.x<L){b.x=L;b.hitWall=-1;}else if(b.x>R){b.x=R;b.hitWall=1;}
  const py=b.y;b.y+=b.vy*h;
  if(b.y+b.h>G.bounds.ceil){b.y=G.bounds.ceil-b.h;if(b.vy>0)b.vy=0;b.bonk=true;}
  if(b.y<=0){b.y=0;if(b.vy<0)b.vy=0;b.onGround=true;}
  if(!b.ghost&&!(b.dropT>0)&&b.vy<=0)for(const s of G.solids){   // piattaforme a senso unico: ci si sale da sotto, si atterra sopra
    if(b.x+b.w/2>s.x1+0.01&&b.x-b.w/2<s.x2-0.01&&py>=s.y2-0.06&&b.y<=s.y2){b.y=s.y2;b.vy=0;b.onGround=true;}}
}

/* =========================================================
   EROE: movimento, stamina, attacchi, abilità
   ========================================================= */
function useStam(n){if(P.stam<n){if(P.tiredT<=0){popNum(P.x,P.y+2.4,'Senza fiato','info');sfx('tired');P.tiredT=0.7;const b=$('stamBar');b.classList.remove('low');void b.offsetWidth;b.classList.add('low');}return false;}
  P.stam-=n;P.stamDelay=0.5;return true;}
function updPlayer(dt){
  if(P.dead){P.vy+=GRAV*dt;P.vx*=0.95;moveBody(P,dt);return;}
  P.atkCd-=dt;P.dashCd-=dt;P.invul-=dt;P.coyote-=dt;P.jumpBuf-=dt;P.kbT-=dt;P.comboT-=dt;P.landT-=dt;P.blockT-=dt;P.stretchT-=dt;P.flipT-=dt;P.hurtT-=dt;P.tiredT-=dt;
  P.skidT=(P.skidT||0)-dt;P.ghostT=(P.ghostT||0)-dt;
  P.abilCd-=dt;P.abil2Cd-=dt;P.abil3Cd=(P.abil3Cd||0)-dt;P.bearT=(P.bearT||0)-dt;
  if(P.regenT>0){P.regenT-=dt;heal(S.maxHp*0.07*dt,true);if(Math.random()<0.3)burst(P.x+rand(-.4,.4),P.y+rand(0.2,1.8),0x7fe08a,1,1,2,-0.4);}
  if(P.punchT>0){P.punchT-=dt;P.punchTick-=dt;if(P.punchTick<=0){P.punchTick=0.07;P.atk=null;startAttack(true);sfx('stab');
    for(const e of foes())if(overlap(P.face>0?P.x:P.x-2.2,P.face>0?P.x+2.2:P.x,P.y+0.2,P.y+2.2,e))hitEnemy(e,weaponDamage()*0.35,P.face,{kb:2,hs:0.2,noCombo:false});
    burst(P.x+P.face*1.4,P.y+1.3,0xffb347,3,4,1);}}P.shieldT-=dt;P.rageT-=dt;P.stamDelay-=dt;P.slowT-=dt;P.throwT-=dt;
  if(P.stamDelay<=0)P.stam=Math.min(S.stamMax,P.stam+S.stamRegen*dt);
  if(P.dot){P.dot.t-=dt;P.dot.acc+=dt;if(Math.random()<0.3)burst(P.x+rand(-.3,.3),P.y+rand(.3,1.8),P.dot.col,1,1,2,-0.3);
    if(P.dot.acc>=0.5){P.dot.acc-=0.5;P.hp-=P.dot.dmg;popNum(P.x,P.y+2.1,'-'+P.dot.dmg,'burn');if(P.hp<=0){playerDie();return;}}
    if(P.dot.t<=0)P.dot=null;}
  if(input.jumpPressed)P.jumpBuf=0.13;
  const dir=(input.right?1:0)-(input.left?1:0),spd=S.speed*(P.rageT>0?1.1:1)*(P.slowT>0?0.6:1)*(P.spinT>0?0.7:1),wasGround=P.onGround,vyBefore=P.vy;
  if(P.slowT>0&&Math.random()<0.25)burst(P.x+rand(-.3,.3),P.y+rand(0,1),0x8fdcff,1,1,0.5,0.2);
  const swinging=P.atk&&P.atk.t<P.atk.wind+P.atk.act;
  if((P.dashT>0||P.chargeT>0||P.plunge||P.dragon)&&P.ghostT<=0){P.ghostT=0.045;spawnGhost(P.chargeT>0?0x7fc8ff:0x7ff0e4);}
  if(P.dragon){P.vx=approach(P.vx,dir*spd*0.6,30*dt);if(P.dragon==='up'&&P.vy<=2){P.dragon='down';P.vy=-34;}if(Math.random()<0.6)burst(P.x,P.y+1,0x7ff0e4,1,1,0,0);}
  else if(P.chargeT>0){P.chargeT-=dt;const ck=P.chargeKind||'carica',cc=ck==='fenice'?0xff7a2e:ck==='iaido'?0xff4d6d:0x7fc8ff;
    P.vx=P.face*(ck==='iaido'?34:ck==='fenice'?22:20);if(ck==='fenice')P.vy=0;
    if(Math.random()<0.9)burst(P.x-P.face*0.4,P.y+rand(0.2,1.8),cc,ck==='fenice'?3:1,1,0,0);
    for(const e of G.enemies){if(e.dead||e.spawnT>0||P.chargeSet.has(e))continue;if(overlap(P.face>0?P.x:P.x-1.5,P.face>0?P.x+1.5:P.x,P.y,P.y+2.2,e)){P.chargeSet.add(e);shake(0.2);
      if(ck==='carica')hitEnemy(e,weaponDamage()*1.3,P.face,{melee:true,kb:13,stun:1.3,unblockable:true,effect:G.weapon.effect});
      else if(ck==='fenice')hitEnemy(e,weaponDamage()*1.6,P.face,{kb:9,unblockable:true,effect:'fuoco'});
      else later(0.25,()=>{if(!e.dead){burst(e.x,e.y+e.h/2,0xff4d6d,16,7,1);hitEnemy(e,weaponDamage()*2.2,P.face,{kb:8,ky:6,hs:0.5,unblockable:true,crit:Math.random()<0.5});}});}}}
  else if(P.dashT>0){P.dashT-=dt;P.vx=P.face*24;P.vy=0;if(Math.random()<0.7)burst(P.x-P.face*0.3,P.y+rand(0.3,1.7),0x7ff0e4,1,1,0,0);}
  else if(P.kbT>0){P.vx*=0.9;}
  else{const acc=P.onGround?70:38;P.vx=approach(P.vx,dir*spd,acc*dt);
    if(dir&&P.onGround&&Math.sign(P.vx)===-dir&&Math.abs(P.vx)>5.5&&P.skidT<=0){P.skidT=0.16;burst(P.x+P.face*0.3,P.y+0.05,0xb9ad98,6,3,0.8);}
    if(dir&&!swinging&&dir!==P.face)P.face=dir;}
  P.dropT=(P.dropT||0)-dt;
  if(input.down&&P.jumpBuf>0&&P.onGround&&P.y>0.05&&P.dashT<=0){P.dropT=0.28;P.jumpBuf=0;P.onGround=false;P.coyote=0;P.y-=0.1;}   // giù + salto: scendi dalla piattaforma
  if(P.onGround){P.coyote=0.1;P.airJumps=Math.min(2,S.extraJumps);}
  if(P.jumpBuf>0&&P.dashT<=0&&!P.dragon){
    if(P.coyote>0){P.vy=S.jump;P.coyote=0;P.jumpBuf=0;P.stretchT=0.16;burst(P.x,P.y+0.1,0xb9ad98,6,3,1);sfx('jump');}
    else if(P.airJumps>0){P.vy=S.jump*0.92;P.airJumps--;P.jumpBuf=0;P.flipT=0.42;burst(P.x,P.y+0.3,0x7ff0e4,12,4,0);sfx('flip');}
  }
  if(P.plunge){P.vy=-27;if(Math.random()<0.7)burst(P.x,P.y+1.6,0xffe2b0,1,1,0,0);}
  else if(P.chargeT>0&&P.chargeKind==='fenice'){P.vy=0;}
  else if(P.dashT<=0){P.airHang=(P.airHang||0)-dt;P.vy+=GRAV*dt*(P.airHang>0&&!P.plunge?0.07:1);if(!input.jumpHeld&&P.vy>0&&!P.dragon)P.vy+=GRAV*dt*1.3;}
  P.vy=Math.max(P.vy,P.dragon?-36:-30);
  const fight=G.scene==='tower'&&!G.safe;
  if(fight&&input.dashPressed&&P.dashCd<=0&&P.dashT<=0&&!P.dragon&&useStam(20)){P.plunge=false;P.dashT=0.17;P.dashCd=0.6;if(dir)P.face=dir;burst(P.x,P.y+1,0x7ff0e4,8,4,0,0);sfx('dash');P.atk=null;}
  if(fight&&input.abilPressed)useAbility();
  if(fight&&input.abil2Pressed)useAbility2();
  if(fight&&input.abil3Pressed)useAbility3();
  if(P.spinT>0){P.spinT-=dt;P.spinTick-=dt;if(Math.random()<0.6)burst(P.x+rand(-1.6,1.6),P.y+rand(0.5,1.6),0xff4a2e,1,2,1,0);
    if(P.spinTick<=0){P.spinTick=0.18;sfx('swing');for(const e of G.enemies){if(e.dead||e.spawnT>0)continue;const dx=e.x-P.x;
      if(Math.abs(dx)<2.8+e.w/2&&e.y<P.y+2.6&&e.y+e.h>P.y-0.4)hitEnemy(e,weaponDamage()*0.5,dx>=0?1:-1,{kb:5,unblockable:true,effect:G.weapon.effect});}}}
  if(fight&&(input.atkPressed||input.atkHeld)&&P.atkCd<=0&&!P.dragon&&P.dashT<=0&&P.spinT<=0&&P.chargeT<=0){
    const cost=WTYPES[G.weapon.type].cost*(P.rageT>0?0.5:1);
    if(P.stam>=cost||input.atkPressed){if(useStam(cost))startAttack(false);else P.atkCd=0.15;}
  }
  if(P.atk)updAttack(dt);
  moveBody(P,dt);
  if(P.bonk&&vyBefore>4)burst(P.x,P.y+P.h,0xb9ad98,4,2,0);
  if(!wasGround&&P.onGround&&vyBefore<-6){P.landT=0.16;P.flipT=0;if(vyBefore<-12){sfx('land');burst(P.x,P.y+0.05,0xb9ad98,6,2.5,0.6);}}
  if(P.onGround&&P.dragon==='down')dragonImpact();
  if(P.plunge&&(P.onGround||!P.atk)){P.plunge=false;if(P.atk)P.atk.hold=false;if(P.onGround){plungeImpact();
    if(G.weapon.perk==='sisma')for(const s of [-1,1])spawnProj({x:P.x+s*0.8,y:P.y,vx:s*12,vy:0,w:0.6,h:1,dmg:weaponDamage()*0.6,owner:'p',life:0.8,kind:'shock'});}}
}
// colpo a terra dopo l'attacco in picchiata: ogni classe ha il suo
const CLS_COL={cavaliere:0x7fc8ff,berserker:0xff4a2e,lanciere:0x7ff0e4,assassino:0x9a7aff};
function aimTarget(x,y,f){let best=null,bs=1e9;for(const e of foes()){const dx=(e.x-x)*f;if(dx<0.3||dx>17)continue;const a=Math.atan2(e.y+e.h*0.5-y,dx);if(Math.abs(a)>0.8)continue;
  const s=dx+Math.abs(a)*5;if(s<bs){bs=s;best=e;}}return best;}
const aimAngle=(x,y,f)=>{const e=aimTarget(x,y,f);return e?Math.atan2(e.y+e.h*0.5-y,Math.abs(e.x-x)):null;};
function plungeImpact(){
  const id=G.cls.id,x=P.x,y=P.y,col=G.cls.fx||CLS_COL[id]||0xffffff,hit=(r,mul,o)=>aoe(x,y+0.9,r*1.15,mul*1.1,Object.assign({kb:7,ky:5,hs:0.3},o||{}));
  shake(0.38);G.hitstop=Math.max(G.hitstop,0.06);sfx('slam');burst(x,y+0.1,0xb9ad98,22,7,1.5);fxRing(x,y+0.05,0,0xffe2b0,3.6,0.5);moveName('da');burst(x,y+0.25,col,24,7,2,0.5);fxRing(x,y+0.06,0,col,2.8,0.45);
  switch(id){
  case 'cavaliere':hit(2.6,1,{stun:0.8,kb:10});P.shieldT=Math.max(P.shieldT,0.5);for(const s of [-1,1])fxRing(x+s*0.6,y+1,0,col,1.3,0.35,true);break;
  case 'berserker':hit(3.2,1.3,{ky:10});fxSpikes(x,y,0,0x8a7a6a,9,1.7,0.9,0.75);shake(0.5);P.rageT=Math.max(P.rageT,0.6);break;
  case 'lanciere':hit(2.4,1.1);fxSpikes(x,y,0,col,6,1.4,1.5,0.6);for(const s of [-1,1])pProj({x:x+s*0.8,y,vx:s*13,vy:0,w:0.6,h:1,dmg:weaponDamage()*0.6,life:0.7,kind:'shock'});break;
  case 'assassino':hit(2.2,1.1,{crit:Math.random()<0.5});burst(x,y+0.8,0x2a2438,30,6,2,0.1);P.invul=Math.max(P.invul,0.35);spawnGhost(col);break;
  case 'mago':hit(2.8,1.1,{effect:'fuoco'});fxPillar(x,y,0,col,1.3,3,0.5);burst(x,y+0.5,0xffd27a,20,6,4,0.4);break;
  case 'criomante':hit(2.6,1,{effect:'gelo',stun:0.5});fxSpikes(x,y,0,col,10,1.9,1.1,0.9);break;
  case 'tempesta':lightning(x,CEIL,x,y+0.2);lightning(x+rand(-1,1),CEIL,x,y+0.2);hit(2.6,1.1,{effect:'fulmine',stun:0.4});fxPillar(x,y,0,col,0.5,7,0.3);sfx('zap');break;
  case 'druido':fxSpikes(x,y,0,0x5fae4a,8,1.9,1.3,0.8);hit(2.6,1,{ky:12,hs:0.6});break;
  case 'astromante':hit(2.6,1);for(let i=0;i<4;i++)pProj({x,y:y+1,vx:(i<2?-1:1)*rand(4,8),vy:rand(8,12),kind:'bolt',col,sz:0.8,dmg:weaponDamage()*0.6,homing:7,life:2});break;
  case 'negromante':fxSpikes(x,y,0,0xe6dcc6,10,2,1,0.8);{const n=hit(2.8,1,{effect:'vampiro'});if(n)heal(n*2);}break;
  case 'paladino':fxPillar(x,y,0,col,1.1,7,0.6);hit(3,1.2,{kb:10});heal(Math.round(S.maxHp*0.03));break;
  case 'arciere':{hit(2,0.8);const tg=nearest(4,x,6).map(e=>e.x);for(let i=0;i<16;i++)later(0.035*i,()=>pProj({x:(i<tg.length*2?tg[i%tg.length]+rand(-0.5,0.5):x+rand(-3.4,3.4)),y:CEIL+rand(0,1.5),vx:rand(-1,1),vy:-34,kind:'arrow',w:0.3,h:0.8,dmg:weaponDamage()*0.45,life:0.75}));break;}   // pioggia fitta: 16 frecce, le prime puntano i nemici vicini
  case 'samurai':hit(2.4,1.3,{crit:Math.random()<0.6});fxSlash(x,y+0.9,0,col,1.6,0,0.8);fxSlash(x,y+0.9,0,col,1.6,0,-0.8);break;
  case 'monaco':hit(3.4,1.1,{kb:14,ky:6});for(const s of [-1,1])fxRing(x+s*0.8,y+0.9,0,col,1.6,0.4,true);break;
  default:hit(2.4,1);
  }
}
function moveName(mv){if(G.scene!=='tower'||G.time-(G.mvNameT||-9)<2.2)return;G.mvNameT=G.time;popNum(P.x,P.y+2.7,MOVES[mv].name,'info');}
function pickMove(){const d=input.atkDir||input.atkHold;input.atkDir=null;const air=!P.onGround,up=d?d.y>0:input.up,down=d?d.y<0:input.down,side=d?d.x!==0:(input.left||input.right);
  return air?(down?'da':up?'ua':side?'sa':'na'):(down?'dl':up?'ul':side?'sl':'nl');}
function startAttack(visualOnly,forceMove){
  if(!visualOnly){const d=(input.right?1:0)-(input.left?1:0);if(d)P.face=d;}
  const T=WTYPES[G.weapon.type],sp=S.atkSpd*(P.rageT>0?1.5:1),mv=forceMove||(visualOnly?'nl':pickMove()),M=MOVES[mv],animKey=(T.cast&&['nl','sl','sa','na'].includes(mv))?T.anim:(M.anim||T.anim),An=ANIM[animKey];
  if(mv==='nl')P.combo=P.comboT>0?P.combo+1:0;else P.combo=0;
  const fin=mv==='nl'&&!visualOnly&&P.combo%3===2;        // terzo colpo della catena: finale potente
  const useB=mv==='nl'&&An.alt==='hand'&&P.combo%2===1,hand=useB?'B':'F',arm=hero.arms[useB?1:0];
  const A={t:0,wind:An.wind/sp,act:An.act/sp*(fin?1.15:1),rec:An.rec/sp*(fin?1.2:1),hand,anim:animKey,mv,fin,hitSet:new Set(),fired:false,noHit:visualOnly,hold:!!An.hold,
    r0:{sh:arm.sh.rotation.x,el:arm.el.rotation.x,wr:arm.wr.rotation.x},rest:useB?(BREST[G.cls.id]||BREST_DEF):WREST[G.weapon.type]};
  if(An.kind==='arc'){let f=An.from,t=An.to;if(An.flip&&P.combo%2===1){f=An.flip[0];t=An.flip[1];}A.from=near(f,A.r0.sh);A.to=A.from+(t-f);A.restSh=near(A.rest.sh,A.to);}
  else{A.wSh=near(An.w.sh,A.r0.sh);A.aSh=A.wSh+(An.a.sh-An.w.sh);A.restSh=near(A.rest.sh,A.aSh);}
  P.atk=A;P.atkCd=T.cd*(M.cd||1)*(G.weapon.cdMul||1)*(fin?1.35:1)/sp;P.comboT=P.atkCd+0.4;
  if(!visualOnly&&mv==='ul'&&G.weapon.perk==='slancio')P.vy=Math.max(P.vy,12);
}
const easeOver=x=>1+(x-1)*(x-1)*(2.2*(x-1)+1.2);   // arriva oltre il bersaglio e torna: colpi più "frustati"
function atkPose(A){
  const An=ANIM[A.anim],t=A.t,w=A.wind,ac=A.act,rc=A.rec,R0=A.r0,RS=A.rest,H=-Math.PI/2;
  let sh,el,wr,off=0,lean=0,st=0,tw=0;
  if(An.kind==='arc'){
    if(t<w){const k=easeOutCubic(t/w);sh=lerp(R0.sh,A.from,k);el=lerp(R0.el,0,k);wr=lerp(R0.wr,0,k);lean=-0.12*k;st=0.35*k;tw=-0.5*k;}
    else if(t<w+ac){const k0=(t-w)/ac,k=easeOver(k0);sh=lerp(A.from,A.to,k);el=0;wr=0;lean=-0.12+0.46*easeOutQuart(k0);st=0.35+0.65*k0;tw=lerp(-0.5,0.6,easeOutQuart(k0));}
    else{const k=easeInOutCubic(Math.min(1,(t-w-ac)/rc));sh=lerp(A.to,A.restSh,k);el=lerp(0,RS.el,k);wr=lerp(0,RS.wr,k);lean=0.34*(1-k);st=1-k;tw=0.6*(1-k);}
  }else{
    const Wp=An.w,Ap=An.a;
    const HV=An.vert?0:H;
    if(t<w){const k=easeOutCubic(t/w);sh=lerp(R0.sh,A.wSh,k);el=lerp(R0.el,Wp.el,k);wr=lerp(R0.wr,HV-A.wSh-Wp.el,k);off=-0.2*k*(An.push?1:0);lean=-0.14*k;st=0.3*k;tw=-0.35*k;}
    else if(t<w+ac){const k0=(t-w)/ac,k=easeOver(k0);sh=lerp(A.wSh,A.aSh,k);el=lerp(Wp.el,Ap.el,k);wr=(An.vert?0:H)-sh-el;off=lerp(-0.2,An.push,k)*(An.push?1:0);lean=-0.14+0.5*easeOutQuart(k0);st=0.3+0.7*k0;tw=lerp(-0.35,0.45,easeOutQuart(k0));}
    else{const k=easeInOutCubic(Math.min(1,(t-w-ac)/rc));sh=lerp(A.aSh,A.restSh,k);el=lerp(Ap.el,RS.el,k);wr=lerp(HV-A.aSh-Ap.el,RS.wr,k);off=lerp(An.push,0,k);lean=0.36*(1-k);st=1-k;tw=0.45*(1-k);}
  }
  if(A.anim==='heavy'||A.fin)lean*=1.5;
  if(An.leanK)lean*=An.leanK;
  if(A.hand==='B')tw=-tw*0.6;
  return {sh,el,wr,off,lean,st,cr:An.cr||0,tw};
}
function updAttack(dt){
  const A=P.atk,An=ANIM[A.anim],M=MOVES[A.mv],holdAt=A.wind+A.act*0.85;
  if(A.hold&&P.plunge&&A.t>=holdAt)A.t=holdAt;else A.t+=dt;
  if(!A.fired&&A.t>=A.wind){A.fired=true;wsfx(A.fin);
    if(P.onGround&&P.kbT<=0)P.vx+=P.face*(M.lunge!=null?M.lunge:(An.lunge||0));
    if(!A.noHit&&A.mv==='da'){P.plunge=true;P.vy=-27;}
    const TT=WTYPES[G.weapon.type];
    if(TT.cast&&!A.noHit&&['nl','sl','sa','na'].includes(A.mv)){A.casted=true;const n=A.fin?3:1,M2=MOVES[A.mv],arrow=TT.cast.kind==='arrow';
      const am=aimAngle(P.x+P.face*0.9,P.y+1.35,P.face);
      for(let i=0;i<n;i++){const a=(am!=null?am:(A.mv==='sa'?-0.15:0))+(i-(n-1)/2)*0.16;
        pProj({x:P.x+P.face*0.9,y:P.y+1.35,vx:Math.cos(a)*TT.cast.spd*P.face,vy:Math.sin(a)*TT.cast.spd,kind:TT.cast.kind,col:G.cls.fx||0xb48cff,sz:arrow?1:(A.fin?1.3:1),homing:arrow?2.2:1.4,
          w:arrow?0.8:0.7,h:arrow?0.55:0.7,dmg:weaponDamage()*(M2.dmg||1)*(A.fin?1.3:1),life:0.9,effect:G.weapon.effect||G.cls.el||null,kb:TT.kb});}
      burst(P.x+P.face*1.0,P.y+1.35,G.cls.fx||0xb48cff,6,3,0.5);}
    if(!A.noHit&&A.fin){shake(0.12);if(G.weapon.perk==='onda')spawnProj({x:P.x+P.face*1.0,y:P.y+1.1,vx:P.face*18,vy:0,w:0.9,h:1.4,dmg:weaponDamage()*0.7,owner:'p',life:0.6,kind:'wave'});}}
  const active=A.t>=A.wind&&(A.t<A.wind+A.act+0.03||(A.hold&&P.plunge));
  if(!A.noHit&&active&&!A.casted)weaponHits(A);
  if(A.t>=A.wind+A.act+A.rec)P.atk=null;
}
function weaponHits(A){
  if(A.mv==='da'&&P.plunge)return;   // in picchiata non colpisci in aria: piombi a terra e fai lo schianto ad area
  const T=WTYPES[G.weapon.type],M=MOVES[A.mv],sc=weaponScale(),L=T.hit[1]*sc;
  let x1,x2,y1,y2;
  if(M.box){x1=M.box[0]*L;x2=M.box[1]*L;y1=M.box[2];y2=M.box[3];}
  else{const h=T.hit;x1=h[0]*sc;x2=h[1]*sc;y1=h[2];y2=h[3]*Math.min(1.25,sc);}
  if(P.face<0){const a=-x2;x2=-x1;x1=a;}
  x1+=P.x;x2+=P.x;y1+=P.y;y2+=P.y;
  const dmg=weaponDamage()*(M.dmg||1)*(A.fin?1.6:1),kb=(M.kb!=null?M.kb:T.kb)*(A.fin?1.8:1);
  const ky=(M.ky||(A.fin?6:0))*(A.mv==='ul'&&G.weapon.perk==='slancio'?1.3:1),hs=M.hs||(A.fin?0.45:0.18);
  for(const e of G.enemies){if(e.dead||e.spawnT>0||A.hitSet.has(e))continue;
    if(overlap(x1,x2,y1,y2,e)){A.hitSet.add(e);
      const dir=A.mv==='na'?(e.x>=P.x?1:-1):P.face;
      if(hitEnemy(e,dmg,dir,{melee:true,kb,ky,hs,critBonus:T.critBonus,effect:G.weapon.effect,unblockable:M.unblock,launch:hs>=0.4})){if(G.tutorial&&G.tut&&(!e.onGround||e.y>0.4))G.tut.air=true;
        if(!A.named){A.named=true;if(A.mv!=='nl'||A.fin)moveName(A.mv);}
        if(!P.onGround)P.vy=Math.max(P.vy,4.5);        // resti sospeso in aria per continuare la combo
      }}}
  for(const p of G.projs){if(p.owner!=='e'||!PARRY[p.kind]||p.dead)continue;
    if(p.x>x1-0.3&&p.x<x2+0.3&&p.y>y1&&p.y<y2){p.dead=true;burst(p.x,p.y,p.kind==='fire'?0xff7a2e:0xd7a8ff,10,5,1);popNum(p.x,p.y+0.4,'Parato','info');sfx('block');}}
}
const GH=[];
function spawnGhost(col){if(!hero||GH.length>10)return;const g=hero.model.clone(true),m=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.4,depthWrite:false,blending:THREE.AdditiveBlending});
  g.traverse(o=>{if(o.isMesh){o.material=m;o.castShadow=false;}});hero.model.updateWorldMatrix(true,false);g.matrixAutoUpdate=false;g.matrix.copy(hero.model.matrixWorld);scene.add(g);GH.push({g,m,t:0});}
function updGhosts(dt){for(const h of GH){h.t+=dt;h.m.opacity=0.4*Math.max(0,1-h.t/0.26);if(h.t>=0.26){scene.remove(h.g);h.m.dispose();h.dead=true;}}for(let i=GH.length-1;i>=0;i--)if(GH[i].dead)GH.splice(i,1);}
// uccisione con un critico: il mostro scoppia in pezzi
const chunkGeo=new THREE.BoxGeometry(0.2,0.2,0.2),chunkMats={};
const chunkMat=hex=>chunkMats[hex]||(chunkMats[hex]=toon(hex));
const dropGeo=sph(0.07,6,5),wallSplatGeo=new THREE.CircleGeometry(1,12),ceilSplatGeo=new THREE.CircleGeometry(1,12);ceilSplatGeo.rotateX(Math.PI/2);
dropGeo.userData.keep=wallSplatGeo.userData.keep=ceilSplatGeo.userData.keep=true;
const DROPM={},SPLM={};
const dropMat=c=>DROPM[c]||(DROPM[c]=(()=>{const m=new THREE.MeshBasicMaterial({color:c});m.userData.keep=true;return m;})());
const splatMat=c=>SPLM[c]||(SPLM[c]=(()=>{const m=new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(0.65),transparent:true,opacity:0.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,side:THREE.DoubleSide});m.userData.keep=true;return m;})());
const bloodOf=e=>(BLOOD[e.type==='boss'?e.arch:e.type]||[0xb01020])[0];
G.drops=[];G.decals=[];
function spray(x,y,col,n,spd,up){if(G.scene!=='tower')return;
  for(let i=0;i<n;i++){const m=new THREE.Mesh(dropGeo,dropMat(col));const s=rand(0.6,1.4);m.scale.setScalar(s);scene.add(m);
    G.drops.push({m,x,y,z:rand(-0.3,0.3),vx:rand(-1,1)*spd,vy:rand(0.1,1)*spd*0.9+(up||0),vz:rand(-1.4,0.5)*spd*0.45,col,s,t:0});}
  while(G.drops.length>140){const d=G.drops.shift();scene.remove(d.m);}}
function splat(kind,x,y,z,col,s,vx,vy){const geo=kind==='floor'?bloodGeo:kind==='ceil'?ceilSplatGeo:wallSplatGeo,m=new THREE.Mesh(geo,splatMat(col)),r=rand(0.12,0.3)*s;
  if(kind==='floor'||kind==='ceil'){m.scale.set(r*rand(1,2.2),1,r);m.rotation.y=rand(0,TAU);}
  else{const st=Math.min(2.2,1+Math.hypot(vx,vy)*0.06);m.scale.set(r*st,r,1);m.rotation.z=Math.atan2(vy,vx);if(kind==='side')m.rotation.y=x<0?Math.PI/2:-Math.PI/2;}
  m.position.set(x,y,z);levelGroup.add(m);G.decals.push(m);if(G.decals.length>160){const o=G.decals.shift();levelGroup.remove(o);}}
function updDrops(dt){
  for(const d of G.drops){d.t+=dt;const py=d.y;d.vy+=GRAV*0.8*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;let hit=null;
    if(d.y<=0.02)hit=['floor',d.x,0.02+Math.random()*0.004,d.z];
    else if(d.vy<0){for(const s of G.solids)if(d.x>s.x1&&d.x<s.x2&&py>=s.y2&&d.y<=s.y2){hit=['floor',d.x,s.y2+0.02,d.z];break;}}
    if(!hit){if(d.z<=-3.1)hit=['back',d.x,d.y,-3.13];else if(d.x<=-HALF+0.05)hit=['side',-HALF+0.03,d.y,d.z];else if(d.x>=HALF-0.05)hit=['side',HALF-0.03,d.y,d.z];else if(d.y>=CEIL-0.05)hit=['ceil',d.x,CEIL-0.03,d.z];}
    if(hit){splat(hit[0],hit[1],hit[2],hit[3],d.col,d.s,d.vx,d.vy);d.dead=true;}else if(d.t>3)d.dead=true;
    if(d.dead)scene.remove(d.m);else d.m.position.set(d.x,d.y,d.z);}
  if(G.drops.some(d=>d.dead))G.drops=G.drops.filter(d=>!d.dead);}
// radiografia: un riquadro in pixel art mostra un osso del nemico che si crepa e va in pezzi
const XR={on:false,t:0,el:null,g:null};
const XSPLIT={skull:{v:1,x:75,y:30,h:16},ribs:{v:1,x:75,y:75,h:24},spine:{v:0,x:75,y:85,h:8},arm:{v:0,x:75,y:86,h:46},femur:{v:0,x:75,y:150,h:22},core:{v:1,x:75,y:110,h:20}};
function xrayStart(e){if(!XR.el){XR.el=document.createElement('canvas');XR.el.id='xray';XR.el.width=150;XR.el.height=210;document.body.appendChild(XR.el);XR.g=XR.el.getContext('2d');}
  const blob=!e.parts.rig;XR.e=e;XR.on=true;XR.t=0;XR.blob=blob;XR.mode=blob||Math.random()<0.45?'organ':'bone';
  XR.target=XR.mode==='bone'?pick(['skull','ribs','femur','arm','spine']):pick(blob?['core']:['heart','lungs','gut']);
  XR.hit=false;XR.sh=[];for(let i=0;i<46;i++)XR.sh.push({a:rand(0,TAU),s:rand(14,70),r:rand(0.8,3),c:Math.random()<0.65});XR.el.classList.add('on');}
function xrayTick(rdt){if(!XR.on)return;XR.t+=rdt;const T=XR.t,g=XR.g,W=150,H=210,e=XR.e;
  if(T>1.15||!e){XR.on=false;XR.el.classList.remove('on');return;}
  if(e.parts&&e.parts.root){const [sx,sy]=toScreen(e.x,e.y+e.h*0.55,0);XR.el.style.left=sx+'px';XR.el.style.top=sy+'px';}
  const imp=0.42,k=clamp((T-imp)/0.5,0,1),pre=clamp(T/imp,0,1);
  if(!XR.hit&&T>=imp){XR.hit=true;sfx(XR.mode==='bone'?'bones':'blunt');sfx('crit');}
  // fondo della lastra: nero-blu con grana e linee di scansione
  g.fillStyle='#04101a';g.fillRect(0,0,W,H);const rg=g.createRadialGradient(W/2,H*0.45,10,W/2,H*0.45,110);rg.addColorStop(0,'rgba(80,170,230,.22)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(0,0,W,H);
  for(let n=0;n<220;n++){g.fillStyle=`rgba(140,200,255,${Math.random()*0.06})`;g.fillRect(Math.random()*W|0,Math.random()*H|0,1,1);}
  const cx=W/2;
  // corpo: sagoma di carne traslucida
  g.fillStyle='rgba(120,190,235,.16)';g.strokeStyle='rgba(150,215,255,.35)';g.lineWidth=1;
  const ell=(x,y,rx,ry,f)=>{g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);f?g.fill():g.stroke();};
  if(XR.blob){ell(cx,110,52,46,1);ell(cx,110,52,46,0);}
  else{ell(cx,30,17,20,1);g.fillRect(cx-28,50,56,70);g.fillRect(cx-24,118,48,26);g.fillRect(cx-44,52,15,62);g.fillRect(cx+29,52,15,62);g.fillRect(cx-24,140,19,64);g.fillRect(cx+5,140,19,64);}
  // organi (sotto le ossa)
  const pulse=1+Math.sin(T*28)*0.06*pre,orgA=XR.mode==='organ'?0.55:0.3;
  const burstAt=[];const organ=(name,x,y,rx,ry,col)=>{if(XR.hit&&XR.target===name){burstAt.push([x,y,rx,ry]);return;}
    const hl=XR.target===name&&XR.mode==='organ'?pre:0;g.fillStyle=`rgba(${190+60*hl},${70-40*hl},${90-50*hl},${orgA+0.3*hl})`;ell(x,y,rx*(hl?pulse:1),ry*(hl?pulse:1),1);};
  if(XR.blob)organ('core',cx,108,22,18);
  else{organ('lungs',cx-10,74,9,14);organ('lungs',cx+10,74,9,14);organ('heart',cx+3,80,7,7);organ('gut',cx,108,16,10);}
  // ossa: bianche con ombreggiatura, quella colpita si illumina, si crepa e si spezza
  const bone=(name,draw)=>{const isT=XR.target===name&&XR.mode==='bone';g.save();
    if(isT&&XR.hit){const S=XSPLIT[name];
      for(const side of [-1,1]){g.save();g.beginPath();if(S.v)g.rect(side<0?0:S.x,0,side<0?S.x:W,H);else g.rect(0,side<0?0:S.y,W,side<0?S.y:H);g.clip();
        if(S.v){g.translate(side*k*10,k*k*12);g.translate(S.x,S.y);g.rotate(side*k*0.3);g.translate(-S.x,-S.y);}
        else{if(side>0){g.translate(k*4,k*k*16);g.translate(S.x,S.y);g.rotate(k*0.5);g.translate(-S.x,-S.y);}else g.translate(0,-k*3);}
        draw('#f4fbff');g.restore();}
      g.fillStyle='#ffffff';for(const s of XR.sh)if(s.c){const d=s.s*k*0.7;g.fillRect((S.x+Math.cos(s.a)*d)|0,(S.y+Math.sin(s.a)*d*0.7+30*k*k)|0,s.r|0||1,s.r|0||1);}
      if(k<0.35){g.strokeStyle='#ff3b3b';g.lineWidth=1.5;g.beginPath();if(S.v){let y=S.y-S.h;g.moveTo(S.x,y);while(y<S.y+S.h){y+=5;g.lineTo(S.x+((y/5)%2?2.5:-2.5),y);}}else{let x=S.x-S.h;g.moveTo(x,S.y);while(x<S.x+S.h){x+=5;g.lineTo(x,S.y+((x/5)%2?2.5:-2.5));}}g.stroke();}}
    else{const glow=isT?pre:0;if(glow){g.shadowColor='rgba(255,90,90,.9)';g.shadowBlur=8*glow;}draw(glow?`rgb(255,${235-120*glow},${235-120*glow})`:'#e6f4ff');}
    g.restore();};
  if(XR.blob){bone('core',c=>{g.fillStyle=c;for(let i=0;i<6;i++){g.fillRect(cx-26+i*10,128,3,8);}});}
  else{
    bone('skull',c=>{g.fillStyle=c;ell(cx,28,13,15,1);g.fillRect(cx-8,38,16,9);g.fillStyle='#04101a';ell(cx-5,27,3.5,4,1);ell(cx+5,27,3.5,4,1);g.fillRect(cx-1,33,2,4);g.fillStyle=c;for(let i=0;i<5;i++)g.fillRect(cx-7+i*3,44,2,3);});
    bone('spine',c=>{g.fillStyle=c;for(let i=0;i<14;i++)g.fillRect(cx-2.5,49+i*5,5,3.5);});
    bone('ribs',c=>{g.strokeStyle=c;g.lineWidth=2.4;for(let i=0;i<6;i++){g.beginPath();g.ellipse(cx,60+i*7,22-i*1.2,7,0,Math.PI*0.08,Math.PI*0.92);g.stroke();}g.fillStyle=c;g.fillRect(cx-2,55,4,34);});
    g.fillStyle='#e6f4ff';g.fillRect(cx-20,52,40,3);ell(cx,124,20,9,1);g.fillStyle='rgba(4,16,26,.8)';ell(cx-8,126,5,4,1);ell(cx+8,126,5,4,1);
    bone('arm',c=>{g.fillStyle=c;g.fillRect(cx-40,56,5,30);g.fillRect(cx-40,86,4,28);g.fillRect(cx+35,56,5,30);g.fillRect(cx+36,86,4,28);ell(cx-37,116,4,4,1);ell(cx+38,116,4,4,1);});
    bone('femur',c=>{g.fillStyle=c;g.fillRect(cx-17,132,6,36);g.fillRect(cx+11,132,6,36);ell(cx-14,168,5,4,1);ell(cx+14,168,5,4,1);g.fillRect(cx-16,172,5,30);g.fillRect(cx+11,172,5,30);});}
  for(const [x,y,rx,ry] of burstAt){const q=k;g.fillStyle=`rgba(230,30,50,${0.8*(1-q)})`;ell(x,y,rx*(1.3+q*2.6),ry*(1.3+q*2.6),1);g.fillStyle=`rgba(255,200,200,${0.6*(1-q*2)})`;ell(x,y,rx*0.8,ry*0.8,1);
    for(const s of XR.sh){const d=s.s*q*1.3,px=x+Math.cos(s.a)*d,py=y+Math.sin(s.a)*d*0.8+45*q*q,sz=Math.max(1,(s.r*3*(1-q*0.4))|0);g.fillStyle=s.c?`rgba(220,25,45,${1-q*0.6})`:`rgba(255,150,150,${1-q})`;g.fillRect(px|0,py|0,sz,sz);}}
  if(XR.hit&&T<imp+0.08){g.fillStyle='rgba(255,255,255,.6)';g.fillRect(0,0,W,H);}
  g.strokeStyle='rgba(120,200,255,.6)';g.lineWidth=2;g.strokeRect(1,1,W-2,H-2);g.fillStyle='rgba(120,200,255,.8)';g.font='8px monospace';g.fillText(XR.mode==='bone'?'FRATTURA':'TRAUMA INTERNO',5,H-6);
  XR.el.style.opacity=String(T<0.12?T/0.12:T>0.95?Math.max(0,(1.15-T)/0.2):1);}
function spawnCage(f){const cid=cageClassAt(f),c=cid&&CLASSES.find(c=>c.id===cid);if(!c||UNL.u[c.id])return;
  const x=-HALF+7,g=new THREE.Group();g.position.set(x,0,-0.6);levelGroup.add(g);
  const iron=toon(0x3a3a44,{metalness:0.6}),rust=toon(0x6b4a2e);
  geoO(new THREE.CylinderGeometry(1.05,1.15,0.2,20),iron,0,0.1,0,g,1.05);geoO(new THREE.CylinderGeometry(1.05,0.95,0.2,20),iron,0,2.75,0,g,1.05);
  const bars=[];for(let i=0;i<12;i++){const a=i/12*TAU,b=mesh(new THREE.CylinderGeometry(0.045,0.045,2.6,6),iron,Math.cos(a)*0.98,1.42,Math.sin(a)*0.98,g);bars.push(b);}
  for(let k=0;k<5;k++){const l=mesh(new THREE.TorusGeometry(0.1,0.03,6,10),rust,0,2.95+k*0.18,0,g);l.rotation.y=k%2?Math.PI/2:0;}
  const R=buildHero(c);R.root.position.set(0,0.2,0);R.root.rotation.y=0.4;g.add(R.root);
  const tg=tgBase();Object.assign(tg,{crouch:0.45,kF:2.0,hF:-0.6,kB:2.2,hB:-0.2,lean:0.35,head:0.5,shF:0.3,elF:-1.6,shB:0.3,elB:-1.6});applyPose(R,tg,1,1);
  for(const m of R.mats)if(m.color)m.color.multiplyScalar(0.75);
  G.cage={g,x,c,bars,R,hits:0,lastAtk:null,broken:false,t:0,hint:false};burst(x,1.4,clsRar(c).css?0xffffff:0xffffff,20,4,2,0.3,-0.6);}
function updCage(dt){const C=G.cage;if(!C)return;C.t+=dt;
  if(!C.broken){C.R.root.position.y=0.2+Math.abs(Math.sin(C.t*1.3))*0.04;C.R.head.rotation.x=0.5+Math.sin(C.t*0.9)*0.15;
    const near=Math.abs(P.x-C.x)<2.4&&P.y<3;
    if(near&&!C.hint){C.hint=true;popNum(C.x,3.4,'Colpisci la cella!','xp');}
    if(near&&P.atk&&P.atk!==C.lastAtk&&!P.atk.noHit){C.lastAtk=P.atk;C.hits++;sfx('block');shake(0.15);burst(C.x+(P.x<C.x?-0.9:0.9),1.4,0xffe2b0,14,5,1,0.2,-0.6);
      C.g.rotation.z=(P.x<C.x?-1:1)*0.06;
      if(C.hits>=3){C.broken=true;sfx('boom');shake(0.4);
        for(const b of C.bars){C.g.remove(b);const m=new THREE.Mesh(chunkGeo,chunkMat(0x3a3a44));m.scale.set(0.4,2.2,0.4);m.position.set(C.x+b.position.x,1.4,-0.6+b.position.z);scene.add(m);
          const a=Math.atan2(b.position.z,b.position.x);G.chunks.push({m,vx:Math.cos(a)*rand(4,9),vy:rand(5,10),vz:Math.sin(a)*3,rx:rand(-8,8),rz:rand(-8,8),t:0});}
        burst(C.x,1.4,0xffffff,40,8,3,0.3,-0.6);C.freeT=0;}}
    C.g.rotation.z*=Math.pow(0.001,dt);}
  else{C.freeT+=dt;const k=C.freeT;   // si alza, salta di gioia e sparisce in un lampo verso il seminterrato
    const tg=tgBase();Object.assign(tg,{shF:-2.8,elF:-0.2,shB:-2.8,elB:-0.2});applyPose(C.R,tg,Math.min(1,dt*10),Math.min(1,dt*10));C.R.root.position.y=0.2+Math.max(0,Math.sin(Math.min(k,1.2)*Math.PI/0.6))*0.6;
    if(k>0.25&&!C.done){C.done=true;unlockClass(C.c.id,'Liberato dalla cella');}
    if(k>1.4){burst(C.x,1.2,0xffffff,40,6,3,0.2,-0.6);levelGroup.remove(C.g);G.cage=null;}}}
function finishKillcam(){const k=G.killcam,e=k.e;G.killcam=null;if(G.scene!=='tower'||!e.parts||!e.parts.root.parent)return;
  explodeEnemy(e);for(let i=0;i<3;i++)bleed(e,i%2?1:-1,true);
  for(let i=0;i<16;i++){const m=new THREE.Mesh(chunkGeo,chunkMat(i%2?0x8a0f1a:0xc21a2a));m.scale.setScalar(rand(0.5,1.3));m.position.set(e.x+rand(-.3,.3),e.y+rand(0.3,e.h),rand(-.3,.3));scene.add(m);
    const a=rand(0,TAU),s=rand(5,14);G.chunks.push({m,vx:Math.cos(a)*s,vy:Math.abs(Math.sin(a))*s+4,vz:rand(-3,3),rx:rand(-14,14),rz:rand(-14,14),t:0});}
  burst(e.x,e.y+e.h/2,0xc21a2a,60,14,5);burst(e.x,e.y+e.h/2,0x8a0f1a,40,10,4);spray(e.x,e.y+e.h/2,bloodOf(e),80,15,4);
  shake(0.6);G.camPunch=0.5;scene.remove(e.parts.root);disposeObj(e.parts.root);}
function explodeEnemy(e){
  const cols=e.parts.mats.slice(0,4).map(m=>m.userData&&m.color?m.color.getHex():e.color);if(!cols.length)cols.push(e.color);
  const n=Math.round((e.type==='brute'?20:13)*(e.sc||1));
  for(let i=0;i<n;i++){const m=new THREE.Mesh(chunkGeo,chunkMat(cols[i%cols.length]));m.scale.setScalar(rand(0.55,1.4)*(e.sc||1)*(e.h>2.5?1.3:1));
    m.position.set(e.x+rand(-.3,.3),e.y+rand(0.2,e.h),rand(-.3,.3));m.castShadow=true;scene.add(m);
    G.chunks.push({m,vx:e.lastDir*rand(3,10)+rand(-3,3),vy:rand(6,15),vz:rand(-2.5,2.5),rx:rand(-14,14),rz:rand(-14,14),t:0});}
  burst(e.x,e.y+e.h/2,0xffffff,22,11,3);burst(e.x,e.y+e.h/2,e.color,34,13,5);burst(e.x,e.y+e.h/2,0xffb347,14,8,2);spray(e.x,e.y+e.h/2,bloodOf(e),55,13,3);
  shake(0.4);G.hitstop=Math.max(G.hitstop,0.09);G.camPunch=0.35;sfx('boom');popNum(e.x,e.y+e.h+0.6,'K.O.!','crit');
}
const bloodGeo=new THREE.CircleGeometry(1,20);bloodGeo.rotateX(-Math.PI/2);
function bossBlast(e){
  const cols=e.parts.mats.slice(0,4).map(m=>m.color?m.color.getHex():e.color),cx=e.x,cy=e.y+e.h/2;spray(cx,cy,bloodOf(e),140,17,5);
  for(let i=0;i<34;i++){const red=i%3===0,m=new THREE.Mesh(chunkGeo,chunkMat(red?0x8a0f1a:cols[i%cols.length]));m.scale.setScalar(rand(0.8,2.2));
    m.position.set(cx+rand(-e.w/2,e.w/2),e.y+rand(0.3,e.h),rand(-.5,.5));m.castShadow=true;scene.add(m);
    const a=rand(0,TAU),s=rand(5,17);G.chunks.push({m,vx:Math.cos(a)*s,vy:Math.abs(Math.sin(a))*s+5,vz:rand(-3,3),rx:rand(-14,14),rz:rand(-14,14),t:0});}
  for(let k=0;k<3;k++)burst(cx,cy,k===1?0x5a0610:0xb01020,60,16,6);   // fiotti di sangue
  burst(cx,cy,0xffffff,30,14,3);burst(cx,cy,e.color,40,12,4);
  for(let i=0;i<10;i++){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:i%2?0x7a0a14:0x9a1420,transparent:true,opacity:0.85,depthWrite:false}));
    const r=rand(0.4,1.4);m.scale.set(r*rand(1,1.8),1,r);m.position.set(cx+rand(-4,4),0.02+i*0.002,rand(-1.6,1.2));levelGroup.add(m);}
  shake(1.1);G.hitstop=0.4;G.camPunch=0.7;sfx('boom');sfx('roar');popNum(cx,e.y+e.h+0.8,'SCONFITTO!','crit');
}
function updChunks(dt){for(const c of G.chunks){c.t+=dt;c.vy-=34*dt;const p=c.m.position;p.x+=c.vx*dt;p.y+=c.vy*dt;p.z+=c.vz*dt;c.m.rotation.x+=c.rx*dt;c.m.rotation.z+=c.rz*dt;
    {const gy=(G.scene==='tower'?groundAt(p.x,p.y):0)+0.1;if(p.y<gy){p.y=gy;c.vy=-c.vy*0.35;c.vx*=0.6;c.vz*=0.6;c.rx*=0.6;c.rz*=0.6;if(Math.abs(c.vy)<1){c.vy=0;c.vx*=0.8;c.rx=c.rz=0;}}}
    if(G.scene!=='tower'&&c.t>1.4)c.m.scale.multiplyScalar(Math.pow(0.02,dt));if(G.scene!=='tower'&&c.t>2.2){scene.remove(c.m);c.dead=true;}}
  while(G.chunks.length>90){const c=G.chunks.shift();scene.remove(c.m);}
  if(G.chunks.some(c=>c.dead))G.chunks=G.chunks.filter(c=>!c.dead);}
function heal(n,quiet){if(P.hp>=S.maxHp)return;P.hp=Math.min(S.maxHp,P.hp+n);if(!quiet||n>=5)popNum(P.x,P.y+2.3,'+'+Math.round(n),'heal');}
function playerDie(){P.hp=0;P.dead=true;P.dot=null;G.overT=1.5;G.deathSlow=1.2;sfx('die');sfx('boom');shake(0.6);
  burst(P.x,P.y+1,0xb01020,60,11,4,1.2);burst(P.x,P.y+1,0x6a0812,36,8,3,1.4);burst(P.x,P.y+1,G.cls.colors.main,20,7,4);spray(P.x,P.y+1.1,0xb01020,100,14,3);
  $('deathFx').classList.add('on');}
const PEFF={poison:{t:3,k:0.08,col:0x9ae06a,label:'Avvelenato'},burn:{t:2,k:0.12,col:0xff7a2e,label:'Brucia!'}};
function hurtPlayer(dmg,fromX,eff){
  if(P.dead||G.state!=='play')return;
  if(P.invul>0||P.dashT>0||P.dragon)return;
  if(P.shieldT>0){if(P.blockT<=0){popNum(P.x,P.y+2.3,'Bloccato','info');sfx('block');P.blockT=0.4;}return;}
  const d=Math.max(1,Math.round(dmg*(1-Math.min(0.8,S.armor+(P.bearT>0?0.25:0)))));
  if(G.boss&&!G.boss.dead)G.bossHit=true;
  P.hp-=d;if(G.tutorial)P.hp=Math.max(1,P.hp);P.invul=0.9;P.kbT=0.2;P.hurtT=0.25;P.vx=(P.x>=fromX?1:-1)*9;P.vy=7;P.atk=null;
  shake(0.35);popNum(P.x,P.y+2.1,'-'+d,'hurt');burst(P.x,P.y+1,0xe0434f,10,5,2);sfx('hurt');
  const h=$('hurt');h.style.transition='none';h.style.opacity=1;requestAnimationFrame(()=>{h.style.transition='opacity .45s';h.style.opacity=0;});
  if(P.hp<=0){playerDie();return;}
  if(eff==='slow'||eff==='web'){if(P.slowT<=0)popNum(P.x,P.y+2.6,eff==='web'?'Invischiato':'Congelato','info');P.slowT=2.2;}
  else if(PEFF[eff]){const E=PEFF[eff];if(!P.dot)popNum(P.x,P.y+2.6,E.label,'info');P.dot={t:E.t,acc:0,dmg:Math.max(1,Math.round(d*E.k)),col:E.col};}
}
// tre mosse speciali per classe: la seconda dal livello 40, la terza dal 70
const SLOT=[null,{k:'ability',cd:'abilCd',lv:1},{k:'ability2',cd:'abil2Cd',lv:LV_ABIL2},{k:'ability3',cd:'abil3Cd',lv:LV_ABIL3}];
function useAbility(){useSlot(1);}function useAbility2(){useSlot(2);}function useAbility3(){useSlot(3);}
function useSlot(n){const s=SLOT[n],ab=G.cls[s.k];
  if(!ab||P[s.cd]>0||P.dead||P.dragon||prog(G.cls.id).lv<s.lv)return;
  P[s.cd]=ab.cd*S.cdMul;absnd(n);if(n>1)P.atk=null;abilityFx(n,ab);G.inAbil=true;try{doAbility(ab.id);}finally{G.inAbil=false;}}
function fxSigil(x,y,z,col,r,dur){const g=new THREE.Group();g.position.set(x,y+0.05,z);g.rotation.x=-Math.PI/2;
  const mt=fxM(col),lm=new THREE.LineBasicMaterial({color:col,transparent:true,opacity:1,blending:THREE.AdditiveBlending});
  g.add(new THREE.Mesh(new THREE.RingGeometry(0.92,1,48),mt));g.add(new THREE.Mesh(new THREE.RingGeometry(0.62,0.66,48),mt));
  for(const o of [0,Math.PI]){const pts=[0,1,2,3].map(i=>{const a=o+i*TAU/3+Math.PI/2;return new THREE.Vector3(Math.cos(a)*0.9,Math.sin(a)*0.9,0);});g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lm));}
  for(let i=0;i<10;i++){const a=i/10*TAU,s=new THREE.Mesh(new THREE.PlaneGeometry(0.09,0.09),mt);s.position.set(Math.cos(a)*0.79,Math.sin(a)*0.79,0);s.rotation.z=a;g.add(s);}
  return fxAdd(g,dur,(g,k)=>{g.scale.setScalar(r*(0.35+0.65*easeOutBack(Math.min(1,k*2.5))));g.rotation.z+=0.06;const o=k>0.65?1-(k-0.65)/0.35:1;mt.opacity=o;lm.opacity=o;
    if(k>=1){mt.dispose();lm.dispose();}});}
function fxRays(x,y,z,col,n,len,dur){const g=new THREE.Group();g.position.set(x,y,z);const mt=fxM(col),geo=new THREE.PlaneGeometry(0.14,1);geo.translate(0,0.5,0);
  for(let i=0;i<n;i++){const m=new THREE.Mesh(geo,mt);m.rotation.z=i/n*TAU+rand(-.1,.1);m.userData.l=len*rand(0.6,1.2);g.add(m);}
  return fxAdd(g,dur,(g,k)=>{for(const m of g.children)m.scale.set(1-k*0.6,m.userData.l*easeOutQuart(Math.min(1,k*2)),1);mt.opacity=(1-k);g.rotation.z+=0.01;if(k>=1){mt.dispose();geo.dispose();}});}
function fxVortex(x,y,col,dur,r){const o=new THREE.Object3D();return fxAdd(o,dur,(o,k)=>{for(let i=0;i<3;i++){const a=k*TAU*3+i*TAU/3,rr=r*(1-k*0.5);burst(x+Math.cos(a)*rr,y+0.2+k*3.2,col,1,0.4,0.6,0,Math.sin(a)*rr*0.8);}});}
function fxAura(col,dur){const o=new THREE.Object3D();return fxAdd(o,dur,(o,k)=>{if(!hero)return;for(const m of hero.mats)if(m.emissive){m.emissive.setHex(col);m.emissiveIntensity=0.9*(1-k);}});}
function abilityFx(n,ab){const col=G.cls.fx||CLS_COL[G.cls.id]||0x7ff0e4,x=P.x,y=P.y,big=n===3,css='#'+col.toString(16).padStart(6,'0');
  G.abilSlow=big?0.55:n===2?0.3:0.16;
  fxRing(x,y+0.06,0,col,big?7:n===2?5:3.6,big?0.8:0.55);fxRing(x,y+1.1,0,0xffffff,big?4.5:2.8,0.45,true,Math.PI/2);if(big)fxRing(x,y+0.06,0,0xffffff,4,0.5);
  fxPillar(x,y,0,col,big?1.6:n===2?1.1:0.8,big?11:7,big?0.9:0.55);
  burst(x,y+1.2,col,big?80:n===2?50:32,big?13:9,3,0.4);burst(x,y+1.2,0xffffff,big?36:16,7,2,0.2);
  for(let i=0;i<(big?14:8);i++){const a=i/(big?14:8)*TAU;burst(x+Math.cos(a)*1.2,y+0.2,col,2,4,5,-0.2,Math.sin(a)*0.8);}
  shake(big?0.7:n===2?0.4:0.25);G.camPunch=Math.max(G.camPunch||0,big?0.7:0.4);G.hitstop=Math.max(G.hitstop,big?0.08:0.03);
  const sp=$('abilSplash');sp.style.setProperty('--c',css);sp.querySelector('b').textContent=ab.name+(big?'!':'');sp.classList.remove('on','big');void sp.offsetWidth;sp.classList.add('on');if(big)sp.classList.add('big');
  if(n>1){const fl=$('abilFlash');fl.style.setProperty('--c',css);fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on');}
  fxSigil(x,y,0,col,big?4.2:n===2?3:2.2,big?1.4:1);fxRays(x,y+1.2,0,col,big?18:12,big?6:4,big?0.6:0.45);fxVortex(x,y,col,big?0.9:0.6,big?1.4:1);fxAura(col,big?0.9:0.6);
  for(let i=0;i<(big?4:2);i++)later(i*0.06,()=>spawnGhost(col));
  if(big){fxPillar(x,y,0,0xffffff,0.35,30,0.7);fxRing(x,y+2.2,0,col,5,0.6,true,0);later(0.12,()=>{fxRing(x,y+0.06,0,col,9,0.7);burst(x,y+0.3,col,50,14,2,0.6);shake(0.5);});}}
const FX=()=>G.cls.fx||0x7ff0e4;
function later(t,fn){const a=G.inAbil;G.timers.push({t,fn:a?()=>{G.inAbil=true;try{fn();}finally{G.inAbil=false;}}:fn});}
function updTimers(dt){for(const k of G.timers){k.t-=dt;if(k.t<=0&&!k.done){k.done=true;if(!P.dead)k.fn();}}if(G.timers.some(k=>k.done))G.timers=G.timers.filter(k=>!k.done);}
function foes(){return G.enemies.filter(e=>!e.dead&&e.spawnT<=0);}
function nearest(n,x,maxD){return foes().filter(e=>Math.abs(e.x-x)<(maxD||99)).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x)).slice(0,n);}
function aoe(x,y,r,mul,o){let n=0;for(const e of foes()){const dx=e.x-x,dy=(e.y+e.h/2)-y;if(Math.hypot(dx,dy*0.8)<r+e.w/2){hitEnemy(e,weaponDamage()*mul,dx>=0?1:-1,Object.assign({kb:7,unblockable:true},o||{}));n++;}}return n;}
function boomAt(x,y,r,dmg,eff,col){spray(x,y,col,14,9,3);burst(x,y,col,30,9,3);burst(x,y,0xffffff,10,6,2);shake(0.3);sfx('boom');
  for(const e of foes()){const dx=e.x-x,dy=(e.y+e.h/2)-y;if(Math.hypot(dx,dy)<r+e.w/2)hitEnemy(e,dmg,dx>=0?1:-1,{kb:8,ky:6,hs:0.4,effect:eff,unblockable:true});}}
function addZone(o){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:o.col,transparent:true,opacity:0.35,depthWrite:false,blending:THREE.AdditiveBlending}));
  m.scale.set(o.r,1,1.4);m.position.set(o.x,0.05,0);scene.add(m);G.zones.push(Object.assign({tick:0,m,h:3},o));}
function updZones(dt){for(const z of G.zones){z.t-=dt;z.tick-=dt;z.m.material.opacity=0.35*Math.min(1,z.t);z.m.rotation.y+=dt*2;
    if(Math.random()<0.7)burst(z.x+rand(-z.r,z.r),rand(0.2,z.pull?2.5:1),z.col,1,1,z.pull?0:1.6,-0.3);
    if(z.pull)for(const e of foes())if(e.type!=='boss'&&Math.abs(e.x-z.x)<z.r+3)e.x+=Math.sign(z.x-e.x)*Math.min(Math.abs(z.x-e.x),7*dt);
    if(z.tick<=0){z.tick=0.4;for(const e of foes())if(Math.abs(e.x-z.x)<z.r+e.w/2&&e.y<z.h)hitEnemy(e,z.dmg,e.x>=z.x?1:-1,{kb:1,noCombo:true,effect:z.eff});}}
  for(let i=G.zones.length-1;i>=0;i--)if(G.zones[i].t<=0){scene.remove(G.zones[i].m);G.zones[i].m.material.dispose();G.zones.splice(i,1);}}
const pProj=o=>spawnProj(Object.assign({owner:'p',life:1,w:0.6,h:0.6,kb:5,effect:G.weapon.effect},o));
function shadowStep(target,noCrit){
  let best=target||null;if(!best){let bd=18;for(const e of foes()){const d=Math.abs(e.x-P.x)+Math.abs(e.y-P.y)*0.5;if(d<bd){bd=d;best=e;}}}
  burst(P.x,P.y+1,0x6b4fa0,18,4,2,0.2);
  const L=G.bounds.left+0.5,R=rightBound(P)-0.5;
  if(best){const side=best.face||1;let nx=best.x-side*(best.w/2+0.8);if(nx<L||nx>R)nx=best.x+side*(best.w/2+0.8);
    P.x=clamp(nx,L,R);P.y=best.fly?Math.max(0,best.y-0.6):best.y;P.vy=best.fly?4:0;P.vx=0;P.face=best.x>=P.x?1:-1;P.invul=Math.max(P.invul,0.4);
    startAttack(true);hitEnemy(best,weaponDamage()*1.6,P.face,{crit:!noCrit,melee:true,kb:WTYPES[G.weapon.type].kb,effect:G.weapon.effect});}
  else P.x=clamp(P.x+P.face*5,L,R);
  burst(P.x,P.y+1,0x6b4fa0,18,4,2,0.2);spawnGhost(0x6b4fa0);
}
function doAbility(id){
  const f=P.face,cx=P.x+f*0.8,cy=P.y+1.4,col=FX(),L=G.bounds.left+0.5,R=rightBound(P)-0.5;
  switch(id){
  // --- classi originali ---
  case 'scudo':P.shieldT=2;burst(P.x,P.y+1,0x7fc8ff,18,5,1,0.2);break;
  case 'furia':P.rageT=6;burst(P.x,P.y+1,0xff4a2e,26,6,3);break;
  case 'drago':case 'ascesa':P.dragon='up';P.vy=21;P.dashT=0;P.atk=null;burst(P.x,P.y+0.2,id==='ascesa'?0xffb347:0x7ff0e4,16,5,2);break;
  case 'ombra':shadowStep();break;
  case 'carica':P.chargeT=0.42;P.chargeKind='carica';P.chargeSet=new Set();P.invul=Math.max(P.invul,0.45);P.vy=Math.max(P.vy,0);burst(P.x,P.y+1,0x7fc8ff,14,4,1,0.2);sfx('dash');break;
  case 'turbine':case 'tempestalame':P.spinT=1.4;P.spinTick=0;burst(P.x,P.y+1,id==='turbine'?0xff4a2e:col,18,5,2);break;
  case 'giavellotto':P.throwT=0.32;pProj({x:cx,y:P.y+1.5,vx:f*28,vy:0,w:1.8,h:0.5,dmg:weaponDamage()*1.8,life:0.9,kind:'spear',kb:8});sfx('thrust');break;
  case 'ventaglio':P.throwT=0.25;for(let i=0;i<5;i++){const a=(i-2)*0.16;pProj({x:P.x+f*0.6,y:P.y+1.3,vx:Math.cos(a)*22*f,vy:Math.sin(a)*22,w:0.5,h:0.35,dmg:weaponDamage()*0.9,life:0.6,kind:'knife',kb:3});}sfx('stab');break;
  case 'bastione':shake(0.5);sfx('slam');burst(P.x,P.y+0.3,0x7fc8ff,40,10,1,0.4);aoe(P.x,P.y+1,4.5,1.2,{kb:13,stun:1.6});for(const s of [-1,1])pProj({x:P.x+s,y:P.y,vx:s*12,vy:0,w:0.6,h:1,dmg:weaponDamage()*0.7,life:0.8,kind:'shock'});break;
  case 'terremoto':for(let i=0;i<3;i++)later(i*0.35,()=>{P.landT=0.16;shake(0.3+i*0.2);sfx('slam');burst(P.x,P.y+0.1,0xb9ad98,20+i*10,6+i*2,2);aoe(P.x,P.y+1,2.5+i*1.2,0.8+i*0.3,{kb:8,ky:7+i*2,hs:0.5});
      for(const s of [-1,1])pProj({x:P.x+s,y:P.y,vx:s*(10+i*3),vy:0,w:0.6+i*0.2,h:1+i*0.3,dmg:weaponDamage()*(0.6+i*0.2),life:0.8+i*0.2,kind:'shock'});});break;
  case 'pioggialance':{const xs=nearest(6,P.x,14).map(e=>e.x);while(xs.length<6)xs.push(P.x+f*rand(2,10));
    xs.forEach((x,i)=>later(0.08*i,()=>pProj({x:clamp(x,L,R),y:CEIL-0.5,vx:0,vy:-34,w:0.5,h:1.8,dmg:weaponDamage()*1.3,life:0.6,kind:'spear',kb:3,pierce:true})));sfx('thrust');break;}
  case 'mille':nearest(5,P.x,16).forEach((e,i)=>later(0.13*i,()=>{if(!e.dead)shadowStep(e);}));P.invul=Math.max(P.invul,0.9);break;
  // --- mago del fuoco ---
  case 'palla':P.throwT=0.3;pProj({x:cx,y:cy,vx:f*16,vy:0,kind:'bolt',col:0xff7a2e,sz:2.2,w:1,h:1,dmg:weaponDamage()*1.6,boom:2.6,effect:'fuoco',life:1.3});sfx('orb');break;
  case 'meteora':{const xs=nearest(5,P.x,16).map(e=>e.x);while(xs.length<5)xs.push(P.x+f*rand(2,10));
    xs.forEach((x,i)=>later(0.18*i,()=>pProj({x:clamp(x+rand(-0.5,0.5),L,R),y:CEIL,vx:rand(-2,2),vy:-26,kind:'meteor',w:1.2,h:1.2,dmg:weaponDamage()*1.5,boom:2.4,effect:'fuoco',life:2})));sfx('roar');break;}
  case 'fenice':P.chargeT=0.6;P.chargeKind='fenice';P.chargeSet=new Set();P.invul=Math.max(P.invul,0.7);burst(P.x,P.y+1,0xff7a2e,30,6,2);sfx('dash');break;
  // --- strega del gelo ---
  case 'lanciaghiaccio':P.throwT=0.3;pProj({x:cx,y:cy,vx:f*26,vy:0,kind:'bolt',col:0x8fdcff,sz:1.6,w:1.4,h:0.6,dmg:weaponDamage()*2,pierce:true,effect:'gelo',life:1});sfx('thrust');break;
  case 'nova':burst(P.x,P.y+1,0x8fdcff,60,12,1,0.2);burst(P.x,P.y+1,0xffffff,20,8,1);shake(0.35);sfx('zap');aoe(P.x,P.y+1,5,1.1,{stun:2,effect:'gelo',kb:4});break;
  case 'bufera':for(let i=0;i<20;i++)later(i*0.15,()=>pProj({x:clamp(P.x+P.face*rand(1,10),L,R),y:CEIL-0.5,vx:P.face*-3,vy:-24,kind:'bolt',col:0xbfe6ff,sz:0.8,dmg:weaponDamage()*0.6,effect:'gelo',life:0.9}));sfx('ability');break;
  // --- evocatore del fulmine ---
  case 'catena':{let from={x:P.x,y:P.y+1.4},left=foes(),hit=0;while(hit<5&&left.length){left.sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(b.x-from.x,b.y-from.y));const e=left.shift();if(Math.hypot(e.x-from.x,e.y-from.y)>9)break;
      lightning(from.x,from.y,e.x,e.y+e.h/2);hitEnemy(e,weaponDamage()*1.3,e.x>=from.x?1:-1,{kb:3,stun:0.4});from={x:e.x,y:e.y+e.h/2};hit++;}sfx('zap');break;}
  case 'lampo':{const x0=P.x,x1=clamp(P.x+f*7,L,R);lightning(x0,P.y+1,x1,P.y+1);for(const e of foes())if((e.x-x0)*(e.x-x1)<=0&&Math.abs(e.y-P.y)<2.5)hitEnemy(e,weaponDamage()*1.5,f,{kb:5,stun:0.5,effect:'fulmine'});
    spawnGhost(0xfff27a);P.x=x1;P.invul=Math.max(P.invul,0.4);burst(P.x,P.y+1,0xfff27a,20,6,2);sfx('zap');break;}
  case 'tempestafulmini':for(let i=0;i<8;i++)later(i*0.25,()=>{const fs=foes(),e=fs.length?pick(fs):null,x=e?e.x:P.x+P.face*rand(2,9);lightning(x,CEIL,x,0);burst(x,0.3,0xfff27a,16,5,4);sfx('zap');shake(0.15);
      if(e)hitEnemy(e,weaponDamage()*1.4,e.x>=P.x?1:-1,{kb:3,stun:0.5,effect:'fulmine'});});break;
  // --- druido ---
  case 'spine':nearest(3,P.x,14).forEach((e,i)=>later(0.12*i,()=>{burst(e.x,0.2,0x7fe08a,24,4,7,0.3);burst(e.x,0.2,0x5a3a20,10,3,6);hitEnemy(e,weaponDamage()*1.4,e.x>=P.x?1:-1,{kb:2,ky:14,hs:0.8,unblockable:true});}));sfx('ability');break;
  case 'rigenera':P.regenT=6;burst(P.x,P.y+1,0x7fe08a,26,4,3,0.4);break;
  case 'orso':P.bearT=8;burst(P.x,P.y+1,0x8a6a3a,40,7,3);burst(P.x,P.y+1,0x7fe08a,24,6,3,0.4);fxRing(P.x,P.y+0.05,0,0x7fe08a,2.6,0.5);sfx('roar');shake(0.3);break;
  // --- astromante ---
  case 'stelle':for(let i=0;i<5;i++){const a=-0.6+i*0.3+(f<0?Math.PI:0);pProj({x:P.x,y:P.y+1.6,vx:Math.cos(a)*12,vy:Math.sin(a)*12+6,kind:'bolt',col:0xc7a8ff,sz:0.9,dmg:weaponDamage()*0.9,homing:6,life:2.2});}sfx('orb');break;
  case 'gravita':addZone({x:clamp(P.x+f*4,L,R),r:3.2,t:2.4,dmg:weaponDamage()*0.35,col:0x7a5aff,pull:true});sfx('roar');break;
  case 'supernova':burst(P.x,P.y+1,0xc7a8ff,30,4,2,0);later(0.5,()=>{burst(P.x,P.y+1,0xffffff,60,18,2,0.2);burst(P.x,P.y+1,0xc7a8ff,60,14,3);shake(0.8);G.hitstop=0.15;sfx('boom');aoe(P.x,P.y+1,7,3,{kb:14,ky:9,hs:0.6});});break;
  // --- negromante ---
  case 'ossa':P.throwT=0.25;for(let i=0;i<7;i++){const a=(i-3)*0.14;pProj({x:cx,y:P.y+1.3,vx:Math.cos(a)*20*f,vy:Math.sin(a)*20,kind:'bone',w:0.5,h:0.5,dmg:weaponDamage()*0.6,life:0.7});}sfx('bones');break;
  case 'raccolto':{const n=aoe(P.x,P.y+1,5,1.1,{kb:-4,effect:'vampiro'});heal(Math.round(S.maxHp*0.05*n));burst(P.x,P.y+1,0x9a6aff,40,8,1,0.2);sfx('roar');break;}
  case 'nube':addZone({x:clamp(P.x+f*3,L,R),r:3.4,t:5,dmg:weaponDamage()*0.45,col:0x6aff6a,eff:null});sfx('ability');break;
  // --- paladino ---
  case 'lucesacra':heal(Math.round(S.maxHp*0.2));burst(P.x,P.y+1,0xffe08a,50,9,2,0.3);aoe(P.x,P.y+1,4.2,1.2,{kb:9,effect:'fuoco'});shake(0.25);break;
  case 'giudizio':P.throwT=0.32;pProj({x:cx,y:cy,vx:f*22,vy:0,kind:'bolt',col:0xffe08a,sz:2,w:1.4,h:1.2,dmg:weaponDamage()*1.8,pierce:true,life:1.1,kb:10});sfx('heavy');break;
  case 'scudodivino':P.shieldT=4;for(let i=0;i<8;i++)later(i*0.5,()=>{burst(P.x,P.y+1,0xffe08a,14,5,1,0.2);aoe(P.x,P.y+1,2.6,0.4,{kb:5,noCombo:true});});break;
  // --- arciere ---
  case 'raffica':for(let i=0;i<5;i++)later(i*0.08,()=>{P.atk=null;startAttack(true);const am=aimAngle(P.x+P.face*0.8,P.y+1.35,P.face)||0;pProj({x:P.x+P.face*0.8,y:P.y+1.35,vx:P.face*32*Math.cos(am),vy:32*Math.sin(am)+rand(-0.5,0.5),kind:'arrow',w:0.8,h:0.55,homing:2.2,dmg:weaponDamage()*0.9,life:0.8});sfx('arrow');});break;
  case 'pioggiafrecce':{const tg=nearest(1,P.x,14)[0],cx2=tg?tg.x:P.x+f*6;for(let i=0;i<16;i++)later(0.25+i*0.06,()=>pProj({x:clamp(cx2+rand(-3,3),L,R),y:CEIL,vx:f*-2,vy:-30,kind:'arrow',w:0.3,h:0.8,dmg:weaponDamage()*0.8,life:0.7}));P.throwT=0.3;sfx('arrow');break;}
  case 'colpopreciso':P.throwT=0.32;later(0.15,()=>{pProj({x:P.x+P.face,y:P.y+1.35,vx:P.face*40,vy:0,kind:'bolt',col:0xffffff,sz:1.4,w:1.6,h:0.6,dmg:weaponDamage()*3.5,pierce:true,life:0.8,kb:12});shake(0.3);sfx('heavy');});break;
  // --- samurai ---
  case 'iaido':P.chargeT=0.28;P.chargeKind='iaido';P.chargeSet=new Set();P.invul=Math.max(P.invul,0.4);sfx('dash');break;
  case 'vuoto':pProj({x:cx,y:P.y+1.2,vx:f*20,vy:0,kind:'wave',sz:2,w:1.8,h:2.6,dmg:weaponDamage()*2.5,pierce:true,life:0.9,kb:10});shake(0.3);sfx('heavy');break;
  // --- monaco ---
  case 'palmo':P.throwT=0.3;burst(cx,cy,0xffb347,20,6,1);aoe(P.x+f*1.6,P.y+1,1.8,1.4,{kb:14,ky:5,hs:0.4});pProj({x:cx,y:P.y,vx:f*15,vy:0,kind:'shock',w:0.8,h:1.6,dmg:weaponDamage()*1.2,life:0.8});sfx('slam');break;
  case 'centopugni':P.punchT=1.1;P.punchTick=0;break;
  }
}
function dragonImpact(){
  P.dragon=null;P.landT=0.16;shake(0.6);sfx('slam');burst(P.x,P.y+0.2,0x7ff0e4,30,9,3);burst(P.x,P.y+0.2,0xb9ad98,18,7,2);
  const dmg=weaponDamage()*2.2;
  for(const e of G.enemies){if(e.dead||e.spawnT>0)continue;const dx=e.x-P.x;
    if(Math.abs(dx)<4.6&&e.y-P.y<3.2&&P.y-e.y<2.2){hitEnemy(e,dmg,dx>=0?1:-1,{kb:10,effect:G.weapon.effect});if(!e.dead&&e.type!=='boss'&&!e.fly)e.vy=9;}}
  for(const s of [-1,1])spawnProj({x:P.x+s,y:P.y,vx:s*13,vy:0,w:0.6,h:1,dmg:weaponDamage()*0.8,owner:'p',life:0.9,kind:'shock'});
  P.invul=Math.max(P.invul,0.3);
}

