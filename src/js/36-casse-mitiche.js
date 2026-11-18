
/* =========================================================
   CASSE DEL NEGOZIO: Cassa epica (1700) e Cassa mitica (2400, Leggendaria o Mitica),
   e ogni cassa mostra la legenda con le probabilità di ciò che può uscire
   (calcolate sul tuo piano migliore, come l'estrazione vera).
   ========================================================= */
const CRATE_MYTH=0.10;   // Cassa mitica: 10% di oggetto Mitico, altrimenti Leggendario
// Cassa epica (id 'leggenda'): 97% Epica, 3% Leggendaria · Cassa mitica: 90% Leggendaria, 10% Mitica · le altre come l'estrazione nella torre, sul tuo piano migliore
function crateOdds(cr){
  if(cr.id==='leggenda')return [0,0,0,0.97,0.03,0,0];
  if(cr.id==='mitica')return [0,0,0,0,1-CRATE_MYTH,CRATE_MYTH,0];
  const f=Math.max(5,STATS.best||1),mx=lootMaxR(f),nv=novice();
  const w=[nv?30:55,28+f*0.2,(12+f*0.5)*(nv?1.8:1),(4+f*0.35)*(nv?2:1),1+f*0.2,0.7,0.2].map((v,i)=>i>mx?0:v),tot=w.reduce((a,b)=>a+b,0)||1;
  let p=w.map(v=>v/tot);
  for(let i=0;i<cr.min;i++){p[cr.min]+=p[i];p[i]=0;}
  if(cr.leg){p=p.map(v=>v*(1-cr.leg));p[4]+=cr.leg;}
  for(let i=5;i<p.length;i++){p[4]+=p[i];p[i]=0;}
  return p;}
crateRoll=function(cr){const f=Math.max(5,STATS.best||1),p=crateOdds(cr);let x=Math.random(),r=cr.min;
  for(let i=0;i<p.length;i++){if(p[i]<=0)continue;r=i;if((x-=p[i])<0)break;}
  const o=Math.random()<0.5?makeWeapon(G.cls.weapon,r,f):makeGear(pick(Object.keys(GEAR)),r,f);invAdd(o);saveInv();return o;};
const pctOdd=v=>v>=0.995?'100%':v<0.01?String(+(v*100).toFixed(1)).replace('.',',')+'%':Math.round(v*100)+'%';
const _rsMyth=renderShop;
renderShop=function(){_rsMyth.apply(this,arguments);if(shTab!=='casse')return;
  for(const el of document.querySelectorAll('#shBody .cr-leggenda .pity,#shBody .cr-leggenda .pity-bar'))el.remove();   // la garanzia non serve più
  for(const cr of CRATES){const info=document.querySelector(`#shBody .cr-${cr.id} .sh-info`);if(!info||info.querySelector('.cr-odds'))continue;
    const p=crateOdds(cr);
    info.insertAdjacentHTML('beforeend',`<span class="cr-odds" aria-label="Cosa può uscire">${p.map((v,i)=>v>0?`<i style="--rc:${RARITY[i].css}"><em>${RARITY[i].name}</em>${pctOdd(v)}</i>`:'').join('')}</span>`);}};
{const st=document.createElement('style');st.textContent=`
.cr-odds{display:grid;gap:1px;margin-top:3px;padding:4px 6px;background:rgba(0,0,0,.35);border:1px solid rgba(217,180,90,.25);font-size:11px}
.cr-odds i{display:flex;justify-content:space-between;gap:6px;font-style:normal;font-weight:700;color:var(--rc)}
.cr-odds em{font-style:normal;font-weight:600}
@media (max-height:500px),(max-width:600px){.cr-odds{font-size:9.5px;padding:3px 4px}}`;document.head.appendChild(st);}
