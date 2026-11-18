
/* =========================================================
   BESTIARIO illustrato: ritratto del mostro (dal suo modello 3D), chi è, come batterlo.
   I mostri non ancora incontrati si vedono solo in sagoma.
   I ritratti si disegnano uno alla volta dopo l'apertura, così la Bacheca non si blocca.
   ========================================================= */
const BEST_LORE={
  slime:'Una pozza di melma viva nata negli scarichi della torre. Inghiotte tutto quello che cade dai piani di sopra.',
  guard:'Le ossa dei soldati che un tempo difendevano la torre. Non hanno smesso di montare la guardia.',
  mage:'Apprendisti che salirono la torre in cerca di potere. Lo trovarono, e ne furono consumati.',
  bat:'Nidi interi vivono nelle crepe dei muri. Il buio li rende affamati, la luce li rende furiosi.',
  archer:'Tiratori della vecchia guarnigione. Senza carne né occhi, la loro mira è rimasta perfetta.',
  knight:'Cavalieri caduti in battaglia, rialzati da una magia oscura dentro le loro armature nere.',
  imp:'Piccoli diavoli nati dalle braci delle fucine. Vivono un attimo, e lo passano a esplodere.',
  wraith:'Anime rimaste a metà strada tra i vivi e i morti. A volte non c\'è nulla da colpire.',
  brute:'Orchi enormi cresciuti nelle caverne sotto la torre. Non pensano: schiacciano.',
  shaman:'Sacerdoti degli orchi che parlano con gli spiriti. Ogni loro preghiera porta nuovi nemici.',
  spider:'Ragni grossi come cani che tessono le cripte dei piani bassi. La loro tela non perdona.',
  fungus:'Funghi cresciuti sui cadaveri degli avventurieri. Respirano, aspettano e scoppiano.',
  gargoyle:'Statue di pietra a guardia dei cornicioni. Si risvegliano quando qualcuno osa salire.',
  shade:'Frammenti di ombra con una volontà propria. Ti seguono da quando sei entrato nella torre.',
  scorpion:'Bestie delle sabbie portate in torre da un re dimenticato. Il loro veleno è antico.',
  salamander:'Lucertole di fuoco che dormono nella lava dei piani caldi. Il loro respiro brucia.',
  eye:'Un occhio senza corpo nato dal Vuoto. Non dorme mai, non sbatte mai le palpebre.',
  minotaur:'Guardiani del labirinto che è diventato la torre. Cornate capaci di sfondare i muri.',
  'boss:slimeKing':'Il primo sovrano della torre: una melma gigante che ha inghiottito tutti i suoi sudditi.',
  'boss:skelKing':'Capitano della guarnigione morta. Comanda ancora i suoi uomini, ossa compresa.',
  'boss:bknight':'Maestro d\'armi imbattuto. Ha visto cadere mille sfidanti e ricorda ogni loro errore.',
  'boss:fungusKing':'Il cuore della muffa che cresce nei piani bassi. Ogni fungo della torre è un suo figlio.',
  'boss:gargoyleLord':'Il più antico guardiano di pietra. Mille anni immobile, finché non arrivi tu.',
  'boss:shadeLord':'Il Mietitore che raccoglie le ombre di chi cade. Non fa rumore, mai.',
  'boss:ogreKing':'Capotribù degli orchi e voce dei loro antenati. Combatte come dieci guerrieri.',
  'boss:scorpionKing':'Imperatore di un regno di sabbia scomparso. Il suo pungiglione è la sua corona.',
  'boss:salamanderKing':'Un\'idra di fuoco a tre teste nata nel cuore della lava. Tre bocche, una fame.',
  'boss:archmage':'Maghi che hanno venduto l\'anima alla torre. Comandano i morti e leggono le stelle.',
  'boss:eyeLord':'Il re degli occhi del Vuoto. Vede ogni tua mossa prima che tu la faccia.',
  'boss:minoKing':'Re dei minotauri e signore del labirinto. Nessuno ne è mai uscito.',
  'boss:golem':'Colossi di roccia e ghiaccio costruiti per difendere la vetta. Ogni passo fa tremare il piano.',
  'boss:batQueen':'Regina dei nidi nel buio. Le sue picchiate oscurano la luce delle torce.',
  'boss:dragon':'Il signore della torre. Tutto quello che hai affrontato salendo lavorava per lui.'};
const BEST_IMG={};const bestImgQ=[];let bestImgBusy=false;
const bestFrom=k=>{if(k.startsWith('boss:')){const a=k.slice(5),b=BOSS_LIST.find(x=>x[1]===a);return b?b[0]:null;}return TYPES[k]?TYPES[k].from:null;};
function bestModel(k){
  if(k.startsWith('boss:')){const a=k.slice(5),b=BOSS_LIST.find(x=>x[1]===a);if(!b)return null;return bossParts({floor:b[0],arch:a,name:b[2],color:b[3],...b[4]});}
  if(!BUILD[k])return null;G3Q=0.7;let p;try{p=BUILD[k]();}finally{G3Q=1;}return p;}
function bestPic(k){if(BEST_IMG[k]!=null)return BEST_IMG[k];let url='';
  try{const p=bestModel(k);if(p&&p.root){const m=p.root;m.rotation.y=0.55;m.updateMatrixWorld(true);const fr=psFrame(m,1.12,0.9);url=psURL(psShot(m,112,112,fr,true));disposeObj(m);}}catch(e){console.warn('bestiario',k,e);}
  return BEST_IMG[k]=url;}
// i ritratti mancanti si disegnano uno per fotogramma
function bestPump(){if(bestImgBusy)return;bestImgBusy=true;
  const step=()=>{const k=bestImgQ.shift();if(!k){bestImgBusy=false;return;}const url=bestPic(k);
    for(const im of document.querySelectorAll(`#bdBody .bs-pic[data-k="${CSS.escape(k)}"]`)){if(url){im.style.backgroundImage=`url(${url})`;im.classList.add('ok');}else im.classList.add('none');}
    requestAnimationFrame(step);};requestAnimationFrame(step);}
const _rbBest=renderBoard;
renderBoard=function(){_rbBest.apply(this,arguments);if(bdTab!=='best')return;const box=$('bdBody'),bc=bestiaryCount();
  const card=k=>{const b=BEST[k],seen=!!(b&&b.s),boss=k.startsWith('boss:'),name=boss?BOSSARCH[k.slice(5)]:(TYPE_NAMES[k]||cap(k)),fl=bestFrom(k),url=BEST_IMG[k];
    if(url==null&&!bestImgQ.includes(k))bestImgQ.push(k);
    const pic=`<i class="bs-pic${url?' ok':''}" data-k="${esc(k)}"${url?` style="background-image:url(${url})"`:''}></i>`;
    if(!seen)return `<div class="bs unk${boss?' boss':''}">${pic}<div class="bs-tx"><b>???</b><small>${boss?'Guardiano':'Mostro'} non ancora incontrato${fl?` · si trova più in alto`:''}</small><p>Continua a salire per scoprire chi è.</p></div></div>`;
    return `<div class="bs${boss?' boss':''}">${pic}<div class="bs-tx"><b>${esc(name)}</b>
      <small>${boss?`Guardiano del piano ${fl}`:`Dal piano ${fl}`} · Sconfitti: <em>${b.k||0}</em></small>
      <p>${esc(BEST_LORE[k]||'')}</p>${BEST_TIPS[k]?`<p class="bs-tip"><span>Come batterlo</span>${esc(BEST_TIPS[k])}</p>`:''}</div></div>`;};
  const ks=bestKeys(),mons=ks.filter(k=>!k.startsWith('boss:')).sort((a,c)=>(bestFrom(a)||0)-(bestFrom(c)||0)),boss=ks.filter(k=>k.startsWith('boss:')).sort((a,c)=>(bestFrom(a)||0)-(bestFrom(c)||0));
  const pc=Math.round(bc.seen/Math.max(1,bc.tot)*100);
  box.innerHTML=`<div class="bd-h">Bestiario <small class="ms-cnt">${bc.seen} di ${bc.tot} scoperti</small></div><div class="bs-prog"><u style="width:${pc}%"></u></div>
    <h4 class="ms-h">Mostri <small>${mons.length}</small></h4><div class="bs-list">${mons.map(card).join('')}</div>
    <h4 class="ms-h ms-h-claim">Guardiani <small>${boss.length}</small></h4><div class="bs-list">${boss.map(card).join('')}</div>`;
  bestPump();};
{const st=document.createElement('style');st.textContent=`
.bs-prog{height:5px;background:rgba(255,255,255,.08);margin:2px 0 4px}.bs-prog u{display:block;height:100%;background:linear-gradient(90deg,#4fb6a8,#7fe08a)}
.bs-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px;text-align:left}
.bs{display:grid;grid-template-columns:92px 1fr;gap:10px;align-items:start;padding:8px;background:linear-gradient(135deg,rgba(30,34,44,.92),rgba(16,18,24,.92));border:1px solid var(--edge);font-size:12px;color:var(--ink-2)}
.bs.boss{border-color:rgba(255,210,122,.55);background:linear-gradient(135deg,rgba(60,40,20,.55),rgba(16,18,24,.92))}
.bs-pic{display:block;width:92px;height:92px;background:radial-gradient(circle at 50% 60%,rgba(255,255,255,.1),rgba(0,0,0,.35));background-size:cover;background-position:center;border:1px solid rgba(255,255,255,.08);image-rendering:pixelated}
.bs-pic:not(.ok)::after{content:'';display:block;width:100%;height:100%;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.08) 50%,transparent 70%);background-size:200% 100%;animation:bs-load 1.2s linear infinite}
.bs-pic.none::after{animation:none;background:none}
@keyframes bs-load{to{background-position:-200% 0}}
.bs.boss .bs-pic{border-color:rgba(255,210,122,.4);background-color:rgba(80,50,10,.35)}
.bs.unk .bs-pic.ok{filter:brightness(0) drop-shadow(0 0 1px rgba(255,255,255,.35));opacity:.7}
.bs-tx{display:grid;gap:3px;min-width:0}.bs-tx b{font-size:15px;color:var(--ink)}.bs.boss .bs-tx b{color:#ffd27a}
.bs-tx small{font-size:11px;color:var(--ink-2)}.bs-tx small em{font-style:normal;font-weight:700;color:var(--ink)}
.bs-tx p{margin:2px 0 0;line-height:1.35;color:#d9d2c4}.bs.unk .bs-tx b{color:var(--ink-2)}.bs.unk p{color:var(--ink-2);font-style:italic}
.bs-tip{padding:4px 6px;background:rgba(79,182,168,.1);border-left:2px solid #4fb6a8;color:#cfe9e4!important}
.bs-tip span{display:block;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7ff0e4}
@media (max-width:600px),(max-height:500px){.bs-list{grid-template-columns:1fr}.bs{grid-template-columns:72px 1fr}.bs-pic{width:72px;height:72px}}`;document.head.appendChild(st);}
