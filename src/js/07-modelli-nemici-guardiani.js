// ===== NEMICI: 3 versioni per ognuno dei 10 nemici normali =====
// Ogni versione restituisce lo stesso oggetto dei modelli del gioco (enemyShell + rig/blob/ali/veste/sfera...), così le animazioni restano quelle.
function hum(o,barY){const s=enemyShell(barY),R=buildBody(o);s.body.add(R.root);s.rig=R;s.mats.push(...R.mats);return {s,R,K:R.K};}
// scheletro: corpo d'osso sottile, costole, orbite scure con occhi accesi
function skeleton(R,K,bone,eyeC,o){o=o||{};R.face.visible=false;const dk=K.dark,eye=K.g(eyeC,2);
  for(const s of [-1,1]){M(R.head,G3.ell(0.05,0.045,0.03),dk,[s*0.064,0.03,0.165],{r:[0,0,-s*0.2],ol:0});M(R.head,G3.ell(0.018,0.018,0.01),eye,[s*0.064,0.03,0.185],{ol:0});}
  M(R.head,G3.ell(0.02,0.028,0.015),dk,[0,-0.035,0.18],{ol:0});
  for(let i=0;i<6;i++)M(R.head,G3.rb(0.014,0.026,0.012,0.004),bone,[(i-2.5)*0.018,-0.1,0.168-Math.abs(i-2.5)*0.006],{ol:0.004});
  if(!o.noRibs){for(let i=0;i<4;i++)SP.chestArc(R,bone,0.56-i*0.075,0.15-i*0.01,0.015,0.016);M(SP.onChest(R,0.44,0,0.02),G3.rb(0.035,0.3,0.02,0.01),bone,[0,0,0]);}
  return eye;}
function staffIn(R,K,wood,len){const st=new THREE.Group();R.arms[0].wr.add(st);M(st,G3.limb(0.034,0.038,len||2.0),wood,[0,0.55,0]);return st;}
function robeOn(R,m,o){o=o||{};const rp=[[0.001,-0.88],[o.r||0.48,-0.88],[(o.r||0.48)-0.02,-0.8],[0.34,-0.3],[0.22,0.25],[0.17,0.5],[0.001,0.52]];
  const g=G3.lathe(rp,48);if(o.jag){const p=g.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)<-0.85){const a=Math.atan2(p.getZ(i),p.getX(i));p.setY(i,p.getY(i)+Math.abs(Math.sin(a*6))*o.jag);}g.computeVertexNormals();}
  return M(R.pelvis,g,m,[0,0,0]);}
function orbOn(s,st,K,c,y,r){s.orbM=K.g(c,1);s.orb=M(st,G3.ell(r||0.16,r||0.16,r||0.16),s.orbM,[0,y,0],{ol:0});return s.orb;}
function runeCircle(s,c){const rune=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  s.circle=new THREE.Group();s.circle.position.y=0.04;s.root.add(s.circle);
  for(const [r,w] of [[1.0,0.05],[0.75,0.03]]){const c2=new THREE.Mesh(new THREE.RingGeometry(r-w,r,48),rune);c2.rotation.x=-Math.PI/2;s.circle.add(c2);}
  for(let i=0;i<6;i++){const sq=new THREE.Mesh(new THREE.PlaneGeometry(0.16,0.16),rune);sq.rotation.x=-Math.PI/2;sq.position.set(Math.cos(i*1.047)*0.87,0,Math.sin(i*1.047)*0.87);s.circle.add(sq);}
  s.runeM=rune;}
function membrane(s,par,K,wm,boneM,o){o=o||{};const span=o.span||1,ws=s.wings=[];
  const shape=k=>sh=>{sh.moveTo(0,0.1*span);sh.quadraticCurveTo(0.5*k,0.5*span,1.0*k,0.28*span);sh.quadraticCurveTo(0.86*k,0.05*span,0.9*k,-0.16*span);sh.quadraticCurveTo(0.72*k,-0.04*span,0.62*k,-0.26*span);sh.quadraticCurveTo(0.47*k,-0.08*span,0.32*k,-0.22*span);sh.quadraticCurveTo(0.2*k,0,0,-0.08*span);sh.lineTo(0,0.1*span);};
  for(const sd of [-1,1]){const pv=new THREE.Group();pv.position.set(sd*(o.x||0.24),o.y||0.45,o.z||-0.02);par.add(pv);
    M(pv,G3.shape(shape(sd*span),0.012,0.004),wm,[0,0,0],{ol:0.008});
    if(boneM)for(const [x,y] of [[1.0,0.28],[0.9,-0.16],[0.62,-0.26],[0.32,-0.22]])M(pv,G3.tube([[0,0.08,0.01],[sd*x*span*0.55,(y+0.2)*span*0.6,0.01],[sd*x*span,y*span,0.01]],0.018,0.006,14,8),boneM,null,{ol:0.006});
    ws.push(pv);}return ws;}

const ENEMIES={
/* ---------- MELMA ---------- */
slime:[
{name:'Melma gelatinosa',desc:'Gelatina lucida e un po\' trasparente con un nucleo scuro, occhioni e riflesso.',
 make(){const s=enemyShell(1.45),K=kitFor(s),gel=toon(0x86d46a,{emissive:0x1d4a12,emissiveIntensity:0.35,transparent:true,opacity:0.86}),core=toon(0x3a7a2a);s.mats.push(gel,core);
  s.blobG=new THREE.Group();s.body.add(s.blobG);s.blob=M(s.blobG,G3.ell(0.62,0.62,0.62,44,30),gel,[0,0.48,0],{ol:0});s.blob.scale.set(1,0.78,1);
  s.blob.add(new THREE.Mesh(hullGeo(s.blob.geometry,SOT),OUT));
  M(s.blobG,G3.ell(0.2,0.18,0.2),core,[0.05,0.38,-0.05],{ol:0});
  const ew=toon(0xffffff);for(const x of [-0.18,0.18]){M(s.blobG,G3.ell(0.13,0.15,0.1),ew,[x,0.66,0.42]);M(s.blobG,G3.ell(0.065,0.08,0.04),K.dark,[x,0.64,0.51],{ol:0});}
  M(s.blobG,G3.tor(0.09,0.018,Math.PI,24,8),K.dark,[0,0.45,0.55],{r:[0,0,Math.PI],ol:0});
  M(s.blobG,G3.ell(0.12,0.07,0.06),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.7}),[0.24,0.86,0.3],{ol:0});return s;}},
{name:'Melma ingorda',desc:'Gelatina trasparente con dentro quello che ha inghiottito: un osso, monete e l\'elsa di una spada.',
 make(){const s=enemyShell(1.45),K=kitFor(s),gel=toon(0x6ac8a0,{emissive:0x0a3a2a,emissiveIntensity:0.3,transparent:true,opacity:0.62,depthWrite:false});s.mats.push(gel);
  s.blobG=new THREE.Group();s.body.add(s.blobG);s.blob=M(s.blobG,G3.ell(0.62,0.62,0.62,44,30),gel,[0,0.48,0],{ol:0});s.blob.scale.set(1,0.78,1);
  const bone=K.m(0xe6dcc6),gold=K.m(GOLD),steel=K.m(0xb8bec8);
  M(s.blobG,G3.tube([[-0.25,0.3,-0.1],[0,0.36,-0.05],[0.22,0.32,0.02]],0.035,0.035,12,8),bone,null);for(const x of [-0.25,0.22])M(s.blobG,G3.ell(0.05,0.05,0.05),bone,[x,0.31,-0.04]);
  for(let i=0;i<4;i++)M(s.blobG,G3.cyl(0.05,0.05,0.015,20),gold,[-0.15+i*0.09,0.2+i*0.03,0.15-i*0.05],{r:[0.6*i,0.3,0.4]});
  const h=new THREE.Group();h.position.set(0.1,0.55,-0.15);h.rotation.z=0.8;s.blobG.add(h);M(h,G3.limb(0.025,0.028,0.16),K.m(0x3a2620),[0,0,0]);M(h,G3.rb(0.04,0.04,0.22,0.015),gold,[0,-0.09,0]);
  for(const x of [-0.17,0.17]){M(s.blobG,G3.ell(0.1,0.11,0.08),K.m(0xffffff),[x,0.66,0.45]);M(s.blobG,G3.ell(0.05,0.06,0.03),K.dark,[x,0.65,0.52],{ol:0});}return s;}},
{name:'Melma corazzata',desc:'Gelatina scura con un elmo arrugginito incastrato sopra e spuntoni di ferro.',
 make(){const s=enemyShell(1.55),K=kitFor(s),gel=toon(0x5a8a3a,{emissive:0x10300a,emissiveIntensity:0.3}),rust=K.m(0x8e3b2c),iron=K.m(0x6a6e78);s.mats.push(gel);
  s.blobG=new THREE.Group();s.body.add(s.blobG);s.blob=M(s.blobG,G3.ell(0.62,0.62,0.62,44,30),gel,[0,0.48,0]);s.blob.scale.set(1,0.78,1);
  M(s.blobG,G3.dome(0.38,0.5,0.85,1),rust,[0,0.8,0]);M(s.blobG,G3.hring(0.38,0.03,1),iron,[0,0.8,0]);M(s.blobG,G3.rb(0.05,0.2,0.04,0.015),iron,[0,0.86,0.35]);
  for(let i=0;i<7;i++){const a=i/7*TAU;M(s.blobG,G3.cone(0.05,0.18,16),iron,[Math.cos(a)*0.55,0.45,Math.sin(a)*0.55],{r:[Math.sin(a)*Math.PI/2,0,-Math.cos(a)*Math.PI/2]});}
  const eg=K.g(0xffb347,1.6);for(const x of [-0.16,0.16])M(s.blobG,G3.ell(0.06,0.04,0.03),eg,[x,0.63,0.47],{ol:0});return s;}},
],
/* ---------- GUARDIA SCHELETRO ---------- */
guard:[
{name:'Legionario d\'ossa',desc:'Scheletro con elmo arrugginito, scudo tondo con borchia e lancia.',
 make(){const {s,R,K}=hum({skin:0xe8e0cc,shirt:0x2b2620,sleeve:0xe8e0cc,pants:0xe8e0cc,boot:0xe8e0cc,glove:0xe8e0cc,build:0.85},2.55),bone=K.m(0xe8e0cc),rust=K.m(0x8e3b2c),dark=K.m(0x2b2620);
  s.eye=skeleton(R,K,bone,0xff3b1f);SP.helmDome(R,rust,{cover:0.5});M(R.head,G3.hring(0.215,0.016,1.04),dark,[0,0.03,-0.005]);
  SP.belt(R,K.m(0x5a3a22),rust);SP.flap(R,K.m(0x6a2a22),{len:0.16,jag:0.04});
  const sp=new THREE.Group();sp.position.y=0.55;R.arms[0].wr.add(sp);M(sp,G3.limb(0.036,0.04,2.3),K.m(0x5a3a22),[0,-1.0,0]);M(sp,bladeG(s2=>{s2.moveTo(-0.02,0);s2.bezierCurveTo(-0.08,-0.1,-0.06,-0.28,0,-0.42);s2.bezierCurveTo(0.06,-0.28,0.08,-0.1,0.02,0);}),K.m(0xc8ccd4),[0,-2.15,0]);
  const sh=new THREE.Group();sh.position.set(0.09,-0.2,0.05);R.arms[1].el.add(sh);M(sh,G3.cyl(0.36,0.36,0.06,48),rust,[0,0,0],{r:[0,0,Math.PI/2]});M(sh,G3.hring(0.36,0.025,1),dark,[0,0,0],{r:[0,0,Math.PI/2]});M(sh,G3.ell(0.03,0.1,0.1),K.m(0x6a6e78),[0.04,0,0]);return s;}},
{name:'Guardia della cripta',desc:'Cappuccio e tabarro stracciati, scudo a goccia con un teschio e alabarda.',
 make(){const {s,R,K}=hum({skin:0xd8d0bc,shirt:0x2b2620,sleeve:0xd8d0bc,pants:0xd8d0bc,boot:0xd8d0bc,glove:0xd8d0bc,build:0.85},2.55),bone=K.m(0xd8d0bc),cloth=K.ds(0x3a3048),iron=K.m(0x6a6e78);
  s.eye=skeleton(R,K,bone,0x9a6aff);SP.hood(R,cloth,{depth:0.7});SP.flap(R,cloth,{len:0.22,n:2,jag:0.06});SP.backFlap(R,cloth,{len:0.22,n:2});
  const sp=new THREE.Group();sp.position.y=0.55;R.arms[0].wr.add(sp);M(sp,G3.limb(0.036,0.04,2.3),K.m(0x3a2a1a),[0,-1.0,0]);
  M(sp,bladeG(s2=>quad(s2,[[-0.03,0],[-0.22,0.06,-0.22,-0.16],[-0.1,-0.12,-0.03,-0.2],[0,-0.42],[0.03,-0.2],[0.06,-0.08],[0.03,0]])),K.m(0xb8bec8),[0,-2.1,0]);
  const sh=SP.shield(R,cloth,{trim:iron,scale:0.85,emblem:(e,k)=>{M(e,G3.ell(0.07,0.08,0.02),bone,[0,0,0],{ol:0.006});for(const x of [-1,1])M(e,G3.ell(0.018,0.018,0.01),K.dark,[x*0.026,0.01,0.012],{ol:0});}});return s;}},
{name:'Scheletro corazzato',desc:'Cotta di maglia a brandelli, elmo con corna e grande scudo rettangolare.',
 make(){const {s,R,K}=hum({skin:0xe8e0cc,shirt:0x5a5a62,sleeve:0xe8e0cc,pants:0xe8e0cc,boot:0x4a4a52,glove:0xe8e0cc,build:0.88},2.6),bone=K.m(0xe8e0cc),iron=K.m(0x4a4a52),mail=K.m(0x6a6e78);
  s.eye=skeleton(R,K,bone,0xffb347,{noRibs:true});SP.greatHelm(R,iron,{glow:K.g(0xffb347,2)});SP.horns(R,bone,{k:0.8,r:0.045});
  SP.shell(R,mail,0.0,0.66,0.012);SP.skirt(R,mail,{len:0.16,n:1,w:0.26,jag:0.04});SP.pauldron(R,iron,{layers:2,r:0.11});
  const sp=new THREE.Group();sp.position.y=0.55;R.arms[0].wr.add(sp);M(sp,G3.limb(0.036,0.04,2.3),K.m(0x3a2a1a),[0,-1.0,0]);M(sp,G3.cone(0.06,0.4,24),K.m(0xc8ccd4),[0,-2.35,0],{r:[Math.PI,0,0]});
  const sh=new THREE.Group();sh.position.set(0.1,-0.22,0.06);R.arms[1].el.add(sh);M(sh,G3.rb(0.07,0.95,0.6,0.05),iron,[0,0,0]);M(sh,G3.rb(0.08,0.85,0.08,0.03),K.m(0x8e3b2c),[0.01,0,0]);return s;}},
],
/* ---------- STREGONE ---------- */
mage:[
{name:'Stregone viola',desc:'Cappello a punta piegato, barba bianca, veste viola con cintura d\'oro e sfera che pulsa.',
 make(){const {s,R,K}=hum({skin:0xb8c4a0,shirt:0x5b3a8c,sleeve:0x5b3a8c,pants:0x3f2a5e,boot:0x2b1d40,hair:0xe6e2da,eyeGlow:0xd7a8ff},2.85),robe=K.m(0x5b3a8c),dark=K.m(0x2b1d40),white=K.m(0xe6e2da);
  s.robe=robeOn(R,robe);SP.belt(R,K.m(GOLD),null,{t:0.022});SP.beard(R,white,{long:1});SP.hair(R,white,'long',{len:0.12});
  M(R.head,G3.cyl(0.4,0.42,0.03,56),dark,[0,0.16,0]);M(R.head,G3.tube([[0,0.16,0],[0,0.38,-0.02],[0.04,0.52,-0.1],[0.16,0.58,-0.22]],0.19,0.01,28,22,t=>0.19*Math.pow(1-t,1.1)+0.006),dark,null);
  SP.sleeve(R,K.ds(0x5b3a8c));const st=staffIn(R,K,K.m(0x4a3424));orbOn(s,st,K,0xc79bff,1.62,0.17);
  s.orbRing=M(st,G3.tor(0.3,0.02,TAU,40,8),new THREE.MeshBasicMaterial({color:0xb46cff,transparent:true,opacity:0.6}),[0,1.62,0],{ol:0});runeCircle(s,0xb46cff);return s;}},
{name:'Incappucciato dalla maschera',desc:'Cappuccio profondo, maschera d\'oro senza volto, veste a rune e cristallo sul bastone.',
 make(){const {s,R,K}=hum({skin:0x8a7a6a,shirt:0x2a2a5a,sleeve:0x2a2a5a,pants:0x1a1a3a,boot:0x1a1a3a,eyes:false},2.85),robe=K.m(0x2a2a5a),hood=K.ds(0x1a1a3a),gold=K.m(0xd9a640,{emissive:0x5a3a00,emissiveIntensity:0.3}),rune=K.g(0x8fb0ff,1.4);
  s.robe=robeOn(R,robe);SP.hood(R,hood,{depth:0.8});R.face.visible=false;M(R.head,G3.sphP(0.19,Math.PI/2-1.0,2.0,Math.PI*0.2,Math.PI*0.62),gold,[0,0.0,0.01]);
  for(const x of [-1,1])M(R.head,G3.ell(0.035,0.01,0.02),rune,[x*0.065,0.035,0.185],{ol:0});
  for(let i=0;i<5;i++)M(s.robe,G3.rb(0.03,0.08,0.02,0.008),rune,[Math.sin(i*1.26)*0.38,-0.6,Math.cos(i*1.26)*0.38],{r:[0,i*1.26,0],ol:0});
  SP.sleeve(R,K.ds(0x2a2a5a));const st=staffIn(R,K,K.m(0x2a2028));M(st,new THREE.OctahedronGeometry(0.14,0),K.g(0x8fb0ff,1),[0,1.62,0],{ol:0.008});orbOn(s,st,K,0x8fb0ff,1.62,0.09);
  s.orbRing=M(st,G3.tor(0.28,0.016,TAU,40,8),new THREE.MeshBasicMaterial({color:0x8fb0ff,transparent:true,opacity:0.6}),[0,1.62,0],{ol:0});runeCircle(s,0x8fb0ff);return s;}},
{name:'Stregone scheletrico',desc:'Teschio con corona storta, veste stracciata e un teschio acceso in cima al bastone.',
 make(){const {s,R,K}=hum({skin:0xe0d8c4,shirt:0x3a1e4a,sleeve:0x3a1e4a,pants:0xe0d8c4,boot:0xe0d8c4,glove:0xe0d8c4,build:0.85},2.85),bone=K.m(0xe0d8c4),robe=K.m(0x3a1e4a),gold=K.m(GOLD);
  skeleton(R,K,bone,0xd7a8ff,{noRibs:true});s.robe=robeOn(R,robe,{jag:0.1});
  const cr=new THREE.Group();cr.position.set(0.02,0.16,0);cr.rotation.z=-0.2;R.head.add(cr);M(cr,G3.hring(0.17,0.018,1),gold,[0,0,0]);for(let i=0;i<5;i++){const a=(i-2)*0.5;M(cr,G3.cone(0.025,0.1,16),gold,[Math.sin(a)*0.17,0.05,Math.cos(a)*0.17]);}
  SP.capelet(R,K.ds(0x3a1e4a),{len:0.15,r1:0.27});const st=staffIn(R,K,K.m(0x2a2028));M(st,G3.ell(0.12,0.13,0.12),bone,[0,1.5,0]);
  for(const x of [-1,1])M(st,G3.ell(0.03,0.025,0.02),K.dark,[x*0.04,1.52,0.1],{ol:0});orbOn(s,st,K,0xd7a8ff,1.72,0.1);
  s.orbRing=M(st,G3.tor(0.26,0.016,TAU,40,8),new THREE.MeshBasicMaterial({color:0xd7a8ff,transparent:true,opacity:0.6}),[0,1.6,0],{ol:0});runeCircle(s,0xd7a8ff);return s;}},
],
/* ---------- PIPISTRELLO ---------- */
bat:[
{name:'Pipistrello',desc:'Pelo morbido, orecchie grandi, ali di membrana con le dita in vista e piccole zanne.',
 make(){const s=enemyShell(1.15),K=kitFor(s),fur=K.m(0x3d3149),wing=K.ds(0x5a4670),bone=K.m(0x2a2236),muz=K.m(0x6b5a7a);
  M(s.body,G3.ell(0.3,0.33,0.28),fur,[0,0.4,0]);M(s.body,G3.ell(0.17,0.14,0.14),muz,[0,0.33,0.2]);M(s.body,G3.ell(0.035,0.025,0.02),K.dark,[0,0.36,0.33],{ol:0});
  for(const x of [-1,1]){M(s.body,G3.cone(0.09,0.28,24),fur,[x*0.14,0.75,0],{r:[0,0,-x*0.25]});M(s.body,G3.cone(0.05,0.18,20),muz,[x*0.14,0.74,0.03],{r:[0,0,-x*0.25],ol:0});
    M(s.body,G3.ell(0.05,0.05,0.03),K.g(0xff5a3a,1.6),[x*0.1,0.46,0.25],{ol:0});M(s.body,G3.cone(0.018,0.07,10),K.m(0xffffff),[x*0.05,0.25,0.29],{r:[Math.PI,0,0],ol:0});}
  membrane(s,s.body,K,wing,bone);return s;}},
{name:'Pipistrello vampiro',desc:'Ali rosso scuro come un mantello, occhi accesi, zanne lunghe e un ciuffo di pelo bianco.',
 make(){const s=enemyShell(1.15),K=kitFor(s),fur=K.m(0x1e1418),wing=K.ds(0x6a1a22),bone=K.m(0x1a1014),white=K.m(0xe8e0e8);
  M(s.body,G3.ell(0.3,0.34,0.28),fur,[0,0.4,0]);M(s.body,G3.ell(0.2,0.1,0.14),white,[0,0.62,0.06]);M(s.body,G3.ell(0.14,0.12,0.12),K.m(0x3a2a30),[0,0.33,0.2]);
  for(const x of [-1,1]){M(s.body,G3.cone(0.08,0.32,24),fur,[x*0.15,0.78,0],{r:[0,0,-x*0.32]});M(s.body,G3.ell(0.055,0.035,0.02),K.g(0xff2a3a,2),[x*0.1,0.47,0.25],{r:[0,0,-x*0.3],ol:0});
    M(s.body,G3.cone(0.02,0.12,10),white,[x*0.05,0.22,0.27],{r:[Math.PI,0,0],ol:0});}
  membrane(s,s.body,K,wing,bone,{span:1.15});return s;}},
{name:'Pipistrello d\'ossa',desc:'Uno scheletro di pipistrello con ali di fumo viola e occhi che brillano.',
 make(){const s=enemyShell(1.15),K=kitFor(s),bone=K.m(0xe6dcc6),wing=new THREE.MeshBasicMaterial({color:0x9a6aff,transparent:true,opacity:0.45,side:THREE.DoubleSide,depthWrite:false});
  M(s.body,G3.ell(0.22,0.24,0.22),bone,[0,0.42,0]);M(s.body,G3.ell(0.13,0.1,0.13),bone,[0,0.33,0.15]);
  for(let i=0;i<4;i++)M(s.body,G3.tor(0.2-i*0.03,0.015,Math.PI*1.4,24,6),bone,[0,0.38-i*0.07,-0.02],{r:[Math.PI/2,0,Math.PI*0.8]});
  for(const x of [-1,1]){M(s.body,G3.cone(0.06,0.26,20),bone,[x*0.12,0.72,0],{r:[0,0,-x*0.3]});M(s.body,G3.ell(0.05,0.045,0.03),K.dark,[x*0.08,0.45,0.19],{ol:0});M(s.body,G3.ell(0.022,0.022,0.012),K.g(0x9a6aff,2.4),[x*0.08,0.45,0.215],{ol:0});}
  membrane(s,s.body,K,wing,bone);return s;}},
],
/* ---------- ARCIERE SCHELETRO ---------- */
archer:[
{name:'Arciere incappucciato',desc:'Scheletro con cappuccio verde, faretra sulla schiena, arco corto e occhi verdi.',
 make(){const {s,R,K}=hum({skin:0xd8d0bc,shirt:0x2b2620,sleeve:0xd8d0bc,pants:0xd8d0bc,boot:0x3a2a1a,glove:0xd8d0bc,build:0.85},2.55),bone=K.m(0xd8d0bc),hood=K.ds(0x3c4a2e),wood=K.m(0x6a4424);
  skeleton(R,K,bone,0x7fe08a);SP.hood(R,hood,{depth:0.66});SP.quiver(R,wood,{shaft:K.m(0xd9d2c0),fl:K.m(0x9a2a2a)});SP.flap(R,hood,{len:0.16,jag:0.05});
  const b=buildWeapon2('arco',0,0,null);R.arms[0].wr.add(b.g);return s;}},
{name:'Arciere della palude',desc:'Ossa coperte di muschio, cappello di foglie, arco di rami e faretra di corteccia.',
 make(){const {s,R,K}=hum({skin:0xc8c0a0,shirt:0x2a3a22,sleeve:0xc8c0a0,pants:0xc8c0a0,boot:0x3a3a24,glove:0xc8c0a0,build:0.85},2.55),bone=K.m(0xc8c0a0),moss=K.m(0x4f8a3a),moss2=K.m(0x6fae4a),bark=K.m(0x5a3e24);
  skeleton(R,K,bone,0xc8ff5a);for(let i=0;i<9;i++){const a=i/9*TAU;M(R.head,G3.leaf(0.08,0.18,0.01,true),i%2?moss:moss2,[Math.sin(a)*0.17,0.13,Math.cos(a)*0.17],{r:[-0.6,a,0]});}
  for(const a of R.arms)M(a.sh,G3.ell(0.07,0.04,0.07),moss,[0,0.05,0]);SP.quiver(R,bark,{shaft:K.m(0xa88a5a),fl:moss2});SP.belt(R,bark,null);
  const b=buildWeapon2('arco',1,0,null);R.arms[0].wr.add(b.g);return s;}},
{name:'Arciere spettrale',desc:'Ossa azzurre che brillano sotto un cappuccio nero, arco elfico e frecce di luce.',
 make(){const {s,R,K}=hum({skin:0xa8d8f0,shirt:0x101828,sleeve:0xa8d8f0,pants:0xa8d8f0,boot:0x101828,glove:0xa8d8f0,build:0.85},2.55),bone=K.m(0xa8d8f0,{emissive:0x3a7aa0,emissiveIntensity:0.4}),hood=K.ds(0x101828);
  skeleton(R,K,bone,0x7ff0ff);SP.hood(R,hood,{depth:0.78});SP.capelet(R,hood,{len:0.15,r1:0.27});SP.quiver(R,K.m(0x1a2238),{shaft:K.g(0x7ff0ff,1),fl:K.g(0x7ff0ff,1.4)});
  SP.backFlap(R,hood,{len:0.24,n:2,w0:0.24,w1:0.2});const b=buildWeapon2('arco',2,0,null);R.arms[0].wr.add(b.g);return s;}},
],
/* ---------- CAVALIERE NERO ---------- */
knight:[
{name:'Cavaliere nero',desc:'Piastre scure, visiera che brilla d\'arancio, pennacchio rosso e grande scudo.',
 make(){const {s,R,K}=hum({skin:0x5a606c,shirt:0x22252c,sleeve:0x3a3f4a,fore:0x3a3f4a,pants:0x22252c,boot:0x3a3f4a,glove:0x3a3f4a,build:1.08,eyes:false},2.7),steel=K.m(0x4a505c),red=K.m(0x9a2a2a),gold=K.m(0xc89a52);
  SP.greatHelm(R,steel,{glow:K.g(0xffb347,2),rim:gold});M(R.head,G3.tube([[0,0.24,0],[0,0.36,-0.08],[0,0.32,-0.24],[0,0.16,-0.34]],0.055,0.012,24,12),red,null);
  SP.shell(R,steel,0.2,0.68,0.03);SP.shell(R,steel,0.02,0.24,0.026);SP.pauldron(R,steel,{layers:3,r:0.12,trim:gold});SP.bracer(R,steel);SP.greave(R,steel,steel);SP.cuisse(R,steel);
  SP.flap(R,red,{len:0.2});SP.cape(R,K.ds(0x5a1a1a),{len:0.32,n:3});
  const sw=buildWeapon2('spada',1,0,null);R.arms[0].wr.add(sw.g);
  const sh=new THREE.Group();sh.position.set(0.1,-0.22,0.06);R.arms[1].el.add(sh);M(sh,G3.rb(0.08,1.0,0.66,0.07),steel,[0,0,0]);M(sh,G3.rb(0.1,0.12,0.5,0.04),red,[0.02,0.18,0]);M(sh,G3.rb(0.1,0.6,0.12,0.04),red,[0.02,-0.05,0]);return s;}},
{name:'Cavaliere rugginoso',desc:'Armatura arrugginita e ammaccata, mantello strappato e spada spezzata.',
 make(){const {s,R,K}=hum({skin:0x6a5a4a,shirt:0x3a2a20,sleeve:0x7a4a2e,fore:0x7a4a2e,pants:0x3a2a20,boot:0x7a4a2e,glove:0x7a4a2e,build:1.05,eyes:false},2.7),rust=K.m(0x8a4a2a),iron=K.m(0x5a5a5e),cloth=K.ds(0x4a3a2a);
  SP.greatHelm(R,rust,{flat:true,vslit:true,glow:K.g(0xff6a2a,1.6)});SP.shell(R,rust,0.2,0.68,0.03);for(const [x,y] of [[0.08,0.5],[-0.06,0.36],[0.1,0.3]])M(SP.onChest(R,y,x,0.035),G3.ell(0.03,0.02,0.01),iron,[0,0,0],{ol:0});
  SP.pauldron(R,rust,{layers:2,r:0.12});SP.bracer(R,iron);SP.greave(R,rust,iron);SP.cape(R,cloth,{len:0.3,n:3,jag:0.1});SP.skirt(R,K.m(0x5a5a5e),{len:0.14,n:1,w:0.25,jag:0.05});
  const sw=new THREE.Group();R.arms[0].wr.add(sw);M(sw,G3.limb(0.032,0.036,0.2),K.m(0x3a2620),[0,0.02,0]);M(sw,G3.rb(0.06,0.06,0.4,0.02),iron,[0,-0.1,0]);
  M(sw,bladeG(s2=>quad(s2,[[-0.065,0],[-0.06,-0.62],[0.0,-0.55],[0.04,-0.7],[0.065,-0.6],[0.065,0]])),K.m(0x9a9ea8),[0,-0.12,0]);
  const sh=new THREE.Group();sh.position.set(0.1,-0.22,0.06);R.arms[1].el.add(sh);M(sh,G3.cyl(0.36,0.36,0.06,48),rust,[0,0,0],{r:[0,0,Math.PI/2]});return s;}},
{name:'Cavaliere maledetto',desc:'Armatura viola scuro con crepe che brillano, corna sull\'elmo e lama ricurva.',
 make(){const {s,R,K}=hum({skin:0x3a2a4a,shirt:0x1a1420,sleeve:0x2a2034,fore:0x2a2034,pants:0x1a1420,boot:0x2a2034,glove:0x2a2034,build:1.1,eyes:false},2.75),pl=K.m(0x2a2034),glow=K.g(0xb46cff,1.8);
  SP.greatHelm(R,pl,{glow});SP.horns(R,K.m(0x1a1420),{pts:[[0.16,0.1,0],[0.28,0.18,-0.04],[0.34,0.34,-0.1],[0.28,0.48,-0.16]],r:0.05});
  SP.shell(R,pl,0.2,0.68,0.03);for(let i=0;i<3;i++)SP.strap(R,glow,[[-0.12+i*0.1,0.62],[-0.06+i*0.08,0.45],[-0.1+i*0.12,0.3]],{w:0.012,th:0.006,off:0.032});
  SP.pauldron(R,pl,{layers:3,r:0.13,spikes:2,spikeM:pl});SP.bracer(R,pl,{ring:glow});SP.greave(R,pl,pl);SP.cape(R,K.ds(0x2a1a3a),{len:0.33,n:3,jag:0.08});
  const sw=buildWeapon2('katana',2,3,null);R.arms[0].wr.add(sw.g);
  const sh=new THREE.Group();sh.position.set(0.1,-0.22,0.06);R.arms[1].el.add(sh);M(sh,G3.rb(0.07,0.9,0.56,0.06),pl,[0,0,0]);M(sh,G3.ell(0.03,0.12,0.12),glow,[0.04,0.05,0],{ol:0});return s;}},
],
/* ---------- FOLLETTO ESPLOSIVO ---------- */
imp:[
{name:'Folletto di brace',desc:'Corpo tondo rosso con la pancia che arde, cornini, ali da pipistrello e coda a punta.',
 make(){const s=enemyShell(1.35),K=kitFor(s),skin=K.m(0xe0503a),dark=K.m(0x5a1a14),wing=K.ds(0x7a2a20);s.belly=toon(0xffb347,{emissive:0xff7a2e,emissiveIntensity:0.6});s.mats.push(s.belly);
  s.g=new THREE.Group();s.body.add(s.g);M(s.g,G3.ell(0.36,0.37,0.34),skin,[0,0.45,0]);M(s.g,G3.ell(0.22,0.22,0.13),s.belly,[0,0.38,0.24],{ol:0});
  for(const x of [-1,1]){M(s.g,G3.tube([[x*0.13,0.75,0],[x*0.2,0.88,-0.02],[x*0.18,0.98,-0.08]],0.05,0.005,14,10),dark,null);M(s.g,G3.ell(0.06,0.04,0.03),K.g(0xfff27a,2),[x*0.12,0.56,0.31],{ol:0});
    M(s.g,G3.limb(0.06,0.05,0.16),dark,[x*0.14,0.1,0]);M(s.g,G3.limb(0.05,0.04,0.2),skin,[x*0.33,0.4,0.05],{r:[0,0,x*0.5]});}
  M(s.g,G3.tor(0.1,0.02,Math.PI,24,8),K.dark,[0,0.43,0.33],{r:[0,0,Math.PI],ol:0});
  M(s.g,G3.tube([[0,0.3,-0.3],[0,0.2,-0.5],[0,0.35,-0.65]],0.03,0.012,16,8),dark,null);M(s.g,G3.cone(0.05,0.1,4),dark,[0,0.4,-0.68],{r:[-0.6,0,0]});
  membrane(s,s.g,K,wing,dark,{span:0.5,x:0.2,y:0.62,z:-0.15});return s;}},
{name:'Folletto bomba',desc:'Una bomba con le gambe: corpo di ferro con crepe incandescenti e miccia accesa in testa.',
 make(){const s=enemyShell(1.35),K=kitFor(s),iron=K.m(0x3a3a42),dark=K.m(0x1a1a20);s.belly=toon(0xffb347,{emissive:0xff7a2e,emissiveIntensity:0.6});s.mats.push(s.belly);
  s.g=new THREE.Group();s.body.add(s.g);M(s.g,G3.ell(0.38,0.38,0.38),iron,[0,0.45,0]);M(s.g,G3.cyl(0.1,0.12,0.1,24),dark,[0,0.84,0]);
  M(s.g,G3.tube([[0,0.88,0],[0.04,0.98,0.02],[0.1,1.04,0.06]],0.018,0.014,12,8),K.m(0xa88a5a),null,{ol:0.006});const sp=M(s.g,G3.ell(0.05,0.05,0.05),K.g(0xfff27a,2.4),[0.11,1.06,0.07],{ol:0});SP.flicker({tick:s.tick=[]},[sp],18);
  for(const [a,b] of [[0.3,0.6],[-0.5,0.4],[1.8,0.5]])M(s.g,G3.tube([[Math.sin(a)*0.37,b,Math.cos(a)*0.37],[Math.sin(a+0.2)*0.375,b-0.1,Math.cos(a+0.2)*0.375],[Math.sin(a+0.1)*0.37,b-0.2,Math.cos(a+0.1)*0.37]],0.015,0.008,12,6),s.belly,null,{ol:0});
  for(const x of [-1,1]){M(s.g,G3.ell(0.06,0.035,0.03),s.belly,[x*0.12,0.55,0.34],{ol:0});M(s.g,G3.limb(0.06,0.05,0.16),dark,[x*0.15,0.1,0]);}
  M(s.g,G3.rb(0.16,0.03,0.02,0.01),s.belly,[0,0.42,0.37],{ol:0});s.wings=[];for(const x of [-1,1]){const pv=new THREE.Group();pv.position.set(x*0.36,0.5,0);s.g.add(pv);M(pv,G3.limb(0.05,0.04,0.2),iron,[x*0.05,-0.1,0.05],{r:[0,0,x*0.5]});s.wings.push(pv);}return s;}},
{name:'Folletto infernale',desc:'Pelle di roccia lavica con crepe arancioni, fiamme sulla testa e ali di cenere.',
 make(){const s=enemyShell(1.35),K=kitFor(s),rock=K.m(0x2a1a18),wing=K.ds(0x3a2a28);s.belly=toon(0xff7a2e,{emissive:0xff5a1e,emissiveIntensity:0.8});s.mats.push(s.belly);
  s.g=new THREE.Group();s.body.add(s.g);M(s.g,G3.ell(0.35,0.37,0.33),rock,[0,0.45,0]);
  for(let i=0;i<8;i++){const a=i*0.8,y=0.25+(i%4)*0.12;M(s.g,G3.tube([[Math.sin(a)*0.34,y,Math.cos(a)*0.32],[Math.sin(a+0.15)*0.35,y+0.07,Math.cos(a+0.15)*0.33]],0.012,0.012,6,6),s.belly,null,{ol:0});}
  s.tick=[];glowFlames(s,K,s.g,5,[0xff7a2e,0xffc04a],0.72,1.6,0.3);
  for(const x of [-1,1]){M(s.g,G3.ell(0.06,0.04,0.03),K.g(0xfff27a,2),[x*0.12,0.55,0.3],{ol:0});M(s.g,G3.limb(0.06,0.05,0.16),rock,[x*0.14,0.1,0]);}
  M(s.g,G3.tor(0.1,0.02,Math.PI,24,8),s.belly,[0,0.43,0.32],{r:[0,0,Math.PI],ol:0});membrane(s,s.g,K,wing,rock,{span:0.55,x:0.2,y:0.62,z:-0.15});return s;}},
],
/* ---------- SPETTRO ---------- */
wraith:[
{name:'Spettro',desc:'Mantello trasparente azzurro che sfuma in basso, volto scuro con occhi accesi e mani lunghe.',
 make(){const s=enemyShell(2.5),K=kitFor(s),cl=toon(0xbfe6ff,{transparent:true,opacity:0.8,side:THREE.DoubleSide});cl.userData.op=0.8;s.mats.push(cl);s.ghostMats=[cl];s.g=new THREE.Group();s.body.add(s.g);
  const pts=[[0.001,0.18],[0.18,0.3],[0.3,0.12],[0.4,0.32],[0.55,0.25],[0.44,0.8],[0.35,1.3],[0.37,1.7],[0.29,1.95],[0.001,2.02]];s.cloak=M(s.g,G3.lathe(pts,48),cl,[0,0,0],{ol:0});
  M(s.g,G3.ell(0.21,0.24,0.15),new THREE.MeshBasicMaterial({color:0x0a1420}),[0,1.62,0.14],{ol:0});for(const x of [-1,1])M(s.g,G3.ell(0.045,0.03,0.02),new THREE.MeshBasicMaterial({color:0x7ff0ff}),[x*0.08,1.66,0.28],{ol:0});
  s.arms=[];for(const x of [-1,1]){const pv=new THREE.Group();pv.position.set(x*0.32,1.4,0);s.g.add(pv);M(pv,G3.tube([[0,0,0],[x*0.05,-0.3,0.12],[x*0.02,-0.62,0.2]],0.08,0.03,20,12),cl,null,{ol:0});
    for(let i=0;i<3;i++)M(pv,G3.tube([[x*0.02,-0.6,0.2],[x*0.02+(i-1)*0.03,-0.72,0.24]],0.012,0.004,6,6),cl,null,{ol:0});s.arms.push(pv);}return s;}},
{name:'Banshee',desc:'Lunghi capelli bianchi che fluttuano, bocca spalancata che brilla e veste lacera.',
 make(){const s=enemyShell(2.5),K=kitFor(s),cl=toon(0xd8e8f0,{transparent:true,opacity:0.78,side:THREE.DoubleSide}),hair=toon(0xf2f6ff,{transparent:true,opacity:0.9,side:THREE.DoubleSide});cl.userData.op=0.78;hair.userData.op=0.9;s.mats.push(cl,hair);s.ghostMats=[cl,hair];
  s.g=new THREE.Group();s.body.add(s.g);const pts=[[0.001,0.05],[0.3,0.25],[0.5,0.1],[0.45,0.7],[0.3,1.3],[0.26,1.5],[0.001,1.52]];s.cloak=M(s.g,G3.lathe(pts,48),cl,[0,0,0],{ol:0});
  M(s.g,G3.ell(0.17,0.21,0.18),toon(0xe8f0f8),[0,1.68,0.02]);const gl=new THREE.MeshBasicMaterial({color:0x7ff0ff});
  for(const x of [-1,1])M(s.g,G3.ell(0.035,0.045,0.02),new THREE.MeshBasicMaterial({color:0x0a1420}),[x*0.06,1.72,0.17],{ol:0});M(s.g,G3.ell(0.05,0.08,0.03),gl,[0,1.58,0.17],{ol:0});
  for(let i=0;i<9;i++){const a=(i/8-0.5)*2.6;M(s.g,G3.tube([[Math.sin(a)*0.14,1.86,Math.cos(a)*0.06-0.06],[Math.sin(a)*0.26,1.7,-0.12],[Math.sin(a)*0.34,1.2,-0.2],[Math.sin(a)*0.3,0.8,-0.25]],0.04,0.006,24,8),hair,null,{ol:0});}
  s.arms=[];for(const x of [-1,1]){const pv=new THREE.Group();pv.position.set(x*0.28,1.38,0);s.g.add(pv);M(pv,G3.tube([[0,0,0],[x*0.1,-0.3,0.1],[x*0.05,-0.6,0.18]],0.06,0.025,20,10),cl,null,{ol:0});s.arms.push(pv);}return s;}},
{name:'Spettro incatenato',desc:'Mantello grigio azzurro avvolto da catene, una lanterna verde in mano.',
 make(){const s=enemyShell(2.5),K=kitFor(s),cl=toon(0x9ab0c0,{transparent:true,opacity:0.82,side:THREE.DoubleSide}),iron=K.m(0x5a5a62),gl=K.g(0x7fe08a,2);cl.userData.op=0.82;s.mats.push(cl);s.ghostMats=[cl];
  s.g=new THREE.Group();s.body.add(s.g);const pts=[[0.001,0.18],[0.2,0.32],[0.32,0.1],[0.42,0.3],[0.56,0.2],[0.45,0.8],[0.36,1.3],[0.38,1.7],[0.3,1.95],[0.001,2.02]];s.cloak=M(s.g,G3.lathe(pts,48),cl,[0,0,0],{ol:0});
  M(s.g,G3.ell(0.21,0.24,0.15),new THREE.MeshBasicMaterial({color:0x0a1420}),[0,1.62,0.14],{ol:0});for(const x of [-1,1])M(s.g,G3.ell(0.04,0.03,0.02),new THREE.MeshBasicMaterial({color:0x7fe08a}),[x*0.08,1.66,0.28],{ol:0});
  for(const y of [0.9,1.25])SP.chain(s.g,iron,(()=>{const p=[];for(let i=0;i<=16;i++){const a=i/16*TAU;p.push([Math.cos(a)*0.42,y+Math.sin(a*1)*0.08,Math.sin(a)*0.42]);}return p;})(),22,0.03);
  s.arms=[];for(const x of [-1,1]){const pv=new THREE.Group();pv.position.set(x*0.32,1.4,0);s.g.add(pv);M(pv,G3.tube([[0,0,0],[x*0.05,-0.3,0.12],[x*0.02,-0.62,0.2]],0.08,0.03,20,12),cl,null,{ol:0});s.arms.push(pv);
    if(x<0){M(pv,G3.cyl(0.006,0.006,0.16,6),iron,[-0.02,-0.72,0.2],{ol:0});M(pv,G3.cyl(0.07,0.08,0.16,6,false),iron,[-0.02,-0.86,0.2]);M(pv,G3.ell(0.05,0.06,0.05),gl,[-0.02,-0.86,0.2],{ol:0});}}return s;}},
],
/* ---------- BRUTO ---------- */
brute:[
{name:'Orco',desc:'Pelle verde, zanne, perizoma di pelle, spalliera d\'osso e clava chiodata.',
 make(){const {s,R,K}=hum({skin:0x7a9a5a,shirt:'skin',sleeve:'skin',pants:0x5a4030,boot:0x4a3424,hair:0x2a2a20,build:1.3},3.4),hide=K.m(0x6a4a2e),wood=K.m(0x5a3a22),bone=K.m(0xf3ead7),iron=K.m(0x6a6e78);
  s.body.scale.setScalar(1.45);s.rigScale=1.45;M(R.torso,G3.ell(0.24,0.22,0.2),R.skinM,[0,0.3,0.06]);
  for(const x of [-1,1])M(R.head,G3.cone(0.025,0.09,14),bone,[x*0.07,-0.11,0.16]);SP.hair(R,K.m(0x2a2a20),'topknot',{tie:hide});
  SP.flap(R,hide,{len:0.2,w0:0.26,jag:0.04});SP.backFlap(R,hide,{len:0.2});SP.belt(R,hide,iron,{t:0.035});M(R.arms[1].sh,G3.dome(0.12,0.5,0.7,1.1),bone,[0.01,0.03,0],{r:[0,0,-0.3]});
  SP.bracer(R,hide,{ring:iron});const club=new THREE.Group();R.arms[0].wr.add(club);M(club,G3.limb(0.05,0.06,0.5),wood,[0,-0.3,0]);M(club,G3.limb(0.12,0.2,0.7,0.02),wood,[0,-0.95,0]);
  for(let i=0;i<6;i++){const a=i*1.05,y=-0.9-(i%2)*0.2;M(club,G3.cone(0.04,0.14,14),iron,[Math.cos(a)*0.18,y,Math.sin(a)*0.18],{r:[Math.sin(a)*Math.PI/2,0,-Math.cos(a)*Math.PI/2]});}return s;}},
{name:'Troll di pietra',desc:'Corpo grigio come la roccia con muschio sulle spalle e un masso al posto della clava.',
 make(){const {s,R,K}=hum({skin:0x8a8a84,shirt:'skin',sleeve:'skin',pants:0x5a5a54,boot:0x6a6a64,eyeGlow:0x7ff0e4,build:1.35},3.4),moss=K.m(0x4f8a3a),stone=K.m(0x7a7a74);
  s.body.scale.setScalar(1.45);s.rigScale=1.45;for(const [x,y,r] of [[0.08,0.45,0.08],[-0.1,0.3,0.07],[0.12,0.2,0.06]])M(SP.onChest(R,y,x,-0.02),G3.ell(r,r*0.8,r*0.6),stone,[0,0,0]);
  for(const a of R.arms){M(a.sh,G3.ell(0.1,0.06,0.1),moss,[0,0.06,0]);M(a.el,G3.ell(0.07,0.05,0.07),stone,[0,-0.1,0.03]);}
  M(R.head,G3.ell(0.17,0.08,0.18),stone,[0,0.12,0]);SP.flap(R,moss,{len:0.16,jag:0.05});
  const club=new THREE.Group();R.arms[0].wr.add(club);M(club,G3.limb(0.06,0.07,0.6),K.m(0x4a3a2a),[0,-0.3,0]);M(club,G3.ell(0.26,0.3,0.24),stone,[0,-0.85,0]);M(club,G3.ell(0.12,0.06,0.12),moss,[0,-0.65,0]);return s;}},
{name:'Ogre bandito',desc:'Grosso e pancione, elmo a scodella, benda su un occhio, grembiule di cuoio e mannaia.',
 make(){const {s,R,K}=hum({skin:0xc89a6a,shirt:0x6a4a2e,sleeve:'skin',pants:0x4a3a2e,boot:0x3a2a20,hair:0x3a2a1a,build:1.35},3.4),iron=K.m(0x6a6e78),lea=K.m(0x6a4a2e);
  s.body.scale.setScalar(1.45);s.rigScale=1.45;M(R.torso,G3.ell(0.27,0.25,0.24),R.skinM,[0,0.25,0.06]);SP.shell(R,lea,0.05,0.5,0.06,-0.9,1.8);
  SP.helmDome(R,iron,{cover:0.48});M(R.head,G3.hring(0.22,0.03,1.04),iron,[0,0.05,0]);M(R.face,G3.ell(0.04,0.035,0.02),K.m(0x1a1418),[0.062,0.03,0.172],{ol:0});
  M(R.head,G3.hring(0.19,0.008,1.04),K.m(0x1a1418),[0,0.06,0],{r:[0,0,-0.3],ol:0});SP.beard(R,K.m(0x3a2a1a));
  const cl=new THREE.Group();R.arms[0].wr.add(cl);M(cl,G3.limb(0.04,0.045,0.4),K.m(0x3a2620),[0,-0.15,0]);
  M(cl,bladeG(s2=>quad(s2,[[-0.03,0],[0.32,0],[0.34,-0.5],[0.05,-0.55],[-0.03,-0.45]]),{d:0.02,bt:0.012,bs:0.014}),iron,[0,-0.4,0]);return s;}},
],
/* ---------- NEGROMANTE ---------- */
shaman:[
{name:'Negromante',desc:'Cappuccio scuro, maschera d\'osso con corna ricurve, veste verde e sfera di energia.',
 make(){const {s,R,K}=hum({skin:0xe8e0cc,shirt:0x2f5a3a,sleeve:0x2f5a3a,pants:0x2a3a2e,boot:0x1a2a1e,eyes:false,eyeGlow:0x6aff9a},2.85),robe=K.m(0x2f5a3a),hood=K.ds(0x1a2a1e),bone=K.m(0xe8e0cc),gold=K.m(GOLD);
  s.robe=robeOn(R,robe);SP.hood(R,hood,{depth:0.76});R.face.visible=false;M(R.head,G3.sphP(0.19,Math.PI/2-1.0,2.0,Math.PI*0.18,Math.PI*0.64),bone,[0,0.01,0.01]);
  for(const x of [-1,1]){M(R.head,G3.ell(0.035,0.03,0.02),K.dark,[x*0.065,0.035,0.18],{ol:0});M(R.head,G3.ell(0.014,0.014,0.01),K.g(0x6aff9a,2.2),[x*0.065,0.035,0.195],{ol:0});}
  SP.horns(R,bone,{k:0.75,r:0.04,dy:-0.02});SP.chain(R.torso,gold,[[-0.12,0.62,tZ(0.62,-0.12,1,0.02)],[0,0.45,tZ(0.45,0,1,0.03)],[0.12,0.62,tZ(0.62,0.12,1,0.02)]],9,0.022);
  SP.sleeve(R,K.ds(0x2f5a3a));const st=staffIn(R,K,K.m(0x3a2a1a));M(st,G3.ell(0.12,0.13,0.12),bone,[0,1.6,0]);orbOn(s,st,K,0x9affc0,1.82,0.12);return s;}},
{name:'Sciamano tribale',desc:'Copricapo di piume, pittura bianca sul viso, collane d\'ossa e bastone con teschio di corvo.',
 make(){const {s,R,K}=hum({skin:0x8a5a3c,shirt:0x6a4a2e,sleeve:'skin',pants:0x4a3424,boot:0x4a3424,hair:0x1a1418,eyeGlow:0x6aff9a},2.85),hide=K.m(0x6a4a2e),bone=K.m(0xe8e0cc),f1=K.m(0x2f8a5a),f2=K.m(0xd94b3a),f3=K.m(0xf0e6cc);
  s.robe=robeOn(R,hide,{jag:0.12,r:0.44});SP.hair(R,K.m(0x1a1418),'long',{len:0.16});M(R.head,G3.hring(0.2,0.025,1.03),f2,[0,0.08,0]);
  for(let i=0;i<11;i++){const a=(i/10-0.5)*2.4;M(R.head,G3.leaf(0.08,0.32,0.01,true),[f1,f2,f3][i%3],[Math.sin(a)*0.19,0.12,Math.cos(a)*0.19-0.02],{r:[-0.25,a,0]});}
  for(const x of [-1,1])for(let i=0;i<2;i++)M(R.face,G3.rb(0.05,0.012,0.01,0.004),f3,[x*0.07,-0.0-i*0.035,0.16],{ol:0});
  SP.around(R,R.chest,9,0.13,0.1,0.06,(g)=>M(g,G3.cone(0.016,0.07,12),bone,[0,-0.06,0.02],{r:[Math.PI+0.2,0,0],ol:0.006}),-1.1,1.1);
  const st=staffIn(R,K,K.m(0x5a3e24));M(st,G3.ell(0.08,0.09,0.12),bone,[0,1.55,0]);M(st,G3.cone(0.04,0.18,16),bone,[0,1.52,0.16],{r:[Math.PI/2,0,0]});
  for(let i=0;i<3;i++)M(st,G3.leaf(0.05,0.2,0.01,true),[f1,f2,f3][i],[0.05*(i-1),1.4,-0.05],{r:[Math.PI,0,(i-1)*0.4]});orbOn(s,st,K,0x9affc0,1.75,0.09);return s;}},
{name:'Sacerdote della peste',desc:'Maschera a becco, cappello a falda larga, mantello di cuoio e una lanterna verde come sfera.',
 make(){const {s,R,K}=hum({skin:0xd8c8b8,shirt:0x2a2420,sleeve:0x2a2420,pants:0x1a1418,boot:0x1a1418,glove:0x2a2420,eyes:false},2.85),lea=K.m(0x2a2420),brass=K.m(0xc8963a),gl=0x9affc0;
  s.robe=robeOn(R,lea,{r:0.46});R.face.visible=false;M(R.head,G3.sphP(0.195,Math.PI/2-1.2,2.4,Math.PI*0.15,Math.PI*0.7),K.m(0x3a3028),[0,0.01,0]);
  M(R.head,G3.tube([[0,-0.02,0.17],[0,-0.05,0.3],[0,-0.13,0.44]],0.06,0.006,22,14),K.m(0x3a3028),null);
  for(const x of [-1,1]){M(R.head,G3.ell(0.038,0.038,0.02),K.g(gl,1.8),[x*0.07,0.04,0.19],{ol:0});M(R.head,G3.tor(0.04,0.01,TAU,28,8),brass,[x*0.07,0.04,0.192],{ol:0});}
  M(R.head,G3.cyl(0.36,0.36,0.02,56),lea,[0,0.17,0]);M(R.head,G3.cyl(0.17,0.19,0.16,48),lea,[0,0.26,0]);SP.capelet(R,K.ds(0x2a2420),{len:0.18,r1:0.29});
  const st=staffIn(R,K,K.m(0x3a2a1a),1.9);M(st,G3.cyl(0.006,0.006,0.14,6),brass,[0,1.55,0],{ol:0});M(st,G3.cyl(0.08,0.09,0.2,6,false),brass,[0,1.72,0]);M(st,G3.cone(0.09,0.08,6),brass,[0,1.86,0]);orbOn(s,st,K,gl,1.72,0.07);return s;}},
],
};
const EORDER=['slime','guard','mage','bat','archer','knight','imp','wraith','brute','shaman'];
function buildEnemy2(type,v){const s=ENEMIES[type][v].make();s.tick=s.tick||[];if(s.rig&&s.rig.tick)s.tick.push(...s.rig.tick.map(f=>(st,t,dt)=>f(s.rig,t,dt)));return s;}

// ===== GUARDIANI: 3 versioni per ognuno dei 7 guardiani =====
// Stessa struttura dei modelli del gioco (torso/testa/braccia/gambe, blob, rig, veste, orbita, ali, coda, mascella...), colore dal guardiano (d.color).
const shadeC=(c,k)=>{const x=new THREE.Color(c);x.r=Math.min(1,x.r*k);x.g=Math.min(1,x.g*k);x.b=Math.min(1,x.b*k);return x.getHex();};
function coreM(d){const z=(typeof ZONES!=='undefined'&&typeof zoneIndex==='function'&&d.floor)?ZONES[zoneIndex(d.floor)].light:0xffa64a;return toon(0x331a00,{emissive:z,emissiveIntensity:1.4});}
function crown2(par,K,y,r,gold,gem,o){o=o||{};const g=new THREE.Group();g.position.y=y;par.add(g);M(g,G3.cyl(r,r*1.04,r*0.35,48,true),gold,[0,0,0]);M(g,G3.hring(r*1.02,r*0.06,1),gold,[0,-r*0.17,0]);
  const n=o.n||6;for(let i=0;i<n;i++){const a=i/n*TAU;M(g,G3.cone(r*0.16,r*0.5,20),gold,[Math.cos(a)*r,r*0.4,Math.sin(a)*r]);M(g,G3.ell(r*0.07,r*0.07,r*0.07),gem,[Math.cos(a)*r,r*0.68,Math.sin(a)*r],{ol:0});}
  M(g,G3.ell(r*0.14,r*0.16,r*0.08),gem,[0,0,r*1.02],{ol:0});return g;}
function bossHum(o,barY,scale){const {s,R,K}=hum(o,barY);s.body.scale.setScalar(scale);s.rigScale=scale;s.noBar=true;return {s,R,K};}
function capeFor(s,R,m,len,w){const c=new THREE.Group();c.position.set(0,0.07,-0.118);R.chest.add(c);SP.shell(R,m,0.5,0.705,0.013,Math.PI-1.45,2.9);
  M(c,G3.panel(w||0.48,(w||0.48)*1.25,len||1.0,0.024,0.12),m,[0,0.01,0]);s.cape=c;return c;}
function dragonWing(par,K,mem,bone,k,ghost){const sh=s=>{s.moveTo(0,0.1*k);s.quadraticCurveTo(0.5*k,0.48*k,1.0*k,0.25*k);s.quadraticCurveTo(0.85*k,0.05*k,0.9*k,-0.15*k);s.quadraticCurveTo(0.7*k,-0.05*k,0.6*k,-0.25*k);s.quadraticCurveTo(0.45*k,-0.08*k,0.3*k,-0.2*k);s.quadraticCurveTo(0.2*k,0,0,-0.08*k);s.lineTo(0,0.1*k);};
  const g=G3.shape(sh,0.03,0.01);g.rotateY(Math.PI/2);M(par,g,mem,[0,0,0],{ol:ghost?0:0.02});
  for(const [x,y] of [[1.0,0.25],[0.9,-0.15],[0.6,-0.25],[0.3,-0.2]])M(par,G3.tube([[0,0.08*k,0],[0,(y+0.25)*k*0.55,-x*k*0.55],[0,y*k,-x*k]],0.07,0.02,16,10),bone,null);}
function dragonBody(s,d,K,o){const sk=o.sk,belly=o.belly,dark=o.dark,horn=o.horn;s.g=new THREE.Group();s.body.add(s.g);s.noBar=true;
  M(s.g,G3.ell(0.95,0.85,1.5),sk,[0,1.5,0]);if(belly)M(s.g,G3.ell(0.74,0.62,1.25),belly,[0,1.28,0.26],{ol:0});
  s.neck=new THREE.Group();s.neck.position.set(0,1.9,1.2);s.g.add(s.neck);M(s.neck,G3.tube([[0,-0.1,-0.2],[0,0.35,0.2],[0,0.8,0.55],[0,0.95,0.7]],0.36,0.26,30,18),sk,null);
  s.head=new THREE.Group();s.head.position.set(0,0.95,0.7);s.neck.add(s.head);M(s.head,G3.ell(0.34,0.28,0.42),sk,[0,0,0.12]);M(s.head,G3.ell(0.25,0.17,0.36),sk,[0,0.0,0.56]);
  s.jaw=new THREE.Group();s.jaw.position.set(0,-0.2,-0.1);s.head.add(s.jaw);M(s.jaw,G3.ell(0.22,0.09,0.44),dark,[0,-0.02,0.5]);
  for(const x of [-1,1]){M(s.head,G3.tube([[x*0.18,0.2,-0.05],[x*0.25,0.35,-0.3],[x*0.22,0.42,-0.6]],0.08,0.008,20,12),horn,null);M(s.head,G3.ell(0.07,0.05,0.04),o.eye,[x*0.2,0.12,0.36],{ol:0});
    M(s.head,G3.ell(0.035,0.03,0.03),s.fire,[x*0.1,0.06,0.9],{ol:0});for(let i=0;i<3;i++)M(s.jaw,G3.cone(0.025,0.08,12),o.tooth||horn,[x*(0.1+i*0.05),0.06,0.8-i*0.12],{ol:0});}
  s.tail=[];let par=s.g;for(let i=0;i<4;i++){const seg=new THREE.Group();if(i===0)seg.position.set(0,1.4,-1.3);else seg.position.set(0,0,-0.7);par.add(seg);M(seg,G3.limb(0.3-i*0.055,0.25-i*0.055,0.8),sk,[0,0,-0.35],{r:[Math.PI/2,0,0]});s.tail.push(seg);par=seg;}
  M(par,bladeG(sh=>quad(sh,[[-0.25,0],[0,-0.55],[0.25,0]]),{d:0.04,bt:0.03,bs:0.04}),dark,[0,0,-0.68],{r:[Math.PI/2,0,0]});
  s.legs=[];for(const [x,z] of [[-0.6,0.7],[0.6,0.7],[-0.6,-0.7],[0.6,-0.7]]){const pv=new THREE.Group();pv.position.set(x,1.1,z);s.g.add(pv);M(pv,G3.limb(0.26,0.18,0.8,0.03),sk,[0,-0.45,0]);
    M(pv,G3.ell(0.22,0.12,0.3),dark,[0,-0.98,0.1]);for(let i=-1;i<=1;i++)M(pv,G3.cone(0.04,0.14,12),horn,[i*0.1,-1.02,0.38],{r:[Math.PI/2,0,0],ol:0.008});s.legs.push(pv);}
  s.wings=[];for(const sd of [-1,1]){const pv=new THREE.Group();pv.position.set(sd*0.55,2.1,0.2);s.g.add(pv);dragonWing(pv,K,o.wing,o.wbone||dark,3.2,o.ghost);s.wings.push(pv);}
  for(let i=0;i<6;i++)M(s.g,G3.cone(0.13-i*0.01,0.38-i*0.03,20),o.spike||dark,[0,2.33-i*0.06,0.7-i*0.42]);}

const BOSSES={
golem:[
{name:'Golem di massi',desc:'Massi arrotondati tenuti insieme da crepe che ardono, nucleo luminoso nel petto.',
 make(d){const s=enemyShell(4),K=kitFor(s),stone=K.m(d.color),dark=K.m(shadeC(d.color,0.6));s.core=coreM(d);s.legs=[];s.noBar=true;s.torso=new THREE.Group();s.body.add(s.torso);
  for(const x of [-0.55,0.55]){const pv=new THREE.Group();pv.position.set(x,1.15,0);s.body.add(pv);M(pv,G3.ell(0.42,0.5,0.45),dark,[0,-0.4,0]);M(pv,G3.ell(0.5,0.25,0.55),stone,[0,-0.95,0.08]);s.legs.push(pv);}
  M(s.torso,G3.ell(1.05,0.95,0.72),stone,[0,2.1,0]);M(s.torso,G3.ell(0.6,0.4,0.5),dark,[0,1.35,0]);M(s.torso,G3.ell(0.3,0.3,0.12),s.core,[0,2.2,0.62],{ol:0});
  for(const [a,b,c] of [[-0.5,1.8,0.1],[0.45,2.5,-0.2],[0.2,1.6,0.3]])M(s.torso,G3.tube([[a,b,0.68],[a+0.15,b+0.2,0.66],[a+0.05,b+0.4,0.64]],0.03,0.02,10,6),s.core,null,{ol:0});
  s.head=new THREE.Group();s.head.position.y=3.32;s.torso.add(s.head);M(s.head,G3.ell(0.48,0.4,0.45),stone,[0,0,0]);M(s.head,G3.ell(0.5,0.12,0.2),dark,[0,0.12,0.32]);for(const x of [-0.2,0.2])M(s.head,G3.ell(0.09,0.06,0.04),s.core,[x,0.0,0.42],{ol:0});
  s.arms=[];for(const sd of [-1,1]){const pv=new THREE.Group();pv.position.set(sd*1.3,2.8,0);s.torso.add(pv);M(pv,G3.ell(0.45,0.4,0.45),stone,[0,0,0]);M(pv,G3.ell(0.36,0.55,0.36),stone,[0,-0.75,0]);M(pv,G3.ell(0.5,0.4,0.5),dark,[0,-1.65,0]);s.arms.push(pv);}return s;}},
{name:'Golem runico',desc:'Colosso di pietra squadrata e scheggiata, curvo come un gorilla: rune che ardono su petto, braccia e menhir piantati nella schiena, ceppi e catene ai polsi.',
 make(d){const s=enemyShell(4),K=kitFor(s),stone=K.m(d.color),dark=K.m(shadeC(d.color,0.58)),pale=K.m(shadeC(d.color,1.08)),iron=K.m(0x4a4a52);s.core=coreM(d);s.legs=[];s.noBar=true;
  const C=s.core,R=(w,h,dd,o)=>rockG(w,h,dd,o),rune=(par,pts,th)=>{for(let i=0;i<pts.length-1;i++){const [x1,y1,z1]=pts[i],[x2,y2,z2]=pts[i+1],L=Math.hypot(x2-x1,y2-y1);M(par,G3.rb(th||0.06,L+(th||0.06),0.04,0.02),C,[(x1+x2)/2,(y1+y2)/2,(z1+z2)/2],{r:[0,0,Math.atan2(x1-x2,y2-y1)],ol:0});}};
  // gambe corte e tozze: coscia, colonna, piede a lastra
  for(const x of [-0.6,0.6]){const pv=new THREE.Group();pv.position.set(x,1.25,0);s.body.add(pv);
    M(pv,R(0.7,0.62,0.78,{seed:x*3+1}),dark,[0,-0.22,0]);M(pv,R(0.78,0.72,0.82,{taper:1.12,seed:x*5+2}),stone,[0,-0.78,0.02]);
    M(pv,R(0.95,0.3,1.15,{seed:x*7+3,r:0.1}),dark,[0,-1.1,0.14]);for(const t of [-0.28,0,0.28])M(pv,R(0.22,0.18,0.2,{seed:t*9+x}),stone,[t,-1.08,0.7]);
    rune(pv,[[-0.12,-0.6,0.42],[0,-0.82,0.43],[0.12,-0.6,0.42]]);s.legs.push(pv);}
  M(s.body,R(1.55,0.55,1.0,{seed:4}),dark,[0,1.38,-0.02]);
  // busto curvo: pancia, petto enorme, gobba con i menhir
  s.torso=new THREE.Group();s.torso.position.y=1.5;s.body.add(s.torso);const T=new THREE.Group();T.position.y=-1.5;s.torso.add(T);
  M(T,R(1.4,0.8,1.05,{seed:5,taper:1.15}),stone,[0,1.85,0.02]);
  const ch=new THREE.Group();ch.position.set(0,2.72,0.08);ch.rotation.x=0.16;T.add(ch);
  M(ch,R(2.45,1.35,1.45,{seed:6,taper:0.92,amp:0.07}),stone,[0,0,0]);M(ch,R(1.5,0.95,0.3,{seed:7,r:0.12}),pale,[0,-0.05,0.68]);
  for(const sd of [-1,1])M(ch,R(0.75,0.6,0.25,{seed:8+sd}),pale,[sd*0.85,0.25,0.6],{r:[0,sd*0.35,sd*0.1]});
  M(ch,R(1.9,0.7,0.9,{seed:9}),dark,[0,0.5,-0.55]);
  // nucleo runico: anello e quattro raggi
  M(ch,G3.tor(0.3,0.045,TAU,40,8),C,[0,-0.02,0.86],{ol:0});M(ch,G3.ell(0.19,0.19,0.08),C,[0,-0.02,0.84],{ol:0});
  for(let i=0;i<4;i++){const a=i/4*TAU+Math.PI/4;M(ch,G3.rb(0.05,0.22,0.04,0.02),C,[Math.sin(a)*0.45,-0.02+Math.cos(a)*0.45,0.85],{r:[0,0,-a],ol:0});}
  rune(ch,[[-0.95,0.42,0.74],[-0.7,0.15,0.74],[-0.95,-0.12,0.74]]);rune(ch,[[0.95,0.42,0.74],[0.7,0.15,0.74],[0.95,-0.12,0.74]]);
  // menhir nella schiena, con rune
  for(const sd of [-1,1]){const mh=new THREE.Group();mh.position.set(sd*0.55,0.75,-0.55);mh.rotation.set(-0.35,0,-sd*0.22);ch.add(mh);
    M(mh,R(0.42,1.25,0.36,{seed:10+sd,taper:0.6,r:0.1}),dark,[0,0.55,0]);M(mh,R(0.6,0.3,0.55,{seed:12+sd}),stone,[0,0,0]);
    rune(mh,[[0,0.25,0.19],[0,0.75,0.19]],0.05);rune(mh,[[-0.08,0.55,0.19],[0.08,0.68,0.19]],0.045);}
  M(ch,R(0.5,0.4,0.45,{seed:14}),dark,[0,0.85,-0.75]);
  // testa piccola e incassata fra le spalle, sporgente in avanti
  s.head=new THREE.Group();s.head.position.set(0,3.45,0.62);T.add(s.head);
  M(s.head,R(0.82,0.62,0.74,{seed:15}),stone,[0,0,0]);M(s.head,R(0.95,0.2,0.36,{seed:16,r:0.08}),dark,[0,0.2,0.26]);M(s.head,R(0.7,0.24,0.5,{seed:17}),dark,[0,-0.3,0.12]);
  M(s.head,G3.rb(0.5,0.07,0.06,0.03),C,[0,0.05,0.38],{ol:0});for(const x of [-0.17,0.17])M(s.head,G3.ell(0.07,0.05,0.04),C,[x,0.05,0.39],{ol:0});
  rune(s.head,[[0,0.36,0.3],[0,0.24,0.42]],0.045);
  // braccia lunghe da gorilla: spallaccio, braccio, gomito, avambraccio enorme, pugno con ceppo e catena
  s.arms=[];for(const sd of [-1,1]){const pv=new THREE.Group();pv.position.set(sd*1.42,3.05,0.05);T.add(pv);
    M(pv,R(1.05,0.78,1.1,{seed:20+sd,amp:0.06}),stone,[sd*0.08,0.08,0]);M(pv,R(0.7,0.3,0.75,{seed:22+sd}),pale,[sd*0.2,0.45,0]);
    M(pv,R(0.6,0.95,0.62,{seed:24+sd}),dark,[0,-0.62,0]);M(pv,R(0.55,0.4,0.55,{seed:26+sd}),stone,[0,-1.12,-0.04]);
    M(pv,R(0.82,1.0,0.82,{seed:28+sd,taper:1.18}),stone,[0,-1.62,0.04]);rune(pv,[[-0.18,-1.35,0.46],[0,-1.55,0.47],[0.18,-1.35,0.46],[0,-1.85,0.47]],0.05);
    M(pv,R(1.0,0.82,1.02,{seed:30+sd,amp:0.06}),dark,[0,-2.42,0.06]);for(const t of [-0.3,-0.1,0.1,0.3])M(pv,R(0.22,0.24,0.24,{seed:t*7+sd}),stone,[t,-2.35,0.55]);
    M(pv,G3.hring(0.5,0.07,1),iron,[0,-2.0,0.04]);M(pv,G3.hring(0.5,0.05,1),iron,[0,-2.12,0.04]);
    let lk=[sd*0.12,-2.1,-0.48];for(let i=0;i<4;i++){M(pv,G3.tor(0.075,0.025,TAU,16,6),iron,[lk[0],lk[1]-i*0.13,lk[2]-i*0.03],{r:[0,i%2?Math.PI/2:0,0],ol:0.01});}
    s.arms.push(pv);}
  return s;}},
{name:'Golem di cristallo',desc:'Roccia scura con grappoli di cristalli che crescono da spalle e schiena e brillano.',
 make(d){const s=enemyShell(4),K=kitFor(s),rock=K.m(shadeC(d.color,0.55)),stone=K.m(d.color);s.core=coreM(d);const cr=toon(0xffffff,{emissive:d.color,emissiveIntensity:0.9});s.mats.push(cr);s.legs=[];s.noBar=true;s.torso=new THREE.Group();s.body.add(s.torso);
  for(const x of [-0.55,0.55]){const pv=new THREE.Group();pv.position.set(x,1.15,0);s.body.add(pv);M(pv,G3.ell(0.4,0.55,0.42),rock,[0,-0.5,0]);s.legs.push(pv);}
  M(s.torso,G3.ell(1.0,0.92,0.7),rock,[0,2.1,0]);M(s.torso,G3.ell(0.32,0.32,0.14),s.core,[0,2.2,0.6],{ol:0});
  const cl=(par,pos,n,sz)=>{for(let i=0;i<n;i++){const a=i/n*TAU;M(par,G3.cone(0.09*sz,0.6*sz*(0.7+0.3*((i*7)%3)),8),cr,[pos[0]+Math.cos(a)*0.12*sz,pos[1]+0.2*sz,pos[2]+Math.sin(a)*0.12*sz],{r:[Math.sin(a)*0.4,0,-Math.cos(a)*0.4],ol:0.012});}};
  cl(s.torso,[0.6,2.8,-0.3],5,1.2);cl(s.torso,[-0.5,2.7,-0.4],4,1);cl(s.torso,[0,2.4,-0.6],5,1.3);
  s.head=new THREE.Group();s.head.position.y=3.32;s.torso.add(s.head);M(s.head,G3.ell(0.45,0.38,0.42),stone,[0,0,0]);for(const x of [-0.18,0.18])M(s.head,new THREE.OctahedronGeometry(0.08,0),cr,[x,0.02,0.4],{ol:0});cl(s.head,[0,0.25,0],3,0.6);
  s.arms=[];for(const sd of [-1,1]){const pv=new THREE.Group();pv.position.set(sd*1.3,2.8,0);s.torso.add(pv);M(pv,G3.ell(0.34,0.85,0.34),rock,[0,-0.8,0]);M(pv,G3.ell(0.45,0.38,0.45),stone,[0,-1.7,0]);cl(pv,[0,0.1,0],3,0.8);s.arms.push(pv);}return s;}},
],
slimeKing:[
{name:'Re Melma',desc:'Gelatina regale con corona d\'oro, mantello di velluto sul retro e occhioni.',
 make(d){const s=enemyShell(3.2),K=kitFor(s),gel=K.m(d.color,{emissive:shadeC(d.color,0.35),emissiveIntensity:0.35}),gold=K.m(0xe0b84a,{emissive:0x6a4a00,emissiveIntensity:0.3});s.noBar=true;
  s.blobG=new THREE.Group();s.body.add(s.blobG);s.blob=M(s.blobG,G3.ell(1.5,1.5,1.5,48,32),gel,[0,1.15,0]);s.blob.scale.set(1,0.78,1);
  for(const x of [-0.45,0.45]){M(s.blobG,G3.ell(0.27,0.3,0.2),K.m(0xffffff),[x,1.5,1.12]);M(s.blobG,G3.ell(0.13,0.15,0.08),K.dark,[x,1.48,1.3],{ol:0});}
  M(s.blobG,G3.tor(0.26,0.05,Math.PI,28,10),K.dark,[0,1.0,1.38],{r:[0,0,Math.PI],ol:0});crown2(s.blobG,K,2.25,0.5,gold,K.g(0xff4d6d,1.2));
  const cape=M(s.blobG,G3.sphP(1.56,Math.PI+0.7,Math.PI-1.4,Math.PI*0.25,Math.PI*0.45),K.ds(0x7a1a2a),[0,1.15,0]);cape.scale.set(1,0.8,1);M(s.blobG,G3.hring(1.2,0.08,1,Math.PI*0.9),K.m(0xf2f2f2),[0,1.55,-0.1],{r:[0,Math.PI,0]});return s;}},
{name:'Re Melma ingordo',desc:'Gelatina trasparente piena di tesori inghiottiti, con la corona che gli galleggia sopra.',
 make(d){const s=enemyShell(3.2),K=kitFor(s),gel=toon(d.color,{emissive:shadeC(d.color,0.3),emissiveIntensity:0.3,transparent:true,opacity:0.6,depthWrite:false}),gold=K.m(0xe0b84a,{emissive:0x6a4a00,emissiveIntensity:0.3});s.mats.push(gel);s.noBar=true;
  s.blobG=new THREE.Group();s.body.add(s.blobG);s.blob=M(s.blobG,G3.ell(1.5,1.5,1.5,48,32),gel,[0,1.15,0],{ol:0});s.blob.scale.set(1,0.78,1);s.blob.add(new THREE.Mesh(hullGeo(s.blob.geometry,0.03),OUT));
  for(let i=0;i<14;i++){const a=i*2.4,r=0.3+(i%4)*0.18;M(s.blobG,G3.cyl(0.1,0.1,0.03,24),gold,[Math.cos(a)*r,0.55+(i%5)*0.12,Math.sin(a)*r*0.7],{r:[i*0.7,0,i*0.4]});}
  const sk=K.m(0xe6dcc6);M(s.blobG,G3.ell(0.22,0.24,0.22),sk,[0.4,1.0,-0.2]);for(const x of [-1,1])M(s.blobG,G3.ell(0.05,0.05,0.03),K.dark,[0.4+x*0.08,1.02,0.0],{ol:0});
  const sw=buildWeapon2('spada',1,2,null);sw.g.position.set(-0.5,1.6,0.1);sw.g.rotation.z=2.4;s.blobG.add(sw.g);
  for(const x of [-0.45,0.45]){M(s.blobG,G3.ell(0.24,0.27,0.18),K.m(0xffffff),[x,1.5,1.15]);M(s.blobG,G3.ell(0.12,0.14,0.07),K.dark,[x,1.48,1.3],{ol:0});}
  const c=crown2(s.blobG,K,2.55,0.45,gold,K.g(0x7fe08a,1.2));s.tick=[(e,t)=>{c.position.y=2.55+Math.sin(t*2)*0.06;c.rotation.y=t*0.4;}];return s;}},
{name:'Re Melma corazzato',desc:'Gelatina scura con un elmo chiodato come corona e uno scettro conficcato nel fianco.',
 make(d){const s=enemyShell(3.2),K=kitFor(s),gel=K.m(shadeC(d.color,0.7),{emissive:shadeC(d.color,0.25),emissiveIntensity:0.3}),iron=K.m(0x4a4a52),gold=K.m(0xe0b84a);s.noBar=true;
  s.blobG=new THREE.Group();s.body.add(s.blobG);s.blob=M(s.blobG,G3.ell(1.5,1.5,1.5,48,32),gel,[0,1.15,0]);s.blob.scale.set(1,0.78,1);
  M(s.blobG,G3.dome(0.8,0.5,0.8,1),iron,[0,2.05,0]);M(s.blobG,G3.hring(0.8,0.06,1),gold,[0,2.05,0]);for(let i=0;i<7;i++){const a=i/7*TAU;M(s.blobG,G3.cone(0.08,0.4,16),iron,[Math.cos(a)*0.55,2.45,Math.sin(a)*0.55],{r:[Math.sin(a)*0.4,0,-Math.cos(a)*0.4]});}
  const eg=K.g(0xff5a3a,1.8);for(const x of [-0.42,0.42])M(s.blobG,G3.ell(0.16,0.09,0.06),eg,[x,1.45,1.3],{ol:0});
  const sc=new THREE.Group();sc.position.set(1.1,1.2,0.4);sc.rotation.z=-0.7;s.blobG.add(sc);M(sc,G3.limb(0.05,0.05,1.4),gold,[0,0.3,0]);M(sc,G3.ell(0.16,0.16,0.16),K.g(0xff4d6d,1.2),[0,1.05,0],{ol:0});return s;}},
],
skelKing:[
{name:'Re scheletro',desc:'Teschio con corona, spallacci del colore del guardiano, mantello regale e spadone.',
 make(d){const {s,R,K}=bossHum({skin:0xe8e0cc,shirt:0x2b2620,sleeve:0xe8e0cc,pants:0xe8e0cc,boot:0xe8e0cc,glove:0xe8e0cc,build:0.85},4.4,1.8),bone=K.m(0xe8e0cc),arm=K.m(d.color),gold=K.m(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.3});
  skeleton(R,K,bone,d.color);crown2(R.head,K,0.2,0.2,gold,K.g(d.color,1.4));SP.pauldron(R,arm,{layers:3,trim:gold,r:0.12});SP.belt(R,arm,gold);capeFor(s,R,K.ds(shadeC(d.color,0.55)),1.0);
  const sw=buildWeapon2('spada',1,3,null);R.arms[0].wr.add(sw.g);return s;}},
{name:'Capitano pirata',desc:'Tricorno con piuma, giacca lunga del colore del guardiano, sciabola e benda sull\'orbita.',
 make(d){const {s,R,K}=bossHum({skin:0xe8e0cc,shirt:shadeC(d.color,0.8),sleeve:shadeC(d.color,0.8),fore:0xe8e0cc,pants:0x2a2420,boot:0x1a1418,glove:0xe8e0cc,build:0.9},4.4,1.8),bone=K.m(0xe8e0cc),coat=K.m(shadeC(d.color,0.8)),gold=K.m(0xd9b45a),blk=K.m(0x1a1418);
  skeleton(R,K,bone,d.color,{noRibs:true});M(R.head,G3.ell(0.05,0.045,0.02),blk,[0.064,0.03,0.185],{ol:0});M(R.head,G3.hring(0.19,0.008,1.04),blk,[0,0.06,0],{r:[0,0,0.35],ol:0});
  const hat=new THREE.Group();hat.position.y=0.18;R.head.add(hat);for(let i=0;i<3;i++){const a=i/3*TAU+Math.PI/2;M(hat,G3.cyl(0.13,0.13,0.02,24),blk,[0,0,0]);M(hat,G3.rb(0.36,0.14,0.03,0.015),blk,[Math.cos(a)*0.17,0.04,Math.sin(a)*0.17],{r:[0,-a+Math.PI/2,0]});}
  M(hat,G3.dome(0.2,0.5,0.8,1),blk,[0,0.0,0]);M(hat,G3.hring(0.2,0.015,1),gold,[0,0.01,0],{ol:0});M(hat,G3.leaf(0.08,0.4,0.01,true),K.m(0xf2f2f2),[0.12,0.1,-0.1],{r:[-1.0,0,-0.6]});
  SP.shell(R,coat,0.0,0.68,0.02);for(const y of [0.25,0.38,0.51])M(SP.onChest(R,y,0.06,0.025),G3.ell(0.016,0.016,0.01),gold,[0,0,0],{ol:0});SP.skirt(R,coat,{len:0.3,n:2,w:0.28,flare:1.2,sides:false});SP.belt(R,blk,gold,{t:0.03});
  capeFor(s,R,K.ds(shadeC(d.color,0.5)),0.7,0.44);const sw=buildWeapon2('katana',2,2,null);R.arms[0].wr.add(sw.g);return s;}},
{name:'Re dei morti',desc:'Corona d\'osso con corna, costole d\'armatura, occhi accesi e mantello stracciato.',
 make(d){const {s,R,K}=bossHum({skin:0xd8d0bc,shirt:0x1a1418,sleeve:0xd8d0bc,pants:0xd8d0bc,boot:0x1a1418,glove:0xd8d0bc,build:0.88},4.4,1.8),bone=K.m(0xd8d0bc),arm=K.m(shadeC(d.color,0.6)),glow=K.g(d.color,1.6);
  skeleton(R,K,bone,d.color);SP.horns(R,bone,{pts:[[0.15,0.12,0],[0.25,0.26,-0.02],[0.26,0.42,-0.08],[0.2,0.56,-0.14]],r:0.05});
  for(let i=0;i<7;i++){const a=(i-3)*0.4;M(R.head,G3.cone(0.025,0.16,16),bone,[Math.sin(a)*0.19,0.24,Math.cos(a)*0.19-0.01]);}
  SP.pauldron(R,arm,{layers:2,r:0.13,spikes:3,spikeM:bone,trim:glow});SP.bracer(R,arm,{ring:glow});capeFor(s,R,K.ds(shadeC(d.color,0.4)),1.05);
  const sw=buildWeapon2('spada',2,4,null);R.arms[0].wr.add(sw.g);return s;}},
],
bknight:[
{name:'Maestro d\'armi',desc:'Armatura completa del colore del guardiano, pennacchio, mantello rosso e spada lunga.',
 make(d){const {s,R,K}=bossHum({skin:0x3a3f4a,shirt:0x1a1c22,sleeve:d.color,fore:d.color,pants:0x1a1c22,boot:d.color,glove:d.color,build:1.05,eyes:false},4,1.6),arm=K.m(d.color),gold=K.m(0xd9b45a),plume=K.m(shadeC(d.color,1.3));
  SP.greatHelm(R,arm,{glow:K.g(0xff5a3a,2),ridge:gold,rim:gold});M(R.head,G3.tube([[0,0.24,0],[0,0.38,-0.08],[0,0.36,-0.26],[0,0.18,-0.38]],0.06,0.014,24,12),plume,null);
  SP.shell(R,arm,0.2,0.68,0.03);SP.shell(R,arm,0.02,0.24,0.026);SP.pauldron(R,arm,{layers:3,trim:gold,r:0.13});SP.upperArm(R,arm);SP.bracer(R,arm,{ring:gold});SP.cuisse(R,arm);SP.greave(R,arm,gold);
  capeFor(s,R,K.ds(0x5a1a1a),1.1);const sw=buildWeapon2('spada',0,3,null);sw.g.scale.set(1,1.15,1);R.arms[0].wr.add(sw.g);return s;}},
{name:'Cavaliere del drago',desc:'Elmo a muso di drago con corna e alette, armatura a scaglie e lancia di luce.',
 make(d){const {s,R,K}=bossHum({skin:0x3a3f4a,shirt:0x1a1c22,sleeve:d.color,fore:d.color,pants:0x1a1c22,boot:d.color,glove:d.color,build:1.05,eyes:false},4,1.6),arm=K.m(d.color),dk=K.m(shadeC(d.color,0.6)),gold=K.m(0xd9b45a);
  SP.greatHelm(R,arm,{glow:K.g(0xffd040,2)});M(R.head,G3.ell(0.12,0.1,0.18),arm,[0,-0.05,0.25]);SP.horns(R,gold,{pts:[[0.14,0.16,-0.05],[0.2,0.28,-0.2],[0.18,0.36,-0.36]],r:0.04});
  for(const x of [-1,1])M(R.head,G3.leaf(0.12,0.3,0.014,true),dk,[x*0.22,0.08,-0.04],{r:[-0.9,x*Math.PI/2,0]});
  SP.shell(R,arm,0.02,0.68,0.026);for(let i=0;i<7;i++)SP.band(R,i%2?dk:arm,0.12+i*0.08,0.034,0.012);SP.pauldron(R,dk,{layers:3,r:0.13,spikes:2,spikeM:gold});SP.bracer(R,dk);SP.greave(R,arm,dk);
  capeFor(s,R,K.ds(shadeC(d.color,0.5)),1.0);const sw=buildWeapon2('lancia',2,3,null);R.arms[0].wr.add(sw.g);return s;}},
{name:'Campione nero',desc:'Piastre chiodate con visiera accesa, mantello lacero e lama fiammeggiante.',
 make(d){const {s,R,K}=bossHum({skin:0x2a2d36,shirt:0x101014,sleeve:shadeC(d.color,0.5),fore:shadeC(d.color,0.5),pants:0x101014,boot:shadeC(d.color,0.5),glove:shadeC(d.color,0.5),build:1.1,eyes:false},4,1.6),arm=K.m(shadeC(d.color,0.5)),glow=K.g(0xff5a3a,2);
  SP.greatHelm(R,arm,{glow});SP.horns(R,arm,{k:0.9,r:0.05});SP.shell(R,arm,0.02,0.68,0.03);for(let i=0;i<5;i++)M(SP.onChest(R,0.3+i*0.07,(i%2?0.08:-0.08),0.03),G3.cone(0.025,0.08,14),arm,[0,0,0.03],{r:[Math.PI/2,0,0]});
  SP.pauldron(R,arm,{layers:2,r:0.14,spikes:3,spikeM:arm});SP.bracer(R,arm,{ring:glow});SP.greave(R,arm,arm);
  capeFor(s,R,K.ds(0x2a0a0a),1.1);const sw=buildWeapon2('spada',2,4,'fuoco');R.arms[0].wr.add(sw.g);return s;}},
],
archmage:[
{name:'Archivista',desc:'Cappello a punta con stelle, barba lunga, veste a fasce d\'oro e tre libri che gli girano intorno.',
 make(d){const {s,R,K}=bossHum({skin:0xb8c4a0,shirt:d.color,sleeve:d.color,pants:shadeC(d.color,0.45),boot:shadeC(d.color,0.35),hair:0xe6e2da,eyeGlow:d.color},4,1.5),robe=K.m(d.color),dark=K.m(shadeC(d.color,0.35)),gold=K.m(0xd9b45a),white=K.m(0xe6e2da);
  s.robe=robeOn(R,robe,{r:0.55});for(let i=0;i<3;i++)M(s.robe,G3.hring(0.42-i*0.08,0.025,1),gold,[0,-0.75+i*0.35,0],{ol:0});SP.beard(R,white,{long:2});SP.hair(R,white,'long');
  M(R.head,G3.cyl(0.44,0.46,0.03,56),dark,[0,0.17,0]);M(R.head,G3.tube([[0,0.17,0],[0,0.45,-0.03],[0.05,0.68,-0.12],[0.18,0.78,-0.26]],0.2,0.01,30,22,t=>0.2*Math.pow(1-t,1.05)+0.006),dark,null);
  for(let i=0;i<4;i++)SP.star(R.head,K.g(d.color,1.4),0.03,[Math.cos(i*1.6)*0.16,0.3+i*0.1,Math.sin(i*1.6)*0.16+0.05]);SP.sleeve(R,K.ds(d.color));
  const st=staffIn(R,K,K.m(0x3a2a1a),2.2);orbOn(s,st,K,d.color,1.8,0.22);s.orbM.color.setHex(0xffffff);s.orbM.emissive.setHex(d.color);
  s.orbit=new THREE.Group();s.body.add(s.orbit);for(let i=0;i<3;i++){const a=i/3*TAU,b=new THREE.Group();b.position.set(Math.cos(a)*0.9,0,Math.sin(a)*0.9);s.orbit.add(b);
    M(b,G3.rb(0.22,0.28,0.08,0.02),K.m([0x8a2a2a,0x2a4a8a,0x2a6a3a][i]),[0,0,0]);M(b,G3.rb(0.2,0.26,0.07,0.01),K.m(0xf0e6cc),[0.015,0,0],{ol:0});}return s;}},
{name:'Negromante supremo',desc:'Cappuccio profondo con maschera a teschio, veste stracciata e teschi accesi in orbita.',
 make(d){const {s,R,K}=bossHum({skin:0xe8e0cc,shirt:shadeC(d.color,0.4),sleeve:shadeC(d.color,0.4),pants:0x1a1418,boot:0x1a1418,eyes:false},4,1.5),robe=K.m(shadeC(d.color,0.4)),hood=K.ds(0x1a1418),bone=K.m(0xe8e0cc),glow=K.g(d.color,2);
  s.robe=robeOn(R,robe,{r:0.55,jag:0.15});SP.hood(R,hood,{depth:0.8});R.face.visible=false;M(R.head,G3.ell(0.15,0.17,0.15),bone,[0,0.01,0.03]);
  for(const x of [-1,1]){M(R.head,G3.ell(0.042,0.04,0.02),K.dark,[x*0.06,0.03,0.165],{ol:0});M(R.head,G3.ell(0.018,0.018,0.01),glow,[x*0.06,0.03,0.18],{ol:0});}
  SP.capelet(R,hood,{len:0.18,r1:0.3});SP.sleeve(R,hood);const st=staffIn(R,K,K.m(0x1a1418),2.2);M(st,G3.ell(0.14,0.15,0.14),bone,[0,1.65,0]);orbOn(s,st,K,d.color,1.88,0.12);
  s.orbit=new THREE.Group();s.body.add(s.orbit);for(let i=0;i<3;i++){const a=i/3*TAU;M(s.orbit,G3.ell(0.12,0.13,0.12),bone,[Math.cos(a)*0.9,0,Math.sin(a)*0.9]);M(s.orbit,G3.ell(0.03,0.03,0.02),glow,[Math.cos(a)*0.9,0.01,Math.sin(a)*0.9+0.11],{ol:0});}return s;}},
{name:'Astromago',desc:'Aureola di stelle, veste notturna con costellazioni d\'oro e pianeti che orbitano.',
 make(d){const {s,R,K}=bossHum({skin:0xd8c8b8,shirt:shadeC(d.color,0.5),sleeve:shadeC(d.color,0.5),pants:0x14143a,boot:0x14143a,hair:0xf2f6ff,eyeGlow:d.color},4,1.5),robe=K.m(shadeC(d.color,0.5)),gold=K.g(0xffd27a,0.9),star=K.g(0xfff3c4,2);
  s.robe=robeOn(R,robe,{r:0.55});for(let i=0;i<9;i++)M(s.robe,G3.ell(0.02,0.02,0.01),star,[Math.sin(i*1.9)*(0.3+(i%3)*0.06),-0.7+(i%4)*0.18,Math.cos(i*1.9)*(0.3+(i%3)*0.06)],{ol:0});
  SP.hair(R,K.m(0xf2f6ff),'long',{len:0.18});SP.beard(R,K.m(0xf2f6ff),{long:1});const h=new THREE.Group();h.position.set(0,0.12,-0.22);R.head.add(h);M(h,G3.tor(0.3,0.015,TAU,48,8),gold,[0,0,0],{ol:0});
  for(let i=0;i<8;i++){const a=i/8*TAU;SP.star(h,star,0.045,[Math.cos(a)*0.3,Math.sin(a)*0.3,0]);}SP.sleeve(R,K.ds(shadeC(d.color,0.5)));
  const st=staffIn(R,K,K.m(0xd8e2ee),2.2);orbOn(s,st,K,d.color,1.8,0.2);
  s.orbit=new THREE.Group();s.body.add(s.orbit);for(let i=0;i<3;i++){const a=i/3*TAU;M(s.orbit,G3.ell(0.14,0.14,0.14),K.m([0xe08a4a,0x5a8ad8,0xd8c86a][i]),[Math.cos(a)*0.95,0,Math.sin(a)*0.95]);if(i===2)M(s.orbit,G3.hring(0.22,0.012,1),gold,[Math.cos(a)*0.95,0,Math.sin(a)*0.95],{r:[0.4,0,0.3],ol:0});}return s;}},
],
batQueen:[
{name:'Regina dei pipistrelli',desc:'Grande pipistrello con collare di pelo, corona d\'oro con rubino e ali con le dita in vista.',
 make(d){const s=enemyShell(1.15),K=kitFor(s),fur=K.m(d.color),wing=K.ds(shadeC(d.color,0.7)),muz=K.m(shadeC(d.color,1.3)),gold=K.m(0xe0b84a,{emissive:0x6a4a00,emissiveIntensity:0.3});s.noBar=true;
  M(s.body,G3.ell(0.3,0.33,0.28),fur,[0,0.4,0]);M(s.body,G3.ell(0.17,0.14,0.14),muz,[0,0.33,0.2]);SP.around({},s.body,10,0.24,0.2,0.2,(g,i)=>M(g,G3.ell(0.07,0.05,0.06),i%2?muz:fur,[0,0,0]),-2.8,2.8);
  for(const x of [-1,1]){M(s.body,G3.cone(0.09,0.28,24),fur,[x*0.14,0.75,0],{r:[0,0,-x*0.25]});M(s.body,G3.ell(0.05,0.05,0.03),K.g(0xff5a3a,1.6),[x*0.1,0.46,0.25],{ol:0});M(s.body,G3.cone(0.018,0.08,10),K.m(0xffffff),[x*0.05,0.25,0.29],{r:[Math.PI,0,0],ol:0});}
  crown2(s.body,K,0.7,0.14,gold,K.g(0xff4d6d,1.2));membrane(s,s.body,K,wing,K.m(shadeC(d.color,0.5)));s.body.scale.setScalar(2.6);return s;}},
{name:'Regina vampira',desc:'Ali rosso sangue come un mantello, collana di gemme, zanne lunghe e diadema scuro.',
 make(d){const s=enemyShell(1.15),K=kitFor(s),fur=K.m(shadeC(d.color,0.45)),wing=K.ds(0x7a1a2a),gold=K.m(0xe0b84a),gem=K.g(0xff2a3a,1.6),white=K.m(0xf2eef2);s.noBar=true;
  M(s.body,G3.ell(0.3,0.34,0.28),fur,[0,0.4,0]);M(s.body,G3.ell(0.14,0.12,0.12),K.m(0x3a2a30),[0,0.33,0.2]);SP.chain(s.body,gold,[[-0.2,0.28,0.12],[0,0.18,0.27],[0.2,0.28,0.12]],9,0.02);M(s.body,G3.ell(0.04,0.05,0.03),gem,[0,0.15,0.28],{ol:0});
  for(const x of [-1,1]){M(s.body,G3.cone(0.08,0.32,24),fur,[x*0.15,0.78,0],{r:[0,0,-x*0.32]});M(s.body,G3.ell(0.055,0.035,0.02),gem,[x*0.1,0.47,0.25],{r:[0,0,-x*0.3],ol:0});M(s.body,G3.cone(0.02,0.13,10),white,[x*0.05,0.22,0.27],{r:[Math.PI,0,0],ol:0});}
  M(s.body,G3.hring(0.2,0.02,1),K.m(0x2a1a2a),[0,0.66,0],{r:[0.2,0,0]});M(s.body,G3.cone(0.03,0.14,16),K.m(0x2a1a2a),[0,0.74,0.18],{r:[0.3,0,0]});
  membrane(s,s.body,K,wing,K.m(0x2a0a10),{span:1.2});s.body.scale.setScalar(2.6);return s;}},
{name:'Regina d\'ossa',desc:'Scheletro di pipistrello con ali di fumo colorato, corona d\'osso e occhi accesi.',
 make(d){const s=enemyShell(1.15),K=kitFor(s),bone=K.m(0xe6dcc6),wing=new THREE.MeshBasicMaterial({color:d.color,transparent:true,opacity:0.5,side:THREE.DoubleSide,depthWrite:false});s.noBar=true;
  M(s.body,G3.ell(0.22,0.24,0.22),bone,[0,0.42,0]);M(s.body,G3.ell(0.13,0.1,0.13),bone,[0,0.33,0.15]);for(let i=0;i<4;i++)M(s.body,G3.tor(0.2-i*0.03,0.015,Math.PI*1.4,24,6),bone,[0,0.38-i*0.07,-0.02],{r:[Math.PI/2,0,Math.PI*0.8]});
  for(const x of [-1,1]){M(s.body,G3.cone(0.06,0.26,20),bone,[x*0.12,0.72,0],{r:[0,0,-x*0.3]});M(s.body,G3.ell(0.05,0.045,0.03),K.dark,[x*0.08,0.45,0.19],{ol:0});M(s.body,G3.ell(0.022,0.022,0.012),K.g(d.color,2.4),[x*0.08,0.45,0.215],{ol:0});}
  for(let i=0;i<5;i++){const a=(i-2)*0.45;M(s.body,G3.cone(0.02,0.12,14),bone,[Math.sin(a)*0.15,0.66,Math.cos(a)*0.12]);}membrane(s,s.body,K,wing,bone);s.body.scale.setScalar(2.6);return s;}},
],
dragon:[
{name:'Drago della torre',desc:'Corpo liscio a scaglie, pancia chiara, corna ricurve, cresta di spine e ali con le ossa.',
 make(d){const s=enemyShell(4),K=kitFor(s);s.fire=toon(0x401000,{emissive:0xff7a2e,emissiveIntensity:1.2});s.mats.push(s.fire);
  dragonBody(s,d,K,{sk:K.m(d.color),belly:K.m(0xe0b070),dark:K.m(shadeC(d.color,0.55)),horn:K.m(0xefe7d4),eye:K.g(0xffd040,1.6),wing:K.ds(shadeC(d.color,0.75))});return s;}},
{name:'Drago d\'ossa',desc:'Uno scheletro di drago con ali di fumo, fiamme nel petto e occhi accesi.',
 make(d){const s=enemyShell(4),K=kitFor(s);s.fire=toon(0x200810,{emissive:d.color,emissiveIntensity:1.4});s.mats.push(s.fire);const bone=K.m(0xe6dcc6),wing=new THREE.MeshBasicMaterial({color:d.color,transparent:true,opacity:0.4,side:THREE.DoubleSide,depthWrite:false});
  dragonBody(s,d,K,{sk:bone,belly:null,dark:K.m(0xbab0a0),horn:K.m(0x8a8070),eye:K.g(d.color,2),wing,wbone:bone,ghost:true,spike:bone});
  for(let i=0;i<6;i++)M(s.g,G3.tor(0.75-Math.abs(i-2.5)*0.08,0.05,Math.PI*1.3,32,8),bone,[0,1.4,0.8-i*0.32],{r:[0,Math.PI/2,Math.PI*0.85]});M(s.g,G3.ell(0.4,0.4,0.5),s.fire,[0,1.35,0.1],{ol:0});return s;}},
{name:'Drago di lava',desc:'Pelle di roccia scura con crepe di lava, corna d\'ossidiana e ali di cenere.',
 make(d){const s=enemyShell(4),K=kitFor(s);s.fire=toon(0x401000,{emissive:0xff5a1e,emissiveIntensity:1.4});s.mats.push(s.fire);const rock=K.m(0x2a1e1c),obs=K.m(0x14101a);
  dragonBody(s,d,K,{sk:rock,belly:K.m(shadeC(d.color,0.6)),dark:obs,horn:obs,eye:K.g(0xffd040,2),wing:K.ds(0x3a2a28),spike:obs});
  for(let i=0;i<10;i++){const a=i*0.9,z=-0.9+i*0.2;M(s.g,G3.tube([[Math.sin(a)*0.9,1.5+Math.cos(a)*0.6,z],[Math.sin(a+0.2)*0.92,1.5+Math.cos(a+0.2)*0.62,z+0.15]],0.03,0.03,6,6),s.fire,null,{ol:0});}return s;}},
],
};
const BORDER=['slimeKing','golem','skelKing','bknight','archmage','batQueen','dragon'];
const BNAMES={slimeKing:'Re Melma',golem:'Golem',skelKing:'Re scheletro',bknight:'Maestro d\'armi',archmage:'Arcimago',batQueen:'Regina dei pipistrelli',dragon:'Drago'};
const BDEF={slimeKing:{color:0x86d46a,floor:5},golem:{color:0x8a8279,floor:10},skelKing:{color:0xc94a3a,floor:15},bknight:{color:0x7a8090,floor:20},archmage:{color:0x6a8aff,floor:25},batQueen:{color:0x8a4ab0,floor:35},dragon:{color:0xc0402a,floor:100}};
function buildBoss2(arch,v,d){const s=BOSSES[arch][v].make(d);s.tick=s.tick||[];return s;}

// skin scelte per ogni classe (0=A, 1=B, 2=C); le altre restano per evoluzioni o skin da sbloccare
const SKINPICK={cavaliere:0,berserker:0,lanciere:1,assassino:2,mago:0,criomante:0,tempesta:2,druido:1,astromante:2,negromante:2,paladino:0,arciere:2,samurai:2,monaco:1};
function buildHero(cls){return buildSkin(cls,SKINPICK[cls.id]||0);}
// arma scelta per tipo sul modello base e sui modelli senza disegno proprio; gli altri disegni vanno sui modelli con il nome corrispondente
const WNEW={spada:[2,1,3,4],ascia:[1,3,4,0],lancia:[1,3,0,4],pugnali:[0,1,3,2],martello:[2,0,1,3],falce:[2,1,0,3],katana:[0,1,3,2],pugni:[1,3,0,2],arco:[2,0,3,1]};
// nemici e guardiani scelti
const EPICK={slime:1,guard:1,mage:0,bat:1,archer:0,knight:2,imp:1,wraith:2,brute:0,shaman:0};
const BPICK={slimeKing:1,golem:1,skelKing:0,bknight:2,archmage:1,batQueen:2,dragon:0};

function enemyShell(barY){
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);
  const bar=new THREE.Group(),bg=new THREE.Mesh(new THREE.PlaneGeometry(1.1,0.14),new THREE.MeshBasicMaterial({color:0x0c0e13,transparent:true,opacity:.8,depthWrite:false}));
  const fill=new THREE.Mesh(new THREE.PlaneGeometry(1.06,0.1),new THREE.MeshBasicMaterial({color:0xe0434f,depthWrite:false}));fill.position.z=0.01;
  bar.add(bg);bar.add(fill);bar.position.set(0,barY,0.9);bar.visible=false;root.add(bar);
  return {root,body,bar,fill,mats:[]};
}
const BUILD={
  slime(){const s=enemyShell(1.45),gel=toon(0x86d46a,{emissive:0x1d4a12,emissiveIntensity:.35});s.mats.push(gel);
    s.blobG=new THREE.Group();s.body.add(s.blobG);
    s.blob=sphO(0.62,gel,0,0.48,0,s.blobG,40,28);s.blob.scale.set(1,.78,1);
    const ew=toon(0xffffff),eb=new THREE.MeshBasicMaterial({color:0x111111});
    for(const x of [-0.18,0.18]){sphO(0.12,ew,x,0.64,0.42,s.blobG,18,14);mesh(sph(0.065,14,10),eb,x,0.64,0.52,s.blobG,true);}
    const mouth=mesh(new THREE.TorusGeometry(0.09,0.02,6,16,Math.PI),eb,0,0.44,0.56,s.blobG,true);mouth.rotation.z=Math.PI;
    mesh(sph(0.09,12,10),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7}),0.2,0.86,0.32,s.blobG,true);return s;},
  guard(){const s=enemyShell(2.55),R=buildStick({limb:0xe8e0cc,head:0xefe7d4,tk:0.065,eyes:false});s.body.add(R.root);s.rig=R;s.mats.push(...R.mats);
    const bone=R.mats[0],rust=toon(0x8e3b2c),dark=toon(0x2b2620),eye=toon(0x200000,{emissive:0xff3b1f,emissiveIntensity:1});s.mats.push(rust);s.eye=eye;
    for(const x of [-0.1,0.1]){mesh(sph(0.075,12,10),dark,x,0.02,0.2,R.head,true);mesh(sph(0.032,10,8),eye,x,0.02,0.255,R.head,true);}
    boxO(0.22,0.08,0.17,0.04,bone,0,-0.2,0.06,R.head);
    geoO(new THREE.SphereGeometry(0.29,28,12,0,TAU,0,Math.PI*0.42),rust,0,0.04,0,R.head,0.29);
    for(let i=0;i<3;i++){const r=geoO(new THREE.TorusGeometry(0.17-i*0.015,0.03,8,24,Math.PI*1.5),bone,0,0.3+i*0.1,0,R.torso,0.2);r.rotation.set(Math.PI/2,0,-0.25*Math.PI);}
    const sp=new THREE.Group();sp.position.y=0.55;R.arms[0].wr.add(sp);
    geoO(new THREE.CylinderGeometry(0.04,0.04,2.3,12),toon(0x5a3a22),0,-1.0,0,sp,0.05);
    const st=mesh(new THREE.ConeGeometry(0.11,0.42,14),toon(0xc8ccd4),0,-2.35,0,sp);st.rotation.x=Math.PI;
    const shd=geoO(new THREE.CylinderGeometry(0.36,0.36,0.07,36),rust,0.07,-0.2,0.05,R.arms[1].el,0.36);shd.rotation.z=Math.PI/2;
    mesh(sph(0.08,14,10),dark,0.12,-0.2,0.05,R.arms[1].el);return s;},
  mage(){const s=enemyShell(2.85),R=buildStick({limb:0x3f2a5e,head:0xb8c4a0,tk:0.07,eyeGlow:0xd7a8ff});s.body.add(R.root);s.rig=R;s.mats.push(...R.mats);
    const robe=toon(0x5b3a8c),dark=toon(0x2b1d40),orbM=toon(0xc79bff,{emissive:0xa060ff,emissiveIntensity:1});s.mats.push(robe,dark);
    const rp=[[0,-0.88],[0.5,-0.88],[0.48,-0.82],[0.34,-0.3],[0.21,0.3],[0.16,0.56],[0,0.56]].map(p=>new THREE.Vector2(p[0],p[1]));
    s.robe=geoO(new THREE.LatheGeometry(rp,32),robe,0,0,0,R.pelvis,0.4);
    const belt=mesh(new THREE.TorusGeometry(0.22,0.04,8,32),toon(0xd9b45a),0,0.05,0,R.pelvis);belt.rotation.x=Math.PI/2;
    const beard=geoO(new THREE.ConeGeometry(0.15,0.38,16),toon(0xe6e2da),0,-0.22,0.13,R.head,0.15);beard.rotation.x=Math.PI;
    const hp=[[0.44,0],[0.42,0.05],[0.22,0.1],[0.16,0.38],[0.07,0.68],[0,0.78]].map(p=>new THREE.Vector2(p[0],p[1]));
    const hat=geoO(new THREE.LatheGeometry(hp,28),dark,0,0.13,0,R.head,0.4);hat.rotation.x=-0.18;
    const staff=new THREE.Group();R.arms[0].wr.add(staff);
    geoO(new THREE.CylinderGeometry(0.035,0.035,2.0,10),toon(0x4a3424),0,0.55,0,staff,0.05);
    s.orb=mesh(sph(0.17,24,18),orbM,0,1.62,0,staff,true);s.orbM=orbM;
    const rune=new THREE.MeshBasicMaterial({color:0xb46cff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    s.circle=new THREE.Group();s.circle.position.y=0.04;s.root.add(s.circle);
    for(const [r,w] of [[1.0,0.05],[0.75,0.03]]){const c=new THREE.Mesh(new THREE.RingGeometry(r-w,r,40),rune);c.rotation.x=-Math.PI/2;s.circle.add(c);}
    for(let i=0;i<6;i++){const sq=new THREE.Mesh(new THREE.PlaneGeometry(0.16,0.16),rune);sq.rotation.x=-Math.PI/2;sq.position.set(Math.cos(i*1.047)*0.87,0,Math.sin(i*1.047)*0.87);s.circle.add(sq);}
    s.runeM=rune;s.orbRing=mesh(new THREE.TorusGeometry(0.3,0.02,6,24),rune,0,1.62,0,staff,true);return s;},
  bat(){return makeBat(0x3d3149,0x5a4670,0x6b5a7a);},
  archer(){const s=enemyShell(2.55),R=buildStick({limb:0xd8d0bc,head:0xe6dccb,tk:0.062,eyes:false});s.body.add(R.root);s.rig=R;s.mats.push(...R.mats);
    const bone=R.mats[0],dark=toon(0x2b2620),eye=toon(0x200000,{emissive:0x7fe08a,emissiveIntensity:1}),wood=toon(0x6a4424),hood=toon(0x3c4a2e,{side:THREE.DoubleSide});s.mats.push(wood,hood);
    for(const x of [-0.1,0.1]){mesh(sph(0.07,12,10),dark,x,0.02,0.2,R.head,true);mesh(sph(0.03,10,8),eye,x,0.02,0.25,R.head,true);}
    boxO(0.2,0.07,0.16,0.035,bone,0,-0.19,0.06,R.head);
    mesh(new THREE.SphereGeometry(0.31,28,14,Math.PI/2+0.9,TAU-1.8,0,Math.PI*0.62),hood,0,0.03,-0.02,R.head);
    for(let i=0;i<3;i++){const r=geoO(new THREE.TorusGeometry(0.16-i*0.015,0.028,8,24,Math.PI*1.5),bone,0,0.3+i*0.1,0,R.torso,0.2);r.rotation.set(Math.PI/2,0,-0.25*Math.PI);}
    const q=capO(0.09,0.5,wood,0,0.42,-0.18,R.torso);q.rotation.x=0.35;
    for(let i=0;i<3;i++)mesh(cap3(0.014,0.22,6),toon(0xd9d2c0),(i-1)*0.045,0.78,-0.32,R.torso,true).rotation.x=0.35;
    const bg=new THREE.TorusGeometry(0.62,0.035,8,28,Math.PI*0.8);bg.rotateZ(-0.4*Math.PI);bg.rotateY(-Math.PI/2);
    const bow=new THREE.Group();R.arms[0].wr.add(bow);mesh(bg,wood,0,0,-0.62,bow);
    mesh(new THREE.CylinderGeometry(0.008,0.008,1.18,6),new THREE.MeshBasicMaterial({color:0xe8e0cc}),0,0,-0.43,bow,true);
    return s;},
  knight(){const s=enemyShell(2.7),R=buildStick({limb:0x3a3f4a,head:0x5a606c,tk:0.085,eyes:false});s.body.add(R.root);s.rig=R;s.mats.push(...R.mats);
    const steel=toon(0x6a7282),dark=toon(0x22252c),red=toon(0x9a2a2a),eye=toon(0x200000,{emissive:0xffb347,emissiveIntensity:1.2}),gold=toon(0xc89a52);s.mats.push(steel,red);
    geoO(new THREE.SphereGeometry(0.31,28,16,0,TAU,0,Math.PI*0.62),steel,0,0.02,0,R.head,0.31);
    mesh(rbox(0.42,0.06,0.1,0.03),dark,0,0,0.26,R.head,true);mesh(sph(0.04,10,8),eye,0.08,0,0.3,R.head,true);
    const pl=capO(0.06,0.32,red,0,0.36,-0.08,R.head);pl.rotation.x=-0.7;
    boxO(0.42,0.38,0.34,0.13,steel,0,-0.16,0.01,R.chest);for(const sd of [-1,1])sphO(0.13,steel,sd*0.16,-0.02,0,R.chest,16,12);
    const sw=new THREE.Group();R.arms[0].wr.add(sw);capO(0.04,0.16,dark,0,-0.04,0,sw,10);boxO(0.09,0.07,0.42,0.03,gold,0,-0.18,0,sw);mesh(bladeGeo(1.15,0.15,0.22),toon(0xdfe5ec),0,-0.21,0,sw);
    const sh=new THREE.Group();sh.position.set(0.1,-0.22,0.06);R.arms[1].el.add(sh);
    boxO(0.08,1.0,0.66,0.07,steel,0,0,0,sh);mesh(rbox(0.1,0.12,0.5,0.04),red,0.02,0.18,0,sh);mesh(rbox(0.1,0.6,0.12,0.04),red,0.02,-0.05,0,sh);
    return s;},
  imp(){const s=enemyShell(1.35),skin=toon(0xe0503a),dark=toon(0x5a1a14),belly=toon(0xffb347,{emissive:0xff7a2e,emissiveIntensity:0.6}),wing=toon(0x7a2a20,{side:THREE.DoubleSide});
    s.mats.push(skin,dark,belly,wing);s.belly=belly;s.g=new THREE.Group();s.body.add(s.g);
    sphO(0.36,skin,0,0.45,0,s.g,28,20);const b=mesh(sph(0.22,20,14),belly,0,0.38,0.2,s.g);b.scale.set(1,1,0.6);
    for(const x of [-0.15,0.15]){const h=mesh(new THREE.ConeGeometry(0.06,0.24,12),dark,x,0.82,0,s.g);h.rotation.z=x>0?-0.4:0.4;}
    const ew=new THREE.MeshBasicMaterial({color:0xfff27a});for(const x of [-0.12,0.12]){const e=mesh(sph(0.055,10,8),ew,x,0.55,0.31,s.g,true);e.scale.set(1,0.6,0.6);}
    const grin=mesh(new THREE.TorusGeometry(0.1,0.02,6,16,Math.PI),new THREE.MeshBasicMaterial({color:0x1a0806}),0,0.42,0.33,s.g,true);grin.rotation.z=Math.PI;
    for(const x of [-0.14,0.14])capO(0.05,0.12,dark,x,0.1,0,s.g);
    const tail=capO(0.03,0.4,dark,0,0.35,-0.36,s.g);tail.rotation.x=-0.9;
    const ws=new THREE.Shape();ws.moveTo(0,0);ws.quadraticCurveTo(0.3,0.35,0.5,0.2);ws.quadraticCurveTo(0.35,0.05,0.4,-0.1);ws.quadraticCurveTo(0.2,0,0,-0.05);ws.lineTo(0,0);
    const wg=new THREE.ExtrudeGeometry(ws,{depth:0.02,bevelEnabled:false,curveSegments:10});
    s.wings=[];for(const sd of [-1,1]){const pv=new THREE.Group();pv.position.set(sd*0.2,0.6,-0.15);s.g.add(pv);const m=mesh(wg,wing,0,0,0,pv);m.scale.x=sd;s.wings.push(pv);}
    return s;},
  wraith(){const s=enemyShell(2.5),cl=toon(0xbfe6ff,{transparent:true,opacity:0.8,side:THREE.DoubleSide}),dark=new THREE.MeshBasicMaterial({color:0x0a1420}),eye=new THREE.MeshBasicMaterial({color:0x7ff0ff});
    cl.userData.op=0.8;s.mats.push(cl);s.ghostMats=[cl];s.g=new THREE.Group();s.body.add(s.g);
    const pts=[[0,2.0],[0.28,1.95],[0.36,1.7],[0.34,1.3],[0.42,0.8],[0.55,0.25],[0.4,0.34],[0.3,0.12],[0.18,0.32],[0,0.18]].map(p=>new THREE.Vector2(p[0],p[1]));
    s.cloak=mesh(new THREE.LatheGeometry(pts,28),cl,0,0,0,s.g);
    const face=mesh(sph(0.22,20,14),dark,0,1.62,0.12,s.g,true);face.scale.set(1,1.1,0.7);
    for(const x of [-0.08,0.08])mesh(sph(0.045,10,8),eye,x,1.66,0.29,s.g,true);
    s.arms=[];for(const sd of [-1,1]){const pv=new THREE.Group();pv.position.set(sd*0.32,1.4,0);s.g.add(pv);const a=mesh(cap3(0.07,0.6,10),cl,0,-0.35,0.1,pv);a.rotation.x=-0.3;s.arms.push(pv);}
    return s;},
  brute(){const s=enemyShell(3.4),R=buildStick({limb:0x7a9a5a,head:0x8aaa66,body:0x6a5a40,tk:0.12,headR:0.3});s.body.add(R.root);s.rig=R;s.mats.push(...R.mats);s.body.scale.setScalar(1.45);s.rigScale=1.45;
    const hide=toon(0x6a4a2e),wood=toon(0x5a3a22),iron2=toon(0x6a6e78),tooth=toon(0xf3ead7);s.mats.push(hide,wood);
    const belly=sphO(0.3,R.mats[0],0,0.32,0.08,R.torso,24,18);belly.scale.set(1.2,1.1,1);
    for(const x of [-0.1,0.1])mesh(new THREE.ConeGeometry(0.035,0.1,8),tooth,x,-0.12,0.25,R.head,true);
    mesh(rbox(0.38,0.08,0.06,0.02),toon(0x2a2a20),0,0.1,0.27,R.head,true);
    boxO(0.5,0.22,0.36,0.08,hide,0,0.05,0,R.pelvis);
    const club=new THREE.Group();R.arms[0].wr.add(club);
    capO(0.05,0.5,wood,0,-0.3,0,club);geoO(new THREE.CylinderGeometry(0.2,0.12,0.7,16),wood,0,-0.95,0,club,0.18);
    for(let i=0;i<4;i++){const a=i*Math.PI/2,sp=mesh(new THREE.ConeGeometry(0.05,0.16,8),iron2,Math.cos(a)*0.19,-1.05,Math.sin(a)*0.19,club);sp.rotation.set(Math.sin(a)*Math.PI/2,0,-Math.cos(a)*Math.PI/2);}
    return s;},
  shaman(){const s=enemyShell(2.85),R=buildStick({limb:0x2a3a2e,head:0xe8e0cc,tk:0.07,eyeGlow:0x6aff9a});s.body.add(R.root);s.rig=R;s.mats.push(...R.mats);
    const robe=toon(0x2f5a3a),bone=toon(0xe8e0cc),orbM=toon(0x9affc0,{emissive:0x30ff80,emissiveIntensity:1}),hood=toon(0x1a2a1e,{side:THREE.DoubleSide});s.mats.push(robe,bone);
    const rp=[[0,-0.88],[0.5,-0.88],[0.48,-0.82],[0.34,-0.3],[0.21,0.3],[0.16,0.56],[0,0.56]].map(p=>new THREE.Vector2(p[0],p[1]));
    s.robe=geoO(new THREE.LatheGeometry(rp,32),robe,0,0,0,R.pelvis,0.4);
    mesh(new THREE.SphereGeometry(0.31,28,16,Math.PI/2+0.9,TAU-1.8,0,Math.PI*0.7),hood,0,0.02,-0.03,R.head);
    for(const sd of [-1,1]){const h=mesh(new THREE.TorusGeometry(0.16,0.035,8,16,Math.PI*0.8),bone,sd*0.22,0.22,0,R.head);h.rotation.set(0,Math.PI/2,sd>0?0.4:Math.PI-0.4);}
    for(let i=0;i<5;i++)mesh(sph(0.045,10,8),toon(0xd9b45a),(i-2)*0.07,0.42-Math.abs(i-2)*0.03,0.16,R.torso,true);
    const staff=new THREE.Group();R.arms[0].wr.add(staff);geoO(new THREE.CylinderGeometry(0.035,0.035,2.0,10),toon(0x3a2a1a),0,0.55,0,staff,0.05);
    sphO(0.13,bone,0,1.6,0,staff,16,12);s.orb=mesh(sph(0.12,20,14),orbM,0,1.8,0,staff,true);s.orbM=orbM;
    return s;},
};
for(const t in EPICK)if(BUILD[t])BUILD[t]=()=>buildEnemy2(t,EPICK[t]);

/* ---------- nuovi mostri ---------- */
function crawlerLegs(s,par,K,mat,n,o){s.legs=[];for(let i=0;i<n;i++){const sd=i%2?1:-1,row=i>>1,rows=n>>1,z=o.z0-row*o.dz,zf=((rows-1)/2-row)*o.fan,pv=new THREE.Group();pv.position.set(sd*o.x,o.y,z);par.add(pv);
    M(pv,G3.tube([[0,0,0],[sd*o.knee,o.up,zf*0.6],[sd*o.reach,-o.y+0.02,zf]],o.r||0.045,0.015,14,8),mat,null);s.legs.push(pv);}}
Object.assign(BUILD,{
  spider(){const s=enemyShell(1.4),K=kitFor(s),shell=K.m(0x2e2438),fur=K.m(0x4a3a5a),mark=K.g(0xd83a4a,0.9),leg=K.m(0x1e1826),eye=K.g(0xff4a3a,2),fang=K.m(0xe8dcc8);s.g=new THREE.Group();s.body.add(s.g);
    M(s.g,G3.ell(0.5,0.42,0.6),fur,[0,0.62,-0.42]);M(s.g,G3.ell(0.3,0.26,0.34),shell,[0,0.55,0.26]);M(s.g,G3.ell(0.16,0.2,0.05),mark,[0,0.92,-0.48],{r:[-0.5,0,0],ol:0});
    for(const x of [-1,1]){M(s.g,G3.ell(0.06,0.06,0.05),eye,[x*0.1,0.66,0.54],{ol:0});M(s.g,G3.ell(0.035,0.035,0.03),eye,[x*0.2,0.68,0.46],{ol:0});M(s.g,G3.cone(0.04,0.18,14),fang,[x*0.08,0.36,0.54],{r:[Math.PI-0.3,0,0]});}
    crawlerLegs(s,s.g,K,leg,8,{x:0.2,y:0.58,z0:0.42,dz:0.24,fan:0.34,knee:0.42,up:0.34,reach:0.86});return s;},
  fungus(){const s=enemyShell(2.15),K=kitFor(s),stem=K.m(0xe6dcc0),cap=K.m(0xc8402e),spot=K.m(0xf5ecd8),gill=K.m(0xb89a78),eye=K.g(0x9ae06a,2);s.g=new THREE.Group();s.body.add(s.g);
    M(s.g,G3.lathe([[0.01,0],[0.36,0],[0.4,0.1],[0.3,0.4],[0.26,0.8],[0.3,1.05],[0.01,1.05]],28),stem,[0,0,0]);
    for(const x of [-1,1]){M(s.g,G3.ell(0.07,0.09,0.04),eye,[x*0.12,0.72,0.25],{ol:0});M(s.g,G3.limb(0.05,0.035,0.34),stem,[x*0.36,0.5,0.04],{r:[0,0,x*0.5]});}
    M(s.g,G3.tor(0.07,0.016,Math.PI,18,6),K.dark,[0,0.52,0.28],{r:[0,0,Math.PI],ol:0});
    s.cap=new THREE.Group();s.cap.position.y=1.0;s.g.add(s.cap);M(s.cap,G3.dome(0.72,0.5,0.72,1),cap,[0,0,0]);M(s.cap,G3.cyl(0.7,0.26,0.05,30),gill,[0,-0.01,0],{ol:0});
    for(let i=0;i<8;i++){const th=i?(i%2?0.62:1.02):0,a=i*2.35,S_=0.72*Math.sin(th);M(s.cap,G3.ell(0.11,0.05,0.11),spot,[S_*Math.cos(a),0.518*Math.cos(th),S_*Math.sin(a)],{ol:0});}return s;},
  gargoyle(){const s=enemyShell(2.05),K=kitFor(s),st=K.m(0x7c7c88),dk=K.m(0x55555f),wing=K.ds(0x62626e),eye=K.g(0xff9a2e,2.2);s.g=new THREE.Group();s.body.add(s.g);
    M(s.g,G3.ell(0.4,0.46,0.32),st,[0,0.78,0]);M(s.g,G3.ell(0.25,0.23,0.25),st,[0,1.34,0.08]);M(s.g,G3.ell(0.14,0.1,0.15),dk,[0,1.26,0.28]);
    for(const x of [-1,1]){M(s.g,G3.tube([[x*0.14,1.5,0.02],[x*0.3,1.68,-0.04],[x*0.26,1.92,-0.18]],0.055,0.008,12,8),dk,null);M(s.g,G3.ell(0.05,0.035,0.025),eye,[x*0.1,1.38,0.28],{ol:0});M(s.g,G3.cone(0.025,0.09,10),K.m(0xe8e0cc),[x*0.06,1.17,0.34],{r:[Math.PI,0,0],ol:0});
      M(s.g,G3.limb(0.1,0.07,0.56,0.01),st,[x*0.48,0.8,0.12],{r:[-0.5,0,x*0.25]});for(const j of [-1,0,1])M(s.g,G3.cone(0.03,0.14,8),dk,[x*0.56+j*0.05,0.52,0.3],{r:[Math.PI-0.4,0,0]});
      M(s.g,G3.limb(0.12,0.08,0.44,0.01),st,[x*0.22,0.28,0.1],{r:[-0.8,0,0]});M(s.g,G3.ell(0.1,0.06,0.17),dk,[x*0.22,0.07,0.28]);}
    M(s.g,G3.tube([[0,0.5,-0.25],[0,0.2,-0.6],[0,0.32,-0.95]],0.08,0.012,14,8),st,null);M(s.g,G3.cone(0.08,0.2,4),dk,[0,0.36,-1.04],{r:[-Math.PI/2,0,0]});
    for(let i=0;i<4;i++)M(s.g,G3.cone(0.05,0.14,8),dk,[0,1.14-i*0.2,-0.28+i*0.01],{r:[-1.2,0,0]});
    membrane(s,s.body,K,wing,dk,{span:1.25,y:1.05,x:0.26,z:-0.18});return s;},
  shade(){const {s,R,K}=hum({skin:0x14101f,shirt:0x221b33,sleeve:0x221b33,pants:0x1a1528,boot:0x120e1c,glove:0x14101f,build:0.9},2.55),cloth=K.ds(0x2e2444),steel=K.m(0xb8acff,{emissive:0x5a3aff,emissiveIntensity:0.5}),grip=K.m(0x2a2030),eye=K.g(0x8a6aff,2.4);
    R.face.visible=false;SP.hood(R,cloth,{depth:0.72});SP.flap(R,cloth,{len:0.24,n:2,jag:0.06});SP.backFlap(R,cloth,{len:0.26,n:2});SP.belt(R,grip,steel);
    for(const x of [-1,1])M(R.head,G3.ell(0.03,0.02,0.014),eye,[x*0.075,0.02,0.19],{ol:0});
    for(const a of R.arms){const d=new THREE.Group();a.wr.add(d);M(d,G3.rb(0.03,0.16,0.03),grip,[0,-0.06,0]);M(d,G3.rb(0.12,0.025,0.04),steel,[0,-0.15,0],{ol:0});M(d,G3.cone(0.05,0.6,10),steel,[0,-0.46,0],{r:[Math.PI,0,0]});}return s;},
  scorpion(){const s=enemyShell(1.8),K=kitFor(s),sh=K.m(0xb8862e),dk=K.m(0x7a5518),sting=K.g(0xa6e34a,1.6),eye=K.g(0xffe27a,2),leg=K.m(0x5a3f12);s.g=new THREE.Group();s.body.add(s.g);
    for(let i=0;i<4;i++)M(s.g,G3.ell(0.4-i*0.04,0.22,0.24),i%2?dk:sh,[0,0.42,0.3-i*0.3]);M(s.g,G3.ell(0.3,0.2,0.24),sh,[0,0.4,0.56]);for(const x of [-1,1])M(s.g,G3.ell(0.04,0.04,0.03),eye,[x*0.12,0.54,0.74],{ol:0});
    s.tail=new THREE.Group();s.tail.position.set(0,0.5,-0.72);s.g.add(s.tail);M(s.tail,G3.tube([[0,0,0],[0,0.5,-0.25],[0,1.05,-0.15],[0,1.35,0.25]],0.11,0.06,20,10),sh,null);M(s.tail,G3.ell(0.12,0.12,0.16),dk,[0,1.38,0.28]);M(s.tail,G3.cone(0.05,0.28,12),sting,[0,1.3,0.52],{r:[Math.PI/2+0.4,0,0]});
    s.claws=[];for(const x of [-1,1]){const c=new THREE.Group();c.position.set(x*0.3,0.42,0.6);s.g.add(c);M(c,G3.tube([[0,0,0],[x*0.25,0.02,0.22],[x*0.2,0.04,0.5]],0.07,0.055,12,8),sh,null);M(c,G3.ell(0.15,0.09,0.2),sh,[x*0.2,0.05,0.62]);for(const j of [-1,1])M(c,G3.cone(0.05,0.26,10),dk,[x*0.2+j*0.075,0.05,0.86],{r:[Math.PI/2,0,0]});s.claws.push(c);}
    crawlerLegs(s,s.g,K,leg,6,{x:0.3,y:0.42,z0:0.24,dz:0.3,fan:0.26,knee:0.42,up:0.2,reach:0.76,r:0.05});return s;},
  salamander(){const s=enemyShell(1.55),K=kitFor(s),sk=K.m(0xe0602a),dk=K.m(0x8a2f14),belly=K.g(0xffc04a,1.1),eye=K.g(0xfff27a,2.2);s.g=new THREE.Group();s.body.add(s.g);
    M(s.g,G3.ell(0.34,0.24,0.62),sk,[0,0.42,-0.05]);M(s.g,G3.ell(0.26,0.12,0.5),belly,[0,0.27,-0.05],{ol:0});for(let i=0;i<6;i++)M(s.g,G3.cone(0.06,0.2,10),dk,[0,0.72-Math.abs(i-2)*0.025,0.42-i*0.2],{r:[-0.3,0,0]});
    s.head=new THREE.Group();s.head.position.set(0,0.5,0.55);s.g.add(s.head);M(s.head,G3.ell(0.26,0.17,0.34),sk,[0,0.02,0.16]);for(const x of [-1,1]){M(s.head,G3.ell(0.05,0.05,0.04),eye,[x*0.16,0.13,0.26],{ol:0});for(let j=0;j<3;j++)M(s.head,G3.cone(0.05,0.3,8),dk,[x*(0.2+j*0.03),0.1+j*0.08,-0.1],{r:[-0.9,0,-x*(1.0-j*0.4)]});}
    s.jaw=new THREE.Group();s.jaw.position.set(0,-0.08,0.04);s.head.add(s.jaw);M(s.jaw,G3.ell(0.22,0.06,0.3),dk,[0,-0.03,0.16]);M(s.jaw,G3.ell(0.14,0.02,0.2),K.g(0xff7a2e,1.6),[0,0.02,0.16],{ol:0});
    s.tail=new THREE.Group();s.tail.position.set(0,0.42,-0.6);s.g.add(s.tail);M(s.tail,G3.tube([[0,0,0],[0.02,-0.02,-0.5],[0,0.06,-1.05]],0.2,0.02,18,10),sk,null);M(s.tail,G3.ell(0.09,0.16,0.09),K.add(0xff7a2e,0.85),[0,0.14,-1.08],{ol:0});
    s.legs=[];for(const [sd,z] of [[-1,0.35],[1,0.35],[-1,-0.38],[1,-0.38]]){const pv=new THREE.Group();pv.position.set(sd*0.28,0.38,z);s.g.add(pv);M(pv,G3.limb(0.08,0.055,0.38),sk,[sd*0.12,-0.14,0],{r:[0,0,sd*0.6]});M(pv,G3.ell(0.1,0.04,0.14),dk,[sd*0.24,-0.33,0.04]);s.legs.push(pv);}return s;},
  eye(){const s=enemyShell(1.8),K=kitFor(s),white=K.m(0xf0e6e0),fl=K.m(0x6a2a4a),dk=K.m(0x3a1428);s.g=new THREE.Group();s.g.position.y=0.65;s.body.add(s.g);
    M(s.g,G3.ell(0.56,0.56,0.56),white,[0,0,0]);M(s.g,G3.dome(0.6,0.34,1,1),fl,[0,0.02,-0.02],{r:[-0.25,0,0]});M(s.g,G3.dome(0.6,0.28,1,1),fl,[0,-0.02,-0.02],{r:[Math.PI+0.3,0,0]});
    s.iris=new THREE.Group();s.iris.position.z=0.5;s.g.add(s.iris);M(s.iris,G3.ell(0.27,0.27,0.08),K.g(0xff2e7a,1.8),[0,0,0],{ol:0});M(s.iris,G3.ell(0.1,0.17,0.05),K.dark,[0,0,0.07],{ol:0});
    for(let i=0;i<6;i++){const v=new THREE.Group();const a=i/6*TAU;v.position.set(Math.cos(a)*0.34,-0.42,Math.sin(a)*0.34);s.g.add(v);M(v,G3.tube([[0,0,0],[Math.cos(a)*0.14,-0.34,Math.sin(a)*0.14],[-Math.cos(a)*0.06,-0.68,-Math.sin(a)*0.06],[Math.cos(a)*0.1,-0.98,Math.sin(a)*0.1]],0.07,0.012,16,8),i%2?fl:dk,null);(s.tent=s.tent||[]).push(v);}
    return s;},
  minotaur(){const {s,R,K}=hum({skin:0x6a3f2a,shirt:'skin',sleeve:'skin',pants:0x3a2418,boot:0x2a1a10,hair:0x2a1810,build:1.35},3.5),horn=K.m(0xe8dcc0),hide=K.m(0x4a2e1c),iron=K.m(0x6a6e78),wood=K.m(0x4a3220),muz=K.m(0x8a6048),eye=K.g(0xff3b1f,2.2);
    s.body.scale.setScalar(1.5);s.rigScale=1.5;R.face.visible=false;M(R.torso,G3.ell(0.25,0.23,0.21),R.skinM,[0,0.32,0.05]);
    M(R.head,G3.ell(0.24,0.24,0.27),R.skinM,[0,0.02,0.03]);M(R.head,G3.ell(0.15,0.12,0.14),muz,[0,-0.08,0.25]);M(R.head,G3.tor(0.05,0.013,TAU,18,6),iron,[0,-0.15,0.32],{r:[Math.PI/2,0,0],ol:0});
    for(const x of [-1,1]){M(R.head,G3.tube([[x*0.2,0.12,0],[x*0.42,0.2,0.02],[x*0.5,0.44,0.08]],0.06,0.008,14,8),horn,null);M(R.head,G3.ell(0.03,0.022,0.015),eye,[x*0.11,0.07,0.25],{ol:0});M(R.head,G3.ell(0.09,0.04,0.05),R.skinM,[x*0.27,0.03,-0.02],{r:[0,0,x*0.3]});M(R.head,G3.ell(0.02,0.02,0.012),K.dark,[x*0.05,-0.06,0.38],{ol:0});}
    SP.flap(R,hide,{len:0.22,w0:0.28,jag:0.04});SP.backFlap(R,hide,{len:0.22});SP.belt(R,hide,iron,{t:0.035});SP.bracer(R,hide,{ring:iron});
    const ax=new THREE.Group();R.arms[0].wr.add(ax);M(ax,G3.limb(0.05,0.055,1.5),wood,[0,-0.55,0]);for(const z of [-1,1])M(ax,G3.shape(sh=>{sh.moveTo(0,0.1);sh.quadraticCurveTo(0.3*z,0.34,0.5*z,0.3);sh.quadraticCurveTo(0.4*z,0,0.5*z,-0.3);sh.quadraticCurveTo(0.3*z,-0.34,0,-0.1);sh.lineTo(0,0.1);},0.03,0.01),iron,[0,-1.2,0],{r:[0,Math.PI/2,0]});return s;},
});
function makeBat(furC,wingC,muzzC){const s=enemyShell(1.15),fur=toon(furC),wing=toon(wingC,{side:THREE.DoubleSide}),eye=new THREE.MeshBasicMaterial({color:0xff5a3a});s.mats.push(fur,wing);
  sphO(0.33,fur,0,0.4,0,s.body,28,20);mesh(sph(0.2,20,14),toon(muzzC),0,0.32,0.18,s.body);
  for(const x of [-0.14,0.14]){const e=geoO(new THREE.ConeGeometry(0.08,0.24,14),fur,x,0.74,0,s.body,0.1);e.rotation.z=x>0?-0.25:0.25;}
  for(const x of [-0.11,0.11])mesh(sph(0.05,10,8),eye,x,0.46,0.29,s.body,true);
  for(const x of [-0.06,0.06]){const f=mesh(new THREE.ConeGeometry(0.02,0.08,8),new THREE.MeshBasicMaterial({color:0xffffff}),x,0.27,0.3,s.body,true);f.rotation.x=Math.PI;}
  const ws=new THREE.Shape();ws.moveTo(0,0.1);ws.quadraticCurveTo(0.5,0.48,1.0,0.25);ws.quadraticCurveTo(0.85,0.05,0.9,-0.15);ws.quadraticCurveTo(0.7,-0.05,0.6,-0.25);ws.quadraticCurveTo(0.45,-0.08,0.3,-0.2);ws.quadraticCurveTo(0.2,0,0,-0.08);ws.lineTo(0,0.1);
  const wg=new THREE.ExtrudeGeometry(ws,{depth:0.02,bevelEnabled:false,curveSegments:14});
  s.wings=[];for(const sd of [-1,1]){const pv=new THREE.Group();pv.position.set(sd*0.24,0.45,-0.02);s.body.add(pv);const m=mesh(wg,wing,0,0,0,pv);m.scale.x=sd;s.wings.push(pv);}return s;}
function makeCrown(parent,y,r,gold,gem){const c=new THREE.Group();c.position.y=y;parent.add(c);
  mesh(new THREE.CylinderGeometry(r,r*1.08,r*0.6,20,1,true),gold,0,0,0,c);
  for(let i=0;i<6;i++){const a=i/6*TAU;mesh(new THREE.ConeGeometry(r*0.2,r*0.55,8),gold,Math.cos(a)*r,r*0.5,Math.sin(a)*r,c);}
  for(let i=0;i<3;i++){const a=i/3*TAU+0.5;mesh(sph(r*0.12,10,8),gem,Math.cos(a)*r*1.04,0,Math.sin(a)*r*1.04,c,true);}return c;}
// Guardiani: un modello per ogni tipo, colorato secondo il guardiano del piano
const BOSSB={
  golem(d){const s=enemyShell(4),stone=toon(d.color),dark=toon(shade(d.color,0.6)),core=toon(0x331a00,{emissive:ZONES[zoneIndex(d.floor)].light,emissiveIntensity:1.4});
    s.mats.push(stone,dark);s.core=core;s.legs=[];s.noBar=true;
    s.torso=new THREE.Group();s.body.add(s.torso);
    for(const x of [-0.55,0.55]){const pv=new THREE.Group();pv.position.set(x,1.15,0);s.body.add(pv);boxO(0.75,1.15,0.85,0.22,dark,0,-0.55,0,pv);s.legs.push(pv);}
    boxO(1.95,1.75,1.3,0.4,stone,0,2.1,0,s.torso);mesh(sph(0.3,24,18),core,0,2.2,0.58,s.torso,true);
    for(let i=0;i<3;i++)mesh(rbox(1.3-i*0.3,0.08,0.06,0.03),core,0,1.6+i*0.55,0.66,s.torso,true);
    s.head=new THREE.Group();s.head.position.y=3.32;s.torso.add(s.head);boxO(0.95,0.78,0.9,0.28,stone,0,0,0,s.head);
    for(const x of [-0.2,0.2])mesh(sph(0.09,14,10),core,x,0.04,0.43,s.head,true);
    s.arms=[];for(const sd of [-1,1]){const pv=new THREE.Group();pv.position.set(sd*1.3,2.8,0);s.torso.add(pv);boxO(0.7,1.7,0.7,0.25,stone,0,-0.8,0,pv);boxO(0.88,0.62,0.88,0.28,dark,0,-1.75,0,pv);s.arms.push(pv);}
    return s;},
  slimeKing(d){const s=enemyShell(3.2),gel=toon(d.color,{emissive:shade(d.color,0.35),emissiveIntensity:.35}),gold=toon(0xe0b84a,{emissive:0x6a4a00,emissiveIntensity:0.3});s.mats.push(gel,gold);s.noBar=true;
    s.blobG=new THREE.Group();s.body.add(s.blobG);
    s.blob=sphO(1.5,gel,0,1.15,0,s.blobG,40,28);s.blob.scale.set(1,0.78,1);
    const ew=toon(0xffffff),eb=new THREE.MeshBasicMaterial({color:0x111111});
    for(const x of [-0.45,0.45]){sphO(0.26,ew,x,1.5,1.12,s.blobG,18,14);mesh(sph(0.14,14,10),eb,x,1.5,1.34,s.blobG,true);}
    const mouth=mesh(new THREE.TorusGeometry(0.26,0.05,8,20,Math.PI),eb,0,1.0,1.38,s.blobG,true);mouth.rotation.z=Math.PI;
    for(let i=0;i<4;i++)mesh(sph(rand(0.12,0.22),12,10),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35}),rand(-0.8,0.8),rand(0.7,1.6),rand(0.6,1.1),s.blobG,true);
    makeCrown(s.blobG,2.3,0.5,gold,new THREE.MeshBasicMaterial({color:0xff4d6d}));
    return s;},
  skelKing(d){const s=enemyShell(4.4),R=buildStick({limb:0xe8e0cc,head:0xefe7d4,tk:0.07,eyes:false});s.body.add(R.root);s.rig=R;s.mats.push(...R.mats);s.body.scale.setScalar(1.8);s.rigScale=1.8;s.noBar=true;
    const bone=R.mats[0],arm=toon(d.color),gold=toon(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.3}),dark=toon(0x2b2620),eye=toon(0x200000,{emissive:d.color,emissiveIntensity:1.6}),capeM=toon(shade(d.color,0.55),{side:THREE.DoubleSide});s.mats.push(arm,gold,capeM);
    for(const x of [-0.1,0.1]){mesh(sph(0.075,12,10),dark,x,0.02,0.2,R.head,true);mesh(sph(0.035,10,8),eye,x,0.02,0.255,R.head,true);}
    boxO(0.22,0.08,0.17,0.04,bone,0,-0.2,0.06,R.head);makeCrown(R.head,0.26,0.22,gold,new THREE.MeshBasicMaterial({color:d.color}));
    for(let i=0;i<3;i++){const r=geoO(new THREE.TorusGeometry(0.17-i*0.015,0.03,8,24,Math.PI*1.5),bone,0,0.3+i*0.1,0,R.torso,0.2);r.rotation.set(Math.PI/2,0,-0.25*Math.PI);}
    for(const sd of [-1,1]){const pa=sphO(0.14,arm,sd*0.16,-0.02,0,R.chest,16,12);pa.scale.set(1,0.75,1.1);}
    const cape=new THREE.Group();cape.position.set(0,-0.02,-0.13);R.chest.add(cape);boxO(0.46,1.0,0.03,0.014,capeM,0,-0.5,0,cape);s.cape=cape;
    const sw=new THREE.Group();R.arms[0].wr.add(sw);capO(0.045,0.26,dark,0,0,0,sw,10);boxO(0.1,0.08,0.5,0.03,gold,0,-0.2,0,sw);mesh(bladeGeo(1.5,0.2,0.28),toon(0xd8dce4,{emissive:d.color,emissiveIntensity:0.12}),0,-0.24,0,sw);
    return s;},
  bknight(d){const s=enemyShell(4),R=buildStick({limb:0x2a2d36,head:0x3a3f4a,tk:0.09,eyes:false});s.body.add(R.root);s.rig=R;s.mats.push(...R.mats);s.body.scale.setScalar(1.6);s.rigScale=1.6;s.noBar=true;
    const arm=toon(d.color),dark=toon(0x1a1c22),gold=toon(0xd9b45a),eye=toon(0x200000,{emissive:0xff5a3a,emissiveIntensity:1.5}),plume=toon(shade(d.color,1.3)),capeM=toon(0x5a1a1a,{side:THREE.DoubleSide});s.mats.push(arm,gold,capeM);
    geoO(new THREE.SphereGeometry(0.32,28,16,0,TAU,0,Math.PI*0.66),arm,0,0.02,0,R.head,0.32);
    mesh(rbox(0.44,0.07,0.1,0.03),dark,0,0,0.27,R.head,true);for(const x of [-0.09,0.09])mesh(sph(0.035,10,8),eye,x,0,0.31,R.head,true);
    for(let i=0;i<3;i++){const pl=capO(0.06,0.25,plume,0,0.34-i*0.05,-0.05-i*0.12,R.head);pl.rotation.x=-0.5-i*0.35;}
    boxO(0.46,0.42,0.36,0.14,arm,0,-0.16,0.01,R.chest);for(const sd of [-1,1]){const pa=sphO(0.16,arm,sd*0.18,-0.02,0,R.chest,16,12);pa.scale.set(1,0.8,1.1);}
    const cape=new THREE.Group();cape.position.set(0,-0.02,-0.15);R.chest.add(cape);boxO(0.5,1.1,0.035,0.016,capeM,0,-0.55,0,cape);s.cape=cape;
    const sw=new THREE.Group();R.arms[0].wr.add(sw);capO(0.045,0.32,dark,0,0.02,0,sw,10);boxO(0.1,0.08,0.56,0.03,gold,0,-0.22,0,sw);mesh(bladeGeo(1.7,0.22,0.3),toon(0xdfe5ec,{emissive:d.color,emissiveIntensity:0.15}),0,-0.26,0,sw);
    return s;},
  archmage(d){const s=enemyShell(4),R=buildStick({limb:shade(d.color,0.45),head:0xb8c4a0,tk:0.07,eyeGlow:d.color});s.body.add(R.root);s.rig=R;s.mats.push(...R.mats);s.body.scale.setScalar(1.5);s.rigScale=1.5;s.noBar=true;
    const robe=toon(d.color),dark=toon(shade(d.color,0.35)),gold=toon(0xd9b45a),orbM=toon(0xffffff,{emissive:d.color,emissiveIntensity:1.2}),glow=new THREE.MeshBasicMaterial({color:d.color});s.mats.push(robe,dark);
    const rp=[[0,-1.0],[0.55,-1.0],[0.52,-0.92],[0.36,-0.3],[0.22,0.3],[0.17,0.56],[0,0.56]].map(p=>new THREE.Vector2(p[0],p[1]));
    s.robe=geoO(new THREE.LatheGeometry(rp,32),robe,0,0,0,R.pelvis,0.4);
    for(let i=0;i<3;i++){const b=mesh(new THREE.TorusGeometry(0.4-i*0.12,0.025,8,32),gold,0,-0.75+i*0.5,0,R.pelvis);b.rotation.x=Math.PI/2;}
    const beard=geoO(new THREE.ConeGeometry(0.16,0.5,16),toon(0xe6e2da),0,-0.28,0.13,R.head,0.15);beard.rotation.x=Math.PI;
    const hp=[[0.5,0],[0.47,0.05],[0.24,0.1],[0.17,0.42],[0.07,0.8],[0,0.92]].map(p=>new THREE.Vector2(p[0],p[1]));
    const hat=geoO(new THREE.LatheGeometry(hp,28),dark,0,0.13,0,R.head,0.4);hat.rotation.x=-0.22;
    for(let i=0;i<4;i++)mesh(sph(0.03,8,6),glow,Math.cos(i*1.6)*0.2,0.3+i*0.12,Math.sin(i*1.6)*0.2,hat,true);
    const staff=new THREE.Group();R.arms[0].wr.add(staff);geoO(new THREE.CylinderGeometry(0.04,0.04,2.2,10),toon(0x3a2a1a),0,0.6,0,staff,0.05);
    s.orb=mesh(sph(0.22,24,18),orbM,0,1.8,0,staff,true);s.orbM=orbM;
    s.orbit=new THREE.Group();s.body.add(s.orbit);for(let i=0;i<3;i++){const a=i/3*TAU;mesh(sph(0.1,14,10),glow,Math.cos(a)*0.9,0,Math.sin(a)*0.9,s.orbit,true);}
    return s;},
  batQueen(d){const s=makeBat(d.color,shade(d.color,0.7),shade(d.color,1.3));s.body.scale.setScalar(2.6);s.noBar=true;
    const gold=toon(0xe0b84a,{emissive:0x6a4a00,emissiveIntensity:0.3});s.mats.push(gold);makeCrown(s.body,0.72,0.16,gold,new THREE.MeshBasicMaterial({color:0xff4d6d}));
    return s;},
  dragon(d){const s=enemyShell(4),sk=toon(d.color),belly=toon(0xe0b070),dark=toon(shade(d.color,0.55)),horn=toon(0xefe7d4),wingM=toon(shade(d.color,0.75),{side:THREE.DoubleSide}),eye=toon(0x200000,{emissive:0xffd040,emissiveIntensity:1.6}),fire=toon(0x401000,{emissive:0xff7a2e,emissiveIntensity:1.2});
    s.mats.push(sk,belly,dark,wingM,horn);s.noBar=true;s.fire=fire;
    s.g=new THREE.Group();s.body.add(s.g);
    const torso=sphO(1.0,sk,0,1.5,0,s.g,32,24);torso.scale.set(0.95,0.85,1.5);
    const bel=mesh(sph(0.9,28,20),belly,0,1.3,0.25,s.g);bel.scale.set(0.8,0.7,1.35);
    s.neck=new THREE.Group();s.neck.position.set(0,1.9,1.2);s.g.add(s.neck);
    const nk=capO(0.32,0.9,sk,0,0.45,0.3,s.neck);nk.rotation.x=0.6;
    s.head=new THREE.Group();s.head.position.set(0,0.95,0.7);s.neck.add(s.head);
    boxO(0.62,0.5,0.8,0.22,sk,0,0,0.15,s.head);boxO(0.5,0.3,0.55,0.14,sk,0,0.02,0.65,s.head);
    s.jaw=new THREE.Group();s.jaw.position.set(0,-0.2,-0.1);s.head.add(s.jaw);boxO(0.48,0.16,0.85,0.07,dark,0,-0.06,0.5,s.jaw);
    for(const x of [-0.2,0.2]){const h=mesh(new THREE.ConeGeometry(0.08,0.6,10),horn,x,0.32,-0.25,s.head);h.rotation.x=-2.2;mesh(sph(0.075,12,10),eye,x*1.1,0.12,0.38,s.head,true);mesh(sph(0.05,10,8),fire,x*0.6,0.06,0.93,s.head,true);}
    s.tail=[];let par=s.g;for(let i=0;i<4;i++){const seg=new THREE.Group();if(i===0)seg.position.set(0,1.4,-1.3);else seg.position.set(0,0,-0.7);par.add(seg);const c=capO(0.28-i*0.05,0.5,sk,0,0,-0.35,seg);c.rotation.x=Math.PI/2;s.tail.push(seg);par=seg;}
    const tip=mesh(new THREE.ConeGeometry(0.22,0.5,4),dark,0,0,-0.75,par);tip.rotation.x=-Math.PI/2;
    s.legs=[];for(const [x,z] of [[-0.6,0.7],[0.6,0.7],[-0.6,-0.7],[0.6,-0.7]]){const pv=new THREE.Group();pv.position.set(x,1.1,z);s.g.add(pv);capO(0.22,0.55,sk,0,-0.45,0,pv);boxO(0.36,0.18,0.5,0.08,dark,0,-1.0,0.1,pv);s.legs.push(pv);}
    const ws=new THREE.Shape(),K=3.2;ws.moveTo(0,0.1*K);ws.quadraticCurveTo(0.5*K,0.48*K,1.0*K,0.25*K);ws.quadraticCurveTo(0.85*K,0.05*K,0.9*K,-0.15*K);ws.quadraticCurveTo(0.7*K,-0.05*K,0.6*K,-0.25*K);ws.quadraticCurveTo(0.45*K,-0.08*K,0.3*K,-0.2*K);ws.quadraticCurveTo(0.2*K,0,0,-0.08*K);ws.lineTo(0,0.1*K);
    const wg=new THREE.ExtrudeGeometry(ws,{depth:0.04,bevelEnabled:false,curveSegments:14});wg.rotateY(Math.PI/2);
    s.wings=[];for(const sd of [-1,1]){const pv=new THREE.Group();pv.position.set(sd*0.55,2.1,0.2);s.g.add(pv);mesh(wg,wingM,0,0,0,pv);const bone=capO(0.07,K*0.95,dark,0,K*0.17,-K*0.5,pv);bone.rotation.x=Math.PI/2-0.45;s.wings.push(pv);}
    for(let i=0;i<5;i++)mesh(new THREE.ConeGeometry(0.12,0.36,10),dark,0,2.35-i*0.05,0.6-i*0.45,s.g);
    return s;},
};
for(const a in BPICK)if(BOSSB[a])BOSSB[a]=d=>buildBoss2(a,BPICK[a],d);

/* ---------- Scie delle armi (shader con sfumatura) ---------- */
const trailMat=new THREE.ShaderMaterial({
  uniforms:{uHead:{value:0},uLen:{value:0},uDir:{value:1},uOpacity:{value:0},uInner:{value:.6},uOuter:{value:2},uColor:{value:new THREE.Color(0xffe2b0)}},
  vertexShader:'varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform float uHead,uLen,uDir,uOpacity,uInner,uOuter;uniform vec3 uColor;varying vec2 vP;'+
    'void main(){float a=atan(vP.y,vP.x);float d=uDir<0.0?mod(a-uHead+12.5663706,6.2831853):mod(uHead-a+12.5663706,6.2831853);'+
    'if(uLen<0.001||d>uLen)discard;float k=1.0-d/uLen;float r=clamp((length(vP)-uInner)/max(0.05,uOuter-uInner),0.0,1.0);'+
    'float rad=smoothstep(0.0,0.3,r)*(0.3+0.7*r)*smoothstep(1.0,0.92,r);gl_FragColor=vec4(uColor*(0.8+0.7*k),k*k*rad*uOpacity);}',
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const trail=new THREE.Mesh(new THREE.RingGeometry(0.15,3.8,96,1),trailMat);trail.frustumCulled=false;scene.add(trail);
const streakMat=new THREE.ShaderMaterial({uniforms:{uOpacity:{value:0},uColor:{value:new THREE.Color(0xffe2b0)}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform float uOpacity;uniform vec3 uColor;varying vec2 vUv;void main(){float e=1.0-abs(vUv.y-0.5)*2.0;gl_FragColor=vec4(uColor,vUv.x*vUv.x*e*uOpacity);}',
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const streakGeo=new THREE.PlaneGeometry(1,0.28);streakGeo.translate(-0.5,0,0);
const streak=new THREE.Mesh(streakGeo,streakMat);streak.frustumCulled=false;scene.add(streak);
const bubble=new THREE.Mesh(sph(1.3,32,24),new THREE.MeshBasicMaterial({color:0x7fc8ff,transparent:true,opacity:0.18,depthWrite:false,blending:THREE.AdditiveBlending}));bubble.visible=false;scene.add(bubble);

/* ---------- Particelle, proiettili, fulmini ---------- */
const partGeo=new THREE.BoxGeometry(0.16,0.16,0.16);const particles=[];
for(let i=0;i<420;i++){const m=new THREE.Mesh(partGeo,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true}));m.visible=false;scene.add(m);particles.push({m,life:0,max:1,x:0,y:0,z:0,vx:0,vy:0,vz:0,g:1});}
let partIdx=0;
function burst(x,y,color,n,spd,up,g,z0){spd=spd||6;up=up==null?4:up;g=g==null?1:g;z0=z0||0;for(let i=0;i<n;i++){const p=particles[partIdx];partIdx=(partIdx+1)%particles.length;
  p.x=x;p.y=y;p.z=z0+rand(-0.4,0.8);const a=Math.random()*TAU,s=rand(0.3,1)*spd;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s*0.7+up*rand(0.4,1);p.vz=rand(-2,2);
  p.max=p.life=rand(0.35,0.8);p.g=g;p.m.material.color.setHex(color);p.m.visible=true;}}
function updParticles(dt){for(const p of particles){if(p.life<=0)continue;p.life-=dt;if(p.life<=0){p.m.visible=false;continue;}
  p.vy+=GRAV*0.45*p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.y<0.05&&p.g>0){p.y=0.05;p.vy*=-0.3;p.vx*=0.7;}
  p.m.position.set(p.x,p.y,p.z);const k=p.life/p.max;p.m.scale.setScalar(Math.max(0.05,k));p.m.material.opacity=Math.min(1,k*1.6);p.m.rotation.x+=dt*6;p.m.rotation.y+=dt*5;}}
const orbGeo=sph(0.3,20,14),haloGeo=sph(0.52,20,14);
const orbMatE=new THREE.MeshBasicMaterial({color:0xd7a8ff}),haloMatE=new THREE.MeshBasicMaterial({color:0xa060ff,transparent:true,opacity:0.3,depthWrite:false});
const orbMatP=new THREE.MeshBasicMaterial({color:0x9ff5ec}),haloMatP=new THREE.MeshBasicMaterial({color:0x3fcfc0,transparent:true,opacity:0.35,depthWrite:false});
const waveGeo=new THREE.RingGeometry(0.5,0.95,24,1,-1.2,2.4),waveMat=new THREE.MeshBasicMaterial({color:0x7ff0e4,transparent:true,opacity:0.85,side:THREE.DoubleSide,depthWrite:false});
const shockGeo=rbox(0.55,1,1.6,0.2),shockMatE=new THREE.MeshBasicMaterial({color:0xffa64a,transparent:true,opacity:0.85}),shockMatP=new THREE.MeshBasicMaterial({color:0x7ff0e4,transparent:true,opacity:0.85});
const xpGeo=sph(0.1,12,10),xpMat=new THREE.MeshBasicMaterial({color:0xffe08a}),xpHalo=new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:0.35,depthWrite:false,blending:THREE.AdditiveBlending});
const xpHaloGeo=sph(0.2,12,10);
// benda: rotolo bianco con una fascia
const bandGeo=new THREE.CylinderGeometry(0.2,0.2,0.34,24);bandGeo.rotateZ(Math.PI/2);bandGeo.userData.keep=true;
const bandStripe=new THREE.CylinderGeometry(0.205,0.205,0.08,24);bandStripe.rotateZ(Math.PI/2);bandStripe.userData.keep=true;
const bandTail=rbox(0.3,0.03,0.24,0.012);bandTail.userData.keep=true;
const bandM=toon(0xf6f0e2),bandM2=toon(0xd6a06a),bandGlow=new THREE.MeshBasicMaterial({color:0x7fe08a,transparent:true,opacity:0.25,depthWrite:false,blending:THREE.AdditiveBlending});
bandM.userData.keep=bandM2.userData.keep=bandGlow.userData.keep=true;const bandGlowGeo=sph(0.42,16,12);bandGlowGeo.userData.keep=true;
const bolts=[];for(let i=0;i<4;i++){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(30),3));const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xfff27a,transparent:true}));l.visible=false;l.frustumCulled=false;scene.add(l);bolts.push({l,life:0});}
function lightning(x1,y1,x2,y2,z){z=z==null?0.8:z;const b=bolts.find(b=>b.life<=0)||bolts[0],a=b.l.geometry.attributes.position;
  for(let i=0;i<10;i++){const t=i/9,j=i&&i<9;a.setXYZ(i,lerp(x1,x2,t)+(j?rand(-.25,.25):0),lerp(y1,y2,t)+(j?rand(-.35,.35):0),z);}a.needsUpdate=true;b.life=0.2;b.l.visible=true;
  for(let i=0;i<4;i++)burst(lerp(x1,x2,Math.random()),lerp(y1,y2,Math.random()),0xfff27a,1,2,1,0.2,z);}
const FXL=[];
const fxRingGeo=new THREE.RingGeometry(0.86,1,48),fxArcGeo=new THREE.RingGeometry(0.78,1,32,1,-1.2,2.4),fxSpikeGeo=new THREE.ConeGeometry(0.11,1,6),fxPillarGeo=new THREE.CylinderGeometry(1,1,1,24,1,true);
fxSpikeGeo.translate(0,0.5,0);fxPillarGeo.translate(0,0.5,0);
const fxM=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const SPKM={};const spikeMat=c=>SPKM[c]||(SPKM[c]=toon(c,{emissive:c,emissiveIntensity:0.5}));
function fxAdd(m,dur,fn,own){scene.add(m);FXL.push({m,t:0,dur,fn,own});fn(m,0,0);return m;}
function updFxl(dt){for(let i=FXL.length-1;i>=0;i--){const f=FXL[i];f.t+=dt;const k=Math.min(1,f.t/f.dur);f.fn(f.m,k,dt);
  if(k>=1){scene.remove(f.m);if(f.own&&f.m.material)f.m.material.dispose();FXL.splice(i,1);}}}
function fxClear(){for(const f of FXL){scene.remove(f.m);if(f.own&&f.m.material)f.m.material.dispose();}FXL.length=0;}
// anello che si allarga: a terra, oppure in piedi rivolto nella direzione ry
function fxRing(x,y,z,col,r,dur,vert,ry){const m=new THREE.Mesh(fxRingGeo,fxM(col));m.position.set(x,y,z);if(vert)m.rotation.y=ry==null?Math.PI/2:ry;else m.rotation.x=-Math.PI/2;
  return fxAdd(m,dur||0.5,(m,k)=>{m.scale.setScalar(0.15+r*(1-Math.pow(1-k,3)));m.material.opacity=(1-k)*0.95;},true);}
// spuntoni che escono dal terreno a cerchio (ghiaccio, rovi, ossa, roccia)
function fxSpikes(x,y,z,col,n,rad,h,dur){const g=new THREE.Group();g.position.set(x,y,z);const mt=spikeMat(col);
  for(let i=0;i<n;i++){const a=i/n*TAU+rand(-.25,.25),r=rad*rand(0.55,1),s=new THREE.Mesh(fxSpikeGeo,mt);s.position.set(Math.cos(a)*r,0,Math.sin(a)*r*0.7);
    s.rotation.set(Math.sin(a)*0.45,0,-Math.cos(a)*0.45);s.userData.h=h*rand(0.6,1.15);s.userData.d=rand(0,0.12);s.scale.set(1,0.01,1);g.add(s);}
  return fxAdd(g,dur||0.9,(g,k)=>{const tt=k*(dur||0.9);for(const s of g.children){const u=clamp((tt-s.userData.d)/0.12,0,1),out=k>0.72?1-(k-0.72)/0.28:1;
    s.scale.set(1+0.2*(1-u),Math.max(0.01,s.userData.h*easeOutBack(u)*out),1);}});}
// colonna di luce che scende dal cielo
function fxPillar(x,y,z,col,r,h,dur){const m=new THREE.Mesh(fxPillarGeo,fxM(col));m.position.set(x,y,z);
  return fxAdd(m,dur||0.6,(m,k)=>{const w=r*(k<0.15?k/0.15:1-0.7*(k-0.15)/0.85);m.scale.set(w,h,w);m.material.opacity=(1-k)*0.7;m.rotation.y+=0.1;},true);}
// colpo luminoso che vola da a a b (stesso aspetto dei proiettili magici)
function fxShot(a,b,col,dur,sz,end){const M=boltMats(col),m=new THREE.Mesh(boltGeo,M.core),h=new THREE.Mesh(haloGeo,M.halo);h.scale.setScalar(1.25);m.add(h);m.add(new THREE.Mesh(boltTailGeo,M.tail));
  m.scale.setScalar(sz||1);m.rotation.order='YZX';const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];m.rotation.y=Math.atan2(-dz,dx);m.rotation.z=Math.atan2(dy,Math.hypot(dx,dz));
  let done=false;return fxAdd(m,dur||0.3,(m,k)=>{m.position.set(a[0]+dx*k,a[1]+dy*k,a[2]+dz*k);h.scale.setScalar(1.15+Math.sin(G.time*30)*0.15);
    burst(m.position.x,m.position.y,col,1,0.4,0,0,m.position.z);if(k>=1&&!done){done=true;burst(b[0],b[1],col,18,5,1,0.3,b[2]);burst(b[0],b[1],0xffffff,6,3,1,0,b[2]);if(end)end();}});}
// fendente: arco luminoso che si apre e svanisce
function fxSlash(x,y,z,col,r,ry,rz,dur){const m=new THREE.Mesh(fxArcGeo,fxM(col));m.position.set(x,y,z);m.rotation.order='YXZ';m.rotation.y=ry||0;m.rotation.z=rz||0;
  return fxAdd(m,dur||0.3,(m,k)=>{m.scale.setScalar(r*(0.7+0.4*easeOutQuart(k)));m.material.opacity=(1-k)*(1-k);},true);}

/* ---------- Numeri del danno ---------- */
const nums=[];for(let i=0;i<32;i++){const el=document.createElement('div');el.className='dmg';$('fx').appendChild(el);nums.push({el,life:0,x:0,y:0});}
let numIdx=0;const vtmp=new THREE.Vector3(),v1=new THREE.Vector3(),v2=new THREE.Vector3(),vA=new THREE.Vector3(),vB=new THREE.Vector3();
function popNum(x,y,text,cls){const n=nums[numIdx];numIdx=(numIdx+1)%nums.length;n.el.textContent=text;n.el.className='dmg '+(cls||'');n.life=0.8;n.x=x+rand(-0.3,0.3);n.y=y;}
function toScreen(x,y,z){vtmp.set(x,y,z||0).project(camera);return [(vtmp.x+1)/2*innerWidth,(1-vtmp.y)/2*innerHeight];}
function updNums(dt){for(const n of nums){if(n.life<=0)continue;n.life-=dt;n.y+=dt*1.8;const [sx,sy]=toScreen(n.x,n.y,0);
  const sc=n.life>0.65?1+(n.life-0.65)*3:1;n.el.style.transform=`translate(${sx}px,${sy}px) translate(-50%,-50%) scale(${sc})`;n.el.style.opacity=n.life<=0?0:Math.min(1,n.life*3);}}
const shake=v=>{camShake.v=Math.max(camShake.v,v);if(v>=0.18)padRumble(v);};
let toastT=0;
function toast(t,s){$('toastT').textContent=t;$('toastS').textContent=s||'';$('toast').classList.add('show');toastT=2.8;}

