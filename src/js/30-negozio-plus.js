
/* =========================================================
   NEGOZIO ARRICCHITO
   - Cosmetici (scheda nuova): scie dell'arma, effetti quando uccidi, aure, titoli, cornici del nome, compagni
   - Oggetti per una scalata: Amuleto, Chiave d'oro, Pergamena, Tonico (si preparano e si consumano a inizio scalata)
   - Offerta della settimana, garanzia sulle casse leggendarie, rinnovo delle skin di oggi, pacchetti
   ========================================================= */

/* ---------- cosmetici ---------- */
const COS_CATS=[['trail','Scie dell\'arma','il colore del fendente'],['kill','Effetti uccisione','quando finisci un nemico'],['aura','Aure','intorno al tuo eroe'],
  ['pet','Compagni','ti seguono ovunque, solo per bellezza'],['title','Titoli','sotto il tuo nome'],['frame','Cornici','intorno al tuo nome']];
const COS_LIST=[
  {id:'tr_brace',cat:'trail',n:'Scia di brace',d:'Fendenti color fuoco',r:1,col:0xff7a2e},
  {id:'tr_gelo',cat:'trail',n:'Scia gelida',d:'Fendenti azzurro ghiaccio',r:1,col:0x8fdcff},
  {id:'tr_veleno',cat:'trail',n:'Scia velenosa',d:'Fendenti verde acido',r:1,col:0x7fe08a},
  {id:'tr_ombra',cat:'trail',n:'Scia d\'ombra',d:'Fendenti viola profondo',r:2,col:0xb88cff},
  {id:'tr_oro',cat:'trail',n:'Scia d\'oro',d:'Fendenti d\'oro puro',r:2,col:0xffd27a},
  {id:'tr_arc',cat:'trail',n:'Scia arcobaleno',d:'Il colore cambia di continuo',r:4,rain:true},
  {id:'kf_pira',cat:'kill',n:'Pira',d:'Il nemico brucia in una colonna di fuoco',r:2,col:0xff7a2e},
  {id:'kf_gelo',cat:'kill',n:'Frantumi',d:'Spuntoni di ghiaccio e schegge',r:2,col:0x8fdcff},
  {id:'kf_cori',cat:'kill',n:'Coriandoli',d:'Festa a ogni nemico sconfitto',r:1,col:0xffd27a},
  {id:'kf_anime',cat:'kill',n:'Anime',d:'Lo spirito sale verso il soffitto',r:2,col:0xb88cff},
  {id:'kf_fulmine',cat:'kill',n:'Fulmine del cielo',d:'Un fulmine colpisce il nemico caduto',r:3,col:0xfff27a},
  {id:'kf_buco',cat:'kill',n:'Buco nero',d:'Il nemico viene risucchiato in un vortice',r:4,col:0x7a4aff},
  {id:'au_brace',cat:'aura',n:'Aura di brace',d:'Scintille che salgono',r:2,col:0xff7a2e},
  {id:'au_neve',cat:'aura',n:'Aura di neve',d:'Fiocchi che cadono intorno a te',r:2,col:0xe8f6ff},
  {id:'au_ombra',cat:'aura',n:'Aura d\'ombra',d:'Fumo viola ai tuoi piedi',r:3,col:0x7a4aff},
  {id:'au_lucciole',cat:'aura',n:'Lucciole',d:'Piccole luci che ti girano intorno',r:3,col:0xd8ff7a},
  {id:'au_stelle',cat:'aura',n:'Polvere di stelle',d:'Stelle d\'oro e bianche che brillano',r:4,col:0xffe08a},
  {id:'pet_luc',cat:'pet',n:'Lucciola',d:'Una lucina che ti svolazza accanto',r:2,col:0xd8ff7a},
  {id:'pet_slime',cat:'pet',n:'Melmina',d:'Una piccola melma amica che saltella',r:2,col:0x7fe08a},
  {id:'pet_gufo',cat:'pet',n:'Gufetto',d:'Sbatte le ali e ti tiene d\'occhio',r:3,col:0xc9a06a},
  {id:'pet_teschio',cat:'pet',n:'Teschietto',d:'Un teschio con una fiammella viola',r:3,col:0xb88cff},
  {id:'pet_drago',cat:'pet',n:'Draghetto',d:'Un drago in miniatura, raro',r:4,col:0xff4a2e},
  {id:'ti_scal',cat:'title',n:'Scalatore',d:'Per chi sale senza fermarsi',r:1},
  {id:'ti_senza',cat:'title',n:'Senza paura',d:'Nessun guardiano ti spaventa',r:1},
  {id:'ti_drago',cat:'title',n:'Ammazzadraghi',d:'Per chi ha visto la cima',r:2},
  {id:'ti_combo',cat:'title',n:'Maestro di combo',d:'Colpi a raffica',r:2},
  {id:'ti_re',cat:'title',n:'Re della torre',d:'Il titolo più ambito',r:3},
  {id:'fr_oro',cat:'frame',n:'Cornice d\'oro',d:'Bordo dorato',r:1,col:'#ffd27a'},
  {id:'fr_gelo',cat:'frame',n:'Cornice di ghiaccio',d:'Bordo azzurro',r:1,col:'#8fdcff'},
  {id:'fr_brace',cat:'frame',n:'Cornice di brace',d:'Bordo che arde',r:2,col:'#ff7a2e'},
  {id:'fr_reale',cat:'frame',n:'Cornice regale',d:'Bordo viola e oro',r:3,col:'#b88cff'},
  {id:'fr_neon',cat:'frame',n:'Cornice neon',d:'Bordo rosa che pulsa',r:4,col:'#ff4dd8'}];
const COS_R=[null,{n:'Comune',css:'#c9c1b0'},{n:'Raro',css:'#5aa9ff'},{n:'Epico',css:'#c27bff'},{n:'Leggendario',css:'#ffb347'}];
const COS_P=[0,1500,3200,5800,9500];
const COS_BY={};for(const c of COS_LIST){c.p=COS_P[c.r];COS_BY[c.id]=c;}
// ogni giorno il Mercante porta 6 cosmetici: 2 comuni, 2 rari, 1 epico, 1 leggendario (uguali per tutti)
const COS_DAY=[[1,2],[2,2],[3,1],[4,1]];
function cosToday(){let s=((dayNo()*2246822519)^0x5bd1e995)>>>0;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};const out=[];
  for(const [r,n] of COS_DAY){const pool=COS_LIST.filter(c=>c.r===r);for(let i=0;i<n&&pool.length;i++)out.push(pool.splice(Math.floor(rnd()*pool.length),1)[0]);}
  return out;}
const COS=Object.assign({own:[],sel:{}},store.get('cosm',{}));const saveCos=()=>store.set('cosm',COS);
const cosOwn=id=>COS.own.includes(id);let cosOf=cat=>{const id=COS.sel[cat];return id&&cosOwn(id)?COS_BY[id]:null;};
const hexCss=h=>typeof h==='string'?h:'#'+(h||0).toString(16).padStart(6,'0');

/* ---------- oggetti per una scalata ---------- */
const RUN_ITEMS=[
  {id:'amu',n:'Amuleto del mercante',d:'+50% rubini raccolti per tutta la scalata',p:220,col:'#ff4d6a'},
  {id:'key',n:'Chiave d\'oro',d:'Il primo forziere che apri dà sempre un oggetto almeno Epico',p:650,col:'#ffd27a'},
  {id:'scr',n:'Pergamena del sapere',d:'Appena entri nella torre scegli un potenziamento su tre',p:450,col:'#c7a8ff'},
  {id:'ton',n:'Tonico del viandante',d:'+25% vita massima finché non batti il primo guardiano',p:180,col:'#7fe08a'}];
const RI_MAX=5;
const RI=Object.assign({n:{},prep:{}},store.get('runitems',{}));const saveRI=()=>store.set('runitems',RI);
const riN=id=>RI.n[id]||0;
const RUN_PACK_P=Math.round(RUN_ITEMS.reduce((s,o)=>s+o.p,0)*0.75);

/* ---------- garanzia sulle casse leggendarie e rinnovo delle skin ---------- */
const PITY_N=10;let PITY=store.get('crpity',0);
const SKRR_P=150,SKRR_MAX=3;let SKRR=store.get('skrr',{d:0,n:0});const skrrN=()=>SKRR.d===dayNo()?SKRR.n:0;
// stesse skin per tutti finché non le rinnovi tu
dailySkins=function(){let s=((dayNo()*2654435761)+skrrN()*0x9E3779B1)>>>0;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  const cls=CLASSES.filter(c=>SKINS[c.id]&&SKINS[c.id].length).map(c=>c.id),vs=Object.keys(VARS).filter(v=>v!=='venom'),out=[];
  while(out.length<3&&cls.length){const cid=cls.splice(Math.floor(rnd()*cls.length),1)[0];const v=vs.splice(Math.floor(rnd()*vs.length),1)[0];
    out.push(sKey(cid,Math.floor(rnd()*SKINS[cid].length),v));}
  return out;};
// le casse: la leggendaria è sicura dopo 9 senza
function crateRoll(cr){const f=Math.max(5,STATS.best||1);let r=Math.max(cr.min,rollRarity(f,0));if(cr.leg&&Math.random()<cr.leg)r=4;
  if(cr.id==='leggenda'){if(PITY>=PITY_N-1)r=4;PITY=r>=4?0:PITY+1;store.set('crpity',PITY);}
  r=Math.min(4,r);const o=Math.random()<0.5?makeWeapon(G.cls.weapon,r,f):makeGear(pick(Object.keys(GEAR)),r,f);invAdd(o);saveInv();return o;}
openCrate=function(cr){const o=crateRoll(cr);crateShow(cr,o);return o;};

/* ---------- disegni per le schede del negozio ---------- */
function cosPic(c){const col=hexCss(c.col||'#ffd27a');
  if(c.cat==='trail'){const st=c.rain?'url(#rg-'+c.id+')':col;
    return `<svg class="cos-pic" viewBox="0 0 100 100" aria-hidden="true">${c.rain?`<defs><linearGradient id="rg-${c.id}" x1="0" x2="1"><stop offset="0" stop-color="#ff4d6a"/><stop offset=".25" stop-color="#ffd27a"/><stop offset=".5" stop-color="#7fe08a"/><stop offset=".75" stop-color="#8fdcff"/><stop offset="1" stop-color="#b88cff"/></linearGradient></defs>`:''}
      <path d="M14 78 Q30 20 86 22" fill="none" stroke="${st}" stroke-width="13" stroke-linecap="round" opacity=".35"/><path d="M18 74 Q34 26 84 24" fill="none" stroke="${st}" stroke-width="6" stroke-linecap="round"/><path d="M22 70 Q38 32 82 26" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>
      <rect x="66" y="58" width="5" height="30" rx="2" fill="#c9cdd6" transform="rotate(-40 68 73)"/><rect x="60" y="80" width="17" height="5" rx="2" fill="#8a6a3a" transform="rotate(-40 68 82)"/></svg>`;}
  if(c.cat==='kill'){const cs=c.id==='kf_cori'?['#ff4d6a','#ffd27a','#7fe08a','#8fdcff','#b88cff']:[col,'#fff',col];let s='';
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r1=14,r2=34+(i%2)*8;s+=`<line x1="${50+Math.cos(a)*r1}" y1="${52+Math.sin(a)*r1}" x2="${50+Math.cos(a)*r2}" y2="${52+Math.sin(a)*r2}" stroke="${cs[i%cs.length]}" stroke-width="${i%2?3:5}" stroke-linecap="round"/>`;}
    if(c.id==='kf_buco')s=`<circle cx="50" cy="52" r="30" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="6 5"/><circle cx="50" cy="52" r="20" fill="none" stroke="#c7a8ff" stroke-width="4" stroke-dasharray="10 6"/><circle cx="50" cy="52" r="10" fill="#0b0614" stroke="#fff" stroke-width="1.5"/>`;
    return `<svg class="cos-pic" viewBox="0 0 100 100" aria-hidden="true">${s}<circle cx="50" cy="52" r="9" fill="${c.id==='kf_buco'?'#0b0614':'#fff'}" opacity=".9"/></svg>`;}
  if(c.cat==='aura')return `<span class="cos-aura" style="--ac:${col}"><i></i><i></i><i></i><i></i><i></i><i></i><b></b></span>`;
  if(c.cat==='title')return `<span class="cos-tagp"><b>${esc(MP.name())}</b><small>${esc(c.n)}</small></span>`;
  if(c.cat==='frame')return `<span class="cos-tagp fr" data-fr="${c.id}" style="--fc:${col}"><b>${esc(MP.name())}</b></span>`;
  if(c.cat==='pet'){const im=petThumb(c.id);return im?`<img class="cos-petimg" src="${im}" alt="">`:`<span class="cos-aura" style="--ac:${col}"><b></b></span>`;}
  return '';}
const RI_SVG={
  amu:'<svg class="cos-pic" viewBox="0 0 100 100" aria-hidden="true"><path d="M30 14 Q50 44 70 14" fill="none" stroke="#d9b45a" stroke-width="4"/><path d="M50 40 L68 58 L50 88 L32 58 Z" fill="#ff4d6a" stroke="#fff" stroke-width="2"/><path d="M50 40 L58 58 L50 88 L42 58 Z" fill="#ff8a9c"/><circle cx="50" cy="40" r="6" fill="#d9b45a"/></svg>',
  key:'<svg class="cos-pic" viewBox="0 0 100 100" aria-hidden="true"><circle cx="34" cy="38" r="17" fill="none" stroke="#ffd27a" stroke-width="8"/><path d="M46 50 L80 84 M66 70 L74 62 M74 78 L82 70" stroke="#ffd27a" stroke-width="8" stroke-linecap="round"/><circle cx="34" cy="38" r="6" fill="#7a5a1a"/></svg>',
  scr:'<svg class="cos-pic" viewBox="0 0 100 100" aria-hidden="true"><rect x="24" y="22" width="52" height="58" rx="4" fill="#f3e6c8" stroke="#8a6a3a" stroke-width="3"/><rect x="18" y="16" width="64" height="10" rx="5" fill="#c9a06a"/><rect x="18" y="76" width="64" height="10" rx="5" fill="#c9a06a"/><path d="M34 40 H66 M34 50 H62 M34 60 H58" stroke="#8a6a3a" stroke-width="3"/><circle cx="64" cy="66" r="7" fill="#c7a8ff" stroke="#fff" stroke-width="2"/></svg>',
  ton:'<svg class="cos-pic" viewBox="0 0 100 100" aria-hidden="true"><rect x="42" y="14" width="16" height="14" rx="3" fill="#8a6a3a"/><path d="M40 28 H60 V40 Q78 50 74 70 Q70 88 50 88 Q30 88 26 70 Q22 50 40 40 Z" fill="#7fe08a" stroke="#fff" stroke-width="3"/><path d="M30 64 Q50 56 70 64 Q68 84 50 84 Q32 84 30 64" fill="#3fae5a"/><path d="M44 50 H56 M50 44 V56" stroke="#fff" stroke-width="5"/></svg>',
  pack:'<svg class="cos-pic" viewBox="0 0 100 100" aria-hidden="true"><path d="M20 40 H80 V84 H20 Z" fill="#7a5434" stroke="#2a1a0e" stroke-width="3"/><path d="M14 30 H86 V42 H14 Z" fill="#9a6a3e" stroke="#2a1a0e" stroke-width="3"/><path d="M50 30 V84" stroke="#d9b45a" stroke-width="7"/><path d="M50 30 Q36 10 30 22 Q28 30 50 30 Q72 30 70 22 Q64 10 50 30" fill="#ff4d6a" stroke="#2a1a0e" stroke-width="2"/></svg>'};

/* ---------- le schede del negozio ---------- */
const buyB=(attr,p)=>`<button class="sh-buy" ${attr} ${COINS.n<p?'disabled':''}>${coinI}<span>${fmtC(p)}</span></button>`;
const COS_CAT1={trail:'Scia dell\'arma',kill:'Effetto uccisione',aura:'Aura',pet:'Compagno',title:'Titolo',frame:'Cornice'};
function cosCard(c,offer){const own=cosOwn(c.id),on=own&&COS.sel[c.cat]===c.id,R=COS_R[c.r];
  return `<article class="sh-card cos-card r${c.r}${on?' on':''}" style="--vc:${hexCss(c.col||'#ffd27a')};--rc:${R.css}"><button class="sh-stage cos-stage" data-cprev="${c.id}" aria-label="Anteprima di ${esc(c.n)}">${cosPic(c)}${on?'<em class="sh-rib">In uso</em>':''}<span class="cos-rar">${R.n}</span><span class="cos-try">Anteprima</span></button>
    <div class="sh-info"><b>${esc(c.n)}</b><span>${COS_CAT1[c.cat]} · ${esc(c.d)}</span></div>
    ${own?`<button class="sh-buy ${on?'off':'wear'}" data-cwear="${c.id}">${on?'Togli':'Usa'}</button>`:offer?buyB(`data-cbuy="${c.id}"`,c.p):'<button class="sh-buy off" disabled>Non in vendita oggi</button>'}</article>`;}
function renderCos(){const today=cosToday();let h=`<div class="sh-h"><b>Oggi dal Mercante</b><span>nuovi tra ${untilNew()} · tocca l'immagine per vederli in azione</span></div>`;
  for(let r=4;r>=1;r--){const l=today.filter(c=>c.r===r);if(!l.length)continue;h+=`<div class="sh-h rr" style="--rc:${COS_R[r].css}"><b>${l.length>1?['','Comuni','Rari','Epici','Leggendari'][r]:COS_R[r].n}</b><span>${fmtC(COS_P[r])} rubini</span></div>`+l.map(c=>cosCard(c,true)).join('');}
  const mine=COS_LIST.filter(c=>cosOwn(c.id));
  h+=`<div class="sh-h"><b>I tuoi cosmetici</b><span>${mine.length?'uno per tipo: tocca «Usa» per indossarlo':'non ne hai ancora'}</span></div>`;
  for(const [cat,tt] of COS_CATS){const l=mine.filter(c=>c.cat===cat);if(l.length)h+=`<div class="sh-h sub"><b>${tt}</b></div>`+l.map(c=>cosCard(c,false)).join('');}
  return h+'<p class="note">Titoli e cornici li vedono gli amici e i compagni in co-op. Aure ed effetti li vede anche chi ti guarda come spettatore.</p>';}
function riCard(o){const n=riN(o.id),on=!!RI.prep[o.id]&&n>0,full=n>=RI_MAX;
  return `<article class="sh-card ri-card${on?' on':''}" style="--vc:${o.col}"><div class="sh-stage cos-stage">${RI_SVG[o.id]}<span class="sh-cnt">${n}/${RI_MAX}</span>${on?'<em class="sh-rib">Pronto</em>':''}</div>
    <div class="sh-info"><b>${esc(o.n)}</b><span>${esc(o.d)}</span></div>
    <div class="ri-act">${full?'<button class="sh-buy off" disabled>Pieno</button>':buyB(`data-ribuy="${o.id}"`,o.p)}${n?`<button class="sh-buy ${on?'off':'wear'}" data-riprep="${o.id}" aria-pressed="${on}">${on?'Non usare':'Prepara'}</button>`:''}</div></article>`;}
function riHtml(){const canPack=RUN_ITEMS.every(o=>riN(o.id)<RI_MAX);
  return `<div class="sh-h"><b>Per la prossima scalata</b><span>prepara quelli che vuoi: si consumano quando entri nella torre</span></div>`+RUN_ITEMS.map(riCard).join('')+
  `<article class="sh-card ri-card pack" style="--vc:#ffd27a"><div class="sh-stage cos-stage">${RI_SVG.pack}<em class="sh-rib">−25%</em></div>
    <div class="sh-info"><b>Pacchetto della scalata</b><span>Uno di ognuno dei 4 oggetti, già preparati per la prossima scalata</span></div>
    <s class="sh-was">${fmtC(RUN_ITEMS.reduce((s,o)=>s+o.p,0))}</s>${canPack?buyB('data-bundle="run"',RUN_PACK_P):'<button class="sh-buy off" disabled>Ne hai già troppi</button>'}</article>`;}
const _rsPlus=renderShop;
renderShop=function(){
  if(shTab==='cos'){const t=shTab;shTab='ogg';try{_rsPlus();}finally{shTab=t;}
    for(const b of document.querySelectorAll('#shop .tab'))b.setAttribute('aria-selected',b.dataset.st===shTab);
    const box=$('shBody');box.className='sh-body sh-cos';box.innerHTML=renderCos();return;}
  _rsPlus();const box=$('shBody');
  if(shTab==='casse'){
    const leg=box.querySelector('.cr-leggenda .sh-info');if(leg)leg.insertAdjacentHTML('beforeend',`<span class="pity">${PITY>=PITY_N-1?'<b>La prossima è Leggendaria sicura!</b>':`Leggendaria sicura entro ${PITY_N-PITY} casse`}</span><i class="pity-bar"><i style="width:${PITY/(PITY_N-1)*100}%"></i></i>`);}
  else if(shTab==='ogg')box.insertAdjacentHTML('afterbegin',riHtml());
  else if(shTab==='skin'){const vn=box.querySelector('.sh-h.vn');if(vn){const nx=vn.nextElementSibling;if(nx&&nx.classList.contains('sh-card'))nx.remove();vn.remove();}
    const h=box.querySelector('.sh-h:not(.vn)');const left=SKRR_MAX-skrrN();
    if(h)h.insertAdjacentHTML('beforeend',left>0?`<button class="sh-rr" data-rr="1" ${COINS.n<SKRR_P?'disabled':''}>Rinnova ${coinI}${SKRR_P} <small>(${left} oggi)</small></button>`:'<small class="sh-rr-off">Rinnovi finiti per oggi</small>');}};
// una scheda in più: Cosmetici
(function(){const tabs=document.querySelector('#shop .sh-tabs');if(tabs&&!tabs.querySelector('[data-st="cos"]')){const b=document.createElement('button');b.className='tab';b.dataset.st='cos';b.setAttribute('role','tab');b.textContent='Cosmetici';
  const sk=tabs.querySelector('[data-st="skin"]');sk?sk.after(b):tabs.appendChild(b);}})();
function shPay(p){if(COINS.n<p)return false;COINS.n-=p;saveCoins();coinHud();sfx('pick');tributo(p);return true;}
$('shop').addEventListener('click',e=>{
  const cb=e.target.closest('[data-cbuy]');if(cb&&!cb.disabled){const c=COS_BY[cb.dataset.cbuy];if(!c||cosOwn(c.id)||!cosToday().includes(c))return;if(!shPay(c.p))return;
    COS.own.push(c.id);COS.sel[c.cat]=c.id;saveCos();cosApply();toast('Nuovo cosmetico!',c.n+' · già in uso');renderShop();return;}
  const cw=e.target.closest('[data-cwear]');if(cw){const c=COS_BY[cw.dataset.cwear];if(!c||!cosOwn(c.id))return;if(COS.sel[c.cat]===c.id)delete COS.sel[c.cat];else COS.sel[c.cat]=c.id;saveCos();cosApply();sfx('equip');renderShop();return;}
  const rb=e.target.closest('[data-ribuy]');if(rb&&!rb.disabled){const o=RUN_ITEMS.find(x=>x.id===rb.dataset.ribuy);if(!o||riN(o.id)>=RI_MAX)return;if(!shPay(o.p))return;
    RI.n[o.id]=riN(o.id)+1;RI.prep[o.id]=true;saveRI();toast(o.n,`Ne hai ${RI.n[o.id]} · pronto per la prossima scalata`);renderShop();return;}
  const rp=e.target.closest('[data-riprep]');if(rp){const id=rp.dataset.riprep;RI.prep[id]=!RI.prep[id];saveRI();sfx('ui');renderShop();return;}
  const bd=e.target.closest('[data-bundle]');if(bd&&!bd.disabled){const k=bd.dataset.bundle;
    if(k==='run'){if(!RUN_ITEMS.every(o=>riN(o.id)<RI_MAX)||!shPay(RUN_PACK_P))return;for(const o of RUN_ITEMS){RI.n[o.id]=riN(o.id)+1;RI.prep[o.id]=true;}saveRI();toast('Pacchetto della scalata','4 oggetti pronti per la prossima scalata');renderShop();return;}
}
  const rr=e.target.closest('[data-rr]');if(rr&&!rr.disabled){if(skrrN()>=SKRR_MAX||!shPay(SKRR_P))return;SKRR={d:dayNo(),n:skrrN()+1};store.set('skrr',SKRR);toast('Skin rinnovate','Il mercante tira fuori altre 3 skin');renderShop();return;}
});

/* ---------- oggetti per la scalata: si consumano quando entri nella torre ---------- */
G.rb=null;
const _srRI=startRun;
startRun=function(){const was=G.scene;G.rb=null;const r=_srRI.apply(this,arguments);
  if(G.scene==='tower'&&was!=='tower'&&!G.pvp&&!G.tutorial&&!RESUMING){
    const used=RUN_ITEMS.filter(o=>RI.prep[o.id]&&riN(o.id)>0);
    if(used.length){G.rb={};for(const o of used){RI.n[o.id]--;if(!RI.n[o.id])RI.prep[o.id]=false;G.rb[o.id]=true;}saveRI();
      if(G.rb.ton){const add=Math.round(S.maxHp*0.25);S.maxHp+=add;P.hp=S.maxHp;G.rb.ton=add;}
      if(G.rb.scr)G.rbScroll=1.1;
      setTimeout(()=>toast('Oggetti della scalata',used.map(o=>o.n).join(' · ')),1800);}}
  return r;};
const _ecRI=enterCellar;enterCellar=function(){G.rb=null;G.rbScroll=0;return _ecRI.apply(this,arguments);};
// Amuleto: +50% rubini raccolti nella torre
const _acRI=addCoins;addCoins=function(n,x,y){if(G.rb&&G.rb.amu&&G.scene==='tower'&&x!=null&&n>0)n=Math.round(n*1.5);return _acRI(n,x,y);};
// Chiave d'oro: il primo forziere che apri dà un oggetto almeno Epico
// (il forziere prima fa la sua animazione: il bottino si decide in chestBurst, lì si alza la rarità)
let KEYC=false;
const _rrRI=rollRarity;rollRarity=function(f,m){const r=_rrRI.apply(this,arguments);return KEYC?Math.max(3,r):r;};
const _ocRI=openChest;openChest=function(c){if(c&&!c.open&&!c.fx&&G.rb&&G.rb.key){G.rb.key=false;c.gkey=true;}return _ocRI.apply(this,arguments);};
const _cbRI=chestBurst;chestBurst=function(c){if(!c||!c.gkey)return _cbRI.apply(this,arguments);c.gkey=false;c.bonus=true;KEYC=true;
  try{return _cbRI.apply(this,arguments);}finally{KEYC=false;popNum(c.x,c.y+2.4,'Chiave d\'oro!','crit');sfx('legend');}};
// Tonico: resta finché non batti il primo guardiano (entri nel piano dopo); vale anche se ricalcoli l'equipaggiamento
const _alRI=applyLoadout;applyLoadout=function(){const r=_alRI.apply(this,arguments);if(G.rb&&typeof G.rb.ton==='number'&&G.scene==='tower')S.maxHp+=G.rb.ton;return r;};
const _sfRI=startFloor;startFloor=function(f){if(G.rb&&typeof G.rb.ton==='number'&&f>1&&isBossFloor(f-1)){S.maxHp=Math.max(1,S.maxHp-G.rb.ton);P.hp=Math.min(P.hp,S.maxHp);G.rb.ton=false;setTimeout(()=>toast('Il tonico svanisce','Torni alla tua vita normale'),900);}
  return _sfRI.apply(this,arguments);};
// Pergamena: appena sei nella torre (e non c'è già un'altra scelta aperta) scegli un potenziamento
const _upRI=update;update=function(dt){_upRI(dt);
  if(G.rbScroll>0&&G.state==='play'&&!P.dead&&!(G.warpPick>0)&&G.scene==='tower'){G.rbScroll-=dt;if(G.rbScroll<=0){G.rbScroll=0;openUpgrade();$('upEyebrow').textContent='Pergamena del sapere';$('upNext').textContent='Scegli un potenziamento: vale fino alla fine della scalata.';}}};

/* ---------- scie dell'arma ---------- */
function trailCol(){const c=cosOf('trail');if(!c)return null;return c.rain?null:c.col;}
const _rbPlus=ribbonUpd;ribbonUpd=function(R){_rbPlus(R);if(R!==hero)return;const c=cosOf('trail');if(!c)return;const u=ribOf(R).m.material.uniforms.uColor.value;
  if(c.rain)u.setHSL((G.time*0.7)%1,0.9,0.62);else u.setHex(c.col);};
const _utPlus=updTrail;updTrail=function(dt){const r=_utPlus(dt);const c=cosOf('trail');if(c&&trailMat&&streakMat){const col=c.rain?new THREE.Color().setHSL((G.time*0.7)%1,0.9,0.62).getHex():c.col;
  trailMat.uniforms.uColor.value.setHex(col);streakMat.uniforms.uColor.value.setHex(col);}return r;};

/* ---------- effetti quando uccidi ---------- */
const _heCos=hitEnemy;hitEnemy=function(e){if(e&&!e.dead)e._mh=G.time;return _heCos.apply(this,arguments);};
const _keCos=killEnemy;killEnemy=function(e){const was=e&&e.dead,r=_keCos.apply(this,arguments);
  if(e&&!was&&e.dead&&G.scene==='tower'&&e.pvp==null&&G.time-(e._mh!=null?e._mh:-9)<0.8){const c=cosOf('kill');if(c)try{killFx(c,e.x,e.y+(e.h||1)*0.5,e.type==='boss');}catch(err){}}
  return r;};
function killFx(c,x,y,big){const k=big?1.8:1;
  switch(c.id){
  case 'kf_pira':fxPillar(x,0,0,0xff7a2e,0.55*k,5*k,0.7);burst(x,y,0xff7a2e,22*k,6,6,-0.3);burst(x,y,0xffd27a,12*k,4,5,-0.2);break;
  case 'kf_gelo':fxSpikes(x,0,0,0x8fdcff,8,0.9*k,1.1*k,0.8);burst(x,y,0xdff4ff,22*k,7,3);burst(x,y,0x8fdcff,10,5,2);break;
  case 'kf_cori':for(const col of [0xff4d6a,0xffd27a,0x7fe08a,0x8fdcff,0xb88cff])burst(x,y+0.3,col,6*k,7,6,0.6);break;
  case 'kf_anime':fxPillar(x,0,0,0xb88cff,0.3*k,6,0.9);burst(x,y,0xb88cff,14*k,2,7,-0.6);burst(x,y+0.5,0xffffff,6,1.5,6,-0.5);fxRing(x,0.06,0,0xb88cff,1.6*k,0.5);break;
  case 'kf_fulmine':lightning(x+rand(-1.2,1.2),CEIL-0.4,x,y);burst(x,y,0xfff27a,20*k,8,3);fxRing(x,0.06,0,0xfff27a,2*k,0.4);sfx('zap');break;
  case 'kf_buco':fxRing(x,y,0,0x7a4aff,2.4*k,0.6,true,0);fxRing(x,y,0,0xc7a8ff,1.4*k,0.45,true,0);for(let i=0;i<10;i++){const a=i/10*TAU;burst(x+Math.cos(a)*1.4,y+Math.sin(a)*1.1,0x7a4aff,2,1.5,0,-0.2);}burst(x,y,0x0b0614,16*k,3,1,0);break;}}

/* ---------- aure ---------- */
let auraT=0;
function auraTick(dt){const c=cosOf('aura');if(!c||!hero||!hero.root.visible||SPEC.on)return;const st=G.state;if(st!=='play'&&st!=='cellar'&&st!=='climb'&&st!=='enter')return;
  auraT-=dt;if(auraT>0)return;auraT=0.075;const x=P.x,y=P.y,z=P.z||0;
  switch(c.id){
  case 'au_brace':burst(x+rand(-0.45,0.45),y+rand(0.05,0.8),Math.random()<0.7?0xff7a2e:0xffd27a,1,0.6,2.2,-0.25,z+rand(-0.3,0.3));break;
  case 'au_neve':burst(x+rand(-0.8,0.8),y+rand(1.8,2.4),0xe8f6ff,1,0.4,0,0.12,z+rand(-0.4,0.4));break;
  case 'au_ombra':burst(x+rand(-0.5,0.5),y+0.1,Math.random()<0.6?0x7a4aff:0x2a1a4a,1,0.8,1.2,-0.1,z+rand(-0.3,0.3));break;
  case 'au_lucciole':{const a=G.time*2.2+Math.random()*TAU,r=0.7;burst(x+Math.cos(a)*r,y+0.9+Math.sin(G.time*3+a)*0.5,0xd8ff7a,1,0.15,0.2,0,z+Math.sin(a)*r*0.6);break;}
  case 'au_stelle':burst(x+rand(-0.7,0.7),y+rand(0.3,2.2),Math.random()<0.5?0xffe08a:0xffffff,1,0.3,0.4,0,z+rand(-0.4,0.4));break;}}

/* ---------- compagni: un piccolo modello che ti segue ---------- */
function petModel(id){const g=new THREE.Group(),bm=c=>new THREE.MeshBasicMaterial({color:c}),add=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c,transparent:true,opacity:0.35,depthWrite:false,blending:THREE.AdditiveBlending},o||{}));
  const parts={};
  if(id==='pet_luc'){mesh(sph(0.11,14,10),bm(0xf6ffb0),0,0,0,g,true);const h=mesh(sph(0.26,14,10),add(0xd8ff7a),0,0,0,g,true);parts.halo=h;
    for(const s of [-1,1]){const w=mesh(new THREE.PlaneGeometry(0.16,0.09),add(0xffffff,{opacity:0.6,side:THREE.DoubleSide}),s*0.1,0.06,0,g,true);w.rotation.z=s*0.5;(parts.wings=parts.wings||[]).push(w);}}
  else if(id==='pet_slime'){const m=toon(0x7fe08a,{emissive:0x1a5a2a,emissiveIntensity:0.4});const b=outline(mesh(sph(0.26,18,12),m,0,0.2,0,g),1.08);b.scale.set(1.1,0.8,1);parts.body=b;
    for(const s of [-1,1]){mesh(sph(0.055,10,8),bm(0xffffff),s*0.09,0.27,0.21,g,true);mesh(sph(0.03,8,6),bm(0x111111),s*0.09,0.27,0.255,g,true);}mesh(sph(0.07,10,8),bm(0xd8ffd0),0.08,0.36,0.12,g,true);}
  else if(id==='pet_gufo'){const br=toon(0x8a6a3a),lt=toon(0xe8d6b0);const b=outline(mesh(sph(0.22,16,12),br,0,0,0,g),1.08);b.scale.set(1,1.15,0.9);
    mesh(sph(0.14,14,10),lt,0,-0.04,0.12,g,true).scale.set(1,1.2,0.6);
    for(const s of [-1,1]){mesh(sph(0.075,12,10),bm(0xfff2c0),s*0.085,0.08,0.17,g,true);mesh(sph(0.04,10,8),bm(0x1a1208),s*0.085,0.08,0.235,g,true);
      const ear=mesh(new THREE.ConeGeometry(0.05,0.12,6),br,s*0.12,0.24,0,g);ear.rotation.z=-s*0.3;
      const w=outline(mesh(sph(0.12,12,8),br,s*0.2,-0.02,-0.02,g),1.1);w.scale.set(0.45,1,0.8);(parts.wings=parts.wings||[]).push(w);}
    mesh(new THREE.ConeGeometry(0.03,0.07,6),toon(0xffb347),0,0.0,0.22,g).rotation.x=Math.PI/2;}
  else if(id==='pet_teschio'){const bn=toon(0xf3ead7);const s=outline(mesh(sph(0.2,16,12),bn,0,0.04,0,g),1.08);s.scale.set(1,0.95,0.95);
    const j=mesh(rbox(0.22,0.09,0.18,0.03),bn,0,-0.13,0.03,g);parts.jaw=j;
    for(const k of [-1,1])mesh(sph(0.055,10,8),bm(0x14081e),k*0.075,0.05,0.165,g,true);
    for(const k of [-1,1])mesh(sph(0.025,8,6),bm(0xc7a8ff),k*0.075,0.05,0.2,g,true);
    const f=mesh(new THREE.ConeGeometry(0.1,0.32,10),add(0xb88cff,{opacity:0.75}),0,0.36,0,g,true);parts.flame=f;
    mesh(new THREE.ConeGeometry(0.05,0.18,8),add(0xffffff,{opacity:0.7}),0,0.31,0.01,g,true);}
  else if(id==='pet_drago'){const rd=toon(0xd8402a),bl=toon(0xffc56b);const b=outline(mesh(sph(0.17,16,12),rd,0,0,0,g),1.08);b.scale.set(1.3,1,0.9);
    const hd=outline(mesh(sph(0.13,14,10),rd,0.2,0.12,0,g),1.1);mesh(rbox(0.12,0.07,0.1,0.03),rd,0.31,0.09,0,g);mesh(sph(0.1,12,8),bl,0.02,-0.06,0.07,g,true).scale.set(1.2,0.7,0.6);
    for(const k of [-1,1]){mesh(sph(0.03,8,6),bm(0xffe08a),0.27,0.16,k*0.07,g,true);const hn=mesh(new THREE.ConeGeometry(0.025,0.1,6),bl,0.16,0.25,k*0.05,g);hn.rotation.z=0.5;
      const w=new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(-0.18,0.3,0),new THREE.Vector3(-0.36,0.04,0)]),toon(0xff7a5a,{side:THREE.DoubleSide}));
      w.geometry.setIndex([0,1,2]);w.geometry.computeVertexNormals();w.position.set(0,0.08,k*0.08);w.rotation.x=k*0.6;g.add(w);(parts.wings=parts.wings||[]).push(w);}
    const t=mesh(new THREE.ConeGeometry(0.06,0.3,8),rd,-0.3,-0.02,0,g);t.rotation.z=Math.PI/2+0.3;mesh(new THREE.ConeGeometry(0.05,0.08,4),bl,-0.45,0.02,0,g).rotation.z=Math.PI/2;}
  g.userData.parts=parts;return g;}
const PET_THUMB={};
function petThumb(id){if(PET_THUMB[id]!=null)return PET_THUMB[id];try{const m=petModel(id);m.scale.setScalar(id==='pet_luc'?3.4:1.75);
  // nelle anteprime le parti luminose si mescolerebbero col colore di sfondo: aloni via, il resto pieno
  m.traverse(o=>{const mt=o.material;if(!mt||!mt.transparent)return;if(mt.opacity<0.5){o.visible=false;return;}o.material=new THREE.MeshBasicMaterial({color:mt.color.clone(),side:mt.side});});m.rotation.y=-0.45;m.position.y=id==='pet_slime'?-0.4:0;
  const u=psURL(psShot(m,72,72,{cx:0,cy:0.05,h:1.5,dist:9}));disposeObj(m);return PET_THUMB[id]=u;}catch(e){return PET_THUMB[id]='';}}
const CPET={id:null,g:null,x:0,y:0,t:0};
function petSet(id){if(CPET.id===id)return;if(CPET.g){scene.remove(CPET.g);disposeObj(CPET.g);CPET.g=null;}CPET.id=id;if(!id)return;
  try{CPET.g=petModel(id);scene.add(CPET.g);CPET.x=P.x;CPET.y=P.y+1.8;CPET.g.position.set(CPET.x,CPET.y,0.4);}catch(e){CPET.g=null;}}
function petTick(dt){const c=cosOf('pet');petSet(c?c.id:null);const g=CPET.g;if(!g)return;
  const show=!!hero&&hero.root.visible&&!SPEC.on&&!['cine','intro','waking','select','wardrobe','menu'].includes(G.state)&&(G.scene==='tower'||G.scene==='cellar');g.visible=show;if(!show)return;
  CPET.t+=dt;const t=CPET.t,f=P.face||1,slime=CPET.id==='pet_slime';
  const tx=P.x-f*(slime?1.0:0.85),ty=slime?P.y:P.y+1.9+Math.sin(t*2.4)*0.12;
  CPET.x+=(tx-CPET.x)*damp(dt,slime?7:4.5);CPET.y+=(ty-CPET.y)*damp(dt,slime?10:4);
  const hop=slime?Math.abs(Math.sin(t*6))*0.32:0;g.position.set(CPET.x,CPET.y+hop,(P.z||0)+0.45);
  const dx=tx-CPET.x;g.rotation.y+=((Math.abs(dx)>0.05?(dx>0?0.5:-0.5):f*0.35)-g.rotation.y)*damp(dt,6);
  const pp=g.userData.parts;
  if(pp.wings)pp.wings.forEach((w,i)=>{const s=i?1:-1;if(CPET.id==='pet_drago')w.rotation.x=s*(0.6+Math.sin(t*12)*0.5);else if(CPET.id==='pet_gufo')w.rotation.z=s*(0.2+Math.sin(t*14)*0.35);else w.rotation.z=s*(0.5+Math.sin(t*30)*0.6);});
  if(pp.halo){const k=1+Math.sin(t*5)*0.15;pp.halo.scale.setScalar(k);if(Math.random()<dt*6)burst(CPET.x,CPET.y,0xd8ff7a,1,0.2,0,0.1,0.45);}
  if(pp.body){const s=1-hop*0.6;pp.body.scale.set(1.1/s*0.92,0.8*s+0.05,1);}
  if(pp.flame){pp.flame.scale.set(1,1+Math.sin(t*14)*0.18,1);if(Math.random()<dt*5)burst(CPET.x,CPET.y+0.45,0xb88cff,1,0.3,1,-0.2,0.45);}
  if(pp.jaw)pp.jaw.position.y=-0.13-Math.max(0,Math.sin(t*3))*0.03;}
const _uhvCos=updHeroVisual;updHeroVisual=function(dt){_uhvCos(dt);try{auraTick(dt);petTick(dt);}catch(e){}if(SPEC.on&&SPEC.R&&SPEC.R.tag)cosTag(SPEC.R);};
function cosApply(){const c=cosOf('pet');petSet(c?c.id:null);heartbeat();}

/* ---------- titolo e cornice: li vedono gli altri (co-op, santuario, spettatori, amici) ---------- */
const _msCos=mpMyState;mpMyState=function(){const s=_msCos.apply(this,arguments);const ti=cosOf('title'),fr=cosOf('frame');if(ti)s.ti=ti.id;if(fr)s.fr=fr.id;return s;};
const _riCos=mpRecvInto;mpRecvInto=function(R,m){_riCos(R,m);R.ti=m.ti||'';R.fr=m.fr||'';};
function cosTag(R){const el=R.tag;if(!el)return;const ti=COS_BY[R.ti],fr=COS_BY[R.fr],tv=ti?ti.n:'',fv=fr?fr.id:'';
  if(el.dataset.ti!==tv){if(tv)el.dataset.ti=tv;else delete el.dataset.ti;R.tagW=0;}
  if(el.dataset.fr!==fv){if(fv){el.dataset.fr=fv;el.style.setProperty('--fc',fr.col);}else{delete el.dataset.fr;el.style.removeProperty('--fc');}}}
const _ptCos=mpPlaceTags;mpPlaceTags=function(){for(const R of [...MP.players.values(),...HUB.players.values()])if(R.tag)cosTag(R);return _ptCos.apply(this,arguments);};
// nella lista amici e nel profilo: titolo sotto il nome
const _hbCos=heartbeat;heartbeat=function(){_hbCos.apply(this,arguments);if(!fbOn()||!store.get('nameok',false))return;const ti=cosOf('title'),fr=cosOf('frame');
  fbPatch('players/'+encodeURIComponent(nameKey(MP.name())),{n:MP.name(),pid:PID,t:Date.now(),ti:ti?ti.id:'',fr:fr?fr.id:''}).catch(()=>{});};
const _slCos=statLine;statLine=function(p){const s=_slCos(p),ti=p&&COS_BY[p.ti];return ti?`<i class="cos-ti">${esc(ti.n)}</i> `+s:s;};

/* ---------- anteprima dentro il negozio: il tuo eroe (con la skin che usi) prova il cosmetico ----------
   Riusa la finestra delle skin: il modello 3D gira, il compagno gli vola accanto, e sopra si disegnano
   scia, effetto uccisione e aura; titolo e cornice compaiono sopra la testa. */
const CV={c:null,ps:[],t:0,k:0,sw:null};
function cosHeroModel(){const c=G.cls,k=SSEL[c.id];if(k&&ownsS(k))try{return skinModel(k);}catch(e){}
  const R=buildSkin(c,SKINPICK[c.id]||0);poseShop(R,c);return R.root;}
function cosView(id){const c=COS_BY[id];if(!c)return;closeView(true);
  let g;try{g=new THREE.Group();const h=cosHeroModel();g.add(h);g.userData.hero=h;
    const pc=c.cat==='pet'?c:cosOf('pet');if(pc){const pm=petModel(pc.id);pm.scale.setScalar(1.7);pm.position.set(-1.35,1.75,0.5);if(pc.id==='pet_slime')pm.position.set(-1.4,0,0.5);
      pm.traverse(o=>{const mt=o.material;if(!mt||!mt.transparent)return;if(mt.opacity<0.5){o.visible=false;return;}o.material=new THREE.MeshBasicMaterial({color:mt.color.clone(),side:mt.side});});
      g.add(pm);g.userData.pet=pm;g.userData.petId=pc.id;}}
  catch(e){return;}
  SV.m=g;SV.k='cos:'+id;SV.a=0.45;SV.spin=0.5;SV.fr=psFrame(g.userData.pet?g:g.userData.hero,g.userData.pet?1.2:1.3,0.8);SV.fr.cy-=0.02;
  Object.assign(CV,{c,ps:[],t:0,k:0.3,sw:null});
  const R=COS_R[c.r];$('svHero').textContent=COS_CAT1[c.cat]+' · '+R.n;$('svName').textContent=c.n;$('svName').style.color=R.css;$('svDesc').textContent=c.d;$('shView').style.setProperty('--vc',R.css);
  // livello sopra il modello: effetti 2D e nome
  const st=$('svCan').parentNode;let fx=$('cvFx');if(!fx){fx=document.createElement('canvas');fx.id='cvFx';fx.width=112;fx.height=140;fx.setAttribute('aria-hidden','true');st.insertBefore(fx,$('svCan').nextSibling);}
  let tg=$('cvTag');if(!tg){tg=document.createElement('span');tg.id='cvTag';tg.className='cos-tagp';st.insertBefore(tg,$('svCan'));}
  const ti=c.cat==='title'?c:cosOf('title'),fr=c.cat==='frame'?c:cosOf('frame');
  tg.innerHTML=`<b>${esc(MP.name())}</b>${ti?`<small>${esc(ti.n)}</small>`:''}`;if(fr){tg.dataset.fr=fr.id;tg.style.setProperty('--fc',fr.col);}else{delete tg.dataset.fr;tg.style.removeProperty('--fc');}
  tg.hidden=!(c.cat==='title'||c.cat==='frame');fx.hidden=false;st.classList.add('cv-on');
  cvAct();$('shView').hidden=false;sfx('ui');
  let last=performance.now();const loop=tt=>{if(!SV.m||SV.k!=='cos:'+id)return;const dt=Math.min(0.05,(tt-last)/1000);last=tt;if(!SV.drag)SV.a+=SV.spin*dt;g.userData.hero.rotation.y=SV.a;if(g.userData.pet)g.userData.pet.rotation.y=0.35+Math.sin(CV.t*0.9)*0.25;
    cvPet(g,dt);try{const img=psShot(g,112,140,SV.fr,true);$('svCan').getContext('2d').putImageData(img,0,0);}catch(e){}
    try{cvFx(dt);}catch(e){}SV.raf=requestAnimationFrame(loop);};SV.raf=requestAnimationFrame(loop);}
function cvAct(){const c=CV.c;if(!c)return;const own=cosOwn(c.id),on=own&&COS.sel[c.cat]===c.id,can=!own&&cosToday().includes(c);
  $('svAct').innerHTML=own?`<button class="sh-buy ${on?'off':'wear'}" data-cwear="${c.id}">${on?'Togli':'Usa'}</button>`:can?`<button class="sh-buy" data-cbuy="${c.id}" ${COINS.n<c.p?'disabled':''}>${coinI}<span>${fmtC(c.p)}</span></button>`:'';
  $('svNote').textContent=own?'È tuo.':can?(COINS.n<c.p?'Ti mancano '+fmtC(c.p-COINS.n)+' rubini.':''):'Oggi il Mercante non lo vende: torna un altro giorno.';}
// il compagno nell'anteprima: vola e sbatte le ali
function cvPet(g,dt){CV.t+=dt;const pm=g.userData.pet;if(!pm)return;const t=CV.t,pp=pm.userData.parts,id=g.userData.petId;
  if(id==='pet_slime'){const hop=Math.abs(Math.sin(t*5))*0.45;pm.position.y=hop;if(pp.body)pp.body.scale.set(1.1,0.8-hop*0.4,1);}else pm.position.y=1.75+Math.sin(t*2.4)*0.14;
  if(pp.wings)pp.wings.forEach((w,i)=>{const s=i?1:-1;if(id==='pet_drago')w.rotation.x=s*(0.6+Math.sin(t*12)*0.5);else if(id==='pet_gufo')w.rotation.z=s*(0.2+Math.sin(t*14)*0.35);else w.rotation.z=s*(0.5+Math.sin(t*30)*0.6);});
  if(pp.halo)pp.halo.scale.setScalar(1+Math.sin(t*5)*0.15);if(pp.flame)pp.flame.scale.set(1,1+Math.sin(t*14)*0.18,1);}
// effetti disegnati sopra il modello (coordinate della tela 112x140: eroe al centro, piedi in basso)
const CX=56,CY=82,FEET=128;
const cvCol=c=>c.id==='tr_arc'?`hsl(${(CV.t*250)%360},90%,62%)`:hexCss(c.col||0xffd27a);
function cvBurst(x,y,col,n,sp,up,g,life){for(let i=0;i<n;i++){const a=Math.random()*TAU,s=sp*(0.3+Math.random());CV.ps.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(up||0),g:g||0,l:life||0.7,m:life||0.7,c:typeof col==='function'?col():col,sz:Math.random()<0.3?2:1});}}
function cvFx(dt){const fx=$('cvFx');if(!fx)return;const x=fx.getContext('2d'),c=CV.c,t=CV.t;x.clearRect(0,0,112,140);CV.k-=dt;
  if(c.cat==='trail'){if(CV.k<=0){CV.k=1.1;CV.sw={t:0};}
    if(CV.sw){const s=CV.sw;s.t+=dt;const p=Math.min(1,s.t/0.22),fade=s.t<0.22?1:Math.max(0,1-(s.t-0.22)/0.35);
      for(let i=0;i<14;i++){const u=i/13;if(u>p)break;const a=-2.4+u*2.7,r=30;const px=CX+8+Math.cos(a)*r,py=CY-6+Math.sin(a)*r*0.9;
        x.globalAlpha=fade*(0.25+0.75*u);x.fillStyle=c.id==='tr_arc'?`hsl(${(u*300+t*200)%360},90%,62%)`:cvCol(c);x.fillRect(Math.round(px)-2,Math.round(py)-2,4,4);
        if(u>0.6){x.fillStyle='#fff';x.globalAlpha=fade*0.8*(u-0.6)/0.4;x.fillRect(Math.round(px)-1,Math.round(py)-1,2,2);}}
      if(s.t>0.6)CV.sw=null;}}
  else if(c.cat==='kill'){if(CV.k<=0){CV.k=1.5;const ex=CX+30,ey=CY+14,col=cvCol(c);
      switch(c.id){case 'kf_pira':CV.ps.push({pil:1,x:ex,c:col,l:0.6,m:0.6});cvBurst(ex,ey,col,22,40,30,-20,0.8);cvBurst(ex,ey,'#ffd27a',10,30,25,-10,0.6);break;
        case 'kf_gelo':for(let i=-3;i<=3;i++)CV.ps.push({spk:1,x:ex+i*5,h:10+Math.random()*10,c:col,l:0.8,m:0.8});cvBurst(ex,ey,'#dff4ff',18,45,10,40,0.6);break;
        case 'kf_cori':cvBurst(ex,ey,()=>['#ff4d6a','#ffd27a','#7fe08a','#8fdcff','#b88cff'][Math.floor(Math.random()*5)],34,55,35,70,1);break;
        case 'kf_anime':CV.ps.push({pil:1,x:ex,c:col,l:0.8,m:0.8,thin:1});cvBurst(ex,ey,col,14,12,35,-25,1);CV.ps.push({ring:1,x:ex,y:FEET-2,c:col,l:0.5,m:0.5,r:14});break;
        case 'kf_fulmine':CV.ps.push({bolt:1,x:ex,y:ey,c:col,l:0.3,m:0.3,pts:Array.from({length:7},(_,i)=>[ex+(Math.random()-0.5)*14*(1-i/7),i/6*ey])});cvBurst(ex,ey,col,20,50,15,30,0.5);CV.ps.push({ring:1,x:ex,y:FEET-2,c:col,l:0.4,m:0.4,r:18});break;
        case 'kf_buco':CV.ps.push({ring:1,x:ex,y:ey,c:col,l:0.7,m:0.7,r:20,inw:1});CV.ps.push({ring:1,x:ex,y:ey,c:'#c7a8ff',l:0.55,m:0.55,r:12,inw:1});cvBurst(ex,ey,'#2a1640',12,15,0,0,0.6);break;}}
    // il nemico che viene sconfitto (una sagoma che sparisce)
    const k=CV.k;if(k>0.9){x.globalAlpha=Math.min(1,(k-0.9)*4);x.fillStyle='#3a5a2a';x.fillRect(CX+24,CY+6,12,FEET-CY-6);x.fillStyle='#7fe08a';x.fillRect(CX+26,CY+8,8,4);x.globalAlpha=1;}}
  else if(c.cat==='aura'){if(Math.random()<dt*28){const col=hexCss(c.col);
      switch(c.id){case 'au_brace':CV.ps.push({x:CX+(Math.random()-0.5)*40,y:FEET-Math.random()*40,vx:0,vy:-25,g:0,l:1,m:1,c:Math.random()<0.7?'#ff7a2e':'#ffd27a',sz:1});break;
        case 'au_neve':CV.ps.push({x:CX+(Math.random()-0.5)*60,y:20+Math.random()*10,vx:(Math.random()-0.5)*6,vy:20,g:0,l:2.4,m:2.4,c:'#e8f6ff',sz:Math.random()<0.4?2:1});break;
        case 'au_ombra':CV.ps.push({x:CX+(Math.random()-0.5)*44,y:FEET-2,vx:(Math.random()-0.5)*8,vy:-12,g:0,l:1.2,m:1.2,c:Math.random()<0.6?'#7a4aff':'#2a1a4a',sz:2});break;
        case 'au_lucciole':{const a=Math.random()*TAU;CV.ps.push({orb:1,a,r:24+Math.random()*10,y0:CY-10+(Math.random()-0.5)*40,l:1.6,m:1.6,c:'#d8ff7a'});break;}
        case 'au_stelle':CV.ps.push({x:CX+(Math.random()-0.5)*56,y:CY-50+Math.random()*90,vx:0,vy:0,g:0,l:0.9,m:0.9,c:Math.random()<0.5?'#ffe08a':'#ffffff',star:1});break;}}}
  // particelle
  for(let i=CV.ps.length-1;i>=0;i--){const p=CV.ps[i];p.l-=dt;if(p.l<=0){CV.ps.splice(i,1);continue;}const k=p.l/p.m;x.globalAlpha=Math.min(1,k*1.4);x.fillStyle=p.c;x.strokeStyle=p.c;
    if(p.pil){const w=p.thin?4:10;x.globalAlpha=k*0.7;x.fillRect(p.x-w/2,0,w,FEET);x.fillStyle='#fff';x.fillRect(p.x-1,0,2,FEET);continue;}
    if(p.spk){const h=p.h*Math.min(1,(1-k)*4);x.beginPath();x.moveTo(p.x-3,FEET);x.lineTo(p.x,FEET-h);x.lineTo(p.x+3,FEET);x.fill();continue;}
    if(p.ring){const r=p.inw?p.r*k:p.r*(1-k)+2;x.lineWidth=2;x.beginPath();x.ellipse(p.x,p.y,r,p.inw?r:r*0.35,0,0,TAU);x.stroke();continue;}
    if(p.bolt){x.lineWidth=2;x.beginPath();p.pts.forEach(([a,b],j)=>j?x.lineTo(a,b):x.moveTo(a,b));x.stroke();continue;}
    if(p.orb){p.a+=dt*2;const px=CX+Math.cos(p.a)*p.r,py=p.y0+Math.sin(p.a*1.7)*6;x.globalAlpha=Math.sin(k*Math.PI);x.fillRect(Math.round(px),Math.round(py),2,2);continue;}
    if(p.star){x.globalAlpha=Math.sin(k*Math.PI);x.fillRect(Math.round(p.x),Math.round(p.y)-1,1,3);x.fillRect(Math.round(p.x)-1,Math.round(p.y),3,1);continue;}
    p.vy+=(p.g||0)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;x.fillRect(Math.round(p.x),Math.round(p.y),p.sz||1,p.sz||1);}
  x.globalAlpha=1;}
// chiudendo la finestra si spengono gli effetti
const _cvClose=closeView;closeView=function(q){const r=_cvClose.apply(this,arguments);CV.c=null;CV.ps=[];const fx=$('cvFx');if(fx){fx.getContext('2d').clearRect(0,0,112,140);fx.hidden=true;}const tg=$('cvTag');if(tg)tg.hidden=true;
  const st=$('svCan')&&$('svCan').parentNode;if(st)st.classList.remove('cv-on');return r;};
$('shop').addEventListener('click',e=>{const b=e.target.closest('[data-cprev]');if(b){e.stopPropagation();cosView(b.dataset.cprev);}},true);
// dopo un acquisto o «Usa» dalla finestra, si aggiornano i pulsanti
const _rsCv=renderShop;renderShop=function(){const r=_rsCv.apply(this,arguments);if(CV.c&&SV.k&&SV.k.startsWith('cos:'))cvAct();return r;};

/* ---------- Venom: non si vende più; è del giocatore «zero» ---------- */
function venomZero(){if(nameKey(MP.name())!=='zero'||!store.get('nameok',false))return;const k=VENOM_K;if(!OWNS.includes(k)){OWNS.push(k);store.set('shopskins',OWNS);toast('Skin Venom','È tua: la trovi tra le skin dell\'eroe');}}
setInterval(venomZero,15000);

/* ---------- avvio ---------- */
setTimeout(()=>{try{cosApply();venomZero();}catch(e){}},1500);
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{COS,RI,cosApply,openShop,renderShop,killFx,CPET,crateRoll,setShTab:t=>{shTab=t;renderShop();},coins:n=>{COINS.n=n;saveCoins();coinHud();}});
