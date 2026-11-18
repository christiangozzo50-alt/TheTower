
/* =========================================================
   PONTE DI RETE (TURN) DI CLOUDFLARE per co-op e spettatore
   Il programmino "thetower-turn" su Cloudflare consegna credenziali temporanee (24 ore):
   il gioco le chiede all'avvio e le usa al posto di quelle di Metered.
   Se Cloudflare non risponde si resta con Metered come prima.
   ========================================================= */
const CF_TURN_URL='https://thetower-turn.christiangozzo50.workers.dev';
const CF={ok:false,t:0,p:null};
function cfTurnLoad(){
  CF.p=fetch(CF_TURN_URL,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{
    const list=d&&Array.isArray(d.iceServers)?d.iceServers:null;if(!list||!list.length)return;
    // nei browser la porta 53 dà problemi: si tolgono quegli indirizzi
    const clean=list.map(s=>Object.assign({},s,{urls:[].concat(s.urls||[]).filter(u=>!/:53(\?|$)/.test(u))})).filter(s=>s.urls.length);
    if(!clean.some(s=>s.urls.some(u=>/^turns?:/.test(u))))return;
    ICE.splice(0,ICE.length,...clean,{urls:'stun:stun.l.google.com:19302'});CF.ok=true;CF.t=Date.now();
  }).catch(()=>{});
  return CF.p;}
cfTurnLoad();
setInterval(()=>{if(Date.now()-CF.t>6*3600e3)cfTurnLoad();},10*60e3);   // le credenziali durano 24 ore: si rinnovano ogni 6
// prima di aprire un collegamento si aspetta (al massimo 3 secondi) che le credenziali siano arrivate
const _mpLibCF=mpLib;
mpLib=function(cb){if(CF.ok||!CF.p)return _mpLibCF(cb);let done=false;const go=()=>{if(done)return;done=true;_mpLibCF(cb);};CF.p.then(go,go);setTimeout(go,3000);};
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{CF:()=>CF,ICE:()=>ICE});
