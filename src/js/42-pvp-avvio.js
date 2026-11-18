
/* =========================================================
   PVP: AVVIO SICURO
   Prima il "si comincia" partiva una volta sola: se si perdeva, entrava solo chi ospitava
   (o nessuno, se l'avvio dell'arena falliva). Ora:
   - chi ospita rimanda "si comincia" finché ogni giocatore non risponde "ci sono"
   - se un giocatore non entra entro 9 secondi la sfida si annulla per tutti (niente attese infinite)
   - se l'arena non parte per un errore si torna al seminterrato con un messaggio
   ========================================================= */
const PVGO={msg:null,ack:new Set(),tries:0,t:0,iv:0};
function pvgoStop(){clearInterval(PVGO.iv);PVGO.iv=0;PVGO.msg=null;}
const _pvBeginSafe=pvpBegin;
pvpBegin=function(m){
  if(PV.on&&PV.seedGo===m.seed)return;   // già partita (messaggio ripetuto)
  PV.seedGo=m.seed;PV.inT=performance.now();
  if(MP.host){PVGO.msg=m;PVGO.ack=new Set([0]);PVGO.tries=0;clearInterval(PVGO.iv);
    PVGO.iv=setInterval(()=>{if(!PV.on||!PVGO.msg||!MP.live()){pvgoStop();return;}
      const all=Object.keys(m.teams).map(Number).filter(pid=>pid!==0);const miss=all.filter(pid=>!PVGO.ack.has(pid));
      if(!miss.length){pvgoStop();return;}
      if(++PVGO.tries>11){pvgoStop();MP.bcast({t:'pvpabort'});pvpAbort('L\'avversario non è riuscito a entrare');return;}
      for(const pid of miss){try{MP.sendTo(pid,PVGO.msg);}catch(e){}}},800);}
  else{try{MP.send({t:'pvpok',pid:MP.myPid});}catch(e){}}
  return _pvBeginSafe(m);};
function pvpAbort(t){if(!PV.on&&!G.pvp)return;pvgoStop();try{$('pvpCount').hidden=true;}catch(e){}toast(t||'Sfida annullata','Torni al seminterrato: riprova a cercare una partita');try{pvpQuit();}catch(e){console.warn('pvp',e);}}
const _mpMsgGo=mpMsg;
mpMsg=function(m,from){
  if(m&&m.t==='pvpgo'&&!MP.host){if(PV.on&&PV.seedGo===m.seed){try{MP.send({t:'pvpok',pid:MP.myPid});}catch(e){}return;}}
  if(m&&m.t==='pvpok'){if(MP.host)PVGO.ack.add(from!=null?from:m.pid);return;}
  if(m&&m.t==='pvpabort'){if(!MP.host)pvpAbort('La sfida è stata annullata');return;}
  return _mpMsgGo(m,from);};
// l'arena deve partire davvero entro qualche secondo; se l'avvio si inceppa si torna indietro invece di restare bloccati
setInterval(()=>{if(!PV.on||!PV.inT)return;const dt=performance.now()-PV.inT;
  if(G.pvp&&G.scene==='tower'){PV.inT=0;return;}
  if(dt>9000){PV.inT=0;MP.live()&&MP.host&&MP.bcast({t:'pvpabort'});pvpAbort('L\'arena non è partita');}},1000);
