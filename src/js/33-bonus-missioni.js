
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
  const tl=trophyList(),c=G.cls,done=tl.filter(t=>t.ok).length,todo=troToClaim().length;
  const hs=box.querySelectorAll('.bd-h');if(hs[0])hs[0].innerHTML=`Missioni · ${done} di ${tl.length}${todo?` · <button class="mini" data-claimall>Riscuoti tutte (${todo})</button>`:''}`;
  const list=box.querySelector('.tro-list');if(!list)return;
  list.innerHTML=tl.filter(t=>!t.cls||t.cls===c.id).concat(tl.filter(t=>t.cls&&t.cls!==c.id)).map(t=>{const got=!!TRO_CLAIM[t.n];
    return `<div class="tro${t.ok?' ok':''}"><b>${t.ok?'🏆':'🔒'} ${esc(t.n)}</b><span>${esc(t.d)}</span>`+
      (t.ok&&!got?`<button class="mini tro-claim" data-claim="${esc(t.n)}">Riscuoti ${t.prize} ◆</button>`:`<small>${got?'Riscossa · ':''}${t.prize} rubini</small>`)+
      `<i style="--p:${Math.round(t.p*100)}%"></i></div>`;}).join('');};
$('board').addEventListener('click',e=>{const a=e.target.closest('[data-claimall]');if(a){troClaimAll();renderBoard();return;}
  const b=e.target.closest('[data-claim]');if(b){troClaim(b.dataset.claim);renderBoard();}});
{const tb=document.querySelector('#board .tab[data-tab="tro"]');if(tb)tb.textContent='Missioni';}

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
