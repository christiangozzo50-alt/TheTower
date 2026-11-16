/* =========================================================
   CICLO PRINCIPALE
   ========================================================= */
// Pixel art: la scena si disegna in un'immagine piccola (circa 300 righe), poi un filtro riduce i colori a gradini
// con retinatura ordinata e traccia contorni scuri dove la profondità cambia di colpo; infine si ingrandisce a pixel netti
const PIX={scene:new THREE.Scene(),cam:new THREE.OrthographicCamera(-1,1,1,-1,0,1),rt:null,ok:true};
PIX.mat=new THREE.ShaderMaterial({uniforms:{tCol:{value:null},tDep:{value:null},res:{value:new THREE.Vector2(1,1)},cn:{value:0.1},cf:{value:200}},depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D tCol,tDep;uniform vec2 res;uniform float cn,cf;varying vec2 vUv;
  float ld(vec2 u){float z=texture2D(tDep,u).x*2.-1.;return 2.*cn*cf/(cf+cn-z*(cf-cn));}
  float b2(vec2 p){return mod(2.*p.x+3.*p.y,4.);}
  float b4(vec2 p){p=floor(mod(p,4.));return (4.*b2(mod(p,2.))+b2(floor(p/2.)))/16.;}
  void main(){vec2 px=1./res;vec3 c=texture2D(tCol,vUv).rgb;
    float d=ld(vUv),n=min(min(ld(vUv+vec2(px.x,0.)),ld(vUv-vec2(px.x,0.))),min(ld(vUv+vec2(0.,px.y)),ld(vUv-vec2(0.,px.y))));
    float edge=step(0.45+d*0.03,d-n);
    float L=7.;c=sqrt(clamp(c,0.,1.));c=floor(c*(L-1.)+b4(gl_FragCoord.xy))/(L-1.);c=c*c;
    c=mix(c,vec3(.05,.04,.08),edge*.85);
    gl_FragColor=vec4(c,1.);}`});
{const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),PIX.mat);q.frustumCulled=false;PIX.scene.add(q);}
function pixResize(w,h){try{if(PIX.rt){PIX.rt.depthTexture&&PIX.rt.depthTexture.dispose();PIX.rt.dispose();}
  PIX.rt=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter});PIX.rt.depthTexture=new THREE.DepthTexture(w,h);
  PIX.mat.uniforms.res.value.set(w,h);PIX.mat.uniforms.tCol.value=PIX.rt.texture;PIX.mat.uniforms.tDep.value=PIX.rt.depthTexture;}catch(e){PIX.ok=false;}}
function pixRender(){if(!PIX.ok||!PIX.rt){renderer.render(scene,camera);return;}
  try{renderer.setRenderTarget(PIX.rt);renderer.render(scene,camera);renderer.setRenderTarget(null);PIX.mat.uniforms.cn.value=camera.near;PIX.mat.uniforms.cf.value=camera.far;renderer.render(PIX.scene,PIX.cam);}
  catch(e){PIX.ok=false;renderer.setRenderTarget(null);renderer.render(scene,camera);}}
function resize(){const w=innerWidth,h=innerHeight,k=clamp(h/300,1.5,4)*(window.__qRes||1),lw=Math.round(w/k),lh=Math.round(h/k);
  renderer.setPixelRatio(1);renderer.setSize(lw,lh,false);canvas.classList.add('pix');pixResize(lw,lh);
  camera.aspect=w/h;camera.updateProjectionMatrix();checkRotate();}
addEventListener('resize',resize);resize();

const dPos=new THREE.Vector3(),dLook=new THREE.Vector3();
function updCamera(dt){
  if(G.state==='cine'&&G.cine){dPos.copy(G.cine.cp);dLook.copy(G.cine.cl);}
  else if(G.state==='bossintro'&&G.bi&&!G.bi.back){dPos.copy(G.bi.cp);dLook.copy(G.bi.cl);}
  else if(G.state==='select'){dPos.set(PED_X+0.1,2.3,PED_Z+7.2);dLook.set(PED_X,1.75,PED_Z);}
  else if(G.state==='wardrobe'){const low=innerHeight<=500;dPos.set(P.x,low?1.2:1.75,P.z+(low?5.0:isTouch?5.2:6.0));dLook.set(P.x,low?0.55:1.05,P.z-0.4);}   // su schermi bassi l'eroe sta sopra la striscia degli oggetti, piedi compresi
  else{
    const tower=G.scene==='tower',climb=G.state==='climb',dist=(tower?(climb?19:24):17)*(isTouch?(tower?0.66:0.8):1)*(100/(SETTINGS.zoom||100)),halfH=dist*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),halfW=halfH*camera.aspect;
    const half=tower?HALF+0.8:CH+0.6,maxX=Math.max(0,half-halfW),focusX=G.state==='intro'||G.state==='waking'?-9:P.x;
    const cx=clamp(focusX,-maxX,maxX),cy=touchUI()&&tower&&!climb?Math.max(5.5,P.y+2.6):(tower?(climb?4.4:5.2):3.5)+Math.max(0,P.y-(climb?1:2.5))*(climb?0.6:0.45),look=tower?(touchUI()?2.4:1.2):(touchUI()?1.5:0.8);
    dPos.set(cx,cy,dist);dLook.set(cx,cy-look,0);
    if(G.camFocus&&G.camFocus.t>0&&G.state==='play'){G.camFocus.t-=dt;dPos.set(G.camFocus.x+1.2,2.7,dist*0.4);dLook.set(G.camFocus.x,1.3,-0.6);}
    if(G.killcam){const k=G.killcam,z=k.xray?0.32:0.55;dPos.set(lerp(cx,k.x,k.xray?0.95:0.7),k.y+(k.xray?0.5:0.9),dist*z);dLook.set(lerp(cx,k.x,k.xray?1:0.85),k.y,0);}
    else if(G.finT>0&&G.finCam&&tower&&G.state==='play'){const k=G.finCam,z=k.boss?0.5:0.6;dPos.set(lerp(cx,k.x,0.75),k.y+1.1,dist*z);dLook.set(lerp(cx,k.x,0.85),k.y,0);}   // ultimo colpo al rallentatore
    else if(P.dead&&tower&&G.state==='play'){dPos.set(lerp(cx,P.x,0.8),P.y+1.8,dist*0.6);dLook.set(lerp(cx,P.x,0.9),P.y+1,0);}
  }
  if(G.snapCam){camPos.copy(dPos);camLook.copy(dLook);G.snapCam=false;}
  else{const k=damp(dt,(G.camFocus&&G.camFocus.t>0)?3.5:G.killcam||(P.dead&&G.state==='play')?7:G.finT>0?5.5:G.state==='select'||G.state==='wardrobe'?3.5:G.state==='climb'?2.6:G.state==='bossintro'?2.4:5);camPos.lerp(dPos,k);camLook.lerp(dLook,k);}
  camShake.v=Math.max(0,camShake.v-dt*1.6);const s=(reduced||!SETTINGS.shake)?0:camShake.v*camShake.v*0.9;
  G.camPunch=Math.max(0,G.camPunch-dt*2);const pz=G.camPunch*G.camPunch*6;
  camera.position.set(camPos.x+rand(-s,s),camPos.y+rand(-s,s),camPos.z-pz);camera.lookAt(camLook);
}
function updAbilBar(){const lv=prog(G.cls.id).lv;[...$('abilBar').children].forEach((b,i)=>{const n=i+1,s=SLOT[n],a=G.cls[s.k];if(!a)return;
  const lock=lv<s.lv,cd=Math.max(0,P[s.cd]||0),mx=a.cd*S.cdMul,ready=!lock&&cd<=0;b.classList.toggle('ready',ready);if(b.classList.contains('lock')!==lock)setupAbilUi();
  b.firstElementChild.style.height=(lock?0:cd/mx*100)+'%';const sm=b.querySelector('small');if(!lock&&sm)sm.textContent=cd>0?Math.ceil(cd)+' s':'Pronta';});}
function updHud(){updAbilBar();
  {const el=$('runClock'),sec=G.pvp?-1:Math.floor(G.runTime);if(sec!==el._s){el._s=sec;const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),z=String(sec%60).padStart(2,'0');el.textContent=sec<0?'':h?`${h}:${String(m).padStart(2,'0')}:${z}`:`${m}:${z}`;}}
  const k=Math.max(0,P.hp/S.maxHp);
  $('hpFill').style.transform=`scaleX(${k})`;$('hpLag').style.transform=`scaleX(${k})`;$('hpText').textContent=`${Math.ceil(P.hp)} / ${Math.round(S.maxHp)}`;
  $('stamFill').style.transform=`scaleX(${Math.max(0,P.stam/S.stamMax)})`;
  $('upFill').style.transform=`scaleX(${Math.min(1,G.upKills/G.upNeed)})`;
  const cOn=G.cmb>=2&&G.time-G.cmbT<1.6;$('combo').classList.toggle('show',cOn);if(cOn)$('comboN').textContent=G.cmb;
  const n=aliveCount()+G.queue.length;
  $('foes').innerHTML=G.cleared?(bossLocked()?'<b>Piano libero</b>':'Cancello <b>aperto</b>'):(isBossFloor(G.floor)&&G.boss?'<b>Guardiano</b>':`Nemici <b>${n}</b>`);
  if(G.boss)$('bossFill').style.transform=`scaleX(${Math.max(0,G.boss.hp/G.boss.maxHp)})`;
  const cdMax=G.cls.ability.cd*S.cdMul,p=Math.max(0,P.abilCd)/cdMax*100,ready=P.abilCd<=0;
  $('medCd').style.setProperty('--p',p+'%');$('abilCdT').style.setProperty('--p',p+'%');
  $('abilMed').classList.toggle('ready',ready);$('bAbil').classList.toggle('ready',ready);
  $('medKey').textContent=keyLabel(KEYS.ability[0]);$('medState').textContent=ready?'Pronta':Math.ceil(P.abilCd)+' s';
  $('dashCd').style.setProperty('--p',(Math.max(0,P.dashCd)/0.6*100)+'%');
  if(prog(G.cls.id).lv>=LV_ABIL3){const c3=G.cls.ability3.cd*S.cdMul,p3=Math.max(0,P.abil3Cd)/c3*100,r3=P.abil3Cd<=0;
    $('med3Cd').style.setProperty('--p',p3+'%');$('abil3CdT').style.setProperty('--p',p3+'%');$('abilMed3').classList.toggle('ready',r3);$('bAbil3').classList.toggle('ready',r3);
    $('med3Key').textContent=keyLabel(KEYS.ability3[0]);$('med3State').textContent=r3?'Pronta':Math.ceil(P.abil3Cd)+' s';}
  if(prog(G.cls.id).lv>=LV_ABIL2){const c2=G.cls.ability2.cd*S.cdMul,p2=Math.max(0,P.abil2Cd)/c2*100,r2=P.abil2Cd<=0;
    $('med2Cd').style.setProperty('--p',p2+'%');$('abil2CdT').style.setProperty('--p',p2+'%');$('abilMed2').classList.toggle('ready',r2);$('bAbil2').classList.toggle('ready',r2);
    $('med2Key').textContent=keyLabel(KEYS.ability2[0]);$('med2State').textContent=r2?'Pronta':Math.ceil(P.abil2Cd)+' s';}
}
function update(dt){
  updPlayer(dt);
  if(G.scene==='tower'){
    for(const e of G.enemies)if(!e.dead)updEnemy(e,dt);
    const en=G.enemies;
    for(let i=0;i<en.length;i++)for(let j=i+1;j<en.length;j++){const a=en[i],b=en[j];if(a.dead||b.dead||a.fly!==b.fly||a.type==='boss'||b.type==='boss')continue;
      const d=b.x-a.x,min=(a.w+b.w)/2*0.8;if(Math.abs(d)<min&&Math.abs(a.y-b.y)<1.2){const push=(min-Math.abs(d))*0.5*(d>=0?1:-1);a.x-=push;b.x+=push;}}
    if(G.tutorial)updTut(dt);if(G.safe)updSafe();updBarrels();
    updProjs(dt);updWarns(dt);updTimers(dt);updZones(dt);updFloor(dt);updChests(dt);updOrbs(dt);updPickups(dt);updItems(dt);
    G.runTime+=dt;STATS.time+=dt;G.statSave+=dt;if(G.statSave>15){G.statSave=0;saveStats();}
    if(P.dead){G.overT-=dt;if(G.overT<=0)gameOver();}
  }else updCellar(dt);
  if(input.usePressed&&merchant&&merchant.near&&G.state==='play'&&!P.dead)openMerch();   // va letto qui: a fine aggiornamento il tasto viene azzerato
  input.atkDir=null;input.jumpPressed=input.atkPressed=input.dashPressed=input.abilPressed=input.abil2Pressed=input.abil3Pressed=input.usePressed=false;
}
// ---- controller ----
const PAD={on:false,touch:false,act:0,idx:-1,prev:{},nav:{},rep:0,rest:{},latch:{},hw:{},seen:0};
const PAD_GLYPHS={ps:['✕','○','□','△','L1','R1','L2','R2','Share','Options','L3','R3','↑','↓','←','→'],
  xbox:['A','B','X','Y','LB','RB','LT','RT','View','Menu','LS','RS','↑','↓','←','→'],
  nin:['B','A','Y','X','L','R','ZL','ZR','−','+','LS','RS','↑','↓','←','→']};
let PAD_GLYPH=PAD_GLYPHS.xbox;
function padStyle(gp){const id=gp.id||'';PAD_GLYPH=/054c|playstation|dualshock|dualsense|wireless controller(?!.*xbox)/i.test(id)&&!/xbox/i.test(id)?PAD_GLYPHS.ps:/057e|nintendo|pro controller|joy-?con/i.test(id)?PAD_GLYPHS.nin:PAD_GLYPHS.xbox;}
const padBtn=b=>!!b&&(b.pressed||b.value>0.35);   // i grilletti analogici di alcuni controller da telefono non arrivano mai a "pressed"
// quanto si conta di un asse: 0,1 sono la levetta sinistra; 2,3 la destra solo sui controller "standard" (sugli altri possono essere grilletti, fermi a -1)
function padRest(p){const k=p.index+'|'+p.id;return PAD.rest[k]||(PAD.rest[k]=Array.from(p.axes).slice(0,4));}
const padAxesN=p=>p.mapping==='standard'?4:2;
function padActive(gp){if(gp.buttons.some(padBtn))return true;const r=padRest(gp),n=Math.min(padAxesN(gp),gp.axes.length);for(let i=0;i<n;i++)if(Math.abs(gp.axes[i]-(r[i]||0))>0.5)return true;return false;}
// sceglie il controller vero: certi telefoni espongono anche dispositivi finti senza tasti
function padGet(){const ps=navigator.getGamepads?[...navigator.getGamepads()]:[];let best=null,sc=-1;
  for(const p of ps){if(!p||!p.connected||p.buttons.length<10||p.axes.length<2)continue;let v=p.mapping==='standard'?2:0;if(p.index===PAD.idx)v+=3;if(padActive(p))v+=4;if(v>sc){sc=v;best=p;}}
  if(best)PAD.idx=best.index;return best;}
function padRumble(v){if(!PAD.on||PAD.touch||SETTINGS.rumble===false)return;const gp=padGet(),a=gp&&gp.vibrationActuator;if(!a||!a.playEffect)return;
  try{const r=a.playEffect('dual-rumble',{duration:Math.min(240,70+v*170),strongMagnitude:Math.min(1,v*0.8),weakMagnitude:Math.min(1,v*1.1)});if(r&&r.catch)r.catch(()=>{});}catch(e){}}
const PADKEYS_DEF={jump:[0],atk:[7,1],dash:[2],ability:[5],ability2:[4],ability3:[6],use:[3],pause:[9]};
let PADKEYS=Object.assign({},PADKEYS_DEF,store.get('padkeys',{}));
const padGlyph=a=>{const b=PADKEYS[a];return b&&b.length?b.map(i=>PAD_GLYPH[i]||('B'+i)).join(' / '):'—';};
const inputLabel=a=>PAD.on&&!PAD.touch?padGlyph(a):keyLabel((KEYS[a]||[])[0]);
const touchUI=()=>isTouch&&(!PAD.on||PAD.touch);
function padChanged(){if(G.cls)setupAbilUi();if(G.tut&&TUT[G.tut.step])tutShow(G.tut.step+1,TUT.length,TUT[G.tut.step].t,TUT[G.tut.step].x());
  if(G.ctut&&CTUT[G.ctut.step])tutShow(G.ctut.step+1,CTUT.length,CTUT[G.ctut.step].t,CTUT[G.ctut.step].x());if(!$('settings').hidden)renderPadTable();}
function padFocusables(){const scr=[...document.querySelectorAll('.screen:not([hidden]),#cineChoice:not([hidden]),#opener:not([hidden]),#nameGate:not([hidden])')].pop();const root=scr||document;
  return [...root.querySelectorAll('button:not([disabled]),input,[tabindex="0"]')].filter(el=>el.offsetParent!==null&&!el.closest('[hidden]'));}
function padMove(d){const f=padFocusables();if(!f.length)return;let i=f.indexOf(document.activeElement);i=i<0?0:(i+d+f.length)%f.length;f[i].focus();sfx('ui');}
function padMove2(dx,dy){if(dx&&dy)dx=0;const f=padFocusables();if(!f.length)return;const cur=document.activeElement;if(f.indexOf(cur)<0){f[0].focus();sfx('ui');return;}
  const a=cur.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2;let best=null,bs=1e9;
  for(const el of f){if(el===cur)continue;const r=el.getBoundingClientRect(),ex=r.left+r.width/2,ey=r.top+r.height/2,along=dx?(ex-ax)*dx:(ey-ay)*dy,cross=Math.abs(dx?ey-ay:ex-ax);if(along<=2)continue;const v=along+cross*2.2;if(v<bs){bs=v;best=el;}}
  if(!best){const i=f.indexOf(cur);best=f[(i+((dx||dy)>0?1:-1)+f.length)%f.length];}
  best.focus();try{best.scrollIntoView({block:'nearest',inline:'nearest'});}catch(e){}sfx('ui');}
function padBack(){for(const id of ['wrClose','selBack','settingsClose','safeClose','resumeBtn','closeLoot','lootClose','mbNo']){const b=$(id);if(b&&b.offsetParent!==null&&!b.closest('[hidden]')){b.click();return true;}}
  const top=[...document.querySelectorAll('.screen:not([hidden])')].pop(),b=top&&[...top.querySelectorAll('button[id$="Close"],button[id$="Back"]')].find(x=>x.offsetParent!==null);if(b){b.click();return true;}return false;}
const PAD_ACTS=['left','right','up','down','jump','atk','dash','ability','ability2','ability3','use'];
function padRelease(){if(PAD.rk){PAD.rk='';input.atkHold=null;}for(const a of PAD_ACTS)if(PAD.prev['g_'+a]){PAD.prev['g_'+a]=false;press(a,false);}}
// la croce sui controller non standard arriva come assi (6,7) o come un unico asse "hat" (9)
function padHat(gp){let x=0,y=0;if(gp.mapping==='standard')return {x,y};const h=gp.axes[9];
  if(typeof h==='number'&&Math.abs(h)<=1.05){const i=Math.round((h+1)/(2/7));x=[0,1,1,1,0,-1,-1,-1][i]||0;y=[-1,-1,0,1,1,1,0,-1][i]||0;if(Math.abs(h)>1.01){x=y=0;}}
  if(!x&&!y&&gp.axes.length>=8){const ax=gp.axes[6],ay=gp.axes[7];if(Math.abs(ax)>0.5&&Math.abs(ax)<=1)x=Math.sign(ax);if(Math.abs(ay)>0.5&&Math.abs(ay)<=1)y=Math.sign(ay);}return {x,y};}
// tra un fotogramma e l'altro si tiene nota dei tasti premuti: a pochi FPS un tocco rapido altrimenti si perde
setInterval(()=>{if(!PAD.on||document.hidden||!navigator.getGamepads)return;const gp=navigator.getGamepads()[PAD.idx];if(!gp)return;for(let i=0;i<gp.buttons.length;i++){const v=padBtn(gp.buttons[i]);if(v&&!PAD.hw[i])PAD.latch[i]=1;PAD.hw[i]=v;}},8);
function pollPad(){const gp=padGet();
  if(!gp){padRelease();if(PAD.on&&performance.now()-PAD.seen>1500){PAD.on=false;padChanged();}return;}   // sul telefono il Bluetooth può sparire per un attimo: niente tasti bloccati e niente falsi "scollegato"
  PAD.seen=performance.now();
  if(padActive(gp)){PAD.act=performance.now();if(PAD.touch){PAD.touch=false;padChanged();}}
  if(!PAD.on){if(!padActive(gp))return;padStyle(gp);PAD.on=true;toast('Controller collegato',`${padGlyph('jump')} salta · ${padGlyph('atk')} attacca · ${padGlyph('dash')} scatto`);padChanged();}
  if(G.padCapture){for(let i=0;i<gp.buttons.length;i++){const v=padBtn(gp.buttons[i]),was=PAD.prev['cap'+i];PAD.prev['cap'+i]=v;
      if(v&&!was&&G.padCapture!=='armed'){PADKEYS[G.padCapture]=[i];store.set('padkeys',PADKEYS);G.padCapture=null;sfx('pick');renderPadTable();padChanged();return;}}
    if(G.padCapture==='armed')G.padCapture=G.padArm;return;}
  const B=i=>padBtn(gp.buttons[i])||!!PAD.latch[i],ax=gp.axes[0]||0,ay=gp.axes[1]||0,hat=padHat(gp);
  const lm=Math.hypot(ax,ay),lx=lm>0.26?ax:0,ly=lm>0.26?ay:0;   // zona morta circolare: i joystick dei controller da telefono sono piccoli e derivano
  const th=(k,on,off)=>PAD.prev['g_'+k]?off:on;   // soglia diversa per accendere e spegnere: una levetta a metà corsa non fa più scatti
  const L=B(14)||hat.x<0||lx<-th('left',0.4,0.28),R=B(15)||hat.x>0||lx>th('right',0.4,0.28),U=B(12)||hat.y<0||(ly<-th('up',0.6,0.45)&&Math.abs(ly)>Math.abs(lx)*0.9),D=B(13)||hat.y>0||(ly>th('down',0.6,0.45)&&Math.abs(ly)>Math.abs(lx)*0.9);
  const edge=(k,v)=>{const was=PAD.prev[k];PAD.prev[k]=v;return v&&!was;};
  const playing=(G.state==='play'||G.state==='cellar')&&!G.tedit;
  const opener=!$('opener').hidden&&!$('opener').classList.contains('cineview');
  if(opener){if(edge('a',B(0))||edge('st',B(9)))opPlay();return;}
  const P_=a=>(PADKEYS[a]||[]).some(B);
  if(playing){const map={left:L,right:R,up:U,down:D,jump:P_('jump'),atk:P_('atk'),dash:P_('dash'),ability:P_('ability'),ability2:P_('ability2'),ability3:P_('ability3'),use:P_('use')};
    for(const a in map){const v=map[a];if(v!==!!PAD.prev['g_'+a]){PAD.prev['g_'+a]=v;press(a,v);}
      else if(v){if(a==='left'||a==='right'||a==='up'||a==='down'){if(!input[a])input[a]=true;}else if(a==='jump'){input.jumpHeld=true;}else if(a==='atk'){input.atkHeld=true;}}}   // dopo un cambio di piano o un menu l'input viene azzerato: quello che tieni premuto resta valido
    // levetta destra: attacco direzionale, come trascinare il tasto Attacco sul telefono
    {const rx=gp.axes[2]||0,ry=gp.axes[3]||0,rl=Math.hypot(rx,ry);
      if(gp.mapping==='standard'&&gp.axes.length>=4&&rl>0.6){const dx=Math.abs(rx)>Math.abs(ry)*0.8?Math.sign(rx):0,dy=Math.abs(ry)>Math.abs(rx)*0.8?-Math.sign(ry):0,d={x:dx,y:dy},k=dx+','+dy;input.atkHold=d;input.atkHeld=true;if(PAD.rk!==k){PAD.rk=k;input.atkDir=d;input.atkPressed=true;}}
      else if(PAD.rk&&rl<0.35){PAD.rk='';input.atkHold=null;input.atkHeld=!!PAD.prev.g_atk;}}
    if(edge('st',P_('pause'))){if(G.state==='play')pause();else if(G.state==='cellar')openSettings('cellar');}
    if(edge('view',B(8))&&G.state==='cellar')$('coopBtn').click();
    return;}
  if(G.state==='climb'){for(const a of PAD_ACTS){const v=a==='left'?L:a==='right'?R:false;if(v!==!!PAD.prev['g_'+a]){PAD.prev['g_'+a]=v;press(a,v);}}return;}   // sulle scale conta solo la direzione: indietro annulla la salita
  padRelease();
  if(G.state==='cine'&&!$('cineSkip').hidden&&edge('st',B(9))){$('cineSkip').click();return;}
  if(G.state==='bossintro'){if(edge('a',B(0))|edge('st',B(9))){if(G.bi&&G.bi.t>0.4)finishBossIntro();}return;}
  // menu: il cursore parte da solo sul tasto principale e un tasto premuto appena prima non conferma per sbaglio
  {const root=[...document.querySelectorAll('.screen:not([hidden]),#cineChoice:not([hidden]),#nameGate:not([hidden])')].pop()||null;
    if(root!==PAD.root){PAD.root=root;PAD.menuAt=performance.now();}
    if(root&&!root.contains(document.activeElement)){const f=padFocusables(),b=f.find(el=>el.matches('button.big'))||f.find(el=>el.tagName!=='INPUT');if(b)b.focus();}}
  const nx=R?1:L?-1:0,ny=D?1:U?-1:0;
  if(nx||ny){if(!PAD.nav.d||PAD.rep<=0){const el=document.activeElement;if(nx&&!ny&&el&&el.type==='range'){el.value=+el.value+nx*5;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}else padMove2(nx,ny);PAD.rep=PAD.nav.d?0.12:0.32;}PAD.nav.d=1;}else PAD.nav.d=0;
  if(edge('a',B(0))&&performance.now()-(PAD.menuAt||0)>(G.state==='over'?700:280)){const el=document.activeElement;if(el&&el!==document.body&&el.click)el.click();else padMove(1);}
  if(edge('b',B(1)))padBack();
  if(edge('st',P_('pause'))&&G.state==='pause')resume();}
let last=performance.now(),lastHud=0;
function frame(now){
  requestAnimationFrame(frame);
  chestArrowTick();schatTick();WFX.t.value=(now*0.001)%628.3185;WFX.b.value=lerp(WFX.b.value,P.atk?1:0,0.2);WFX.px.value=renderer.domElement.height/(2*Math.tan(camera.fov*Math.PI/360));
  let rdt=Math.min(0.033,(now-last)/1000);last=now;{const L_=window.__LAB;if(L_&&L_.on){rdt=L_.step?1/60:L_.pause?0:rdt*L_.ts;L_.step=false;}}PAD.rep-=rdt;try{pollPad();}catch(e){}PAD.latch={};xrayTick(rdt);if(G.deathSlow>0)G.deathSlow-=rdt;
  G.killcamCd=(G.killcamCd||0)-rdt;if(G.killcam){G.killcam.t-=rdt;if(G.killcam.t<=0||G.state!=='play')finishKillcam();}
  if(G.abilSlow>0)G.abilSlow-=rdt;if(G.finT>0){G.finT-=rdt;if(G.state!=='play')G.finT=0;}
  const dt=G.killcam?rdt*0.18:G.finT>0?rdt*0.22:G.deathSlow>0?rdt*0.3:G.abilSlow>0?rdt*0.35:rdt;G.time+=dt;
  if(G.state==='play'||G.state==='cellar'){if(G.hitstop>0)G.hitstop-=dt;else update(dt);}
  else if(G.state==='climb'){updClimb(dt);updOrbs(dt);}
  else if(G.state==='enter')updEnter(dt);
  else if(G.state==='bossintro')updBossIntro(rdt);
  else if(G.state==='waking')updWake(dt);
  else if(G.state==='cine')updCine(rdt);
  else if(G.state==='select'){P.landT-=dt;if(P.atk){P.atk.t+=dt;if(P.atk.t>=P.atk.wind+P.atk.act+P.atk.rec)P.atk=null;}}
  if(hintTimer!==Infinity&&hintTimer>0){hintTimer-=dt;if(hintTimer<=0)setHint('',0);}
  if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').classList.remove('show');}
  for(const e of G.enemies)if(!e.dead)syncEnemy(e,dt);if(G.cine)cineAfterSync();
  updCorpses(dt);updChunks(dt);updDrops(dt);if(G.scene==='tower')updCage(dt);updGhosts(dt);updHeroVisual(dt);updInterLabels();if(G.state==='cine'&&hero)hero.model.visible=false;if(G.ctut)updCTut(dt);updFxl(dt);updParticles(dt);updNums(dt);if(G.scene==='tower')updProps(dt);
  for(const d of wdDoors){const o=G.state==='wardrobe'?1:0;d.g.rotation.y=lerp(d.g.rotation.y,d.s*o*1.9,damp(dt,5));}
  for(const b of bolts)if(b.life>0){b.life-=dt;b.l.material.opacity=Math.max(0,b.life/0.2);if(b.life<=0)b.l.visible=false;}
  for(const t of torches){const f=1+Math.sin(G.time*13+t.seed)*0.08+Math.random()*0.06;t.flame.scale.set(1,1.7*f,1);if(t.light)t.light.intensity=t.base*f;}
  for(const c of cellarLights){if(c.steady)continue;const f=1+Math.sin(G.time*11+c.seed)*0.07+Math.random()*0.05;c.light.intensity=c.base*f;if(c.flame)c.flame.scale.y=1.8*f;}
  if(G.scene==='cellar'){
    for(const f of cellarAnims)f(dt,G.time);
    if(dust){const a=dust.geometry.attributes.position;for(let i=0;i<a.count;i++){let y=a.getY(i)+dt*0.08;if(y>CELLAR_CEIL)y=0;a.setY(i,y);a.setX(i,a.getX(i)+Math.sin(G.time*0.5+i)*dt*0.05);}a.needsUpdate=true;}
    const sel=G.state==='select';pedRunes.material.opacity=lerp(pedRunes.material.opacity,sel?0.95:0.45+Math.sin(G.time*2)*0.1,damp(dt,4));pedRunes.rotation.z+=dt*(sel?1.2:0.3);
    pedBeam.material.opacity=lerp(pedBeam.material.opacity,sel?0.13:0.035,damp(dt,4));
  }
  if(G.scene==='tower'&&G.cleared&&!bossLocked()){if(!G.gateMsg&&G.state==='play'){G.gateMsg=true;if(!G.safe&&!G.tutorial&&G.floor<TOP_FLOOR){const gm=$('gateMsg');gm.classList.remove('show');void gm.offsetWidth;gm.classList.add('show');}}G.gateY=approach(G.gateY,5.4,dt*3.2);bars.position.y=G.gateY;G.gateOpen=G.gateY>2.4&&aliveCount()===0&&G.queue.length===0;}
  G.fade=approach(G.fade,G.fadeTarget,dt*(G.fadeSpd||2.6));if(G.fade===G.fadeTarget)G.fadeSpd=2.6;$('fade').style.opacity=G.fade;
  if(G.fadeCb&&G.fade>=0.999){const cb=G.fadeCb;G.fadeCb=null;
    try{cb();}
    catch(err){console.error('Errore durante la transizione (avvio scalata?):',err);
      try{showUpd('Errore: '+((err&&err.message)||err));}catch(_){}
      try{toast('Qualcosa è andato storto','Torno al seminterrato — '+((err&&err.message)||err));}catch(_){}
      try{G.pvp=false;G.horde=false;G.tutorial=false;enterCellar();}catch(_){}
      G.fadeTarget=0;}}
  updCamera(rdt);
  if(G.scene==='tower'&&now-lastHud>50){updHud();lastHud=now;}
  pixRender();
}

