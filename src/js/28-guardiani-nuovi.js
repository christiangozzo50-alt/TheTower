// ===== GUARDIANI NUOVI: uno per ogni nemico che si sblocca prima del guardiano, 3 versioni ciascuno =====
// Stessa struttura dei guardiani del gioco (enemyShell + kitFor + M/G3, colore dal guardiano d.color).
// NBMETA: nemico di riferimento, piano del guardiano, colore e nome della versione nel gioco.
const NBMETA={
  fungusKing:    {type:'fungus',    floor:20,color:0xc8402e,title:'Fungo velenoso'},
  gargoyleLord:  {type:'gargoyle',  floor:25,color:0x7c7c88,title:'Gargoyle'},
  shadeLord:     {type:'shade',     floor:30,color:0x2e2444,title:'Ombra'},
  ogreKing:      {type:'brute',     floor:35,color:0x7a9a5a,title:'Bruto'},
  scorpionKing:  {type:'scorpion',  floor:40,color:0xb8862e,title:'Scorpione gigante'},
  salamanderKing:{type:'salamander',floor:45,color:0xe0602a,title:'Salamandra'},
  eyeLord:       {type:'eye',       floor:55,color:0xc23a7a,title:'Occhio del Vuoto'},
  minoKing:      {type:'minotaur',  floor:65,color:0x6a3f2a,title:'Minotauro'},
};
const NBORDER=Object.keys(NBMETA);

/* ---------- pezzi comuni ---------- */
// fungo: gambo a tornio, cappello a cupola con lamelle e macchie; restituisce il gruppo del cappello
function nbMush(par,K,o){const g=new THREE.Group();g.position.set(o.x||0,0,o.z||0);g.rotation.z=o.tilt||0;par.add(g);const h=o.h,r=o.r;
  M(g,G3.lathe([[0.01,0],[r*0.5,0],[r*0.56,h*0.1],[r*0.42,h*0.4],[r*0.36,h*0.8],[r*0.42,h],[0.01,h]],28),o.stem,[0,0,0]);
  const cap=new THREE.Group();cap.position.y=h*0.96;g.add(cap);M(cap,G3.dome(r,o.cover||0.5,o.sy||0.72,1),o.cap,[0,0,0]);
  if(o.gill)M(cap,G3.cyl(r*0.97,r*0.36,0.05,30),o.gill,[0,-0.01,0],{ol:0});
  const n=o.spots==null?8:o.spots;for(let i=0;i<n;i++){const th=i?(i%2?0.62:1.02):0,a=i*2.35,S_=r*Math.sin(th);M(cap,G3.ell(r*0.15,r*0.07,r*0.15),o.spot,[S_*Math.cos(a),r*(o.sy||0.72)*Math.cos(th),S_*Math.sin(a)],{ol:0});}
  return {g,cap};}
// zampe da insetto (come crawlerLegs, ma con lo spessore scelto)
function nbLegs(s,par,K,m,n,o){crawlerLegs(s,par,K,m,n,o);}
// testa del minotauro (muso, anello al naso, corna, occhi)
function nbMinoHead(R,K,skin,muz,horn,ring,eye,o){o=o||{};const k=o.k||1;R.face.visible=false;
  M(R.head,G3.ell(0.24,0.24,0.27),skin,[0,0.02,0.03]);M(R.head,G3.ell(0.15,0.12,0.14),muz,[0,-0.08,0.25]);
  if(ring)M(R.head,G3.tor(0.05,0.013,TAU,18,6),ring,[0,-0.15,0.32],{r:[Math.PI/2,0,0],ol:0});
  for(const x of [-1,1]){M(R.head,G3.tube([[x*0.2,0.12,0],[x*0.42*k,0.2,0.02],[x*0.5*k,0.44*k,0.08]],0.06,0.008,14,8),horn,null);
    M(R.head,G3.ell(0.03,0.022,0.015),eye,[x*0.11,0.07,0.25],{ol:0});M(R.head,G3.ell(0.09,0.04,0.05),skin,[x*0.27,0.03,-0.02],{r:[0,0,x*0.3]});
    M(R.head,G3.ell(0.02,0.02,0.012),K.dark,[x*0.05,-0.06,0.38],{ol:0});}}
// corpo da scorpione: segmenti, testa, coda col pungiglione, chele, 6 zampe
function nbScorp(s,K,c,o){o=o||{};s.g=new THREE.Group();s.body.add(s.g);s.noBar=true;
  for(let i=0;i<4;i++)M(s.g,G3.ell(0.46-i*0.04,0.26,0.26),i%2?c.dk:c.sh,[0,0.44,0.3-i*0.3]);M(s.g,G3.ell(0.34,0.22,0.26),c.sh,[0,0.42,0.56]);
  for(const x of [-1,1])for(const z of [0,1])M(s.g,G3.ell(0.035,0.035,0.03),c.eye,[x*(0.09+z*0.06),0.55-z*0.02,0.74-z*0.06],{ol:0});
  s.tail=new THREE.Group();s.tail.position.set(0,0.5,-0.72);s.g.add(s.tail);
  const tp=[[0,0,0],[0,0.5,-0.25],[0,1.05,-0.15],[0,1.35,0.25]];
  M(s.tail,G3.tube(tp,0.13,0.08,24,10),c.sh,null);
  for(let i=0;i<6;i++){const u=i/5*2.999,j=Math.floor(u),f=u-j,a=tp[j],b=tp[j+1];
    M(s.tail,G3.ell(0.15-i*0.012,0.14-i*0.012,0.11),i%2?c.dk:c.sh,[lerp(a[0],b[0],f),lerp(a[1],b[1],f),lerp(a[2],b[2],f)]);}
  M(s.tail,G3.ell(0.15,0.15,0.2),c.dk,[0,1.38,0.3]);s.sting=M(s.tail,G3.cone(0.06,0.34,12),c.sting,[0,1.28,0.58],{r:[Math.PI/2+0.4,0,0]});
  s.claws=[];for(const x of [-1,1]){const cl=new THREE.Group();cl.position.set(x*0.3,0.42,0.6);cl.scale.setScalar(1.45);s.g.add(cl);M(cl,G3.tube([[0,0,0],[x*0.25,0.02,0.22],[x*0.2,0.04,0.5]],0.07,0.055,12,8),c.sh,null);
    M(cl,G3.ell(0.17,0.1,0.22),c.sh,[x*0.2,0.05,0.62]);for(const j of [-1,1])M(cl,G3.cone(0.05,0.28,10),c.dk,[x*0.2+j*0.08,0.05,0.88],{r:[Math.PI/2,0,0]});s.claws.push(cl);}
  crawlerLegs(s,s.g,K,c.leg,6,{x:0.3,y:0.42,z0:0.2,dz:0.26,fan:0.22,knee:0.36,up:0.16,reach:0.6,r:0.06});
  s.body.scale.setScalar(o.k||2.3);return s.g;}
// corpo da salamandra (testa singola o più teste su colli)
function nbSal(s,K,c,o){o=o||{};s.g=new THREE.Group();s.body.add(s.g);s.noBar=true;
  M(s.g,G3.ell(0.34,0.24,0.62),c.sk,[0,0.42,-0.05]);if(c.belly)M(s.g,G3.ell(0.26,0.12,0.5),c.belly,[0,0.27,-0.05],{ol:0});
  if(c.spine)for(let i=0;i<6;i++)M(s.g,G3.cone(0.06,0.22,10),c.spine,[0,0.72-Math.abs(i-2)*0.025,0.42-i*0.2],{r:[-0.3,0,0]});
  const heads=o.heads||1;s.heads=[];
  for(let h=0;h<heads;h++){const sd=heads===1?0:(h-(heads-1)/2),nk=new THREE.Group();nk.position.set(sd*0.14,0.5,0.45);s.g.add(nk);
    const hx=sd*0.42,hy=heads===1?0:0.3+(sd===0?0.2:0),hz=heads===1?0.1:0.32;
    if(heads>1)M(nk,G3.tube([[0,0,0],[hx*0.5,hy*0.6,hz*0.6],[hx,hy,hz]],0.12,0.1,16,10),c.sk,null);
    const hd=new THREE.Group();hd.position.set(hx,hy,hz);nk.add(hd);
    M(hd,G3.ell(0.26,0.17,0.34),c.sk,[0,0.02,0.16]);
    for(const x of [-1,1]){M(hd,G3.ell(0.05,0.05,0.04),c.eye,[x*0.16,0.13,0.26],{ol:0});if(c.horn)for(let j=0;j<3;j++)M(hd,G3.cone(0.05,0.3,8),c.horn,[x*(0.2+j*0.03),0.1+j*0.08,-0.1],{r:[-0.9,0,-x*(1.0-j*0.4)]});}
    const jaw=new THREE.Group();jaw.position.set(0,-0.08,0.04);hd.add(jaw);M(jaw,G3.ell(0.22,0.06,0.3),c.dk,[0,-0.03,0.16]);M(jaw,G3.ell(0.14,0.02,0.2),c.mouth,[0,0.02,0.16],{ol:0});
    for(const x of [-1,1])for(let j=0;j<3;j++)M(jaw,G3.cone(0.018,0.06,8),c.tooth||K.m(0xf3ead7),[x*(0.08+j*0.03),0.04,0.38-j*0.08],{ol:0});
    s.heads.push(hd);if(h===0){s.head=hd;s.jaw=jaw;}}
  s.tail=new THREE.Group();s.tail.position.set(0,0.42,-0.6);s.g.add(s.tail);M(s.tail,G3.tube([[0,0,0],[0.02,-0.02,-0.5],[0,0.06,-1.05]],0.2,0.02,18,10),c.sk,null);
  s.legs=[];for(const [sd,z] of [[-1,0.35],[1,0.35],[-1,-0.38],[1,-0.38]]){const pv=new THREE.Group();pv.position.set(sd*0.28,0.38,z);s.g.add(pv);M(pv,G3.limb(0.08,0.055,0.38),c.sk,[sd*0.12,-0.14,0],{r:[0,0,sd*0.6]});M(pv,G3.ell(0.1,0.04,0.14),c.dk,[sd*0.24,-0.33,0.04]);
    for(let j=-1;j<=1;j++)M(pv,G3.cone(0.02,0.08,8),c.claw||c.dk,[sd*0.24+j*0.05,-0.34,0.18],{r:[Math.PI/2,0,0],ol:0});s.legs.push(pv);}
  s.body.scale.setScalar(o.k||2.6);return s.g;}
// gargoyle accovacciato: busto, testa, braccia artigliate, gambe, coda, ali
function nbGarg(s,K,c,o){o=o||{};s.g=new THREE.Group();s.body.add(s.g);s.noBar=true;
  M(s.g,G3.ell(0.4,0.46,0.32),c.st,[0,0.78,0]);M(s.g,G3.ell(0.3,0.2,0.26),c.dk,[0,0.42,0.02]);
  s.head=new THREE.Group();s.head.position.set(0,1.34,0.08);s.g.add(s.head);M(s.head,G3.ell(0.25,0.23,0.25),c.st,[0,0,0]);M(s.head,G3.ell(0.15,0.1,0.16),c.dk,[0,-0.08,0.2]);
  for(const x of [-1,1]){M(s.head,G3.ell(0.05,0.035,0.025),c.eye,[x*0.1,0.04,0.2],{ol:0});M(s.head,G3.cone(0.025,0.09,10),c.tooth,[x*0.06,-0.17,0.26],{r:[Math.PI,0,0],ol:0});
    if(o.ram)M(s.head,G3.tube([[x*0.16,0.14,-0.02],[x*0.36,0.3,-0.12],[x*0.48,0.1,-0.06],[x*0.4,-0.1,0.08],[x*0.3,-0.06,0.18]],0.085,0.03,24,10),c.horn,null);
    else M(s.head,G3.tube([[x*0.14,0.16,-0.06],[x*0.3,0.34,-0.12],[x*0.26,0.58,-0.26]],0.055,0.008,12,8),c.horn,null);
    M(s.g,G3.limb(0.1,0.07,0.56,0.01),c.st,[x*0.48,0.8,0.12],{r:[-0.5,0,x*0.25]});for(const j of [-1,0,1])M(s.g,G3.cone(0.03,0.14,8),c.dk,[x*0.56+j*0.05,0.52,0.3],{r:[Math.PI-0.4,0,0]});
    M(s.g,G3.limb(0.12,0.08,0.44,0.01),c.st,[x*0.22,0.28,0.1],{r:[-0.8,0,0]});M(s.g,G3.ell(0.1,0.06,0.17),c.dk,[x*0.22,0.07,0.28]);}
  s.tail=new THREE.Group();s.g.add(s.tail);M(s.tail,G3.tube([[0,0.5,-0.25],[0,0.2,-0.6],[0,0.32,-0.95]],0.08,0.012,14,8),c.st,null);
  if(o.snake){M(s.tail,G3.ell(0.09,0.07,0.13),c.dk,[0,0.34,-1.0]);for(const x of [-1,1])M(s.tail,G3.ell(0.02,0.02,0.015),c.eye,[x*0.05,0.38,-0.9],{ol:0});}
  else M(s.tail,G3.cone(0.08,0.2,4),c.dk,[0,0.36,-1.04],{r:[-Math.PI/2,0,0]});
  for(let i=0;i<4;i++)M(s.g,G3.cone(0.05,0.14,8),c.spike||c.dk,[0,1.14-i*0.2,-0.28+i*0.01],{r:[-1.2,0,0]});
  membrane(s,s.g,K,c.wing,c.dk,{span:o.span||1.35,y:1.05,x:0.26,z:-0.18});
  s.body.scale.setScalar(o.k||2.2);return s.g;}

const NBOSSES={
/* ---------- piano 20: Fungo velenoso ---------- */
fungusKing:[
{name:'Re dei funghi',desc:'Un fungo enorme col cappello a macchie, corona fra le lamelle e uno scettro-fungo in mano.',
 make(d){const s=enemyShell(4),K=kitFor(s),stem=K.m(0xe6dcc0),cap=K.m(d.color),spot=K.m(0xf5ecd8),gill=K.m(0xb89a78),eye=K.g(0x9ae06a,2),gold=K.m(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.3});
  s.g=new THREE.Group();s.body.add(s.g);s.noBar=true;const m=nbMush(s.g,K,{h:1.1,r:0.78,stem,cap,spot,gill});s.cap=m.cap;
  for(const x of [-1,1]){M(s.g,G3.ell(0.08,0.11,0.05),eye,[x*0.14,0.74,0.27],{ol:0});M(s.g,G3.ell(0.1,0.03,0.04),K.m(0x8a7a5a),[x*0.14,0.88,0.27],{r:[0,0,x*0.35]});}
  M(s.g,G3.tor(0.09,0.018,Math.PI,18,6),K.dark,[0,0.53,0.3],{r:[0,0,Math.PI],ol:0});
  s.arms=[];for(const x of [-1,1]){const a=new THREE.Group();a.position.set(x*0.32,0.62,0.04);s.g.add(a);M(a,G3.limb(0.06,0.045,0.42),stem,[x*0.16,-0.1,0.06],{r:[0.3,0,x*0.9]});s.arms.push(a);}
  const sc=new THREE.Group();sc.position.set(0.58,0.42,0.22);s.g.add(sc);M(sc,G3.limb(0.03,0.03,1.1),K.m(0x6a4a2e),[0,0.1,0]);nbMush(sc,K,{h:0.14,r:0.16,stem:gold,cap:K.g(0x9ae06a,1),spot:spot,spots:0}).g.position.y=0.62;
  crown2(s.cap,K,0.62,0.2,gold,K.g(0x9ae06a,1.4),{n:5});
  for(let i=0;i<5;i++){const a=i*1.3;nbMush(s.g,K,{h:0.22,r:0.14,stem,cap,spot,spots:3,x:Math.cos(a)*0.7,z:Math.sin(a)*0.5-0.1,tilt:Math.cos(a)*0.3});}
  s.body.scale.setScalar(2.3);s.tick=[(e,t)=>{s.cap.rotation.z=Math.sin(t*1.6)*0.04;}];return s;}},
{name:'Madre delle spore',desc:'Una colonia di funghi cresciuti insieme, con un volto nel gambo più grande e nubi di spore che le girano intorno.',
 make(d){const s=enemyShell(4),K=kitFor(s),stem=K.m(0xd8cfb4),cap=K.m(d.color),cap2=K.m(shadeC(d.color,0.75)),spot=K.m(0xf5ecd8),gill=K.g(0xd8ff8a,0.8),eye=K.g(0xd8ff8a,2.2);
  s.g=new THREE.Group();s.body.add(s.g);s.noBar=true;const m=nbMush(s.g,K,{h:1.2,r:0.6,stem,cap,spot,gill,sy:0.8});s.cap=m.cap;
  for(const [x,z,h,r,tl] of [[-0.55,0.1,0.75,0.42,0.25],[0.55,0.05,0.85,0.45,-0.22],[-0.3,-0.45,0.55,0.32,0.15],[0.35,-0.4,0.6,0.34,-0.12],[0,0.45,0.35,0.24,0]])
    nbMush(s.g,K,{h,r,stem,cap:x<0?cap2:cap,spot,gill,x,z,tilt:tl,spots:5});
  for(const x of [-1,1])M(s.g,G3.ell(0.07,0.1,0.04),eye,[x*0.12,0.8,0.24],{ol:0});M(s.g,G3.ell(0.1,0.06,0.04),K.dark,[0,0.6,0.25],{ol:0});
  const spM=K.add(0xd8ff8a,0.45);s.spores=new THREE.Group();s.g.add(s.spores);for(let i=0;i<14;i++){const a=i/14*TAU;M(s.spores,G3.ell(0.06+(i%3)*0.03,0.06+(i%3)*0.03,0.06+(i%3)*0.03),spM,[Math.cos(a)*(0.9+(i%2)*0.2),0.4+(i%4)*0.35,Math.sin(a)*(0.6+(i%2)*0.15)],{ol:0});}
  s.body.scale.setScalar(2.2);s.tick=[(e,t)=>{s.spores.rotation.y=t*0.5;s.spores.position.y=Math.sin(t)*0.05;}];return s;}},
{name:'Fungo dell\'abisso',desc:'Cappello viola con macchie che brillano, filamenti che pendono dal bordo e una bocca piena di denti nel gambo.',
 make(d){const s=enemyShell(4),K=kitFor(s),stem=K.m(0x4a3a5a),cap=K.m(0x3a2050),spot=K.g(0x6affd8,1.6),gill=K.g(0x6affd8,0.7),eye=K.g(0x6affd8,2.4),tooth=K.m(0xe8dcc8);
  s.g=new THREE.Group();s.body.add(s.g);s.noBar=true;const m=nbMush(s.g,K,{h:1.15,r:0.82,stem,cap,spot,gill,sy:0.6,spots:10});s.cap=m.cap;
  for(let i=0;i<12;i++){const a=i/12*TAU,x=Math.cos(a)*0.72,z=Math.sin(a)*0.72,L=0.35+(i%3)*0.18;M(s.cap,G3.tube([[x,-0.02,z],[x*1.02,-L*0.5,z*1.02],[x*0.98,-L,z*0.98]],0.03,0.008,10,6),i%2?gill:stem,null);}
  for(const x of [-1,1])M(s.g,G3.ell(0.05,0.09,0.04),eye,[x*0.15,0.82,0.26],{ol:0});
  M(s.g,G3.ell(0.18,0.1,0.06),K.dark,[0,0.52,0.25],{ol:0});for(let i=0;i<6;i++)M(s.g,G3.cone(0.02,0.07,8),tooth,[(i-2.5)*0.055,0.6,0.29],{r:[Math.PI,0,0],ol:0});
  for(let i=0;i<6;i++)M(s.g,G3.cone(0.02,0.06,8),tooth,[(i-2.5)*0.05,0.44,0.29],{ol:0});
  for(const x of [-1,1])M(s.g,G3.tube([[x*0.3,0.55,0],[x*0.6,0.35,0.15],[x*0.7,0.05,0.3]],0.06,0.02,14,8),stem,null);
  s.body.scale.setScalar(2.3);s.tick=[(e,t)=>{spot.emissiveIntensity=1.2+Math.sin(t*3)*0.5;}];return s;}},
],
/* ---------- piano 25: Gargoyle ---------- */
gargoyleLord:[
{name:'Gargoyle della cattedrale',desc:'Pietra grigia scheggiata, corna da ariete, ali enormi e occhi d\'ambra, appollaiato su un pezzo di cornicione.',
 make(d){const s=enemyShell(4.2),K=kitFor(s),st=K.m(d.color),dk=K.m(shadeC(d.color,0.7)),c={st,dk,wing:K.ds(shadeC(d.color,0.82)),eye:K.g(0xff9a2e,2.4),tooth:K.m(0xe8e0cc),horn:K.m(0x55555f)};
  nbGarg(s,K,c,{ram:true,span:1.5});M(s.g,rockG(1.2,0.18,0.8,{seed:3}),dk,[0,-0.02,0.05]);for(let i=0;i<3;i++)M(s.g,G3.rb(0.22,0.14,0.2,0.03),st,[-0.45+i*0.45,0.12,0.38]);return s;}},
{name:'Chimera di bronzo',desc:'Statua di bronzo verderame con criniera da leone, ali piumate di metallo e una coda che finisce in un serpente.',
 make(d){const s=enemyShell(4.2),K=kitFor(s),br=K.m(0x9a7a3a),pat=K.m(0x4a8a78),c={st:br,dk:pat,wing:K.ds(0x7a6a3a),eye:K.g(0x6affd8,2.4),tooth:K.m(0xe8e0cc),horn:pat,spike:br};
  nbGarg(s,K,c,{snake:true,span:1.4});
  for(let i=0;i<14;i++){const a=i/14*TAU;M(s.head,G3.cone(0.09,0.34,8),i%2?pat:br,[Math.cos(a)*0.34,Math.sin(a)*0.32,-0.1],{r:[0,0,a-Math.PI/2]});}
  for(let i=0;i<5;i++)for(const sd of [-1,1])M(s.g,G3.leaf(0.12,0.38,0.02,true),br,[sd*(0.4+i*0.18),1.2+i*0.12,-0.3],{r:[0.2,0,sd*(1.2+i*0.15)]});
  return s;}},
{name:'Gargoyle runico d\'ossidiana',desc:'Pietra nera lucida attraversata da rune viola che brillano, con cristalli che gli spuntano dalla schiena.',
 make(d){const s=enemyShell(4.2),K=kitFor(s),ob=K.m(0x1e1a26),dk=K.m(0x2e2838),rn=K.g(0xb48cff,1.8),c={st:ob,dk,wing:K.ds(0x2a2434),eye:rn,tooth:K.m(0xd8d0ff),horn:K.m(0x3a3448),spike:rn};
  nbGarg(s,K,c,{span:1.45});
  for(const [x,y,z,l,a] of [[0,0.86,0.3,0.4,0],[-0.18,0.74,0.27,0.22,0.6],[0.18,0.74,0.27,0.22,-0.6],[0,0.62,0.3,0.18,1.57]])M(s.g,G3.rb(0.04,l,0.03,0.015),rn,[x,y,z],{r:[0,0,a],ol:0});
  for(let i=0;i<5;i++)M(s.g,G3.cone(0.07,0.42-i*0.04,6),K.m(0x8a6aff,{emissive:0x5a3aff,emissiveIntensity:0.6,transparent:true,opacity:0.85}),[(i%2?0.12:-0.12),1.0-i*0.1,-0.32-i*0.04],{r:[-0.7,0,(i%2?-0.3:0.3)],ol:0});
  s.tick=[(e,t)=>{rn.emissiveIntensity=1.4+Math.sin(t*2.4)*0.6;}];return s;}},
],
/* ---------- piano 30: Ombra ---------- */
shadeLord:[
{name:'Signore delle ombre',desc:'Figura incappucciata alta il doppio di un uomo, mantello sfilacciato e due lame d\'ombra viola.',
 make(d){const {s,R,K}=bossHum({skin:0x14101f,shirt:0x221b33,sleeve:0x221b33,pants:0x1a1528,boot:0x120e1c,glove:0x14101f,build:0.95,eyes:false},4.2,1.8),cloth=K.ds(0x2e2444),steel=K.m(0xb8acff,{emissive:0x5a3aff,emissiveIntensity:0.6}),grip=K.m(0x2a2030),eye=K.g(0x8a6aff,2.6);
  R.face.visible=false;SP.hood(R,cloth,{depth:0.74});SP.flap(R,cloth,{len:0.3,n:3,jag:0.08});SP.backFlap(R,cloth,{len:0.32,n:3});SP.belt(R,grip,steel);capeFor(s,R,cloth,1.05,0.5);
  for(const x of [-1,1])M(R.head,G3.ell(0.035,0.022,0.014),eye,[x*0.075,0.02,0.19],{ol:0});
  for(const a of R.arms){const dg=new THREE.Group();a.wr.add(dg);M(dg,G3.rb(0.03,0.16,0.03),grip,[0,-0.06,0]);M(dg,G3.rb(0.14,0.025,0.04),steel,[0,-0.15,0],{ol:0});M(dg,G3.cone(0.055,0.8,10),steel,[0,-0.56,0],{r:[Math.PI,0,0]});}
  return s;}},
{name:'Ombra dalle quattro braccia',desc:'Un corpo d\'ombra senza volto con quattro braccia lunghe e artigliate e una corona di fumo viola.',
 make(d){const {s,R,K}=bossHum({skin:0x1a1428,shirt:0x1a1428,sleeve:0x1a1428,pants:0x1a1428,boot:0x14101f,glove:0x1a1428,build:1.0,eyes:false},4.2,1.75),body=K.m(0x1a1428),claw=K.m(0xb8acff,{emissive:0x5a3aff,emissiveIntensity:0.5}),eye=K.g(0xd0b8ff,2.6),smoke=K.add(0x8a6aff,0.5);
  R.face.visible=false;M(R.head,G3.ell(0.17,0.2,0.18),body,[0,0.02,0.02]);for(const x of [-1,1])M(R.head,G3.ell(0.04,0.018,0.012),eye,[x*0.07,0.03,0.18],{ol:0,r:[0,0,x*0.3]});
  M(R.head,G3.ell(0.07,0.02,0.02),eye,[0,-0.08,0.18],{ol:0});
  for(let i=0;i<7;i++){const a=i/7*TAU;M(R.head,G3.cone(0.04,0.22,8),smoke,[Math.cos(a)*0.13,0.2,Math.sin(a)*0.13],{r:[Math.sin(a)*0.4,0,-Math.cos(a)*0.4],ol:0});}
  for(const a of R.arms)for(let j=0;j<3;j++)M(a.wr,G3.cone(0.018,0.16,8),claw,[(j-1)*0.03,-0.16,0.02],{r:[Math.PI,0,0],ol:0});
  s.xarms=[];for(const x of [-1,1]){const g=new THREE.Group();g.position.set(x*0.14,0.32,0.02);R.chest.add(g);M(g,G3.tube([[0,0,0],[x*0.2,-0.12,0.06],[x*0.3,-0.3,0.2],[x*0.32,-0.46,0.34]],0.045,0.03,16,8),body,null);
    for(let j=0;j<3;j++)M(g,G3.cone(0.016,0.14,8),claw,[x*0.32+(j-1)*0.03,-0.52,0.4],{r:[Math.PI-0.6,0,0],ol:0});s.xarms.push(g);}
  SP.skirt(R,K.ds(0x221b33),{len:0.3,n:3,jag:0.08});
  s.tick=[(e,t)=>{for(const [i,g] of s.xarms.entries())g.rotation.z=Math.sin(t*2+i*2)*0.15;}];return s;}},
{name:'Mietitore d\'ombra',desc:'Un mietitore con cappuccio nero e falce lunga, e piccoli spiriti viola che gli girano intorno.',
 make(d){const {s,R,K}=bossHum({skin:0x14101f,shirt:0x161220,sleeve:0x161220,pants:0x161220,boot:0x120e1c,glove:0xd8d0e8,build:0.9,eyes:false},4.2,1.8),cloth=K.ds(0x1c1628),eye=K.g(0xb48cff,2.6),wisp=K.g(0xb48cff,2);
  R.face.visible=false;SP.hood(R,cloth,{depth:0.76});SP.skirt(R,cloth,{len:0.42,n:3,jag:0.1,flare:1.4});capeFor(s,R,cloth,1.1,0.52);SP.capelet(R,cloth,{len:0.26});
  for(const x of [-1,1])M(R.head,G3.ell(0.04,0.03,0.014),eye,[x*0.07,0.02,0.19],{ol:0});
  const f=buildWeapon2('falce',2,4,null);R.arms[0].wr.add(f.g);f.g.scale.setScalar(1.3);
  s.wisps=new THREE.Group();s.wisps.position.y=1.2;s.root.add(s.wisps);for(let i=0;i<5;i++){const a=i/5*TAU;const w=new THREE.Group();w.position.set(Math.cos(a)*1.05,Math.sin(i)*0.6,Math.sin(a)*0.9);s.wisps.add(w);
    M(w,G3.ell(0.12,0.14,0.12),wisp,[0,0,0],{ol:0});M(w,G3.cone(0.1,0.35,8),K.add(0xb48cff,0.5),[0,-0.22,0],{r:[Math.PI,0,0],ol:0});}
  s.tick=[(e,t)=>{s.wisps.rotation.y=t*0.8;}];return s;}},
],
/* ---------- piano 35: Bruto ---------- */
ogreKing:[
{name:'Re degli orchi',desc:'Un orco gigantesco con la pancia, corona ammaccata, mantello di pelliccia e una clava chiodata grande come un tronco.',
 make(d){const {s,R,K}=bossHum({skin:d.color,shirt:'skin',sleeve:'skin',pants:0x4a3a28,boot:0x3a2a1a,hair:0x2a2010,build:1.45},4.4,1.65),fur=K.m(0x6a4a2e),gold=K.m(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.3}),wood=K.m(0x5a3a22),iron=K.m(0x6a6e78),tooth=K.m(0xf3ead7);
  M(R.torso,G3.ell(0.3,0.28,0.26),R.skinM,[0,0.2,0.08]);for(const x of [-1,1])M(R.head,G3.cone(0.03,0.1,10),tooth,[x*0.07,-0.1,0.17],{ol:0});
  crown2(R.head,K,0.2,0.17,gold,K.g(0xd83a4a,1.3),{n:5});SP.capelet(R,fur,{len:0.3,r1:0.36});capeFor(s,R,fur,0.9,0.5);SP.belt(R,K.m(0x3a2618),gold,{t:0.04});SP.flap(R,fur,{len:0.24,w0:0.3});
  const club=new THREE.Group();R.arms[0].wr.add(club);M(club,G3.limb(0.05,0.05,0.6),wood,[0,-0.3,0]);M(club,G3.cyl(0.22,0.12,0.8,16),wood,[0,-0.95,0]);
  for(let i=0;i<10;i++){const a=i*2.4,y=-0.7-(i%4)*0.13;M(club,G3.cone(0.05,0.16,8),iron,[Math.cos(a)*0.19,y,Math.sin(a)*0.19],{r:[Math.sin(a)*Math.PI/2,0,-Math.cos(a)*Math.PI/2]});}
  return s;}},
{name:'Capotribù sciamano',desc:'Orco con una maschera-teschio cornuta, collana di zanne, pitture di guerra e un totem con un teschio acceso.',
 make(d){const {s,R,K}=bossHum({skin:d.color,shirt:'skin',sleeve:'skin',pants:0x5a3a22,boot:0x3a2a1a,build:1.4},4.4,1.6),bone=K.m(0xe8e0cc),hide=K.m(0x7a5a3a),wood=K.m(0x4a3220),paint=K.m(0xd83a4a),glow=K.g(0x6aff9a,2),feather=K.ds(0x2a6a8a);
  M(R.torso,G3.ell(0.28,0.26,0.24),R.skinM,[0,0.2,0.08]);R.face.visible=false;
  M(R.head,G3.ell(0.21,0.2,0.2),bone,[0,0.03,0.06]);for(const x of [-1,1]){M(R.head,G3.ell(0.05,0.045,0.03),K.dark,[x*0.07,0.05,0.24],{ol:0});M(R.head,G3.ell(0.02,0.02,0.012),glow,[x*0.07,0.05,0.26],{ol:0});
    M(R.head,G3.tube([[x*0.16,0.14,0],[x*0.34,0.3,-0.04],[x*0.38,0.56,-0.12]],0.05,0.008,14,8),bone,null);}
  for(let i=0;i<5;i++)M(R.head,G3.leaf(0.05,0.3,0.01),feather,[(i-2)*0.06,0.28,-0.1],{r:[-0.4,0,(i-2)*0.25]});
  for(let i=0;i<7;i++){const a=(i-3)*0.32;M(SP.onChest(R,0.52,0,0),G3.cone(0.025,0.12,8),bone,[Math.sin(a)*0.22,-Math.cos(a)*0.12+0.02,0.04],{r:[Math.PI,0,0]});}
  for(const x of [-1,1])for(let j=0;j<3;j++)M(R.torso,G3.rb(0.12,0.02,0.01,0.005),paint,[x*0.12,0.3+j*0.06,0.3],{r:[0,0,x*0.3],ol:0});
  SP.flap(R,hide,{len:0.26,w0:0.3,jag:0.05});SP.backFlap(R,hide,{len:0.26});SP.belt(R,hide,bone,{t:0.035});
  const st=new THREE.Group();R.arms[0].wr.add(st);M(st,G3.limb(0.04,0.045,2.2),wood,[0,0.4,0]);M(st,G3.ell(0.16,0.17,0.17),bone,[0,1.55,0]);for(const x of [-1,1])M(st,G3.ell(0.04,0.04,0.03),glow,[x*0.06,1.57,0.14],{ol:0});
  for(let i=0;i<4;i++)M(st,G3.leaf(0.04,0.25,0.01),feather,[0,1.35,0],{r:[0,i*1.57,2.6]});return s;}},
{name:'Orco corazzato',desc:'Un orco chiuso in piastre di ferro chiodate, elmo con le zanne di fuori e un mazzafrusto con la palla chiodata.',
 make(d){const {s,R,K}=bossHum({skin:d.color,shirt:0x3a3a42,sleeve:'skin',fore:0x4a4a52,pants:0x3a3a42,boot:0x2a2a30,glove:0x4a4a52,build:1.45},4.4,1.65),iron=K.m(0x6a6e78),dk=K.m(0x3a3a42),rust=K.m(0x8a4a2a),tooth=K.m(0xf3ead7),wood=K.m(0x4a3220);
  SP.helmDome(R,iron);for(const x of [-1,1])M(R.head,G3.cone(0.035,0.14,10),tooth,[x*0.08,-0.12,0.18],{ol:0});
  SP.shell(R,iron,0.02,0.68,0.03);for(let i=0;i<4;i++)M(SP.onChest(R,0.32+i*0.09,0,0.03),G3.cone(0.03,0.1,10),dk,[0,0,0.03],{r:[Math.PI/2,0,0]});
  SP.pauldron(R,iron,{layers:3,r:0.15,spikes:3,spikeM:dk});SP.bracer(R,iron,{ring:rust});SP.greave(R,iron,dk);SP.belt(R,rust,iron,{t:0.04});
  const fl=new THREE.Group();R.arms[0].wr.add(fl);M(fl,G3.limb(0.04,0.045,0.6),wood,[0,-0.3,0]);
  const ch=[[0,-0.6,0],[0.1,-0.9,0.1],[0.15,-1.2,0.25],[0.12,-1.45,0.45]];M(fl,G3.tube(ch,0.02,0.02,20,6),dk,null);
  M(fl,G3.ell(0.24,0.24,0.24),iron,[0.12,-1.55,0.55]);for(let i=0;i<10;i++){const th=Math.acos(1-2*(i+0.5)/10),ph=i*2.4;M(fl,G3.cone(0.05,0.18,8),dk,[0.12+Math.sin(th)*Math.cos(ph)*0.24,-1.55+Math.cos(th)*0.24,0.55+Math.sin(th)*Math.sin(ph)*0.24],{r:[Math.sin(th)*Math.sin(ph)*1.57,0,-Math.sin(th)*Math.cos(ph)*1.57]});}
  return s;}},
],
/* ---------- piano 40: Scorpione gigante ---------- */
scorpionKing:[
{name:'Imperatore scorpione',desc:'Corazza d\'oro e d\'ambra, una corona sulla testa e un pungiglione verde che gocciola veleno.',
 make(d){const s=enemyShell(3.4),K=kitFor(s),c={sh:K.m(d.color),dk:K.m(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.3}),sting:K.g(0xa6e34a,1.8),eye:K.g(0xffe27a,2.2),leg:K.m(shadeC(d.color,0.55))};
  const g=nbScorp(s,K,c,{k:2.4});crown2(g,K,0.66,0.14,c.dk,K.g(0xa6e34a,1.4),{n:5}).position.z=0.55;
  for(let i=0;i<4;i++)M(g,G3.ell(0.3-i*0.03,0.05,0.12),c.dk,[0,0.62,0.3-i*0.3],{ol:0});
  const drop=M(s.tail,G3.ell(0.05,0.07,0.05),K.add(0xa6e34a,0.8),[0,1.1,0.72],{ol:0});s.tick=[(e,t)=>{drop.position.y=1.1-((t*0.6)%1)*0.5;drop.scale.setScalar(1-((t*0.6)%1)*0.6);}];return s;}},
{name:'Scorpione d\'ossa',desc:'Uno scheletro di scorpione bianco con un teschio come testa e una luce verde da spettro dentro la corazza.',
 make(d){const s=enemyShell(3.4),K=kitFor(s),bone=K.m(0xe6dcc6),bd=K.m(0xbab0a0),gl=K.g(0x6aff9a,2),c={sh:bone,dk:bd,sting:gl,eye:gl,leg:bd};
  const g=nbScorp(s,K,c,{k:2.4});M(g,G3.ell(0.22,0.18,0.18),K.add(0x6aff9a,0.5),[0,0.42,0],{ol:0});
  const sk=new THREE.Group();sk.position.set(0,0.48,0.72);g.add(sk);M(sk,G3.ell(0.16,0.15,0.16),bone,[0,0,0]);for(const x of [-1,1]){M(sk,G3.ell(0.05,0.045,0.03),K.dark,[x*0.06,0.02,0.13],{ol:0});M(sk,G3.ell(0.02,0.02,0.012),gl,[x*0.06,0.02,0.15],{ol:0});}
  for(let i=0;i<4;i++)M(sk,G3.rb(0.02,0.04,0.02,0.005),bone,[(i-1.5)*0.035,-0.13,0.12],{ol:0});return s;}},
{name:'Scorpione di cristallo',desc:'Corazza di cristallo azzurro mezza trasparente, punte di cristallo lungo la coda e un pungiglione che brilla.',
 make(d){const s=enemyShell(3.4),K=kitFor(s),cr=K.m(0x7ad8ff,{emissive:0x1a5a8a,emissiveIntensity:0.4}),dk=K.m(0x2a5a8a),gl=K.g(0xaef0ff,2),c={sh:cr,dk,sting:gl,eye:gl,leg:dk};
  const g=nbScorp(s,K,c,{k:2.4});const crys=K.m(0xaef0ff,{emissive:0x4ab0ff,emissiveIntensity:0.7,transparent:true,opacity:0.8});
  for(let i=0;i<5;i++)M(s.tail,G3.cone(0.05,0.24,6),crys,[0,[0.2,0.55,0.95,1.3,1.5][i],[-0.1,-0.25,-0.22,0.0,0.3][i]-0.08],{r:[-0.6,0,0],ol:0});
  for(let i=0;i<4;i++)for(const x of [-1,1])M(g,G3.cone(0.04,0.2,6),crys,[x*0.25,0.6,0.3-i*0.3],{r:[0,0,-x*0.5],ol:0});
  s.tick=[(e,t)=>{gl.emissiveIntensity=1.6+Math.sin(t*3)*0.6;}];return s;}},
],
/* ---------- piano 45: Salamandra ---------- */
salamanderKing:[
{name:'Salamandra di lava',desc:'Pelle di roccia nera con crepe di lava, spine accese sulla schiena e fiamme che le escono dalla bocca e dalla coda.',
 make(d){const s=enemyShell(3.2),K=kitFor(s),rock=K.m(0x3e2c26),lava=K.g(0xff6a1e,1.6),c={sk:rock,dk:K.m(0x1a1210),belly:lava,spine:lava,eye:K.g(0xfff27a,2.4),mouth:lava,horn:K.m(0x14101a),claw:K.m(0x14101a)};
  const g=nbSal(s,K,c,{k:2.6});for(const x of [-1,1])M(s.head,G3.rb(0.02,0.14,0.02,0.008),lava,[x*0.1,0.18,0.12],{r:[0.9,0,x*0.5],ol:0});for(let i=0;i<8;i++){const a=i*0.8;M(g,G3.rb(0.03,0.2,0.02,0.01),lava,[Math.sin(a)*0.3,0.42+Math.cos(a)*0.15,0.3-i*0.1],{r:[0,0,a],ol:0});}
  const fl=M(s.tail,G3.cone(0.14,0.4,10),K.add(0xff9a2e,0.85),[0,0.14,-1.12],{r:[-Math.PI/2+0.3,0,0],ol:0});
  s.tick=[(e,t)=>{lava.emissiveIntensity=1.3+Math.sin(t*4)*0.4;fl.scale.y=1+Math.sin(t*9)*0.2;}];return s;}},
{name:'Basilisco',desc:'Squame verde scuro, una grande cresta a ventaglio sulla testa e occhi gialli che pietrificano.',
 make(d){const s=enemyShell(3.2),K=kitFor(s),sk=K.m(0x3a6a3a),dk=K.m(0x1e3a22),c={sk,dk,belly:K.m(0xc8c07a),spine:K.m(0xd8b44a),eye:K.g(0xfff27a,2.8),mouth:K.g(0xa6e34a,1.4),horn:null,claw:K.m(0xe8e0cc)};
  nbSal(s,K,c,{k:2.6});const fr=K.ds(0xd83a4a),rib=K.m(0xd8b44a);
  for(let i=0;i<7;i++){const a=(i-3)*0.32;M(s.head,G3.leaf(0.08,0.5,0.01,true),fr,[Math.sin(a)*0.1,0.22+Math.cos(a)*0.12,-0.08],{r:[-0.5,0,-a]});M(s.head,G3.limb(0.012,0.008,0.48),rib,[Math.sin(a)*0.14,0.38+Math.cos(a)*0.08,-0.1],{r:[-0.5,0,-a],ol:0});}
  for(const x of [-1,1])M(s.head,G3.cone(0.04,0.22,8),K.m(0xe8e0cc),[x*0.14,0.16,0.08],{r:[-0.6,0,-x*0.4]});return s;}},
{name:'Idra a tre teste',desc:'Tre colli lunghi con tre teste di salamandra infuocata, ognuna con le sue corna, su un solo corpo.',
 make(d){const s=enemyShell(3.4),K=kitFor(s),c={sk:K.m(d.color),dk:K.m(shadeC(d.color,0.45)),belly:K.g(0xffc04a,1.1),spine:K.m(shadeC(d.color,0.45)),eye:K.g(0xfff27a,2.2),mouth:K.g(0xff7a2e,1.6),horn:K.m(shadeC(d.color,0.45))};
  nbSal(s,K,c,{k:2.4,heads:3});s.tick=[(e,t)=>{s.heads.forEach((h,i)=>{h.rotation.x=Math.sin(t*1.8+i*2)*0.12;h.rotation.y=Math.sin(t*1.3+i)*0.15;});}];return s;}},
],
/* ---------- piano 55: Occhio del Vuoto ---------- */
eyeLord:[
{name:'Grande occhio del Vuoto',desc:'Un occhio enorme con le palpebre di carne, tentacoli che pendono sotto e un anello di spine che gli gira dietro.',
 make(d){const s=enemyShell(4),K=kitFor(s),white=K.m(0xf0e6e0),fl=K.m(shadeC(d.color,0.55)),dk=K.m(0x3a1428),iris=K.g(d.color,1.8);s.g=new THREE.Group();s.g.position.y=2.0;s.gy=2.0;s.body.add(s.g);s.noBar=true;
  M(s.g,G3.ell(1.1,1.1,1.1),white,[0,0,0]);M(s.g,G3.dome(1.18,0.34,1,1),fl,[0,0.04,-0.04],{r:[-0.25,0,0]});M(s.g,G3.dome(1.18,0.28,1,1),fl,[0,-0.04,-0.04],{r:[Math.PI+0.3,0,0]});
  for(let i=0;i<6;i++){const a=(i-2.5)*0.25;M(s.g,G3.tube([[Math.sin(a)*0.9,0.2,Math.cos(a)*0.55],[Math.sin(a)*0.98,0.0,Math.cos(a)*0.4],[Math.sin(a)*0.94,-0.2,Math.cos(a)*0.5]],0.015,0.01,10,6),K.m(0xd84a5a),null,{ol:0});}
  s.iris=new THREE.Group();s.iris.position.z=1.0;s.g.add(s.iris);M(s.iris,G3.ell(0.52,0.52,0.14),iris,[0,0,0],{ol:0});M(s.iris,G3.ell(0.18,0.34,0.08),K.dark,[0,0,0.12],{ol:0});
  s.tent=[];for(let i=0;i<8;i++){const a=i/8*TAU,v=new THREE.Group();v.position.set(Math.cos(a)*0.6,-0.85,Math.sin(a)*0.6);s.g.add(v);
    M(v,G3.tube([[0,0,0],[Math.cos(a)*0.25,-0.5,Math.sin(a)*0.25],[-Math.cos(a)*0.1,-1.0,-Math.sin(a)*0.1],[Math.cos(a)*0.18,-1.4,Math.sin(a)*0.18]],0.13,0.02,18,10),i%2?fl:dk,null);s.tent.push(v);}
  s.ring=new THREE.Group();s.ring.position.z=-0.6;s.g.add(s.ring);M(s.ring,G3.tor(1.6,0.05,TAU,48,8),dk,[0,0,0]);
  for(let i=0;i<12;i++){const a=i/12*TAU;M(s.ring,G3.cone(0.08,0.4,8),dk,[Math.cos(a)*1.78,Math.sin(a)*1.78,0],{r:[0,0,a-Math.PI/2]});}
  s.tick=[(e,t)=>{s.ring.rotation.z=t*0.3;s.tent.forEach((v,i)=>v.rotation.x=Math.sin(t*2+i)*0.2);s.iris.position.x=Math.sin(t*0.7)*0.15;}];return s;}},
{name:'Tiranno dagli occhi',desc:'Una sfera di carne con una grande bocca dentata sotto l\'occhio e sei occhi più piccoli in cima a steli che si muovono.',
 make(d){const s=enemyShell(4),K=kitFor(s),fl=K.m(shadeC(d.color,0.7)),dk=K.m(shadeC(d.color,0.4)),white=K.m(0xf0e6e0),tooth=K.m(0xf3ead7),iris=K.g(d.color,1.8);s.g=new THREE.Group();s.g.position.y=2.0;s.gy=2.0;s.body.add(s.g);s.noBar=true;
  M(s.g,G3.ell(1.15,1.05,1.05),fl,[0,0,0]);for(let i=0;i<14;i++){const a=i*2.4,b=0.4+(i%5)*0.25;M(s.g,G3.ell(0.12,0.08,0.06),dk,[Math.cos(a)*Math.sin(b)*1.1,Math.cos(b)*1.0,-Math.abs(Math.sin(a))*Math.sin(b)*0.9],{ol:0});}
  M(s.g,G3.ell(0.5,0.48,0.3),white,[0,0.3,0.86]);s.iris=new THREE.Group();s.iris.position.set(0,0.3,1.12);s.g.add(s.iris);M(s.iris,G3.ell(0.28,0.28,0.06),iris,[0,0,0],{ol:0});M(s.iris,G3.ell(0.1,0.18,0.04),K.dark,[0,0,0.05],{ol:0});
  M(s.g,G3.ell(0.65,0.22,0.3),K.dark,[0,-0.42,0.86],{ol:0});for(let i=0;i<9;i++){const x=(i-4)*0.13;M(s.g,G3.cone(0.04,0.16,8),tooth,[x,-0.28,1.0-Math.abs(x)*0.25],{r:[Math.PI,0,0],ol:0});M(s.g,G3.cone(0.04,0.14,8),tooth,[x,-0.58,1.0-Math.abs(x)*0.25],{ol:0});}
  s.stalks=[];for(let i=0;i<6;i++){const a=(i-2.5)*0.42,v=new THREE.Group();v.position.set(Math.sin(a)*0.6,0.85,Math.cos(a)*0.2-0.2);s.g.add(v);
    M(v,G3.tube([[0,0,0],[Math.sin(a)*0.3,0.4,0.1],[Math.sin(a)*0.25,0.8,0.25]],0.07,0.05,14,8),fl,null);M(v,G3.ell(0.13,0.13,0.13),white,[Math.sin(a)*0.25,0.86,0.28]);M(v,G3.ell(0.07,0.07,0.03),iris,[Math.sin(a)*0.25,0.86,0.4],{ol:0});s.stalks.push(v);}
  s.tick=[(e,t)=>{s.stalks.forEach((v,i)=>{v.rotation.z=Math.sin(t*2.2+i*1.3)*0.2;v.rotation.x=Math.cos(t*1.7+i)*0.15;});}];return s;}},
{name:'Occhio incoronato',desc:'Un occhio dentro tre anelli d\'oro con rune che gli girano intorno come un giroscopio, con sopra una corona di luce.',
 make(d){const s=enemyShell(4),K=kitFor(s),white=K.m(0xf0e6e0),gold=K.m(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.35}),rn=K.g(d.color,1.8),fl=K.m(0x3a1428);s.g=new THREE.Group();s.g.position.y=2.2;s.gy=2.2;s.body.add(s.g);s.noBar=true;
  M(s.g,G3.ell(0.85,0.85,0.85),white,[0,0,0]);M(s.g,G3.dome(0.9,0.3,1,1),fl,[0,0.03,-0.03],{r:[-0.3,0,0]});M(s.g,G3.dome(0.9,0.25,1,1),fl,[0,-0.03,-0.03],{r:[Math.PI+0.35,0,0]});
  s.iris=new THREE.Group();s.iris.position.z=0.78;s.g.add(s.iris);M(s.iris,G3.ell(0.4,0.4,0.1),rn,[0,0,0],{ol:0});M(s.iris,G3.ell(0.13,0.26,0.06),K.dark,[0,0,0.08],{ol:0});
  s.rings=[];for(let i=0;i<3;i++){const r=new THREE.Group();s.g.add(r);M(r,G3.tor(1.2+i*0.22,0.06,TAU,64,8),gold,[0,0,0]);for(let j=0;j<6;j++){const a=j/6*TAU;M(r,G3.rb(0.1,0.1,0.04,0.02),rn,[Math.cos(a)*(1.2+i*0.22),Math.sin(a)*(1.2+i*0.22),0.06],{ol:0});}s.rings.push(r);}
  const cr=crown2(s.g,K,1.05,0.36,gold,rn,{n:7});
  s.tick=[(e,t)=>{s.rings[0].rotation.set(t*0.6,0.4,0);s.rings[1].rotation.set(1.2,t*0.5,0.3);s.rings[2].rotation.set(0.5,0.9,t*0.4);cr.rotation.y=t*0.5;}];return s;}},
],
/* ---------- piano 65: Minotauro ---------- */
minoKing:[
{name:'Re dei minotauri',desc:'Un minotauro enorme con la corona fra le corna, mantello di pelliccia e un\'ascia bipenne a due mani.',
 make(d){const {s,R,K}=bossHum({skin:d.color,shirt:'skin',sleeve:'skin',pants:0x3a2418,boot:0x2a1a10,hair:0x2a1810,build:1.4},4.6,1.65),horn=K.m(0xe8dcc0),fur=K.m(0x4a2e1c),gold=K.m(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.3}),iron=K.m(0x8a8f99),wood=K.m(0x4a3220),eye=K.g(0xff3b1f,2.4);
  M(R.torso,G3.ell(0.25,0.23,0.21),R.skinM,[0,0.32,0.05]);nbMinoHead(R,K,R.skinM,K.m(shadeC(d.color,1.3)),horn,gold,eye,{k:1.15});crown2(R.head,K,0.22,0.15,gold,K.g(0xd83a4a,1.3),{n:5});
  SP.capelet(R,fur,{len:0.3,r1:0.36});capeFor(s,R,K.ds(0x7a1a1a),1.0,0.5);SP.flap(R,fur,{len:0.24,w0:0.3,jag:0.04});SP.belt(R,fur,gold,{t:0.04});SP.bracer(R,fur,{ring:gold});
  const ax=new THREE.Group();R.arms[0].wr.add(ax);M(ax,G3.limb(0.05,0.055,1.9),wood,[0,-0.65,0]);
  for(const z of [-1,1])M(ax,G3.shape(sh=>{sh.moveTo(0,0.12);sh.quadraticCurveTo(0.36*z,0.44,0.62*z,0.38);sh.quadraticCurveTo(0.48*z,0,0.62*z,-0.38);sh.quadraticCurveTo(0.36*z,-0.44,0,-0.12);sh.lineTo(0,0.12);},0.03,0.01),iron,[0,-1.45,0],{r:[0,Math.PI/2,0]});
  M(ax,G3.ell(0.07,0.1,0.07),gold,[0,-1.45,0]);return s;}},
{name:'Minotauro di ghiaccio',desc:'Pelliccia bianca e azzurra brinata, corna di ghiaccio, cristalli sulle spalle e un martello di ghiaccio.',
 make(d){const {s,R,K}=bossHum({skin:0xc8d8e8,shirt:'skin',sleeve:'skin',pants:0x5a7a9a,boot:0x3a5a7a,hair:0xe8f4ff,build:1.4},4.6,1.65),ice=K.m(0xaee4ff,{emissive:0x4ab0ff,emissiveIntensity:0.5,transparent:true,opacity:0.9}),fur=K.m(0xe8f4ff),eye=K.g(0x8fdcff,2.6),iron=K.m(0x5a7a9a);
  M(R.torso,G3.ell(0.25,0.23,0.21),R.skinM,[0,0.32,0.05]);nbMinoHead(R,K,R.skinM,K.m(0x9ab0c8),ice,iron,eye,{k:1.2});
  SP.capelet(R,fur,{len:0.28,r1:0.36});SP.flap(R,K.m(0x5a7a9a),{len:0.24,w0:0.3,jag:0.06});SP.belt(R,iron,ice,{t:0.04});
  for(const x of [-1,1])for(let i=0;i<4;i++)M(R.chest,G3.cone(0.05,0.3-i*0.04,6),ice,[x*(0.2+i*0.05),0.4+i*0.02,-0.04+i*0.04],{r:[0,0,-x*(0.3+i*0.25)],ol:0});
  const hm=new THREE.Group();R.arms[0].wr.add(hm);M(hm,G3.limb(0.045,0.05,1.5),iron,[0,-0.5,0]);M(hm,G3.rb(0.36,0.36,0.62,0.06),ice,[0,-1.25,0],{ol:0});
  for(const z of [-1,1])M(hm,G3.cone(0.12,0.3,6),ice,[0,-1.25,z*0.42],{r:[z*Math.PI/2,0,0],ol:0});
  s.tick=[(e,t)=>{ice.emissiveIntensity=0.4+Math.sin(t*2)*0.15;}];return s;}},
{name:'Minotauro corazzato',desc:'Un minotauro chiuso in un\'armatura a piastre rosse e nere, elmo con le corna fuori e uno spadone enorme.',
 make(d){const {s,R,K}=bossHum({skin:d.color,shirt:0x2a1a1a,sleeve:0x2a1a1a,fore:0x2a1a1a,pants:0x2a1a1a,boot:0x1a1010,glove:0x2a1a1a,build:1.4},4.6,1.65),plate=K.m(0x7a1a1a),blk=K.m(0x1e1a22),horn=K.m(0xe8dcc0),eye=K.g(0xffb347,2.6);
  nbMinoHead(R,K,R.skinM,K.m(shadeC(d.color,1.3)),horn,null,eye,{k:1.1});M(R.head,G3.dome(0.27,0.5,1.0,1.1),plate,[0,0.04,0.0]);M(R.head,G3.rb(0.05,0.2,0.08,0.02),blk,[0,0.02,0.3]);
  SP.shell(R,plate,0.02,0.68,0.03);SP.pauldron(R,plate,{layers:3,r:0.15,trim:blk});SP.bracer(R,plate,{ring:blk});SP.greave(R,plate,blk);SP.cuisse(R,plate);SP.belt(R,blk,plate,{t:0.04});capeFor(s,R,K.ds(0x1e1a22),1.0,0.5);
  const sw=buildWeapon2('spada',0,3,'fuoco');sw.g.scale.setScalar(1.5);R.arms[0].wr.add(sw.g);return s;}},
],
};

/* ---------- nel gioco: versioni scelte ---------- */
const NBPICK={fungusKing:2,gargoyleLord:2,shadeLord:2,ogreKing:1,scorpionKing:0,salamanderKing:2,eyeLord:2,minoKing:0};
for(const a in NBPICK)BOSSB[a]=d=>{const s=NBOSSES[a][NBPICK[a]].make(d);s.tick=s.tick||[];return s;};
Object.assign(BLOOD,{fungusKing:[0xc9e08a,0x7a9a3a],gargoyleLord:[0x9a9aa4,0x6a6a74],shadeLord:[0x8a6aff,0x2a1a6a],ogreKing:[0x8a0f1a,0x5a0a10],
  scorpionKing:[0xa6e34a,0x6a8a1e],salamanderKing:[0xff9a3a,0xb04a14],eyeLord:[0xc23a7a,0x6a1a3a],minoKing:[0x8a0f1a,0x5a0a10]});
Object.assign(BEST_TIPS,{'boss:fungusKing':'Le spore restano a terra: non fermarti dove si alza la nube.','boss:gargoyleLord':'Piomba dove sei: quando vedi il segno a terra, schiva.',
  'boss:shadeLord':'Sparisce e ti appare alle spalle: girati subito dopo il fumo.','boss:ogreKing':'Gli spiriti dal cielo cadono dove sei: muoviti mentre alza il totem.',
  'boss:scorpionKing':'Pinze da vicino, veleno da lontano: salta quando si abbassa.','boss:salamanderKing':'Tre teste, tre fiammate: passa fra un colpo e l\'altro.',
  'boss:eyeLord':'Il raggio attraversa la stanza: saltalo o stagli dietro.','boss:minoKing':'Carica due volte di fila: schiva la prima e preparati alla seconda.'});

/* ---------- mosse: tre per ogni guardiano nuovo (sostituiscono quelle dei guardiani che c'erano prima su questi piani) ---------- */
Object.assign(BOSS_KITS,{
 20:[{n:'Nube di spore',p:'spitWind',w:.55,r:.9,f(e,d,sp,rg){sfx('orb');const n=rg?4:3;for(let i=0;i<n;i++){const x=i?bkX(P.x+rand(-8,8)):P.x;bkPool(e,x,2.6,3.2,0x6affd8,.3,'poison');}}},
  {n:'Funghi esplosivi',p:'hopWind',w:.5,r:1,f(e){for(const o of [0,-4.5,4.5,-9,9]){const x=bkX(P.x+o);bkWarn(x,1.6,.75+Math.abs(o)*.03,()=>{sfx('boom');burst(x,.5,0x6affd8,18,6,3);for(let k=0;k<5;k++)bkP(e,'glob',x+rand(-.4,.4),.3,rand(-3,3),rand(13,19),.5,{g:22,life:2});bkCol(e,x,1.6,.6,0x6affd8);},0x6affd8);}}},
  {n:'Pioggia di spore',p:'volleyWind',w:.6,r:.9,f(e,d,sp,rg){const ox=e.x+e.face,oy=e.y+3.2,n=rg?7:5;sfx('orb');for(let i=0;i<n;i++){const tt=.7+i*.15,tx=P.x+(i-(n-1)/2)*1.8;bkP(e,'glob',ox,oy,(tx-ox)/tt,(.3-oy)/tt+10*tt,.6,{g:20,life:3});}}}],
 25:[{n:'Picchiata di pietra',p:'diveWind',w:.6,r:1.1,f(e){const tx=P.x;bkWarn(tx,3,.7,()=>{if(e.dead)return;e.x=bkX(tx);e.y=0.4;e.vy=0;shake(.6);sfx('slam');burst(e.x,.3,0x9a9aa4,30,8,3);
    bkAoe(()=>{if(!P.dead&&Math.abs(P.x-e.x)<1.8+P.w/2&&P.y<2.5)hurtPlayer(e.dmg*1.2,e.x,e.eff);});for(const s of [-1,1])bkShock(e,e.x+s*1.3,s*11,.7);},0xb48cff);}},
  {n:'Rune cadenti',p:'pillarsWind',w:.5,r:.9,f(e,d,sp,rg){bkSeq(e,rg?6:5,.28,()=>{const x=bkX(P.x+rand(-1.5,1.5));bkWarn(x,1.4,.55,()=>{bkCol(e,x,1.4,.8,0xb48cff);burst(x,CEIL-1,0xb48cff,8,3,2);},0xb48cff);});}},
  {n:'Schegge d\'ossidiana',p:'volleyWind',w:.55,r:1,f(e){bkSeq(e,2,.4,k=>{for(let i=0;i<10;i++){const a=(i+k*.5)/10*TAU;bkP(e,'knife',e.x,e.y+1.5,Math.cos(a)*8.5,Math.sin(a)*8.5,.5,{life:3});}sfx('arrow');});}}],
 30:[{n:'Falciata dall\'ombra',p:'comboWind',w:.5,r:.8,f(e){burst(e.x,1.8,0x8a6aff,26,6,3,.2);const s=P.face||1;e.x=bkX(P.x-s*2.2);e.face=s;burst(e.x,1.8,0x8a6aff,26,6,3,.2);sfx('dash');bkSwing(e,'combo',4.4,1.2,.34);}},
  {n:'Passo della morte',p:'dashWind',w:.55,r:.9,f(e){let c=0;bkDash(e,'dash',22,.55,1.0,dt=>{c-=dt;if(c<=0){c=.06;burst(e.x,1.8,0x2e2444,3,2,2,.2);}});}},
  {n:'Spiriti erranti',p:'leapWind',w:.6,r:1.1,f(e,d,sp,rg){bkSeq(e,rg?6:4,.22,i=>{const a=i/(rg?6:4)*TAU;bkP(e,'bolt',e.x+Math.cos(a)*1.4,e.y+2.4+Math.sin(a)*1.4,Math.cos(a)*4,Math.sin(a)*4,.55,{col:0xb48cff,homing:2.2,life:6});sfx('orb');});}}],
 35:[{n:'Colpo di totem',p:'slamWind',w:.55,r:1,f(e){bkJump(e,'slamAir',17,P.x,()=>{shake(.6);sfx('boom');burst(e.x,.2,0x7a9a5a,30,8,3);bkAoe(()=>{if(!P.dead&&Math.abs(P.x-e.x)<2+P.w/2&&P.y<2)hurtPlayer(e.dmg*1.1,e.x,e.eff);});for(const s of [-1,1])bkShock(e,e.x+s*1.3,s*11,.75);});}},
  {n:'Spiriti degli antenati',p:'ringWind',w:.6,r:1,f(e){sfx('roar');for(let i=0;i<12;i++){const a=i/12*TAU;bkP(e,'bolt',e.x,e.y+2,Math.cos(a)*5.5,Math.sin(a)*5.5,.5,{col:0x6aff9a});}bkLater(.5,()=>{if(e.dead)return;for(let i=0;i<12;i++){const a=(i+.5)/12*TAU;bkP(e,'bolt',e.x,e.y+2,Math.cos(a)*5.5,Math.sin(a)*5.5,.5,{col:0x6aff9a});}});}},
  {n:'Danza della tempesta',p:'pillarsWind',w:.55,r:1,f(e,d,sp,rg){sfx('zap');bkSeq(e,rg?6:5,.35,()=>{const x=bkX(P.x);bkWarn(x,1.3,.55,()=>{lightning(x,CEIL,x,0);bkCol(e,x,1.3,.85,0x6aff9a);},0x6aff9a);});}}],
 40:[{n:'Pungiglione',p:'spitWind',w:.5,r:.9,f(e){const ox=e.x+e.face*.5,oy=e.y+3.4;sfx('orb');for(let i=0;i<3;i++){const tt=.7+i*.18,tx=P.x+(i-1)*2.4;bkP(e,'glob',ox,oy,(tx-ox)/tt,(.3-oy)/tt+10*tt,.6,{g:20,life:tt});bkLater(tt,()=>{if(e.dead)return;bkPool(e,tx,1.8,2.4,0xa6e34a,.3,'poison');});}}},
  {n:'Chele',p:'swipeWind',w:.45,r:.7,f(e){bkSwing(e,'swipe',4.6,1.2,.32);const f=e.face;bkLater(.4,()=>{if(e.dead)return;e.didHit=false;sfx('heavy');const x1=f>0?e.x:e.x-4.6,x2=f>0?e.x+4.6:e.x;bkAoe(()=>{if(overlap(x1,x2,e.y,e.y+2.6,P))hurtPlayer(e.dmg,e.x,e.eff);});});}},
  {n:'Sabbie mobili',p:'hopWind',w:.55,r:1.1,f(e){bkJump(e,'hop',16,P.x,()=>{shake(.55);sfx('slam');burst(e.x,.2,0xd9b45a,30,8,3);for(const s of [-1,1])bkShock(e,e.x+s*1.6,s*10,.7);bkPool(e,e.x,4.4,3,0xd9b45a,.25,'slow');});}}],
 45:[{n:'Tre fiammate',p:'volleyWind',w:.6,r:1,f(e,d,sp,rg){bkSeq(e,rg?3:2,.45,()=>{const ox=e.x+e.face*1.4,oy=e.y+2.2,b=bkAim(ox,oy);for(const k of [-1,0,1]){const a=b+k*.22;bkP(e,'fire',ox,oy,Math.cos(a)*11,Math.sin(a)*11,.6,{life:2.5,sz:1});}sfx('roar');});}},
  {n:'Fiume di lava',p:'slamWind',w:.55,r:1.1,f(e){shake(.4);sfx('slam');for(let i=0;i<4;i++){const x=i?bkX(P.x+rand(-9,9)):P.x;bkPool(e,x,3,3.4,0xff6a1e,.35,'burn');}}},
  {n:'Morsi a catena',p:'dashWind',w:.5,r:1,f(e){let c=0;bkDash(e,'dash',18,.75,1.0,dt=>{c-=dt;if(c<=0){c=.1;bkPool(e,e.x,1.4,1.4,0xff6a1e,.3,'burn');}});}}],
 55:[{n:'Raggio dello sguardo',p:'fireWind',w:.7,r:1.1,f(e){const s=P.x>=e.x?1:-1;let x=e.x,hit=false,c=0;sfx('zap');bkHold(e,'fire',(GATE_X+HALF-3)/16,dt=>{x+=s*16*dt;c-=dt;if(c<=0){c=.07;lightning(e.x,e.y+2,x,0);burst(x,.4,0xc23a7a,4,3,4,.2);}if(!hit&&!P.dead&&Math.abs(P.x-x)<.9+P.w/2&&P.y<1.6){hit=true;hurtPlayer(e.dmg*1.2,x,e.eff);}});}},
  {n:'Anelli d\'oro',p:'ringWind',w:.5,r:1,f(e){const b=Math.random()*TAU;bkSeq(e,30,.05,i=>{const a=b+i*.6;bkP(e,'bolt',e.x,e.y+2,Math.cos(a)*5.5,Math.sin(a)*5.5,.45,{col:0xd9b45a,life:4.5,sz:.8});if(i%6==0)sfx('orb');});}},
  {n:'Sguardo che pietrifica',p:'orbsWind',w:.55,r:.9,f(e){for(const o of [0,-3.4,3.4]){const x=bkX(P.x+o);bkWarn(x,2,.85,()=>{fxRing(x,.06,0,0xc23a7a,2,.4);bkCol(e,x,2,.7,0xc23a7a,'slow');},0xc23a7a);}}}],
 65:[{n:'Carica del toro',p:'dashWind',w:.55,r:1,f(e){let leg=0;const go=()=>{e.didHit=false;e.face=P.x>=e.x?1:-1;e.t=0;sfx('roar');};go();e.state='dash';e.act=()=>{e.vx=e.face*22;if(Math.random()<.4)burst(e.x-e.face,.2,0xb9ad98,2,2,1);
    if(!e.didHit&&overlap(e.x-e.w,e.x+e.w,e.y,e.y+e.h,P)){hurtPlayer(e.dmg*1.1,e.x,e.eff);e.didHit=true;}if((e.hitWall&&e.hitWall===e.face)||e.t>.6){shake(.35);sfx('slam');leg++;if(leg>=2)return true;go();}return false;};}},
  {n:'Ascia del re',p:'leapWind',w:.55,r:1.1,f(e){bkJump(e,'leap',18,P.x,()=>{shake(.7);sfx('boom');burst(e.x,.2,0xd9b45a,34,9,3);bkAoe(()=>{if(!P.dead&&Math.abs(P.x-e.x)<2.2+P.w/2&&P.y<2.4)hurtPlayer(e.dmg*1.25,e.x,e.eff);});for(const s of [-1,1])bkShock(e,e.x+s*1.4,s*12,.8,{h:1.4});});}},
  {n:'Mulinello',p:'comboWind',w:.45,r:.9,f(e,d,sp){let n=0;e.state='combo';e.t=0;e.didHit=false;e.vx=e.face*8;e.n=0;sfx('swing');e.act=()=>{if(!e.didHit&&e.t>.03){const x1=e.face>0?e.x:e.x-4,x2=e.face>0?e.x+4:e.x;if(overlap(x1,x2,e.y,e.y+3.6,P)){hurtPlayer(e.dmg*.75,e.x,e.eff);e.didHit=true;}}
    if(e.t>.24/sp){n++;if(n>=3)return true;e.face=P.x>=e.x?1:-1;e.n=n;e.t=0;e.didHit=false;e.vx=e.face*8;sfx('swing');}return false;};}}],
});
