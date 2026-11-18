/* =========================================================
   PvP a round con conto alla rovescia, arena piccola; nome unico
   del giocatore; sezione Amici (statistiche, inviti, ricerca)
   ========================================================= */

/* ---------- arena PvP più piccola ---------- */
let PVA={l:-8,r:8,c:0};
function pvpSpawnXNew(){const t=pvpTeamOf(MP.myPid)||0,mates=Object.keys(PV.teams).filter(k=>PV.teams[k]===t).map(Number).sort((a,b)=>a-b),off=Math.max(0,mates.indexOf(MP.myPid))*1.4;
  return t===0?PVA.l+1.6+off:PVA.r-1.6-off;}
pvpSpawnX=pvpSpawnXNew;
const _paS=pvpArena;
pvpArena=function(){const L=-HALF+0.6,R=GATE_X-0.5,c=(L+R)/2;PVA={l:c-8.5,r:c+8.5,c};G.bounds.left=PVA.l;
  _paS();
  const wm=new THREE.MeshBasicMaterial({color:0x7ff0e4,transparent:true,opacity:0.22,depthWrite:false,blending:THREE.AdditiveBlending});
  for(const x of [PVA.l-0.15,PVA.r+0.15]){mesh(rbox(0.25,CEIL,3.2,0.05),wm,x,CEIL/2,0,levelGroup,true);for(let y=0.5;y<CEIL;y+=1.2)mesh(rbox(0.3,0.06,3.3,0.02),new THREE.MeshBasicMaterial({color:0x7ff0e4}),x,y,0,levelGroup,true);}
  // i barili e i forzieri fuori dall'arena non servono
  for(const b of G.barrels||[]){if(b.g.position.x<PVA.l||b.g.position.x>PVA.r){b.dead=true;levelGroup.remove(b.g);}}
  pvpRound();};
/* ---------- conto alla rovescia e round: dopo ogni caduta tutti tornano in posizione ---------- */
function pvpTeamDown(){const by={};for(const k in PV.teams){const t=PV.teams[k];by[t]=by[t]||(((PV.lives[k]||0)>0)&&!(PV.down&&PV.down[k]));}return Object.values(by).some(v=>!v);}
function pvpRound(){if(!PV.on)return;clearTimeout(PV.rt);PV.pending=false;PV.down={};const me=MP.myPid,alive=(PV.lives[me]||0)>0;
  if(alive){if(P.dead)mpRevive();Object.assign(P,{z:0,hp:S.maxHp,stam:S.stamMax,x:pvpSpawnX(),y:0,vx:0,vy:0,atk:null,dot:null,slowT:0,invul:0,dashT:0,shieldT:0,chargeT:0,spinT:0});P.face=P.x<PVA.c?1:-1;if(hero)hero.root.rotation.z=0;$('deathFx').classList.remove('on');}
  for(const p of G.projs)p.dead=true;
  G.state='pvpwait';clearInput();$('touch').hidden=true;showMeds(false);pvpHud();
  const el=$('pvpCount');let n=3;el.hidden=false;
  const tick=()=>{if(!PV.on){el.hidden=true;return;}
    el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');
    if(n>0){el.textContent=n;sfx('ui');n--;PV.rt=setTimeout(tick,1000);}
    else{el.textContent='VIA!';sfx('slam');shake(0.2);if(G.state==='pvpwait')G.state='play';$('touch').hidden=!isTouch;showMeds(true);canvas.focus();PV.rt=setTimeout(()=>{el.hidden=true;},700);}};
  tick();}
pvpDie=function(){_playerDie();G.overT=1e9;const me=MP.myPid;PV.lives[me]=Math.max(0,(PV.lives[me]||1)-1);
  MP.send({t:'pvpdie',pid:me,lives:PV.lives[me],by:PV.lastBy});pvpHud();
  (PV.down=PV.down||{})[me]=true;toast(PV.lives[me]>0?'Sei stato abbattuto':'Eliminato',PV.lives[me]>0?(PV.mode==='2v2'?`Vite rimaste: ${PV.lives[me]} · aspetti la fine del round`:`Vite rimaste: ${PV.lives[me]} · nuovo round tra poco`):'Guarda come va a finire');
  if(MP.host)pvpCheck();};
const _pcS=pvpCheck;
pvpCheck=function(){_pcS();if(MP.host&&PV.on&&!PV.pending&&pvpTeamDown()){PV.pending=true;clearTimeout(PV.rt2);PV.rt2=setTimeout(()=>{if(!PV.on)return;MP.bcast({t:'pvpround'});pvpRound();},1700);}};
const _pvEndS=pvpEnd;
pvpEnd=function(w){clearTimeout(PV.rt);clearTimeout(PV.rt2);$('pvpCount').hidden=true;return _pvEndS(w);};

/* ---------- nome del giocatore (unico) ---------- */
const nameKey=n=>String(n).toLowerCase().trim().replace(/[.#$\[\]\/]/g,'').replace(/\s+/g,'_');
MP.name=()=>(store.get('mpname','')||'Giocatore').slice(0,14);
async function fbPut(path,v){return fbPost(path,v,'PUT');}
async function fbPatch(path,v){return fbPost(path,v,'PATCH');}
async function fbDel(path){const r=await fetch(`${FB_URL.replace(/\/$/,'')}/${path}.json`,{method:'DELETE'});return r.ok;}
async function nameFree(n){const v=await fbGet('names/'+encodeURIComponent(nameKey(n)));return v==null||v===PID;}
async function suggestName(n){const base=n.replace(/\d+$/,'').slice(0,11);
  for(let i=0;i<8;i++){const c=base+(i<4?Math.floor(Math.random()*90+10):Math.floor(Math.random()*900+100));if(await nameFree(c))return c;}return null;}
function openNameGate(change){const g=$('nameGate');g.hidden=false;$('ngIn').value=change?MP.name():'';$('ngMsg').textContent='';$('ngSug').hidden=true;
  $('ngTitle').textContent=change?'Cambia il tuo nome':'Come ti chiami?';$('ngCancel').hidden=!change;setTimeout(()=>$('ngIn').focus(),80);}
async function confirmName(n){n=(n||'').trim().replace(/\s+/g,' ');const msg=$('ngMsg'),ok=$('ngOk');
  if(n.length<3||n.length>14){msg.textContent='Il nome deve avere da 3 a 14 caratteri.';return;}
  if(!/^[A-Za-z0-9À-ÿ _-]+$/.test(n)){msg.textContent='Usa solo lettere, numeri, spazi, - e _.';return;}
  if(n===MP.name()&&store.get('nameok',false)){$('nameGate').hidden=true;return;}
  ok.disabled=true;msg.textContent='Controllo che sia libero…';$('ngSug').hidden=true;
  try{
    if(fbOn()){if(!(await nameFree(n))){const s=await suggestName(n);msg.textContent=`«${n}» è già usato da un altro giocatore.`;
        if(s){$('ngSug').hidden=false;$('ngSug').textContent=`Usa «${s}»`;$('ngSug').onclick=()=>{$('ngIn').value=s;confirmName(s);};}ok.disabled=false;return;}
      await fbPut('names/'+encodeURIComponent(nameKey(n)),PID);
      if((await fbGet('names/'+encodeURIComponent(nameKey(n))))!==PID){msg.textContent='Qualcuno l\'ha appena preso, riprova.';ok.disabled=false;return;}}
    store.set('mpname',n);store.set('nameok',true);$('nameGate').hidden=true;toast('Benvenuto, '+n,'Questo nome comparirà in classifica e agli amici');heartbeat();mpUi();
  }catch(e){store.set('mpname',n);store.set('nameok',false);$('nameGate').hidden=true;toast('Nome salvato','Lo confermo online appena c\'è connessione');}
  ok.disabled=false;}
$('ngOk').onclick=()=>confirmName($('ngIn').value);
$('ngIn').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')confirmName($('ngIn').value);});
$('ngCancel').onclick=()=>{$('nameGate').hidden=true;};
// riprova a confermare online un nome salvato senza connessione
setTimeout(async()=>{if(!store.get('mpname',''))openNameGate(false);
  else if(!store.get('nameok',false)&&fbOn()){try{const n=MP.name();if(await nameFree(n)){await fbPut('names/'+encodeURIComponent(nameKey(n)),PID);store.set('nameok',true);}else{openNameGate(false);$('ngIn').value=n;$('ngMsg').textContent=`«${n}» è già usato da un altro giocatore: scegline uno nuovo.`;const sg=await suggestName(n);if(sg){$('ngSug').hidden=false;$('ngSug').textContent=`Usa «${sg}»`;$('ngSug').onclick=()=>{$('ngIn').value=sg;confirmName(sg);};}}}catch(e){}}},400);

/* ---------- presenza online e statistiche pubbliche ---------- */
function heartbeat(){if(!fbOn()||!store.get('nameok',false))return;const k=nameKey(MP.name());
  fbPatch('players/'+encodeURIComponent(k),{n:MP.name(),pid:PID,t:Date.now(),best:STATS.best||0,cls:G.cls?G.cls.name:'',runs:STATS.runs||0,kills:STATS.kills||0,pvp:RATING.r,tier:tierOf(RATING.r)}).catch(()=>{});}
setInterval(heartbeat,45000);setTimeout(heartbeat,3000);
const isOnline=p=>p&&p.t&&Date.now()-p.t<120000;

/* ---------- sezione Amici ---------- */
let FRIENDS=store.get('friends',[]);const saveFriends=()=>store.set('friends',FRIENDS);
let frTab='amici';
function openFriends(tab){if(G.state!=='cellar')return;G.state='friends';clearInput();['prompt','bUse','touch'].forEach(id=>$(id).hidden=true);frTab=tab||'amici';$('friends').hidden=false;renderFriends();}
function closeFriends(){$('friends').hidden=true;if(G.state==='friends'){G.state='cellar';$('touch').hidden=!isTouch;canvas.focus();}}
function statLine(p){return `Piano max ${p.best||0}${p.cls?' · '+esc(p.cls):''} · ${p.runs||0} scalate · ${p.kills||0} nemici · ${esc(p.tier||tierOf(p.pvp||1000))}`;}
async function renderFriends(){for(const b of document.querySelectorAll('#friends .tab'))b.setAttribute('aria-selected',b.dataset.ft===frTab);
  $('frMe').innerHTML=`Il tuo nome: <b>${esc(MP.name())}</b> <button class="mini" id="frRename">Cambia</button>`;$('frRename').onclick=()=>openNameGate(true);
  const box=$('frBody');
  if(frTab==='gruppo'){closeFriends();openCoop();return;}
  if(!fbOn()){box.innerHTML='<p class="note">La parte online non è collegata.</p>';return;}
  if(frTab==='amici'){
    const pendHtml=FRPEND.length?`<div class="bd-h">Richieste in attesa</div>`+FRPEND.map(f=>`<div class="fr-r"><span class="dot"></span><div><b>${esc(f.n)}</b><small>Aspetta che accetti</small></div><button class="mini del" data-unp="${esc(f.k)}">Annulla</button></div>`).join(''):'';
    if(!FRIENDS.length){box.innerHTML='<p class="note">Non hai ancora amici: cercali per nome nella scheda «Cerca».</p>'+pendHtml;return;}
    box.innerHTML='<p class="note">Carico…</p>';
    const rows=await Promise.all(FRIENDS.map(async f=>{try{return {f,p:await fbGet('players/'+encodeURIComponent(f.k))};}catch(e){return {f,p:null};}}));
    rows.sort((a,b)=>((isOnline(b.p)?1:0)+(specCan(b.p)?2:0))-((isOnline(a.p)?1:0)+(specCan(a.p)?2:0)));
    box.innerHTML=rows.map(({f,p})=>`<div class="fr-r"><span class="dot${isOnline(p)?' on':''}"></span><div><span class="fr-n"><b>${esc((p&&p.n)||f.n)}</b>${specEyeHtml(f.k,p)}</span><small>${p?statLine(p):'Nessuna statistica'}</small></div>
      <button class="mini" data-inv="${esc(f.k)}" ${isOnline(p)?'':'disabled'}>Invita</button><button class="mini del" data-rm="${esc(f.k)}">Togli</button></div>`).join('')+pendHtml;}
  else{box.innerHTML=`<div class="fr-search"><input id="frQ" placeholder="Nome del giocatore" maxlength="14" autocomplete="off"><button class="ghost" id="frGo">Cerca</button></div><div id="frRes"></div>`;
    const go=async()=>{const q=nameKey($('frQ').value);const res=$('frRes');if(q.length<2){res.innerHTML='<p class="note">Scrivi almeno 2 lettere.</p>';return;}res.innerHTML='<p class="note">Cerco…</p>';
      try{const d=await fbGet('players',`orderBy=${encodeURIComponent('"$key"')}&startAt=${encodeURIComponent(JSON.stringify(q))}&endAt=${encodeURIComponent(JSON.stringify(q+''))}&limitToFirst=15`)||{};
        const me=nameKey(MP.name()),list=Object.entries(d).filter(([k])=>k!==me);
        res.innerHTML=list.length?list.map(([k,p])=>{const fr=FRIENDS.some(f=>f.k===k);return `<div class="fr-r"><span class="dot${isOnline(p)?' on':''}"></span><div><b>${esc(p.n||k)}</b><small>${statLine(p)}</small></div>
          <button class="mini" data-add="${esc(k)}" data-n="${esc(p.n||k)}" ${fr||pend(k)?'disabled':''}>${fr?'Già amico':pend(k)?'Richiesta inviata':'Aggiungi'}</button></div>`;}).join(''):'<p class="note">Nessun giocatore con questo nome.</p>';}
      catch(e){res.innerHTML='<p class="note">Ricerca non riuscita. Controlla la connessione.</p>';}};
    $('frGo').onclick=go;$('frQ').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')go();});setTimeout(()=>$('frQ').focus(),60);}}
$('friends').addEventListener('click',async e=>{const t=e.target.closest('.tab');if(t){frTab=t.dataset.ft;sfx('ui');renderFriends();return;}
  const sp=e.target.closest('[data-spec]');if(sp){specStart(sp.dataset.spec,sp.dataset.n);return;}
  const a=e.target.closest('[data-add]');if(a){a.disabled=true;a.textContent='Invio…';const ok=await sendFriendReq(a.dataset.add,a.dataset.n);a.textContent=ok?'Richiesta inviata':'Riprova';a.disabled=ok;return;}
  const u=e.target.closest('[data-unp]');if(u){FRPEND=FRPEND.filter(f=>f.k!==u.dataset.unp);saveFrPend();fbDel(`invites/${encodeURIComponent(u.dataset.unp)}/${encodeURIComponent(nameKey(MP.name())+'__f')}`).catch(()=>{});renderFriends();return;}
  const r=e.target.closest('[data-rm]');if(r){FRIENDS=FRIENDS.filter(f=>f.k!==r.dataset.rm);saveFriends();sfx('ui');renderFriends();return;}
  const i=e.target.closest('[data-inv]');if(i){i.disabled=true;i.textContent='Invito…';await inviteFriend(i.dataset.inv);i.textContent='Invitato';}});
$('frClose').onclick=()=>{sfx('ui');closeFriends();};
async function inviteFriend(k){
  if(!(MP.on&&MP.host)){mpHost();for(let i=0;i<40&&!(MP.on&&MP.code);i++)await new Promise(r=>setTimeout(r,250));}
  if(!MP.code){toast('Invito non riuscito','Non riesco a creare il gruppo');return;}
  try{await fbPut(`invites/${encodeURIComponent(k)}/${encodeURIComponent(nameKey(MP.name()))}`,{n:MP.name(),code:MP.code,t:Date.now()});toast('Invito mandato','Vale 2 minuti: non serve restare nella schermata Amici');}
  catch(e){toast('Invito non riuscito','Controlla la connessione');}}
/* ---------- richieste d'amicizia: diventate amici solo quando l'altro accetta ---------- */
let FRPEND=store.get('frpend',[]);const saveFrPend=()=>store.set('frpend',FRPEND);const pend=k=>FRPEND.some(f=>f.k===k);
async function sendFriendReq(k,n){try{await fbPut(`invites/${encodeURIComponent(k)}/${encodeURIComponent(nameKey(MP.name())+'__f')}`,{n:MP.name(),t:Date.now()});
  if(!pend(k)){FRPEND.push({k,n});saveFrPend();}sfx('pick');toast('Richiesta inviata',`Diventerete amici quando ${n} accetta`);return true;}catch(e){toast('Richiesta non inviata','Controlla la connessione');return false;}}
/* ---------- inviti ricevuti ---------- */
let invShown={};
// invito accettato mentre non si è nel seminterrato: si entra nel gruppo appena ci si torna, finché l'invito è valido (2 minuti)
let INV_WAIT=null;
setInterval(()=>{const w=INV_WAIT;if(!w)return;if(Date.now()-w.t>120000){INV_WAIT=null;return;}if(G.state==='cellar'&&!MP.live()){INV_WAIT=null;w.go();}},1000);
setInterval(async()=>{if(!fbOn()||!store.get('nameok',false)||!$('inviteBox').hidden)return;const me=nameKey(MP.name());
  try{const d=await fbGet('invites/'+encodeURIComponent(me));if(!d)return;
    for(const [from,v] of Object.entries(d)){if(from.endsWith('__r'))continue;const kind=from.endsWith('__f')?'f':from.endsWith('__a')?'a':'g',who=kind==='g'?from:from.slice(0,-3),del=()=>fbDel(`invites/${encodeURIComponent(me)}/${encodeURIComponent(from)}`).catch(()=>{});
      if(!v||Date.now()-v.t>(kind==='g'?120000:7*864e5)){del();continue;}
      if(kind==='a'){del();if(!FRIENDS.some(f=>f.k===who)){FRIENDS.push({k:who,n:v.n});saveFriends();}FRPEND=FRPEND.filter(f=>f.k!==who);saveFrPend();toast('Nuovo amico!',`${v.n} ha accettato la tua richiesta`);sfx('lvl');if(G.state==='friends')renderFriends();continue;}
      if(kind==='f'&&FRIENDS.some(f=>f.k===who)){del();fbPut(`invites/${encodeURIComponent(who)}/${encodeURIComponent(me+'__a')}`,{n:MP.name(),t:Date.now()}).catch(()=>{});continue;}
      if(invShown[from+v.t])continue;invShown[from+v.t]=1;
      if(kind==='f'){$('invText').textContent=`${v.n} vuole essere tuo amico`;$('invYes').textContent='Accetta';$('invNo').textContent='Rifiuta';$('inviteBox').hidden=false;sfx('lvl');
        $('invYes').onclick=()=>{$('inviteBox').hidden=true;del();if(!FRIENDS.some(f=>f.k===who)){FRIENDS.push({k:who,n:v.n});saveFriends();}
          FRPEND=FRPEND.filter(f=>f.k!==who);saveFrPend();fbPut(`invites/${encodeURIComponent(who)}/${encodeURIComponent(me+'__a')}`,{n:MP.name(),t:Date.now()}).catch(()=>{});
          toast('Nuovo amico!',`Tu e ${v.n} ora siete amici`);if(G.state==='friends')renderFriends();};
        $('invNo').onclick=()=>{$('inviteBox').hidden=true;del();};break;}
      $('invYes').textContent='Entra';$('invNo').textContent='No, grazie';
      $('invText').textContent=`${v.n} ti invita nel suo gruppo`;$('inviteBox').hidden=false;sfx('lvl');
      $('invYes').onclick=()=>{$('inviteBox').hidden=true;fbDel(`invites/${encodeURIComponent(me)}/${encodeURIComponent(from)}`).catch(()=>{});
        const go=()=>{if(G.state==='friends')closeFriends();if(G.state==='cellar')openCoop();$('coopCode').value=v.code;mpJoin();};
        if(G.state!=='cellar'&&G.state!=='friends'&&G.state!=='coop'){INV_WAIT={t:v.t,go};toast('Torna al seminterrato',`Entri nel gruppo di ${v.n} appena ci arrivi: l'invito vale 2 minuti`);return;}
        go();};
      $('invNo').onclick=()=>{$('inviteBox').hidden=true;fbDel(`invites/${encodeURIComponent(me)}/${encodeURIComponent(from)}`).catch(()=>{});};
      break;}}catch(e){}},8000);
/* ---------- il pulsante in alto diventa «Amici» ---------- */
$('coopBtn').onclick=()=>{sfx('ui');openFriends('amici');};
const _mpUiS=mpUi;
mpUi=function(){_mpUiS();const b=$('coopBtn');b.textContent=MP.live()?`Amici · gruppo da ${MP.count()}`:'Amici';};
mpUi();
$('onCoop').onclick=()=>{sfx('ui');closeOnline();openCoop();};
addEventListener('keydown',e=>{if(e.key==='Escape'&&G.state==='friends'){e.preventDefault();closeFriends();}},true);
const _padBackS=padBack;padBack=function(){for(const id of ['frClose','ngCancel','invNo']){const b=$(id);if(b&&b.offsetParent!==null&&!b.closest('[hidden]')){b.click();return true;}}return _padBackS();};
const _mpMsgS=mpMsg;
mpMsg=function(m,from){if(m.t==='pvpround'){if(!MP.host)pvpRound();return;}return _mpMsgS(m,from);};
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{openFriends,openNameGate,pvpRound,PVA:()=>PVA,mpMsg:(m,f)=>mpMsg(m,f)});

/* ---------- lance, asce e falci impugnate più verso il centro, non all'estremità ---------- */
const GRIP_F={lancia:0.42,ascia:0.3,falce:0.32};
function centerSpear(a,f){try{if(!a||!a.g)return a;const g=a.g;g.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(g);if(!isFinite(box.min.y)||!isFinite(box.max.y))return a;
  const tipY=a.tip?a.tip.position.y:box.max.y,point=tipY>=0?box.max.y:box.min.y,butt=tipY>=0?box.min.y:box.max.y;
  const p=butt+(point-butt)*(f||0.42);   // la mano sta poco dietro il centro, verso il fondo dell'asta
  if(Math.abs(p)<0.05)return a;for(const c of g.children)c.position.y-=p;g.userData.gripShift=p;
  const bm=new THREE.Object3D();bm.position.y=butt-p;g.add(bm);g.userData.butt=bm;}catch(e){}return a;}
const _bwmT=buildWeaponMesh;
buildWeaponMesh=function(type,rarity,effect){const a=_bwmT(type,rarity,effect);return GRIP_F[type]?centerSpear(a,GRIP_F[type]):a;};
const _bw2T=buildWeapon2;
buildWeapon2=function(type,v,rarity,effect,hero){const a=_bw2T(type,v,rarity,effect,hero);return GRIP_F[type]&&WEAPONS[type]?centerSpear(a,GRIP_F[type]):a;};
if(hero&&G.weapon&&GRIP_F[G.weapon.type])attachWeapon();

/* ---------- le mosse speciali dei compagni si vedono anche sugli altri schermi (solo effetti, niente danni doppi) ---------- */
MP.ghost=false;MP.ghostR=null;
function ghostRun(R,fn){if(!R||!R.hero||!R.cls)return;
  const csv=camShake.v,bkP=Object.assign({},P),gH=hero,gW=G.weapon,gC=G.cls,gIn=G.inAbil,slow=G.abilSlow,hs=G.hitstop,cp=G.camPunch,prevR=MP.ghostR,prevG=MP.ghost;
  Object.assign(P,{x:R.tx!=null?R.tx:R.x,y:R.ty!=null?R.ty:R.y,z:0,face:R.face||1,vx:0,vy:0,dead:false,atk:null});
  hero=R.hero;G.weapon=R.wobj||G.weapon;G.cls=R.cls;MP.ghost=true;MP.ghostR=R;
  try{fn();}catch(e){}
  finally{MP.ghost=prevG;MP.ghostR=prevR;for(const k of Object.keys(P))if(!(k in bkP))delete P[k];Object.assign(P,bkP);
    hero=gH;G.weapon=gW;G.cls=gC;G.inAbil=gIn;G.abilSlow=slow;G.hitstop=hs;G.camPunch=cp;camShake.v=Math.max(csv,Math.min(camShake.v,0.12));}}
// durante la replica: nessun danno, nessuna ferita, proiettili e zone innocui
const _hitG=hitEnemy;hitEnemy=function(e,base,dir,o){if(MP.ghost||!(base>0))return false;return _hitG(e,base,dir,o);};
const _hurtG=hurtPlayer;hurtPlayer=function(d,fx,eff){if(MP.ghost)return;return _hurtG(d,fx,eff);};
const _spG=spawnProj;spawnProj=function(o){if(MP.ghost&&o&&o.owner!=='e'){o.dmg=0;o.effect=null;o.ghost=true;}return _spG(o);};
const _azG=addZone;addZone=function(z){if(MP.ghost&&z){z.dmg=0;z.eff=null;z.pull=false;}return _azG(z);};
const _laterG=later;later=function(t,fn){if(MP.ghost){const R=MP.ghostR;return _laterG(t,()=>ghostRun(R,fn));}return _laterG(t,fn);};
function replayAbility(R,n,id){if(!R||!mpVisible(R)||!R.cls)return;const ab=R.cls[SLOT[n].k];if(!ab||ab.id!==id)return;
  ghostRun(R,()=>{G.inAbil=true;try{abilityFx(n,ab);doAbility(ab.id);}finally{G.inAbil=false;}});
  for(const id2 of ['abilSplash','abilFlash'])$(id2).classList.remove('on','big');   // il nome grande a schermo resta solo per le tue mosse
  popNum(R.x,R.y+3,ab.name,'info');}
const _usG=useSlot;
useSlot=function(n){const k=SLOT[n]&&SLOT[n].cd,before=k?P[k]:0;_usG(n);
  if(MP.live()&&k&&P[k]>0&&!(before>0)&&G.cls[SLOT[n].k])MP.send({t:'afx',pid:MP.myPid,n,id:G.cls[SLOT[n].k].id});};
const _mpMsgG=mpMsg;
mpMsg=function(m,from){if(m.t==='afx'){const pid=MP.host?from:m.pid;if(MP.host){m.pid=pid;MP.bcast(m,pid);}if(pid!==MP.myPid)replayAbility(MP.players.get(pid),m.n,m.id);return;}return _mpMsgG(m,from);};
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{replayAbility:(pid,n,id)=>replayAbility(MP.players.get(pid),n,id),CLASSES});

/* ---------- pulizia: corpi, pezzi e sangue spariscono dopo un po' per non appesantire il gioco ---------- */
const CORPSE_T=5,CORPSE_BOSS_T=9,CHUNK_T=4;
const _ucT=updCorpses;
updCorpses=function(dt){_ucT(dt);let any=false;
  for(const c of G.corpses){const life=c.e.type==='boss'?CORPSE_BOSS_T:CORPSE_T;if(c.t<life)continue;const r=c.e.parts.root,k=Math.min(1,(c.t-life)/1.2);
    r.position.y=c.e.y+(c.e.parts.rig?0.2*(c.e.sc||1):c.e.w*0.45)-k*1.4;   // il corpo sprofonda nel pavimento
    if(k>=1){scene.remove(r);disposeObj(r);c.gone=true;any=true;}}
  if(any)G.corpses=G.corpses.filter(c=>!c.gone);};
const _uchT=updChunks;
updChunks=function(dt){_uchT(dt);let any=false;
  for(const c of G.chunks){if(c.dead||c.t<CHUNK_T)continue;c.m.scale.multiplyScalar(Math.pow(0.02,dt));if(c.t>CHUNK_T+1){scene.remove(c.m);c.dead=true;any=true;}}
  if(any||G.chunks.some(c=>c.dead))G.chunks=G.chunks.filter(c=>!c.dead);};

/* ---------- modalità Orda: i guardiani vanno solo sconfitti, senza ricompense ---------- */
const _keH=killEnemy;
killEnemy=function(e){
  if(!(G.horde&&e&&e.type==='boss'&&!e.dead))return _keH(e);
  const sc=spawnCage,uc=unlockClass,dx=dropXP;spawnCage=()=>{};unlockClass=()=>{};dropXP=()=>{};
  try{return _keH(e);}finally{spawnCage=sc;unlockClass=uc;dropXP=dx;G.bossChestT=0;G.cage=null;
    const fm=$('fightMsg');if(fm){fm.textContent='Guardiano sconfitto!';fm.classList.remove('on');void fm.offsetWidth;fm.classList.add('on');}}};

/* =========================================================
   MONETE E NEGOZIO DEL MERCANTE (seminterrato)
   ========================================================= */
const COINS=Object.assign({n:0},store.get('coins',{}));const saveCoins=()=>store.set('coins',COINS);
const fmtC=n=>n.toLocaleString('it-IT');
function addCoins(n,x,y){n=Math.round(n);if(n<=0)return;COINS.n+=n;saveCoins();if(x!=null){popNum(x,y,'+'+n+' ◆','gem');burst(x,y-0.6,0xff2a4a,10,4,2);}coinHud();}
function coinHud(){for(const el of document.querySelectorAll('.coin-chip b'))el.textContent=fmtC(COINS.n);}
/* ---------- TRIBUTO: i rubini spesi dagli altri giocatori (shop e mercante errante) vanno a «zero» ----------
   Chi compra lascia una busta nella casella di zero (invites/zero/<nome>_<ora>__r): niente regole Firebase nuove.
   Se in quel momento non c'è connessione, i rubini restano in attesa su questo dispositivo e partono appena si può.
   Il gioco di zero, ogni 15 secondi, apre le buste, le cancella e solo dopo aggiunge i rubini (così non li conta due volte). */
const TRIB_TO='zero';
const isTribTo=()=>nameKey(MP.name())===TRIB_TO&&store.get('nameok',false);
let TRIB=+store.get('tribpend',0)||0,tribBusy=false;
function tributo(n){n=Math.round(+n||0);if(n<=0||isTribTo())return;TRIB+=n;store.set('tribpend',TRIB);tribFlush();}
async function tribFlush(){if(tribBusy||TRIB<=0||!fbOn())return;tribBusy=true;const n=TRIB,me=MP.name(),t=Date.now();
  try{await fbPut(`invites/${encodeURIComponent(TRIB_TO)}/${encodeURIComponent(nameKey(me)+'_'+t+'__r')}`,{n:me,r:n,t});
    TRIB=Math.max(0,TRIB-n);store.set('tribpend',TRIB);}catch(e){}finally{tribBusy=false;}}
setInterval(tribFlush,60000);setTimeout(tribFlush,4000);
async function tribCollect(){if(!fbOn()||!isTribTo())return;
  try{const d=await fbGet('invites/'+encodeURIComponent(TRIB_TO));if(!d)return;let tot=0;const da=new Set();
    for(const [k,v] of Object.entries(d)){if(!k.endsWith('__r'))continue;const r=Math.round(+(v&&v.r)||0);
      if(!(await fbDel(`invites/${encodeURIComponent(TRIB_TO)}/${encodeURIComponent(k)}`).catch(()=>false)))continue;
      if(r>0&&r<=1e6){tot+=r;if(v.n)da.add(String(v.n).slice(0,14));}}
    if(tot>0){addCoins(tot);sfx('pick');const l=[...da];toast(`+${fmtC(tot)} rubini`,l.length?'Spesi nello shop da '+(l.length>2?l.slice(0,2).join(', ')+` e altri ${l.length-2}`:l.join(' e ')):'Spesi nello shop dagli altri giocatori');}}
  catch(e){}}
setInterval(tribCollect,15000);setTimeout(tribCollect,5000);
(function(){const mk=()=>{const d=document.createElement('div');d.className='coin-chip';d.innerHTML='<i class="cn" aria-hidden="true"></i> <b>0</b>';d.title='Rubini';return d;};
  const hr=document.querySelector('.hud-right');if(hr)hr.insertBefore(mk(),hr.firstChild);
  const ch=$('cellarHud');if(ch){const b=$('coopBtn');ch.insertBefore(mk(),b);}coinHud();})();
// rubini (la valuta del negozio): barili (1 su 3), casse, casse dei guardiani, élite con nome
const _ocS=openChest;
openChest=function(c){const was=c&&c.open;const r=_ocS(c);if(c&&!was&&c.open&&!G.tutorial){const f=G.floor||1;
  addCoins(c.boss?12+Math.floor(Math.random()*13)+Math.floor(f/3):3+Math.floor(Math.random()*4)+Math.floor(f/6),c.x,(c.y||0)+2.2);}return r;};
function barrelCoins(){for(const b of G.barrels||[])if(b.dead&&!b.coinDone){b.coinDone=true;if(!G.tutorial&&Math.random()<0.3)addCoins(1,b.g.position.x,1.9);}}
const _keS=killEnemy;
killEnemy=function(e){const was=e&&e.dead;const r=_keS(e);if(e&&!was&&e.elite&&!e.summon&&e.pvp==null&&G.scene==='tower')addCoins(2,e.x,e.y+e.h+1.2);return r;};

/* ---------- skin del negozio: eroe + modello + colore, 3 nuove ogni giorno ---------- */
const VARS={gelo:{n:'Gelo',p:2400,c:'#8fdcff'},smeraldo:{n:'Smeraldo',p:2400,c:'#7fe08a'},brace:{n:'Brace',p:2800,c:'#ff7a2e'},ombra:{n:'Ombra e oro',p:3500,c:'#ffd27a'},
  rubino:{n:'Cremisi',p:2600,c:'#ff4d6a'},reale:{n:'Viola reale',p:2800,c:'#b88cff'},avorio:{n:'Avorio',p:3200,c:'#f3e6c8'},abisso:{n:'Abisso',p:3200,c:'#3fb8b0'},venom:{n:'Venom',p:2400,c:'#ff1a2e'}};
const OWNS=store.get('shopskins',[]),SSEL=store.get('shopskinsel',{});
const _skOS=skinOf;
const sKey=(cid,sk,v)=>cid+'.'+sk+'.'+v,sParse=k=>{const [c,sk,v]=k.split('.');return {cid:c,sk:+sk,v};};
(function(){const ov=store.get('skinvars',null);if(!ov)return;const sv=store.get('skinvarsel',{});   // colori comprati con la versione di prima
  for(const cid in ov)for(const v of ov[cid]){const k=sKey(cid,_skOS(cid),v);if(!OWNS.includes(k))OWNS.push(k);if(sv[cid]===v)SSEL[cid]=k;}
  store.set('shopskins',OWNS);store.set('shopskinsel',SSEL);store.set('skinvars',null);})();
const ownsS=k=>OWNS.includes(k);
function shopSel(cid){const k=SSEL[cid];if(!k||!ownsS(k))return null;const o=sParse(k);return SKINS[cid]&&SKINS[cid][o.sk]&&VARS[o.v]?o:null;}
skinOf=function(id){const o=shopSel(id);return o?o.sk:_skOS(id);};
function varOf(cid){const o=shopSel(cid);return o?o.v:'';}
const hueW=x=>((x%1)+1)%1;
function recolor(root,v){if(!VARS[v])return;if(v==='venom')return recolorVenom(root);const done=new Map(),hsl={};
  const tf=(h,s,l)=>{const skin=h>0.02&&h<0.13&&s>0.2&&s<0.8&&l>0.42&&l<0.88;if(skin||l<0.09)return null;const g=s<0.1;
    switch(v){
    case 'gelo':return g?[0.55,0.22,Math.max(l,0.5)]:[0.52+h*0.06,Math.min(1,s*0.8+0.15),Math.min(0.9,l*0.9+0.1)];
    case 'smeraldo':return g?[0.38,0.12,l]:[0.33+h*0.06,Math.min(1,s*0.9+0.15),l*0.95];
    case 'brace':return g?[0.04,0.25,l*0.85]:[0.01+h*0.05,Math.min(1,s*1.1+0.2),l*0.85];
    case 'ombra':return (l>0.62||(g&&l>0.45))?[0.11,0.75,0.55]:[h,s*0.25,l*0.32];
    case 'rubino':return g?[0.98,0.18,l]:[hueW(0.97+h*0.04),Math.min(1,s+0.25),l*0.82];
    case 'reale':return g?[0.75,0.15,l]:[0.73+h*0.05,Math.min(1,s*0.9+0.2),l*0.9];
    case 'avorio':return g?[0.1,0.15,Math.min(0.92,l*0.55+0.42)]:[h,s*0.35,Math.min(0.9,l*0.5+0.42)];
    case 'abisso':return g?[0.58,0.3,l*0.75]:[0.47+h*0.06,Math.min(1,s*0.8+0.25),l*0.62];}
    return null;};
  root.traverse(o=>{if(!o.isMesh||!o.material)return;const arr=Array.isArray(o.material)?o.material:[o.material];
    const out=arr.map(m=>{if(!m||!m.color||(m.userData&&m.userData.keep))return m;if(done.has(m))return done.get(m);m.color.getHSL(hsl);const t=tf(hsl.h,hsl.s,hsl.l);if(!t){done.set(m,m);return m;}
      const c=m.clone();c.userData=Object.assign({},m.userData);c.color.setHSL(t[0],t[1],t[2]);done.set(m,c);return c;});
    o.material=Array.isArray(o.material)?out:out[0];});}
const _bhS=buildHero;
buildHero=function(cls){const R=_bhS(cls);const v=varOf(cls.id);if(v)recolor(R.root,v);return R;};
// rotazione giornaliera: 3 eroi diversi, modello e colore diversi (uguale per tutti i giocatori)
const dayNo=()=>{const d=new Date();return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);};
function dailySkins(){let s=(dayNo()*2654435761)>>>0;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  const cls=CLASSES.filter(c=>SKINS[c.id]&&SKINS[c.id].length).map(c=>c.id),vs=Object.keys(VARS).filter(v=>v!=='venom'),out=[];
  while(out.length<3&&cls.length){const cid=cls.splice(Math.floor(rnd()*cls.length),1)[0];const v=vs.splice(Math.floor(rnd()*vs.length),1)[0];
    out.push(sKey(cid,Math.floor(rnd()*SKINS[cid].length),v));}
  return out;}
const skinPrice=k=>{const o=sParse(k);return VARS[o.v].p+(o.sk!==(SKINPICK[o.cid]||0)?500:0);};
const skinName=k=>{const o=sParse(k),sk=SKINS[o.cid][o.sk];if(o.v==='venom')return 'Venom';return (sk&&sk.name||'Skin')+' · '+VARS[o.v].n;};
const clsOf=id=>CLASSES.find(c=>c.id===id);
function untilNew(){const n=new Date(),m=new Date(n);m.setHours(24,0,0,0);const h=Math.floor((m-n)/36e5),mi=Math.floor((m-n)%36e5/6e4);return h+'h '+mi+'m';}
// anteprime in pixel art: stessa pipeline del gioco (render a bassa risoluzione + retino + contorni)
const PS={};
function psEnv(){if(PS.sc)return PS;const sc=new THREE.Scene();sc.background=new THREE.Color(0xff00ff);   // colore chiave: diventa trasparente
  sc.add(new THREE.HemisphereLight(0xa8b2d0,0x3a2a1e,0.8));
  const key=new THREE.DirectionalLight(0xffd6a0,0.95);key.position.set(-3,5,6);sc.add(key);
  const rim=new THREE.DirectionalLight(0x9db4ff,0.55);rim.position.set(4,3,-5);sc.add(rim);
  const ped=new THREE.Group();sc.add(ped);const st=toon(0x3a342e),st2=toon(0x4a4239);
  mesh(new THREE.CylinderGeometry(0.95,1.05,0.22,20),st,0,-0.11,0,ped,true);mesh(new THREE.CylinderGeometry(0.8,0.88,0.12,20),st2,0,0.04,0,ped,true);
  PS.sc=sc;PS.ped=ped;PS.cam=new THREE.PerspectiveCamera(30,1,0.1,60);PS.rts={};
  PS.mat=new THREE.ShaderMaterial({uniforms:{tCol:{value:null},tDep:{value:null},res:{value:new THREE.Vector2(1,1)},cn:{value:0.1},cf:{value:60}},
    vertexShader:PIX.mat.vertexShader,fragmentShader:PIX.mat.fragmentShader,depthTest:false,depthWrite:false});
  PS.q=new THREE.Scene();const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),PS.mat);q.frustumCulled=false;PS.q.add(q);PS.oc=new THREE.OrthographicCamera(-1,1,1,-1,0,1);return PS;}
function psRT(w,h){const k=w+'x'+h;if(PS.rts[k])return PS.rts[k];const o={minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter};
  const a=new THREE.WebGLRenderTarget(w,h,o);a.depthTexture=new THREE.DepthTexture(w,h);return PS.rts[k]={a,b:new THREE.WebGLRenderTarget(w,h,o),buf:new Uint8Array(w*h*4)};}
// frame: {cx,cy,dist,h(altezza visibile)}; ped: mostra il piedistallo
function psShot(obj,w,h,fr,ped){const E=psEnv(),T=psRT(w,h),cam=E.cam;E.ped.visible=!!ped;E.sc.add(obj);
  cam.aspect=w/h;cam.fov=2*Math.atan(fr.h/2/fr.dist)*180/Math.PI;cam.updateProjectionMatrix();cam.position.set(fr.cx+(fr.ox||0),fr.cy+(fr.oy||0.25),fr.dist);cam.lookAt(fr.cx,fr.cy,0);
  try{if(PIX.ok){renderer.setRenderTarget(T.a);renderer.render(E.sc,cam);const u=E.mat.uniforms;u.tCol.value=T.a.texture;u.tDep.value=T.a.depthTexture;u.res.value.set(w,h);u.cn.value=cam.near;u.cf.value=cam.far;
      renderer.setRenderTarget(T.b);renderer.render(E.q,E.oc);}
    else{renderer.setRenderTarget(T.b);renderer.render(E.sc,cam);}
    renderer.readRenderTargetPixels(T.b,0,0,w,h,T.buf);}finally{renderer.setRenderTarget(null);E.sc.remove(obj);}
  const img=new ImageData(w,h),d=img.data;for(let y=0;y<h;y++)d.set(T.buf.subarray((h-1-y)*w*4,(h-y)*w*4),y*w*4);
  for(let i=0;i<d.length;i+=4)if(d[i]>245&&d[i+1]<12&&d[i+2]>245)d[i+3]=0;return img;}
function psFrame(obj,pad,asp){const bb=new THREE.Box3().setFromObject(obj),hh=Math.max(1.6,bb.max.y-Math.min(0,bb.min.y)),wd=asp?(bb.max.x-bb.min.x)/asp:0;return {cx:(bb.min.x+bb.max.x)/2*0.6,cy:(Math.min(0,bb.min.y)+bb.max.y)/2,h:Math.max(hh,wd)*(pad||1.25),dist:9};}
function psURL(img){const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').putImageData(img,0,0);
  let fg=0;const d=img.data;for(let i=3;i<d.length;i+=16)if(d[i]>0)fg++;return fg<d.length/16*0.03?'':c.toDataURL();}
// pose d'azione delle skin nel negozio, con l'arma in mano
const SHOP_POSE={
 cavaliere:{crouch:.2,ff:.4,fb:-.5,lean:.1,twist:.5,head:.05,shF:-2.3,elF:-.25,wrF:-.35,shB:-1.45,elB:-.85,wrB:0,ry:.6},
 berserker:{crouch:.3,ff:.44,fb:-.44,lean:-.2,twist:-.3,head:-.4,shF:-2.7,elF:-.8,wrF:-1.05,shB:-2.65,elB:-.95,wrB:0,ry:.4},
 lanciere:{crouch:.3,ff:.56,fb:-.62,lean:.42,twist:.55,head:-.28,shF:-1.5,elF:-.05,wrF:-1.45,shB:.35,elB:-.5,wrB:0,ry:.95},
 assassino:{crouch:.38,ff:.42,fb:-.42,lean:.55,twist:.35,head:-.5,shF:-1.1,elF:-.75,wrF:-.9,shB:.55,elB:-.55,wrB:-1.2,ry:.7},
 mago:{crouch:.13,ff:.3,fb:-.32,lean:-.14,twist:.35,head:-.2,shF:-2.6,elF:-.15,wrF:-.1,shB:-1.55,elB:-.2,wrB:-.3,sB:.25,ry:.5},
 criomante:{crouch:.12,ff:.26,fb:-.28,lean:-.06,twist:-.45,head:-.12,shF:-1.55,elF:-.1,wrF:-.2,shB:-2.3,elB:-.35,wrB:-.2,sB:.55,ry:.25},
 tempesta:{crouch:.16,ff:.34,fb:-.34,lean:-.26,twist:.2,head:-.42,shF:-2.5,elF:-.05,wrF:0,shB:-2.4,elB:-.1,wrB:0,sF:-.6,sB:.6,ry:.42},
 druido:{crouch:.24,ff:.42,fb:-.44,lean:.2,twist:.4,head:-.1,shF:-2.1,elF:-.5,wrF:-.3,shB:-1.1,elB:-1.2,wrB:-.4,ry:.55},
 astromante:{crouch:.07,ff:.16,fb:-.2,lean:-.26,twist:.15,head:-.46,shF:-2.45,elF:-.05,wrF:0,shB:-2.45,elB:-.05,wrB:0,sF:-.75,sB:.75,ry:.4},
 negromante:{crouch:.2,ff:.42,fb:-.46,lean:.22,twist:.6,head:.08,shF:-1.75,elF:-.75,wrF:-1.55,shB:-1.5,elB:-.35,wrB:-.2,ry:.65},
 paladino:{crouch:.22,ff:.4,fb:-.4,lean:-.12,twist:-.35,head:-.18,shF:-2.15,elF:-1.05,wrF:-.95,shB:-1.4,elB:-.6,wrB:0,ry:.38},
 arciere:{crouch:.15,ff:.32,fb:-.4,lean:-.05,twist:.95,head:-.08,shF:-1.6,elF:-.02,wrF:-.1,shB:-1.55,elB:-2.2,wrB:0,ry:.9},
 samurai:{crouch:.36,ff:.52,fb:-.58,lean:.34,twist:.7,head:-.32,shF:-.7,elF:-.3,wrF:-1.5,shB:-.9,elB:-1.1,wrB:0,ry:.75},
 monaco:{crouch:.04,fb:.02,kick:[-1.75,.2],lean:-.3,twist:.4,head:-.1,shF:-1.5,elF:-.5,wrF:0,shB:-2.2,elB:-1.9,wrB:0,ry:.8}};
// gamba in piedi: dato quanto si abbassa il bacino e dove sta il piede, calcola anca e ginocchio
function legIK(crouch,z){const L1=.48,L2=.43,h=Math.max(.3,.95-crouch-.09),d=clamp(Math.hypot(z,h),.2,L1+L2-.005),kn=Math.PI-Math.acos(clamp((L1*L1+L2*L2-d*d)/(2*L1*L2),-1,1)),a=Math.atan2(z,h),al=Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1));return [-(a+al),kn];}
function poseShop(R,cls,over){const t=Object.assign({crouch:.1,ff:.3,fb:-.3,lean:0,head:0,twist:0,shF:-2,elF:-.2,wrF:0,shB:-1,elB:-.5,wrB:0,sF:0,sB:0,ry:.5},SHOP_POSE[cls.id],over);
  const [hF,kF]=t.kick||legIK(t.crouch,t.ff),[hB,kB]=legIK(t.crouch,t.fb);Object.assign(t,{hF,kF,hB,kB});
  try{const a=applyVariant(buildWeaponMesh(cls.weapon,3,null),{type:cls.weapon,rarity:3,v:0});R.arms[0].wr.add(a.g);if(cls.weapon==='pugnali'){const b=applyVariant(buildWeaponMesh(cls.weapon,3,null),{type:cls.weapon,rarity:3,v:0});R.arms[1].wr.add(b.g);}}catch(e){}
  applyPose(R,t,1,1);R.arms[0].sh.rotation.z=t.sF;R.arms[1].sh.rotation.z=t.sB;
  for(const [i,h,k,free] of [[0,hF,kF,!!t.kick],[1,hB,kB,false]])if(R.legs[i].foot)R.legs[i].foot.rotation.x=free?.35:clamp(-(h+k),-.9,.9);
  for(const f of R.flows||[])f.segs.forEach((g,i)=>{g.rotation.x=(i===0?f.base:0.1)+(i===0?.75:.2)*f.amp;});
  R.root.updateMatrixWorld(true);let low=Infinity;const v=new THREE.Vector3();for(const l of R.legs){if(!l.foot)continue;l.foot.getWorldPosition(v);low=Math.min(low,v.y-0.07);}if(low<Infinity)R.model.position.y-=low;
  R.root.userData.ry=t.ry;}
function skinModel(k){const o=sParse(k),c=clsOf(o.cid),R=buildSkin(c,o.sk);poseShop(R,c);recolor(R.root,o.v);return R.root;}
const THUMB={};
function thumbOf(k){if(THUMB[k]!=null)return THUMB[k];try{const m=skinModel(k);m.rotation.y=m.userData.ry||0.5;const fr=psFrame(m,1.12,0.75);fr.cy-=0.06;const u=psURL(psShot(m,72,96,fr,true));disposeObj(m);return THUMB[k]=u;}catch(e){return THUMB[k]='';}}

/* ---------- casse del negozio ---------- */
const CRATES=[{id:'viandante',n:'Cassa del viandante',p:300,min:1,d:'Un\'arma o un pezzo d\'armatura, almeno Non comune'},
  {id:'eroe',n:'Cassa dell\'eroe',p:900,min:2,d:'Un oggetto Raro, con il 3% di trovarlo Epico'},
  {id:'leggenda',n:'Cassa epica',p:1700,min:3,d:'Un oggetto Epico, con il 3% di trovarlo Leggendario'},
  {id:'mitica',n:'Cassa mitica',p:2400,min:4,d:'Un oggetto Leggendario o Mitico'}];
// sconto del 30% a rotazione ogni giorno, ma mai sulla Cassa mitica
function dailyOffer(){const L=CRATES.filter(c=>c.id!=='mitica');return 'c:'+L[dayNo()%L.length].id;}
// la Cassa mitica è in sconto solo di rado (circa 1 giorno su 10) e al massimo del 10%
const mythSale=()=>((dayNo()*2654435761)>>>0)%10===3;
const FRAG_P=[1200,2000,3500];
const priceOf=key=>{if(key.startsWith('o:frag:'))return FRAG_P[clsOf(key.slice(7)).tier]||FRAG_P[2];if(key==='s:'+VENOM_K)return VENOM_P;const base=key.startsWith('c:')?CRATES.find(c=>'c:'+c.id===key).p:key==='o:stone'?STONE_P:skinPrice(key.slice(2));return key===dailyOffer()?Math.round(base*0.7):key==='c:mitica'&&mythSale()?Math.round(base*0.9):base;};
function openCrate(cr){const f=Math.max(5,STATS.best||1);let r=Math.max(cr.min,rollRarity(f,0));if(cr.leg&&Math.random()<cr.leg)r=4;r=Math.min(4,r);
  const o=Math.random()<0.5?makeWeapon(G.cls.weapon,r,f):makeGear(pick(Object.keys(GEAR)),r,f);invAdd(o);saveInv();crateShow(cr,o);return o;}

/* ---------- il mercante ---------- */
const SHOP_X=-4.0;
// il mercante del seminterrato è lo stesso che compare sui piani (con la sua bancarella)
function merchantModel(){return travelMerchantModel();}
function merchantModelOld(){const g=new THREE.Group();
  const robe=toon(0x3a2a55),robe2=toon(0x4b3770),hood=toon(0x2a1e40),gold=toon(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.4}),wood=toon(0x5a3a22);
  mesh(new THREE.ConeGeometry(0.55,1.7,14),robe,0,0.85,0,g);mesh(new THREE.CylinderGeometry(0.3,0.42,0.12,14),robe2,0,0.95,0,g);
  mesh(rbox(0.5,0.08,0.06,0.02),gold,0,0.95,0.38,g);mesh(sph(0.3,14,12),hood,0,1.85,0,g);
  const tip=mesh(new THREE.ConeGeometry(0.2,0.45,10),hood,0,2.15,-0.12,g);tip.rotation.x=-0.6;
  mesh(sph(0.17,10,8),new THREE.MeshBasicMaterial({color:0x0a0710}),0.06,1.83,0.17,g,true);
  for(const s of [-1,1])mesh(sph(0.04,6,6),new THREE.MeshBasicMaterial({color:0xffd27a}),0.05+s*0.07,1.86,0.3,g,true);
  mesh(rbox(1.0,0.75,0.6,0.05),wood,-0.05,0.38,0.8,g);mesh(rbox(1.06,0.08,0.66,0.03),gold,-0.05,0.78,0.8,g);
  for(let i=0;i<4;i++)mesh(new THREE.CylinderGeometry(0.07,0.07,0.03,12),gold,-0.4+i*0.17,0.84+(i%2)*0.03,0.8,g);
  mesh(rbox(0.3,0.26,0.22,0.04),toon(0x7a5434),0.3,0.95,0.75,g);mesh(sph(0.06,8,6),toon(0x6fd0ff,{emissive:0x1a6aa0,emissiveIntensity:0.6}),0.3,1.12,0.75,g);
  mesh(sph(0.09,10,8),new THREE.MeshBasicMaterial({color:0xffc56b}),-0.42,1.3,0.75,g,true);return g;}
function crateModel(id){const g=new THREE.Group(),T={viandante:[0x7a5434,0x3a3a44,0x8a8a96],eroe:[0x2e3f5c,0xa9b3c4,0x5fb0ff],leggenda:[0x2a1830,0xd9b45a,0xc27bff],mitica:[0x3a0c14,0xffd27a,0xff5470]}[id];
  const body=toon(T[0]),band=toon(T[1],{metalness:0.4}),gem=toon(T[2],{emissive:T[2],emissiveIntensity:0.5});
  mesh(rbox(1.3,0.72,0.86,0.06),body,0,0.36,0,g);
  const lid=new THREE.Group();lid.position.set(0,0.72,-0.43);g.add(lid);   // perno sul retro: il coperchio si apre davvero
  const top=mesh(new THREE.CylinderGeometry(0.43,0.43,1.3,16,1,false,0,Math.PI),body,0,0,0.43,lid);top.rotation.z=Math.PI/2;
  for(const x of [-0.45,0.45]){mesh(rbox(0.1,0.76,0.9,0.02),band,x,0.38,0,g);const b=mesh(new THREE.CylinderGeometry(0.45,0.45,0.1,16,1,true,0,Math.PI),band,x,0,0.43,lid);b.rotation.z=Math.PI/2;}
  const lock=[mesh(rbox(0.26,0.3,0.08,0.03),band,0,0.66,0.45,g),mesh(sph(0.075,8,6),gem,0,0.68,0.5,g,true)];
  if(id==='leggenda'||id==='mitica')for(const x of [-0.62,0.62])mesh(sph(0.08,8,6),gem,x,0.72,0.42,g,true);
  g.userData.parts={lid,lock,gem,w:1.15};return g;}
const CRATE_IMG={},PORTRAIT={v:null};
function crateImg(id){if(CRATE_IMG[id]!=null)return CRATE_IMG[id];try{const m=crateModel(id);m.rotation.y=-0.55;m.position.y=0.06;const u=psURL(psShot(m,72,96,{cx:0,cy:0.55,h:2.5,dist:9,oy:2.2},true));disposeObj(m);return CRATE_IMG[id]=u;}catch(e){return CRATE_IMG[id]='';}}
function portraitImg(){if(PORTRAIT.v!=null)return PORTRAIT.v;try{const m=merchantModel();m.rotation.y=0.35;const u=psURL(psShot(m,48,48,{cx:0.05,cy:1.65,h:1.15,dist:9,oy:0.1},false));disposeObj(m);return PORTRAIT.v=u;}catch(e){return PORTRAIT.v='';}}
(function(){const C=cellarG,g=merchantModel();g.position.set(SHOP_X+0.35,0,-2.1);g.rotation.y=-0.25;C.add(g);
  // insegna appesa sopra il banco
  const [cn,x]=cv(128,48);x.fillStyle='#5a4020';x.fillRect(0,0,128,48);
  x.strokeStyle='#c8963a';x.lineWidth=4;x.strokeRect(3,3,122,42);x.fillStyle='#ffd27a';x.font='bold 22px "Pixelify Sans", monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('BOTTEGA',64,25);
  const tx=new THREE.CanvasTexture(cn);tx.magFilter=THREE.NearestFilter;
  const sg=new THREE.Group();sg.position.set(SHOP_X-0.4,3.7,-1.7);C.add(sg);
  mesh(new THREE.PlaneGeometry(1.7,0.64),new THREE.MeshBasicMaterial({map:tx}),0,0,0.04,sg,true);mesh(rbox(1.78,0.7,0.06,0.02),toon(0x2a2a32),0,0,0,sg);
  for(const s of [-0.7,0.7])mesh(new THREE.CylinderGeometry(0.02,0.02,CELLAR_CEIL-3.9,6),toon(0x3a3a44),s,(CELLAR_CEIL-3.9)/2+0.32,0,sg,true);
  const r=mesh(new THREE.TorusGeometry(1.0,0.035,8,48),new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:0,depthWrite:false}),SHOP_X,0.03,-0.2,C,true);r.rotation.x=Math.PI/2;r.scale.set(1,0.55,1);
  INTER.push({id:'shop',x:SHOP_X,y:2.6,name:'Mercante',sub:()=>`${fmtC(COINS.n)} rubini · casse e skin`,ring:r,act:openShop});})();

let shTab='casse';
function openShop(){if(G.state!=='cellar')return;G.state='shop';clearInput();['prompt','bUse','touch'].forEach(id=>$(id).hidden=true);shTab='casse';renderShop();$('shop').hidden=false;}
function closeShop(){closeView(true);$('shop').hidden=true;if(G.state==='shop'){G.state='cellar';$('touch').hidden=!isTouch;canvas.focus();}}
const SH_QUOTES=['«Rubini lucenti, merce rara.»','«Tutto ha un prezzo, eroe. Anche la gloria.»','«Questa l\'ho trovata al piano cento. Forse.»','«Ogni rubino ha una storia. La tua quanti ne vale?»','«Oggi ho roba che domani non avrò.»'];
const coinI='<i class="cn" aria-hidden="true"></i>';
function renderShop(){$('shCoins').textContent=fmtC(COINS.n);for(const b of document.querySelectorAll('#shop .tab'))b.setAttribute('aria-selected',b.dataset.st===shTab);
  const pi=portraitImg(),pe=$('shPortrait');if(pi&&pe.getAttribute('src')!==pi)pe.src=pi;pe.hidden=!pi;$('shQuote').textContent=SH_QUOTES[dayNo()%SH_QUOTES.length];
  const off=dailyOffer(),box=$('shBody');box.className='sh-body sh-'+shTab;
  const buyBtn=(k,p)=>`<button class="sh-buy" data-buy="${k}" ${COINS.n<p?'disabled':''}>${coinI}<span>${fmtC(p)}</span></button>`;
  if(shTab==='casse'){box.innerHTML=CRATES.map(c=>{const k='c:'+c.id,p=priceOf(k),im=crateImg(c.id),disc=k===off?'−30% oggi':(k==='c:mitica'&&mythSale()?'−10% oggi':'');
      return `<article class="sh-card cr-${c.id}"><div class="sh-stage">${im?`<img src="${im}" alt="">`:''}${disc?`<em class="sh-rib">${disc}</em>`:''}</div>
      <div class="sh-info"><b>${c.n}</b><span>${c.d}</span></div>${disc?`<s class="sh-was">${fmtC(c.p)}</s>`:''}${buyBtn(k,p)}</article>`;}).join('')
      +`<p class="note">Gli oggetti finiscono nell'armadio. Le armi sono per ${esc(G.cls.name)}.</p>`;}
  else if(shTab==='ogg'){const full=STONES.n>=STONE_MAX,sp=priceOf('o:stone');
    box.innerHTML=`<div class="sh-h"><b>Oggetti</b></div><article class="sh-card" style="--vc:#ff4a64"><div class="sh-stage"><i class="sh-stone"></i><span class="sh-cnt">${STONES.n}/${STONE_MAX}</span></div>
      <div class="sh-info"><b>Pietra della rinascita</b><span>Quando muori puoi scegliere se usarla: rinasci sul posto con metà vita. Una volta per run, si consuma.</span></div>
      ${full?'<button class="sh-buy off" disabled>Ne hai già 3</button>':buyBtn('o:stone',sp)}</article>
      <article class="sh-card" style="--vc:#7fd0ff"><div class="sh-stage"><i class="sh-seal"></i><span class="sh-cnt">${WARP.n}</span></div>
      <div class="sh-info"><b>Sigillo del Santuario</b><span>A inizio scalata puoi usarlo per partire dal piano ${WARP_F} con un potenziamento a scelta. Lo lasciano, molto di rado, i guardiani dal piano 15 in su.</span></div>
      <button class="sh-buy off" disabled>Non in vendita</button></article>`+fragShop(buyBtn);}
  else{const card=(k,daily)=>{const o=sParse(k),c=clsOf(o.cid),own=ownsS(k),on=SSEL[o.cid]===k&&own,unl=isUnlocked(c),p=priceOf('s:'+k),im=thumbOf(k);
      return `<article class="sh-card sh-sk${on?' on':''}" style="--vc:${VARS[o.v].c}"><button class="sh-stage" data-view="${k}" aria-label="Guarda da vicino">${im?`<img src="${im}" alt="">`:`<i class="sh-sw"></i>`}<i class="sh-zoom" aria-hidden="true"></i>${on?'<em class="sh-rib">Indossata</em>':''}</button>
      <div class="sh-info"><b>${esc(skinName(k))}</b><span>${esc(c.name)}${unl?'':' <i class="sh-lock">da sbloccare</i>'}</span></div>
      ${own?`<button class="sh-buy ${on?'off':'wear'}" data-wear="${k}" ${unl?'':'disabled'}>${on?'Togli':'Indossa'}</button>`:buyBtn('s:'+k,p)}</article>`;};
    const day=dailySkins();
    box.innerHTML=(venomCan()?`<div class="sh-h vn"><b>Recupera Venom</b><span>restituisci il rimborso</span></div>${card(VENOM_K,false)}`:'')+`<div class="sh-h"><b>Skin di oggi</b><span>nuove tra ${untilNew()}</span></div>${day.map(k=>card(k,true)).join('')}`
      
      +'<p class="note">Tocca una skin per guardarla da vicino. Ogni giorno ne arrivano 3 nuove, quelle comprate le trovi nell\'armadio.</p>';}}
/* ---------- vista ingrandita della skin ---------- */
const SV={k:null,m:null,fr:null,a:0.5,spin:0.6,drag:null,raf:0};
function openView(k){closeView(true);try{SV.m=skinModel(k);}catch(e){return;}SV.k=k;SV.a=SV.m.userData.ry||0.5;SV.spin=0.6;SV.fr=psFrame(SV.m,1.14,0.8);SV.fr.cy-=0.08;
  const o=sParse(k),c=clsOf(o.cid),sk=SKINS[o.cid][o.sk];$('svHero').textContent=o.v==='venom'?c.name+' · Edizione limitata':c.name+' · '+VARS[o.v].n;$('svName').textContent=o.v==='venom'?'Venom':(sk.name||'Skin');$('svName').style.color=VARS[o.v].c;
  $('svDesc').textContent=o.v==='venom'?'Interamente nera, con occhi, dettagli e magia rosso sangue.':(sk.desc||'');$('shView').style.setProperty('--vc',VARS[o.v].c);svAct();$('shView').hidden=false;sfx('ui');
  let last=performance.now();const loop=t=>{if(!SV.m)return;const dt=Math.min(0.05,(t-last)/1000);last=t;if(!SV.drag)SV.a+=SV.spin*dt;SV.m.rotation.y=SV.a;
    try{const img=psShot(SV.m,112,140,SV.fr,true);$('svCan').getContext('2d').putImageData(img,0,0);}catch(e){}SV.raf=requestAnimationFrame(loop);};SV.raf=requestAnimationFrame(loop);}
function svAct(){const k=SV.k,o=sParse(k),c=clsOf(o.cid),own=ownsS(k),on=SSEL[o.cid]===k&&own,unl=isUnlocked(c),p=priceOf('s:'+k);
  $('svAct').innerHTML=own?`<button class="sh-buy ${on?'off':'wear'}" data-wear="${k}" ${unl?'':'disabled'}>${on?'Togli':'Indossa'}</button>`:`<button class="sh-buy" data-buy="s:${k}" ${COINS.n<p?'disabled':''}>${coinI}<span>${fmtC(p)}</span></button>`;
  $('svNote').textContent=unl?(own?'È tua.':(COINS.n<p?'Ti mancano '+fmtC(p-COINS.n)+' rubini.':'')):'Sblocca '+c.name+' per indossarla.';}
function closeView(quiet){cancelAnimationFrame(SV.raf);if(SV.m){disposeObj(SV.m);SV.m=null;}SV.k=null;const v=$('shView');if(v&&!v.hidden){v.hidden=true;if(!quiet)sfx('ui');}}
(function(){const c=$('svCan');const pt=e=>e.touches?e.touches[0].clientX:e.clientX;
  const down=e=>{SV.drag={x:pt(e),a:SV.a};};const move=e=>{if(!SV.drag)return;SV.a=SV.drag.a+(pt(e)-SV.drag.x)*0.012;};const up=()=>{SV.drag=null;};
  c.addEventListener('pointerdown',e=>{c.setPointerCapture&&c.setPointerCapture(e.pointerId);down(e);});c.addEventListener('pointermove',move);c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
  $('shView').addEventListener('click',e=>{const r=e.target.closest('[data-rot]');if(r){SV.a+=+r.dataset.rot*0.6;SV.spin=0;return;}if(e.target.id==='shView'||e.target.closest('#svClose'))closeView();});})();
$('shop').addEventListener('click',e=>{const vw=e.target.closest('[data-view]');if(vw){openView(vw.dataset.view);return;}const t=e.target.closest('.tab');if(t){shTab=t.dataset.st;sfx('ui');renderShop();return;}
  const b=e.target.closest('[data-buy]');if(b&&!b.disabled){const k=b.dataset.buy,p=priceOf(k);if(COINS.n<p||(k==='s:'+VENOM_K&&!venomCan()))return;COINS.n-=p;saveCoins();coinHud();sfx('pick');
    if(k.startsWith('c:')){openCrate(CRATES.find(c=>'c:'+c.id===k));}
    else if(k.startsWith('o:frag:')){const c=clsOf(k.slice(7));if(isUnlocked(c)||c.tier>=3||(UNL.frag[c.id]||0)>=fragNeed(c)){COINS.n+=p;saveCoins();coinHud();return;}UNL.frag[c.id]=(UNL.frag[c.id]||0)+1;saveUnl();toast(UNL.frag[c.id]>=fragNeed(c)?`${c.name}: frammenti completi!`:'Frammento comprato',UNL.frag[c.id]>=fragNeed(c)?'Sbloccala al piedistallo nel seminterrato':`${c.name} ${UNL.frag[c.id]}/${fragNeed(c)}`);}
    else if(k==='o:stone'){if(STONES.n>=STONE_MAX){COINS.n+=p;saveCoins();coinHud();return;}STONES.n++;saveStones();toast('Pietra della rinascita',`Ne hai ${STONES.n}`);}
    else{const sk=k.slice(2),o=sParse(sk),c=clsOf(o.cid);if(!OWNS.includes(sk))OWNS.push(sk);store.set('shopskins',OWNS);if(isUnlocked(c)){SSEL[o.cid]=sk;store.set('shopskinsel',SSEL);if(G.cls.id===o.cid)setHero(G.cls);}toast('Nuova skin!',skinName(sk)+' per '+c.name);}
    tributo(p);renderShop();if(SV.k)svAct();return;}
  const w=e.target.closest('[data-wear]');if(w&&!w.disabled){const k=w.dataset.wear,o=sParse(k);if(SSEL[o.cid]===k)delete SSEL[o.cid];else SSEL[o.cid]=k;store.set('shopskinsel',SSEL);if(G.cls.id===o.cid)setHero(G.cls);sfx('equip');renderShop();if(SV.k)svAct();}});
$('board').addEventListener('click',e=>{const b=e.target.closest('.sk');if(b&&!b.disabled&&G.cls&&SSEL[G.cls.id]){delete SSEL[G.cls.id];store.set('shopskinsel',SSEL);}},true);
$('shClose').onclick=()=>{sfx('ui');closeShop();};
addEventListener('keydown',e=>{if(e.key==='Escape'&&G.state==='shop'){e.preventDefault();e.stopPropagation();if(SV.k)closeView();else closeShop();}},true);
const _padBackSh=padBack;padBack=function(){if(SV.k){closeView();return true;}const b=$('shClose');if(b&&b.offsetParent!==null&&!b.closest('[hidden]')){b.click();return true;}return _padBackSh();};
const _uhvS=updHeroVisual;updHeroVisual=function(dt){_uhvS(dt);if(G.scene==='tower')barrelCoins();};
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{openShop,COINS,addCoins,recolor,dailySkins,openView,closeView,SV,OWNS,SSEL,skinOf:id=>skinOf(id)});

/* =========================================================
   MERCANTE ERRANTE (vita o rubini), PIETRA DELLA RINASCITA,
   EMOTE DEL NEGOZIO, GUARDIANI FURIOSI
   ========================================================= */

/* ---------- mercante errante: scegli come pagare ---------- */
// tre offerte decise una volta sola per mercante: arma, armatura e un potenziamento subito
// prezzi del mercante errante: in linea con le casse del seminterrato (Epica dalla cassa = 2400 rubini), un po' più bassi perché li trovi in scalata.
// Pagando con la vita si dà una parte della vita MASSIMA che cresce con la rarità (prima era il 30% della vita attuale: a vita bassa costava quasi niente)
const MERCH_GEM=[120,260,600,1500,3200],MERCH_HP=[0.12,0.18,0.26,0.38,0.5];
function merchOffers(){const f=G.floor,fm=1+f/100,r1=Math.min(4,rollRarity(f,0)+1),r2=Math.min(4,rollRarity(f,0)+1);
  return [{kind:'w',o:makeWeapon(G.cls.weapon,r1,f),pct:MERCH_HP[r1],gem:Math.round(MERCH_GEM[r1]*fm)},{kind:'g',o:makeGear(pick(Object.keys(GEAR)),r2,f),pct:MERCH_HP[r2]*0.9,gem:Math.round(MERCH_GEM[r2]*0.85*fm)},{kind:'u',pct:0.2,gem:Math.round((150+5*f))}];}
const merchHp=of=>Math.max(1,Math.round(S.maxHp*of.pct));
const MB_SLOT={elmo:'Elmo',guanti:'Guanti',corazza:'Corazza'};
function merchCard(of,i){const hc=merchHp(of),pay=`<div class="mbx-pay"><button class="sh-buy mb-hp" data-i="${i}" data-pay="hp" ${P.hp-hc<1?'disabled':''} aria-label="Paga ${hc} vita"><i class="hp-i" aria-hidden="true"></i><span>${hc}</span></button><button class="sh-buy" data-i="${i}" data-pay="gem" ${COINS.n<of.gem?'disabled':''} aria-label="Paga ${of.gem} rubini"><i class="cn" aria-hidden="true"></i><span>${fmtC(of.gem)}</span></button></div>`;
  if(of.kind==='u')return `<article class="mbx-card" style="--rc:#b48cff;--rcg:rgba(180,140,255,.3)"><div class="mbx-pic">${svg('star')}</div><b>Patto del mercante</b><small>Potenziamento</small><p>Scegli subito un potenziamento fra 3</p>${pay}</article>`;
  const o=of.o,R=RARITY[o.rarity],w=of.kind==='w';
  return `<article class="mbx-card" style="--rc:${R.css};--rcg:${R.glow}"><div class="mbx-pic">${itemPic(o,w?WTYPES[o.type].icon:GEAR[o.slot].icon)}</div><b>${esc(o.name)}</b><small>${R.name} · ${w?'Arma':MB_SLOT[o.slot]||'Armatura'}</small><p>${w?`Danno ${o.dmg}${o.effect?' · '+cap(EFFECTS[o.effect].desc):''}`:gearDesc(o)}</p>${pay}</article>`;}
function renderMerch(){$('mbOpts').innerHTML=merchant.offers.map(merchCard).join('');$('mbHave').innerHTML=`<span><i class="hp-i" aria-hidden="true"></i>${Math.ceil(P.hp)}</span><span><i class="cn" aria-hidden="true"></i>${fmtC(COINS.n)}</span>`;}
function openMerch(){if(!merchant||merchant.used||P.dead||G.state!=='play')return;G.state='merch';clearInput();['prompt','bUse','touch'].forEach(id=>$(id).hidden=true);
  merchant.offers=merchant.offers||merchOffers();const pi=travelPortrait(),pe=$('mbPortrait');if(pi)pe.src=pi;pe.hidden=!pi;renderMerch();$('merchBox').hidden=false;sfx('ui');
  setTimeout(()=>{const b=$('mbOpts').querySelector('button:not(:disabled)');if(b&&PAD.on)b.focus();},60);}
function closeMerch(){$('merchBox').hidden=true;if(G.state==='merch'){G.state='play';$('touch').hidden=!isTouch;clearInput();canvas.focus();}}
function merchBuy(i,pay){if(!merchant||merchant.used)return closeMerch();const of=merchant.offers[i];if(!of)return;
  if(pay==='hp'){const c=merchHp(of);if(P.hp-c<1)return;P.hp-=c;RK.lastHp=P.hp;popNum(P.x,P.y+2.2,'-'+c,'hurt');}
  else{if(COINS.n<of.gem)return;COINS.n-=of.gem;saveCoins();coinHud();popNum(P.x,P.y+2.2,'-'+of.gem+' ◆','gem');tributo(of.gem);}
  merchant.used=true;closeMerch();burst(merchant.x,1.2,0xc7a8ff,30,5,3);sfx('pick');levelGroup.remove(merchant.g);merchant=null;toast('Affare fatto','Il mercante sparisce nell\'ombra');
  if(of.kind==='u'){openUpgrade();$('upEyebrow').textContent='Patto del mercante';}else{invAdd(of.o);showPick(of.o);}}
merchantTrade=function(){openMerch();};
$('mbOpts').addEventListener('click',e=>{const b=e.target.closest('[data-pay]');if(b&&!b.disabled)merchBuy(+b.dataset.i,b.dataset.pay);});
$('mbNo').onclick=()=>{sfx('ui');closeMerch();};

/* ---------- pietra della rinascita: una volta per run rinasci dove sei caduto ---------- */
const STONES=Object.assign({n:0},store.get('rstones',{}));const saveStones=()=>store.set('rstones',STONES);
const STONE_MAX=3,STONE_P=1200;
G.runRevived=false;
const _srM=startRun;startRun=function(){G.runRevived=false;return _srM.apply(this,arguments);};
const _pdM=playerDie;
playerDie=function(){if(P.rebirth)return;
  if(G.state==='ask')return;
  if(G.scene==='tower'&&!G.pvp&&!G.tutorial&&!G.runRevived&&STONES.n>0&&!P.dead){askRevive(_pdM);return;}
  return _pdM.apply(this,arguments);};

/* ---------- guardiani furiosi: un boss già battuto può tornare più forte ---------- */
const BEAT=store.get('bossbeat',{});
const FURY_RED=new THREE.Color(0xff1a10);
const FURY_LINES=['Sei tornato. Questa volta non mi trattengo.','Ricordo il tuo odore. E la mia sconfitta.','Mi hai battuto una volta. Non succederà più.','La rabbia mi ha tenuto in vita. Ora tocca a te.'];
G.furyF=false;
const _sbiM=startBossIntro;
startBossIntro=function(){const f=G.floor;
  G.furyF=!G.horde&&!G.pvp&&(!MP.live()||MP.host)&&(BEAT[f]||0)>0&&Math.random()<0.4;
  const r=_sbiM.apply(this,arguments);
  if(G.furyF&&G.bi){G.bi.line=FURY_LINES[Math.floor(Math.random()*FURY_LINES.length)];G.bi.col='#ff2a1a';
    $('bossCard').style.setProperty('--bc','#ff2a1a');$('bcTag').textContent='Guardiano furioso · piano '+f;$('bcName').textContent=G.bi.d.name;$('bcTitle').textContent='Più forte, più veloce, più arrabbiato';}
  return r;};
const _bsnM=bossSpawnNow;
bossSpawnNow=function(){const B=G.bi;const had=B&&B.e;const r=_bsnM.apply(this,arguments);const e=B&&B.e;
  if(e&&!had&&G.furyF){e.furious=true;e.maxHp*=1.5;e.hp=e.maxHp;e.dmg*=1.25;e.speed*=1.15;e.furyT=5;e.furyFx=0;
    for(const m of e.parts.mats||[]){m.userData.baseE=FURY_RED;m.userData.baseI=0.32;}
    $('bossName').textContent=(e.def&&e.def.name||'Guardiano')+' · Furioso';}
  return r;};
function furyWave(e){popNum(e.x,e.y+e.h+1.2,'Onda d\'urto!','info');shake(0.35);sfx('roar');burst(e.x,0.4,0xff2a1a,30,8,2);
  for(let i=1;i<=4;i++)for(const s of [-1,1]){const x=e.x+s*i*2.4;if(x<-HALF+1||x>GATE_X-1)continue;
    addWarn(x,2.0,0.5+i*0.17,()=>{if(e.dead||G.scene!=='tower')return;burst(x,0.3,0xff4a1a,14,6,3);burst(x,0.2,0xb9ad98,8,4,1);
      if(!P.dead&&Math.abs(P.x-x)<1.15&&P.y<1.3)hurtPlayer(e.dmg*0.7,e.x);});}}
function furyUpdate(dt){const e=G.boss;if(!e||e.dead||!e.furious||G.state!=='play')return;
  e.furyFx-=dt;if(e.furyFx<=0){e.furyFx=0.22;burst(e.x+rand(-0.5,0.5)*e.w,e.y+e.h*rand(0.2,0.9),0xff2a1a,3,2,2,0.2);}
  if(e.spawnT>0)return;e.furyT-=dt;if(e.furyT<=0){e.furyT=rand(6,8);furyWave(e);}}
const _keM=killEnemy;
killEnemy=function(e){const was=e&&e.dead;const r=_keM.apply(this,arguments);
  if(e&&!was&&e.dead&&e.type==='boss'&&G.scene==='tower'&&!G.horde&&!G.pvp){const f=G.floor;BEAT[f]=(BEAT[f]||0)+1;store.set('bossbeat',BEAT);
    if(e.furious){addCoins(25+Math.floor(f/3),e.x,e.y+e.h+1.5);const rr=Math.max(3,Math.min(4,rollRarity(f,0)+1));
      const o=Math.random()<0.5?makeWeapon(G.cls.weapon,rr,f):makeGear(pick(Object.keys(GEAR)),rr,f);invAdd(o);saveInv();
      setTimeout(()=>toast('Bottino del furioso',o.name+' è nell\'armadio'),1200);}}
  return r;};

const _upFury=update;update=function(dt){_upFury(dt);if(G.scene==='tower')furyUpdate(dt);};
/* ---------- tasti indietro / esc ---------- */
addEventListener('keydown',e=>{if(e.key==='Escape'&&G.state==='merch'){e.preventDefault();e.stopPropagation();closeMerch();}},true);
const _padBackM=padBack;padBack=function(){if(G.state==='merch'){closeMerch();return true;}return _padBackM();};
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{openMerch,STONES,BEAT,furyWave,
  merch:()=>merchant,buildMerchant:()=>buildMerchant(),playerDie:()=>playerDie(),startRun:()=>startRun(),startBossIntro:()=>startBossIntro(),finishBossIntro:()=>finishBossIntro(),S});

