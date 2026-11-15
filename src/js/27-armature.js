/* =========================================================
   ARMATURE SU MISURA
   Elmo, guanti e corazza trovati nei forzieri non sono più lo stesso pezzo grigio per tutti:
   ogni eroe li porta nel suo stile (forme, materiali e colori suoi). La rarità si legge dalla
   gemma/dal bordo colorato e da quanto il pezzo è ricco: comune-non comune = semplice,
   raro-epico = con ornamenti, leggendario e oltre = con dettagli che brillano.
   I pezzi della testa si adattano da soli a cappelli, elmi e cappucci della skin indossata.
   ========================================================= */
// palette di ogni eroe: a = materiale principale, b = secondo materiale, t = finiture
const GEAR_PAL={
  cavaliere:{a:0xe6eaf0,b:0x3a6fd0,t:0xe0b040},berserker:{a:0x6e727a,b:0x7a5230,t:0xe8dcc0},lanciere:{a:0xe9e4da,b:0xc8281e,t:0xd8a030},
  assassino:{a:0x2a2234,b:0x3d3350,t:0x7a4ae0},mago:{a:0xc0241c,b:0x8a1410,t:0xf0b030},criomante:{a:0xbfe6ff,b:0xf2f6fa,t:0x58a8e8},
  tempesta:{a:0xc9962e,b:0x6a4a2c,t:0xfff27a},druido:{a:0x7a5632,b:0x5c8a3a,t:0xe6dcc4},astromante:{a:0x1d2460,b:0x2e3a8c,t:0xf4e7a0},
  negromante:{a:0xe6dfcf,b:0x1c1620,t:0x9a6aff},paladino:{a:0xf4f1e8,b:0xe9e2cf,t:0xf0c040},arciere:{a:0x2f6a4a,b:0x6a4a2c,t:0xd8e0e8},
  samurai:{a:0x1e181c,b:0xc01818,t:0xe0b040},monaco:{a:0xb8b2aa,b:0x7a4a26,t:0x3a5aa8}};
// misura la testa (con cappello, elmo o cappuccio) nello spazio della testa
function gearFit(R){R.root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(R.head.matrixWorld).invert(),m=new THREE.Matrix4(),v=new THREE.Vector3(),pts=[];
  R.head.traverse(o=>{if(!o.isMesh||o.material===OUT||!o.geometry||!o.geometry.attributes.position)return;for(let p=o;p&&p!==R.head;p=p.parent)if(p.userData.gear)return;
    const a=o.geometry.attributes.position,st=Math.max(1,Math.floor(a.count/260));m.multiplyMatrices(inv,o.matrixWorld);for(let i=0;i<a.count;i+=st){v.fromBufferAttribute(a,i).applyMatrix4(m);pts.push(v.x,v.y,v.z);}});
  const band=(y0,y1)=>{let rx=0.17,zf=0.17,zb=0.17;for(let i=0;i<pts.length;i+=3){const y=pts[i+1];if(y<y0||y>y1)continue;rx=Math.max(rx,Math.abs(pts[i]));zf=Math.max(zf,pts[i+2]);zb=Math.max(zb,-pts[i+2]);}return {rx,zf,zb};};
  let top=0.22,brimY=0.1,brimR=0;for(let i=0;i<pts.length;i+=3){if(Math.abs(pts[i])<0.12&&Math.abs(pts[i+2])<0.14)top=Math.max(top,pts[i+1]);const r=Math.hypot(pts[i],pts[i+2]);if(pts[i+1]>0&&r>brimR){brimR=r;brimY=pts[i+1];}}
  // prima quota sopra la tesa dove il cappello torna stretto: lì va la fascia
  let crownY=brimY+0.05;for(let y=brimY+0.03;y<top;y+=0.01){if(band(y-0.012,y+0.012).rx<brimR*0.62){crownY=y+0.025;break;}}
  return {band,top,brimY,brimR,crownY};}
function gearBuild(R,cls,gear){
  for(const o of R.gearObjs||[]){if(o.parent)o.parent.remove(o);disposeObj(o);}R.gearObjs=[];
  const id=cls.id,B=R.B||1,arms=R.arms;let fit=null,P=GEAR_PAL[id]||GEAR_PAL.cavaliere;
  // con una skin diversa da quella di base il materiale principale prende il colore del suo vestito
  if(R.skin&&SKINS[id]&&R.skin!==SKINS[id][SKINPICK[id]||0]&&R.shirtM&&R.shirtM!==R.skinM)P=Object.assign({},P,{a:new THREE.Color(P.a).lerp(R.shirtM.color,0.6).getHex()});
  for(const k in gear){const g=gear[k];if(!g)continue;const rar=g.rarity|0,T=rar<=1?0:rar<=3?1:2,rc=RARITY[rar].hex;
    const A=toon(P.a),Bm=toon(P.b),Tm=toon(P.t,{emissive:P.t,emissiveIntensity:0.12}),glow=toon(rc,{emissive:rc,emissiveIntensity:0.55+rar*0.1}),gem=new THREE.MeshBasicMaterial({color:rc});
    const top=par=>{const grp=new THREE.Group();grp.userData.gear=1;par.add(grp);R.gearObjs.push(grp);return grp;};
    if(k==='elmo'){const H=top(R.head);fit=fit||gearFit(R);
      // fascia che abbraccia la testa/il copricapo all'altezza y
      const ring=(y,th,mat,pad,arc,ol)=>{const b=fit.band(y-0.02,y+0.02),rx=b.rx+(pad||0.012),zs=((b.zf+b.zb)/2+(pad||0.012))/rx;return M(H,G3.hring(rx,th,zs,arc),mat,[0,y,(b.zf-b.zb)/2],{ol:ol==null?undefined:ol});};
      const front=(y,pad)=>fit.band(y-0.03,y+0.03).zf+(pad||0.012),side=(y,pad)=>fit.band(y-0.03,y+0.03).rx+(pad||0.012),jewel=(y,s)=>M(H,G3.ell(0.03*(s||1),0.036*(s||1),0.02),gem,[0,y,front(y,0.02)],{ol:0});
      if(id==='cavaliere'){ // corona d'oro sull'elmo, cresta d'acciaio, alette
        ring(0.2,0.022,Tm);M(H,G3.vring(fit.top-0.01,0.022,Math.PI*0.62),A,[0,0.03,0],{r:[-0.45,0,0]});jewel(0.2,0.8);
        if(T>=1)for(const s of [-1,1])M(H,G3.leaf(0.11,0.3,0.018,true),A,[s*side(0.2),0.16,-0.03],{r:[0.25,0,-s*0.5]});
        if(T>=2){ring(0.245,0.012,glow,0.006,0,0);for(let i=-2;i<=2;i++)M(H,G3.cone(0.022,0.09,8),Tm,[i*0.07,0.26,front(0.2)-0.02-Math.abs(i)*0.03],{ol:0});}}
      else if(id==='berserker'){ // fascia di ferro borchiata, nasale, anelli sulle corna
        ring(0.11,0.034,A);for(let i=-3;i<=3;i++){const a=i*0.36,b=fit.band(0.08,0.14);M(H,G3.ell(0.02,0.02,0.02,8,6),Tm,[Math.sin(a)*(b.rx+0.03),0.11,Math.cos(a)*(b.zf+0.03)],{ol:0});}
        M(H,G3.rb(0.045,0.17,0.03,0.012),A,[0,0.02,front(0.02,0.02)]);
        if(T>=1){const b=fit.band(-0.12,0.05);M(H,G3.hring(b.rx+0.03,0.06,(b.zb+0.03)/(b.rx+0.03),Math.PI*1.0),Bm,[0,-0.06,0],{r:[0,Math.PI,0]});}
        if(T>=2){M(H,G3.rb(0.03,0.07,0.012,0.006),glow,[0,0.11,front(0.11,0.035)],{ol:0});for(const s of [-1,1])M(H,G3.cone(0.03,0.1,8),Tm,[s*(side(0.11)+0.02),0.12,0],{r:[0,0,-s*1.3],ol:0});}}
      else if(id==='lanciere'){ // frontale d'oro e paraguance
        ring(0.1,0.02,Tm,0.014,Math.PI*1.15);for(const s of [-1,1])M(H,G3.rb(0.03,0.2,0.13,0.012),A,[s*side(0),-0.08,0.05],{r:[0,0,s*0.08]});
        if(T>=1){const b=fit.band(-0.1,0.02);M(H,G3.hring(b.rx+0.02,0.045,(b.zb+0.05)/(b.rx+0.02),Math.PI*0.9),A,[0,-0.1,0],{r:[0.25,Math.PI,0]});jewel(0.1,0.8);}
        if(T>=2){ring(0.14,0.01,glow,0.016,Math.PI*1.1,0);for(const s of [-1,1])M(H,G3.leaf(0.08,0.2,0.014,true),Tm,[s*side(0.12),0.12,0],{r:[0,0,-s*0.7]});}}
      else if(id==='assassino'){ // fascia del cappello con fibbia, penna di corvo
        const y=fit.crownY;ring(y,0.022,Bm,0.006);M(H,G3.rb(0.05,0.045,0.014,0.006),Tm,[0,y,front(y,0.016)],{ol:0});
        if(T>=1)M(H,G3.leaf(0.07,0.34,0.012,true),Bm,[side(y)-0.01,y,-0.02],{r:[-0.5,0,-0.35]});
        if(T>=2){M(H,G3.leaf(0.05,0.26,0.012,true),glow,[side(y)-0.03,y,0.03],{r:[-0.3,0,-0.6],ol:0});jewel(y,0.6);}}
      else if(id==='mago'){ // fascia d'oro con gemma, stelline pendenti
        const y=fit.crownY;ring(y,0.02,Tm,0.006);jewel(y,1);
        if(T>=1)for(const s of [-1,1])M(H,G3.shape(sh=>{for(let i=0;i<10;i++){const a=i/10*TAU,r=i%2?0.018:0.042;sh[i?'lineTo':'moveTo'](Math.sin(a)*r,Math.cos(a)*r);}},0.01,0.004),Tm,[s*0.12,y+0.01,front(y,0.014)-0.03],{r:[0,s*0.5,0],ol:0});
        if(T>=2)M(H,G3.hring(0.1,0.01,1),glow,[0,fit.top+0.06,-0.02],{r:[0.3,0,0],ol:0});}
      else if(id==='criomante'){ // diadema di ghiaccio
        ring(0.12,0.016,Tm,0.012,Math.PI*1.2);const n=T>=2?5:T>=1?3:1;for(let i=0;i<n;i++){const j=i-(n-1)/2,a=j*0.34,b=fit.band(0.09,0.15);M(H,G3.cone(0.03,0.16-Math.abs(j)*0.035,6),T>=2&&!j?glow:A,[Math.sin(a)*(b.rx+0.012),0.2-Math.abs(j)*0.015,Math.cos(a)*(b.zf+0.012)],{ol:j?0:undefined});}
        jewel(0.12,0.8);}
      else if(id==='tempesta'){ // fascia d'ottone con bobine e antenne
        ring(0.13,0.02,A,0.012);for(const s of [-1,1]){M(H,G3.cyl(0.04,0.04,0.05,14),A,[s*side(0.13),0.13,0],{r:[0,0,Math.PI/2]});
          if(T>=1){M(H,G3.tube([[s*side(0.13),0.15,0],[s*(side(0.13)+0.04),0.3,-0.03],[s*(side(0.13)+0.02),0.42,-0.05]],0.012,0.008,10,6),Bm,null,{ol:0});M(H,G3.ell(0.028,0.028,0.028,10,8),T>=2?glow:Tm,[s*(side(0.13)+0.02),0.43,-0.05],{ol:0});}}
        jewel(0.13,0.7);}
      else if(id==='druido'){ // cerchio di rami, corna di cervo, foglie
        ring(0.14,0.013,Bm,0.012,Math.PI*1.1);for(const s of [-1,1]){const x=s*side(0.14);
          if(T>=1){M(H,G3.tube([[x,0.16,-0.02],[x+s*0.05,0.3,-0.05],[x+s*0.03,0.44,-0.07]],0.026,0.008,12,8),toon(P.t),null);M(H,G3.tube([[x+s*0.045,0.28,-0.05],[x+s*0.13,0.34,-0.04],[x+s*0.16,0.42,-0.04]],0.016,0.005,8,6),toon(P.t),null,{ol:0});}
          M(H,G3.leaf(0.07,0.13,0.01,true),T>=2?glow:Bm,[x*0.75,0.17,front(0.14)*0.6],{r:[0.2,s*0.7,-s*0.6],ol:0});}
        jewel(0.14,0.7);}
      else if(id==='astromante'){ // corona di stelle che ruota attorno al cappuccio, mezzaluna
        const b=fit.band(0.05,0.2),n=T>=2?8:T>=1?6:4;ring(0.16,0.008,Tm,0.05,0,0);for(let i=0;i<n;i++){const a=i/n*TAU+0.3;M(H,G3.ell(0.022,0.022,0.022,8,6),i%2?gem:Tm,[Math.sin(a)*(b.rx+0.05),0.16,Math.cos(a)*((b.zf+b.zb)/2+0.05)+(b.zf-b.zb)/2],{ol:0});}
        if(T>=1)M(H,G3.tor(0.06,0.014,Math.PI*1.1,20,6),Tm,[0,0.2,front(0.18,0.03)],{r:[0,0,Math.PI*0.95],ol:0});
        if(T>=2)M(H,G3.hring(0.13,0.008,1),glow,[0,fit.top+0.1,0],{ol:0});}
      else if(id==='negromante'){ // corona d'ossa sul cappuccio
        ring(0.15,0.02,A,0.014);const n=T>=2?7:T>=1?5:3;for(let i=0;i<n;i++){const j=i-(n-1)/2,a=j*0.36,b=fit.band(0.12,0.18);M(H,G3.cone(0.022,0.13-Math.abs(j)*0.015,6),A,[Math.sin(a)*(b.rx+0.014),0.22,Math.cos(a)*(b.zf+0.014)],{r:[0.15,0,-Math.sin(a)*0.5],ol:0});}
        jewel(0.15,0.8);if(T>=2)ring(0.115,0.01,glow,0.016,0,0);}
      else if(id==='paladino'){ // serto d'oro e raggiera
        ring(0.13,0.022,Tm,0.012);jewel(0.13,0.9);
        if(T>=1)for(const s of [-1,1])for(let i=0;i<3;i++)M(H,G3.leaf(0.045,0.12,0.01,true),Tm,[s*(0.07+i*0.06),0.15,front(0.13)-i*0.05],{r:[0.2,s*(0.3+i*0.4),-s*(0.5+i*0.2)],ol:0});
        if(T>=2)for(let i=-3;i<=3;i++)M(H,G3.cone(0.018,0.2-Math.abs(i)*0.03,6),glow,[Math.sin(i*0.33)*0.26,0.12+Math.cos(i*0.33)*0.26,-fit.band(0,0.2).zb-0.02],{r:[0,0,-i*0.33],ol:0});}
      else if(id==='arciere'){ // diadema d'argento a foglie, piume
        ring(0.12,0.01,Tm,0.01,Math.PI*0.8);M(H,G3.leaf(0.06,0.12,0.012,true),Tm,[0,0.12,front(0.12,0.016)]);jewel(0.12,0.6);
        if(T>=1)for(const s of [-1,1])M(H,G3.leaf(0.05,0.1,0.01,true),Tm,[s*0.1,0.12,front(0.12)-0.03],{r:[0,s*0.6,-s*0.5],ol:0});
        if(T>=2)for(let i=0;i<2;i++)M(H,G3.leaf(0.06,0.3-i*0.06,0.01,true),i?glow:A,[side(0.12)-0.01,0.1,-0.03-i*0.05],{r:[-0.5-i*0.25,0,-0.3],ol:0});}
      else if(id==='samurai'){ // fascia laccata e grande mezzaluna d'oro sulla fronte
        ring(0.17,0.024,A,0.014);M(H,G3.tor(0.15+T*0.03,0.02,Math.PI*0.9,24,6),T>=2?glow:Tm,[0,0.2+T*0.02,front(0.17,0.02)],{r:[0,0,Math.PI*0.05],ol:T>=2?0:undefined});
        M(H,G3.ell(0.04,0.04,0.02),Bm,[0,0.19,front(0.17,0.03)],{ol:0});if(T>=1)jewel(0.19,0.6);}
      else{ // monaco: fascia di stoffa annodata dietro, perla sulla fronte
        ring(0.11,0.024,Tm,0.008);const b=fit.band(0.08,0.14);for(const s of [-1,1])M(H,G3.panel(0.05,0.035,0.22+T*0.05,0.012,0),Tm,[s*0.03,0.1,-b.zb-0.01],{r:[-0.35,0,s*0.25],ol:0});
        if(T>=1)M(H,G3.ell(0.024,0.024,0.018,8,6),toon(P.b),[0,0.11,front(0.11,0.02)],{ol:0});if(T>=2)M(H,G3.ell(0.016,0.022,0.012,8,6),gem,[0,0.05,front(0.05,0.004)],{ol:0});}
    }
    else if(k==='guanti'){for(const a of arms){const s=a===arms[0]?-1:1,E=top(a.el);
      const cuff=(y,r,th,mat,ol)=>M(E,G3.hring(r*B,th,1),mat,[0,y,0],{ol:ol==null?0:ol}),sleeve=(r0,r1,len,mat,y)=>M(E,G3.limb(r0*B,r1*B,len,0),mat,[0,y==null?-0.17:y,0]);
      if(id==='cavaliere'||id==='paladino'){sleeve(0.074,0.06,0.2,A);M(E,G3.cyl(0.085*B,0.066*B,0.07,16,true),A,[0,-0.06,0]);cuff(-0.03,0.086,0.012,Tm);M(E,G3.rb(0.09,0.06,0.1,0.02),A,[0,-0.3,0.012]);
        if(T>=1)cuff(-0.27,0.062,0.012,Tm);if(T>=2)cuff(-0.15,0.072,0.01,glow);}
      else if(id==='berserker'){sleeve(0.07,0.058,0.19,Bm);M(E,G3.hring(0.078*B,0.03,1),toon(0x8a6a48),[0,-0.06,0]);for(let i=0;i<3;i++)M(E,G3.ell(0.018,0.018,0.018,8,6),A,[0,-0.13-i*0.06,0.062*B],{ol:0});
        if(T>=1)cuff(-0.27,0.062,0.014,A);if(T>=2)for(let i=0;i<2;i++)M(E,G3.cone(0.022,0.09,6),T>=2&&i?glow:toon(P.t),[s*0.055*B,-0.13-i*0.08,0],{r:[0,0,-s*1.57],ol:0});}
      else if(id==='lanciere'){sleeve(0.07,0.056,0.2,A);cuff(-0.07,0.074,0.012,Tm);cuff(-0.27,0.06,0.012,Tm);if(T>=1)M(E,G3.rb(0.03,0.16,0.016,0.006),Tm,[0,-0.17,0.062*B],{ol:0});if(T>=2)cuff(-0.17,0.068,0.01,glow);}
      else if(id==='assassino'){sleeve(0.062,0.05,0.2,A);for(let i=0;i<3;i++)cuff(-0.09-i*0.07,0.066-i*0.005,0.008,Bm);
        if(T>=1)M(E,G3.leaf(0.03,0.2,0.008,true),toon(0xc8ccd6),[0,-0.36,0.058*B],{r:[Math.PI,0,0],ol:0});if(T>=2)cuff(-0.05,0.07,0.009,glow);}
      else if(id==='mago'||id==='criomante'||id==='astromante'){const fur=id==='criomante';M(E,G3.cyl(0.062*B,0.082*B,0.11,16,true),fur?Bm:A,[0,-0.22,0]);cuff(-0.275,0.084,fur?0.026:0.012,fur?toon(0xf2f6fa):Tm,fur?undefined:0);
        if(T>=1)cuff(-0.17,0.066,0.009,Tm);if(T>=2)cuff(-0.13,0.075,0.008,glow);if(id==='criomante'&&T>=1)for(let i=0;i<3;i++)M(E,G3.cone(0.018,0.07,5),toon(P.a),[Math.sin(i*2.1)*0.085*B,-0.25,Math.cos(i*2.1)*0.085*B],{r:[Math.cos(i*2.1)*0.7,0,-Math.sin(i*2.1)*0.7],ol:0});
        if(id==='astromante')M(E,G3.ell(0.018,0.018,0.018,8,6),gem,[s*0.09*B,-0.2,0.02],{ol:0});}
      else if(id==='tempesta'){sleeve(0.07,0.058,0.2,Bm);for(let i=0;i<4;i++)cuff(-0.09-i*0.045,0.074-i*0.003,0.011,A);M(E,G3.cyl(0.03,0.03,0.04,10),A,[0,-0.14,0.07*B],{r:[Math.PI/2,0,0],ol:0});M(E,G3.ell(0.02,0.02,0.02,8,6),T>=1?glow:Tm,[0,-0.14,0.095*B],{ol:0});
        if(T>=2)cuff(-0.29,0.064,0.01,glow);}
      else if(id==='druido'){sleeve(0.068,0.056,0.2,A);M(E,G3.tube([[0.07*B,-0.06,0],[0,-0.11,0.07*B],[-0.07*B,-0.16,0],[0,-0.21,-0.065*B],[0.062*B,-0.26,0]],0.012,0.01,20,6),Bm,null,{ol:0});
        if(T>=1)M(E,G3.leaf(0.06,0.11,0.01,true),Bm,[s*0.06*B,-0.08,0],{r:[0,0,-s*1.1],ol:0});if(T>=2)M(E,G3.ell(0.022,0.03,0.014,8,6),glow,[0,-0.17,0.062*B],{ol:0});}
      else if(id==='negromante'){sleeve(0.064,0.052,0.2,Bm);for(let i=0;i<3;i++)M(E,G3.rb(0.1*B,0.03,0.03,0.012),A,[0,-0.09-i*0.065,0.045*B],{ol:0});M(E,G3.rb(0.03,0.2,0.03,0.012),A,[0,-0.16,0.055*B],{ol:0});
        if(T>=1)for(let i=-1;i<=1;i++)M(E,G3.rb(0.016,0.07,0.016,0.006),A,[i*0.026,-0.32,0.05],{ol:0});if(T>=2)cuff(-0.05,0.068,0.01,glow);}
      else if(id==='arciere'){const bow=s>0;sleeve(0.066,0.054,bow?0.22:0.14,Bm,bow?-0.16:-0.2);cuff(bow?-0.06:-0.14,0.07,0.01,Tm);cuff(-0.27,0.058,0.01,Tm);
        if(T>=1&&bow)M(E,G3.leaf(0.07,0.2,0.012,true),A,[0,-0.27,0.062*B],{ol:0});if(T>=2)cuff(-0.2,0.064,0.009,glow);}
      else if(id==='samurai'){sleeve(0.068,0.056,0.2,A);for(let i=0;i<3;i++){M(E,G3.rb(0.1*B,0.05,0.02,0.008),A,[0,-0.09-i*0.065,0.058*B]);M(E,G3.rb(0.104*B,0.012,0.024,0.004),Bm,[0,-0.065-i*0.065,0.058*B],{ol:0});}
        M(E,G3.rb(0.085,0.05,0.03,0.012),A,[0,-0.3,0.05]);if(T>=1)cuff(-0.275,0.06,0.011,Tm);if(T>=2)cuff(-0.05,0.072,0.01,glow);}
      else{ // monaco: fasce da combattimento e rosario
        for(let i=0;i<5;i++)cuff(-0.1-i*0.045,0.06-i*0.003,0.014,A,i%2?0:undefined);M(E,G3.rb(0.08,0.05,0.098,0.02),A,[0,-0.3,0.004],{ol:0});
        if(T>=1)for(let i=0;i<8;i++){const a=i/8*TAU;M(E,G3.ell(0.014,0.014,0.014,6,5),T>=2&&i%4===0?glow:toon(P.b),[Math.sin(a)*0.066*B,-0.06,Math.cos(a)*0.066*B],{ol:0});}}
    }}
    else{const C=top(R.torso),sh=(i,fn)=>{for(const a of arms){const s=a===arms[0]?-1:1;if(i&&i!==s)continue;fn(top(a.sh),s);}};
      const shell=(off,y0,y1,mat,w)=>M(C,torsoGeo(B,off,y0,y1,w?-w/2:undefined,w),mat),belt=(y,th,mat,off)=>M(C,G3.hring(tR(y,B)+(off||0.03),th,TZ),mat,[0,y,0]),fz=(y,x,off)=>tZ(y,x||0,B,off||0.05);
      const plate=(mat,sz)=>(S,s)=>{M(S,G3.dome(0.125*(sz||1)*B,0.5,0.72,1.15),mat,[s*0.014,0.03,0],{r:[0,0,-s*0.35]});};
      if(id==='cavaliere'){shell(0.04,0.2,0.66,A);belt(0.22,0.022,Tm,0.045);M(C,G3.rb(0.02,0.3,0.016,0.006),Tm,[0,0.43,fz(0.43,0,0.045)],{ol:0});
        if(T>=1){sh(0,plate(A,1));sh(0,(S,s)=>M(S,G3.hring(0.105*B,0.012,1),Tm,[s*0.012,-0.02,0],{r:[0,0,-s*0.35],ol:0}));}
        if(T>=2){M(C,G3.ell(0.04,0.05,0.02),gem,[0,0.5,fz(0.5,0,0.05)],{ol:0});M(C,G3.hring(tR(0.64,B)+0.035,0.02,TZ),glow,[0,0.64,0],{ol:0});}}
      else if(id==='berserker'){ // cinturone, piastra sul ventre, spallaccio: il petto resta nudo
        shell(0.03,0.14,0.3,Bm);belt(0.3,0.024,toon(0x8a6a48),0.04);M(C,G3.rb(0.12,0.12,0.03,0.014),A,[0,0.22,fz(0.22,0,0.04)]);
        M(C,G3.tube([[-0.16*B,0.6,0.09],[-0.06*B,0.45,0.125*B],[0.08*B,0.3,0.105*B]],0.02,0.02,12,6),Bm,null);M(C,G3.tube([[-0.16*B,0.6,-0.09],[-0.06*B,0.45,-0.125*B],[0.08*B,0.3,-0.105*B]],0.02,0.02,12,6),Bm,null);
        sh(-1,(S,s)=>{plate(A,1.05)(S,s);M(S,G3.hring(0.11*B,0.026,1),toon(0x8a6a48),[s*0.012,-0.03,0],{r:[0,0,-s*0.35]});});
        if(T>=1){M(C,G3.ell(0.045,0.05,0.03),toon(P.t),[0,0.22,fz(0.22,0,0.065)],{ol:0});sh(-1,(S,s)=>{for(let i=-1;i<=1;i++)M(S,G3.cone(0.024,0.1,6),toon(P.t),[s*(0.07+0.02),0.1,i*0.06],{r:[0,0,-s*0.9],ol:0});});}
        if(T>=2){sh(1,plate(A,0.95));M(C,G3.ell(0.02,0.022,0.012,8,6),gem,[0,0.225,fz(0.225,0,0.09)],{ol:0});belt(0.16,0.012,glow,0.04);}}
      else if(id==='lanciere'){shell(0.036,0.3,0.64,A,2.3);belt(0.25,0.03,Bm,0.035);M(C,G3.cyl(0.055,0.055,0.016,18),Tm,[0,0.5,fz(0.5,0,0.045)],{r:[Math.PI/2,0,0],ol:0});
        sh(0,(S,s)=>{M(S,G3.dome(0.115*B,0.5,0.6,1.2),A,[s*0.012,0.03,0],{r:[0,0,-s*0.3]});M(S,G3.hring(0.1*B,0.012,1),Tm,[s*0.01,-0.015,0],{r:[0,0,-s*0.3],ol:0});});
        if(T>=1)for(const x of [-0.085,0.085])M(C,G3.cyl(0.04,0.04,0.014,14),Tm,[x*B,0.38,fz(0.38,x*B,0.045)],{r:[Math.PI/2,0,0],ol:0});
        if(T>=2){M(C,G3.ell(0.026,0.026,0.012,8,6),gem,[0,0.5,fz(0.5,0,0.06)],{ol:0});M(C,G3.hring(tR(0.64,B)+0.03,0.016,TZ),glow,[0,0.64,0],{ol:0});}}
      else if(id==='assassino'){shell(0.028,0.26,0.6,A);belt(0.24,0.02,Bm,0.035);M(C,G3.tube([[-0.17*B,0.62,0.07],[-0.04*B,0.46,0.135*B],[0.12*B,0.28,0.1*B]],0.016,0.016,12,6),Bm,null,{ol:0});
        for(const x of [-0.09,0.09])M(C,G3.rb(0.06,0.07,0.035,0.014),Bm,[x*B,0.2,fz(0.2,x*B,0.04)]);
        if(T>=1)for(let i=0;i<3;i++)M(C,G3.leaf(0.022,0.11,0.006,true),toon(0xc8ccd6),[-0.1*B+i*0.055,0.5-i*0.065,fz(0.5-i*0.065,-0.1*B+i*0.055,0.045)],{r:[0,0,-0.7],ol:0});
        if(T>=2){M(C,G3.ell(0.028,0.028,0.014,8,6),gem,[0,0.62,fz(0.62,0,0.03)],{ol:0});sh(-1,(S,s)=>M(S,G3.dome(0.1*B,0.45,0.6,1.1),Bm,[s*0.012,0.03,0],{r:[0,0,-s*0.35]}));}}
      else if(id==='mago'||id==='criomante'||id==='astromante'){ // mantellina sulle spalle, fascia in vita, ciondolo
        const fur=id==='criomante';M(C,torsoGeo(B,0.05,0.5,0.69,undefined,undefined,(y)=>(0.69-y)*0.35),fur?toon(0xf2f6fa):A);M(C,G3.hring(tR(0.5,B)+0.085,0.014,TZ),Tm,[0,0.5,0],{ol:0});belt(0.27,0.03,id==='astromante'?Bm:Tm,0.03);
        M(C,G3.ell(0.03,0.038,0.016),gem,[0,0.47,fz(0.47,0,0.07)],{ol:0});
        if(T>=1){if(fur)sh(0,(S,s)=>{for(let i=-1;i<=1;i++)M(S,G3.cone(0.03,0.15-Math.abs(i)*0.04,5),A,[s*0.05,0.1,i*0.055],{r:[i*0.35,0,-s*0.5],ol:0});});
          else if(id==='astromante')sh(0,(S,s)=>M(S,G3.tor(0.07,0.016,Math.PI*1.1,18,6),Tm,[s*0.05,0.08,0],{r:[0,Math.PI/2,Math.PI*0.95],ol:0}));
          else sh(0,(S,s)=>M(S,G3.dome(0.11*B,0.45,0.5,1.1),Tm,[s*0.012,0.04,0],{r:[0,0,-s*0.35]}));}
        if(T>=2){M(C,G3.hring(0.06,0.008,1),glow,[0,0.47,fz(0.47,0,0.075)],{r:[Math.PI/2,0,0],ol:0});belt(0.27,0.01,glow,0.065);}}
      else if(id==='tempesta'){ // imbracatura d'ottone con bobina al centro, isolatori sulle spalle
        shell(0.03,0.3,0.6,Bm,2.0);belt(0.26,0.024,A,0.035);belt(0.56,0.016,A,0.035);M(C,G3.cyl(0.07,0.07,0.04,18),A,[0,0.44,fz(0.44,0,0.05)],{r:[Math.PI/2,0,0]});M(C,G3.ell(0.042,0.042,0.02),T>=1?glow:Tm,[0,0.44,fz(0.44,0,0.075)],{ol:0});
        if(T>=1)sh(0,(S,s)=>{for(let i=0;i<3;i++)M(S,G3.cyl(0.05-i*0.01,0.055-i*0.01,0.03,12),i%2?Bm:A,[s*0.02,0.07+i*0.035,0],{ol:0});});
        if(T>=2){sh(0,(S,s)=>M(S,G3.ell(0.026,0.026,0.026,8,6),glow,[s*0.02,0.18,0],{ol:0}));for(const x of [-0.1,0.1])M(C,G3.tube([[x*B,0.44,fz(0.44,x*B,0.04)],[x*1.4*B,0.56,0.06],[x*1.9*B,0.62,0]],0.01,0.01,10,5),Tm,null,{ol:0});}}
      else if(id==='druido'){ // pettorale di corteccia, cintura di rampicanti, foglie sulle spalle
        shell(0.04,0.28,0.62,A,2.2);M(C,G3.tube([[0.16*B,0.25,0],[0,0.24,0.125*B],[-0.16*B,0.26,0],[0,0.25,-0.115*B],[0.16*B,0.25,0]],0.018,0.018,24,6),Bm,null);
        for(let i=0;i<3;i++)M(C,G3.rb(0.012,0.2,0.012,0.004),toon(0x4a3218),[(i-1)*0.06*B,0.45,fz(0.45,(i-1)*0.06*B,0.046)],{r:[0,0,(i-1)*0.12],ol:0});
        sh(0,(S,s)=>{const n=T>=1?3:2;for(let i=0;i<n;i++)M(S,G3.leaf(0.09,0.17,0.012,true),Bm,[s*0.02,0.03,(i-(n-1)/2)*0.07],{r:[(i-(n-1)/2)*0.5,0,-s*(1.25)],ol:i?0:undefined});});
        if(T>=1)M(C,G3.ell(0.035,0.045,0.02),toon(P.t),[0,0.5,fz(0.5,0,0.055)],{ol:0});
        if(T>=2){M(C,G3.ell(0.022,0.03,0.014,8,6),gem,[0,0.5,fz(0.5,0,0.07)],{ol:0});for(const x of [-0.07,0.07])M(C,G3.rb(0.01,0.16,0.008,0.003),glow,[x*B,0.42,fz(0.42,x*B,0.05)],{r:[0,0,x*2],ol:0});}}
      else if(id==='negromante'){ // gabbia di costole
        M(C,G3.rb(0.026,0.3,0.02,0.008),A,[0,0.44,fz(0.44,0,0.045)]);const n=T>=1?4:3;for(let i=0;i<n;i++){const y=0.56-i*0.075;M(C,G3.hring(tR(y,B)+0.035,0.014,TZ,Math.PI*(1.15-i*0.08)),A,[0,y,0],{ol:0});}
        belt(0.25,0.02,toon(0x7a1820),0.03);
        if(T>=1)sh(0,(S,s)=>{M(S,G3.ell(0.07,0.075,0.075),A,[s*0.02,0.06,0]);for(const z of [-0.028,0.028])M(S,G3.ell(0.016,0.02,0.01,6,5),new THREE.MeshBasicMaterial({color:0x14101a}),[s*0.085,0.07,z],{ol:0});});
        if(T>=2){M(C,G3.ell(0.035,0.04,0.02),glow,[0,0.47,fz(0.47,0,0.03)],{ol:0});sh(0,(S,s)=>{for(const z of [-0.028,0.028])M(S,G3.ell(0.012,0.014,0.008,6,5),gem,[s*0.09,0.07,z],{ol:0});});}}
      else if(id==='paladino'){shell(0.045,0.2,0.66,A);belt(0.22,0.024,Tm,0.05);M(C,G3.cyl(0.06,0.06,0.014,20),Tm,[0,0.48,fz(0.48,0,0.05)],{r:[Math.PI/2,0,0],ol:0});
        sh(0,(S,s)=>{plate(A,1.1)(S,s);M(S,G3.hring(0.115*B,0.014,1),Tm,[s*0.012,-0.02,0],{r:[0,0,-s*0.35],ol:0});});
        if(T>=1)for(let i=0;i<8;i++){const a=i/8*TAU;M(C,G3.cone(0.012,0.05,5),Tm,[Math.sin(a)*0.085,0.48+Math.cos(a)*0.085,fz(0.48,0,0.048)],{r:[0,0,-a],ol:0});}
        if(T>=2){M(C,G3.ell(0.03,0.03,0.014,8,6),gem,[0,0.48,fz(0.48,0,0.062)],{ol:0});sh(0,(S,s)=>M(S,G3.hring(0.09*B,0.01,1),glow,[s*0.03,0.07,0],{r:[0,0,-s*0.35],ol:0}));}}
      else if(id==='arciere'){ // giubba di cuoio, spallaccio a foglia sul braccio dell'arco, tracolla
        shell(0.03,0.26,0.62,Bm,2.6);belt(0.25,0.02,toon(0x3a2a1c),0.035);M(C,G3.tube([[0.17*B,0.62,0.07],[0.04*B,0.46,0.135*B],[-0.12*B,0.28,0.1*B]],0.016,0.016,12,6),toon(0x3a2a1c),null,{ol:0});
        sh(1,(S,s)=>{const n=T>=1?3:2;for(let i=0;i<n;i++)M(S,G3.leaf(0.11,0.19-i*0.02,0.014,true),i%2?A:Tm,[s*(0.03+i*0.015),0.07-i*0.05,0],{r:[Math.PI/2,0,-s*(1.9-i*0.25)],ol:i?0:undefined});});
        M(C,G3.leaf(0.05,0.09,0.01,true),Tm,[0,0.5,fz(0.5,0,0.04)],{ol:0});
        if(T>=2){M(C,G3.ell(0.02,0.024,0.012,8,6),gem,[0,0.54,fz(0.54,0,0.05)],{ol:0});belt(0.25,0.009,glow,0.06);}}
      else if(id==='samurai'){ // dō a fasce laccate con allacciature rosse, sode sulle spalle
        for(let i=0;i<4;i++){M(C,torsoGeo(B,0.04+(3-i)*0.004,0.26+i*0.09,0.34+i*0.09),A);M(C,G3.hring(tR(0.345+i*0.09,B)+0.046,0.008,TZ),Bm,[0,0.345+i*0.09,0],{ol:0});}
        belt(0.24,0.026,T>=1?Tm:Bm,0.04);
        sh(0,(S,s)=>{const n=T>=1?3:2;for(let i=0;i<n;i++){M(S,G3.rb(0.03,0.07,0.2,0.01),A,[s*(0.085+i*0.012),0.02-i*0.075,0],{r:[0,0,s*0.12]});M(S,G3.rb(0.034,0.012,0.204,0.004),Bm,[s*(0.085+i*0.012),-0.012-i*0.075,0],{r:[0,0,s*0.12],ol:0});}});
        if(T>=2){M(C,G3.cyl(0.04,0.04,0.012,16),Tm,[0,0.5,fz(0.5,0,0.05)],{r:[Math.PI/2,0,0],ol:0});M(C,G3.ell(0.02,0.02,0.01,8,6),gem,[0,0.5,fz(0.5,0,0.06)],{ol:0});belt(0.24,0.009,glow,0.07);}}
      else{ // monaco: rosario a tracolla, corda in vita con fascia blu
        const n=T>=1?16:12;for(let i=0;i<n;i++){const t=i/n*TAU,x=Math.sin(t)*0.2*B,y=0.44+Math.sin(t)*0.17,z=Math.cos(t)*0.15*B;M(C,G3.ell(0.022,0.022,0.022,8,6),T>=2&&i%4===0?glow:toon(P.b),[x,y,z],{ol:0});}
        belt(0.26,0.022,toon(0xd8cdb8),0.03);M(C,G3.panel(0.09,0.07,0.3,0.014,0),Tm,[0.07*B,0.26,fz(0.26,0.07*B,0.035)],{ol:0});
        if(T>=1)sh(-1,(S,s)=>M(S,G3.dome(0.105*B,0.5,0.7,1.1),toon(P.t),[s*0.012,0.03,0],{r:[0,0,-s*0.35]}));
        if(T>=2)M(C,G3.ell(0.03,0.03,0.016,8,6),gem,[0,0.27,fz(0.27,0,0.05)],{ol:0});}
    }
  }
}
refreshGearVisual=function(){if(hero&&G.cls)gearBuild(hero,G.cls,G.gear);};
if(hero)refreshGearVisual();
// laboratorio: foto di un eroe con (o senza) l'equipaggiamento
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{gearRefresh:()=>refreshGearVisual(),gearShot(ci,rar,w,h,o){o=o||{};const c=CLASSES[ci],R=buildSkin(c,o.skin!=null?o.skin:(SKINPICK[c.id]||0));
    poseShop(R,c,o.pose);if(rar>=0){const g={};for(const k of o.slots||['elmo','guanti','corazza'])g[k]={rarity:rar,slot:k};gearBuild(R,c,g);}
    R.root.rotation.y=o.ry!=null?o.ry:(R.root.userData.ry||0.5);const fr=o.head?{cx:0,cy:1.8,h:1.25,dist:6,oy:0.1}:psFrame(R.root,1.1,0.75);
    const u=psURL(psShot(R.root,w,h,fr,false));disposeObj(R.root);return u;},clsN:()=>CLASSES.map(c=>c.id)});
