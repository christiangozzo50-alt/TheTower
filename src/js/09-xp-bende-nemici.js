/* =========================================================
   XP DI CLASSE E BENDE
   ========================================================= */
// in co-op l'esperienza va solo a chi ha dato il colpo finale: l'host la manda al giocatore giusto, gli ospiti la ricevono dall'host
function xpToKiller(e,x,y,v){
  if(G.scene==='tower'&&!G.pvp&&MP.live()){
    if(e.net)return;
    if(MP.host){const by=e.lastBy!=null?e.lastBy:MP.myPid;if(by!==MP.myPid){if(MP.players.has(by))MP.sendTo(by,{t:'xp',f:G.floor,x:r2(x),y:r2(y),v:Math.round(v*10)/10});return;}}}
  dropXP(x,y,v);}
function dropXP(x,y,val){const n=Math.min(6,Math.max(1,Math.ceil(val/3)));
  for(let i=0;i<n;i++){const m=new THREE.Mesh(xpGeo,xpMat);m.add(new THREE.Mesh(xpHaloGeo,xpHalo));m.position.set(x,y,0.4);scene.add(m);
    G.orbs.push({x,y,vx:rand(-4.5,4.5),vy:rand(5,9),t:0,v:val/n,m});}}
function updOrbs(dt){
  for(const o of G.orbs){o.t+=dt;
    if(o.t<0.4){o.vy+=GRAV*0.55*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;if(o.y<0.15){o.y=0.15;o.vy*=-0.5;o.vx*=0.7;}}
    else{const dx=P.x-o.x,dy=P.y+1.1-o.y,d=Math.hypot(dx,dy)||1,s=Math.min(26,6+(o.t-0.4)*36);o.vx=lerp(o.vx,dx/d*s,0.2);o.vy=lerp(o.vy,dy/d*s,0.2);o.x+=o.vx*dt;o.y+=o.vy*dt;
      if(d<0.55||P.dead){o.done=true;if(!P.dead)gainXP(o.v);}}
    o.m.position.set(o.x,o.y,0.4);o.m.scale.setScalar(1+Math.sin(G.time*14+o.t*9)*0.15);}
  for(let i=G.orbs.length-1;i>=0;i--)if(G.orbs[i].done){scene.remove(G.orbs[i].m);G.orbs.splice(i,1);}
}
function gainXP(v){
  const c=G.cls,pr=prog(c.id);if(pr.lv>=MAX_LV)return;
  pr.xp+=v;G.runXp+=v;sfx('xp');
  while(pr.lv<MAX_LV&&pr.xp>=xpNeed(pr.lv)){pr.xp-=xpNeed(pr.lv);pr.lv++;levelUp(c);}
}
// ogni livello dà un punto statistica; al livello 10 si sblocca la seconda mossa speciale
function levelUp(c){
  const pr=prog(c.id);pr.pts++;
  sfx('lvl');burst(P.x,P.y+1.2,0xffd27a,30,6,4,0.4);popNum(P.x,P.y+2.6,'Livello '+pr.lv,'xp');
  if(pr.lv===LV_ABIL3){toast(`Terza mossa: ${c.ability3.name}`,touchUI()?'Usa il nuovo tasto viola':`Usala con ${inputLabel('ability3')}`);setupAbilUi();showMeds(G.state==='play');}
  else if(pr.lv===LV_ABIL2){toast(`Nuova mossa: ${c.ability2.name}`,touchUI()?'Usa il nuovo tasto arancione':`Usala con ${inputLabel('ability2')}`);setupAbilUi();showMeds(G.state==='play');}
  else popNum(P.x,P.y+3.0,'+1 punto','xp');
  store.set('prog',PROG);
}
function ptsHTML(cls,allowReset){const pr=prog(cls.id),spent=Object.values(pr.alloc).reduce((a,b)=>a+b,0);
  return `<div class="pts-head"><span>Punti statistica <b>${pr.pts}</b></span>${allowReset&&spent?'<button class="mini" data-reset="1">Azzera</button>':''}</div>
  <div class="pts">${PSTATS.map(s=>{const n=pr.alloc[s.id]||0;return `<span>${s.name}</span><em>${n?s.txt(n):'—'}</em><button data-pt="${s.id}" ${pr.pts>0?'':'disabled'} aria-label="Aumenta ${s.name}">+</button>`;}).join('')}</div>`;}
function spendPoint(id){const c=G.cls,pr=prog(c.id);if(pr.pts<=0)return;pr.pts--;pr.alloc[id]=(pr.alloc[id]||0)+1;
  applyPoint(S,id,1,c);if(id==='hp')P.hp+=10;if(id==='stam')P.stam+=8;store.set('prog',PROG);sfx('pick');}
function resetPoints(){const pr=prog(G.cls.id);for(const k in pr.alloc)pr.pts+=pr.alloc[k];pr.alloc={};store.set('prog',PROG);resetStats();P.hp=S.maxHp;P.stam=S.stamMax;sfx('ui');}
function showMeds(on){$('abilBar').hidden=!on;['abilMed','abilMed2','abilMed3','bAbil','bAbil2','bAbil3'].forEach(id=>$(id).style.display='none');const lv=prog(G.cls.id).lv,has2=lv>=LV_ABIL2,has3=lv>=LV_ABIL3;$('abilMed').hidden=!on||isTouch;$('abilMed2').hidden=!on||isTouch||!has2;$('bAbil2').hidden=!has2;
  $('abilMed3').hidden=!on||isTouch||!has3;$('bAbil3').hidden=!has3;}
function setupAbilUi(){const lv=prog(G.cls.id).lv;
  [...$('abilBar').children].forEach((b,i)=>{const n=i+1,a=G.cls[SLOT[n].k],lock=lv<SLOT[n].lv;b.classList.toggle('lock',lock);
    b.innerHTML=`<i class="cdv"></i><span class="ico">${lock?LOCK_SVG:svg(a.icon)}</span><span class="nm"><b>${a.short||a.name}</b><small>${lock?'Liv '+SLOT[n].lv:''}</small></span>${touchUI()?'':`<kbd>${inputLabel(SLOT[n].k)}</kbd>`}`;});
  const ab=G.cls.ability,a2=G.cls.ability2;
  $('medName').textContent=ab.name;$('medIco').innerHTML=svg(ab.icon);$('bAbilIco').innerHTML=svg(ab.icon);$('bAbilName').textContent=ab.short;
  $('med2Name').textContent=a2.name;$('med2Ico').innerHTML=svg(a2.icon);$('bAbil2Ico').innerHTML=svg(a2.icon);$('bAbil2Name').textContent=a2.short;
  const a3=G.cls.ability3;$('med3Name').textContent=a3.name;$('med3Ico').innerHTML=svg(a3.icon);$('bAbil3Ico').innerHTML=svg(a3.icon);$('bAbil3Name').textContent=a3.short;}
function spawnBandage(x,y){const g=new THREE.Group();
  outline(mesh(bandGeo,bandM,0,0,0,g),1.1,1.06,1.1);mesh(bandStripe,bandM2,0,0,0,g,true);const tl=mesh(bandTail,bandM,0.05,-0.16,0.16,g,true);tl.rotation.x=0.5;
  const gl=new THREE.Mesh(bandGlowGeo,bandGlow);g.add(gl);g.position.set(x,y+0.45,0.3);scene.add(g);G.pickups.push({x,y,m:g,t:Math.random()*6});}
function placeBandage(){
  let x,y;if(G.solids.length&&Math.random()<0.6){const s=pick(G.solids);x=rand(s.x1+0.6,s.x2-0.6);y=s.y2;}else{x=rand(-HALF+6,GATE_X-2);y=0;}
  spawnBandage(x,y);}
// durante i guardiani cadono più bende: al 75%, 50% e 25% di vita del boss e ogni 18 s se a terra non ce n'è nessuna
function bossBandage(){const B=G.boss,away=B?(P.x<B.x?-1:1):-P.face,x=clamp(P.x+away*rand(1.5,3.5),-HALF+2,GATE_X-2);
  spawnBandage(x,0);burst(x,0.6,0x7fe08a,16,4,3,0.3);popNum(x,1.8,'Una benda!','info');}
function bossBandTick(dt){const B=G.boss;if(!B||B.dead||G.scene!=='tower'||G.tutorial||G.pvp||!(B.maxHp>0)){G.bossBandT=0;return;}
  const fr=B.hp/B.maxHp,th=[0.75,0.5,0.25];B.bandN=B.bandN||0;
  while(B.bandN<th.length&&fr<th[B.bandN]){B.bandN++;bossBandage();}
  G.bossBandT=(G.bossBandT||0)+dt;if(G.bossBandT>18){G.bossBandT=0;if(!G.pickups.some(p=>!p.done))bossBandage();}}
function updPickups(dt){bossBandTick(dt);
  for(const p of G.pickups){p.t+=dt;p.m.position.y=p.y+0.45+Math.sin(p.t*3)*0.12;p.m.rotation.y+=dt*1.6;
    if(!P.dead&&P.hp<S.maxHp&&Math.abs(P.x-p.x)<0.9&&P.y<p.y+1.2&&P.y+P.h>p.y){p.done=true;const h=Math.round(S.maxHp*0.25);heal(h);sfx('bandage');burst(p.x,p.y+0.5,0x7fe08a,14,4,3,0.3);}}
  for(let i=G.pickups.length-1;i>=0;i--)if(G.pickups[i].done){scene.remove(G.pickups[i].m);G.pickups.splice(i,1);}
}

/* =========================================================
   NEMICI
   ========================================================= */
const ELITE_GOLD=new THREE.Color(0xffc040);
function spawnEnemy(type,o){
  o=o||{};const f=G.floor,boss=type==='boss';
  const def=boss?bossFor(f):null,A=boss?ARCH[def.arch]:TYPES[type];
  let x=o.x;
  if(x==null){if(boss)x=G.horde?hordeBossX():GATE_X-5;else{for(let i=0;i<20;i++){x=rand(-HALF+2,GATE_X-2);if(Math.abs(x-P.x)>6)break;}}}
  // dal piano 10 alcuni nemici sono "élite": più grossi, più forti, più esperienza
  const elite=!boss&&!o.summon&&f>=6&&Math.random()<Math.min(0.35,(f-5)*0.008);
  const k=(boss?(0.8+f/80):1)*(elite?2.2:1);
  const e={type,arch:boss?def.arch:null,def,x,y:A.fly?(boss?7:rand(4,6)):0,vx:0,vy:0,w:A.w,h:A.h,
    hp:A.hp*hpMul(f)*k*(boss?1:0.85),dmg:A.dmg*dmgMul(f)*(elite?1.3:1)*0.85,speed:A.speed*spdMul(f),
    face:x<P.x?1:-1,state:(!boss&&A.fly)?'hover':'move',t:0,cd:rand(1,2.2),touchCd:0,spawnT:boss?1.3:0.7,kbT:0,flash:0,warn:0,slowT:0,burn:null,flinch:0,landT:0,castT:0,walk:0,stunT:0,immT:0,
    fly:!!A.fly,ghost:boss||!!A.fly||type==='brute'||type==='minotaur',isEnemy:true,onGround:false,hopT:rand(0.4,1),seed:Math.random()*10,dead:false,lastDir:1,
    elite,summon:!!o.summon,sc:elite?1.2:1,color:boss?def.color:A.color,eff:boss?def.eff:null,phase:1,blockN:0,adds:0};
  if(G.event==='giganti'&&!boss&&G.scene==='tower'){e.sc*=1.4;e.w*=1.25;e.h*=1.3;if(!o.summon){e.hp*=1.9;e.dmg*=1.2;e.speed*=0.85;}}   // piano dei giganti
  e.spawnMax=e.spawnT;e.maxHp=e.hp;
  e.parts=boss?bossParts(def):enemyParts(type);
  if(elite)for(const m of e.parts.mats){m.userData.baseE=ELITE_GOLD;m.userData.baseI=0.25;}
  e.parts.root.position.set(e.x,e.y,0);e.parts.root.scale.setScalar(0.01);scene.add(e.parts.root);
  burst(x,e.y+1,o.summon?0x6aff9a:0xa060ff,16,4,2,0.3);
  G.enemies.push(e);
  if(boss){G.boss=e;G.bossHit=false;$('bossBar').hidden=false;$('bossName').textContent=def.name;sfx('roar');shake(0.3);}
  return e;
}
function hitEnemy(e,base,dir,o){
  o=o||{};if(e.dead||e.spawnT>0)return false;
  if(e.type==='wraith'&&e.phased){if(e.immT<=0){popNum(e.x,e.y+e.h+0.3,'Immune','info');e.immT=0.4;}return false;}
  // il cavaliere nero para i colpi che arrivano da davanti
  if(e.type==='knight'&&(e.state==='move'||e.state==='wind')&&e.stunT<=0&&e.face===-dir&&!o.unblockable){
    e.blockN++;e.flash=0.05;e.vx=dir*2.5;e.kbT=0.12;popNum(e.x,e.y+e.h+0.3,'Parato','info');sfx('block');burst(e.x+e.face*0.6,e.y+1.2,0xdfe5ec,6,4,1);
    if(o.melee)G.hitstop=Math.max(G.hitstop,0.03);
    if(e.blockN>=3){e.blockN=0;e.stunT=1.4;popNum(e.x,e.y+e.h+0.8,'Guardia rotta','crit');}
    e.hp-=Math.max(1,Math.round(base*0.15));if(e.hp<=0)killEnemy(e);return true;
  }
  if(!o.noCombo){if(G.time-G.cmbT<1.6)G.cmb++;else G.cmb=1;G.cmbT=G.time;base*=1+Math.min(0.6,(G.cmb-1)*0.05);const c=$('combo');c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop');}
  const crit=!!o.crit||Math.random()<S.crit+(o.critBonus||0)+(o.melee?(G.weapon.critB||0):0),d=Math.max(1,Math.round(base*(crit?2:1)));if(crit&&!o.env&&!o.card)cardCrit(e,dir);
  e.hp-=d;e.flash=0.1;e.flinch=0.2;e.lastDir=dir;
  if(e.type!=='boss'){const heavy=e.type==='brute'||e.type==='minotaur'?0.3:e.elite?0.6:1,kb=(o.kb||6)*heavy;e.vx=dir*kb*(e.fly?1.2:1);
    if(o.ky){const r=e.type==='brute'||e.type==='minotaur'?0.35:e.elite?0.7:1;e.vy=o.ky*r*(e.fly?0.6:1);}else if(!e.fly)e.vy=Math.min(6,kb*0.5);
    e.kbT=0.22;e.hitstun=Math.max(e.hitstun||0,(o.hs||0.15)*(e.elite?0.6:1));
    if(o.launch&&!e.elite&&e.state!=='fuse'){e.state=e.fly?'hover':'move';e.t=0;e.warn=0;}   // i lanci interrompono la carica
    if(o.stun)e.stunT=Math.max(e.stunT,o.stun);}
  if(o.melee&&G.weapon.perk==='eco'&&!e.dead){G.ecoN=(G.ecoN||0)+1;if(G.ecoN%4===0){burst(e.x,e.y+e.h/2,0xb48cff,12,5,1);G.echo=true;}}
  if(crit&&o.melee&&G.weapon.perk==='tempesta'){lightning(e.x,CEIL,e.x,e.y+e.h/2);sfx('zap');for(const x of G.enemies)if(x!==e&&!x.dead&&Math.abs(x.x-e.x)<2.6)hitEnemy(x,base*0.5,dir,{noCombo:true,kb:2});}
  popNum(e.x,e.y+e.h+0.3,String(d),crit?'crit':'');
  burst(e.x-dir*0.1,e.y+e.h*0.55,crit?0xffb347:0xffffff,crit?8:4,6,2);
  bleed(e,dir,crit);
  if(o.melee){G.hitstop=Math.max(G.hitstop,crit?0.07:0.04);sfx(o&&o.melee?((WSND[G.weapon.type]||{}).hit||'hit'):'hit');if(crit)sfx('crit');let ls=S.lifesteal+(P.rageT>0?3:0);if(S.lsUp>0&&G.time>=(P.lsNext||0)){ls+=S.lsUp;P.lsNext=G.time+0.5;}if(ls>0)heal(ls,true);}
  if(crit)shake(0.18);
  if(o.effect)applyEffect(e,o.effect,base,dir,o);
  if(e.hp<=0){e.critKill=crit;killEnemy(e);}
  if(G.echo){G.echo=false;if(!e.dead)hitEnemy(e,base*0.6,dir,{noCombo:true,kb:2});}
  return true;
}
const BLOOD={slime:[0x6ad04a,0x3f9a2e],slimeKing:[0x6ad04a,0x3f9a2e],guard:[0xe8e0cc,0x8a0f1a],archer:[0xe8e0cc,0x8a0f1a],skelKing:[0xe8e0cc,0x8a0f1a],wraith:[0xbfe6ff,0x7fb0d8],golem:[0x9a8f80,0x6a6058],spider:[0x9ae06a,0x5a8a2e],fungus:[0xc9e08a,0x7a9a3a],gargoyle:[0x9a9aa4,0x6a6a74],shade:[0x6a4aff,0x2a1a6a],scorpion:[0xa6e34a,0x6a8a1e],salamander:[0xff9a3a,0xb04a14],eye:[0xc23a7a,0x6a1a3a]};
function bleed(e,dir,crit){const c=BLOOD[e.type==='boss'?e.arch:e.type]||[0xb01020,0x6a0812],x=e.x-dir*0.15,y=e.y+e.h*rand(0.4,0.7),n=crit?22:12;
  burst(x,y,c[0],n,7,3,1.3);burst(x,y,c[1],Math.round(n*0.6),5,2,1.6);
  const sx=e.x+dir*rand(0.3,1.4);burst(sx,y,c[0],5,3,1,1.4);spray(x,y,c[0],crit?12:5,8,2);   // schizzi nella direzione del colpo
  if(G.scene==='tower'&&e.y<1.5&&(G.splats||0)<70&&Math.random()<(crit?0.9:0.45)){G.splats=(G.splats||0)+1;
    const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:c[1],transparent:true,opacity:0.8,depthWrite:false}));const r=rand(0.15,0.4)*(crit?1.6:1);
    m.scale.set(r*rand(1,2),1,r);m.position.set(e.x+dir*rand(0.2,1.2),0.02+Math.random()*0.004,rand(-0.8,0.8));levelGroup.add(m);}}
function applyEffect(e,eff,base,dir,o){
  if(eff==='fuoco'){e.burn={t:3,acc:0,dmg:Math.max(1,Math.round(base*0.15))};}
  else if(eff==='gelo'){e.slowT=2.5;burst(e.x,e.y+e.h/2,0x8fdcff,6,3,1,0.3);}
  else if(eff==='vampiro'){heal(Math.max(1,Math.round(base*0.08)),true);}
  else if(eff==='fulmine'&&!o.chained){let best=null,bd=6.5;
    for(const x of G.enemies){if(x===e||x.dead||x.spawnT>0)continue;const dd=Math.hypot(x.x-e.x,(x.y+x.h/2)-(e.y+e.h/2));if(dd<bd){bd=dd;best=x;}}
    if(best){lightning(e.x,e.y+e.h/2,best.x,best.y+best.h/2);sfx('zap');hitEnemy(best,base*0.6,dir,{chained:true,kb:2});}}
}
function killEnemy(e){UNL.kills++;if(UNL.kills%50===0){saveUnl();checkUnlocks();}
  if(e.dead)return;e.dead=true;G.kills++;STATS.kills++;
  const boss=e.type==='boss',bony=e.type==='guard'||e.type==='archer'||e.arch==='skelKing';
  burst(e.x,e.y+e.h*0.5,e.color,boss?60:14,boss?10:6,4);sfx(bony?'bones':'die');
  if(bony)burst(e.x,e.y+1,0xf3ead7,14,5,4);
  if(!e.summon){const base=boss?40+G.floor*4:TYPES[e.type].xp;xpToKiller(e,e.x,e.y+e.h*0.6,base*(1+0.15*(G.floor-1))*(e.elite?2.5:1)*(boss?1:runXpMul()));}
  if(!boss&&!e.summon&&Math.random()<0.03)spawnBandage(e.x,0);
  if(e.elite&&!e.summon&&G.scene==='tower'&&!G.pvp&&novice()&&Math.random()<0.4){const f=G.floor,o=Math.random()<0.4?makeWeapon(G.cls.weapon,rollRarity(f,1),f):makeGear(pick(Object.keys(GEAR)),rollRarity(f,1),f);dropItem(o,e.x,e.y+e.h*0.6,0,1);popNum(e.x,e.y+e.h+0.6,'Bottino!','xp');}
  if(!e.summon&&G.scene==='tower'){G.upKills++;if(G.upKills>=G.upNeed&&!G.upPending){G.upKills=0;G.upNeed+=6;G.upPending=true;G.upDelay=0.5;}}
  if(G.weapon&&G.weapon.perk==='schegge'&&G.scene==='tower')for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;spawnProj({x:e.x,y:e.y+e.h/2,vx:Math.cos(a)*16,vy:Math.sin(a)*16,w:0.5,h:0.35,dmg:weaponDamage()*0.5,owner:'p',life:0.45,kind:'knife',kb:3});}
  e.parts.bar.visible=false;
  if(boss&&G.scene==='tower'){bossBlast(e);if(!G.bossHit&&G.floor>=75&&!G.horde&&!UNL.nohit75){UNL.nohit75=true;saveUnl();checkUnlocks();}spawnCage(G.floor);scene.remove(e.parts.root);disposeObj(e.parts.root);}
  else if(e.critKill&&G.scene==='tower'){
    const others=foes().length,combo=G.cmb>=3&&G.time-G.cmbT<1.6;
    if(!G.killcam&&(G.killcamCd||0)<=0&&(G.cmb>=2||others>=1)){G.killcam={e,t:0.95,x:e.x,y:e.y+e.h/2};G.killcamCd=2.2;G.hitstop=0;sfx('crit');
      burst(e.x,e.y+e.h/2,0xffffff,16,6,1,0);bleed(e,e.lastDir||1,true);}
    else{explodeEnemy(e);bleed(e,e.lastDir||1,true);scene.remove(e.parts.root);disposeObj(e.parts.root);}}
  else{G.corpses.push({e,t:0,vy:3});const bc=bloodOf(e);burst(e.x,e.y+e.h*0.6,bc,26,8,3,1.2);spray(e.x,e.y+e.h*0.6,bc,30,10,3);}
  if(boss){STATS.bosses++;G.hitstop=0.3;shake(0.8);G.boss=null;$('bossBar').hidden=true;heal(Math.round(S.maxHp*0.25));MUS.mood='tower';
    for(const x of G.enemies)if(!x.dead&&x.summon)killEnemy(x);     // i servitori svaniscono con il loro padrone
    for(const p of G.projs)if(p.owner==='e')p.dead=true;
    for(const w of G.warns)w.cancel=true;
    G.bossChestT=1.1;G.bossChestX=e.arch==='dragon'?(-HALF+GATE_X)/2:clamp((-HALF+GATE_X)/2,-HALF+3,GATE_X-3);}
}
function groundAt(x,y){let g=0;for(const s of G.solids)if(x>s.x1&&x<s.x2&&s.y2<=y+0.05&&s.y2>g)g=s.y2;return g;}
function updCorpses(dt){
  for(const c of G.corpses){c.t+=dt;const e=c.e,r=e.parts.root,boss=e.type==='boss',D=boss?1.5:0.75,k=Math.min(1,c.t/(D*0.47)),squish=e.type==='slime'||e.arch==='slimeKing';
    if(!e.fly){const gy=groundAt(e.x,e.y);if(e.y>gy){c.vy-=30*dt;e.y=Math.max(gy,e.y+c.vy*dt);if(squish)r.position.y=e.y;}}
    if(squish){r.scale.set(e.sc*(1+0.7*k),e.sc*Math.max(0.04,1-0.94*k),e.sc*(1+0.7*k));}
    else if(e.fly&&!e.parts.rig){if(e.y>0.02){c.vy-=30*dt;e.y=Math.max(0,e.y+c.vy*dt);e.parts.body.rotation.z+=dt*(boss?2:9);}else e.parts.body.rotation.z=lerp(e.parts.body.rotation.z,Math.round(e.parts.body.rotation.z/Math.PI)*Math.PI+Math.PI/2*0,damp(dt,8));r.position.y=e.y;}
    else{if(e.fly){c.vy-=30*dt;e.y=Math.max(0,e.y+c.vy*dt);r.position.y=e.y;}
      r.rotation.z=-e.lastDir*Math.PI/2*easeOutCubic(k);r.position.y=e.y+(e.parts.rig?0.2*(e.sc||1):e.w*0.45)*easeOutCubic(k);if(e.parts.rig){const R=e.parts.rig;R.legs[0].knee.rotation.x=lerp(R.legs[0].knee.rotation.x,1.2,k);R.arms[0].sh.rotation.x=lerp(R.arms[0].sh.rotation.x,-2.6,k*0.3);}}
    for(const m of e.parts.mats){m.emissive.setHex(0xffffff);m.emissiveIntensity=Math.max(0,0.8-c.t*3*0.75/D);}
    if(!c.pool&&c.t>0.6&&G.scene==='tower'){c.pool=1;splat('floor',e.x,groundAt(e.x,e.y)+0.022,rand(-0.25,0.25),bloodOf(e),boss?6:3.2,0,0);}
  }
  G.corpses=G.corpses.filter(c=>!c.done);
}
function contact(e,mult){if(mult<1)return;   // toccare un nemico non fa male: solo i suoi attacchi in carica, picchiata o scatto
  if(e.touchCd<=0&&!P.dead&&overlap(e.x-e.w/2,e.x+e.w/2,e.y,e.y+e.h,P)){hurtPlayer(e.dmg*mult,e.x,e.eff);e.touchCd=0.6;}}
const eProj=(e,o)=>spawnProj(Object.assign({owner:'e',eff:e.eff},o));
function impBoom(e){
  const r=2.4;burst(e.x,e.y+0.5,0xff7a2e,30,9,3);burst(e.x,e.y+0.5,0xfff27a,14,6,2);shake(0.4);sfx('boom');
  if(!P.dead&&Math.abs(P.x-e.x)<r&&Math.abs(P.y+1-(e.y+0.5))<r)hurtPlayer(e.dmg*1.4,e.x);
  for(const o of G.enemies)if(o!==e&&!o.dead&&o.type!=='boss'&&o.type!=='imp'&&Math.abs(o.x-e.x)<r*0.8&&Math.abs(o.y-e.y)<2)hitEnemy(o,e.dmg*0.5,o.x>=e.x?1:-1,{kb:8});
  killEnemy(e);
}
function updEnemy(e,realDt){
  if(e.spawnT>0){e.spawnT-=realDt;return;}
  if(e.burn){e.burn.t-=realDt;e.burn.acc+=realDt;if(Math.random()<0.35)burst(e.x+rand(-.3,.3),e.y+rand(.2,e.h),0xff7a2e,1,1,2,-0.3);
    if(e.burn.acc>=0.5){e.burn.acc-=0.5;e.hp-=e.burn.dmg;e.flash=0.05;popNum(e.x,e.y+e.h+0.2,String(e.burn.dmg),'burn');if(e.hp<=0){killEnemy(e);return;}}
    if(e.burn&&e.burn.t<=0)e.burn=null;}
  e.slowT-=realDt;const dt=e.slowT>0?realDt*0.55:realDt;
  e.t+=dt;e.cd-=dt;e.touchCd-=dt;e.flash-=realDt;e.flinch-=realDt;e.landT-=dt;e.castT-=dt;e.immT-=dt;
  const dx=P.x-e.x,dist=Math.abs(dx),dir=dx>=0?1:-1,kb=e.kbT>0;if(kb){e.kbT-=dt;e.vx*=0.88;}
  if(e.stunT>0){   // stordito: fermo, con le stelline
    e.stunT-=dt;e.warn=0;e.vx=approach(e.vx,0,30*dt);if(Math.random()<0.2)burst(e.x,e.y+e.h+0.2,0xffe27a,1,1.5,0.5,0);
    if(e.fly){e.vy=approach(e.vy,-2,10*dt);e.x+=e.vx*dt;e.y=clamp(e.y+e.vy*dt,0.4,CEIL-1.2);return;}
    e.vy+=GRAV*dt;moveBody(e,dt);return;}
  if(e.hitstun>0&&e.type!=='boss'){e.hitstun-=dt;e.warn=0;
    if(e.fly){e.x+=e.vx*dt;e.y=clamp(e.y+e.vy*dt,0.3,CEIL-1.2);e.vx*=0.92;e.vy*=0.9;return;}
    e.vy+=GRAV*(e.vy>0?0.75:0.5)*dt;moveBody(e,dt);return;}   // i nemici lanciati ricadono lenti: puoi seguirli in aria
  const wasGround=e.onGround;
  switch(e.type){
  case 'slime':
    if(e.onGround&&!kb){e.vx=approach(e.vx,0,20*dt);e.hopT-=dt;if(e.hopT<=0){e.vy=rand(7,9.5);e.vx=dir*e.speed*1.7;e.face=dir;e.hopT=rand(0.8,1.4);}}
    contact(e,e.onGround?0:1);break;
  case 'guard':
    if(e.state==='move'){if(!kb){e.face=dir;e.vx=approach(e.vx,dist>1.8?dir*e.speed:0,25*dt);}if(dist<2.3&&e.cd<=0&&Math.abs(P.y-e.y)<2.2){e.state='wind';e.t=0;e.face=dir;}}
    else if(e.state==='wind'){if(!kb)e.vx=approach(e.vx,0,30*dt);e.warn=e.t/0.5;if(e.t>=0.5){e.state='strike';e.t=0;e.warn=0;e.didHit=false;e.vx=e.face*6;}}
    else if(e.state==='strike'){if(!e.didHit&&e.t>0.04){const x1=e.face>0?e.x:e.x-2.5,x2=e.face>0?e.x+2.5:e.x;if(overlap(x1,x2,e.y+0.6,e.y+1.9,P)){hurtPlayer(e.dmg,e.x);e.didHit=true;}}if(e.t>0.28){e.state='rest';e.t=0;}}
    else if(e.state==='rest'){e.vx=approach(e.vx,0,30*dt);if(e.t>0.6){e.state='move';e.t=0;e.cd=0.4;}}
    contact(e,0.5);break;
  case 'mage':
    if(e.state==='move'){if(!kb){e.face=dir;let want=0;if(dist<6)want=-dir;else if(dist>10)want=dir;e.vx=approach(e.vx,want*e.speed,20*dt);}if(e.cd<=0&&dist<17){e.state='wind';e.t=0;}}
    else if(e.state==='wind'){e.face=dir;if(!kb)e.vx=approach(e.vx,0,20*dt);e.warn=e.t/0.65;
      if(Math.random()<0.6){const a=Math.random()*TAU;burst(e.x+e.face*0.6+Math.cos(a)*0.8,e.y+2.3+Math.sin(a)*0.8,0xb46cff,1,0.5,0,0);}
      if(e.t>0.65){const ox=e.x+e.face*0.6,oy=e.y+2.3,ax=P.x-ox,ay=P.y+1-oy,base=Math.atan2(ay,ax),n=G.floor>=20?3:1;
        for(let i=0;i<n;i++){const a=base+(i-(n-1)/2)*0.2;spawnProj({x:ox,y:oy,vx:Math.cos(a)*9,vy:Math.sin(a)*9,w:0.5,h:0.5,dmg:e.dmg,owner:'e',life:4,kind:'bolt',col:0xb46cff,homing:G.floor>=15?0.6:0});}
        burst(ox,oy,0xd7a8ff,14,4,1);sfx('orb');
        e.state='move';e.t=0;e.warn=0;e.castT=0.3;e.cd=rand(2.0,2.9)/spdMul(G.floor);}}
    contact(e,0.5);break;
  case 'bat':
    if(e.state==='hover'){const tx=P.x+Math.sin(e.t*1.1+e.seed)*4.5,ty=P.y+4.2+Math.sin(e.t*2.3+e.seed)*0.7;if(!kb)e.vx=approach(e.vx,(tx-e.x)*2,16*dt);e.vy=approach(e.vy,(ty-e.y)*2,16*dt);e.face=dir;if(e.cd<=0){e.state='wind';e.t=0;}}
    else if(e.state==='wind'){e.vx*=0.9;e.vy*=0.9;e.warn=e.t/0.45;if(e.t>0.45){const ax=P.x-e.x,ay=P.y+1-e.y,l=Math.hypot(ax,ay)||1,s=13*spdMul(G.floor);e.vx=ax/l*s;e.vy=ay/l*s;e.state='dive';e.t=0;e.warn=0;}}
    else if(e.state==='dive'){if(e.t>0.6||e.y<0.45){e.state='hover';e.t=0;e.cd=rand(1.8,2.8);e.vy=6;}}
    e.x+=e.vx*dt;e.y+=e.vy*dt;e.x=clamp(e.x,-HALF+1,GATE_X-1);e.y=clamp(e.y,0.4,CEIL-1.2);
    contact(e,e.state==='dive'?1:0.6);return;
  case 'archer':   // tiene le distanze e tira frecce a parabola
    if(e.state==='move'){if(!kb){e.face=dir;let want=0;if(dist<6)want=-dir;else if(dist>11)want=dir;e.vx=approach(e.vx,want*e.speed,20*dt);}
      if(e.cd<=0&&dist<18&&Math.abs(P.y-e.y)<5){e.state='wind';e.t=0;}}
    else if(e.state==='wind'){e.face=dir;if(!kb)e.vx=approach(e.vx,0,25*dt);e.warn=e.t/0.7;
      if(e.t>0.7){const ox=e.x+e.face*0.7,oy=e.y+1.45,s=17,tt=Math.max(0.15,Math.abs(P.x-ox)/s);
        spawnProj({x:ox,y:oy,vx:(P.x>=ox?1:-1)*s,vy:clamp((P.y+1.1-oy)/tt+7*tt,-12,12),g:14,w:0.6,h:0.25,dmg:e.dmg,owner:'e',life:2.5,kind:'arrow'});sfx('arrow');
        e.state='rest';e.t=0;e.warn=0;e.castT=0.3;}}
    else if(e.state==='rest'){e.vx=approach(e.vx,0,20*dt);if(e.t>0.5){e.state='move';e.t=0;e.cd=rand(1.6,2.4)/spdMul(G.floor);}}
    contact(e,0.4);break;
  case 'knight':   // avanza dietro lo scudo: va colpito alle spalle o dopo il suo attacco
    if(e.state==='move'){if(!kb){e.face=dir;e.vx=approach(e.vx,dist>2?dir*e.speed:0,20*dt);}if(dist<2.6&&e.cd<=0&&Math.abs(P.y-e.y)<2.2){e.state='wind';e.t=0;e.face=dir;}}
    else if(e.state==='wind'){if(!kb)e.vx=approach(e.vx,0,30*dt);e.warn=e.t/0.6;if(e.t>=0.6){e.state='strike';e.t=0;e.warn=0;e.didHit=false;e.vx=e.face*7;sfx('swing');}}
    else if(e.state==='strike'){if(!e.didHit&&e.t>0.05){const x1=e.face>0?e.x:e.x-2.6,x2=e.face>0?e.x+2.6:e.x;if(overlap(x1,x2,e.y+0.3,e.y+2.2,P)){hurtPlayer(e.dmg,e.x);e.didHit=true;}}if(e.t>0.3){e.state='rest';e.t=0;}}
    else if(e.state==='rest'){e.vx=approach(e.vx,0,30*dt);if(e.t>0.8){e.state='move';e.t=0;e.cd=0.6;}}
    contact(e,0.5);break;
  case 'imp':      // corre verso di te, si accende e scoppia
    if(e.state==='move'){if(!kb){e.face=dir;if(e.onGround){e.hopT-=dt;e.vx=approach(e.vx,dir*e.speed,30*dt);if(e.hopT<=0){e.vy=rand(5,8);e.hopT=rand(0.5,1);}}}
      if(dist<1.7&&Math.abs(P.y-e.y)<1.8){e.state='fuse';e.t=0;sfx('fuse');}}
    else if(e.state==='fuse'){e.vx=approach(e.vx,0,20*dt);e.warn=1;if(Math.floor(e.t*8)!==Math.floor((e.t-dt)*8))sfx('fuse');
      if(Math.random()<0.5)burst(e.x,e.y+e.h+0.1,0xffc040,1,1,1,0);
      if(e.t>0.75){impBoom(e);return;}}
    contact(e,0.3);break;
  case 'wraith':{  // fluttua, diventa intangibile a intervalli, poi ti attraversa
    e.phT=(e.phT||e.seed)+dt;const ph=(e.phT%4.2)>2.7&&e.state==='hover';
    if(ph!==!!e.phased){e.phased=ph;burst(e.x,e.y+1,0xbfe6ff,10,3,1,0.2);}
    if(e.state==='hover'){const tx=P.x-dir*3.2+Math.sin(e.t*0.9+e.seed)*1.5,ty=P.y+0.6+Math.sin(e.t*1.7+e.seed)*0.5;
      e.vx=approach(e.vx,(tx-e.x)*1.6,10*dt);e.vy=approach(e.vy,(ty-e.y)*1.6,10*dt);e.face=dir;
      if(e.cd<=0&&!e.phased&&dist<9){e.state='wind';e.t=0;}}
    else if(e.state==='wind'){e.vx*=0.9;e.vy*=0.9;e.warn=e.t/0.55;if(e.t>0.55){const ax=P.x-e.x,ay=P.y+0.6-e.y,l=Math.hypot(ax,ay)||1;e.vx=ax/l*14;e.vy=ay/l*14;e.state='dash';e.t=0;e.warn=0;}}
    else if(e.state==='dash'){if(e.t>0.5){e.state='hover';e.t=0;e.cd=rand(1.6,2.6);}}
    e.x+=e.vx*dt;e.y+=e.vy*dt;e.x=clamp(e.x,-HALF+1,GATE_X-1);e.y=clamp(e.y,0.2,CEIL-2.2);
    if(!e.phased)contact(e,e.state==='dash'?1:0.5);return;}
  case 'brute':    // lento, alza la mazza e sfonda il pavimento
    if(e.state==='move'){if(!kb){e.face=dir;e.vx=approach(e.vx,dist>2.5?dir*e.speed:0,10*dt);}if(dist<3.6&&e.cd<=0&&Math.abs(P.y-e.y)<3){e.state='wind';e.t=0;e.face=dir;}}
    else if(e.state==='wind'){e.vx=approach(e.vx,0,20*dt);e.warn=e.t/0.9;if(e.t>=0.9){e.state='slam';e.t=0;e.warn=0;
      const hx=e.x+e.face*1.9;shake(0.45);sfx('slam');burst(hx,0.2,0xb9ad98,20,7,2);e.landT=0.2;
      if(overlap(hx-1.5,hx+1.5,e.y,e.y+2.5,P))hurtPlayer(e.dmg*1.3,e.x);
      for(const s of [-1,1])spawnProj({x:hx+s*0.8,y:0,vx:s*9,vy:0,w:0.6,h:0.9,dmg:e.dmg*0.6,owner:'e',life:1.0,kind:'shock'});}}
    else if(e.state==='slam'){if(e.t>0.9){e.state='move';e.t=0;e.cd=rand(1.2,2);}}
    contact(e,0.7);break;
  case 'shaman':   // evoca scheletri e lancia sfere a ventaglio
    if(e.state==='move'){if(!kb){e.face=dir;let want=0;if(dist<7)want=-dir;else if(dist>12)want=dir;e.vx=approach(e.vx,want*e.speed,20*dt);}
      if(e.cd<=0){e.state='wind';e.t=0;e.mode=(e.adds<4&&aliveCount()<9&&Math.random()<0.5)?'summon':'cast';}}
    else if(e.state==='wind'){e.face=dir;if(!kb)e.vx=approach(e.vx,0,20*dt);e.warn=e.t/0.8;
      if(e.t>0.8){if(e.mode==='summon'){for(const s of [-1,1])spawnEnemy('guard',{x:clamp(e.x+s*2,-HALF+2,GATE_X-2),summon:true});e.adds+=2;sfx('ability');}
        else{const ox=e.x+e.face*0.6,oy=e.y+2.3,b=Math.atan2(P.y+1-oy,P.x-ox);for(let i=-1;i<=1;i++){const a=b+i*0.22;spawnProj({x:ox,y:oy,vx:Math.cos(a)*8,vy:Math.sin(a)*8,w:0.5,h:0.5,dmg:e.dmg,owner:'e',life:4,kind:'bolt',col:0x6aff9a});}sfx('orb');}
        e.state='move';e.t=0;e.warn=0;e.castT=0.3;e.cd=rand(2.4,3.4)/spdMul(G.floor);}}
    contact(e,0.5);break;
  case 'spider':   // zampetta veloce, sputa ragnatele e ti balza addosso
    if(e.state==='move'){if(!kb){e.face=dir;e.vx=approach(e.vx,dist>3.5?dir*e.speed:0,26*dt);}
      if(e.cd<=0&&dist<11&&e.onGround){e.state='wind';e.t=0;e.mode=dist>5?'web':'leap';}}
    else if(e.state==='wind'){if(!kb)e.vx=approach(e.vx,0,30*dt);e.face=dir;const T=e.mode==='web'?0.55:0.4;e.warn=e.t/T;
      if(e.t>=T){e.t=0;e.warn=0;
        if(e.mode==='web'){const ox=e.x+e.face*0.7,oy=e.y+0.6,s=13,tt=Math.max(0.2,Math.abs(P.x-ox)/s);
          spawnProj({x:ox,y:oy,vx:(P.x>=ox?1:-1)*s,vy:clamp((P.y+1-oy)/tt+7*tt,-11,11),g:14,w:0.55,h:0.55,dmg:e.dmg*0.6,owner:'e',eff:'web',life:2.5,kind:'bolt',col:0xe8e8f0});sfx('orb');e.castT=0.25;e.state='rest';}
        else{e.vy=rand(9,11);e.vx=clamp((P.x-e.x)/0.85,-14,14);e.state='leap';e.air=false;sfx('swing');}}}
    else if(e.state==='leap'){if(!e.onGround)e.air=true;else if(e.air||e.t>1.5){e.state='rest';e.t=0;e.landT=0.18;e.vx=0;}contact(e,1);}
    else if(e.state==='rest'){if(!kb)e.vx=approach(e.vx,0,30*dt);if(e.t>0.55){e.state='move';e.t=0;e.cd=rand(1.3,2.2)/spdMul(G.floor);}}
    break;
  case 'fungus':   // lento: lancia spore velenose e, se ti avvicini, si gonfia e scoppia una nube
    if(e.state==='move'){if(!kb){e.face=dir;e.vx=approach(e.vx,dist>5?dir*e.speed:0,12*dt);}
      if(e.cd<=0&&dist<13){e.state='wind';e.t=0;e.mode=dist<3.4&&Math.abs(P.y-e.y)<3?'puff':'spore';}}
    else if(e.state==='wind'){if(!kb)e.vx=approach(e.vx,0,20*dt);e.face=dir;const T=e.mode==='puff'?0.6:0.75;e.warn=e.t/T;
      if(e.t>=T){e.warn=0;e.t=0;e.state='rest';e.castT=0.35;
        if(e.mode==='puff'){burst(e.x,e.y+1,0x9ae06a,30,6,2,0.1);sfx('fuse');if(!P.dead&&Math.abs(P.x-e.x)<3.4&&Math.abs(P.y-e.y)<3)hurtPlayer(e.dmg,e.x,'poison');}
        else{const ox=e.x,oy=e.y+1.7;for(let i=-1;i<=1;i++){const tt=0.8+i*0.12,tx=P.x+i*1.7;spawnProj({x:ox,y:oy,vx:(tx-ox)/tt,vy:(0.3-oy)/tt+8*tt,g:16,w:0.5,h:0.5,dmg:e.dmg*0.7,owner:'e',eff:'poison',life:3,kind:'glob'});}sfx('orb');}}}
    else if(e.state==='rest'){if(!kb)e.vx=approach(e.vx,0,20*dt);if(e.t>0.7){e.state='move';e.t=0;e.cd=rand(1.8,2.8)/spdMul(G.floor);}}
    break;
  case 'gargoyle':   // resta in alto, poi piomba a terra con un'onda d'urto e resta lì per un attimo
    if(e.state==='hover'){const tx=P.x+Math.sin(e.t*0.8+e.seed)*3,ty=Math.min(CEIL-2.4,P.y+6);if(!kb)e.vx=approach(e.vx,(tx-e.x)*1.8,14*dt);e.vy=approach(e.vy,(ty-e.y)*2,14*dt);e.face=dir;if(e.cd<=0&&dist<7){e.state='wind';e.t=0;}}
    else if(e.state==='wind'){e.vx*=0.9;e.vy=approach(e.vy,2,20*dt);e.warn=e.t/0.6;if(e.t>=0.6){e.state='dive';e.t=0;e.warn=0;e.vx=clamp(P.x-e.x,-5,5);sfx('dash');}}
    else if(e.state==='dive'){e.vy=-24;contact(e,1.2);
      if(e.y<=0.15){e.y=0;e.vx=0;e.vy=0;e.state='perch';e.t=0;e.landT=0.25;shake(0.4);sfx('slam');burst(e.x,0.2,0xb9ad98,20,7,2);
        for(const s of [-1,1])spawnProj({x:e.x+s*0.8,y:0,vx:s*10,vy:0,w:0.6,h:0.9,dmg:e.dmg*0.6,owner:'e',life:1.1,kind:'shock'});}}
    else if(e.state==='perch'){e.vx=approach(e.vx,0,30*dt);e.vy=0;if(e.t>1.3){e.state='hover';e.t=0;e.cd=rand(1.8,2.8)/spdMul(G.floor);e.vy=7;}}
    e.x+=e.vx*dt;e.y+=e.vy*dt;e.x=clamp(e.x,-HALF+1,GATE_X-1);e.y=clamp(e.y,0,CEIL-1.8);return;
  case 'shade':    // svanisce e riappare alle tue spalle: colpiscila appena si materializza
    if(e.state==='move'){if(!kb){e.face=dir;e.vx=approach(e.vx,dist>2?dir*e.speed:0,22*dt);}if(e.cd<=0&&dist<16){e.state='fade';e.t=0;burst(e.x,e.y+1,0x6a4aff,14,4,1,0.2);}}
    else if(e.state==='fade'){if(!kb)e.vx=approach(e.vx,0,30*dt);
      if(e.t>=0.45){const side=P.face>0?-1:1;e.x=clamp(P.x+side*1.7,-HALF+1.5,GATE_X-1.5);e.y=P.onGround?P.y:e.y;e.face=e.x<P.x?1:-1;e.vx=0;burst(e.x,e.y+1,0x6a4aff,18,5,1,0.2);sfx('dash');e.state='wind';e.t=0;}}
    else if(e.state==='wind'){e.vx=0;e.face=dir;e.warn=e.t/0.38;if(e.t>=0.38){e.state='strike';e.t=0;e.warn=0;e.didHit=false;e.vx=e.face*8;sfx('swing');}}
    else if(e.state==='strike'){if(!e.didHit&&e.t>0.04){const x1=e.face>0?e.x:e.x-2.6,x2=e.face>0?e.x+2.6:e.x;if(overlap(x1,x2,e.y+0.2,e.y+2.1,P)){hurtPlayer(e.dmg,e.x);e.didHit=true;}}if(e.t>0.24){e.state='rest';e.t=0;}}
    else if(e.state==='rest'){e.vx=approach(e.vx,0,30*dt);if(e.t>0.7){e.state='move';e.t=0;e.cd=rand(2,3.2)/spdMul(G.floor);}}
    contact(e,0.5);break;
  case 'scorpion':   // pinze da vicino, pungiglione velenoso da lontano
    if(e.state==='move'){if(!kb){e.face=dir;e.vx=approach(e.vx,dist>2.4?dir*e.speed:0,22*dt);}if(e.cd<=0&&dist<12&&Math.abs(P.y-e.y)<5){e.state='wind';e.t=0;e.mode=dist<3.2?'claw':'sting';}}
    else if(e.state==='wind'){if(!kb)e.vx=approach(e.vx,0,30*dt);e.face=dir;const T=e.mode==='claw'?0.45:0.65;e.warn=e.t/T;
      if(e.t>=T){e.t=0;e.warn=0;
        if(e.mode==='claw'){e.state='strike';e.didHit=false;e.vx=e.face*7;sfx('swing');}
        else{const ox=e.x+e.face*0.3,oy=e.y+1.7,sp=15,a=Math.atan2(P.y+1-oy,P.x-ox);spawnProj({x:ox,y:oy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,w:0.45,h:0.45,dmg:e.dmg*0.85,owner:'e',eff:'poison',life:2.5,kind:'bolt',col:0xa6e34a});sfx('arrow');e.castT=0.3;e.state='rest';}}}
    else if(e.state==='strike'){if(!e.didHit&&e.t>0.04){const x1=e.face>0?e.x:e.x-2.9,x2=e.face>0?e.x+2.9:e.x;if(overlap(x1,x2,e.y,e.y+1.7,P)){hurtPlayer(e.dmg,e.x);e.didHit=true;}}if(e.t>0.26){e.state='rest';e.t=0;}}
    else if(e.state==='rest'){if(!kb)e.vx=approach(e.vx,0,30*dt);if(e.t>0.65){e.state='move';e.t=0;e.cd=rand(1.4,2.4)/spdMul(G.floor);}}
    contact(e,0.5);break;
  case 'salamander':   // striscia bassa e sputa una lingua di fuoco
    if(e.state==='move'){if(!kb){e.face=dir;e.vx=approach(e.vx,dist>5?dir*e.speed:0,20*dt);}if(e.cd<=0&&dist<9&&Math.abs(P.y-e.y)<3.5){e.state='wind';e.t=0;}}
    else if(e.state==='wind'){if(!kb)e.vx=approach(e.vx,0,30*dt);e.face=dir;e.warn=e.t/0.7;if(e.t>=0.7){e.state='breath';e.t=0;e.warn=0;e.n=0;sfx('orb');}}
    else if(e.state==='breath'){if(!kb)e.vx=approach(e.vx,0,30*dt);
      if(e.t>=e.n*0.13){e.n++;spawnProj({x:e.x+e.face*1.2,y:e.y+0.6,vx:e.face*rand(10,13),vy:rand(-0.5,1.2),w:0.6,h:0.6,dmg:e.dmg*0.75,owner:'e',eff:'burn',life:0.75,kind:'fire',sz:0.75});}
      if(e.t>1.05){e.state='rest';e.t=0;}}
    else if(e.state==='rest'){if(!kb)e.vx=approach(e.vx,0,30*dt);if(e.t>0.9){e.state='move';e.t=0;e.cd=rand(2,3)/spdMul(G.floor);}}
    contact(e,0.5);break;
  case 'eye':      // prende la mira e spara una raffica in linea retta
    if(e.state==='hover'){const tx=P.x-dir*7+Math.sin(e.t*0.7+e.seed)*1.5,ty=P.y+3+Math.sin(e.t*1.3+e.seed)*0.6;if(!kb)e.vx=approach(e.vx,(tx-e.x)*1.5,10*dt);e.vy=approach(e.vy,(ty-e.y)*1.5,10*dt);e.face=dir;if(e.cd<=0&&dist<16){e.state='wind';e.t=0;}}
    else if(e.state==='wind'){e.vx*=0.9;e.vy*=0.9;e.face=dir;e.warn=e.t/1;if(e.t<0.75){e.ax=P.x;e.ay=P.y+1;}if(e.t>=1){e.state='fire';e.t=0;e.warn=0;e.n=0;sfx('orb');}}
    else if(e.state==='fire'){e.vx*=0.9;e.vy*=0.9;
      if(e.n<5&&e.t>=e.n*0.09){e.n++;const a=Math.atan2(e.ay-(e.y+0.6),e.ax-e.x);spawnProj({x:e.x+Math.cos(a)*0.7,y:e.y+0.6+Math.sin(a)*0.7,vx:Math.cos(a)*21,vy:Math.sin(a)*21,w:0.4,h:0.4,dmg:e.dmg*0.6,owner:'e',life:2,kind:'bolt',col:0xff4d8a});}
      if(e.t>0.7){e.state='hover';e.t=0;e.cd=rand(2.2,3.2)/spdMul(G.floor);}}
    e.x+=e.vx*dt;e.y+=e.vy*dt;e.x=clamp(e.x,-HALF+1,GATE_X-1);e.y=clamp(e.y,0.8,CEIL-1.8);return;
  case 'minotaur': // carica a testa bassa: se finisce contro il muro resta stordito
    if(e.state==='move'){if(!kb){e.face=dir;e.vx=approach(e.vx,dist>3?dir*e.speed:0,12*dt);}
      if(e.cd<=0&&Math.abs(P.y-e.y)<3.5){if(dist<3.8){e.state='wind';e.t=0;e.mode='swing';}else if(dist>5){e.state='wind';e.t=0;e.mode='charge';}}}
    else if(e.state==='wind'){if(!kb)e.vx=approach(e.vx,0,24*dt);e.face=dir;const T=e.mode==='charge'?0.85:0.7;e.warn=e.t/T;if(e.mode==='charge'&&Math.random()<0.4)burst(e.x-e.face*0.8,0.2,0xb9ad98,1,2,1);
      if(e.t>=T){e.t=0;e.warn=0;if(e.mode==='charge'){e.state='charge';sfx('roar');}else{e.state='strike';e.didHit=false;e.vx=e.face*5;sfx('heavy');}}}
    else if(e.state==='charge'){e.vx=e.face*15;if(Math.random()<0.6)burst(e.x-e.face,0.2,0xb9ad98,1,2,1);contact(e,1.3);
      if(e.hitWall&&e.hitWall===e.face){e.vx=-e.face*4;shake(0.5);sfx('slam');burst(e.x+e.face,1.5,0xb9ad98,24,7,2);e.stunT=1.6;e.state='move';e.t=0;e.cd=rand(1.5,2.5);}
      else if(e.t>1.15){e.state='rest';e.t=0;}}
    else if(e.state==='strike'){if(!e.didHit&&e.t>0.05){const x1=e.face>0?e.x:e.x-3.6,x2=e.face>0?e.x+3.6:e.x;if(overlap(x1,x2,e.y,e.y+3.2,P)){hurtPlayer(e.dmg*1.1,e.x);e.didHit=true;}}if(e.t>0.3){e.state='rest';e.t=0;}}
    else if(e.state==='rest'){if(!kb)e.vx=approach(e.vx,0,14*dt);if(e.t>0.9){e.state='move';e.t=0;e.cd=rand(1.2,2.2)/spdMul(G.floor);}}
    contact(e,0.5);break;
  case 'boss':if(updBoss(e,dt,dir,dist))return;break;
  }
  e.vy+=GRAV*dt;moveBody(e,dt);
  if(!wasGround&&e.onGround)e.landT=0.18;
}

/* ---------- Guardiani: ognuno combatte a modo suo ---------- */
function bossAdds(e,dt){
  const a=e.def.adds;if(!a||e.arch==='dragon')return;e.addT=(e.addT==null?6:e.addT)-dt;
  if(e.addT<=0){e.addT=e.hp<e.maxHp*0.5?7:10;const alive=G.enemies.filter(x=>!x.dead&&x.summon).length;
    if(alive<3){const n=(a==='brute'||a==='knight')?1:2;for(let i=0;i<n;i++)spawnEnemy(a,{x:clamp(e.x+rand(-4,4),-HALF+2,GATE_X-2),summon:true});sfx('ability');}}
}
function updBoss(e,dt,dir,dist){
  const rage=e.hp<e.maxHp*0.5,sp=rage?1.3:1;bossAdds(e,dt);
  if(BOSS_KITS[e.def.floor])return bKit(e,dt,dir,dist,rage,sp);
  switch(e.arch){
  case 'golem':return bGolem(e,dt,dir,dist,rage,sp);
  case 'slimeKing':return bSlime(e,dt,dir,dist,rage,sp);
  case 'skelKing':return bSkel(e,dt,dir,dist,rage,sp);
  case 'bknight':return bKnight(e,dt,dir,dist,rage,sp);
  case 'archmage':return bMage(e,dt,dir,dist,rage,sp);
  case 'batQueen':return bBat(e,dt,dir,dist,rage,sp);
  case 'dragon':return bDragon(e,dt,dir,dist,rage,sp);
  }
  return false;
}
function bGolem(e,dt,dir,dist,rage,sp){
  switch(e.state){
  case 'move':e.face=dir;e.vx=approach(e.vx,dir*e.speed*0.55,18*dt);
    if(e.t>(rage?0.8:1.4)){const p=pick(['slam','charge','volley'].filter(o=>o!==e.last));e.last=p;e.state=p+'Wind';e.t=0;}break;
  case 'slamWind':e.vx=approach(e.vx,0,30*dt);e.warn=e.t/0.5;if(e.t>0.5/sp){e.state='slamAir';e.t=0;e.warn=0;e.vy=17;e.vx=clamp((P.x-e.x)/0.95,-14,14);e.wasAir=false;}break;
  case 'slamAir':if(!e.onGround)e.wasAir=true;
    if(e.wasAir&&e.onGround){e.vx=0;shake(0.55);sfx('slam');burst(e.x,0.2,0xb9ad98,26,8,2);e.landT=0.25;
      for(const s of [-1,1])eProj(e,{x:e.x+s*1.2,y:0,vx:s*10*sp,vy:0,w:0.6,h:1,dmg:e.dmg*0.8,life:1.6,kind:'shock'});
      e.state='recover';e.t=0;e.rec=1.0/sp;}break;
  case 'chargeWind':e.vx=0;e.face=dir;e.warn=e.t/0.75;if(e.t>0.75/sp){e.state='charge';e.t=0;e.warn=0;}break;
  case 'charge':e.vx=e.face*14*sp;if(Math.random()<0.5)burst(e.x-e.face,0.2,0xb9ad98,1,2,1);
    if((e.hitWall&&e.hitWall===e.face)||e.t>1.7){e.vx=-e.face*4;e.vy=5;shake(0.4);sfx('slam');e.state='recover';e.t=0;e.rec=1.2/sp;}break;
  case 'volleyWind':e.vx=approach(e.vx,0,30*dt);e.face=dir;e.warn=e.t/0.6;
    if(e.t>0.6/sp){const n=rage?7:5,ox=e.x+e.face,oy=e.y+3.0,base=Math.atan2(P.y+1-oy,P.x-ox);
      for(let i=0;i<n;i++){const a=base+(i-(n-1)/2)*0.17;eProj(e,{x:ox,y:oy,vx:Math.cos(a)*7.5,vy:Math.sin(a)*7.5,w:0.5,h:0.5,dmg:e.dmg*0.65,life:4,kind:'bolt',col:e.color});}
      sfx('orb');e.state='recover';e.t=0;e.warn=0;e.rec=0.8/sp;}break;
  case 'recover':e.vx=approach(e.vx,0,14*dt);if(e.t>e.rec){e.state='move';e.t=0;}break;
  }
  contact(e,e.state==='charge'?1.1:0.6);return false;
}
function bSlime(e,dt,dir,dist,rage,sp){
  e.split=e.split||0;
  if(e.split<2&&e.hp<e.maxHp*(e.split===0?0.66:0.33)){e.split++;for(const s of [-1,1])spawnEnemy('slime',{x:clamp(e.x+s*2.2,-HALF+2,GATE_X-2),summon:true});burst(e.x,1.5,e.color,24,7,4);sfx('die');popNum(e.x,e.y+e.h+0.5,'Si divide!','info');}
  switch(e.state){
  case 'move':e.face=dir;if(e.onGround){e.vx=approach(e.vx,0,20*dt);if(e.t>(rage?0.6:1.0)){e.state=Math.random()<0.55?'hopWind':'spitWind';e.t=0;}}break;
  case 'hopWind':e.vx=0;e.warn=e.t/0.45;if(e.t>0.45/sp){e.state='hop';e.t=0;e.warn=0;e.vy=rand(15,19);e.vx=clamp((P.x-e.x)/1.1,-12,12);e.wasAir=false;}break;
  case 'hop':if(!e.onGround)e.wasAir=true;if(e.wasAir&&e.onGround){e.vx=0;e.landT=0.25;shake(0.5);sfx('slam');burst(e.x,0.2,e.color,20,7,2);
      for(const s of [-1,1])eProj(e,{x:e.x+s*1.5,y:0,vx:s*9*sp,vy:0,w:0.6,h:0.8,dmg:e.dmg*0.7,life:1.3,kind:'shock'});e.state='rest';e.t=0;e.rec=0.7/sp;}break;
  case 'spitWind':e.vx=0;e.face=dir;e.warn=e.t/0.55;
    if(e.t>0.55/sp){const n=rage?5:3,ox=e.x+e.face*1.2,oy=e.y+2;for(let i=0;i<n;i++){const tt=0.7+i*0.18,tx=P.x+rand(-2.5,2.5);eProj(e,{x:ox,y:oy,vx:(tx-ox)/tt,vy:(0.3-oy)/tt+10*tt,g:20,w:0.55,h:0.55,dmg:e.dmg*0.6,life:3,kind:'glob'});}
      sfx('orb');e.state='rest';e.t=0;e.warn=0;e.rec=0.8/sp;}break;
  case 'rest':e.vx=approach(e.vx,0,14*dt);if(e.t>e.rec){e.state='move';e.t=0;}break;
  }
  contact(e,0.6);return false;
}
function bSkel(e,dt,dir,dist,rage,sp){
  switch(e.state){
  case 'move':e.face=dir;e.vx=approach(e.vx,dist>3?dir*e.speed*0.7:0,18*dt);
    if(e.t>(rage?0.7:1.1)){let o=dist<4.5?['swipe','swipe','bones']:['bones','charge'];if(rage&&!e.raised)o=['raise'];e.state=pick(o)+'Wind';e.t=0;}break;
  case 'swipeWind':e.vx=approach(e.vx,0,30*dt);e.face=dir;e.warn=e.t/0.55;if(e.t>0.55/sp){e.state='swipe';e.t=0;e.warn=0;e.didHit=false;e.vx=e.face*9;sfx('heavy');}break;
  case 'swipe':if(!e.didHit&&e.t>0.05){const x1=e.face>0?e.x:e.x-4,x2=e.face>0?e.x+4:e.x;if(overlap(x1,x2,e.y,e.y+3.4,P)){hurtPlayer(e.dmg*1.2,e.x,e.eff);e.didHit=true;}}if(e.t>0.3){e.state='rest';e.t=0;e.rec=0.6/sp;}break;
  case 'bonesWind':e.vx=approach(e.vx,0,30*dt);e.face=dir;e.warn=e.t/0.5;
    if(e.t>0.5/sp){const n=rage?5:3,ox=e.x+e.face,oy=e.y+3;for(let i=0;i<n;i++){const tt=0.6+i*0.2,tx=P.x+(i-(n-1)/2)*1.6;eProj(e,{x:ox,y:oy,vx:(tx-ox)/tt,vy:(0.4-oy)/tt+11*tt,g:22,w:0.5,h:0.5,dmg:e.dmg*0.6,life:3,kind:'bone'});}
      sfx('bones');e.state='rest';e.t=0;e.warn=0;e.rec=0.7/sp;}break;
  case 'chargeWind':e.vx=0;e.face=dir;e.warn=e.t/0.7;if(e.t>0.7/sp){e.state='charge';e.t=0;e.warn=0;}break;
  case 'charge':e.vx=e.face*13*sp;if((e.hitWall&&e.hitWall===e.face)||e.t>1.4){e.vx=-e.face*3;shake(0.3);sfx('slam');e.state='rest';e.t=0;e.rec=0.9/sp;}break;
  case 'raiseWind':e.vx=0;e.warn=e.t;if(e.t>1.0){e.raised=true;for(const s of [-1,1])spawnEnemy('guard',{x:clamp(e.x+s*3,-HALF+2,GATE_X-2),summon:true});sfx('roar');shake(0.3);e.state='rest';e.t=0;e.warn=0;e.rec=0.5;}break;
  case 'rest':e.vx=approach(e.vx,0,14*dt);if(e.t>e.rec){e.state='move';e.t=0;}break;
  }
  contact(e,e.state==='charge'?1.1:0.5);return false;
}
function bKnight(e,dt,dir,dist,rage,sp){
  switch(e.state){
  case 'move':e.face=dir;e.vx=approach(e.vx,dist>2.8?dir*e.speed*0.8:0,18*dt);
    if(e.t>(rage?0.6:1.0)){e.state=pick(dist<4?['combo','combo','leap']:['dash','leap'])+'Wind';e.t=0;e.n=0;}break;
  case 'comboWind':e.vx=approach(e.vx,0,30*dt);e.face=dir;e.warn=e.t/0.4;if(e.t>0.4/sp){e.state='combo';e.t=0;e.warn=0;e.didHit=false;e.vx=e.face*8;sfx('swing');}break;
  case 'combo':if(!e.didHit&&e.t>0.04){const x1=e.face>0?e.x:e.x-3.4,x2=e.face>0?e.x+3.4:e.x;if(overlap(x1,x2,e.y,e.y+3,P)){hurtPlayer(e.dmg,e.x,e.eff);e.didHit=true;}}
    if(e.t>0.24/sp){e.n++;if(e.n<(rage?4:3)){e.face=dir;e.t=0;e.didHit=false;e.vx=e.face*8;sfx('swing');}else{e.state='rest';e.t=0;e.rec=0.8/sp;}}break;
  case 'dashWind':e.vx=0;e.face=dir;e.warn=e.t/0.6;if(e.t>0.6/sp){e.state='dash';e.t=0;e.warn=0;e.didHit=false;sfx('dash');}break;
  case 'dash':e.vx=e.face*22;if(Math.random()<0.6)burst(e.x-e.face,1,e.color,1,2,1,0);
    if(!e.didHit&&overlap(e.x-e.w,e.x+e.w,e.y,e.y+e.h,P)){hurtPlayer(e.dmg*1.2,e.x,e.eff);e.didHit=true;}
    if((e.hitWall&&e.hitWall===e.face)||e.t>0.5){e.state='rest';e.t=0;e.rec=0.7/sp;}break;
  case 'leapWind':e.vx=approach(e.vx,0,30*dt);e.warn=e.t/0.5;if(e.t>0.5/sp){e.state='leap';e.t=0;e.warn=0;e.vy=18;e.vx=clamp((P.x-e.x)/1.0,-15,15);e.wasAir=false;}break;
  case 'leap':if(!e.onGround)e.wasAir=true;if(e.wasAir&&e.onGround){e.vx=0;e.landT=0.25;shake(0.5);sfx('slam');burst(e.x,0.2,0xb9ad98,24,8,2);
      for(const s of [-1,1])eProj(e,{x:e.x+s*1.2,y:0,vx:s*11*sp,vy:0,w:0.6,h:1,dmg:e.dmg*0.7,life:1.4,kind:'shock'});e.state='rest';e.t=0;e.rec=0.9/sp;}break;
  case 'rest':e.vx=approach(e.vx,0,14*dt);if(e.t>e.rec){e.state='move';e.t=0;}break;
  }
  contact(e,e.state==='dash'?0:0.5);return false;
}
function bMage(e,dt,dir,dist,rage,sp){
  if(e.homeX==null)e.homeX=e.x;
  switch(e.state){
  case 'move':e.vx=approach(e.vx,(e.homeX+Math.sin(G.time*0.6)*3-e.x)*1.5,8*dt);e.vy=(4.5+Math.sin(e.t*1.3)*0.8-e.y)*2;e.face=dir;
    if(e.t>(rage?0.9:1.4)){const p=pick(['orbs','ring','pillars','tele'].filter(o=>o!==e.last));e.last=p;e.state=p+'Wind';e.t=0;}break;
  case 'teleWind':e.vx*=0.9;e.vy*=0.9;e.warn=e.t/0.4;if(e.t>0.4){burst(e.x,e.y+1.5,e.color,20,5,2,0.2);let nx=0;for(let i=0;i<10;i++){nx=rand(-HALF+3,GATE_X-3);if(Math.abs(nx-P.x)>5)break;}
      e.x=e.homeX=nx;e.y=rand(4,6.5);burst(e.x,e.y+1.5,e.color,20,5,2,0.2);sfx('dash');e.state='rest';e.t=0;e.warn=0;e.rec=0.3;}break;
  case 'orbsWind':e.vx*=0.9;e.vy*=0.9;e.face=dir;e.warn=e.t/0.6;
    if(e.t>0.6/sp){const n=rage?4:3;for(let i=0;i<n;i++){const a=Math.atan2(P.y+1-(e.y+2),P.x-e.x)+(i-(n-1)/2)*0.5;eProj(e,{x:e.x+e.face*0.6,y:e.y+2,vx:Math.cos(a)*6,vy:Math.sin(a)*6,w:0.5,h:0.5,dmg:e.dmg*0.7,life:5,kind:'bolt',col:e.color,homing:1.6});}
      sfx('orb');e.castT=0.3;e.state='rest';e.t=0;e.warn=0;e.rec=0.8/sp;}break;
  case 'ringWind':e.vx*=0.9;e.vy*=0.9;e.warn=e.t/0.7;
    if(e.t>0.7/sp){const n=rage?14:10,off=Math.random();for(let i=0;i<n;i++){const a=(i+off)/n*TAU;eProj(e,{x:e.x,y:e.y+1.6,vx:Math.cos(a)*6.5,vy:Math.sin(a)*6.5,w:0.5,h:0.5,dmg:e.dmg*0.6,life:4,kind:'bolt',col:e.color});}
      sfx('orb');e.castT=0.3;e.state='rest';e.t=0;e.warn=0;e.rec=0.9/sp;}break;
  case 'pillarsWind':e.vx*=0.9;e.vy*=0.9;e.warn=e.t/0.5;
    if(e.t>0.5/sp){const n=rage?4:3;for(let i=0;i<n;i++){const x=i===0?P.x:clamp(P.x+rand(-7,7),-HALF+1.5,GATE_X-1.5);addWarn(x,1.4,0.9+i*0.15,()=>pillar(e,x));}
      sfx('zap');e.castT=0.3;e.state='rest';e.t=0;e.warn=0;e.rec=1.2/sp;}break;
  case 'rest':e.vx*=0.92;e.vy=(4.8-e.y)*1.5;if(e.t>e.rec){e.state='move';e.t=0;}break;
  }
  e.x+=e.vx*dt;e.y+=e.vy*dt;e.x=clamp(e.x,-HALF+1.5,GATE_X-1.5);e.y=clamp(e.y,1,CEIL-e.h-0.3);
  contact(e,0.4);return true;
}
function pillar(e,x){lightning(x,CEIL,x,0);burst(x,0.3,e.color,16,5,4,0.4);sfx('zap');shake(0.2);if(!P.dead&&Math.abs(P.x-x)<0.7+P.w/2)hurtPlayer(e.dmg*1.1,x,e.eff);}
function bBat(e,dt,dir,dist,rage,sp){
  switch(e.state){
  case 'move':{const tx=P.x+Math.sin(e.t*0.8+e.seed)*6,ty=P.y+5.5+Math.sin(e.t*2)*0.6;e.vx=approach(e.vx,(tx-e.x)*1.4,12*dt);e.vy=approach(e.vy,(ty-e.y)*1.6,12*dt);e.face=dir;
    if(e.t>(rage?0.8:1.3)){const p=pick(['dive','sonic','dive','swarm'].filter(o=>o!==e.last));e.last=p;e.state=p+'Wind';e.t=0;}break;}
  case 'diveWind':e.vx*=0.9;e.vy*=0.9;e.warn=e.t/0.5;if(e.t>0.5/sp){const ax=P.x-e.x,ay=P.y+0.8-e.y,l=Math.hypot(ax,ay)||1,s=17*sp;e.vx=ax/l*s;e.vy=ay/l*s;e.state='dive';e.t=0;e.warn=0;sfx('dash');}break;
  case 'dive':if(e.y<0.6)e.vy=Math.abs(e.vy)*0.3+3;if(e.t>0.8){e.state='rest';e.t=0;e.rec=0.5;}break;
  case 'sonicWind':e.vx*=0.88;e.vy*=0.88;e.face=dir;e.warn=e.t/0.6;
    if(e.t>0.6/sp){const n=rage?3:2;for(let i=0;i<n;i++){const a=Math.atan2(P.y+1-e.y,P.x-e.x)+(i-(n-1)/2)*0.25;eProj(e,{x:e.x,y:e.y+0.6,vx:Math.cos(a)*11,vy:Math.sin(a)*11,w:1,h:1,dmg:e.dmg*0.7,life:2.5,kind:'sonic'});}
      sfx('orb');e.state='rest';e.t=0;e.warn=0;e.rec=0.6/sp;}break;
  case 'swarmWind':e.vx*=0.9;e.vy*=0.9;e.warn=e.t/0.7;if(e.t>0.7){const alive=G.enemies.filter(x=>!x.dead&&x.summon).length;if(alive<4)for(let i=0;i<2;i++)spawnEnemy('bat',{x:clamp(e.x+rand(-2,2),-HALF+2,GATE_X-2),summon:true});sfx('roar');e.state='rest';e.t=0;e.warn=0;e.rec=0.6;}break;
  case 'rest':e.vx*=0.94;e.vy=approach(e.vy,(P.y+5-e.y)*1.5,14*dt);if(e.t>e.rec){e.state='move';e.t=0;}break;
  }
  e.x+=e.vx*dt;e.y+=e.vy*dt;e.x=clamp(e.x,-HALF+1.5,GATE_X-1.5);e.y=clamp(e.y,0.3,CEIL-e.h-0.2);
  contact(e,e.state==='dive'?1:0.5);return true;
}
// Il Drago della Torre: tre fasi (in volo, a terra, furia con pioggia di meteore)
function bDragon(e,dt,dir,dist,rage,sp){
  const k=e.hp/e.maxHp,want=k>0.66?1:k>0.33?2:3;
  if(want!==e.phase&&e.state!=='trans'){e.phase=want;e.state='trans';e.t=0;e.warn=0;e.landed=false;sfx('roar');shake(0.6);
    toast(want===2?'Il drago atterra!':'Il drago riprende il volo, furioso!',want===2?'Attento al soffio di fuoco: scatta per attraversarlo':'Guarda il pavimento: piovono meteore');
    for(const p of G.projs)if(p.owner==='e')p.dead=true;}
  const ground=e.phase===2;
  if(e.state==='trans'){e.vx*=0.9;e.warn=0.5+0.5*Math.sin(e.t*20);
    if(ground){e.y=Math.max(0,e.y-dt*7);if(e.y<=0&&!e.landed){e.landed=true;shake(0.8);sfx('slam');burst(e.x,0.2,0xb9ad98,30,9,3);}}
    else e.y+=(7-e.y)*damp(dt,2);
    e.x=clamp(e.x+e.vx*dt,-HALF+3,GATE_X-3);
    if(e.t>1.4){e.state='move';e.t=0;e.warn=0;}
    return true;}
  if(ground){
    switch(e.state){
    case 'move':e.face=dir;e.vx=approach(e.vx,dist>5?dir*e.speed*0.35:0,12*dt);
      if(e.t>1.0){const behind=(P.x-e.x)*e.face<-1;e.state=(behind?'tail':pick(['breath','breath','stomp','roar']))+'Wind';e.t=0;}break;
    case 'breathWind':e.vx=approach(e.vx,0,20*dt);e.face=dir;e.warn=e.t/0.8;if(e.t>0.8){e.state='breath';e.t=0;e.warn=0;e.fireT=0;sfx('roar');}break;
    case 'breath':e.fireT-=dt;if(e.fireT<=0){e.fireT=0.07;eProj(e,{x:e.x+e.face*2.6,y:e.y+1.7,vx:e.face*rand(11,15),vy:rand(-3.5,0.6),w:0.7,h:0.7,dmg:e.dmg*0.45,life:0.75,kind:'fire',sz:0.75});}
      if(e.t>1.5){e.state='rest';e.t=0;e.rec=0.8;}break;
    case 'stompWind':e.vx=0;e.warn=e.t/0.6;if(e.t>0.6){shake(0.6);sfx('slam');burst(e.x,0.2,0xb9ad98,26,8,2);e.landT=0.25;
        if(Math.abs(P.x-e.x)<3.6&&P.y<2)hurtPlayer(e.dmg,e.x,e.eff);
        for(const s of [-1,1])eProj(e,{x:e.x+s*2,y:0,vx:s*11,vy:0,w:0.6,h:1.1,dmg:e.dmg*0.7,life:1.5,kind:'shock'});e.state='rest';e.t=0;e.warn=0;e.rec=0.8;}break;
    case 'tailWind':e.vx=0;e.warn=e.t/0.45;if(e.t>0.45){const x1=e.face>0?e.x-5:e.x,x2=e.face>0?e.x:e.x+5;if(overlap(x1,x2,0,2.6,P))hurtPlayer(e.dmg,e.x,e.eff);
        burst(e.x-e.face*3.5,0.6,0xb9ad98,14,6,2);sfx('heavy');e.tailT=0.35;e.state='rest';e.t=0;e.warn=0;e.rec=0.6;}break;
    case 'roarWind':e.vx=0;e.warn=e.t;if(e.t>1.0){sfx('roar');shake(0.5);const alive=G.enemies.filter(x=>!x.dead&&x.summon).length;
        if(alive<3)for(const s of [-1,1])spawnEnemy(e.def.adds||'imp',{x:clamp(e.x+s*4,-HALF+2,GATE_X-2),summon:true});e.state='rest';e.t=0;e.warn=0;e.rec=0.6;}break;
    case 'rest':e.vx=approach(e.vx,0,14*dt);if(e.t>e.rec){e.state='move';e.t=0;}break;
    }
    contact(e,0.6);return false;
  }
  const fast=e.phase===3?1.35:1;
  switch(e.state){
  case 'move':e.side=e.side||1;{const tx=clamp(P.x+e.side*6,-HALF+3,GATE_X-3);e.vx=approach(e.vx,(tx-e.x)*1.2,10*dt);e.vy=(7+Math.sin(e.t*2)*0.6-e.y)*2;e.face=dir;}
    if(e.t>1.2/fast){e.side=-e.side;const o=e.phase===3?['fire','meteor','swoop','meteor']:['fire','fire','swoop'];const p=pick(o.filter(x=>x!==e.last));e.last=p;e.state=p+'Wind';e.t=0;}break;
  case 'fireWind':e.vx*=0.9;e.vy*=0.9;e.face=dir;e.warn=e.t/0.6;
    if(e.t>0.6/fast){const n=e.phase===3?5:3,ox=e.x+e.face*2.4,oy=e.y+2;for(let i=0;i<n;i++){const a=Math.atan2(P.y+1-oy,P.x-ox)+(i-(n-1)/2)*0.2;eProj(e,{x:ox,y:oy,vx:Math.cos(a)*10,vy:Math.sin(a)*10,w:0.7,h:0.7,dmg:e.dmg*0.7,life:3,kind:'fire'});}
      sfx('roar');e.state='rest';e.t=0;e.warn=0;e.rec=0.7/fast;}break;
  case 'swoopWind':e.vx*=0.9;e.vy=(8.5-e.y)*2;e.warn=e.t/0.8;if(e.t>0.8){e.state='swoop';e.t=0;e.warn=0;e.face=e.x<P.x?1:-1;e.vx=e.face*19*fast;sfx('roar');}break;
  case 'swoop':e.vy=((e.t<0.9?0.6:0.6+(e.t-0.9)*12)-e.y)*4;if(Math.random()<0.5)burst(e.x,e.y+1,0xff7a2e,1,2,1,0);
    if((e.face>0&&e.x>=GATE_X-3.1)||(e.face<0&&e.x<=-HALF+3.1)||e.t>2){e.state='rest';e.t=0;e.rec=0.6;}break;
  case 'meteorWind':e.vx*=0.9;e.vy=(7.5-e.y)*2;e.warn=e.t/0.8;
    if(e.t>0.8){for(let i=0;i<6;i++){const x=i===0?P.x:rand(-HALF+2,GATE_X-2);addWarn(x,2.2,0.8+i*0.22,()=>eProj(e,{x,y:CEIL,vx:0,vy:-30,w:1.2,h:1.2,dmg:e.dmg*1.1,life:2,kind:'meteor'}));}
      sfx('roar');e.state='rest';e.t=0;e.warn=0;e.rec=1.2;}break;
  case 'rest':e.vx*=0.94;e.vy=(7-e.y)*1.5;if(e.t>e.rec){e.state='move';e.t=0;}break;
  }
  e.x+=e.vx*dt;e.y+=e.vy*dt;e.x=clamp(e.x,-HALF+3,GATE_X-3);e.y=clamp(e.y,0.3,CEIL-e.h-0.2);
  contact(e,e.state==='swoop'?1.2:0.5);return true;
}

/* ---------- Avvisi a terra (colonne di fulmini, meteore) ---------- */
const warnGeo=new THREE.PlaneGeometry(1,1);warnGeo.rotateX(-Math.PI/2);
function addWarn(x,w,dur,cb){const m=new THREE.Mesh(warnGeo,new THREE.MeshBasicMaterial({color:0xff3b1f,transparent:true,opacity:0.3,depthWrite:false}));
  m.scale.set(w,1,2.4);m.position.set(x,0.04,0);scene.add(m);G.warns.push({x,w,t:0,max:dur,cb,m});}
function updWarns(dt){
  for(const w of G.warns){w.t+=dt;w.m.material.opacity=0.2+0.45*Math.abs(Math.sin(w.t*12))*Math.min(1,w.t/w.max);if(w.t>=w.max&&!w.done){w.done=true;if(!w.cancel)w.cb();}if(w.cancel)w.done=true;}
  for(let i=G.warns.length-1;i>=0;i--)if(G.warns[i].done){scene.remove(G.warns[i].m);G.warns[i].m.material.dispose();G.warns.splice(i,1);}
}

/* ---------- Pose e animazioni dei nemici ---------- */
function syncRig(e,p,dt,t,fl,k,w,st){
  const R=p.rig;R.model.rotation.y=e.face*Math.PI/2;R.model.scale.x=e.face;
  const tg=tgBase(),sp=Math.abs(e.vx),wind=st==='wind'||st.endsWith('Wind');e.walk+=dt*sp*1.5/(p.rigScale||1);
  if(e.fly){tg.hF=-0.3;tg.kF=0.5;tg.hB=0.1;tg.kB=0.4;}
  else if(e.onGround&&sp>0.3){if(window.__ANIMV!==1)enemyWalk(tg,e,sp,dt);else walkTg(tg,e.walk,Math.min(1,sp/4));}else if(!e.onGround){tg.hF=-0.7;tg.kF=1.2;tg.hB=0.3;tg.kB=0.6;}
  else tg.crouch=0.02+Math.sin(t*2)*0.01;
  let kk=damp(dt,14),ka=damp(dt,14);
  if(e.stunT>0){tg.head=0.45;tg.shF=-0.1;tg.elF=-0.2;tg.shB=-0.1;tg.elB=-0.2;tg.crouch=0.08;}
  switch(k){
  case 'guard':{
    tg.shB=-0.55;tg.elB=-1.35;tg.shF=-0.2;tg.elF=-0.95;
    if(st==='wind'){tg.shF=lerp(-0.2,0.65,w);tg.elF=lerp(-0.95,-1.8,w);tg.lean=-0.25*w;tg.hF=-0.4*w;tg.kF=0.3*w;tg.hB=0.45*w;tg.kB=0.45*w;tg.crouch=0.1*w;tg.shB=-0.9;}
    else if(st==='strike'){tg.shF=-1.42;tg.elF=-0.06;tg.lean=0.4;tg.hF=-0.7;tg.kF=0.5;tg.hB=0.65;tg.kB=0.25;tg.crouch=0.12;kk=damp(dt,30);ka=damp(dt,45);}
    tg.lean-=0.45*fl;applyPose(R,tg,kk,ka);
    R.arms[0].wr.rotation.x=-Math.PI/2-R.arms[0].sh.rotation.x-R.arms[0].el.rotation.x;   // lancia sempre orizzontale
    R.head.rotation.x=st==='wind'?-0.15:0;break;}
  case 'mage':case 'shaman':case 'archmage':{
    let sh=-0.15,el=-0.45,tot=0;tg.shB=-0.1;tg.elB=-0.4;
    if(wind){sh=lerp(-0.15,-2.3,w);el=lerp(-0.45,-0.15,w);tg.shB=lerp(-0.1,-1.5,w);tg.elB=lerp(-0.4,-1.0,w);tg.lean=-0.12*w;}
    if(e.castT>0){sh=-1.25;el=0;tot=-0.7;tg.shB=-1.2;tg.elB=0;tg.lean=-0.25*(e.castT/0.3);ka=damp(dt,30);}
    tg.shF=sh;tg.elF=el;tg.wrF=0;tg.lean-=0.4*fl;applyPose(R,tg,kk,ka);
    R.arms[0].wr.rotation.x=tot-R.arms[0].sh.rotation.x-R.arms[0].el.rotation.x;
    if(p.robe)p.robe.rotation.z=Math.sin(t*2.4)*0.04+e.vx*0.01;
    if(p.orb){p.orb.scale.setScalar(wind?1+w*1.3:1+Math.sin(t*4)*0.1);p.orbM.emissiveIntensity=wind?2.5:1;}
    if(p.circle){p.runeM.opacity+=((wind?0.85:0)-p.runeM.opacity)*damp(dt,10);p.circle.rotation.y+=dt*(wind?4:1);p.circle.scale.setScalar(0.6+0.5*w);
      if(p.orbRing){p.orbRing.rotation.x+=dt*5;p.orbRing.rotation.y+=dt*3;p.orbRing.scale.setScalar(1+w*0.8);}}
    if(p.orbit){p.orbit.rotation.y+=dt*(wind?6:2);p.orbit.position.y=1.7+Math.sin(t*2)*0.1;}
    break;}
  case 'archer':{
    tg.shF=-0.3;tg.elF=-0.5;tg.shB=-0.2;tg.elB=-0.5;
    if(st==='wind'){tg.shF=-1.57;tg.elF=0;tg.shB=lerp(-0.6,-1.45,w);tg.elB=lerp(-0.8,-2.0,w);tg.lean=-0.06;tg.hF=-0.3;tg.kF=0.3;tg.hB=0.35;tg.kB=0.3;}
    else if(e.castT>0){tg.shF=-1.57;tg.elF=0;tg.shB=-1.1;tg.elB=-0.2;ka=damp(dt,30);}
    tg.lean-=0.4*fl;applyPose(R,tg,kk,ka);R.arms[0].wr.rotation.x=-R.arms[0].sh.rotation.x-R.arms[0].el.rotation.x;   // arco sempre dritto
    break;}
  case 'knight':{
    tg.shF=-0.35;tg.elF=-0.55;tg.wrF=-1.3;tg.shB=-1.25;tg.elB=-0.85;
    if(st==='wind'){tg.shF=lerp(-0.35,-2.7,w);tg.elF=lerp(-0.55,-0.1,w);tg.wrF=lerp(-1.3,0,w);tg.lean=-0.15*w;tg.shB=-0.9;}
    else if(st==='strike'){tg.shF=-0.6;tg.elF=0;tg.wrF=-0.2;tg.lean=0.35;tg.hF=-0.7;tg.kF=0.5;tg.hB=0.6;tg.kB=0.3;tg.shB=-0.6;tg.elB=-0.6;kk=damp(dt,30);ka=damp(dt,40);}
    else if(st==='rest'||e.stunT>0){tg.shB=-0.2;tg.elB=-0.4;tg.shF=-0.2;tg.elF=-0.3;tg.wrF=-0.8;}
    tg.lean-=0.4*fl;applyPose(R,tg,kk,ka);break;}
  case 'brute':{
    tg.shF=-0.35;tg.elF=-0.4;tg.wrF=-0.9;tg.shB=-0.3;tg.elB=-0.5;tg.lean+=0.12;
    if(st==='wind'){tg.shF=lerp(-0.35,-3.0,w);tg.wrF=lerp(-0.9,0,w);tg.shB=lerp(-0.3,-2.8,w);tg.lean=-0.25*w;tg.crouch=0.08*w;}
    else if(st==='slam'&&e.t<0.5){tg.shF=-0.9;tg.elF=0;tg.wrF=-0.6;tg.shB=-0.9;tg.elB=0;tg.lean=0.5;tg.crouch=0.18;tg.hF=-0.8;tg.kF=0.9;tg.hB=0.6;tg.kB=0.5;kk=damp(dt,30);ka=damp(dt,40);}
    tg.lean-=0.25*fl;applyPose(R,tg,kk,ka);break;}
  case 'skelKing':{
    tg.shF=-0.3;tg.elF=-0.5;tg.wrF=-1.3;tg.shB=-0.2;tg.elB=-0.4;
    if(st==='swipeWind'){tg.shF=lerp(-0.3,-2.8,w);tg.elF=0;tg.wrF=0;tg.lean=-0.2*w;}
    else if(st==='swipe'){tg.shF=-0.4;tg.elF=0;tg.wrF=-0.2;tg.lean=0.4;tg.hF=-0.7;tg.kF=0.5;tg.hB=0.6;tg.kB=0.3;kk=damp(dt,30);ka=damp(dt,40);}
    else if(st==='bonesWind'){tg.shB=lerp(-0.2,-2.9,w);tg.elB=-0.6*w;tg.lean=-0.15*w;}
    else if(st==='chargeWind'||st==='charge'){tg.lean=0.45;tg.shF=-1.57;tg.elF=0;tg.wrF=0;}
    else if(st==='raiseWind'){tg.shF=-2.9;tg.shB=-2.9;tg.elF=tg.elB=-0.2;tg.head=-0.4;}
    tg.lean-=0.3*fl;applyPose(R,tg,kk,ka);if(p.cape)p.cape.rotation.x=0.15+Math.min(0.8,sp*0.08);break;}
  case 'bknight':{
    tg.shF=-0.5;tg.elF=-0.6;tg.wrF=-1.0;tg.shB=-0.6;tg.elB=-0.7;
    if(st==='comboWind'||st==='leapWind'){tg.shF=lerp(-0.5,-2.8,w);tg.elF=0;tg.wrF=0;tg.lean=-0.2*w;tg.shB=tg.shF+0.2;tg.elB=-0.3;}
    else if(st==='combo'){const up=e.n%2===1;tg.shF=up?-2.6:-0.4;tg.elF=0;tg.wrF=up?0:-0.2;tg.lean=up?-0.1:0.4;tg.hF=-0.6;tg.kF=0.4;tg.hB=0.5;tg.kB=0.3;tg.shB=tg.shF+0.2;kk=damp(dt,30);ka=damp(dt,36);}
    else if(st==='dashWind'||st==='dash'){tg.shF=-1.57;tg.elF=0;tg.wrF=0;tg.lean=0.5;tg.shB=-1.4;tg.elB=-0.2;tg.hF=-0.9;tg.kF=0.8;tg.hB=0.7;tg.kB=0.4;tg.crouch=0.12;}
    else if(st==='leap'){tg.shF=-0.6;tg.elF=0;tg.wrF=-0.2;tg.hF=-1;tg.kF=1.5;tg.hB=-0.4;tg.kB=1.2;}
    tg.lean-=0.3*fl;applyPose(R,tg,kk,ka);if(p.cape)p.cape.rotation.x=0.15+Math.min(0.9,sp*0.06);break;}
  case 'shade':{
    tg.shF=-0.55;tg.elF=-0.9;tg.wrF=-1.1;tg.shB=-0.45;tg.elB=-1.0;
    if(st==='wind'){tg.shF=lerp(-0.55,-2.6,w);tg.elF=lerp(-0.9,-0.2,w);tg.wrF=lerp(-1.1,0,w);tg.lean=-0.15*w;tg.crouch=0.08*w;}
    else if(st==='strike'){tg.shF=-0.7;tg.elF=0;tg.wrF=-0.3;tg.lean=0.4;tg.hF=-0.7;tg.kF=0.5;tg.hB=0.6;tg.kB=0.3;kk=damp(dt,30);ka=damp(dt,42);}
    tg.lean-=0.4*fl;applyPose(R,tg,kk,ka);if(st==='fade')p.root.scale.setScalar(Math.max(0.04,e.sc*(1-Math.min(1,(e.t||0)/0.45))));break;}
  case 'minotaur':{
    tg.shF=-0.35;tg.elF=-0.4;tg.wrF=-0.9;tg.shB=-0.3;tg.elB=-0.5;tg.lean+=0.12;
    if(st==='wind'&&e.mode==='charge'){tg.lean=0.5*w;tg.crouch=0.12*w;tg.head=0.35*w;tg.hF=-0.5*w;tg.kF=0.7*w;tg.hB=0.4*w;tg.kB=0.3*w;}
    else if(st==='wind'){tg.shF=lerp(-0.35,-3.0,w);tg.wrF=lerp(-0.9,0,w);tg.shB=lerp(-0.3,-2.6,w);tg.lean=-0.25*w;tg.crouch=0.08*w;}
    else if(st==='charge'){tg.lean=0.6;tg.head=0.35;tg.shF=-0.2;tg.elF=-1.0;tg.shB=-0.2;tg.elB=-1.0;}
    else if(st==='strike'){tg.shF=-0.9;tg.elF=0;tg.wrF=-0.6;tg.shB=-0.9;tg.elB=0;tg.lean=0.5;tg.crouch=0.18;tg.hF=-0.8;tg.kF=0.9;tg.hB=0.6;tg.kB=0.5;kk=damp(dt,30);ka=damp(dt,40);}
    tg.lean-=0.25*fl;applyPose(R,tg,kk,ka);break;}
  default:applyPose(R,tg,kk,ka);
  }
}
function syncEnemy(e,dt){
  const p=e.parts,r=p.root;r.position.set(e.x,e.y,0);
  r.scale.setScalar(e.sc*(e.spawnT>0?Math.max(0.01,easeOutBack(1-e.spawnT/e.spawnMax)):1));
  if(e.flinch>0){const q=e.flinch/0.2;r.scale.x*=1+0.2*q;r.scale.y*=1-0.15*q;}
  if(e.type!=='boss'&&!e.fly){const tilt=e.hitstun>0&&!e.onGround?-e.lastDir*0.22:0;r.rotation.z+=(tilt-r.rotation.z)*damp(dt,10);}
  for(const m of p.mats){if(e.flash>0){m.emissive.setHex(0xffffff);m.emissiveIntensity=0.85;}
    else if(e.warn>0){m.emissive.setHex(0xff3b1f);m.emissiveIntensity=Math.min(1,e.warn)*0.8*(0.6+0.4*Math.sin(G.time*40));}
    else if(e.slowT>0){m.emissive.setHex(0x3a8ccf);m.emissiveIntensity=0.5;}
    else if(e.stunT>0){m.emissive.setHex(0xffe27a);m.emissiveIntensity=0.25+0.15*Math.sin(G.time*12);}
    else{m.emissive.copy(m.userData.baseE);m.emissiveIntensity=m.userData.baseI;}}
  if(p.ghostMats)for(const m of p.ghostMats)m.opacity=lerp(m.opacity,e.phased?0.12:m.userData.op,damp(dt,10));
  if(!p.noBar){p.bar.visible=e.hp<e.maxHp;const k=Math.max(0,e.hp/e.maxHp);p.fill.scale.x=Math.max(0.001,k);p.fill.position.x=-(1-k)*0.53;}
  const t=G.time+e.seed,fl=Math.max(0,e.flinch)/0.2,k=e.type==='boss'?(BOSS_ANIM[e.arch]||e.arch):e.type,w=Math.min(1,e.warn||0),st=e.state||'',wind=st==='wind'||st.endsWith('Wind');
  if(p.rig){syncRig(e,p,dt,t,fl,k,w,st);return;}
  switch(k){
  case 'slime':case 'slimeKing':{
    let sx=1,sy=1;
    if(k==='slime'&&e.onGround&&e.hopT<0.18){const q=1-e.hopT/0.18;sx=1+0.25*q;sy=1-0.32*q;}
    else if(st==='hopWind'){sx=1+0.3*w;sy=1-0.35*w;}
    else if(st==='spitWind'){sx=1-0.08*w;sy=1+0.15*w;}
    else if(!e.onGround){const s=clamp(e.vy*0.025,-0.15,0.25);sy=1+s;sx=1-s*0.6;}
    if(e.landT>0){const q=Math.min(1,e.landT/0.18);sx=1+0.35*q;sy=1-0.4*q;}
    sy*=1+Math.sin(t*6)*0.03;sx-=fl*0.1;
    p.blobG.scale.set(sx,sy,sx);p.body.rotation.y+=(e.face*0.6-p.body.rotation.y)*damp(dt,10);p.body.rotation.z=-e.vx*0.02;break;}
  case 'bat':case 'batQueen':{
    const f=st==='dive'?1.15:Math.sin(t*(wind?30:16))*0.7;p.wings[0].rotation.z=-f;p.wings[1].rotation.z=f;
    p.body.position.y=Math.sin(t*3)*0.1;p.body.rotation.y+=(clamp(e.vx*0.04,-0.4,0.4)-p.body.rotation.y)*damp(dt,10);
    p.body.rotation.x=st==='dive'?0.6:wind?-0.3+Math.sin(t*50)*0.05:0;break;}
  case 'imp':{
    p.body.rotation.y+=(e.face*0.6-p.body.rotation.y)*damp(dt,10);const fu=st==='fuse',s=fu?1+e.t*0.4+Math.sin(G.time*40)*0.05:1;
    p.g.scale.set(s,s,s);p.belly.emissiveIntensity=fu?2.2+Math.sin(G.time*40):0.6;
    const f=Math.sin(t*22)*0.6;p.wings[0].rotation.z=-f;p.wings[1].rotation.z=f;p.g.rotation.z=-e.vx*0.03;break;}
  case 'wraith':{
    p.body.rotation.y+=(e.face*0.5-p.body.rotation.y)*damp(dt,8);p.g.position.y=Math.sin(t*2)*0.12;p.cloak.rotation.z=Math.sin(t*1.6)*0.05-e.vx*0.02;
    const reach=st==='wind'?-1.4*w:st==='dash'?-1.6:-0.3+Math.sin(t*2)*0.1;for(const a of p.arms)a.rotation.x+=(reach-a.rotation.x)*damp(dt,10);break;}
  case 'spider':case 'scorpion':case 'salamander':{
    p.body.rotation.y+=(e.face*1.05-p.body.rotation.y)*damp(dt,12);const mv=Math.abs(e.vx)>0.4,air=!e.onGround;
    p.legs.forEach((l,i)=>{const s=i%2?1:-1;l.rotation.x=mv&&!air?Math.sin(t*(k==='salamander'?11:18)+i*1.7)*0.34:0;l.rotation.z+=((air?s*0.35:wind?-s*0.12*w:0)-l.rotation.z)*damp(dt,14);});
    p.g.position.y=wind?-0.08*w:0;p.g.rotation.x=air?clamp(-e.vy*0.03,-0.4,0.4):wind?-0.12*w:0;
    const sq=e.landT>0?Math.min(1,e.landT/0.18):0;p.g.scale.set(1+sq*0.12,1-sq*0.16,1+sq*0.12);
    if(k==='scorpion'){const up=st==='wind'&&e.mode==='sting'?-0.55*w:e.castT>0?0.9:Math.sin(t*2.6)*0.06;p.tail.rotation.x+=(up-p.tail.rotation.x)*damp(dt,e.castT>0?30:12);
      const op=st==='wind'&&e.mode==='claw'?0.55*w:st==='strike'?-0.3:Math.sin(t*3)*0.05;p.claws.forEach((c,i)=>{c.rotation.y+=((i?1:-1)*-op-c.rotation.y)*damp(dt,20);});}
    if(k==='salamander'){const br=st==='breath';p.jaw.rotation.x+=((br?0.7:wind?0.35*w:0.05)-p.jaw.rotation.x)*damp(dt,16);p.head.rotation.x+=((wind?-0.45*w:br?0.05:0)-p.head.rotation.x)*damp(dt,10);p.tail.rotation.y=Math.sin(t*(mv?9:3))*0.28;}
    break;}
  case 'fungus':{
    p.body.rotation.y+=(e.face*0.5-p.body.rotation.y)*damp(dt,8);const q=wind?w:0,cs=1+q*0.32+Math.sin(t*3)*0.02,kick=e.castT>0?e.castT/0.35:0;
    p.cap.scale.set(cs-kick*0.25,1-q*0.2+kick*0.3,cs-kick*0.25);p.g.scale.y=1-q*0.12+kick*0.08;p.g.rotation.z=-e.vx*0.05+Math.sin(t*2)*0.02;break;}
  case 'gargoyle':{
    const perch=st==='perch',f=perch?0.95:st==='dive'?1.2:Math.sin(t*(wind?26:11))*0.6;p.wings[0].rotation.z=-f;p.wings[1].rotation.z=f;
    p.body.rotation.y+=(e.face*0.7-p.body.rotation.y)*damp(dt,10);p.g.position.y=perch?0:Math.sin(t*3)*0.08;p.body.rotation.x=st==='dive'?0.5:wind?-0.25*w:0;
    const sq=e.landT>0?e.landT/0.25:0;p.g.scale.set(1+sq*0.15,1-sq*0.2,1+sq*0.15);break;}
  case 'eye':{
    p.body.rotation.y+=(e.face*1.0-p.body.rotation.y)*damp(dt,10);p.g.position.y=(p.gy==null?0.65:p.gy)+Math.sin(t*2)*0.1;p.g.rotation.x=st==='fire'?-0.12:0;
    p.iris.scale.setScalar(wind?1+0.45*w:st==='fire'?1.3:1);(p.tent||[]).forEach((g,i)=>{g.rotation.z=Math.sin(t*3+i)*0.22;g.rotation.x=Math.cos(t*2.4+i)*0.15;});break;}
  case 'golem':{
    p.body.rotation.y=e.face*Math.PI/2;
    const mv=Math.abs(e.vx)>0.3&&e.onGround;p.legs[0].rotation.x=mv?Math.sin(t*(st==='charge'?16:6))*0.5:0;p.legs[1].rotation.x=-p.legs[0].rotation.x;
    const up=st==='slamWind'?-2.6*w:st==='slamAir'?-2.8:st==='volleyWind'?-1.3:st==='charge'?0.6:0;for(const a of p.arms)a.rotation.x+=(up-a.rotation.x)*damp(dt,10);
    const lean=st==='charge'?0.35:st==='chargeWind'?-0.2*w:st==='slamWind'?-0.15:0;p.torso.rotation.x+=(lean-p.torso.rotation.x)*damp(dt,8);
    const sq=e.landT>0?e.landT/0.25:0;p.body.scale.set(1+sq*0.15,1-sq*0.18,1+sq*0.15);
    p.head.rotation.x=-fl*0.3;p.core.emissiveIntensity=(e.hp<e.maxHp*0.5?2.2:1.4)+Math.sin(t*6)*0.3;break;}
  case 'dragon':{
    p.body.rotation.y=e.face*Math.PI/2;
    const air=e.phase!==2||(st==='trans'&&e.y>0.2),fs=air?(st==='swoop'?3:7):1.5,amp=air?0.7:0.12;
    for(const wg of p.wings)wg.rotation.x=(air?0.95:0.35)+Math.sin(t*fs)*amp;
    p.g.rotation.x+=((air?(st==='swoop'?0.25:-0.05):0)-p.g.rotation.x)*damp(dt,6);
    const mv=!air&&Math.abs(e.vx)>0.3;p.legs.forEach((l,i)=>{l.rotation.x=air?0.7:mv?Math.sin(t*5+i*Math.PI)*0.4:0;});
    const breath=st==='breath'||(st==='breathWind'&&w>0.6),head=st==='breathWind'?-0.5*w:breath?0.25:st==='roarWind'?-0.6:st==='fireWind'?-0.3*w:Math.sin(t*1.5)*0.06;
    p.neck.rotation.x+=(head-p.neck.rotation.x)*damp(dt,8);
    p.jaw.rotation.x+=((breath||st==='roarWind'||(st==='fireWind'&&w>0.5)||st==='trans'?0.6:0.05)-p.jaw.rotation.x)*damp(dt,14);
    p.tail.forEach((s,i)=>{s.rotation.x=Math.sin(t*2+i*0.8)*0.15+(e.tailT>0?0.5:0);});e.tailT=(e.tailT||0)-dt;
    p.fire.emissiveIntensity=breath?3.5:1.2+Math.sin(t*4)*0.3;
    const sq=e.landT>0?e.landT/0.25:0;p.g.scale.set(1+sq*0.1,1-sq*0.12,1+sq*0.1);break;}
  }
}

/* ---------- Proiettili ---------- */
const arrowGeo=cap3(0.035,0.6,6);arrowGeo.rotateZ(Math.PI/2);const arrowMat=new THREE.MeshBasicMaterial({color:0xd9d2c0});
const globGeo=sph(0.28,16,12),globMat=new THREE.MeshBasicMaterial({color:0x9ae06a});
const boneGeo=cap3(0.06,0.42,8),boneMat=new THREE.MeshBasicMaterial({color:0xefe7d4});
const fireGeo=sph(0.3,16,12),fireMat=new THREE.MeshBasicMaterial({color:0xffc36b}),fireHalo=new THREE.MeshBasicMaterial({color:0xff5a1a,transparent:true,opacity:0.45,depthWrite:false,blending:THREE.AdditiveBlending});
const sonicGeo=new THREE.RingGeometry(0.35,0.6,20,1,-1.1,2.2),sonicMat=new THREE.MeshBasicMaterial({color:0xd7a8ff,transparent:true,opacity:0.8,side:THREE.DoubleSide,depthWrite:false});
const spearGeo=cap3(0.07,1.8,8);spearGeo.rotateZ(Math.PI/2);const spearMat=new THREE.MeshBasicMaterial({color:0x9ff5ec});
const knifeGeo=new THREE.ConeGeometry(0.07,0.5,8);knifeGeo.rotateZ(-Math.PI/2);const knifeMat=new THREE.MeshBasicMaterial({color:0xd7b8ff});
const meteorGeo=sph(0.7,20,14),meteorMat=new THREE.MeshBasicMaterial({color:0xff7a2e});
const GROUNDED={orb:1,glob:1,bone:1,fire:1,arrow:1,knife:1,bolt:1,spear:1},PARRY={orb:1,arrow:1,bone:1,glob:1,fire:1,bolt:1};
// colpo magico: nucleo bianco, alone colorato, coda luminosa orientata sulla direzione, scintille dietro
const boltGeo=sph(0.17,14,10),boltTailGeo=(()=>{const g=new THREE.ConeGeometry(0.2,1.4,12,1,true);g.rotateZ(Math.PI/2);g.translate(-0.62,0,0);return g;})();
const BOLTM={};const boltMats=c=>BOLTM[c]||(BOLTM[c]={core:new THREE.MeshBasicMaterial({color:0xffffff}),
  halo:new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending}),
  tail:new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0.45,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})});
function spawnProj(o){
  if(G.scene!=='tower')return;
  o.dead=false;o.hit=new Set();o.g=o.g||0;
  const pm=o.owner==='p';let m;
  switch(o.kind){
  case 'orb':m=new THREE.Mesh(orbGeo,pm?orbMatP:orbMatE);o.halo=new THREE.Mesh(haloGeo,pm?haloMatP:haloMatE);m.add(o.halo);break;
  case 'wave':m=new THREE.Mesh(waveGeo,waveMat);m.scale.set((o.vx>0?1:-1)*(o.sz||1),o.sz||1,1);break;
  case 'arrow':m=new THREE.Mesh(arrowGeo,arrowMat);break;
  case 'glob':m=new THREE.Mesh(globGeo,globMat);break;
  case 'bone':m=new THREE.Mesh(boneGeo,boneMat);break;
  case 'fire':m=new THREE.Mesh(fireGeo,fireMat);m.add(new THREE.Mesh(haloGeo,fireHalo));m.scale.setScalar(o.sz||1);break;
  case 'sonic':m=new THREE.Mesh(sonicGeo,sonicMat);m.scale.setScalar(1.6);break;
  case 'spear':m=new THREE.Mesh(spearGeo,spearMat);break;
  case 'knife':m=new THREE.Mesh(knifeGeo,knifeMat);break;
  case 'bolt':{const M=boltMats(o.col||0xb48cff);m=new THREE.Mesh(boltGeo,M.core);const h=new THREE.Mesh(haloGeo,M.halo);h.scale.setScalar(1.25);m.add(h);m.userData.halo=h;m.add(new THREE.Mesh(boltTailGeo,M.tail));m.scale.setScalar(o.sz||1);break;}
  case 'meteor':m=new THREE.Mesh(meteorGeo,meteorMat);{const h=new THREE.Mesh(haloGeo,fireHalo);h.scale.setScalar(2.2);m.add(h);}break;
  default:m=new THREE.Mesh(shockGeo,pm?shockMatP:shockMatE);if(o.scl)m.scale.setScalar(o.scl);if(o.tint!=null&&!pm){const T=spawnProj.tints||(spawnProj.tints={});m.material=T[o.tint]||(T[o.tint]=shockMatE.clone());m.material.color.setHex(o.tint);}
  }
  o.mesh=m;m.position.set(o.x,o.y,0);scene.add(m);G.projs.push(o);
}
function meteorBoom(p){spray(p.x,0.6,0xff7a2e,12,8,4);burst(p.x,0.4,0xff7a2e,26,8,4);burst(p.x,0.3,0xb9ad98,14,6,2);shake(0.45);sfx('boom');
  if(!P.dead&&Math.abs(P.x-p.x)<1.7+P.w/2&&P.y<2.2)hurtPlayer(p.dmg,p.x,p.eff);}
function updProjs(dt){
  for(const p of G.projs){if(p.dead)continue;
    if(p.ghost&&G.pvp&&p.foe&&!P.dead&&overlap(p.x-p.w/2,p.x+p.w/2,p.y-p.h/2,p.y+p.h/2,P)){p.dead=true;burst(p.x,p.y,p.col||0xff7a2e,10,4,1);continue;}
    if(p.homing&&p.owner==='p'&&!(p.ghost&&G.pvp)){let b=null,bd=12;for(const e of foes()){const d=Math.hypot(e.x-p.x,e.y+e.h/2-p.y);if(d<bd){bd=d;b=e;}}
      if(b){const a=Math.atan2(b.y+b.h/2-p.y,b.x-p.x),cur=Math.atan2(p.vy,p.vx),s=Math.hypot(p.vx,p.vy),na=cur+clamp(wrapA(a-cur),-p.homing*dt,p.homing*dt);p.vx=Math.cos(na)*s;p.vy=Math.sin(na)*s;}}
    else if(p.homing&&!P.dead){const a=Math.atan2(P.y+1-p.y,P.x-p.x),cur=Math.atan2(p.vy,p.vx),s=Math.hypot(p.vx,p.vy),na=cur+clamp(wrapA(a-cur),-p.homing*dt,p.homing*dt);p.vx=Math.cos(na)*s;p.vy=Math.sin(na)*s;}
    p.vy-=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
    if(p.kind==='meteor'&&p.y<=0.4){p.dead=true;if(p.owner==='p')boomAt(p.x,0.5,p.boom||2.2,p.dmg,p.effect,0xff7a2e);else meteorBoom(p);continue;}
    if(p.kind==='spear'&&p.vy<-5&&p.y<0.2){p.dead=true;burst(p.x,0.2,0x7ff0e4,10,4,2);continue;}
    if(p.life<=0||p.x<-HALF+0.4||p.x>GATE_X||(GROUNDED[p.kind]&&p.y<0.1)){p.dead=true;
      if(p.boom&&p.owner==='p')boomAt(p.x,Math.max(0.4,p.y),p.boom,p.dmg,p.effect,p.col||0xff7a2e);
      if(p.kind==='bolt')burst(p.x,Math.max(0.2,p.y),p.col||0xb48cff,10,4,1);
      if(p.kind==='orb')burst(p.x,Math.max(0.2,p.y),0xd7a8ff,6,3,1);else if(p.kind==='glob'||p.kind==='fire')burst(p.x,Math.max(0.2,p.y),p.kind==='glob'?0x9ae06a:0xff7a2e,6,3,1);continue;}
    const y1=p.kind==='shock'?p.y:p.y-p.h/2;
    if(p.owner==='e'){
      if(!P.dead&&overlap(p.x-p.w/2,p.x+p.w/2,y1,y1+p.h,P)){
        if(P.shieldT>0&&(p.kind==='orb'||p.kind==='fire'||p.kind==='bolt')){p.owner='p';p.vx=-p.vx*1.4;p.vy=-p.vy*0.3;p.g=0;p.homing=0;p.dmg*=2;p.life=2;p.hit=new Set();if(p.kind==='orb'){p.mesh.material=orbMatP;p.halo.material=haloMatP;}sfx('block');burst(p.x,p.y,0x7fc8ff,8,4,1);continue;}
        hurtPlayer(p.dmg,p.x-p.vx,p.eff);if(p.kind!=='shock'){p.dead=true;burst(p.x,p.y,p.kind==='fire'?0xff7a2e:p.col||0xd7a8ff,10,4,1);}}
      if(p.kind==='shock'&&Math.random()<0.6)burst(p.x,0.2,p.tint!=null?p.tint:0xffa64a,1,2,2);
    }else{
      for(const e of G.enemies){if(e.dead||e.spawnT>0||p.hit.has(e)||(p.ghost&&e.pvp!=null))continue;
        if(overlap(p.x-p.w/2,p.x+p.w/2,y1,y1+p.h,e)){p.hit.add(e);hitEnemy(e,p.dmg,p.vx>0?1:-1,{kb:p.kb||4,effect:p.effect,upx:p.upx});
          if(!p.pierce&&(p.kind==='orb'||p.kind==='knife'||p.kind==='fire'||p.kind==='bolt'||p.kind==='arrow'||p.kind==='bone')){p.dead=true;if(p.boom)boomAt(p.x,p.y,p.boom,p.dmg,p.effect,p.col||0xff7a2e);else if(p.kind==='bolt')burst(p.x,p.y,p.col,12,5,1);break;}}}
      if(p.kind==='shock'&&Math.random()<0.6)burst(p.x,0.2,0x7ff0e4,1,2,2);
      if(p.kind==='spear'&&Math.random()<0.7)burst(p.x-Math.sign(p.vx)*0.8,p.y,0x7ff0e4,1,1,0,0);
    }
    p.mesh.position.set(p.x,p.kind==='shock'?p.y+0.5:p.y,0);
    if(p.kind==='wave')p.mesh.material.opacity=Math.min(0.85,p.life*3);
    else if(p.kind==='arrow'||p.kind==='spear'||p.kind==='knife'||p.kind==='sonic')p.mesh.rotation.z=Math.atan2(p.vy,p.vx);
    else if(p.kind==='bolt'){p.mesh.rotation.z=Math.atan2(p.vy,p.vx);if(p.mesh.userData.halo)p.mesh.userData.halo.scale.setScalar(1.15+Math.sin(G.time*30+p.x)*0.15);
      burst(p.x,p.y,p.col||0xb48cff,1,0.4,0,0);if(Math.random()<0.35)burst(p.x,p.y,0xffffff,1,1.2,0,0);}
    else if(p.kind==='bone')p.mesh.rotation.z+=dt*14;
    else if((p.kind==='fire'||p.kind==='meteor')&&Math.random()<0.5)burst(p.x,p.y,0xff7a2e,1,1,1,-0.3);
  }
  for(let i=G.projs.length-1;i>=0;i--){if(G.projs[i].dead){scene.remove(G.projs[i].mesh);G.projs.splice(i,1);}}
}

