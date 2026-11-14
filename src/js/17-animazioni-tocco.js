/* =========================================================
   ANIMAZIONI v2 — scheletro esteso (piedi) e locomozione
   (window.__ANIMV===1 torna alle animazioni vecchie, per confronto nel laboratorio)
   ========================================================= */
const AV2=()=>window.__ANIMV!==1;
// stato dell'animazione legato al modello (vale anche per gli eroi degli amici in co-op)
const anOf=R=>R.an||(R.an={cyc:0,blend:0,stopT:0,wasRun:0,ps:0,acc:0,face:null,turnT:0,turnFrom:0});

/* ---------- ciclo di corsa a pose chiave (una gamba; l'altra è sfasata di mezzo ciclo) ----------
   fasi: 0 contatto · .125 carico · .25 spinta · .375 volo · .5 tallone su · .625 ginocchio avanti · .75 ginocchio alto · .875 allungo */
const RUNK={hip:[-0.5,0.0,0.55,0.65,0.2,-0.7,-1.05,-0.8],knee:[0.2,0.7,0.2,1.0,1.95,1.85,1.05,0.4],foot:[0.15,-0.7,-0.25,-0.55,-0.5,-0.25,0.05,0.25]};
const RUN_LEN=2.76,RUN_ST=0.25,RUN_BUMP=0.07;
const crm=(a,b,c,d,t)=>0.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
function kSamp(arr,p){const N=arr.length;p=((p%1)+1)%1;const x=p*N,i=Math.floor(x),f=x-i;return crm(arr[(i+N-1)%N],arr[i],arr[(i+1)%N],arr[(i+2)%N],f);}
// distanza fra l'anca e il punto più basso del piede (per tenere il piede d'appoggio sul pavimento)
function legLow(h,k,f){const ay=-0.48*Math.cos(h)-0.43*Math.cos(h+k),w=h+k+f;return -Math.min(ay-0.05*Math.cos(w)+0.08*Math.sin(w),ay-0.05*Math.cos(w)-0.19*Math.sin(w));}
function runLegs(p){const L=q=>[kSamp(RUNK.hip,q),kSamp(RUNK.knee,q),kSamp(RUNK.foot,q)];const a=L(p),b=L(p+0.5);
  // altezza del bacino: in appoggio segue la gamba a terra, in volo sale un po' e riscende sul contatto
  const s=((p%0.5)+0.5)%0.5,st=s<RUN_ST,lowAt=q=>{const x=L(q),y=L(q+0.5);return (((q%1)+1)%1)<0.5?legLow(x[0],x[1],x[2]):legLow(y[0],y[1],y[2]);};
  let H;if(st)H=lowAt(p);else{const k=(s-RUN_ST)/(0.5-RUN_ST),p0=p-(s-RUN_ST),h0=lowAt(p0),h1=lowAt(p0+(0.5-RUN_ST));H=h0+(h1-h0)*k+RUN_BUMP*Math.sin(Math.PI*k);}
  return {a,b,H};}

function runPose2(t,speed,dt){const R=hero,an=anOf(R);
  const amp=Math.min(1,speed/6.5),len=RUN_LEN*(0.45+0.55*amp);an.cyc=(an.cyc+dt*speed/len)%1;an.blend=Math.min(1,an.blend+dt/0.12);an.wasRun=Math.max(an.wasRun,amp);
  const p=an.cyc,G2=runLegs(p),bl=(base,v)=>base+(v-base)*amp;
  t.hF=bl(-0.1,G2.a[0]);t.kF=bl(0.2,G2.a[1]);t.fF=bl(-0.1,G2.a[2]);t.hB=bl(0.08,G2.b[0]);t.kB=bl(0.16,G2.b[1]);t.fB=bl(-0.24,G2.b[2]);
  t.crouch=bl(0.02,0.95-G2.H);
  const ph=2*Math.PI*p-Math.PI,sw=Math.sin(ph);           // braccia opposte alle gambe
  runArms(t,ph,amp);
  const acc=clamp(an.acc/45,-0.35,0.35);
  t.lean=0.36*amp+acc+(P.skidT>0?-0.55:0)+Math.sin(4*Math.PI*p)*0.025*amp;
  t.twist=sw*0.22*amp;t.head=-0.16*amp+Math.abs(Math.cos(2*ph))*0.04*amp-acc*0.3;
  if(P.skidT>0){t.hF=-0.9;t.kF=0.7;t.hB=0.5;t.kB=0.4;t.crouch=0.16;t.fF=0.2;t.fB=-0.5;if(!an.skidPuff){an.skidPuff=true;puffAt(P.x,P.y,Math.sign(P.vx)||P.face,7,6);}}else an.skidPuff=false;
  t.snap=an.blend*(P.skidT>0?0:1);
  const stp=Math.floor(p*2);if(stp!==an.lastStep){an.lastStep=stp;if(speed>5&&R===hero)burst(P.x-P.face*0.25,P.y+0.05,0xb9ad98,2,1.4,0.5);}}

// dopo il ramo delle pose: frenata, accelerazione, piedi
function locoPost(t,run,speed,dt,special){const R=hero,an=anOf(R);airTrack(dt);landPost(t,dt,special);dashPost(t,dt,special);if(!an.idleMark){an.idleT=0;an.fid=null;an.nextFid=3.5;}an.idleMark=false;
  an.acc+=(((speed-an.ps)/Math.max(dt,1e-3))-an.acc)*Math.min(1,dt*10);an.ps=speed;
  if(!run){an.blend=0;if(an.wasRun>0.6&&speed<0.8&&P.onGround&&!special&&!P.atk){an.stopT=0.34;if(R===hero)puffAt(P.x+P.face*0.15,P.y,P.face,6,5.5);}an.wasRun=0;}
  if(an.stopT>0&&!run&&P.onGround&&!special&&!P.atk&&!P.dead){an.stopT-=dt;const k=Math.max(0,an.stopT/0.34),e=1-Math.pow(1-k,3);
    // frenata: un piede avanti, peso indietro, poi si raddrizza
    t.hF+=(-0.62-t.hF)*e;t.kF+=(0.32-t.kF)*e;t.hB+=(0.6-t.hB)*e;t.kB+=(0.72-t.kB)*e;t.crouch+=(0.17-t.crouch)*e;t.lean+=(-0.2-t.lean)*e;
    t.shB+=(-0.5-t.shB)*e*0.6;t.elB+=(-0.9-t.elB)*e*0.6;t.head+=0.08*e;}
  else if(run||!P.onGround)an.stopT=0;}

/* ---------- applyPose con i piedi ---------- */
const _apA=applyPose;
applyPose=function(R,t,k,ka){
  if(!AV2()||R!==hero)return _apA(R,t,k,ka);
  if(t.snap){k+=(1-k)*t.snap;ka+=(1-ka)*t.snap*0.5;}
  _apA(R,t,k,ka);
  const gr=P.onGround||P.dead,flat=(h,kn)=>clamp(-(h+kn),-0.9,0.9);
  const fF=t.fF!=null?t.fF:(gr?flat(t.hF,t.kF):0.35),fB=t.fB!=null?t.fB:(gr?flat(t.hB,t.kB):0.25);
  const j=(o,v)=>{o.rotation.x+=wrapA(v-o.rotation.x)*k;};
  if(R.legs[0].foot)j(R.legs[0].foot,fF);if(R.legs[1].foot)j(R.legs[1].foot,fB);
  R.head.rotation.y+=wrapA((t.headY||0)-R.head.rotation.y)*Math.min(1,k*0.6);};

/* ---------- girata: niente specchio istantaneo, l'eroe si gira passando di fronte ---------- */
const TURN_T=0.13;
const _uhvA=updHeroVisual;
updHeroVisual=function(dt){_uhvA(dt);if(!AV2()||!hero)return;const R=hero,an=anOf(R),m=R.model,st=G.state;
  if(an.face==null)an.face=P.face;
  if(P.face!==an.face){const ok=(st==='play'||st==='cellar')&&!P.dead&&!P.atk&&!P.dragon&&!(P.spinT>0)&&!(P.flipT>0);an.face=P.face;an.turnT=ok?TURN_T:0;}
  if(an.turnT>0){an.turnT-=dt;const k=1-Math.max(0,an.turnT)/TURN_T,e=k*k*(3-2*k),f=P.face;
    m.rotation.y=(-f*Math.PI/2)+(f*Math.PI)*e;if(k<0.5)m.scale.x=-Math.abs(m.scale.x)*f;}};
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{runLegs,legLow});

/* =========================================================
   POSA DA FERMO: in guardia quando ci sono nemici, rilassata quando la stanza è tranquilla,
   piccoli gesti dopo qualche secondo fermo
   ========================================================= */
// braccio dell'arma da tranquillo (direzione dell'arma = spalla+gomito+polso; 0 = giù, -π/2 = avanti, π = su)
const CALM_W={
  ascia:{sh:-0.9,el:-1.6,wr:-1.38},martello:{sh:-0.9,el:-1.6,wr:-1.38},        // appoggiata sulla spalla
  lancia:{sh:-0.35,el:-0.9,wr:-1.89},falce:{sh:-0.3,el:-0.85,wr:-1.99},         // piantata a terra, dritta
  spada:{sh:-0.45,el:-0.55,wr:1.0},katana:{sh:0.12,el:-0.35,wr:0.75},          // punta in giù / bassa di lato
  pugni:{sh:0.05,el:-0.35,wr:0},pugnali:{sh:0.08,el:-0.4,wr:0.45},
  arco:{sh:0.05,el:-0.2,wr:1.6},bastone:{sh:-0.3,el:-1.2,wr:0}};
const isCalm=()=>{if(window.__LABCALM!=null)return window.__LABCALM;if(G.scene==='cellar'||G.safe)return true;
  return G.scene==='tower'&&G.cleared&&!(G.boss&&!G.boss.dead)&&!(G.enemies||[]).some(e=>!e.dead);};
const FIDGETS=['guarda','spalle','arma'];
function idlePose2(t,dt){const R=hero,an=anOf(R),ty=G.weapon.type,tm=G.time;an.idleMark=true;an.idleT=(an.idleT||0)+dt;
  const calm=isCalm();an.calm=(an.calm==null?(calm?1:0):an.calm)+((calm?1:0)-(an.calm||0))*Math.min(1,dt*3);const c=an.calm,g=1-c;
  // respiro: lento da tranquillo, più corto in guardia
  const br=Math.sin(tm*(1.5+0.9*g)),sway=Math.sin(tm*0.55);
  // gambe: in guardia piede avanti e ginocchia piegate; da tranquillo peso su una gamba
  t.hF=-0.05*c+(-0.32)*g;t.kF=0.08*c+0.38*g;t.hB=0.12*c+0.34*g;t.kB=0.24*c+0.34*g;
  t.crouch=(0.012+br*0.008)*c+(0.075+br*0.014)*g;t.lean=-0.03*c+0.1*g+sway*0.012;
  t.head=br*0.025-0.04*g+Math.sin(tm*0.37)*0.04*c;t.twist=sway*0.05*c+0.12*g;
  // braccio dell'arma
  const cw=CALM_W[ty]||WREST[ty];if(cw){t.shF+=(cw.sh-t.shF)*c;t.elF+=(cw.el-t.elF)*c;t.wrF+=(cw.wr-t.wrF)*c;}
  t.wrF+=Math.sin(tm*1.7)*0.05*g;t.shF+=br*0.03;t.shB+=br*0.04;
  // gesti dopo un po' fermi (solo da tranquillo)
  if(c>0.9&&!an.fid&&an.idleT>(an.nextFid||3.5)){an.fid={k:FIDGETS[Math.floor(Math.random()*FIDGETS.length)],t:0};}
  if(an.fid){const F=an.fid;F.t+=dt;const d=F.k==='spalle'?1.5:F.k==='arma'?1.1:2.2,k=F.t/d,w=Math.sin(Math.min(1,k)*Math.PI);
    if(F.k==='guarda'){t.headY=Math.sin(k*Math.PI*2)*0.75*Math.min(1,w*2);t.head-=0.06*w;}
    else if(F.k==='spalle'){t.shB+=(-2.7-t.shB)*w;t.elB+=(-0.6-t.elB)*w;t.lean-=0.18*w;t.head+=0.2*w;t.crouch-=0.02*w;t.headY=0.15*w;}
    else{if(ty==='ascia'||ty==='martello'||ty==='lancia'||ty==='falce'){t.shF-=0.35*w;t.elF+=0.25*w;t.crouch+=0.03*w;}
      else{t.shF+=(-1.2-t.shF)*w;t.elF+=(-0.4-t.elF)*w;t.wrF+=TAU*easeInOutCubic(Math.min(1,k));t.headY=0.25*w;t.head+=0.12*w;}}
    if(F.t>=d){an.fid=null;an.nextFid=an.idleT+rand(4,7);}}
  if(!calm)an.fid=null;}

/* =========================================================
   SALTI: spinta, salita raccolta, sospensione in alto, discesa che prepara l'atterraggio,
   balzo in corsa, caduta lunga; tre atterraggi (leggero, normale, pesante)
   ========================================================= */
const mixT=(t,o,w)=>{if(w<=0)return;for(const k in o)t[k]=(t[k]==null?0:t[k])+(o[k]-(t[k]==null?0:t[k]))*w;};
function airPose2(t,dt){const R=hero,an=anOf(R),vy=P.vy,tm=G.time;
  const rise=clamp(vy/12,0,1),fall=clamp(-vy/14,0,1),apex=1-Math.max(rise,fall),lp=clamp((Math.abs(P.vx)-3)/4,0,1),st=1-lp;
  // salto da fermo
  const S0={hF:-1.0,kF:1.6,hB:-0.35,kB:1.05,fF:0.3,fB:0.35,lean:0.1,shB:-1.2,elB:-0.7,crouch:0.04,head:0.05};
  const A0={hF:-0.75,kF:1.25,hB:0.2,kB:0.85,fF:0.25,fB:0.3,lean:0.02,shB:-1.7,elB:-0.6,crouch:0.02,head:0};
  const F0={hF:-0.45,kF:0.45,hB:0.18,kB:0.55,fF:0.18,fB:0.25,lean:-0.06,shB:-1.95,elB:-0.4,crouch:0,head:-0.06};
  // balzo in corsa: ginocchio avanti, gamba dietro distesa
  const S1={hF:-1.15,kF:1.35,hB:0.75,kB:0.45,fF:0.25,fB:0.5,lean:0.28,shB:-1.1,elB:-0.85,crouch:0.02,head:-0.08};
  const A1={hF:-0.95,kF:1.1,hB:0.55,kB:0.75,fF:0.2,fB:0.4,lean:0.18,shB:-1.5,elB:-0.7,crouch:0.02,head:-0.04};
  const F1={hF:-0.65,kF:0.4,hB:0.35,kB:0.95,fF:0.15,fB:0.35,lean:0.06,shB:-1.8,elB:-0.5,crouch:0,head:-0.08};
  const pose={};for(const k in S0)pose[k]=st*(rise*S0[k]+apex*A0[k]+fall*F0[k])+lp*(rise*S1[k]+apex*A1[k]+fall*F1[k]);
  const keepB=G.cls.id==='cavaliere'&&!P.atk;if(keepB){delete pose.shB;delete pose.elB;}     // lo scudo resta davanti
  mixT(t,pose,1);
  // spinta: nei primi istanti gambe distese e punte giù
  if(an.jumpUp&&an.airT<0.11){const w=1-an.airT/0.11;mixT(t,{hF:0.12,kF:0.12,hB:0.3,kB:0.2,fF:0.7,fB:0.75,crouch:-0.03,lean:-0.04},w);if(!keepB)mixT(t,{shB:-2.5,elB:-0.2},w);}
  // caduta lunga: braccia che cercano l'equilibrio, gambe che pedalano
  const lf=clamp((-vy-18)/8,0,1);if(lf>0){mixT(t,{hF:-0.3+Math.sin(tm*13)*0.25,kF:0.6+Math.cos(tm*13)*0.25,hB:0.25-Math.sin(tm*13)*0.25,kB:0.7,lean:-0.1,head:-0.15},lf);if(!keepB)mixT(t,{shB:-2.6+Math.sin(tm*15)*0.35,elB:-0.5},lf);}
  // caduta dal bordo senza saltare: un attimo di sorpresa
  if(!an.jumpUp&&an.airT<0.25){const w=1-an.airT/0.25;mixT(t,{lean:-0.15,head:-0.1,crouch:0.02},w);if(!keepB)mixT(t,{shB:-1.4,elB:-0.3},w);}}
function airTrack(dt){const R=hero,an=anOf(R);
  if(!P.onGround){if(!an.inAir){an.inAir=true;an.airT=0;an.jumpUp=P.vy>8;}else an.airT+=dt;an.airVy=P.vy;}
  else if(an.inAir){an.inAir=false;if(!P.dead){const v=-(an.airVy||0);
      if(v>4){const K=v>20?1:v>12?0.62:0.32;an.landK=K;an.landT=an.landD=K>=1?0.34:K>0.5?0.18:0.1;}}}}
function landPost(t,dt,special){const R=hero,an=anOf(R);if(!(an.landT>0)||special||P.dead||!P.onGround){if(!P.onGround)an.landT=0;return;}
  an.landT-=dt;const k=Math.max(0,an.landT/an.landD),e=k<0.7?k/0.7:1,K=an.landK,w=e*Math.min(1,K*1.35);
  // atterraggio: ginocchia giù, busto avanti, poi risale
  mixT(t,{crouch:0.4*K,hF:-0.85*K,kF:1.6*K,hB:-0.45*K,kB:1.5*K,lean:0.36*K,head:-0.14*K},w);t.fF=-(t.hF+t.kF);t.fB=-(t.hB+t.kB);
  if(K>=1&&!(G.cls.id==='cavaliere'))mixT(t,{shB:-0.9,elB:-0.15},w);}

/* =========================================================
   SCATTO: spinta bassa, scivolata, frenata; in aria quasi orizzontale
   ========================================================= */
const DASH_T=0.17;
function dashPose2(t,dt){const R=hero,an=anOf(R),k=clamp(1-P.dashT/DASH_T,0,1),air=!P.onGround,cav=G.cls.id==='cavaliere';
  if(!an.dashing){an.dashing=true;an.dashAir=air;if(!air&&R===hero){burst(P.x-P.face*0.4,P.y+0.08,0xb9ad98,8,4,0.9);}}
  if(an.dashAir){mixT(t,{lean:0.95,hF:0.25,kF:0.55,hB:0.75,kB:0.35,fF:0.6,fB:0.7,crouch:0.05,head:-0.45},1);if(!cav)mixT(t,{shB:1.3,elB:-0.15},1);}
  else{const s=k<0.3?k/0.3:1;   // partenza: carica bassa con la gamba dietro che spinge, poi scivolata
    mixT(t,{lean:0.75-0.15*s,hF:-0.85+0.15*s,kF:1.05,hB:0.95,kB:0.25+0.25*s,fF:-(-0.85+1.05),fB:0.75,crouch:0.2-0.04*s,head:-0.35},1);if(!cav)mixT(t,{shB:1.25,elB:-0.15},1);}
  t.snap=0.7;}
function dashPost(t,dt,special){const R=hero,an=anOf(R);
  if(an.dashing&&!(P.dashT>0)){an.dashing=false;if(!an.dashAir&&P.onGround){an.dashRec=0.16;puffAt(P.x+P.face*0.2,P.y,P.face,5,6);}}
  if(an.dashRec>0&&!(P.dashT>0)&&!special&&P.onGround&&!P.atk){an.dashRec-=dt;const w=Math.max(0,an.dashRec/0.16);
    // frenata dopo lo scatto: piede avanti che frena, busto che torna su
    mixT(t,{lean:0.2,hF:-0.7,kF:0.35,hB:0.55,kB:0.75,crouch:0.14,head:-0.1},w);t.fF=-(t.hF+t.kF);}}

/* =========================================================
   ARMI CHE NON ENTRANO NEL PAVIMENTO: se la punta (o il fondo dell'asta) scende sotto il suolo,
   il polso ruota quel tanto che basta perché tocchi il pavimento; negli attacchi fa scintille
   ========================================================= */
const _wv=new THREE.Vector3(),_wv2=new THREE.Vector3();
function floorUnder(x){return G.scene==='tower'||G.scene==='cellar'?groundAt(x,P.y+0.15):-99;}
function weaponFloor(R,an){const arm=R.arms&&R.arms[0];if(!arm||!R.wpnF||P.dead)return;
  const pts=[R.tipF,R.wpnF.userData&&R.wpnF.userData.butt].filter(Boolean);if(!pts.length)return;
  R.root.updateMatrixWorld(true);let corr=0,hit=null;
  for(let it=0;it<4;it++){let worst=null,pen=0;
    for(const o of pts){o.getWorldPosition(_wv);const fl=floorUnder(_wv.x);const pe=fl+0.04-_wv.y;if(pe>pen){pen=pe;worst=o;}}
    if(!worst)break;if(it===0){worst.getWorldPosition(_wv);hit={x:_wv.x,y:floorUnder(_wv.x),pen};}
    worst.getWorldPosition(_wv);arm.wr.rotation.x+=0.05;arm.wr.updateMatrixWorld(true);worst.getWorldPosition(_wv2);arm.wr.rotation.x-=0.05;
    const d=(_wv2.y-_wv.y)/0.05;if(Math.abs(d)<0.08)break;const step=clamp(pen/d,-0.45,0.45);arm.wr.rotation.x+=step;corr+=step;arm.wr.updateMatrixWorld(true);
    if(Math.abs(corr)>1.4)break;}
  an.wc=corr;
  // colpo che sbatte a terra: scintille e polvere una volta per attacco
  if(hit&&hit.pen>0.06&&P.atk&&an.floorHitAtk!==P.atk&&P.atk.t>=P.atk.wind){an.floorHitAtk=P.atk;burst(hit.x,hit.y+0.05,0xffe2b0,7,4,1.5,0.3);burst(hit.x,hit.y+0.05,0xb9ad98,6,2.5,0.8);}}
const _uhvW=updHeroVisual;
updHeroVisual=function(dt){const R=hero;if(R&&R.an&&R.an.wc&&R.arms){R.arms[0].wr.rotation.x-=R.an.wc;R.an.wc=0;}
  _uhvW(dt);if(AV2()&&hero&&G.state!=='cine'){spinModel(hero);twoHands(hero,anOf(hero),dt);weaponFloor(hero,anOf(hero));deathRoot(hero,anOf(hero),dt);}};

/* =========================================================
   POLVERE DELLA FRENATA: sbuffi che partono dai piedi e scivolano in avanti
   ========================================================= */
const PUFF_GEO=new THREE.IcosahedronGeometry(0.16,0);PUFF_GEO.userData.keep=true;const PUFFS=[];
function puffAt(x,y,dir,n,spd){for(let i=0;i<n;i++){let p=PUFFS.find(q=>!q.on);
    if(!p){if(PUFFS.length>40)return;const m=new THREE.Mesh(PUFF_GEO,new THREE.MeshBasicMaterial({color:0xe8dcc0,transparent:true,depthWrite:false}));scene.add(m);p={m,on:false};PUFFS.push(p);}
    p.on=true;p.t=0;p.life=rand(0.32,0.5);p.vx=dir*(spd||5)*rand(0.55,1.1);p.vy=rand(0.3,1.3);p.vz=rand(-0.6,0.9);p.s=rand(0.6,1.1);
    p.m.position.set(x+dir*rand(-0.1,0.25),y+rand(0.02,0.12),rand(-0.15,0.25));p.m.rotation.set(rand(0,3),rand(0,3),0);p.m.visible=true;}}
function updPuffs(dt){for(const p of PUFFS){if(!p.on)continue;p.t+=dt;const k=p.t/p.life;if(k>=1){p.on=false;p.m.visible=false;continue;}
  p.vx*=Math.pow(0.04,dt);p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;p.vy*=Math.pow(0.3,dt);
  p.m.scale.setScalar(p.s*(0.5+k*1.6));p.m.material.opacity=0.75*(1-k)*(1-k);}}
const _upPf=updParticles;updParticles=function(dt){_upPf(dt);updPuffs(dt);};

/* =========================================================
   5a · COMBATTIMENTO A CORPO INTERO
   carica col peso indietro, passo avanti nel colpo, braccio libero che bilancia,
   armi a due mani impugnate con entrambe le mani
   ========================================================= */
const TWO_H={ascia:1,martello:1,falce:1,lancia:1,katana:1};
const ATK_AMP={heavy:1.25,swing:1,thrust:1.1,lunge:1.2,stab:0.6,cast:0.55,shoot:0.45,sweep:1,upper:1,spin:0.8,plunge:0.8,uair:0.8};
function atkBody2(t,A,ap,dt){const R=hero,ty=G.weapon.type,ground=P.onGround&&['nl','sl','dl','ul'].includes(A.mv),an0=A.anim.indexOf('c_')===0?(A.mv==='nl'&&ANIM[A.anim].kind!==ANIM[WTYPES[ty].anim].kind&&['swing','heavy'].includes(WTYPES[ty].anim)?'thrust':WTYPES[ty].anim):A.anim;
  const w=A.wind,ac=A.act,rc=A.rec,tt=A.t;let ph,k;
  if(tt<w){ph=0;k=easeOutCubic(clamp(tt/w,0,1));}else if(tt<w+ac){ph=1;k=(tt-w)/ac;}else{ph=2;k=Math.min(1,(tt-w-ac)/Math.max(rc,1e-3));}
  const amp=(ATK_AMP[an0]||1)*(A.fin?1.25:1),wgt=ph===0?k:ph===1?1:1-easeInOutCubic(k),s=ph===0?0:ph===1?easeOutQuart(k):1;
  if(ground){let WI,ST;
    if(A.mv==='ul'){WI={hF:-0.6,kF:1.1,hB:0.1,kB:1.0,crouch:0.22,head:-0.05};ST={hF:-0.2,kF:0.2,hB:0.4,kB:0.3,fF:0.45,fB:0.6,crouch:-0.03,head:0.28};}
    else if(A.mv==='dl'){WI={hF:-0.3,kF:0.7,hB:0.3,kB:0.8,crouch:0.18,head:-0.1};ST={hF:-0.95,kF:1.05,hB:0.85,kB:0.35,fB:0.5,crouch:0.3,head:-0.22};}
    else if(an0==='shoot'||an0==='cast'){WI={hF:-0.35,kF:0.4,hB:0.35,kB:0.35,crouch:0.08,head:0};ST={hF:-0.45,kF:0.35,hB:0.45,kB:0.25,crouch:0.07,head:0};}
    else{WI={hF:-0.15,kF:0.38,hB:0.25,kB:0.6,crouch:0.1,head:0.05};ST={hF:-0.85*Math.min(amp,1.15),kF:0.55,hB:0.75*Math.min(amp,1.15),kB:0.12,fB:0.55,crouch:0.15*Math.min(amp,1.15),head:-0.08};}
    const tg={};for(const key in ST){const a=WI[key]!=null?WI[key]:(t[key]||0),b=ST[key];tg[key]=a+(b-a)*s;}
    mixT(t,tg,Math.min(1,wgt*Math.min(1,amp)));t.fF=t.fF!=null&&ST.fF!=null?t.fF:-(t.hF+t.kF);
    t.twist=(t.twist||0)*(0.8+0.4*Math.min(amp,1.3));}
  // braccio libero: in avanti nella carica, indietro nel colpo (lo scudo resta davanti)
  if(A.hand!=='B'&&ty!=='pugnali'&&ty!=='pugni'&&!(TWO_H[ty]&&!R.shield)){let BA;
    if(R.shield){BA=ph===0?{shB:-0.95,elB:-1.25}:{shB:-0.35,elB:-1.5};}
    else if(an0==='shoot'){BA={shB:-1.5,elB:ph===2?-1.2:-2.3};}
    else if(an0==='cast'){BA=ph===0?{shB:-0.6,elB:-1.4}:{shB:-1.35,elB:-0.35};}
    else BA=ph===0?{shB:-0.95,elB:-0.6}:{shB:0.65,elB:-0.35};
    mixT(t,BA,Math.min(1,wgt));}
  if(!P.onGround)airAtkBody(t,A);}
// armi a due mani: la mano libera raggiunge l'impugnatura (in attacco e in guardia)
function twoHands(R,an,dt){const ty=G.weapon.type;if(!TWO_H[ty]||R.shield||!R.arms||P.dead){an.th=0;return;}
  const A=P.atk,guard=!A&&P.onGround&&Math.abs(P.vx)<0.6&&(an.calm||0)<0.5&&!(P.dashT>0);
  const want=(A&&A.hand!=='B')||guard?1:0;an.th=(an.th||0)+(want-(an.th||0))*Math.min(1,dt*(want?22:10));if(an.th<0.01)return;
  const a=R.arms[0],b=R.arms[1],w=an.th;
  b.sh.rotation.x+=wrapA(a.sh.rotation.x+0.06-b.sh.rotation.x)*w;b.el.rotation.x+=wrapA(a.el.rotation.x-0.1-b.el.rotation.x)*w;b.wr.rotation.x+=wrapA(a.wr.rotation.x-b.wr.rotation.x)*w;}

/* =========================================================
   5b · COMBO DI 3 COLPI DIVERSI PER OGNI ARMA (solo grafica: tempi, spinte e colpi restano quelli dell'arma)
   archi: angolo del braccio (0 giù · π/2 dietro · π su · 3π/2 avanti) · rev = colpo di rovescio
   ========================================================= */
const COMBOS={
  spada:  [{kind:'arc',from:2.3,to:5.3},{kind:'arc',from:5.2,to:2.55,rev:1},{kind:'line',w:{sh:-1.15,el:-1.65},a:{sh:-1.57,el:0},push:0.55,len:2.1}],
  katana: [{kind:'arc',from:0.55,to:-2.3,rev:1},{kind:'arc',from:3.55,to:5.65},{kind:'arc',from:2.25,to:2.25+TAU}],
  ascia:  [{kind:'arc',from:1.5,to:5.5},{kind:'arc',from:5.6,to:3.0,rev:1},{kind:'arc',from:2.85,to:6.05,leanK:1.3}],
  martello:[{kind:'arc',from:1.2,to:4.7},{kind:'arc',from:4.9,to:2.0,rev:1},{kind:'arc',from:3.0,to:6.1,leanK:1.3}],
  falce:  [{kind:'arc',from:2.0,to:5.6},{kind:'arc',from:5.4,to:1.8,rev:1},{kind:'arc',from:2.25,to:2.25+TAU}],
  lancia: [{kind:'line',w:{sh:-1.2,el:-1.4},a:{sh:-1.57,el:0},push:0.45,len:1.8},{kind:'line',w:{sh:-1.85,el:-1.2},a:{sh:-2.05,el:0},push:0.4,len:1.7},{kind:'arc',from:1.8,to:5.0}],
  pugni:  [{kind:'line',w:{sh:0.2,el:-1.5},a:{sh:-1.45,el:-0.05},push:0,len:1.0},{kind:'line',w:{sh:0.2,el:-1.5},a:{sh:-1.5,el:-0.05},push:0,len:1.0},{kind:'arc',from:0.35,to:-2.55,rev:1}],
  pugnali:[{kind:'line',w:{sh:0.2,el:-1.5},a:{sh:-1.45,el:-0.05},push:0,len:1.0},{kind:'line',w:{sh:0.1,el:-1.6},a:{sh:-1.35,el:-0.1},push:0,len:1.0},{kind:'arc',from:2.4,to:5.4}],
  arco:   [{},{kind:'line',w:{sh:-1.3,el:-0.1},a:{sh:-1.45,el:0},push:0,len:0.4},{kind:'line',w:{sh:-1.75,el:-0.2},a:{sh:-1.65,el:0},push:0,len:0.5,cr:0.32}],
  bastone:[{},{kind:'line',w:{sh:-0.6,el:-1.6},a:{sh:-1.57,el:0},push:0.15,len:0.5},{kind:'arc',from:3.0,to:4.85,leanK:-0.5}]};
for(const ty in COMBOS){const base=ANIM[WTYPES[ty].anim];COMBOS[ty].forEach((sp,i)=>{const key='c_'+ty+'_'+i;
  const a=Object.assign({},base,sp);for(const k of ['wind','act','rec','lunge','sfx','alt','hold','vert'])if(base[k]!==undefined)a[k]=base[k];if(sp.kind==='arc'){delete a.flip;}ANIM[key]=a;});}
const _saC=startAttack;
startAttack=function(visualOnly,forceMove){_saC.apply(this,arguments);const A=P.atk;if(!AV2()||!A||A.mv!=='nl'||!hero)return;
  const ty=G.weapon.type,list=COMBOS[ty];if(!list)return;const i=((P.combo||0)%3+3)%3,key='c_'+ty+'_'+i;if(!ANIM[key])return;
  const An=ANIM[key];A.anim=key;A.rev=!!An.rev;
  if(An.kind==='arc'){A.from=near(An.from,A.r0.sh);A.to=A.from+(An.to-An.from);A.restSh=near(A.rest.sh,A.to);}
  else{A.wSh=near(An.w.sh,A.r0.sh);A.aSh=A.wSh+(An.a.sh-An.w.sh);A.restSh=near(A.rest.sh,A.aSh);}};
const _apkC=atkPose;atkPose=function(A){const r=_apkC(A);if(A.rev)r.tw=-r.tw;return r;};

/* =========================================================
   5c · SCIA DELL'ARMA A NASTRO (segue davvero la lama: archi, affondi, giri, salti)
   con fasce di trasparenza a gradini e bordo luminoso davanti, in stile pixel
   ========================================================= */
const RIB_N=16,RIB_LIFE=0.13;
const ribMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
  uniforms:{uColor:{value:new THREE.Color(0xffe2b0)},uOp:{value:1}},
  vertexShader:'attribute float aAge;attribute float aSide;varying float vA;varying float vS;void main(){vA=aAge;vS=aSide;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform vec3 uColor;uniform float uOp;varying float vA;varying float vS;void main(){float k=1.0-clamp(vA,0.0,1.0);if(k<=0.0)discard;'+
    'float a=k*k*(0.35+0.65*vS);a=floor(a*4.0+0.35)/4.0;if(a<=0.0)discard;vec3 c=mix(uColor,vec3(1.0),smoothstep(0.75,1.0,k)*0.8+smoothstep(0.85,1.0,vS)*0.3);'+
    'gl_FragColor=vec4(c,a*uOp);}'});
ribMat.userData.keep=true;
function ribOf(R){const an=anOf(R);if(an.rib)return an.rib;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(RIB_N*2*3),3));g.setAttribute('aAge',new THREE.BufferAttribute(new Float32Array(RIB_N*2),1));
  const side=new Float32Array(RIB_N*2);for(let i=0;i<RIB_N;i++){side[i*2]=0;side[i*2+1]=1;}g.setAttribute('aSide',new THREE.BufferAttribute(side,1));
  const idx=[];for(let i=0;i<RIB_N-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}g.setIndex(idx);g.userData.keep=true;
  const m=new THREE.Mesh(g,ribMat.clone());m.frustumCulled=false;m.renderOrder=3;scene.add(m);return an.rib={m,s:[],atk:null};}
const _rb1=new THREE.Vector3(),_rb2=new THREE.Vector3();
function ribbonUpd(R){const A=P.atk,rib=ribOf(R),an=anOf(R),now=G.time;
  if(A&&A!==rib.atk){rib.atk=A;rib.s.length=0;const w=G.weapon;rib.m.material.uniforms.uColor.value.setHex(w.effect&&EFFECTS[w.effect]?EFFECTS[w.effect].color:(w.rarity?RARITY[w.rarity].hex:0xffe2b0));}
  const live=A&&A.t>=A.wind*0.85&&A.t<=A.wind+A.act+A.rec*0.45&&G.state!=='select';
  if(live){const tip=A.hand==='B'?R.tipB:R.tipF,wp=A.hand==='B'?R.wpnB:R.wpnF;
    if(tip&&wp){const T=WTYPES[G.weapon.type],f=T&&T.blade&&T.blade[1]>0?clamp(T.blade[0]/T.blade[1],0,0.85):0.2;
      tip.getWorldPosition(_rb2);wp.getWorldPosition(_rb1);_rb1.lerp(_rb2,f);
      const last=rib.s[rib.s.length-1];if(!last||last.t!==now)rib.s.push({b:_rb1.clone(),p:_rb2.clone(),t:now});if(rib.s.length>RIB_N)rib.s.shift();}}
  while(rib.s.length&&now-rib.s[0].t>RIB_LIFE)rib.s.shift();
  const n=rib.s.length;rib.m.visible=n>=2;if(n<2)return;
  const pos=rib.m.geometry.attributes.position,age=rib.m.geometry.attributes.aAge;
  for(let i=0;i<RIB_N;i++){const s=rib.s[Math.max(0,n-1-i)],z=0.12;
    pos.setXYZ(i*2,s.b.x,s.b.y,s.b.z+z);pos.setXYZ(i*2+1,s.p.x,s.p.y,s.p.z+z);const a=i>=n?1:(now-s.t)/RIB_LIFE;age.setX(i*2,a);age.setX(i*2+1,a);}
  pos.needsUpdate=true;age.needsUpdate=true;}
const _utC=updTrail;
updTrail=function(dt){if(!AV2())return _utC(dt);trailMat.uniforms.uOpacity.value=0;streakMat.uniforms.uOpacity.value=0;if(hero)ribbonUpd(hero);};

/* ---------- mosse in aria: corpo e giro del Vortice ---------- */
function airAtkBody(t,A){const w=A.t<A.wind?A.t/A.wind:A.t<A.wind+A.act?1:Math.max(0,1-(A.t-A.wind-A.act)/A.rec);let P2=null;
  if(A.mv==='na')P2={hF:-1.0,kF:1.6,hB:-0.55,kB:1.4,lean:0.12,crouch:0.06,head:0};
  else if(A.mv==='sa')P2={hF:-0.75,kF:1.05,hB:0.55,kB:0.6,lean:0.35,head:-0.1};
  else if(A.mv==='ua')P2={hF:-0.2,kF:0.35,hB:0.5,kB:0.85,lean:-0.38,head:0.38,fF:0.6,fB:0.6};
  else if(A.mv==='da')P2={hF:-1.1,kF:1.7,hB:-0.9,kB:1.5,lean:0.55,head:-0.4,fF:0.5,fB:0.5};
  if(P2)mixT(t,P2,w);}
function spinModel(R){const A=P.atk;if(!A||A.mv!=='na'||A.t<A.wind||A.t>A.wind+A.act)return;const k=(A.t-A.wind)/A.act;R.model.rotation.y+=TAU*easeInOutCubic(k);}

/* =========================================================
   5d · REAZIONI: colpo da davanti o da dietro, congelato, veleno/fuoco, morte
   ========================================================= */
const _hpR=hurtPlayer;
hurtPlayer=function(dmg,fromX,eff){const hp0=P.hp;const r=_hpR.apply(this,arguments);
  if(P.hp<hp0){P.hitBack=Math.sign(P.x-fromX)===P.face;P.hitStr=clamp(0.6+(hp0-P.hp)/Math.max(1,S.maxHp)*4,0.6,1.35);}return r;};
function reactPose(t,dt){const R=hero,an=anOf(R),tm=G.time;
  if(P.hurtT>0&&!P.dead){const k=clamp(P.hurtT/0.25,0,1),e=k*k*(3-2*k),s=P.hitStr||0.8;
    if(P.hitBack)mixT(t,{lean:0.55*s,head:-0.3*s,hF:-0.5,kF:0.7,hB:0.55,kB:0.35,shB:0.9},e);   // spinto in avanti
    else mixT(t,{lean:-0.55*s,head:0.38*s,hF:-0.35,kF:0.55,hB:0.15,kB:0.8,shB:-1.7,elB:-0.4},e); // spinto indietro
    if(!R.shield)t.twist=(t.twist||0)+(P.hitBack?0.25:-0.25)*e;}
  // congelato: rannicchiato che trema
  if(P.slowT>0&&!P.dead&&!P.atk){const w=Math.min(1,P.slowT/0.4);mixT(t,{crouch:0.07,head:-0.12,lean:0.08},w);if(!R.shield)mixT(t,{shB:-0.55,elB:-2.0},w);
    t.twist=(t.twist||0)+Math.sin(tm*55)*0.035*w;t.head+=Math.sin(tm*47)*0.03*w;}
  // veleno o fuoco: un po' curvo, sobbalza a ogni danno
  if(P.dot&&!P.dead){const acc=P.dot.acc||0,fl=acc<0.12?1-acc/0.12:0;mixT(t,{lean:0.12+0.25*fl,head:-0.1-0.2*fl,crouch:0.04+0.06*fl},1);}}
// morte: contraccolpo, ginocchia che cedono, caduta in avanti o all'indietro, l'arma che scivola via
function deathPose(t,dt){const R=hero,an=anOf(R);if(an.deathT==null){an.deathT=0;an.deathBack=!P.hitBack;}else an.deathT+=dt;const d=an.deathT;
  if(d<0.18){const k=d/0.18;mixT(t,an.deathBack?{lean:-0.5,head:0.4,kF:0.5,kB:0.6,crouch:0.08}:{lean:0.5,head:-0.35,kF:0.6,kB:0.4,crouch:0.08},1);if(!R.shield)mixT(t,{shB:an.deathBack?-1.8:0.8,elB:-0.3},1);}
  else if(d<0.5){const k=easeInOutCubic((d-0.18)/0.32);mixT(t,{hF:-0.05,kF:1.75,hB:0.05,kB:1.9,fF:0.9,fB:0.9,crouch:0.46,lean:0.3,head:-0.35,shF:0.15,elF:-0.25,shB:0.1,elB:-0.2},k);}
  else{const k=Math.min(1,(d-0.5)/0.4);mixT(t,{hF:-0.15,kF:1.75-1.1*k,hB:0.05,kB:1.9-1.0*k,fF:0.5,fB:0.5,crouch:0.46*(1-k),lean:0.3*(1-k),head:-0.35+0.2*k,shF:0.15-1.4*k*(an.deathBack?1:0),elF:-0.25,shB:0.1-1.6*k*(an.deathBack?1:0),elB:-0.3},1);}
  t.snap=0.5;}
const _zAx=new THREE.Vector3(0,0,1);
function deathRoot(R,an,dt){
  if(!P.dead){if(an.deathT!=null){an.deathT=null;R.root.rotation.z=0;}if(an.drop)weaponBack(R,an);return;}
  const d=an.deathT||0,k=d<0.5?0:Math.min(1,(d-0.5)/0.4),e=k*k,bounce=k>=1?Math.max(0,Math.sin(Math.min(1,(d-0.9)/0.18)*Math.PI))*0.06:0;
  const ang=(an.deathBack?1:-1)*P.face*(Math.PI/2)*(e-bounce);R.root.rotation.z=ang;R.root.position.y=P.y+0.22*Math.abs(ang)/(Math.PI/2);
  if(R.local&&d>0.16&&!an.drop&&R.wpnF&&R.wpnF.parent){const w=R.wpnF,par=w.parent;an.drop={w,par,p:w.position.clone(),q:w.quaternion.clone(),s:w.scale.clone(),vx:-P.face*(an.deathBack?1:-1)*rand(1.2,2.2),vy:rand(3,4.5),spin:rand(-7,7),b:0};
    scene.attach(w);an.drop.qf=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,rand(-0.4,0.4),Math.sign(an.drop.vx||1)*Math.PI/2));}
  if(an.drop){const D=an.drop,w=D.w;D.vy-=30*dt;w.position.x+=D.vx*dt;w.position.y+=D.vy*dt;if(D.b<1)w.rotateOnWorldAxis(_zAx,D.spin*dt);else w.quaternion.slerp(D.qf,Math.min(1,dt*9));
    const fl=groundAt(w.position.x,P.y+0.5)+0.06;if(w.position.y<fl){w.position.y=fl;if(D.b<2){D.vy=-D.vy*0.3;D.vx*=0.5;D.spin*=0.4;D.b++;if(D.b===1)burst(w.position.x,fl,0xb9ad98,5,2,0.6);}else{D.vy=0;D.vx*=0.8;D.spin=0;}}
}}
function weaponBack(R,an){const D=an.drop;an.drop=null;if(!D)return;if(D.par&&D.w){D.par.add(D.w);D.w.position.copy(D.p);D.w.quaternion.copy(D.q);D.w.scale.copy(D.s);}}
const _shD=setHero;
setHero=function(cls){const old=hero;if(old&&old.an&&old.an.drop){const D=old.an.drop;scene.remove(D.w);disposeObj(D.w);old.an.drop=null;}const r=_shD.apply(this,arguments);if(hero)hero.local=true;return r;};
if(hero)hero.local=true;

/* =========================================================
   RINASCITA CON LA PIETRA: l'eroe cade, un fascio di luce scende dal cielo,
   il corpo si solleva fluttuando dentro la luce e torna in piedi
   ========================================================= */
const REB={fall:0.95,beam:1.25,rise:2.35,land:2.75};
const rebM=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
let rebFx=null;
function startRebirth(){P.dead=true;P.atk=null;P.vx=0;P.dot=null;P.slowT=0;P.rebirth={t:0,burst:0};G.overT=99;P.invul=99;sfx('hurt');shake(0.3);}
function rebirthFx(on){if(on&&!rebFx){const g=new THREE.Group();scene.add(g);
    const outer=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.25,16,24,1,true),rebM(0xffe08a,0));outer.position.y=8;g.add(outer);
    const core=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.5,16,16,1,true),rebM(0xfff8e0,0));core.position.y=8;g.add(core);
    const halo=new THREE.Mesh(new THREE.CircleGeometry(1.0,32),rebM(0xffe9a8,0));halo.position.z=-0.3;g.add(halo);
    const ring=new THREE.Mesh(new THREE.RingGeometry(0.9,1.25,40),rebM(0xffd76a,0));ring.rotation.x=-Math.PI/2;ring.position.y=0.04;g.add(ring);
    const lt=new THREE.PointLight(0xffe2a0,0,9);lt.position.y=1.6;g.add(lt);rebFx={g,outer,core,halo,ring,lt};}
  if(!on&&rebFx){scene.remove(rebFx.g);rebFx.g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});rebFx=null;}}
function rebirthUpdate(dt){const R=P.rebirth;if(!R)return;R.t+=dt;const t=R.t;G.overT=99;
  if(t>=REB.fall*0.8)rebirthFx(true);
  if(rebFx){const fx=rebFx,a=clamp((t-REB.fall*0.8)/0.35,0,1)*(t>REB.land?Math.max(0,1-(t-REB.land)/0.45):1);
    fx.g.position.set(P.x,P.y,0);fx.outer.material.opacity=0.32*a*(0.85+0.15*Math.sin(t*9));fx.core.material.opacity=0.6*a;
    fx.outer.rotation.y+=dt*1.5;fx.ring.material.opacity=0.6*a;fx.ring.scale.setScalar(1+0.15*Math.sin(t*6));fx.lt.intensity=2.6*a;
    const hk=clamp((t-REB.beam)/(REB.rise-REB.beam),0,1);fx.halo.position.y=0.9+1.1*easeInOutCubic(hk);fx.halo.material.opacity=0.35*a*hk;
    R.burst-=dt;if(R.burst<=0&&a>0.3){R.burst=0.07;burst(P.x+rand(-0.7,0.7),P.y+rand(0,0.4),Math.random()<0.5?0xffe2a0:0xfff8e0,2,1.5,4,-0.4);}}
  if(t>=REB.beam&&!R.wb){R.wb=true;const an=anOf(hero);if(an.drop){const w=an.drop.w;burst(w.position.x,w.position.y+0.2,0xffe2a0,12,3,3);weaponBack(hero,an);}}
  if(t>=REB.rise&&!R.flash){R.flash=true;burst(P.x,P.y+1.2,0xfff8e0,40,8,5,0.2);burst(P.x,P.y+0.2,0xffd76a,24,6,1.5);shake(0.35);sfx('ability');
    P.dead=false;P.hp=Math.round(S.maxHp*0.5);P.stam=S.stamMax;P.invul=2.5;P.vy=0;P.onGround=true;G.overT=0;
    popNum(P.x,P.y+2.8,'Rinascita!','info');toast('Pietra della rinascita',STONES.n?`Te ne restano ${STONES.n}`:'Era l\'ultima');}
  if(t>=REB.land+0.5){P.rebirth=null;rebirthFx(false);}}
// il corpo che si alza: da disteso a in piedi, sospeso nella luce
function rebirthPose(t){const R=P.rebirth;if(!R||R.t<REB.beam)return false;const k=easeInOutCubic(clamp((R.t-REB.beam)/(REB.rise-REB.beam),0,1));
  mixT(t,{hF:0.08,kF:0.35,hB:0.18,kB:0.55,fF:0.65,fB:0.7,crouch:0,lean:-0.18,head:0.38,shF:0.4,elF:-0.15,shB:0.4,elB:-0.15},Math.min(1,k*2));t.snap=0;return true;}
function rebirthRoot(R0){const R=P.rebirth;if(!R||R.t<REB.beam)return false;const an=anOf(R0);
  const k=easeInOutCubic(clamp((R.t-REB.beam)/(REB.rise-REB.beam),0,1)),lie=(an.deathBack?1:-1)*P.face*(Math.PI/2);
  const up=R.t<REB.rise?0.95*Math.sin(Math.min(1,k*1.15)*Math.PI*0.5):0.95*(1-clamp((R.t-REB.rise)/(REB.land-REB.rise),0,1));
  R0.root.rotation.z=R.t<REB.rise?lie*(1-k):0;R0.root.position.y=P.y+(R.t<REB.rise?0.22*(1-k):0)+up+Math.sin(R.t*5)*0.04*(up>0.1?1:0);return true;}
const _upReb=update;update=function(dt){_upReb(dt);if(P.rebirth)rebirthUpdate(dt);};
// durante il ritorno in piedi la posa e la radice le decide la rinascita
const _dpReb=deathPose;deathPose=function(t,dt){_dpReb(t,dt);rebirthPose(t);};
const _drReb=deathRoot;deathRoot=function(R,an,dt){if(P.rebirth&&R.local&&rebirthRoot(R))return;_drReb(R,an,dt);};
// posa da fluttuante anche nei primi istanti dopo essere tornato vivo
const _rpReb=reactPose;reactPose=function(t,dt){_rpReb(t,dt);if(P.rebirth&&!P.dead)mixT(t,{fF:0.6,fB:0.65,head:0.25,lean:-0.12,hF:0.05,kF:0.3,hB:0.12,kB:0.45},clamp((REB.land-P.rebirth.t)/(REB.land-REB.rise),0,1));};

/* ---------- mantelli e stoffe: in corsa ondeggiano dietro senza alzarsi troppo ---------- */
function capeRot2(speed,R){const lean=R.torso?R.torso.rotation.x:0;return 0.05+Math.min(0.3,speed*0.028)-lean*0.4+(P.vy<-2?-0.12:P.vy>2?0.08:0);}
function flows2(R,speed,dt){const sp=Math.min(1,speed/9),up=clamp(-P.vy*0.035,-0.4,0.55),lean=R.torso?R.torso.rotation.x:0;
  for(const f of R.flows||[])f.segs.forEach((s,i)=>{const w=Math.sin(G.time*(5+sp*5)-i*0.9)*(0.04+0.06*sp)*(1+i*0.4);
    const tg=i===0?f.base+sp*0.42*f.amp+up*0.4-lean*0.55+w:0.08+sp*0.1*f.amp+up*0.14+w;s.rotation.x+=(tg-s.rotation.x)*damp(dt,13-i*2.5);});}

/* =========================================================
   TOCCO PIÙ AFFIDABILE: il joystick non resta più bloccato a destra o a sinistra
   (su iPhone a volte il dito che si alza non arriva come "pointerup")
   ========================================================= */
let joyTid=null;
const tAlive=(list,id)=>{for(let i=0;i<list.length;i++)if(list[i].identifier===id)return list[i];return null;};
function releaseTouchControls(){joyTid=null;joyOff();clearInput();
  for(const k of document.querySelectorAll('.atk-knob,#joyKnob'))k.style.transform='';}
let atkTid=null;
function releaseAtk(){atkTid=null;input.atkHeld=false;input.atkHold=null;const b=$('bAtk');if(b){b.classList.remove('on');const k=b.querySelector('.atk-knob');if(k)k.style.transform='';}}
$('bAtk').addEventListener('touchstart',e=>{const t=e.changedTouches[0];if(t)atkTid=t.identifier;},{passive:true});
joy.addEventListener('touchstart',e=>{const t=e.changedTouches[0];if(t&&joyTid===null)joyTid=t.identifier;},{passive:true});
// se il dito del joystick si muove ma gli eventi "pointer" si sono persi, continua a seguirlo
addEventListener('touchmove',e=>{if(joyTid===null)return;const t=tAlive(e.touches,joyTid);if(t&&joyId===null){joy.classList.add('on');joySet(t);}},{passive:true,capture:true});
const touchEnd=e=>{if(joyTid!==null&&!tAlive(e.touches,joyTid)){joyTid=null;joyOff();}
  if(atkTid!==null&&!tAlive(e.touches,atkTid))releaseAtk();
  if(e.touches.length===0&&(joyId!==null||input.left||input.right))joyOff();};
addEventListener('touchend',touchEnd,{passive:true,capture:true});addEventListener('touchcancel',touchEnd,{passive:true,capture:true});
// app in secondo piano, notifiche, gesti di sistema: si lascia andare tutto
addEventListener('pagehide',releaseTouchControls);addEventListener('blur',releaseTouchControls);
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseTouchControls();});
const _ciT=clearInput;clearInput=function(){_ciT();if(joyId!==null){joyId=null;$('joyKnob').style.transform='';joy.classList.remove('on');}joyTid=null;};
// TOCCHI "QUASI" GIUSTI: un dito che cade poco fuori da un tasto (o vicino al joystick) vale come se l'avesse preso.
// Il tocco viene girato al controllo più vicino; anche movimenti e rilascio di quel dito gli vengono passati.
const TCTL=['joy','bAtk','bJump','bDash','bAbil','bAbil2','bAbil3'],TFWD=new Map();
function tFwd(el,e,type){const ev=new PointerEvent(type,{pointerId:e.pointerId,pointerType:'touch',isPrimary:e.isPrimary,clientX:e.clientX,clientY:e.clientY,bubbles:true,cancelable:true,button:0,buttons:type==='pointerdown'||type==='pointermove'?1:0});ev.__fwd=true;el.dispatchEvent(ev);}
addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch'||e.__fwd||G.tedit||!isTouch||!(G.state==='play'||G.state==='cellar')||$('touch').hidden)return;
  const t=e.target;if(t&&t.closest&&t.closest('#joy,.tbtn,#abilBar,#bUse,button,a,input,select,textarea,.screen,[data-ed]'))return;
  let best=null,bd=1e9;for(const id of TCTL){const el=$(id);if(!el)continue;const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;
    const d=Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2))-r.width/2,lim=id==='joy'?80:34;if(d<lim&&d<bd){bd=d;best=el;}}
  if(!best)return;e.preventDefault();e.stopPropagation();TFWD.set(e.pointerId,best);if(best===joy)joyTid=null;tFwd(best,e,'pointerdown');},{capture:true});
for(const ty of ['pointermove','pointerup','pointercancel'])addEventListener(ty,e=>{if(e.__fwd)return;const el=TFWD.get(e.pointerId);if(!el)return;
  if(ty!=='pointermove')TFWD.delete(e.pointerId);if(e.target===el||(e.target&&el.contains&&el.contains(e.target)))return;tFwd(el,e,ty);},{capture:true});
// controllo di sicurezza: joystick "premuto" ma nessun dito sullo schermo da un attimo → rilascio
let lastTouchAt=0,touchesNow=0;
for(const ev of ['touchstart','touchmove','touchend','touchcancel'])addEventListener(ev,e=>{touchesNow=e.touches.length;lastTouchAt=performance.now();},{passive:true,capture:true});
setInterval(()=>{if(!isTouch)return;if(touchesNow===0&&performance.now()-lastTouchAt>150&&(joyId!==null||input.left||input.right||input.atkHeld||input.jumpHeld||document.querySelector('#touch .tbtn.on'))){joyOff();input.atkHeld=false;input.atkHold=null;input.jumpHeld=false;TFWD.clear();
  for(const b of document.querySelectorAll('#touch .tbtn.on'))b.classList.remove('on');
  for(const k of document.querySelectorAll('.atk-knob'))k.style.transform='';const b=$('bAtk');if(b)b.classList.remove('on');}},120);

