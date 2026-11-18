
/* =========================================================
   CASSE DEL NEGOZIO: la Cassa leggendaria può dare anche un oggetto MITICO,
   e ogni cassa mostra la legenda con le probabilità di ciò che può uscire
   (calcolate sul tuo piano migliore, come l'estrazione vera).
   ========================================================= */
const CRATE_MYTH=0.03;   // Cassa leggendaria: 3% di oggetto Mitico
function crateOdds(cr){const f=Math.max(5,STATS.best||1),mx=lootMaxR(f),nv=novice();
  // stessi pesi di rollRarity(f,0)
  const w=[nv?30:55,28+f*0.2,(12+f*0.5)*(nv?1.8:1),(4+f*0.35)*(nv?2:1),1+f*0.2,0.7,0.2].map((v,i)=>i>mx?0:v),tot=w.reduce((a,b)=>a+b,0)||1;
  let p=w.map(v=>v/tot);
  for(let i=0;i<cr.min;i++){p[cr.min]+=p[i];p[i]=0;}                       // rarità minima della cassa
  if(cr.leg){p=p.map(v=>v*(1-cr.leg));p[4]+=cr.leg;}                         // possibilità extra di Leggendaria
  for(let i=5;i<p.length;i++){p[4]+=p[i];p[i]=0;}                           // il negozio arriva fino a Leggendaria...
  if(cr.id==='leggenda'){p=p.map(v=>v*(1-CRATE_MYTH));p[5]+=CRATE_MYTH;}    // ...tranne la Cassa leggendaria, che può dare la Mitica
  return p;}
crateRoll=function(cr){const f=Math.max(5,STATS.best||1),p=crateOdds(cr);let x=Math.random(),r=cr.min;
  for(let i=0;i<p.length;i++){if(p[i]<=0)continue;r=i;if((x-=p[i])<0)break;}
  if(cr.id==='leggenda'){if(PITY>=PITY_N-1&&r<4)r=4;PITY=r>=4?0:PITY+1;store.set('crpity',PITY);}
  const o=Math.random()<0.5?makeWeapon(G.cls.weapon,r,f):makeGear(pick(Object.keys(GEAR)),r,f);invAdd(o);saveInv();return o;};
const pctOdd=v=>v>=0.995?'100%':v<0.01?String(+(v*100).toFixed(1)).replace('.',',')+'%':Math.round(v*100)+'%';
const _rsMyth=renderShop;
renderShop=function(){_rsMyth.apply(this,arguments);if(shTab!=='casse')return;
  for(const cr of CRATES){const info=document.querySelector(`#shBody .cr-${cr.id} .sh-info`);if(!info||info.querySelector('.cr-odds'))continue;
    const p=crateOdds(cr);
    info.insertAdjacentHTML('beforeend',`<span class="cr-odds" aria-label="Cosa può uscire">${p.map((v,i)=>v>0?`<i style="--rc:${RARITY[i].css}"><em>${RARITY[i].name}</em>${pctOdd(v)}</i>`:'').join('')}</span>`);}};
{const st=document.createElement('style');st.textContent=`
.cr-odds{display:grid;gap:1px;margin-top:3px;padding:4px 6px;background:rgba(0,0,0,.35);border:1px solid rgba(217,180,90,.25);font-size:11px}
.cr-odds i{display:flex;justify-content:space-between;gap:6px;font-style:normal;font-weight:700;color:var(--rc)}
.cr-odds em{font-style:normal;font-weight:600}
@media (max-height:500px),(max-width:600px){.cr-odds{font-size:9.5px;padding:3px 4px}}`;document.head.appendChild(st);}
