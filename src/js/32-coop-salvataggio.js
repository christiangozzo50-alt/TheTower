
/* =========================================================
   SALVATAGGIO IN CO-OP
   Una scalata salvata al letto del santuario in co-op si riprende solo in co-op, con gli stessi compagni:
   da soli non si può (niente classifica «solo» con una scalata fatta in gruppo).
   Una scalata nata in co-op finisce sempre nella classifica co-op, anche se i compagni escono.
   ========================================================= */
const crewNow=()=>{const s=[nameKey(MP.name())];if(MP.live())for(const R of MP.players.values())if(R&&R.name)s.push(nameKey(R.name));return [...new Set(s)].sort();};
const crewDisp=()=>{const s=[];if(MP.live())for(const R of MP.players.values())if(R&&R.name)s.push(String(R.name).slice(0,14));return s;};   // i nomi come li vedono i giocatori
const crewNames=(crew,disp)=>disp&&disp.length?disp:crew.filter(k=>k!==nameKey(MP.name()));
G.runCoop=false;G.runCrew=null;
// all'inizio della scalata: era in co-op? con chi?
const _srCs=startRun;startRun=function(){const was=G.scene,r=_srCs.apply(this,arguments);
  if(G.scene==='tower'&&was!=='tower'&&!RESUMING&&!G.pvp){G.runCoop=MP.live();G.runCrew=G.runCoop?crewNow():null;}return r;};
// chi entra nel gruppo durante la scalata rende la scalata co-op
setInterval(()=>{if(G.scene==='tower'&&!G.pvp&&MP.live()){G.runCoop=true;const c=crewNow();if(!G.runCrew||c.length>G.runCrew.length){G.runCrew=c;G.runCrewN=crewDisp();}}},3000);
const _ecCs=enterCellar;enterCellar=function(){G.runCoop=false;G.runCrew=null;return _ecCs.apply(this,arguments);};
// il salvataggio ricorda la co-op e i compagni
const _svCs=saveRun;saveRun=function(){_svCs.apply(this,arguments);const s=store.get('runsave',null);if(!s)return;
  if(G.runCoop||MP.live()){s.coop=true;s.crew=G.runCrew||crewNow();const d=crewDisp();s.crewN=d.length?d:(G.runCrewN||[]);}else{delete s.coop;delete s.crew;delete s.crewN;}store.set('runsave',s);};
const saveKey=sv=>sv&&sv.coop?sv.f+':'+(sv.crew||[]).join(','):'';
// riprendere: si torna co-op con gli stessi compagni
const _rrCs=resumeRun;resumeRun=function(sv){const r=_rrCs.apply(this,arguments);G.runCoop=!!(sv&&sv.coop);G.runCrew=sv&&sv.crew||null;return r;};
// ognuno dice al gruppo che salvataggio ha (piano e compagni), così chi crea la partita sa se si può riprendere
const _msCs=mpMyState;mpMyState=function(){const s=_msCs.apply(this,arguments);const k=saveKey(getSave());if(k)s.sv=k;return s;};
const _riCs=mpRecvInto;mpRecvInto=function(R,m){_riCs(R,m);R.sv=m.sv||'';};
function coopCanResume(sv){if(!sv||!sv.coop||!MP.live()||!MP.host)return {ok:false};const crew=crewNow(),same=crew.join(',')===(sv.crew||[]).join(',');
  if(!same)return {ok:false,why:'crew'};const k=saveKey(sv);for(const R of MP.players.values())if(R.sv!==k)return {ok:false,why:'save',who:R.name};return {ok:true};}
// la scala: da soli niente «Riprendi» per una scalata salvata in co-op; in gruppo solo con gli stessi compagni
const _ocaCs=openClimbAsk;openClimbAsk=function(){_ocaCs.apply(this,arguments);if(G.state!=='climbask')return;const sv=getSave();if(!sv||!sv.coop)return;
  const mates=crewNames(sv.crew||[],sv.crewN).join(', ')||'i tuoi compagni';
  if(!MP.live()){$('caResume').hidden=true;$('caNew').textContent='Nuova scalata';
    $('caText').innerHTML=`Hai una scalata salvata <b>in co-op</b> al <b>piano ${sv.f}</b> con <b>${esc(mates)}</b>: si riprende solo insieme a loro, dalla porta online. Una nuova scalata da solo la cancella.`;return;}
  if(!MP.host){$('caText').innerHTML+=`<br>Salvataggio in co-op al piano ${sv.f}: può riprenderlo chi ha creato la partita.`;return;}
  const c=coopCanResume(sv);
  if(c.ok){$('caResume').hidden=false;$('caResume').textContent=`Riprendete dal piano ${sv.f}`;$('caNew').textContent='Nuova scalata';$('caText').innerHTML=`Scalata salvata in co-op al <b>piano ${sv.f}</b>: potete riprenderla tutti insieme.`;}
  else $('caText').innerHTML+=c.why==='crew'?`<br>La scalata salvata al piano ${sv.f} era con <b>${esc(mates)}</b>: per riprenderla servono gli stessi compagni.`
    :`<br>Per riprendere dal piano ${sv.f} tutti devono avere salvato al letto del santuario${c.who?' (manca '+esc(c.who)+')':''}.`;};
// «Riprendi»: in gruppo parte per tutti dal piano salvato
$('caResume').onclick=()=>{const sv=getSave();if(!sv)return;
  if(sv.coop&&!MP.live())return;
  sfx('ui');$('climbAsk').hidden=true;G.state='menu';
  if(sv.coop){if(!coopCanResume(sv).ok){toast('Non si può riprendere','Servono gli stessi compagni, tutti con il salvataggio');G.state='cellar';return;}
    MP.seed=(Math.random()*1e9)|0;MP.bcast({t:'start',seed:MP.seed,horde:false,w:0,resume:sv.f,crew:sv.crew});}
  fadeThen(()=>{MP.netStart=false;resumeRun(sv);G.fadeTarget=0;});};
// i compagni: ognuno riparte con il suo salvataggio (se per qualche motivo non ce l'ha, entra comunque nel piano giusto)
function coopResumeGuest(m){MP.netStart=false;const sv=getSave();
  if(sv&&sv.coop&&sv.f===m.resume){resumeRun(sv);return;}
  MP.netStart=true;RESUMING=true;try{startRun();}finally{RESUMING=false;}G.runCoop=true;G.runCrew=m.crew||crewNow();startFloor(m.resume);}
