
/* =========================================================
   FABBRO: mostra da solo gli oggetti che puoi fondere
   (5 oggetti uguali, stessa rarità → 1 oggetto della rarità sopra, come nell'armadio)
   ========================================================= */
function fuseReady(){const seen=new Set(),out=[];
  for(const it of INV.items){if(seen.has(it.id))continue;const o=it.w||it.g;const grp=fuseGroup(it);for(const g of grp)seen.add(g.id);
    if(o.rarity<MAX_R&&grp.length>=5)out.push({it,o,n:grp.length});}
  return out.sort((a,b)=>b.o.rarity-a.o.rarity);}
let fgFuseEl=null;
function renderFuse(){if(!fgFuseEl){fgFuseEl=document.createElement('div');fgFuseEl.id='fgFuse';fgFuseEl.className='fg-fuse';const w=document.querySelector('#forge .fg-wrap');w.parentNode.insertBefore(fgFuseEl,w);
    fgFuseEl.addEventListener('click',e=>{const b=e.target.closest('[data-fz]');if(!b)return;const it=itemById(b.dataset.fz);if(!it)return;
      const ids=new Set(fuseGroup(it).map(i=>i.id)),eq=[...ids].some(isEquipped);
      fuseItems(it.id);if(fgSel&&!itemById(fgSel))fgSel=null;renderForge();if(eq)applyLoadout();});}
  const l=fuseReady();fgFuseEl.hidden=!l.length;if(!l.length){fgFuseEl.innerHTML='';return;}
  fgFuseEl.innerHTML=`<div class="fg-fh">Puoi fondere <small>5 oggetti uguali diventano 1 della rarità sopra</small></div><div class="fg-frow">${l.map(({it,o,n})=>{const R=RARITY[o.rarity],R2=RARITY[o.rarity+1];
    return `<button class="fg-fz" data-fz="${it.id}" style="--rc:${R2.css}"><b>${esc(o.name)}</b><small><span style="color:${R.css}">${R.name}</span> × ${n} → <span style="color:${R2.css}">${R2.name}</span></small><em>Fondi${n>=10?` (${Math.floor(n/5)} volte possibili)`:''}</em></button>`;}).join('')}</div>`;}
const _rfFuse=renderForge;
renderForge=function(){_rfFuse.apply(this,arguments);renderFuse();
  // nella lista, chi si può fondere ha la scritta "fondibile"
  const ok=new Set();for(const {it} of fuseReady())for(const g of fuseGroup(it))ok.add(g.id);
  for(const b of document.querySelectorAll('#fgList .fg-it'))if(ok.has(b.dataset.id)){const s=b.querySelector('small');if(s&&!/fondibile/.test(s.textContent))s.insertAdjacentHTML('beforeend',' · <i class="fg-tagf">fondibile</i>');}};
{const st=document.createElement('style');st.textContent=`
.fg-fuse{width:100%;display:grid;gap:6px;text-align:left}
.fg-fh{font-size:13px;font-weight:700;color:var(--ink)}.fg-fh small{font-weight:500;color:var(--ink-2);margin-left:6px}
.fg-frow{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px}
.fg-fz{display:grid;gap:2px;text-align:left;padding:8px 10px;background:rgba(22,25,32,.9);border:1px solid var(--rc);color:var(--ink);box-shadow:0 0 12px color-mix(in srgb,var(--rc) 25%,transparent)}
.fg-fz small{color:var(--ink-2)}.fg-fz em{font-style:normal;font-weight:700;color:var(--rc)}
.fg-tagf{font-style:normal;color:#ffd27a}`;document.head.appendChild(st);}
