// ===== NUOVE ARMI: 3 versioni per ogni arma (i catalizzatori dei maghi restano quelli del gioco) =====
// Stesso formato del gioco: buildWeapon2(tipo, versione, rarità, effetto) → {g, tip}. L'impugnatura è all'origine, l'arma scende lungo -y,
// la lama sta nel piano y-z (come buildWeaponMesh), le lunghezze restano quelle del gioco così colpi e pose non cambiano.
function wkit(rarity,effect,hero){
  const R=RARITY[rarity||0],e=effect?EFFECTS[effect]:null;
  const K={R,
    metal:toon(rarity>=3?0xeef2fc:0xd2d9e3,{emissive:R.hex,emissiveIntensity:0.04+rarity*0.12}),
    steel:toon(0x6e7480,{emissive:R.hex,emissiveIntensity:0.02+rarity*0.06}),
    gold:toon(rarity>=2?R.hex:0xc89a52,{emissive:rarity>=2?R.hex:0x3a2400,emissiveIntensity:rarity>=2?0.25:0.12}),
    wood:toon(0x7a5434),woodD:toon(0x4a2e1c),lea:toon(0x3a2620),wrap:toon(0x2a2220),cloth:toon(0xb52a2a),bone:toon(0xe6dcc6),black:toon(0x1e1a22),
    gem:e?toon(e.color,{emissive:e.color,emissiveIntensity:1.4}):null,
    glow:c=>toon(c,{emissive:c,emissiveIntensity:1.6}),
    str:new THREE.MeshBasicMaterial({color:0xe8e0cc})};
  return hero?wpalKit(K,rarity||0):K;
}
// lama piatta con bordi smussati: forma disegnata con x = verso il filo, y = verso la punta (in basso); ruotata nel piano y-z
function bladeG(fn,o){o=o||{};const s=new THREE.Shape();fn(s);if(o.hole)s.holes.push(o.hole);
  const d=o.d||0.008,g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:o.bt||0.01,bevelSize:o.bs||0.014,bevelSegments:o.seg||2,curveSegments:o.cs||24});
  g.translate(0,0,-d/2);g.rotateY(Math.PI/2);return g;}
// fasciatura dell'impugnatura
function gripWrap(g,m,y0,y1,r,n){for(let i=0;i<n;i++){const y=lerp(y0,y1,(i+0.5)/n);M(g,G3.tor(r,r*0.32,TAU,24,8),m,[0,y,0],{r:[Math.PI/2+(i%2?0.28:-0.28),0,0],ol:0});}}
const quad=(s,pts)=>{s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const p=pts[i];if(p.length===4)s.quadraticCurveTo(p[0],p[1],p[2],p[3]);else s.lineTo(p[0],p[1]);}};
const mirrorX=pts=>pts.map(p=>p.length===4?[-p[0],p[1],-p[2],p[3]]:[-p[0],p[1]]);
// gemma dell'effetto sui due lati
function gems(g,K,pos,r){if(!K.gem)return;for(const s of [-1,1])M(g,G3.ell(r||0.035,r||0.035,(r||0.035)*0.6),K.gem,[pos[0]+s*(pos[3]||0.03),pos[1],pos[2]],{ol:0});}

const WEAPONS={
/* ---------------- SPADA ---------------- */
spada:[
{name:'Spada lunga',desc:'Lama dritta con scanalatura, elsa a quillon ricurvi, impugnatura di cuoio e pomo tondo.',
 make(g,K){M(g,G3.ell(0.048,0.055,0.048),K.gold,[0,0.15,0]);M(g,G3.limb(0.032,0.036,0.22),K.lea,[0,0.02,0]);gripWrap(g,K.wrap,0.11,-0.07,0.036,6);
  M(g,G3.tube([[0,-0.06,-0.25],[0,-0.1,-0.15],[0,-0.105,0],[0,-0.1,0.15],[0,-0.06,0.25]],0.02,0.02,30,10,t=>0.024-0.012*Math.abs(2*t-1)),K.gold,null);
  M(g,G3.rb(0.06,0.07,0.09,0.02),K.gold,[0,-0.1,0]);
  M(g,bladeG(s=>quad(s,[[-0.06,0],[-0.05,-1.08],[-0.035,-1.24,0,-1.33],[0.035,-1.24,0.05,-1.08],[0.06,0]]),{d:0.006,bt:0.009,bs:0.014}),K.metal,[0,-0.12,0]);
  for(const s of [-1,1])M(g,G3.rb(0.004,0.8,0.02,0.002),K.steel,[s*0.01,-0.6,0],{ol:0});
  gems(g,K,[0,-0.1,0,0.035],0.03);return -1.45;}},
{name:'Spadone',desc:'Lama larga a due mani con tallone stretto, guardia massiccia con puntale e pomo a disco.',
 make(g,K){M(g,G3.cyl(0.06,0.06,0.03,32),K.gold,[0,0.19,0],{r:[0,0,Math.PI/2]});M(g,G3.limb(0.033,0.037,0.3),K.lea,[0,0.04,0]);gripWrap(g,K.wrap,0.17,-0.08,0.037,8);
  M(g,G3.rb(0.07,0.065,0.52,0.03),K.gold,[0,-0.11,0]);for(const s of [-1,1])M(g,G3.ell(0.045,0.045,0.045),K.gold,[0,-0.11,s*0.27]);
  M(g,bladeG(s=>quad(s,[[-0.04,0],[0.04,0],[0,-0.11]]),{d:0.01,bt:0.01,bs:0.01}),K.gold,[0,-0.14,0]);
  M(g,bladeG(s=>quad(s,[[-0.045,0],[-0.045,-0.1],[-0.085,-0.14],[-0.08,-1.08],[-0.05,-1.22,0,-1.32],[0.05,-1.22,0.08,-1.08],[0.085,-0.14],[0.045,-0.1],[0.045,0]]),{d:0.006,bt:0.01,bs:0.016}),K.metal,[0,-0.13,0]);
  for(const s of [-1,1])M(g,G3.rb(0.004,0.85,0.036,0.002),K.steel,[s*0.011,-0.75,0],{ol:0});
  gems(g,K,[0,-0.11,0,0.038],0.032);return -1.45;}},
{name:'Lama fiammeggiante',desc:'Lama ondulata come una fiamma, anelli di parata ai lati dell\'elsa e pomo a goccia.',
 make(g,K){M(g,G3.lathe([[0.001,0.1],[0.035,0.115],[0.05,0.15],[0.03,0.19],[0.001,0.205]]),K.gold,[0,0.0,0]);M(g,G3.limb(0.032,0.036,0.2),K.lea,[0,0.0,0]);
  M(g,G3.tube((()=>{const p=[];for(let i=0;i<=40;i++){const t=i/40,a=t*TAU*4;p.push([Math.cos(a)*0.036,0.09-t*0.18,Math.sin(a)*0.036]);}return p;})(),0.007,0.007,120,6),K.gold,null,{ol:0});
  M(g,G3.rb(0.05,0.05,0.44,0.02),K.gold,[0,-0.1,0]);for(const s of [-1,1]){M(g,G3.ell(0.035,0.035,0.035),K.gold,[0,-0.1,s*0.23]);M(g,G3.tor(0.05,0.011,TAU,32,8),K.gold,[0,-0.16,s*0.07],{r:[0,Math.PI/2,0]});}
  M(g,bladeG(s=>{const L=1.33,n=48,L2=[],R2=[];for(let i=0;i<=n;i++){const t=i/n,y=-t*(L-0.1),w=lerp(0.055,0.035,t)+0.016*Math.sin(t*TAU*4.5);L2.push([-w,y]);R2.push([w,y]);}
    s.moveTo(L2[0][0],L2[0][1]);for(const p of L2)s.lineTo(p[0],p[1]);s.lineTo(0,-L);for(const p of R2.reverse())s.lineTo(p[0],p[1]);},{d:0.006,bt:0.009,bs:0.012,cs:8}),K.metal,[0,-0.12,0]);
  M(g,G3.tube([[0.011,-0.14,0],[0.011,-1.3,0]],0.005,0.003,8,6),K.steel,null,{ol:0});M(g,G3.tube([[-0.011,-0.14,0],[-0.011,-1.3,0]],0.005,0.003,8,6),K.steel,null,{ol:0});
  gems(g,K,[0,-0.1,0,0.03],0.028);return -1.45;}},
],
/* ---------------- ASCIA ---------------- */
ascia:[
{name:'Ascia barbuta',desc:'Testa con la "barba" allungata verso il basso, manico di frassino fasciato e borchie.',
 make(g,K){M(g,G3.ell(0.05,0.045,0.05),K.steel,[0,0.17,0]);M(g,G3.limb(0.04,0.046,1.56),K.wood,[0,-0.6,0]);gripWrap(g,K.lea,0.12,-0.28,0.046,9);
  M(g,G3.cyl(0.058,0.062,0.2,32),K.steel,[0,-1.24,0]);for(const y of [-1.12,-1.08])M(g,G3.hring(0.05,0.012,1),K.lea,[0,y,0],{ol:0});
  M(g,bladeG(s=>quad(s,[[0.05,0.07],[0.2,0.09],[0.32,0.13,0.4,0.22],[0.47,0.0,0.43,-0.22],[0.39,-0.34,0.29,-0.42],[0.2,-0.2,0.05,-0.08]]),{d:0.014,bt:0.014,bs:0.02}),K.metal,[0,-1.24,0]);
  M(g,bladeG(s=>quad(s,[[0.05,0.07],[0.19,0.08],[0.25,-0.04],[0.2,-0.16],[0.05,-0.08]]),{d:0.022,bt:0.008,bs:0.008}),K.steel,[0,-1.24,0]);
  M(g,G3.cyl(0.045,0.052,0.1,24),K.steel,[0,-1.24,0.1],{r:[Math.PI/2,0,0]});
  for(const s of [-1,1])for(const [y,z] of [[-1.19,-0.1],[-1.29,-0.1]])M(g,G3.ell(0.014,0.014,0.01),K.gold,[s*0.026,y,z],{ol:0});
  gems(g,K,[0,-1.24,-0.2,0.028],0.03);g.userData.tipZ=-0.45;return -1.25;}},
{name:'Bipenne',desc:'Due lame a mezzaluna contrapposte, punta in fondo al manico e anelli d\'oro.',
 make(g,K){M(g,G3.ell(0.05,0.045,0.05),K.gold,[0,0.17,0]);M(g,G3.limb(0.04,0.046,1.56),K.woodD,[0,-0.6,0]);gripWrap(g,K.lea,0.12,-0.28,0.046,9);
  for(const y of [-1.08,-1.4])M(g,G3.hring(0.05,0.014,1),K.gold,[0,y,0]);
  M(g,G3.cyl(0.055,0.055,0.26,32),K.steel,[0,-1.24,0]);
  const half=[[0.05,0.08],[0.2,0.12,0.33,0.3],[0.46,0.0,0.33,-0.3],[0.2,-0.12,0.05,-0.08]];
  M(g,bladeG(s=>quad(s,half),{d:0.012,bt:0.012,bs:0.02}),K.metal,[0,-1.24,0]);M(g,bladeG(s=>quad(s,mirrorX(half)),{d:0.012,bt:0.012,bs:0.02}),K.metal,[0,-1.24,0]);
  const ck=[[0.05,0.07],[0.17,0.09],[0.23,0],[0.17,-0.09],[0.05,-0.07]];M(g,bladeG(s=>quad(s,ck),{d:0.02,bt:0.008,bs:0.008}),K.steel,[0,-1.24,0]);M(g,bladeG(s=>quad(s,mirrorX(ck)),{d:0.02,bt:0.008,bs:0.008}),K.steel,[0,-1.24,0]);
  for(const s of [-1,1])M(g,G3.tube([[s*0.012,-1.14,-0.06],[s*0.012,-1.24,-0.28],[s*0.012,-1.34,-0.06]],0.008,0.008,20,6),K.gold,null,{ol:0}),
    M(g,G3.tube([[s*0.012,-1.14,0.06],[s*0.012,-1.24,0.28],[s*0.012,-1.34,0.06]],0.008,0.008,20,6),K.gold,null,{ol:0});
  M(g,G3.cone(0.04,0.16,24),K.steel,[0,-1.45,0],{r:[Math.PI,0,0]});
  gems(g,K,[0,-1.24,0,0.06],0.032);g.userData.tipZ=-0.42;return -1.25;}},
{name:'Mietitrice',desc:'Grande lama a mezzaluna traforata, becco da guerra sul retro e manico rinforzato.',
 make(g,K){M(g,G3.ell(0.05,0.045,0.05),K.steel,[0,0.17,0]);M(g,G3.limb(0.042,0.047,1.6),K.black,[0,-0.62,0]);gripWrap(g,K.gold,0.12,-0.3,0.047,7);
  for(const s of [-1,1])M(g,G3.rb(0.012,0.34,0.03,0.006),K.steel,[s*0.044,-1.0,0],{ol:0.006});
  M(g,G3.cyl(0.058,0.062,0.24,32),K.steel,[0,-1.24,0]);
  const hole=new THREE.Path();hole.absellipse(0.22,0.0,0.05,0.09,0,TAU,true);
  M(g,bladeG(s=>quad(s,[[0.05,0.12],[0.28,0.12,0.4,0.36],[0.6,0.0,0.4,-0.36],[0.28,-0.12,0.05,-0.12]]),{d:0.012,bt:0.012,bs:0.02,hole}),K.metal,[0,-1.24,0]);
  M(g,bladeG(s=>quad(s,[[0.05,0.1],[0.14,0.1],[0.16,0],[0.14,-0.1],[0.05,-0.1]]),{d:0.022,bt:0.008,bs:0.008}),K.steel,[0,-1.24,0]);
  M(g,G3.tube([[0,-1.2,0.04],[0,-1.21,0.2],[0,-1.31,0.34]],0.04,0.004,20,12),K.steel,null);
  M(g,G3.cone(0.04,0.18,24),K.steel,[0,-1.46,0],{r:[Math.PI,0,0]});
  gems(g,K,[0,-1.24,-0.22,0.014],0.032);g.userData.tipZ=-0.5;return -1.25;}},
],
/* ---------------- LANCIA ---------------- */
lancia:[
{name:'Lancia a foglia',desc:'Punta a foglia con nervatura, nappa rossa sotto la punta e puntale in fondo.',
 make(g,K){M(g,G3.cone(0.04,0.12,24),K.steel,[0,0.4,0]);M(g,G3.limb(0.036,0.041,2.08),K.wood,[0,-0.71,0]);gripWrap(g,K.lea,0.12,-0.26,0.041,8);
  M(g,G3.lathe([[0.03,-0.17],[0.048,-0.1],[0.044,0]]),K.steel,[0,-1.66,0]);M(g,G3.hring(0.045,0.01,1),K.gold,[0,-1.68,0],{ol:0});
  for(let i=0;i<6;i++){const a=i/6*TAU;M(g,G3.tube([[Math.cos(a)*0.03,-1.66,Math.sin(a)*0.03],[Math.cos(a)*0.06,-1.6,Math.sin(a)*0.06+0.05],[Math.cos(a)*0.07,-1.5,Math.sin(a)*0.07+0.1]],0.016,0.008,12,8),K.cloth,null,{ol:0.006});}
  M(g,bladeG(s=>{s.moveTo(-0.02,0);s.bezierCurveTo(-0.085,-0.1,-0.07,-0.3,0,-0.5);s.bezierCurveTo(0.07,-0.3,0.085,-0.1,0.02,0);},{d:0.006,bt:0.01,bs:0.014}),K.metal,[0,-1.79,0]);
  for(const s of [-1,1])M(g,G3.rb(0.008,0.36,0.012,0.004),K.steel,[s*0.01,-1.98,0],{ol:0});
  gems(g,K,[0,-1.72,0,0.045],0.026);return -2.26;}},
{name:'Partigiana',desc:'Lama lunga con due alette laterali ricurve, collare d\'oro e asta scura con anelli.',
 make(g,K){M(g,G3.cone(0.04,0.12,24),K.gold,[0,0.4,0]);M(g,G3.limb(0.036,0.041,2.08),K.woodD,[0,-0.71,0]);gripWrap(g,K.lea,0.12,-0.26,0.041,8);
  for(const y of [-0.5,-0.9,-1.3])M(g,G3.hring(0.042,0.01,1),K.gold,[0,y,0],{ol:0});
  M(g,G3.lathe([[0.03,-0.14],[0.05,-0.08],[0.045,0]]),K.gold,[0,-1.66,0]);
  M(g,bladeG(s=>quad(s,[[-0.04,0],[-0.2,0.06,-0.18,-0.12],[-0.1,-0.06,-0.045,-0.08],[-0.045,-0.36],[0,-0.48],[0.045,-0.36],[0.045,-0.08],[0.1,-0.06,0.18,-0.12],[0.2,0.06,0.04,0]]),{d:0.006,bt:0.01,bs:0.014}),K.metal,[0,-1.8,0]);
  for(const s of [-1,1])M(g,G3.rb(0.008,0.3,0.014,0.004),K.gold,[s*0.01,-2.0,0],{ol:0});
  gems(g,K,[0,-1.74,0,0.05],0.028);return -2.26;}},
{name:'Zanna di drago',desc:'Lama ricurva a un solo filo con pinna dentata, nappa rossa e asta laccata di rosso.',
 make(g,K){const lac=toon(0x8a1a1f);M(g,G3.cone(0.04,0.12,24),K.gold,[0,0.4,0]);M(g,G3.limb(0.036,0.041,2.08),lac,[0,-0.71,0]);gripWrap(g,K.black,0.12,-0.26,0.041,8);
  for(const y of [-0.4,-1.2])M(g,G3.hring(0.043,0.012,1),K.gold,[0,y,0],{ol:0});
  M(g,G3.lathe([[0.03,-0.12],[0.052,-0.06],[0.046,0]]),K.gold,[0,-1.64,0]);
  for(let i=0;i<7;i++){const a=i/7*TAU;M(g,G3.tube([[Math.cos(a)*0.03,-1.64,Math.sin(a)*0.03],[Math.cos(a)*0.07,-1.56,Math.sin(a)*0.07+0.06],[Math.cos(a)*0.08,-1.44,Math.sin(a)*0.08+0.12]],0.016,0.008,12,8),K.cloth,null,{ol:0.006});}
  M(g,bladeG(s=>quad(s,[[-0.03,0],[-0.03,-0.12],[-0.06,-0.2,-0.02,-0.5],[0.06,-0.36,0.13,-0.18],[0.16,-0.08],[0.1,-0.07],[0.13,-0.02],[0.04,0]]),{d:0.008,bt:0.01,bs:0.014}),K.metal,[0,-1.77,0]);
  M(g,G3.tube([[-0.0,-1.8,0.03],[0,-1.84,0.08],[0,-1.8,0.13]],0.012,0.003,12,6),K.gold,null,{ol:0});
  gems(g,K,[0,-1.71,0,0.05],0.028);return -2.26;}},
],
/* ---------------- PUGNALI ---------------- */
pugnali:[
{name:'Stiletti',desc:'Lama sottile a sezione di diamante, piccola guardia ricurva e pomo a sfera.',
 make(g,K){M(g,G3.ell(0.03,0.032,0.03),K.gold,[0,0.1,0]);M(g,G3.limb(0.026,0.03,0.16),K.lea,[0,0.0,0]);gripWrap(g,K.wrap,0.07,-0.06,0.03,5);
  M(g,G3.tube([[0,-0.07,-0.1],[0,-0.1,-0.05],[0,-0.1,0.05],[0,-0.07,0.1]],0.014,0.014,20,8,t=>0.015-0.007*Math.abs(2*t-1)),K.gold,null);
  M(g,bladeG(s=>quad(s,[[-0.028,0],[0,-0.5],[0.028,0]]),{d:0.004,bt:0.012,bs:0.012}),K.metal,[0,-0.11,0]);for(const s of [-1,1])M(g,G3.tube([[s*0.014,-0.12,0],[s*0.01,-0.4,0],[s*0.004,-0.58,0]],0.004,0.002,16,6),K.steel,null,{ol:0});gems(g,K,[0,-0.1,0,0.02],0.018);return -0.62;}},
{name:'Kunai',desc:'Lama a foglia larga, impugnatura fasciata e anello in fondo per lanciarli.',
 make(g,K){M(g,G3.tor(0.04,0.01,TAU,32,8),K.steel,[0,0.13,0],{r:[0,Math.PI/2,0]});M(g,G3.limb(0.022,0.026,0.18),K.steel,[0,0.0,0]);gripWrap(g,toon(0x6a3aa8),0.08,-0.08,0.026,6);
  M(g,bladeG(s=>{s.moveTo(-0.02,0);s.bezierCurveTo(-0.07,-0.08,-0.06,-0.28,0,-0.5);s.bezierCurveTo(0.06,-0.28,0.07,-0.08,0.02,0);},{d:0.006,bt:0.01,bs:0.012}),K.metal,[0,-0.11,0]);
  for(const s of [-1,1])M(g,G3.rb(0.006,0.36,0.012,0.003),K.steel,[s*0.011,-0.32,0],{ol:0});gems(g,K,[0,-0.1,0,0.015],0.016);return -0.62;}},
{name:'Lame ricurve',desc:'Lame a falcetto curve in avanti, impugnatura con paramano e nastrino viola.',
 make(g,K){M(g,G3.ell(0.03,0.03,0.03),K.steel,[0,0.1,0]);M(g,G3.limb(0.026,0.03,0.17),K.black,[0,0.0,0]);gripWrap(g,toon(0x6a3aa8),0.07,-0.06,0.03,5);
  M(g,G3.tube([[0,-0.08,0.03],[0,-0.02,0.09],[0,0.08,0.07]],0.009,0.009,16,8),K.steel,null,{ol:0.006});
  M(g,G3.rb(0.04,0.03,0.08,0.012),K.steel,[0,-0.09,0]);
  M(g,bladeG(s=>quad(s,[[-0.03,0],[-0.045,-0.26,0.09,-0.5],[0.015,-0.28,0.03,0]]),{d:0.005,bt:0.01,bs:0.012}),K.metal,[0,-0.1,0]);for(const s of [-1,1])M(g,G3.tube([[s*0.012,-0.12,0.0],[s*0.012,-0.32,0.02],[s*0.01,-0.5,-0.04]],0.005,0.002,16,6),K.steel,null,{ol:0});
  gems(g,K,[0,-0.09,0,0.024],0.016);g.userData.tipZ=-0.09;return -0.6;}},
],
/* ---------------- MARTELLO ---------------- */
martello:[
{name:'Martello da guerra',desc:'Testa a botte con fasce d\'oro, punta in cima e lungo manico fasciato.',
 make(g,K){M(g,G3.ell(0.05,0.045,0.05),K.gold,[0,0.17,0]);M(g,G3.limb(0.042,0.046,1.32),K.wood,[0,-0.5,0]);gripWrap(g,K.lea,0.12,-0.3,0.046,9);
  const hd=G3.lathe([[0.001,-0.31],[0.1,-0.31],[0.12,-0.28],[0.14,-0.15],[0.145,0],[0.14,0.15],[0.12,0.28],[0.1,0.31],[0.001,0.31]],40);hd.rotateX(Math.PI/2);M(g,hd,K.metal,[0,-1.22,0]);
  for(const z of [-0.24,0.24]){const b=G3.hring(0.128,0.02,1);b.rotateX(Math.PI/2);M(g,b,K.gold,[0,-1.22,z]);}
  M(g,G3.cyl(0.06,0.065,0.08,28),K.gold,[0,-1.06,0]);M(g,G3.cone(0.045,0.18,24),K.steel,[0,-1.44,0],{r:[Math.PI,0,0]});
  gems(g,K,[0,-1.22,0,0.14],0.04);return -1.25;}},
{name:'Mazza flangiata',desc:'Testa con sette alette d\'acciaio intorno, pomolo in fondo e anelli sul manico.',
 make(g,K){M(g,G3.ell(0.055,0.05,0.055),K.steel,[0,0.17,0]);M(g,G3.limb(0.042,0.046,1.24),K.woodD,[0,-0.48,0]);gripWrap(g,K.lea,0.12,-0.3,0.046,9);
  for(const y of [-0.5,-0.8])M(g,G3.hring(0.046,0.012,1),K.gold,[0,y,0],{ol:0});
  M(g,G3.ell(0.1,0.17,0.1),K.steel,[0,-1.2,0]);M(g,G3.cyl(0.06,0.06,0.06,28),K.gold,[0,-1.03,0]);
  for(let i=0;i<7;i++){const a=i/7*TAU,f=new THREE.Group();f.position.set(0,-1.2,0);f.rotation.y=a;g.add(f);
    M(f,G3.shape(s=>{s.moveTo(0,0.17);s.quadraticCurveTo(0.2,0.12,0.17,-0.02);s.quadraticCurveTo(0.14,-0.14,0,-0.19);s.lineTo(0,0.17);},0.012,0.01),K.metal,[0.04,0,0]);}
  M(g,G3.ell(0.05,0.06,0.05),K.gold,[0,-1.4,0]);gems(g,K,[0,-1.03,0,0.06],0.028);return -1.25;}},
{name:'Maglio sacro',desc:'Testa squadrata a spigoli morbidi con cornici d\'oro e un sole su ogni faccia.',
 make(g,K){M(g,G3.ell(0.05,0.045,0.05),K.gold,[0,0.17,0]);M(g,G3.limb(0.044,0.048,1.3),toon(0xf0ead8),[0,-0.5,0]);gripWrap(g,K.gold,0.12,-0.3,0.048,7);
  M(g,G3.rb(0.3,0.3,0.6,0.09),K.metal,[0,-1.22,0]);for(const z of [-0.27,0.27])M(g,G3.rb(0.33,0.33,0.07,0.04),K.gold,[0,-1.22,z]);
  for(const s of [-1,1]){const e=new THREE.Group();e.position.set(s*0.152,-1.22,0);e.rotation.y=s*Math.PI/2;g.add(e);SP.sun(e,K.gold,0.045,10);}
  M(g,G3.cone(0.04,0.14,24),K.gold,[0,-1.43,0],{r:[Math.PI,0,0]});gems(g,K,[0,-1.22,0,0.165],0.036);return -1.25;}},
],
/* ---------------- FALCE ---------------- */
falce:[
{name:'Falce del mietitore',desc:'Asta leggermente curva con due impugnature e lunga lama a mezzaluna.',
 make(g,K){const sn=[[0,0.32,0],[0,-0.3,0.04],[0,-1.0,0.0],[0,-1.75,-0.02]];M(g,G3.tube(sn,0.04,0.036,40,14),K.woodD,null);
  for(const y of [0.0,-0.62])M(g,G3.cyl(0.022,0.024,0.14,16),K.wood,[0,y,0.1],{r:[Math.PI/2,0,0]});
  M(g,G3.cyl(0.05,0.05,0.1,28),K.steel,[0,-1.73,-0.02]);
  M(g,bladeG(s=>quad(s,[[0,-0.06],[0.52,-0.12,1.02,0.3],[0.55,0.04,0,0.07]]),{d:0.008,bt:0.01,bs:0.016,cs:32}),K.metal,[0,-1.75,-0.02]);
  gems(g,K,[0,-1.73,-0.02,0.05],0.03);g.userData.tipZ=-1.0;return -1.45;}},
{name:'Falce d\'osso',desc:'Asta fatta di vertebre, un teschio all\'attacco e lama con il dorso seghettato.',
 make(g,K){for(let i=0;i<14;i++){const y=0.3-i*0.15;M(g,G3.ell(0.045,0.055,0.045),K.bone,[0,y,0]);M(g,G3.cyl(0.03,0.03,0.12,16),K.bone,[0,y-0.075,0],{ol:0});}
  M(g,G3.ell(0.08,0.085,0.085),K.bone,[0,-1.78,0]);for(const s of [-1,1])M(g,G3.ell(0.022,0.02,0.015),K.gem||K.black,[s*0.03,-1.77,0.075],{ol:0});
  M(g,G3.rb(0.05,0.02,0.02,0.006),K.black,[0,-1.83,0.075],{ol:0});
  M(g,bladeG(s=>{s.moveTo(0,-0.06);s.quadraticCurveTo(0.52,-0.12,1.02,0.3);const n=9;for(let i=1;i<=n;i++){const t=i/n,x=lerp(1.02,0,t),y=lerp(0.3,0.07,t)-0.12*Math.sin(t*Math.PI)*0.6;s.lineTo(x+(i%2?0.02:0),y+(i%2?0.035:0));}},{d:0.008,bt:0.01,bs:0.014,cs:32}),K.metal,[0,-1.75,-0.04]);
  g.userData.tipZ=-1.0;return -1.45;}},
{name:'Falce spettrale',desc:'Lama frastagliata con il filo che brilla, catena avvolta sull\'asta di metallo scuro.',
 make(g,K){const gl=K.gem||K.glow(0x9a6aff);M(g,G3.tube([[0,0.32,0],[0,-0.6,0.02],[0,-1.75,0]],0.036,0.036,30,14),K.black,null);
  for(const y of [0.2,-1.5])M(g,G3.hring(0.042,0.012,1),K.steel,[0,y,0],{ol:0});
  SP.chain(g,K.steel,(()=>{const p=[];for(let i=0;i<=24;i++){const t=i/24,a=t*TAU*3;p.push([Math.cos(a)*0.05,0.1-t*1.4,Math.sin(a)*0.05]);}return p;})(),22,0.024);
  M(g,G3.cyl(0.05,0.05,0.12,28),K.steel,[0,-1.74,0]);
  const pts=[[0,-0.06],[0.2,-0.04],[0.24,-0.1],[0.42,-0.03],[0.47,-0.09],[0.66,0.04],[0.72,0.0],[1.0,0.32],[0.55,0.05],[0,0.07]];
  M(g,bladeG(s=>quad(s,pts),{d:0.008,bt:0.01,bs:0.012}),K.steel,[0,-1.75,0]);
  M(g,G3.tube([[0,-1.81,-0.01],[0,-1.79,-0.24],[0,-1.84,-0.45],[0,-1.78,-0.7],[0,-1.43,-1.0]],0.012,0.008,40,8),gl,null,{ol:0});
  g.userData.tipZ=-1.0;return -1.45;}},
],
/* ---------------- KATANA ---------------- */
katana:[
{name:'Katana',desc:'Lama curva con punta inclinata, guardia a quadrifoglio e impugnatura con fascia a rombi.',
 make(g,K){M(g,G3.cyl(0.036,0.034,0.03,24),K.gold,[0,0.14,0]);M(g,G3.limb(0.033,0.033,0.27),toon(0xf0ead8),[0,0.0,0]);
  for(let i=0;i<7;i++)for(const s of [-1,1])M(g,G3.ell(0.012,0.02,0.03),K.black,[s*0.03,0.11-i*0.036,0],{ol:0});
  M(g,G3.cyl(0.04,0.04,0.025,24),K.gold,[0,-0.15,0]);
  const ts=G3.shape(s=>{for(let i=0;i<4;i++){const a=i/4*TAU+Math.PI/4;s.absarc(Math.cos(a)*0.05,Math.sin(a)*0.05,0.06,a-Math.PI*0.6,a+Math.PI*0.6,false);}},0.016,0.006);ts.rotateX(Math.PI/2);M(g,ts,K.black,[0,-0.18,0]);
  M(g,G3.rb(0.035,0.04,0.06,0.01),K.gold,[0,-0.21,0]);
  M(g,bladeG(s=>{const n=30,L=1.3,c=t=>0.06*t*t,sp=[],ed=[];for(let i=0;i<=n;i++){const t=i/n;sp.push([c(t)+0.02,-t*L]);ed.push([c(t)-lerp(0.022,0.02,t),-t*L]);}
    s.moveTo(ed[0][0],ed[0][1]);for(const p of ed)s.lineTo(p[0],p[1]);s.quadraticCurveTo(c(1)-0.01,-L-0.06,c(1)+0.03,-L-0.05);for(const p of sp.reverse())s.lineTo(p[0],p[1]);},{d:0.006,bt:0.008,bs:0.01,cs:8}),K.metal,[0,-0.23,0]);
  for(const s of [-1,1])M(g,G3.tube((()=>{const p=[];for(let i=0;i<=20;i++){const t=i/20*0.95;p.push([s*0.009,-0.25-t*1.3,-(0.06*t*t+0.006)]);}return p;})(),0.004,0.004,30,6),K.steel,null,{ol:0});
  gems(g,K,[0,-0.18,0,0.012],0.018);g.userData.tipZ=-0.08;return -1.55;}},
{name:'Katana nera',desc:'Lama a due toni con dorso brunito, guardia quadrata e nastro rosso che pende dal pomo.',
 make(g,K){const red=toon(0xb52a2a);M(g,G3.cyl(0.036,0.034,0.03,24),K.black,[0,0.14,0]);M(g,G3.limb(0.033,0.033,0.27),red,[0,0.0,0]);
  for(let i=0;i<7;i++)for(const s of [-1,1])M(g,G3.ell(0.012,0.02,0.03),K.black,[s*0.03,0.11-i*0.036,0],{ol:0});
  M(g,G3.tube([[0,0.16,0],[0,0.2,0.05],[0,0.1,0.1],[0,-0.05,0.12]],0.01,0.008,18,8),red,null,{ol:0.006});
  M(g,G3.rb(0.13,0.02,0.13,0.035),K.black,[0,-0.18,0]);M(g,G3.rb(0.035,0.04,0.06,0.01),K.gold,[0,-0.21,0]);
  const sh=s=>{const n=30,L=1.3,c=t=>0.06*t*t,sp=[],ed=[];for(let i=0;i<=n;i++){const t=i/n;sp.push([c(t)+0.02,-t*L]);ed.push([c(t)-0.021,-t*L]);}
    s.moveTo(ed[0][0],ed[0][1]);for(const p of ed)s.lineTo(p[0],p[1]);s.quadraticCurveTo(c(1)-0.01,-L-0.06,c(1)+0.03,-L-0.05);for(const p of sp.reverse())s.lineTo(p[0],p[1]);};
  M(g,bladeG(sh,{d:0.006,bt:0.008,bs:0.01,cs:8}),K.metal,[0,-0.23,0]);
  for(const s of [-1,1])M(g,G3.tube((()=>{const p=[];for(let i=0;i<=20;i++){const t=i/20;p.push([s*0.008,-0.25-t*1.24,-(0.06*t*t+0.012)]);}return p;})(),0.006,0.006,30,6),K.black,null,{ol:0});
  gems(g,K,[0,-0.18,0,0.012],0.018);g.userData.tipZ=-0.08;return -1.55;}},
{name:'Lama del vento',desc:'Tachi molto curvo con scanalatura, guardia a petali e impugnatura azzurra.',
 make(g,K){const sky=toon(0x5aa8d8);M(g,G3.cyl(0.036,0.034,0.03,24),K.metal,[0,0.14,0]);M(g,G3.limb(0.033,0.033,0.27),sky,[0,0.0,0]);
  for(let i=0;i<7;i++)for(const s of [-1,1])M(g,G3.ell(0.012,0.02,0.03),toon(0xf2f6ff),[s*0.03,0.11-i*0.036,0],{ol:0});
  const ts=G3.shape(s=>{for(let i=0;i<6;i++){const a=i/6*TAU;s.absarc(Math.cos(a)*0.055,Math.sin(a)*0.055,0.04,a-Math.PI*0.62,a+Math.PI*0.62,false);}},0.012,0.006);ts.rotateX(Math.PI/2);M(g,ts,K.metal,[0,-0.18,0]);
  M(g,G3.rb(0.035,0.04,0.06,0.01),K.gold,[0,-0.21,0]);
  const c=t=>0.11*t*t;
  M(g,bladeG(s=>{const n=30,L=1.3,sp=[],ed=[];for(let i=0;i<=n;i++){const t=i/n;sp.push([c(t)+0.02,-t*L]);ed.push([c(t)-0.022,-t*L]);}
    s.moveTo(ed[0][0],ed[0][1]);for(const p of ed)s.lineTo(p[0],p[1]);s.quadraticCurveTo(c(1)-0.01,-L-0.07,c(1)+0.03,-L-0.05);for(const p of sp.reverse())s.lineTo(p[0],p[1]);},{d:0.006,bt:0.008,bs:0.01,cs:8}),K.metal,[0,-0.23,0]);
  for(const s of [-1,1])M(g,G3.tube((()=>{const p=[];for(let i=0;i<=20;i++){const t=i/20*0.75;p.push([s*0.009,-0.26-t*1.3,-(c(t)+0.004)]);}return p;})(),0.005,0.005,30,6),K.steel,null,{ol:0});
  gems(g,K,[0,-0.18,0,0.012],0.018);g.userData.tipZ=-0.14;return -1.55;}},
],
/* ---------------- PUGNI ---------------- */
pugni:[
{name:'Cesti',desc:'Fasce di cuoio intorno a mano e polso con una piastra borchiata sulle nocche.',
 make(g,K){for(let i=0;i<4;i++)M(g,G3.hring(0.058,0.012,1.2),i%2?toon(0xe8e0cc):K.lea,[0,0.07+i*0.03,0],{ol:0});
  for(let i=0;i<3;i++)M(g,G3.rb(0.084,0.016,0.1,0.007),toon(0xe8e0cc),[0,0.03-i*0.03,0.004],{r:[0,0,(i%2?0.2:-0.2)],ol:0.006});
  M(g,G3.rb(0.088,0.03,0.104,0.012),K.metal,[0,-0.055,0.004]);for(let i=0;i<3;i++)M(g,G3.ell(0.014,0.014,0.014),K.gold,[0,-0.074,-0.03+i*0.03],{ol:0});
  gems(g,K,[0,-0.04,0,0.046],0.016);return -0.15;}},
{name:'Tirapugni',desc:'Anelli di ottone sulle dita con quattro punte corte sulle nocche.',
 make(g,K){M(g,G3.rb(0.03,0.026,0.11,0.01),K.gold,[0,-0.058,0.004]);
  for(let i=0;i<4;i++){const z=-0.039+i*0.026;M(g,G3.tor(0.019,0.006,TAU,24,8),K.gold,[0,-0.04,z],{r:[0,Math.PI/2,0],ol:0.005});M(g,G3.cone(0.012,0.04,16),K.metal,[0,-0.085,z],{r:[Math.PI,0,0],ol:0.006});}
  for(let i=0;i<3;i++)M(g,G3.hring(0.056,0.01,1.2),K.wrap,[0,0.08+i*0.025,0],{ol:0});
  gems(g,K,[0,-0.058,0,0.02],0.014);return -0.15;}},
{name:'Artigli della tigre',desc:'Tre lame ricurve che escono dalle nocche, fissate a un bracciale d\'acciaio.',
 make(g,K){M(g,G3.limb(0.062,0.058,0.1),K.steel,[0,0.1,0]);M(g,G3.hring(0.062,0.01,1),K.gold,[0,0.05,0],{ol:0});
  M(g,G3.rb(0.05,0.03,0.1,0.01),K.steel,[0.0,-0.05,0.004]);
  for(let i=0;i<3;i++){const z=-0.032+i*0.032;M(g,G3.tube([[0.0,-0.06,z],[0.0,-0.2,z-0.02],[0.0,-0.32,z+0.04],[0.0,-0.38,z+0.1]],0.013,0.002,24,8),K.metal,null);}
  gems(g,K,[0,0.1,0,0.06],0.018);return -0.35;}},
],
/* ---------------- ARCO ---------------- */
arco:[
{name:'Arco lungo',desc:'Un solo pezzo di legno curvo, più spesso al centro, impugnatura fasciata e cocche di corno.',
 make(g,K){const pts=[[0,0.74,-0.42],[0,0.5,-0.18],[0,0.25,-0.04],[0,0,0],[0,-0.25,-0.04],[0,-0.5,-0.18],[0,-0.74,-0.42]];
  M(g,G3.tube(pts,0.03,0.03,60,12,t=>0.014+0.02*Math.pow(1-Math.abs(2*t-1),0.6)),K.wood,null);
  gripWrap(g,K.lea,0.09,-0.09,0.036,6);for(const s of [-1,1])M(g,G3.ell(0.02,0.035,0.02),K.bone,[0,s*0.74,-0.42]);
  M(g,G3.cyl(0.006,0.006,1.48,6),K.str,[0,0,-0.42],{ol:0});gems(g,K,[0,0,0.02,0.03],0.018);g.userData.tipY=0.6;return 0.6;}},
{name:'Arco ricurvo',desc:'Flettenti che si piegano in avanti alle punte, impugnatura rinforzata e puntali d\'oro.',
 make(g,K){const ptsU=[[0,0,0],[0,0.2,-0.08],[0,0.42,-0.3],[0,0.56,-0.36],[0,0.64,-0.28],[0,0.68,-0.18]];
  const all=[...ptsU.slice().reverse().map(p=>[p[0],-p[1],p[2]]),...ptsU.slice(1)];
  M(g,G3.tube(all,0.03,0.03,70,12,t=>0.012+0.022*Math.pow(1-Math.abs(2*t-1),0.8)),K.woodD,null);
  M(g,G3.rb(0.05,0.22,0.06,0.02),K.lea,[0,0,0.01]);for(const s of [-1,1])M(g,G3.cone(0.017,0.06,16),K.gold,[0,s*0.69,-0.17],{r:[s>0?0.3:Math.PI-0.3,0,0]});
  M(g,G3.cyl(0.006,0.006,1.12,6),K.str,[0,0,-0.355],{ol:0});gems(g,K,[0,0.0,0.04,0.0],0.02);g.userData.tipY=0.6;return 0.6;}},
{name:'Arco elfico',desc:'Legno chiaro sottile a doppia curva, foglie d\'argento sulle punte e una gemma verde al centro.',
 make(g,K){const lw=toon(0xe8e0cc),sil=toon(0xd8e2ee),leaf=toon(0x7fe08a,{emissive:0x7fe08a,emissiveIntensity:1.2});
  const pts=[[0,0.72,-0.34],[0,0.6,-0.4],[0,0.42,-0.2],[0,0.2,-0.12],[0,0,0],[0,-0.2,-0.12],[0,-0.42,-0.2],[0,-0.6,-0.4],[0,-0.72,-0.34]];
  M(g,G3.tube(pts,0.03,0.03,80,12,t=>0.01+0.016*Math.pow(1-Math.abs(2*t-1),0.7)),lw,null);
  M(g,G3.rb(0.04,0.2,0.05,0.018),sil,[0,0,0.01]);M(g,G3.ell(0.022,0.03,0.016),K.gem||leaf,[0,0,0.04],{ol:0});
  for(const s of [-1,1]){M(g,G3.leaf(0.07,0.18,0.008,true),sil,[0,s*0.62,-0.36],{r:[s>0?-0.4:Math.PI+0.4,Math.PI/2,0]});M(g,G3.leaf(0.05,0.12,0.008,true),sil,[0,s*0.12,0.02],{r:[s>0?0.2:Math.PI-0.2,Math.PI/2,0]});}
  M(g,G3.cyl(0.005,0.005,1.18,6),K.str,[0,0,-0.39],{ol:0});g.userData.tipY=0.6;return 0.6;}},
],
};
// ===== ARMI: UN DISEGNO DIVERSO PER OGNI MODELLO (4 per tipo) E RARITÀ CHE SI VEDONO =====
function curveBlade(L,cf,we,ws){return s=>{const n=30,ed=[],sp=[];for(let i=0;i<=n;i++){const t=i/n,c=cf(t);ed.push([c+we(t),-t*L]);sp.push([c-ws(t),-t*L]);}
  s.moveTo(ed[0][0],ed[0][1]);for(const p of ed)s.lineTo(p[0],p[1]);for(const p of sp.reverse())s.lineTo(p[0],p[1]);};}
WEAPONS.spada.push(
{name:'Sciabola',desc:'Lama curva a un filo con paramano ad arco sulle nocche.',
 make(g,K){M(g,G3.ell(0.046,0.05,0.046),K.gold,[0,0.14,0]);M(g,G3.limb(0.03,0.034,0.22),K.lea,[0,0.01,0]);gripWrap(g,K.wrap,0.1,-0.07,0.034,6);
  M(g,G3.tube([[0,-0.1,-0.03],[0,-0.1,-0.17],[0,0.03,-0.2],[0,0.13,-0.11],[0,0.15,-0.03]],0.018,0.013,30,8),K.gold,null);
  M(g,G3.rb(0.06,0.042,0.2,0.016),K.gold,[0,-0.11,-0.04]);M(g,G3.ell(0.03,0.03,0.03),K.gold,[0,-0.11,0.08]);
  M(g,bladeG(curveBlade(1.3,t=>-0.26*t*t,t=>lerp(0.07,0.004,t*t*t),t=>lerp(0.032,0.004,t*t*t)),{d:0.006,bt:0.008,bs:0.012,cs:8}),K.metal,[0,-0.13,0]);
  for(const s of [-1,1])M(g,G3.tube((()=>{const p=[];for(let i=0;i<=20;i++){const t=0.03+0.8*i/20;p.push([s*0.009,-0.13-t*1.3,0.26*t*t+0.012]);}return p;})(),0.004,0.003,30,6),K.steel,null,{ol:0});
  gems(g,K,[0,-0.11,-0.02,0.032],0.028);g.userData.tipZ=0.25;return -1.43;}},
{name:'Stocco',desc:'Lama lunghissima e sottile, coccia a campana e bracci sottili ai lati.',
 make(g,K){M(g,G3.ell(0.042,0.055,0.042),K.gold,[0,0.17,0]);M(g,G3.limb(0.026,0.032,0.25),K.wrap,[0,0.03,0]);gripWrap(g,K.gold,0.13,-0.05,0.032,6);
  M(g,G3.ell(0.17,0.055,0.17),K.gold,[0,-0.13,0]);M(g,G3.ell(0.12,0.03,0.12),K.steel,[0,-0.09,0],{ol:0});
  M(g,G3.tube([[0,-0.1,-0.36],[0,-0.17,-0.24],[0,-0.14,0],[0,-0.17,0.24],[0,-0.1,0.36]],0.02,0.02,30,8),K.gold,null);for(const s of [-1,1])M(g,G3.ell(0.032,0.032,0.032),K.gold,[0,-0.1,s*0.37]);
  M(g,bladeG(s=>quad(s,[[-0.036,0],[-0.024,-0.95],[0,-1.3],[0.024,-0.95],[0.036,0]]),{d:0.012,bt:0.012,bs:0.012}),K.metal,[0,-0.16,0]);
  gems(g,K,[0,-0.13,0,0.05],0.03);return -1.46;}});
WEAPONS.ascia.push(
{name:'Bipenne a farfalla',desc:'Due grandi ali d\'acciaio con le punte alte, tacca al centro del filo e spuntone in cima.',
 make(g,K){M(g,G3.ell(0.05,0.045,0.05),K.steel,[0,0.17,0]);M(g,G3.limb(0.04,0.046,1.56),K.woodD,[0,-0.6,0]);gripWrap(g,K.lea,0.12,-0.28,0.046,9);
  for(const y of [-0.72,-0.92])M(g,G3.hring(0.049,0.012,1),K.gold,[0,y,0],{ol:0});M(g,G3.cyl(0.06,0.06,0.3,32),K.steel,[0,-1.24,0]);
  const w=[[0.05,0.1],[0.14,0.14,0.36,0.46],[0.52,0.3,0.57,0.13],[0.45,0],[0.57,-0.13],[0.52,-0.3,0.36,-0.46],[0.14,-0.14,0.05,-0.1]];
  M(g,bladeG(s=>quad(s,w),{d:0.012,bt:0.012,bs:0.02}),K.metal,[0,-1.24,0]);M(g,bladeG(s=>quad(s,mirrorX(w)),{d:0.012,bt:0.012,bs:0.02}),K.metal,[0,-1.24,0]);
  M(g,bladeG(s=>quad(s,[[-0.045,0],[-0.03,-0.16],[0,-0.26],[0.03,-0.16],[0.045,0]]),{d:0.01,bt:0.01,bs:0.012}),K.metal,[0,-1.38,0]);
  gems(g,K,[0,-1.24,0,0.065],0.034);g.userData.tipZ=-0.5;return -1.25;}},
{name:'Accetta',desc:'Manico curvo corto da lancio, testa compatta con la barba e martelletto sul retro.',
 make(g,K){M(g,G3.tube([[0,0.18,0.035],[0,-0.2,0],[0,-0.75,0.035],[0,-1.3,0]],0.044,0.04,40,12),K.wood,null);gripWrap(g,K.lea,0.12,-0.2,0.047,7);M(g,G3.ell(0.056,0.042,0.062),K.steel,[0,0.2,0.035]);
  M(g,G3.rb(0.1,0.22,0.2,0.03),K.steel,[0,-1.22,0.02]);
  M(g,bladeG(s=>quad(s,[[0.05,0.09],[0.22,0.09],[0.33,0.21],[0.46,0.02,0.34,-0.25],[0.2,-0.1],[0.05,-0.1]]),{d:0.014,bt:0.014,bs:0.02}),K.metal,[0,-1.22,0]);
  M(g,G3.cyl(0.085,0.09,0.17,24),K.metal,[0,-1.22,0.19],{r:[Math.PI/2,0,0]});M(g,G3.cyl(0.1,0.1,0.03,24),K.gold,[0,-1.22,0.275],{r:[Math.PI/2,0,0]});
  gems(g,K,[0,-1.22,-0.1,0.03],0.03);g.userData.tipZ=-0.42;return -1.25;}});
WEAPONS.lancia.push(
{name:'Alabarda',desc:'Grande scure da una parte, uncino dall\'altra e lungo spuntone in cima all\'asta.',
 make(g,K){M(g,G3.cone(0.04,0.12,24),K.steel,[0,0.4,0]);M(g,G3.limb(0.036,0.041,2.08),K.woodD,[0,-0.71,0]);gripWrap(g,K.lea,0.12,-0.26,0.041,8);for(const y of [-0.6,-1.1])M(g,G3.hring(0.043,0.011,1),K.gold,[0,y,0],{ol:0});
  M(g,G3.cyl(0.05,0.055,0.26,28),K.steel,[0,-1.7,0]);
  M(g,bladeG(s=>quad(s,[[0.04,0.13],[0.18,0.18,0.34,0.28],[0.46,0,0.34,-0.24],[0.16,-0.06,0.04,-0.1]]),{d:0.01,bt:0.012,bs:0.018}),K.metal,[0,-1.7,0]);
  M(g,bladeG(s=>quad(s,[[-0.04,0.08],[-0.16,0.08,-0.32,-0.12],[-0.14,-0.03,-0.04,-0.07]]),{d:0.01,bt:0.01,bs:0.014}),K.metal,[0,-1.7,0]);
  M(g,bladeG(s=>quad(s,[[-0.032,0],[-0.03,-0.3],[0,-0.48],[0.03,-0.3],[0.032,0]]),{d:0.008,bt:0.01,bs:0.012}),K.metal,[0,-1.8,0]);
  gems(g,K,[0,-1.7,0,0.056],0.03);g.userData.tipZ=-0.1;return -2.26;}},
{name:'Tridente',desc:'Tre rebbi con la punta a uncino su una traversa d\'oro, asta scura con anelli.',
 make(g,K){M(g,G3.cone(0.04,0.12,24),K.gold,[0,0.4,0]);M(g,G3.limb(0.036,0.041,2.08),K.black,[0,-0.71,0]);gripWrap(g,K.lea,0.12,-0.26,0.041,8);for(const y of [-0.5,-0.9,-1.3])M(g,G3.hring(0.043,0.011,1),K.gold,[0,y,0],{ol:0});
  M(g,G3.tube([[0,-1.8,-0.2],[0,-1.72,-0.13],[0,-1.67,0],[0,-1.72,0.13],[0,-1.8,0.2]],0.03,0.03,24,8),K.gold,null);M(g,G3.cyl(0.05,0.055,0.14,24),K.gold,[0,-1.66,0]);
  for(const s of [-1,1]){M(g,G3.tube([[0,-1.78,s*0.2],[0,-1.95,s*0.215],[0,-2.2,s*0.16]],0.036,0.004,20,8),K.metal,null);
    M(g,G3.tube([[0,-2.0,s*0.21],[0,-1.98,s*0.27],[0,-1.91,s*0.28]],0.022,0.003,12,6),K.metal,null);}
  M(g,bladeG(s=>quad(s,[[-0.04,0],[-0.07,-0.2,-0.05,-0.34],[0,-0.56],[0.05,-0.34],[0.07,-0.2,0.04,0]]),{d:0.008,bt:0.01,bs:0.014}),K.metal,[0,-1.72,0]);
  gems(g,K,[0,-1.68,0,0.056],0.028);return -2.27;}});
WEAPONS.pugnali.push(
{name:'Stiletti a forca',desc:'Punta sottile con due rebbi ricurvi ai lati per bloccare le lame.',
 make(g,K){M(g,G3.ell(0.03,0.032,0.03),K.gold,[0,0.1,0]);M(g,G3.limb(0.026,0.03,0.16),K.black,[0,0,0]);gripWrap(g,K.gold,0.07,-0.06,0.03,5);M(g,G3.ell(0.05,0.022,0.05),K.gold,[0,-0.085,0]);
  for(const s of [-1,1])M(g,G3.tube([[0,-0.08,s*0.02],[0,-0.09,s*0.11],[0,-0.2,s*0.15],[0,-0.38,s*0.11]],0.018,0.004,20,8),K.metal,null);
  M(g,bladeG(s=>quad(s,[[-0.03,0],[-0.016,-0.42],[0,-0.54],[0.016,-0.42],[0.03,0]]),{d:0.01,bt:0.01,bs:0.01}),K.metal,[0,-0.09,0]);gems(g,K,[0,-0.085,0,0.03],0.018);return -0.63;}});
WEAPONS.martello.push(
{name:'Mazza chiodata',desc:'Palla d\'acciaio coperta di lunghe punte in cima a un manico scuro.',
 make(g,K){M(g,G3.ell(0.055,0.05,0.055),K.steel,[0,0.17,0]);M(g,G3.limb(0.042,0.046,1.2),K.woodD,[0,-0.44,0]);gripWrap(g,K.lea,0.12,-0.3,0.046,9);M(g,G3.cyl(0.06,0.065,0.08,28),K.gold,[0,-1.02,0]);
  M(g,G3.ell(0.17,0.17,0.17,28,20),K.steel,[0,-1.2,0]);
  const up=V3(0,1,0),n=14;for(let i=0;i<n;i++){const y=1-(i+0.5)/n*2,r=Math.sqrt(1-y*y),a=i*2.39996,d=V3(Math.cos(a)*r,y,Math.sin(a)*r);
    const c=M(g,G3.cone(0.05,0.2,8),K.metal,[d.x*0.23,-1.2+d.y*0.23,d.z*0.23],{ol:0.008});c.quaternion.setFromUnitVectors(up,d);}
  gems(g,K,[0,-1.02,0,0.062],0.028);return -1.42;}});
WEAPONS.falce.push(
{name:'Falcetto',desc:'Lama a uncino quasi chiusa ad anello su un\'asta sottile e leggera.',
 make(g,K){M(g,G3.tube([[0,0.3,0],[0,-0.5,0.035],[0,-1.2,0],[0,-1.72,-0.03]],0.034,0.03,36,12),K.wood,null);gripWrap(g,K.lea,0.1,-0.24,0.04,7);for(const y of [-0.6,-1.2])M(g,G3.hring(0.038,0.01,1),K.gold,[0,y,0.02],{ol:0});
  M(g,G3.cyl(0.05,0.05,0.12,28),K.gold,[0,-1.72,-0.03]);
  M(g,bladeG(s=>quad(s,[[0,-0.08],[0.38,-0.3,0.74,0.05],[0.9,0.36,0.62,0.56],[0.77,0.24,0.54,0.12],[0.3,-0.09,0,0.07]]),{d:0.008,bt:0.01,bs:0.016,cs:32}),K.metal,[0,-1.75,-0.03]);
  gems(g,K,[0,-1.72,-0.03,0.05],0.03);g.userData.tipZ=-0.64;return -1.25;}});
WEAPONS.katana.push(
{name:'Wakizashi',desc:'Lama larga e dritta con la punta tagliata di netto, guardia rotonda e nappa rossa.',
 make(g,K){const red=toon(0xb52a2a);M(g,G3.cyl(0.036,0.034,0.03,24),K.gold,[0,0.14,0]);M(g,G3.limb(0.033,0.033,0.27),K.wrap,[0,0,0]);
  for(let i=0;i<7;i++)for(const s of [-1,1])M(g,G3.ell(0.012,0.02,0.03),K.gold,[s*0.03,0.11-i*0.036,0],{ol:0});
  M(g,G3.tube([[0,0.16,0],[0,0.24,0.06],[0,0.1,0.12],[0,-0.1,0.13]],0.012,0.008,18,8),red,null,{ol:0.006});M(g,G3.ell(0.04,0.04,0.04),red,[0,-0.12,0.13],{ol:0.006});
  M(g,G3.cyl(0.13,0.13,0.022,32),K.gold,[0,-0.18,0]);M(g,G3.rb(0.035,0.04,0.06,0.01),K.steel,[0,-0.21,0]);
  M(g,bladeG(s=>quad(s,[[-0.032,0],[-0.032,-1.3],[0.058,-1.14],[0.058,0]]),{d:0.006,bt:0.008,bs:0.01}),K.metal,[0,-0.23,0]);
  for(const s of [-1,1])M(g,G3.rb(0.004,0.9,0.016,0.002),K.steel,[s*0.01,-0.72,0.012],{ol:0});
  gems(g,K,[0,-0.18,0,0.014],0.018);g.userData.tipZ=0.03;return -1.53;}});
WEAPONS.pugni.push(
{name:'Guanti chiodati',desc:'Guanto d\'arme a piastre con bracciale svasato e lunghe punte sulle nocche.',
 make(g,K){M(g,G3.cyl(0.09,0.066,0.17,24),K.steel,[0,0.13,0]);M(g,G3.hring(0.09,0.013,1),K.gold,[0,0.215,0],{ol:0});M(g,G3.hring(0.067,0.01,1),K.gold,[0,0.05,0],{ol:0});
  for(let i=0;i<6;i++){const a=i/6*TAU;M(g,G3.cone(0.018,0.07,8),K.metal,[Math.cos(a)*0.09,0.15,Math.sin(a)*0.09],{r:[0,0,0],ol:0.006}).quaternion.setFromUnitVectors(V3(0,1,0),V3(Math.cos(a),0,Math.sin(a)));}
  M(g,G3.ell(0.078,0.06,0.095),K.metal,[0,-0.03,0]);M(g,G3.rb(0.095,0.034,0.13,0.012),K.steel,[0,-0.07,0]);
  for(let i=0;i<4;i++)M(g,G3.cone(0.024,0.14,10),K.metal,[0,-0.15,-0.05+i*0.0333],{r:[Math.PI,0,0],ol:0.006});
  gems(g,K,[0,-0.03,0,0.08],0.016);return -0.2;}});
WEAPONS.arco.push(
{name:'Arco corto',desc:'Arco composito d\'osso a doppia curva con fasce nere, punte a corno e nappe.',
 make(g,K){const pts=[[0,0.66,-0.16],[0,0.56,-0.36],[0,0.36,-0.22],[0,0.16,-0.05],[0,0,0],[0,-0.16,-0.05],[0,-0.36,-0.22],[0,-0.56,-0.36],[0,-0.66,-0.16]];
  M(g,G3.tube(pts,0.03,0.03,70,12,t=>0.018+0.024*Math.pow(1-Math.abs(2*t-1),0.7)),K.bone,null);
  for(const s of [-1,1]){M(g,G3.hring(0.038,0.012,1),K.black,[0,s*0.16,-0.05],{ol:0});M(g,G3.hring(0.032,0.012,1),K.black,[0,s*0.36,-0.22],{ol:0});
    M(g,G3.cone(0.024,0.12,10),K.black,[0,s*0.71,-0.12],{r:[s>0?0.35:Math.PI-0.35,0,0]});M(g,G3.tube([[0,s*0.56,-0.36],[0,s*0.5,-0.44],[0,s*0.42,-0.47]],0.02,0.006,10,6),K.cloth,null,{ol:0.006});}
  M(g,G3.rb(0.056,0.2,0.07,0.02),K.lea,[0,0,0.01]);M(g,G3.cyl(0.005,0.005,1.32,6),K.str,[0,0,-0.16],{ol:0});gems(g,K,[0,0,0.04,0],0.02);g.userData.tipY=0.6;return 0.6;}});

// colori dell'arma del giocatore per rarità: da ferro consumato a oro bianco
const WPAL=[
 {m:0x6f747c,mI:0,s:0x4e525a,g:0x8d6c3e,gI:0.05,w:0x6a4a30,wd:0x4a2e1c,l:0x4a3628,wr:0x3a302a,c:0x7a6a58,b:0xc8bea6,k:0x34302f},
 {m:0x7fd89a,mI:0.14,s:0x7f8e86,g:0x6fd07c,gI:0.3,w:0x7a5434,wd:0x4f3a22,l:0x2f6a3e,wr:0x1f4a2c,c:0x3fae5c,b:0xe6dcc6,k:0x1e2a22},
 {m:0x3f8cff,mI:0.34,s:0x5b84c0,g:0x5aa9ff,gI:0.55,w:0x34548a,wd:0x263c68,l:0x1f3768,wr:0x16264a,c:0x3a7ae0,b:0xd8e8f8,k:0x141d33},
 {m:0x35274e,mI:0.55,s:0x54387e,g:0xc27bff,gI:0.8,w:0x241838,wd:0x180f28,l:0x43206a,wr:0x2b1548,c:0x9a3ff0,b:0x75649a,k:0x0e0a16},
 {m:0xffb43c,mI:0.36,s:0xffcb66,g:0xffb347,gI:0.9,w:0xf3e6c8,wd:0xd8bc84,l:0x9a2222,wr:0x651414,c:0xffd66b,b:0xfff4d8,k:0x3a2508},
];
function wpalKit(K,r){const P=WPAL[r],R=RARITY[r];
  K.metal=toon(P.m,{emissive:r>=3?R.hex:P.m,emissiveIntensity:P.mI});K.metal.userData.wb=1;
  K.steel=toon(P.s,{emissive:P.s,emissiveIntensity:P.mI*0.4});K.steel.userData.wb2=1;
  K.gold=toon(P.g,{emissive:P.g,emissiveIntensity:P.gI});
  K.wood=toon(P.w);K.woodD=toon(P.wd);K.lea=toon(P.l);K.wrap=toon(P.wr);K.cloth=toon(P.c,r>=2?{emissive:P.c,emissiveIntensity:0.25}:{});K.bone=toon(P.b,r>=3?{emissive:P.b,emissiveIntensity:0.2}:{});K.black=toon(P.k);
  return K;}

/* Animazioni per rarità, tutte calcolate dalla scheda video (niente lavoro per il processore, niente da aggiornare oggetto per oggetto):
   Comune nulla · Non comune riflesso che passa sul filo · Rara energia che scorre e scintille · Epica venature vive e bagliore · Leggendaria fiamma d'aura, spirale di luce e scintille */
const WFX={t:{value:0},b:{value:0},px:{value:420},m:{}};
function wfxShell(lv,c,c2,aura){const k=`s${lv}_${c}_${c2}_${aura||0}`;if(WFX.m[k])return WFX.m[k];
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{uT:WFX.t,uB:WFX.b,uLv:{value:lv},uA:{value:aura||0},uC:{value:new THREE.Color(c)},uC2:{value:new THREE.Color(c2)}},
    vertexShader:`uniform float uT,uA;varying vec3 vP,vN,vV;void main(){vP=position;vec3 p=position+normal*uA*(0.03+0.08*(0.5+0.5*sin(position.y*9.-uT*10.+position.z*7.)));vec4 mv=modelViewMatrix*vec4(p,1.);vN=normalMatrix*normal;vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uT,uB,uLv,uA;uniform vec3 uC,uC2;varying vec3 vP,vN,vV;
float h(float n){return fract(sin(n)*43758.5453);}
float ns(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);float a=h(i.x+i.y*57.),b=h(i.x+1.+i.y*57.),c=h(i.x+(i.y+1.)*57.),d=h(i.x+1.+(i.y+1.)*57.);return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
void main(){float fr=pow(1.-clamp(abs(dot(normalize(vN),normalize(vV))),0.,1.),2.);vec2 q=vec2((vP.z+vP.x)*7.,vP.y*7.);float a=0.;vec3 col=uC;
 if(uA>.05){float n=ns(vec2(q.x*.7,q.y*.6+uT*2.4));a=(.3+.7*n)*(.4+fr);col=mix(uC,uC2,n);}
 else if(uLv<1.5){a=pow(max(0.,sin(vP.y*1.5+uT*1.3)),40.)*.9+fr*.08;col=vec3(1.);}
 else if(uLv<2.5){float s=pow(max(0.,sin(vP.y*3.2+uT*2.6)),3.);float r=step(.55,h(floor(q.y*1.4+uT*1.2)*3.+floor(q.x*1.3)*11.));a=s*(.5+.8*r)+fr*.8;col=mix(uC,uC2,fr);}
 else if(uLv<3.5){float n=ns(q+vec2(0.,uT*.35))+.5*ns(q*2.3-vec2(uT*.22,0.));float v=1.-smoothstep(.0,.1,abs(n-.75));a=v*(.85+.35*sin(uT*3.))+fr*.45;col=mix(uC,uC2,fr);}
 else{float n=ns(vec2(q.x*.8,q.y*.7+uT*2.2));float fl=smoothstep(.42,.85,n);float sw=pow(max(0.,sin(vP.y*2.2+uT*3.)),8.);a=fl*.55+sw*.9+fr*.75;col=mix(uC,vec3(1.,.97,.85),sw+.35*fl);}
 a*=1.+uB*.9;gl_FragColor=vec4(col,clamp(a,0.,1.));}`});
  m.userData.keep=true;return WFX.m[k]=m;}
function wfxPtsMat(c,c2){const k=`p${c}_${c2}`;if(WFX.m[k])return WFX.m[k];
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{uT:WFX.t,uB:WFX.b,uPx:WFX.px,uC:{value:new THREE.Color(c)},uC2:{value:new THREE.Color(c2)}},
    vertexShader:`attribute vec3 aS;attribute float aK;uniform float uT,uB,uPx;varying float vA,vK;void main(){vec3 p=position;float a=1.,s=aS.z;vK=aK;
 if(aK<.5){float l=fract(uT*aS.x+aS.y),an=aS.y*40.+uT*1.7;p+=vec3(cos(an)*.16*l,(aS.y-.5)*.34*l,sin(an)*.16*l);a=sin(l*3.1416);}
 else if(aK<1.5){float an=position.y*5.+uT*3.4;p.x+=cos(an)*aS.x;p.z+=sin(an)*aS.x;a=.72+.28*sin(uT*6.+aS.y*20.);}
 else{a=.6+.22*sin(uT*3.)+uB*.3;}
 vA=a;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=max(2.,uPx*s/-mv.z*(1.+uB*.4));gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform vec3 uC,uC2;varying float vA,vK;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float f=vK>1.5?pow(1.-r,1.4)*.8:smoothstep(1.,.45,r);gl_FragColor=vec4(vK>.5?uC2:uC,f*vA);}`});
  m.userData.keep=true;return WFX.m[k]=m;}
// unisce in un solo pezzo le lame dell'arma (un solo disegno in più per arma, anche con tante punte)
function wfxMerge(g,list){g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),pos=[],nor=[],v=new THREE.Vector3(),m=new THREE.Matrix4(),nm=new THREE.Matrix3();
  for(const o of list){const src=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=src.attributes.position,n=src.attributes.normal;m.multiplyMatrices(inv,o.matrixWorld);nm.getNormalMatrix(m);
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m);pos.push(v.x,v.y,v.z);v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();nor.push(v.x,v.y,v.z);}if(src!==o.geometry)src.dispose();}
  const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));out.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));return out;}
function wfxTargets(g){const pri=[],sec=[];let big=null,bh=0;g.updateMatrixWorld(true);
  g.traverse(o=>{if(!o.isMesh||o.material===OUT||o.material.isShaderMaterial)return;if(o.material.userData.wb)pri.push(o);else if(o.material.userData.wb2)sec.push(o);
    if(!o.material.isMeshBasicMaterial){o.geometry.computeBoundingBox();const s=o.geometry.boundingBox.getSize(new THREE.Vector3()),h=Math.max(s.y,s.z);if(h>bh){bh=h;big=o;}}});
  let t=pri.length?pri:sec.length?sec:big?[big]:[];
  if(t.length>6){const f=t.filter(o=>{o.geometry.computeBoundingBox();const s=o.geometry.boundingBox.getSize(new THREE.Vector3());return Math.max(s.x,s.y,s.z)>=0.12;});if(f.length)t=f;}
  return t.slice(0,40);}
function wfxAdd(g,w,list){const lv=w.rarity||0;if(lv<1)return;let q=2;try{q=QL.lv;}catch(e){}
  const tg=list||wfxTargets(g);if(!tg.length)return;const merged=wfxMerge(g,tg),R=RARITY[lv],ec=w.effect?EFFECTS[w.effect].color:R.hex;
  const add=(geo,mat,ord)=>{const me=new THREE.Mesh(geo,mat);me.frustumCulled=false;me.castShadow=false;me.receiveShadow=false;me.renderOrder=ord;g.add(me);return me;};
  add(hullGeo(merged,0.005),wfxShell(lv,lv===4?R.hex:ec,lv===2?0xffffff:R.hex,false),4);
  merged.computeBoundingBox();const bs0=merged.boundingBox.getSize(new THREE.Vector3()),amp=Math.max(bs0.x,bs0.y,bs0.z)<0.8?0.35:1;
  if(lv>=3&&q>0)add(hullGeo(merged,0.016),wfxShell(lv,lv===4?0xffa030:R.hex,ec,amp),5);
  if(lv>=2){const P=merged.attributes.position,nD=[0,0,11,16,24][lv],nH=lv===4&&q>0?16:0,gl=lv>=2?1:0,tot=(q>0?nD:Math.ceil(nD/2))+nH+gl;
    merged.computeBoundingBox();const b=merged.boundingBox,c=b.getCenter(new THREE.Vector3()),sz=b.getSize(new THREE.Vector3()),pos=new Float32Array(tot*3),aS=new Float32Array(tot*3),aK=new Float32Array(tot);let i=0;
    for(;i<tot-nH-gl;i++){const k=Math.floor(Math.random()*P.count);pos.set([P.getX(k),P.getY(k),P.getZ(k)],i*3);aS.set([0.25+Math.random()*0.5,Math.random(),0.1+Math.random()*0.08+lv*0.012],i*3);aK[i]=0;}
    const hr=Math.min(0.42,Math.max(sz.x,sz.z)*0.5+0.1);
    for(let j=0;j<nH;j++,i++){pos.set([c.x,lerp(b.min.y,b.max.y,j/Math.max(1,nH-1)),c.z],i*3);aS.set([hr,j/nH,0.15],i*3);aK[i]=1;}
    if(gl){pos.set([c.x,c.y,c.z],i*3);aS.set([0,0,lv===4?1.9:lv===3?1.2:0.7],i*3);aK[i]=2;}
    const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));pg.setAttribute('aS',new THREE.BufferAttribute(aS,3));pg.setAttribute('aK',new THREE.BufferAttribute(aK,1));
    const pts=new THREE.Points(pg,wfxPtsMat(ec,R.hex));pts.frustumCulled=false;pts.renderOrder=6;g.add(pts);}
  merged.dispose();}
// i 4 catalizzatori restano bracciali e cerchi di rune; cambia quello che fluttua nel palmo, e le rarità alte aggiungono cerchi
function wfxCatalyst(a,w){const g=a.g,v=w.v||0,r=w.rarity||0,R=RARITY[r],oc=w.effect?EFFECTS[w.effect].color:((typeof G!=='undefined'&&G.cls&&G.cls.fx)||0xb48cff),rings=g.userData.rings||(g.userData.rings=[]);
  const core=toon(oc,{emissive:oc,emissiveIntensity:1.3}),add=new THREE.MeshBasicMaterial({color:r>=2?R.hex:oc,transparent:true,opacity:0.8,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});let f;
  if(v===0)f=mesh(new THREE.SphereGeometry(0.06,14,10),core,0,-0.27,0,g,true);
  else if(v===1){f=mesh(new THREE.OctahedronGeometry(0.075),core,0,-0.27,0,g,true);f.scale.set(0.75,1.7,0.75);}
  else if(v===2){f=mesh(new THREE.BoxGeometry(0.075,0.075,0.075),core,0,-0.27,0,g,true);f.rotation.x=0.6;const q=mesh(new THREE.RingGeometry(0.19,0.225,4),add,0,-0.24,0,g,true);q.rotation.x=Math.PI/2;rings.push(q);}
  else{f=mesh(new THREE.IcosahedronGeometry(0.08),core,0,-0.27,0,g,true);f.scale.set(1,0.72,1);const bd=mesh(new THREE.TorusGeometry(0.085,0.012,6,20),toon(r>=2?R.hex:0xc89a52),0,-0.27,0,g,true);bd.rotation.x=Math.PI/2;}
  rings.push(f);
  // rarità alte: frammenti di cristallo che girano intorno al nucleo su piani inclinati (prima erano cerchi piatti
  // che, visti di taglio, diventavano una lunga barra colorata) + un alone morbido dalla Leggendaria in su
  const shardM=toon(R.hex,{emissive:R.hex,emissiveIntensity:1.1});
  for(let i=0;i<Math.max(0,r-2);i++){const o=new THREE.Object3D();o.position.set(0,-0.27,0);o.rotation.set(Math.PI/2,i*1.05+0.3,0);g.add(o);
    const sh=mesh(new THREE.OctahedronGeometry(0.03+0.004*i),shardM,0.13+i*0.025,0,0,o,true);sh.scale.set(0.7,1.4,0.7);rings.push(o);}
  if(r>=4){const halo=mesh(new THREE.SphereGeometry(0.12+0.02*(r-4),14,10),new THREE.MeshBasicMaterial({color:R.hex,transparent:true,opacity:0.28,depthWrite:false,blending:THREE.AdditiveBlending}),0,-0.27,0,g,true);halo.userData.skipOl=true;}
  return f;}
const WORDER=['spada','ascia','lancia','pugnali','martello','falce','katana','pugni','arco'];
const WCLASS={spada:'cavaliere',ascia:'berserker',lancia:'lanciere',pugnali:'assassino',martello:'paladino',falce:'negromante',katana:'samurai',pugni:'monaco',arco:'arciere'};
function buildWeapon2(type,v,rarity,effect,hero){
  if(!WEAPONS[type])return buildWeaponMesh(type,rarity,effect);
  const K=wkit(rarity||0,effect,hero),g=new THREE.Group(),tip=new THREE.Object3D();g.add(tip);
  const ty=WEAPONS[type][v].make(g,K);tip.position.set(0,g.userData.tipY!=null?g.userData.tipY:ty,g.userData.tipZ||0);
  if(type==='arco')tip.position.z=-0.2;
  return {g,tip};
}

