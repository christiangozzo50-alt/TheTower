
/* =========================================================
   POTENZIA LA CLASSE: livelli al posto delle percentuali, e la potenza delle mosse speciali
   Ogni livello della classe dà 1 punto: si spende per alzare di un livello una statistica o una mossa speciale.
   ========================================================= */
const AB_MAX=10,AB_STEP=0.1;   // ogni livello di potenza: +10% danno della mossa (non mostrato, si vedono solo i livelli)
const AB_SLOTS=[[1,'ability','ab1',1],[2,'ability2','ab2',LV_ABIL2],[3,'ability3','ab3',LV_ABIL3]];
const abLv=(cls,n)=>(prog(cls.id).alloc['ab'+n]||0);
const abCost=l=>2+Math.floor(l/2);   // le mosse costano più delle statistiche e salgono di prezzo a ogni livello
const PST_HINT={hp:'più punti vita',dmg:'colpi più forti',spd:'attacchi più rapidi',arm:'subisci meno danni',crit:'più colpi critici',stam:'più stamina per scatti e salti',move:'corri più veloce'};
const pips=(n,max)=>{const m=max||10,f=Math.min(m,n%m||(n?m:0)),rounds=Math.floor((n-1)/m);
  return `<span class="pips${rounds>0?' r'+Math.min(3,rounds):''}" aria-hidden="true">${Array.from({length:m},(_,i)=>`<i${i<f?' class="on"':''}></i>`).join('')}</span>`;};
ptsHTML=function(cls,allowReset){const pr=prog(cls.id),spent=Object.values(pr.alloc).reduce((a,b)=>a+b,0),lv=pr.lv,can=pr.pts>0;
  return `<div class="pts-head"><span>Punti da spendere <b>${pr.pts}</b></span>${allowReset&&spent?'<button class="mini" data-reset="1">Azzera</button>':''}</div>
  <p class="pts-help">Ogni livello della classe ti dà <b>1 punto</b>. Toccando <b>+</b> alzi di un livello una statistica o la potenza di una mossa speciale.</p>
  <div class="pts-sec">Statistiche</div>
  <div class="pts2">${PSTATS.map(s=>{const n=pr.alloc[s.id]||0;return `<div class="pt-row"><div class="pt-n"><b>${s.name}</b><small>${PST_HINT[s.id]||''}</small></div>${pips(n)}<em>Liv. ${n}</em><button data-pt="${s.id}" ${can?'':'disabled'} aria-label="Alza ${s.name} al livello ${n+1}">+</button></div>`;}).join('')}</div>
  <div class="pts-sec">Mosse speciali <small>più livelli, più danno · costano di più, e ogni livello costa un po' più del precedente</small></div>
  <div class="pts2">${AB_SLOTS.map(([n,k,id,need])=>{const ab=cls[k];if(!ab)return '';const l=pr.alloc[id]||0,lock=lv<need,full=l>=AB_MAX,cost=abCost(l),ok=pr.pts>=cost;
    return `<div class="pt-row ab${lock?' locked':''}"><div class="pt-n"><span class="ico">${svg(ab.icon)}</span><b>${ab.name}</b><small>${lock?'si sblocca al livello '+need:'potenza della mossa'}</small></div>${pips(l,AB_MAX)}<em>${lock?'—':full?'Max':'Liv. '+l+'/'+AB_MAX}</em><button class="ab-buy" data-pt="${id}" ${ok&&!lock&&!full?'':'disabled'} aria-label="Alza la potenza di ${ab.name}: costa ${cost} punti">+<small>${lock||full?'':cost+' pt'}</small></button></div>`;}).join('')}</div>`;};
const _spPot=spendPoint;spendPoint=function(id){if(!/^ab[123]$/.test(id))return _spPot.apply(this,arguments);
  const n=+id[2],s=AB_SLOTS[n-1],pr=prog(G.cls.id),l=pr.alloc[id]||0,cost=abCost(l);if(pr.lv<s[3]||l>=AB_MAX||pr.pts<cost)return;
  pr.abSpent=pr.abSpent||{};if(pr.abSpent[id]==null)pr.abSpent[id]=l;   // i livelli presi prima costavano 1 punto
  pr.pts-=cost;pr.alloc[id]=l+1;pr.abSpent[id]+=cost;store.set('prog',PROG);sfx('pick');};
// azzera: restituisce tutti i punti spesi davvero (anche quelli in più delle mosse)
const _rpPot=resetPoints;resetPoints=function(){const pr=prog(G.cls.id);let extra=0;if(pr.abSpent)for(const id in pr.abSpent)extra+=Math.max(0,pr.abSpent[id]-(pr.alloc[id]||0));
  const r=_rpPot.apply(this,arguments);pr.pts+=extra;pr.abSpent={};store.set('prog',PROG);return r;};
// potenza: si applica ai colpi della mossa, anche a quelli che arrivano dopo (proiettili, zone, colpi ritardati)
G.abSlot=0;
const abMul=()=>1+AB_STEP*(G.cls?abLv(G.cls,G.abSlot||1):0);
const _usPot=useSlot;useSlot=function(n){const was=G.abSlot;G.abSlot=n;try{return _usPot.apply(this,arguments);}finally{G.abSlot=was;}};
const _ltPot=later;later=function(t,fn){if(G.inAbil&&G.abSlot){const s=G.abSlot,f=fn;fn=()=>{const w=G.abSlot;G.abSlot=s;try{f();}finally{G.abSlot=w;}};}return _ltPot(t,fn);};
const _hePot=hitEnemy;hitEnemy=function(e,base,dir,o){if(G.inAbil&&G.abSlot&&typeof base==='number')base*=abMul();return _hePot.call(this,e,base,dir,o);};
const _sjPot=spawnProj;spawnProj=function(o){if(o&&G.inAbil&&G.abSlot&&typeof o.dmg==='number'&&o.owner!=='e')o.dmg*=abMul();return _sjPot.apply(this,arguments);};
const _azPot=addZone;addZone=function(o){if(o&&G.inAbil&&G.abSlot&&typeof o.dmg==='number')o.dmg*=abMul();return _azPot.apply(this,arguments);};
// schermata delle classi: la scheda si chiama «Potenzia», e nelle Abilità c'è il livello di potenza con il +
const _rsPot=renderSelect;renderSelect=function(){_rsPot.apply(this,arguments);const box=$('cstats');if(!box)return;const c=G.cls;if(!c||!isUnlocked(c))return;const pr=prog(c.id);
  const tb=box.querySelector('[data-tab="pt"]');if(tb){tb.textContent='Potenzia'+(pr.pts?' ('+pr.pts+')':'');tb.classList.toggle('glow',pr.pts>0);}
  if(G.selTab!=='pt'&&pr.pts>0){const tabs=box.querySelector('.cs-tabs');if(tabs)tabs.insertAdjacentHTML('afterend',`<button class="pts-cta" data-tab="pt">Hai ${pr.pts} ${pr.pts===1?'punto':'punti'}: potenzia la classe</button>`);}
  if(G.selTab==='ab'){const rows=box.querySelectorAll('.cs-abil');AB_SLOTS.forEach(([n,k,id,need],i)=>{const el=rows[i];if(!el)return;const l=pr.alloc[id]||0,lock=pr.lv<need,full=l>=AB_MAX,cost=abCost(l);
    el.querySelector('div').insertAdjacentHTML('beforeend',`<div class="ab-pow">${pips(l,AB_MAX)}<em>${lock?'Potenza —':'Potenza '+(full?'max':'liv. '+l+'/'+AB_MAX)}</em>${lock||full?'':`<button class="mini" data-pt="${id}" ${pr.pts>=cost?'':'disabled'} aria-label="Alza la potenza di ${c[k].name}: costa ${cost} punti">+ ${cost} punti</button>`}</div>`);});
    if(!pr.pts)box.insertAdjacentHTML('beforeend','<div class="cs-grow">Per potenziare le mosse servono punti: ne ottieni 1 a ogni livello della classe.</div>');}};
