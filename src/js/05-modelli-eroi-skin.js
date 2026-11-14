/* =========================================================
   MODELLI: stickman cartoon, armi, nemici
   ========================================================= */
// Stickman con ginocchia e gomiti: tutte le articolazioni ruotano sull'asse x (profilo)
function buildStick(o){
  const r={root:new THREE.Group(),spin:new THREE.Group(),model:new THREE.Group(),mats:[]};
  r.root.add(r.spin);r.spin.position.y=1.0;r.spin.add(r.model);r.model.position.y=-1.0;
  const tk=o.tk||0.078,limbM=toon(o.limb),headM=toon(o.head),bodyM=o.body!=null?toon(o.body):limbM;r.mats.push(limbM,headM);if(bodyM!==limbM)r.mats.push(bodyM);
  r.pelvis=new THREE.Group();r.pelvis.position.y=0.95;r.model.add(r.pelvis);
  r.legs=[];
  for(const s of [-1,1]){const hip=new THREE.Group();hip.position.set(s*0.1,0,0);r.pelvis.add(hip);
    capO(tk,0.36,limbM,0,-0.24,0,hip);
    const knee=new THREE.Group();knee.position.y=-0.48;hip.add(knee);
    capO(tk*0.95,0.34,limbM,0,-0.22,0,knee);
    boxO(0.15,0.1,0.29,0.045,o.footM||limbM,0,-0.43,0.06,knee);
    r.legs.push({hip,knee});}
  r.torso=new THREE.Group();r.pelvis.add(r.torso);
  capO(tk*1.3,0.46,bodyM,0,0.31,0,r.torso);
  r.chest=new THREE.Group();r.chest.position.y=0.6;r.torso.add(r.chest);
  r.head=new THREE.Group();r.head.position.y=0.38;r.chest.add(r.head);
  const hr=o.headR||0.27;r.headMesh=sphO(hr,headM,0,0,0,r.head,32,24);
  if(o.eyes!==false){const em=o.eyeGlow?new THREE.MeshBasicMaterial({color:o.eyeGlow}):new THREE.MeshBasicMaterial({color:0x14121a});
    for(const s of [-1,1]){const e=mesh(sph(0.042,12,10),em,s*0.1,0.03,hr-0.035,r.head,true);e.scale.set(1,1.7,0.6);}}
  r.arms=[];
  for(const s of [-1,1]){const sh=new THREE.Group();sh.position.set(s*0.12,-0.05,0);r.chest.add(sh);
    capO(tk*0.92,0.22,limbM,0,-0.17,0,sh);
    const el=new THREE.Group();el.position.y=-0.34;sh.add(el);
    capO(tk*0.88,0.2,limbM,0,-0.15,0,el);
    sphO(tk*1.35,o.handM||limbM,0,-0.32,0,el,14,12);
    const wr=new THREE.Group();wr.position.y=-0.32;el.add(wr);
    r.arms.push({sh,el,wr});}
  return r;
}
const tgBase=()=>({twist:0,crouch:0,lean:0,head:0,hF:0,kF:0.1,hB:0,kB:0.1,shF:-0.1,elF:-0.3,wrF:0,shB:-0.1,elB:-0.3,wrB:0});
function walkTg(t,ph,amp){t.hF=-Math.sin(ph)*0.75*amp;t.hB=Math.sin(ph)*0.75*amp;t.kF=0.1+Math.max(0,Math.cos(ph))*1.15*amp;t.kB=0.1+Math.max(0,-Math.cos(ph))*1.15*amp;t.crouch=0.02+Math.abs(Math.sin(ph))*0.05*amp;t.lean=0.14*amp;}
function applyPose(R,t,k,ka){
  const j=(o,v,kk)=>{o.rotation.x+=wrapA(v-o.rotation.x)*kk;};
  R.pelvis.position.y+=((0.95-t.crouch)-R.pelvis.position.y)*k;
  j(R.torso,t.lean,k);j(R.head,t.head,k);R.torso.rotation.y+=wrapA((t.twist||0)-R.torso.rotation.y)*k;
  j(R.legs[0].hip,t.hF,k);j(R.legs[0].knee,t.kF,k);j(R.legs[1].hip,t.hB,k);j(R.legs[1].knee,t.kB,k);
  const a=R.arms[0],b=R.arms[1];j(a.sh,t.shF,ka);j(a.el,t.elF,ka);j(a.wr,t.wrF,ka);j(b.sh,t.shB,ka);j(b.el,t.elB,ka);j(b.wr,t.wrB,ka);
}

// catena di pezzi di stoffa (mantelli, sciarpe, pennacchi) che ondeggiano con il movimento
function flowChain(R,parent,pos,n,len,w,m,base,amp){const segs=[];let par=parent;
  for(let i=0;i<n;i++){const g=new THREE.Group();if(i===0)g.position.set(pos[0],pos[1],pos[2]);else g.position.y=-len;par.add(g);
    boxO(w*(1-i*0.12),len+0.02,0.03,0.012,m,0,-len/2,0,g);g.rotation.x=i===0?base:0.08;segs.push(g);par=g;}
  R.flows.push({segs,base,amp:amp||1});return segs;}
function buildHeroOld(cls){
  const C=cls.colors,id=cls.id,boot=toon(id==='assassino'?0x1a1724:0x3a2a20),glove=toon(id==='cavaliere'?0xc9ced8:id==='berserker'?0x6b4a2e:id==='lanciere'?0x2a2830:0x2a2438);
  const R=buildStick({limb:C.limb,head:0xf4ecdc,tk:0.08,eyeGlow:id==='assassino'?0xd7b8ff:null,footM:boot,handM:glove});
  const trim=toon(C.trim),acc=toon(C.accent),capeM=toon(C.cape,{side:THREE.DoubleSide}),dark=toon(0x2a2830),main=toon(C.main),gold=toon(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.22});
  R.mats.push(trim,acc,capeM,dark,main,gold,boot,glove);R.cls=cls;R.flows=[];
  const hd=R.head,ch=R.chest,pv=R.pelvis;
  R.cape=new THREE.Group();R.cape.position.set(0,-0.02,-0.12);ch.add(R.cape);
  if(id==='cavaliere'){
    // paladino: elmo chiuso con visiera a T, cresta d'oro, pennacchio, spallacci, tabarro con croce, mantello lungo
    geoO(new THREE.SphereGeometry(0.31,32,18,0,TAU,0,Math.PI*0.72),trim,0,0,0,hd,0.31);
    mesh(rbox(0.44,0.055,0.1,0.02),dark,0,0.02,0.265,hd,true);mesh(rbox(0.07,0.22,0.1,0.02),dark,0,-0.06,0.27,hd,true);
    const rid=mesh(new THREE.TorusGeometry(0.315,0.028,8,32,Math.PI),gold,0,0,0,hd);rid.rotation.set(0,Math.PI/2,0);
    flowChain(R,hd,[0,0.3,-0.05],3,0.15,0.09,acc,2.3,0.6);
    for(const s of [-1,1]){const p=sphO(0.16,trim,s*0.17,-0.02,0,ch,18,14);p.scale.set(1,0.72,1.15);const r=mesh(new THREE.TorusGeometry(0.15,0.022,8,24),gold,s*0.17,-0.05,0,ch);r.rotation.x=Math.PI/2;r.scale.set(1,1.15,1);}
    boxO(0.38,0.34,0.31,0.12,trim,0,-0.14,0.01,ch);
    boxO(0.3,0.5,0.04,0.02,main,0,-0.42,0.17,ch);mesh(rbox(0.06,0.3,0.03,0.01),gold,0,-0.38,0.2,ch,true);mesh(rbox(0.2,0.06,0.03,0.01),gold,0,-0.3,0.2,ch,true);
    const belt=mesh(new THREE.TorusGeometry(0.135,0.035,8,24),toon(0x4a3220),0,0.04,0,pv);belt.rotation.x=Math.PI/2;mesh(rbox(0.09,0.08,0.04,0.02),gold,0,0.04,0.15,pv,true);
    flowChain(R,R.cape,[0,0,0],3,0.3,0.44,capeM,0.12,1);
    const ks=new THREE.Shape();ks.moveTo(0,0.34);ks.quadraticCurveTo(0.28,0.32,0.28,0.04);ks.quadraticCurveTo(0.24,-0.28,0,-0.44);ks.quadraticCurveTo(-0.24,-0.28,-0.28,0.04);ks.quadraticCurveTo(-0.28,0.32,0,0.34);
    const sg=new THREE.ExtrudeGeometry(ks,{depth:0.05,bevelEnabled:true,bevelThickness:.02,bevelSize:.025,bevelSegments:3,curveSegments:14});sg.translate(0,0,-0.025);sg.rotateY(Math.PI/2);
    const sh=new THREE.Group();sh.position.set(0.08,-0.2,0.05);R.arms[1].el.add(sh);
    geoO(sg,main,0,0,0,sh,0.35);mesh(rbox(0.04,0.5,0.08,0.02),gold,0.06,-0.04,0,sh,true);mesh(rbox(0.04,0.08,0.34,0.02),gold,0.06,0.08,0,sh,true);
  }else if(id==='berserker'){
    // guerriero del nord: elmo con grandi corna, pittura di guerra, barba intrecciata, mantello di pelliccia, gonnellino che sbatte
    geoO(new THREE.SphereGeometry(0.295,28,14,0,TAU,0,Math.PI*0.46),trim,0,0.03,0,hd,0.29);
    const nose=mesh(rbox(0.05,0.2,0.06,0.02),trim,0,-0.02,0.29,hd);
    for(const s of [-1,1]){const h=geoO(new THREE.TorusGeometry(0.21,0.06,10,20,Math.PI*0.75),acc,s*0.3,0.16,0,hd,0.22);h.rotation.set(0,Math.PI/2,s>0?-0.35:Math.PI+0.35);
      mesh(rbox(0.045,0.17,0.02,0.01),toon(0xb02a2a),s*0.1,0.0,0.262,hd,true);}
    const bm=toon(0xc0612b);R.mats.push(bm);const b=sphO(0.19,bm,0,-0.16,0.13,hd,20,14);b.scale.set(1,0.8,0.7);
    for(const s of [-1,1]){const br=capO(0.04,0.16,bm,s*0.08,-0.33,0.16,hd);br.rotation.z=s*0.15;mesh(sph(0.035,8,6),gold,s*0.09,-0.43,0.16,hd,true);}
    const fur=toon(0x7a5a3a),fur2=toon(0x5a4028);R.mats.push(fur,fur2);
    for(let i=0;i<7;i++){const a=-1.4+i*0.47;sphO(0.12,i%2?fur:fur2,Math.sin(a)*0.2,0.03+Math.random()*0.03,-Math.cos(a)*0.08,ch,14,10);}
    for(const a of R.arms){const br=geoO(new THREE.CylinderGeometry(0.085,0.095,0.18,14),toon(0x6b4a2e),0,-0.13,0,a.el,0.09);}
    const belt=geoO(new THREE.TorusGeometry(0.14,0.05,10,24),dark,0,0.03,0,pv,0.12);belt.rotation.x=Math.PI/2;
    sphO(0.06,toon(0xe6dcc6),0,0.03,0.16,pv,12,10);
    flowChain(R,pv,[0,-0.02,0.12],2,0.18,0.24,main,0.05,0.8);flowChain(R,pv,[0,-0.02,-0.12],2,0.18,0.26,main,0.1,1);
  }else if(id==='lanciere'){
    // dragone: elmo a punta con ali e paraguance, cresta lunga, sciarpa rossa, spallaccio, scaglie e fianchi corazzati
    const pts=[[0.3,0],[0.29,0.06],[0.21,0.22],[0.09,0.38],[0,0.44]].map(p=>new THREE.Vector2(p[0],p[1]));
    geoO(new THREE.LatheGeometry(pts,28),trim,0,0.03,0,hd,0.3);
    const br=mesh(new THREE.TorusGeometry(0.3,0.03,8,32),acc,0,0.05,0,hd);br.rotation.x=Math.PI/2;
    mesh(new THREE.SphereGeometry(0.29,24,10,Math.PI/2-0.95,1.9,Math.PI*0.52,Math.PI*0.26),toon(C.trim,{side:THREE.DoubleSide}),0,0,0,hd,true);
    for(const s of [-1,1]){const w=mesh(new THREE.ConeGeometry(0.07,0.34,4),acc,s*0.3,0.14,-0.04,hd);w.rotation.z=-s*1.15;w.scale.z=0.35;}
    flowChain(R,hd,[0,0.44,-0.02],4,0.17,0.08,acc,2.0,0.7);
    flowChain(R,ch,[0,0.06,-0.1],4,0.2,0.15,acc,0.45,1.2);
    const sp=sphO(0.17,trim,-0.17,-0.02,0,ch,18,14);sp.scale.set(1,0.75,1.15);const sr=mesh(new THREE.TorusGeometry(0.16,0.02,8,24),acc,-0.17,-0.05,0,ch);sr.rotation.x=Math.PI/2;
    boxO(0.32,0.26,0.28,0.1,trim,0,-0.12,0.01,ch);
    for(let i=0;i<3;i++)mesh(rbox(0.3-i*0.03,0.07,0.04,0.02),i%2?acc:trim,0,-0.04-i*0.09,0.16,ch,true);
    for(const s of [-1,1]){const ts=boxO(0.06,0.22,0.16,0.03,trim,s*0.15,-0.08,0.02,pv);ts.rotation.z=s*0.18;}
  }else if(id!=='assassino'){
    buildMagicSkin(R,id,{C,trim,acc,capeM,dark,main,gold,hd,ch,pv});
  }else{
    // assassino: cappuccio, maschera, due code di sciarpa lunghe, fasce sulle braccia, fusciacca e foderi
    const hm=toon(C.main,{side:THREE.DoubleSide});R.mats.push(hm);
    geoO(new THREE.SphereGeometry(0.33,28,18,Math.PI/2+0.8,TAU-1.6,0,Math.PI*0.78),hm,0,0.02,-0.03,hd,0.33);
    mesh(new THREE.SphereGeometry(0.284,28,10,Math.PI/2-0.95,1.9,Math.PI*0.55,Math.PI*0.24),toon(0x2a2830,{side:THREE.DoubleSide}),0,0,0,hd,true);   // maschera sotto gli occhi
    mesh(new THREE.SphereGeometry(0.288,28,10,Math.PI/2-1.0,2.0,0,Math.PI*0.385),hm,0,0,0,hd,true);   // fascia sulla fronte: resta solo la fessura degli occhi
    const sc=geoO(new THREE.TorusGeometry(0.14,0.06,10,24),acc,0,0.02,0,ch,0.15);sc.rotation.x=Math.PI/2;
    flowChain(R,ch,[0.05,0.04,-0.1],4,0.22,0.1,hm,0.55,1.3);flowChain(R,ch,[-0.05,0.0,-0.1],4,0.2,0.09,acc,0.4,1.1);
    for(const a of R.arms)for(let i=0;i<3;i++){const r=mesh(new THREE.TorusGeometry(0.078,0.018,6,16),acc,0,-0.05-i*0.07,0,a.el);r.rotation.x=Math.PI/2;}
    const sp=sphO(0.12,hm,-0.16,-0.02,0,ch,14,10);sp.scale.set(1,0.7,1.1);
    const sash=mesh(new THREE.TorusGeometry(0.135,0.045,8,24),acc,0,0.04,0,pv);sash.rotation.x=Math.PI/2;flowChain(R,pv,[0.1,0.02,0.1],2,0.16,0.07,acc,0.15,1);
    for(const s of [-1,1]){const d=capO(0.035,0.24,dark,s*0.15,-0.06,-0.04,pv);d.rotation.z=s*0.5;}
  }
  return R;
}
// skin delle 10 classi nuove
function buildMagicSkin(R,id,o){
  const {C,trim,acc,capeM,dark,main,gold,hd,ch,pv}=o,glow=(c,i)=>{const m=toon(c,{emissive:c,emissiveIntensity:i||1.2});R.mats.push(m);return m;};
  const hoodM=toon(C.main,{side:THREE.DoubleSide});R.mats.push(hoodM);
  if(R.cls.weapon==='bastone'){const hg=new THREE.Group();hg.userData.skin=true;R.arms[1].wr.add(hg);R.handRings=magicHand(hg,R.cls.fx||0xb48cff,gold);}
  const hood=(m,deep)=>{geoO(new THREE.SphereGeometry(0.33,28,18,Math.PI/2+0.75,TAU-1.5,0,Math.PI*(deep||0.72)),m,0,0.03,-0.03,hd,0.33);};
  const robe=(m,len,w)=>{flowChain(R,pv,[0,-0.02,0.12],3,len,w,m,0.05,0.6);flowChain(R,pv,[0,-0.02,-0.12],3,len,w+0.02,m,0.1,0.8);
    for(const s of [-1,1])flowChain(R,pv,[s*0.14,-0.02,0],3,len*0.95,0.12,m,0.08,0.7);};
  const belt=m=>{const b=mesh(new THREE.TorusGeometry(0.14,0.04,8,24),m,0,0.04,0,pv);b.rotation.x=Math.PI/2;};
  const torso=m=>boxO(0.34,0.3,0.29,0.11,m,0,-0.13,0.01,ch);
  const shoulders=(m,sc)=>{for(const s of [-1,1]){const p=sphO(0.14*(sc||1),m,s*0.17,-0.02,0,ch,16,12);p.scale.set(1,0.7,1.1);}};
  if(id==='mago'){            // mago del fuoco: cappello a punta piegato, barba, tunica lunga, gemma ardente
    const brim=geoO(new THREE.CylinderGeometry(0.46,0.48,0.04,32),main,0,0.16,0,hd,0.47);
    const hat=new THREE.Group();hat.position.set(0,0.18,0);hd.add(hat);
    const c1=geoO(new THREE.ConeGeometry(0.27,0.42,24),main,0,0.2,0,hat,0.27);
    const tipG=new THREE.Group();tipG.position.set(0,0.38,0);tipG.rotation.z=-0.5;hat.add(tipG);geoO(new THREE.ConeGeometry(0.11,0.3,16),main,0,0.12,0,tipG,0.11);
    const band=mesh(new THREE.TorusGeometry(0.255,0.035,8,28),acc,0,0.04,0,hat);band.rotation.x=Math.PI/2;mesh(sph(0.05,10,8),glow(0xff7a2e,1.8),0,0.05,0.25,hat,true);
    const bm=toon(0xe8e2d4);R.mats.push(bm);const b=sphO(0.17,bm,0,-0.17,0.13,hd,18,12);b.scale.set(1,1.1,0.6);capO(0.06,0.14,bm,0,-0.36,0.13,hd);
    torso(main);shoulders(acc);robe(main,0.26,0.3);belt(gold);flowChain(R,R.cape,[0,0,0],3,0.28,0.4,capeM,0.12,1);
  }else if(id==='criomante'){ // strega del gelo: cappuccio, corona di cristalli, mantello di brina
    hood(hoodM,0.7);
    for(let i=-2;i<=2;i++){const c=mesh(new THREE.ConeGeometry(0.045,0.16+0.08*(2-Math.abs(i)),5),glow(0x8fdcff,1),Math.sin(i*0.32)*0.3,0.26+0.03*(2-Math.abs(i)),Math.cos(i*0.32)*0.15,hd);c.rotation.z=-i*0.18;}
    torso(main);shoulders(trim,1.05);for(const s of [-1,1]){const sp=mesh(new THREE.ConeGeometry(0.05,0.2,5),glow(0xbfe6ff,0.8),s*0.22,0.1,0,ch);sp.rotation.z=-s*0.5;}
    robe(main,0.24,0.28);belt(acc);flowChain(R,R.cape,[0,0,0],4,0.28,0.44,capeM,0.12,1.2);
  }else if(id==='tempesta'){  // evocatore del fulmine: diadema con saetta, colletto alto, sciarpa che vola
    const cr=mesh(new THREE.TorusGeometry(0.29,0.025,8,32),gold,0,0.1,0,hd);cr.rotation.x=Math.PI/2+0.15;
    const bolt=new THREE.Shape();bolt.moveTo(0.02,0.14);bolt.lineTo(-0.06,0);bolt.lineTo(0,0);bolt.lineTo(-0.03,-0.12);bolt.lineTo(0.07,0.03);bolt.lineTo(0.01,0.03);bolt.lineTo(0.05,0.14);
    const bg=new THREE.ExtrudeGeometry(bolt,{depth:0.03,bevelEnabled:false});mesh(bg,glow(0xfff27a,1.6),0,0.2,0.26,hd,true);
    const hair=toon(0xf0f2ff);R.mats.push(hair);for(let i=0;i<5;i++){const h=mesh(new THREE.ConeGeometry(0.07,0.26,6),hair,-0.2+i*0.1,0.2,-0.12,hd);h.rotation.x=-0.9;h.rotation.z=(i-2)*0.25;}
    torso(main);const col=geoO(new THREE.CylinderGeometry(0.2,0.15,0.16,20,1,true),toon(C.trim,{side:THREE.DoubleSide}),0,0.08,-0.02,ch,0.2);
    shoulders(acc);flowChain(R,ch,[0,0.06,-0.1],4,0.22,0.14,acc,0.5,1.3);robe(main,0.2,0.24);belt(gold);
  }else if(id==='druido'){    // druido: palchi di cervo, mantello di foglie, cintura di corda
    const wood=toon(0x6b4a2e);R.mats.push(wood);hood(hoodM,0.62);
    for(const s of [-1,1]){const a=capO(0.025,0.22,wood,s*0.16,0.3,0,hd);a.rotation.z=-s*0.5;const a2=capO(0.02,0.12,wood,s*0.25,0.4,0,hd);a2.rotation.z=-s*1.1;const a3=capO(0.02,0.1,wood,s*0.18,0.42,0,hd);a3.rotation.z=s*0.2;}
    torso(main);const lf=[toon(0x5fae4a),toon(0x3f8a3a),toon(0x8fcf5a)];R.mats.push(...lf);
    for(let i=0;i<9;i++){const a=-1.6+i*0.4,l=mesh(new THREE.ConeGeometry(0.07,0.2,4),lf[i%3],Math.sin(a)*0.2,0.02,-Math.cos(a)*0.12,ch);l.rotation.set(Math.PI,0,a*0.3);l.scale.z=0.4;}
    robe(main,0.22,0.26);const b=mesh(new THREE.TorusGeometry(0.14,0.03,6,20),wood,0,0.04,0,pv);b.rotation.x=Math.PI/2;
    flowChain(R,R.cape,[0,0,0],3,0.28,0.42,capeM,0.12,1);
  }else if(id==='astromante'){ // astromante: diadema di stelle, stelle che orbitano, mantello notturno
    const cr=mesh(new THREE.TorusGeometry(0.29,0.02,8,32),gold,0,0.08,0,hd);cr.rotation.x=Math.PI/2+0.1;
    const st=glow(0xfff3c4,1.8);mesh(new THREE.OctahedronGeometry(0.07),st,0,0.18,0.27,hd,true);
    hood(hoodM,0.55);torso(main);shoulders(acc);robe(main,0.26,0.3);belt(gold);
    R.orbit=new THREE.Group();R.orbit.position.set(0,0.35,0);hd.add(R.orbit);
    for(let i=0;i<3;i++){const s=mesh(new THREE.OctahedronGeometry(0.05),glow(0xc7a8ff,1.8),Math.cos(i*2.09)*0.45,0,Math.sin(i*2.09)*0.45,R.orbit,true);}
    flowChain(R,R.cape,[0,0,0],4,0.3,0.46,capeM,0.12,1.1);
  }else if(id==='negromante'){ // negromante: cappuccio profondo, maschera a teschio, mantello stracciato
    hood(hoodM,0.8);const bone=toon(0xe6dcc6);R.mats.push(bone);
    const sk=sphO(0.24,bone,0,0,0.08,hd,20,14);sk.scale.set(1,1.05,0.75);
    for(const s of [-1,1])mesh(sph(0.055,10,8),glow(0x9a6aff,2),s*0.08,0.02,0.27,hd,true);
    mesh(rbox(0.12,0.04,0.03,0.01),dark,0,-0.13,0.26,hd,true);
    torso(main);for(const s of [-1,1]){const p=sphO(0.1,bone,s*0.19,0.01,0,ch,12,10);p.scale.set(1,0.8,1);for(const k of [-1,1])mesh(new THREE.ConeGeometry(0.03,0.12,5),bone,s*0.22,0.08,k*0.05,ch);}
    robe(main,0.26,0.28);belt(dark);for(let i=0;i<3;i++)flowChain(R,R.cape,[(i-1)*0.12,0,0],3,0.32,0.14,capeM,0.1+i*0.05,1.2);
  }else if(id==='paladino'){  // paladino della luce: elmo alato, aureola, tabarro bianco con sole
    geoO(new THREE.SphereGeometry(0.31,32,18,0,TAU,0,Math.PI*0.6),trim,0,0.02,0,hd,0.31);
    for(const s of [-1,1])for(let i=0;i<3;i++){const f=mesh(new THREE.ConeGeometry(0.04,0.22-i*0.04,4),gold,s*(0.3+i*0.02),0.12+i*0.06,-0.04-i*0.03,hd);f.rotation.z=-s*(1.0-i*0.25);f.scale.z=0.3;}
    R.halo=mesh(new THREE.TorusGeometry(0.22,0.02,8,32),glow(0xffe08a,2),0,0.48,-0.05,hd,true);R.halo.rotation.x=Math.PI/2-0.2;
    shoulders(trim,1.15);torso(trim);boxO(0.3,0.5,0.04,0.02,main,0,-0.42,0.17,ch);mesh(new THREE.CircleGeometry(0.07,16),gold,0,-0.32,0.2,ch,true);
    belt(gold);flowChain(R,R.cape,[0,0,0],3,0.3,0.44,capeM,0.12,1);
  }else if(id==='arciere'){   // arciere: cappuccio con piuma, faretra sulla schiena, mantellina
    hood(hoodM,0.7);const fe=mesh(new THREE.ConeGeometry(0.04,0.3,4),acc,0.2,0.22,-0.12,hd);fe.rotation.set(-0.6,0,-0.5);fe.scale.z=0.3;
    torso(main);const lthr=toon(0x6b4a2e);R.mats.push(lthr);
    const q=geoO(new THREE.CylinderGeometry(0.07,0.06,0.42,12),lthr,0.08,-0.16,-0.2,ch,0.07);q.rotation.z=-0.5;
    for(let i=0;i<3;i++){const ar=mesh(new THREE.ConeGeometry(0.03,0.08,4),acc,0.2+i*0.03-0.03,0.07+i*0.01,-0.2,ch);ar.rotation.z=-0.5;}
    const strap=mesh(rbox(0.04,0.5,0.03,0.01),lthr,0,-0.1,0.16,ch,true);strap.rotation.z=0.6;
    flowChain(R,ch,[0,0.06,-0.1],2,0.2,0.36,capeM,0.2,1);belt(lthr);flowChain(R,pv,[0,-0.02,0.12],2,0.16,0.22,main,0.05,0.7);
  }else if(id==='samurai'){   // samurai: kasa di paglia, spallacci a lamelle, hakama
    const straw=toon(0xc9a86a);R.mats.push(straw);geoO(new THREE.ConeGeometry(0.5,0.2,28),straw,0,0.3,0,hd,0.5);
    const tie=mesh(new THREE.TorusGeometry(0.26,0.015,6,24),acc,0,-0.05,0,hd);tie.rotation.x=Math.PI/2+0.4;
    torso(main);for(const s of [-1,1])for(let i=0;i<3;i++){const l=mesh(rbox(0.2,0.05,0.24,0.01),i%2?acc:trim,s*0.22,0.02-i*0.06,0,ch,true);l.rotation.z=-s*0.35;}
    for(const s of [-1,1]){const k=mesh(rbox(0.04,0.24,0.04,0.01),acc,s*0.06,-0.12,0.16,ch,true);k.rotation.z=s*0.5;}
    belt(acc);robe(main,0.26,0.3);
  }else{                      // monaco: fascia sulla fronte con code, rosario, pantaloni larghi
    const band=geoO(new THREE.TorusGeometry(0.285,0.035,8,28),acc,0,0.08,0,hd,0.3);band.rotation.x=Math.PI/2;
    flowChain(R,hd,[0,0.08,-0.27],3,0.16,0.07,acc,0.4,1.3);flowChain(R,hd,[0.05,0.06,-0.27],3,0.14,0.06,acc,0.5,1.2);
    torso(main);const beads=toon(0x7a3a20);R.mats.push(beads);
    for(let i=0;i<14;i++){const a=i/14*TAU;mesh(sph(0.03,8,6),i===0?gold:beads,Math.sin(a)*0.19,0.04-Math.abs(Math.cos(a))*0.08*(Math.cos(a)>0?2:0.2),Math.cos(a)*0.16+0.02,ch,true);}
    for(const a of R.arms)for(let i=0;i<2;i++){const r=mesh(new THREE.TorusGeometry(0.08,0.02,6,16),trim,0,-0.12-i*0.06,0,a.el);r.rotation.x=Math.PI/2;}
    belt(acc);flowChain(R,pv,[0.1,0.02,0.1],2,0.18,0.08,acc,0.15,1);
    for(const s of [-1,1])flowChain(R,pv,[s*0.08,-0.02,0],2,0.18,0.16,main,0.05,0.5);
  }
}
function magicHand(par,oc,gold){
  const add=new THREE.MeshBasicMaterial({color:oc,transparent:true,opacity:0.85,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  for(const y of [0.1,0.17]){const b=mesh(new THREE.TorusGeometry(0.1,0.016,6,24),gold,0,y,0,par,true);b.rotation.x=Math.PI/2;}
  const rings=[];
  for(const [r1,r2,n,y] of [[0.13,0.16,32,-0.24],[0.06,0.085,6,-0.3]]){const r=mesh(new THREE.RingGeometry(r1,r2,n),add,0,y,0,par,true);r.rotation.x=Math.PI/2;rings.push(r);}
  par.userData.rings=rings;return rings;
}
function buildWeaponMesh(type,rarity,effect){
  const R=RARITY[rarity],g=new THREE.Group(),tip=new THREE.Object3D();g.add(tip);
  const metal=toon(rarity>=3?0xf4f6ff:0xdfe5ec,{emissive:R.hex,emissiveIntensity:0.04+rarity*0.12});
  const wood=toon(0x7a5434),grip=toon(0x2a2220),gold=toon(rarity>=2?R.hex:0xc89a52);
  const gem=effect?toon(EFFECTS[effect].color,{emissive:EFFECTS[effect].color,emissiveIntensity:1.4}):null;
  if(type==='spada'){
    capO(0.04,0.18,grip,0,-0.05,0,g,10);sphO(0.06,gold,0,0.1,0,g,14,10);
    boxO(0.09,0.07,0.44,0.03,gold,0,-0.2,0,g);mesh(bladeGeo(1.22,0.14,0.22),metal,0,-0.23,0,g);
    if(gem)mesh(sph(0.045,12,10),gem,-0.05,-0.2,0,g,true);tip.position.y=-1.45;
  }else if(type==='ascia'){
    capO(0.045,1.5,wood,0,-0.6,0,g,10);
    const hs=new THREE.Shape();hs.moveTo(0,0.22);hs.quadraticCurveTo(0.42,0.44,0.54,0.02);hs.quadraticCurveTo(0.42,-0.44,0,-0.2);hs.lineTo(0,0.22);
    const hg=new THREE.ExtrudeGeometry(hs,{depth:0.05,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:3,curveSegments:16});hg.translate(0,0,-0.025);hg.rotateY(Math.PI/2);
    mesh(hg,metal,0,-1.25,0,g);boxO(0.11,0.36,0.16,0.04,metal,0,-1.25,0,g);
    const sp=mesh(new THREE.ConeGeometry(0.06,0.26,14),metal,0,-1.25,0.18,g);sp.rotation.x=Math.PI/2;
    if(gem)mesh(sph(0.05,12,10),gem,-0.07,-1.25,0,g,true);tip.position.set(0,-1.25,-0.5);
  }else if(type==='lancia'){
    geoO(new THREE.CylinderGeometry(0.04,0.045,2.15,14),wood,0,-0.72,0,g,0.045);
    for(const y of [-1.72,0.2])mesh(new THREE.CylinderGeometry(0.055,0.055,0.08,14),gold,0,y,0,g);
    mesh(bladeGeo(0.48,0.16,0.3),metal,0,-1.78,0,g);
    const rib=mesh(rbox(0.03,0.32,0.1,0.015),toon(rarity?R.hex:0xd94b3a),0,-1.6,-0.08,g);rib.rotation.x=0.3;
    if(gem)mesh(sph(0.045,12,10),gem,-0.05,-1.72,0,g,true);tip.position.y=-2.26;
  }else if(type==='martello'){
    capO(0.045,1.15,wood,0,-0.5,0,g,10);mesh(new THREE.CylinderGeometry(0.06,0.06,0.1,12),gold,0,-0.05,0,g);
    boxO(0.3,0.3,0.6,0.08,metal,0,-1.2,0,g);for(const z of [-0.3,0.3])mesh(rbox(0.32,0.32,0.06,0.03),gold,0,-1.2,z,g);
    if(gem)mesh(sph(0.06,12,10),gem,-0.16,-1.2,0,g,true);tip.position.set(0,-1.25,0);
  }else if(type==='falce'){
    geoO(new THREE.CylinderGeometry(0.035,0.04,2.1,12),toon(0x2a2228),0,-0.75,0,g,0.04);
    const bs=new THREE.Shape();bs.moveTo(0,-0.09);bs.quadraticCurveTo(0.5,-0.14,1.05,0.32);bs.quadraticCurveTo(0.5,0.02,0,0.08);bs.lineTo(0,-0.09);
    const bg=new THREE.ExtrudeGeometry(bs,{depth:0.03,bevelEnabled:true,bevelThickness:0.01,bevelSize:0.012,bevelSegments:2,curveSegments:16});bg.translate(0,0,-0.015);bg.rotateY(Math.PI/2);
    mesh(bg,metal,0,-1.75,0,g);mesh(new THREE.CylinderGeometry(0.06,0.06,0.1,12),gold,0,-1.72,0,g);
    if(gem)mesh(sph(0.05,12,10),gem,0,-1.6,0,g,true);tip.position.set(0,-1.5,-0.95);
  }else if(type==='katana'){
    capO(0.035,0.26,toon(0x2a1a2a),0,-0.02,0,g,10);mesh(new THREE.CylinderGeometry(0.11,0.11,0.03,16),gold,0,-0.2,0,g);
    const kb=bladeGeo(1.3,0.09,0.12);mesh(kb,metal,0,-0.22,0,g).rotation.x=-0.06;
    if(gem)mesh(sph(0.035,10,8),gem,-0.04,-0.17,0,g,true);tip.position.set(0,-1.52,-0.08);
  }else if(type==='pugni'){
    const k=mesh(rbox(0.18,0.1,0.2,0.04),rarity?gold:toon(0xd8cfb8),0,-0.02,0.02,g);
    if(gem)mesh(sph(0.04,10,8),gem,-0.08,-0.02,0,g,true);tip.position.set(0,-0.15,0.05);
  }else if(type==='arco'){
    const bg=new THREE.TorusGeometry(0.62,0.04,8,28,Math.PI*0.8);bg.rotateZ(-0.4*Math.PI);bg.rotateY(-Math.PI/2);
    mesh(bg,rarity>=2?gold:wood,0,0,-0.62,g);mesh(new THREE.CylinderGeometry(0.009,0.009,1.18,6),new THREE.MeshBasicMaterial({color:0xe8e0cc}),0,0,-0.43,g,true);
    mesh(rbox(0.06,0.18,0.08,0.02),grip,0,0,0,g);if(gem)mesh(sph(0.04,10,8),gem,-0.06,0,0,g,true);tip.position.set(0,0.6,-0.2);
  }else if(type==='bastone'){   // catalizzatore: bracciali al polso e due cerchi di rune che girano davanti al palmo
    const oc=gem?EFFECTS[effect].color:((typeof G!=='undefined'&&G.cls&&G.cls.fx)||0xb48cff);
    magicHand(g,oc,gold);tip.position.set(0,-0.24,0);
  }else{
    capO(0.035,0.12,grip,0,-0.02,0,g,8);boxO(0.06,0.05,0.22,0.02,gold,0,-0.12,0,g);mesh(bladeGeo(0.48,0.1,0.16),metal,0,-0.14,0,g);
    if(gem)mesh(sph(0.03,10,8),gem,-0.04,-0.12,0,g,true);tip.position.y=-0.62;
  }
  return {g,tip};
}

// ================= NUOVE SKIN, ARMI, NEMICI E GUARDIANI =================
// ===== NUOVE SKIN · corpo più realistico, superfici lisce, stesso stile cartoon (toon + contorno nero) =====
// Lo scheletro ha gli stessi nomi e le stesse articolazioni del gioco (pelvis, torso, chest, head, legs[hip,knee], arms[sh,el,wr], cape, flows, mats):
// le pose, le animazioni e le armi del gioco funzionano senza modifiche.
const SOT=0.016;   // spessore del contorno

// contorno a scafo rovesciato con normali mediate: segue anche forme curve e pannelli sottili
function hullGeo(geo,t){
  const g=geo.clone(),p=g.attributes.position,n=g.attributes.normal,map=new Map();
  const key=i=>Math.round(p.getX(i)*2e3)+'|'+Math.round(p.getY(i)*2e3)+'|'+Math.round(p.getZ(i)*2e3);
  const keys=new Array(p.count);
  for(let i=0;i<p.count;i++){const k=keys[i]=key(i);let a=map.get(k);if(!a){a=[0,0,0];map.set(k,a);}a[0]+=n.getX(i);a[1]+=n.getY(i);a[2]+=n.getZ(i);}
  for(let i=0;i<p.count;i++){const a=map.get(keys[i]),l=Math.hypot(a[0],a[1],a[2])||1;p.setXYZ(i,p.getX(i)+a[0]/l*t,p.getY(i)+a[1]/l*t,p.getZ(i)+a[2]/l*t);}
  p.needsUpdate=true;g.computeBoundingSphere();return g;
}
// M(genitore, geometria, materiale, [x,y,z], {r:[rx,ry,rz], ol:contorno (0 = niente)})
function M(par,geo,m,p,o){
  o=o||{};const me=new THREE.Mesh(geo,m);if(p)me.position.set(p[0],p[1],p[2]);
  if(o.r)me.rotation.set(o.r[0]||0,o.r[1]||0,o.r[2]||0);me.castShadow=o.shadow!==false;me.receiveShadow=true;
  const t=o.ol===undefined?SOT:o.ol;if(t&&!m.transparent){const h=new THREE.Mesh(hullGeo(geo,t),OUT);me.add(h);}
  if(par)par.add(me);return me;
}
const V2=(x,y)=>new THREE.Vector2(x,y),V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const G3={
  ell:(rx,ry,rz,ws,hs)=>{const g=new THREE.SphereGeometry(1,QS(ws||32,8),QS(hs||22,6));g.scale(rx,ry,rz);return g;},
  // calotta: sfera tagliata (cover = frazione di altezza coperta dall'alto), schiacciata in y e allungata in z
  dome:(r,cover,sy,sz,ps,pl)=>{const g=new THREE.SphereGeometry(r,QS(40,10),QS(22,6),ps||0,pl||TAU,0,Math.PI*(cover||0.5));g.scale(1,sy||1,sz||1);return g;},
  sphP:(r,ps,pl,ts,tl)=>new THREE.SphereGeometry(r,QS(40,10),QS(24,6),ps,pl,ts,tl),
  lathe:(pts,seg,ps,pl)=>new THREE.LatheGeometry(pts.map(p=>V2(Math.max(0.0004,p[0]),p[1])),QS(seg||40,8),ps||0,pl||TAU),
  // arto affusolato e arrotondato, centrato: r0 in alto, r1 in basso, b = muscolo
  limb:(r0,r1,len,b)=>{b=b||0;const h=len/2,pts=[];
    for(let i=0;i<=5;i++){const a=-Math.PI/2+i/5*Math.PI/2;pts.push([r1*Math.cos(a),-h+r1*0.6*Math.sin(a)]);}
    for(let i=1;i<10;i++){const t=i/10;pts.push([lerp(r1,r0,t)+b*Math.pow(Math.sin(Math.PI*t),1.4),-h+len*t]);}
    for(let i=0;i<=5;i++){const a=i/5*Math.PI/2;pts.push([r0*Math.cos(a),h+r0*0.6*Math.sin(a)]);}
    return G3.lathe(pts,26);},
  cyl:(rt,rb,h,s,open)=>new THREE.CylinderGeometry(rt,rb,h,QS(s||36,8),1,!!open),
  cone:(r,h,s)=>new THREE.ConeGeometry(r,h,QS(s||32,6),QS(4,1)),
  tor:(R,r,arc,ts,rs)=>new THREE.TorusGeometry(R,r,QS(rs||12,5),QS(ts||56,10),arc||TAU),
  // anello orizzontale (schiacciato in z per seguire il busto)
  hring:(R,r,zs,arc)=>{const g=new THREE.TorusGeometry(R,r,QS(12,5),QS(64,12),arc||TAU);if(arc)g.rotateZ(Math.PI/2-arc/2);g.rotateX(Math.PI/2);g.scale(1,1,zs||1);return g;},
  // arco verticale da davanti a dietro sopra la testa
  vring:(R,r,arc)=>{const g=new THREE.TorusGeometry(R,r,QS(10,5),QS(48,10),arc||Math.PI);g.rotateY(Math.PI/2);return g;},
  rb:(w,h,d,r)=>rbox(w,h,d,r==null?Math.min(w,h,d)*0.3:r),
  // tubo affusolato lungo una curva liscia (corna, piume, trecce, barbe, punte)
  tube:(pts,r0,r1,ts,rs,prof)=>{
    const c=new THREE.CatmullRomCurve3(pts.map(p=>V3(p[0],p[1],p[2])));ts=QS(ts||24,6);rs=QS(rs||12,5);
    const fr=c.computeFrenetFrames(ts,false),pos=[],idx=[];
    for(let i=0;i<=ts;i++){const t=i/ts,P=c.getPointAt(t),N=fr.normals[i],B=fr.binormals[i],r=prof?prof(t):lerp(r0,r1,t);
      for(let j=0;j<=rs;j++){const a=j/rs*TAU,ca=Math.cos(a),sa=Math.sin(a);pos.push(P.x+r*(ca*N.x+sa*B.x),P.y+r*(ca*N.y+sa*B.y),P.z+r*(ca*N.z+sa*B.z));}}
    for(let i=0;i<ts;i++)for(let j=0;j<rs;j++){const a=i*(rs+1)+j,b=a+rs+1;idx.push(a,a+1,b,b,a+1,b+1);}
    const p0=c.getPointAt(0),p1=c.getPointAt(1),c0=pos.length/3;pos.push(p0.x,p0.y,p0.z);const c1=c0+1;pos.push(p1.x,p1.y,p1.z);
    for(let j=0;j<rs;j++){idx.push(c0,j+1,j);const e=ts*(rs+1);idx.push(c1,e+j,e+j+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;},
  // pannello di stoffa curvo (mantelli, tabarri, gonne): parte da y=0 e scende; cv piega i bordi in z; jag = orlo strappato
  panel:(w0,w1,len,th,cv,jag)=>{
    const g=new THREE.BoxGeometry(1,len,th||0.022,14,3,1),p=g.attributes.position,wm=Math.max(w0,w1)/2;
    for(let i=0;i<p.count;i++){const x0=p.getX(i);let y=p.getY(i),z=p.getZ(i);const t=0.5-y/len,w=lerp(w0,w1,t),x=x0*w,u=x/wm;z+=(cv||0)*u*u;y-=len/2;
      if(jag&&t>0.99){const col=Math.round((x0+0.5)*14);if(col%2)y+=jag;}p.setXYZ(i,x,y,z);}
    g.computeVertexNormals();return g;},
  // foglia / piuma / lama piatta morbida (ellisse estrusa con bisello)
  leaf:(w,h,d,pointy)=>{const s=new THREE.Shape();s.moveTo(0,0);s.bezierCurveTo(w*0.6,h*0.18,w*0.55,h*(pointy?0.7:0.85),0,h);s.bezierCurveTo(-w*0.55,h*(pointy?0.7:0.85),-w*0.6,h*0.18,0,0);
    const g=new THREE.ExtrudeGeometry(s,{depth:d||0.01,bevelEnabled:true,bevelThickness:0.006,bevelSize:0.006,bevelSegments:2,curveSegments:16});g.translate(0,0,-(d||0.01)/2);return g;},
  shape:(fn,depth,bev)=>{const s=new THREE.Shape();fn(s);const g=new THREE.ExtrudeGeometry(s,{depth:depth||0.03,bevelEnabled:true,bevelThickness:bev||0.012,bevelSize:bev||0.012,bevelSegments:3,curveSegments:24});g.translate(0,0,-(depth||0.03)/2);return g;},
};

// profilo del busto (raggio, altezza dal bacino); in z è schiacciato
const TP=[[0.02,-0.13],[0.11,-0.11],[0.152,-0.03],[0.157,0.06],[0.147,0.16],[0.134,0.26],[0.146,0.36],[0.17,0.45],[0.188,0.53],[0.184,0.6],[0.15,0.66],[0.09,0.705],[0.04,0.72]];
const TZ=0.7;
function tR(y,B){B=B||1;if(y<=TP[0][1])return TP[0][0]*B;for(let k=0;k<TP.length-1;k++){const a=TP[k],b=TP[k+1];if(y>=a[1]&&y<=b[1])return lerp(a[0],b[0],(y-a[1])/(b[1]-a[1]))*B;}return TP[TP.length-1][0]*B;}
// z della superficie del busto a quota y (locale del busto) e ascissa x
function tZ(y,x,B,off){const r=tR(y,B);return r*TZ*Math.sqrt(Math.max(0,1-(x*x)/(r*r)))+(off||0);}
// guscio che segue il busto: corazze, giubbe, tabarri (phi = settore: 0 è il davanti)
function torsoGeo(B,off,y0,y1,ps,pl,bulge){
  let pts=TP.map(p=>[p[0]*B,p[1]]);
  if(y0!=null){pts=[[tR(y0,B),y0],...pts.filter(p=>p[1]>y0+1e-3&&p[1]<y1-1e-3),[tR(y1,B),y1]];}
  const g=G3.lathe(pts,48,ps,pl),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i),rr=Math.hypot(x,z);if(rr<1e-4)continue;
    const nx=x/rr,nz=z/rr,bo=bulge?bulge(y,nx,nz):0;p.setXYZ(i,nx*(rr+off+bo),y,nz*(rr*TZ+off+bo));}
  g.computeVertexNormals();return g;
}

function kitFor(R){return{
  m:(c,o)=>{const x=toon(c,o);R.mats.push(x);return x;},
  ds:c=>{const x=toon(c,{side:THREE.DoubleSide});R.mats.push(x);return x;},
  g:(c,i)=>{const x=toon(c,{emissive:c,emissiveIntensity:i||1.3});R.mats.push(x);return x;},
  add:(c,op)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op||0.8,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}),
  dark:new THREE.MeshBasicMaterial({color:0x14101a}),
};}

/* ---------- Corpo ---------- */
// o: skin, shirt, sleeve ('skin' = braccia nude), fore, pants, boot, glove, hair (colore sopracciglia), build, eyeGlow, ears ('elf'), eyes(false)
function buildBody(o){
  const R={root:new THREE.Group(),spin:new THREE.Group(),model:new THREE.Group(),mats:[],flows:[],tick:[],legs:[],arms:[],hands:[],boots:[]};
  R.root.add(R.spin);R.spin.position.y=1.0;R.spin.add(R.model);R.model.position.y=-1.0;
  const K=R.K=kitFor(R),B=R.B=o.build||1;
  const skin=K.m(o.skin!=null?o.skin:0xe2b08c),shirt=o.shirt==='skin'?skin:K.m(o.shirt!=null?o.shirt:0x6b5a4a),pants=K.m(o.pants!=null?o.pants:0x4a3a2e),boot=K.m(o.boot!=null?o.boot:0x3a2a20);
  const sleeve=o.sleeve==='skin'?skin:o.sleeve!=null?K.m(o.sleeve):shirt,fore=o.fore==='skin'?skin:o.fore!=null?K.m(o.fore):sleeve,glove=o.glove!=null?K.m(o.glove):skin;
  const sole=K.m(0x2a1e18);
  Object.assign(R,{skinM:skin,shirtM:shirt,pantsM:pants,bootM:boot,gloveM:glove,sleeveM:sleeve,foreM:fore});
  R.pelvis=new THREE.Group();R.pelvis.position.y=0.95;R.model.add(R.pelvis);
  for(const s of [-1,1]){
    const hip=new THREE.Group();hip.position.set(s*0.098*B,0,0);R.pelvis.add(hip);
    M(hip,G3.limb(0.09*B,0.064*B,0.4,0.008),pants,[0,-0.23,0]);
    const knee=new THREE.Group();knee.position.y=-0.48;hip.add(knee);
    M(knee,G3.ell(0.066*B,0.07,0.07),pants,[0,0,0.004],{ol:0});
    M(knee,G3.limb(0.065*B,0.046*B,0.36,0.012),pants,[0,-0.2,-0.006]);
    const ft=new THREE.Group();ft.position.y=-0.43;knee.add(ft);
    if(o.feet==='bare'||o.feet==='sandal'){
      M(ft,G3.limb(0.05*B,0.048*B,0.1,0),skin,[0,0.06,0]);M(ft,G3.rb(0.095*B,0.07,0.24,0.035),skin,[0,0.0,0.05]);
      if(o.feet==='sandal'){M(ft,G3.rb(0.105*B,0.02,0.25,0.008),boot,[0,-0.035,0.05],{ol:0.008});for(const y of [0.03,0.07,0.11])M(ft,G3.hring(0.053*B,0.012,1),boot,[0,y,0],{ol:0});}
    }else{
      R.boots.push(M(ft,G3.limb(0.06*B,0.058*B,0.17,0),boot,[0,0.1,0]));
      R.boots.push(M(ft,G3.rb(0.112*B,0.085,0.26,0.04),boot,[0,0.0,0.055]));
      M(ft,G3.rb(0.118*B,0.024,0.27,0.01),sole,[0,-0.038,0.055],{ol:0.008});
    }
    R.legs.push({hip,knee,foot:ft});
  }
  R.torso=new THREE.Group();R.pelvis.add(R.torso);
  R.torsoMesh=M(R.torso,torsoGeo(B,0),shirt);
  R.chest=new THREE.Group();R.chest.position.y=0.6;R.torso.add(R.chest);
  M(R.chest,G3.limb(0.052*B,0.06*B,0.13),skin,[0,0.15,0]);
  R.head=new THREE.Group();R.head.position.y=0.33;R.chest.add(R.head);
  const hd=R.head;
  R.headMesh=M(hd,G3.ell(0.168,0.198,0.185),skin,[0,0.025,-0.005]);
  M(hd,G3.ell(0.128,0.11,0.13),skin,[0,-0.085,0.035]);
  R.face=new THREE.Group();hd.add(R.face);
  M(R.face,G3.ell(0.025,0.042,0.034,16,12),skin,[0,-0.012,0.178],{ol:0});
  const hairM=K.m(o.hair!=null?o.hair:0x3a2a1e);R.hairM=hairM;
  const eyeM=o.eyeGlow?K.g(o.eyeGlow,2):K.dark;
  R.eyes=[];
  if(o.eyes!==false)for(const s of [-1,1]){
    R.eyes.push(M(R.face,G3.ell(0.022,0.027,0.012,16,12),eyeM,[s*0.062,0.03,0.164],{ol:0}));
    M(R.face,G3.rb(0.068,0.017,0.022,0.008),hairM,[s*0.064,0.077,0.162],{r:[0,0,-s*0.13],ol:0});
  }
  M(R.face,G3.rb(0.054,0.011,0.01,0.004),K.dark,[0,-0.104,0.158],{ol:0});
  for(const s of [-1,1]){
    if(o.ears==='elf'){M(hd,G3.tube([[s*0.15,0.0,-0.01],[s*0.2,0.05,-0.03],[s*0.25,0.13,-0.06]],0.03,0.004,14,10),skin,null,{ol:0.008});}
    else M(hd,G3.ell(0.022,0.05,0.036,16,12),skin,[s*0.166,0,-0.005],{ol:0.008});
  }
  for(const s of [-1,1]){
    const sh=new THREE.Group();sh.position.set(s*0.215*B,-0.03,0);R.chest.add(sh);
    M(sh,G3.ell(0.074*B,0.08,0.078),sleeve,[s*0.006,-0.02,0]);
    M(sh,G3.limb(0.064*B,0.05*B,0.24,0.009),sleeve,[0,-0.17,0]);
    const el=new THREE.Group();el.position.y=-0.34;sh.add(el);
    M(el,G3.ell(0.05*B,0.05,0.05),fore,[0,0,0],{ol:0});
    M(el,G3.limb(0.056*B,0.042*B,0.25,0.01),fore,[0,-0.155,0]);
    M(el,G3.ell(0.042*B,0.042,0.045),fore,[0,-0.29,0],{ol:0});
    const wr=new THREE.Group();wr.position.y=-0.32;el.add(wr);
    // il pugno sta sull'avambraccio (non ruota con il polso): l'impugnatura dell'arma lo attraversa di traverso
    R.hands.push(M(el,G3.rb(0.074,0.1,0.092,0.034),glove,[0,-0.32,0.004]));
    R.hands.push(M(el,G3.ell(0.024,0.036,0.026,14,10),glove,[-s*0.02,-0.308,0.052],{ol:0.008}));
    R.arms.push({sh,el,wr});
  }
  R.cape=new THREE.Group();R.cape.position.set(0,0.07,-0.118);R.chest.add(R.cape);
  return R;
}

/* ---------- Pezzi ---------- */
// catena di stoffa che ondeggia (stesso formato di R.flows del gioco)
function flow2(R,par,pos,n,len,w0,w1,m,base,amp,cv,jag,th){
  const segs=[];let p=par;
  for(let i=0;i<n;i++){const g=new THREE.Group();if(i===0)g.position.set(pos[0],pos[1],pos[2]);else g.position.y=-len;p.add(g);
    M(g,G3.panel(lerp(w0,w1,i/n),lerp(w0,w1,(i+1)/n),len+0.03,th||0.022,cv||0,i===n-1?jag:0),m,[0,0.015,0]);
    g.rotation.x=i===0?base:0.08;segs.push(g);p=g;}
  R.flows.push({segs,base,amp:amp==null?1:amp});return segs;
}
// catena con supporto ruotato in y (pannelli ai fianchi e dietro): base/amp invertiti perché ondeggino verso fuori
function flowAt(R,par,pos,ry,n,len,w0,w1,m,base,amp,cv,jag){
  const h=new THREE.Group();h.position.set(pos[0],pos[1],pos[2]);h.rotation.y=ry;par.add(h);
  const k=Math.abs(ry)>0.3?-1:1;return flow2(R,h,[0,0,0],n,len,w0,w1,m,base*k,(amp==null?1:amp)*k,cv,jag);
}
const SP={
  cape(R,m,o){o=o||{};if(o.yoke!==false)SP.shell(R,m,0.5,0.705,0.013,Math.PI-1.45,2.9);return flow2(R,R.cape,[0,0,0],o.n||3,o.len||0.3,o.w0||0.4,o.w1||0.56,m,o.base==null?0.1:o.base,o.amp||1,o.cv==null?0.12:o.cv,o.jag||0,o.th);},
  // gonna/veste a pannelli intorno al bacino
  skirt(R,m,o){o=o||{};const n=o.n||2,len=o.len||0.2,w=o.w||0.28,B=R.B,cv=o.cv==null?-0.05:o.cv,y=o.y==null?-0.02:o.y;
    flowAt(R,R.pelvis,[0,y,0.11*B],0,n,len,w,w*(o.flare||1.15),m,0.05,0.6,cv,o.jag);
    flowAt(R,R.pelvis,[0,y,-0.11*B],Math.PI,n,len,w+0.02,(w+0.02)*(o.flare||1.15),m,0.1,0.8,cv,o.jag);
    if(o.sides!==false)for(const s of [-1,1])flowAt(R,R.pelvis,[s*0.14*B,y,0],s*Math.PI/2,n,len*0.97,w*0.68,w*0.68*(o.flare||1.15),m,0.04,0.35,cv,o.jag);},
  // striscia singola sul davanti (tabarro, perizoma, fascia)
  flap(R,m,o){o=o||{};return flow2(R,o.par||R.pelvis,o.pos||[0,-0.02,0.12*R.B],o.n||2,o.len||0.18,o.w0||0.22,o.w1||o.w0||0.22,m,o.base==null?0.05:o.base,o.amp==null?0.6:o.amp,o.cv==null?-0.04:o.cv,o.jag);},
  backFlap(R,m,o){o=o||{};return flowAt(R,R.pelvis,o.pos||[0,-0.02,-0.12*R.B],Math.PI,o.n||2,o.len||0.18,o.w0||0.24,o.w1||o.w0||0.24,m,0.1,0.8,o.cv==null?-0.04:o.cv,o.jag);},
  shell(R,m,y0,y1,off,ps,pl,bulge){return M(R.torso,torsoGeo(R.B,off,y0,y1,ps,pl,bulge),m);},
  belt(R,m,bm,o){o=o||{};const y=o.y==null?0.05:o.y,r=tR(y,R.B)+(o.off||0.012),zs=(tR(y,R.B)*TZ+(o.off||0.012))/r;
    M(R.torso,G3.hring(r,o.t||0.026,zs),m,[0,y,0]);
    if(bm)M(R.torso,o.buckle||G3.rb(0.07,0.06,0.03,0.012),bm,[0,y,tZ(y,0,R.B,(o.off||0.012)+0.02)]);},
  // anello che segue il busto a quota y
  band(R,m,y,off,t){const r=tR(y,R.B)+off,zs=(tR(y,R.B)*TZ+off)/r;return M(R.torso,G3.hring(r,t||0.018,zs),m,[0,y,0]);},
  // mantellina sulle spalle (a campana)
  capelet(R,m,o){o=o||{};const len=o.len||0.22,r0=o.r0||0.092,r1=(o.r1||0.32)*R.B,y=o.y==null?0.1:o.y,th=0.02,sz=o.sz||0.78;
    const pts=[[r1,y-len],[lerp(r1,r0,0.45)+0.03,y-len*0.45],[r0,y],[r0-th,y],[lerp(r1,r0,0.45)+0.03-th,y-len*0.45],[r1-th,y-len],[r1,y-len]];
    const g=G3.lathe(pts,48);g.scale(1,1,sz);return M(R.chest,g,m,[0,0,0]);},
  collar(R,m,o){o=o||{};const g=G3.lathe([[o.r1||0.13,0],[o.r0||0.12,0.001],[o.r0||0.12,o.h||0.13],[(o.r0||0.12)+0.04,(o.h||0.13)+0.04],[(o.r0||0.12)+0.02,(o.h||0.13)+0.04],[(o.r0||0.12)-0.02,(o.h||0.13)],[(o.r1||0.13)-0.02,0.001]],40,o.ps,o.pl);g.scale(1,1,0.9);
    return M(R.chest,g,m,[0,o.y==null?0.07:o.y,-0.01]);},
  hood(R,m,o){o=o||{};const hd=R.head,r=o.r||0.228,open=o.open||1.5,depth=o.depth||0.74,brow=o.brow||0.36,sy=1.06,sz=1.04,cy=o.cy==null?0.02:o.cy,cz=o.cz==null?-0.02:o.cz;
    M(hd,G3.dome(r,brow+0.01,sy,sz),m,[0,cy,cz]);
    const low=new THREE.SphereGeometry(r,48,20,Math.PI/2+open/2,TAU-open,Math.PI*brow,Math.PI*(depth-brow));low.scale(1,sy,sz);M(hd,low,m,[0,cy,cz]);
    const sp=(th,ph,k)=>[-r*k*Math.cos(ph)*Math.sin(th),cy+r*k*sy*Math.cos(th),cz+r*k*sz*Math.sin(ph)*Math.sin(th)];
    const pa=Math.PI/2-open/2,pb=Math.PI/2+open/2,edge=[];
    for(let i=0;i<=8;i++)edge.push(sp(Math.PI*lerp(depth,brow,i/8),pa,1));
    for(let i=1;i<8;i++)edge.push(sp(Math.PI*brow-Math.sin(i/8*Math.PI)*0.06,lerp(pa,pb,i/8),1));
    for(let i=0;i<=8;i++)edge.push(sp(Math.PI*lerp(brow,depth,i/8),pb,1));
    M(hd,G3.tube(edge,o.rimT||0.02,o.rimT||0.02,64,10),o.rim||m,null,{ol:0.012});
    if(o.peak!==false)M(hd,G3.tube([[0,0.15,-0.12],[0,0.13,-0.25],[0,0.04,-0.32]],0.075,0.012,18,14),m,null);
    if(o.cowl!==false){const yb=0.33+cy+r*sy*Math.cos(Math.PI*depth),rb=r*Math.sin(Math.PI*depth);SP.cowl(R,m,yb+0.025,rb-0.012,o.cowlY==null?0.0:o.cowlY,(o.cowlR||0.255)*R.B,o.cowlGap==null?open+0.25:o.cowlGap);}},
  // drappo del cappuccio: dal bordo del cappuccio scende sulle spalle, aperto davanti
  cowl(R,m,y0,r0,y1,r1,gap){const th=0.016,pts=[[r1,y1],[lerp(r1,r0,0.5)+0.02,(y0+y1)/2],[r0,y0],[r0-th,y0],[lerp(r1,r0,0.5)+0.02-th,(y0+y1)/2],[r1-th,y1],[r1,y1]];
    const g=G3.lathe(pts,48,gap/2,TAU-gap),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const k=clamp((p.getY(i)-y1)/(y0-y1),0,1);p.setZ(i,p.getZ(i)*lerp(0.8,1.04,k)-0.02*k);}
    g.computeVertexNormals();return M(R.chest,g,m,[0,0,0]);},
  hair(R,m,style,o){o=o||{};const hd=R.head;
    const cap=(c)=>{const cg=G3.dome(1,c||0.47,1,1);cg.scale(0.181,0.212,0.198);M(hd,cg,m,[0,0.025,-0.012]);
      const back=new THREE.SphereGeometry(1,36,16,Math.PI+0.5,Math.PI-1.0,Math.PI*0.4,Math.PI*0.3);back.scale(0.181,0.212,0.198);M(hd,back,m,[0,0.025,-0.012]);};
    if(style==='bald')return;
    if(style==='short'||style==='long'||style==='ponytail'||style==='topknot'||style==='spiky'||style==='mane')cap(o.cover);
    if(style==='long'||style==='mane'){flow2(R,hd,[0,0.0,-0.165],o.n||3,o.len||0.16,o.w||0.3,(o.w||0.3)*1.1,m,0.12,0.5,0.14);
      for(const s of [-1,1])M(hd,G3.tube([[s*0.16,0.05,0.02],[s*0.19,-0.08,0.0],[s*0.18,-0.24,-0.02]],0.045,0.02,14,10),m,null);}
    if(style==='ponytail'){M(hd,G3.ell(0.05,0.05,0.05),o.tie||m,[0,0.08,-0.19]);flow2(R,hd,[0,0.08,-0.21],4,0.11,0.07,0.04,m,0.3,1.2,0.04);}
    if(style==='topknot'){M(hd,G3.ell(0.07,0.065,0.07),m,[0,0.21,-0.05]);M(hd,G3.hring(0.06,0.012,1),o.tie||m,[0,0.18,-0.05],{ol:0});}
    if(style==='spiky'||style==='mane'){const n=o.spikes||9;for(let i=0;i<n;i++){const a=(i/(n-1)-0.5)*2.6,up=0.12+0.06*Math.cos(a);
      M(hd,G3.tube([[Math.sin(a)*0.1,0.16,-0.04+Math.cos(a)*0.02],[Math.sin(a)*0.2,0.2+up*0.5,-0.12],[Math.sin(a)*0.27,0.15+up,-0.25]],0.06,0.006,14,10),m,null);}}
  },
  beard(R,m,o){o=o||{};const hd=R.head;
    M(hd,G3.ell(0.13,0.105,0.1),m,[0,-0.125,0.085]);
    for(const s of [-1,1])M(hd,G3.tube([[s*0.01,-0.055,0.188],[s*0.06,-0.07,0.18],[s*0.09,-0.11,0.15]],0.018,0.006,10,8),m,null,{ol:0.006});
    if(o.long)M(hd,G3.tube([[0,-0.16,0.13],[0,-0.3,0.15],[0,-0.44+(o.long>1?-0.12:0),0.1]],0.1,0.012,18,14),m,null);
    if(o.braids)for(const s of [-1,1]){M(hd,G3.tube([[s*0.05,-0.18,0.13],[s*0.06,-0.28,0.15],[s*0.05,-0.38,0.13]],0.032,0.022,14,10),m,null);
      if(o.bead)M(hd,G3.cyl(0.03,0.03,0.04,20),o.bead,[s*0.05,-0.4,0.13]);}
  },
  // maschera sul basso del viso
  lowMask(R,m){const g=G3.sphP(0.2,Math.PI/2-1.1,2.2,Math.PI*0.53,Math.PI*0.42);g.scale(1,1,1.04);M(R.head,g,m,[0,0.01,0.0]);},
  helmDome(R,m,o){o=o||{};const r=o.r||0.215;return M(R.head,G3.dome(r,o.cover||0.55,o.sy||1.06,o.sz||1.04),m,[0,o.y==null?0.03:o.y,-0.005]);},
  greatHelm(R,m,o){o=o||{};const hd=R.head;
    const pts=o.flat?[[0.2,-0.21],[0.21,-0.1],[0.213,0.08],[0.21,0.17],[0.19,0.19],[0.0,0.195]]:[[0.2,-0.21],[0.212,-0.12],[0.218,0.0],[0.214,0.1],[0.19,0.17],[0.13,0.225],[0.06,0.245],[0,0.25]];
    const g=G3.lathe(pts,48);g.scale(1,1,1.07);M(hd,g,m,[0,0.01,-0.004]);
    if(o.gorget!==false){const gg=G3.lathe([[0.19*R.B,0.0],[0.16,0.06],[0.125,0.12],[0.115,0.17],[0.095,0.17],[0.105,0.12],[0.14,0.06],[0.17*R.B,0.0],[0.19*R.B,0.0]],44);gg.scale(1,1,0.86);M(R.chest,gg,o.gorget||m,[0,0.0,-0.005]);}
    const slitM=o.glow||K0.dark;
    if(o.slit!==false){const s=G3.hring(0.217,0.017,1.07,1.5);s.scale(1,0.8,1);M(hd,s,slitM,[0,0.04,-0.004],{ol:0});}
    if(o.vslit)M(hd,G3.rb(0.03,0.13,0.03,0.01),slitM,[0,-0.06,0.228],{ol:0});
    if(o.ridge)M(hd,G3.vring(o.flat?0.2:0.235,0.02,Math.PI),o.ridge,[0,o.flat?0.0:0.01,0]);
    if(o.rim)M(hd,G3.hring(0.205,0.018,1.07),o.rim,[0,-0.2,-0.004]);
    if(o.breaths)for(let i=0;i<4;i++)for(const s of [-1,1])M(hd,G3.ell(0.008,0.008,0.01,10,8),K0.dark,[s*(0.09+i*0.022),-0.07-i*0.01,0.2-i*0.02],{ol:0});
  },
  horns(R,m,o){o=o||{};const k=o.k||1,hd=R.head;
    for(const s of [-1,1]){const pts=(o.pts||[[0.15,0.1,0],[0.27,0.16,0.02],[0.33,0.3,0.07],[0.3,0.42,0.13]]).map(p=>[s*p[0]*k,p[1]*k+(o.y||0)*(1-k)+(o.dy||0),p[2]*k]);
      M(hd,G3.tube(pts,o.r||0.055,0.006,24,14),m,null);}},
  pauldron(R,m,o){o=o||{};const n=o.layers||3,r=(o.r||0.11)*R.B;
    for(const [i,a] of R.arms.entries()){const s=i===0?-1:1;
      for(let k=0;k<n;k++){const d=M(a.sh,G3.dome(r*(1-k*0.07),0.5,0.68,1.15),k===0?m:(o.m2||m),[s*(0.012+k*0.012),0.02-k*0.05,0],{r:[0,0,-s*(0.32+k*0.14)]});
        if(o.trim&&k===0)M(d,G3.hring(r,0.012,1.15),o.trim,[0,0,0],{ol:0});}
      if(o.spikes)for(let k=0;k<o.spikes;k++)M(a.sh,G3.cone(0.03,0.13,20),o.spikeM||m,[s*(0.05+k*0.02),0.08-k*0.015,-0.04+k*0.05],{r:[0,0,-s*0.7]});}},
  // gusci sugli arti (bracciali, gambali)
  bracer(R,m,o){o=o||{};for(const a of R.arms){M(a.el,G3.limb((o.r0||0.064)*R.B,(o.r1||0.052)*R.B,o.len||0.16,0),m,[0,o.y==null?-0.18:o.y,0]);if(o.ring)M(a.el,G3.hring(0.058*R.B,0.012,1),o.ring,[0,-0.26,0],{ol:0});}},
  upperArm(R,m,o){o=o||{};for(const a of R.arms)M(a.sh,G3.limb(0.074*R.B,0.06*R.B,o.len||0.2,0),m,[0,o.y==null?-0.16:o.y,0]);},
  greave(R,m,km,o){o=o||{};for(const l of R.legs){M(l.knee,G3.limb(0.072*R.B,0.058*R.B,o.len||0.28,0.004),m,[0,-0.2,0.003]);if(km)M(l.knee,G3.ell(0.06,0.066,0.05),km,[0,0,0.05]);}},
  cuisse(R,m,o){o=o||{};for(const l of R.legs)M(l.hip,G3.limb(0.1*R.B,0.078*R.B,o.len||0.26,0),m,[0,-0.22,0.004]);},
  bootCuff(R,m,o){o=o||{};for(const l of R.legs)M(l.foot,G3.hring(0.07*R.B,o.t||0.03,1),m,[0,o.y||0.18,0]);},
  hands(R,m){for(const h of R.hands)h.material=m;},
  boots(R,m){for(const b of R.boots)b.material=m;},
  // scudo sul braccio dietro (come nel gioco)
  shield(R,m,o){o=o||{};const sh=new THREE.Group();sh.position.set(0.09,-0.2,0.05);R.arms[1].el.add(sh);R.shield=sh;
    const sc=o.scale||1,shape=o.shape||'kite';
    const draw=k=>s=>{if(shape==='round'){s.absarc(0,0,0.36*k,0,TAU,false);}
      else if(shape==='heater'){s.moveTo(-0.3*k,0.3*k);s.lineTo(0.3*k,0.3*k);s.lineTo(0.3*k,0.02*k);s.quadraticCurveTo(0.28*k,-0.3*k,0,-0.46*k);s.quadraticCurveTo(-0.28*k,-0.3*k,-0.3*k,0.02*k);s.lineTo(-0.3*k,0.3*k);}
      else{s.moveTo(0,0.36*k);s.quadraticCurveTo(0.3*k,0.34*k,0.3*k,0.05*k);s.quadraticCurveTo(0.25*k,-0.3*k,0,-0.5*k);s.quadraticCurveTo(-0.25*k,-0.3*k,-0.3*k,0.05*k);s.quadraticCurveTo(-0.3*k,0.34*k,0,0.36*k);}};
    const face=G3.shape(draw(sc),0.04,0.016);face.rotateY(Math.PI/2);M(sh,face,m,[0,0,0]);
    if(o.trim){const rim=G3.shape(draw(sc*1.07),0.03,0.012);rim.rotateY(Math.PI/2);M(sh,rim,o.trim,[0,0,0],{ol:0});}
    if(o.emblem)for(const s of [-1,1]){const e=new THREE.Group();e.position.x=s*0.04;e.rotation.y=s*Math.PI/2;sh.add(e);o.emblem(e,sc);}
    return sh;},
  // piccoli emblemi piatti (su un gruppo che guarda +z)
  cross(par,m,h,w,t,y){M(par,G3.rb(t,h,0.02,0.008),m,[0,y||0,0],{ol:0.006});M(par,G3.rb(w,t,0.02,0.008),m,[0,(y||0)+h*0.18,0],{ol:0.006});},
  sun(par,m,r,n,y){y=y||0;M(par,new THREE.CylinderGeometry(r,r,0.02,32).rotateX(Math.PI/2),m,[0,y,0],{ol:0.006});
    for(let i=0;i<(n||12);i++){const a=i/(n||12)*TAU;M(par,G3.cone(r*0.22,r*0.7,12).rotateX(Math.PI/2).rotateZ(0),m,[Math.cos(a)*r*1.35,y+Math.sin(a)*r*1.35,0],{r:[0,0,a-Math.PI/2],ol:0});}},
  // decorazione appoggiata sul petto (y = quota del busto)
  onChest(R,y,x,off){const g=new THREE.Group();g.position.set(x||0,y,tZ(y,x||0,R.B,off==null?0.03:off));R.torso.add(g);return g;},
  quiver(R,m,o){o=o||{};const q=new THREE.Group();q.position.set(0.06,-0.14,-0.178);q.rotation.z=-0.45;R.chest.add(q);
    M(q,G3.cyl(0.07,0.06,0.46,28),m,[0,0,0]);M(q,G3.hring(0.072,0.014,1),o.trim||m,[0,0.2,0],{ol:0});
    for(let i=0;i<4;i++){const x=(i-1.5)*0.03;M(q,G3.cyl(0.008,0.008,0.18,8),o.shaft||m,[x,0.3,(i%2)*0.02-0.01],{ol:0});M(q,G3.leaf(0.05,0.08,0.006),o.fl||m,[x,0.33,(i%2)*0.02-0.01],{ol:0.006});}
    SP.strap(R,m,[[0.17,0.62],[0.0,0.4],[-0.15,0.14]],{w:0.034});SP.strap(R,m,[[0.17,0.62],[0.0,0.42],[-0.15,0.16]],{w:0.034,back:true});return q;},
  // ali di piume
  wings(R,m,o){o=o||{};const wg=[];
    for(const s of [-1,1]){const w=new THREE.Group();w.position.set(s*0.07,-0.02,-0.112);w.rotation.set(-0.2,s*0.35,s*0.15);R.chest.add(w);wg.push({w,s});
      const rows=[[7,0.42,0.075,m],[6,0.3,0.065,o.m2||m],[5,0.2,0.05,o.m3||o.m2||m]];
      rows.forEach(([n,len,wd,mm],ri)=>{for(let i=0;i<n;i++){const a=0.15+i*0.22,f=new THREE.Group();f.position.set(s*(0.06+i*0.075+ri*0.02),0.08+i*0.035-ri*0.04,-0.02-ri*0.012);f.rotation.z=s*(Math.PI*0.62+a*0.9)-(s>0?0:0);w.add(f);
        const L=len*(1-i*0.04)*(o.k||1);M(f,G3.leaf(wd,L,0.012,true),mm,[0,0,0],{ol:0.009});}});}
    R.tick.push((R,t)=>{for(const {w,s} of wg)w.rotation.y=s*(0.35+Math.sin(t*1.4)*0.08);});},
  // stelle/sfere che orbitano
  orbit(R,m,n,r,y,par){const o=new THREE.Group();o.position.set(0,y,0);(par||R.head).add(o);R.orbit=o;
    for(let i=0;i<n;i++)M(o,new THREE.OctahedronGeometry(0.045,1),m,[Math.cos(i/n*TAU)*r,Math.sin(i*1.7)*0.04,Math.sin(i/n*TAU)*r],{ol:0});
    R.tick.push((R,t,dt)=>{o.rotation.y+=dt*1.8;});return o;},
  // fiamme o cristalli che tremolano
  flicker(R,meshes,sp){const base=meshes.map(x=>x.scale.clone());R.tick.push((R,t)=>meshes.forEach((x,i)=>{const k=1+Math.sin(t*(sp||9)+i*1.7)*0.12+Math.sin(t*(sp||9)*2.3+i)*0.06;x.scale.set(base[i].x*(2-k)*0.5+base[i].x*0.5,base[i].y*k,base[i].z*(2-k)*0.5+base[i].z*0.5);}));},
  staffHand(R,fx,gold){const hg=new THREE.Group();hg.userData.skin=true;R.arms[1].wr.add(hg);R.handRings=magicHand(hg,fx,gold);},
};

Object.assign(SP,{
  strap(R,m,pts,o){o=o||{};const B=R.B,off=o.off||0.012,w=o.w||0.04,th=o.th||0.012,side=o.back?-1:1,n=o.seg||32;
    const c=new THREE.CatmullRomCurve3(pts.map(p=>V3(p[0],p[1],0))),Pp=[],N=[];
    for(let i=0;i<=n;i++){const q=c.getPointAt(i/n),r=tR(q.y,B),x=clamp(q.x,-r*0.97,r*0.97),z=side*tZ(q.y,x,B,off);Pp.push(V3(x,q.y,z));N.push(V3(x/(r*r),0,z/(r*TZ*r*TZ)).normalize());}
    const pos=[],idx=[],s=new THREE.Vector3();
    for(let i=0;i<=n;i++){const tg=(i<n?Pp[i+1].clone().sub(Pp[i]):Pp[i].clone().sub(Pp[i-1])).normalize();s.crossVectors(tg,N[i]).normalize();
      for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const v=Pp[i].clone().addScaledVector(s,a*w/2).addScaledVector(N[i],b*th/2);pos.push(v.x,v.y,v.z);}}
    for(let i=0;i<n;i++)for(let k=0;k<4;k++){const a=i*4+k,b=i*4+(k+1)%4;idx.push(a,b+4,b,a,a+4,b+4);}
    const L=n*4;idx.push(0,1,2,0,2,3,L,L+2,L+1,L,L+3,L+2);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    return M(R.torso,g,m,null,{ol:0.008});},
  sleeve(R,m,o){o=o||{};for(const a of R.arms)M(a.el,G3.lathe([[o.r||0.115,-(o.len||0.3)],[0.088,-(o.len||0.3)*0.6],[0.064,-0.02],[0.06,0.03]],40),m,[0,0,0]);},
  star(par,m,r,pos,rot){const g=G3.shape(s=>{for(let i=0;i<10;i++){const a=Math.PI/2+i/10*TAU,rr=i%2?r*0.45:r;i?s.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):s.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}},r*0.25,r*0.12);
    return M(par,g,m,pos||[0,0,0],{r:rot,ol:0.006});},
  onBack(R,y,x,off){const g=new THREE.Group();g.position.set(x||0,y,-tZ(y,x||0,R.B,off==null?0.03:off));g.rotation.y=Math.PI;R.torso.add(g);return g;},
  // fila di elementi intorno alle spalle/collo (pellicce, piume, foglie, perle)
  around(R,par,n,rx,rz,y,fn,a0,a1){for(let i=0;i<n;i++){const t=n===1?0.5:i/(n-1),a=lerp(a0==null?-Math.PI:a0,a1==null?Math.PI:a1,t);
    const g=new THREE.Group();g.position.set(Math.sin(a)*rx,y,Math.cos(a)*rz);g.rotation.y=a;par.add(g);fn(g,i,a);}},
  // linea di elementi su una curva (catene, rosari)
  chain(par,m,pts,n,r){const c=new THREE.CatmullRomCurve3(pts.map(p=>V3(p[0],p[1],p[2])));for(let i=0;i<n;i++){const t=i/(n-1),p=c.getPointAt(t),d=c.getTangentAt(t);
    const l=M(par,G3.tor(r||0.022,(r||0.022)*0.32,TAU,20,8),m,[p.x,p.y,p.z],{ol:0.005});l.lookAt(l.position.clone().add(d));if(i%2)l.rotateZ(Math.PI/2);}},
  // arco davanti al busto a quota y (per costole, lacci, decorazioni) come tubo
  chestArc(R,m,y,w,off,r){const pts=[];for(let i=0;i<=8;i++){const x=lerp(-w,w,i/8);pts.push([x,y-Math.abs(x)*0.25,tZ(y,x,R.B,off)]);}return M(R.torso,G3.tube(pts,r||0.016,r||0.016,30,8),m,null,{ol:0.008});},
});
const K0={dark:new THREE.MeshBasicMaterial({color:0x14101a})};

// ===== Le 42 skin: 3 versioni per ognuna delle 14 classi =====
// Ogni skin: name, desc, body (colori e corporatura) e make(R,K) che aggiunge i pezzi.
const GOLD=0xd9b45a;
const goldM=K=>K.m(GOLD,{emissive:0x5a3a00,emissiveIntensity:0.22});
const glowFlames=(R,K,par,n,cols,y,spread,h)=>{const fl=[];for(let i=0;i<n;i++){const a=(i/(n-1)-0.5)*spread,x=Math.sin(a)*0.13,z=Math.cos(a)*0.04-0.03;
  fl.push(M(par,G3.tube([[x,y,z],[x*1.3,y+h*0.45,z-0.04],[x*0.7,y+h*(0.9+0.2*Math.cos(i*2.1)),z-0.12]],0.065,0.004,16,10),K.g(cols[i%cols.length],1.6),null,{ol:0}));}
  SP.flicker(R,fl,10);return fl;};

const SKINS={
/* ---------------- CAVALIERE ---------------- */
cavaliere:[
{name:'Guardia reale',desc:'Piastre lucide blu e argento, elmo chiuso con pennacchio, mantello lungo.',
 body:{skin:0xe2b08c,shirt:0x2a3e66,sleeve:0xc9ced8,fore:0xc9ced8,pants:0x2a3550,boot:0xaeb4c0,glove:0xc9ced8},
 make(R,K){const metal=K.m(0xc9ced8),blue=K.m(0x3d6fb6),gold=goldM(K),cape=K.ds(0x274a7d);
  SP.greatHelm(R,metal,{ridge:gold,rim:gold,breaths:true});
  M(R.head,G3.tube([[0,0.24,0],[0,0.36,-0.07],[0,0.36,-0.22],[0,0.2,-0.36]],0.055,0.012,26,14),blue,null);
  SP.shell(R,metal,0.22,0.68,0.03);SP.shell(R,metal,0.03,0.25,0.026);SP.band(R,gold,0.235,0.033,0.013);SP.band(R,gold,0.665,0.03,0.016);
  SP.cross(SP.onChest(R,0.47,0,0.038),gold,0.2,0.13,0.035,-0.02);
  SP.pauldron(R,metal,{layers:3,trim:gold,r:0.115});SP.upperArm(R,metal);SP.bracer(R,metal,{ring:gold});
  SP.cuisse(R,metal);SP.greave(R,metal,metal);SP.belt(R,K.m(0x4a3220),gold);
  SP.flap(R,blue,{len:0.2,w0:0.2,w1:0.22});SP.backFlap(R,blue,{len:0.2});
  SP.cape(R,cape,{n:3,len:0.32,w0:0.42,w1:0.6});
  SP.shield(R,blue,{trim:gold,emblem:(e,k)=>SP.cross(e,gold,0.42*k,0.3*k,0.06*k,-0.05)});}},
{name:'Templare',desc:'Sopravveste bianca con croce rossa, cotta di maglia, elmo a secchio e scudo a goccia.',
 body:{skin:0xd9a882,shirt:0x8d939c,sleeve:0x8d939c,fore:0x8d939c,pants:0x8d939c,boot:0x5a4636,glove:0x6b5a48},
 make(R,K){const white=K.m(0xeee8da),red=K.m(0xb52a2a),steel=K.m(0xb8bec8),brown=K.m(0x5a3e28);
  SP.greatHelm(R,steel,{flat:true,vslit:true,breaths:true,rim:K.m(0xc8963a)});
  M(R.head,G3.rb(0.03,0.2,0.03,0.01),K.m(0xc8963a),[0,-0.05,0.226],{ol:0.008});
  SP.shell(R,white,-0.06,0.69,0.022);
  SP.cross(SP.onChest(R,0.43,0,0.03),red,0.3,0.22,0.06,-0.02);SP.cross(SP.onBack(R,0.43,0,0.03),red,0.3,0.22,0.06,-0.02);
  SP.skirt(R,white,{len:0.22,n:2,w:0.28});SP.belt(R,brown,steel);
  for(const l of R.legs)M(l.knee,G3.ell(0.064,0.07,0.05),steel,[0,0,0.05]);
  SP.cape(R,K.ds(0xe8e2d4),{len:0.34,n:3,w0:0.44,w1:0.6});
  SP.shield(R,white,{shape:'heater',trim:steel,emblem:(e,k)=>SP.cross(e,red,0.62*k,0.5*k,0.1*k,-0.06)});}},
{name:'Cavaliere d\'ossidiana',desc:'Piastre nere bordate d\'oro, corna sull\'elmo, visiera che arde e mantello strappato.',
 body:{skin:0xc9a080,shirt:0x1e1d24,sleeve:0x2b2a33,fore:0x2b2a33,pants:0x1e1d24,boot:0x2b2a33,glove:0x2b2a33},
 make(R,K){const dark=K.m(0x2b2a33),gold=K.m(0xd9a640,{emissive:0x5a3a00,emissiveIntensity:0.3}),red=K.ds(0x8a1a1f),ember=K.g(0xff4a2e,2.2);
  SP.greatHelm(R,dark,{ridge:gold,rim:gold,glow:ember});
  SP.horns(R,K.m(0x3a3036),{pts:[[0.17,0.08,0.02],[0.27,0.13,0.08],[0.31,0.24,0.16],[0.28,0.35,0.25]],r:0.048});
  SP.shell(R,dark,0.22,0.68,0.03);SP.shell(R,dark,0.03,0.25,0.026);SP.band(R,gold,0.235,0.033,0.013);SP.band(R,gold,0.665,0.03,0.016);
  SP.sun(SP.onChest(R,0.46,0,0.04),gold,0.045,10);
  SP.pauldron(R,dark,{layers:3,trim:gold,spikes:2,spikeM:gold,r:0.12});SP.upperArm(R,dark);SP.bracer(R,dark,{ring:gold});
  SP.cuisse(R,dark);SP.greave(R,dark,gold);SP.belt(R,K.m(0x1a1418),gold);
  SP.flap(R,red,{jag:0.05,len:0.2});SP.backFlap(R,red,{len:0.2});
  SP.cape(R,red,{len:0.34,n:3,jag:0.08,w0:0.44,w1:0.64});
  SP.shield(R,dark,{trim:gold,emblem:(e,k)=>SP.sun(e,gold,0.075*k,12,0)});}},
],
/* ---------------- BERSERKER ---------------- */
berserker:[
{name:'Jarl del nord',desc:'Elmo con corna e nasale, barba rossa intrecciata, pelliccia sulle spalle e kilt.',
 body:{skin:0xd9a07a,shirt:'skin',sleeve:'skin',pants:0x5b3a24,boot:0x6b4a2e,hair:0xc0612b,build:1.1},
 make(R,K){const iron=K.m(0x8a8f99),horn=K.m(0xe6dcc6),fur=K.m(0x7a5a3a),fur2=K.m(0x5a4028),lea=K.m(0x6b4a2e),red=K.m(0x9c3b2e),beard=K.m(0xc0612b),gold=goldM(K),woad=K.m(0x2f5aa8);
  SP.hair(R,beard,'long',{len:0.13,w:0.28});SP.helmDome(R,iron,{cover:0.48});
  M(R.head,G3.rb(0.04,0.15,0.03,0.012),iron,[0,0.0,0.2]);M(R.head,G3.hring(0.214,0.02,1.04),gold,[0,0.08,-0.005]);
  SP.horns(R,horn,{pts:[[0.15,0.13,0],[0.27,0.18,0.03],[0.34,0.31,0.08],[0.31,0.45,0.12]]});
  SP.beard(R,beard,{braids:true,bead:gold});
  for(const s of [-1,1])M(R.face,G3.rb(0.05,0.016,0.02,0.006),woad,[s*0.072,-0.025,0.158],{r:[0,0,-s*0.25],ol:0});
  SP.capelet(R,fur,{len:0.15,r1:0.3});SP.around(R,R.chest,12,0.22,0.16,0.07,(g,i)=>M(g,G3.ell(0.09,0.07,0.08),i%2?fur:fur2,[0,0,0]),-2.6,2.6);
  SP.strap(R,lea,[[0.16,0.62],[0.0,0.38],[-0.15,0.1]],{w:0.045});SP.strap(R,lea,[[0.16,0.62],[0.0,0.4],[-0.15,0.12]],{w:0.045,back:true});
  SP.bracer(R,lea,{ring:iron,r0:0.07,r1:0.058});SP.belt(R,lea,iron,{t:0.034});
  SP.skirt(R,red,{len:0.17,n:2,w:0.26});SP.bootCuff(R,fur,{t:0.036,y:0.17});
  SP.cape(R,K.ds(0x5a4028),{len:0.26,n:2,w0:0.44,w1:0.52,jag:0.05});}},
{name:'Pelle di lupo',desc:'Testa di lupo come cappuccio, zampe sul petto, pittura di guerra blu.',
 body:{skin:0xc8906a,shirt:'skin',sleeve:'skin',pants:0x3a3028,boot:0x4a3a2e,hair:0x2a2420,build:1.08},
 make(R,K){const wolf=K.m(0x8a8a8a),wolf2=K.m(0x5e5e62),woad=K.m(0x2f5aa8),bone=K.m(0xe6dcc6),lea=K.m(0x4a3424),dk=K.m(0x2a2420);
  SP.hair(R,dk,'long',{len:0.14});SP.beard(R,dk);
  const w=new THREE.Group();w.position.set(0,0.15,0.03);R.head.add(w);
  M(w,G3.ell(0.215,0.15,0.23),wolf,[0,0,-0.01]);M(w,G3.ell(0.12,0.1,0.11),wolf,[0,0.01,0.16]);
  M(w,G3.ell(0.075,0.07,0.17),wolf,[0,-0.035,0.27]);M(w,G3.ell(0.065,0.04,0.12),K.m(0xc8c8c8),[0,-0.075,0.28],{ol:0});
  M(w,G3.ell(0.032,0.026,0.026),K.dark,[0,-0.01,0.43],{ol:0});
  for(const s of [-1,1]){M(w,G3.cone(0.065,0.16,24),wolf,[s*0.12,0.15,-0.02],{r:[-0.15,0,-s*0.28]});M(w,G3.ell(0.026,0.016,0.012),K.g(0xffb347,2),[s*0.068,0.06,0.255],{r:[0,s*0.4,0],ol:0});
    M(w,G3.cone(0.016,0.07,12),bone,[s*0.045,-0.11,0.34],{r:[Math.PI,0,0],ol:0});}
  for(const s of [-1,1])M(R.head,G3.ell(0.07,0.13,0.12),wolf,[s*0.19,-0.02,-0.06]);
  for(const s of [-1,1]){M(R.chest,G3.tube([[s*0.17,0.1,0.02],[s*0.12,-0.04,0.15],[s*0.04,-0.14,0.17]],0.045,0.032,18,12),wolf,null);
    for(let k=-1;k<=1;k++)M(R.chest,G3.cone(0.01,0.04,10),bone,[s*0.04+k*0.018,-0.17,0.19],{r:[Math.PI,0,0],ol:0});}
  SP.capelet(R,wolf,{len:0.16,r1:0.29});SP.cape(R,K.ds(0x7a7a7e),{len:0.28,n:3,w0:0.36,w1:0.46,jag:0.06});
  const e=SP.onChest(R,0.47,0,0.004);for(let i=0;i<3;i++)for(const s of [-1,1])M(e,G3.rb(0.07,0.013,0.012,0.005),woad,[s*0.07,-i*0.045-0.04,0],{r:[0,0,s*0.35],ol:0});
  for(const a of R.arms)for(let i=0;i<2;i++)M(a.sh,G3.hring(0.064,0.011,1),woad,[0,-0.14-i*0.05,0],{ol:0});
  SP.bracer(R,lea,{r0:0.066,r1:0.055});SP.belt(R,lea,bone,{t:0.03,buckle:G3.ell(0.04,0.04,0.025)});
  SP.flap(R,wolf2,{len:0.2,jag:0.04});SP.backFlap(R,wolf2,{len:0.2});
  for(const l of R.legs)for(let i=0;i<3;i++)M(l.knee,G3.hring(0.062,0.012,1),lea,[0,-0.12-i*0.06,0],{ol:0});}},
{name:'Signore della guerra',desc:'Maschera a teschio con corna d\'ariete, spallacci chiodati, gonna di maglia e mantello cremisi.',
 body:{skin:0xb88464,shirt:0x2a2420,sleeve:'skin',pants:0x2a2420,boot:0x3a3036,glove:0x3a3036,build:1.12},
 make(R,K){const iron=K.m(0x4a4a52),rust=K.m(0x8e3b2c),bone=K.m(0xe6dcc6),red=K.ds(0x6a1a14),glow=K.g(0xff3b1f,2.2);
  SP.greatHelm(R,iron,{slit:false,rim:rust});
  M(R.head,G3.sphP(0.226,Math.PI/2-0.95,1.9,Math.PI*0.2,Math.PI*0.62),bone,[0,0.01,0.012]);
  for(const s of [-1,1]){M(R.head,G3.ell(0.05,0.042,0.03),K.dark,[s*0.068,0.035,0.215],{r:[0,0,-s*0.3],ol:0});M(R.head,G3.ell(0.017,0.017,0.01),glow,[s*0.068,0.035,0.236],{ol:0});}
  M(R.head,G3.ell(0.022,0.03,0.02),K.dark,[0,-0.035,0.235],{ol:0});
  for(let i=0;i<7;i++)M(R.head,G3.rb(0.016,0.034,0.014,0.005),K.m(0xf4ecdc),[(i-3)*0.02,-0.115,0.222-Math.abs(i-3)*0.006],{ol:0.004});
  SP.horns(R,bone,{pts:[[0.17,0.12,-0.02],[0.3,0.17,-0.07],[0.37,0.05,0.0],[0.3,-0.06,0.08]],r:0.062});
  SP.shell(R,iron,0.22,0.68,0.03);SP.band(R,rust,0.4,0.035,0.012);
  SP.pauldron(R,iron,{layers:2,spikes:3,spikeM:bone,r:0.13,trim:rust});SP.bracer(R,iron,{ring:rust});SP.greave(R,iron,iron);
  SP.belt(R,K.m(0x3a2a20),bone,{t:0.034,buckle:G3.ell(0.05,0.05,0.035)});
  SP.skirt(R,K.m(0x5a5a62),{len:0.2,n:2,w:0.27,jag:0.03});
  SP.cape(R,red,{len:0.32,n:3,jag:0.08,w0:0.46,w1:0.62});}},
],
/* ---------------- LANCIERE ---------------- */
lanciere:[
{name:'Dragone',desc:'Elmo a punta con alette, armatura a scaglie, sciarpa e cresta rosse.',
 body:{skin:0xe0b08a,shirt:0x237a70,sleeve:0x237a70,fore:0xd5dbe3,pants:0x1d5a54,boot:0x3a3a40,glove:0x2a2830},
 make(R,K){const steel=K.m(0xd5dbe3),teal=K.m(0x2f9c8f),red=K.m(0xd94b3a),redD=K.ds(0xc23a2c);
  const up=G3.lathe([[0.216,0.06],[0.19,0.16],[0.12,0.27],[0.05,0.36],[0,0.4]]);up.scale(1,1,1.05);M(R.head,up,steel,[0,0,0]);
  const lo=G3.lathe([[0.21,-0.17],[0.218,-0.05],[0.216,0.06]],48,0.75,TAU-1.5);lo.scale(1,1,1.05);M(R.head,lo,K.ds(0xd5dbe3),[0,0,0]);
  M(R.head,G3.hring(0.22,0.02,1.05),red,[0,0.06,0]);
  for(const s of [-1,1])M(R.head,G3.leaf(0.13,0.3,0.014,true),teal,[s*0.21,0.1,-0.04],{r:[-0.9,s*Math.PI/2,0]});
  flow2(R,R.head,[0,0.38,-0.03],4,0.14,0.07,0.05,redD,2.0,0.7,0.02);
  SP.shell(R,steel,0.2,0.68,0.024);for(let i=0;i<6;i++)SP.band(R,i%2?teal:steel,0.24+i*0.075,0.034,0.014);
  M(R.chest,G3.hring(0.09,0.03,1),red,[0,0.1,0]);flow2(R,R.chest,[0.04,0.1,-0.1],4,0.2,0.14,0.11,redD,0.45,1.2,0.04);
  SP.pauldron(R,steel,{layers:3,trim:red,r:0.11});SP.bracer(R,steel);SP.greave(R,steel,teal);
  SP.belt(R,K.m(0x2a2830),red);SP.skirt(R,teal,{len:0.17,n:2,w:0.25});}},
{name:'Legionario',desc:'Elmo romano con cresta trasversale, lorica a fasce, tunica rossa e sandali.',
 body:{skin:0xd09a70,shirt:0xb52a2a,sleeve:0xb52a2a,fore:0xd09a70,pants:0xd09a70,feet:'sandal',boot:0x6b4a2e},
 make(R,K){const steel=K.m(0xc4c9d2),brass=K.m(0xc8963a),red=K.m(0xb52a2a),redD=K.ds(0x9a2222),lea=K.m(0x6b4a2e);
  SP.helmDome(R,steel,{cover:0.52});M(R.head,G3.hring(0.216,0.016,1.04),brass,[0,0.04,-0.005]);
  const nk=G3.lathe([[0.29,-0.1],[0.25,-0.05],[0.214,0.02]],48,Math.PI-1.4,2.8);M(R.head,nk,K.ds(0xc4c9d2),[0,0,0]);
  for(const s of [-1,1])M(R.head,G3.leaf(0.1,0.17,0.012),steel,[s*0.195,0.0,0.07],{r:[Math.PI,s*Math.PI/2*0.85,0]});
  const cr=G3.shape(s=>{s.absellipse(0,0,0.24,0.12,0,Math.PI,false);s.lineTo(-0.24,0);},0.05,0.015);M(R.head,cr,red,[0,0.25,0]);
  M(R.head,G3.rb(0.3,0.03,0.05,0.01),brass,[0,0.245,0]);
  SP.shell(R,K.m(0x4a3a30),0.28,0.68,0.018);for(let i=0;i<6;i++)SP.shell(R,steel,0.3+i*0.062,0.355+i*0.062,0.028);
  SP.pauldron(R,steel,{layers:4,trim:brass,r:0.11});
  SP.skirt(R,red,{len:0.2,n:2,w:0.27});SP.belt(R,lea,brass);
  for(let i=0;i<4;i++)flow2(R,R.pelvis,[(i-1.5)*0.035,0.04,0.135],2,0.09,0.022,0.022,lea,0.05,0.4,0);
  SP.around(R,R.pelvis,11,0.165,0.13,0.0,(g)=>flow2(R,g,[0,0,0],1,0.16,0.05,0.055,lea,-0.04,-0.3,0),-2.5,2.5);
  M(R.chest,G3.hring(0.09,0.028,1),K.m(0xeee6d2),[0,0.1,0]);
  SP.bracer(R,lea);SP.cape(R,redD,{len:0.32,n:3,w0:0.4,w1:0.56});}},
{name:'Oplita',desc:'Elmo corinzio con cresta di crine, corazza muscolare di bronzo e schinieri.',
 body:{skin:0xc8906a,shirt:0xeee6d2,sleeve:'skin',pants:0xc8906a,feet:'sandal',boot:0x6b4a2e},
 make(R,K){const bronze=K.m(0xc8913a,{emissive:0x4a2a00,emissiveIntensity:0.15}),teal=K.ds(0x2f8a80),black=K.m(0x1e1a1a),linen=K.m(0xeee6d2);
  SP.greatHelm(R,bronze,{slit:false});
  for(const s of [-1,1])M(R.head,G3.ell(0.05,0.028,0.02),K0.dark,[s*0.07,0.035,0.222],{ol:0});
  M(R.head,G3.rb(0.045,0.13,0.03,0.012),K0.dark,[0,-0.08,0.226],{ol:0});
  const cr=G3.shape(s=>{s.absellipse(0,0,0.27,0.14,0,Math.PI,false);s.lineTo(-0.27,0);},0.05,0.015);cr.rotateY(Math.PI/2);M(R.head,cr,black,[0,0.23,-0.03]);
  M(R.head,G3.rb(0.04,0.04,0.32,0.012),bronze,[0,0.235,-0.03]);
  SP.shell(R,bronze,0.03,0.69,0.03,0,TAU,(y,nx,nz)=>nz>0.2?0.02*Math.exp(-(((y-0.49)/0.06)**2))*Math.exp(-(((Math.abs(nx)-0.42)/0.22)**2))+0.008*Math.exp(-(((y-0.3)/0.09)**2))*(0.6+0.4*Math.cos(nx*10)):0);
  SP.band(R,bronze,0.035,0.035,0.014);
  SP.skirt(R,linen,{len:0.19,n:2,w:0.27});
  SP.around(R,R.pelvis,9,0.17,0.135,0.02,(g)=>flow2(R,g,[0,0,0],1,0.13,0.055,0.06,K.m(0x8a5a2a),-0.04,-0.3,0),-2.2,2.2);
  SP.greave(R,bronze,bronze,{len:0.36});SP.bracer(R,K.m(0x6b4a2e));SP.cape(R,teal,{len:0.32,n:3,w0:0.4,w1:0.56});}},
],
/* ---------------- ASSASSINO ---------------- */
assassino:[
{name:'Ombra viola',desc:'Cappuccio, maschera e due code di sciarpa; fasce viola e coltelli sul petto.',
 body:{skin:0xd8b090,shirt:0x3a3350,sleeve:0x3a3350,fore:0x2e2840,pants:0x2e2840,boot:0x1a1724,glove:0x221d33,eyeGlow:0xd7b8ff},
 make(R,K){const main=K.ds(0x3a3350),acc=K.m(0xb48cff),accD=K.ds(0x9a6ae8),dk=K.m(0x1e1a28),steel=K.m(0xc9ced8),lea=K.m(0x2a2236);
  SP.hood(R,main,{depth:0.76});SP.lowMask(R,K.ds(0x2a2830));SP.capelet(R,main,{len:0.14,r1:0.27});
  flow2(R,R.chest,[0.05,0.06,-0.12],4,0.22,0.1,0.07,main,0.55,1.3,0.03);flow2(R,R.chest,[-0.05,0.02,-0.12],4,0.2,0.09,0.06,accD,0.4,1.1,0.03);
  SP.belt(R,acc,null,{t:0.035});flow2(R,R.pelvis,[0.1,0.03,0.1],2,0.16,0.07,0.06,accD,0.15,1,0);
  for(const a of R.arms)for(let i=0;i<3;i++)M(a.el,G3.hring(0.058,0.012,1),acc,[0,-0.08-i*0.065,0],{ol:0});
  SP.strap(R,lea,[[-0.16,0.62],[0.0,0.4],[0.15,0.12]],{w:0.045});SP.strap(R,lea,[[-0.16,0.62],[0.0,0.42],[0.15,0.14]],{w:0.045,back:true});
  for(const [x,y] of [[-0.075,0.5],[-0.02,0.43],[0.035,0.36]])M(SP.onChest(R,y,x,0.026),G3.leaf(0.035,0.12,0.008,true),steel,[0,-0.04,0],{r:[0,0,0.7]});
  M(R.arms[0].sh,G3.dome(0.1,0.5,0.7,1.1),lea,[-0.012,0.02,0],{r:[0,0,0.35]});
  SP.backFlap(R,main,{len:0.24,n:2,w0:0.22,w1:0.18});
  for(const l of R.legs)M(l.hip,G3.cyl(0.03,0.03,0.24,16),dk,[0,-0.22,0.09],{r:[0.1,0,0]});}},
{name:'Shinobi',desc:'Testa fasciata con piastra sulla fronte, nastri al vento, ninjato sulla schiena.',
 body:{skin:0xd8b090,shirt:0x1c1c2a,sleeve:0x1c1c2a,fore:0x23233a,pants:0x1c1c2a,boot:0x2a2a3a,glove:0x1c1c2a},
 make(R,K){const wrap=K.ds(0x1c1c2a),band=K.m(0x6a3aa8),bandD=K.ds(0x5a2a98),steel=K.m(0xb8bec8),blk=K.m(0x111018),red=K.m(0x8a1a1f);
  SP.hood(R,wrap,{r:0.198,depth:0.7,open:1.44,brow:0.34,peak:false,cy:0.025,cz:-0.008,rimT:0.012,cowlR:0.2,cowlY:0.06});SP.lowMask(R,wrap);
  M(R.head,G3.hring(0.2,0.022,1.0),band,[0,0.1,-0.005]);M(R.head,G3.rb(0.12,0.05,0.02,0.01),steel,[0,0.1,0.198],{ol:0.008});
  flow2(R,R.head,[0.02,0.1,-0.19],3,0.12,0.045,0.035,bandD,0.4,1.3,0);flow2(R,R.head,[-0.03,0.09,-0.19],3,0.1,0.04,0.03,bandD,0.6,1.1,0);
  SP.strap(R,K.m(0x2e2e48),[[-0.07,0.69],[0.02,0.5],[0.11,0.3]],{w:0.04,th:0.008});
  SP.belt(R,band,null,{t:0.038});flow2(R,R.pelvis,[-0.1,0.03,0.1],2,0.13,0.06,0.05,bandD,0.1,0.8,0);
  SP.bracer(R,K.m(0x3a3a4a),{r0:0.066,r1:0.054,ring:steel});
  for(const l of R.legs)for(let i=0;i<4;i++)M(l.knee,G3.hring(0.06,0.011,1),K.m(0x3a3a4a),[0,-0.08-i*0.07,0],{ol:0});
  const s=new THREE.Group();s.position.set(0,-0.12,-0.152);s.rotation.z=0.8;R.chest.add(s);
  M(s,G3.cyl(0.028,0.03,0.62,20),blk,[0,-0.08,0]);M(s,G3.cyl(0.06,0.06,0.015,28),steel,[0,0.24,0]);M(s,G3.cyl(0.024,0.024,0.18,16),red,[0,0.34,0]);
  SP.skirt(R,K.m(0x1c1c2a),{len:0.14,n:1,w:0.24,sides:false});}},
{name:'Corvo',desc:'Maschera a becco con lenti viola, cappello a falda larga e mantellina di piume nere.',
 body:{skin:0xe8d0c0,shirt:0x1a1620,sleeve:0x1a1620,fore:0x241e2c,pants:0x1a1620,boot:0x2a2028,glove:0x2a2028,eyes:false},
 make(R,K){const lea=K.m(0x2a2030),beak=K.m(0x2a2a30),brass=K.m(0xc8963a),feat=K.m(0x15131c),feat2=K.m(0x2a2438),glow=K.g(0xb48cff,2);
  M(R.head,G3.sphP(0.195,Math.PI/2-1.2,2.4,Math.PI*0.15,Math.PI*0.7),lea,[0,0.01,0.0]);
  M(R.head,G3.tube([[0,-0.02,0.17],[0,-0.05,0.3],[0,-0.13,0.44]],0.062,0.006,22,14),beak,null);
  for(const s of [-1,1]){M(R.head,G3.ell(0.04,0.04,0.02),glow,[s*0.07,0.04,0.19],{ol:0});M(R.head,G3.tor(0.042,0.01,TAU,28,8),brass,[s*0.07,0.04,0.192],{ol:0});}
  M(R.head,G3.cyl(0.36,0.36,0.02,56),feat,[0,0.17,0]);M(R.head,G3.cyl(0.17,0.19,0.16,48),feat,[0,0.26,0]);M(R.head,G3.hring(0.185,0.02,1),K.m(0x6a3aa8),[0,0.2,0],{ol:0});
  SP.around(R,R.chest,15,0.2,0.16,0.1,(g,i)=>M(g,G3.leaf(0.09,0.24,0.012,true),i%2?feat:feat2,[0,0.02,0.02],{r:[Math.PI+0.25,0,0]}),-2.5,2.5);
  SP.around(R,R.chest,11,0.22,0.17,-0.04,(g,i)=>M(g,G3.leaf(0.08,0.2,0.012,true),i%2?feat2:feat,[0,0.02,0.02],{r:[Math.PI+0.2,0,0]}),-2.2,2.2);
  SP.belt(R,lea,brass);SP.band(R,lea,0.3,0.02,0.02);
  SP.skirt(R,K.m(0x1a1620),{len:0.24,n:2,w:0.27,flare:1.2});
  for(const l of R.legs)for(const y of [0.06,0.14])M(l.foot,G3.hring(0.064,0.012,1),brass,[0,y,0],{ol:0});}},
],
/* ---------------- MAGO DEL FUOCO ---------------- */
mago:[
{name:'Arcimago',desc:'Cappello a punta piegato, lunga barba bianca, tunica rossa bordata d\'oro.',
 body:{skin:0xe0b090,shirt:0xb8322a,sleeve:0xb8322a,fore:0xb8322a,pants:0x7a1a1a,boot:0x3a2020,hair:0xeeeae0},
 make(R,K){const red=K.m(0xb8322a),redD=K.ds(0x7a1a1a),gold=goldM(K),white=K.m(0xeeeae0);
  SP.hair(R,white,'long',{len:0.14});SP.beard(R,white,{long:2});
  M(R.head,G3.cyl(0.42,0.44,0.03,64),red,[0,0.17,0]);
  M(R.head,G3.tube([[0,0.17,0],[0,0.38,-0.02],[0.03,0.54,-0.08],[0.16,0.62,-0.2]],0.2,0.01,30,24,t=>0.2*Math.pow(1-t,1.1)+0.006),red,null);
  M(R.head,G3.hring(0.19,0.026,1),gold,[0,0.22,0]);M(R.head,G3.ell(0.04,0.04,0.025),K.g(0xff7a2e,2),[0,0.22,0.2],{ol:0});
  SP.capelet(R,redD,{len:0.2,r1:0.31});M(R.chest,G3.hring(0.31,0.014,0.78),gold,[0,-0.08,0],{ol:0});
  SP.sleeve(R,K.ds(0xb8322a));SP.belt(R,gold,null,{t:0.022});
  SP.skirt(R,red,{len:0.23,n:3,w:0.3,flare:1.25});SP.flap(R,gold,{len:0.23,n:3,w0:0.045,pos:[0,-0.02,0.122*R.B+0.016]});
  SP.cape(R,redD,{len:0.33,n:3,w0:0.4,w1:0.58});SP.staffHand(R,0xff7a2e,gold);}},
{name:'Piromante',desc:'Capelli di fiamma, occhi accesi, tatuaggi di brace e mezzo mantello bruciacchiato.',
 body:{skin:0xb07a58,shirt:0x2a2224,sleeve:'skin',fore:'skin',pants:0x2a2224,boot:0x1e1a1a,eyeGlow:0xffb347,hair:0x8a2a10},
 make(R,K){const ch=K.m(0x2a2224),chD=K.ds(0x3a2a26),emb=K.g(0xff7a2e,1.6),gold=goldM(K);
  SP.hair(R,K.m(0x8a2a10),'short');glowFlames(R,K,R.head,7,[0xff7a2e,0xffc04a,0xff5a1e],0.14,2.4,0.3);
  SP.band(R,emb,0.32,0.006,0.008);SP.band(R,emb,0.5,0.006,0.008);
  const e=SP.onChest(R,0.42,0,0.004);for(const s of [-1,1])M(e,G3.rb(0.012,0.2,0.01,0.004),emb,[s*0.05,0,0],{r:[0,0,s*0.2],ol:0});
  for(const a of R.arms)for(let i=0;i<3;i++)M(a.el,G3.hring(0.055-i*0.003,0.008,1),emb,[0,-0.06-i*0.07,0],{ol:0});
  M(R.arms[1].sh,G3.dome(0.11,0.5,0.7,1.15),K.m(0x3a2a26),[0.012,0.02,0],{r:[0,0,-0.35]});
  flow2(R,R.cape,[0.08,0,0],3,0.3,0.26,0.34,chD,0.1,1,0.08,0.07);
  SP.belt(R,K.m(0x3a2a26),K.g(0xff7a2e,2),{buckle:G3.ell(0.035,0.035,0.025)});SP.skirt(R,ch,{len:0.22,n:2,w:0.29,jag:0.05});
  SP.orbit(R,K.g(0xffa040,2),4,0.42,-0.25,R.chest);SP.staffHand(R,0xff7a2e,gold);}},
{name:'Sacerdote del sole nero',desc:'Maschera d\'oro, mitra alta con sole ardente e aureola di raggi alle spalle.',
 body:{skin:0x8a5a3c,shirt:0x1a1418,sleeve:0x1a1418,fore:0x1a1418,pants:0x1a1418,boot:0x2a2020,eyes:false},
 make(R,K){const gold=K.m(0xd9a640,{emissive:0x5a3a00,emissiveIntensity:0.3}),blk=K.m(0x1a1418),blkD=K.ds(0x1a1418),or=K.m(0xd9772a),orD=K.ds(0xd9772a),glow=K.g(0xff7a2e,2);
  M(R.head,G3.sphP(0.2,Math.PI/2-1.05,2.1,Math.PI*0.18,Math.PI*0.6),gold,[0,0.01,0]);
  for(const s of [-1,1])M(R.head,G3.ell(0.04,0.011,0.02),glow,[s*0.066,0.035,0.19],{ol:0});
  M(R.head,G3.rb(0.05,0.01,0.02,0.004),K.dark,[0,-0.09,0.19],{ol:0});
  const mt=G3.lathe([[0.17,0],[0.19,0.1],[0.16,0.24],[0.08,0.36],[0,0.42]]);mt.scale(1,1,0.95);M(R.head,mt,blk,[0,0.12,-0.01]);
  const sd=new THREE.Group();sd.position.set(0,0.3,0.155);R.head.add(sd);SP.sun(sd,glow,0.04,10);
  const halo=new THREE.Group();halo.position.set(0,0.02,-0.26);R.head.add(halo);
  M(halo,G3.tor(0.3,0.016,TAU,64,8),glow,[0,0,0],{ol:0});
  for(let i=0;i<16;i++){const a=i/16*TAU;M(halo,G3.cone(0.025,0.14,16),gold,[Math.cos(a)*0.38,Math.sin(a)*0.38,0],{r:[0,0,a-Math.PI/2],ol:0.006});}
  R.tick.push((R,t)=>{halo.rotation.z=t*0.25;});
  for(const s of [-1,1])SP.strap(R,or,[[s*0.07,0.7],[s*0.075,0.45],[s*0.075,0.12]],{w:0.05,off:0.014});
  SP.capelet(R,blkD,{len:0.17,r1:0.3});M(R.chest,G3.hring(0.3,0.014,0.78),gold,[0,-0.05,0],{ol:0});
  SP.sleeve(R,blkD);SP.bracer(R,gold,{len:0.08,y:-0.27});
  SP.skirt(R,blk,{len:0.24,n:3,w:0.3,flare:1.2});SP.flap(R,orD,{len:0.23,n:3,w0:0.12,w1:0.14,pos:[0,-0.02,0.122*R.B+0.014]});
  SP.belt(R,gold,null,{t:0.02});SP.staffHand(R,0xff7a2e,gold);}},
],
/* ---------------- STREGA DEL GELO ---------------- */
criomante:[
{name:'Regina dei ghiacci',desc:'Corona di cristalli, lunghi capelli bianchi, abito azzurro e collo di pelliccia.',
 body:{skin:0xf0dcd0,shirt:0x4a8acb,sleeve:0x4a8acb,fore:0xe6f4ff,pants:0x2a3a5a,boot:0xe6f4ff,glove:0xe6f4ff,hair:0xf2f6ff,eyeGlow:0x8fdcff},
 make(R,K){const blue=K.m(0x4a8acb),blueD=K.ds(0x2a5a8a),white=K.m(0xf2f6ff),ice=K.g(0x8fdcff,1.1),silver=K.m(0xd8e2ee);
  SP.hair(R,white,'long',{len:0.2,n:3});
  M(R.head,G3.hring(0.2,0.016,1.03),silver,[0,0.13,-0.005]);
  for(let i=-3;i<=3;i++){const a=i*0.3,h=0.12+0.07*(3-Math.abs(i));M(R.head,G3.cone(0.028,h,8),ice,[Math.sin(a)*0.2,0.13+h/2,Math.cos(a)*0.2-0.005],{r:[Math.cos(a)*0.25,0,-Math.sin(a)*0.25],ol:0.008});}
  SP.shell(R,K.m(0x6aa6dc),0.25,0.66,0.012);SP.band(R,white,0.25,0.02,0.012);
  SP.capelet(R,white,{len:0.12,r1:0.28});M(R.chest,G3.hring(0.27,0.04,0.78),white,[0,0.0,0]);
  SP.sleeve(R,K.ds(0x6aa6dc),{r:0.12});
  SP.skirt(R,blue,{len:0.24,n:3,w:0.3,flare:1.35});SP.flap(R,white,{len:0.23,n:3,w0:0.08,w1:0.12,pos:[0,-0.02,0.122*R.B+0.014]});
  SP.belt(R,silver,ice,{t:0.016,buckle:new THREE.OctahedronGeometry(0.035,1)});
  SP.cape(R,blueD,{len:0.3,n:4,w0:0.42,w1:0.62});SP.staffHand(R,0x8fdcff,silver);}},
{name:'Sciamana della tundra',desc:'Cappuccio di pelliccia con ghiaccioli, pellicce a strati e amuleti d\'osso.',
 body:{skin:0xc89a78,shirt:0x6a5a4a,sleeve:0x6a5a4a,fore:0x5a4a3c,pants:0x4a3a30,boot:0x5a4a3c,glove:0x5a4a3c,hair:0x1a1a22},
 make(R,K){const furW=K.ds(0xe8e2d8),furG=K.m(0xa8a29a),lea=K.m(0x6a5a4a),bone=K.m(0xe6dcc6),ice=K.g(0x8fdcff,1.2),blue=K.m(0x3a7ac8);
  SP.hood(R,K.ds(0x8a6a4a),{depth:0.72,rim:furW,rimT:0.03});
  for(let i=-3;i<=3;i++)M(R.head,G3.cone(0.014,0.07+0.02*(i%2),10),ice,[i*0.04,-0.17,0.13],{r:[Math.PI,0,0],ol:0});
  for(const s of [-1,1])M(R.face,G3.rb(0.012,0.05,0.01,0.004),blue,[s*0.03,-0.16,0.14],{ol:0});
  SP.capelet(R,furG,{len:0.2,r1:0.31});M(R.chest,G3.hring(0.31,0.04,0.78),furW,[0,-0.08,0]);
  SP.around(R,R.chest,9,0.13,0.1,0.02,(g,i)=>M(g,i%3?G3.cone(0.014,0.06,12):G3.ell(0.025,0.03,0.02),i%3?bone:blue,[0,-0.04,0.015],{r:[Math.PI,0,0],ol:0.006}),-1.2,1.2);
  SP.belt(R,lea,bone,{t:0.03});SP.skirt(R,lea,{len:0.24,n:2,w:0.3,flare:1.25});
  SP.around(R,R.pelvis,8,0.2,0.16,-0.47,(g)=>M(g,G3.ell(0.07,0.04,0.05),furG,[0,0,0]),-2.6,2.6);
  SP.cape(R,K.ds(0x8a8278),{len:0.3,n:3,w0:0.42,w1:0.56,jag:0.05});SP.bootCuff(R,furW,{t:0.04});SP.staffHand(R,0x8fdcff,bone);}},
{name:'Spettro del gelo',desc:'Cappuccio profondo, maschera di ghiaccio con occhi accesi, cristalli sulle spalle.',
 body:{skin:0x9ab0c8,shirt:0x1e2a44,sleeve:0x1e2a44,fore:0x1e2a44,pants:0x1a2238,boot:0x2a3a5a,glove:0x2a3a5a,eyes:false},
 make(R,K){const robe=K.ds(0x1e2a44),mask=K.m(0xdff2ff),ice=K.g(0x8fdcff,1.3),iceB=K.g(0xbfe6ff,0.9),glow=K.g(0x8fdcff,2.4);
  SP.hood(R,robe,{depth:0.82});
  M(R.head,G3.sphP(0.19,Math.PI/2-1.0,2.0,Math.PI*0.2,Math.PI*0.6),mask,[0,0.0,0.005]);
  for(const s of [-1,1])M(R.head,G3.ell(0.042,0.012,0.02),glow,[s*0.065,0.035,0.185],{r:[0,0,-s*0.2],ol:0});
  M(R.head,G3.rb(0.008,0.07,0.015,0.003),K.dark,[0,-0.08,0.188],{ol:0});
  for(const a of R.arms){const s=a===R.arms[0]?-1:1;for(let k=0;k<3;k++)M(a.sh,G3.cone(0.035-k*0.006,0.2-k*0.04,8),k?iceB:ice,[s*(0.03+k*0.03),0.06,-0.02+k*0.03],{r:[0.2*k,0,-s*(0.35+k*0.3)],ol:0.008});}
  SP.shell(R,K.m(0x9ad4f0),0.3,0.66,0.02,-0.9,1.8);
  SP.capelet(R,robe,{len:0.15,r1:0.28});SP.sleeve(R,robe,{r:0.12});
  SP.skirt(R,K.m(0x1e2a44),{len:0.24,n:3,w:0.3,flare:1.3,jag:0.06});SP.belt(R,K.m(0x2a3a5a),ice,{buckle:new THREE.OctahedronGeometry(0.035,1)});
  SP.cape(R,robe,{len:0.32,n:3,w0:0.4,w1:0.6,jag:0.09});SP.orbit(R,iceB,5,0.4,-0.2,R.chest);SP.staffHand(R,0x8fdcff,K.m(0xd8e2ee));}},
],
/* ---------------- EVOCATORE DEL FULMINE ---------------- */
tempesta:[
{name:'Signore della tempesta',desc:'Capelli bianchi a punte, diadema con saetta, colletto alto e sciarpa al vento.',
 body:{skin:0xe0b090,shirt:0x4a4ab0,sleeve:0x4a4ab0,fore:0x24264a,pants:0x24264a,boot:0x1e1e3a,glove:0x24264a,hair:0xf0f2ff,eyeGlow:0xfff27a},
 make(R,K){const ind=K.m(0x4a4ab0),indD=K.ds(0x2a2a6a),gold=goldM(K),yel=K.g(0xfff27a,1.6),silver=K.ds(0xc9ced8),scarf=K.ds(0xe6d45a);
  SP.hair(R,K.m(0xf0f2ff),'spiky',{spikes:9});
  const cr=G3.hring(0.2,0.016,1.03);M(R.head,cr,gold,[0,0.11,-0.005],{r:[0.12,0,0]});
  const b=G3.shape(s=>{s.moveTo(0.02,0.14);s.lineTo(-0.06,0);s.lineTo(0,0);s.lineTo(-0.03,-0.12);s.lineTo(0.07,0.03);s.lineTo(0.01,0.03);s.lineTo(0.05,0.14);s.lineTo(0.02,0.14);},0.02,0.006);
  M(R.head,b,yel,[0,0.2,0.2],{ol:0.006});
  SP.collar(R,silver,{r0:0.13,h:0.15});SP.capelet(R,indD,{len:0.15,r1:0.28});
  flow2(R,R.chest,[0,0.08,-0.12],4,0.22,0.14,0.1,scarf,0.5,1.3,0.03);
  SP.sleeve(R,K.ds(0x4a4ab0));SP.belt(R,gold,null,{t:0.02});
  SP.skirt(R,ind,{len:0.23,n:3,w:0.29,flare:1.2});SP.orbit(R,yel,4,0.4,-0.2,R.chest);SP.staffHand(R,0xfff27a,gold);}},
{name:'Raijin',desc:'Anello di tamburi del tuono alle spalle, criniera scura, corna corte e kilt tigrato.',
 body:{skin:0xc0805a,shirt:'skin',sleeve:'skin',pants:0x24264a,boot:0x1e1e3a,hair:0x1a1a2a,build:1.08,eyeGlow:0xfff27a},
 make(R,K){const rust=K.m(0x8e3b2c),cream=K.m(0xf0e6cc),gold=goldM(K),tiger=K.m(0xe6b23a),stripe=K.m(0x1a1418),yel=K.g(0xfff27a,1.6),cloud=K.ds(0xe8e6f4);
  SP.hair(R,K.m(0x1a1a2a),'mane',{spikes:11,len:0.14});SP.horns(R,cream,{k:0.55,dy:0.12,r:0.05});
  const ring=new THREE.Group();ring.position.set(0,0.06,-0.3);R.chest.add(ring);
  M(ring,G3.tor(0.44,0.024,TAU,72,10),rust,[0,0,0]);
  for(let i=0;i<8;i++){const a=i/8*TAU,d=new THREE.Group();d.position.set(Math.cos(a)*0.44,Math.sin(a)*0.44,0);ring.add(d);
    M(d,G3.cyl(0.075,0.075,0.07,32),rust,[0,0,0],{r:[Math.PI/2,0,0]});for(const z of [-0.037,0.037])M(d,G3.cyl(0.07,0.07,0.006,32),cream,[0,0,z],{r:[Math.PI/2,0,0],ol:0});}
  R.tick.push((R,t)=>{ring.rotation.z=t*0.3;});
  const e=SP.onChest(R,0.45,0,0.003);for(const s of [-1,1])M(e,G3.shape(sh=>{sh.moveTo(0,0.1);sh.lineTo(-0.03,0);sh.lineTo(0.005,0);sh.lineTo(-0.02,-0.1);sh.lineTo(0.035,0.02);sh.lineTo(0.0,0.02);sh.lineTo(0.02,0.1);},0.006,0.002),yel,[s*0.08,0,0],{ol:0});
  SP.skirt(R,tiger,{len:0.18,n:2,w:0.27,jag:0.04});
  for(const s of [-1,1])for(let i=0;i<3;i++)M(R.pelvis,G3.rb(0.035,0.012,0.012,0.004),stripe,[s*(0.04+i*0.04),-0.07-i*0.03,0.135],{r:[0,0,s*0.4],ol:0});
  SP.belt(R,K.m(0x2a2a6a),gold,{t:0.04});
  flow2(R,R.chest,[0.0,0.1,-0.14],4,0.2,0.1,0.14,cloud,0.6,1.4,0.05);SP.bracer(R,gold,{len:0.12,ring:K.m(0x8a6a2a)});
  SP.staffHand(R,0xfff27a,gold);}},
{name:'Tecnomante',desc:'Occhialoni di ottone, bobine elettriche sulle spalle e lungo cappotto di cuoio.',
 body:{skin:0xe0b090,shirt:0x5a4030,sleeve:0x5a4030,fore:0x5a4030,pants:0x2a2a30,boot:0x3a2a20,glove:0x3a2a20,hair:0xf0f2ff},
 make(R,K){const lea=K.m(0x5a4030),leaD=K.ds(0x5a4030),brass=K.m(0xc8963a),copper=K.m(0xb86a3a),yel=K.g(0xfff27a,1.8),dk=K.m(0x2a2028);
  SP.hair(R,K.m(0xf0f2ff),'spiky',{spikes:7});
  M(R.head,G3.hring(0.2,0.016,1.03),dk,[0,0.12,-0.005],{ol:0});
  for(const s of [-1,1]){M(R.head,G3.cyl(0.045,0.05,0.05,28),brass,[s*0.065,0.13,0.18],{r:[Math.PI/2-0.3,0,0]});M(R.head,G3.cyl(0.035,0.035,0.01,28),yel,[s*0.065,0.14,0.208],{r:[Math.PI/2-0.3,0,0],ol:0});}
  const sp=[];
  for(const a of R.arms){const s=a===R.arms[0]?-1:1;const c=new THREE.Group();c.position.set(s*0.02,0.07,-0.02);a.sh.add(c);
    M(c,G3.cyl(0.05,0.06,0.04,28),brass,[0,0,0]);M(c,G3.cyl(0.015,0.015,0.2,12),dk,[0,0.1,0]);
    for(let k=0;k<4;k++)M(c,G3.hring(0.035,0.01,1),copper,[0,0.05+k*0.035,0],{ol:0.005});sp.push(M(c,G3.ell(0.035,0.035,0.035),yel,[0,0.22,0],{ol:0}));}
  SP.flicker(R,sp,14);
  SP.collar(R,leaD,{r0:0.13,h:0.12});SP.shell(R,lea,-0.05,0.68,0.016);
  for(const y of [0.2,0.3,0.4])M(R.torso,G3.ell(0.012,0.012,0.008),brass,[0.06,y,tZ(y,0.06,1,0.02)],{ol:0});
  SP.belt(R,K.m(0x2a2028),brass);M(R.torso,G3.rb(0.08,0.07,0.04,0.015),lea,[0.12,0.0,tZ(0.0,0.12,1,0.02)]);
  SP.skirt(R,lea,{len:0.24,n:3,w:0.27,flare:1.2});SP.bracer(R,copper,{ring:yel});SP.staffHand(R,0xfff27a,brass);}},
],
/* ---------------- DRUIDO ---------------- */
druido:[
{name:'Custode del bosco',desc:'Palchi di cervo, mantellina di foglie, barba castana e veste verde.',
 body:{skin:0xd0a07a,shirt:0x5a7a3a,sleeve:0x5a7a3a,fore:0x3a3020,pants:0x3a3020,boot:0x4a3424,hair:0x6b4a2e},
 make(R,K){const wood=K.m(0x6b4a2e),green=K.ds(0x3f6a2e),lf=[K.m(0x5fae4a),K.m(0x3f8a3a),K.m(0x8fcf5a)],rope=K.m(0xa88a5a);
  SP.hood(R,green,{depth:0.62});SP.beard(R,K.m(0x6b4a2e),{long:1});
  for(const s of [-1,1]){M(R.head,G3.tube([[s*0.12,0.18,0],[s*0.2,0.3,-0.02],[s*0.25,0.45,-0.05],[s*0.3,0.56,-0.03]],0.03,0.008,22,10),wood,null);
    M(R.head,G3.tube([[s*0.21,0.32,-0.02],[s*0.3,0.37,0.02],[s*0.36,0.4,0.03]],0.02,0.006,14,8),wood,null);
    M(R.head,G3.tube([[s*0.25,0.45,-0.05],[s*0.22,0.55,-0.08],[s*0.2,0.62,-0.07]],0.017,0.005,14,8),wood,null);}
  SP.around(R,R.chest,15,0.21,0.17,0.1,(g,i)=>M(g,G3.leaf(0.09,0.2,0.01,true),lf[i%3],[0,0.02,0.02],{r:[Math.PI+0.25,0,(i%2-0.5)*0.3]}),-2.6,2.6);
  SP.belt(R,rope,null,{t:0.022});flow2(R,R.pelvis,[0.08,0.04,0.12],2,0.12,0.03,0.03,rope,0.1,0.8,0);
  SP.skirt(R,K.m(0x5a7a3a),{len:0.23,n:3,w:0.29,flare:1.2});SP.bracer(R,K.m(0x4a3424));
  SP.cape(R,green,{len:0.3,n:3,w0:0.4,w1:0.56,jag:0.06});SP.staffHand(R,0x7fe08a,K.m(0x8a6a3a));}},
{name:'Sciamano dell\'orso',desc:'Testa d\'orso come copricapo, pelliccia, collana di artigli e pittura verde.',
 body:{skin:0xb88464,shirt:0x5a4030,sleeve:'skin',pants:0x4a3424,boot:0x5a4030,hair:0x2a1e18,build:1.1},
 make(R,K){const bear=K.m(0x6a4a30),bear2=K.m(0x8a6a4a),bone=K.m(0xe6dcc6),green=K.m(0x5fae4a),lea=K.m(0x5a4030);
  SP.hair(R,K.m(0x2a1e18),'long',{len:0.15});
  const h=new THREE.Group();h.position.set(0,0.15,0.01);R.head.add(h);
  M(h,G3.ell(0.23,0.16,0.24),bear,[0,0,-0.01]);M(h,G3.ell(0.15,0.11,0.12),bear,[0,0.0,0.15]);M(h,G3.ell(0.1,0.08,0.13),bear2,[0,-0.04,0.27]);M(h,G3.ell(0.04,0.03,0.028),K.dark,[0,-0.01,0.395],{ol:0});
  for(const s of [-1,1]){M(h,G3.ell(0.065,0.065,0.035),bear,[s*0.15,0.13,-0.02]);M(h,G3.ell(0.035,0.035,0.02),bear2,[s*0.15,0.13,0.005],{ol:0});M(h,G3.ell(0.022,0.016,0.012),K.g(0x7fe08a,2),[s*0.075,0.05,0.24],{ol:0});}
  for(const s of [-1,1])M(R.head,G3.ell(0.075,0.13,0.12),bear,[s*0.19,-0.02,-0.06]);
  for(const s of [-1,1])for(let i=0;i<2;i++)M(R.face,G3.rb(0.05,0.012,0.01,0.004),green,[s*0.075,-0.0-i*0.035,0.16],{ol:0});
  SP.capelet(R,bear,{len:0.18,r1:0.31});SP.cape(R,K.ds(0x5a3e28),{len:0.3,n:3,w0:0.44,w1:0.56,jag:0.06});
  SP.around(R,R.chest,9,0.12,0.1,0.06,(g)=>M(g,G3.cone(0.018,0.08,14),bone,[0,-0.06,0.02],{r:[Math.PI+0.2,0,0],ol:0.006}),-1.1,1.1);
  for(const a of R.arms)M(a.sh,G3.dome(0.11,0.5,0.75,1.1),bear,[a===R.arms[0]?-0.012:0.012,0.02,0],{r:[0,0,(a===R.arms[0]?1:-1)*0.35]});
  SP.bracer(R,lea,{r0:0.068});SP.belt(R,lea,bone,{t:0.03,buckle:G3.cone(0.03,0.08,14)});
  SP.skirt(R,lea,{len:0.22,n:2,w:0.29,jag:0.04});SP.staffHand(R,0x7fe08a,bone);}},
{name:'Spirito della quercia',desc:'Corteccia al posto dell\'armatura, muschio e funghi sulle spalle, barba di muschio e occhi verdi.',
 body:{skin:0x8a6a48,shirt:0x5a4028,sleeve:0x6b4a2e,fore:0x5a4028,pants:0x4a3420,boot:0x3a2a18,glove:0x6b4a2e,hair:0x4f8a3a,eyeGlow:0x7fe08a},
 make(R,K){const bark=K.m(0x6b4a2e),moss=K.m(0x4f8a3a),moss2=K.m(0x6fae4a),wood=K.m(0x5a3e24),cap=K.m(0xc0412b),stem=K.m(0xf0e6cc),lf=K.m(0x7fc85a);
  SP.shell(R,bark,-0.05,0.68,0.022,0,TAU,(y,nx,nz)=>0.012*Math.abs(Math.sin(Math.atan2(nx,nz)*7+y*5)));
  SP.beard(R,moss,{long:1});SP.hair(R,moss,'short');
  SP.around(R,R.head,9,0.19,0.19,0.16,(g,i)=>{const l=M(g,G3.leaf(0.07,0.17,0.01,true),i%2?lf:moss2,[0,0,0],{r:[-0.25,0,0]});},-2.2,2.2);
  for(const s of [-1,1])M(R.head,G3.tube([[s*0.1,0.2,-0.02],[s*0.14,0.32,-0.05],[s*0.2,0.38,-0.03]],0.02,0.006,14,8),wood,null);
  for(const a of R.arms){const s=a===R.arms[0]?-1:1;for(let k=0;k<4;k++)M(a.sh,G3.ell(0.06,0.04,0.06),k%2?moss:moss2,[s*(0.01+k*0.012),0.04-k*0.015,-0.04+k*0.03]);}
  const m=new THREE.Group();m.position.set(0.05,0.08,0);R.arms[1].sh.add(m);M(m,G3.cyl(0.018,0.022,0.07,16),stem,[0,0.03,0]);M(m,G3.dome(0.055,0.5,0.6),cap,[0,0.06,0]);
  for(let i=0;i<3;i++)M(m,G3.ell(0.008,0.006,0.008),stem,[Math.cos(i*2)*0.03,0.085,Math.sin(i*2)*0.03],{ol:0});
  SP.bracer(R,bark,{r0:0.07});SP.belt(R,wood,null,{t:0.03});
  SP.skirt(R,K.m(0x4f6a2a),{len:0.22,n:2,w:0.29,jag:0.05});SP.bootCuff(R,moss,{t:0.035});SP.staffHand(R,0x7fe08a,wood);}},
],
/* ---------------- ASTROMANTE ---------------- */
astromante:[
{name:'Veggente stellare',desc:'Cappuccio notturno bordato d\'oro, diadema con stella e stelle che le girano intorno.',
 body:{skin:0xe0b090,shirt:0x2a2a6a,sleeve:0x2a2a6a,fore:0x1a1a3a,pants:0x1a1a3a,boot:0x1a1a3a,glove:0x1a1a3a,eyeGlow:0xc7a8ff},
 make(R,K){const night=K.ds(0x1a1a4a),gold=goldM(K),star=K.g(0xfff3c4,1.8),lav=K.g(0xc7a8ff,1.8);
  SP.hood(R,night,{depth:0.6,rim:gold});M(R.head,G3.hring(0.2,0.014,1.03),gold,[0,0.1,-0.005],{r:[0.1,0,0]});
  SP.star(R.head,star,0.05,[0,0.17,0.2]);
  const o=new THREE.Group();o.position.set(0,0.42,0);R.head.add(o);R.orbit=o;for(let i=0;i<3;i++)SP.star(o,lav,0.045,[Math.cos(i*2.09)*0.42,0,Math.sin(i*2.09)*0.42]);
  R.tick.push((R,t,dt)=>{o.rotation.y+=dt*1.8;});
  SP.capelet(R,night,{len:0.17,r1:0.29});M(R.chest,G3.hring(0.29,0.012,0.78),gold,[0,-0.05,0],{ol:0});
  SP.sleeve(R,K.ds(0x2a2a6a));SP.belt(R,gold,null,{t:0.02});
  SP.skirt(R,K.m(0x2a2a6a),{len:0.24,n:3,w:0.3,flare:1.25});
  const sg=SP.cape(R,night,{len:0.32,n:3,w0:0.42,w1:0.6});
  sg.forEach((g,i)=>{for(let k=0;k<3;k++)M(g,G3.ell(0.012,0.012,0.006),star,[((k*37+i*13)%9-4)*0.04,-0.06-((k*17+i*7)%5)*0.04,-0.02],{ol:0});});
  SP.staffHand(R,0xc7a8ff,gold);}},
{name:'Astronomo',desc:'Cappello altissimo con lune, occhiali tondi, barba bianca e sfera armillare alle spalle.',
 body:{skin:0xe0b090,shirt:0x3a2a6a,sleeve:0x3a2a6a,fore:0x3a2a6a,pants:0x1a1a3a,boot:0x2a1a20,hair:0xe8e8f0},
 make(R,K){const pur=K.m(0x3a2a6a),purD=K.ds(0x2a1a4a),gold=goldM(K),star=K.g(0xfff3c4,1.8),white=K.m(0xe8e8f0);
  SP.hair(R,white,'short');SP.beard(R,white,{long:1});
  M(R.head,G3.cyl(0.36,0.38,0.025,64),pur,[0,0.16,0]);
  M(R.head,G3.tube([[0,0.16,0],[0,0.4,-0.01],[0,0.62,-0.04],[0.06,0.78,-0.1]],0.18,0.008,30,24,t=>0.18*Math.pow(1-t,1.05)+0.006),pur,null);
  M(R.head,G3.tor(0.06,0.012,Math.PI*1.3,24,8),star,[0.0,0.36,0.155],{ol:0,r:[-0.15,0,0.6]});
  SP.star(R.head,star,0.03,[0.07,0.48,0.11],[-0.2,0,0]);SP.star(R.head,star,0.022,[-0.06,0.3,0.17],[-0.1,0,0]);
  for(const s of [-1,1])M(R.face,G3.tor(0.032,0.007,TAU,24,6),gold,[s*0.062,0.03,0.18],{ol:0});M(R.face,G3.rb(0.04,0.008,0.008,0.003),gold,[0,0.035,0.19],{ol:0});
  const ar=new THREE.Group();ar.position.set(0,0.3,-0.4);R.chest.add(ar);const rings=[];
  for(let i=0;i<3;i++){const r=new THREE.Group();ar.add(r);r.rotation.set(i*0.9,i*0.6,0);M(r,G3.tor(0.2-i*0.03,0.012,TAU,56,8),gold,[0,0,0],{ol:0.006});rings.push(r);}
  M(ar,G3.ell(0.05,0.05,0.05),K.g(0xffc04a,2),[0,0,0],{ol:0});R.tick.push((R,t,dt)=>rings.forEach((r,i)=>{r.rotation.y+=dt*(0.6+i*0.4);r.rotation.x+=dt*0.2*(i-1);}));
  SP.capelet(R,K.ds(0x1a1a4a),{len:0.16,r1:0.28});SP.sleeve(R,purD);SP.belt(R,gold,null,{t:0.02});
  SP.skirt(R,pur,{len:0.24,n:3,w:0.3,flare:1.2});SP.flap(R,gold,{len:0.23,n:3,w0:0.04,pos:[0,-0.02,0.122*R.B+0.016]});SP.staffHand(R,0xc7a8ff,gold);}},
{name:'Avatar del cosmo',desc:'Il volto è un cielo stellato, una falce di luna come aureola e costellazioni d\'oro sulla veste.',
 body:{skin:0x2a2a5a,shirt:0x14143a,sleeve:0x14143a,fore:0x14143a,pants:0x14143a,boot:0x14143a,glove:0x14143a,eyes:false},
 make(R,K){const robe=K.ds(0x14143a),gold=K.g(0xffd27a,0.9),star=K.g(0xfff3c4,2),lav=K.g(0xc7a8ff,2.2);
  SP.hood(R,robe,{depth:0.84,open:1.6});R.face.visible=false;
  M(R.head,G3.ell(0.15,0.17,0.08),K.dark,[0,0.0,0.12],{ol:0});
  for(let i=0;i<9;i++)M(R.head,G3.ell(0.008,0.008,0.004),star,[((i*41)%13-6)*0.018,((i*23)%11-5)*0.022,0.195],{ol:0});
  for(const s of [-1,1])M(R.head,G3.ell(0.026,0.02,0.01),lav,[s*0.06,0.03,0.195],{ol:0});
  R.halo=M(R.head,G3.tor(0.2,0.022,Math.PI*1.25,48,10),gold,[0,0.48,-0.12],{r:[Math.PI/2-0.4,0,0.6],ol:0});
  const e=SP.onChest(R,0.42,0,0.004),pts=[[-0.08,0.08],[-0.02,0.02],[0.05,0.06],[0.08,-0.05],[0.0,-0.12]];
  for(let i=0;i<pts.length;i++){M(e,G3.ell(0.012,0.012,0.006),star,[pts[i][0],pts[i][1],0.005],{ol:0});
    if(i){const a=pts[i-1],b=pts[i],dx=b[0]-a[0],dy=b[1]-a[1];M(e,G3.rb(Math.hypot(dx,dy),0.006,0.004,0.002),gold,[(a[0]+b[0])/2,(a[1]+b[1])/2,0],{r:[0,0,Math.atan2(dy,dx)],ol:0});}}
  SP.capelet(R,robe,{len:0.17,r1:0.29});SP.sleeve(R,robe,{r:0.12});
  SP.skirt(R,K.m(0x14143a),{len:0.24,n:3,w:0.3,flare:1.3});
  const sg=SP.cape(R,robe,{len:0.32,n:3,w0:0.42,w1:0.62});sg.forEach((g,i)=>{for(let k=0;k<4;k++)M(g,G3.ell(0.01,0.01,0.005),star,[((k*29+i*11)%9-4)*0.045,-0.05-((k*13+i*5)%6)*0.04,-0.02],{ol:0});});
  SP.orbit(R,lav,2,0.48,0.0,R.chest);SP.staffHand(R,0xc7a8ff,K.m(GOLD));}},
],
/* ---------------- NEGROMANTE ---------------- */
negromante:[
{name:'Mietitore',desc:'Cappuccio profondo, teschio con occhi viola, spallacci d\'osso e mantello stracciato.',
 body:{skin:0xd8d0c0,shirt:0x2e2638,sleeve:0x2e2638,fore:0x1e1a24,pants:0x1e1a24,boot:0x1a1420,glove:0x1e1a24,eyes:false},
 make(R,K){const robe=K.ds(0x2e2638),bone=K.m(0xe6dcc6),glow=K.g(0x9a6aff,2.4);
  SP.hood(R,robe,{depth:0.82});R.face.visible=false;
  M(R.head,G3.ell(0.15,0.17,0.15),bone,[0,0.01,0.03]);M(R.head,G3.ell(0.1,0.07,0.1),bone,[0,-0.1,0.07]);
  for(const s of [-1,1]){M(R.head,G3.ell(0.042,0.04,0.02),K.dark,[s*0.06,0.03,0.165],{ol:0});M(R.head,G3.ell(0.018,0.018,0.01),glow,[s*0.06,0.03,0.18],{ol:0});}
  M(R.head,G3.ell(0.018,0.026,0.012),K.dark,[0,-0.03,0.175],{ol:0});
  for(let i=0;i<6;i++)M(R.head,G3.rb(0.014,0.024,0.01,0.004),K.m(0xf4ecdc),[(i-2.5)*0.017,-0.11,0.165],{ol:0});
  SP.pauldron(R,bone,{layers:1,r:0.1,spikes:2,spikeM:bone});
  SP.capelet(R,robe,{len:0.15,r1:0.27});SP.sleeve(R,robe,{r:0.12});
  SP.skirt(R,K.m(0x2e2638),{len:0.24,n:3,w:0.3,flare:1.25,jag:0.07});SP.belt(R,K.m(0x1a1420),bone,{buckle:G3.ell(0.04,0.045,0.03)});
  for(let i=0;i<3;i++)flow2(R,R.cape,[(i-1)*0.13,0,0],3,0.33,0.15,0.17,robe,0.1+i*0.05,1.2,0.03,0.07);}},
{name:'Re lich',desc:'Pelle grigia, corona d\'osso, cassa toracica sopra la veste viola e mantello regale.',
 body:{skin:0xa8b4b8,shirt:0x3a1e4a,sleeve:0x3a1e4a,fore:0x2a1a34,pants:0x2a1a34,boot:0x1a1420,glove:0xa8b4b8,eyeGlow:0x9a6aff,hair:0x5a6064},
 make(R,K){const pur=K.m(0x3a1e4a),purD=K.ds(0x3a1e4a),bone=K.m(0xe6dcc6),gold=goldM(K),gem=K.g(0x9a6aff,2);
  SP.hair(R,K.m(0xc8ccd0),'long',{len:0.18});
  M(R.head,G3.hring(0.2,0.022,1.03),gold,[0,0.13,-0.005]);
  for(let i=0;i<7;i++){const a=(i-3)*0.42,h=0.12+(i%2?0:0.08);M(R.head,G3.cone(0.022,h,20),i%2?gold:bone,[Math.sin(a)*0.2,0.13+h/2,Math.cos(a)*0.2-0.005],{r:[Math.cos(a)*0.2,0,-Math.sin(a)*0.2]});}
  M(R.head,G3.ell(0.025,0.035,0.02),gem,[0,0.15,0.205],{ol:0});
  SP.collar(R,purD,{r0:0.13,h:0.17});SP.around(R,R.chest,7,0.15,0.13,0.25,(g)=>M(g,G3.cone(0.02,0.12,16),bone,[0,0,0.0],{r:[-0.3,0,0]}),Math.PI-1.3,Math.PI+1.3);
  for(let i=0;i<4;i++)SP.chestArc(R,bone,0.56-i*0.07,0.14-i*0.008,0.03,0.014);
  M(SP.onChest(R,0.46,0,0.03),G3.rb(0.03,0.26,0.02,0.01),bone,[0,0,0]);
  SP.pauldron(R,bone,{layers:2,r:0.11,spikes:3,spikeM:bone,trim:gold});SP.sleeve(R,purD,{r:0.12});
  SP.skirt(R,pur,{len:0.24,n:3,w:0.3,flare:1.25});SP.flap(R,gold,{len:0.23,n:3,w0:0.05,pos:[0,-0.02,0.122*R.B+0.016]});
  SP.belt(R,gold,gem,{t:0.02,buckle:G3.ell(0.03,0.04,0.02)});SP.cape(R,purD,{len:0.3,n:4,w0:0.44,w1:0.64});}},
{name:'Cultista della cripta',desc:'Maschera d\'osso con corna a spirale, catene sul petto e candele accese sulle spalle.',
 body:{skin:0xd8c8b8,shirt:0x1a1418,sleeve:0x1a1418,fore:0x1a1418,pants:0x1a1418,boot:0x1a1418,glove:0x2a2024,eyes:false},
 make(R,K){const robe=K.ds(0x1a1418),bone=K.m(0xe6dcc6),iron=K.m(0x6a6a72),red=K.ds(0x8a1a1f),wax=K.m(0xf0e6cc),glow=K.g(0x9a6aff,2.2);
  SP.hood(R,robe,{depth:0.78,open:1.7});R.face.visible=false;
  M(R.head,G3.sphP(0.19,Math.PI/2-1.05,2.1,Math.PI*0.12,Math.PI*0.68),bone,[0,0.02,0.01]);
  for(const s of [-1,1]){M(R.head,G3.ell(0.05,0.045,0.03),K.dark,[s*0.066,0.035,0.17],{r:[0,0,-s*0.3],ol:0});M(R.head,G3.ell(0.016,0.016,0.01),glow,[s*0.066,0.035,0.19],{ol:0});}
  M(R.head,G3.ell(0.02,0.028,0.02),K.dark,[0,-0.035,0.19],{ol:0});
  for(let i=0;i<6;i++)M(R.head,G3.rb(0.015,0.03,0.012,0.004),K.m(0xf4ecdc),[(i-2.5)*0.019,-0.105,0.178-Math.abs(i-2.5)*0.006],{ol:0.004});
  const sp=[];for(let i=0;i<=24;i++){const t=i/24,a=t*TAU*1.3;sp.push([0.13+0.11*t+Math.cos(a)*0.06*t,0.14+Math.sin(a)*0.09*t+0.02*t,0.0-0.07*t]);}
  for(const s of [-1,1])M(R.head,G3.tube(sp.map(p=>[s*p[0],p[1],p[2]]),0.045,0.008,48,12),bone,null);
  SP.chain(R.torso,iron,[[-0.16,0.6,tZ(0.6,-0.16,1,0.02)],[0,0.4,tZ(0.4,0,1,0.03)],[0.14,0.1,tZ(0.1,0.14,1,0.03)]],14,0.022);
  SP.chain(R.torso,iron,[[0.16,0.6,tZ(0.6,0.16,1,0.02)],[0.03,0.45,tZ(0.45,0.03,1,0.035)],[-0.1,0.3,tZ(0.3,-0.1,1,0.03)]],10,0.02);
  const fl=[];for(const a of R.arms){const s=a===R.arms[0]?-1:1;M(a.sh,G3.cyl(0.025,0.025,0.1,20),wax,[s*0.04,0.11,-0.02]);fl.push(M(a.sh,G3.cone(0.014,0.05,16),K.g(0xffc04a,2.2),[s*0.04,0.19,-0.02],{ol:0}));}
  SP.flicker(R,fl,12);
  SP.capelet(R,robe,{len:0.15,r1:0.27});SP.belt(R,K.m(0x8a1a1f),null,{t:0.03});SP.flap(R,red,{len:0.2,n:2,w0:0.1,jag:0.04,pos:[0.06,-0.02,0.122*R.B+0.01]});
  SP.skirt(R,K.m(0x1a1418),{len:0.24,n:3,w:0.3,flare:1.25,jag:0.07});SP.cape(R,robe,{len:0.32,n:3,w0:0.4,w1:0.58,jag:0.09});}},
],
/* ---------------- PALADINO ---------------- */
paladino:[
{name:'Crociato della luce',desc:'Elmo alato, aureola, armatura bianca e tabarro con il sole d\'oro.',
 body:{skin:0xe0b08a,shirt:0xd9c08a,sleeve:0xf4f0e6,fore:0xf4f0e6,pants:0x8a7a5a,boot:0xf4f0e6,glove:0xf4f0e6},
 make(R,K){const white=K.m(0xf4f0e6),gold=goldM(K),glow=K.g(0xffe08a,2),tab=K.m(0xf8f4ea),capeM=K.ds(0xf4f0e6);
  SP.helmDome(R,white,{cover:0.6});for(const s of [-1,1])M(R.head,G3.leaf(0.1,0.18,0.012),white,[s*0.19,-0.02,0.06],{r:[Math.PI,s*Math.PI/2*0.85,0]});
  M(R.head,G3.hring(0.218,0.016,1.04),gold,[0,0.05,-0.005]);
  for(const s of [-1,1])for(let i=0;i<3;i++)M(R.head,G3.leaf(0.07,0.24-i*0.04,0.012,true),gold,[s*(0.2+i*0.01),0.1+i*0.04,-0.06-i*0.03],{r:[-0.6-i*0.2,s*Math.PI/2,0]});
  R.halo=M(R.head,G3.tor(0.2,0.018,TAU,56,10),glow,[0,0.48,-0.05],{r:[Math.PI/2-0.2,0,0],ol:0});
  SP.shell(R,white,0.22,0.68,0.028);SP.shell(R,tab,0.0,0.6,0.036,-0.85,1.7);SP.sun(SP.onChest(R,0.44,0,0.05),gold,0.04,10);
  SP.pauldron(R,white,{layers:3,trim:gold,r:0.12});SP.bracer(R,white,{ring:gold});SP.greave(R,white,gold);SP.cuisse(R,white);
  SP.belt(R,gold,null);SP.flap(R,tab,{len:0.22,w0:0.22,w1:0.24});SP.backFlap(R,tab,{len:0.22});
  SP.cape(R,capeM,{len:0.32,n:3,w0:0.42,w1:0.6});}},
{name:'Custode del tempio',desc:'Armatura completa d\'oro, elmo a corona di raggi, mantello bianco e fascia blu.',
 body:{skin:0x9a6a48,shirt:0xd9a640,sleeve:0xd9a640,fore:0xd9a640,pants:0x6a5a3a,boot:0xd9a640,glove:0xd9a640},
 make(R,K){const gold=K.m(0xd9a640,{emissive:0x5a3a00,emissiveIntensity:0.25}),white=K.m(0xf4f0e6),blue=K.m(0x2a5aa8),blueD=K.ds(0x2a5aa8),glow=K.g(0xffe08a,1.6);
  SP.greatHelm(R,gold,{rim:white,ridge:white});
  for(let i=0;i<11;i++){const a=(i-5)*0.32;M(R.head,G3.cone(0.025,0.16+(i%2?0:0.06),20),i%2?gold:glow,[Math.sin(a)*0.2,0.2,Math.cos(a)*0.2],{r:[Math.cos(a)*0.55,0,-Math.sin(a)*0.55]});}
  SP.shell(R,gold,0.22,0.68,0.03);SP.shell(R,gold,0.03,0.25,0.026);SP.band(R,white,0.235,0.033,0.013);
  SP.sun(SP.onChest(R,0.47,0,0.04),white,0.045,10);
  SP.strap(R,blue,[[-0.17,0.62],[0.0,0.38],[0.16,0.08]],{w:0.075,off:0.04});SP.strap(R,blue,[[-0.17,0.62],[0.0,0.4],[0.16,0.1]],{w:0.075,off:0.04,back:true});
  SP.pauldron(R,gold,{layers:3,trim:white,r:0.12});SP.upperArm(R,gold);SP.bracer(R,gold,{ring:white});SP.cuisse(R,gold);SP.greave(R,gold,white);
  SP.belt(R,blue,gold);SP.flap(R,blueD,{len:0.22,w0:0.18});SP.backFlap(R,blueD,{len:0.22,w0:0.2});
  SP.cape(R,K.ds(0xf4f0e6),{len:0.32,n:3,w0:0.44,w1:0.62});}},
{name:'Serafino',desc:'Grandi ali bianche, capelli d\'oro, aureola e veste bianca con pettorale d\'argento.',
 body:{skin:0xf0d0b0,shirt:0xf4f0e6,sleeve:0xf4f0e6,fore:0xd8dde6,pants:0xd8dde6,boot:0xd8dde6,glove:0xd8dde6,hair:0xe0b850},
 make(R,K){const white=K.m(0xf8f6ee),cream=K.m(0xe8e0cc),silver=K.m(0xd8dde6),gold=goldM(K),glow=K.g(0xffe08a,2),hair=K.m(0xe0b850);
  SP.hair(R,hair,'long',{len:0.2,n:3});M(R.head,G3.hring(0.198,0.014,1.03),gold,[0,0.1,-0.005],{r:[0.08,0,0]});
  M(R.head,G3.ell(0.02,0.026,0.012),K.g(0x8fdcff,2),[0,0.11,0.2],{ol:0});
  R.halo=M(R.head,G3.tor(0.2,0.018,TAU,56,10),glow,[0,0.48,-0.05],{r:[Math.PI/2-0.2,0,0],ol:0});
  SP.wings(R,white,{m2:cream,m3:K.m(0xf0d890)});
  SP.shell(R,silver,0.25,0.68,0.026);SP.band(R,gold,0.26,0.03,0.012);SP.sun(SP.onChest(R,0.47,0,0.035),gold,0.035,8);
  SP.pauldron(R,silver,{layers:2,trim:gold,r:0.1});SP.sleeve(R,K.ds(0xf4f0e6));
  SP.belt(R,gold,null,{t:0.02});SP.skirt(R,white,{len:0.24,n:3,w:0.3,flare:1.3});}},
],
/* ---------------- ARCIERE ---------------- */
arciere:[
{name:'Ranger',desc:'Cappuccio verde con piuma, mantellina, gilet di cuoio e faretra.',
 body:{skin:0xd8a880,shirt:0x4a7a3a,sleeve:0x4a7a3a,fore:0x6b4a2e,pants:0x3a3a24,boot:0x5a3e28,glove:0x6b4a2e,hair:0x5a3a24},
 make(R,K){const green=K.ds(0x2f5a2a),lea=K.m(0x6b4a2e),red=K.m(0xd94b3a);
  SP.hood(R,green,{depth:0.7});M(R.head,G3.leaf(0.06,0.3,0.01,true),red,[0.18,0.18,-0.1],{r:[-0.9,0,-0.6]});
  SP.capelet(R,green,{len:0.2,r1:0.31});SP.shell(R,lea,0.05,0.6,0.016,-1.1,2.2);
  for(const y of [0.2,0.32,0.44])M(R.torso,G3.rb(0.07,0.01,0.008,0.003),K.m(0x3a2a1a),[0,y,tZ(y,0,1,0.02)],{ol:0});
  SP.quiver(R,lea,{trim:K.m(GOLD),shaft:K.m(0xa88a5a),fl:red});
  SP.belt(R,lea,K.m(0xc8963a));SP.bracer(R,lea);SP.skirt(R,K.m(0x4a7a3a),{len:0.16,n:2,w:0.26});
  SP.bootCuff(R,lea,{t:0.03});SP.cape(R,green,{len:0.28,n:3,w0:0.36,w1:0.48,jag:0.05});}},
{name:'Cacciatore dei boschi',desc:'Cappello a punta con piuma rossa, giubba di cuoio allacciata e tunica dentellata.',
 body:{skin:0xe0b090,shirt:0x3f7a32,sleeve:0x3f7a32,fore:0x3f7a32,pants:0x6b5a3a,boot:0x5a3e28,glove:0x6b4a2e,hair:0xa0602e},
 make(R,K){const green=K.m(0x3f7a32),lea=K.m(0x7a5434),red=K.m(0xc23a2c),hair=K.m(0xa0602e);
  SP.hair(R,hair,'short');SP.beard(R,hair);
  const hat=G3.tube([[0,0.14,0.04],[0,0.26,-0.02],[0,0.3,-0.16],[0,0.24,-0.3]],0.2,0.01,26,22,t=>0.2*Math.pow(1-t,0.9)+0.008);hat.scale(1,0.85,1);M(R.head,hat,green,[0,0.0,0]);
  const br=G3.lathe([[0.25,0.1],[0.22,0.14],[0.2,0.15]],48,Math.PI-1.6,3.2);M(R.head,br,K.ds(0x3f7a32),[0,0.0,0]);
  M(R.head,G3.leaf(0.06,0.34,0.01,true),red,[0.16,0.24,-0.12],{r:[-1.2,0,-0.5]});
  SP.shell(R,lea,0.06,0.62,0.02);for(let i=0;i<4;i++){const y=0.28+i*0.08;M(R.torso,G3.rb(0.08,0.01,0.008,0.003),K.m(0xe8d8b0),[0,y,tZ(y,0,1,0.03)],{r:[0,0,i%2?0.4:-0.4],ol:0});}
  SP.belt(R,K.m(0x3a2a1a),K.m(0xc8963a));M(R.torso,G3.rb(0.09,0.08,0.05,0.018),lea,[-0.12,-0.02,tZ(0,-0.12,1,0.02)]);
  SP.skirt(R,green,{len:0.18,n:2,w:0.27,jag:0.04});SP.quiver(R,lea,{trim:K.m(0x3a2a1a),shaft:K.m(0xa88a5a),fl:red});
  SP.bracer(R,lea);SP.bootCuff(R,lea,{t:0.035,y:0.19});}},
{name:'Arciere elfico',desc:'Orecchie a punta, capelli biondi, diadema con foglia, armatura leggera e mantello lungo.',
 body:{skin:0xf0d8c0,shirt:0x2f5a4a,sleeve:0x2f5a4a,fore:0x2f5a4a,pants:0x2a3a30,boot:0x3a4a3a,glove:0x3a4a3a,hair:0xf0e0a0,ears:'elf'},
 make(R,K){const teal=K.m(0x2f5a4a),tealD=K.ds(0x2a6a5a),silver=K.m(0xd8e2ee),leafG=K.g(0x7fe08a,1.4),hair=K.m(0xf0e0a0);
  SP.hair(R,hair,'long',{len:0.2,n:3});M(R.head,G3.hring(0.198,0.012,1.03),silver,[0,0.08,-0.005],{r:[0.12,0,0]});
  M(R.head,G3.leaf(0.05,0.1,0.01,true),leafG,[0,0.12,0.2],{ol:0.006});
  SP.pauldron(R,silver,{layers:2,trim:K.m(0x7fc8a0),r:0.1});
  SP.shell(R,teal,0.2,0.66,0.02);for(const y of [0.3,0.45,0.6])SP.band(R,silver,y,0.026,0.01);
  SP.belt(R,silver,leafG,{t:0.016,buckle:G3.leaf(0.04,0.06,0.01,true)});
  SP.skirt(R,K.m(0x2f5a4a),{len:0.2,n:2,w:0.25,flare:1.1});SP.quiver(R,silver,{trim:leafG,shaft:K.m(0xe8e0cc),fl:K.m(0xf2f6ff)});
  SP.bracer(R,silver,{len:0.18});SP.bootCuff(R,silver,{t:0.018,y:0.18});SP.cape(R,tealD,{len:0.3,n:4,w0:0.38,w1:0.56});}},
],
/* ---------------- SAMURAI ---------------- */
samurai:[
{name:'Ronin',desc:'Cappello di paglia, kimono rosso con maniche larghe, hakama scura e fodero alla cintura.',
 body:{skin:0xd8a880,shirt:0x9a2a2a,sleeve:0x9a2a2a,fore:0x9a2a2a,pants:0x2a2830,boot:0x2a1a1a,hair:0x1a1418},
 make(R,K){const straw=K.ds(0xc9a86a),red=K.m(0x9a2a2a),dk=K.m(0x2a2830),white=K.m(0xeee6d2),gold=goldM(K),blk=K.m(0x111018);
  SP.hair(R,K.m(0x1a1418),'short');
  M(R.head,G3.lathe([[0.5,0.06],[0.38,0.11],[0.2,0.2],[0.06,0.245],[0,0.25]],56),straw,[0,0,0]);
  for(const s of [-1,1])M(R.head,G3.tube([[s*0.17,0.08,0],[s*0.15,0.0,0.03],[s*0.07,-0.17,0.08],[0,-0.2,0.1]],0.008,0.008,16,6),white,null,{ol:0});
  SP.strap(R,white,[[0.075,0.7],[0.02,0.52],[-0.05,0.38]],{w:0.045,th:0.008});SP.strap(R,red,[[-0.075,0.7],[-0.02,0.53],[0.045,0.4]],{w:0.045,th:0.008,off:0.02});
  SP.sleeve(R,K.ds(0x9a2a2a),{r:0.13});SP.belt(R,blk,null,{t:0.045});
  SP.skirt(R,dk,{len:0.22,n:2,w:0.3,flare:1.3});
  const sa=new THREE.Group();sa.position.set(-0.17,0.05,0.04);sa.rotation.set(-0.3,0,1.2);R.torso.add(sa);
  M(sa,G3.cyl(0.025,0.028,0.7,20),blk,[0,-0.2,0]);M(sa,G3.cyl(0.05,0.05,0.012,28),gold,[0,0.16,0]);M(sa,G3.cyl(0.022,0.022,0.18,16),white,[0,0.26,0]);}},
{name:'Samurai in armatura',desc:'Kabuto con mezzaluna d\'oro e maschera rossa, spallacci a lamelle e gonna di piastre.',
 body:{skin:0xd8a880,shirt:0x2a2830,sleeve:0x2a2830,fore:0x2a2830,pants:0x2a2830,boot:0x1a1a1a,glove:0x2a2830},
 make(R,K){const lac=K.m(0x1a1418),red=K.m(0xa8222a),gold=goldM(K),cord=K.m(0xd9772a),redD=K.ds(0xa8222a);
  SP.helmDome(R,lac,{cover:0.52,r:0.218});
  for(let i=0;i<3;i++){const y=-0.0-i*0.06,r=0.24+i*0.035;M(R.head,G3.lathe([[r,y-0.05],[r-0.03,y]],48,Math.PI-1.9,3.8),i%2?K.ds(0xa8222a):K.ds(0x1a1418),[0,0,0]);}
  for(const s of [-1,1])M(R.head,G3.leaf(0.08,0.12,0.012),red,[s*0.22,0.02,0.1],{r:[0,s*1.2,s*0.6]});
  M(R.head,G3.tor(0.13,0.018,Math.PI*0.85,40,10),gold,[0,0.17,0.215],{r:[0,0,Math.PI*0.075],ol:0.008});
  M(R.head,G3.sphP(0.2,Math.PI/2-1.0,2.0,Math.PI*0.53,Math.PI*0.32),red,[0,0.01,0]);
  for(const s of [-1,1])M(R.head,G3.tube([[s*0.02,-0.06,0.205],[s*0.06,-0.07,0.2],[s*0.09,-0.1,0.17]],0.012,0.004,10,8),K.m(0xeeeeee),null,{ol:0});
  SP.shell(R,red,0.12,0.68,0.03);for(let i=0;i<6;i++)SP.band(R,cord,0.18+i*0.085,0.036,0.008);
  for(const a of R.arms){const s=a===R.arms[0]?-1:1;for(let k=0;k<4;k++){M(a.sh,G3.rb(0.04,0.06,0.26,0.012),k%2?red:lac,[s*(0.085+k*0.006),0.03-k*0.06,0],{r:[0,0,-s*0.22]});}
    M(a.sh,G3.rb(0.02,0.22,0.01,0.004),cord,[s*0.1,-0.06,0.12],{r:[0,0,-s*0.22],ol:0});}
  SP.belt(R,cord,null,{t:0.02});
  SP.skirt(R,lac,{len:0.1,n:2,w:0.26,flare:1.2});
  SP.around(R,R.pelvis,5,0.19,0.15,-0.02,(g,i)=>flow2(R,g,[0,0,0],2,0.08,0.14,0.15,i%2?red:lac,-0.08,-0.35,-0.02),-2.2,2.2);
  SP.bracer(R,lac,{ring:cord});SP.greave(R,lac,red);SP.cape(R,redD,{len:0.26,n:2,w0:0.32,w1:0.4});}},
{name:'Oni',desc:'Maschera da demone rossa con corna e zanne, criniera bianca, armatura nera e rossa.',
 body:{skin:0xc8906a,shirt:0x1a1418,sleeve:0x1a1418,fore:0x5a1a1a,pants:0x1a1418,boot:0x1a1418,glove:0x1a1418,eyes:false,hair:0xf2f2f2},
 make(R,K){const red=K.m(0xc0262c),blk=K.m(0x1a1418),gold=goldM(K),bone=K.m(0xf0e6cc),white=K.m(0xf2f2f2),glow=K.g(0xffd24a,2.4),redD=K.ds(0x8a1a1f);
  SP.hair(R,white,'mane',{spikes:13,len:0.2,w:0.34});R.face.visible=false;
  M(R.head,G3.sphP(0.205,Math.PI/2-1.1,2.2,Math.PI*0.12,Math.PI*0.72),red,[0,0.015,0.005]);
  for(const s of [-1,1]){M(R.head,G3.ell(0.035,0.022,0.02),glow,[s*0.065,0.035,0.19],{r:[0,0,-s*0.25],ol:0});
    M(R.head,G3.tube([[s*0.03,0.08,0.2],[s*0.08,0.1,0.19],[s*0.12,0.09,0.17]],0.022,0.008,12,8),blk,null,{ol:0});
    M(R.head,G3.cone(0.018,0.07,14),bone,[s*0.045,-0.12,0.19],{r:[Math.PI-0.15,0,0],ol:0.006});}
  M(R.head,G3.ell(0.06,0.02,0.02),K.dark,[0,-0.1,0.195],{ol:0});
  SP.horns(R,gold,{pts:[[0.08,0.14,0.08],[0.12,0.28,0.1],[0.1,0.4,0.06],[0.05,0.48,0.02]],r:0.035});
  SP.shell(R,blk,0.12,0.68,0.03);for(let i=0;i<5;i++)SP.band(R,red,0.2+i*0.1,0.036,0.008);
  for(const a of R.arms){const s=a===R.arms[0]?-1:1;for(let k=0;k<3;k++)M(a.sh,G3.rb(0.04,0.06,0.24,0.012),k%2?red:blk,[s*(0.085+k*0.006),0.03-k*0.06,0],{r:[0,0,-s*0.22]});}
  SP.belt(R,red,gold,{t:0.022});SP.skirt(R,blk,{len:0.18,n:2,w:0.28,jag:0.05});
  SP.bracer(R,blk,{ring:red});SP.greave(R,blk,red);SP.cape(R,redD,{len:0.32,n:3,w0:0.42,w1:0.6,jag:0.08});}},
],
/* ---------------- MONACO ---------------- */
monaco:[
{name:'Monaco shaolin',desc:'Testa rasata, veste arancione su una spalla, grande rosario e fasce alle mani.',
 body:{skin:0xe0b08a,shirt:0xe08a2a,sleeve:'skin',fore:'skin',pants:0xd9772a,boot:0x3a2a20,glove:0xe8e0cc,hair:0x2a1e18},
 make(R,K){const or=K.m(0xe08a2a),orD=K.m(0xb85a1a),beads=K.m(0x7a3a20),gold=goldM(K),cream=K.m(0xe8e0cc),red=K.m(0xb52a2a);
  SP.shell(R,or,-0.04,0.7,0.016,-2.3,4.0);
  SP.strap(R,orD,[[0.17,0.64],[0.0,0.4],[-0.15,0.06]],{w:0.08,off:0.03});SP.strap(R,orD,[[0.17,0.64],[0.0,0.42],[-0.15,0.08]],{w:0.08,off:0.03,back:true});
  M(R.arms[0].sh,G3.dome(0.1,0.55,0.8,1.1),or,[-0.01,0.0,0],{r:[0,0,0.3]});
  SP.chain(R.chest,beads,[[-0.16,0.1,0.05],[-0.1,-0.06,0.15],[0,-0.13,0.17],[0.1,-0.06,0.15],[0.16,0.1,0.05]],15,0.024);
  M(R.chest,G3.ell(0.035,0.035,0.035),gold,[0,-0.15,0.17]);
  for(const a of R.arms)for(let i=0;i<4;i++)M(a.el,G3.hring(0.052-i*0.002,0.011,1),cream,[0,-0.12-i*0.04,0],{ol:0});
  SP.belt(R,red,null,{t:0.035});flow2(R,R.pelvis,[0.1,0.03,0.1],2,0.17,0.08,0.07,red,0.15,1,0);
  SP.cuisse(R,K.m(0xd9772a),{len:0.3});for(const l of R.legs)for(let i=0;i<4;i++)M(l.knee,G3.hring(0.058,0.011,1),cream,[0,-0.14-i*0.055,0],{ol:0});
  SP.skirt(R,or,{len:0.16,n:1,w:0.26,sides:false});}},
{name:'Maestro della montagna',desc:'Crocchia bianca con spillone, barba e sopracciglia lunghissime, veste grigia e zucca.',
 body:{skin:0xd8a880,shirt:0x8a8a8a,sleeve:0x8a8a8a,fore:'skin',pants:0x6a6a6a,boot:0x2a2a2a,hair:0xf2f2f2},
 make(R,K){const grey=K.m(0x8a8a8a),blk=K.m(0x2a2a2a),blue=K.m(0x2a3a6a),white=K.m(0xf2f2f2),wood=K.m(0xa8743a),gourd=K.m(0xc89a4a);
  SP.hair(R,white,'topknot',{tie:blk});M(R.head,G3.cyl(0.008,0.008,0.24,8),wood,[0,0.21,-0.05],{r:[0,0,Math.PI/2]});
  SP.beard(R,white,{long:2});
  for(const s of [-1,1])M(R.head,G3.tube([[s*0.03,0.08,0.17],[s*0.12,0.07,0.16],[s*0.2,0.0,0.12],[s*0.21,-0.1,0.09]],0.018,0.005,16,8),white,null,{ol:0.006});
  SP.strap(R,blk,[[-0.07,0.69],[0.02,0.5],[0.11,0.3]],{w:0.05,off:0.02});
  SP.sleeve(R,K.ds(0x8a8a8a),{r:0.12,len:0.24});SP.belt(R,blue,null,{t:0.04});flow2(R,R.pelvis,[-0.1,0.03,0.1],2,0.15,0.07,0.06,blue,0.15,1,0);
  const g=new THREE.Group();g.position.set(0.17,-0.02,0.04);R.pelvis.add(g);M(g,G3.ell(0.05,0.055,0.05),gourd,[0,-0.1,0]);M(g,G3.ell(0.035,0.04,0.035),gourd,[0,-0.02,0]);M(g,G3.cyl(0.012,0.012,0.03,10),wood,[0,0.03,0]);
  SP.skirt(R,grey,{len:0.22,n:3,w:0.29,flare:1.2});}},
{name:'Pugno del drago',desc:'Treccia lunga, fascia rossa, gilet aperto con bordi d\'oro e bracciali del drago che brillano.',
 body:{skin:0xd8a070,shirt:'skin',sleeve:'skin',fore:'skin',pants:0x1a1418,boot:0x1a1418,glove:0xd8a070,hair:0x1a1418,build:1.06},
 make(R,K){const red=K.m(0x9a1a1a),redD=K.ds(0xb52a2a),gold=goldM(K),glow=K.g(0xffb347,1.8),blk=K.m(0x1a1418),hair=K.m(0x1a1418);
  SP.hair(R,hair,'ponytail',{tie:gold});
  M(R.head,G3.hring(0.2,0.024,1.03),red,[0,0.08,-0.005]);flow2(R,R.head,[0.02,0.08,-0.19],3,0.12,0.045,0.035,redD,0.4,1.3,0);
  SP.shell(R,red,0.08,0.68,0.018,0.55,TAU-1.1);
  for(const s of [-1,1])M(R.torso,G3.tube([[s*0.08,0.68,tZ(0.6,s*0.08,1.06,0.03)],[s*0.1,0.45,tZ(0.45,s*0.1,1.06,0.03)],[s*0.11,0.1,tZ(0.1,s*0.11,1.06,0.03)]],0.012,0.012,20,8),gold,null,{ol:0.006});
  for(const a of R.arms){M(a.el,G3.limb(0.064,0.054,0.16,0),gold,[0,-0.18,0]);M(a.el,G3.hring(0.064,0.01,1),glow,[0,-0.11,0],{ol:0});M(a.el,G3.hring(0.056,0.01,1),glow,[0,-0.25,0],{ol:0});
    const sp=[];for(let i=0;i<=20;i++){const t=i/20,an=t*TAU*1.6;sp.push([Math.cos(an)*0.068,-0.05-t*0.24,Math.sin(an)*0.068]);}M(a.sh,G3.tube(sp,0.008,0.008,40,6),glow,null,{ol:0});}
  SP.belt(R,red,gold,{t:0.04});flow2(R,R.pelvis,[0.11,0.03,0.09],2,0.17,0.07,0.06,redD,0.15,1,0);
  SP.cuisse(R,K.m(0x1a1418),{len:0.3});for(const l of R.legs)for(let i=0;i<3;i++)M(l.knee,G3.hring(0.058,0.011,1),red,[0,-0.2-i*0.06,0],{ol:0});}},
],
};

function buildSkin(cls,v){
  const d=SKINS[cls.id][v],R=buildBody(d.body);R.cls=cls;R.skin=d;d.make(R,R.K);
  if(!R.mats.length)R.mats.push(R.skinM);return R;
}

