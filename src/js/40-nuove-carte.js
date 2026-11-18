
/* =========================================================
   17 NUOVI POTENZIAMENTI (si prendono come gli altri, al salire di livello)
   Colosso · Collera · Colpo d'apertura · Barriera · Contraccolpo · Colpo stordente · Lama ardente
   Eco della lama · Pioggia di meteore · Ultimo respiro · Saggezza · Raccogli-anime · Slancio
   Aura di fuoco · Lame rotanti · Cuore di ghiaccio · Colpo dall'alto
   I livelli si leggono da G.lv (0 = non preso); i colpi delle carte hanno card:true.
   ========================================================= */
UPG.push(
  {id:'colosso', name:"Colosso",            icon:'heart', max:2, desc:()=>"+60 vita massima e ne recuperi 60, ma ti muovi il 5% più piano", apply(){S.maxHp+=60;P.hp=Math.min(S.maxHp,P.hp+60);S.speed*=0.95;}},
  {id:'collera', name:"Collera",            icon:'fire',  max:2, desc:()=>nxLv('collera')>1?"Sotto metà vita fai il 45% di danno in più":"Sotto metà vita fai il 25% di danno in più", apply(){}},
  {id:'apertura',name:"Colpo d'apertura",   icon:'sword', max:2, desc:()=>nxLv('apertura')>1?"Il primo colpo su un nemico illeso fa il doppio del danno":"Il primo colpo su un nemico illeso fa il 60% di danno in più", apply(){}},
  {id:'barriera',name:"Barriera",           icon:'shield',max:2, desc:()=>nxLv('barriera')>1?"La barriera torna ogni 8 secondi":"Ogni 12 secondi una barriera blocca del tutto il colpo successivo", apply(){}},
  {id:'contrac', name:"Contraccolpo",       icon:'wave',  max:2, desc:()=>nxLv('contrac')>1?"I nemici colpiti volano ancora più lontano":"I nemici colpiti vengono respinti il 50% più lontano", apply(){}},
  {id:'stordente',name:"Colpo stordente",   icon:'hammer',max:2, desc:()=>nxLv('stordente')>1?"15% di probabilità di stordire per quasi un secondo":"8% di probabilità di stordire il nemico colpito", apply(){}},
  {id:'ardente', name:"Lama ardente",       icon:'fire',  max:2, desc:()=>nxLv('ardente')>1?"Il 30% dei colpi incendia i nemici":"Il 15% dei colpi incendia i nemici", apply(){}},
  {id:'ecolama', name:"Eco della lama",     icon:'wave',  max:2, desc:()=>nxLv('ecolama')>1?"L'onda parte ogni 4 colpi ed è più lunga":"Ogni 6 colpi un'onda d'urto ferisce i nemici davanti a te", apply(){}},
  {id:'meteore', name:"Pioggia di meteore", icon:'meteor',max:2, desc:()=>nxLv('meteore')>1?"Le meteore cadono ogni 5 secondi e sono più grandi":"Ogni 8 secondi una meteora cade sul nemico più vicino", apply(){}},
  {id:'respiro', name:"Ultimo respiro",     icon:'plus',  max:1, desc:()=>"Una volta per piano, quando scendi sotto un quarto di vita ti curi del 35%", apply(){}},
  {id:'saggezza',name:"Saggezza",           icon:'sun',   max:3, desc:()=>"+15% esperienza da tutto quello che raccogli", apply(){}},
  {id:'anime',   name:"Raccogli-anime",     icon:'ghost', max:2, desc:()=>nxLv('anime')>1?"Ogni nemico che uccidi ti cura di 6 vita":"Ogni nemico che uccidi ti cura di 3 vita", apply(){}},
  {id:'slancio', name:"Slancio",            icon:'charge',max:2, desc:()=>nxLv('slancio')>1?"Dopo una schivata fai il 50% di danno in più per 2 secondi":"Dopo una schivata fai il 30% di danno in più per 1,5 secondi", apply(){}},
  {id:'aura',    name:"Aura di fuoco",      icon:'sun',   max:2, desc:()=>nxLv('aura')>1?"L'aura è più larga e brucia di più":"I nemici vicini a te bruciano ogni secondo", apply(){}},
  {id:'lame',    name:"Lame rotanti",       icon:'orbit', max:2, desc:()=>nxLv('lame')>1?"Tre lame più grandi ti girano intorno":"Due lame ti girano intorno e feriscono chi toccano", apply(){}},
  {id:'ghiaccio',name:"Cuore di ghiaccio",  icon:'snow',  max:2, desc:()=>nxLv('ghiaccio')>1?"Il gelo arriva più lontano e torna più spesso":"Quando ti colpiscono congeli i nemici intorno a te", apply(){}},
  {id:'dallalto',name:"Colpo dall'alto",    icon:'leap',  max:2, desc:()=>nxLv('dallalto')>1?"In aria fai il 70% di danno in più":"In aria fai il 40% di danno in più", apply(){}}
);

/* ---------- dentro il colpo: danno extra, respinta, stordimento, fuoco, onda ---------- */
const _hitNC=hitEnemy;
hitEnemy=function(e,base,dir,o){o=o||{};
  if(!e||!cardOn()||e.pvp!=null||o.env||!(base>0))return _hitNC(e,base,dir,o);
  let m=1;
  const lc=lvC('collera');if(lc&&P.hp<S.maxHp*0.5)m*=lc>1?1.45:1.25;
  const la=lvC('apertura');if(la&&!o.card&&e.maxHp>0&&e.hp>=e.maxHp*0.999){m*=la>1?2:1.6;popNum(e.x,e.y+e.h+0.6,'Apertura!','crit');}
  const lsl=lvC('slancio');if(lsl&&!o.card&&(G.slancioT||0)>G.time)m*=lsl>1?1.5:1.3;
  const lh=lvC('dallalto');if(lh&&o.melee&&!P.onGround)m*=lh>1?1.7:1.4;
  if(m!==1)base*=m;
  if(!o.card){o=Object.assign({},o);
    const lk=lvC('contrac');if(lk)o.kb=(o.kb||6)*(lk>1?1.9:1.5);
    const lst=lvC('stordente');if(lst&&Math.random()<(lst>1?0.15:0.08)){o.stun=Math.max(o.stun||0,lst>1?0.9:0.6);popNum(e.x,e.y+e.h+0.5,'Stordito!','xp');}
    const lr=lvC('ardente');if(lr&&!o.effect&&Math.random()<(lr>1?0.3:0.15))o.effect='fuoco';}
  const r=_hitNC(e,base,dir,o);
  const le=lvC('ecolama');
  if(le&&o.melee&&!o.card){G.ecoLN=(G.ecoLN||0)+1;if(G.ecoLN>=(le>1?4:6)){G.ecoLN=0;const d=P.face||dir||1,len=le>1?6:4.5,x0=P.x,y=P.y+1;
      fxSlash(x0+d*len*0.5,y,0,0xb48cff,len*0.55,0,0,0.3);burst(x0+d*len,y,0xb48cff,12,5,1,0.2);sfx('swing');
      for(const t of foes())if((t.x-x0)*d>0&&Math.abs(t.x-x0)<len+t.w/2&&Math.abs((t.y+t.h/2)-y)<2)cardHit(t,0.8,d,{kb:5});}}
  return r;};

/* ---------- quando ti colpiscono: barriera, ultimo respiro, cuore di ghiaccio ---------- */
const _hpNC=hurtPlayer;
hurtPlayer=function(d,fx,eff){if(MP.redir>=0||!cardOn()||P.dead||!(d>0))return _hpNC(d,fx,eff);
  const lb=lvC('barriera');
  if(lb&&!(P.invul>0)&&(G.barT||0)<=G.time){G.barT=G.time+(lb>1?8:12);
    fxRing(P.x,P.y+1,0,0x7ff0e4,1.6,0.4,true);burst(P.x,P.y+1,0x7ff0e4,18,5,1,0.2);popNum(P.x,P.y+2.6,'Barriera!','xp');sfx('ui');P.invul=Math.max(P.invul||0,0.35);return;}
  const h0=P.hp,r=_hpNC(d,fx,eff);
  if(!P.dead&&P.hp<h0){
    if(lvC('respiro')&&G.respiroFl!==G.floor&&P.hp<S.maxHp*0.25){G.respiroFl=G.floor;heal(Math.round(S.maxHp*0.35));fxRing(P.x,P.y+1,0,0x7fe08a,2.2,0.5,true);popNum(P.x,P.y+2.8,'Ultimo respiro!','xp');}
    const lg=lvC('ghiaccio');if(lg&&(G.ghiT||0)<=G.time){G.ghiT=G.time+(lg>1?2.5:4);const R=lg>1?3.6:2.6;
      fxRing(P.x,P.y+1,0,0x8fdcff,R,0.4,true);burst(P.x,P.y+1,0xbfeaff,14,5,1,0.2);
      for(const t of foesNear(P.x,P.y+1,R,null))cardHit(t,0.1,t.x>=P.x?1:-1,{effect:'gelo',kb:2});}}
  return r;};

/* ---------- esperienza e uccisioni ---------- */
const _gxNC=gainXP;
gainXP=function(v){const ls=lvC('saggezza');if(ls&&cardOn()&&typeof v==='number')arguments[0]=v*(1+0.15*ls);return _gxNC.apply(this,arguments);};
function onMyKillNC(){const la=lvC('anime');if(la&&!P.dead)heal(la>1?6:3,true);}
const _keNC=killEnemy;
killEnemy=function(e){const was=e.dead;const r=_keNC(e);
  if(!was&&e.dead&&!e.escaped&&!e.net&&e.pvp==null&&cardOn()&&(!MP.live()||(MP.host&&(e.lastBy==null||e.lastBy===MP.myPid))))onMyKillNC();
  return r;};
const _mmNC=mpMsg;
mpMsg=function(m,from){const r=_mmNC(m,from);if(m&&m.t==='xp'&&!MP.host&&G.scene==='tower'&&m.f===G.floor)onMyKillNC();return r;};

/* ---------- ogni fotogramma nella torre: slancio, meteore, aura, lame ---------- */
const BLADES={g:null,list:[],hit:new WeakMap()};
function bladesBuild(){const g=new THREE.Group(),mt=new THREE.MeshBasicMaterial({color:0xdff6ff}),gl=new THREE.MeshBasicMaterial({color:0x7fd8ff,transparent:true,opacity:0.4,depthWrite:false,blending:THREE.AdditiveBlending});
  for(let i=0;i<3;i++){const b=new THREE.Group();const s=new THREE.Mesh(new THREE.BoxGeometry(0.62,0.12,0.05),mt);const h=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.24,0.04),gl);b.add(s,h);g.add(b);BLADES.list.push(b);}
  scene.add(g);return g;}
function ncTick(dt){if(!cardOn()||G.state!=='play'||P.dead)return;
  // slancio: si accende durante la schivata
  if(lvC('slancio')&&P.dashT>0)G.slancioT=G.time+(lvC('slancio')>1?2:1.5);
  // meteore
  const lm=lvC('meteore');if(lm){G.metT=(G.metT==null?2:G.metT)-dt;if(G.metT<=0){const t=foes().filter(e=>Math.abs(e.x-P.x)<14).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0];
      if(t){G.metT=lm>1?5:8;const x=t.x,R=lm>1?2.6:1.9;fxRing(x,0.1,0,0xff7a2e,R,0.6,false);
        setTimeout(()=>{if(!cardOn())return;burst(x,0.5,0xff7a2e,26,8,4,0.3);burst(x,0.5,0xffd27a,12,6,3,0.2);fxRing(x,0.5,0,0xff7a2e,R,0.35,true);sfx('boom');shake(0.18);
          for(const f of foesNear(x,0.8,R,null))cardHit(f,lm>1?1.6:1.2,f.x>=x?1:-1,{kb:6,ky:5,effect:'fuoco'});},450);}
      else G.metT=0.5;}}
  // aura di fuoco
  const lu=lvC('aura');if(lu){G.auraT=(G.auraT||0)-dt;if(G.auraT<=0){G.auraT=1;const R=lu>1?2.8:2.1;fxRing(P.x,0.08,0,0xff7a2e,R,0.5,false);
      for(const f of foesNear(P.x,P.y+1,R,null))cardHit(f,lu>1?0.22:0.14,f.x>=P.x?1:-1,{kb:0.5,effect:'fuoco'});}}
  // lame rotanti
  const ll=lvC('lame');
  if(ll){if(!BLADES.g)BLADES.g=bladesBuild();BLADES.g.visible=true;const n=ll>1?3:2,R=ll>1?1.9:1.6,sc=ll>1?1.25:1,now=G.time;
    BLADES.list.forEach((b,i)=>{b.visible=i<n;if(i>=n)return;const a=now*4+i*Math.PI*2/n,x=P.x+Math.cos(a)*R,y=P.y+1+Math.sin(a)*R*0.8;b.position.set(x,y,0.4);b.rotation.z=a+Math.PI/2;b.scale.setScalar(sc);
      for(const f of foes()){if(Math.abs(f.x-x)>0.5+f.w/2||Math.abs((f.y+f.h/2)-y)>0.4+f.h/2)continue;let hh=BLADES.hit.get(f);if(!hh){hh=[0,0,0];BLADES.hit.set(f,hh);}if(hh[i]>now)continue;hh[i]=now+0.5;
        cardHit(f,ll>1?0.45:0.3,f.x>=P.x?1:-1,{kb:3});burst(x,y,0xdff6ff,5,3,0,0.1);}});}
  else if(BLADES.g)BLADES.g.visible=false;}
const _ufNC=updFloor;updFloor=function(dt){_ufNC(dt);try{ncTick(dt);}catch(err){console.warn('nuove carte',err);}};
setInterval(()=>{if(BLADES.g&&(G.scene!=='tower'||!lvC('lame')||P.dead||G.state!=='play'))BLADES.g.visible=false;},300);
