/* =========================================================
   ACCOUNT (nome utente + password, per giocare su più dispositivi)
   e AGGIORNAMENTI AUTOMATICI quando esce una nuova versione
   ========================================================= */
const BUILD_ID='1795023797';
// Chiave Web API di Firebase (Impostazioni progetto → Generali). Vuota = account non attivi.
const FB_KEY='AIzaSyAGoRYCkQJYEvEGLGCEeCwksHGdlMntWrI';
const AUTH=Object.assign({},store.get('auth',{}));
const authOn=()=>!!(FB_KEY&&FB_URL);
const logged=()=>!!(AUTH.uid&&AUTH.refreshToken);
const emailOf=u=>Array.from(nameKey(u)).map(c=>/[a-z0-9_-]/.test(c)?c:'x'+c.charCodeAt(0).toString(16)).join('')+'@thetower-player.app';
const AUTH_ERR={EMAIL_EXISTS:'Esiste già un account con questo nome.',EMAIL_NOT_FOUND:'Nessun account con questo nome.',INVALID_PASSWORD:'Password sbagliata.',INVALID_LOGIN_CREDENTIALS:'Nome o password sbagliati.',
  WEAK_PASSWORD:'La password deve avere almeno 6 caratteri.',TOO_MANY_ATTEMPTS_TRY_LATER:'Troppi tentativi: riprova tra qualche minuto.',USER_DISABLED:'Account disattivato.',
  CREDENTIAL_TOO_OLD_LOGIN_AGAIN:'Per sicurezza esci e rientra, poi cambia la password.',TOKEN_EXPIRED:'Sessione scaduta: esci e rientra.',INVALID_ID_TOKEN:'Sessione scaduta: esci e rientra.'};
async function authCall(ep,body){const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${ep}?key=${FB_KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const d=await r.json();if(!r.ok){const c=((d.error&&d.error.message)||'ERRORE').split(' ')[0].split(':')[0];throw new Error(AUTH_ERR[c]||('Errore: '+c));}return d;}
function setAuth(d,user){Object.assign(AUTH,{uid:d.localId||d.user_id||AUTH.uid,idToken:d.idToken||d.id_token,refreshToken:d.refreshToken||d.refresh_token,exp:Date.now()+(+(d.expiresIn||d.expires_in)||3600)*1000,user:user||AUTH.user});store.set('auth',AUTH);}
async function token(){if(!logged())return null;if(AUTH.idToken&&Date.now()<AUTH.exp-60000)return AUTH.idToken;
  const r=await fetch(`https://securetoken.googleapis.com/v1/token?key=${FB_KEY}`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(AUTH.refreshToken)});
  const d=await r.json();if(!r.ok)throw new Error('sessione scaduta');setAuth(d);return AUTH.idToken;}
// ---------- SINCRONIZZAZIONE TRA DISPOSITIVI ----------
// Prima i progressi venivano solo CARICATI nel cloud e scaricati una volta sola all'accesso: il telefono non vedeva mai
// quello che facevi sul PC (e poteva anche sovrascriverlo). Ora ogni dispositivo controlla il cloud all'avvio, quando torni
// nell'app e quando torni al seminterrato: se un altro dispositivo ha salvato qualcosa di più recente lo scarica.
// Le impostazioni del dispositivo (comandi, tasti, grafica, volume) restano di ciascun dispositivo.
const SYNC_SKIP=new Set(['torre-auth','torre-sync','torre-bak','torre-settings','torre-keys','torre-padkeys','torre-nt-seen','torre-news-v','torre-tribpend']);
const SY=Object.assign({dev:'',t:0,h:'',lt:0},store.get('sync',{}));if(!SY.dev)SY.dev=Math.random().toString(36).slice(2,10);
const SYNC={ready:false,busy:false,ask:false,last:0};
const syncPersist=()=>{try{localStorage.setItem('torre-sync',JSON.stringify(SY));}catch(e){}};syncPersist();
const hashS=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(36)+'.'+s.length;};
function collectSave(){const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('torre-')&&!SYNC_SKIP.has(k))ks.push(k);}
  ks.sort();const o={};for(const k of ks)o[k]=localStorage.getItem(k);return o;}
const cloudContent=sv=>{let o={};try{o=JSON.parse(sv.d||'{}');}catch(e){}const r={};for(const k of Object.keys(o).sort())if(!SYNC_SKIP.has(k))r[k]=o[k];return r;};
// le modifiche fatte su questo dispositivo dopo il primo controllo della sessione contano come "più recenti"
{const _set=store.set;store.set=function(k,v){_set.call(store,k,v);if(SYNC.ready&&!SYNC_SKIP.has('torre-'+k)){SY.lt=Date.now();SYNC.ltDirty=true;}};}
setInterval(()=>{if(SYNC.ltDirty){SYNC.ltDirty=false;syncPersist();}},3000);
let lastSync='';
const savesUrl=()=>`${FB_URL.replace(/\/$/,'')}/saves/${AUTH.uid}`;
async function cloudPush(){const s=JSON.stringify(collectSave()),h=hashS(s),t=Date.now(),tk=await token();
  const r=await fetch(`${savesUrl()}.json?auth=${tk}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({t,d:s,u:AUTH.user||MP.name(),dev:SY.dev})});
  if(r.ok){SY.t=t;SY.h=h;lastSync=s;syncPersist();}return r.ok;}
async function cloudLoad(){const t=await token();const r=await fetch(`${savesUrl()}.json?auth=${t}`);if(!r.ok)throw new Error('lettura non riuscita');return r.json();}
const syncSafe=()=>(G.scene==='cellar'||['intro','waking','cine'].includes(G.state))&&!inGroup()&&$('account').hidden&&$('nameGate').hidden&&!/^(INPUT|TEXTAREA)$/.test((document.activeElement||{}).tagName||'');
// ---------- copie di sicurezza: prima di sostituire i progressi di questo dispositivo ne tengo una copia (le ultime 3) ----------
const jget=(o,k,d)=>{try{const v=o[k];return v==null?d:JSON.parse(v);}catch(e){return d;}};
function saveSummary(o){const st=jget(o,'torre-stats',{})||{},pr=jget(o,'torre-prog',{})||{};let lv=0,top=0;for(const id in pr){const l=+(pr[id]&&pr[id].lv)||1;lv+=l;top=Math.max(top,l);}
  const best=+st.best||0,runs=+st.runs||0;return {best,lv,top,runs,score:best*100+lv*10+runs};}
const sumTxt=s=>`piano record ${s.best}, livello più alto ${s.top||1}, ${s.runs} scalate`;
const backups=()=>{const b=store.get('bak',[]);return Array.isArray(b)?b:[];};
function backupLocal(why){const o=collectSave(),sm=saveSummary(o);if(!sm.runs&&!sm.best)return;   // niente da salvare
  const b=backups();b.unshift({t:Date.now(),why,d:JSON.stringify(o)});while(b.length>3)b.pop();
  try{localStorage.setItem('torre-bak',JSON.stringify(b));}catch(e){b.pop();try{localStorage.setItem('torre-bak',JSON.stringify(b));}catch(_){}}}
function restoreBackup(i){const b=backups()[i];if(!b)return;backupLocal('prima del ripristino');const o=JSON.parse(b.d);
  for(const k of Object.keys(collectSave()))localStorage.removeItem(k);for(const k in o)if(!SYNC_SKIP.has(k))localStorage.setItem(k,o[k]);
  SY.lt=Date.now();SY.h='';syncPersist();showUpd('Ripristino i progressi…');setTimeout(()=>location.reload(),700);}
function applySaveSynced(sv,msg){backupLocal('sostituiti dall\'account');const o=cloudContent(sv);for(const k of Object.keys(collectSave()))localStorage.removeItem(k);for(const k in o)localStorage.setItem(k,o[k]);
  SY.t=sv.t||Date.now();SY.h=hashS(JSON.stringify(collectSave()));SY.lt=0;syncPersist();
  showUpd(msg||'Progressi aggiornati dall\'altro dispositivo…');setTimeout(()=>location.reload(),900);}
// mode: 'overwrite' = carica i progressi di questo dispositivo senza controllare (scelta esplicita del giocatore)
async function cloudSave(mode){if(!authOn()||!logged())return;
  if(mode==='overwrite'){try{await cloudPush();}catch(e){}return;}
  if(SYNC.busy)return;SYNC.busy=true;
  try{const tk=await token();const r=await fetch(`${savesUrl()}/t.json?auth=${tk}`);const ct=r.ok?await r.json():null;
    const s=JSON.stringify(collectSave()),h=hashS(s),dirty=h!==SY.h,localNew=dirty&&SY.lt>SY.t;
    if(ct&&ct>SY.t){   // nel cloud c'è qualcosa di più recente di quello che questo dispositivo conosce
      const sv=await cloudLoad();if(!sv||!sv.d){SY.t=ct;syncPersist();return;}
      if(hashS(JSON.stringify(cloudContent(sv)))===h){SY.t=sv.t;SY.h=h;syncPersist();return;}   // stessi dati: niente da fare
      if(sv.dev===SY.dev&&!localNew){SY.t=sv.t;syncPersist();return;}
      if(!syncSafe())return;   // ci riprova al seminterrato
      const ls=saveSummary(collectSave()),cs=saveSummary(cloudContent(sv));
      if(localNew||ls.score>cs.score){syncAsk(sv,ls,cs);return;}   // modifiche sia qui sia altrove, o qui hai fatto di più: decide il giocatore
      applySaveSynced(sv);return;}
    if(dirty&&(SY.lt>SY.t||!ct))await cloudPush();}   // solo modifiche vere fatte qui (non le scritture dell'avvio)
  catch(e){}finally{SYNC.busy=false;SYNC.last=Date.now();SYNC.ready=true;}}
function syncAsk(sv,ls,cs){if(SYNC.ask)return;ls=ls||saveSummary(collectSave());cs=cs||saveSummary(cloudContent(sv));SYNC.ask=true;const a=$('account');a.hidden=false;$('acForm').hidden=true;$('acIn').hidden=true;$('acMsg').textContent='';
  const c=$('acChoice');c.hidden=false;const p=c.querySelector('.ig-lead'),old=p.textContent;p.innerHTML=`L'account ha progressi diversi da questo dispositivo. Quali vuoi tenere?<br><small>Account: ${sumTxt(cs)}<br>Questo dispositivo: ${sumTxt(ls)}</small>`;
  const done=()=>{c.hidden=true;p.textContent=old;SYNC.ask=false;SY.t=Math.max(SY.t,sv.t||0);syncPersist();renderAccount();};
  $('acUseCloud').onclick=()=>{done();a.hidden=true;applySaveSynced(sv,'Carico i progressi dell\'altro dispositivo…');};
  $('acUseLocal').onclick=async()=>{await cloudSave('overwrite');done();a.hidden=true;toast('Fatto','Ora l\'account ha i progressi di questo dispositivo');};}
setInterval(()=>cloudSave(),60000);setTimeout(()=>{SYNC.ready=false;cloudSave().finally(()=>{SYNC.ready=true;});},1500);
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(logged()&&hashS(JSON.stringify(collectSave()))!==SY.h&&SY.lt>SY.t)cloudPush().catch(()=>{});}else if(Date.now()-SYNC.last>5000)cloudSave();});
function applySave(sv){applySaveSynced(sv,'Carico i tuoi progressi…');}

/* ---------- schermata account ---------- */
function renderBak(){let box=$('acBak');if(!box){box=document.createElement('div');box.id='acBak';box.style.cssText='display:grid;gap:6px;width:100%;margin-top:4px';$('acMsg').before(box);}
  const b=backups();if(!b.length){box.innerHTML='';return;}
  box.innerHTML='<p class="ig-lead" style="font-size:12px;opacity:.8">Copie dei progressi di questo dispositivo, fatte prima di sostituirli:</p>'+b.map((x,i)=>{const sm=saveSummary(JSON.parse(x.d)),d=new Date(x.t);
    return `<button class="ghost" data-bak="${i}">Ripristina: ${sumTxt(sm)} <small>(${d.toLocaleDateString('it-IT')} ${d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})})</small></button>`;}).join('');
  box.querySelectorAll('[data-bak]').forEach(bt=>bt.onclick=()=>{if(bt.dataset.ok){restoreBackup(+bt.dataset.bak);return;}bt.dataset.ok=1;const t=bt.innerHTML;bt.textContent='Tocca di nuovo per confermare';setTimeout(()=>{delete bt.dataset.ok;bt.innerHTML=t;},4000);});}
function openAccount(){const a=$('account');a.hidden=false;$('acMsg').textContent='';renderAccount();}
function closeAccount(){$('account').hidden=true;}
function renderAccount(){const on=logged();$('acForm').hidden=on;$('acIn').hidden=!on;renderBak();
  if(!authOn()){$('acForm').hidden=true;$('acIn').hidden=true;$('acMsg').textContent='Gli account non sono ancora attivi.';return;}
  if(on){$('acWho').textContent=AUTH.user||MP.name();$('acNewPass').value='';}
  else{if(!$('acUser').value)$('acUser').value=store.get('mpname','')||'';}}
async function acRegister(){const u=$('acUser').value.trim(),p=$('acPass').value,msg=$('acMsg');
  if(u.length<3||u.length>14||!/^[A-Za-z0-9À-ÿ _-]+$/.test(u)){msg.textContent='Nome da 3 a 14 caratteri: lettere, numeri, spazi, - e _.';return;}
  if(p.length<6){msg.textContent='La password deve avere almeno 6 caratteri.';return;}
  msg.textContent='Creo l\'account…';
  try{if(!(await nameFree(u))){msg.textContent=`«${u}» è già usato da un altro giocatore.`;return;}
    const d=await authCall('signUp',{email:emailOf(u),password:p,returnSecureToken:true});setAuth(d,u);
    await fbPut('names/'+encodeURIComponent(nameKey(u)),PID);store.set('mpname',u);store.set('nameok',true);
    await cloudSave('overwrite');$('acPass').value='';msg.textContent='';$('nameGate').hidden=true;renderAccount();mpUi();heartbeat();
    toast('Account creato','Accedi con '+u+' sugli altri dispositivi');}
  catch(e){msg.textContent=e.message;}}
async function acLogin(){const u=$('acUser').value.trim(),p=$('acPass').value,msg=$('acMsg');if(!u||!p){msg.textContent='Scrivi nome e password.';return;}
  msg.textContent='Accedo…';
  try{const d=await authCall('signInWithPassword',{email:emailOf(u),password:p,returnSecureToken:true});setAuth(d,u);$('acPass').value='';
    let sv=null;try{sv=await cloudLoad();}catch(err){store.set('mpname',u);store.set('nameok',true);msg.textContent='';$('nameGate').hidden=true;renderAccount();mpUi();
      toast('Accesso fatto','Non riesco a leggere i progressi online: per ora resti con quelli di questo dispositivo');return;}
    if(sv&&sv.d){const hasLocal=(STATS.runs||0)>0&&store.get('mpname','')!==u;
      if(hasLocal){$('acMsg').textContent='';$('acChoice').hidden=false;$('acForm').hidden=true;
        $('acUseCloud').onclick=()=>applySave(sv);$('acUseLocal').onclick=async()=>{store.set('mpname',u);store.set('nameok',true);await cloudSave('overwrite');$('acChoice').hidden=true;renderAccount();toast('Fatto','I progressi di questo dispositivo sono nel tuo account');};return;}
      msg.textContent='Carico i tuoi progressi…';applySave(sv);}
    else{store.set('mpname',u);store.set('nameok',true);await cloudSave('overwrite');msg.textContent='';$('nameGate').hidden=true;renderAccount();mpUi();toast('Accesso fatto','Bentornato, '+u);}}
  catch(e){msg.textContent=e.message;}}
async function acChangePass(){const np=$('acNewPass').value,msg=$('acMsg');
  if(!logged()){msg.textContent='Devi prima accedere.';return;}
  if(np.length<6){msg.textContent='La nuova password deve avere almeno 6 caratteri.';return;}
  msg.textContent='Cambio la password…';
  try{const tk=await token();if(!tk)throw new Error('sessione scaduta');
    const d=await authCall('update',{idToken:tk,password:np,returnSecureToken:true});setAuth(d);
    $('acNewPass').value='';msg.textContent='';toast('Password cambiata','Usa la nuova password sugli altri dispositivi');}
  catch(e){msg.textContent=e.message;}}
$('acChg').onclick=acChangePass;
$('acNewPass').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();acChangePass();}});
$('acReg').onclick=acRegister;$('acLog').onclick=acLogin;
$('acOut').onclick=()=>{cloudSave(true).finally(()=>{for(const k in AUTH)delete AUTH[k];store.set('auth',{});SY.t=0;SY.h='';SY.lt=0;syncPersist();renderAccount();toast('Sei uscito','I progressi restano anche su questo dispositivo');});};
$('acClose').onclick=closeAccount;
$('acUser').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();$('acPass').focus();}});
$('acPass').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();$('acPass').blur();}});
$('ngLogin').onclick=()=>openAccount();
// nella sezione Amici: stato dell'account
const _rfA=renderFriends;
renderFriends=async function(){await _rfA();const me=$('frMe');if(me&&!me.querySelector('#frAcc')){me.insertAdjacentHTML('beforeend',` · <button class="mini" id="frAcc">${logged()?'Account: '+esc(AUTH.user||''):'Accedi / crea account'}</button>`);$('frAcc').onclick=openAccount;}};
// salvataggi nel cloud nei momenti giusti
const _ecA=enterCellar;enterCellar=function(){const r=_ecA();setTimeout(()=>cloudSave(),700);if(updReady)setTimeout(doReload,600);return r;};

/* ---------- aggiornamenti: nuova versione pubblicata ---------- */
let updReady=null;
async function checkUpdate(){if(updReady||location.protocol!=='https:')return;
  try{const t=await (await fetch(location.pathname+'?vc='+Date.now(),{cache:'no-store'})).text();const m=t.match(/const BUILD_ID='(\d+)'/);
    if(m&&m[1]!==BUILD_ID){updReady=m[1];onUpdate();}}catch(e){}}
setInterval(checkUpdate,60000);setTimeout(checkUpdate,20000);
const safeNow=()=>G.scene==='cellar'||['intro','waking'].includes(G.state);
const inGroup=()=>!!(MP.on||MP.peer||MP.reco);
setInterval(()=>{if(updReady&&!inGroup()&&safeNow())doReload();},5000);
function showUpd(t){const b=$('updBar');b.textContent=t;b.hidden=false;clearTimeout(showUpd.tm);showUpd.tm=setTimeout(()=>{b.hidden=true;},5000);}
function onUpdate(){if(inGroup()){toast('Nuova versione disponibile','Si aggiornerà quando esci dal gruppo');return;}if(safeNow()){showUpd('Nuova versione disponibile: aggiorno…');setTimeout(doReload,1500);}
  else toast('Nuova versione disponibile','Si aggiornerà appena muori o torni al seminterrato');}
let reloading=false;
function doReload(){if(reloading||inGroup())return;reloading=true;showUpd('Aggiorno alla nuova versione…');
  Promise.race([cloudSave(true),new Promise(r=>setTimeout(r,2500))]).finally(()=>{const u=new URL(location.href);u.searchParams.set('v',updReady||Date.now());u.hash='';location.replace(u.toString());});}
const _goU=gameOver;gameOver=function(){_goU();cloudSave();if(updReady){showUpd('Nuova versione pronta: aggiorno tra un attimo…');setTimeout(doReload,3500);}};
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{enterCellar:()=>enterCellar(),openAccount,onUpdate,setUpd:v=>{updReady=v;onUpdate();}});

/* =========================================================
   SANTUARIO COME IL SEMINTERRATO · CONTROLLER · FORZIERI SCENOGRAFICI
   ========================================================= */
/* ---------- nomi sull'arredo del santuario, come nel seminterrato ---------- */
const _uiLS=updInterLabels;
updInterLabels=function(){const box=$('interLabels'),safe=G.scene==='tower'&&G.safe&&G.state==='play'&&G.safeInter;
  if(!safe){if(box.dataset.m){delete box.dataset.m;box.textContent='';}return _uiLS();}
  const key='s'+G.safeInter.length;if(box.dataset.m!==key){box.dataset.m=key;box.textContent='';for(const it of G.safeInter){const s=document.createElement('span');s.textContent=it.name;box.appendChild(s);}}
  box.hidden=false;G.safeInter.forEach((it,k)=>{const s=box.children[k],[sx,sy]=toScreen(it.x,it.y+0.35,-1.2);s.style.transform=`translate(${sx}px,${sy}px) translate(-50%,-100%)`;s.classList.toggle('dim',it===nearSafe);});};

/* ---------- comandi a schermo: spariscono col controller; attacco e abilità solo dove si combatte ---------- */
function uiModes(){const p=PAD.on&&!PAD.touch&&!G.tedit,n=!G.tedit&&(G.scene==='cellar'||!!G.safe);
  if(uiModes.p!==p){uiModes.p=p;document.body.classList.toggle('pad-on',p);}
  if(uiModes.n!==n){uiModes.n=n;document.body.classList.toggle('no-fight',n);if(n){G.cmb=0;G.cmbTier=0;}}}
const _ppUI=pollPad;pollPad=function(){_ppUI();uiModes();};
// se tocchi lo schermo mentre il controller è fermo, tornano i comandi touch; alla prima pressione del controller spariscono di nuovo
addEventListener('touchstart',()=>{if(PAD.on&&!PAD.touch&&performance.now()-PAD.act>4000){PAD.touch=true;padChanged();}},{passive:true});

/* ---------- forzieri: carica, esplosione di luce del colore della rarità, coperchio a molla ---------- */
const CHEST_W=0.62;
const CHRAY_GEO=new THREE.PlaneGeometry(1,1);CHRAY_GEO.translate(0,0.5,0);CHRAY_GEO.userData.keep=true;
{const pos=CHRAY_GEO.attributes.position,col=[];for(let i=0;i<pos.count;i++){const top=pos.getY(i)>0.5;if(top)pos.setX(i,pos.getX(i)*1.7);const v=top?0:1;col.push(v,v,v);}CHRAY_GEO.setAttribute('color',new THREE.Float32BufferAttribute(col,3));}   // il raggio si allarga e sfuma verso la punta
const CHRING_GEO=new THREE.RingGeometry(0.82,1,40);CHRING_GEO.rotateX(-Math.PI/2);CHRING_GEO.userData.keep=true;
const chAdd=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
(function(){const d=document.createElement('div');d.id='chestFlash';document.body.appendChild(d);})();
let chestBest=-1;
const _diC=dropItem;dropItem=function(o){chestBest=Math.max(chestBest,o.rarity||0);return _diC.apply(this,arguments);};
const _ocC=openChest;
openChest=function(c){if(!c||c.open||c.fx)return;c.fx={t:0,ph:0,rat:0};$('prompt').hidden=true;$('bUse').hidden=true;P.vx=0;P.face=Math.sign(c.x-P.x)||P.face;};
function chestBurst(c){const F=c.fx;chestBest=-1;_ocC(c);const best=chestBest,hex=best>=0?RARITY[best].hex:0xffd27a,lv=Math.max(0,best)+(c.boss?1:0),y0=c.y+0.8;
  F.ph=1;F.t=0;F.hex=hex;F.lv=lv;F.ang=c.lid.rotation.x;F.vel=-26;c.lm.emissiveIntensity=0;
  c.g.updateMatrixWorld(true);const w=new THREE.Vector3();c.lk.getWorldPosition(w);const m=c.lk.clone();m.position.copy(w);m.scale.setScalar(c.boss?1.25:1);scene.add(m);
  G.chunks.push({m,vx:rand(-4,4),vy:rand(7,10),vz:rand(1,3),rx:rand(-12,12),rz:rand(-12,12),t:0});c.lk.visible=false;
  F.inner=mesh(new THREE.PlaneGeometry(1,0.62),chAdd(hex,0.95),0,0.565,0,c.g,true);F.inner.rotation.x=-Math.PI/2;
  F.flash=mesh(sph(0.5,14,10),chAdd(0xffffff,0.9),0,0.85,0.1,c.g,true);
  F.ring=new THREE.Mesh(CHRING_GEO,chAdd(hex,0.85));F.ring.position.set(0,0.06,0);c.g.add(F.ring);
  F.rays=[];const n=7+lv*2;for(let i=0;i<n;i++){const u=n>1?i/(n-1):0.5,rm=chAdd(hex,0),r=new THREE.Mesh(CHRAY_GEO,rm);rm.vertexColors=true;r.position.set((u-0.5)*0.8,0.55,0.12);const a0=(0.5-u)*1.5+rand(-0.06,0.06);r.rotation.z=a0;c.g.add(r);
    F.rays.push({m:r,w:rand(0.1,0.26),L:rand(2.2,3.6)*(1+lv*0.16),sp:rand(-0.25,0.25),a0,ph:rand(0,6)});}
  burst(c.x,y0,hex,30+lv*14,7+lv,5,0.4);burst(c.x,y0,0xffffff,14,5,3,0.3);
  sfx('chestBurst');if(best>=3||c.boss)sfx('chestEpic');
  shake(0.2+lv*0.09);G.camPunch=Math.max(G.camPunch||0,0.2+lv*0.07);G.hitstop=Math.max(G.hitstop||0,0.05+lv*0.012);
  if(best>=3){G.abilSlow=Math.max(G.abilSlow||0,0.32+(best-3)*0.18);const fl=$('chestFlash');fl.style.setProperty('--c','#'+new THREE.Color(hex).getHexString());fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on');
    if(!c.boss&&c.y<1)G.camFocus={x:c.x,t:0.85};}}
function updChestFx(dt){if(G.scene!=='tower'||G.state!=='play')return;
  for(const c of G.chests||[]){const g=c.g,sc=c.boss?1.25:1;if(c.dy>0||c.dvy)continue;
    if(!c.fx){if(G.cleared&&!c.open){const q=c.t%2.6,on=q<0.42,u=q/0.42;g.rotation.z=on?Math.sin(u*Math.PI*3)*(1-u)*0.08:0;g.position.y=c.y+(on?Math.abs(Math.sin(u*Math.PI*2))*0.06*(1-u):0);}continue;}
    const F=c.fx;if(F.ph===2)continue;F.t+=dt;
    if(F.ph===0){const k=Math.min(1,F.t/CHEST_W),q=k*k;g.position.x=c.x+Math.sin(F.t*63)*0.035*q;g.position.y=c.y;g.rotation.z=Math.sin(F.t*41)*0.07*q;g.scale.set(sc*(1+0.06*q),sc*(1-0.1*q),sc*(1+0.06*q));
      c.lid.rotation.x=-0.16*q-Math.abs(Math.sin(F.t*30))*0.07*q;c.lm.emissive.setHex(0xffd27a);c.lm.emissiveIntensity=0.8+q*4;
      c.glow.material.opacity=0.15+q*0.75;c.glow.scale.set(1.6+q*0.8,0.8+q*0.6,1+q*0.5);
      F.rat-=dt;if(F.rat<=0){F.rat=lerp(0.16,0.06,k);sfx('chestRattle');burst(c.x+rand(-0.5,0.5),c.y+0.8,0xffd27a,2+Math.round(q*5),2+q*3,1.5,0.2,-0.2);}
      if(F.t>=CHEST_W){g.position.x=c.x;g.scale.setScalar(sc);chestBurst(c);}continue;}
    const T=F.t,b=Math.exp(-T*7);F.vel+=(-1.95-F.ang)*190*dt;F.vel*=Math.exp(-11*dt);F.ang+=F.vel*dt;c.lid.rotation.x=F.ang;
    g.position.x=c.x;g.rotation.z=Math.sin(T*24)*0.04*b;g.position.y=c.y+Math.abs(Math.sin(T*9))*0.16*b;{const s=Math.cos(T*18)*b;g.scale.set(sc*(1-0.1*s),sc*(1+0.18*s),sc*(1-0.1*s));}
    c.glow.material.opacity=Math.max(0,0.9*Math.exp(-T*2.6));
    F.flash.material.opacity=Math.max(0,0.9-T*5);F.flash.scale.setScalar(1+T*9);F.flash.visible=F.flash.material.opacity>0;
    {const u=Math.min(1,T/0.75),e=1-(1-u)*(1-u);F.ring.scale.setScalar(0.3+e*(3.4+F.lv*0.7));F.ring.material.opacity=0.85*(1-u);F.ring.visible=u<1;}
    const life=1.5+F.lv*0.28,fade=T<life*0.55?1:Math.max(0,1-(T-life*0.55)/(life*0.45));
    for(const r of F.rays){const g0=Math.min(1,T/0.22),ge=1-(1-g0)*(1-g0);r.m.scale.set(r.w*(0.6+0.4*fade),r.L*ge*(0.9+Math.sin(T*9+r.ph)*0.1),1);r.m.rotation.z=r.a0+r.sp*T;r.m.material.opacity=0.55*fade*(0.75+Math.sin(T*13+r.ph)*0.25);}
    F.inner.material.opacity=0.22+0.73*Math.exp(-T*2.2)+Math.sin(T*4)*0.05;
    if(T<0.55&&Math.random()<0.75)burst(c.x+rand(-0.35,0.35),c.y+0.9,Math.random()<0.5?F.hex:0xffd27a,1+F.lv,3+F.lv*0.6,4+F.lv*0.5,0.5,0);
    if(T>life){for(const r of F.rays)r.m.visible=false;F.flash.visible=false;F.ring.visible=false;g.rotation.z=0;g.position.y=c.y;g.position.x=c.x;g.scale.setScalar(sc);F.ph=2;}}}
const _upPC=updParticles;updParticles=function(dt){_upPC(dt);updChestFx(dt);};
// mentre si apre, l'eroe resta davanti al forziere
const _upCh=update;update=function(dt){if(!(G.chests||[]).some(c=>c.fx&&c.fx.ph===0))return _upCh(dt);
  const l=input.left,r=input.right,j=input.jumpHeld,a=input.atkHeld;input.left=input.right=input.jumpHeld=input.atkHeld=input.jumpPressed=input.atkPressed=input.dashPressed=input.abilPressed=input.abil2Pressed=input.abil3Pressed=false;
  _upCh(dt);input.left=l;input.right=r;input.jumpHeld=j;input.atkHeld=a;};

/* ---------- buio: l'eroe e i proiettili di magia fanno luce ---------- */
const DK={c:null,g:null,s:0.25};
const MAGIC_LIGHT={bolt:p=>p.col||0xb48cff,orb:()=>0xd7a8ff,fire:()=>0xff7a2e,meteor:()=>0xff7a2e,wave:p=>p.col||0x7ff0e4};
function drawDark(){if(!DK.c){DK.c=document.createElement('canvas');DK.g=DK.c.getContext('2d');$('darkFx').appendChild(DK.c);}
  const S_=DK.s,w=Math.ceil(innerWidth*S_),h=Math.ceil(innerHeight*S_),g=DK.g;if(DK.c.width!==w||DK.c.height!==h){DK.c.width=w;DK.c.height=h;}
  g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);g.fillStyle='rgba(4,3,8,.97)';g.fillRect(0,0,w,h);
  const hole=(x,y,r0,r1,a)=>{const gr=g.createRadialGradient(x,y,r0,x,y,r1);gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r1,y-r1,r1*2,r1*2);};
  g.globalCompositeOperation='destination-out';const [hx,hy]=toScreen(P.x,P.y+1,0);hole(hx*S_,hy*S_,110*S_,250*S_,1);
  const k=clamp(innerHeight/720,0.6,1.6),lights=[];
  for(const p of G.projs){if(p.dead||!MAGIC_LIGHT[p.kind])continue;const [x,y]=toScreen(p.x,p.y,0),big=p.kind==='meteor'?1.8:p.kind==='fire'?1.2:1;lights.push([x*S_,y*S_,big]);hole(x*S_,y*S_,26*k*big*S_,150*k*big*S_,0.96);lights[lights.length-1].push(MAGIC_LIGHT[p.kind](p));}
  g.globalCompositeOperation='source-over';
  for(const [x,y,big,col] of lights){const r=120*k*big*S_,gr=g.createRadialGradient(x,y,0,x,y,r),c='#'+new THREE.Color(col).getHexString();gr.addColorStop(0,c+'55');gr.addColorStop(1,c+'00');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}}

/* ---------- schermo acceso finché giochi o sei in gruppo: se il telefono si spegne la connessione cade ---------- */
const WL={s:null,busy:false};
async function wakeSync(){if(!('wakeLock' in navigator))return;const want=!document.hidden&&(MP.on||!!MP.peer||!!MP.reco||G.scene==='tower');
  if(want&&!WL.s&&!WL.busy){WL.busy=true;try{WL.s=await navigator.wakeLock.request('screen');WL.s.addEventListener('release',()=>{WL.s=null;});}catch(e){}WL.busy=false;}
  else if(!want&&WL.s){try{WL.s.release();}catch(e){}WL.s=null;}}
setInterval(wakeSync,2500);document.addEventListener('visibilitychange',wakeSync);


/* ---------- ACCOUNT SUBITO: al primo accesso il nome si sceglie insieme alla password ----------
   'first'   = primo accesso: nome + password, l'account si crea subito
   'account' = hai già un nome ma non l'account: all'apertura del gioco te lo chiede (puoi rimandare)
   'change' / 'name' = come prima (cambio nome, oppure account non attivi) */
const NG={mode:'name'},NG_LEAD=document.querySelector('#nameGate .ig-lead').innerHTML;
function ngModeUi(){const pw=NG.mode==='first'||NG.mode==='account';$('ngPass').hidden=!pw;$('ngPass').value='';$('ngIn').readOnly=NG.mode==='account';
  $('ngOk').textContent=pw?'Crea account':'Conferma';$('ngCancel').textContent=NG.mode==='account'?'Più tardi':'Annulla';
  document.querySelector('#nameGate .ig-lead').innerHTML=NG.mode==='first'?'Scegli nome e password: crei subito il tuo account e ritrovi i progressi su tutti i tuoi dispositivi. Ogni giocatore ha un nome diverso.'
    :NG.mode==='account'?'Non hai ancora un account: scegli una password per salvare i tuoi progressi e ritrovarli su tutti i tuoi dispositivi. Ci vuole un attimo.':NG_LEAD;}
const _openNG=openNameGate;
openNameGate=function(change){_openNG(change);NG.mode=change?'change':(authOn()&&!logged()&&fbOn()?'first':'name');ngModeUi();};
function openAccountAsk(){const g=$('nameGate');g.hidden=false;NG.mode='account';$('ngIn').value=MP.name();$('ngMsg').textContent='';$('ngSug').hidden=true;
  $('ngTitle').textContent='Crea il tuo account';$('ngCancel').hidden=false;ngModeUi();setTimeout(()=>$('ngPass').focus(),80);}
const _confirmNG=confirmName;
confirmName=async function(n){if(NG.mode!=='first'&&NG.mode!=='account')return _confirmNG(n);
  n=(n||'').trim().replace(/\s+/g,' ');const p=$('ngPass').value,msg=$('ngMsg'),ok=$('ngOk');
  if(n.length<3||n.length>14){msg.textContent='Il nome deve avere da 3 a 14 caratteri.';return;}
  if(!/^[A-Za-z0-9À-ÿ _-]+$/.test(n)){msg.textContent='Usa solo lettere, numeri, spazi, - e _.';return;}
  if(p.length<6){msg.textContent='La password deve avere almeno 6 caratteri.';$('ngPass').focus();return;}
  ok.disabled=true;msg.textContent='Creo l\'account…';$('ngSug').hidden=true;
  try{if(!(await nameFree(n))){msg.textContent=`«${n}» è già usato da un altro giocatore.`;const s=NG.mode==='first'?await suggestName(n):null;
      if(s){$('ngSug').hidden=false;$('ngSug').textContent=`Usa «${s}»`;$('ngSug').onclick=()=>{$('ngIn').value=s;confirmName(s);};}return;}
    const d=await authCall('signUp',{email:emailOf(n),password:p,returnSecureToken:true});setAuth(d,n);
    await fbPut('names/'+encodeURIComponent(nameKey(n)),PID);store.set('mpname',n);store.set('nameok',true);
    await cloudSave('overwrite');$('ngPass').value='';msg.textContent='';$('nameGate').hidden=true;NG.mode='name';renderAccount();mpUi();heartbeat();
    toast(`Benvenuto, ${n}`,'Account creato: accedi con questo nome e password sugli altri dispositivi');}
  catch(e){msg.textContent=/Esiste già/.test(e.message)?'Esiste già un account con questo nome: se è tuo tocca «Accedi» qui sotto.':e.message;}
  finally{ok.disabled=false;}};
$('ngPass').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();confirmName($('ngIn').value);}});
$('ngIn').addEventListener('keydown',e=>{if(e.key==='Enter'&&(NG.mode==='first')&&!$('ngPass').value){e.preventDefault();e.stopImmediatePropagation();$('ngPass').focus();}},true);
$('ngCancel').addEventListener('click',()=>{if(NG.mode==='account')toast('Va bene','Puoi crearlo quando vuoi dal menu Account');NG.mode='name';});
// chi ha già un nome ma non l'account: glielo chiede ogni volta che apre il gioco
setTimeout(()=>{if(authOn()&&!logged()&&fbOn()&&store.get('mpname','')&&store.get('nameok',false)&&$('nameGate').hidden)openAccountAsk();},3000);
