/* =========================================================
   PIANI DELLA TORRE
   ========================================================= */
// peso di ogni nemico nel mazzo del piano: i vecchi restano, i nuovi si aggiungono
const TW={slime:3,guard:2.2,mage:2,bat:2,archer:2,knight:1.6,imp:1.6,wraith:1.5,brute:1.1,shaman:0.9,spider:2,fungus:1.4,gargoyle:1.3,shade:1.2,scorpion:1.2,salamander:1.1,eye:1,minotaur:0.7};
function newTypeAt(f){for(const k in TYPES)if(TYPES[k].from===f)return k;return null;}
function buildQueue(f){
  if(isBossFloor(f))return ['boss'];if(isSafeFloor(f))return [];
  const n=Math.min(8+(f-1),64),pool=[];   // più si sale, più nemici
  for(const k in TYPES){const T=TYPES[k];if(T.from>f)continue;pool.push([k,TW[k]*(f-T.from>30?0.5:1)]);}
  const tot=pool.reduce((s,p)=>s+p[1],0),q=[],nt=newTypeAt(f);if(nt){q.push(nt);if(n>4)q.push(nt);}
  while(q.length<n){let r=Math.random()*tot;for(const [t,w] of pool){if((r-=w)<0){q.push(t);break;}}}
  return q;
}
function clearActors(){if(G.killcam)G.killcam=null;G.camFocus=null;G.camFocusPending=false;G.cage=null;for(const d of G.drops)scene.remove(d.m);G.drops=[];
  for(const e of G.enemies){if(!e.dead){scene.remove(e.parts.root);disposeObj(e.parts.root);}}
  for(const c of G.corpses){scene.remove(c.e.parts.root);disposeObj(c.e.parts.root);}
  for(const p of G.projs)scene.remove(p.mesh);
  for(const o of G.orbs){if(!P.dead&&G.scene==='tower')gainXP(o.v);scene.remove(o.m);}
  for(const p of G.pickups)scene.remove(p.m);
  for(const it of G.items||[]){scene.remove(it.g);disposeObj(it.g);}G.items=[];
  for(const w of G.warns){scene.remove(w.m);w.m.material.dispose();}
  for(const c of G.chunks)scene.remove(c.m);G.chunks=[];G.bossChestT=0;
  for(const z of G.zones){scene.remove(z.m);z.m.material.dispose();}G.zones=[];G.timers=[];
  G.enemies=[];G.corpses=[];G.projs=[];G.orbs=[];G.pickups=[];G.warns=[];G.chests=[];G.boss=null;$('bossBar').hidden=true;
}
const aliveCount=()=>G.enemies.filter(e=>!e.dead).length;

/* ---------- Forzieri: si aprono solo a piano libero ---------- */
const CH_WOOD=toon(0x7a5434),CH_DARK=toon(0x4a3220),CH_IRON=toon(0x3a3d45),CH_GOLD=toon(0xd9b45a);[CH_WOOD,CH_DARK,CH_IRON,CH_GOLD].forEach(m=>m.userData.keep=true);
function spawnChest(x,y,boss){if(G.hordeNext)return;
  const g=new THREE.Group();g.position.set(x,y,-0.5);levelGroup.add(g);
  const sc=boss?1.25:1;g.scale.setScalar(sc);
  boxO(1.1,0.55,0.7,0.1,boss?CH_DARK:CH_WOOD,0,0.28,0,g);
  for(const sx of [-0.4,0.4])mesh(rbox(0.1,0.58,0.74,0.03),boss?CH_GOLD:CH_IRON,sx,0.29,0,g);
  const lid=new THREE.Group();lid.position.set(0,0.55,-0.35);g.add(lid);
  boxO(1.14,0.26,0.74,0.12,boss?CH_DARK:CH_WOOD,0,0.13,0.35,lid);for(const sx of [-0.4,0.4])mesh(rbox(0.1,0.28,0.78,0.03),boss?CH_GOLD:CH_IRON,sx,0.13,0.35,lid);
  const lm=toon(0x8a6a2a,{emissive:0xff3b1f,emissiveIntensity:0.8});const lk=mesh(rbox(0.2,0.24,0.08,0.04),lm,0,0.5,0.38,g);
  const glow=mesh(sph(0.5,16,12),new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}),0,0.7,0.1,g,true);glow.scale.set(1.6,0.8,1);
  let beam=null;if(boss){beam=mesh(new THREE.CylinderGeometry(0.7,0.9,9,24,1,true),new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}),0,4.5,0,g,true);}
  G.chests.push({x,y,g,lid,lm,lk,glow,beam,open:false,boss,t:0,dy:0,dvy:0});
}
function placeChest(boss){
  let x,y=0;
  if(boss)x=-HALF+1.4;
  else if(G.solids.length&&Math.random()<0.5){const s=pick(G.solids);x=rand(s.x1+0.8,s.x2-0.8);y=s.y2;}
  else x=rand(-HALF+5,GATE_X-3);
  spawnChest(x,y,boss);
}
let nearChest=null;
// indica il forziere chiuso più vicino quando il piano è libero; se è fuori schermo la freccia resta sul bordo e punta verso di lui
function chestArrowTick(){const el=$('chestArrow');if(!el)return;let c=null,bd=1e9;
  if(G.state==='play'&&G.scene==='tower'&&G.cleared&&!P.dead)for(const k of G.chests){if(k.open||k.fx||k.dy>0||k.dvy)continue;const d=Math.abs(k.x-P.x);if(d<bd){bd=d;c=k;}}
  if(!c||c===nearChest){if(!el.hidden)el.hidden=true;return;}
  const [sx,sy]=toScreen(c.x,c.y+(c.boss?2.5:2),-0.5),m=46,W=innerWidth,H=innerHeight,off=sx<m||sx>W-m,cls=off?(sx<m?'l':'r'):'';
  if(el.hidden)el.hidden=false;if(el.className!==cls)el.className=cls;
  el.style.transform=`translate(${clamp(sx,m,W-m)}px,${off?clamp(sy,H*0.25,H*0.72):clamp(sy,70,H-30)}px) translate(-50%,-100%)`;}
function updChests(dt){
  nearChest=null;
  if(G.bossChestT>0){G.bossChestT-=dt;if(G.bossChestT<=0){spawnChest(G.bossChestX,0,true);const c=G.chests[G.chests.length-1];c.dy=11;c.dvy=0;sfx('gate');}}
  for(const c of G.chests){c.t+=dt;
    if(c.dy>0||c.dvy){c.dvy-=34*dt;c.dy+=c.dvy*dt;if(c.dy<=0){c.dy=0;if(c.dvy<-5){c.dvy=-c.dvy*0.3;shake(0.35);sfx('slam');burst(c.x,0.1,0xb9ad98,16,6,1.5);}else c.dvy=0;}c.g.position.y=c.y+c.dy;
      if(c.beam)c.beam.material.opacity=0.25;if(c.dy>0)continue;}
    if(!c.fx)c.lid.rotation.x+=((c.open?-1.9:0)-c.lid.rotation.x)*damp(dt,7);
    if(G.cleared&&!c.open){c.lm.emissive.setHex(0x7fe08a);c.glow.material.opacity=0.12+Math.sin(c.t*4)*0.06;if(Math.random()<0.1)burst(c.x+rand(-0.4,0.4),c.y+0.8,0xffd27a,1,1,1.5,-0.2,-0.5);}
    else c.glow.material.opacity=Math.max(0,c.glow.material.opacity-dt);
    if(c.open)c.lk.visible=false;
    if(c.beam){c.beam.material.opacity=c.open?Math.max(0,c.beam.material.opacity-dt):0.16+Math.sin(c.t*3)*0.06;c.beam.rotation.y+=dt;}
    if(G.state==='play'&&!c.open&&!c.fx&&!P.dead&&Math.abs(P.x-c.x)<1.3&&Math.abs(P.y-c.y)<1.3)nearChest=c;
  }
  const pr=$('prompt');
  if(nearChest&&G.state==='play'){const c=nearChest;pr.hidden=false;
    $('promptName').textContent=c.boss?'Forziere del guardiano':'Forziere';$('promptSub').textContent=G.cleared?'Aprilo':'Chiuso: sconfiggi tutti i nemici';
    $('promptKey').textContent=inputLabel('use');$('promptKey').hidden=touchUI()||!G.cleared;
    const [sx,sy]=toScreen(c.x,c.y+1.5,-0.5);pr.style.transform=`translate(${sx}px,${sy}px) translate(-50%,-100%)`;
    if(isTouch){$('bUse').hidden=!G.cleared;$('bUse').textContent='Apri il forziere';}
    if(input.usePressed&&G.cleared)openChest(c);
  }else if(G.scene==='tower'&&!G.safe){pr.hidden=true;$('bUse').hidden=true;}
}
function openChest(c){
  if(c.open)return;c.open=true;STATS.chests++;sfx('chest');burst(c.x,c.y+0.8,0xffd27a,24,5,4,0.4);$('prompt').hidden=true;$('bUse').hidden=true;
  const f=G.floor,r=c.bonus?rand(0.56,1):Math.random(),minR=c.boss?2:c.bonus?1:0,loot=[];if(Math.random()<(c.boss?0.3:0.06))addFragment(f);
  if(c.boss){if(G.cage&&!G.cage.broken)G.camFocusPending=true;const nv=novice(),n=1+Math.floor(f/50)+(nv?1:0),mR=Math.min(lootMaxR(f),1+Math.floor(f/30));
    dropXP(c.x,c.y+1.2,40+f*6);
    for(let i=0;i<n;i++){const rr=rollRarity(f,mR+(i===0?1:0)),wp=nv&&n>1?i===0:Math.random()<0.5;loot.push(wp?makeWeapon(G.cls.weapon,rr,f):makeGear(pick(Object.keys(GEAR)),rr,f));}
    burst(c.x,c.y+1,0xffd27a,40,8,6,0.4);shake(0.3);if(f>=TOP_FLOOR)winGame();}
  else if(r<(novice()?0.25:0.55)){dropXP(c.x,c.y+1,12+f*3);popNum(c.x,c.y+1.8,'Esperienza!','xp');return;}
  else if(r<0.75)loot.push(makeGear(pick(Object.keys(GEAR)),rollRarity(f,novice()?1:minR),f));
  else loot.push(makeWeapon(G.cls.weapon,rollRarity(f,novice()?1:minR),f));
  loot.forEach((o,i)=>dropItem(o,c.x,c.y+0.9,i,loot.length));
}
/* ---------- Oggetti a terra: escono dal forziere, cadono e si raccolgono passandoci sopra (finiscono nell'armadio) ---------- */
function dropItem(o,x,y,i,n){const R=RARITY[o.rarity],g=new THREE.Group(),spin=new THREE.Group();g.add(spin);scene.add(g);
  let mdl;try{mdl=o.slot?gearModel(o):applyVariant(buildWeaponMesh(o.type,o.rarity,o.effect),o).g;}catch(e){mdl=new THREE.Mesh(sph(0.3,12,10),toon(R.hex));}
  const piv=new THREE.Group();piv.add(mdl);if(!o.slot)piv.rotation.z=0.75;spin.add(piv);
  piv.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(piv),sz=box.getSize(new THREE.Vector3()),ct=box.getCenter(new THREE.Vector3()),k=1.05/Math.max(0.01,sz.x,sz.y,sz.z);
  piv.scale.setScalar(k);piv.position.copy(ct).multiplyScalar(-k);
  const add=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0.25,depthWrite:false,blending:THREE.AdditiveBlending});
  const glow=new THREE.Mesh(sph(0.55,14,10),add(R.hex));g.add(glow);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.26,4,12,1,true),add(R.hex));beam.material.opacity=o.rarity>=2?0.3:0.16;beam.position.y=1.6;g.add(beam);
  const vx=((i-(n-1)/2)*2.4+rand(-0.8,0.8))||rand(-1.6,1.6);
  G.items.push({o,g,spin,glow,beam,x,y,vx,vy:rand(9,11),landed:false,t:0,R});
  burst(x,y,R.hex,12,4,2,0.3);}
function collectItem(it,quiet){if(it.done)return;it.done=true;const o=it.o;invAdd(o);if(!o.slot)STATS.weapons++;
  if(o.rarity>=4){STATS.legend++;if(!quiet)sfx('legend');}else if(!quiet)sfx('pick');
  if(!quiet){burst(it.x,it.y+0.6,it.R.hex,22,5,3,0.3);showPick(o);}
  scene.remove(it.g);disposeObj(it.g);}
function collectAllItems(){const n=G.items.filter(i=>!i.done).length;for(const it of G.items)collectItem(it,true);G.items=[];if(n)toast(n>1?`Raccolti ${n} oggetti`:'Oggetto raccolto','Li trovi nell\'armadio del seminterrato');}
function showPick(o){const R=RARITY[o.rarity],el=$('pickMsg');el.style.setProperty('--rc',R.css);$('pickPic').style.setProperty('--rc',R.css);$('pickPic').style.setProperty('--rcg',R.glow);
  $('pickPic').innerHTML=itemPic(o,o.slot?GEAR[o.slot].icon:WTYPES[o.type].icon);$('pickName').textContent=o.name;$('pickSub').textContent=`${R.name} · nell'armadio: indossalo dal seminterrato`;
  el.classList.add('show');clearTimeout(showPick.tm);showPick.tm=setTimeout(()=>el.classList.remove('show'),2600);}
function updItems(dt){
  for(const it of G.items){if(it.done)continue;it.t+=dt;
    if(!it.landed){const py=it.y;it.vy-=30*dt;it.x=clamp(it.x+it.vx*dt,-HALF+1.5,GATE_X-1.2);it.y+=it.vy*dt;
      if(it.vy<0){const gy=groundAt(it.x,py);if(it.y<=gy){it.y=gy;if(it.vy<-6){it.vy=-it.vy*0.32;it.vx*=0.5;burst(it.x,gy+0.05,0xb9ad98,6,2,0.6);sfx('land');}else{it.landed=true;it.vx=0;}}}}
    const bob=it.landed?0.55+Math.sin(it.t*3)*0.1:0.5;it.g.position.set(it.x,it.y+bob,0.25);it.spin.rotation.y+=dt*(it.landed?1.8:7);
    it.glow.material.opacity=0.18+Math.sin(it.t*4)*0.07;it.beam.visible=it.landed;
    if(it.landed&&Math.random()<0.06)burst(it.x+rand(-0.3,0.3),it.y+0.3,it.R.hex,1,1,1.2,-0.2,-0.4);
    if(it.landed&&it.t>0.35&&!P.dead&&Math.abs(P.x-it.x)<1.0&&P.y<it.y+1.6&&P.y+P.h>it.y-0.2)collectItem(it);}
  if(G.items.some(i=>i.done))G.items=G.items.filter(i=>!i.done);}
function wCard(w,label,cmp){const R=RARITY[w.rarity],T=WTYPES[w.type];
  const d=cmp?`<b class="${w.dmg>=cmp.dmg?'up':'down'}">${w.dmg}</b>`:`<b>${w.dmg}</b>`;
  return `<div class="card wpn" style="--rc:${R.css};--rcg:${R.glow}"><span class="rar">${R.name}</span><span class="card-icon thumb" style="margin:0 auto">${itemPic(w,T.icon)}</span><span class="card-name">${w.name}</span><span class="card-desc">Danno ${d}${w.effect?'<br>'+cap(EFFECTS[w.effect].desc):''}${w.bonusReach?'<br>Portata +15%':''}${w.perk?'<br><b style="color:var(--teal)">'+PERKS[w.perk].name+'</b>: '+PERKS[w.perk].desc:''}</span><span class="card-lv">${label}</span></div>`;}
function gCard(g,label){const R=RARITY[g.rarity];
  return `<div class="card wpn" style="--rc:${R.css};--rcg:${R.glow}"><span class="rar">${R.name}</span><span class="card-icon thumb" style="margin:0 auto">${itemPic(g,GEAR[g.slot].icon)}</span><span class="card-name">${g.name}</span><span class="card-desc">${gearDesc(g)}</span><span class="card-lv">${label}</span></div>`;}
function openLoot(item){
  G.loot=item;G.state='loot';clearInput();$('touch').hidden=true;showMeds(false);
  let html;
  if(item.weapon)html=wCard(G.weapon,'Equipaggiata')+wCard(item.weapon,'Nuova',G.weapon);
  else{const g=item.gear,cg=G.gear[g.slot];html=(cg?gCard(cg,'Indossato'):`<div class="card"><span class="card-icon">${svg(GEAR[g.slot].icon)}</span><span class="card-name">${GEAR[g.slot].label}</span><span class="card-desc">Nessuno</span><span class="card-lv">Indossato</span></div>`)+gCard(g,'Nuovo');}
  $('lootEye').textContent=G.lootQueue&&G.lootTotal>1&&(G.lootQueue.length||G.lootTotal)?`Forziere del guardiano · ${G.lootTotal-G.lootQueue.length} di ${G.lootTotal}`:(G.lootTotal?'Forziere del guardiano':'Forziere aperto');
  $('lootCards').innerHTML=html;$('loot').hidden=false;setTimeout(()=>$('lootTake').focus(),60);
}
function closeLoot(take){
  if(G.state!=='loot')return;const it=G.loot;
  if(it){const stored=invAdd(it.weapon||it.gear);if(it.weapon)STATS.weapons++;
    if(take){eqOf(G.cls.id)[it.weapon?'weapon':it.gear.slot]=stored.id;saveInv();
      if(it.weapon){G.weapon=it.weapon;attachWeapon();if(it.weapon.rarity>=4){STATS.legend++;sfx('legend');}else sfx('equip');}else equipGear(it.gear);}
    else{sfx('pick');popNum(P.x,P.y+2.4,'Nell\'armadio','info');}}
  G.loot=null;
  if(G.lootQueue&&G.lootQueue.length){G.state='play';openLoot(G.lootQueue.shift());return;}
  $('loot').hidden=true;G.state='play';showMeds(true);if(isTouch)$('touch').hidden=false;canvas.focus();
  if(G.finalChest){G.finalChest=false;winGame();}
}
$('lootTake').onclick=()=>closeLoot(true);
$('lootLeave').onclick=()=>closeLoot(false);
/* ---------- Inventario: quello che trovi resta tuo, lo indossi dall'armadio ---------- */
const INV=Object.assign({items:[],eq:{}},store.get('inv',{}));
const saveInv=()=>store.set('inv',INV);
const itemById=id=>INV.items.find(i=>i.id===id);
const eqOf=cid=>INV.eq[cid]||(INV.eq[cid]={});
// un oggetto sta addosso a una sola classe alla volta
const eqOwner=(id,skip)=>{for(const k in INV.eq){if(k===skip)continue;if(Object.values(INV.eq[k]).includes(id))return k;}return null;};
const eqClsName=cid=>(CLASSES.find(c=>c.id===cid)||{name:cid}).name;
// vecchi salvataggi: se un oggetto era su più classi resta su quella in uso (o sulla prima che lo aveva)
(function(){const seen=new Set();let ch=false;for(const k of [G.cls.id,...Object.keys(INV.eq).filter(x=>x!==G.cls.id)]){const e=INV.eq[k];if(!e)continue;for(const q in e){if(seen.has(e[q])){delete e[q];ch=true;}else seen.add(e[q]);}}if(ch)store.set('inv',INV);})();
function invAdd(o){const it={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6)};if(o.slot)it.g=o;else it.w=o;INV.items.push(it);
  if(INV.items.length>80){const used=new Set(Object.values(INV.eq).flatMap(e=>Object.values(e)));const i=INV.items.findIndex(x=>!used.has(x.id)&&(x.w||x.g).rarity===0);if(i>=0)INV.items.splice(i,1);}
  saveInv();return it;}
function loadoutWeapon(c){const it=itemById(eqOf(c.id).weapon);return it&&it.w&&it.w.type===c.weapon?it.w:makeWeapon(c.weapon,0,1);}
function loadoutGear(c){const e=eqOf(c.id),g={elmo:null,guanti:null,corazza:null};for(const k in g){const it=itemById(e[k]);if(it&&it.g)g[k]=it.g;}return g;}
function applyLoadout(){G.weapon=loadoutWeapon(G.cls);G.gear=loadoutGear(G.cls);resetStats();if(hero){attachWeapon();refreshGearVisual();}P.hp=S.maxHp;P.stam=S.stamMax;}
let wrSlot='weapon',wrSel=null;
// miniature degli oggetti: piccoli modelli 3D disegnati a 40×40 pixel e ingranditi (pixel art)
const TH={r:null,cache:{}};
function gearModel(g){const col=RARITY[g.rarity].hex,m=toon(col,{emissive:col,emissiveIntensity:0.18}),steel=toon(0xa4aab4),dark=toon(0x22252c),grp=new THREE.Group();
  if(g.slot==='elmo'){mesh(new THREE.SphereGeometry(0.5,20,14,0,TAU,0,Math.PI*0.56),steel,0,0,0,grp);const b=mesh(new THREE.TorusGeometry(0.5,0.08,8,28),m,0,0.02,0,grp);b.rotation.x=Math.PI/2;
    mesh(rbox(0.66,0.1,0.14,0.04),dark,0,-0.02,0.44,grp);if(g.rarity>=2)for(const s of [-1,1]){const w=mesh(new THREE.ConeGeometry(0.09,0.4,10),m,s*0.5,0.28,0,grp);w.rotation.z=-s*0.5;}
    if(g.rarity>=3){const pl=mesh(cap3(0.08,0.42,8),m,0,0.62,-0.12,grp);pl.rotation.x=-0.7;}grp.rotation.set(0.25,-0.55,0);}
  else if(g.slot==='guanti'){const p=mesh(sph(0.36,16,12),m,0,0,0,grp);p.scale.set(1,1.1,0.7);for(let i=0;i<4;i++)mesh(cap3(0.075,0.26,8),m,-0.21+i*0.14,0.42,0,grp);
    const th=mesh(cap3(0.075,0.22,8),m,0.36,0.04,0,grp);th.rotation.z=-0.9;mesh(new THREE.CylinderGeometry(0.31,0.35,0.32,16),steel,0,-0.44,0,grp);grp.rotation.set(0.2,0.4,0.15);}
  else{mesh(rbox(0.9,0.86,0.5,0.16),m,0,0,0,grp);for(const s of [-1,1])mesh(sph(0.27,14,10),steel,s*0.5,0.32,0,grp);mesh(rbox(0.12,0.62,0.06,0.03),toon(0xd9b45a),0,0,0.27,grp);grp.rotation.set(0.15,-0.4,0);}
  return grp;}
function thumb(o){
  const w=!o.slot,key=w?`w${o.type}${o.rarity}${o.effect||''}${o.v||0}`:`g${o.slot}${o.rarity}`;if(TH.cache[key]!=null)return TH.cache[key];
  try{if(!TH.r){TH.r=new THREE.WebGLRenderer({canvas:document.createElement('canvas'),alpha:true,antialias:false,preserveDrawingBuffer:true});TH.r.setSize(64,64,false);TH.r.setClearColor(0,0);
      TH.scene=new THREE.Scene();TH.scene.add(new THREE.HemisphereLight(0xffffff,0x554466,1.0));const dl=new THREE.DirectionalLight(0xffffff,0.9);dl.position.set(2,3,4);TH.scene.add(dl);
      TH.cam=new THREE.OrthographicCamera(-1,1,1,-1,0.1,50);TH.cam.position.set(0,0,10);}
    const piv=new THREE.Group(),g=w?applyVariant(buildWeaponMesh(o.type,o.rarity,o.effect),o).g:gearModel(o);piv.add(g);if(w){g.rotation.y=Math.PI/2;piv.rotation.z=2.36;}piv.traverse(c=>{if(c.isPoints)c.visible=false;});TH.scene.add(piv);
    piv.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(piv),c=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3()),h=Math.max(sz.x,sz.y)*0.56;
    piv.position.sub(c);Object.assign(TH.cam,{left:-h,right:h,top:h,bottom:-h});TH.cam.updateProjectionMatrix();
    TH.r.render(TH.scene,TH.cam);const url=TH.r.domElement.toDataURL();TH.scene.remove(piv);
    return TH.cache[key]=(typeof url==='string'&&url.startsWith('data:'))?url:'';}catch(e){return TH.cache[key]='';}}
const itemPic=(o,ic)=>{const s=thumb(o);return s?`<img src="${s}" alt="">`:svg(ic);};
const SLOT_ICON=k=>k==='weapon'?WTYPES[G.cls.weapon].icon:GEAR[k].icon;
function openWardrobe(){G.state='wardrobe';clearInput();['cellarHud','touch','prompt','bUse'].forEach(id=>$(id).hidden=true);
  Object.assign(P,{x:WD_X,z:-0.95,vx:0,face:1,atk:null});wrSel=null;renderWardrobe();$('wardrobe').hidden=false;setTimeout(()=>$('wrClose').focus(),60);}
function closeWardrobe(){$('wardrobe').hidden=true;P.z=0;P.x=WD_X-1.2;
  if(G.scene==='tower'){G.state='play';safeApplyLoadout();$('touch').hidden=!isTouch;canvas.focus();return;}
  G.state='cellar';$('cellarHud').hidden=false;$('touch').hidden=!isTouch;renderClassChip();canvas.focus();}
function slotHTML(k,l){const it=itemById(eqOf(G.cls.id)[k]),o=it?(it.w||it.g):(k==='weapon'?G.weapon:null),R=o?RARITY[o.rarity]:null;
  return `<button class="wslot" data-slot="${k}" aria-pressed="${k===wrSlot}" style="${R?`--rc:${R.css};--rcg:${R.glow}`:''}"><span class="thumb">${o?itemPic(o,SLOT_ICON(k)):svg(SLOT_ICON(k))}</span><span><small>${l}</small><b>${o?o.name:'Vuoto'}</b></span></button>`;}
function fuseGroup(sel){const o=sel.w||sel.g;return INV.items.filter(it=>{const x=it.w||it.g;return x.name===o.name&&x.rarity===o.rarity&&(sel.w?(it.w&&it.w.type===o.type):(it.g&&it.g.slot===o.slot));});}
function fuseItems(selId){const sel=itemById(selId);if(!sel)return;const o=sel.w||sel.g;if(o.rarity>=MAX_R)return;const grp=fuseGroup(sel);if(grp.length<5)return;
  const eqIds=new Set(Object.values(INV.eq).flatMap(e=>Object.values(e)));const pickN=[sel,...grp.filter(i=>i!==sel&&!eqIds.has(i.id)),...grp.filter(i=>i!==sel&&eqIds.has(i.id))].slice(0,5);
  const ids=new Set(pickN.map(i=>i.id)),f=Math.max(1,UNL.best||1),nw=sel.w?makeWeapon(o.type,o.rarity+1,f,o.v):makeGear(o.slot,o.rarity+1,f);
  INV.items=INV.items.filter(i=>!ids.has(i.id));const it=invAdd(nw);
  {let done=false;for(const k of [G.cls.id,...Object.keys(INV.eq).filter(x=>x!==G.cls.id)]){const e=INV.eq[k];if(!e)continue;for(const q in e)if(ids.has(e[q])){if(done)delete e[q];else{e[q]=it.id;done=true;}}}}   // l'oggetto fuso va su una classe sola
  wrSel=it.id;saveInv();sfx('legend');burst(P.x,1.4,RARITY[nw.rarity].hex,40,6,3,0.3);toast('Fusione riuscita!',`${nw.name} · ${RARITY[nw.rarity].name}`);}
function renderWardrobe(){
  const c=G.cls,eq=eqOf(c.id);
  $('wrL').innerHTML=slotHTML('weapon','Arma')+slotHTML('elmo','Elmo');$('wrR').innerHTML=slotHTML('guanti','Guanti')+slotHTML('corazza','Corazza');
  $('wrL').insertAdjacentHTML('beforeend',skinSlotHTML());if(wrSlot==='skin'){renderWrSkins();return;}
  const list=INV.items.filter(it=>wrSlot==='weapon'?(it.w&&it.w.type===c.weapon):(it.g&&it.g.slot===wrSlot)).sort((a,b)=>(eqOwner(a.id,c.id)?1:0)-(eqOwner(b.id,c.id)?1:0)||(b.w||b.g).rarity-(a.w||a.g).rarity);
  if(!wrSel||!list.some(i=>i.id===wrSel))wrSel=(list.find(i=>i.id===eq[wrSlot])||list[0]||{}).id||null;
  $('wrTitle').textContent={weapon:'Armi · '+WTYPES[c.weapon].label,elmo:'Elmi',guanti:'Guanti',corazza:'Corazze'}[wrSlot]+` (${list.length})`;
  $('wrList').innerHTML=list.map(it=>{const o=it.w||it.g,R=RARITY[o.rarity];const own=eqOwner(it.id,c.id);return `<button class="wtile${eq[wrSlot]===it.id?' on':''}${own?' taken':''}" data-id="${it.id}" aria-pressed="${it.id===wrSel}" title="${o.name}${own?' · in uso su '+eqClsName(own):''}" style="--rc:${R.css};--rcg:${R.glow}">${itemPic(o,SLOT_ICON(wrSlot))}</button>`;}).join('')
    ||`<p class="note">Ancora niente: lo trovi nei forzieri della torre.</p>`;
  const sel=itemById(wrSel);
  if(sel){const o=sel.w||sel.g,R=RARITY[o.rarity],on=eq[wrSlot]===sel.id,own=eqOwner(sel.id,c.id);
    $('wrDetail').innerHTML=`<b class="n" style="--rc:${R.css}">${o.name}</b><span>${R.name}</span>
      <span>${sel.w?`Danno <b>${o.dmg}</b>${o.effect?'<br>'+cap(EFFECTS[o.effect].desc):''}${o.perk?'<br><b style="color:var(--teal)">'+PERKS[o.perk].name+'</b>: '+PERKS[o.perk].desc:''}`:gearDesc(o)}</span>
      <div class="row">${on?'<button class="mini" data-un="1">Togli</button>':own?`<button class="mini" disabled>In uso</button>`:`<button class="mini" data-eq="${sel.id}">Indossa</button>`}<button class="mini del" data-del="${sel.id}">Scarta</button></div>${own?`<span class="wr-own">Lo indossa ${esc(eqClsName(own))}: toglilo da quella classe per usarlo qui.</span>`:''}
      ${(()=>{const same=fuseGroup(sel);return o.rarity<MAX_R?`<div class="fuse"><span>Fusione: ${Math.min(5,same.length)}/5 «${o.name}» · servono 5 oggetti con lo stesso nome</span>${same.length>=5?`<button class="mini fz" data-fuse="${sel.id}" style="--rc:${RARITY[o.rarity+1].css}">Fondi 5 → ${RARITY[o.rarity+1].name}</button>`:''}</div>`:'';})()}`;}
  else $('wrDetail').innerHTML=`<span>Tocca uno spazio ai lati per vedere gli oggetti di quel tipo.</span>`;
  const other=INV.items.filter(it=>it.w&&it.w.type!==c.weapon).length;
  $('wrNote').textContent=other?`Hai anche ${other} armi per altre classi: cambia classe al piedistallo per usarle.`:'';
}
$('wardrobe').addEventListener('click',e=>{const eq=eqOf(G.cls.id);
  const s=e.target.closest('.wslot');if(s){wrSlot=s.dataset.slot;wrSel=null;sfx('ui');renderWardrobe();return;}
  const tl=e.target.closest('.wtile');if(tl){wrSel=tl.dataset.id;sfx('ui');renderWardrobe();return;}
  const b=e.target.closest('#wrDetail button');if(!b)return;
  if(b.dataset.eq){if(eqOwner(b.dataset.eq,G.cls.id))return;eq[wrSlot]=b.dataset.eq;sfx('equip');burst(P.x,1.2,0xffd27a,16,3,2,0.3);}
  else if(b.dataset.un){delete eq[wrSlot];sfx('ui');}
  else if(b.dataset.fuse){fuseItems(b.dataset.fuse);}
  else if(b.dataset.del){if(!b.dataset.armed){b.dataset.armed=1;b.textContent='Sicuro?';return;}
    const id=b.dataset.del;INV.items=INV.items.filter(i=>i.id!==id);for(const k in INV.eq)for(const q in INV.eq[k])if(INV.eq[k][q]===id)delete INV.eq[k][q];wrSel=null;sfx('ui');}
  saveInv();if(G.scene==='tower')safeApplyLoadout();else applyLoadout();renderWardrobe();});
$('wrClose').onclick=()=>{sfx('ui');closeWardrobe();};
function gearMod(g,s){if(!g)return;S.maxHp+=s*(g.hp||0);S.armor+=s*(g.armor||0);S.atkSpd+=s*(g.atkSpd||0);S.crit+=s*(g.crit||0);}
function equipGear(g){const old=G.gear[g.slot];gearMod(old,-1);G.gear[g.slot]=g;gearMod(g,1);
  P.hp=clamp(P.hp+(g.hp||0)-((old&&old.hp)||0),1,S.maxHp);refreshGearVisual();renderGear();sfx(g.rarity>=4?'legend':'equip');
  burst(P.x,P.y+1.2,RARITY[g.rarity].hex,18,4,3,0.3);}
function renderGear(){if(!$('gearRow'))return;$('gearRow').innerHTML=Object.keys(GEAR).map(k=>{const g=G.gear[k];return `<span class="gslot" title="${g?g.name+' · '+gearDesc(g):GEAR[k].label+': vuoto'}" style="${g?'--rc:'+RARITY[g.rarity].css:''}">${svg(GEAR[k].icon)}</span>`;}).join('');}
// l'equipaggiamento si vede sull'eroe
function refreshGearVisual(){
  if(!hero)return;for(const o of hero.gearObjs||[]){if(o.parent)o.parent.remove(o);disposeObj(o);}hero.gearObjs=[];
  for(const k in G.gear){const g=G.gear[k];if(!g)continue;const col=RARITY[g.rarity].hex,m=toon(col,{emissive:col,emissiveIntensity:0.12+g.rarity*0.06}),add=o=>{hero.gearObjs.push(o);return o;};
    if(k==='elmo'){const grp=add(new THREE.Group());hero.head.add(grp);M(grp,G3.hring(0.24,0.03,1.04),m,[0,0.07,-0.005]);
      if(g.rarity>=2)for(const s of [-1,1])M(grp,G3.tube([[s*0.22,0.08,-0.02],[s*0.3,0.15,-0.05],[s*0.34,0.28,-0.08]],0.035,0.004,16,10),m,null);
      if(g.rarity>=3)M(grp,G3.ell(0.035,0.04,0.025),new THREE.MeshBasicMaterial({color:0xffffff}),[0,0.08,0.255],{ol:0});}
    else if(k==='guanti'){for(const a of hero.arms){add(M(a.el,G3.limb(0.072,0.06,0.17,0),m,[0,-0.19,0]));add(M(a.el,G3.hring(0.07,0.016,1),m,[0,-0.1,0],{ol:0}));}}
    else{add(M(hero.torso,torsoGeo(hero.B||1,0.045,0.2,0.66),m));if(g.rarity>=2)for(const a of hero.arms)add(M(a.sh,G3.dome(0.12,0.5,0.7,1.15),m,[a===hero.arms[0]?-0.012:0.012,0.035,0],{r:[0,0,(a===hero.arms[0]?1:-1)*0.35]}));}
  }
}

/* ---------- Avvio di un piano ---------- */
const SAFE_PED_X=-8;
function buildSafeRoom(){safeG=new THREE.Group();scene.add(safeG);
  const st=toon(0x5a5260),gold=toon(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.3}),rune=new THREE.MeshBasicMaterial({color:0x7ff0e4,transparent:true,opacity:0.8,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  geoO(new THREE.CylinderGeometry(1.1,1.3,0.4,24),st,SAFE_PED_X,0.2,-1.2,safeG,1.3);geoO(new THREE.CylinderGeometry(0.7,0.9,0.5,24),st,SAFE_PED_X,0.6,-1.2,safeG,0.9);
  const r=mesh(new THREE.RingGeometry(0.75,0.95,6),rune,SAFE_PED_X,0.87,-1.2,safeG,true);r.rotation.x=-Math.PI/2;G.props.push({o:r,spin:0.6});
  const cr=mesh(new THREE.OctahedronGeometry(0.28),new THREE.MeshBasicMaterial({color:0x7ff0e4}),SAFE_PED_X,2.1,-1.2,safeG,true);G.props.push({o:cr,spin:1.4});
  const beam=mesh(new THREE.CylinderGeometry(0.7,0.7,6,20,1,true),new THREE.MeshBasicMaterial({color:0x7ff0e4,transparent:true,opacity:0.08,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}),SAFE_PED_X,3.5,-1.2,safeG,true);
  const l=new THREE.PointLight(0x7ff0e4,1.2,9,2);l.position.set(SAFE_PED_X,2.5,0);safeG.add(l);
  if(cellarWD){const w=cellarWD.clone();w.position.set(WD_X,0,-2.3);safeG.add(w);const wl=new THREE.PointLight(0xffc56b,0.9,7,2);wl.position.set(WD_X,2.4,-0.6);safeG.add(wl);}
  G.safeInter=[{x:SAFE_PED_X,y:3.2,name:'Piedistallo del santuario',sub:()=>{const pr=prog(G.cls.id);return pr.pts?`${pr.pts} punti da spendere`:'Nessun punto da spendere';},act:openSafePed},
    {x:WD_X,y:3.3,name:'Armadio',sub:()=>'Cambia equipaggiamento',act:openWardrobe}];}
let nearSafe=null;
function updBarrels(){const A=P.atk;if(!A||A.noHit||!G.barrels||!G.barrels.length)return;const act=A.t>=A.wind&&A.t<=A.wind+A.act+0.05;if(!act)return;
  for(const b of G.barrels){if(b.dead||b.lastA===A)continue;const bx=b.g.position.x,dx=(bx-P.x)*P.face;if(dx<-0.4||dx>2.8||P.y>2.2)continue;
    b.lastA=A;b.hp--;b.g.rotation.z=P.face*-0.15;burst(bx,0.8,0xc9a06a,10,4,1,0.4,b.g.position.z);sfx('hit');
    if(b.hp>0)continue;b.dead=true;levelGroup.remove(b.g);sfx('slam');shake(0.15);burst(bx,0.7,0x8a6a3a,26,7,3,0.6,b.g.position.z);
    for(let i=0;i<7;i++){const m=new THREE.Mesh(chunkGeo,chunkMat(i%3?0x7a5a3a:0x55443a));m.scale.set(0.5,rand(0.6,1.3),0.25);m.position.set(bx+rand(-.3,.3),0.6,b.g.position.z);scene.add(m);
      G.chunks.push({m,vx:rand(-5,5)+P.face*3,vy:rand(4,9),vz:rand(-1.5,2),rx:rand(-10,10),rz:rand(-10,10),t:0});}
    barrelLoot(bx);}}
// cosa c'è dentro un barile: 1,5% oggetto, 15,5% benda, 58% esperienza, 25% niente
function barrelLoot(bx){const r=Math.random(),f=G.floor;
  if(r<0.015){popNum(bx,2.2,'Oggetto!','xp');openLoot(Math.random()<0.5?{weapon:makeWeapon(G.cls.weapon,rollRarity(f,0),f)}:{gear:makeGear(pick(Object.keys(GEAR)),rollRarity(f,0),f)});}
  else if(r<0.17){spawnBandage(bx,0);popNum(bx,1.8,'Una benda!','info');}
  else if(r<0.75)dropXP(bx,1,3+Math.round(f*1.1));else popNum(bx,1.8,'Vuoto','info');}
function updSafe(){nearSafe=null;if(!G.safe||G.state!=='play')return;for(const it of G.safeInter)if(Math.abs(P.x-it.x)<1.8&&P.y<1.6){nearSafe=it;break;}
  const pr=$('prompt');if(nearSafe){pr.hidden=false;$('promptName').textContent=nearSafe.name;$('promptSub').textContent=nearSafe.sub();$('promptKey').textContent=inputLabel('use');$('promptKey').hidden=touchUI();
    const [sx,sy]=toScreen(nearSafe.x,nearSafe.y,-1.2);pr.style.transform=`translate(${sx}px,${sy}px) translate(-50%,-100%)`;if(isTouch){$('bUse').hidden=false;$('bUse').textContent='Usa: '+nearSafe.name;}
    if(input.usePressed){sfx('ui');nearSafe.act();}}
  else{pr.hidden=true;$('bUse').hidden=true;}}
function openSafePed(){G.state='safeped';clearInput();['prompt','bUse','touch'].forEach(id=>$(id).hidden=true);renderSafePed();$('safePed').hidden=false;}
function renderSafePed(){$('safePts').innerHTML=`<div class="pts-box">${ptsHTML(G.cls,false)}</div>`;}
function closeSafePed(){$('safePed').hidden=true;G.state='play';$('touch').hidden=!isTouch;canvas.focus();}
function safeApplyLoadout(){const gr=loadoutGear(G.cls);for(const k of Object.keys(G.gear)){const n=gr[k]||null,o=G.gear[k]||null;if(n!==o){gearMod(o,-1);G.gear[k]=n;gearMod(n,1);}}
  G.weapon=loadoutWeapon(G.cls);attachWeapon();refreshGearVisual();P.hp=Math.min(P.hp,S.maxHp);}
function bossLocked(){if(!isBossFloor(G.floor)||G.tutorial)return false;const c=(G.chests||[]).find(c=>c.boss);if(!c||!c.open)return true;return !!(G.cage&&!G.cage.broken);}
function startFloor(f){if(f>UNL.best){UNL.best=f;saveUnl();checkUnlocks();}
  G.floor=f;clearActors();buildLevel(f);towerMood(f);
  // entri da una porta nel muro di fondo, in un punto diverso a ogni piano (lontano dal guardiano)
  const ex=isBossFloor(f)?rand(-HALF+3,-HALF+11):rand(-HALF+3,GATE_X-9);buildEntryDoor(ex);keepDoorClear();
  Object.assign(P,{x:ex,y:0,z:-3.6,vx:0,vy:0,atk:null,dashT:0,invul:1.6,kbT:0,face:ex<-4?1:(Math.random()<0.5?1:-1),dragon:null,flipT:0,chargeT:0,spinT:0,throwT:0,plunge:false,punchT:0,onGround:true});
  G.gateMsg=false;
  G.queue=buildQueue(f);G.spawnT=0.9;G.cleared=false;G.gateY=0;G.gateOpen=false;G.climbFaded=false;bars.position.y=0;
  lockM.emissive.setHex(0xff3b1f);lockM.emissiveIntensity=0.7;ctrLast=null;drawCounter(G.queue.length);
  if(safeG){scene.remove(safeG);safeG=null;}G.safe=isSafeFloor(f);$('prompt').hidden=true;$('bUse').hidden=true;
  if(G.safe){buildSafeRoom();G.cleared=true;P.hp=S.maxHp;P.stam=S.stamMax;}
  else if(isBossFloor(f)){placeBandage();placeBandage();}else{if(Math.random()<0.24)placeBandage();if(Math.random()<(novice()?0.3:0.08))placeChest(false);}
  const z=ZONES[zoneIndex(f)],boss=isBossFloor(f);$('floorNum').textContent=f;$('zoneName').textContent=z.name;
  const ban=$('banner');ban.classList.remove('show','boss');void ban.offsetWidth;
  if(G.safe){$('b1').textContent='Santuario';$('b2').textContent='Piano sicuro: potenzia la classe e cambia equipaggiamento';MUS.mood='cellar';}
  else if(boss){MUS.mood='bossintro';}
  else{const nt=newTypeAt(f);$('b1').textContent=(f-1)%10===0?'Piano '+f+' · nuova zona':'Piano '+f;$('b2').textContent=(f-1)%10===0?z.name:nt?'Nuovo nemico: '+TYPE_NAMES[nt]:(G.queue.length+' nemici');MUS.mood='tower';}
  if(!boss||G.safe)ban.classList.add('show');
  setHint('',0);
  G.state='enter';G.enterT=0;G.snapCam=true;
}
/* ---------- Porta d'ingresso: sei appena salito dalle scale ---------- */
function buildEntryDoor(x){
  stoneMat.userData.keep=true;
  const g=new THREE.Group();g.position.set(x,0,0);levelGroup.add(g);const Z=-2.98;
  const voidM=new THREE.MeshBasicMaterial({color:0x050308});
  mesh(new THREE.PlaneGeometry(1.8,2.7),voidM,0,1.35,Z-0.05,g,true);
  const top=mesh(new THREE.CircleGeometry(0.9,24,0,Math.PI),voidM,0,2.7,Z-0.05,g,true);
  // un filo di luce dalle scale in fondo
  mesh(new THREE.PlaneGeometry(1.2,0.12),new THREE.MeshBasicMaterial({color:0x6a4a2a,transparent:true,opacity:0.6}),0,0.06,Z-0.04,g,true);
  for(const s of [-1,1]){mesh(rbox(0.36,2.95,0.55,0.1),stoneMat,s*1.06,1.47,Z,g);mesh(rbox(0.5,0.22,0.65,0.06),stoneMat,s*1.06,0.11,Z+0.02,g);}
  const arch=mesh(new THREE.TorusGeometry(1.06,0.19,12,28,Math.PI),stoneMat,0,2.7,Z,g);
  mesh(rbox(0.34,0.42,0.3,0.06),stoneMat,0,3.78,Z+0.06,g);
  // anta di legno che si spalanca verso la stanza
  const hinge=new THREE.Group();hinge.position.set(-0.9,0,Z+0.06);g.add(hinge);const wd=toon(0x5a3a22),ir=toon(0x2a2c32);
  mesh(rbox(1.78,2.66,0.1,0.03),wd,0.89,1.34,0,hinge);for(const y of [0.5,1.4,2.3])mesh(rbox(1.8,0.12,0.12,0.03),ir,0.89,y,0.02,hinge);
  mesh(sph(0.07,8,6),toon(0xd9b45a),1.55,1.3,0.09,hinge);
  // braciere acceso accanto alla porta (niente luci nuove: solo fiamme)
  const fl=new THREE.MeshBasicMaterial({color:0xffb347});
  for(const s of [-1,1]){mesh(new THREE.CylinderGeometry(0.05,0.07,0.5,8),ir,s*1.55,2.2,Z+0.25,g);const f=mesh(sph(0.11,10,8),fl,s*1.55,2.55,Z+0.25,g,true);G.props.push({o:f,flick:1});}
  G.entry={g,hinge,x};}
// i barili da rompere non devono stare davanti alla porta da cui entri: li sposta di lato (o li toglie se non c'è posto)
function keepDoorClear(){const E=G.entry;if(!E||!G.barrels)return;const ex=E.x,R=2.05,lo=-HALF+1.2,hi=GATE_X-1.5;
  const live=()=>G.barrels.filter(b=>!b.dead);
  for(const b of live()){const bx=b.g.position.x;if(Math.abs(bx-ex)>=R)continue;
    const side=bx>=ex?1:-1,cands=[2.3,3.2,4.2,5.2].flatMap(d=>[ex+side*d,ex-side*d]);
    const ok=x=>x>=lo&&x<=hi&&Math.abs(x-ex)>=R&&live().every(o=>o===b||Math.abs(o.g.position.x-x)>0.95);
    const nx=cands.find(ok);
    if(nx!=null)b.g.position.x=nx;else{b.dead=true;b.coinDone=true;if(b.g.parent)b.g.parent.remove(b.g);}}}
function updEnter(dt){G.enterT+=dt;const T=G.enterT,E=G.entry;
  if(E)E.hinge.rotation.y=-1.75*easeOutCubic(clamp(T/0.38,0,1));
  if(T>0.12&&T<0.2&&!G.enterCreak){G.enterCreak=true;sfx('gate');}
  const k=clamp((T-0.3)/0.85,0,1);P.z=lerp(-3.6,0,easeOutCubic(k));P.y=0;P.onGround=true;P.vx=k>0&&k<1?3.2*P.face:0;
  if(T>=1.25){P.z=0;P.vx=0;G.enterCreak=false;
    if(isBossFloor(G.floor)&&!G.safe&&G.queue[0]==='boss')startBossIntro();else G.state='play';}}

/* ---------- Ingresso del guardiano: un piccolo filmato ---------- */
function bossSpawnNow(){const B=G.bi;if(!B||B.e)return;G.queue=[];const e=spawnEnemy('boss');B.e=e;e.spawnT=e.spawnMax=1.1;e.face=-1;B.by=e.y;
  burst(e.x,e.y+e.h*0.5,B.d.color,60,9,4,0.4);burst(e.x,e.y+0.3,0x1a1420,40,6,2,0.2);sfx('boom');}
function startBossIntro(){
  const f=G.floor,d=bossFor(f),[title,line]=bossIntro(f);
  G.state='bossintro';clearInput();['hud','touch','prompt','bUse'].forEach(id=>$(id).hidden=true);showMeds(false);setHint('',0);
  G.bi={t:0,f,d,title,line,bx:GATE_X-5,by:0,e:null,cp:camPos.clone(),cl:camLook.clone(),rl:roomLight.intensity,roared:false,said:false,back:false,col:'#'+d.color.toString(16).padStart(6,'0')};
  clearTimeout(startBossIntro.tm);const ci=$('cine');ci.hidden=false;ci.classList.add('boss');void ci.offsetWidth;ci.classList.add('on');
  $('cineSkip').hidden=false;$('cineChoice').hidden=true;$('cineCard').hidden=true;cineSub('');
  const bc=$('bossCard');bc.hidden=true;bc.classList.remove('on');bc.style.setProperty('--bc',G.bi.col);
  $('bcTag').textContent=f===TOP_FLOOR?'Battaglia finale · piano '+f:'Guardiano · piano '+f;$('bcName').textContent=d.name;$('bcTitle').textContent=G.bi.title;
  MUS.mood='bossintro';roomLight.intensity=0.12;}
function updBossIntro(dt){const B=G.bi;if(!B)return;B.t+=dt;const t=B.t,dist=24*(isTouch?0.66:1);
  if(t>=1.35&&!B.e){bossSpawnNow();const c=$('cineCut');c.classList.remove('on');void c.offsetWidth;c.classList.add('on');G.snapCam=true;}
  const e=B.e;if(e&&e.spawnT>0)e.spawnT=Math.max(0,e.spawnT-dt);
  if(e&&!B.roared&&t>=2.45){B.roared=true;sfx('roar');sfx('boom');setTimeout(()=>sfx('roar'),180);shake(0.9);G.bossFlash=1;G.camPunch=0.6;
    burst(e.x,e.y+e.h*0.6,B.d.color,90,13,5,0.4);burst(e.x,e.y+0.2,0xb9ad98,30,8,1.5);
    const bc=$('bossCard');bc.hidden=false;bc.classList.remove('on');void bc.offsetWidth;bc.classList.add('on');}
  if(e)e.flinch=B.roared&&t<3.5?0.2*Math.abs(Math.sin((t-2.45)*16))*(1-(t-2.45)/1.05):0;
  if(B.roared&&!B.said&&t>=2.95){B.said=true;cineSay('«'+B.line+'»');}
  G.bossFlash=Math.max(0,(G.bossFlash||0)-dt*1.4);
  roomLight.intensity=t<2.45?lerp(roomLight.intensity,0.12,damp(dt,3)):B.rl+G.bossFlash*3;
  // camera: dal giocatore scivola verso il guardiano, stacco sul primo piano dal basso, poi torna all'eroe
  if(t<1.35){const k=easeInOutCubic(clamp(t/1.35,0,1)),x=lerp(P.x,B.bx,k);B.cp.set(x,5.4,dist*0.9);B.cl.set(x,3.2,0);}
  else if(t<5.3){const by=e?e.y:0,h=e?e.h*e.sc:3,push=(t-1.35)*0.35;B.cp.set(B.bx-3.4+push*0.3,by+0.7,Math.max(6.5,9.5-push));B.cl.set(B.bx,by+h*0.62,0);}
  else if(!B.back){B.back=true;$('bossCard').classList.remove('on');$('bossCard').hidden=true;}
  if(t>=5.9)finishBossIntro();}
function finishBossIntro(){const B=G.bi;if(!B)return;if(!B.e)bossSpawnNow();if(B.e){B.e.flinch=0;if(B.e.spawnT>0.3)B.e.spawnT=0.3;}
  G.bi=null;G.bossFlash=0;roomLight.intensity=B.rl;cineSay('');
  const ci=$('cine');ci.classList.remove('on');$('cineSkip').hidden=true;$('bossCard').hidden=true;$('bossCard').classList.remove('on');
  startBossIntro.tm=setTimeout(()=>{if(!G.bi&&!G.cine){ci.hidden=true;ci.classList.remove('boss');}},800);
  $('hud').hidden=false;$('touch').hidden=!isTouch;showMeds(true);clearInput();
  MUS.mood=G.floor===TOP_FLOOR?'final':'boss';
  const fm=$('fightMsg');fm.textContent=G.floor===TOP_FLOOR?'Battaglia finale!':'Combatti!';fm.classList.remove('on');void fm.offsetWidth;fm.classList.add('on');sfx('slam');shake(0.3);
  G.state='play';canvas.focus();}
let hintTimer=0;
function setHint(text,dur){const h=$('hint');if(text){h.textContent=text;h.classList.add('show');hintTimer=dur;}else{h.classList.remove('show');hintTimer=0;}}
function updFloor(dt){
  const alive=aliveCount();
  const maxAlive=Math.round(Math.min(14,3+Math.floor(G.floor/8))*mpCapMul());
  if(G.queue.length){G.spawnT-=dt;if(G.spawnT<=0&&alive<=maxAlive){const k=Math.min(G.queue.length,(alive===0&&G.enemies.length===0?6:5)+Math.floor(G.floor/20));for(let i=0;i<k;i++)spawnEnemy(G.queue.shift());G.spawnT=0.8;}}
  const left=aliveCount()+G.queue.length;drawCounter(left);
  if(!G.cleared&&left===0&&G.enemies.length>0&&!(G.tutorial&&!(G.tut&&G.tut.final))){
    G.cleared=true;STATS.floors++;
    burst(GATE_X,2.5,0xffc56b,30,5,3,0.2);sfx('clear');sfx('gate');lockM.emissive.setHex(0x7fe08a);}
  G.enemies=G.enemies.filter(e=>!e.dead);
  G.bumpT-=dt;if(!G.gateOpen&&P.x>=GATE_X-0.5-P.w/2-0.05&&input.right&&G.bumpT<=0){setHint(left>0?`Mancano ${left} nemici`:bossLocked()?(G.cage&&!G.cage.broken&&(G.chests||[]).some(c=>c.boss&&c.open)?'Libera il prigioniero':'Apri il forziere del guardiano'):'Il cancello si sta aprendo',1.4);G.bumpT=3;}
  if(G.camFocusPending&&G.state==='play'&&G.cage&&!G.cage.broken){G.camFocusPending=false;G.camFocus={x:G.cage.x,t:2.6};popNum(G.cage.x,3.6,'Libera il prigioniero!','xp');sfx('legend');}
  if(G.gateOpen&&P.x>GATE_X+0.35&&!P.dead)startClimb();
  if(G.won){G.winT-=dt;if(G.winT<=0)showWin();}
  if(G.upPending&&G.state==='play'&&!P.dead&&!G.won&&G.cleared&&G.gateY>2.4){G.upDelay-=dt;if(G.upDelay<=0){G.upPending=false;openUpgrade();}}
}
function startClimb(){
  if(!G.cleared||aliveCount()>0||G.queue.length>0||G.floor>=TOP_FLOOR){G.gateOpen=false;return;}   // si sale solo con il piano vuoto
  collectAllItems();G.state='climb';G.climbBack=false;G.climbT=0;P.atk=null;P.dragon=null;P.flipT=0;P.climbTurn=0;P.cvx=clamp(Math.abs(P.vx),2.5,4.2);P.chargeT=P.spinT=0;
  clearInput();setHint('',0);$('prompt').hidden=true;$('bUse').hidden=true;
}
// salita morbida: accelera, segue una rampa continua sui gradini, rallenta e si gira verso la porta
function updClimb(dt){
  G.climbT+=dt;P.onGround=true;
  // tornare indietro sui gradini annulla la salita: vale finché non stai già entrando nella porta
  if(P.climbTurn<0.35&&!G.climbFaded){if(input.left&&!input.right)G.climbBack=true;else if(input.right&&!input.left)G.climbBack=false;}
  if(G.climbBack){P.face=-1;P.climbTurn=approach(P.climbTurn,0,dt*4);P.cvx=approach(P.cvx,4.2,dt*10);P.x-=P.cvx*dt;P.vx=-P.cvx;
    const ramp=clamp(((P.x-STAIR_X0)/STAIR_W+0.5)*STAIR_RISE,0,STAIR_TOP);P.y+=(ramp-P.y)*damp(dt,12);
    if(P.x<=GATE_X+0.2){G.climbBack=false;P.y=0;P.vy=0;input.jumpPressed=input.atkPressed=input.dashPressed=input.abilPressed=input.abil2Pressed=input.abil3Pressed=input.usePressed=false;G.state='play';}
    return;}
  P.face=1;
  if(P.z>-0.02&&P.x<DOOR_X-0.04){
    P.cvx=approach(P.cvx,4.2,dt*6);
    const slow=clamp((DOOR_X-P.x)/1.4,0.3,1);P.x=Math.min(DOOR_X,P.x+P.cvx*slow*dt);P.vx=P.cvx*slow;
    const ramp=clamp(((P.x-STAIR_X0)/STAIR_W+0.5)*STAIR_RISE,0,STAIR_TOP);
    P.y+=(ramp-P.y)*damp(dt,12);
  }else{P.x+=(DOOR_X-P.x)*damp(dt,6);P.y+=(STAIR_TOP-P.y)*damp(dt,10);}
  if(P.x>DOOR_X-1.1)P.climbTurn=approach(P.climbTurn,1,dt*2.4);
  if(P.climbTurn>0.35){const s=easeInOutCubic(P.climbTurn);P.z-=dt*2.7*s;P.vx=Math.max(P.vx*0.95,2.2*s+0.6);
    if(P.z<-3.25)P.y=STAIR_TOP+(-3.25-P.z)*0.72;}
  if(P.z<-3.7&&!G.climbFaded){G.climbFaded=true;fadeThen(G.tutorial?endPrisonTutorial:nextFloor);}
}
/* ---------- Vittoria al piano 100 ---------- */
function winGame(){G.won=true;G.winT=3.2;sfx('win');setTimeout(collectAllItems,2600);}
function showWin(){
  if(G.state!=='play')return;G.won=false;STATS.wins++;checkUnlocks();endRun();G.state='win';clearInput();$('touch').hidden=true;showMeds(false);setHint('',0);
  $('winText').textContent=`${G.cls.name} ha sconfitto ${bossFor(TOP_FLOOR).name} in cima alla torre. Cento piani, ${G.kills} nemici, e adesso le campane suonano per te.`;
  $('wnKills').textContent=G.kills;$('wnTime').textContent=fmtTime(G.runTime);$('wnXp').textContent=Math.round(G.runXp);$('wnWins').textContent=STATS.wins;
  $('win').hidden=false;MUS.mood='cellar';setTimeout(()=>$('winCellar').focus(),60);
}
$('winCellar').onclick=()=>{sfx('ui');$('win').hidden=true;G.state='menu';fadeThen(()=>{enterCellar();G.fadeTarget=0;});};

/* =========================================================
   PREMI: potenziamenti e armi
   ========================================================= */
// le rarità alte compaiono solo dai piani indicati da maxRarity
// aiuto ai nuovi giocatori: sotto il piano 20 (o con la classe sotto il livello 20) i bottini sono più forti e frequenti
function novice(){return G.scene==='tower'&&!G.tutorial&&(G.floor<20||(G.cls&&prog(G.cls.id).lv<20));}
const lootMaxR=f=>novice()&&f<20?Math.max(maxRarity(f),f>=12?3:f>=6?2:1):maxRarity(f);
function rollRarity(f,minR){const mx=lootMaxR(f),nv=novice();minR=Math.min(minR||0,mx);
  const w=[nv?30:55,28+f*0.2,(12+f*0.5)*(nv?1.8:1),(4+f*0.35)*(nv?2:1),1+f*0.2,0.7,0.2].map((v,i)=>i<minR||i>mx?0:v);
  let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<w.length;i++){if((r-=w[i])<0)return i;}return mx;}
function rollUpgrades(n){
  const list=UPG.filter(u=>(G.lv[u.id]||0)<u.max),weight=u=>u.id==='heal'?(P.hp>=S.maxHp*0.95?0.08:P.hp<S.maxHp*0.5?2.2:0.5):1,out=[];   // a vita piena la Pozione non serve: non esce quasi mai
  while(out.length<n&&list.length){let r=Math.random()*list.reduce((s,u)=>s+weight(u),0);for(let i=0;i<list.length;i++){if((r-=weight(list[i]))<0){out.push(list.splice(i,1)[0]);break;}}}
  return out;
}
let offered=[];
// ogni tot nemici sconfitti (sempre di più) si sceglie un potenziamento per questa scalata
function openUpgrade(){
  G.state='upgrade';clearInput();setHint('',0);$('touch').hidden=true;showMeds(false);P.atk=null;
  $('upEyebrow').textContent=`${G.kills} nemici sconfitti`;
  $('upNext').textContent=`Il prossimo tra ${G.upNeed} nemici. I potenziamenti valgono fino alla fine della scalata.`;
  offered=rollUpgrades(3);$('cards').innerHTML=offered.map(cardHTML).join('');$('upgrade').hidden=false;sfx('lvl');
  setTimeout(()=>{const c=$('card0');if(c&&!isTouch)c.focus();},60);
}
function cardHTML(o,i){
  if(o.weapon){const w=o.weapon,R=RARITY[w.rarity],T=WTYPES[w.type],cur=G.weapon.dmg;
    return `<button class="card wpn r${w.rarity}" style="--rc:${R.css};--rcg:${R.glow}" data-i="${i}" id="card${i}"><span class="card-key">${i+1}</span><span class="rar">${R.name}</span><span class="card-icon">${svg(T.icon)}</span><span class="card-name">${w.name}</span><span class="card-desc">Danno ${cur} → <b class="${w.dmg>=cur?'up':'down'}">${w.dmg}</b>${w.effect?'<br>'+cap(EFFECTS[w.effect].desc):''}${w.bonusReach?'<br>Portata +15%':''}</span><span class="card-lv">Sostituisce ${G.weapon.name}</span></button>`;}
  const lv=G.lv[o.id]||0;
  return `<button class="card" data-i="${i}" id="card${i}"><span class="card-key">${i+1}</span><span class="card-icon">${svg(o.icon)}</span><span class="card-name">${o.name}</span><span class="card-desc">${o.desc()}</span><span class="card-lv">${o.id==='heal'?'Subito':(lv?`Livello ${lv} → ${lv+1}`:'Nuovo')+(o.max<99?` · max ${o.max}`:'')}</span></button>`;
}
function pickCard(i){
  const o=offered[i];if(!o||G.state!=='upgrade')return;
  if(o.id!=='heal'&&(G.lv[o.id]||0)>=o.max)return;   // limite raggiunto: non si può prendere ancora
  o.apply();if(o.id!=='heal')G.lv[o.id]=(G.lv[o.id]||0)+1;sfx('pick');
  $('upgrade').hidden=true;G.state='play';P.invul=Math.max(P.invul,0.8);if(isTouch)$('touch').hidden=false;showMeds(true);canvas.focus();
  burst(P.x,P.y+1.2,0xb48cff,22,5,3,0.3);
}
$('cards').addEventListener('click',e=>{const c=e.target.closest('.card');if(c)pickCard(+c.dataset.i);});
function renderPerks(){}
// dopo le scale si passa direttamente al piano successivo: si diventa più forti solo con livelli ed equipaggiamento
function nextFloor(){startFloor(G.floor+1);G.fadeTarget=0;if(isTouch)$('touch').hidden=false;showMeds(true);}

