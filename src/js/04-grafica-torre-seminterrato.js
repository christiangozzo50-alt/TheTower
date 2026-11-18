/* =========================================================
   GRAFICA: renderer, scena, luci
   ========================================================= */
const canvas=$('game');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});}
catch(e){$('opRecord').textContent='Il tuo dispositivo non supporta la grafica 3D (WebGL).';$('opPlay').hidden=true;return;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0c0e13);scene.fog=new THREE.Fog(0x0c0e13,30,62);
const camera=new THREE.PerspectiveCamera(38,1,0.1,200);
const camPos=new THREE.Vector3(-8,3.5,17),camLook=new THREE.Vector3(-8,2.7,0),camShake={v:0};
const hemi=new THREE.HemisphereLight(0xa8b2d0,0x3a2a1e,0.85);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe8cc,0.5);sun.position.set(-8,20,14);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-22,right:22,top:16,bottom:-4,near:1,far:60});sun.shadow.bias=-0.0006;scene.add(sun);scene.add(sun.target);

/* ---------- Materiali cartoon e contorni neri ---------- */
const toonGrad=(()=>{const d=new Uint8Array([125,125,125,255,170,170,170,255,212,212,212,255,248,248,248,255]);const t=new THREE.DataTexture(d,4,1,THREE.RGBAFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;})();
function toon(c,o){const m=new THREE.MeshToonMaterial(Object.assign({color:c,gradientMap:toonGrad},o||{}));m.userData.baseE=m.emissive.clone();m.userData.baseI=m.emissiveIntensity;return m;}
function mat(c,o){const m=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.65,metalness:0.05},o||{}));m.userData.baseE=m.emissive.clone();m.userData.baseI=m.emissiveIntensity;return m;}
const OUT=new THREE.MeshBasicMaterial({color:0x100e14,side:THREE.BackSide});OUT.userData.keep=true;
const OT=0.02;   // spessore del contorno
function mesh(geo,m,x,y,z,parent,noShadow){const o=new THREE.Mesh(geo,m);o.position.set(x||0,y||0,z||0);if(!noShadow)o.castShadow=true;o.receiveShadow=true;if(parent)parent.add(o);return o;}
function outline(o,sx,sy,sz){const l=new THREE.Mesh(o.geometry,OUT);l.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);o.add(l);return o;}
const capO=(r,len,m,x,y,z,p,rs)=>outline(mesh(new THREE.CapsuleGeometry(r,len,6,rs||14),m,x,y,z,p),1+OT/r,1+OT/(len/2+r),1+OT/r);
const sphO=(r,m,x,y,z,p,ws,hs)=>outline(mesh(new THREE.SphereGeometry(r,ws||28,hs||20),m,x,y,z,p),1+OT/r);
const boxO=(w,h,d,rad,m,x,y,z,p)=>outline(mesh(rbox(w,h,d,rad),m,x,y,z,p),1+OT/(w/2),1+OT/(h/2),1+OT/(d/2));
const geoO=(geo,m,x,y,z,p,r)=>outline(mesh(geo,m,x,y,z,p),1+OT/(r||0.3));
const cap3=(r,len,rs)=>new THREE.CapsuleGeometry(r,len,6,rs||14);
let G3Q=1;const QS=(n,m)=>G3Q===1?n:Math.max(m||6,Math.round(n*G3Q));   // meno poligoni per i modelli visti da lontano
const sph=(r,ws,hs)=>new THREE.SphereGeometry(r,QS(ws||24,8),QS(hs||18,6));
function rbox(w,h,d,r,k){
  k=QS(k||3,1);r=Math.min(r,w/2,h/2,d/2);const N=2*k+1,g=new THREE.BoxGeometry(w,h,d,N,N,N);
  const pos=g.attributes.position,nor=g.attributes.normal,v=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3();
  const remap=(x,s)=>{const i=Math.round((x/s+0.5)*N);return i<=k?-s/2+r*(i/k):s/2-r*((N-i)/k);};
  const hw=w/2-r,hh=h/2-r,hd=d/2-r;
  for(let i=0;i<pos.count;i++){
    v.set(remap(pos.getX(i),w),remap(pos.getY(i),h),remap(pos.getZ(i),d));
    c.set(clamp(v.x,-hw,hw),clamp(v.y,-hh,hh),clamp(v.z,-hd,hd));
    n.subVectors(v,c);if(n.lengthSq()<1e-12)n.set(nor.getX(i),nor.getY(i),nor.getZ(i));n.normalize();
    v.copy(c).addScaledVector(n,r);pos.setXYZ(i,v.x,v.y,v.z);nor.setXYZ(i,n.x,n.y,n.z);
  }
  pos.needsUpdate=nor.needsUpdate=true;g.computeBoundingSphere();return g;
}
// pietra squadrata e scheggiata: rbox con vertici smossi in modo stabile (taper restringe la cima)
function rockG(w,h,d,o){o=o||{};const g=rbox(w,h,d,o.r==null?Math.min(w,h,d)*0.22:o.r),p=g.attributes.position,sd=o.seed||0,am=o.amp==null?0.05:o.amp,tp=o.taper||1;
  const hs=(x,y,z)=>{const v=Math.sin(x*127.1+y*311.7+z*74.7+sd*19.3)*43758.5453;return v-Math.floor(v)-0.5;};
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),kx=Math.round(x*40)/40,ky=Math.round(y*40)/40,kz=Math.round(z*40)/40,t=lerp(1,tp,(y/h)+0.5);
    p.setXYZ(i,x*t+hs(kx,ky,kz)*am*w,y+hs(kz,kx,ky)*am*h*0.8,z*t+hs(ky,kz,kx)*am*d);}
  g.computeVertexNormals();g.computeBoundingSphere();return g;}
function disposeObj(o){o.traverse(c=>{if(c.userData.keep)return;if(c.geometry&&!c.geometry.userData.keep)c.geometry.dispose();if(c.material)(Array.isArray(c.material)?c.material:[c.material]).forEach(m=>{if(!m.userData.keep)m.dispose();});});}
function bladeGeo(len,wid,tip){const s=new THREE.Shape();s.moveTo(-wid/2,0);s.lineTo(-wid/2,-len+tip);s.quadraticCurveTo(-wid*0.3,-len+tip*0.3,0,-len);s.quadraticCurveTo(wid*0.3,-len+tip*0.3,wid/2,-len+tip);s.lineTo(wid/2,0);s.lineTo(-wid/2,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:0.03,bevelEnabled:true,bevelThickness:0.014,bevelSize:0.016,bevelSegments:3,curveSegments:10});g.translate(0,0,-0.015);g.rotateY(Math.PI/2);return g;}

/* ---------- Texture procedurali ---------- */
function shade(hex,k){const c=new THREE.Color(hex);c.r=Math.min(1,c.r*k);c.g=Math.min(1,c.g*k);c.b=Math.min(1,c.b*k);return '#'+c.getHexString();}
function tex(c,rx,ry){const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=4;return t;}
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];}
function grime(g,w,h,n,a){for(let k=0;k<n;k++){g.fillStyle=`rgba(0,0,0,${Math.random()*a})`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}}
function rrect(g,x,y,w,h,r){g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);g.fill();}
function makeBrick(z){const [c,g]=cv(256,256);g.fillStyle=z.mortar;g.fillRect(0,0,256,256);
  for(let r=0;r<8;r++){const off=(r%2)?32:0;for(let i=-1;i<5;i++){g.fillStyle=shade(z.wall,rand(0.8,1.14));rrect(g,i*64+off+2,r*32+2,60,28,5);
    g.fillStyle='rgba(255,255,255,0.05)';g.fillRect(i*64+off+6,r*32+3,52,3);g.fillStyle='rgba(0,0,0,0.16)';g.fillRect(i*64+off+6,r*32+26,52,3);}}
  grime(g,256,256,700,0.14);return tex(c,0.24,0.25);}   // il muro usa coordinate in metri
function makeFloor(z){const [c,g]=cv(256,256);g.fillStyle=shade(z.floor,0.55);g.fillRect(0,0,256,256);
  for(let r=0;r<4;r++)for(let i=0;i<4;i++){g.fillStyle=shade(z.floor,rand(0.85,1.15));rrect(g,i*64+2,r*64+2,60,60,8);}
  grime(g,256,256,500,0.15);return tex(c,10,2);}
function makeSky(z){const [c,g]=cv(128,200);
  g.beginPath();g.moveTo(10,200);g.lineTo(10,64);g.arc(64,64,54,Math.PI,0);g.lineTo(118,200);g.closePath();g.save();g.clip();
  const gr=g.createLinearGradient(0,0,0,200);gr.addColorStop(0,z.sky[0]);gr.addColorStop(1,z.sky[1]);g.fillStyle=gr;g.fillRect(0,0,128,200);
  for(let i=0;i<z.stars;i++){g.fillStyle=`rgba(255,255,255,${rand(0.3,1)})`;const s=Math.random()<0.1?2:1;g.fillRect(Math.random()*128,Math.random()*150,s,s);}
  if(z.clouds){for(let i=0;i<9;i++){g.fillStyle='rgba(220,225,240,0.22)';g.beginPath();g.ellipse(rand(0,128),rand(160,200),rand(20,40),rand(8,14),0,0,TAU);g.fill();}}
  else{g.fillStyle='rgba(10,10,18,0.85)';g.beginPath();g.moveTo(0,200);for(let x=0;x<=128;x+=16)g.lineTo(x,170-Math.random()*22);g.lineTo(128,200);g.fill();}
  g.restore();g.beginPath();g.moveTo(10,200);g.lineTo(10,64);g.arc(64,64,54,Math.PI,0);g.lineTo(118,200);
  g.lineWidth=10;g.strokeStyle='#14161c';g.stroke();g.fillStyle='#14161c';g.fillRect(61,12,6,188);g.fillRect(10,116,108,6);
  return new THREE.CanvasTexture(c);}
function makeRubble(){const [c,g]=cv(256,256);g.fillStyle='#1c1a18';g.fillRect(0,0,256,256);let y=0;
  while(y<256){const h=rand(26,44);let x=-rand(0,30);while(x<256){const w=rand(36,78);g.fillStyle=shade('#4a4540',rand(0.75,1.15));rrect(g,x+3,y+3,w-6,h-6,10);
    g.fillStyle='rgba(255,255,255,0.04)';g.fillRect(x+8,y+5,w-16,3);x+=w;}y+=h;}
  grime(g,256,256,900,0.18);return tex(c,8,3.5);}
function makeDirt(){const [c,g]=cv(256,256);g.fillStyle='#2e2822';g.fillRect(0,0,256,256);
  for(let i=0;i<2500;i++){g.fillStyle=`rgba(${rand(60,110)|0},${rand(50,90)|0},${rand(40,70)|0},${rand(0.1,0.4)})`;g.fillRect(Math.random()*256,Math.random()*256,rand(1,4),rand(1,3));}
  for(let i=0;i<40;i++){g.fillStyle='rgba(200,170,90,0.25)';g.save();g.translate(Math.random()*256,Math.random()*256);g.rotate(Math.random()*TAU);g.fillRect(0,0,rand(8,18),1.5);g.restore();}
  return tex(c,8,2);}
const zoneCache={};
function zoneTex(i){if(!zoneCache[i]){const z=ZONES[i];zoneCache[i]={brick:makeBrick(z),floor:makeFloor(z),sky:makeSky(z)};}return zoneCache[i];}

/* =========================================================
   LA TORRE
   ========================================================= */
const towerG=new THREE.Group();scene.add(towerG);
const wallMat=mat(0xffffff,{roughness:0.95}),floorMat=mat(0xffffff,{roughness:0.9}),sideMat=mat(0x2a2d36,{roughness:0.95}),stoneMat=mat(0x5a5148,{roughness:0.9}),darkStone=mat(0x2b2a2e,{roughness:1});
// muro di fondo con il vano della porta in cima alle scale
const WS=HALF+3,wallShape=new THREE.Shape();wallShape.moveTo(-WS,-3);wallShape.lineTo(WS,-3);wallShape.lineTo(WS,23);wallShape.lineTo(-WS,23);wallShape.lineTo(-WS,-3);
const doorHole=new THREE.Path();doorHole.moveTo(DOOR_X-0.65,STAIR_TOP);doorHole.lineTo(DOOR_X+0.65,STAIR_TOP);doorHole.lineTo(DOOR_X+0.65,STAIR_TOP+2.15);doorHole.absarc(DOOR_X,STAIR_TOP+2.15,0.65,0,Math.PI,false);doorHole.lineTo(DOOR_X-0.65,STAIR_TOP);
wallShape.holes.push(doorHole);
mesh(new THREE.ShapeGeometry(wallShape,18),wallMat,0,0,-3.2,towerG,true);
mesh(new THREE.BoxGeometry(W+6,6,8),floorMat,0,-3,0.6,towerG,true);
for(const s of [-1,1])mesh(new THREE.BoxGeometry(2,26,8),sideMat,s*(HALF+1),10,0.2,towerG,true);
mesh(rbox(1.2,26,1.2,0.25),mat(0x1d2027,{roughness:1}),-(HALF-0.2),10,-2.6,towerG,true);
mesh(new THREE.BoxGeometry(W+6,1.2,7),sideMat,0,CEIL+1.2,-0.2,towerG,true);
const beamMat=mat(0x3a2a1e,{roughness:0.9});
for(let x=-HALF+3;x<GATE_X;x+=6)mesh(rbox(0.6,0.6,7,0.12),beamMat,x,CEIL+0.4,-0.2,towerG,true);
const winMats=[];
for(const x of [-20,-9.5,8.5]){const m=new THREE.MeshBasicMaterial({transparent:true});winMats.push(m);mesh(new THREE.PlaneGeometry(2.6,4.06),m,x,7,-3.15,towerG,true);mesh(rbox(3,0.3,0.6,0.1),stoneMat,x,4.9,-2.95,towerG);}
const [numCanvas]=cv(512,256);const numTex=new THREE.CanvasTexture(numCanvas);
mesh(new THREE.PlaneGeometry(7,3.5),new THREE.MeshBasicMaterial({map:numTex,transparent:true,depthWrite:false}),-1,10,-3.14,towerG,true);
function drawFloorNumber(f){const g=numCanvas.getContext('2d');g.clearRect(0,0,512,256);g.textAlign='center';g.fillStyle='rgba(255,214,160,0.16)';
  g.font='700 34px "Chakra Petch", sans-serif';g.fillText('P I A N O',256,52);g.font='170px Bungee, Impact, sans-serif';g.fillText(String(f),256,224);numTex.needsUpdate=true;}
const torches=[];
function addTorch(parent,x,y,z,withLight,color,lz){
  mesh(cap3(0.07,0.45,10),mat(0x2b221b),x,y,z,parent);
  mesh(new THREE.CylinderGeometry(0.16,0.1,0.18,16),mat(0x3a3d45,{metalness:.6,roughness:.4}),x,y+0.32,z,parent);
  const flame=mesh(sph(0.15,16,12),new THREE.MeshBasicMaterial({color:color||0xffb347}),x,y+0.5,z,parent,true);flame.scale.set(1,1.7,1);
  mesh(sph(0.08,12,10),new THREE.MeshBasicMaterial({color:0xfff2c8}),x,y+0.46,z+0.03,parent,true);
  let light=null;if(withLight){light=new THREE.PointLight(color||0xffa64a,1.2,withLight===2?8:18,1.6);light.position.set(x,y+0.9,z+(lz==null?1.2:lz));parent.add(light);}
  const t={flame,light,seed:Math.random()*10,base:withLight===2?1.5:1.2};torches.push(t);return t;}
const towerTorches=[addTorch(towerG,-14.5,4.8,-2.95,true),addTorch(towerG,13.5,4.8,-2.95,true),addTorch(towerG,-4.8,4.0,-2.95,false),addTorch(towerG,3.6,4.0,-2.95,false)];

// cancello: arco di pietra con saracinesca, lucchetto e contatore dei nemici rimasti
const iron=mat(0x3a3d45,{metalness:0.7,roughness:0.4});iron.userData.keep=true;
const gateG=new THREE.Group();gateG.position.set(GATE_X,0,0);towerG.add(gateG);
mesh(rbox(0.9,6.4,0.6,0.15),stoneMat,0,3.2,2.25,gateG);mesh(rbox(0.9,6.4,0.6,0.15),stoneMat,0,3.2,-2.95,gateG);
mesh(rbox(1.0,CEIL-6.2,5.8,0.18),stoneMat,0.05,6.2+(CEIL-6.2)/2,-0.35,gateG);
mesh(rbox(1.1,0.55,6.0,0.2),stoneMat,0.05,6.25,-0.35,gateG);
const bars=new THREE.Group();gateG.add(bars);
for(let i=0;i<8;i++){const z=-2.5+i*0.62;mesh(new THREE.CylinderGeometry(0.075,0.075,5.9,14),iron,0,3.15,z,bars);const sp=mesh(new THREE.ConeGeometry(0.12,0.34,14),iron,0,0.17,z,bars);sp.rotation.x=Math.PI;}
for(const y of [1.3,2.9,4.5])mesh(rbox(0.14,0.16,5.0,0.06),iron,0,y,-0.33,bars);
const lockM=mat(0x8a6a2a,{metalness:.6,roughness:.35,emissive:0xff3b1f,emissiveIntensity:0.7});
const lock=new THREE.Group();lock.position.set(-0.2,2.3,1.75);bars.add(lock);
mesh(rbox(0.36,0.42,0.16,0.08),lockM,0,0,0,lock);const shk=mesh(new THREE.TorusGeometry(0.12,0.035,10,20,Math.PI),iron,0,0.2,0,lock);shk.rotation.y=Math.PI/2;
const [ctrCanvas]=cv(256,128);const ctrTex=new THREE.CanvasTexture(ctrCanvas);
// il cartello sta davanti all'arco e si disegna sempre sopra al muro
const ctrSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:ctrTex,transparent:true,depthWrite:false,depthTest:false}));ctrSprite.scale.set(2.4,1.2,1);ctrSprite.position.set(GATE_X-0.2,7.4,3.2);ctrSprite.renderOrder=10;towerG.add(ctrSprite);
let ctrLast=null;
function drawCounter(n){if(n===ctrLast)return;ctrLast=n;const g=ctrCanvas.getContext('2d');g.clearRect(0,0,256,128);
  g.fillStyle='rgba(12,14,19,0.82)';rrect(g,8,14,240,100,18);g.lineWidth=4;g.strokeStyle=n>0?'#e0434f':'#7fe08a';g.beginPath();g.roundRect?g.roundRect(8,14,240,100,18):g.rect(8,14,240,100);g.stroke();
  g.textAlign='center';g.textBaseline='middle';
  if(n>0){g.fillStyle='#f3ead7';g.beginPath();g.arc(62,58,24,0,TAU);g.fill();g.fillRect(48,70,28,16);g.fillStyle='#0c0e13';g.beginPath();g.arc(53,56,7,0,TAU);g.arc(71,56,7,0,TAU);g.fill();
    g.fillStyle='#ffb347';g.font='64px Bungee, Impact, sans-serif';g.fillText(String(n),160,62);}
  ctrSprite.visible=n>0;
  ctrTex.needsUpdate=true;}
// scale fino al pianerottolo davanti alla porta
for(let i=0;i<STAIR_N;i++){const h=(i+1)*STAIR_RISE;mesh(rbox(STAIR_W+0.03,h,3.4,0.06),stoneMat,STAIR_X0+STAIR_W*(i+0.5),h/2,-1.5,towerG);}
mesh(rbox(HALF+0.4-LAND_X,STAIR_TOP,3.4,0.06),stoneMat,(LAND_X+HALF+0.4)/2,STAIR_TOP/2,-1.5,towerG);
// cornice della porta
for(const s of [-1,1])mesh(rbox(0.32,2.2,0.5,0.1),stoneMat,DOOR_X+s*0.82,STAIR_TOP+1.1,-3.05,towerG);
const archT=mesh(new THREE.TorusGeometry(0.82,0.17,12,28,Math.PI),stoneMat,DOOR_X,STAIR_TOP+2.15,-3.05,towerG);
// dietro la porta: altre scale che salgono, illuminate da una torcia
const well=new THREE.Group();towerG.add(well);
for(const s of [-1,1])mesh(new THREE.BoxGeometry(0.3,5,5),darkStone,DOOR_X+s*0.95,STAIR_TOP+2.4,-5.6,well,true);
mesh(new THREE.BoxGeometry(2.2,0.3,5),darkStone,DOOR_X,STAIR_TOP+4.6,-5.6,well,true);
mesh(new THREE.PlaneGeometry(2.2,5),darkStone,DOOR_X,STAIR_TOP+2.4,-8.0,well,true);
for(let i=0;i<8;i++){const h=(i+1)*0.4;mesh(rbox(1.6,h,0.56,0.04),stoneMat,DOOR_X,STAIR_TOP+h/2,-3.5-i*0.56,well);}
addTorch(well,DOOR_X-0.75,STAIR_TOP+1.8,-4.4,2,0xffa64a,0.9);
const stairY=x=>x<STAIR_X0?0:x>=LAND_X?STAIR_TOP:(Math.floor((x-STAIR_X0)/STAIR_W)+1)*STAIR_RISE;

function applyZone(i){const z=ZONES[i],t=zoneTex(i);wallMat.map=t.brick;wallMat.needsUpdate=true;floorMat.map=t.floor;floorMat.needsUpdate=true;
  for(const m of winMats){m.map=t.sky;m.needsUpdate=true;}
  for(const tr of towerTorches){if(tr.light)tr.light.color.setHex(z.light);tr.flame.material.color.setHex(z.light);}G.zoneBuilt=i;
  const bg=new THREE.Color(z.wall).multiplyScalar(0.16);scene.background.copy(bg);scene.fog.color.copy(bg);hemi.color.set(0xa8b2d0).lerp(new THREE.Color(z.light),0.25);}
function cellarAmbience(){scene.background.setHex(0x100806);scene.fog.color.setHex(0x100806);hemi.color.setHex(0xffb070);G.zoneBuilt=-1;}   // luce calda della fucina
// stanza del guardiano: buio, nebbia stretta e fuochi del suo colore. Gli altri piani tornano alla luce della zona
function towerMood(f){const boss=isBossFloor(f)&&!G.tutorial,z=ZONES[zoneIndex(f)];
  if(boss){const c=new THREE.Color(bossFor(f).color),bg=c.clone().multiplyScalar(0.05);scene.background.copy(bg);scene.fog.color.copy(bg);scene.fog.near=20;scene.fog.far=50;
    hemi.intensity=0.24;sun.intensity=0.22;hemi.color.setHex(0x6a6480).lerp(c,0.3);
    for(const tr of towerTorches){if(tr.light)tr.light.color.copy(c);tr.flame.material.color.copy(c);tr.base=tr.light?1.5:1.2;}
    $('bossVig').classList.add('on');}
  else{const bg=new THREE.Color(z.wall).multiplyScalar(0.16);scene.background.copy(bg);scene.fog.color.copy(bg);scene.fog.near=30;scene.fog.far=62;
    hemi.intensity=0.6;sun.intensity=0.7;hemi.color.set(0xa8b2d0).lerp(new THREE.Color(z.light),0.25);
    for(const tr of towerTorches){if(tr.light)tr.light.color.setHex(z.light);tr.flame.material.color.setHex(z.light);tr.base=1.2;}
    $('bossVig').classList.remove('on');}}

// piattaforme solide
const PRESETS=[[],[],[[-8,3.0,6],[5,3.0,6]],[[-2,3.0,8]],[[-9,3.0,5],[1,5.6,5]],[[-6,3.0,6]],[[3,3.0,6]]];
const BOSS_PLATS=[[-13,3.0,4],[7.5,3.0,3.5]];
const levelGroup=new THREE.Group();scene.add(levelGroup);
const platMat=mat(0x6b6157,{roughness:0.85}),platEdge=mat(0x3b2a1e,{roughness:0.9});platMat.userData.keep=platEdge.userData.keep=true;
function buildLevel(f){
  const zi=zoneIndex(f);if(G.zoneBuilt!==zi)applyZone(zi);drawFloorNumber(f);
  while(levelGroup.children.length){const c=levelGroup.children.pop();disposeObj(c);}
  G.solids=[];const preset=isBossFloor(f)?BOSS_PLATS:isSafeFloor(f)?[]:(f===1?PRESETS[1]:pick(PRESETS));   // nei santuari niente piattaforme
  for(const [cx0,top,w] of preset){const cx=MX(cx0);
    mesh(rbox(w,0.5,2.4,0.14),platMat,cx,top-0.25,-0.3,levelGroup);
    mesh(rbox(w+0.15,0.12,2.5,0.05),platEdge,cx,top-0.52,-0.3,levelGroup);
    for(const s of [-1,1])mesh(new THREE.CylinderGeometry(0.04,0.04,CEIL-top,8),iron,cx+s*(w/2-0.4),top+(CEIL-top)/2,-0.9,levelGroup);
    G.solids.push({x1:cx-w/2,x2:cx+w/2,y1:top-0.5,y2:top});
  }
  G.props=[];G.splats=0;G.decals=[];G.barrels=[];const n0=levelGroup.children.length;buildDecor(f);
  for(let i=n0;i<levelGroup.children.length;i++){const c=levelGroup.children[i];c.position.x=MX(c.position.x);}
  for(const pr of G.props)if(pr.x0!=null)pr.x0=MX(pr.x0);
}
// luce di stanza unica (accesa diversamente per zona e per guardiano): niente luci nuove, niente scatti
const roomLight=new THREE.PointLight(0xffffff,0,42,1.2);roomLight.position.set(-3,9,5);towerG.add(roomLight);
const BARREL_PTS=[];for(let i=0;i<=10;i++){const t=i/10;BARREL_PTS.push(new THREE.Vector2(0.36+Math.sin(t*Math.PI)*0.08,t*1.05));}
// arredi di sfondo: ogni zona ha i suoi, ogni guardiano la sua stanza
function buildDecor(f){
  const zi=zoneIndex(f),z=ZONES[zi],L=levelGroup,boss=isBossFloor(f),Z=-2.45;
  const dm=(geo,m,x,y,zz,par,ol)=>{const o=mesh(geo,m,x,y,zz,par||L,true);if(ol)outline(o,ol);return o;};
  const acc=toon(z.accent),wood=toon(0x6a4a2e),woodD=toon(0x4a3220),metal=toon(0x8a8f99),bone=toon(0xe8e0cc),gold=toon(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.25});
  const glowM=c=>new THREE.MeshBasicMaterial({color:c});
  // stendardi del colore della zona
  for(const x of [-12.5,9.6]){const b=new THREE.Group();b.position.set(x,10.4,-3.05);L.add(b);
    const rod=dm(cap3(0.05,1.5,8),woodD,0,0.3,0,b);rod.rotation.z=Math.PI/2;
    dm(rbox(1.2,2.6,0.04,0.02),acc,0,-1.05,0,b,1.03);dm(new THREE.ConeGeometry(0.6,0.5,3),acc,0,-2.55,0,b).rotation.z=Math.PI;
    dm(sph(0.22,16,12),gold,0,-0.9,0.05,b);}
  roomLight.color.setHex(z.light);roomLight.intensity=0;decorExtra(z,dm,acc,metal,glowM);
  switch(z.decor){
  case 'barrels':
    for(const [x,zz] of [[-15.2,-2.4],[-14.4,-2.1],[3.2,-2.4],[-4.5,-1.9],[9.5,-2]])addBarrel(x,zz,wood,metal);
    dm(rbox(1,1,1,0.06),wood,-9.8,0.5,Z,L,1.03);dm(rbox(0.8,0.8,0.8,0.06),wood,-9.7,1.4,Z-0.05,L,1.03);dm(rbox(0.9,0.7,0.9,0.06),woodD,8.6,0.35,Z,L,1.03);break;
  case 'racks':
    for(const x of [-14,2.6]){dm(rbox(2.4,0.12,0.18,0.04),woodD,x,2.3,Z);dm(rbox(2.4,0.12,0.18,0.04),woodD,x,0.5,Z);
      for(let i=0;i<4;i++){const px=x-0.9+i*0.6;dm(new THREE.CylinderGeometry(0.035,0.035,2.6,8),woodD,px,1.3,Z+0.12);dm(new THREE.ConeGeometry(0.08,0.3,8),metal,px,2.75,Z+0.12);}}
    for(const x of [-9.5,8.4]){const sh=dm(new THREE.CylinderGeometry(0.55,0.55,0.08,24),acc,x,6.2,-3.05,L,1.04);sh.rotation.x=Math.PI/2;dm(sph(0.14,12,10),gold,x,6.2,-2.98);
      for(const s of [-1,1]){const sw=dm(rbox(0.1,1.6,0.04,0.02),metal,x+s*0.35,6.2,-3.1);sw.rotation.z=s*0.6;}}
    break;
  case 'books':
    for(const x of [-14.2,2.8]){const g=new THREE.Group();g.position.set(x,0,Z);L.add(g);dm(rbox(2.4,3.4,0.6,0.06),woodD,0,1.7,-0.05,g,1.02);
      for(let r=0;r<4;r++){dm(rbox(2.2,0.08,0.55,0.02),wood,0,0.35+r*0.8,0.05,g);let bx=-1.0;while(bx<1.0){const w=rand(0.1,0.2),h=rand(0.45,0.65);dm(rbox(w,h,0.4,0.02),toon(pick([0x8a2a2a,0x2a4a7a,0x3a6a2a,0x7a5a2a,0x5a2a6a])),bx+w/2,0.39+r*0.8+h/2,0.08,g);bx+=w+0.02;}}}
    for(const x of [-9.4,8.6]){dm(new THREE.CylinderGeometry(0.06,0.08,1.0,10),gold,x,0.5,Z+0.3);dm(rbox(0.7,0.08,0.5,0.03),gold,x,1.04,Z+0.3);const c=dm(sph(0.07,10,8),glowM(0xffd27a),x,1.2,Z+0.3);c.scale.y=1.8;}
    roomLight.intensity=0.25;break;
  case 'plants':{
    const pot=toon(0xb5653a),leaf=toon(0x4a8a3a),leaf2=toon(0x6aaa4a),pp=[[0,0],[0.32,0],[0.42,0.55],[0.46,0.62],[0,0.62]].map(p=>new THREE.Vector2(p[0],p[1]));
    for(const x of [-15,-9.6,2.8,8.6]){dm(new THREE.LatheGeometry(pp,20),pot,x,0,Z,L,1.04);for(let i=0;i<5;i++)dm(sph(rand(0.3,0.45),14,10),i%2?leaf:leaf2,x+rand(-0.35,0.35),0.85+rand(0,0.6),Z+rand(-0.15,0.2),L,1.05);}
    for(let i=0;i<7;i++){const x=-15+i*4.1;let y=CEIL-0.2;const n=3+Math.floor(Math.random()*4);for(let k=0;k<n;k++){dm(cap3(0.06,0.4,6),leaf,x+Math.sin(k)*0.1,y,-3.0);if(k%2)dm(sph(0.12,10,8),leaf2,x+0.12,y,-2.95);y-=0.5;}}
    roomLight.intensity=0.2;break;}
  case 'bones':{
    const dark=toon(0x2b2620);
    for(const x of [-14.6,3.1]){const c=dm(rbox(0.9,2.2,0.5,0.12),toon(0x3a3438),x,1.1,Z,L,1.03);c.rotation.z=0.05;dm(rbox(0.12,1.0,0.06,0.02),bone,x,1.35,Z+0.27);dm(rbox(0.6,0.12,0.06,0.02),bone,x,1.6,Z+0.27);}
    for(const x of [-10,8.8])for(let i=0;i<6;i++){const sx=x+(i%3-1)*0.36,sy=0.2+Math.floor(i/3)*0.34;dm(sph(0.2,14,10),bone,sx,sy,Z+0.2,L,1.06);for(const s of [-1,1])dm(sph(0.05,8,6),dark,sx+s*0.07,sy+0.02,Z+0.38);}
    for(const x of [-12,-6,6]){dm(new THREE.CylinderGeometry(0.06,0.06,0.3,10),toon(0xf2ead8),x,0.15,-1.9);const c=dm(sph(0.06,10,8),glowM(0xb48cff),x,0.36,-1.9);c.scale.y=1.8;}
    roomLight.intensity=0.35;break;}
  case 'lava':{
    const lava=glowM(0xff6a2a),anvil=toon(0x3a3d45);
    for(const x of [-14.2,3]){dm(rbox(1.0,0.6,0.5,0.06),anvil,x,0.75,Z,L,1.04);dm(rbox(0.4,0.45,0.35,0.05),anvil,x,0.22,Z,L,1.04);dm(rbox(0.5,0.25,0.4,0.08),anvil,x+0.55,0.9,Z);}
    for(const x of [-9.4,8.6]){dm(rbox(1.6,1.2,0.9,0.12),toon(0x4a3a34),x,0.6,Z-0.1,L,1.03);dm(rbox(1.3,0.12,0.7,0.05),lava,x,1.22,Z-0.1);}
    for(let i=0;i<6;i++){const c=dm(rbox(0.06,rand(1,2.5),0.02,0.01),lava,rand(-15,10),rand(3,11),-3.15);c.rotation.z=rand(-0.6,0.6);}
    roomLight.color.setHex(0xff6a2a);roomLight.intensity=0.6;break;}
  case 'ice':{
    const ice=toon(0xbfe6ff,{transparent:true,opacity:0.85,emissive:0x2a6a9a,emissiveIntensity:0.3});
    for(const x of [-14.8,-9.6,3,8.8])for(let i=0;i<4;i++){const c=dm(new THREE.ConeGeometry(rand(0.15,0.3),rand(0.8,1.8),6),ice,x+rand(-0.5,0.5),0.5,Z+rand(-0.2,0.3),L,1.04);c.rotation.z=rand(-0.4,0.4);}
    for(let i=0;i<14;i++){const c=dm(new THREE.ConeGeometry(rand(0.1,0.2),rand(0.5,1.3),6),ice,-16+i*2.1+rand(-0.4,0.4),CEIL-0.6,rand(-2.8,-1));c.rotation.x=Math.PI;}
    roomLight.color.setHex(0x9ad0ff);roomLight.intensity=0.45;break;}
  case 'stars':{
    const brass=toon(0xc89a52),star=glowM(0xfff2c8);
    const tg=new THREE.Group();tg.position.set(-13.8,0,Z);L.add(tg);for(const a of [-0.35,0,0.35]){const l=dm(new THREE.CylinderGeometry(0.03,0.03,1.6,8),woodD,Math.sin(a)*0.4,0.75,Math.cos(a)*0.2-0.1,tg);l.rotation.z=a;}
    const tube=dm(new THREE.CylinderGeometry(0.12,0.2,1.8,16),brass,0.2,1.9,0,tg,1.05);tube.rotation.z=-0.9;
    const arm=new THREE.Group();arm.position.set(3.2,1.6,Z);L.add(arm);dm(new THREE.CylinderGeometry(0.05,0.15,1.6,10),brass,0,-0.8,0,arm);
    for(let i=0;i<3;i++){const r=dm(new THREE.TorusGeometry(0.6,0.025,8,40),brass,0,0.35,0,arm);r.rotation.set(i*0.9,i*0.5,0);G.props.push({o:r,spin:0.3+i*0.2,ax:'y'});}
    dm(sph(0.18,16,12),glowM(0x9fb6ff),0,0.35,0,arm);
    for(let i=0;i<30;i++){const s=dm(sph(rand(0.03,0.07),6,4),star,rand(-16,12),rand(3,12),-3.1);G.props.push({o:s,tw:rand(1,4)});}
    roomLight.color.setHex(0x9fb6ff);roomLight.intensity=0.3;break;}
  case 'royal':{
    const red=toon(0x8a1a2a),carpet=toon(0x7a1a24);
    const cp=dm(new THREE.PlaneGeometry(29,1.6),carpet,-2,0.01,-1.5);cp.rotation.x=-Math.PI/2;cp.scale.x=DSC;
    for(const x of [-16.6,12.1]){const cp2=dm(new THREE.PlaneGeometry(0.15,1.6),gold,x,0.012,-1.5);cp2.rotation.x=-Math.PI/2;}
    for(const x of [-14.5,-9.2,3.3,8.4]){dm(new THREE.CylinderGeometry(0.32,0.38,4.2,20),toon(0xe6dccb),x,2.1,Z,L,1.04);dm(rbox(0.9,0.25,0.9,0.06),gold,x,4.3,Z);dm(rbox(0.9,0.25,0.9,0.06),gold,x,0.12,Z);}
    for(const x of [-11.8,5.9]){const v=[[0,0],[0.2,0],[0.3,0.3],[0.18,0.6],[0.22,0.8],[0,0.8]].map(p=>new THREE.Vector2(p[0],p[1]));dm(new THREE.LatheGeometry(v,20),red,x,0,Z+0.2,L,1.05);}
    roomLight.color.setHex(0xffd27a);roomLight.intensity=0.35;break;}
  case 'peak':{
    const st=toon(0xb9b6c4),cloud=new THREE.MeshBasicMaterial({color:0xe8eefc,transparent:true,opacity:0.55,depthWrite:false});
    for(const [x,h] of [[-14.5,2.6],[-9.4,1.4],[3,3.2],[8.6,1.9]]){dm(new THREE.CylinderGeometry(0.4,0.45,h,16),st,x,h/2,Z,L,1.04);const c=dm(rbox(1,0.25,1,0.05),st,x+0.3,0.12,Z+0.5,L,1.04);c.rotation.y=0.4;}
    for(let i=0;i<8;i++){const c=dm(sph(rand(0.6,1.2),16,12),cloud,rand(-16,11),rand(0.2,1.2),-2.9);c.scale.set(2,0.6,0.6);G.props.push({o:c,drift:rand(0.2,0.5),x0:c.position.x});}
    const bp=[[0,1.2],[0.15,1.18],[0.3,0.9],[0.38,0.3],[0.55,0],[0.5,0],[0,0.05]].map(p=>new THREE.Vector2(p[0],p[1]));
    const bell=dm(new THREE.LatheGeometry(bp,24),gold,-3,10.6,-2.6,L,1.03);G.props.push({o:bell,swing:0.12});
    roomLight.color.setHex(0xc9e6ff);roomLight.intensity=0.4;break;}
  }
  if(boss)buildBossRoom(bossFor(f),dm,{wood,woodD,metal,bone,gold});
}
// arredi comuni a tutti i piani: lesene, catene con lanterne, ragnatele, calcinacci, candele, rune sul muro
function addBarrel(x,z,wood,metal){const g=new THREE.Group();g.position.set(x,0,z);levelGroup.add(g);mesh(new THREE.LatheGeometry(BARREL_PTS,20),wood,0,0,0,g);
  for(const y of [0.18,0.87]){const r=mesh(new THREE.TorusGeometry(0.42,0.025,8,28),metal,0,y,0,g);r.rotation.x=Math.PI/2;}G.barrels.push({g,hp:2});return g;}
function decorExtra(z,dm,acc,metal,glowM){
  const woodB=toon(0x7a5a3a);for(const x of [-13.5,1.8,8.8])if(Math.random()<0.6)addBarrel(x+rand(-0.6,0.6),-2.1+rand(-0.2,0.3),woodB,metal);
  const L=levelGroup,wc=new THREE.Color(z.wall),st=toon(wc.clone().multiplyScalar(0.85).getHex()),st2=toon(wc.clone().multiplyScalar(0.6).getHex());
  for(const x of [-1,11]){dm(rbox(0.9,CEIL,0.35,0.06),st,x,CEIL/2,-3.0,L,1.02);dm(rbox(1.2,0.4,0.55,0.08),st2,x,0.2,-2.95,L,1.03);dm(rbox(1.2,0.35,0.55,0.08),st2,x,CEIL-0.5,-2.95,L,1.03);
    dm(rbox(0.14,1.6,0.05,0.02),acc,x,6.4,-2.8);}
  [-11,-4.5,7.5].forEach((x,i)=>{const g=new THREE.Group();g.position.set(x,CEIL,-2.2);L.add(g);const n=4+i%3;
    for(let k=0;k<n;k++){const l=dm(new THREE.TorusGeometry(0.12,0.035,6,12),metal,0,-0.15-k*0.22,0,g);l.rotation.y=k%2?Math.PI/2:0;}
    if(i!==1){const y=-0.35-n*0.22;dm(rbox(0.3,0.36,0.3,0.05),metal,0,y,0,g);const f=dm(sph(0.1,10,8),glowM(z.light),0,y,0,g);f.scale.y=1.4;G.props.push({o:f,flick:1});
      const cp=dm(new THREE.ConeGeometry(0.24,0.2,4),metal,0,y+0.27,0,g);cp.rotation.y=Math.PI/4;}
    G.props.push({o:g,swing:0.04+i*0.015});});
  for(const [x,sx] of [[-17.6,1],[12.4,-1]]){const w=dm(new THREE.CircleGeometry(1.6,6,-Math.PI/2,Math.PI/2),new THREE.MeshBasicMaterial({color:0xd8d8e0,wireframe:true,transparent:true,opacity:0.3}),x,CEIL,-3.0);w.scale.x=sx;}
  for(const x of [-11.8,-6.2,-3.4,6.4,10.2])for(let i=0;i<3;i++){const r=dm(new THREE.DodecahedronGeometry(rand(0.1,0.24)),st2,x+rand(-0.4,0.4),0.08,-2.2+rand(-0.3,0.4),L,1.05);r.rotation.set(rand(0,3),rand(0,3),0);}
  for(const x of [-5.2,0.6,10.6])for(let i=0;i<3;i++){const h=rand(0.25,0.6),cx=x+(i-1)*0.22,cz=-2.3+rand(-0.15,0.15);dm(new THREE.CylinderGeometry(0.06,0.07,h,10),toon(0xf2ead8),cx,h/2,cz);
    const f=dm(sph(0.05,8,6),glowM(0xffd27a),cx,h+0.07,cz);f.scale.y=1.8;G.props.push({o:f,flick:1});}
  for(const [x,y] of [[-4.5,11.2],[2.2,11.0]]){const r=dm(new THREE.RingGeometry(0.35,0.45,6),glowM(z.accent),x,y,-3.1);G.props.push({o:r,spin:0.4});dm(new THREE.CircleGeometry(0.12,6),glowM(z.accent),x,y,-3.09);}
}
function buildBossRoom(d,dm,M){
  const L=levelGroup,Z=-2.4,c=d.color,flame=new THREE.MeshBasicMaterial({color:c});
  // bracieri con la fiamma del colore del guardiano
  for(const x of [-15.5,10.5]){dm(new THREE.CylinderGeometry(0.15,0.25,1.4,12),M.metal,x,0.7,Z+0.4,L,1.05);dm(new THREE.CylinderGeometry(0.5,0.3,0.4,16),M.metal,x,1.55,Z+0.4,L,1.04);
    const f=dm(sph(0.35,14,10),flame,x,1.95,Z+0.4);f.scale.y=1.6;G.props.push({o:f,flick:1});}
  const ban=new THREE.Group();ban.position.set(-1,12.6,-3.0);L.add(ban);dm(rbox(3.2,0.15,0.15,0.05),M.woodD,0,0,0,ban);dm(rbox(2.6,1.5,0.04,0.02),toon(c),0,-0.85,0,ban,1.03);
  roomLight.color.setHex(c);roomLight.intensity=1.0;
  // --- atmosfera tenebrosa comune a tutte le stanze dei guardiani ---
  // sigillo del guardiano inciso sul muro di fondo, che pulsa del suo colore
  {const sg=new THREE.Group();sg.position.set(-3,7.2,-3.02);L.add(sg);const gm=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0.35,depthWrite:false,blending:THREE.AdditiveBlending});
    dm(new THREE.TorusGeometry(2.6,0.06,6,64),gm,0,0,0,sg);dm(new THREE.TorusGeometry(2.1,0.04,6,6),gm,0,0,0,sg);dm(new THREE.TorusGeometry(1.2,0.05,6,3),gm,0,0,0,sg);
    for(let i=0;i<8;i++){const r=dm(rbox(0.06,0.7,0.02,0.01),gm,Math.cos(i/8*TAU)*2.35,Math.sin(i/8*TAU)*2.35,0,sg);r.rotation.z=i/8*TAU+Math.PI/2;}
    G.props.push({o:sg,spin:0.08,ax:'z'},{o:sg,pulseM:gm,base:0.3});}
  // occhi che si aprono e si chiudono nel buio
  const eyeM=new THREE.MeshBasicMaterial({color:new THREE.Color(c).lerp(new THREE.Color(0xff2a1a),0.55)});
  for(let i=0;i<9;i++){const eg=new THREE.Group();eg.position.set(rand(-17,12),rand(1.6,11.5),-3.0);L.add(eg);const sz=rand(0.05,0.1);
    for(const sx of [-1,1]){const e=dm(sph(sz,8,6),eyeM,sx*sz*2.6,0,0,eg);e.scale.set(1.5,1,1);}G.props.push({o:eg,blink:rand(2,6),ph:rand(0,10)});}
  // nebbia bassa che striscia sul pavimento
  for(let i=0;i<7;i++){const mm=new THREE.MeshBasicMaterial({color:new THREE.Color(c).lerp(new THREE.Color(0x1a1420),0.6),transparent:true,opacity:rand(0.07,0.13),depthWrite:false});
    const x=-16+i*4.4,f=dm(new THREE.PlaneGeometry(rand(7,10),rand(1.2,2)),mm,x,rand(0.35,0.7),rand(-2.4,1.6));G.props.push({o:f,drift:rand(0.15,0.35),x0:x});}
  // catene appese con teschi e candele del colore del guardiano
  for(const x of [-14,-9.5,1.5,7]){let y=CEIL-0.2;for(let i=0;i<7;i++){const l=dm(new THREE.TorusGeometry(0.12,0.035,6,12),M.metal,x,y,-2.6);l.rotation.y=i%2?Math.PI/2:0;y-=0.22;}
    const sk=new THREE.Group();sk.position.set(x,y-0.15,-2.6);L.add(sk);dm(sph(0.22,12,10),M.bone,0,0,0,sk,1.06);dm(rbox(0.22,0.12,0.16,0.04),M.bone,0,-0.17,0.05,sk);
    for(const sx of [-1,1])dm(sph(0.05,8,6),eyeM,sx*0.08,0.02,0.19,sk);G.props.push({o:sk,swing:0.12});}
  for(let i=0;i<10;i++){const x=-17+i*3.2+rand(-0.6,0.6),h=rand(0.25,0.6);dm(new THREE.CylinderGeometry(0.07,0.08,h,8),toon(0xe6dcc6),x,h/2,-2.75);
    const fl=dm(sph(0.07,8,6),flame,x,h+0.09,-2.75);G.props.push({o:fl,flick:1});}
  switch(d.arch){
  case 'golem':
    for(const x of [-12,-6,4,8]){let y=CEIL-0.3;for(let i=0;i<6;i++){const l=dm(new THREE.TorusGeometry(0.14,0.04,6,14),M.metal,x,y,-2.2);l.rotation.y=i%2?Math.PI/2:0;y-=0.26;}}
    for(const x of [-13.5,-8,6.5])dm(new THREE.DodecahedronGeometry(rand(0.4,0.7)),toon(0x6a6460),x,0.35,Z+0.3,L,1.05);break;
  case 'slimeKing':{const sl=toon(c,{transparent:true,opacity:0.75});
    for(const x of [-13,-7,0,5,9]){const p=dm(sph(rand(0.6,1.1),20,10),sl,x,0.02,-1.6);p.scale.y=0.12;}
    for(let i=0;i<8;i++){const p=dm(sph(rand(0.12,0.25),10,8),sl,rand(-15,10),rand(4,11),-3.1);p.scale.y=1.6;}break;}
  case 'skelKing':{const th=new THREE.Group();th.position.set(-3,0,Z-0.1);L.add(th);
    dm(rbox(1.8,0.9,1.0,0.1),toon(0x3a3438),0,0.45,0,th,1.03);dm(rbox(1.8,3.0,0.3,0.1),toon(0x3a3438),0,1.9,-0.4,th,1.03);
    for(let i=0;i<7;i++)dm(sph(0.2,12,10),M.bone,-0.75+i*0.25,3.45+Math.sin(i/6*Math.PI)*0.3,-0.35,th,1.06);
    dm(rbox(1.5,0.15,0.9,0.05),toon(c),0,0.95,0.05,th);break;}
  case 'bknight':
    for(const x of [-13,-8,6]){const g=new THREE.Group();g.position.set(x,0,Z+0.2);L.add(g);dm(new THREE.CylinderGeometry(0.06,0.06,1.8,8),M.woodD,0,0.9,0,g);
      dm(new THREE.CylinderGeometry(0.28,0.25,0.9,14),toon(0xc9a54a),0,1.4,0,g,1.05);const a=dm(cap3(0.06,1.1,8),M.woodD,0,1.6,0,g);a.rotation.z=Math.PI/2;dm(sph(0.22,12,10),toon(0xc9a54a),0,2.05,0,g,1.06);}
    break;
  case 'archmage':
    for(const [x,y,r] of [[-9,0.03,1.6],[4,0.03,1.3]]){const ring=dm(new THREE.TorusGeometry(r,0.04,6,48),flame,x,y,-1.4);ring.rotation.x=Math.PI/2;G.props.push({o:ring,spin:0.6,ax:'z'});
      const r2=dm(new THREE.TorusGeometry(r*0.7,0.03,6,6),flame,x,y+0.01,-1.4);r2.rotation.x=Math.PI/2;G.props.push({o:r2,spin:-0.9,ax:'z'});}
    for(let i=0;i<6;i++){const b=dm(rbox(0.5,0.12,0.36,0.03),toon(pick([0x8a2a2a,0x2a4a7a,0x5a2a6a])),rand(-15,10),rand(5,10),-2.7,L,1.05);b.rotation.set(rand(-0.4,0.4),rand(-1,1),rand(-0.4,0.4));G.props.push({o:b,bob:0.3,y0:b.position.y,ph:rand(0,6)});}
    break;
  case 'batQueen':
    for(let i=0;i<16;i++){const s=dm(new THREE.ConeGeometry(rand(0.2,0.4),rand(0.8,2.2),7),toon(0x4a4450),-16+i*1.85+rand(-0.4,0.4),CEIL-0.8,rand(-2.8,-1.2),L,1.04);s.rotation.x=Math.PI;}
    for(const x of [-14,7]){const w=dm(new THREE.TorusGeometry(0.8,0.012,4,6),new THREE.MeshBasicMaterial({color:0xdcdcdc,transparent:true,opacity:0.5}),x,CEIL-1.6,-3.0);for(let k=0;k<3;k++){const s=dm(new THREE.TorusGeometry(0.3+k*0.25,0.01,4,6),w.material,x,CEIL-1.6,-3.0);s.rotation.z=0.3;}}
    break;
  case 'dragon':
    for(const [x,n] of [[-14,30],[-8,18],[6,22]])for(let i=0;i<n;i++){const r=rand(0,1);dm(sph(0.12,8,6),M.gold,x+rand(-1.2,1.2)*(1-r),0.1+r*0.9,Z+rand(-0.2,0.5));}
    {const sk=new THREE.Group();sk.position.set(2,0,Z);L.add(sk);dm(sph(0.9,18,14),M.bone,0,0.8,0,sk,1.03).scale.set(1.2,0.8,1);dm(rbox(1.2,0.4,1.0,0.15),M.bone,0,0.3,0.7,sk,1.03);
      for(const s of [-1,1]){const h=dm(new THREE.ConeGeometry(0.18,1.2,10),M.bone,s*0.7,1.4,-0.3,sk,1.04);h.rotation.set(-0.8,0,-s*0.6);dm(sph(0.2,10,8),new THREE.MeshBasicMaterial({color:0x1a1014}),s*0.4,0.9,0.75,sk);}}
    roomLight.intensity=1.3;break;
  }
}
function updProps(dt){
  for(const p of G.props){const o=p.o;
    if(p.spin)o.rotation[p.ax||'z']+=dt*p.spin;
    if(p.bob)o.position.y=p.y0+Math.sin(G.time*1.4+p.ph)*p.bob;
    if(p.tw)o.scale.setScalar(0.6+0.4*Math.abs(Math.sin(G.time*p.tw)));
    if(p.drift){o.position.x=p.x0+Math.sin(G.time*p.drift)*1.5;}
    if(p.swing)o.rotation.z=Math.sin(G.time*1.2)*p.swing;
    if(p.flick){const f=1+Math.sin(G.time*13+o.position.x)*0.1+Math.random()*0.08;o.scale.set(f,1.6*f,f);}
    if(p.blink){const k=(G.time+p.ph)%p.blink;o.visible=!(k<0.18||(k>p.blink*0.5&&k<p.blink*0.5+0.14));}
    if(p.pulseM){p.pulseM.opacity=p.base+Math.sin(G.time*2.2)*0.12+(G.bossFlash||0)*0.6;}
  }
}

/* =========================================================
   IL SEMINTERRATO (menu esplorabile)
   ========================================================= */
const cellarG=new THREE.Group();scene.add(cellarG);
const cellarLights=[],INTER=[],wdDoors=[];let cellarWD=null,safeG=null;const WD_X=5.5;
let dust=null,pedRunes=null,pedBeam=null,cellarBlanket=null;
// arredo del seminterrato "Fucina nanica": ferro, ingranaggi, tubi di rame e un canale di lava davanti
const cellarAnims=[];   // piccole animazioni del seminterrato (ingranaggi, mantice, lava, braci, vapore)
const CFX={};
CFX.brick=()=>{const [c,g]=cv(256,256);g.fillStyle='#140a08';g.fillRect(0,0,256,256);let y=0;
  while(y<256){const h=rand(18,22);let x=-rand(0,30);while(x<256){const w=rand(40,48);g.fillStyle=shade('#5a3328',rand(0.75,1.15));rrect(g,x+3,y+3,w-6,h-6,2);
    g.fillStyle='rgba(255,255,255,0.04)';g.fillRect(x+8,y+5,w-16,3);x+=w;}y+=h;}
  grime(g,256,256,900,0.18);return tex(c,9,4);};
CFX.plate=()=>{const [c,g]=cv(256,256);g.fillStyle='#14121a';g.fillRect(0,0,256,256);
  for(let y=0;y<256;y+=64)for(let x=(y/64)%2?-64:0;x<256;x+=128){g.fillStyle=shade('#4a4450',rand(0.85,1.1));g.fillRect(x+2,y+2,124,60);
    g.fillStyle='rgba(255,255,255,0.06)';g.fillRect(x+4,y+4,120,2);g.fillStyle='rgba(0,0,0,0.5)';
    for(const [rx,ry] of [[8,8],[117,8],[8,53],[117,53]]){g.beginPath();g.arc(x+rx+1.5,y+ry+1.5,2.5,0,TAU);g.fill();}}
  grime(g,256,256,1400,0.25);return tex(c,8,2);};
CFX.lava=()=>{const [c,g]=cv(256,64);g.fillStyle='#8a1a04';g.fillRect(0,0,256,64);
  for(let i=0;i<90;i++){const r=rand(4,14);const rg=g.createRadialGradient(0,0,0,0,0,r);rg.addColorStop(0,'rgba(255,230,120,0.95)');rg.addColorStop(1,'rgba(255,120,20,0)');g.save();g.translate(Math.random()*256,Math.random()*64);g.fillStyle=rg;g.beginPath();g.arc(0,0,r,0,TAU);g.fill();g.restore();}
  for(let i=0;i<40;i++){g.fillStyle='rgba(40,8,4,0.6)';g.beginPath();g.ellipse(Math.random()*256,Math.random()*64,rand(6,18),rand(3,7),0,0,TAU);g.fill();}
  return tex(c,8,1);};
CFX.gear=(P,x,y,z,r,m,n)=>{const g=new THREE.Group();g.position.set(x,y,z);P.add(g);
  mesh(new THREE.CylinderGeometry(r*0.82,r*0.82,0.14,32),m,0,0,0,g).rotation.x=Math.PI/2;mesh(new THREE.CylinderGeometry(r*0.25,r*0.25,0.2,16),toon(0x2a2a30),0,0,0.02,g).rotation.x=Math.PI/2;
  n=n||12;for(let i=0;i<n;i++){const a=i/n*TAU,t=mesh(rbox(r*0.22,r*0.26,0.12,0.02),m,Math.cos(a)*r*0.92,Math.sin(a)*r*0.92,0,g);t.rotation.z=a+Math.PI/2;}
  for(let i=0;i<5;i++){const a=i/5*TAU;mesh(new THREE.CylinderGeometry(r*0.12,r*0.12,0.16,10),toon(0x1a1a20),Math.cos(a)*r*0.52,Math.sin(a)*r*0.52,0.01,g,true).rotation.x=Math.PI/2;}
  return g;};
CFX.spin=(o,v,ax)=>{cellarAnims.push(dt=>{o.rotation[ax||'z']+=v*dt;});return o;};
CFX.tube=(P,pts,r,m,seg)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),seg||40,r,10,false),m,0,0,0,P);
CFX.crate=(P,x,y,z,s,wood,dark)=>{mesh(rbox(s,s,s,0.05),wood,x,y+s/2,z,P);for(const d of [-1,1])mesh(rbox(s*1.02,0.08,0.06,0.02),dark,x,y+s/2+d*s*0.38,z+s/2,P);
  mesh(rbox(s*1.25,0.08,0.06,0.02),dark,x,y+s/2,z+s/2+0.01,P).rotation.z=Math.PI/4;};
CFX.light=(P,col,i,d,x,y,z,steady)=>{const l=new THREE.PointLight(col,i,d,1.6);l.position.set(x,y,z);P.add(l);cellarLights.push({light:l,base:i,seed:rand(0,9),steady:!!steady});return l;};
CFX.flame=(P,x,y,z,col,s)=>{const g=new THREE.Group();g.position.set(x,y,z);P.add(g);s=s||1;
  const o=mesh(sph(0.07*s,10,8),new THREE.MeshBasicMaterial({color:0xfff2c0}),0,0,0,g,true);o.scale.set(1,1.9,1);
  const h=mesh(sph(0.12*s,10,8),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending}),0,0.02*s,0,g,true);h.scale.set(1,2,1);
  const sd=rand(0,9);cellarAnims.push((dt,t)=>{const k=1+Math.sin(t*11+sd)*0.12+Math.sin(t*17+sd)*0.06;g.scale.set(1/k*0.95+0.05,k,1/k*0.95+0.05);});return g;};
CFX.points=(P,o)=>{const n=o.n,pos=new Float32Array(n*3);for(let i=0;i<n;i++){pos[i*3]=o.src?o.src[i%o.src.length]+rand(-0.6,0.6):rand(-CH,CH);pos[i*3+1]=rand(0,CELLAR_CEIL);pos[i*3+2]=rand(o.z0,o.z1);}
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pts=new THREE.Points(dg,new THREE.PointsMaterial({color:o.col,size:o.size,transparent:true,opacity:o.op,depthWrite:false,blending:o.add?THREE.AdditiveBlending:THREE.NormalBlending}));P.add(pts);
  cellarAnims.push((dt,t)=>{const a=dg.attributes.position;for(let i=0;i<a.count;i++){let y=a.getY(i)+dt*(o.v+(i%5)*0.15),x=a.getX(i)+Math.sin(t*2+i)*dt*0.2;
    if(y>CELLAR_CEIL){y=0;x=o.src?o.src[i%o.src.length]+rand(-0.6,0.6):rand(-CH,CH);}a.setX(i,x);a.setY(i,y);}a.needsUpdate=true;});return pts;};

(function buildCellar(){
  const C=cellarG;
  const iron=toon(0x4a4a54),ironD=toon(0x2a2a32),brass=toon(0xc8963a),copper=toon(0xb06a3a),brick=toon(0x6a3a2a),orange=0xff7a2e,teal=0x3fcfc0;
  const wood=toon(0x7a5434),woodD=toon(0x4a3220);
  // stanza: mattoni scuri, pavimento di lastre rivettate, travi di ferro
  mesh(new THREE.PlaneGeometry(CH*2+6,14),mat(0xffffff,{roughness:0.95,map:CFX.brick()}),0,4,-3.2,C,true);
  mesh(new THREE.BoxGeometry(CH*2+6,6,8),mat(0xffffff,{roughness:0.7,metalness:0.3,map:CFX.plate()}),0,-3,0.6,C,true);
  for(const s of [-1,1])mesh(new THREE.BoxGeometry(2,14,8),mat(0x1e1414,{roughness:1}),s*(CH+1),4,0.2,C,true);
  mesh(new THREE.BoxGeometry(CH*2+6,1,7),mat(0x140c0a,{roughness:1}),0,CELLAR_CEIL+0.7,-0.2,C,true);
  for(let x=-CH+0.5;x<=CH;x+=3.5)mesh(rbox(0.4,0.5,7,0.04),ironD,x,CELLAR_CEIL-0.05,-0.2,C,true);
  mesh(rbox(CH*2+2,0.5,0.3,0.04),ironD,0,CELLAR_CEIL-0.4,-2.9,C,true);
  // tubi di rame con flange e valvole rosse
  for(const [y,z,r] of [[4.9,-2.95,0.13],[5.3,-2.8,0.09]]){mesh(new THREE.CylinderGeometry(r,r,CH*2+2,12),copper,0,y,z,C).rotation.z=Math.PI/2;
    for(let x=-12;x<=12;x+=3)mesh(new THREE.CylinderGeometry(r*1.4,r*1.4,0.08,12),brass,x,y,z,C).rotation.z=Math.PI/2;}
  for(const x of [-9.85,-5.6,0.45,7.45]){mesh(rbox(0.45,CELLAR_CEIL,0.45,0.04),ironD,x,CELLAR_CEIL/2,-2.85,C);for(let y=0.6;y<CELLAR_CEIL;y+=1.2)for(const s of [-1,1])mesh(sph(0.04,6,4),brass,x+s*0.15,y,-2.6,C,true);}
  for(const x of [-9.85,0.45])CFX.spin(CFX.gear(C,x,4.9,-2.6,0.22,toon(0xc03a2a),6),2);
  // ingranaggi grandi a muro
  CFX.spin(CFX.gear(C,-3.0,4.4,-3.05,0.95,brass,16),0.35);CFX.spin(CFX.gear(C,-1.55,3.85,-3.08,0.55,copper,10),-0.6);CFX.spin(CFX.gear(C,8.4,4.6,-3.05,0.8,brass,14),-0.4);
  // canale di lava davanti, con bordi di ferro
  const lt=CFX.lava();mesh(new THREE.PlaneGeometry(CH*2+4,0.8),new THREE.MeshBasicMaterial({map:lt}),0,0.02,3.7,C,true).rotation.x=-Math.PI/2;
  cellarAnims.push(dt=>{lt.offset.x+=dt*0.03;});
  for(const z of [3.25,4.15])mesh(rbox(CH*2+4,0.16,0.12,0.03),ironD,0,0.08,z,C);
  mesh(new THREE.PlaneGeometry(CH*2+4,0.9),new THREE.MeshBasicMaterial({color:0xff6a1a,transparent:true,opacity:0.18,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}),0,0.3,3.7,C,true);
  for(const x of [-6,6])CFX.light(C,0xff6a1a,1.0,8,x,0.6,3.7,true);
  // scaffali e casse della bottega (il mercante è in 16-pvp-negozio-mercante.js)
  const MERCH_X=-4.0;   // bottega del mercante (scambiata col banco da lavoro)
  for(const y of [2.0,2.8])mesh(rbox(2.2,0.08,0.4,0.02),ironD,MERCH_X,y,-2.95,C);
  CLASSES.slice(0,4).forEach((c,i)=>{const w=buildWeaponMesh(c.weapon,0,null).g;w.scale.setScalar(0.55);w.position.set(MERCH_X-0.75+i*0.5,2.75,-2.85);w.rotation.y=Math.PI/2;C.add(w);});
  CFX.crate(C,MERCH_X+1.3,0,-2.4,0.8,wood,ironD);CFX.crate(C,MERCH_X+1.45,0.8,-2.45,0.5,wood,ironD);
  // banco da lavoro = impostazioni: ferro, morsa, progetti, attrezzi appesi
  const bx=-11.6;   // banco da lavoro (dove prima c'era il mercante)
  mesh(rbox(2.6,0.12,1.0,0.03),iron,bx,1.0,-1.7,C);for(const dx of [-1.15,1.15])mesh(rbox(0.12,1.0,0.9,0.02),ironD,bx+dx,0.5,-1.7,C);mesh(rbox(2.3,0.06,0.8,0.02),ironD,bx,0.3,-1.7,C);
  mesh(rbox(0.36,0.2,0.2,0.03),toon(0x5a6a8a),bx-0.85,1.16,-1.45,C);mesh(new THREE.CylinderGeometry(0.02,0.02,0.4,6),brass,bx-0.85,1.2,-1.3,C).rotation.z=Math.PI/2;
  const [cB,gB]=cv(64,48);gB.fillStyle='#2a4a8a';gB.fillRect(0,0,64,48);gB.strokeStyle='#cfe0ff';gB.lineWidth=1;gB.strokeRect(6,6,52,36);gB.beginPath();gB.arc(32,24,12,0,TAU);gB.stroke();gB.beginPath();gB.moveTo(6,24);gB.lineTo(58,24);gB.stroke();
  const bp=mesh(new THREE.PlaneGeometry(0.8,0.55),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cB)}),bx+0.1,1.07,-1.7,C,true);bp.rotation.x=-Math.PI/2;bp.rotation.z=0.15;
  CFX.gear(C,bx+0.85,1.12,-1.75,0.16,brass,8).rotation.x=-Math.PI/2;
  mesh(rbox(2.4,1.2,0.06,0.02),ironD,bx,2.8,-3.08,C);for(let i=0;i<7;i++)mesh(rbox(0.05,rand(0.4,0.8),0.04,0.01),toon(0xb8c0cc),bx-1.05+i*0.35,2.85,-3.02,C);
  mesh(new THREE.CylinderGeometry(0.12,0.12,0.2,12),mat(0xffd27a,{emissive:0xffa030,emissiveIntensity:1.4}),bx+0.9,2.2,-2.6,C,true);
  CFX.light(C,0xffb050,0.8,7,bx+0.6,2.0,-1.0);
  // piedistallo delle classi: piattaforma meccanica con ingranaggio che gira, rastrelliera alle spalle
  mesh(new THREE.CylinderGeometry(1.05,1.1,0.2,24),ironD,PED_X,0.1,PED_Z,C);mesh(new THREE.CylinderGeometry(0.9,0.95,0.32,24),iron,PED_X,0.36,PED_Z,C);
  CFX.spin(CFX.gear(C,PED_X,0.54,PED_Z,0.95,brass,20),0.4).rotation.x=-Math.PI/2;
  pedRunes=mesh(new THREE.TorusGeometry(0.5,0.05,8,40),new THREE.MeshBasicMaterial({color:teal,transparent:true,opacity:.5}),PED_X,0.62,PED_Z,C,true);pedRunes.rotation.x=Math.PI/2;
  for(const a of [0.7,2.4,3.9,5.5])mesh(new THREE.CylinderGeometry(0.07,0.07,0.6,8),toon(0xb8c0cc),PED_X+Math.cos(a)*1.0,0.3,PED_Z+Math.sin(a)*1.0,C);
  pedBeam=mesh(new THREE.CylinderGeometry(0.85,1.0,CELLAR_CEIL,32,1,true),new THREE.MeshBasicMaterial({color:teal,transparent:true,opacity:0.04,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}),PED_X,CELLAR_CEIL/2+0.5,PED_Z,C,true);
  CFX.light(C,0x7ff0e4,0.7,6,PED_X,3.4,PED_Z+0.8,true);
  const rx=PED_X;for(const s of [-1.3,1.3])mesh(rbox(0.16,2.6,0.16,0.05),ironD,rx+s,1.5,-2.85,C);
  for(const y of [0.7,2.65])mesh(rbox(2.8,0.12,0.18,0.05),ironD,rx,y,-2.85,C);
  CLASSES.slice(0,4).forEach((c,i)=>{const w=buildWeaponMesh(c.weapon,0,null).g;w.position.set(rx-0.9+i*0.6,2.6,-2.7);w.rotation.y=Math.PI/2;C.add(w);});
  // armadio dell'equipaggiamento: armadietto di ferro con le ante che si aprono
  const WX=5.5,wd=new THREE.Group();cellarWD=wd;wd.position.set(WX,0,-2.3);C.add(wd);
  const lk=toon(0x4a5a6a),lkD=toon(0x5a6a7a);
  mesh(rbox(1.8,3.0,0.8,0.04),lk,0,1.5,0,wd);mesh(rbox(1.9,0.14,0.9,0.03),ironD,0,3.05,0,wd);mesh(rbox(1.85,0.12,0.88,0.03),ironD,0,0.06,0,wd);
  for(const s of [-1,1]){const pv=new THREE.Group();pv.position.set(s*0.86,0,0.42);wd.add(pv);wdDoors.push({g:pv,s});
    mesh(rbox(0.84,2.7,0.05,0.02),lkD,-s*0.43,1.5,0,pv);for(let i=0;i<5;i++)mesh(rbox(0.5,0.04,0.02,0.01),ironD,-s*0.43,2.6-i*0.1,0.03,pv,true);
    mesh(rbox(0.06,0.4,0.06,0.02),brass,-s*0.74,1.5,0.05,pv);for(const y of [0.25,2.75])for(const dx of [-0.35,0.35])mesh(sph(0.03,6,4),brass,-s*0.43+dx,y,0.04,pv,true);}
  mesh(rbox(1.5,0.04,0.04,0.02),brass,0,2.45,0.1,wd);
  for(const [x,c] of [[-0.45,0x6a2a2a],[-0.12,0x2a3a5a],[0.2,0x3a4a2a],[0.5,0x5a4a6a]])mesh(rbox(0.26,0.9,0.12,0.04),mat(c),x,1.95,0.15,wd);
  mesh(rbox(1.5,2.4,0.04,0.02),mat(0x2a1a10,{emissive:0xffa64a,emissiveIntensity:0.12}),0,1.5,-0.3,wd,true);
  // tubo che sbuffa vapore, cassa vicino alla scala
  CFX.tube(C,[[6.9,0,-2.7],[6.9,2.5,-2.7],[7.1,3.4,-2.75],[7.45,3.9,-2.8]],0.1,copper);
  CFX.crate(C,7.85,0,-2.5,0.8,wood,ironD);
  // scala di grata con ringhiera verso la porta di ferro
  const sX0=8.9,sN=7,sW=0.52,sH=0.48,grate=toon(0x5a5a64);
  for(let i=0;i<sN;i++){const h=(i+1)*sH;mesh(rbox(sW+0.03,0.1,1.5,0.02),grate,sX0+sW*(i+0.5),h-0.05,-2.2,C);}
  for(const z of [-1.46,-2.94]){const sl=mesh(rbox(5.0,0.22,0.08,0.02),ironD,10.65,1.55,z,C);sl.rotation.z=Math.atan2(sN*sH,sN*sW);}
  mesh(rbox(4.9,0.06,0.06,0.02),brass,10.7,2.75,-1.42,C).rotation.z=Math.atan2(sN*sH,sN*sW);
  for(let i=0;i<5;i++){const x=9.2+i*0.75;mesh(new THREE.CylinderGeometry(0.025,0.025,1.0,6),ironD,x,(x-sX0)*0.923+0.5,-1.42,C);}
  const top=new THREE.Group();top.position.set(12.2,sN*sH,-2.9);C.add(top);
  mesh(rbox(1.5,2.4,0.15,0.04),toon(0x3a3a44),0,1.2,0,top);mesh(new THREE.CylinderGeometry(0.3,0.3,0.06,20),mat(0x1a0a04,{emissive:0xffa040,emissiveIntensity:1.0}),0,1.6,0.1,top,true).rotation.x=Math.PI/2;
  mesh(new THREE.TorusGeometry(0.3,0.05,8,20),brass,0,1.6,0.12,top);
  CFX.light(C,0xffa040,0.8,8,11.8,4.8,-1.6);
  // braci che salgono dal forno e dalla lava, vapore dal tubo
  CFX.points(C,{n:50,col:0xffa040,size:0.06,op:0.9,v:0.5,add:true,src:[-7.7,-7.9,-7.5,-3,3],z0:-2.2,z1:3.8});
  CFX.points(C,{n:24,col:0xdedede,size:0.16,op:0.18,v:0.5,src:[6.9],z0:-2.7,z1:-1.8});
  const mkRing=x=>{const r=mesh(new THREE.TorusGeometry(1.0,0.035,8,48),new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:0,depthWrite:false}),x,0.03,-0.2,C,true);r.rotation.x=Math.PI/2;r.scale.set(1,0.55,1);return r;};
  INTER.push({id:'bench',x:bx,y:2.4,name:'Banco da lavoro',sub:()=>'Volume, comandi e statistiche',ring:mkRing(bx),act:()=>openSettings('cellar')});
  INTER.push({id:'ped',x:PED_X,y:3.0,name:'Piedistallo delle classi',sub:()=>'Scegli con chi salire',ring:mkRing(PED_X),act:openSelect});
  INTER.push({id:'wardrobe',x:5.5,y:3.3,name:'Armadio',sub:()=>`${INV.items.length} oggetti · cambia l'equipaggiamento`,ring:mkRing(5.5),act:openWardrobe});
  INTER.push({id:'stairs',x:10.2,y:2.8,name:'Scala della torre',sub:()=>`Inizia la scalata come ${G.cls.name}`,ring:mkRing(10.2),act:()=>{G.state='menu';$('prompt').hidden=true;$('bUse').hidden=true;fadeThen(()=>{startRun();G.fadeTarget=0;});}});
})();

