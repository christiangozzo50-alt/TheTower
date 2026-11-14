
/* =========================================================
   PROFILO DEI GIOCATORI: tocca un nome in classifica (o nella ricerca amici) per vedere il suo profilo
   e mandargli la richiesta d'amicizia (o invitarlo nel gruppo se è già tuo amico ed è online)
   ========================================================= */
{const st=document.createElement('style');st.textContent=`
.lb-r[data-prof],.fr-r b[data-prof]{cursor:pointer}
.lb-r[data-prof]:hover,.lb-r[data-prof]:focus-visible{border-color:var(--ember);outline:none}
.fr-r b[data-prof]{text-decoration:underline dotted rgba(255,210,122,.6);text-underline-offset:3px}
#profBox{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:rgba(6,5,10,.7);padding:12px}
#profBox[hidden]{display:none}
#profBox .pf{width:min(400px,100%);max-height:calc(100vh - 24px);overflow:auto;background:#14111b;border:1px solid var(--edge,#3a3346);padding:16px 18px;color:var(--ink,#f3ead7);box-shadow:0 10px 40px rgba(0,0,0,.6)}
#profBox .pf-top{display:flex;align-items:center;gap:10px}
#profBox .pf-top b{font-family:var(--f-display,inherit);font-weight:400;font-size:22px;color:#ffd27a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#profBox .pf-st{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-2,#a99);margin:2px 0 12px}
#profBox .pf-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}
#profBox .pf-grid div{background:rgba(22,25,32,.85);border:1px solid var(--edge,#3a3346);padding:6px 9px}
#profBox .pf-grid small{display:block;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-2,#a99)}
#profBox .pf-grid span{font-weight:700;font-size:15px}
#profBox .pf-act{display:grid;gap:8px}
#profBox .pf-act button{width:100%}
#profBox .dot{flex:none;width:11px;height:11px;border-radius:50%;background:#4a4652}#profBox .dot.on{background:#7fe08a;box-shadow:0 0 8px #7fe08a}`;document.head.appendChild(st);}
const profBox=document.createElement('div');profBox.id='profBox';profBox.hidden=true;profBox.innerHTML='<div class="pf" role="dialog" aria-modal="true" aria-labelledby="pfName"></div>';document.body.appendChild(profBox);
const PROF={k:null};
function closeProfile(){profBox.hidden=true;PROF.k=null;}
profBox.addEventListener('click',e=>{if(e.target===profBox){sfx('ui');closeProfile();}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!profBox.hidden){e.preventDefault();e.stopImmediatePropagation();closeProfile();}},true);
async function openProfile(n){if(!n)return;const k=nameKey(n),me=k===nameKey(MP.name()),box=profBox.firstElementChild;PROF.k=k;sfx('ui');
  box.innerHTML=`<div class="pf-top"><span class="dot"></span><b id="pfName">${esc(n)}</b></div><p class="pf-st">Carico il profilo…</p>`;profBox.hidden=false;
  if(!fbOn()){box.querySelector('.pf-st').textContent='I profili online non sono ancora collegati.';return;}
  const get=p=>fbGet(p).catch(()=>null),ek=encodeURIComponent(k);
  const [p,so,co,or,pv]=await Promise.all([get('players/'+ek),get('scores/solo/'+ek),get('scores/coop/'+ek),get('scores/orda/'+ek),get('pvp/'+season()+'/'+ek)]);
  if(PROF.k!==k)return;   // nel frattempo ha aperto un altro profilo
  const on=p&&isOnline(p),fr=FRIENDS.some(f=>f.k===k),pd=pend(k),rating=(pv&&pv.r)||(p&&p.pvp)||1000;
  const cell=(l,v)=>`<div><small>${l}</small><span>${v}</span></div>`;
  box.innerHTML=`<div class="pf-top"><span class="dot${on?' on':''}"></span><b id="pfName">${esc((p&&p.n)||n)}</b></div>
    <p class="pf-st">${on?'Online adesso':p&&p.t?'Visto '+new Date(p.t).toLocaleDateString('it-IT'):'Giocatore'}${p&&p.cls?' · '+esc(p.cls):''}</p>
    <div class="pf-grid">${cell('Piano più alto',(p&&p.best)||(so&&so.f)||0)}${cell('Scalate',(p&&p.runs)||0)}${cell('Nemici sconfitti',(p&&p.kills)||0)}${cell('PvP',`${rating} · ${esc(tierOf(rating))}`)}
      ${cell('Record da solo',so?'piano '+so.f:'—')}${cell('Record in co-op',co?'piano '+co.f:'—')}${cell('Record orda',or?'ondata '+or.f:'—')}${cell('Classe del record',so&&so.c?esc(so.c):'—')}</div>
    <div class="pf-act">${me?'<p class="note">Questo sei tu.</p>':fr?`<button class="ghost" disabled>Siete già amici</button>${on?'<button class="big" id="pfInv">Invita nel gruppo</button>':''}`:`<button class="big" id="pfAdd" ${pd?'disabled':''}>${pd?'Richiesta inviata':'Chiedi l\'amicizia'}</button>`}
      <button class="ghost" id="pfClose">Chiudi</button></div>`;
  $('pfClose').onclick=()=>{sfx('ui');closeProfile();};
  const add=$('pfAdd');if(add)add.onclick=async()=>{if(!store.get('nameok',false)){toast('Prima scegli il tuo nome','Ti serve un nome registrato per avere amici');return;}
    add.disabled=true;add.textContent='Invio…';const ok=await sendFriendReq(k,(p&&p.n)||n);add.textContent=ok?'Richiesta inviata':'Riprova';add.disabled=ok;};
  const inv=$('pfInv');if(inv)inv.onclick=async()=>{inv.disabled=true;inv.textContent='Invito…';await inviteFriend(k);inv.textContent='Invitato';};
  setTimeout(()=>{const b=box.querySelector('button.big:not(:disabled)')||$('pfClose');if(b&&(PAD.on||!isTouch))b.focus();},50);}
// classifica: ogni riga diventa toccabile
new MutationObserver(()=>{for(const r of document.querySelectorAll('#lbList .lb-r:not([data-prof])')){const b=r.querySelector('b');if(!b)continue;r.dataset.prof=b.textContent;r.tabIndex=0;r.setAttribute('role','button');r.title='Apri il profilo';}})
  .observe($('board'),{childList:true,subtree:true});
// ricerca amici: anche lì il nome apre il profilo
new MutationObserver(()=>{for(const b of document.querySelectorAll('#friends .fr-r b:not([data-prof])')){b.dataset.prof=b.textContent;b.tabIndex=0;b.setAttribute('role','button');}})
  .observe($('friends'),{childList:true,subtree:true});
for(const id of ['board','friends'])$(id).addEventListener('click',e=>{const r=e.target.closest('[data-prof]');if(r&&!e.target.closest('button')){e.stopPropagation();openProfile(r.dataset.prof);}},true);
for(const id of ['board','friends'])$(id).addEventListener('keydown',e=>{const r=e.target.closest&&e.target.closest('[data-prof]');if(r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();openProfile(r.dataset.prof);}});
// chiudendo classifica o amici si chiude anche il profilo
const _cbProf=closeBoard;closeBoard=function(){closeProfile();return _cbProf();};
const _cfProf=closeFriends;closeFriends=function(){closeProfile();return _cfProf();};
