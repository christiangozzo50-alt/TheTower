/* =========================================================
   PRESTAZIONI
   Nemici: un modello per tipo con meno poligoni e pezzi fusi; ogni nemico lo riusa invece di ricostruirlo
   ========================================================= */
const OPT={tpl:new Map()};
function optRefs(root,obj){const out=new Set(),seen=new Set();(function w(v,d){if(!v||typeof v!=='object'||seen.has(v)||d>7)return;seen.add(v);
    if(v.isObject3D){if(v!==root)out.add(v);return;}if(v.isMaterial||v.isBufferGeometry||v.isTexture)return;if(Array.isArray(v)){for(const x of v)w(x,d+1);return;}
    if(Object.getPrototypeOf(v)===Object.prototype)for(const k in v)if(k!=='root')w(v[k],d+1);})(obj,0);return out;}
// ciò che le funzioni di animazione muovono non si può fondere: si scopre provandole
function optMoving(root,parts,keep){const ticks=(parts.tick||[]).concat((parts.rig&&parts.rig.tick)||[]);if(!ticks.length)return;const nodes=[],sig=o=>o.position.toArray().concat(o.quaternion.toArray(),o.scale.toArray(),[o.visible?1:0]).join();root.traverse(o=>nodes.push([o,sig(o)]));
  for(let i=0;i<4;i++)for(const f of ticks){try{f(parts.rig&&(parts.rig.tick||[]).includes(f)?parts.rig:parts,1.3+i*0.7,0.1);}catch(e){}}
  for(const [o,a] of nodes)if(sig(o)!==a)keep.add(o);}
function optBake(list,mat){let v=0,idx=0;for(const it of list){const g=it.g;v+=g.attributes.position.count;idx+=g.index?g.index.count:g.attributes.position.count;}
  const pos=new Float32Array(v*3),nor=new Float32Array(v*3),ind=v>65535?new Uint32Array(idx):new Uint16Array(idx),V=new THREE.Vector3(),nm=new THREE.Matrix3();let o=0,io=0;
  for(const it of list){const g=it.g,P_=g.attributes.position,N=g.attributes.normal,flip=it.m.determinant()<0;nm.getNormalMatrix(it.m);const base=o,I=g.index,n=I?I.count:P_.count;
    for(let i=0;i<P_.count;i++,o++){V.fromBufferAttribute(P_,i).applyMatrix4(it.m);pos[o*3]=V.x;pos[o*3+1]=V.y;pos[o*3+2]=V.z;if(N){V.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor[o*3]=V.x;nor[o*3+1]=V.y;nor[o*3+2]=V.z;}}
    for(let i=0;i<n;i+=3){const a=I?I.getX(i):i,b=I?I.getX(i+1):i+1,c=I?I.getX(i+2):i+2;ind[io++]=base+a;ind[io++]=base+(flip?c:b);ind[io++]=base+(flip?b:c);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setIndex(new THREE.BufferAttribute(ind,1));g.computeBoundingSphere();return g;}
function optMerge(root,parts){const keep=optRefs(root,parts);optMoving(root,parts,keep);root.updateMatrixWorld(true);
  const isOutline=h=>h.isMesh&&h.material===OUT,all=[];root.traverse(o=>all.push(o));
  const canBake=o=>o.isMesh&&o.visible&&!keep.has(o)&&!Array.isArray(o.material)&&!o.material.map&&!o.material.vertexColors&&!!o.geometry.attributes.position&&o.children.every(isOutline);
  // tutto ciò che non si può fondere resta al suo posto, insieme ai gruppi che lo contengono
  for(const o of all)if(o!==root&&(o.isMesh?!canBake(o)&&!(isOutline(o)&&canBake(o.parent)):o.type!=='Group'&&o.type!=='Object3D'||!o.visible))keep.add(o);
  const busy=new Set();for(const k of keep){let q=k;while(q&&q!==root){busy.add(q);q=q.parent;}}busy.add(root);
  const anchor=o=>{let q=o.parent;while(!busy.has(q))q=q.parent;return q;};
  const by=new Map(),inv=new THREE.Matrix4();
  for(const o of all){if(!o.isMesh||busy.has(o))continue;const a=anchor(o),k=a.uuid+'|'+o.material.uuid+'|'+o.castShadow+'|'+o.receiveShadow+'|'+o.renderOrder;if(!by.has(k))by.set(k,{a,list:[]});by.get(k).list.push(o);}
  for(const {a,list} of by.values()){inv.copy(a.matrixWorld).invert();const items=list.map(c=>({g:c.geometry,m:new THREE.Matrix4().multiplyMatrices(inv,c.matrixWorld)}));
    const me=new THREE.Mesh(optBake(items,list[0].material),list[0].material);me.castShadow=list[0].castShadow;me.receiveShadow=list[0].receiveShadow;me.renderOrder=list[0].renderOrder;a.add(me);busy.add(me);}
  // via i pezzi originali e i gruppi rimasti vuoti
  for(const o of all){if(o===root||busy.has(o)||!o.parent)continue;o.parent.remove(o);if(o.isMesh&&o.geometry)o.geometry.dispose();}}
function optClone(tpl){const map=new Map(),mat=m=>{if(!m||!m.isMaterial)return m;if(m.userData.keep)return m;let c=map.get(m);if(!c){c=m.clone();c.userData={};for(const k in m.userData){const v=m.userData[k];c.userData[k]=v&&v.clone?v.clone():v;}map.set(m,c);}return c;};
  const node=o=>{let c;if(o.isMesh){c=new THREE.Mesh(o.geometry,Array.isArray(o.material)?o.material.map(mat):mat(o.material));}else if(o.type==='Group')c=new THREE.Group();else if(o.type==='Object3D')c=new THREE.Object3D();else{c=o.clone(false);}
    c.position.copy(o.position);c.quaternion.copy(o.quaternion);c.scale.copy(o.scale);c.visible=o.visible;c.castShadow=o.castShadow;c.receiveShadow=o.receiveShadow;c.renderOrder=o.renderOrder;c.frustumCulled=o.frustumCulled;c.name=o.name;map.set(o,c);for(const k of o.children)c.add(node(k));return c;};
  node(tpl.root);
  const seen=new Map(),walk=v=>{if(!v||typeof v!=='object')return v;if(v.isObject3D||v.isMaterial)return map.has(v)?map.get(v):v.isMaterial?mat(v):v;if(v.isBufferGeometry||v.isTexture)return v;if(seen.has(v))return seen.get(v);
    if(Array.isArray(v)){const a=[];seen.set(v,a);for(const x of v)a.push(walk(x));return a;}if(v.isVector3||v.isVector2||v.isColor||v.isEuler||v.isQuaternion)return v.clone();
    if(Object.getPrototypeOf(v)!==Object.prototype)return v;const o={};seen.set(v,o);for(const k in v)o[k]=walk(v[k]);return o;};
  return walk(tpl);}
function optTemplate(type){let t=OPT.tpl.get(type);if(t!==undefined)return t;G3Q=0.55;try{t=BUILD[type]();}finally{G3Q=1;}
  if((t.tick&&t.tick.length)||(t.rig&&t.rig.tick&&t.rig.tick.length)){OPT.tpl.set(type,null);return null;}
  try{optMerge(t.root,t);t.root.traverse(o=>{if(o.geometry)o.geometry.userData.keep=true;});}catch(e){console.warn('modello',type,e);OPT.tpl.set(type,null);return null;}
  OPT.tpl.set(type,t);return t;}
function enemyParts(type){const t=optTemplate(type);if(t)return optClone(t);G3Q=0.55;let p;try{p=BUILD[type]();}finally{G3Q=1;}try{optMerge(p.root,p);}catch(e){}return p;}
function bossParts(def){G3Q=0.7;let p;try{p=BOSSB[def.arch](def);}finally{G3Q=1;}try{optMerge(p.root,p);}catch(e){console.warn('boss',e);}return p;}
// i modelli del piano si preparano mentre si sale, non durante il combattimento
const _sfOpt=startFloor;startFloor=function(f){const r=_sfOpt.apply(this,arguments);try{for(const t of new Set(G.queue||[]))if(t!=='boss'&&BUILD[t])optTemplate(t);}catch(e){}return r;};

/* ---------- qualità grafica: Auto parte da media sul telefono e scende da sola se il gioco rallenta ---------- */
const QL={lv:2,f:0,t0:0,n:0,cool:0};
function applyQuality(lv){QL.lv=lv;OUT.visible=lv>0;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  const on=lv>0;if(sun.castShadow!==on){sun.castShadow=on;}
  const sz=lv>=2?1024:512;if(sun.shadow.mapSize.x!==sz){sun.shadow.mapSize.set(sz,sz);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}
  const rs=lv===0?1.3:1;if(window.__qRes!==rs){window.__qRes=rs;resize();}}
function qualityUi(){for(const b of document.querySelectorAll('#optQ button'))b.classList.toggle('on',String(SETTINGS.q)===b.dataset.q);}
function setQuality(q){SETTINGS.q=q;store.set('settings',SETTINGS);applyQuality(q==='auto'?(isTouch?1:2):+q);QL.t0=0;qualityUi();}
$('optQ').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;sfx('ui');setQuality(b.dataset.q==='auto'?'auto':+b.dataset.q);});
const _osQ=openSettings;openSettings=function(){const r=_osQ.apply(this,arguments);qualityUi();return r;};
const _burstQ=burst;burst=function(x,y,c,n,a,b,d,e){return _burstQ(x,y,c,QL.lv>=2?n:Math.max(1,Math.round(n*(QL.lv===1?0.75:0.5))),a,b,d,e);};
const _ppQ=pollPad;pollPad=function(){_ppQ();QL.f++;renderer.shadowMap.needsUpdate=QL.lv>=2||QL.f%2===0;
  if(SETTINGS.q!=='auto'||document.hidden||QL.lv<=0||(G.state!=='play'&&G.state!=='cellar'))return void(QL.t0=0);
  const t=performance.now();if(!QL.t0){QL.t0=t;QL.n=0;return;}QL.n++;if(t-QL.t0>=3000){const fps=QL.n*1000/(t-QL.t0);QL.t0=0;if(fps<34&&t>QL.cool){QL.cool=t+6000;applyQuality(QL.lv-1);}}};
setQuality(SETTINGS.q==null?'auto':SETTINGS.q);

/* ---------- se la scheda grafica si azzera il gioco si rimette in piedi invece di restare bloccato ---------- */
{let tm=0;const box=document.createElement('div');box.id='ctxBox';box.hidden=true;box.innerHTML='<div><b>Ripristino la grafica…</b><div id="ctxMore" hidden><p>Non riesco a ripristinarla.</p><button class="big" id="ctxReload">Ricarica il gioco</button></div></div>';document.body.appendChild(box);
  $('ctxReload').onclick=()=>{try{Promise.race([cloudSave(true),new Promise(r=>setTimeout(r,1500))]).finally(()=>location.reload());}catch(e){location.reload();}};
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();pause();box.hidden=false;$('ctxMore').hidden=true;clearTimeout(tm);tm=setTimeout(()=>{$('ctxMore').hidden=false;},7000);});
  canvas.addEventListener('webglcontextrestored',()=>{clearTimeout(tm);box.hidden=true;resize();renderer.shadowMap.needsUpdate=true;});}

/* ---------- armadio: le skin che possiedi del personaggio equipaggiato ---------- */
function wrSkins(){const c=G.cls,out=[];(SKINS[c.id]||[]).forEach((s,i)=>{if(skinUnlocked(c.id,i))out.push({id:'b'+i,sk:i,k:null,name:s.name||('Skin '+(i+1)),sub:'Aspetto base'});});
  for(const k of OWNS){const o=sParse(k);if(o.cid===c.id&&SKINS[c.id]&&SKINS[c.id][o.sk]&&VARS[o.v])out.push({id:'s'+k,k,sk:o.sk,name:skinName(k),sub:'Dal negozio',col:VARS[o.v].c});}return out;}
const wrSkinOn=x=>x.k?SSEL[G.cls.id]===x.k&&ownsS(x.k):(!shopSel(G.cls.id)&&skinOf(G.cls.id)===x.sk);
function skinThumb(x){if(x.k)return thumbOf(x.k);const key='b.'+G.cls.id+'.'+x.sk;if(THUMB[key]!=null)return THUMB[key];
  try{const c=G.cls,R=buildSkin(c,x.sk);poseShop(R,c);R.root.rotation.y=R.root.userData.ry||0.5;const fr=psFrame(R.root,1.12,0.75);fr.cy-=0.06;const u=psURL(psShot(R.root,72,96,fr,true));disposeObj(R.root);return THUMB[key]=u;}catch(e){return THUMB[key]='';}}
function skinSlotHTML(){const list=wrSkins(),cur=list.find(wrSkinOn)||list[0],im=cur?skinThumb(cur):'';
  return `<button class="wslot" data-slot="skin" aria-pressed="${wrSlot==='skin'}" style="--rc:#c7a8ff;--rcg:rgba(199,168,255,.28)"><span class="thumb">${im?`<img src="${im}" alt="" style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated">`:''}</span><span><small>Skin (${list.length})</small><b>${esc(cur?cur.name:'Base')}</b></span></button>`;}
function renderWrSkins(){const list=wrSkins();if(!list.some(x=>x.id===wrSel))wrSel=(list.find(wrSkinOn)||list[0]||{}).id||null;
  $('wrTitle').textContent=`Skin di ${G.cls.name} (${list.length})`;
  $('wrList').innerHTML=list.map(x=>`<button class="wtile sk-t${wrSkinOn(x)?' on':''}" data-id="${x.id}" aria-pressed="${x.id===wrSel}" title="${esc(x.name)}" style="--rc:${x.col||'#b4ab9b'};--rcg:rgba(199,168,255,.2)">${skinThumb(x)?`<img src="${skinThumb(x)}" alt="">`:''}</button>`).join('');
  const x=list.find(y=>y.id===wrSel);$('wrDetail').innerHTML=x?`<b class="n" style="--rc:${x.col||'#f3ead7'}">${esc(x.name)}</b><span>${x.sub}</span><div class="row">${wrSkinOn(x)?'<button class="mini" disabled>Indossata</button>':`<button class="mini" data-skinwear="${x.id}">Indossa</button>`}</div>`:'';
  $('wrNote').textContent='Altre skin le trovi nel Negozio e nei Trofei della Bacheca.';}
$('wardrobe').addEventListener('click',e=>{const b=e.target.closest('[data-skinwear]');if(!b)return;e.stopPropagation();const x=wrSkins().find(y=>y.id===b.dataset.skinwear);if(!x)return;const id=G.cls.id;
  if(x.k)SSEL[id]=x.k;else{delete SSEL[id];SKINSEL[id]=x.sk;store.set('skinsel',SKINSEL);}store.set('shopskinsel',SSEL);setHero(G.cls);sfx('equip');burst(P.x,1.2,0xc7a8ff,16,3,2,0.3);renderWardrobe();},true);

/* ---------- casse del negozio: cade, trema, esplode di luce del colore della rarità e mostra l'oggetto ---------- */
const CF={m:null,raf:0,o:null,cr:null,sparks:[],rings:[]};
(function(){const d=document.createElement('section');d.className='screen';d.id='crateFx';d.hidden=true;d.innerHTML='<div class="cf-rays"></div><div class="cf-stage"><div class="cf-glow" id="cfGlow"></div><canvas id="cfCan" width="168" height="168"></canvas><div class="cf-card" id="cfCard"></div></div><canvas id="cfFx"></canvas><div id="cfFlash"></div><button class="ghost" id="cfSkip">Salta</button><button class="big" id="cfOk" hidden>Continua</button>';document.body.appendChild(d);})();
const cfDrop=0.38;
function crateShow(cr,o){cfClose(true);const R=RARITY[o.rarity],m=crateModel(cr.id),P_=m.userData.parts,box=$('crateFx');CF.m=m;CF.o=o;CF.cr=cr;CF.sparks=[];CF.rings=[];
  // più rara è, più è epica: 0 normale · 1 Epica · 2 Leggendaria · 3 Mitica e oltre
  const tier=o.rarity>=5?3:o.rarity>=4?2:o.rarity>=3?1:0;box.dataset.tier=tier;box.classList.remove('shake','ban','charge');
  if(!$('cfBan')){const b=document.createElement('div');b.id='cfBan';b.className='cf-ban';box.appendChild(b);}$('cfBan').textContent=R.name.toUpperCase()+'!';
  const W=cfDrop+(1.0+Math.max(0,o.rarity-2)*0.35+(o.rarity>=5?0.5:0)),fr={cx:0,cy:0.72,h:2.9,dist:9,oy:1.7},cv=$('cfCan'),gx=cv.getContext('2d'),fx=$('cfFx'),fg=fx.getContext('2d');
  m.rotation.y=-0.5;box.style.setProperty('--rc',R.css);box.classList.remove('open','show');box.hidden=false;$('cfOk').hidden=true;$('cfSkip').hidden=false;
  $('cfCard').innerHTML=`<span class="thumb" style="--rc:${R.css};--rcg:${R.glow}">${itemPic(o,o.slot?GEAR[o.slot].icon:WTYPES[o.type].icon)}</span><span><small>${R.name}</small><b>${esc(o.name)}</b><em>Lo trovi nell'armadio</em></span>`;
  const inner=mesh(new THREE.PlaneGeometry(1.18,0.74),new THREE.MeshBasicMaterial({color:R.hex}),0,0.725,0,m,true);inner.rotation.x=-Math.PI/2;inner.visible=false;
  const st={t:0,rat:0,burst:false,ang:0,vel:0,show:false,bt:0,ch:0,conf:0};CF.st=st;CF.W=W;let last=performance.now(),land=false;
  const spark=(n,sp)=>{const w=fx.width/2,h=fx.height*0.56;for(let i=0;i<n;i++){const a=Math.random()*TAU,s=(0.3+Math.random())*sp;CF.sparks.push({x:w,y:h,vx:Math.cos(a)*s,vy:Math.sin(a)*s-sp*0.55,l:0.5+Math.random()*0.8,c:Math.random()<0.6?R.css:'#ffd27a',z:2+Math.random()*3});}};
  fx.width=Math.ceil(innerWidth/2);fx.height=Math.ceil(innerHeight/2);
  const boom=()=>{st.burst=true;st.bt=0;st.ang=-0.15;st.vel=-24;P_.lock.forEach(x=>x.visible=false);inner.visible=true;box.classList.add('open');const f=$('cfFlash');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');
    spark(70+o.rarity*40,fx.height*(0.9+o.rarity*0.12));sfx('chestBurst');sfx('chest');if(o.rarity>=3)sfx('chestEpic');padRumble(0.5+o.rarity*0.12);$('cfSkip').hidden=true;
    box.classList.remove('charge');if(tier>=1){box.classList.add('shake');CF.rings.push({t:0,d:0.8});}
    if(tier>=2){box.classList.add('ban');setTimeout(()=>{if(CF.m!==m)return;spark(90,fx.height*1.25);CF.rings.push({t:0,d:1.1});sfx('chestBurst');padRumble(0.8);},280);}
    if(tier>=3){st.conf=2.6;setTimeout(()=>{if(CF.m!==m)return;spark(160,fx.height*1.6);CF.rings.push({t:0,d:1.4},{t:-0.15,d:1.4});sfx('chestEpic');padRumble(1);const f=$('cfFlash');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');},640);}};
  CF.boom=()=>{if(!st.burst){st.t=Math.max(st.t,W);boom();}};
  const loop=n=>{if(!CF.m)return;CF.raf=requestAnimationFrame(loop);const dt=Math.min(0.05,(n-last)/1000);last=n;st.t+=dt;const t=st.t,sc=1;
    if(t<cfDrop){const u=t/cfDrop;m.position.y=3.2*(1-u*u);}else{if(!land){land=true;sfx('slam');spark(16,fx.height*0.35);padRumble(0.3);}m.position.y=0;}
    if(!st.burst){if(t>=cfDrop){const k=Math.min(1,(t-cfDrop)/(W-cfDrop)),q=k*k;m.position.x=Math.sin(t*63)*0.05*q;m.rotation.z=Math.sin(t*43)*0.09*q;m.scale.set(sc*(1+0.07*q),sc*(1-0.12*q),sc*(1+0.07*q));P_.lid.rotation.x=-0.16*q-Math.abs(Math.sin(t*31))*0.08*q;P_.gem.emissiveIntensity=0.5+q*4;$('cfGlow').style.opacity=0.12+q*0.5;
        if(tier>=2&&k>0.55&&!st.ch){st.ch=1;box.classList.add('charge');}
         st.rat-=dt;if(st.rat<=0){st.rat=lerp(0.18,0.06,k);sfx('chestRattle');spark(1+Math.round(q*5),fx.height*0.3);}}if(t>=W){m.position.x=0;m.rotation.z=0;m.scale.setScalar(sc);boom();}}
    else{st.bt+=dt;const T=st.bt,b=Math.exp(-T*7),s=Math.cos(T*18)*b;st.vel+=(-2.0-st.ang)*190*dt;st.vel*=Math.exp(-11*dt);st.ang+=st.vel*dt;P_.lid.rotation.x=st.ang;m.scale.set(sc*(1-0.1*s),sc*(1+0.18*s),sc*(1-0.1*s));m.position.x=0;m.rotation.z=0;$('cfGlow').style.opacity=Math.max(0.3,0.95*Math.exp(-T*1.8));
      if(T<0.7&&Math.random()<0.8)spark(1+o.rarity,fx.height*0.55);if(!st.show&&T>(tier>=2?1.3:0.32)){st.show=true;box.classList.add('show');$('cfOk').hidden=false;}}
    try{gx.putImageData(psShot(m,168,168,fr,false),0,0);}catch(e){}
    fg.clearRect(0,0,fx.width,fx.height);for(const p of CF.sparks){p.l-=dt;if(p.l<=0)continue;p.vy+=fx.height*1.6*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;fg.globalAlpha=Math.min(1,p.l*2);fg.fillStyle=p.c;fg.fillRect(p.x|0,p.y|0,p.z|0,p.z|0);}fg.globalAlpha=1;
     for(const g of CF.rings){g.t+=dt;if(g.t<0)continue;const u=g.t/g.d;if(u>=1)continue;fg.globalAlpha=(1-u)*0.9;fg.strokeStyle=u<0.25?'#fff':R.css;fg.lineWidth=Math.max(1,(1-u)*(6+tier*3));
       fg.beginPath();fg.arc(fx.width/2,fx.height*0.56,u*Math.max(fx.width,fx.height)*0.8,0,TAU);fg.stroke();}fg.globalAlpha=1;
     if(st.conf>0){st.conf-=dt;const cols=[R.css,'#ffd27a','#fff','#7ff0e4','#ff7ad9'];for(let i=0;i<4;i++)CF.sparks.push({x:Math.random()*fx.width,y:-6,vx:(Math.random()-0.5)*60,vy:Math.random()*40,l:1.8+Math.random(),c:cols[(Math.random()*cols.length)|0],z:2+Math.random()*3});}
     if(CF.sparks.length>400||st.bt>3)CF.sparks=CF.sparks.filter(p=>p.l>0);};
  CF.raf=requestAnimationFrame(loop);}
function cfClose(quiet){cancelAnimationFrame(CF.raf);if(CF.m){disposeObj(CF.m);CF.m=null;}const b=$('crateFx');if(b&&!b.hidden){b.hidden=true;b.classList.remove('shake','ban','charge');b.classList.remove('open','show');if(!quiet)sfx('ui');}}
$('cfSkip').onclick=()=>{if(CF.boom)CF.boom();};$('cfOk').onclick=()=>{cfClose();renderShop();};
const _pbCF=padBack;padBack=function(){if(!$('crateFx').hidden){if(!$('cfOk').hidden)$('cfOk').click();else $('cfSkip').click();return true;}return _pbCF();};

/* ---------- Venom: non è più in vendita, ma chi l'ha comprata la tiene per sempre ---------- */
// chi era stato rimborsato può riaverla restituendo gli 800 rubini; la carta compare solo a chi aveva visto l'offerta
var VENOM_K='astromante.2.venom',VENOM_P=800,VENOM_RED=0xff1a2e;
function venomCan(){return !ownsS(VENOM_K)&&store.get('venom-t0',0)>0;}
function recolorVenom(root){const done=new Map(),red=new THREE.Color(0xd80e20),glowE=new THREE.Color(0xff1626),eyeHex=0xc7a8ff,starHex=0xfff3c4,all=[];root.traverse(o=>{if(o.isMesh&&o.material&&!Array.isArray(o.material))all.push(o);});
  // occhi grandi e volto nero: spariscono le stelle sul viso
  const faces=new Set();for(const o of all)if(o.material.color&&o.material.color.getHex()===eyeHex&&o.material.emissive&&o.scale.x===1&&o.parent&&o.parent.children.some(c=>c.isMesh&&c.material.color&&c.material.color.getHex()===starHex))faces.add(o.parent);
  for(const o of all){const m=o.material;if(faces.has(o.parent)&&m.color&&m.color.getHex()===starHex)o.visible=false;if(faces.has(o.parent)&&m.color&&m.color.getHex()===eyeHex)o.scale.set(1.9,1.9,1);}
  for(const o of all){const m=o.material;if(!m||!m.color||(m.userData&&m.userData.keep))continue;let c=done.get(m);
    if(!c){c=m.clone();c.userData=Object.assign({},m.userData);const glow=m.blending===THREE.AdditiveBlending||(m.emissive&&m.emissive.getHex()!==0&&m.emissiveIntensity>=0.9);
      if(glow){c.color.copy(red);if(c.emissive){c.emissive.copy(glowE);c.emissiveIntensity=0.85;c.userData.baseE=glowE.clone();c.userData.baseI=0.85;}}
      else{c.color.setHex(m.isMeshBasicMaterial?0x05040a:0x0d0c12);if(c.emissive){c.emissive.setHex(0);c.userData.baseE=new THREE.Color(0);c.userData.baseI=1;}}done.set(m,c);}
    o.material=c;}}
// con Venom indossata anche la magia dell'astromante diventa rossa
{const ast=CLASSES.find(c=>c.id==='astromante'),base=ast.fx,_bhV=buildHero;buildHero=function(cls){if(cls===ast)ast.fx=varOf('astromante')==='venom'?VENOM_RED:base;return _bhV(cls);};}
/* ---------- PvP e co-op: i colpi normali (magie, frecce) si vedono anche dagli altri, senza fare danno da quel lato ---------- */
const _spNet=spawnProj;spawnProj=function(o){
  if(o&&MP.ghost&&o.owner!=='e'&&G.pvp&&MP.ghostR){o.foe=PV.teams[MP.ghostR.pid]!==PV.teams[MP.myPid];if(!o.foe)o.homing=0;}
  const r=_spNet(o);
  if(o&&o.owner==='p'&&!o.ghost&&!MP.ghost&&!G.inAbil&&MP.live()&&G.scene==='tower'){const c={kb:0};for(const k of ['kind','x','y','vx','vy','g','life','w','h','col','sz','homing','pierce']){const v=o[k];if(typeof v==='number')c[k]=Math.round(v*100)/100;else if(typeof v==='string'||typeof v==='boolean')c[k]=v;}if(o.col!=null)c.col=o.col;c.vx=c.vx||0;c.vy=c.vy||0;MP.send({t:'pj',pid:MP.myPid,f:G.floor,o:c});}
  return r;};
const _mpMsgPj=mpMsg;mpMsg=function(m,from){if(m.t!=='pj')return _mpMsgPj(m,from);const pid=MP.host?from:m.pid;if(MP.host){m.pid=pid;MP.bcast(m,pid);}
  if(pid===MP.myPid||G.scene!=='tower'||(!G.pvp&&m.f!==G.floor))return;const foe=!!G.pvp&&PV.teams[pid]!==PV.teams[MP.myPid];spawnProj(Object.assign({},m.o,{owner:'p',dmg:0,effect:null,ghost:true,foe,homing:foe?m.o.homing:0}));};

/* ---------- ogni guardiano che riusava il corpo di un altro ha mosse tutte sue ---------- */
const bkX=x=>clamp(x,-HALF+1.5,GATE_X-1.5);
const BK={real:null};
function bkCtx(fn){const r=MP.redir;if(!(r>=0))return fn;return ()=>{const R=MP.players.get(r);if(!R||R.dead||MP.redir>=0)return;const b=[P.x,P.y,P.vx,P.vy,P.dead,P.onGround];P.x=R.x;P.y=R.y;P.vx=R.vx;P.vy=R.vy;P.dead=false;P.onGround=R.onGround;MP.redir=r;BK.real=b;try{fn();}finally{MP.redir=-1;BK.real=null;[P.x,P.y,P.vx,P.vy,P.dead,P.onGround]=b;}};}
function bkAoe(fn){fn();if(!MP.host||!MP.live())return;const b=[P.x,P.y,P.vx,P.vy,P.dead,P.onGround],r0=MP.redir,real=BK.real;
  try{if(r0>=0&&real){[P.x,P.y,P.vx,P.vy,P.dead,P.onGround]=real;MP.redir=-1;fn();}
    for(const R of MP.players.values()){if(R.pid===r0||!mpTargetable(R))continue;P.x=R.x;P.y=R.y;P.vx=R.vx;P.vy=R.vy;P.dead=false;P.onGround=R.onGround;MP.redir=R.pid;fn();}
  }finally{MP.redir=r0;[P.x,P.y,P.vx,P.vy,P.dead,P.onGround]=b;}}
const bkLater=(t,fn)=>later(t,bkCtx(fn));
function bkSeq(e,n,gap,fn){const f=bkCtx(fn);for(let i=0;i<n;i++)later(i*gap,()=>{if(!e.dead&&G.boss===e)f(i);});}
function bkCol(e,x,w,mul,col,eff){burst(x,0.3,col,18,5,6,0.3);burst(x,2.6,col,8,4,3,0.2);sfx('zap');shake(0.15);bkAoe(()=>{if(!P.dead&&Math.abs(P.x-x)<w/2+P.w/2&&P.y<5)hurtPlayer(e.dmg*mul,x,eff===undefined?e.eff:eff);});}
function bkWarn(x,w,d,cb,col){addWarn(x,w,d,bkCtx(cb));if(col!=null)G.warns[G.warns.length-1].m.material.color.setHex(col);}
function bkP(e,kind,x,y,vx,vy,mul,o){eProj(e,Object.assign({x,y,vx,vy,w:0.55,h:0.55,dmg:e.dmg*mul,life:4,kind},o||{}));return G.projs[G.projs.length-1];}
const bkAim=(ox,oy)=>Math.atan2(P.y+1-oy,P.x-ox);
function bkShock(e,x,v,mul,o){return bkP(e,'shock',x,0,v,0,mul,Object.assign({w:0.6,h:1,life:1.6,tint:e.color},o||{}));}
function bkPool(e,x,w,dur,col,mul,eff){bkWarn(x,w,dur,()=>{},col);const n=Math.floor(dur/0.4);bkSeq(e,n,0.4,i=>{burst(x+rand(-w/2,w/2),0.2,col,3,2,3,0.2);bkAoe(()=>{if(!P.dead&&Math.abs(P.x-x)<w/2+P.w/2&&P.y<1.3)hurtPlayer(e.dmg*mul,x,eff===undefined?e.eff:eff);});});}
function bkJump(e,air,vy,tx,land){e.state=air;e.t=0;e.vy=vy;e.vx=clamp((tx-e.x)/1.0,-15,15);e.wasAir=false;e.act=()=>{if(!e.onGround)e.wasAir=true;if(e.wasAir&&e.onGround){e.vx=0;e.landT=0.25;land();return true;}return false;};}
function bkSwing(e,pose,range,mul,dur,back){e.state=pose;e.t=0;e.didHit=false;e.vx=back?0:e.face*7;sfx('heavy');e.act=()=>{if(!e.didHit&&e.t>0.04){const f=back?-e.face:e.face,x1=f>0?e.x:e.x-range,x2=f>0?e.x+range:e.x;if(overlap(x1,x2,e.y,e.y+3.4,P)){hurtPlayer(e.dmg*mul,e.x,e.eff);e.didHit=true;}}return e.t>dur;};}
function bkDash(e,pose,v,dur,mul,step){e.state=pose;e.t=0;e.didHit=false;sfx('dash');e.act=dt=>{e.vx=e.face*v;if(step)step(dt);if(!e.didHit&&overlap(e.x-e.w,e.x+e.w,e.y,e.y+e.h,P)){hurtPlayer(e.dmg*mul,e.x,e.eff);e.didHit=true;}return (e.hitWall&&e.hitWall===e.face)||e.t>dur;};}
function bkHold(e,pose,dur,fn){e.state=pose;e.t=0;e.act=dt=>{e.vx=e.fly?e.vx*0.9:approach(e.vx,0,30*dt);if(fn)fn(dt);return e.t>dur;};}
const BOSS_KITS={
 30:[{n:'Pagine taglienti',p:'volleyWind',w:.6,r:.8,f(e,d,sp,rg){bkSeq(e,rg?4:3,.22,i=>{const ox=e.x+e.face,oy=e.y+3,b=bkAim(ox,oy)+(i%2?.14:-.14);for(let k=-2;k<=2;k++){const a=b+k*.16;bkP(e,'knife',ox,oy,Math.cos(a)*11,Math.sin(a)*11,.45);}sfx('arrow');});}},
  {n:'Scaffale crollato',p:'slamWind',w:.55,r:1,f(e,d,sp,rg){shake(.3);sfx('slam');const n=rg?9:7;for(let i=0;i<n;i++){const x=bkX(e.x+d*(2+i*2.6));bkWarn(x,1.8,.55+i*.13,()=>bkP(e,'bone',x,CEIL,0,-26,.8,{w:1.1,h:1.1,life:1.2}),e.color);}}},
  {n:'Sigillo del silenzio',p:'volleyWind',w:.5,r:.9,f(e){for(const o of [0,-3.2,3.2]){const x=bkX(P.x+o);bkWarn(x,2,.85,()=>{fxRing(x,.06,0,e.color,2,.4);bkCol(e,x,2,.75,e.color,'slow');},e.color);}}}],
 40:[{n:'Pioggia acida',p:'spitWind',w:.5,r:.8,f(e,d,sp,rg){sfx('orb');const n=rg?12:9;for(let i=0;i<n;i++){const x=i?bkX(P.x+rand(-10,10)):P.x;bkWarn(x,1.3,.5+i*.1,()=>bkP(e,'glob',x,CEIL-1,0,-20,.6,{g:10,life:1.5}),0xa0e040);}}},
  {n:'Geyser tossici',p:'hopWind',w:.5,r:1,f(e){for(const o of [0,-5,5]){const x=bkX(P.x+o);bkWarn(x,1.7,.8,()=>{sfx('boom');for(let k=0;k<6;k++)bkP(e,'glob',x+rand(-.4,.4),.3,rand(-2.5,2.5),rand(14,20),.55,{g:22,life:2});bkCol(e,x,1.7,.5,0xa0e040);},0xa0e040);}}},
  {n:'Risucchio',p:'spitWind',w:.45,r:1.7,f(e){sfx('roar');e.pull={t:1.3,f:7};bkSeq(e,7,.18,()=>burst(e.x+rand(-5,5),rand(.3,3),0xa0e040,4,1,1,0));bkLater(1.3,()=>{if(e.dead)return;shake(.5);sfx('boom');fxRing(e.x,.1,0,0xa0e040,5,.5);if(!P.dead&&Math.abs(P.x-e.x)<4.6&&P.y<3)hurtPlayer(e.dmg*1.1,e.x,e.eff);for(const s of [-1,1])bkShock(e,e.x+s*1.5,s*10,.6);});}}],
 45:[{n:'Schiera di lance',p:'bonesWind',w:.55,r:.8,f(e,d){const x0=e.x;bkSeq(e,10,.14,i=>{const x=bkX(x0+d*(2+i*1.9));bkWarn(x,1.3,.38,()=>bkCol(e,x,1.3,.8,0xe8e0cc),0x9a7bff);});}},
  {n:'Raccolto d\'anime',p:'swipeWind',w:.85,r:1,f(e){sfx('heavy');shake(.4);fxRing(e.x,1.4,0,0x9a7bff,6.2,.35);burst(e.x,1.5,0x9a7bff,40,10,2,.2);if(!P.dead&&Math.abs(P.x-e.x)<6.2&&P.y<3.4)hurtPlayer(e.dmg*1.2,e.x,e.eff);}},
  {n:'Marcia funebre',p:'raiseWind',w:.45,r:.7,f(e){burst(e.x,1.5,0x9a7bff,24,6,3,.2);const s=P.face||1;e.x=bkX(P.x-s*2.4);e.face=s;burst(e.x,1.5,0x9a7bff,24,6,3,.2);sfx('dash');bkSwing(e,'swipe',4,1.1,.34);}}],
 50:[{n:'Mani dal suolo',p:'pillarsWind',w:.45,r:.9,f(e,d,sp,rg){bkSeq(e,rg?6:5,.3,()=>{const x=P.x;bkWarn(x,1.4,.55,()=>{bkCol(e,x,1.4,.9,0x6aff9a,'slow');for(let k=0;k<4;k++)burst(x+rand(-.4,.4),rand(.2,2),0x2a6a3a,3,2,4,.2);},0x6aff9a);});}},
  {n:'Anime in cerca',p:'orbsWind',w:.55,r:1.2,f(e){bkSeq(e,6,.2,i=>{const a=i/6*TAU;bkP(e,'bolt',e.x+Math.cos(a)*1.4,e.y+2+Math.sin(a)*1.4,Math.cos(a)*5,Math.sin(a)*5,.6,{col:0x6aff9a,homing:2.2,life:6});sfx('orb');});}},
  {n:'Risveglio',p:'ringWind',w:.9,r:.9,f(e){sfx('roar');shake(.3);const al=G.enemies.filter(x=>!x.dead&&x.summon).length;if(al<5)for(const o of [-3,0,3])spawnEnemy('guard',{x:bkX(e.x+o),summon:true});for(let i=0;i<12;i++){const a=i/12*TAU;bkP(e,'bolt',e.x,e.y+1.6,Math.cos(a)*5,Math.sin(a)*5,.5,{col:0x2aa05a});}}}],
 55:[{n:'Eruzione',p:'slamWind',w:.55,r:1.1,f(e){shake(.35);sfx('slam');for(let i=-5;i<=5;i++){const x=bkX(e.x+i*4.4);bkWarn(x,2.5,i%2?.8:1.8,()=>{bkCol(e,x,2.5,.95,0xff6a2a);for(let k=0;k<3;k++)bkP(e,'fire',x+rand(-.6,.6),.4,rand(-1,1),rand(10,15),.4,{g:20,life:1.4,sz:.7});},0xff6a2a);}}},
  {n:'Pugno magmatico',p:'slamWind',w:.5,r:1,f(e){bkJump(e,'slamAir',18,P.x,()=>{shake(.6);sfx('boom');burst(e.x,.2,0xff6a2a,30,8,3);bkPool(e,e.x,5,3.4,0xff5a1e,.35,'burn');for(const s of [-1,1])bkShock(e,e.x+s*1.2,s*11,.7);});}},
  {n:'Palle di lava',p:'volleyWind',w:.6,r:1,f(e,d,sp,rg){sfx('roar');const ox=e.x+e.face,oy=e.y+3,n=rg?8:6;for(let i=0;i<n;i++){const tt=.75+i*.14,tx=P.x+rand(-6,6);bkP(e,'fire',ox,oy,(tx-ox)/tt,(.3-oy)/tt+9*tt,.6,{g:18,life:tt,sz:1.1});bkLater(tt,()=>{if(e.dead)return;burst(tx,.3,0xff7a2e,14,5,3);for(const s of [-1,1])bkShock(e,tx,s*7,.4,{life:.7,h:.8});});}}}],
 60:[{n:'Martello e incudine',p:'comboWind',w:.45,r:.8,f(e){bkSwing(e,'combo',4.2,1,.3);bkShock(e,e.x+e.face*1.2,e.face*12,.7);burst(e.x+e.face*2,.4,0xff8a3d,16,6,3);const f=e.face;bkLater(.42,()=>{if(e.dead)return;e.face=-f;e.didHit=false;sfx('heavy');const x1=-f>0?e.x:e.x-4.2,x2=-f>0?e.x+4.2:e.x;if(overlap(x1,x2,e.y,e.y+3.4,P))hurtPlayer(e.dmg,e.x,e.eff);bkShock(e,e.x-f*1.2,-f*12,.7);});e.rec=.5;}},
  {n:'Scia di scintille',p:'dashWind',w:.55,r:.8,f(e){let c=0;bkDash(e,'dash',21,.6,1.1,dt=>{c-=dt;if(c<=0){c=.09;bkPool(e,e.x,1.4,1.3,0xff8a3d,.3,'burn');}});}},
  {n:'Lame roventi',p:'comboWind',w:.5,r:1.1,f(e,d){const ox=e.x+e.face,oy=e.y+1.6,n=3;sfx('swing');for(let i=0;i<n;i++){const a=(i-1)*.22,vx=Math.cos(a)*d*14,vy=Math.sin(a)*14;bkP(e,'spear',ox,oy,vx,vy,.7,{life:.75,w:1.2,h:.4});bkLater(.78,()=>{if(e.dead)return;const rx=ox+vx*.75,ry=oy+vy*.75,b=Math.atan2(oy-ry,e.x-rx);bkP(e,'spear',rx,ry,Math.cos(b)*16,Math.sin(b)*16,.7,{life:1,w:1.2,h:.4});});}}}],
 65:[{n:'Stalattiti',p:'sonicWind',w:.5,r:.9,f(e,d,sp,rg){sfx('orb');const n=rg?10:8;for(let i=0;i<n;i++){const x=bkX(P.x+(i-(n-1)/2)*2.4+rand(-.4,.4));bkWarn(x,1.2,.6+Math.abs(i-(n-1)/2)*.12,()=>bkP(e,'spear',x,CEIL,0,-28,.8,{w:.5,h:1.4,life:1.2}),0xaee4ff);}}},
  {n:'Soffio gelido',p:'swarmWind',w:.5,r:.9,f(e){const s=Math.random()<.5?1:-1;bkHold(e,'swarmWind',1.2);bkSeq(e,15,.08,i=>{const a=bkAim(e.x,e.y)+s*(i/14-.5)*1.5;bkP(e,'bolt',e.x,e.y+.5,Math.cos(a)*12,Math.sin(a)*12,.4,{col:0xaee4ff,life:2.5,sz:.8});if(i%3==0)sfx('zap');});}},
  {n:'Tempesta di piume',p:'diveWind',w:.55,r:1,f(e){bkSeq(e,3,.32,k=>{for(let i=0;i<12;i++){const a=(i+k*.5)/12*TAU;bkP(e,'knife',e.x,e.y+.5,Math.cos(a)*8,Math.sin(a)*8,.5,{life:3.2});}sfx('arrow');});}}],
 70:[{n:'Prigione di gelo',p:'chargeWind',w:.5,r:1,f(e){sfx('roar');bkSeq(e,2,.75,()=>{const px=P.x;for(const s of [-1,1]){bkWarn(bkX(px+s*9),1,.3,()=>{},0x9ad0ff);bkShock(e,bkX(px+s*9),-s*13,.8,{life:1.1,h:1.2});}});}},
  {n:'Valanga',p:'slamWind',w:.75,r:1.1,f(e,d){shake(.5);sfx('boom');bkShock(e,e.x+d*1.4,d*15,1.15,{life:3,h:2.6,w:1.4,scl:2.4});}},
  {n:'Zampata glaciale',p:'volleyWind',w:.55,r:.9,f(e){shake(.45);sfx('slam');burst(e.x,.2,0x9ad0ff,26,8,3);bkSeq(e,3,.26,i=>{for(const s of [-1,1])bkShock(e,e.x+s*1.2,s*(7+i*4),.65);});}}],
 75:[{n:'Costellazione',p:'pillarsWind',w:.5,r:1,f(e,d,sp,rg){const n=rg?7:5,pts=[];for(let i=0;i<n;i++)pts.push(i?bkX(P.x+rand(-9,9)):P.x);sfx('zap');pts.forEach((x,i)=>bkWarn(x,1.3,.9+i*.26,()=>{lightning(x,CEIL,x,0);if(i)lightning(pts[i-1],3.2,x,3.2);bkCol(e,x,1.3,.9,0x9fb6ff);},0x9fb6ff));}},
  {n:'Orbita spezzata',p:'ringWind',w:.5,r:1,f(e){const b=Math.random()*TAU;bkSeq(e,36,.05,i=>{const a=b+i*.55;bkP(e,'bolt',e.x,e.y+1.6,Math.cos(a)*5.5,Math.sin(a)*5.5,.45,{col:0x9fb6ff,life:4.5,sz:.8});if(i%6==0)sfx('orb');});}},
  {n:'Eclisse',p:'orbsWind',w:.7,r:1.3,f(e){sfx('roar');const x=e.x;e.pull={t:2,f:6,x};fxRing(x,1,0,0x3a2a6a,4,2,true,0);bkSeq(e,8,.25,()=>{const a=Math.random()*TAU;bkP(e,'bolt',x+Math.cos(a)*9,3+Math.sin(a)*3,-Math.cos(a)*7,-Math.sin(a)*2,.45,{col:0x3a2a8a,life:1.3});});bkLater(2,()=>{if(e.dead)return;shake(.6);sfx('boom');fxRing(x,1,0,0x9fb6ff,4,.5);if(!P.dead&&Math.abs(P.x-x)<3.4)hurtPlayer(e.dmg*1.2,x,e.eff);});}}],
 80:[{n:'Balzo nel vuoto',p:'hopWind',w:.5,r:.9,f(e){burst(e.x,1.2,0x7a5aff,30,7,3,.2);sfx('dash');e.parts.root.visible=false;e.vanish=true;bkHold(e,'hopWind',.85);const tx=P.x;bkWarn(tx,3.4,.75,()=>{if(e.dead)return;e.parts.root.visible=true;e.vanish=false;e.x=tx;e.y=8;e.vy=-10;e.vx=0;bkJump(e,'hop',-14,tx,()=>{shake(.55);sfx('slam');burst(e.x,.2,0x7a5aff,24,7,3);if(!P.dead&&Math.abs(P.x-e.x)<1.8+P.w/2&&P.y<2)hurtPlayer(e.dmg*1.1,e.x,e.eff);for(const s of [-1,1])bkShock(e,e.x+s*1.5,s*10,.65);});},0x7a5aff);}},
  {n:'Frammenti del vuoto',p:'spitWind',w:.55,r:.9,f(e){sfx('orb');const ox=e.x+e.face*1.2,oy=e.y+2;for(let i=0;i<3;i++){const tt=.75+i*.2,tx=P.x+(i-1)*3;bkP(e,'glob',ox,oy,(tx-ox)/tt,(.3-oy)/tt+10*tt,.55,{g:20,life:tt});bkLater(tt,()=>{if(e.dead)return;for(let k=0;k<5;k++){const a=Math.PI*(k+.5)/5;bkP(e,'bolt',tx,.5,Math.cos(a)*8,Math.sin(a)*8,.4,{col:0x7a5aff,life:1.2,sz:.7});}});}}},
  {n:'Pozze del vuoto',p:'hopWind',w:.45,r:.9,f(e){sfx('ability');for(let i=0;i<4;i++){const x=i?bkX(P.x+rand(-9,9)):P.x;bkPool(e,x,3,4,0x7a5aff,.35,null);}}}],
 85:[{n:'Sette colpi',p:'comboWind',w:.4,r:.9,f(e,d,sp){let n=0;e.state='combo';e.t=0;e.didHit=false;e.vx=e.face*9;sfx('swing');e.act=()=>{if(!e.didHit&&e.t>.03){const x1=e.face>0?e.x:e.x-3.4,x2=e.face>0?e.x+3.4:e.x;if(overlap(x1,x2,e.y,e.y+3,P)){hurtPlayer(e.dmg*.6,e.x,e.eff);e.didHit=true;}}if(e.t>.16/sp){n++;if(n>=7)return true;e.face=P.x>=e.x?1:-1;e.n=n;e.t=0;e.didHit=false;e.vx=e.face*9;sfx('swing');}return false;};}},
  {n:'Stendardi del Re',p:'leapWind',w:.5,r:1,f(e){for(const o of [-7,0,7]){const x=bkX(P.x+o);bkWarn(x,1.2,2.4,()=>{},0xffd27a);bkSeq(e,3,.75,()=>{fxRing(x,.1,0,0xffd27a,1.5,.3);for(const s of [-1,1])bkShock(e,x,s*9,.5,{life:.9,h:.9});sfx('zap');});}}},
  {n:'Carica reale',p:'dashWind',w:.55,r:.9,f(e){let leg=0;const go=()=>{e.didHit=false;e.face=P.x>=e.x?1:-1;e.t=0;sfx('dash');};go();e.state='dash';e.act=()=>{e.vx=e.face*24;if(!e.didHit&&overlap(e.x-e.w,e.x+e.w,e.y,e.y+e.h,P)){hurtPlayer(e.dmg*.9,e.x,e.eff);e.didHit=true;}if((e.hitWall&&e.hitWall===e.face)||e.t>.55){leg++;if(leg>=3)return true;go();}return false;};}}],
 90:[{n:'Molti volti',p:'raiseWind',w:.45,r:.8,f(e){bkHold(e,'swipeWind',2.4);bkSeq(e,3,.78,i=>{burst(e.x,1.5,0xffe6a0,20,6,3,.2);const s=i%2?1:-1;e.x=bkX(P.x+s*2.6);e.face=-s;burst(e.x,1.5,0xffe6a0,20,6,3,.2);sfx('dash');const x=e.x+e.face*2;bkWarn(x,4,.34,()=>{if(e.dead)return;e.didHit=false;sfx('heavy');if(!P.dead&&Math.abs(P.x-x)<2.2&&P.y<3.4)hurtPlayer(e.dmg,e.x,e.eff);burst(x,1.2,0xffe6a0,14,6,2);},0xffe6a0);});}},
  {n:'Sentenza',p:'raiseWind',w:.7,r:1.1,f(e){const s=P.x>=e.x?1:-1;let x=s>0?-HALF+1.5:GATE_X-1.5,hit=false,c=0;bkHold(e,'raiseWind',(GATE_X+HALF-3)/15,dt=>{x+=s*15*dt;c-=dt;if(c<=0){c=.08;lightning(x,CEIL,x,0);burst(x,.4,0xffe6a0,4,3,4,.2);}if(!hit&&!P.dead&&Math.abs(P.x-x)<.9+P.w/2&&P.y<3.6){hit=true;hurtPlayer(e.dmg*1.3,x,e.eff);}});sfx('roar');}},
  {n:'Mani della corte',p:'bonesWind',w:.55,r:.9,f(e){bkSeq(e,3,.5,k=>{for(let i=-2;i<=2;i++){const x=bkX(P.x+i*3+(k%2)*1.5);bkWarn(x,1.1,.5,()=>bkP(e,'bone',x,CEIL,0,-28,.75,{w:1,h:1,life:1.1}),0xffe6a0);}sfx('bones');});}}],
 95:[{n:'Terremoto',p:'slamWind',w:.5,r:1,f(e){bkSeq(e,3,.6,i=>{shake(.5+i*.2);sfx('slam');burst(e.x,.2,0xb9ad98,26,8,2);e.landT=.25;for(const s of [-1,1])bkShock(e,e.x+s*1.2,s*(9+i*3),.65+i*.1);if(!P.dead&&P.onGround&&Math.abs(P.x-e.x)<3.4)hurtPlayer(e.dmg*.8,e.x,e.eff);});}},
  {n:'Frana',p:'chargeWind',w:.6,r:1.1,f(e,d,sp,rg){sfx('roar');const gap=P.x,n=rg?16:13;for(let i=0;i<n;i++){const x=bkX(-HALF+2+i/(n-1)*(GATE_X+HALF-4));if(Math.abs(x-gap)<1.8)continue;bkWarn(x,2,.7+i*.1,()=>bkP(e,'meteor',x,CEIL,0,-30,1,{w:1.2,h:1.2,life:2}));}}},
  {n:'Vento della vetta',p:'volleyWind',w:.5,r:1,f(e,d){sfx('roar');e.pull={t:1.6,f:-10};bkSeq(e,8,.2,()=>{const y=rand(.6,3.6);bkP(e,'sonic',e.x+d*2,y,d*13,0,.5,{w:1,h:1,life:2.4});burst(e.x+d*3,y,0xc9e6ff,4,4,1,0);});}}],
};
function bkLoco(e,dt,dir,dist,rage){switch(BOSS_LOCO[e.arch]||e.arch){
  case 'golem':e.face=dir;e.vx=approach(e.vx,dir*e.speed*0.55,18*dt);break;
  case 'skelKing':e.face=dir;e.vx=approach(e.vx,dist>3?dir*e.speed*0.7:0,18*dt);break;
  case 'bknight':e.face=dir;e.vx=approach(e.vx,dist>2.8?dir*e.speed*0.8:0,18*dt);break;
  case 'slimeKing':e.face=dir;if(e.onGround)e.vx=approach(e.vx,0,20*dt);break;
  case 'archmage':if(e.homeX==null)e.homeX=e.x;e.vx=approach(e.vx,(e.homeX+Math.sin(G.time*0.6)*3-e.x)*1.5,8*dt);e.vy=(4.5+Math.sin(e.t*1.3)*0.8-e.y)*2;e.face=dir;break;
  case 'batQueen':{const tx=P.x+Math.sin(e.t*0.8+(e.seed||0))*6,ty=P.y+5.5+Math.sin(e.t*2)*0.6;e.vx=approach(e.vx,(tx-e.x)*1.4,12*dt);e.vy=approach(e.vy,(ty-e.y)*1.6,12*dt);e.face=dir;break;}}}
const _hitVan=hitEnemy;hitEnemy=function(e,b,d,o){if(e&&e.vanish)return false;return _hitVan(e,b,d,o);};
function bKit(e,dt,dir,dist,rage,sp){const K=BOSS_KITS[e.def.floor],fl=e.arch==='archmage'||e.arch==='batQueen'||(ARCH[e.arch]&&ARCH[e.arch].fly&&e.arch!=='dragon'),restS=e.arch==='golem'?'recover':'rest';e.fly=e.fly||fl;
  if(e.arch==='slimeKing'){e.split=e.split||0;if(e.split<2&&e.hp<e.maxHp*(e.split===0?0.66:0.33)){e.split++;for(const s of [-1,1])spawnEnemy('slime',{x:bkX(e.x+s*2.2),summon:true});burst(e.x,1.5,e.color,24,7,4);sfx('die');popNum(e.x,e.y+e.h+0.5,'Si divide!','info');}}
  if(e.pull){e.pull.t-=dt;if(e.pull.t<=0)e.pull=null;else if(!P.dead){const tx=e.pull.x!=null?e.pull.x:e.x,s=Math.sign(tx-P.x)||1;P.x=clamp(P.x+s*e.pull.f*dt,-HALF+1,GATE_X-0.7);if(Math.random()<0.4)burst(P.x+rand(-.5,.5),P.y+rand(.2,2),e.color,1,1,0.5,0);}}
  if(e.state==='move'){bkLoco(e,dt,dir,dist,rage);if(e.t>(rage?0.7:1.25)){const o=K.filter(m=>m!==e.mv),mv=pick(o);e.mv=mv;e.state=mv.p;e.t=0;e.face=dir;popNum(e.x,e.y+e.h+0.7,mv.n,'info');}}
  else if(e.act){if(e.act(dt,dir)){e.act=null;e.state=restS;e.t=0;e.warn=0;e.rec=((e.mv&&e.mv.r)||0.8)/sp;}}
  else if(e.state===restS){if(fl){e.vx*=0.93;e.vy=approach(e.vy,(((BOSS_LOCO[e.arch]||e.arch)==='batQueen'?P.y+5:4.8)-e.y)*1.5,14*dt);}else e.vx=approach(e.vx,0,14*dt);if(e.t>e.rec){e.state='move';e.t=0;}}
  else if(e.mv){const w=e.mv.w/sp;if(fl){e.vx*=0.9;e.vy*=0.9;}else e.vx=approach(e.vx,0,30*dt);e.face=dir;e.warn=e.t/w;
    if(e.t>=w){e.warn=0;e.t=0;e.castT=0.3;e.state=restS;e.rec=e.mv.r/sp;e.mv.f(e,dir,sp,rage);}}
  else{e.state='move';e.t=0;}
  if(fl){e.x+=e.vx*dt;e.y+=e.vy*dt;e.x=bkX(e.x);e.y=clamp(e.y,0.4,CEIL-e.h-0.2);}
  contact(e,0.5);return fl;}

/* ---------- nomi sopra i giocatori: fermi e leggibili ---------- */
function mpPlaceTags(){for(const R of [...MP.players.values(),...HUB.players.values()]){const el=R.tag;if(!el||el.hidden)continue;
  if(!R.tagW){R.tagW=el.offsetWidth;R.tagH=el.offsetHeight;}
  const [sx,sy]=toScreen(R.x,R.y+3.25,R.z||0),x=Math.round(sx-R.tagW/2),y=Math.round(sy-R.tagH);
  if(x!==R.tagX||y!==R.tagY){R.tagX=x;R.tagY=y;el.style.transform=`translate3d(${x}px,${y}px,0)`;}}}
const _ucTag=updCamera;updCamera=function(dt){_ucTag(dt);if(MP.players.size||HUB.players.size){camera.updateMatrixWorld();mpPlaceTags();}};

/* ---------- finestra di scelta (pietra della rinascita, sigillo del santuario) ---------- */
const ASK={on:false,iv:0,left:0,yes:null,no:null};
function askClose(){clearInterval(ASK.iv);ASK.on=false;$('askBox').hidden=true;}
function askAnswer(y){if(!ASK.on)return;const f=y?ASK.yes:ASK.no;askClose();sfx('ui');if(f)f();}
function askOpen(o){ASK.on=true;ASK.yes=o.onYes;ASK.no=o.onNo;ASK.left=o.time||0;$('askIc').className=o.icon||'';$('askIc').parentNode.hidden=!o.icon;$('askEy').textContent=o.ey;$('askT').textContent=o.t;$('askD').textContent=o.d;$('askYes').textContent=o.yes;$('askNo').textContent=o.no;
  const tm=$('askTm');tm.hidden=!ASK.left;tm.textContent=ASK.left+' s';clearInput();['prompt','bUse','touch'].forEach(id=>$(id).hidden=true);$('askBox').hidden=false;sfx('ui');$('askYes').focus();
  clearInterval(ASK.iv);ASK.iv=setInterval(()=>{if(G.state!=='ask'){askClose();return;}if(ASK.left>0){ASK.left--;tm.textContent=ASK.left+' s';if(ASK.left<=0)askAnswer(false);}},1000);}
$('askYes').onclick=()=>askAnswer(true);$('askNo').onclick=()=>askAnswer(false);
addEventListener('keydown',e=>{if(e.key==='Escape'&&ASK.on){e.preventDefault();e.stopPropagation();askAnswer(false);}},true);
const _padBackA=padBack;padBack=function(){if(ASK.on){askAnswer(false);return true;}return _padBackA();};
function askRevive(die){P.hp=0;P.atk=null;P.vx=0;G.state='ask';showMeds(false);
  const back=()=>{G.state='play';$('touch').hidden=!isTouch;showMeds(true);clearInput();canvas.focus();};
  askOpen({icon:'sh-stone',ey:'Pietra della rinascita',t:'Stai per cadere',d:`Vuoi usare una pietra e rinascere sul posto con metà vita? Ne hai ${STONES.n}.`,yes:'Rinasci',no:'Lascia perdere',time:MP.live()?8:0,
    onYes(){back();STONES.n--;saveStones();G.runRevived=true;startRebirth();},onNo(){back();die();}});}
/* ---------- sigillo del santuario: raro dai guardiani, fa partire dal primo santuario ---------- */
var WARP=Object.assign({n:0},store.get('warp',{})),WARP_F=13;const WARP_DROP=0.03,saveWarp=()=>store.set('warp',WARP);
G.warpTo=0;G.warpOk=false;
const _srW=startRun;startRun=function(){
  if(WARP.n>0&&!G.warpOk&&!RESUMING&&!G.hordeNext&&!G.pvp&&(!MP.live()||MP.host)&&!MP.netStart){
    const go=y=>{if(y){WARP.n--;saveWarp();G.warpTo=WARP_F;}else G.warpTo=0;G.warpOk=true;G.state='menu';fadeThen(()=>{try{startRun();}finally{G.warpOk=false;}G.fadeTarget=0;});};
    G.state='ask';askOpen({icon:'sh-seal',ey:'Sigillo del Santuario',t:`Partire dal piano ${WARP_F}?`,d:`Il sigillo ti porta subito al primo santuario, dove scegli un potenziamento su tre. Si consuma. Ne hai ${WARP.n}.`,yes:`Vai al piano ${WARP_F}`,no:'Parti dal piano 1',onYes(){go(true);},onNo(){go(false);}});return;}
  return _srW.apply(this,arguments);};
const _upW=update;update=function(dt){_upW(dt);if(G.warpPick>0&&G.state==='play'&&!P.dead){G.warpPick-=dt;if(G.warpPick<=0){G.warpPick=0;openUpgrade();$('upEyebrow').textContent='Sigillo del Santuario';$('upNext').textContent='Scegli un potenziamento: vale fino alla fine della scalata.';}}};
const _keW=killEnemy;killEnemy=function(e){const was=e&&e.dead,r=_keW.apply(this,arguments);
  if(e&&!was&&e.dead&&e.type==='boss'&&G.scene==='tower'&&!G.horde&&!G.pvp&&!G.tutorial&&G.floor>=15&&Math.random()<WARP_DROP){WARP.n++;saveWarp();popNum(e.x,e.y+e.h+1.6,'Sigillo del Santuario!','crit');sfx('lvl');setTimeout(()=>toast('Sigillo del Santuario','A inizio scalata puoi partire dal piano '+WARP_F),1400);}
  return r;};
/* ---------- negozio: un frammento alla volta, a caro prezzo ---------- */
function heroThumb(c){const key='h.'+c.id;if(THUMB[key]!=null)return THUMB[key];try{const R=buildSkin(c,SKINPICK[c.id]||0);poseShop(R,c);R.root.rotation.y=R.root.userData.ry||0.5;const fr=psFrame(R.root,1.12,0.75);fr.cy-=0.06;const u=psURL(psShot(R.root,72,96,fr,true));disposeObj(R.root);return THUMB[key]=u;}catch(e){return THUMB[key]='';}}
function fragShop(buyBtn){const list=CLASSES.filter(c=>!isUnlocked(c)&&UNLOCK[c.id]&&c.tier<3).sort((a,b)=>a.tier-b.tier);if(!list.length)return '';
  return `<div class="sh-h"><b>Frammenti degli eroi</b><span>10 per sbloccare un eroe, 20 per gli epici</span></div>`+list.map(c=>{const need=fragNeed(c),n=Math.min(need,UNL.frag[c.id]||0),im=heroThumb(c),col='#'+(c.fx||0x7fd0ff).toString(16).padStart(6,'0');
    return `<article class="sh-card" style="--vc:${col}"><div class="sh-stage">${im?`<img src="${im}" alt="">`:''}<span class="sh-cnt">${n}/${need}</span><span class="sh-fr"><i style="width:${n/need*100}%"></i></span></div><div class="sh-info"><b>${esc(c.name)}</b><span>Un frammento</span></div>${n>=need?'<button class="sh-buy off" disabled>Completo</button>':buyBtn('o:frag:'+c.id,priceOf('o:frag:'+c.id))}</article>`;}).join('');}

/* ---------- potenziamenti con effetti propri ---------- */
const UPX={m:[]};
function upReset(){Object.assign(UPX,{busy:false,eco:0,ecoT:0,chT:0,thT:0,blT:0,rush:0,rushT:0,ward:0,wardN:0,gritF:-1,qkT:0,airT:0,dartT:1,orbA:0});}upReset();
function upxBoom(x,y,r,dmg,col){UPX.busy=true;try{boomAt(x,y,r,dmg,null,col);}finally{UPX.busy=false;}}
function upxProc(x,y,e,b){const L=G.lv;
  if(L.eco&&G.time>UPX.ecoT){UPX.ecoT=G.time+0.16;if(++UPX.eco>=(L.eco>1?3:4)){UPX.eco=0;pProj({x:P.x+P.face,y:P.y+1.1,vx:P.face*17,vy:0,kind:'wave',sz:1,w:1,h:1.5,dmg:weaponDamage()*0.7,life:0.7,pierce:true,kb:5,upx:true,effect:null});sfx('swing');}}
  if(L.chain&&G.time>UPX.chT&&Math.random()<(L.chain>1?0.32:0.2)){let n=null,bd=7;for(const q of foes()){if(q===e||q.pvp!=null)continue;const d=Math.hypot(q.x-x,q.y-y);if(d<bd){bd=d;n=q;}}
    if(n){UPX.chT=G.time+0.22;lightning(x,y+1,n.x,n.y+n.h/2);burst(n.x,n.y+1,0xbfe6ff,8,4,1);sfx('zap');UPX.busy=true;try{hitEnemy(n,b*(L.chain>1?0.8:0.55),n.x>=x?1:-1,{kb:2,noCombo:true,unblockable:true});}finally{UPX.busy=false;}}}}
function upxKill(e){const L=G.lv,full=!e.summon;
  if(L.rush&&full){UPX.rush=Math.min(8,UPX.rush+1);UPX.rushT=5;if(UPX.rush===8)popNum(P.x,P.y+2.8,'Slancio massimo!','crit');}
  if(L.drain&&full)heal(Math.max(1,Math.round(S.maxHp*(L.drain>1?0.04:0.025))),true);
  if(L.tempo&&full)for(const k of ['abilCd','abil2Cd','abil3Cd'])P[k]=Math.max(0,(P[k]||0)-(L.tempo>1?0.7:0.4));
  if(L.ward&&full&&!UPX.ward&&++UPX.wardN>=(L.ward>1?8:12)){UPX.wardN=0;UPX.ward=1;popNum(P.x,P.y+2.8,"Scudo d'anima pronto",'info');fxRing(P.x,1.1,0,0x9fd0ff,2.2,0.4);sfx('pick');}
  if(L.blast&&e.type!=='boss'&&G.time>UPX.blT&&Math.random()<(L.blast>1?0.4:0.25)){UPX.blT=G.time+0.25;upxBoom(e.x,e.y+e.h/2,2.6,weaponDamage()*(L.blast>1?1.1:0.7),0xff7a2e);}}
function upxTick(dt){const L=G.lv,fight=G.scene==='tower'&&!G.safe&&!G.pvp&&G.state==='play'&&!P.dead,n=fight?(L.orb||0):0;
  while(UPX.m.length<n){const m=new THREE.Mesh(orbGeo,orbMatP);m.scale.setScalar(0.55);m.add(new THREE.Mesh(haloGeo,haloMatP));scene.add(m);UPX.m.push(m);}
  UPX.m.forEach((m,i)=>{m.visible=i<n;});if(!fight)return;
  UPX.thT-=dt;if(UPX.rush>0&&(UPX.rushT-=dt)<=0)UPX.rush=0;
  if(L.dashcut&&P.dashT>0)for(const e of foes()){if(e.pvp!=null||e._dn===P.dashN)continue;if(Math.abs(e.x-P.x)<e.w/2+1.2&&e.y<P.y+2.4&&e.y+e.h>P.y-0.3){e._dn=P.dashN;hitEnemy(e,weaponDamage()*(L.dashcut>1?1.4:0.8),P.face,{kb:8,upx:true,unblockable:true});}}
  if(L.quake){if(!P.onGround)UPX.airT+=dt;else{if(UPX.airT>0.45&&G.time>UPX.qkT){UPX.qkT=G.time+1.1;sfx('slam');burst(P.x,P.y+0.1,0xb9ad98,14,5,1);for(const s of [-1,1])pProj({x:P.x+s*0.8,y:P.y,vx:s*12,vy:0,w:0.6,h:1,dmg:weaponDamage()*(L.quake>1?0.75:0.5),life:0.7,kind:'shock',upx:true,kb:5});}UPX.airT=0;}}
  if(n){UPX.orbA+=dt*3.4;for(let i=0;i<n;i++){const a=UPX.orbA+i*TAU/n,x=P.x+Math.cos(a)*2.2,y=P.y+1.2+Math.sin(a)*1.7;UPX.m[i].position.set(x,y,0);
    for(const e of foes()){if(e.pvp!=null||G.time<(e._ot||0))continue;if(Math.abs(x-e.x)<e.w/2+0.35&&y>e.y-0.2&&y<e.y+e.h+0.2){e._ot=G.time+0.45;burst(x,y,0x9ff5ec,6,3,1);hitEnemy(e,weaponDamage()*(L.orb>1?0.45:0.35),x<e.x?1:-1,{kb:3,upx:true,noCombo:true});}}}}
  if(L.dart&&(UPX.dartT-=dt)<=0){let t=null,bd=14;for(const e of foes()){if(e.pvp!=null)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;t=e;}}
    if(t){UPX.dartT=L.dart>1?1.5:2.4;const a=Math.atan2(t.y+t.h/2-P.y-2,t.x-P.x);pProj({x:P.x,y:P.y+2,vx:Math.cos(a)*15,vy:Math.sin(a)*15,kind:'bolt',col:0x9ff5ec,sz:0.7,dmg:weaponDamage()*(L.dart>1?0.7:0.45),homing:8,life:1.6,upx:true,kb:2,effect:null});sfx('orb');}else UPX.dartT=0.3;}}
const _hitUX=hitEnemy;hitEnemy=function(e,base,dir,o){o=o||{};if(G.pvp||MP.ghost||!(base>0)||!e||e.dead||e.spawnT>0||e.pvp!=null||G.scene!=='tower')return _hitUX(e,base,dir,o);
  const L=G.lv;let b=base;if(L.exec&&e.hp<e.maxHp*0.3)b*=1+(e.type==='boss'?0.25:0.5)*L.exec;if(UPX.rush>0)b*=1+UPX.rush*(L.rush>1?0.06:0.04);
  if(!UPX.busy)e._mine=G.time;const x=e.x,y=e.y,r=_hitUX(e,b,dir,o);if(r&&!UPX.busy&&!o.upx)upxProc(x,y,e,b);return r;};
const _keUX=killEnemy;killEnemy=function(e){const was=e&&e.dead,r=_keUX.apply(this,arguments);if(e&&!was&&e.dead&&e._mine!=null&&G.time-e._mine<0.7&&e.pvp==null&&G.scene==='tower'&&!G.pvp)upxKill(e);return r;};
const _hurtUX=hurtPlayer;hurtPlayer=function(d,fx,eff){const me=!(MP.redir>=0)&&!MP.ghost&&G.state==='play'&&!P.dead&&G.scene==='tower'&&!G.pvp;
  if(me&&UPX.ward>0&&P.invul<=0&&P.dashT<=0&&P.shieldT<=0&&!P.dragon){UPX.ward=0;P.invul=0.9;popNum(P.x,P.y+2.4,'Annullato','info');fxRing(P.x,1.1,0,0x9fd0ff,2.6,0.35);sfx('block');return;}
  const h0=P.hp,r=_hurtUX(d,fx,eff);if(me&&G.lv.thorns&&P.hp<h0&&!P.dead&&UPX.thT<=0){UPX.thT=G.lv.thorns>1?2:3;upxBoom(P.x,P.y+1,G.lv.thorns>1?4.2:3.6,weaponDamage()*(G.lv.thorns>1?1.4:0.9),0xff8a4a);}return r;};
const _pdUX=playerDie;playerDie=function(){if(G.lv.grit&&UPX.gritF!==G.floor&&G.scene==='tower'&&!G.pvp&&!G.tutorial&&!P.dead&&!P.rebirth&&G.state==='play'){UPX.gritF=G.floor;P.hp=1;P.dot=null;P.invul=2;popNum(P.x,P.y+2.6,'Ultimo respiro!','crit');burst(P.x,P.y+1,0xffe2a0,30,6,3);sfx('ability');return;}return _pdUX.apply(this,arguments);};
const _upUX=update;update=function(dt){_upUX(dt);upxTick(dt);};

/* ---------- Avvio ---------- */
resetStats();G.weapon=makeWeapon(G.cls.weapon,0,1);setHero(G.cls);
buildLevel(1);showScene('cellar');G.solids=[];
renderClassChip();
if(STATS.best)$('opRecord').textContent='Record: piano '+STATS.best;
if(document.fonts&&document.fonts.load)document.fonts.load('170px Bungee').then(()=>{drawFloorNumber(G.floor);ctrLast=null;}).catch(()=>{});
G.fade=1;G.fadeTarget=0;
if(/debug/.test(location.search+location.hash))window.__T={startBossIntro,finishBossIntro,showTip,gameOver,collectAllItems,dropItem,towerMood,MUS,INV,openWardrobe,applyLoadout,input,MOVES,scene,wallMat,G,P,S,spawnEnemy,startFloor,openChest,prog,useAbility2,spendPoint,STATS,closeLoot,startRun,killEnemy,placeChest,setClass,hitEnemy,pause,resume,CLASSES,cineChoose,ctut:()=>G.ctut&&G.ctut.step,tut:()=>G.tut&&G.tut.step,openWardrobe2:()=>openWardrobe(),useSlot,startAttack,LV_ABIL3,FXL,closeWardrobe,hurtPlayer,UNL,openSelect,renderSelect,addFragment,cage:()=>G.cage&&[G.cage.hits,G.cage.broken,G.cage.c.id],openSafePed,closeSafePed,isSafeFloor,xrayStart,XR,hero,bedInfo:()=>[!!bedWpn,bedWpn&&bedWpn.visible,bedPicked,hero.wpnF&&hero.wpnF.visible]};

