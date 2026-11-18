/* =========================================================
   CO-OP ONLINE (fino a 4 giocatori, ognuno sul proprio dispositivo)
   Chi crea la partita ("host") gestisce nemici, danni e piani e
   fa da ponte tra gli altri; gli ospiti muovono il proprio eroe e
   mandano i colpi all'host. Collegamento diretto con PeerJS.
   ========================================================= */
const MP_MAX=4;
const MP={on:false,host:false,peer:null,conn:null,conns:[],myPid:0,players:new Map(),code:'',seed:(Math.random()*1e9)|0,nid:0,emap:new Map(),
  ready:false,redir:-1,netStart:false,hintT:0,pulling:false,grace:new Map(),reco:null,recoTm:0};
MP.live=()=>MP.on&&(MP.host?MP.conns.some(x=>x.c.open):!!(MP.conn&&MP.conn.open));
MP.count=()=>1+(MP.host?MP.conns.filter(x=>x.c.open).length:MP.players.size);
MP.name=()=>(($('coopName')&&$('coopName').value.trim())||store.get('mpname','')||'Giocatore').slice(0,14);
MP.send=m=>{if(MP.host)return MP.bcast(m);if(MP.conn&&MP.conn.open){try{MP.conn.send(m);}catch(e){}}};
MP.bcast=(m,except)=>{for(const x of MP.conns)if(x.c.open&&x.pid!==except){try{x.c.send(m);}catch(e){}}};
MP.sendTo=(pid,m)=>{const x=MP.conns.find(x=>x.pid===pid);if(x&&x.c.open){try{x.c.send(m);}catch(e){}}};
const pName=pid=>{const R=MP.players.get(pid);return (R&&R.name)||'Compagno';};
// più giocatori = più nemici (e guardiani più resistenti)
function mpMul(){return MP.live()?1+0.6*(MP.count()-1):1;}
function mpCapMul(){return Math.min(2,mpMul());}
const PEER_PREFIX='thetower-coop-v2-';
const r2=v=>Math.round((v||0)*100)/100;
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function withSeed(s,fn){const r=Math.random;Math.random=mulberry(s);try{return fn();}finally{Math.random=r;}}

/* ---------- rete ---------- */
const TURN_U='a5944d0595238fc36f2b3238',TURN_P='5r2ZTkU9Jjjh3s+M';
const ICE=[{urls:'stun:stun.relay.metered.ca:80'},{urls:'stun:stun.l.google.com:19302'},
  {urls:'turn:global.relay.metered.ca:80',username:TURN_U,credential:TURN_P},
  {urls:'turn:global.relay.metered.ca:80?transport=tcp',username:TURN_U,credential:TURN_P},
  {urls:'turn:global.relay.metered.ca:443',username:TURN_U,credential:TURN_P},
  {urls:'turns:global.relay.metered.ca:443?transport=tcp',username:TURN_U,credential:TURN_P}];
function patchPeer(){if(!window.Peer||window.Peer.__ice)return;const P0=window.Peer;
  class P2 extends P0{constructor(a,b){if(a&&typeof a==='object'){b=a;a=undefined;}b=Object.assign({},b||{});b.config=Object.assign({iceServers:ICE},b.config||{});if(a===undefined)super(b);else super(a,b);}}
  P2.__ice=true;window.Peer=P2;}
function mpLib(cb){if(window.Peer){patchPeer();return cb();}const s=document.createElement('script');s.src='https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
  s.onload=()=>{patchPeer();cb();};s.onerror=()=>mpStatus('Non riesco a scaricare il modulo di rete. Controlla la connessione.');document.head.appendChild(s);}
function mpStatus(t){const el=$('coopStatus');if(el)el.textContent=t;}
function mpCode(){const A='ACDEFHJKLMNPRTWXY34679';   // niente lettere e cifre che si confondono (O/0, I/1, S/5, Z/2, B/8, G/6, U/V, Q)
  let s='';for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return s;}
function mpHost(){mpLeave(true);store.set('mpname',MP.name());mpStatus('Creo la partita…');
  mpLib(()=>{MP.code=mpCode();MP.host=true;MP.myPid=0;MP.seed=(Math.random()*1e9)|0;
    const p=new Peer(PEER_PREFIX+MP.code);MP.peer=p;
    p.on('open',()=>{MP.on=true;$('coopCodeTxt').textContent=MP.code;$('coopCodeBox').hidden=false;mpStatus(`Manda questo codice ai tuoi amici (fino a ${MP_MAX-1}).`);mpUi();});
    p.on('connection',c=>mpHostWire(c));
    p.on('error',e=>{if(e&&e.type==='unavailable-id'&&!MP.live()&&MP.peer===p&&!p.open){mpHost();return;}if(e&&e.type==='peer-unavailable')return;if(e&&['network','server-error','socket-error','socket-closed','disconnected'].includes(e.type)){setTimeout(hostWatch,1000);return;}mpStatus('Errore di rete: '+((e&&e.type)||'sconosciuto'));});
    p.on('disconnected',()=>{try{p.reconnect();}catch(e){}});});}
function mpHostWire(c){
  c.on('open',()=>{
    const used=new Set(MP.conns.filter(x=>x.c.open).map(x=>x.pid));
    const re=c.metadata&&c.metadata.re,back=!!(re&&MP.grace.has(re)&&!used.has(re));   // chi ha perso la connessione riprende il suo posto
    for(const k of MP.grace.keys())if(!(back&&k===re))used.add(k);
    if(used.size>=MP_MAX-1&&!back){try{c.send({t:'full'});}catch(e){}setTimeout(()=>c.close(),300);return;}
    let pid=1;if(back){pid=re;clearTimeout(MP.grace.get(re));MP.grace.delete(re);}else while(used.has(pid))pid++;
    MP.conns=MP.conns.filter(x=>x.c.open);MP.conns.push({c,pid});
    const names={0:MP.name()};for(const [k,R] of MP.players)names[k]=R.name;
    c.send({t:'welcome',pid,seed:MP.seed,names,re:back});mpUi();});
  c.on('data',m=>{const x=MP.conns.find(x=>x.c===c);if(!x)return;x.rx=performance.now();if(m&&m.t==='ka')return;try{mpMsg(m,x.pid);}catch(e){console.warn('co-op',e);}});
  c.on('close',()=>{const x=MP.conns.find(x=>x.c===c);if(!x)return;MP.conns=MP.conns.filter(y=>y!==x);const pid=x.pid;
    if(x.bye){mpPlayerGone(pid);MP.bcast({t:'leave',pid});return;}
    const R=MP.players.get(pid);toast(`${(R&&R.name)||'Un compagno'} ha perso la connessione`,'Gli tengo il posto per due minuti');
    MP.grace.set(pid,setTimeout(()=>{MP.grace.delete(pid);mpPlayerGone(pid);MP.bcast({t:'leave',pid});},120000));mpUi();});
  c.on('error',()=>{});}
function mpJoin(tries){tries=tries||0;const code=($('coopCode').value||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');$('coopCode').value=code;if(code.length<4){mpStatus('Scrivi il codice che ti ha mandato il tuo amico.');return;}
  mpLeave(true);store.set('mpname',MP.name());mpStatus('Mi collego…');
  mpLib(()=>{MP.host=false;MP.code=code;const p=new Peer();MP.peer=p;
    p.on('open',()=>{const c=p.connect(PEER_PREFIX+code,{reliable:true,serialization:'json'});
      c.on('open',()=>{MP.conn=c;MP.on=true;c.send({t:'hi',n:MP.name()});mpUi();});
      c.on('data',m=>{MP.rx=performance.now();if(m&&m.t==='ka')return;try{mpMsg(m,0);}catch(e){console.warn('co-op',e);}});
      c.on('close',()=>mpLost(c));c.on('error',()=>{});
      setTimeout(()=>{if(!MP.live()&&!MP.reco&&MP.peer===p){if(tries<4){mpStatus(`Riprovo a collegarmi (${tries+2}/5)…`);mpJoin(tries+1);}else mpStatus('Non riesco a collegarmi. Controlla il codice; se è giusto, il tuo amico deve tenere il gioco aperto e in primo piano.');}},8000);});
    p.on('error',e=>{if(MP.peer!==p)return;if(tries<4){mpStatus(`Cerco la stanza, riprovo (${tries+2}/5)…`);setTimeout(()=>{if(MP.peer===p&&!MP.live())mpJoin(tries+1);},3000);return;}mpStatus(e&&e.type==='peer-unavailable'?'Nessuna partita con questo codice. Controlla che sia scritto giusto e chiedi a chi l\'ha creata di tornare nel gioco: la stanza si riapre da sola.':'Errore di rete: '+((e&&e.type)||'sconosciuto'));});});}
function mpPlayerGone(pid){const R=MP.players.get(pid);if(!R)return;mpRemoveHero(R);MP.players.delete(pid);
  toast(`${R.name||'Un compagno'} è uscito`,MP.players.size?'La partita continua':'Continui da solo');
  if(MP.host)mpTryAdvance();mpUi();}
function mpDrop(){const wasLive=MP.on;MP.on=false;MP.conn=null;for(const R of MP.players.values())mpRemoveHero(R);MP.players.clear();
  if(wasLive)toast('Partita co-op chiusa','Torni al seminterrato');
  if(MP.ready){MP.ready=false;mpWait(false);}
  if(G.scene==='tower'&&wasLive){for(const e of G.enemies)if(e.net&&!e.dead){scene.remove(e.parts.root);e.dead=true;}
    G.state='menu';$('deathFx').classList.remove('on');G.deathSlow=0;['over','pause','upgrade'].forEach(id=>$(id).hidden=true);fadeThen(()=>{enterCellar();G.fadeTarget=0;});}
  mpUi();}
function mpLost(c){if(MP.conn!==c)return;MP.conn=null;MP.reco={t0:performance.now(),code:MP.code,pid:MP.myPid};toast('Connessione persa','Provo a rientrare nel gruppo…');mpUi();mpRetry();}
function mpRetry(){const R=MP.reco;if(!R)return;clearTimeout(MP.recoTm);
  if(performance.now()-R.t0>150000){MP.reco=null;try{MP.peer&&MP.peer.destroy();}catch(e){}MP.peer=null;mpDrop();return;}
  try{MP.peer&&MP.peer.destroy();}catch(e){}const p=new Peer();MP.peer=p;
  p.on('open',()=>{if(MP.peer!==p||!MP.reco)return;const c=p.connect(PEER_PREFIX+R.code,{reliable:true,serialization:'json',metadata:{re:R.pid}});
    c.on('open',()=>{if(MP.peer!==p||!MP.reco)return;MP.conn=c;MP.on=true;MP.reco=null;clearTimeout(MP.recoTm);c.send({t:'hi',n:MP.name(),re:1});toast('Di nuovo nel gruppo','Connessione ripresa');sfx('lvl');mpUi();});
    c.on('data',m=>{MP.rx=performance.now();if(m&&m.t==='ka')return;try{mpMsg(m,0);}catch(e){console.warn('co-op',e);}});c.on('close',()=>mpLost(c));c.on('error',()=>{});});
  p.on('error',()=>{});MP.recoTm=setTimeout(mpRetry,6000);}
function mpBye(){const m={t:'bye'};try{MP.conn&&MP.conn.open&&MP.conn.send(m);}catch(e){}for(const x of MP.conns){try{x.c.open&&x.c.send(m);}catch(e){}}}
// NIENTE "bye" su pagehide: su iPhone scatta anche solo cambiando app un attimo e scioglieva il gruppo.
// Se la pagina si chiude davvero la connessione cade da sola e scatta l'attesa per il rientro.
// Battito: ogni 2 s un messaggio leggero; se da un compagno non arriva nulla per troppo tempo (connessione "zombie" dopo un cambio app)
// la si chiude e si rientra da soli nel gruppo, tenendo il posto.
setInterval(()=>{if(document.hidden||!MP.on)return;const now=performance.now();
  if(MP.host){for(const x of MP.conns){if(!x.c.open)continue;try{x.c.send({t:'ka'});}catch(e){}if(x.rx&&now-x.rx>25000){x.rx=0;try{x.c.close();}catch(e){}}}}
  else if(MP.conn&&MP.conn.open){try{MP.conn.send({t:'ka'});}catch(e){}if(MP.rx&&now-MP.rx>12000&&now-(MP.visT||0)>4000){const c=MP.conn;MP.rx=0;try{c.close();}catch(e){}mpLost(c);}}},2000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){MP.visT=performance.now();MP.rx=performance.now();for(const x of MP.conns)x.rx=performance.now();}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&MP.reco)mpRetry();});
function mpLeave(quiet){mpBye();MP.reco=null;clearTimeout(MP.recoTm);for(const t of MP.grace.values())clearTimeout(t);MP.grace.clear();const c=MP.conn,p=MP.peer,cs=MP.conns;MP.on=false;MP.conn=null;MP.conns=[];MP.peer=null;MP.code='';
  try{c&&c.close();}catch(e){}for(const x of cs){try{x.c.close();}catch(e){}}try{p&&p.destroy();}catch(e){}
  for(const R of MP.players.values())mpRemoveHero(R);MP.players.clear();MP.ready=false;
  if($('coopCodeBox'))$('coopCodeBox').hidden=true;if(!quiet)mpStatus('Sei uscito dalla co-op.');mpUi();}
function mpUi(){const live=MP.live(),n=MP.count(),names=[...MP.players.values()].map(R=>R.name||'compagno');
  $('coopLeave').hidden=!(MP.on||MP.peer);$('coopHost').disabled=MP.on;$('coopJoin').disabled=MP.on;
  $('coopBtn').textContent=live?`Co-op · ${n} giocatori`:(MP.on&&MP.host?'Co-op · in attesa':'Co-op');$('coopBtn').classList.toggle('live',live);
  if(live)mpStatus(`In partita: ${[MP.name(),...names].join(', ')}. `+(MP.host?(n<MP_MAX?`Possono entrare altri ${MP_MAX-n}. `:'')+'Vai alla scala della torre per partire tutti insieme.':'La scalata parte quando chi ha creato la partita sale la scala.'));}

/* ---------- messaggi ---------- */
function mpMsg(m,from){
  switch(m.t){
  case 'bye':if(MP.host){const x=MP.conns.find(y=>y.pid===from);if(x)x.bye=true;}else{MP.conn=null;mpDrop();}break;
  case 'welcome':MP.myPid=m.pid;MP.seed=m.seed;for(const k in m.names){const pid=+k;if(pid===MP.myPid)continue;const R=mpPlayer(pid);R.name=m.names[k];}
    if(m.re){mpUi();break;}toast('Sei in partita',`Con ${Object.keys(m.names).filter(k=>+k!==MP.myPid).map(k=>m.names[k]).join(', ')}`);sfx('lvl');mpUi();break;
  case 'hi':if(MP.host&&m.re&&MP.players.has(from)){const R=MP.players.get(from);toast(`${R.name||'Un compagno'} è di nuovo nel gruppo`,'');mpUi();break;}if(MP.host){const R=mpPlayer(from);R.name=String(m.n||'Compagno').slice(0,14);MP.bcast({t:'name',pid:from,n:R.name},from);
    toast('Nuovo compagno',R.name+' è nella partita');sfx('lvl');if(G.scene==='tower')toast('Nuovo compagno',R.name+' entra alla prossima scalata');mpUi();}break;
  case 'name':{const R=mpPlayer(m.pid);R.name=m.n;toast('Nuovo compagno',m.n+' è nella partita');mpUi();break;}
  case 'leave':if(!MP.host)mpPlayerGone(m.pid);break;
  case 'full':mpStatus(`Questa partita è già piena (${MP_MAX} giocatori).`);mpLeave(true);break;
  case 's':{const pid=MP.host?from:m.pid;if(pid===MP.myPid)break;if(MP.host){m.pid=pid;MP.bcast(m,pid);}mpRecvState(pid,m);break;}
  case 'e':if(!MP.host)mpApplySnap(m);break;
  case 'hit':if(MP.host){MP.hitFrom=from;try{mpRemoteHit(m);}finally{MP.hitFrom=null;}}break;
  case 'hurt':if(!MP.host&&G.scene==='tower'&&m.f===G.floor)hurtPlayer(m.d,m.fx,m.eff);break;
  case 'xp':if(!MP.host&&G.scene==='tower'&&m.f===G.floor&&!P.dead)dropXP(m.x,m.y,m.v);break;
  case 'proj':if(!MP.host&&G.scene==='tower'&&m.f===G.floor)_spawnProj(Object.assign({},m.o));break;
  case 'warn':if(!MP.host&&G.scene==='tower'&&m.f===G.floor)_addWarn(m.x,m.w,m.d,()=>{});break;
  case 'pil':if(!MP.host&&G.scene==='tower'&&m.f===G.floor){const x=m.x;lightning(x,CEIL,x,0);burst(x,0.3,m.c,16,5,4,0.4);sfx('zap');shake(0.2);
    if(!P.dead&&Math.abs(P.x-x)<0.7+P.w/2)_hurtPlayer(m.d,x,m.eff);}break;
  case 'ready':{const pid=MP.host?from:m.pid;const R=MP.players.get(pid);if(R)R.ready=true;if(MP.host){MP.bcast({t:'ready',pid},pid);mpTryAdvance();}break;}
  case 'next':if(!MP.host)mpGoNext(m.f);break;
  case 'down':{const pid=MP.host?from:m.pid;const R=MP.players.get(pid);if(R)R.dead=true;if(MP.host)MP.bcast({t:'down',pid},pid);
    if(P.dead&&G.scene==='tower'){if(!mpAnyAlive())G.overT=Math.min(G.overT,1.2);}
    else if(G.scene==='tower'&&G.state!=='over')toast(`${pName(pid)} è caduto`,'Arriva al cancello per riportarlo in gioco al piano dopo');
    if(MP.host)mpTryAdvance();break;}
  case 'start':if(!MP.host){MP.seed=m.seed;MP.netStart=true;G.hordeNext=!!m.horde;G.warpTo=m.w||0;
    ['over','pause','upgrade','loot','settings','classes','win','coop','safePed'].forEach(id=>{const el=$(id);if(el)el.hidden=true;});
    $('deathFx').classList.remove('on');G.deathSlow=0;clearInput();G.state='menu';
    fadeThen(()=>{if(m.resume>1){coopResumeGuest(m);G.fadeTarget=0;return;}startRun();G.fadeTarget=0;});}break;
  case 'reqStart':if(MP.host){if(G.state==='cellar'){G.state='menu';$('prompt').hidden=true;$('bUse').hidden=true;fadeThen(()=>{startRun();G.fadeTarget=0;});}
    else toast(`${pName(from)} è pronto`,'Sali la scala della torre per partire tutti insieme');}break;
  }
}

/* ---------- stato degli eroi (inviato 20 volte al secondo) ---------- */
const AKEYS=['t','wind','act','rec','hand','anim','mv','fin','r0','rest','from','to','restSh','wSh','aSh','hold'];
function mpMyState(){const A=P.atk,w=G.weapon||{};let a=null;if(A){a={};for(const k of AKEYS)if(A[k]!==undefined)a[k]=A[k];}
  return {t:'s',pid:MP.myPid,x:r2(P.x),y:r2(P.y),z:r2(P.z),vx:r2(P.vx),vy:r2(P.vy),f:P.face,g:P.onGround?1:0,d:P.dead?1:0,hp:Math.round(P.hp),mh:Math.round(S.maxHp||100),
    ft:r2(P.flipT),sr:r2(P.stretchT),lt:r2(P.landT),da:r2(P.dashT),ht:r2(P.hurtT),iv:r2(P.invul),sh:r2(P.shieldT),rg:r2(P.rageT),br:r2(P.bearT),dr:P.dragon||null,
    ch:r2(P.chargeT),sp:r2(P.spinT),th:r2(P.throwT),kd:r2(P.skidT),sc:G.scene,st:G.state,et:r2(G.enterT),ct:r2(P.climbTurn),fl:G.floor,
    c:G.cls?G.cls.id:'',sk:G.cls?skinOf(G.cls.id):0,sv:G.cls&&typeof varOf==='function'?varOf(G.cls.id):'',w:[w.type||'spada',w.rarity||0,w.v||0,w.effect||''],ws:r2(G.weapon?weaponScale():1),atk:a};}
function mpPlayer(pid){let R=MP.players.get(pid);if(!R){R={pid,name:'',x:0,y:0,z:0,tx:0,ty:0,tz:0,walkT:0,lastStep:0,atk:null,hero:null,hkey:'',ready:false,dead:false,sc:'',fl:0,st:''};MP.players.set(pid,R);}return R;}
function mpRecvState(pid,m){mpRecvInto(mpPlayer(pid),m);}
function mpRecvInto(R,m){
  const snap=R.sc!==m.sc||R.fl!==m.fl||Math.abs(R.x-m.x)>6||!R.seen;R.seen=true;
  Object.assign(R,{tx:m.x,ty:m.y,tz:m.z,vx:m.vx,vy:m.vy,face:m.f,onGround:!!m.g,dead:!!m.d,hp:m.hp,mh:m.mh,flipT:m.ft,stretchT:m.sr,landT:m.lt,dashT:m.da,hurtT:m.ht,invul:m.iv,
    shieldT:m.sh,rageT:m.rg,bearT:m.br,dragon:m.dr,chargeT:m.ch,spinT:m.sp,throwT:m.th,skidT:m.kd||0,sc:m.sc,st:m.st,et:m.et,climbTurn:m.ct,fl:m.fl,c:m.c,w:m.w,ws:m.ws});
  if(snap){R.x=m.x;R.y=m.y;R.z=m.z;R.buf=[];R.lastRt=null;}
  bufPush(R,{t:performance.now(),x:m.x,y:m.y,z:m.z,vx:m.vx,vy:m.vy});R.svx=m.vx;
  if(!m.atk)R.atk=null;
  else if(!R.atk||R.atk.mv!==m.atk.mv||R.atk.anim!==m.atk.anim||Math.abs(R.atk.t-m.atk.t)>0.12||m.atk.t<R.atk.t-0.05){R.atk=Object.assign({},m.atk);}
  R.sk=m.sk||0;R.sv=m.sv||'';const key=m.c+'|'+(m.sk||0)+'|'+(m.sv||'')+'|'+m.w.join(',');if(key!==R.hkey)mpMakeHero(R,m.c,m.w,m.sk);}
function mpMakeHero(R,cid,w,sk){mpRemoveHero(R);const cls=CLASSES.find(c=>c.id===cid)||CLASSES[0];
  try{const h=buildSkin(cls,sk!=null?sk:(SKINPICK[cls.id]||0));if(R.sv&&typeof recolor==='function')recolor(h.root,R.sv);scene.add(h.root);const wo={type:w[0],rarity:w[1],v:w[2],effect:w[3]||null};
    const a=applyVariant(buildWeaponMesh(wo.type,wo.rarity,wo.effect),wo);h.arms[0].wr.add(a.g);h.wpnF=a.g;h.tipF=a.tip;h.wpnB=null;h.tipB=null;
    if(wo.type==='pugnali'){const b=applyVariant(buildWeaponMesh(wo.type,wo.rarity,wo.effect),wo);h.arms[1].wr.add(b.g);h.tipB=b.tip;h.wpnB=b.g;}
    R.hero=h;R.wobj=wo;R.cls=cls;R.hkey=cid+'|'+(sk||0)+'|'+(R.sv||'')+'|'+w.join(',');}catch(e){console.warn('co-op hero',e);R.hero=null;R.hkey='';}}
function mpRemoveHero(R){if(R.hero){scene.remove(R.hero.root);disposeObj(R.hero.root);R.hero=null;}R.hkey='';if(R.tag){R.tag.remove();R.tag=null;}if(R.mate){R.mate.remove();R.mate=null;}}
// riproduzione fluida: si mostra il movimento con un piccolo ritardo, interpolando tra i dati ricevuti
const INTERP_MS=110;
function bufPush(o,s){const b=o.buf||(o.buf=[]),l=b[b.length-1];if(l){const d=Math.min(400,s.t-l.t);o.iv=o.iv==null?d:o.iv*0.9+d*0.1;o.jit=o.jit==null?0:o.jit*0.9+Math.abs(d-o.iv)*0.1;}
  b.push(s);if(b.length>32)b.shift();const tg=Math.max(40,Math.min(130,(o.iv||50)+2*(o.jit||0)+8));o.delay=o.delay==null?tg:o.delay+Math.max(-3,Math.min(3,tg-o.delay));}
// il tempo mostrato non torna mai indietro: niente passi all'indietro quando il ritardo si regola
function renderT(o){let t=performance.now()-(o.delay||INTERP_MS);if(o.lastRt!=null&&t<o.lastRt)t=o.lastRt;o.lastRt=t;return t;}
function sampleAt(buf,t){if(!buf||!buf.length)return null;const n=buf.length;
  if(t<=buf[0].t)return buf[0];
  for(let i=n-1;i>0;i--){const a=buf[i-1],b=buf[i];if(t>=a.t&&t<=b.t){const k=(t-a.t)/Math.max(1,b.t-a.t);return {x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k,z:a.z+(b.z-a.z)*k};}}
  const l=buf[n-1],ex=Math.min(0.18,(t-l.t)/1000);   // oltre l'ultimo dato: si prosegue per poco nella stessa direzione
  return {x:l.x+(l.vx||0)*ex,y:Math.max(0,l.y+(l.vy||0)*ex),z:l.z};}
const RKEYS=['x','y','z','vx','vy','face','onGround','dead','flipT','stretchT','landT','dashT','hurtT','invul','shieldT','rageT','bearT','dragon','chargeT','spinT','throwT','skidT','climbTurn','atk','walkT','lastStep'];
const mpVisible=R=>(R.hub?HUB.on&&G.safe:MP.live())&&R.hero&&R.sc===G.scene&&(G.scene==='cellar'||R.fl===G.floor)&&!['intro','waking','cine'].includes(G.state)&&!['intro','waking','cine','select'].includes(R.st)&&!(R.st==='climb'&&R.tz<-3.5);
const TAGCOL=['#ffd27a','#7ff0e4','#ff9ad5','#a8ff7a'];
function mpDrawRemote(dt){
  const box=$('mpMate');let anyMate=false;
  for(const R of [...MP.players.values(),...HUB.players.values()]){
    const vis=mpVisible(R);if(R.hero)R.hero.root.visible=!!vis;const col=R.hub?'#c7a8ff':TAGCOL[R.pid%4];
    const showMate=!R.hub&&MP.live()&&G.scene==='tower'&&R.sc==='tower'&&R.seen;
    if(showMate){anyMate=true;if(!R.mate){R.mate=document.createElement('div');R.mate.className='mate-row';R.mate.innerHTML='<small></small><div class="bar mate"><i class="fill"></i></div>';box.appendChild(R.mate);}
      R.mate.style.setProperty('--mc',col);{const tx=(R.name||'Compagno')+(R.dead?' · a terra':'');if(R.mate.firstChild.textContent!==tx)R.mate.firstChild.textContent=tx;}R.mate.querySelector('.fill').style.transform=`scaleX(${R.dead?0:Math.max(0,R.hp/(R.mh||100))})`;}
    else if(R.mate){R.mate.remove();R.mate=null;}
    if(!vis){if(R.tag)R.tag.hidden=true;continue;}
    {const px=R.x;const s=sampleAt(R.buf,renderT(R));if(s){R.x=s.x;R.y=s.y;R.z=s.z;}else{const k=damp(dt,16);R.x+=(R.tx-R.x)*k;R.y+=(R.ty-R.y)*k;R.z+=(R.tz-R.z)*k;}
      const v=dt>0?(R.x-px)/dt:0;R.dvx=R.dvx==null?v:R.dvx+(v-R.dvx)*Math.min(1,dt*12);R.vx=Math.abs(R.dvx)<0.3?0:R.dvx;}
    if(R.atk){R.atk.t+=dt;if(R.atk.t>=R.atk.wind+R.atk.act+R.atk.rec+0.05&&!R.atk.hold)R.atk=null;}
    for(const a of R.hero.arms)a.wr.scale.setScalar(R.ws||1);
    // si riusa l'animazione dell'eroe locale scambiando per un attimo i dati
    const bk={};for(const k2 of RKEYS){bk[k2]=P[k2];P[k2]=R[k2];}
    const gH=hero,gW=G.weapon,gC=G.cls,gS=G.state,gE=G.enterT,uT=updTrail,uB=updBear;
    hero=R.hero;G.weapon=R.wobj;G.cls=R.cls;G.state=(R.st==='climb'||R.st==='enter')?R.st:'play';G.enterT=R.et||0;updTrail=()=>{};updBear=()=>{};
    try{_updHeroVisual(dt);}catch(e){MP.lastErr=String(e&&e.stack||e).slice(0,400);}finally{for(const k2 of RKEYS){R[k2]=P[k2];P[k2]=bk[k2];}hero=gH;G.weapon=gW;G.cls=gC;G.state=gS;G.enterT=gE;updTrail=uT;updBear=uB;}
    if(!R.tag){R.tag=document.createElement('div');R.tag.className='mp-tag';document.body.appendChild(R.tag);R.tagT=R.tagC=R.tagX=R.tagY=null;}
    {const tx=R.name||'Compagno';if(R.tagT!==tx){R.tagT=tx;R.tag.textContent=tx;R.tagW=0;}if(R.tag.hidden)R.tag.hidden=false;if(R.tagC!==col){R.tagC=col;R.tag.style.setProperty('--mc',col);}
      if(R.tagD!==!!R.dead){R.tagD=!!R.dead;R.tag.classList.toggle('down',R.tagD);R.tagW=0;}}
  }
  if(box)box.hidden=!anyMate;
}

/* ---------- host: i nemici inseguono il giocatore più vicino ---------- */
const mpTargetable=R=>R.sc==='tower'&&R.fl===G.floor&&R.st==='play'&&!R.dead;
function mpAnyAlive(){for(const R of MP.players.values())if(R.sc==='tower'&&R.fl===G.floor&&!R.dead)return true;return false;}
const _updEnemy=updEnemy;
updEnemy=function(e,dt){
  if(!MP.host&&e.net){mpPuppet(e,dt);return;}
  if(!MP.host||!MP.live()){e.tg=-1;return _updEnemy(e,dt);}
  let best=-1,bd=P.dead?1e9:Math.hypot(P.x-e.x,P.y-e.y)-(e.tg===-1?2:0);
  for(const R of MP.players.values()){if(!mpTargetable(R))continue;const d=Math.hypot(R.x-e.x,R.y-e.y)-(e.tg===R.pid?2:0);if(d<bd){bd=d;best=R.pid;}}
  e.tg=best;if(best<0)return _updEnemy(e,dt);
  const R=MP.players.get(best);
  const b=[P.x,P.y,P.vx,P.vy,P.dead,P.onGround];P.x=R.x;P.y=R.y;P.vx=R.vx;P.vy=R.vy;P.dead=false;P.onGround=R.onGround;MP.redir=best;
  try{_updEnemy(e,dt);}finally{MP.redir=-1;[P.x,P.y,P.vx,P.vy,P.dead,P.onGround]=b;}
};
const _hurtPlayer=hurtPlayer;
hurtPlayer=function(d,fx,eff){
  if(MP.redir>=0){const R=MP.players.get(MP.redir);if(R&&!R.dead&&!(R.invul>0)&&!(R.dashT>0)){MP.sendTo(R.pid,{t:'hurt',f:G.floor,d,fx,eff});burst(R.x,R.y+1,0xe0434f,6,4,2);}return;}
  return _hurtPlayer(d,fx,eff);
};
const _spawnProj=spawnProj;
spawnProj=function(o){
  if(MP.host&&MP.live()&&o&&o.owner==='e'&&G.scene==='tower'){const c={};for(const k in o){const v=o[k];if(typeof v==='number'||typeof v==='string'||typeof v==='boolean')c[k]=v;}MP.bcast({t:'proj',f:G.floor,o:c});}
  return _spawnProj(o);
};
const _addWarn=addWarn;
addWarn=function(x,w,dur,cb){if(MP.host&&MP.live())MP.bcast({t:'warn',f:G.floor,x,w,d:dur});return _addWarn(x,w,dur,cb);};
const _pillar=pillar;
pillar=function(e,x){if(MP.host&&MP.live())MP.bcast({t:'pil',f:G.floor,x,d:e.dmg*1.1,c:e.color,eff:e.eff||null});return _pillar(e,x);};
const _spawnEnemy=spawnEnemy;
spawnEnemy=function(type,o){const e=_spawnEnemy(type,o);if(e&&e.id==null){e.id=++MP.nid;
  if(type==='boss'&&!G.tutorial){e.hp*=1.4;e.maxHp=e.hp;e.dmg=(e.dmg||10)*2.4;}   // guardiani più forti
  if(type==='boss'&&MP.host&&MP.live()){const k=1+0.7*(MP.count()-1);e.hp*=k;e.maxHp=e.hp;}
  if(MP.host&&MP.live()&&!G.pvp){const n=Math.min(4,MP.count())-1,hm=(type==='boss'?[1,1.08,1.18,1.3]:[1,1.12,1.4,1.7])[n],dm=[1,1.05,1.18,1.3][n];e.hp*=hm;e.maxHp=e.hp;e.dmg=(e.dmg||10)*dm;}}return e;};
const _buildQueue=buildQueue;
buildQueue=function(f){const q=_buildQueue(f);if(!MP.host||!MP.live()||!q.length||q[0]==='boss')return q;
  const extra=Math.round(q.length*(mpMul()-1));for(let i=0;i<extra;i++)q.push(q[Math.floor(Math.random()*q.length)]);return q;};
function mpRemoteHit(m){if(G.scene!=='tower'||m.f!==G.floor)return;const e=G.enemies.find(x=>x.id===m.id&&!x.dead);if(!e)return;
  const c=S.crit,h0=e.hp,by=MP.hitFrom;S.crit=-9;if(by!=null)e.lastBy=by;   // uccisioni e danni vanno a chi ha colpito davvero
  try{_hitEnemy(e,m.d,m.dir,{kb:m.kb,ky:m.ky,hs:m.hs,stun:m.stun,launch:m.launch,unblockable:m.unb,effect:m.eff,noCombo:true});}finally{S.crit=c;}
  if(by!=null)RK.dmgBy[by]=(RK.dmgBy[by]||0)+Math.max(0,h0-Math.max(0,e.hp));}
function mpSnap(){
  const l=[];for(const e of G.enemies){if(e.dead)continue;
    l.push([e.id,e.type,r2(e.x),r2(e.y),r2(e.vx),r2(e.vy),e.face,e.state||'',r2(e.t),r2(e.warn),Math.round(e.hp),Math.round(e.maxHp),r2(e.stunT),r2(e.slowT),e.onGround?1:0,e.phased?1:0,
      r2(e.castT),r2(e.spawnT),r2(e.hitstun),e.lastDir||1,e.elite?1:0,e.summon?1:0,e.n||0,e.phase||1,r2(e.landT),r2(e.hopT),e.flash>0?1:0,e.mode||'',e.ename||'',e.emod||'']);}
  return {t:'e',f:G.floor,q:G.queue.slice(),cl:G.cleared?1:0,l};}

/* ---------- ospiti: i nemici sono "marionette" mosse dall'host ---------- */
function mpPuppet(e,dt){const s=sampleAt(e.buf,renderT(e));if(s){e.x=s.x;e.y=s.y;}else{const k=damp(dt,14);e.x+=(e.nx-e.x)*k;e.y+=(e.ny-e.y)*k;}e.t+=dt;e.flash-=dt;e.flinch-=dt;e.castT-=dt;e.landT-=dt;}
function mpApplySnap(s){
  if(G.scene!=='tower'||s.f!==G.floor||G.tutorial||G.pvp)return;
  G.queue=s.q.slice();G.spawnT=1e9;const seen=new Set();
  for(const a of s.l){const id=a[0];seen.add(id);let e=MP.emap.get(id);if(e&&e.dead)continue;
    if(!e){e=_spawnEnemy(a[1],{x:a[2],summon:true});e.net=true;e.id=id;e.summon=!!a[21];e.x=a[2];e.y=a[3];MP.emap.set(id,e);
      if(a[20]){e.elite=true;e.sc=1.2;for(const m of e.parts.mats){m.userData.baseE=ELITE_GOLD;m.userData.baseI=0.25;}}}
    e.nx=a[2];e.ny=a[3];e.vx=a[4];e.vy=a[5];bufPush(e,{t:performance.now(),x:a[2],y:a[3],z:0,vx:a[4],vy:a[5]});e.face=a[6];e.state=a[7];e.t=a[8];e.warn=a[9];e.hp=a[10];e.maxHp=a[11];e.stunT=a[12];e.slowT=a[13];e.onGround=!!a[14];e.phased=!!a[15];
    e.castT=a[16];e.spawnT=a[17];e.hitstun=a[18];e.lastDir=a[19];e.n=a[22];e.phase=a[23];e.landT=a[24];e.hopT=a[25];if(a[26])e.flash=Math.max(e.flash,0.06);e.mode=a[27];e.ename=a[28]||'';e.emod=a[29]||'';}
  for(const e of G.enemies)if(e.net&&!e.dead&&!seen.has(e.id)){e.hp=0;e.critKill=false;killEnemy(e);}
  if(s.cl&&!G.cleared&&aliveCount()===0&&!G.queue.length){G.cleared=true;STATS.floors++;burst(GATE_X,2.5,0xffc56b,30,5,3,0.2);sfx('clear');sfx('gate');lockM.emissive.setHex(0x7fe08a);}
}
const _hitEnemy=hitEnemy;
hitEnemy=function(e,base,dir,o){
  if(MP.host||!e.net||!MP.live())return _hitEnemy(e,base,dir,o);
  o=o||{};if(e.dead||e.spawnT>0)return false;
  if(e.type==='wraith'&&e.phased){if(!(e.immT>0)){popNum(e.x,e.y+e.h+0.3,'Immune','info');e.immT=0.4;}return false;}
  if(!o.noCombo){if(G.time-G.cmbT<1.6)G.cmb++;else G.cmb=1;G.cmbT=G.time;base*=1+Math.min(0.6,(G.cmb-1)*0.05);const c=$('combo');c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop');}
  const crit=!!o.crit||Math.random()<S.crit+(o.critBonus||0)+(o.melee?(G.weapon.critB||0):0),d=Math.max(1,Math.round(base*(crit?2:1)));if(crit&&!o.env&&!o.card)cardCrit(e,dir);
  e.hp-=d;e.flash=0.1;e.flinch=0.2;e.lastDir=dir;
  popNum(e.x,e.y+e.h+0.3,String(d),crit?'crit':'');burst(e.x-dir*0.1,e.y+e.h*0.55,crit?0xffb347:0xffffff,crit?8:4,6,2);bleed(e,dir,crit);
  if(o.melee){G.hitstop=Math.max(G.hitstop,crit?0.07:0.04);sfx((WSND[G.weapon.type]||{}).hit||'hit');if(crit)sfx('crit');let ls=S.lifesteal+(P.rageT>0?3:0);if(S.lsUp>0&&G.time>=(P.lsNext||0)){ls+=S.lsUp;P.lsNext=G.time+0.5;}if(ls>0)heal(ls,true);}
  else sfx('hit');
  if(crit)shake(0.18);
  if(o.effect==='vampiro')heal(Math.max(1,Math.round(base*0.08)),true);
  MP.send({t:'hit',f:G.floor,id:e.id,d,dir,kb:o.kb,ky:o.ky,hs:o.hs,stun:o.stun,launch:o.launch,unb:o.unblockable,eff:o.effect==='vampiro'?null:(o.effect||null)});
  return true;
};
const _bossSpawnNow=bossSpawnNow;
bossSpawnNow=function(){
  if(MP.host||!MP.live())return _bossSpawnNow();
  const B=G.bi;if(!B||B.e)return;const e=G.enemies.find(x=>x.type==='boss'&&!x.dead);if(!e)return;
  G.queue=[];B.e=e;e.face=-1;B.by=e.y;burst(e.x,e.y+e.h*0.5,B.d.color,60,9,4,0.4);burst(e.x,e.y+0.3,0x1a1420,40,6,2,0.2);sfx('boom');
};

/* ---------- stesse stanze per tutti ---------- */
const _buildLevel=buildLevel;
buildLevel=function(f){if(!MP.live())return _buildLevel(f);const zi=zoneIndex(f);if(G.zoneBuilt!==zi)applyZone(zi);return withSeed(MP.seed*131+f*7919,()=>_buildLevel(f));};
const _startFloor=startFloor;
startFloor=function(f){
  _startFloor(f);if(G.safe&&!G.tutorial)hubJoin(f);else hubLeave();MP.emap=new Map();MP.ready=false;for(const R of MP.players.values())R.ready=false;mpWait(false);
  if(!MP.live()||G.tutorial)return;
  const ex=withSeed(MP.seed*977+f*31,()=>isBossFloor(f)?rand(-HALF+3,-HALF+11):rand(-HALF+3,GATE_X-9));
  if(G.entry){G.entry.g.position.x=ex;G.entry.x=ex;keepDoorClear();}
  P.x=ex+[-0.6,0.6,-0.2,0.2][MP.myPid%4];P.face=ex<0?1:-1;
  if(!MP.host)G.spawnT=1e9;
};

/* ---------- salire tutti insieme ---------- */
function mpWait(on){const w=$('mpWait');if(w)w.hidden=!on;}
const mpInTower=()=>[...MP.players.values()].some(R=>R.sc==='tower');
const _nextFloor=nextFloor;
nextFloor=function(){
  if(!MP.live()||!mpInTower())return _nextFloor();
  MP.ready=true;MP.send({t:'ready',pid:MP.myPid,f:G.floor});mpWait(true);clearInput();
  if(MP.host)mpTryAdvance();
};
function mpTryAdvance(){if(!MP.host||G.scene!=='tower')return;
  if(!MP.live()&&MP.ready){MP.ready=false;mpWait(false);_nextFloor();return;}
  let any=MP.ready;if(!(MP.ready||P.dead))return;
  for(const R of MP.players.values()){if(R.sc!=='tower')continue;if(R.ready)any=true;else if(!R.dead)return;}
  if(!any)return;   // nessuno è ancora arrivato alle scale
  const f=G.floor+1;MP.bcast({t:'next',f});mpGoNext(f);}
function mpRevive(){P.dead=false;P.hp=Math.max(1,Math.round(S.maxHp*0.5));P.dot=null;$('deathFx').classList.remove('on');G.deathSlow=0;G.overT=1.5;if(hero)hero.root.rotation.z=0;}
function mpGoNext(f){
  mpWait(false);MP.ready=false;for(const R of MP.players.values()){R.ready=false;R.dead=false;}
  if(P.dead)mpRevive();
  ['upgrade','pause','loot','over'].forEach(id=>{const el=$(id);if(el)el.hidden=true;});
  if(G.state==='play'||G.state==='upgrade'||G.state==='pause')collectAllItems();
  clearInput();G.fadeCb=null;G.fade=1;G.floor=f-1;_nextFloor();
}
const _playerDie=playerDie;
playerDie=function(){
  _playerDie();
  if(!MP.live()||G.scene!=='tower')return;
  MP.send({t:'down',pid:MP.myPid});
  if(mpAnyAlive()){G.overT=1e9;toast('Sei a terra','Se un compagno arriva al cancello, rientri al piano dopo');if(MP.host)setTimeout(mpTryAdvance,50);}
};
const _startRun=startRun;
startRun=function(){
  if(MP.live()){
    if(MP.host){MP.seed=(Math.random()*1e9)|0;MP.bcast({t:'start',seed:MP.seed,horde:!!G.hordeNext,w:G.warpTo||0});}
    else if(!MP.netStart){MP.send({t:'reqStart'});enterCellar();toast('Pronto!','La scalata parte quando chi ha creato la partita sale la scala');return;}
  }
  MP.netStart=false;_startRun();
};
const _updCamera=updCamera;
updCamera=function(dt){
  if(MP.live()&&P.dead&&G.scene==='tower'&&G.state==='play'&&!(G.deathSlow>0)){
    let R=null;for(const r of MP.players.values())if(r.sc==='tower'&&r.fl===G.floor&&!r.dead){R=r;break;}
    if(R){const bx=P.x,by=P.y;P.x=R.x;P.y=R.y;P.dead=false;$('deathFx').classList.remove('on');try{_updCamera(dt);}finally{P.x=bx;P.y=by;P.dead=true;}return;}}
  _updCamera(dt);
};
const _updHeroVisual=updHeroVisual;
updHeroVisual=function(dt){if(MP.players.size||HUB.players.size)mpDrawRemote(dt);_updHeroVisual(dt);};

/* ---------- invio periodico ---------- */
setInterval(()=>{
  HUB.tick=(HUB.tick||0)+1;
  if(HUB.on&&HUB.tick%2===0){const s=mpMyState();s.t='hs';s.sid=HUB.sid;s.n=MP.name();s.code=MP.live()?MP.code:'';
    if(HUB.lead)HUB.bcast(s);else if(HUB.conn&&HUB.conn.open){try{HUB.conn.send(s);}catch(e){}}}
  if(!MP.live())return;
  MP.send(mpMyState());
  if(MP.host&&G.scene==='tower'&&!G.pvp)MP.bcast(mpSnap());
  // se chi ha creato la partita torna al seminterrato, gli altri lo seguono
  const H=MP.players.get(0);
  if(!MP.host&&H&&H.seen&&G.scene==='tower'&&H.sc==='cellar'&&!MP.pulling&&!['menu','tip','intro','waking'].includes(G.state)){MP.pulling=true;
    toast(`${H.name||'Il compagno'} è tornato al seminterrato`,'Lo raggiungi');mpWait(false);
    ['over','pause','upgrade','loot'].forEach(id=>{const el=$(id);if(el)el.hidden=true;});$('deathFx').classList.remove('on');G.deathSlow=0;clearInput();
    G.state='menu';fadeThen(()=>{enterCellar();G.fadeTarget=0;MP.pulling=false;});}
  const W=[...MP.players.values()].find(R=>R.ready);
  if(W&&!MP.ready&&G.state==='play'&&G.scene==='tower'&&!P.dead){MP.hintT-=0.05;if(MP.hintT<=0){MP.hintT=2;setHint(G.cleared?`${W.name||'Un compagno'} ti aspetta sulle scale: attraversa il cancello`:`${W.name||'Un compagno'} ti aspetta sulle scale`,1.8);}}
},50);

/* ---------- schermata Co-op ---------- */
function openCoop(){if(G.state!=='cellar')return;G.state='coop';clearInput();$('prompt').hidden=true;$('bUse').hidden=true;$('touch').hidden=true;
  $('coopName').value=store.get('mpname','')||'';$('coop').hidden=false;mpUi();if(!MP.on&&!MP.peer)mpStatus('');}
function closeCoop(){$('coop').hidden=true;if(G.state==='coop'){G.state='cellar';$('touch').hidden=!isTouch;canvas.focus();}}
$('coopBtn').onclick=()=>{sfx('ui');openCoop();};
$('coopClose').onclick=()=>{sfx('ui');closeCoop();};
$('coopHost').onclick=()=>{sfx('ui');mpHost();};
$('coopJoin').onclick=()=>{sfx('ui');mpJoin();};
$('coopLeave').onclick=()=>{sfx('ui');mpLeave(false);};
$('coopCode').addEventListener('keydown',e=>{if(e.key==='Enter')mpJoin();});
$('coopCodeTxt').onclick=()=>{try{navigator.clipboard.writeText(MP.code);toast('Codice copiato',MP.code);}catch(e){}};
addEventListener('keydown',e=>{if(G.state==='coop'&&e.key==='Escape'){e.preventDefault();closeCoop();}},true);


/* =========================================================
   SANTUARIO: punto d'incontro aperto a tutti i giocatori che sono
   nello stesso santuario in quel momento (anche da partite diverse),
   più un letto per riposare senza uscire dalla scalata
   ========================================================= */
const HUB={on:false,lead:false,want:false,peer:null,conn:null,members:[],players:new Map(),floor:0,sid:Math.random().toString(36).slice(2,10)};
const hubId=f=>'thetower-hub-v1-'+f;
HUB.bcast=(m,except)=>{for(const c of HUB.members)if(c.open&&c!==except){try{c.send(m);}catch(e){}}};
function hubJoin(f){if(HUB.want&&HUB.floor===f)return;hubLeave();HUB.floor=f;HUB.want=true;mpLib(()=>{if(HUB.want&&HUB.floor===f&&!HUB.peer)hubClaim(f);});}
function hubClaim(f){let p;try{p=new Peer(hubId(f));}catch(e){return;}HUB.peer=p;
  p.on('open',()=>{if(HUB.peer!==p)return;HUB.on=true;HUB.lead=true;});
  p.on('connection',c=>{c.on('open',()=>{if(HUB.members.length>=11){c.close();return;}HUB.members.push(c);});
    c.on('data',m=>{try{hubMsg(m,c);}catch(e){}});
    c.on('close',()=>{HUB.members=HUB.members.filter(x=>x!==c);if(c.sid){HUB.bcast({t:'hl',sid:c.sid});hubGone(c.sid);}});c.on('error',()=>{});});
  p.on('error',e=>{if(HUB.peer!==p)return;if(e&&e.type==='unavailable-id'){try{p.destroy();}catch(_){}HUB.peer=null;hubMember(f);}});}
function hubMember(f){let p;try{p=new Peer();}catch(e){return;}HUB.peer=p;
  p.on('open',()=>{if(HUB.peer!==p)return;const c=p.connect(hubId(f),{serialization:'json'});HUB.conn=c;
    c.on('open',()=>{if(HUB.conn===c){HUB.on=true;HUB.lead=false;}});
    c.on('data',m=>{try{hubMsg(m,null);}catch(e){}});
    c.on('close',()=>{if(HUB.conn!==c)return;HUB.on=false;hubClear();hubRetry();});c.on('error',()=>{});});
  p.on('error',e=>{if(HUB.peer!==p)return;if(e&&(e.type==='peer-unavailable'||e.type==='network'))hubRetry();});}
function hubRetry(){if(!HUB.want)return;const f=HUB.floor,old=HUB.peer;HUB.peer=null;HUB.conn=null;HUB.on=false;try{old&&old.destroy();}catch(_){}
  setTimeout(()=>{if(HUB.want&&HUB.floor===f&&!HUB.peer)hubClaim(f);},500+Math.random()*1500);}
function hubLeave(){scClear();if(!HUB.want&&!HUB.peer)return;HUB.want=false;HUB.on=false;HUB.lead=false;const p=HUB.peer,c=HUB.conn,ms=HUB.members;HUB.peer=null;HUB.conn=null;HUB.members=[];
  try{c&&c.close();}catch(_){}for(const x of ms){try{x.close();}catch(_){}}try{p&&p.destroy();}catch(_){}hubClear();}
function hubClear(){for(const R of HUB.players.values())mpRemoveHero(R);HUB.players.clear();}
function hubGone(sid){const R=HUB.players.get(sid);if(!R)return;mpRemoveHero(R);HUB.players.delete(sid);}
/* ---------- Chat del santuario: solo tra chi è su questo piano, viaggia sul collegamento del santuario, non viene salvata da nessuna parte ---------- */
const SC={last:0,rate:new Map(),open:false,cnt:-1,on:false};
const scClean=(s,n)=>String(s==null?'':s).replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e\u2060-\u2069\ufeff]/g,' ').replace(/\s+/g,' ').trim().slice(0,n);
const scAvail=()=>G.scene==='tower'&&!!G.safe&&!G.tutorial&&!G.pvp&&HUB.want&&G.state==='play';
function scAdd(name,text,me){const box=$('scLog'),p=document.createElement('p'),b=document.createElement('b'),s=document.createElement('span');
  if(me)p.className='me';b.textContent=name;s.textContent=text;p.append(b,s);box.appendChild(p);while(box.children.length>30)box.firstChild.remove();box.scrollTop=box.scrollHeight;
  setTimeout(()=>p.classList.add('old'),14000);}
function scClear(){const b=$('scLog');if(b)b.textContent='';SC.rate.clear();}
function scOpen(){if(!scAvail()||SC.open)return;SC.open=true;clearInput();$('sChat').classList.add('open');$('scForm').hidden=false;$('scBtn').hidden=true;const i=$('scIn');i.focus();$('scLog').scrollTop=1e6;}
function scClose(){if(!SC.open)return;SC.open=false;$('sChat').classList.remove('open');$('scForm').hidden=true;$('scBtn').hidden=false;const i=$('scIn');i.value='';i.blur();if(canvas&&canvas.focus)canvas.focus();}
function scSend(){const t=scClean($('scIn').value,100),now=performance.now();if(!t){scClose();return;}if(now-SC.last<900)return;SC.last=now;
  const m={t:'hc',sid:HUB.sid,n:MP.name(),x:t,fl:HUB.floor};
  if(HUB.on){if(HUB.lead)HUB.bcast(m);else if(HUB.conn&&HUB.conn.open){try{HUB.conn.send(m);}catch(e){}}}
  scAdd(MP.name(),t,true);scClose();}
function scBubble(name,sid,text){const R=HUB.players.get(sid)||[...MP.players.values()].find(r=>r.name===name);if(!R||!R.tag)return;
  if(R.bub)R.bub.remove();const d=document.createElement('div');d.className='sc-bub';d.textContent=text;R.tag.appendChild(d);R.bub=d;clearTimeout(R.bubT);R.bubT=setTimeout(()=>{d.remove();if(R.bub===d)R.bub=null;},5500);}
function scRecv(m,c){if(!m||typeof m.x!=='string'||typeof m.sid!=='string'||m.sid===HUB.sid)return;if(c&&c.sid&&c.sid!==m.sid)return;
  if(!G.safe||m.fl!==G.floor||HUB.floor!==G.floor)return;
  const t=performance.now(),a=(SC.rate.get(m.sid)||[]).filter(x=>t-x<5000);if(a.length>=4)return;a.push(t);SC.rate.set(m.sid,a);
  const text=scClean(m.x,100),name=scClean(m.n,14)||'Avventuriero';if(!text)return;
  if(c)HUB.bcast({t:'hc',sid:m.sid,n:name,x:text,fl:m.fl},c);
  scAdd(name,text,false);scBubble(name,m.sid,text);sfx('ui');}
function schatTick(){const av=scAvail(),el=$('sChat');if(!el)return;if(av!==SC.on){SC.on=av;el.hidden=!av;if(!av)scClose();}if(!av)return;
  const n=HUB.players.size+[...MP.players.values()].filter(R=>R.sc==='tower'&&R.fl===G.floor).length;
  if(n!==SC.cnt){SC.cnt=n;$('scWho').textContent=n?`${n} qui con te`:'Solo tu, per ora';}}
$('scBtn').addEventListener('click',()=>scOpen());
$('scForm').addEventListener('submit',e=>{e.preventDefault();scSend();});
$('scIn').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();scClose();}});
$('scIn').addEventListener('keyup',e=>e.stopPropagation());
$('scIn').addEventListener('blur',()=>{setTimeout(()=>{if(SC.open&&document.activeElement!==$('scIn')&&!$('scSend').matches(':active'))scClose();},120);});
addEventListener('keydown',e=>{if(e.code==='Enter'&&!e.repeat&&!SC.open&&scAvail()&&opDone&&document.activeElement.tagName!=='INPUT'){e.preventDefault();e.stopImmediatePropagation();scOpen();}},true);
function hubMsg(m,c){
  if(m&&m.t==='hc'){scRecv(m,c);return;}
  if(m.t==='hs'){if(m.sid===HUB.sid)return;if(c){c.sid=m.sid;HUB.bcast(m,c);}
    if(!G.safe||m.fl!==G.floor)return;
    if(MP.live()&&m.code&&m.code===MP.code)return;   // i compagni di squadra si vedono già
    let R=HUB.players.get(m.sid);const fresh=!R;
    if(!R){R={pid:-1,hub:true,name:'',x:0,y:0,z:0,tx:0,ty:0,tz:0,walkT:0,lastStep:0,atk:null,hero:null,hkey:'',sc:'',fl:0,st:''};HUB.players.set(m.sid,R);}
    R.name=String(m.n||'Avventuriero').slice(0,14);mpRecvInto(R,m);
    if(fresh){toast(`${R.name} è nel santuario`,'Un altro avventuriero si riposa qui');sfx('lvl');}}
  else if(m.t==='hl'&&!c)hubGone(m.sid);
}
const _enterCellar=enterCellar;
enterCellar=function(){hubLeave();return _enterCellar();};

/* ---------- letto del santuario ---------- */
const BED_X=-1.6;
function buildRestBed(){
  const g=new THREE.Group();g.position.set(BED_X,0,-1.7);safeG.add(g);
  const wd=toon(0x5a3a22),wdL=toon(0x7a5434),sheet=toon(0xe8dcc0),blk=toon(0x8a2a34),blk2=toon(0x6a1e28),gold=toon(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.3});
  for(const x of [-1.25,1.25])for(const z of [-0.6,0.6])mesh(rbox(0.16,0.5,0.16,0.04),wd,x,0.25,z,g);
  mesh(rbox(2.7,0.22,1.4,0.06),wdL,0,0.5,0,g);
  mesh(rbox(0.18,1.5,1.5,0.06),wd,-1.36,0.85,0,g);mesh(rbox(0.22,0.14,1.56,0.05),gold,-1.36,1.62,0,g);
  mesh(rbox(0.16,0.85,1.5,0.06),wd,1.36,0.6,0,g);
  mesh(rbox(2.5,0.24,1.28,0.12),sheet,0,0.72,0,g);
  const pil=mesh(rbox(0.55,0.2,0.95,0.1),sheet,-0.9,0.92,0,g);pil.rotation.z=0.12;
  mesh(rbox(1.7,0.12,1.34,0.06),blk,0.32,0.88,0,g);mesh(rbox(0.18,0.13,1.36,0.04),blk2,-0.48,0.89,0,g);
  // comodino con candela
  mesh(rbox(0.6,0.7,0.6,0.06),wd,-2.1,0.35,-0.2,g);mesh(new THREE.CylinderGeometry(0.07,0.08,0.26,12),toon(0xf2ead8),-2.1,0.83,-0.2,g);
  const fl=mesh(sph(0.07,10,8),new THREE.MeshBasicMaterial({color:0xffb347}),-2.1,1.02,-0.2,g,true);fl.scale.y=1.7;G.props.push({o:fl,flick:1});}
function restBed(){if(G.state!=='play')return;G.state='rest';clearInput();['prompt','bUse','touch'].forEach(id=>$(id).hidden=true);showMeds(false);G.fadeSpd=1.4;
  fadeThen(()=>{P.hp=S.maxHp;P.stam=S.stamMax;P.abilCd=P.abil2Cd=P.abil3Cd=0;P.dot=null;P.slowT=0;P.x=BED_X+2;P.vx=0;P.vy=0;P.face=1;P.atk=null;
    $('restMsg').hidden=false;sfx('ui');
    setTimeout(()=>{$('restMsg').hidden=true;G.fadeTarget=0;G.state='play';$('touch').hidden=!isTouch;showMeds(true);clearInput();sfx('lvl');
      popNum(P.x,P.y+2.4,'Riposato!','heal');burst(P.x,P.y+1,0x7fe08a,24,4,3,0.3);
      saveRun();toast('Ti sei riposato · partita salvata','Riaprendo il gioco riparti da qui. Se muori il salvataggio si perde');},1700);});}
const _buildSafeRoom=buildSafeRoom;
buildSafeRoom=function(){_buildSafeRoom();try{buildRestBed();}catch(e){console.warn(e);}
  G.safeInter.push({x:BED_X,y:2.3,name:'Letto',sub:()=>'Riposa e salva: riparti da qui la prossima volta (non se muori)',act:restBed});};

/* ---------- niente zoom accidentale su telefono (doppio tocco / pizzico) ---------- */
(function(){
  const vp=document.querySelector('meta[name=viewport]'),base='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
  if(vp)vp.setAttribute('content',base);
  const stop=e=>e.preventDefault();
  for(const ev of ['gesturestart','gesturechange','gestureend','dblclick'])document.addEventListener(ev,stop,{passive:false});
  document.addEventListener('touchmove',e=>{if(e.touches&&e.touches.length>1)e.preventDefault();},{passive:false});
  // sui tasti del gioco il tocco non deve mai arrivare al browser (doppio tocco = zoom su iPhone):
  // i tasti funzionano con i "pointer" che partono comunque
  for(const id of ['touch','abilBar','game','joy','bAtk','bJump','bDash','bAbil','bAbil2','bAbil3','bUse']){const el=$(id);if(el)el.addEventListener('touchstart',e=>{if(e.cancelable)e.preventDefault();},{passive:false});}
  let lastT=0;
  document.addEventListener('touchend',e=>{const now=Date.now(),t=e.target;
    if(now-lastT<350&&t&&t.closest&&t.closest('#game,#touch,#abilBar')&&!t.closest('input,textarea,select,button'))e.preventDefault();lastT=now;},{passive:false});
  // se lo schermo è rimasto ingrandito, lo riporta subito alla misura normale
  const unzoom=()=>{if(!vp||!window.visualViewport||visualViewport.scale<=1.01)return;vp.setAttribute('content',base+',minimum-scale=1');setTimeout(()=>vp.setAttribute('content',base),80);};
  if(window.visualViewport)visualViewport.addEventListener('resize',unzoom);setInterval(unzoom,800);
})();
if(/coop-debug/.test(location.hash))window.__MP={MP,G,P,S,startRun,spawnEnemy,openCoop,mpHost,mpJoin};

/* ---------- la stanza resta raggiungibile anche se chi la crea esce un attimo dall'app ---------- */
let hostFix=false;
function hostWatch(){const p=MP.peer;if(!MP.host||!MP.on||!p||!MP.code)return;
  if(p.destroyed){if(hostFix)return;hostFix=true;mpStatus('Riapro la stanza…');
    const np=new Peer(PEER_PREFIX+MP.code);MP.peer=np;
    np.on('open',()=>{hostFix=false;mpStatus(MP.live()?'':'Stanza di nuovo aperta: il codice è sempre '+MP.code+'.');});
    np.on('connection',c=>mpHostWire(c));
    np.on('error',e=>{hostFix=false;if(e&&e.type==='unavailable-id'){try{np.destroy();}catch(_){}}});
    np.on('disconnected',()=>{try{np.reconnect();}catch(_){}});return;}
  if(p.disconnected){try{p.reconnect();}catch(e){try{p.destroy();}catch(_){}}}}
setInterval(hostWatch,3000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(hostWatch,300);});

