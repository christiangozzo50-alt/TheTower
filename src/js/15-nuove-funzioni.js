/* =========================================================
   NUOVE FUNZIONI: eventi nei piani, élite con nome, trofei e skin,
   bestiario, fabbro, set di equipaggiamento, eroi liberati nel
   seminterrato, mosse di squadra, rianimare, classifica online,
   modalità Orda, ranghi PvP
   ========================================================= */
// Indirizzo del database Firebase (Realtime Database). Vuoto = classifica online spenta.
const FB_URL='https://the-tower-8d9c5-default-rtdb.europe-west1.firebasedatabase.app';

/* ---------- skin: le opzioni scartate si sbloccano coi trofei ---------- */
const SKINSEL=store.get('skinsel',{});
const altSkins=id=>[0,1,2].filter(i=>i!==(SKINPICK[id]||0));
function skinOf(id){const v=SKINSEL[id];return v!=null&&skinUnlocked(id,v)?v:(SKINPICK[id]||0);}
buildHero=function(cls){return buildSkin(cls,skinOf(cls.id));};

/* ---------- trofei ---------- */
const TRO=Object.assign({bossBy:{},elites:0,flawless:0,horde:0,revives:0,pvpWins:0},store.get('trophy',{}));
const saveTro=()=>store.set('trophy',TRO);
const bestOf=id=>STATS.byClass[id]||0;
function skinUnlocked(id,v){if(v===(SKINPICK[id]||0))return true;const a=altSkins(id);
  if(v===a[0])return bestOf(id)>=15;if(v===a[1])return (TRO.bossBy[id]||0)>=4;return false;}
function trophyList(){const out=[];
  for(const c of CLASSES){const a=altSkins(c.id),sk=SKINS[c.id]||[];
    out.push({n:`${c.name}: veterano`,d:`Raggiungi il piano 15 con ${c.name}`,p:Math.min(1,bestOf(c.id)/15),ok:bestOf(c.id)>=15,r:`Skin «${(sk[a[0]]||{}).name||'nuova'}»`,cls:c.id});
    out.push({n:`${c.name}: cacciatore`,d:`Sconfiggi 4 guardiani con ${c.name}`,p:Math.min(1,(TRO.bossBy[c.id]||0)/4),ok:(TRO.bossBy[c.id]||0)>=4,r:`Skin «${(sk[a[1]]||{}).name||'nuova'}»`,cls:c.id});}
  const bes=bestiaryCount();
  out.push({n:'Senza un graffio',d:'Sconfiggi un guardiano senza farti colpire',p:Math.min(1,TRO.flawless),ok:TRO.flawless>=1,r:'Trofeo d\'onore'});
  out.push({n:'Cacciatore di élite',d:'Sconfiggi 50 nemici élite',p:Math.min(1,TRO.elites/50),ok:TRO.elites>=50,r:'Trofeo d\'onore'});
  out.push({n:'Studioso',d:'Completa il bestiario',p:bes.seen/bes.tot,ok:bes.seen>=bes.tot,r:'Trofeo d\'onore'});
  out.push({n:'Muro umano',d:'Supera 15 ondate nella modalità Orda',p:Math.min(1,TRO.horde/15),ok:TRO.horde>=15,r:'Trofeo d\'onore'});
  out.push({n:'Nessuno resta indietro',d:'Rianima 10 compagni',p:Math.min(1,TRO.revives/10),ok:TRO.revives>=10,r:'Trofeo d\'onore'});
  out.push({n:'Campione dell\'arena',d:'Vinci 10 sfide PvP',p:Math.min(1,TRO.pvpWins/10),ok:TRO.pvpWins>=10,r:'Trofeo d\'onore'});
  return out;}
let troKnown=null;
function troCheck(){if(!troKnown){troKnown=new Set(trophyList().filter(t=>t.ok).map(t=>t.n));return;}for(const t of trophyList())if(t.ok&&!troKnown.has(t.n)){troKnown.add(t.n);toast('Trofeo sbloccato!',t.n+' · '+t.r);sfx('lvl');}}

/* ---------- bestiario ---------- */
const BEST=store.get('bestiary',{});
const BOSSARCH={};for(const b of BOSS_LIST)if(!BOSSARCH[b[1]])BOSSARCH[b[1]]=b[2];
const BEST_TIPS={slime:'Lento e goffo: colpiscilo da lontano o saltagli sopra.',guard:'Para i colpi di fronte: prendilo alle spalle o dall\'alto.',mage:'Fragile: chiudi la distanza prima che lanci.',
  bat:'Vola a scatti: usa l\'attacco verso l\'alto.',archer:'Tiene le distanze: scatta verso di lui tra un tiro e l\'altro.',knight:'Resistentissimo: tieni le abilità per lui.',
  imp:'Esplode vicino a te: colpiscilo e allontanati subito.',wraith:'A tratti diventa immune: attacca solo quando è visibile.',brute:'Colpi lenti e pesanti: schiva e contrattacca.',
  shaman:'Evoca alleati: eliminalo per primo.',spider:'Sputa ragnatele che ti rallentano e balza: scatta di lato quando si abbassa.',fungus:'Lento, ma se ti avvicini scoppia una nube velenosa: colpisci e allontanati.',
  gargoyle:'Piomba dall\'alto: scansati e colpiscilo mentre resta a terra.',shade:'Sparisce e riappare alle tue spalle: girati e colpisci per primo.',scorpion:'Pinze da vicino, veleno da lontano: stagli addosso quando alza la coda.',
  salamander:'Sputa fuoco davanti a sé: saltale sopra e colpiscila da dietro.',eye:'Prende la mira e spara in linea retta: muoviti quando si illumina.',minotaur:'Carica a testa bassa: fallo schiantare contro il muro e sarà stordito.',
  'boss:slimeKing':'Si divide e salta: resta in movimento.','boss:golem':'Scosse a terra: salta quando alza i pugni.','boss:skelKing':'Evoca scheletri: colpisci lui, non loro.',
  'boss:bknight':'Para e contrattacca: aspetta che finisca la combo.','boss:archmage':'Vola e lancia magie: usa gli attacchi in aria.','boss:batQueen':'Picchiate improvvise: scatta di lato.',
  'boss:dragon':'Soffio di fuoco: stagli sotto e colpisci la pancia.'};
const bestKeys=()=>[...Object.keys(TYPES),...Object.keys(BOSSARCH).map(a=>'boss:'+a)];
const bestKeyOf=e=>e.type==='boss'?'boss:'+e.arch:e.type;
function bestiaryCount(){const ks=bestKeys();return {tot:ks.length,seen:ks.filter(k=>BEST[k]&&BEST[k].s).length};}
let bestDirty=false;setInterval(()=>{if(bestDirty){bestDirty=false;store.set('bestiary',BEST);}},3000);
const _syncB=syncEnemy;
syncEnemy=function(e,dt){_syncB(e,dt);if(e.pvp!=null||e._seen)return;e._seen=true;const k=bestKeyOf(e);const b=BEST[k]||(BEST[k]={s:0,k:0});if(!b.s){b.s=1;bestDirty=true;}};

/* ---------- élite con nome e modificatore ---------- */
const EL_NAMES=['Gorran','Velka','Morth','Sargax','Ilvenna','Druk','Kaelith','Brannor','Zovra','Ulmek','Thessa','Grimbald','Vorna','Hask','Ardel'];
const EL_MODS={corazzato:'il Corazzato',furioso:'il Furioso',veloce:'il Fulmineo',esplosivo:'l\'Instabile'};
const _spawnF=spawnEnemy;
spawnEnemy=function(type,o){const e=_spawnF(type,o);if(!e)return e;
  if(e.elite&&!e.ename&&(MP.host||!MP.live())){const mod=pick(Object.keys(EL_MODS));e.emod=mod;e.ename=pick(EL_NAMES)+' '+EL_MODS[mod];
    if(mod==='corazzato'){e.hp*=1.6;e.maxHp=e.hp;}else if(mod==='furioso')e.dmg*=1.35;else if(mod==='veloce')e.speed*=1.4;}
  if(G.event==='maledetto'&&e.pvp==null&&(MP.host||!MP.live())&&!e.cursed){e.cursed=true;e.hp*=1.4;e.maxHp=e.hp;e.dmg*=1.25;}
  return e;};
const elTags=new Map();
function updEliteTags(){
  for(const [e,el] of elTags)if(e.dead||G.scene!=='tower'||!G.enemies.includes(e)){el.remove();elTags.delete(e);}
  if(G.scene!=='tower')return;
  for(const e of G.enemies){if(e.dead||!e.ename||e.spawnT>0.2)continue;let el=elTags.get(e);
    if(!el){el=document.createElement('div');el.className='elite-tag';el.textContent=e.ename;document.body.appendChild(el);elTags.set(e,el);}
    const [sx,sy]=toScreen(e.x,e.y+e.h*(e.sc||1)+0.9,0);el.style.transform=`translate(${sx}px,${sy}px) translate(-50%,-100%)`;}}

/* ---------- uccisioni: bestiario, élite, trofei ---------- */
let bossFight=null;
const _keF=killEnemy;
killEnemy=function(e){const was=e.dead;const r=_keF(e);if(was||e.pvp!=null)return r;
  const k=bestKeyOf(e),b=BEST[k]||(BEST[k]={s:1,k:0});b.k++;bestDirty=true;
  if(e.elite&&!e.summon&&G.scene==='tower'){TRO.elites++;
    // bottino raro: non lo lasciano tutti
    if(Math.random()<0.2){const f=G.floor,o=Math.random()<0.5?makeWeapon(G.cls.weapon,Math.min(4,rollRarity(f,0)+1),f):makeGear(pick(Object.keys(GEAR)),Math.min(4,rollRarity(f,0)+1),f);
    try{dropItem(o,e.x,e.y+1,0,1);}catch(err){invAdd(o);showPick(o);}}
    if(e.emod==='esplosivo'){burst(e.x,e.y+1,0xff7a2e,40,9,4,0.3);sfx('boom');shake(0.4);
      if(MP.host||!MP.live()){if(!P.dead&&Math.abs(P.x-e.x)<2.4&&P.y<3)hurtPlayer(e.dmg*1.2,e.x,null);
        for(const R of MP.players.values())if(R.sc==='tower'&&R.fl===G.floor&&!R.dead&&Math.abs(R.x-e.x)<2.4)MP.sendTo(R.pid,{t:'hurt',f:G.floor,d:e.dmg*1.2,fx:e.x});}}}
  if(e.type==='boss'&&G.scene==='tower'&&!G.tutorial&&!G.horde){TRO.bossBy[G.cls.id]=(TRO.bossBy[G.cls.id]||0)+1;if(bossFight&&bossFight.e===e&&!bossFight.hit)TRO.flawless++;bossFight=null;}
  saveTro();troCheck();return r;};
const _hpF=_hurtPlayer;
setInterval(()=>{if(G.boss&&(!bossFight||bossFight.e!==G.boss))bossFight={e:G.boss,hit:false,hp:P.hp};if(bossFight&&P.hp<bossFight.hp)bossFight.hit=true;if(bossFight)bossFight.hp=P.hp;},100);

/* ---------- eventi casuali nei piani ---------- */
const EVENTS={buio:{n:'Piano buio',d:'Vedi solo intorno a te'},maledetto:{n:'Piano maledetto',d:'Nemici più forti, esperienza doppia'},mercante:{n:'Mercante errante',d:'Sconfiggi i nemici: ti aspetta oltre il cancello'},
  tempo:{n:'Corsa contro il tempo',d:'Ripulisci il piano prima che scada il tempo: forziere in premio'},ladro:{n:'Ladro di tesori',d:'Un folletto carico d\'oro scappa: prendilo prima che fugga'},
  meteore:{n:'Pioggia di meteore',d:'Massi infuocati dal soffitto: colpiscono anche i nemici'},giganti:{n:'Piano dei giganti',d:'Meno nemici ma enormi: esperienza doppia'},
  furia:{n:'Furia',d:'Colpisci più forte, ma arrivano più nemici'},campione:{n:'Campione del piano',d:'Un élite con nome custodisce un tesoro'}};
let merchant=null;
const _sfF=startFloor;
startFloor=function(f){
  G.event=null;if(merchant){if(merchant.g.parent)merchant.g.parent.remove(merchant.g);merchant=null;}
  // circa un piano su due ha un evento, così le scalate non sono tutte uguali
  const roll=()=>{const r=Math.random();return r<0.05?'buio':r<0.10?'maledetto':r<0.15?'mercante':r<0.23?'tempo':r<0.30?'ladro':r<0.36?(f>=4?'meteore':'tempo'):r<0.41?(f>=5?'giganti':'ladro'):r<0.47?'furia':r<0.53?(f>=6?'campione':'furia'):null;};
  if(!G.tutorial&&!G.pvp&&!G.horde&&f>=3&&!isBossFloor(f)&&!isSafeFloor(f))G.event=MP.live()?withSeed(MP.seed*7+f*13,roll):roll();
  _sfF(f);
  $('darkFx').hidden=G.event!=='buio';$('curseFx').hidden=G.event!=='maledetto';
  if(G.event){const ev=EVENTS[G.event];setTimeout(()=>{$('b2').textContent=ev.n+' · '+ev.d;},50);toast(ev.n,ev.d);if(G.event==='mercante')buildMerchant();}
};
const _dxF=dropXP;
dropXP=function(x,y,v){return _dxF(x,y,G.event==='maledetto'?v*2:v);};
function travelMerchantModel(){const g=new THREE.Group(),B=c=>new THREE.MeshBasicMaterial({color:c}),L=(pts)=>new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),QS(24,10)),T=(r,t)=>new THREE.TorusGeometry(r,t,QS(8,6),QS(26,12)),
    robe=toon(0x3b2a5e),robe2=toon(0x5a4392),hood=toon(0x2a1e44),gold=toon(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.45}),wood=toon(0x5f3f26),dark=toon(0x3a2616),leather=toon(0x7a5434),red=toon(0xa33a4a),sand=toon(0xe0c48a),hand=toon(0xc9a27a),glow=B(0xffc56b);
  // tappeto e bancarella verso la stanza
  mesh(rbox(3.4,0.05,1.7,0.02),red,-0.6,0.025,0.3,g);for(const z of [-0.5,1.1])mesh(rbox(3.4,0.06,0.1,0.02),gold,-0.6,0.03,z,g,true);
  for(const [x,z] of [[-1.72,0.05],[-0.62,0.05],[-1.72,0.62],[-0.62,0.62]])mesh(rbox(0.09,0.68,0.09,0.02),wood,x,0.34,z,g);
  mesh(rbox(1.3,0.09,0.78,0.03),wood,-1.17,0.72,0.33,g);mesh(rbox(1.34,0.36,0.03,0.01),red,-1.17,0.54,0.73,g);mesh(rbox(1.34,0.06,0.04,0.01),gold,-1.17,0.71,0.74,g);
  // merce: pozioni, monete, scrigno e cristallo
  const bottle=(x,z,c)=>{const m=toon(c,{emissive:c,emissiveIntensity:0.55});mesh(sph(0.1,12,10),m,x,0.87,z,g);mesh(new THREE.CylinderGeometry(0.035,0.05,0.12,10),m,x,1.0,z,g);mesh(new THREE.CylinderGeometry(0.045,0.045,0.04,10),leather,x,1.07,z,g,true);};
  bottle(-1.62,0.3,0xe0434f);bottle(-1.42,0.46,0x6fd0ff);bottle(-1.46,0.16,0x7fe08a);
  for(let i=0;i<5;i++)mesh(new THREE.CylinderGeometry(0.09,0.09,0.025,14),gold,-1.08+(i%2)*0.02,0.79+i*0.027,0.46,g,true);
  mesh(rbox(0.38,0.22,0.26,0.03),leather,-0.84,0.88,0.2,g);mesh(rbox(0.4,0.05,0.28,0.02),gold,-0.84,0.99,0.2,g);mesh(rbox(0.07,0.09,0.03,0.01),gold,-0.84,0.9,0.34,g,true);
  const gem=mesh(new THREE.OctahedronGeometry(0.13),toon(0xc7a8ff,{emissive:0x7a4aff,emissiveIntensity:0.9}),-1.1,1.18,0.2,g);
  // tendina a strisce
  for(const x of [-1.8,-0.54])mesh(new THREE.CylinderGeometry(0.035,0.04,2.35,10),wood,x,1.17,-0.02,g);
  for(let i=0;i<6;i++){const c=mesh(rbox(0.235,0.04,1.0,0.01),i%2?sand:red,-1.76+i*0.236+0.0,2.3,0.32,g);c.rotation.x=0.32;}
  // veste
  mesh(L([[0.6,0.05],[0.56,0.18],[0.46,0.72],[0.36,1.12],[0.31,1.42],[0.18,1.58],[0.01,1.62]]),robe,0,0,0,g);
  const hem=mesh(T(0.58,0.04),gold,0,0.14,0,g,true);hem.rotation.x=Math.PI/2;const belt=mesh(T(0.385,0.045),leather,0,1.05,0,g,true);belt.rotation.x=Math.PI/2;
  mesh(rbox(0.13,0.72,0.04,0.015),robe2,0,0.68,0.47,g);mesh(rbox(0.2,0.14,0.05,0.02),gold,0,1.05,0.4,g,true);mesh(sph(0.11,10,8),leather,0.3,0.86,0.33,g);
  const man=mesh(new THREE.ConeGeometry(0.47,0.46,QS(18,8)),robe2,0,1.5,0,g);man.scale.z=0.85;
  // cappuccio, volto in ombra, occhi e cappello largo
  mesh(sph(0.3,16,12),hood,0,1.86,-0.01,g);mesh(sph(0.2,12,10),B(0x08060c),0,1.83,0.16,g,true);for(const s of [-1,1])mesh(sph(0.042,8,6),B(0xffd27a),s*0.082,1.85,0.335,g,true);
  mesh(new THREE.ConeGeometry(0.075,0.34,8),B(0x08060c),0,1.74,0.37,g,true).rotation.x=Math.PI*0.62;
  mesh(new THREE.CylinderGeometry(0.62,0.66,0.04,QS(24,12)),dark,0,2.1,0,g);const hat=mesh(new THREE.ConeGeometry(0.34,0.62,QS(18,8)),dark,0.02,2.42,-0.02,g);hat.rotation.z=-0.1;const hb=mesh(T(0.285,0.03),gold,0,2.2,0,g,true);hb.rotation.x=Math.PI/2;
  // braccia: una verso la merce, una sul bastone
  const sl=(x,y,z,rx,rz)=>{const m=mesh(new THREE.CylinderGeometry(0.1,0.15,0.66,QS(12,6)),robe2,x,y,z,g);m.rotation.set(rx,0,rz);};
  sl(-0.42,1.22,0.14,-0.5,-0.6);mesh(sph(0.075,10,8),hand,-0.62,0.98,0.34,g);sl(0.47,1.26,0.12,-0.3,0.55);mesh(sph(0.075,10,8),hand,0.68,1.03,0.24,g);
  // bastone con lanterna
  mesh(new THREE.CylinderGeometry(0.03,0.04,2.5,10),wood,0.7,1.25,0.24,g);const hook=mesh(new THREE.TorusGeometry(0.17,0.022,8,16,Math.PI),wood,0.87,2.5,0.24,g);hook.rotation.z=0;
  mesh(new THREE.CylinderGeometry(0.008,0.008,0.26,6),leather,1.04,2.37,0.24,g,true);mesh(new THREE.ConeGeometry(0.15,0.09,8),gold,1.04,2.23,0.24,g,true);
  const lamp=mesh(sph(0.1,10,8),glow,1.04,2.08,0.24,g,true);mesh(new THREE.CylinderGeometry(0.13,0.13,0.03,8),gold,1.04,1.95,0.24,g,true);for(let i=0;i<4;i++){const a=i*Math.PI/2+0.78;mesh(new THREE.CylinderGeometry(0.009,0.009,0.28,5),gold,1.04+Math.cos(a)*0.125,2.09,0.24+Math.sin(a)*0.125,g,true);}
  // zaino da viaggio
  mesh(rbox(0.74,0.92,0.42,0.08),leather,0,1.14,-0.5,g);mesh(rbox(0.8,0.08,0.46,0.03),dark,0,1.25,-0.5,g,true);const roll=mesh(new THREE.CylinderGeometry(0.15,0.15,0.92,QS(14,8)),red,0,1.74,-0.52,g);roll.rotation.z=Math.PI/2;
  for(const s of [-1,1]){mesh(sph(0.13,10,8),dark,s*0.5,0.86,-0.46,g);mesh(new THREE.CylinderGeometry(0.06,0.07,0.08,10),gold,s*0.5,1.0,-0.46,g,true);}
  g.userData.parts={lamp,gem};return g;}
function travelPortrait(){if(travelPortrait.v!=null)return travelPortrait.v;try{const m=travelMerchantModel();m.rotation.y=0.3;const u=psURL(psShot(m,48,48,{cx:0.02,cy:1.9,h:1.4,dist:9,oy:0.1},false));disposeObj(m);return travelPortrait.v=u;}catch(e){return travelPortrait.v='';}}
function buildMerchant(){const x=GATE_X-1.6,g=travelMerchantModel();g.position.set(x,0,-1.55);g.rotation.y=-0.3;g.visible=false;levelGroup.add(g);
  const P_=g.userData.parts;G.props.push({o:P_.lamp,flick:1},{o:P_.gem,spin:1.6});
  const l=new THREE.PointLight(0xffc56b,1.1,6,2);l.position.set(1.04,2.1,0.5);g.add(l);
  merchant={g,x,used:false,shown:false};}
function merchantTrade(){if(!merchant||merchant.used||P.dead)return;const cost=Math.max(1,Math.round(P.hp*0.3));if(P.hp-cost<1)return;
  P.hp-=cost;merchant.used=true;popNum(P.x,P.y+2.2,'-'+cost,'hurt');const f=G.floor,r=Math.min(4,rollRarity(f,0)+1);
  const o=Math.random()<0.5?makeWeapon(G.cls.weapon,r,f):makeGear(pick(Object.keys(GEAR)),r,f);invAdd(o);showPick(o);sfx('pick');burst(merchant.x,1.2,0xc7a8ff,30,5,3);
  toast('Affare fatto','Il mercante sparisce nell\'ombra');levelGroup.remove(merchant.g);merchant=null;}

/* ---------- set di equipaggiamento ---------- */
const SETS={drago:{n:'del Cacciatore di draghi',b2:'+10% danno',b3:'+20% danno e +30 vita',a(n){S.dmgMul+=n>=3?0.2:0.1;if(n>=3)S.maxHp+=30;}},
  ombra:{n:'dell\'Ombra',b2:'+5% critico',b3:'+12% critico',a(n){S.crit+=n>=3?0.12:0.05;}},
  arcano:{n:'Arcano',b2:'-10% ricarica abilità',b3:'-22% ricarica abilità',a(n){S.cdMul*=n>=3?0.78:0.9;}},
  sangue:{n:'del Sangue',b2:'+1 vita per colpo',b3:'+3 vita per colpo e +10% danno',a(n){S.lifesteal+=n>=3?3:1;if(n>=3)S.dmgMul+=0.1;}}};
const _mgF=makeGear;
makeGear=function(slot,r,f){const g=_mgF(slot,r,f);if(r>=1&&Math.random()<0.25){const k=pick(Object.keys(SETS));g.set=k;g.name+=' '+SETS[k].n;}return g;};
function setCounts(){const c={};for(const k in G.gear||{}){const g=G.gear[k];if(g&&g.set)c[g.set]=(c[g.set]||0)+1;}return c;}
const _rsF=resetStats;
resetStats=function(){_rsF();const c=setCounts();for(const k in c)if(c[k]>=2&&SETS[k])SETS[k].a(c[k]);
};

/* ---------- eroi liberati che restano nel seminterrato ---------- */
const NPC_X=[-9.6,-1.9,4.3,7.9],NPC_TIPS=['La stamina è tutto: non restare mai senza.','Dall\'alto verso il basso: l\'attacco a zona colpisce tutti intorno.','Gli élite con un nome a volte lasciano un oggetto.',
  'Il fabbro trasforma gli oggetti inutili in frammenti.','Tre pezzi dello stesso set danno un bonus enorme.','Nel buio, resta vicino ai muri.','Il mercante chiede vita: non pagarlo se sei messo male.','Un compagno a terra si rialza se lo tieni vicino 3 secondi.'];
let npcs=[];
function buildNpcs(){for(const n of npcs)mpRemoveHero(n);npcs=[];return;   // eroi liberati nel seminterrato: tolti
  const freed=CLASSES.filter(c=>UNL.u[c.id]&&c.id!==G.cls.id&&CLASSES.indexOf(c)!==starterIdx()).slice(-4);
  freed.forEach((c,i)=>{const R={pid:-5-i,npc:true,name:c.name,x:NPC_X[i],y:0,z:-1.9,tx:NPC_X[i],ty:0,tz:-1.9,vx:0,vy:0,face:i%2?-1:1,onGround:true,dead:false,walkT:0,lastStep:0,atk:null,hero:null,hkey:'',tip:NPC_TIPS[(i*3+c.id.length)%NPC_TIPS.length]};
    mpMakeHero(R,c.id,[c.weapon,0,0,''],SKINPICK[c.id]||0);if(R.hero){R.hero.root.scale.setScalar(0.92);npcs.push(R);}});}
function drawAs(R,dt,st){const bk={};for(const k2 of RKEYS){bk[k2]=P[k2];P[k2]=R[k2];}
  const gH=hero,gW=G.weapon,gC=G.cls,gS=G.state,uT=updTrail,uB=updBear;hero=R.hero;G.weapon=R.wobj;G.cls=R.cls;G.state=st||'play';updTrail=()=>{};updBear=()=>{};
  try{_updHeroVisual(dt);}catch(e){}finally{for(const k2 of RKEYS){R[k2]=P[k2];P[k2]=bk[k2];}hero=gH;G.weapon=gW;G.cls=gC;G.state=gS;updTrail=uT;updBear=uB;}}
let npcNear=null;
function updNpcs(dt){const on=G.scene==='cellar';npcNear=null;
  for(const R of npcs){if(!R.hero)continue;R.hero.root.visible=on;if(!on)continue;drawAs(R,dt,'play');
    if(G.state==='cellar'&&Math.abs(P.x-R.x)<0.9&&!nearInter)npcNear=R;}
  if(npcNear&&npcNear!==updNpcs.last)setHint(`${npcNear.name}: «${npcNear.tip}»`,3.5);updNpcs.last=npcNear;}

/* ---------- mosse di squadra (co-op) ---------- */
const lastAbil={};
const _useSlotF=useSlot;
useSlot=function(n){const cd=SLOT[n]&&P[SLOT[n].cd];_useSlotF(n);
  if(MP.live()&&!G.pvp&&G.scene==='tower'&&SLOT[n]&&P[SLOT[n].cd]>0&&!(cd>0)){const m={t:'abil',x:r2(P.x),y:r2(P.y),el:G.cls.el||G.cls.id};if(MP.host)teamAbil(MP.myPid,m);else MP.send(m);}};
const COMBO_N={'fuoco+gelo':['Esplosione di vapore',0xdfe8ff],'fuoco+fulmine':['Tempesta di plasma',0xffa64a],'fulmine+gelo':['Bufera elettrica',0x9fe8ff],'fuoco+vampiro':['Rogo cremisi',0xff4d6d],'gelo+vampiro':['Inverno eterno',0x7fe08a]};
function teamAbil(pid,m){const now=performance.now();lastAbil[pid]={t:now,x:m.x,y:m.y,el:m.el};
  for(const k in lastAbil){const o=lastAbil[k];if(+k===pid||now-o.t>1200||Math.abs(o.x-m.x)>6)continue;
    delete lastAbil[k];delete lastAbil[pid];const key=[o.el,m.el].sort().join('+'),cn=COMBO_N[key]||['Colpo di squadra',0xffd27a];
    const msg={t:'tcombo',x:r2((o.x+m.x)/2),y:r2(Math.max(o.y,m.y)),n:cn[0],c:cn[1]};MP.bcast(msg);teamCombo(msg,true);return;}}
function teamCombo(m,host){const c=m.c;burst(m.x,m.y+1.2,c,80,12,5,0.4);burst(m.x,0.3,0xffffff,30,8,2);shake(0.6);sfx('boom');sfx('roar');
  const sp=$('abilSplash');sp.querySelector('b').textContent=m.n;sp.style.setProperty('--c','#'+c.toString(16).padStart(6,'0'));sp.classList.remove('on','big');void sp.offsetWidth;sp.classList.add('on','big');
  if(host){const dmg=(30+G.floor*5)*(1+0.15*MP.count());for(const e of foes())if(Math.abs(e.x-m.x)<5.5&&Math.abs(e.y-m.y)<4)hitEnemy(e,dmg,e.x<m.x?-1:1,{kb:9,ky:6,stun:1.2,unblockable:true});}}

/* ---------- rianimare un compagno (3 secondi) ---------- */
let revT=0,revR=null,revHp=0;
const _pressF=press;
press=function(a,down){if(a==='use')G.useHeld=down;return _pressF(a,down);};
['pointerup','pointercancel','pointerleave'].forEach(t=>$('bUse').addEventListener(t,()=>{G.useHeld=false;}));
function updRevive(dt){
  let R=null;
  if(MP.live()&&!G.pvp&&G.scene==='tower'&&G.state==='play'&&!P.dead)for(const r of MP.players.values())if(r.dead&&r.sc==='tower'&&r.fl===G.floor&&Math.abs(r.x-P.x)<1.7&&Math.abs(r.y-P.y)<2){R=r;break;}
  const bar=$('reviveBar');
  if(!R){if(revR){revR=null;revT=0;bar.hidden=true;if(isTouch&&!nearChest)$('bUse').hidden=true;}return;}
  if(revR!==R){revR=R;revT=0;revHp=P.hp;}
  if(isTouch){$('bUse').hidden=false;$('bUse').textContent='Tieni premuto: rianima '+(R.name||'');}
  if(P.hp<revHp){revT=0;}revHp=P.hp;
  revT=G.useHeld?revT+dt:Math.max(0,revT-dt*2);
  bar.hidden=false;$('reviveName').textContent=(G.useHeld?'Rianimi ':'Tieni premuto '+(touchUI()?'Usa':inputLabel('use'))+' per rianimare ')+(R.name||'il compagno');
  $('reviveFill').style.transform=`scaleX(${Math.min(1,revT/3)})`;
  const [sx,sy]=toScreen(R.x,R.y+1.6,0);bar.style.transform=`translate(${sx}px,${sy}px) translate(-50%,-100%)`;
  if(revT>=3){revT=0;MP.send({t:'revive',to:R.pid,by:MP.myPid});if(MP.host&&R.pid===0){}R.dead=false;TRO.revives++;saveTro();troCheck();
    toast('Compagno rianimato!',`${R.name||'Il compagno'} è di nuovo in piedi`);sfx('lvl');burst(R.x,R.y+1,0x7fe08a,40,6,3);bar.hidden=true;revR=null;}}
function gotRevived(by){if(!P.dead||G.scene!=='tower')return;mpRevive();P.invul=2;G.state='play';$('specHud').hidden=true;$('touch').hidden=!isTouch;showMeds(true);
  burst(P.x,P.y+1,0x7fe08a,40,6,3);sfx('lvl');toast('Sei di nuovo in piedi!',`${pName(by)} ti ha rianimato`);}

/* ---------- modalità Orda ---------- */
G.horde=false;G.wave=0;G.waveT=0;
const _srH=startRun;
startRun=function(){const hn=!!G.hordeNext;const r=_srH();G.hordeNext=false;if(hn&&G.scene==='tower')hordeInit();else G.horde=false;return r;};
function hordeBossX(){const R=GATE_X-5,L=-HALF+5,M=(L+R)/2;if(!G.enemies.some(e=>!e.dead&&e.type==='boss'))return R;return Math.abs(L-P.x)>5?L:M;}
function hordeBossSep(dt){if(!G.horde||(MP.live()&&!MP.host))return;const b=G.enemies.filter(e=>!e.dead&&e.type==='boss'&&!(e.spawnT>0));
  for(let i=0;i<b.length;i++)for(let j=i+1;j<b.length;j++){const A=b[i],C=b[j],need=(A.w+C.w)/2+2,d=C.x-A.x,ad=Math.abs(d);if(ad>=need||Math.abs(A.y-C.y)>5)continue;
    const s=d>=0?1:-1,p=Math.min(need-ad,16*dt)/2;A.x=clamp(A.x-s*p,-HALF+1.5,GATE_X-1.5);C.x=clamp(C.x+s*p,-HALF+1.5,GATE_X-1.5);}}
/* premio di fine Orda in base all'ondata raggiunta: rubini sempre, oggetti a soglie (rarità in ordine di estrazione) */
const HORDE_PRIZES=[[3,[0]],[5,[1]],[10,[2]],[15,[2,2]],[20,[3,2]],[30,[3,3]],[40,[4,3]],[50,[4,4]],[65,[5,4]],[80,[5,5]],[100,[6,5]]];
function hordePrize(){if(!G.horde||G.hordePaid)return G.hordeResult||null;G.hordePaid=true;
  const W=Math.max(1,G.wave||1),f=Math.min(100,W*2),rub=W*8+Math.floor(W/5)*30;let tier=null,next=null;for(const t of HORDE_PRIZES){if(W>=t[0])tier=t;else if(!next)next=t;}
  const items=(tier?tier[1]:[]).map((r,i)=>i===0?makeWeapon(G.cls.weapon,r,f):makeGear(pick(Object.keys(GEAR)),r,f));
  addCoins(rub);for(const o of items){invAdd(o);if(!o.slot)STATS.weapons++;if(o.rarity>=4)STATS.legend++;}saveStats();
  return G.hordeResult={W,rub,items,next:next&&next[0]};}
function hordePrizeUi(){const el=$('hordePrize'),p=G.horde?G.hordeResult:null;if(!el)return;el.hidden=!p;if(!p)return;
  el.innerHTML=`<small>Premio · ondata ${p.W}</small><div class="hp-row"><span class="hp-rub">+${fmtC(p.rub)} ◆</span>${p.items.map(o=>{const R=RARITY[o.rarity];return `<span class="hp-it"><span class="thumb" style="--rc:${R.css};--rcg:${R.glow}">${itemPic(o,o.slot?GEAR[o.slot].icon:WTYPES[o.type].icon)}</span><span style="color:${R.css}">${esc(o.name)}</span></span>`;}).join('')}</div>${p.next?`<em>Arriva all'ondata ${p.next} per un premio migliore</em>`:''}`;}
function hordeInit(){G.hordePaid=false;G.hordeResult=null;G.horde=true;G.wave=1;G.waveT=0;G.event=null;$('darkFx').hidden=true;$('curseFx').hidden=true;
  if(merchant){levelGroup.remove(merchant.g);merchant=null;}hordeLabel();toast('Modalità Orda','Ondate infinite: resisti il più possibile');}
function hordeLabel(){$('floorNum').textContent=G.wave;const z=$('zoneName');if(z)z.textContent='Orda · ondata';}
function hordeQueue(){const f=G.floor;let q=buildQueue(f);if(G.wave%5===0)q=['boss',...q.slice(0,Math.ceil(q.length/2))];return q;}
function hordeNextWave(){G.wave++;G.floor=G.wave*2;G.queue=hordeQueue();G.spawnT=1.2;G.cleared=false;G.gateMsg=true;
  if(MP.live())MP.bcast({t:'wave',w:G.wave,f:G.floor});hordeLabel();bannerWave();}
function bannerWave(){$('b1').textContent=`Ondata ${G.wave}`;$('b2').textContent=G.wave%5===0?'Arriva un guardiano!':'Preparati';const b=$('banner');b.classList.remove('show','boss');void b.offsetWidth;if(G.wave%5===0)b.classList.add('boss');b.classList.add('show');sfx('gate');}
const _ufH=updFloor;
updFloor=function(dt){
  if(G.horde&&!G.queue.length&&!G.enemies.some(e=>!e.dead)&&G.waveT<=0&&(MP.host||!MP.live())&&G.state==='play'){G.waveT=3;if(G.wave>TRO.horde){TRO.horde=G.wave;saveTro();troCheck();}toast(`Ondata ${G.wave} superata!`,'La prossima arriva tra poco');}
  if(G.horde&&G.waveT>0){G.waveT-=dt;if(G.waveT<=0)hordeNextWave();}
  _ufH(dt);hordeBossSep(dt);if(G.horde&&G.cleared){G.cleared=false;G.gateMsg=true;}};
const _erH=endRun;
endRun=function(){if(G.horde||G.pvp){STATS.runs++;saveStats();if(G.horde){const quit=G.state==='pause',p=hordePrize();if(quit&&p)toast(`Premio dell'ondata ${p.W}: +${p.rub} ◆`,p.items.length?'Gli oggetti sono nell\'armadio':'');}return;}return _erH();};
const _goH=gameOver;
gameOver=function(){_goH();hordePrizeUi();if(G.horde){$('overSub').textContent=`Hai resistito ${G.wave-1} ondate`;$('stFloor').textContent=G.wave;}submitRun();};

/* ---------- classifica online (Firebase) ---------- */
const PID=store.get('pid',null)||(()=>{const v=Math.random().toString(36).slice(2,12);store.set('pid',v);return v;})();
const fbOn=()=>!!FB_URL;
async function fbGet(path,q){const r=await fetch(`${FB_URL.replace(/\/$/,'')}/${path}.json${q?'?'+q:''}`);if(!r.ok)throw new Error(r.status);return r.json();}
async function fbPost(path,body,method){const r=await fetch(`${FB_URL.replace(/\/$/,'')}/${path}.json`,{method:method||'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error(r.status);return r.json();}
function submitRun(){if(!fbOn()||G.tutorial||G.pvp)return;const mode=G.horde?'orda':(MP.live()||G.runCoop)?'coop':'solo',   // una scalata nata in co-op resta co-op anche se i compagni escono
  f=G.horde?G.wave-1:G.floor;if(f<2)return;
  const path='scores/'+mode,k=encodeURIComponent(nameKey(MP.name())),row={n:MP.name(),c:G.cls.name,f,t:Date.now()};
  fbGet(path+'/'+k).then(o=>{if(o&&o.f>=f)return;return fbPut(path+'/'+k,row);}).catch(()=>fbPost(path,row).catch(()=>{}));}
function lbBest(list,val){const m=new Map();for(const x of list){if(!x||x.n==null)continue;const k=nameKey(x.n),b=m.get(k);if(!b||val(x)>val(b)||(val(x)===val(b)&&(x.t||0)<(b.t||0)))m.set(k,x);}return [...m.values()].sort((a,b)=>val(b)-val(a)||(a.t||0)-(b.t||0)).slice(0,25);}
async function loadBoard(mode){const box=$('lbList');if(!fbOn()){box.innerHTML='<p class="note">La classifica online non è ancora collegata.</p>';return;}
  box.innerHTML='<p class="note">Carico…</p>';
  try{let rows;
    if(mode==='pvp'){const d=await fbGet('pvp/'+season(),'orderBy="r"&limitToLast=300')||{};rows=lbBest(Object.values(d),x=>x.r).map(x=>({n:x.n,v:`${x.r} · ${tierOf(x.r)}`,c:''}));}
    else{const d=await fbGet('scores/'+mode,'orderBy="f"&limitToLast=300')||{};rows=lbBest(Object.values(d),x=>x.f).map(x=>({n:x.n,c:x.c,v:(mode==='orda'?'ondata ':'piano ')+x.f}));}
    box.innerHTML=rows.length?rows.map((r,i)=>`<div class="lb-r${r.n===MP.name()?' me':''}"><span>${i<3?['🥇','🥈','🥉'][i]:i+1}</span><b>${esc(r.n)}</b><small>${esc(r.c||'')}</small><em>${r.v}</em></div>`).join(''):'<p class="note">Ancora nessun punteggio: sii il primo!</p>';}
  catch(e){box.innerHTML='<p class="note">Non riesco a caricare la classifica. Controlla la connessione.</p>';}}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- ranghi PvP ---------- */
const season=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');};
let RATING=store.get('pvprating',{s:season(),r:1000});if(RATING.s!==season())RATING={s:season(),r:1000};
const tierOf=r=>r>=1400?'Diamante':r>=1250?'Oro':r>=1100?'Argento':'Bronzo';
const _pvpEndF=pvpEnd;
pvpEnd=function(win){const was=PV.on;_pvpEndF(win);if(!was)return;const won=win===pvpTeamOf(MP.myPid),old=RATING.r;RATING.r=Math.max(0,RATING.r+(won?25:-20));store.set('pvprating',RATING);
  if(won){TRO.pvpWins++;saveTro();troCheck();}
  setTimeout(()=>{const el=$('pvpList');if(el)el.insertAdjacentHTML('afterend',`<p class="pvp-rank">Rango: <b>${tierOf(RATING.r)}</b> · ${RATING.r} punti (${won?'+25':'-20'})${tierOf(old)!==tierOf(RATING.r)?' · <b>nuovo rango!</b>':''}</p>`);},950);
  if(fbOn())fbPost(`pvp/${season()}/${PID}`,{n:MP.name(),r:RATING.r,t:Date.now()},'PUT').catch(()=>{});};
const _onUiF=onUi;
onUi=function(){_onUiF();const el=$('onRank');if(el)el.textContent=`Il tuo rango PvP: ${tierOf(RATING.r)} · ${RATING.r} punti · stagione ${season()}`;};

/* ---------- messaggi di rete delle nuove funzioni ---------- */
const _mpMsgF=mpMsg;
mpMsg=function(m,from){
  switch(m.t){
  case 'abil':if(MP.host)teamAbil(from,m);return;
  case 'tcombo':if(!MP.host)teamCombo(m,false);return;
  case 'revive':if(MP.host&&m.to!==0){MP.sendTo(m.to,m);return;}if(m.to===MP.myPid)gotRevived(m.by);return;
  case 'wave':if(!MP.host&&G.horde){G.wave=m.w;G.floor=m.f;G.cleared=false;G.spawnT=1e9;hordeLabel();bannerWave();}return;
  }
  return _mpMsgF(m,from);};

/* ---------- aggiornamento per fotogramma ---------- */
const _uhvF=updHeroVisual;
updHeroVisual=function(dt){
  _uhvF(dt);
  if(npcs.length||G.scene==='cellar'){if(G.scene==='cellar'&&!npcs.length&&!updHeroVisual.built){updHeroVisual.built=true;buildNpcs();}updNpcs(dt);}
  updEliteTags();
  // buio: luce solo intorno all'eroe
  if(G.event==='buio'&&G.scene==='tower')drawDark();
  // mercante
  if(merchant&&!merchant.shown&&G.gateOpen&&G.scene==='tower'){merchant.shown=true;merchant.g.visible=true;burst(merchant.x,1.2,0xc7a8ff,30,5,3);sfx('ability');popNum(merchant.x,2.6,'Il mercante è arrivato','info');}
  if(merchant&&merchant.shown&&G.state==='play'&&G.scene==='tower'&&!P.dead&&Math.abs(P.x-merchant.x)<1.7&&P.y<2.4&&!nearChest){const pr=$('prompt');pr.hidden=false;$('promptName').textContent='Mercante errante';
    $('promptSub').textContent='Tre affari: paga con vita o rubini';$('promptKey').textContent=inputLabel('use');$('promptKey').hidden=touchUI();
    const [sx,sy]=toScreen(merchant.x,2.6,-1.55);pr.style.transform=`translate(${sx}px,${sy}px) translate(-50%,-100%)`;if(isTouch){$('bUse').hidden=false;$('bUse').textContent='Parla col mercante';}
    merchant.near=true;}
  else if(merchant&&merchant.near){merchant.near=false;$('prompt').hidden=true;if(isTouch)$('bUse').hidden=true;}
  updRevive(dt);
};
const _ecF=enterCellar;
enterCellar=function(){G.horde=false;G.event=null;$('darkFx').hidden=true;$('curseFx').hidden=true;const r=_ecF();buildNpcs();return r;};

/* ---------- arredi nuovi del seminterrato: fabbro e bacheca ---------- */
const FORGE_X=-7.2,BOARD_X=-1.25;
(function(){const C=cellarG;
  // fabbro della fucina: forno grande di mattoni con camino e mantice, incudine davanti
  const iron=toon(0x4a4a54),ironD=toon(0x2a2a32),brick=toon(0x6a3a2a),orange=0xff7a2e;
  const fur=new THREE.Group();fur.position.set(FORGE_X-0.5,0,-2.45);C.add(fur);
  mesh(rbox(2.1,2.3,1.1,0.06),brick,0,1.15,0,fur);mesh(rbox(2.3,0.2,1.25,0.04),ironD,0,2.35,0,fur);
  const mo=new THREE.Shape();mo.moveTo(-0.5,0);mo.lineTo(-0.5,0.45);mo.absarc(0,0.45,0.5,Math.PI,0,true);mo.lineTo(0.5,0);mo.lineTo(-0.5,0);
  mesh(new THREE.ShapeGeometry(mo,12),new THREE.MeshBasicMaterial({color:0x2a0a02}),0,0.45,0.56,fur,true);
  mesh(new THREE.ShapeGeometry(mo,12),new THREE.MeshBasicMaterial({color:orange,transparent:true,opacity:0.85}),0,0.45,0.565,fur,true).scale.set(0.8,0.7,1);
  for(const dx of [-0.25,0,0.25])CFX.flame(fur,dx,0.7,0.5,0xff5a10,1.6);
  mesh(new THREE.CylinderGeometry(0.35,0.45,3.6,10),brick,0,4.1,-0.2,fur);mesh(new THREE.CylinderGeometry(0.42,0.42,0.2,10),ironD,0,2.6,-0.2,fur);
  const bel=new THREE.Group();bel.position.set(1.25,0.7,0.1);fur.add(bel);mesh(rbox(0.6,0.12,0.4,0.03),toon(0x6a4a2e),0,0,0,bel);
  const bt=mesh(rbox(0.6,0.12,0.4,0.03),toon(0x6a4a2e),0,0.26,0,bel);mesh(new THREE.CylinderGeometry(0.2,0.2,0.4,10,1,true),toon(0x5a3020,{side:THREE.DoubleSide}),0,0.13,0,bel).rotation.z=Math.PI/2;
  cellarAnims.push((dt,t)=>{bt.position.y=0.18+Math.sin(t*1.6)*0.08;bt.rotation.z=Math.sin(t*1.6)*0.1;});
  mesh(new THREE.CylinderGeometry(0.3,0.42,0.4,10),ironD,FORGE_X+0.9,0.2,-1.3,C);mesh(rbox(0.9,0.22,0.36,0.04),iron,FORGE_X+0.9,0.55,-1.3,C);mesh(rbox(0.46,0.16,0.26,0.03),iron,FORGE_X+0.9,0.36,-1.3,C);
  mesh(new THREE.ConeGeometry(0.15,0.4,10),iron,FORGE_X+1.45,0.56,-1.3,C).rotation.z=-Math.PI/2;
  mesh(rbox(0.36,0.06,0.12,0.02),new THREE.MeshBasicMaterial({color:0xffb040}),FORGE_X+0.85,0.69,-1.3,C,true);
  const fl=new THREE.PointLight(orange,2.0,8,1.6);fl.position.set(FORGE_X-0.4,1.2,-1.3);C.add(fl);cellarLights.push({light:fl,base:2.0,seed:4});
  // --- il nano fabbro: sta all'incudine e la martella, con scintille ad ogni colpo ---
  (function(){
    const skin=toon(0xc9956a),beard=toon(0xb24a24),leather=toon(0x5a3420),ironM=toon(0x3a3d45),steel=toon(0x8a9099),gold=toon(0xc8963a),wood=toon(0x6a4a2e);
    const S=new THREE.Group();S.position.set(FORGE_X+1.55,0,-1.2);S.rotation.y=-0.18;C.add(S);
    // gambe tozze con stivali
    for(const s of [-1,1]){mesh(rbox(0.22,0.4,0.26,0.06),ironD,s*0.16,0.22,0,S);mesh(rbox(0.26,0.13,0.32,0.05),ironM,s*0.16,0.07,0.04,S);}
    // corpo largo con grembiule di cuoio
    mesh(rbox(0.68,0.6,0.46,0.1),leather,0,0.74,0,S);
    mesh(rbox(0.5,0.5,0.3,0.06),toon(0x7a4a2e),0,0.76,0.2,S);
    mesh(rbox(0.1,0.5,0.1,0.03),gold,0,0.98,0.26,S,true);
    // testa, elmo e barbona
    mesh(sph(0.2,16,12),skin,0,1.32,0.02,S);
    mesh(new THREE.SphereGeometry(0.225,16,10,0,Math.PI*2,0,Math.PI/2),ironM,0,1.38,0.02,S);
    mesh(rbox(0.47,0.08,0.31,0.03),steel,0,1.22,0.02,S);
    const bd=mesh(new THREE.ConeGeometry(0.27,0.52,10),beard,0,1.1,0.13,S);bd.rotation.x=Math.PI;
    mesh(sph(0.07,8,6),toon(0xd8a07a),0,1.28,0.22,S,true);
    // braccio sinistro che regge il pezzo rovente sull'incudine
    mesh(rbox(0.16,0.14,0.52,0.05),skin,-0.34,0.96,0.18,S);
    // braccio destro col martello (pivot alla spalla, oscilla e abbatte)
    const arm=new THREE.Group();arm.position.set(0.36,1.06,0.06);S.add(arm);
    mesh(rbox(0.16,0.46,0.16,0.05),skin,0,-0.2,0,arm);
    const ham=new THREE.Group();ham.position.set(0,-0.44,0);arm.add(ham);
    mesh(new THREE.CylinderGeometry(0.03,0.03,0.5,8),wood,0,0,0,ham);
    mesh(rbox(0.28,0.17,0.17,0.04),ironM,0,0.3,0,ham);
    mesh(rbox(0.07,0.19,0.19,0.02),steel,0.17,0.3,0,ham,true);
    // colpo: il martello scende, risale e a fine corsa fa volare le scintille sull'incudine
    const anvilX=FORGE_X+0.9;let prev=1;
    cellarAnims.push((dt,t)=>{
      const ph=(t*1.05)%1;
      const sw=ph<0.72?1.25*(ph/0.72):1.25*(1-(ph-0.72)/0.28);
      arm.rotation.x=-0.35+sw;
      if(prev<0.72&&ph>=0.72){burst(anvilX,0.82,0xffc24a,9,5,3);burst(anvilX,0.82,0xff6a1e,6,4,2);}
      prev=ph;
    });
  })();
  // bacheca: lastra di ferro rivettata con i fogli appesi
  const b=new THREE.Group();b.position.set(BOARD_X,2.4,-3.0);C.add(b);
  mesh(rbox(1.8,1.35,0.1,0.03),iron,0,0,0,b);for(const [x,y] of [[-0.82,0.6],[0.82,0.6],[-0.82,-0.6],[0.82,-0.6]])mesh(sph(0.04,6,4),toon(0xc8963a),x,y,0.06,b,true);
  for(const [x,y,col] of [[-0.45,0.2,0x2a4a8a],[0.1,0.25,0xd8cca8],[0.55,0.05,0x2a4a8a],[-0.25,-0.3,0xd8cca8],[0.35,-0.35,0xe8dcc0]]){const p=mesh(new THREE.PlaneGeometry(0.42,0.5),new THREE.MeshBasicMaterial({color:col}),x,y,0.07,b,true);p.rotation.z=rand(-0.15,0.15);}
  const mk=x=>{const r=mesh(new THREE.TorusGeometry(1.0,0.035,8,48),new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:0,depthWrite:false}),x,0.03,-0.2,C,true);r.rotation.x=Math.PI/2;r.scale.set(1,0.55,1);return r;};
  INTER.push({id:'forge',x:FORGE_X,y:2.2,name:'Fabbro',sub:()=>`${FRAG.n} frammenti · smonta e migliora gli oggetti`,ring:mk(FORGE_X),act:openForge});
  INTER.push({id:'board',x:BOARD_X,y:3.3,name:'Bacheca',sub:()=>'Trofei, bestiario e classifica',ring:mk(BOARD_X),act:()=>openBoard('tro')});})();

/* ---------- fabbro ---------- */
const FRAG=Object.assign({n:0},store.get('frags',{}));const saveFrag=()=>store.set('frags',FRAG);
// smontare rende poco e salire costa sempre di più: il fabbro non può creare rarità che la torre non ti ha ancora dato
const DISM=[1,2,5,12,30,80,200],UPC=[8,25,80,300,1200,4000];
const forgeBest=()=>Math.max(UNL.best||0,STATS.best||0);
let fgSel=null;
function openForge(){if(G.state!=='cellar')return;G.state='forge';clearInput();['prompt','bUse','touch'].forEach(id=>$(id).hidden=true);fgSel=null;renderForge();$('forge').hidden=false;}
function closeForge(){fgArm=null;$('forge').hidden=true;if(G.state==='forge'){G.state='cellar';$('touch').hidden=!isTouch;canvas.focus();}}
const isEquipped=id=>Object.values(INV.eq).some(e=>Object.values(e).includes(id));
function renderForge(){$('fgFrag').textContent=FRAG.n;renderBulk();
  const list=INV.items.slice().sort((a,b)=>(b.w||b.g).rarity-(a.w||a.g).rarity);
  $('fgList').innerHTML=list.length?list.map(it=>{const o=it.w||it.g,R=RARITY[o.rarity],eq=isEquipped(it.id);
    return `<button class="fg-it${fgSel===it.id?' sel':''}" data-id="${it.id}" style="--rc:${R.css}"><b>${esc(o.name)}</b><small>${R.name}${eq?' · indossato':''}${o.set?' · set':''}</small></button>`;}).join(''):'<p class="note">L\'armadio è vuoto.</p>';
  const it=fgSel&&INV.items.find(i=>i.id===fgSel),box=$('fgDetail');
  if(!it){box.innerHTML='<p class="note">Scegli un oggetto: puoi smontarlo per avere frammenti o spenderli per alzarne la rarità.</p>';return;}
  const o=it.w||it.g,R=RARITY[o.rarity],eq=isEquipped(it.id),up=o.rarity<MAX_R?UPC[o.rarity]:null,needF=up?RARITY_FROM[o.rarity+1]:0,locked=!!up&&forgeBest()<needF;
  box.innerHTML=`<b class="n" style="color:${R.css}">${esc(o.name)}</b><span>${R.name}</span>
    <div class="row"><button class="ghost" id="fgDis" ${eq?'disabled':''}>Smonta · +${DISM[o.rarity]} frammenti</button>
    ${up?`<button class="big" id="fgUp" ${FRAG.n<up||locked?'disabled':''}>${locked?`${RARITY[o.rarity+1].name}: arriva al piano ${needF}`:`Migliora a ${RARITY[o.rarity+1].name} · ${up} frammenti`}</button>`:'<span class="note">Rarità massima</span>'}</div>${eq?'<p class="note">Togli l\'oggetto dall\'armadio per smontarlo.</p>':''}`;
  const d=$('fgDis');if(d)d.onclick=()=>{FRAG.n+=DISM[o.rarity];saveFrag();INV.items=INV.items.filter(i=>i.id!==it.id);saveInv();fgSel=null;sfx('slam');burst(FORGE_X,1,0xff7a2e,20,5,2);renderForge();};
  const u=$('fgUp');if(u)u.onclick=()=>{if(FRAG.n<up||locked)return;FRAG.n-=up;saveFrag();upgradeItem(o);saveInv();sfx('lvl');burst(FORGE_X,1.2,RARITY[o.rarity].hex,40,6,3);shake(0.2);renderForge();if(eq){applyLoadout();}};}

// smontare tutti insieme gli oggetti di una rarità: si conferma con una seconda pressione; indossati e pezzi di set restano
let fgArm=null;
const bulkOf=r=>INV.items.filter(it=>{const o=it.w||it.g;return o.rarity===r&&!isEquipped(it.id)&&!o.set;});
const bulkEq=r=>INV.items.filter(it=>{const o=it.w||it.g;return o.rarity===r&&isEquipped(it.id)&&!o.set;});
function bulkDo(r,withEq){fgArm=null;const list=bulkOf(r).concat(withEq?bulkEq(r):[]);if(!list.length){renderForge();return;}const ids=new Set(list.map(i=>i.id)),gain=list.length*DISM[r];FRAG.n+=gain;saveFrag();INV.items=INV.items.filter(i=>!ids.has(i.id));
  if(withEq)for(const k in INV.eq)for(const q in INV.eq[k])if(ids.has(INV.eq[k][q]))delete INV.eq[k][q];saveInv();if(ids.has(fgSel))fgSel=null;
  sfx('slam');burst(FORGE_X,1,RARITY[r].hex,26+Math.min(30,list.length*2),6,3);shake(0.18);toast(`Smontati ${list.length} oggetti`,`+${gain} frammenti`);renderForge();if(withEq)applyLoadout();}
function renderBulk(){const box=$('fgBulk');if(!box)return;let html='';
  for(let r=0;r<RARITY.length;r++){const n=bulkOf(r).length,ne=bulkEq(r).length;if(!n&&!ne)continue;const R=RARITY[r],gain=n*DISM[r];html+=`<button class="fg-b${fgArm===r?' arm':''}" data-r="${r}" style="--rc:${R.css}"><b>${fgArm===r?'Confermi?':R.name+' × '+(n+ne)}</b><small>${fgArm===r?'Smonti '+n+' oggetti':'Smonta tutti'} · +${gain}${ne?' · '+ne+' indossati':''}</small></button>`;}
  box.innerHTML=html?`<p class="note">Smonta per rarità (ogni oggetto vale ${DISM.map((v,i)=>v+' se '+RARITY[i].name.toLowerCase()).join(', ')}). Se ne hai di indossati ti chiede cosa farne. I pezzi di set non vengono toccati.</p><div class="fg-brow">${html}</div>`:'';}
$('fgBulk').addEventListener('click',e=>{const b=e.target.closest('.fg-b');if(!b)return;const r=+b.dataset.r;
  if(fgArm!==r){fgArm=r;sfx('ui');renderBulk();return;}
  const eq=bulkEq(r);if(!eq.length){bulkDo(r,false);return;}
  const st=G.state,R=RARITY[r],gn=eq.length*DISM[r];G.state='ask';askOpen({ey:'Smontaggio',t:eq.length===1?'Hai un oggetto indossato':`Hai ${eq.length} oggetti indossati`,d:`${eq.length===1?'È':'Sono'} di rarità ${R.name}. Vuoi smontare anche ${eq.length===1?'quello':'quelli'} (+${gn} frammenti) o ${eq.length===1?'conservarlo':'conservarli'}?`,yes:eq.length===1?'Smonta anche quello':'Smonta anche quelli',no:eq.length===1?'Conservalo':'Conservali',
    onYes(){G.state=st;bulkDo(r,true);},onNo(){G.state=st;bulkDo(r,false);}});});
function upgradeItem(o){const r0=o.rarity,r1=r0+1,k=RARITY[r1].mul/RARITY[r0].mul;o.rarity=r1;
  if(o.slot){for(const key in o)if(typeof o[key]==='number'&&key!=='rarity')o[key]=key==='hp'?Math.round(o[key]*k):+(o[key]*k).toFixed(3);const nm=GEAR[o.slot].names[r1];o.name=nm+(o.set?' '+SETS[o.set].n:'');}
  else{if(typeof o.dmg==='number')o.dmg=Math.round(o.dmg*k);const m=WMODELS[o.type]&&WMODELS[o.type][o.v||0];if(m&&m.n)o.name=`${m.n} ${pick(RSUF[r1])}`;}}
$('fgList').addEventListener('click',e=>{const b=e.target.closest('.fg-it');if(!b)return;fgSel=b.dataset.id;sfx('ui');renderForge();});
$('fgClose').onclick=()=>{sfx('ui');closeForge();};

/* ---------- bacheca: trofei, skin, bestiario, classifica ---------- */
let bdTab='tro',lbMode='solo';
function openBoard(tab){if(G.state!=='cellar')return;G.state='board';clearInput();['prompt','bUse','touch'].forEach(id=>$(id).hidden=true);bdTab=tab||'tro';renderBoard();$('board').hidden=false;}
function closeBoard(){$('board').hidden=true;if(G.state==='board'){G.state='cellar';$('touch').hidden=!isTouch;canvas.focus();}}
function renderBoard(){for(const b of document.querySelectorAll('#board .tab'))b.setAttribute('aria-selected',b.dataset.tab===bdTab);const box=$('bdBody');
  if(bdTab==='tro'){const c=G.cls,sk=SKINS[c.id]||[],cur=skinOf(c.id);
    const skins=sk.map((s,i)=>{const ok=skinUnlocked(c.id,i);return `<button class="sk${i===cur?' on':''}${ok?'':' lock'}" data-sk="${i}" ${ok?'':'disabled'}><b>${esc(s.name||('Skin '+(i+1)))}</b><small>${ok?(i===cur?'Indossata':'Indossa'):i===altSkins(c.id)[0]?'Piano 15 con questa classe':'4 guardiani con questa classe'}</small></button>`;}).join('');
    const tl=trophyList(),done=tl.filter(t=>t.ok).length;
    box.innerHTML=`<div class="bd-h">Aspetto di ${esc(c.name)}</div><div class="sk-row">${skins}</div>
      <div class="bd-h">Trofei · ${done} di ${tl.length}</div><div class="tro-list">${tl.filter(t=>!t.cls||t.cls===c.id).concat(tl.filter(t=>t.cls&&t.cls!==c.id)).map(t=>`<div class="tro${t.ok?' ok':''}"><b>${t.ok?'🏆':'🔒'} ${esc(t.n)}</b><span>${esc(t.d)}</span><small>${esc(t.r)}</small><i style="--p:${Math.round(t.p*100)}%"></i></div>`).join('')}</div>`;}
  else if(bdTab==='best'){const bc=bestiaryCount();
    box.innerHTML=`<div class="bd-h">Bestiario · ${bc.seen} di ${bc.tot}</div><div class="best-list">${bestKeys().map(k=>{const b=BEST[k],boss=k.startsWith('boss:');const name=boss?BOSSARCH[k.slice(5)]:(TYPE_NAMES[k]||cap(k));
      return b&&b.s?`<div class="best${boss?' boss':''}"><b>${esc(name)}</b><span>Sconfitti: ${b.k||0}</span><p>${esc(BEST_TIPS[k]||'')}</p></div>`:`<div class="best unk"><b>???</b><span>Non ancora incontrato</span></div>`;}).join('')}</div>`;}
  else{box.innerHTML=`<div class="lb-tabs">${['solo','coop','orda','pvp'].map(m=>`<button class="mini${m===lbMode?' on':''}" data-lb="${m}">${{solo:'Da solo',coop:'Co-op',orda:'Orda',pvp:'PvP'}[m]}</button>`).join('')}</div><div id="lbList"></div>`;loadBoard(lbMode);}}
$('board').addEventListener('click',e=>{const t=e.target.closest('.tab');if(t){bdTab=t.dataset.tab;sfx('ui');renderBoard();return;}
  const s=e.target.closest('.sk');if(s&&!s.disabled){SKINSEL[G.cls.id]=+s.dataset.sk;store.set('skinsel',SKINSEL);setHero(G.cls);sfx('equip');renderBoard();return;}
  const l=e.target.closest('[data-lb]');if(l){lbMode=l.dataset.lb;sfx('ui');renderBoard();}});
$('bdClose').onclick=()=>{sfx('ui');closeBoard();};
addEventListener('keydown',e=>{if(e.key==='Escape'){if(G.state==='forge'){e.preventDefault();closeForge();}else if(G.state==='board'){e.preventDefault();closeBoard();}}},true);
const _padBackF=padBack;padBack=function(){for(const id of ['fgClose','bdClose']){const b=$(id);if(b&&b.offsetParent!==null&&!b.closest('[hidden]')){b.click();return true;}}return _padBackF();};

/* ---------- Orda dalla scala ---------- */
$('caHorde').onclick=()=>{sfx('ui');$('climbAsk').hidden=true;G.hordeNext=true;G.state='menu';fadeThen(()=>{startRun();G.fadeTarget=0;});};
const _ocaF=openClimbAsk;
openClimbAsk=function(){_ocaF();$('caHorde').hidden=MP.live()&&!MP.host;};
{const st=INTER.find(i=>i.id==='stairs');if(st)st.act=()=>openClimbAsk();}
setTimeout(troCheck,0);
if(/coop-debug/.test(location.hash))window.__F={pvpBegin,PV,killEnemy:e=>killEnemy(e),startCine,updCine,openForge,openBoard,openClimbAsk,openOnline,openCoop,G,P,trophyList,INV,makeGear,makeWeapon,invAdd,enterCellar,startRun,MP};

/* ---------- filmato iniziale: colpi che arrivano a segno e capitano che attacca ---------- */
cineMonUpd=function(e,dt){const m=e.cm;if(e.dead)return;e.flash=(e.flash||0)-dt;e.flinch=(e.flinch||0)-dt;
  // il capitano salta per colpire: in volo carica il colpo e atterra in piedi colpendo, invece di scivolare e cadere
  if(m.boss&&m.mode==='fly'&&!m.noslide){m.noslide=1;m.jumping=1;}
  if(m.mode==='fly'){e.vy-=30*dt;e.y+=e.vy*dt;e.x+=m.fvx*dt;
    if(m.jumping){e.state='wind';e.warn=1;}
    if(e.y<=0){e.y=0;e.onGround=true;burst(e.x,0.2,0xb9ad98,12,4,2);
      if(m.noslide){m.fvx=0;m.mode=m.after||'walk';m.tx=e.x;if(m.jumping){m.jumping=0;m.strikeT=0.55;e.warn=0;e.state='strike';}}
      else if(m.fvx&&Math.abs(m.fvx)>2){m.mode='slide';}else{m.mode=m.after||'walk';}}}
  else if(m.mode==='slide'){m.fvx*=Math.pow(0.02,dt);e.x+=m.fvx*dt;m.down=Math.min(1,m.down+dt*4);if(Math.abs(m.fvx)<0.3)m.mode='down';}
  else if(m.mode==='down'){m.down=Math.min(1,m.down+dt*4);}
  else if(m.mode==='walk'||m.mode==='exit'){const d=m.tx-e.x;e.vx=Math.abs(d)>0.1?Math.sign(d)*Math.min(m.spd,Math.abs(d)*6):0;e.x+=e.vx*dt;
    if(e.vx)e.face=Math.sign(e.vx);else if(m.look!=null)e.face=Math.sign(m.look-e.x)||e.face;
    if(m.strikeT>0){m.strikeT-=dt;e.state='strike';}else e.state=m.wind?'wind':'move';}
  if(m.mode!=='walk'&&m.mode!=='exit')e.vx=0;};
cineDuel=function(h,dt){const C=G.cine;if(h.special)return;
  let e=h.tgt;
  if(!e||e.dead||!(e.cm.mode==='walk')){if(h.ds==='c1'||h.ds==='c2'){heroAct(h,'guard');h.h1=h.h2=0;}h.tgt=e=h.q.find(m=>!m.dead&&m.cm.mode==='walk');h.ds='engage';h.dt=0;}
  h.q.filter(m=>!m.dead&&m.cm.mode==='walk'&&m!==e).forEach((m,k)=>{const s=Math.sign(m.x-h.x)||m.cm.side||1;m.cm.tx=h.x+s*(3.4+k*1.3);m.cm.look=h.x;});
  if(!e){if(h.act!=='guard'&&h.act!=='front')heroAct(h,'guard');return;}
  const side=Math.sign(e.x-h.x)||e.cm.side||1;h.face=side;e.cm.look=h.x;h.dt+=dt;
  const combo=h.ds==='c1'||h.ds==='c2';
  if(combo){e.cm.tx=e.x;const want=e.x-side*1.25;h.x+=(want-h.x)*Math.min(1,dt*14);}   // l'eroe si avvicina: ogni colpo arriva sul nemico
  else e.cm.tx=h.x+side*1.45;
  if(h.ds==='engage'){if(h.act!=='guard')heroAct(h,'guard');if(Math.abs(e.x-e.cm.tx)<0.12){h.ds='wind';h.dt=0;e.cm.wind=1;e.warn=0.6;}}
  else if(h.ds==='wind'&&h.dt>0.32){h.ds='def';h.dt=0;e.cm.wind=0;e.warn=0;
    if(h.id==='cavaliere'){heroAct(h,'block');burst(h.x+side*0.7,1.4,0xfff2b0,16,6,1);popNum(h.x+side*0.7,2.6,'CLANG!','crit');sfx('block');}
    else{heroAct(h,'dodge');h.vx=-side*3;sfx('dash');spawnGhost(HCOL[h.id]);}}
  else if(h.ds==='def'&&h.dt>0.24){h.ds='c1';h.dt=0;h.vx=0;heroAct(h,'swing');}
  else if(h.ds==='c1'){if(!h.h1&&h.dt>0.13){h.h1=1;cineKnock(e,side,0.3);}if(h.dt>0.3){h.h1=0;h.ds='c2';h.dt=0;heroAct(h,'heavy');}}
  else if(h.ds==='c2'){if(!h.h2&&h.dt>0.17){h.h2=1;cineKnock(e,side,1);fxSlash(e.x,1.2,0,HCOL[h.id],1.2,Math.PI/2,side*0.4,0.25);}if(h.dt>0.42){h.h2=0;h.ds='engage';h.tgt=null;h.dt=0;}}};

