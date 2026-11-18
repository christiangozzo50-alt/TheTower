
/* =========================================================
   BONUS D'ACCESSO GIORNALIERO e MISSIONI DA RISCUOTERE
   - Ogni giorno, entrando nel seminterrato, si riscuotono rubini.
     Sette giorni di fila danno sempre di più; se salti un giorno si riparte dal primo.
   - Le missioni (trofei) completate non danno più skin: danno rubini, da riscuotere nella Bacheca.
   - Le skin già sbloccate con i trofei prima di questo aggiornamento restano tue.
   ========================================================= */

/* ---------- skin: niente più sblocco con le missioni ---------- */
const SKKEEP=store.get('skinkeep',null)||(()=>{const k={};
  for(const c of CLASSES)for(const v of altSkins(c.id))if(skinUnlocked(c.id,v))(k[c.id]=k[c.id]||[]).push(v);
  store.set('skinkeep',k);return k;})();
skinUnlocked=function(id,v){if(v===(SKINPICK[id]||0))return true;return !!(SKKEEP[id]&&SKKEEP[id].includes(v));};

/* ---------- missioni: premio in rubini, da riscuotere ---------- */
const TRO_CLAIM=store.get('troclaim',{});const saveTroClaim=()=>store.set('troclaim',TRO_CLAIM);
const troPrize=t=>t.cls?(/veterano/.test(t.n)?150:300):500;
const _troListM=trophyList;
trophyList=function(){return _troListM().map(t=>Object.assign(t,{prize:troPrize(t),r:`${troPrize(t)} rubini da riscuotere`}));};
const troToClaim=()=>trophyList().filter(t=>t.ok&&!TRO_CLAIM[t.n]);
function troClaim(name){const t=trophyList().find(x=>x.n===name);if(!t||!t.ok||TRO_CLAIM[name])return;
  TRO_CLAIM[name]=true;saveTroClaim();addCoins(t.prize);sfx('lvl');toast(`+${t.prize} rubini`,`Missione riscossa: ${t.n}`);}
function troClaimAll(){const l=troToClaim();if(!l.length)return;let tot=0;for(const t of l){TRO_CLAIM[t.n]=true;tot+=t.prize;}
  saveTroClaim();addCoins(tot);sfx('lvl');toast(`+${tot} rubini`,l.length>1?`${l.length} missioni riscosse`:`Missione riscossa: ${l[0].n}`);}
// la Bacheca: le skin bloccate non si mostrano più, le missioni hanno il tasto Riscuoti
const _rbM=renderBoard;
renderBoard=function(){_rbM.apply(this,arguments);if(bdTab!=='tro')return;const box=$('bdBody');
  // la scheda mostra solo le missioni: niente più riga delle skin
  {const row=box.querySelector('.sk-row'),h=row&&row.previousElementSibling;if(row)row.remove();if(h&&h.classList.contains('bd-h'))h.remove();}
  const tl=trophyList(),c=G.cls,todo=troToClaim(),got=tl.filter(t=>t.ok&&TRO_CLAIM[t.n]);
  const byP=(a,b)=>b.p-a.p;
  const run=tl.filter(t=>!t.ok&&(!t.cls||t.cls===c.id)).sort(byP),other=tl.filter(t=>!t.ok&&t.cls&&t.cls!==c.id).sort(byP);
  const hs=box.querySelectorAll('.bd-h');if(hs[0])hs[0].innerHTML=`Missioni <small class="ms-cnt">${got.length+todo.length} di ${tl.length} completate</small>`;
  const list=box.querySelector('.tro-list');if(!list)return;list.className='ms-wrap';
  const card=(t,k)=>{const pc=Math.round(t.p*100);
    return `<div class="ms ms-${k}"><i class="ms-ic">${k==='claim'?'🏆':k==='done'?'✓':(t.cls?'⚔':'★')}</i>
      <div class="ms-tx"><b>${esc(t.n)}</b><span>${esc(t.d)}</span>${k==='run'?`<div class="ms-pg"><i class="ms-bar"><u style="width:${pc}%"></u></i><small>${pc}%</small></div>`:''}</div>
      <div class="ms-rw">${k==='claim'?`<button class="mini ms-get" data-claim="${esc(t.n)}">Riscuoti<br><b>${t.prize} ◆</b></button>`:`<em>${t.prize} ◆</em>`}</div></div>`;};
  const sec=(title,l,k,extra)=>l.length?`<h4 class="ms-h ms-h-${k}">${title} <small>${l.length}</small>${extra||''}</h4><div class="ms-list">${l.map(t=>card(t,k)).join('')}</div>`:'';
  const fold=(id,title,l,k)=>l.length?`<details class="ms-fold" data-fold="${id}"${MS_OPEN[id]?' open':''}><summary>${title} <small>${l.length}</small></summary><div class="ms-list">${l.map(t=>card(t,k)).join('')}</div></details>`:'';
  list.innerHTML=
    sec('Da riscuotere',todo,'claim',todo.length>1?`<button class="mini ms-all" data-claimall>Riscuoti tutte</button>`:'')+
    sec(`In corso · ${esc(c.name)}`,run,'run')+
    fold('other','Missioni degli altri eroi',other,'run')+
    fold('done','Completate',got,'done')+
    (!todo.length&&!run.length&&!other.length?'<p class="note">Hai completato tutte le missioni!</p>':'');
  for(const d of list.querySelectorAll('details[data-fold]'))d.addEventListener('toggle',()=>{MS_OPEN[d.dataset.fold]=d.open;});};
const MS_OPEN={};
$('board').addEventListener('click',e=>{const a=e.target.closest('[data-claimall]');if(a){troClaimAll();renderBoard();return;}
  const b=e.target.closest('[data-claim]');if(b){troClaim(b.dataset.claim);renderBoard();}});
{const tb=document.querySelector('#board .tab[data-tab="tro"]');if(tb)tb.textContent='Missioni';}
{const st=document.createElement('style');st.textContent=`
.ms-cnt{margin-left:8px;font-size:12px;font-weight:600;color:var(--ink-2);letter-spacing:0;text-transform:none}
.ms-wrap{display:grid;gap:6px;text-align:left}
.ms-h{display:flex;align-items:center;gap:8px;margin:8px 0 2px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink)}
.ms-h small{padding:0 7px;border-radius:9px;background:rgba(255,255,255,.08);color:var(--ink-2);font-size:11px;letter-spacing:0}
.ms-h-claim{color:#ffd27a}.ms-h .ms-all{margin-left:auto}
.ms-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:6px}
.ms{display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:10px;padding:8px 10px;background:rgba(22,25,32,.85);border:1px solid var(--edge);font-size:12px;color:var(--ink-2)}
.ms-ic{display:grid;place-items:center;width:30px;height:30px;font-style:normal;font-size:15px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
.ms-tx{display:grid;gap:2px;min-width:0}.ms-tx b{color:var(--ink);font-size:13px}.ms-tx span{line-height:1.3}
.ms-pg{display:flex;align-items:center;gap:6px;margin-top:3px}.ms-pg small{min-width:30px;text-align:right;font-weight:700;color:var(--ink)}
.ms-bar{flex:1;height:5px;background:rgba(255,255,255,.08);overflow:hidden}.ms-bar u{display:block;height:100%;background:linear-gradient(90deg,#4fb6a8,#7fe08a)}
.ms-rw em{font-style:normal;font-weight:700;color:#ff8aa0;white-space:nowrap}
.ms-claim{border-color:#ffd27a;background:linear-gradient(90deg,rgba(255,210,122,.14),rgba(22,25,32,.9));box-shadow:0 0 14px rgba(255,210,122,.15)}
.ms-claim .ms-ic{background:rgba(255,210,122,.18);border-color:rgba(255,210,122,.5)}.ms-claim .ms-tx b{color:#ffd27a}
.ms-get{line-height:1.15;padding:5px 10px}.ms-get b{font-size:13px}
.ms-done{opacity:.55;padding:5px 10px}.ms-done .ms-ic{width:22px;height:22px;font-size:12px;color:var(--xp)}.ms-done .ms-tx span{display:none}
.ms-fold{margin-top:6px;border-top:1px solid rgba(255,255,255,.08);padding-top:4px}
.ms-fold summary{cursor:pointer;padding:6px 2px;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2);list-style:none}
.ms-fold summary::-webkit-details-marker{display:none}.ms-fold summary::before{content:'▸ ';}.ms-fold[open] summary::before{content:'▾ ';}
.ms-fold summary small{margin-left:6px;padding:0 7px;border-radius:9px;background:rgba(255,255,255,.08);font-size:11px;letter-spacing:0}
@media (max-width:600px),(max-height:500px){.ms-list{grid-template-columns:1fr}.ms{padding:6px 8px;gap:8px}}`;document.head.appendChild(st);}

/* ---------- bonus d'accesso giornaliero ---------- */
const DAILY_PRIZE=[50,75,100,150,200,250,500];
// oltre ai rubini: il 7° giorno sempre una Cassa dell'eroe, gli altri giorni 20% di trovare una Cassa del viandante (oggetti dello shop)
const DAILY_CRATE_P=0.2;
const dlyCrate=s=>CRATES.find(c=>c.id===(s===7?'eroe':'viandante'));
const DLY=Object.assign({last:0,streak:0},store.get('daily',{}));const saveDly=()=>store.set('daily',DLY);
const dlyNext=()=>{const d=dayNo();return DLY.last===d-1?(DLY.streak%7)+1:1;};
let dlyEl=null;
function dlyOpen(){if(dlyEl&&!dlyEl.hidden)return;const s=dlyNext();
  if(!dlyEl){dlyEl=document.createElement('section');dlyEl.className='screen';dlyEl.id='daily';dlyEl.hidden=true;dlyEl.setAttribute('role','dialog');dlyEl.setAttribute('aria-label','Bonus giornaliero');document.body.appendChild(dlyEl);
    dlyEl.addEventListener('click',e=>{if(e.target.closest('#dlyGet'))dlyClaim();});}
  dlyEl.innerHTML=`<div class="panel"><div class="eyebrow">Bonus giornaliero</div><h2 style="margin:0">Giorno ${s} di 7</h2>
    <div class="dly-row">${DAILY_PRIZE.map((p,i)=>`<div class="dly${i+1<s?' got':''}${i+1===s?' now':''}"><small>Giorno ${i+1}</small><b>${p} ◆</b>${i===6?'<small>+ Cassa dell\'eroe</small>':''}${i+1<s?'<em>✓</em>':''}</div>`).join('')}</div>
    <p class="ig-lead" style="margin:0">Entra ogni giorno: il premio cresce, e a volte c'è anche una cassa del negozio. Se salti un giorno si riparte dal primo.</p>
    <div class="row"><button id="dlyGet">Riscuoti ${DAILY_PRIZE[s-1]} rubini</button></div></div>`;
  G.state='daily';clearInput();['prompt','bUse','touch'].forEach(id=>$(id).hidden=true);dlyEl.hidden=false;sfx('chest');
  setTimeout(()=>{const b=$('dlyGet');if(b)b.focus();},50);}
function dlyClaim(){const d=dayNo();if(DLY.last!==d){const s=dlyNext();DLY.last=d;DLY.streak=s;saveDly();addCoins(DAILY_PRIZE[s-1]);sfx('lvl');
    const cr=(s===7||Math.random()<DAILY_CRATE_P)?dlyCrate(s):null;
    toast(`+${DAILY_PRIZE[s-1]} rubini${cr?' e '+cr.n:''}`,s===7?'Settimana completa!':`Bonus del giorno ${s}`);
    if(cr)setTimeout(()=>{try{openCrate(cr);}catch(e){console.warn('cassa bonus',e);}},400);}
  if(dlyEl)dlyEl.hidden=true;if(G.state==='daily'){G.state='cellar';$('touch').hidden=!isTouch;canvas.focus();}
  const n=troToClaim().length;if(n)setTimeout(()=>toast('Missioni completate',`${n} da riscuotere nella Bacheca`),900);}
// si apre appena sei nel seminterrato senza altre finestre aperte
setInterval(()=>{if(DLY.last===dayNo()||G.state!=='cellar'||G.fadeTarget>0||document.querySelector('.screen:not([hidden])')||!$('nameGate').hidden)return;dlyOpen();},1500);
addEventListener('keydown',e=>{if(G.state==='daily'&&(e.key==='Escape'||e.key==='Enter')){e.preventDefault();e.stopPropagation();dlyClaim();}},true);
const _padBackD=padBack;padBack=function(){if(G.state==='daily'){dlyClaim();return true;}return _padBackD();};

{const st=document.createElement('style');st.textContent=`
.dly-row{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;width:100%}
.dly{position:relative;display:grid;gap:4px;padding:10px 4px;background:rgba(22,25,32,.85);border:1px solid var(--edge);font-size:12px;color:var(--ink-2)}
.dly b{color:var(--ink);font-size:14px}.dly.got{opacity:.5}.dly.now{border-color:var(--xp);box-shadow:0 0 0 1px var(--xp),0 0 18px rgba(127,224,138,.25)}.dly.now b{color:var(--xp)}
.dly em{position:absolute;top:2px;right:5px;font-style:normal;color:var(--xp)}
.tro .tro-claim{justify-self:start;margin-top:3px}
@media (max-width:520px){.dly-row{grid-template-columns:repeat(4,minmax(0,1fr))}}`;document.head.appendChild(st);}
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{DLY:()=>DLY,dlyOpen,dlyClaim,troToClaim,TRO_CLAIM:()=>TRO_CLAIM,SKKEEP:()=>SKKEEP});
