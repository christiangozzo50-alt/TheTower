/* =========================================================
   SCENE: seminterrato ↔ torre
   ========================================================= */
function fadeThen(cb){G.fadeTarget=1;G.fadeCb=cb;}
function showScene(which){
  G.scene=which;const t=which==='tower';
  towerG.visible=t;levelGroup.visible=t;cellarG.visible=!t;
  hemi.intensity=t?0.6:0.42;sun.intensity=t?0.7:0.32;
  G.bounds=t?{left:-HALF+0.6,right:HALF-0.6,ceil:CEIL}:{left:-CH+0.5,right:CH-0.5,ceil:CELLAR_CEIL};G.snapCam=true;
}
function enterCellar(){$('tutBox').hidden=true;G.tutorial=false;$('bossVig').classList.remove('on');G.bi=null;G.bossFlash=0;scene.fog.near=30;scene.fog.far=62;
  clearActors();showScene('cellar');G.solids=[];G.won=false;G.loot=null;
  cellarAmbience();applyLoadout();
  Object.assign(P,{x:9.2,y:0,z:0,vx:0,vy:0,dead:false,hp:S.maxHp,stam:S.stamMax,face:-1,atk:null,dashT:0,dragon:null,shieldT:0,rageT:0,abilCd:0,abil2Cd:0,invul:0,flipT:0,dot:null,slowT:0,chargeT:0,spinT:0,throwT:0});
  hero.root.rotation.z=0;
  ['settings','classes','upgrade','pause','over','loot','win'].forEach(id=>$(id).hidden=true);
  $('hud').hidden=true;showMeds(false);$('cellarHud').hidden=false;$('touch').hidden=!isTouch;
  renderClassChip();MUS.mood='cellar';G.state='cellar';saveStats();
  if(!store.get('tut-done',false)&&store.get('intro-seen',false)&&!G.ctut)startCellarTut();
}
function startRun(){document.querySelector('.floor-label').style.visibility='';G.tutorial=false;G.tut=null;$('tutBox').hidden=true;$('deathFx').classList.remove('on');G.deathSlow=0;
  showScene('tower');G.won=false;applyLoadout();G.cmb=0;G.upKills=0;G.upNeed=14;G.upPending=false;
  Object.assign(P,{hp:S.maxHp,stam:S.stamMax,dead:false,abilCd:0,abil2Cd:0,abil3Cd:0,shieldT:0,rageT:0,bearT:0,regenT:0,punchT:0,dot:null,slowT:0});hero.root.rotation.z=0;
  G.lv={};upReset();G.kills=0;G.runTime=0;G.runXp=0;renderPerks();
  ['settings','classes','upgrade','pause','over','loot','win'].forEach(id=>$(id).hidden=true);
  $('cellarHud').hidden=true;$('prompt').hidden=true;$('bUse').hidden=true;$('hud').hidden=false;$('touch').hidden=!isTouch;
  setupAbilUi();showMeds(true);
  G.warpPick=G.warpTo?0.5:0;clearInput();startFloor(G.warpTo||1);G.warpTo=0;canvas.focus();
}
function endRun(){
  STATS.runs++;if(G.floor>STATS.best)STATS.best=G.floor;
  const id=G.cls.id;if(!STATS.byClass[id]||G.floor>STATS.byClass[id])STATS.byClass[id]=G.floor;saveStats();
}
function gameOver(){
  const prevBest=STATS.best;endRun();G.state='over';clearInput();$('touch').hidden=true;showMeds(false);setHint('',0);
  $('overClass').textContent=`${G.cls.name} · ${G.weapon.name} · ${fmtTime(G.runTime)}`;
  $('overTitle').textContent='Sei morto';$('overSub').textContent=`Caduto al piano ${G.floor}`;
  $('stFloor').textContent=G.floor;$('stKills').textContent=G.kills;$('stXp').textContent=Math.round(G.runXp);$('stBest').textContent=STATS.best;
  $('newRecord').hidden=!(G.floor>prevBest);const ov=$('over');ov.classList.remove('reveal');ov.classList.add('dying');
  const dr=$('drips');dr.innerHTML='';for(let i=0;i<22;i++){const d=document.createElement('i');d.style.left=(i/22*100+rand(-2,2))+'%';d.style.setProperty('--w',rand(0.6,2).toFixed(2)+'vw');
    d.style.setProperty('--h',rand(8,46).toFixed(0)+'vh');d.style.setProperty('--d',rand(0,0.7).toFixed(2)+'s');d.style.setProperty('--s',rand(1.4,2.8).toFixed(2)+'s');dr.appendChild(d);}
  ov.hidden=false;sfx('boom');clearTimeout(gameOver.tm);gameOver.tm=setTimeout(()=>{ov.classList.add('reveal');$('againBtn').focus();},1000);
}
function pause(){if(G.state!=='play')return;G.state='pause';clearInput();renderPauseInfo();$('pause').hidden=false;$('touch').hidden=true;}
function renderPauseInfo(){const c=G.cls,pr=prog(c.id),w=G.weapon,R=RARITY[w.rarity];
  $('pauseInfo').innerHTML=`<div><b>${c.name} · Liv ${pr.lv}</b> — ${pr.lv>=MAX_LV?'livello massimo':Math.floor(pr.xp)+' / '+xpNeed(pr.lv)+' XP'}${pr.pts?' · '+pr.pts+' punti da spendere al piedistallo':''}</div>
  <div><b style="color:${R.css}">${w.name}</b> — danno ${Math.round(weaponDamage())}${w.effect?' · '+EFFECTS[w.effect].desc:''}${w.perk?' · <b style="color:var(--teal)">'+PERKS[w.perk].name+'</b>: '+PERKS[w.perk].desc:''}</div>
  <div class="gear" id="gearRow"></div>
  ${Object.keys(G.lv).length?'<div><b>Potenziamenti:</b> '+UPG.filter(u=>G.lv[u.id]).map(u=>u.name+(G.lv[u.id]>1?' ×'+G.lv[u.id]:'')).join(', ')+'</div>':''}
  <div>Mosse (${touchUI()?'trascina il tasto d\'attacco':PAD.on?'direzione + attacco, o levetta destra':'direzione + attacco'}): <b>A terra</b> — neutro: ${MOVES.nl.name} (catena di 3) · di lato: ${MOVES.sl.name} · giù: ${MOVES.dl.name} (lancia in aria) · su: ${MOVES.ul.name}. <b>In aria</b> — neutro: ${MOVES.na.name} · di lato: ${MOVES.sa.name} · giù: ${MOVES.da.name} (piombi a terra e colpisci tutto intorno) · su: ${MOVES.ua.name}.</div>`;
  renderGear();}
function resume(){if(G.state!=='pause')return;$('pause').hidden=true;G.state='play';if(isTouch)$('touch').hidden=false;canvas.focus();}
function quitToCellar(){$('deathFx').classList.remove('on');G.deathSlow=0;if(G.state==='pause')endRun();$('pause').hidden=true;$('over').hidden=true;G.state='menu';fadeThen(()=>{enterCellar();G.fadeTarget=0;});}
$('resumeBtn').onclick=()=>{sfx('ui');resume();};
$('pauseSettings').onclick=()=>{sfx('ui');openSettings('pause');};
$('pauseQuit').onclick=()=>{sfx('ui');quitToCellar();};
// dopo la morte: 4 secondi di schermo nero con un consiglio di gioco
const TIPS=[
  ()=>'Attento alla <b>stamina</b>: ogni colpo, ogni scatto e ogni salto la consumano. Se resti senza fiato non puoi più attaccare, scattare né saltare: fermati un attimo e lasciala ricaricare.',
  ()=>`Salta e attacca verso il basso: piombi a terra con lo <b>${MOVES.da.name}</b>, un colpo ad area che colpisce tutti i nemici intorno a te.`,
  ()=>touchUI()?`Per lo <b>${MOVES.da.name}</b>: salta, poi trascina il tasto d'attacco verso il basso. Più salti in alto, più arrivi forte.`:`Per lo <b>${MOVES.da.name}</b>: salta, poi tieni premuto giù e attacca. Perfetto quando i nemici ti circondano.`,
  ()=>'Lo <b>scatto</b> ti rende intoccabile per un istante: usalo per passare attraverso gli attacchi, non solo per scappare.',
  ()=>`La <b>${MOVES.dl.name}</b> (giù + attacco a terra) lancia i nemici in aria: salta subito dietro di loro e continua la combo.`,
  ()=>`Il terzo colpo della <b>${MOVES.nl.name}</b> è il più forte: non interrompere la catena a metà.`,
  ()=>'Quando un nemico si carica per colpire, allontanati o scatta via: aspettare il colpo costa caro.',
  ()=>'Le <b>bende</b> curano un quarto della vita. Se hai la vita piena non le raccogli: lasciale lì per dopo.',
  ()=>'Gli oggetti dei forzieri cadono a terra: raccoglili e poi indossali dall\'<b>armadio</b> del seminterrato.',
  ()=>'Nell\'armadio puoi <b>fondere</b> 5 oggetti con lo stesso nome per ottenerne uno di rarità superiore.',
  ()=>'Spendi i <b>punti livello</b> al piedistallo del seminterrato: ogni punto ti rende più forte per tutte le scalate.',
  ()=>'Ogni 5 piani ti aspetta un <b>guardiano</b>. Guarda bene i suoi attacchi prima di lanciarti: ognuno ha il suo ritmo e i suoi momenti scoperti.',
  ()=>'Le <b>abilità</b> si ricaricano da sole: usale spesso, non tenerle da parte aspettando il momento perfetto.',
  ()=>'Combatti vicino al centro della stanza: negli angoli i nemici ti chiudono e non hai spazio per scattare.',
];
function showTip(cb){const el=$('tipScreen');let i;do{i=Math.floor(Math.random()*TIPS.length);}while(TIPS.length>1&&i===showTip.last);showTip.last=i;
  $('tipText').innerHTML=TIPS[i]();G.state='tip';el.classList.remove('on');void el.offsetWidth;el.classList.add('on');
  clearTimeout(showTip.tm);showTip.tm=setTimeout(()=>{el.classList.remove('on');cb();},4000);}
$('againBtn').onclick=()=>{sfx('ui');$('over').hidden=true;$('deathFx').classList.remove('on');G.state='menu';fadeThen(()=>showTip(()=>{startRun();G.fadeTarget=0;}));};
$('overCellar').onclick=()=>{sfx('ui');$('deathFx').classList.remove('on');G.deathSlow=0;$('over').hidden=true;G.state='menu';fadeThen(()=>showTip(()=>{enterCellar();G.fadeTarget=0;}));};
$('pauseBtn').onclick=pause;

/* ---------- Seminterrato: oggetti interattivi ---------- */
let nearInter=null;
function updInterLabels(){const box=$('interLabels'),on=G.scene==='cellar'&&(G.state==='cellar');box.hidden=!on;if(!on)return;
  if(!box.childElementCount)for(const it of INTER){const s=document.createElement('span');s.textContent=it.name;box.appendChild(s);}
  INTER.forEach((it,k)=>{const s=box.children[k],[sx,sy]=toScreen(it.x,it.y+0.35,-1.2);s.style.transform=`translate(${sx}px,${sy}px) translate(-50%,-100%)`;s.classList.toggle('dim',it===nearInter);});}
function updCellar(dt){
  nearInter=null;for(const it of INTER){if(Math.abs(P.x-it.x)<1.6&&P.y<1.6){nearInter=it;break;}}
  for(const it of INTER){const on=it===nearInter;it.ring.material.opacity=lerp(it.ring.material.opacity,on?0.75+Math.sin(G.time*5)*0.2:0.12,damp(dt,8));}
  const pr=$('prompt');
  if(nearInter&&G.state==='cellar'){pr.hidden=false;$('promptName').textContent=nearInter.name;$('promptSub').textContent=nearInter.sub();
    $('promptKey').textContent=inputLabel('use');$('promptKey').hidden=touchUI();
    const [sx,sy]=toScreen(nearInter.x,nearInter.y,-1.2);pr.style.transform=`translate(${sx}px,${sy}px) translate(-50%,-100%)`;
    if(isTouch){$('bUse').hidden=false;$('bUse').textContent='Usa: '+nearInter.name;}
  }else{pr.hidden=true;$('bUse').hidden=true;}
  if(input.usePressed&&nearInter){sfx('ui');nearInter.act();}
}
function renderClassChip(){const pr=prog(G.cls.id);$('clsChip').innerHTML=`<i>${svg(WTYPES[G.cls.weapon].icon)}</i><span>${G.cls.name} · Liv ${pr.lv}<small>${pr.pts?pr.pts+' punti da spendere al piedistallo':G.cls.ability.name}</small></span>`;}

/* ---------- Impostazioni (banco da lavoro) ---------- */
function openSettings(from){
  G.settingsFrom=from;if(from==='cellar')G.state='menu';else $('pause').hidden=true;
  clearInput();$('touch').hidden=true;$('prompt').hidden=true;$('bUse').hidden=true;
  $('volMaster').value=Math.round(SETTINGS.master*100);$('volMusic').value=Math.round(SETTINGS.music*100);$('volSfx').value=Math.round(SETTINGS.sfx*100);
  $('optShake').checked=!!SETTINGS.shake;$('optRumble').checked=SETTINGS.rumble!==false;$('optZoom').value=SETTINGS.zoom||100;syncSliders();renderKeys();renderStats();
  $('keysNote').textContent=isTouch?'Sul telefono usi i tasti a schermo: puoi spostarli e ridimensionarli. I comandi qui sotto valgono per la tastiera.':'Clicca su un tasto e premi quello nuovo. Il clic sinistro del mouse attacca sempre. Tieni W, S o una direzione mentre attacchi per cambiare mossa.';
  $('touchEdit').hidden=!isTouch;
  $('settings').hidden=false;setTimeout(()=>$('settingsClose').focus(),60);
}
function closeSettings(){
  if(G.capture){G.capture=null;renderKeys();}
  $('settings').hidden=true;
  if(G.settingsFrom==='pause')$('pause').hidden=false;else{G.state='cellar';$('touch').hidden=!isTouch;canvas.focus();}
}
function syncSliders(){$('volMasterV').textContent=$('volMaster').value;$('volMusicV').textContent=$('volMusic').value;$('volSfxV').textContent=$('volSfx').value;$('optZoomV').textContent=$('optZoom').value+'%';}
['volMaster','volMusic','volSfx'].forEach(id=>$(id).addEventListener('input',()=>{
  SETTINGS.master=$('volMaster').value/100;SETTINGS.music=$('volMusic').value/100;SETTINGS.sfx=$('volSfx').value/100;syncSliders();applyVolumes();store.set('settings',SETTINGS);}));
['volMaster','volSfx'].forEach(id=>$(id).addEventListener('change',()=>sfx('hit')));
$('optZoom').addEventListener('input',()=>{SETTINGS.zoom=+$('optZoom').value;syncSliders();store.set('settings',SETTINGS);});
$('optShake').addEventListener('change',()=>{SETTINGS.shake=$('optShake').checked;store.set('settings',SETTINGS);});
$('optRumble').addEventListener('change',()=>{SETTINGS.rumble=$('optRumble').checked;store.set('settings',SETTINGS);if(SETTINGS.rumble)padRumble(0.5);});
document.querySelectorAll('#settings .tab').forEach(t=>t.addEventListener('click',()=>{sfx('ui');
  document.querySelectorAll('#settings .tab').forEach(x=>x.setAttribute('aria-selected',x===t?'true':'false'));
  ['audio','gfx','keys','stats'].forEach(k=>$('pane-'+k).hidden=k!==t.dataset.tab);}));
function renderKeys(){
  $('keytable').innerHTML=Object.keys(ACTION_NAMES).map(a=>`<div class="krow"><span>${ACTION_NAMES[a]}</span>${[0,1].map(i=>`<button class="kbtn" data-a="${a}" data-i="${i}">${keyLabel(KEYS[a][i])}</button>`).join('')}</div>`).join('');
}
$('keytable').addEventListener('click',e=>{const b=e.target.closest('.kbtn');if(!b)return;
  if(G.capture)renderKeys();const nb=$('keytable').querySelector(`.kbtn[data-a="${b.dataset.a}"][data-i="${b.dataset.i}"]`);
  G.capture={a:nb.dataset.a,i:+nb.dataset.i};nb.classList.add('wait');nb.textContent='Premi un tasto…';});
function finishCapture(code){
  const c=G.capture;G.capture=null;
  if(code==='Escape'&&c.a!=='pause'){renderKeys();return;}
  for(const a in KEYS)for(let i=0;i<2;i++)if(KEYS[a][i]===code)KEYS[a][i]='';
  KEYS[c.a][c.i]=code;store.set('keys',KEYS);renderKeys();sfx('ui');
}
$('keysReset').onclick=()=>{KEYS=JSON.parse(JSON.stringify(DEFAULT_KEYS));store.set('keys',KEYS);renderKeys();sfx('ui');};
function renderStats(){
  const items=[['Scalate',STATS.runs],['Piano più alto',STATS.best],['Piani superati',STATS.floors],['Nemici sconfitti',STATS.kills],['Guardiani sconfitti',STATS.bosses],['Armi trovate',STATS.weapons],['Armi leggendarie',STATS.legend],['Forzieri aperti',STATS.chests],['Torre conquistata',STATS.wins],['Tempo nella torre',fmtTime(STATS.time)]];
  $('statgrid').innerHTML=items.map(([l,v])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('');
  $('classrec').innerHTML=CLASSES.map(c=>`<div><b>Liv ${prog(c.id).lv}</b>${c.name}<br>record ${STATS.byClass[c.id]?'piano '+STATS.byClass[c.id]:'—'}</div>`).join('');
}
$('settingsClose').onclick=()=>{sfx('ui');closeSettings();};

/* ---------- Piedistallo: scelta della classe ---------- */
function openSelect(){
  G.selPrev=G.clsIdx;G.state='select';clearInput();resetShow();
  ['cellarHud','touch','prompt','bUse'].forEach(id=>$(id).hidden=true);
  renderSelect();$('classes').hidden=false;sfx('ability');burst(PED_X,1.2,0x7ff0e4,24,4,3,0.2);
  setTimeout(()=>$('selOk').focus(),60);
}
function closeSelect(confirm){if(confirm&&!isUnlocked(G.cls))return;
  if(!confirm&&G.clsIdx!==G.selPrev)setClass(G.selPrev);
  if(!isUnlocked(G.cls))setClass(starterIdx());
  if(confirm)store.set('class',G.clsIdx);
  resetShow();$('classes').hidden=true;G.state='cellar';P.x=PED_X;P.y=0;P.z=0;P.face=1;
  $('cellarHud').hidden=false;$('touch').hidden=!isTouch;renderClassChip();canvas.focus();G.snapCam=false;
}
function setClass(i){G.clsIdx=i;G.cls=CLASSES[i];G.weapon=loadoutWeapon(G.cls);G.gear=loadoutGear(G.cls);resetStats();setHero(G.cls);resetShow();G.selT=0.3;
  if(!isUnlocked(G.cls)){for(const m of hero.mats){if(m.color)m.color.setHex(0x0c0c14);if(m.emissive){m.emissive.setHex(0x000000);m.userData.baseE=0;}}for(const o of [hero.wpnF,hero.wpnB])if(o)o.visible=false;}}
function resetShow(){G.selT=0;G.selPrev2=null;G.selRot=null;fxClear();P.dragon=null;P.spinT=0;P.chargeT=0;P.throwT=0;P.bearT=0;P.flipT=0;P.atk=null;P.shieldT=0;P.rageT=0;P.landT=0;P.vx=0;P.comboT=0;}
(function(){const ab=$('abilBar');ab.addEventListener('pointerdown',e=>{if(G.tedit){const el=ab;e.preventDefault();e.stopPropagation();tedPick('abilBar');tedDrag={id:'abilBar',pid:e.pointerId};return;}
  const b=e.target.closest('.ab');if(!b)return;e.preventDefault();audioInit();const a=SLOT[+b.dataset.slot].k;press(a,true);setTimeout(()=>press(a,false),60);b.classList.add('on');setTimeout(()=>b.classList.remove('on'),150);});})();
const LOCK_SVG='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
function renderSelect(){
  $('clist').innerHTML=CLASSES.map((c,i)=>i).sort((a,b)=>(CLASSES[a].tier-CLASSES[b].tier)||a-b).map(i=>{const c=CLASSES[i],pr=prog(c.id),RC=clsRar(c);const lk=!isUnlocked(c);return `<button class="cl ${lk?'lock':''}" data-i="${i}" aria-pressed="${i===G.clsIdx}" style="--rc:${RC.css}"><span class="ico">${lk?LOCK_SVG:svg(WTYPES[c.weapon].icon)}</span><span><b>${c.name}</b><small><em class="rar">${RC.name}</em> · ${lk?'Bloccata':'Liv '+pr.lv}<span class="xpbar"><i style="transform:scaleX(${lk?unlockReq(c).p:Math.min(1,pr.xp/xpNeed(pr.lv))})"></i></span></small></span></button>`;}).join('');
  if(!isUnlocked(G.cls)){const c=G.cls,rq=unlockReq(c),need=fragNeed(c),fr=Math.min(need,UNL.frag[c.id]||0);
    $('cstats').innerHTML=`<div><div class="cs-name">${c.name}</div><div class="cs-sub"><b style="color:${clsRar(c).css}">${clsRar(c).name}</b> · ${c.wname} · Bloccata</div></div>
      <div class="unl-head">${LOCK_SVG}<b>Due modi per sbloccarla</b></div>
      <div class="unl-box"><b>1 · Missione</b><p>${rq.txt}</p><div class="meter"><i style="width:${rq.p*100}%"></i></div><small>${rq.num||''}</small></div>
      <div class="unl-or">oppure</div>
      <div class="unl-box"><b>2 · Frammenti d'anima ${fr}/${need}</b><p>Si trovano a volte nei forzieri, più spesso in quelli dei boss.</p><div class="meter frag"><i style="width:${fr/need*100}%"></i></div>
      ${fr>=need&&(c.tier||0)<3?`<button class="big" id="fragUnlock">Sblocca con i frammenti</button>`:''}</div>
      <div class="cs-abil"><span class="ico">${svg(c.ability.icon)}</span><div><b>${c.ability.name}</b><p>${c.ability.desc}</p></div></div>`;
    $('selOk').disabled=true;$('selOk').textContent='Bloccata';const fb=$('fragUnlock');if(fb)fb.onclick=()=>{UNL.frag[c.id]-=need;unlockClass(c.id,'Sbloccata con i frammenti');setClass(G.clsIdx);renderSelect();};return;}
  $('selOk').disabled=false;$('selOk').textContent='Conferma';
  const c=G.cls,pr=prog(c.id),st=classStats(c,pr),T=WTYPES[c.weapon],need=xpNeed(pr.lv),lock2=pr.lv<LV_ABIL2,lock3=pr.lv<LV_ABIL3;
  const rows=[['Vita',st.maxHp,200,st.maxHp],['Danno',T.dmg*(1+st.lvDmg),40,Math.round(T.dmg*(1+st.lvDmg))],['Attacchi al secondo',st.atkSpd/T.cd,6,(st.atkSpd/T.cd).toFixed(1).replace('.',',')],
    ['Velocità',st.speed,12,st.speed.toFixed(1).replace('.',',')],['Portata',T.hit[1]*st.reach,4,(T.hit[1]*st.reach).toFixed(1).replace('.',',')+' m'],
    ['Armatura',st.armor,0.6,pct(st.armor)],['Critico',st.crit,0.5,pct(st.crit)],['Stamina',st.stamMax,200,st.stamMax],['Salti in aria',c.jumps,2,c.jumps]];
  const tab=G.selTab,tb=(k,l)=>`<button data-tab="${k}" aria-selected="${tab===k}">${l}${k==='pt'&&pr.pts?' ('+pr.pts+')':''}</button>`;
  $('cstats').innerHTML=`<div><div class="cs-name">${c.name}</div><div class="cs-sub"><b style="color:${clsRar(c).css}">${clsRar(c).name}</b> · ${c.wname} · Liv ${pr.lv} · ${pr.lv>=MAX_LV?'max':Math.floor(pr.xp)+'/'+need+' XP'}</div></div>
    <div class="cs-tabs">${tb('st','Statistiche')}${tb('ab','Abilità')}${tb('pt','Punti')}</div>
    ${tab==='st'?`<div class="cs-rows">${rows.map(([l,v,m,t])=>`<span>${l}</span><span class="meter"><i style="width:${Math.min(100,v/m*100)}%"></i></span><em>${t}</em>`).join('')}</div><div class="cs-grow">Record: ${STATS.byClass[c.id]?'piano '+STATS.byClass[c.id]:'nessuno'}</div>`
    :tab==='ab'?`<div class="cs-abil"><span class="ico">${svg(c.ability.icon)}</span><div><b>${c.ability.name}</b><p>${c.ability.desc}</p><p>Ricarica ${c.ability.cd} s</p></div></div>
    <div class="cs-abil ${lock2?'locked':''}"><span class="ico">${svg(c.ability2.icon)}</span><div><b>${c.ability2.name}</b><p>${c.ability2.desc}</p><p>${lock2?'Si sblocca al livello '+LV_ABIL2:'Ricarica '+c.ability2.cd+' s'}</p></div></div>
    <div class="cs-abil ${lock3?'locked':''}"><span class="ico">${svg(c.ability3.icon)}</span><div><b>${c.ability3.name}</b><p>${c.ability3.desc}</p><p>${lock3?'Si sblocca al livello '+LV_ABIL3:'Ricarica '+c.ability3.cd+' s'}</p></div></div>`
    :`<div class="pts-box">${ptsHTML(c,true)}</div><div class="cs-grow">Ogni livello dà un punto. I punti si spendono solo qui, nel seminterrato.</div>`}`;
}
$('clist').addEventListener('click',e=>{const b=e.target.closest('.cl');if(!b)return;const i=+b.dataset.i;if(i===G.clsIdx)return;sfx('ui');setClass(i);burst(PED_X,1.2,0xffb347,20,4,3,0.2);renderSelect();});
$('cstats').addEventListener('click',e=>{const tb=e.target.closest('[data-tab]');if(tb){G.selTab=tb.dataset.tab;sfx('ui');renderSelect();return;}
  const b=e.target.closest('[data-pt]');if(b){spendPoint(b.dataset.pt);renderSelect();burst(PED_X,1.4,0xffd27a,10,3,2,0.2,PED_Z);return;}
  if(e.target.closest('[data-reset]')){resetPoints();renderSelect();}});
function renderPadTable(){const el=$('padtable');if(!el)return;el.innerHTML=Object.keys(PADKEYS_DEF).map(a=>`<button class="padrow${G.padCapture===a||G.padArm===a&&G.padCapture?' cap':''}" data-pa="${a}"><span>${ACTION_NAMES[a]}</span><kbd>${G.padCapture&&G.padArm===a?'Premi un tasto…':padGlyph(a)}</kbd></button>`).join('');
  $('padNote').textContent=PAD.on?"Clicca un'azione e premi il tasto del controller da assegnare. Movimento: levetta sinistra o croce direzionale.":'Collega un controller per cambiare i tasti. Movimento: levetta sinistra o croce direzionale.';}
$('padToggle').onclick=()=>{const b=$('padBox'),o=b.hidden;b.hidden=!o;$('padToggle').setAttribute('aria-expanded',o);$('padToggle').querySelector('span').textContent=o?'▴':'▾';renderPadTable();sfx('ui');};
$('padtable').addEventListener('click',e=>{const r=e.target.closest('[data-pa]');if(!r)return;G.padArm=r.dataset.pa;G.padCapture='armed';sfx('ui');renderPadTable();});
$('padReset').onclick=()=>{PADKEYS=Object.assign({},PADKEYS_DEF);store.set('padkeys',PADKEYS);G.padCapture=null;renderPadTable();padChanged();sfx('ui');};
$('keysToggle').onclick=()=>{const b=$('keysBox'),o=b.hidden;b.hidden=!o;$('keysToggle').setAttribute('aria-expanded',o);$('keysToggle').querySelector('span').textContent=o?'▴':'▾';sfx('ui');};
$('safePts').addEventListener('click',e=>{const b=e.target.closest('[data-pt]');if(b){spendPoint(b.dataset.pt);renderSafePed();burst(P.x,1.4,0x7ff0e4,10,3,2,0.2);}});
$('safeClose').onclick=()=>{sfx('ui');closeSafePed();};
$('selOk').onclick=()=>{if(!isUnlocked(G.cls))return;sfx('pick');closeSelect(true);};
$('replayCine').onclick=()=>{if(!store.get('intro-seen',false))return;sfx('ui');$('settings').hidden=true;G.state='menu';fadeThen(()=>{startCine(true);G.fadeTarget=0;});};

$('selBack').onclick=()=>{sfx('ui');closeSelect(false);};

/* ---------- Filmato introduttivo: tre eroi catturati, uno si libera ---------- */
const CINE_INFO={cavaliere:'Spada e scudo: resistente, para i colpi e carica i nemici.',berserker:'Ascia a due mani: colpi lenti ma devastanti, si infuria.',lanciere:'Lancia: lunga portata, salti acrobatici e affondi.'};
function cineSub(txt){const el=$('cineSub');el.classList.remove('on');if(!txt)return;void el.offsetWidth;el.textContent=txt;el.classList.add('on');}
function makeCineCage(x){const g=new THREE.Group();g.position.set(x,14,0);levelGroup.add(g);const iron=toon(0x3a3a44,{metalness:0.6});
  geoO(new THREE.CylinderGeometry(1.05,1.15,0.2,20),iron,0,0.1,0,g,1.05);geoO(new THREE.CylinderGeometry(1.05,0.95,0.2,20),iron,0,2.75,0,g,1.05);
  const bars=[];for(let i=0;i<12;i++){const a=i/12*TAU;bars.push(mesh(new THREE.CylinderGeometry(0.045,0.045,2.6,6),iron,Math.cos(a)*0.98,1.42,Math.sin(a)*0.98,g));}
  mesh(new THREE.CylinderGeometry(0.03,0.03,12,6),iron,0,8.8,0,g);return {g,bars,landed:false};}
const HCOL={cavaliere:0x7fc8ff,berserker:0xff4a2e,lanciere:0x7ff0e4};
const HCARD={cavaliere:['Cavaliere','Lo scudo della Torre'],berserker:['Berserker','La furia senza catene'],lanciere:['Lanciere','Il drago che vola']};
let cineHall=null,cinePrison=null;
function texTiles(a,b,n){const [c,g]=cv(128,128);g.fillStyle=a;g.fillRect(0,0,128,128);g.fillStyle=b;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const s=128/n;if((x+y)%2)g.fillRect(x*s+1,y*s+1,s-2,s-2);}
  g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=2;for(let k=0;k<=n;k++){g.beginPath();g.moveTo(k*128/n,0);g.lineTo(k*128/n,128);g.stroke();g.beginPath();g.moveTo(0,k*128/n);g.lineTo(128,k*128/n);g.stroke();}grime(g,128,128,500,0.35);
  const tx=new THREE.CanvasTexture(c);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.magFilter=THREE.NearestFilter;return tx;}
function texBricks(a,b){const [c,g]=cv(128,128);g.fillStyle=b;g.fillRect(0,0,128,128);g.fillStyle=a;for(let y=0;y<8;y++)for(let x=-1;x<4;x++)g.fillRect(x*36+(y%2?18:0)+2,y*16+2,32,12);grime(g,128,128,700,0.4);
  const tx=new THREE.CanvasTexture(c);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.magFilter=THREE.NearestFilter;return tx;}
function cineLight(g,x,y,z,col,int,dist){const l=new THREE.PointLight(col,int,dist||14,2);l.position.set(x,y,z);g.add(l);return l;}
function brazier(g,x,z,lights){const st=toon(0x3a3330),fl=new THREE.MeshBasicMaterial({color:0xffb347});
  geoO(new THREE.CylinderGeometry(0.12,0.2,1.6,8),st,x,0.8,z,g,0.2);geoO(new THREE.CylinderGeometry(0.55,0.3,0.4,12),st,x,1.7,z,g,0.55);
  const f=mesh(new THREE.ConeGeometry(0.42,0.9,8),fl,x,2.25,z,g,true);lights.push({l:cineLight(g,x,2.6,z+0.6,0xff9a40,1.6,12),f,seed:Math.random()*9});}
function buildCineHall(){const g=new THREE.Group();g.visible=false;scene.add(g);const L=[];
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(64,26),mat(0xffffff,{map:(()=>{const t=texTiles('#3a3440','#4a4250',2);t.repeat.set(16,6.5);return t;})(),roughness:.9}));fl.rotation.x=-Math.PI/2;fl.position.z=2;fl.receiveShadow=true;g.add(fl);
  const carpet=new THREE.Mesh(new THREE.PlaneGeometry(52,2.4),mat(0x7a1820,{roughness:1}));carpet.rotation.x=-Math.PI/2;carpet.position.set(0,0.01,-1.2);g.add(carpet);
  const wall=new THREE.Mesh(new THREE.PlaneGeometry(64,18),mat(0xffffff,{map:(()=>{const t=texBricks('#4d4552','#2a2430');t.repeat.set(14,4);return t;})()}));wall.position.set(0,9,-6.5);g.add(wall);
  const stone=toon(0x5a5260),gold=toon(0xd9b45a,{emissive:0x5a3a00,emissiveIntensity:0.3}),red=toon(0x8a1c24),moon=new THREE.MeshBasicMaterial({color:0x7f9fd8});
  for(let x=-24;x<=24;x+=8){geoO(new THREE.CylinderGeometry(0.55,0.65,12,12),stone,x,6,-5.6,g,0.65);geoO(new THREE.BoxGeometry(1.6,0.5,1.6),stone,x,0.25,-5.6,g,0.9);}
  for(let x=-20;x<=20;x+=8){const w=mesh(new THREE.PlaneGeometry(2.6,6),moon,x,7.4,-6.45,g,true);mesh(new THREE.CircleGeometry(1.3,20,0,Math.PI),moon,x,10.4,-6.45,g,true);
    const bn=mesh(new THREE.PlaneGeometry(1.6,4.2),red,x+4,9.6,-6.3,g);mesh(new THREE.CircleGeometry(0.45,6),gold,x+4,10.2,-6.25,g,true);}
  // balconata da cui saltano giù i mostri
  geoO(new THREE.BoxGeometry(18,0.5,2),stone,0,6.6,-4.6,g,1);for(let x=-8;x<=8;x+=1.2)mesh(new THREE.CylinderGeometry(0.06,0.06,0.9,6),gold,x,7.3,-3.7,g);
  // portoni ai due lati
  const doors=[];for(const s of [-1,1]){geoO(new THREE.BoxGeometry(1.2,9,3),stone,s*25,4.5,-2.5,g,1);geoO(new THREE.BoxGeometry(1.2,9,3),stone,s*25,4.5,4.5,g,1);geoO(new THREE.BoxGeometry(1.2,1.6,8),stone,s*25,8.2,1,g,1);
    for(const k of [-1,1]){const pv=new THREE.Group();pv.position.set(s*24.8,0,1+k*3.6);g.add(pv);geoO(new THREE.BoxGeometry(0.3,7.4,3.5),toon(0x4a3020),0,3.7,-k*1.75,pv,0.3);doors.push({pv,s,k});}}
  for(const x of [-14,-6,6,14])brazier(g,x,-3.6,L);
  g.add(new THREE.HemisphereLight(0x8899cc,0x2a1a14,0.5));const mn=new THREE.DirectionalLight(0x9fb6ff,0.55);mn.position.set(-6,14,10);g.add(mn);
  return {g,L,doors};}
function buildCinePrison(){const g=new THREE.Group();g.visible=false;scene.add(g);const L=[];
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(40,20),mat(0xffffff,{map:(()=>{const t=texTiles('#2a2a2e','#323236',3);t.repeat.set(10,5);return t;})()}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;g.add(fl);
  const wall=new THREE.Mesh(new THREE.PlaneGeometry(40,14),mat(0xffffff,{map:(()=>{const t=texBricks('#3a3a40','#1c1c22');t.repeat.set(9,3);return t;})()}));wall.position.set(0,7,-4);g.add(wall);
  const iron=toon(0x3a3a44,{metalness:0.6}),straw=toon(0x8a7440);
  for(const x of [-12,-8,8,12]){for(let k=0;k<5;k++)mesh(new THREE.CylinderGeometry(0.05,0.05,4,6),iron,x+k*0.4-0.8,2,-3.2,g);geoO(new THREE.BoxGeometry(2.2,0.25,0.25),iron,x,4,-3.2,g,0.25);}
  for(const x of [-6,-2,2,6]){const c=new THREE.Group();c.position.set(x,6.5,-3.8);g.add(c);for(let k=0;k<6;k++){const l=mesh(new THREE.TorusGeometry(0.1,0.03,6,10),iron,0,-k*0.2,0,c);l.rotation.y=k%2?Math.PI/2:0;}}
  for(const x of [-4,0,4]){const s=mesh(new THREE.CircleGeometry(1.2,10),straw,x,0.02,0.3,g);s.rotation.x=-Math.PI/2;}
  for(const x of [-10,-2,2,10]){addTorch(g,x,3.4,-3.9,true);}
  for(const x of [-6,6])L.push({l:cineLight(g,x,3,0,0xff8a3a,1.2,12),seed:Math.random()*9});
  g.add(new THREE.HemisphereLight(0x6a6a88,0x1a1410,0.35));
  return {g,L};}
function makeCineCage(x,par){const g=new THREE.Group();g.position.set(x,14,0);par.add(g);const iron=toon(0x3a3a44,{metalness:0.6});
  geoO(new THREE.CylinderGeometry(1.05,1.15,0.2,20),iron,0,0.1,0,g,1.05);const top=geoO(new THREE.CylinderGeometry(1.05,0.95,0.2,20),iron,0,2.75,0,g,1.05);
  const bars=[];for(let i=0;i<12;i++){const a=i/12*TAU;bars.push(mesh(new THREE.CylinderGeometry(0.045,0.045,2.6,6),iron,Math.cos(a)*0.98,1.42,Math.sin(a)*0.98,g));}
  const chain=mesh(new THREE.CylinderGeometry(0.03,0.03,12,6),iron,0,8.8,0,g);return {g,bars,top,chain,landed:false};}
const SH=[[0,5.5,'ext'],[5.5,7.5,'hall'],[7.5,9.1,'card0'],[9.1,10.7,'card1'],[10.7,12.3,'card2'],[12.3,13.3,'doorL'],[13.3,14.3,'doorR'],[14.3,16.4,'charge'],
  [16.4,19.4,'duelC'],[19.4,22.4,'duelL'],[22.4,25.6,'spin'],[25.6,27.2,'wide2'],[27.2,30.2,'captain'],[30.2,32.4,'defeat'],[32.4,32.9,'black'],[32.9,35.8,'prison'],[35.8,38.8,'prison2']];
const T_CHOICE=38.8;
function startCine(replay){
  G.state='cine';clearActors();showScene('tower');G.scene='cine';towerG.visible=false;levelGroup.visible=false;cellarG.visible=false;G.floor=1;G.solids=[];G.queue=[];
  if(!cineHall)cineHall=buildCineHall();if(!cinePrison)cinePrison=buildCinePrison();cineHall.g.visible=true;cinePrison.g.visible=false;
  G.cineLights=[hemi.intensity,sun.intensity];hemi.intensity=0.25;sun.intensity=0.15;scene.fog.near=60;scene.fog.far=120;
  ['cellarHud','hud','touch','prompt','bUse','settings','classes','tutBox'].forEach(id=>$(id).hidden=true);showMeds(false);setHint('',0);
  const heroes=STARTERS.map((id,i)=>{const c=CLASSES.find(c=>c.id===id),R=buildHero(c),w=applyVariant(buildWeaponMesh(c.weapon,1,null),{type:c.weapon,rarity:1,v:0});R.arms[0].wr.add(w.g);
    const x=(i-1)*1.8;R.root.position.set(x,0,0);cineHall.g.add(R.root);return {i,id,c,R,x,y:0,vx:0,vy:0,ry:0,face:i===0?-1:i===2?1:-1,spin:0,act:'guard',at:0,ph:0,home:(i-1)*6,q:[],tgt:null,ds:'engage',dt:0,kneel:0};});
  for(const d of cineHall.doors)d.pv.rotation.y=0;
  G.cine={t:0,replay,heroes,mons:[],cap:null,cp:new THREE.Vector3(0,4,12),cl:new THREE.Vector3(0,1.4,0),hover:1,chosen:null,ct:0,ev:{},choice:false,shot:-1,battle:false};
  $('cine').hidden=false;$('cine').classList.add('on');$('cineSkip').hidden=!replay;$('cineChoice').hidden=true;cineSub('');MUS.mood='boss';G.fade=1;G.fadeTarget=0;G.fadeSpd=1.2;G.snapCam=true;
}
function cineSay(txt,who){const el=$('cineSub');el.classList.remove('on');if(!txt)return;void el.offsetWidth;el.innerHTML=(who?`<b>${who}:</b> `:'')+txt;el.classList.add('on');}
function cineCard(i,tag){const el=$('cineCard');if(i==null){el.hidden=true;return;}const h=STARTERS[i],[n,tg]=HCARD[h];el.style.setProperty('--cc','#'+HCOL[h].toString(16).padStart(6,'0'));
  $('ccName').textContent=n;$('ccTag').textContent=tag||tg;el.hidden=false;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');}
function cineMon(type,x,o){const e=spawnEnemy(type,{x});if(!e)return null;e.spawnT=0;e.onGround=true;e.vy=0;e.vx=0;e.state='move';
  e.cm=Object.assign({mode:'walk',tx:x,spd:5,cz:0,down:0},o||{});G.cine.mons.push(e);if(e.cm.y){e.y=e.cm.y;e.onGround=false;e.cm.mode='fly';e.cm.fvx=0;}return e;}
function cineKnock(e,dir,power){const C=G.cine;if(C)(C.kn||(C.kn=[])).push([+C.t.toFixed(1),Math.min(...C.heroes.map(h=>Math.abs(h.x-e.x))).toFixed(2),power]);e.flash=0.14;burst(e.x,e.y+e.h*0.6,0xffffff,10,5,1);burst(e.x,e.y+e.h*0.55,0xb01020,power>0.5?22:10,power>0.5?8:5,2,1.2);
  if(power>0.5){e.cm.mode='fly';e.cm.fvx=dir*rand(8,12)*power;e.vy=rand(6,9)*Math.min(1.4,power);e.onGround=false;popNum(e.x,e.y+e.h+0.4,pick(['SBAM!','BONK!','POW!','CRASH!','KABOOM!']),'crit');shake(0.25);sfx('heavy');}
  else{e.x+=dir*0.35;e.flinch=0.2;sfx('hit');}}
function cineMonUpd(e,dt){const m=e.cm;if(e.dead)return;e.flash=(e.flash||0)-dt;e.flinch=(e.flinch||0)-dt;
  if(m.mode==='fly'){e.vy-=30*dt;e.y+=e.vy*dt;e.x+=m.fvx*dt;if(e.y<=0){e.y=0;e.onGround=true;burst(e.x,0.2,0xb9ad98,12,4,2);
      if(m.fvx&&Math.abs(m.fvx)>2){m.mode='slide';}else{m.mode=m.after||'walk';}}}
  else if(m.mode==='slide'){m.fvx*=Math.pow(0.02,dt);e.x+=m.fvx*dt;m.down=Math.min(1,m.down+dt*4);if(Math.abs(m.fvx)<0.3)m.mode='down';}
  else if(m.mode==='down'){m.down=Math.min(1,m.down+dt*4);}
  else if(m.mode==='walk'||m.mode==='exit'){const d=m.tx-e.x;e.vx=Math.abs(d)>0.1?Math.sign(d)*Math.min(m.spd,Math.abs(d)*6):0;e.x+=e.vx*dt;if(e.vx)e.face=Math.sign(e.vx);else if(m.look!=null)e.face=Math.sign(m.look-e.x)||e.face;e.state=m.wind?'wind':'move';}
  if(m.mode!=='walk'&&m.mode!=='exit')e.vx=0;}
function cineAfterSync(){const C=G.cine;if(!C)return;for(const e of C.mons){if(e.dead)continue;const r=e.parts.root,m=e.cm;r.position.z=m.cz;
    if(m.down>0){r.rotation.z=-(Math.sign(m.fvx)||1)*Math.PI/2*easeOutCubic(m.down);r.position.y=e.y+(e.parts.rig?0.2*(e.sc||1):e.w*0.45)*m.down;}}}
// pose degli eroi
function cineHeroPose(h,dt){const tg=tgBase(),W=WREST[h.c.weapon]||{},Bq=BREST[h.id]||BREST_DEF;h.at+=dt;
  Object.assign(tg,{shF:W.sh,elF:W.el,wrF:W.wr,shB:Bq.sh,elB:Bq.el,wrB:Bq.wr||0});let ry=h.face*Math.PI/2*0.8,spinning=false;const a=h.act,k=h.at;
  const legs=()=>Object.assign(tg,{crouch:0.14,hF:-0.4,kF:0.5,hB:0.4,kB:0.35});
  if(a==='front'){legs();ry=0;}
  else if(a==='guard'){legs();tg.head=Math.sin(G.time*2+h.i)*0.05;}
  else if(a==='run'){h.ph+=dt*11;walkTg(tg,h.ph,1);tg.lean=0.35;tg.shF=0.4+Math.sin(h.ph)*0.2;tg.elF=-0.35;tg.wrF=1.05-tg.shF+0.35;tg.shB=-Math.sin(h.ph)*0.8;tg.elB=-1;}
  else if(a==='swing'||a==='heavy'){legs();const q=clamp(k/(a==='heavy'?0.38:0.3),0,1);
    if(h.id==='lanciere'){tg.shF=-1.57;tg.elF=q<0.45?lerp(-0.6,-2.3,q/0.45):lerp(-2.3,0,clamp((q-0.45)/0.15,0,1));tg.wrF=-1.57-tg.shF-tg.elF;tg.lean=q<0.45?-0.1:0.35;tg.hF=-0.8;tg.kF=0.4;}
    else{const w=q<0.42?q/0.42:1,s=clamp((q-0.42)/0.16,0,1);tg.shF=lerp(lerp(W.sh,-3.0,easeOutCubic(w)),-0.25,easeInOutCubic(s));tg.elF=lerp(-0.4,-0.05,s);tg.lean=lerp(-0.15,0.4,s);tg.twist=lerp(-0.45,0.45,s);tg.hF=-0.7;tg.kF=0.55;
      if(h.id==='berserker'){tg.shB=tg.shF;tg.elB=tg.elF;}}}
  else if(a==='block'){legs();tg.shB=-1.55;tg.elB=-0.5;tg.crouch=0.22;tg.lean=0.12;}
  else if(a==='dodge'){legs();tg.lean=-0.45;tg.head=-0.3;tg.crouch=0.2;}
  else if(a==='roar'){Object.assign(tg,{shF:-2.8,elF:-0.2,shB:-2.8,elB:-0.2,head:-0.45,lean:-0.25,crouch:0.15,hF:-0.4,kF:0.5,hB:0.4,kB:0.4});ry=0;if(Math.random()<0.7)burst(h.x+rand(-.4,.4),rand(0.3,2),HCOL[h.id],1,1,2,-0.4);}
  else if(a==='spin'){Object.assign(tg,{shF:-1.6,elF:0,shB:-1.6,elB:0,crouch:0.1});spinning=true;h.spin+=dt*26;for(let j=0;j<4;j++){const an=h.spin+j*1.57;burst(h.x+Math.cos(an)*1.0,rand(0.1,2.4),HCOL[h.id],1,0.6,0.7,0,Math.sin(an)*1.0);}}
  else if(a==='air'){tg.hF=-1;tg.kF=1.5;tg.hB=-0.6;tg.kB=1.3;tg.shF=h.vy>0?-2.9:-1.9;tg.wrF=h.vy>0?0:-1.2;tg.elF=0;}
  else if(a==='hurt'){Object.assign(tg,{lean:-0.5,head:-0.5,shF:0.6,shB:0.6,hF:0.4,kF:0.6});}
  else if(a==='kneel'){const q=clamp(k/0.4,0,1);Object.assign(tg,{crouch:0.45*q,kF:2*q,hF:-0.6*q,kB:2.2*q,hB:-0.2*q,lean:0.35*q,head:0.5*q,shF:lerp(W.sh,0.3,q),elF:lerp(W.el,-1.4,q),shB:lerp(Bq.sh,0.3,q),elB:lerp(Bq.el,-1.4,q)});ry*=1-q*0.7;}
  else if(a==='grip'){Object.assign(tg,{shF:-1.45,elF:-0.3,shB:-1.45,elB:-0.3,lean:0.1+Math.sin(G.time*30)*0.05});ry=0;}
  else if(a==='pose'){tg.shF=-2.9;tg.elF=-0.2;tg.head=-0.25;legs();ry=0.3;}
  // fisica semplice: salti, spinte all'indietro
  if(h.y>0||h.vy>0){h.vy-=30*dt;h.y+=h.vy*dt;h.x+=h.vx*dt;if(h.y<=0){h.y=0;h.vy=0;h.vx=0;if(h.onLand){const f=h.onLand;h.onLand=null;f();}}}
  else if(h.vx){h.x+=h.vx*dt;h.vx*=Math.pow(0.01,dt);if(Math.abs(h.vx)<0.2)h.vx=0;}
  h.ry=spinning?h.spin:lerp(h.ry,ry,Math.min(1,dt*10));h.R.root.rotation.y=h.ry;h.R.root.position.set(h.x,h.y,0);
  applyPose(h.R,tg,Math.min(1,dt*16),Math.min(1,dt*20));}
function heroAct(h,a){h.act=a;h.at=0;}
// duello: il nemico arriva a contatto, carica il colpo, l'eroe para o schiva e risponde con una combo che lo scaraventa via
function cineDuel(h,dt){const C=G.cine;if(h.special)return;
  let e=h.tgt;if(!e||e.dead||!(e.cm.mode==='walk')){h.tgt=e=h.q.find(m=>!m.dead&&m.cm.mode==='walk');h.ds='engage';h.dt=0;}
  h.q.filter(m=>!m.dead&&m.cm.mode==='walk'&&m!==e).forEach((m,k)=>{const s=Math.sign(m.x-h.x)||m.cm.side||1;m.cm.tx=h.x+s*(3.4+k*1.3);m.cm.look=h.x;});
  if(!e){if(h.act!=='guard'&&h.act!=='front')heroAct(h,'guard');return;}
  const side=Math.sign(e.x-h.x)||e.cm.side||1;h.face=side;e.cm.tx=h.x+side*1.45;e.cm.look=h.x;h.dt+=dt;
  if(h.ds==='engage'){if(h.act!=='guard')heroAct(h,'guard');if(Math.abs(e.x-e.cm.tx)<0.12){h.ds='wind';h.dt=0;e.cm.wind=1;e.warn=0.6;}}
  else if(h.ds==='wind'&&h.dt>0.32){h.ds='def';h.dt=0;e.cm.wind=0;e.warn=0;
    if(h.id==='cavaliere'){heroAct(h,'block');burst(h.x+side*0.7,1.4,0xfff2b0,16,6,1);popNum(h.x+side*0.7,2.6,'CLANG!','crit');sfx('block');}
    else{heroAct(h,'dodge');h.vx=-side*3;sfx('dash');spawnGhost(HCOL[h.id]);}}
  else if(h.ds==='def'&&h.dt>0.24){h.ds='c1';h.dt=0;heroAct(h,'swing');}
  else if(h.ds==='c1'){if(!h.h1&&h.dt>0.13){h.h1=1;e.cm.tx=e.x;cineKnock(e,side,0.3);}if(h.dt>0.3){h.h1=0;h.ds='c2';h.dt=0;heroAct(h,'heavy');}}
  else if(h.ds==='c2'){if(!h.h2&&h.dt>0.17){h.h2=1;cineKnock(e,side,1);fxSlash(e.x,1.2,0,HCOL[h.id],1.2,Math.PI/2,side*0.4,0.25);}if(h.dt>0.42){h.h2=0;h.ds='engage';h.tgt=null;h.dt=0;}}}
function cineCam(C,sh,lt,t){const H=C.heroes,cap=C.cap;
  switch(sh){
  case 'ext':return [[0,4,12],[0,1.4,0]];
  case 'hall':{const k=easeInOutCubic(lt/2);return [[0,lerp(0.6,6,k),lerp(7,17,k)],[0,lerp(2.6,1.4,k),0]];}
  case 'card0':case 'card1':case 'card2':{const h=H[+sh[4]],a=0.35+lt*0.3;return [[h.x+Math.sin(a)*3,1.55,Math.cos(a)*3],[h.x,1.4,0]];}
  case 'doorL':return [[-15,2.6,7],[-24,3,1]];
  case 'doorR':return [[15,2.6,7],[24,3,1]];
  case 'charge':return [[0,7,24],[0,1.2,0]];
  case 'duelC':{const h=H[0];return [[h.x-0.6+Math.sin(lt*0.4),2,5.4],[h.x-1.6,1.3,0]];}
  case 'duelL':{const h=H[2];return [[h.x+0.6+lt*0.3,2.2,5.8],[h.x+1.8,1.6,0]];}
  case 'spin':{const a=lt*0.25;return [[Math.sin(a)*4.6,0.7,Math.cos(a)*4.6],[0,1.8,0]];}
  case 'wide2':return [[0,9,27],[0,1,0]];
  case 'captain':{const cx=cap?cap.x:12,cy=cap?cap.y:0;return lt<1.2?[[cx-3.4,0.8,6],[cx,2.8,0]]:[[cx*0.5,3+cy*0.4,14],[cx*0.5,1.5+cy*0.5,0]];}
  case 'defeat':return [[0,3.4,9.5],[0,1,0]];
  case 'black':return [[0,4,12],[0,1.4,0]];
  case 'prison':return [[0,0.6,7.5],[0,lerp(6,2,clamp(lt/2,0,1)),0]];
  case 'prison2':{const k=easeInOutCubic(clamp(lt/3,0,1));return [[lerp(-7,0,k),2.5,lerp(10,7.5,k)],[0,1.3,0]];}}
  return [[0,4,12],[0,1.4,0]];}
function updCine(rdt){const C=G.cine;if(!C)return;
  const slow=(C.t>23.9&&C.t<24.5)||(C.t>28.5&&C.t<29.1);const dt=slow?rdt*0.3:rdt;C.t+=dt;const t=C.t;
  let si=SH.findIndex(s=>t>=s[0]&&t<s[1]);if(si<0)si=SH.length-1;
  if(si!==C.shot){C.shot=si;G.snapCam=true;const f=$('cineCut');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');
    const name=SH[si][2];C.shotName=name;cineCard(name.startsWith('card')?+name[4]:null);
    const op=$('opener');if(name==='ext'){op.hidden=false;op.classList.remove('go');op.classList.add('cineview');opPixel.restart&&opPixel.restart();}else if(op.classList.contains('cineview')){op.hidden=true;op.classList.remove('cineview');}
    $('cineBlack').classList.toggle('on',name==='black');
    if(name==='prison'){cineHall.g.visible=false;cinePrison.g.visible=true;for(const e of C.mons){if(!e.dead){e.dead=true;scene.remove(e.parts.root);}}
      C.heroes.forEach((h,i)=>{cinePrison.g.add(h.R.root);h.x=(i-1)*4;h.y=0;h.vx=h.vy=0;h.face=1;heroAct(h,'kneel');h.at=1;h.cage=makeCineCage(h.x,cinePrison.g);});}}
  const lt=t-SH[si][0];C.lt=lt;const H=C.heroes,[hc,hb,hl]=H;
  const once=(k,fn)=>{if(!C.ev[k]&&t>=+k.split('@')[1]){C.ev[k]=1;fn();}};
  // racconto
  once('a@0.5',()=>cineSay('Sulla cima del mondo sorge la Torre.'));
  once('b@3',()=>cineSay('Tre eroi giurarono di proteggerla.'));
  once('c@5.5',()=>H.forEach(h=>heroAct(h,'front')));
  once('d@7.7',()=>heroAct(hc,'block'));once('d2@9.3',()=>heroAct(hb,'roar'));once('d3@10.9',()=>{heroAct(hl,'air');hl.vy=11;hl.onLand=()=>{heroAct(hl,'pose');fxRing(hl.x,0.06,0,HCOL.lanciere,2,0.4);};});
  once('e@12.3',()=>{H.forEach(h=>heroAct(h,'front'));shake(0.5);sfx('boom');cineSay('Arrivano dai portoni!','Cavaliere');});
  once('f@12.4',()=>{for(let i=0;i<6;i++){cineMon(i%3===2?'knight':'guard',-26-i*1.4,{tx:-26-i*1.4,side:-1,spd:6});cineMon(i%3===1?'knight':'guard',26+i*1.4,{tx:26+i*1.4,side:1,spd:6});}});
  // i portoni si spalancano
  for(const d of cineHall.doors){const tt=d.s<0?t-12.5:t-13.5;if(tt>0)d.pv.rotation.y=lerp(d.pv.rotation.y,d.k*d.s*-1.6,Math.min(1,rdt*6));}
  once('g@14.3',()=>{C.battle=true;H.forEach(h=>{heroAct(h,'run');});
    for(const e of C.mons){const s=e.cm.side;(s<0?hc:hl).q.push(e);}
    C.cap=cineMon('knight',30,{tx:21,spd:3,side:1});if(C.cap){C.cap.sc=2.2;C.cap.cm.boss=1;hl.q=hl.q.filter(m=>m!==C.cap);}});
  once('h@15',()=>cineSay('Prendeteli! AHAHAH!','Capitano'));
  // gli eroi corrono ai loro posti
  if(t>14.3&&t<16.4)H.forEach(h=>{const d=h.home-h.x;if(Math.abs(d)>0.1){h.x+=Math.sign(d)*Math.min(Math.abs(d),9*dt);h.face=Math.sign(d)||h.face;if(h.act!=='run')heroAct(h,'run');}else if(h.act==='run'){heroAct(h,'guard');h.face=h.i===0?-1:h.i===2?1:-1;}});
  // nemici che saltano giù dalla balconata addosso al berserker
  once('i@16.6',()=>{for(const x of [-2.4,2.4,-3.6,3.6]){const e=cineMon(Math.random()<0.5?'guard':'slime',x,{y:7,side:Math.sign(x)});if(e){e.cm.after='walk';hb.q.push(e);}}});
  once('i2@19.6',()=>{for(const x of [-2.6,2.8]){const e=cineMon('guard',x,{y:7,side:Math.sign(x)});if(e){e.cm.after='walk';hb.q.push(e);}}});
  if(C.battle&&t>16.4)H.forEach(h=>cineDuel(h,dt));
  // il lanciere vola sopra i nemici e piomba su di loro
  once('j@20.6',()=>{hl.special=1;heroAct(hl,'air');hl.vy=13;hl.vx=4;hl.onLand=()=>{heroAct(hl,'guard');hl.special=0;fxRing(hl.x,0.06,0,HCOL.lanciere,3.6,0.5);burst(hl.x,0.2,HCOL.lanciere,40,8,2,0.6);shake(0.4);sfx('slam');
    for(const e of C.mons)if(!e.dead&&e!==C.cap&&Math.abs(e.x-hl.x)<4&&(e.cm.mode==='walk'||(e.cm.mode==='fly'&&!e.cm.fvx)))cineKnock(e,Math.sign(e.x-hl.x)||1,1.1);};});
  // il berserker urla e scatena il vortice: tutti attorno volano via (al rallentatore)
  once('k@22.6',()=>{hb.special=1;for(const x of [-1.7,1.7,-2.8,2.8]){const e=cineMon('guard',x*3,{tx:x,side:Math.sign(x),spd:9});if(e)hb.q.push(e);}heroAct(hb,'guard');});
  once('k2@23.2',()=>{heroAct(hb,'roar');sfx('roar');cineSay('AAARGH!','Berserker');});
  once('k3@23.8',()=>{heroAct(hb,'spin');sfx('swing');});
  once('k4@24.1',()=>{for(const e of C.mons)if(!e.dead&&e!==C.cap&&Math.abs(e.x-hb.x)<4.2&&(e.cm.mode==='walk'||(e.cm.mode==='fly'&&!e.cm.fvx)))cineKnock(e,Math.sign(e.x-hb.x)||1,1.3);fxRing(hb.x,1,0,HCOL.berserker,3.4,0.5,true,0);fxRing(hb.x,0.06,0,HCOL.berserker,3.4,0.5);});
  once('k5@25',()=>{heroAct(hb,'guard');hb.special=0;});
  once('l@25.6',()=>{cineSay('Ma i mostri continuavano ad arrivare...');for(let i=0;i<4;i++){const a=cineMon('guard',-27-i*1.5,{tx:-11-i*1.2,side:-1});const b=cineMon('slime',27+i*1.5,{tx:11+i*1.2,side:1});if(a)hc.q.push(a);if(b)hl.q.push(b);}});
  // il capitano salta in mezzo e travolge tutti
  once('m@27.2',()=>{C.battle=false;H.forEach(h=>{h.special=1;heroAct(h,'guard');h.face=1;});if(C.cap){C.cap.cm.tx=13;C.cap.cm.spd=4;}cineSay('Basta giocare!','Capitano');});
  once('m2@28.3',()=>{const c=C.cap;if(!c)return;c.cm.mode='fly';c.cm.fvx=(2-c.x)/1;c.vy=15;c.onGround=false;c.cm.after='walk';c.cm.tx=2;sfx('roar');});
  once('m3@29.3',()=>{shake(1);sfx('boom');G.hitstop=0;const cx=C.cap?C.cap.x:2;fxRing(cx,0.06,0,0xff4a2e,9,0.8);fxRing(cx,1.2,0,0xffffff,5,0.5,true,0);burst(cx,0.3,0xb9ad98,60,12,3);
    H.forEach(h=>{const d=Math.sign(h.x-cx)||-1;h.vx=d*4.5;h.vy=6;heroAct(h,'hurt');h.onLand=()=>{heroAct(h,'kneel');sfx('hurt');};});
    for(const e of C.mons)if(!e.dead&&e!==C.cap&&e.cm.mode==='walk'){e.cm.tx=e.x;}cineSay('Erano troppi.');});
  once('n@30.4',()=>{cineSay('Gettateli nelle prigioni! AHAHAH!','Capitano');sfx('roar');H.forEach((h,i)=>{for(let k=0;k<2;k++){const e=C.mons.filter(m=>!m.dead&&m!==C.cap&&m.cm.mode==='walk')[i*2+k];if(e){e.cm.tx=h.x+(k?1.5:-1.5);e.cm.look=h.x;}}});});
  // prigioni
  once('o@33.1',()=>cineSay('Li gettarono nelle prigioni sotto la Torre...'));
  once('p@36',()=>cineSay('...ma uno di loro non si sarebbe arreso.'));
  for(const e of C.mons)cineMonUpd(e,dt);
  if(C.cap&&!C.cap.dead){C.cap.cm.look=0;}
  H.forEach(h=>{if(h.cage){const ct=t-33-h.i*0.35,y=ct<0?14:Math.max(0,14-ct*ct*38);if(!h.cage.broken)h.cage.g.position.y=y;
    if(y===0&&!h.cage.landed){h.cage.landed=true;shake(0.45);sfx('slam');burst(h.x,0.2,0xb9ad98,26,6,2);}}});
  H.forEach(h=>cineHeroPose(h,dt));
  for(const l of cineHall.L){const f=1+Math.sin(G.time*13+l.seed)*0.1+Math.random()*0.06;l.l.intensity=1.6*f;l.f.scale.set(1,f,1);}
  // telecamera
  if(C.chosen==null&&t>=T_CHOICE){const hx=H[C.hover].x;C.cp.set(hx,2.3,6.8);C.cl.set(hx,1.1,0);}
  else if(C.chosen==null){const cam=cineCam(C,C.shotName,lt,t);C.cp.set(...cam[0]);C.cl.set(...cam[1]);}
  if(t>=T_CHOICE&&C.chosen==null&&!C.choice){C.choice=true;
    if(C.replay)cineChoose(Math.max(0,STARTERS.indexOf(UNL.starter||'cavaliere')),true);
    else{const el=$('cineChoice');el.hidden=false;cineSay('');setTimeout(()=>{const b=el.querySelector('.cc[data-i="1"]');if(b)b.focus();},50);}}
  // evasione: afferra le sbarre, la gabbia esplode (tetto compreso) e l'eroe salta fuori in avanti
  if(C.chosen!=null){const ct0=C.ct;C.ct+=rdt;const ct=C.ct,h=H[C.chosen],hx=h.x;
    if(ct0<0.5&&ct>=0.5)heroAct(h,'grip');
    if(ct<1.6){C.cp.set(hx+1.3,1.7,2.8);C.cl.set(hx,1.4,0);}else{if(ct0<1.6){G.snapCam=true;const f=$('cineCut');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');}
      const k=clamp((ct-1.6)/2,0,1);C.cp.set(hx,lerp(0.9,2.6,k),lerp(7,10,k));C.cl.set(hx,lerp(2.2,1.4,k),lerp(0,1,k));}
    if(ct0<0.8&&ct>=0.8||ct0<1.15&&ct>=1.15){sfx('block');shake(0.15);burst(hx,1.5,0xffe2b0,10,4,1);}
    if(ct0<1.6&&ct>=1.6){sfx('boom');shake(0.6);burst(hx,1.4,0xffffff,50,9,3);burst(hx,1.4,HCOL[h.id],30,8,3);h.cage.broken=true;
      const parts=[...h.cage.bars,h.cage.top,h.cage.chain];for(const b of parts){h.cage.g.remove(b);const m=new THREE.Mesh(chunkGeo,chunkMat(0x3a3a44));
        if(b===h.cage.top)m.scale.set(1.6,0.25,1.6);else if(b===h.cage.chain)m.scale.set(0.2,2,0.2);else m.scale.set(0.4,2.2,0.4);m.position.set(hx+b.position.x,b===h.cage.top?2.75:1.4,b.position.z);scene.add(m);
        const a=Math.atan2(b.position.z||0.001,b.position.x||0.001);G.chunks.push({m,vx:Math.cos(a)*rand(5,11),vy:rand(6,12),vz:Math.sin(a)*3,rx:rand(-8,8),rz:rand(-8,8),t:0});}
      heroAct(h,'air');h.vy=10;h.vx=0;h.R.root.position.z=0;h.jz=0;h.onLand=()=>{heroAct(h,'pose');sfx('land');burst(h.x,0.2,0xb9ad98,20,6,2);fxRing(h.x,0.06,1.6,HCOL[h.id],2.6,0.5);cineCard(C.chosen,'È ora di fuggire!');cineSay('Spezzò le sbarre. Ora tocca a te.');};}
    if(h.jz!=null&&h.jz<1.6){h.jz=Math.min(1.6,h.jz+rdt*2.4);h.R.root.position.z=h.jz;}
    if(ct>=4.6&&!C.done){C.done=true;cineCard(null);fadeThen(cineEnd);}}
}
function cineChoose(i,auto){const C=G.cine;if(!C||C.chosen!=null)return;C.chosen=i;C.ct=0;$('cineChoice').hidden=true;sfx('pick');
  if(!auto){const id=STARTERS[i];UNL.starter=id;UNL.u[id]=true;saveUnl();store.set('intro-seen',true);store.set('class',CLASSES.findIndex(c=>c.id===id));}}
function cineEnd(){const C=G.cine;$('cine').hidden=true;$('cine').classList.remove('on');cineSub('');cineCard(null);{const op=$('opener');if(op.classList.contains('cineview')){op.hidden=true;op.classList.remove('cineview');}}
  cineHall.g.visible=false;cinePrison.g.visible=false;$('cineBlack').classList.remove('on');if(G.cineLights){hemi.intensity=G.cineLights[0];sun.intensity=G.cineLights[1];}scene.fog.near=30;scene.fog.far=62;
  for(const e of C.mons)if(!e.dead){e.dead=true;scene.remove(e.parts.root);}
  const h=C.heroes[C.chosen];
  for(const o of C.heroes){if(o.R.root.parent)o.R.root.parent.remove(o.R.root);if(o.cage&&o.cage.g.parent)o.cage.g.parent.remove(o.cage.g);}
  if(C.replay){G.cine=null;enterCellar();G.fadeTarget=0;return;}
  clearActors();G.cine=null;showScene('tower');G.floor=1;buildLevel(1);
  const others=C.heroes.filter(o=>o!==h);for(const o of others){levelGroup.add(o.R.root);o.R.root.position.set(o.x,0,0);o.R.root.position.z=0;if(o.cage){levelGroup.add(o.cage.g);o.cage.g.position.set(o.x,0,0);}}
  setClass(CLASSES.findIndex(c=>c.id===h.id));startTutorial(h.x,others);G.fadeTarget=0;}
$('cineChoice').innerHTML=STARTERS.map((id,i)=>{const c=CLASSES.find(c=>c.id===id);return `<button class="cc" data-i="${i}"><span class="ico">${svg(WTYPES[c.weapon].icon)}</span><b>${c.name}</b><em>${c.wname}</em><p>${CINE_INFO[id]}</p><small>Abilità: ${c.ability.name}</small></button>`;}).join('')+'<div class="cc-title">Chi riuscirà a liberarsi?</div>';
$('cineChoice').addEventListener('click',e=>{const b=e.target.closest('.cc');if(b)cineChoose(+b.dataset.i);});
$('cineChoice').addEventListener('focusin',e=>{const b=e.target.closest('.cc');if(b&&G.cine)G.cine.hover=+b.dataset.i;});
$('cineChoice').addEventListener('mouseover',e=>{const b=e.target.closest('.cc');if(b&&G.cine)G.cine.hover=+b.dataset.i;});
$('cineChoice').addEventListener('keydown',e=>{if(!G.cine)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){const n=(G.cine.hover+(e.key==='ArrowRight'?1:2))%3;const b=$('cineChoice').querySelector(`.cc[data-i="${n}"]`);if(b)b.focus();e.preventDefault();}});
$('cineSkip').onclick=()=>{if(G.bi){finishBossIntro();return;}if(G.cine&&!G.cine.done){G.cine.done=true;cineCard(null);fadeThen(cineEnd);}};

/* ---------- Tutorial delle prigioni ---------- */
const kl=a=>touchUI()?'':`<kbd>${inputLabel(a)}</kbd>`;
const TUT=[
  {t:'Muoviti',x:()=>touchUI()?'Usa il joystick a sinistra per camminare.':`Cammina con ${kl('left')} e ${kl('right')}.`,init(){G.tut.x0=P.x;},done:()=>Math.abs(P.x-G.tut.x0)>3},
  {t:'Salta',x:()=>touchUI()?'Premi il tasto Salto. In aria puoi saltare ancora.':`Premi ${kl('jump')} per saltare. In aria puoi saltare ancora.`,done:()=>!P.onGround&&P.y>1.2},
  {t:'Attacca',x:()=>touchUI()?'Una guardia! Premi il tasto Attacco per colpirla.':`Una guardia! Premi ${kl('atk')} per colpirla.`,init(){tutSpawn('guard',P.x+7);},done:()=>tutAlive()===0},
  {t:'Schivata',x:()=>touchUI()?'Premi il tasto Scatto: per un attimo sei intoccabile.':`Premi ${kl('dash')} per scattare: per un attimo sei intoccabile.`,done:()=>P.dashT>0},
  {t:'Abilità speciale',x:()=>touchUI()?`Premi il tasto ${G.cls.ability.short} per usare ${G.cls.ability.name}.`:`Premi ${kl('ability')} per usare ${G.cls.ability.name}.`,done:()=>P.abilCd>0},
  {t:'Le guardie arrivano!',x:()=>'Sconfiggile tutte per aprire il cancello.',init(){G.tut.final=true;[['guard',8],['slime',-9],['guard',11],['slime',13],['bat',4]].forEach(([k,dx])=>tutSpawn(k,clamp(P.x+dx,-HALF+2,GATE_X-2)));},done:()=>tutAlive()===0&&G.cleared},
  {t:'Il cancello è aperto',x:()=>'Sali la scala oltre il cancello: porta al seminterrato, il tuo rifugio.',init(){for(const h of G.tut.others||[])popNum(h.x,3.2,'Torna a liberarci!','xp');},done:()=>false},
];
function tutAlive(){return G.enemies.filter(e=>!e.dead).length;}
function tutSpawn(type,x){const e=spawnEnemy(type,{x:clamp(x,-HALF+2,GATE_X-2)});if(e){e.dmg*=0.4;e.hp=e.maxHp=e.maxHp*0.6;}return e;}
function tutShow(i,n,title,text){const b=$('tutBox');b.hidden=false;b.classList.remove('done');$('tutStep').textContent=n?`Tutorial ${i}/${n}`:'Tutorial';$('tutTitle').textContent=title;$('tutText').innerHTML=text;
  b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');}
function tutNext(){const T=G.tut;T.step++;T.wait=0;const s=TUT[T.step];if(!s)return;if(s.init)s.init();tutShow(T.step+1,TUT.length,s.t,s.x());}
function updTut(dt){const T=G.tut;if(!T)return;const s=TUT[T.step];if(!s)return;
  if(T.wait>0){T.wait-=dt;if(T.wait<=0)tutNext();return;}
  if(s.done()){T.wait=0.9;$('tutBox').classList.add('done');sfx('pick');return;}
  if(s.need&&tutAlive()===0){T.re=(T.re||0)+dt;if(T.re>0.9){T.re=0;const side=P.x>GATE_X-8?-1:1;tutSpawn('guard',P.x+side*6);}}
  if(T.step===TUT.length-2&&tutAlive()===0&&!G.cleared){T.re=(T.re||0)+dt;if(T.re>0.9){T.re=0;tutSpawn('slime',P.x+6);}}}
function startTutorial(x,others){
  applyLoadout();G.won=false;G.cmb=0;G.upKills=0;G.upNeed=8;G.upPending=false;G.lv={};G.kills=0;G.runTime=0;G.runXp=0;renderPerks();
  Object.assign(P,{hp:S.maxHp,stam:S.stamMax,dead:false,abilCd:0,abil2Cd:0,abil3Cd:0,shieldT:0,rageT:0,bearT:0,regenT:0,punchT:0,dot:null,slowT:0,x,y:0,z:0,vx:0,vy:0,atk:null,dashT:0,invul:0.5,face:1,dragon:null,plunge:false});
  hero.root.rotation.z=0;G.queue=[];G.spawnT=99;G.cleared=false;G.gateY=0;G.gateOpen=false;G.climbFaded=false;bars.position.y=0;lockM.emissive.setHex(0xff3b1f);ctrLast=null;drawCounter(0);
  G.tutorial=true;G.tut={step:-1,others:others||[]};document.querySelector('.floor-label').style.visibility='hidden';$('hud').hidden=false;$('touch').hidden=!isTouch;setupAbilUi();showMeds(true);clearInput();MUS.mood='tower';
  G.state='play';canvas.focus();tutNext();}
function endPrisonTutorial(){G.tutorial=false;G.tut=null;$('tutBox').hidden=true;enterCellar();P.x=9.2;G.fadeTarget=0;}

/* ---------- Tutorial del seminterrato ---------- */
let tutArrow=null;
const CTUT=[
  {t:'Il seminterrato',x:()=>'Questo è il tuo rifugio: qui ti prepari tra una scalata e l\'altra.',auto:4},
  {t:'Piedistallo delle classi',at:()=>PED_X,x:()=>`Avvicinati al piedistallo e ${touchUI()?'tocca Usa':'premi '+kl('use')}: scegli l'eroe, guarda le abilità e spendi i punti.`,done:T=>{if(G.state==='select')T.seen=1;return T.seen&&G.state==='cellar';}},
  {t:'Armadio',at:()=>WD_X,x:()=>`Nell'armadio indossi armi e armature trovate nei forzieri. ${touchUI()?'Tocca Usa':'Premi '+kl('use')} per aprirlo.`,done:T=>{if(G.state==='wardrobe')T.seen=1;return T.seen&&G.state==='cellar';}},
  {t:'Banco da lavoro',at:()=>INTER.find(i=>i.id==='bench').x,x:()=>'Al banco cambi volume e comandi e vedi le statistiche. Avvicinati per vederlo.',done:()=>Math.abs(P.x-INTER.find(i=>i.id==='bench').x)<1.6},
  {t:'La scala della torre',at:()=>10.2,x:()=>'Quando sei pronto, sali da qui. Ogni 5 piani c\'è un guardiano: sconfiggilo e libera gli eroi prigionieri!',done:()=>Math.abs(P.x-10.2)<1.6},
];
function startCellarTut(){G.ctut={step:-1};if(!tutArrow){tutArrow=new THREE.Mesh(new THREE.ConeGeometry(0.28,0.6,4),toon(0xffd27a,{emissive:0xffb347,emissiveIntensity:0.9}));tutArrow.rotation.x=Math.PI;scene.add(tutArrow);}ctutNext();}
function ctutNext(){const T=G.ctut;T.step++;T.t=0;T.seen=0;T.wait=0;const s=CTUT[T.step];
  if(!s){G.ctut=null;$('tutBox').hidden=true;if(tutArrow)tutArrow.visible=false;store.set('tut-done',true);toast('Tutorial completato','Buona scalata!');return;}
  tutShow(T.step+1,CTUT.length,s.t,s.x());}
function updCTut(dt){const T=G.ctut;if(!T)return;const s=CTUT[T.step];T.t+=dt;
  const show=G.scene==='cellar'&&(G.state==='cellar')&&s.at;tutArrow.visible=!!show;$('tutBox').hidden=!(G.state==='cellar');
  if(show){tutArrow.position.set(s.at(),3.6+Math.abs(Math.sin(G.time*3))*0.35,-1.0);tutArrow.rotation.y+=dt*2;}
  if(T.wait>0){T.wait-=dt;if(T.wait<=0)ctutNext();return;}
  if((s.auto&&T.t>s.auto)||(s.done&&s.done(T))){T.wait=0.8;$('tutBox').classList.add('done');sfx('pick');}}

/* ---------- Risveglio ---------- */
// "Gioca": dissolvenza al nero, poi la scena del seminterrato riappare piano e l'eroe si alza dal giaciglio
opGo=()=>{audioInit();sfx('ui');setTimeout(()=>{$('opener').hidden=true;G.fade=1;G.fadeTarget=0;G.fadeSpd=0.75;dismissIntro();},950);};
function dismissIntro(){
  if(G.state!=='intro')return;
  if(!store.get('intro-seen',false)){startCine(false);return;}
  Object.assign(P,{x:-1.6,y:0,z:0,vx:0,face:1});G.state='waking';G.wakeT=0.05;G.wokeFx=true;
}
function updWake(dt){
  G.wakeT-=dt;
  if(!G.wokeFx&&G.wakeT<1.45){G.wokeFx=true;sfx('wake');burst(-9.8,0.9,0xc9a54a,14,3,2,0.4,-1.1);}
  if(G.wakeT<=0){G.state='cellar';P.landT=0.16;$('cellarHud').hidden=false;$('touch').hidden=!isTouch;canvas.focus();
    setHint(isTouch||PAD.on?'Avvicinati al banco, al piedistallo o alla scala':'Muoviti con '+keyLabel(KEYS.left[0])+' e '+keyLabel(KEYS.right[0])+': banco, piedistallo e scala si usano con '+keyLabel(KEYS.use[0]),5);}
}

/* =========================================================
   INPUT: tastiera (rimappabile), mouse, touch
   ========================================================= */
const actionFor=code=>{for(const a in KEYS)if(KEYS[a].includes(code))return a;return null;};
function press(a,down){
  if(a==='left')input.left=down;else if(a==='right')input.right=down;else if(a==='up')input.up=down;else if(a==='down')input.down=down;
  else if(a==='jump'){if(down&&!input.jumpHeld)input.jumpPressed=true;input.jumpHeld=down;}
  else if(a==='atk'){if(down&&!input.atkHeld)input.atkPressed=true;input.atkHeld=down;}
  else if(a==='dash'){if(down)input.dashPressed=true;}
  else if(a==='ability'){if(down)input.abilPressed=true;}
  else if(a==='ability2'){if(down)input.abil2Pressed=true;}
  else if(a==='ability3'){if(down)input.abil3Pressed=true;}
  else if(a==='use'){if(down)input.usePressed=true;}
}
addEventListener('keydown',e=>{
  if(!opDone){e.preventDefault();if(!e.repeat){if(opReady&&(e.code==='Enter'||e.code==='Space'||actionFor(e.code)))opPlay();else opSkip();}return;}
  if(G.capture){e.preventDefault();finishCapture(e.code);return;}
  audioInit();
  if(G.state==='intro'||G.state==='waking'){e.preventDefault();return;}
  if(G.state==='upgrade'&&/^Digit[1-3]$/.test(e.code)){pickCard(+e.code.slice(5)-1);return;}
  if(G.state==='select'&&/^Digit[1-4]$/.test(e.code)){const b=$('clist').querySelector(`.cl[data-i="${+e.code.slice(5)-1}"]`);if(b)b.click();return;}
  const a=actionFor(e.code);
  if(G.state==='bossintro'){e.preventDefault();if(!e.repeat&&G.bi&&G.bi.t>0.4&&(a==='atk'||a==='jump'||a==='use'||a==='pause'||e.code==='Escape'||e.code==='Enter'||e.code==='Space'))finishBossIntro();return;}
  if(G.state==='tip'||G.state==='enter'){e.preventDefault();return;}
  if(a==='pause'||e.code==='Escape'){
    if(!$('settings').hidden)closeSettings();else if(G.state==='select')closeSelect(false);else if(G.state==='wardrobe')closeWardrobe();
    else if(G.state==='play')pause();else if(G.state==='pause')resume();else if(G.state==='loot')closeLoot(false);
    e.preventDefault();return;
  }
  if(!a)return;
  if(G.state==='play'||G.state==='cellar'){e.preventDefault();if(!e.repeat)press(a,true);}
  else if(G.state==='climb'&&(a==='left'||a==='right')){e.preventDefault();if(!e.repeat)press(a,true);}   // sulle scale: indietro annulla la salita
});
addEventListener('keyup',e=>{const a=actionFor(e.code);if(a)press(a,false);});
canvas.addEventListener('pointerdown',e=>{audioInit();if(G.state==='intro'||G.state==='waking')return;if(G.state==='bossintro'){if(G.bi&&G.bi.t>0.4)finishBossIntro();return;}
  if(e.pointerType==='mouse'&&e.button===0&&(G.state==='play'||G.state==='cellar'))press('atk',true);});
addEventListener('pointerup',e=>{if(e.pointerType==='mouse')press('atk',false);});
addEventListener('blur',()=>{clearInput();pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
// joystick: sinistra/destra per muoversi, su/giù per scegliere la mossa d'attacco
const joy=$('joy');let joyId=null;
function joySet(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width*0.42;
  let dx=e.clientX-cx,dy=e.clientY-cy;const l=Math.hypot(dx,dy);if(l>R){dx*=R/l;dy*=R/l;}
  $('joyKnob').style.transform=`translate(${dx/(r.width/joy.offsetWidth)}px,${dy/(r.width/joy.offsetWidth)}px)`;
  const nx=dx/R,ny=dy/R,hor=Math.abs(nx)>0.28&&Math.abs(nx)>Math.abs(ny)*0.5;   // si cammina anche in diagonale; quasi in verticale conta solo la mira
  input.left=hor&&nx<0;input.right=hor&&nx>0;input.up=ny<-0.5;input.down=ny>0.55;}
function joyOff(){joyId=null;input.left=input.right=input.up=input.down=false;$('joyKnob').style.transform='';joy.classList.remove('on');}
joy.addEventListener('pointerdown',e=>{if(G.tedit)return;e.preventDefault();audioInit();joyId=e.pointerId;joy.classList.add('on');try{joy.setPointerCapture(e.pointerId);}catch(_){}joySet(e);});
joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)joySet(e);});
['pointerup','pointercancel'].forEach(t=>joy.addEventListener(t,e=>{if(e.pointerId===joyId)joyOff();}));   // niente lostpointercapture: su iPhone a volte arriva a dito ancora giù e fermava l'eroe
function bindBtn(el,a){
  el.addEventListener('pointerdown',e=>{if(G.tedit)return;e.preventDefault();audioInit();try{el.setPointerCapture(e.pointerId);}catch(_){}press(a,true);el.classList.add('on');});
  const off=()=>{press(a,false);el.classList.remove('on');};
  ['pointerup','pointercancel'].forEach(t=>el.addEventListener(t,off));el.addEventListener('contextmenu',e=>e.preventDefault());
}
bindBtn($('bJump'),'jump');(function(){   // mini joystick sul tasto attacco
  const el=$('bAtk'),knob=document.createElement('i');knob.className='atk-knob';el.appendChild(knob);let id=null,sx=0,sy=0,dec=false,tm=0,last='';
  const R=()=>el.getBoundingClientRect().width*0.34;
  el.addEventListener('pointerdown',e=>{if(G.tedit)return;e.preventDefault();audioInit();try{el.setPointerCapture(e.pointerId);}catch(_){}
    id=e.pointerId;sx=e.clientX;sy=e.clientY;dec=false;last='';el.classList.add('on');knob.style.transform='';
    clearTimeout(tm);tm=setTimeout(()=>{if(id!==null&&!dec){dec=true;input.atkPressed=true;input.atkHeld=true;}},90);});
  el.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;let dx=e.clientX-sx,dy=e.clientY-sy;const r=R(),l=Math.hypot(dx,dy);if(l>r){dx*=r/l;dy*=r/l;}
    knob.style.transform=`translate(${dx}px,${dy}px)`;
    if(l>r*0.55){const ax=Math.abs(dx)>Math.abs(dy)*0.8?Math.sign(dx):0,ay=Math.abs(dy)>Math.abs(dx)*0.8?-Math.sign(dy):0,d={x:ax,y:ay},k=ax+','+ay;input.atkHold=d;
      if(!dec){dec=true;input.atkDir=d;input.atkPressed=true;input.atkHeld=true;last=k;}else if(k!==last){last=k;input.atkDir=d;input.atkPressed=true;}}
    else if(l<r*0.3){input.atkHold=null;last='';}});
  const off=e=>{if(e.pointerId!==id)return;clearTimeout(tm);if(!dec)input.atkPressed=true;id=null;input.atkHeld=false;input.atkHold=null;el.classList.remove('on');knob.style.transform='';};
  ['pointerup','pointercancel'].forEach(t=>el.addEventListener(t,off));el.addEventListener('contextmenu',e=>e.preventDefault());})();bindBtn($('bDash'),'dash');bindBtn($('bAbil'),'ability');bindBtn($('bAbil2'),'ability2');bindBtn($('bAbil3'),'ability3');
$('bUse').addEventListener('pointerdown',e=>{e.preventDefault();press('use',true);});
addEventListener('touchstart',()=>{if(!isTouch){isTouch=true;applyTouchLayout();if(G.cls)setupAbilUi();if(G.state==='play'||G.state==='cellar')$('touch').hidden=false;showMeds(G.state==='play');checkRotate();}},{passive:true});
/* ---------- Tasti a schermo: posizione e grandezza personalizzabili ---------- */
const TED=['joy','bJump','bAtk','bDash','abilBar'];let tedSel=null,tedDrag=null;
const TBASE=0.75;
function applyTouchLayout(){for(const id of TED){const el=$(id),L=SETTINGS.tl&&SETTINGS.tl[id];
  if(L){el.style.left=L.x+'%';el.style.top=L.y+'%';el.style.right='auto';el.style.bottom='auto';el.style.transform=`translate(-50%,-50%) scale(${(L.s||1)*TBASE})`;}
  else{el.style.left=el.style.top=el.style.right=el.style.bottom='';el.style.transform=id==='abilBar'?`translateX(-50%) scale(${isTouch?TBASE:1})`:`scale(${TBASE})`;}}}
function tedStore(id){const el=$(id),r=el.getBoundingClientRect(),L=SETTINGS.tl[id]||{s:1};L.x=+((r.left+r.width/2)/innerWidth*100).toFixed(2);L.y=+((r.top+r.height/2)/innerHeight*100).toFixed(2);SETTINGS.tl[id]=L;}
function openTouchEditor(){G.tedit=true;$('abilBar').hidden=false;if(!$('abilBar').children[0].innerHTML)setupAbilUi();$('settings').hidden=true;$('tedit').hidden=false;const T=$('touch');T.hidden=false;T.classList.add('ted');for(const b of ['bAbil2','bAbil3']){$(b).dataset.wasHidden=$(b).hidden?'1':'';$(b).hidden=false;}
  for(const id of TED)if(!SETTINGS.tl[id])tedStore(id);applyTouchLayout();tedPick('bAtk');}
function closeTouchEditor(){G.tedit=false;$('abilBar').hidden=G.state!=='play';$('abilBar').classList.remove('sel');$('tedit').hidden=true;const T=$('touch');T.classList.remove('ted');for(const b of ['bAbil2','bAbil3'])$(b).hidden=!!$(b).dataset.wasHidden;T.hidden=true;
  for(const id of TED)$(id).classList.remove('sel');store.set('settings',SETTINGS);$('settings').hidden=false;}
function tedPick(id){tedSel=id;for(const x of TED)$(x).classList.toggle('sel',x===id);$('tedSize').value=Math.round(((SETTINGS.tl[id]||{}).s||1)*100);}
$('touch').addEventListener('pointerdown',e=>{if(!G.tedit)return;const el=e.target.closest('[data-ed]');if(!el)return;e.preventDefault();e.stopPropagation();
  tedPick(el.dataset.ed);tedDrag={id:el.dataset.ed,pid:e.pointerId};},true);
addEventListener('pointermove',e=>{if(!tedDrag||e.pointerId!==tedDrag.pid)return;const L=SETTINGS.tl[tedDrag.id];
  L.x=clamp(e.clientX/innerWidth*100,4,96);L.y=clamp(e.clientY/innerHeight*100,8,96);applyTouchLayout();});
addEventListener('pointerup',e=>{if(tedDrag&&e.pointerId===tedDrag.pid)tedDrag=null;});
$('tedSize').addEventListener('input',()=>{if(!tedSel)return;SETTINGS.tl[tedSel].s=$('tedSize').value/100;applyTouchLayout();});
$('tedDone').onclick=()=>{sfx('ui');closeTouchEditor();};
$('tedReset').onclick=()=>{SETTINGS.tl={};applyTouchLayout();for(const id of TED)tedStore(id);applyTouchLayout();tedPick(tedSel||'bAtk');};
$('touchEdit').onclick=()=>{sfx('ui');openTouchEditor();};
applyTouchLayout();
function checkRotate(){const portrait=isTouch&&innerHeight>innerWidth*1.05;$('rotate').hidden=!portrait;if(portrait)pause();}

/* =========================================================
   ANIMAZIONE DELL'EROE
   ========================================================= */
// Sul piedistallo ogni classe mostra il suo potere, in un ciclo di circa 4 secondi
function selShow(dt,t){
  G.selT+=dt;const CY=4.4,c=Math.floor(G.selT/CY),p=G.selT%CY,pp=(G.selPrev2==null||p<G.selPrev2)?-1:G.selPrev2;G.selPrev2=p;
  const at=x=>pp<x&&p>=x,snd=n=>{if(c<2)sfx(n);},seg=(a,b)=>clamp((p-a)/(b-a),0,1),
    L=(k,o)=>{if(k<=0)return;for(const n in o)t[n]=lerp(t[n],o[n],k);},
    win=(a,b,fi,fo)=>Math.min(easeInOutCubic(seg(a,a+(fi||0.2))),1-easeInOutCubic(seg(b-(fo||0.2),b)));
  const id=G.cls.id,X=PED_X,Y=0.52,Z=PED_Z,col=G.cls.fx||CLS_COL[id]||0xffffff,rot=1.05;
  const F=(d,h)=>[X+Math.sin(rot)*d,Y+h,Z+Math.cos(rot)*d],tipW=()=>{const o=hero.tipF;if(!o)return F(0.8,1.6);o.getWorldPosition(vtmp);return [vtmp.x,vtmp.y,vtmp.z];};
  const B=(pt,cl,n,sp,up,g)=>burst(pt[0],pt[1],cl,n,sp||3,up==null?1:up,g==null?0.3:g,pt[2]);
  const swing=n=>{P.comboT=0;P.atk=null;startAttack(true);snd(n||'swing');};
  const orbit=(r,h,cl,sp,n)=>{for(let i=0;i<(n||2);i++){const a=G.time*(sp||6)+i*TAU/(n||2);B([X+Math.cos(a)*r,Y+h+Math.sin(G.time*3+i)*0.2,Z+Math.sin(a)*r],cl,1,0.3,0.3,0);}};
  const S={ox:0,oy:0,hide:false,rot:null,spin:0,sc:1};
  P.shieldT=0;P.rageT=0;
  (SHOWS[id]||SHOWS.mago)({p,at,snd,seg,L,win,t,S,X,Y,Z,col,F,tipW,B,swing,orbit,rot});
  return S;
}
const SHOWS={
  cavaliere(o){const {p,at,snd,seg,L,win,S,X,Y,Z,col,F,B,swing,rot}=o;   // alza lo scudo e para tre colpi, poi tre fendenti con l'onda finale
    const g=win(0.4,2.1);if(g>0){P.shieldT=1;L(g,{crouch:0.12,lean:-0.05,hF:-0.4,kF:0.45,hB:0.35,kB:0.35});}
    if(at(0.4)){snd('ability');fxRing(X,Y+0.04,Z,col,1.8,0.6);B([X,Y+1,Z],col,18,4,1,0.2);}
    for(const k of [0.9,1.3,1.7])if(at(k)){B(F(0.6,1.3),0xffffff,10,4,0.5,0);B(F(0.6,1.3),col,8,3,0.5,0);snd('block');}
    if(p>2.2&&p<3.6)S.rot=rot;
    for(const k of [2.3,2.62,2.95])if(at(k))swing(k>2.9?'heavy':'swing');
    if(at(3.05)){fxRing(...F(1.1,1.2),col,1.6,0.4,true,rot);fxSlash(...F(0.8,1.2),col,1.4,rot+Math.PI/2,0.4);B(F(1.2,1.2),col,20,5,1,0.2);}},
  berserker(o){const {p,at,snd,seg,L,win,S,X,Y,Z,col,F,B,swing,rot}=o;    // urlo con aura di sangue, balzo e schianto d'ascia che spacca il terreno
    const g=win(0.4,1.9);if(g>0){P.rageT=1;L(g,{shF:-2.7,elF:-0.2,wrF:0,shB:-2.7,elB:-0.2,lean:-0.25,head:-0.4,crouch:0.12,hF:-0.35,hB:0.35,kF:0.4,kB:0.4});if(Math.random()<0.6)B([X+rand(-.4,.4),Y+rand(0.2,1.8),Z],col,1,1,2,-0.4);}
    if(at(0.45)){snd('roar');fxRing(X,Y+0.04,Z,col,2,0.7);B([X,Y+1.4,Z],col,30,6,3,0.4);}
    if(p>=2.0&&p<2.45){const k=seg(2.0,2.45);S.oy=Math.sin(k*Math.PI)*0.9;S.rot=rot;L(1,{shF:-3.0,elF:-0.3,hF:-1.1,kF:1.7,hB:-0.8,kB:1.5,lean:-0.15});}
    if(at(2.0))snd('jump');
    if(at(2.38))swing('heavy');
    if(at(2.5)){P.landT=0.16;snd('slam');fxSpikes(...F(0.9,0),0x8a7a6a,8,1.0,0.75,1.1);fxRing(...F(0.9,0.04),col,2.4,0.5);B(F(0.9,0.1),0xb9ad98,24,6,2,1);B(F(0.9,0.1),col,14,5,2,0.5);}
    if(p>2.5&&p<3.4){S.rot=rot;P.rageT=1;}},
  lanciere(o){const {p,at,snd,seg,L,S,X,Y,Z,col,F,B,swing,rot}=o;          // si carica, vola in alto roteando e piomba con la lancia
    if(p>0.6&&p<1.0){const k=seg(0.6,1.0);L(k,{crouch:0.28,kF:1.2,kB:1.2,hF:-0.7,hB:-0.5,lean:0.2});if(Math.random()<0.5)B([X,Y+0.1,Z],col,1,2,0.5,0);}
    if(p>=1.0&&p<1.8){const k=seg(1.0,1.8);S.oy=Math.sin(k*Math.PI)*1.3;
      if(k<0.55){S.spin=easeInOutCubic(k/0.55)*TAU;L(1,{hF:-1.2,kF:1.9,hB:-0.9,kB:1.7,shF:-2.5,elF:0,wrF:0});}else{S.rot=rot;L(1,{hF:-0.2,kF:0.2,hB:0.2,kB:0.1,shF:-1.9,elF:0,wrF:-1.2,lean:0.3});}
      if(Math.random()<0.7)B([X,Y+S.oy+1,Z],col,1,1,0,0);}
    if(at(1.0)){snd('jump');B([X,Y+0.1,Z],col,12,3,1,1);}
    if(at(1.8)){P.landT=0.16;snd('slam');fxSpikes(X,Y,Z,col,7,1.1,1.3,1.0);fxRing(X,Y+0.04,Z,col,2.4,0.5);B([X,Y+0.15,Z],col,30,7,2,0.6);B([X,Y+0.1,Z],0xb9ad98,14,5,2,1);}
    if(p>2.5&&p<3.4)S.rot=rot;
    if(at(2.6))swing('thrust');if(at(2.9)){swing('thrust');fxRing(...F(1.3,1.3),col,1.2,0.35,true,rot);}},
  assassino(o){const {p,at,snd,L,S,X,Y,Z,col,F,B,swing,rot}=o;             // svanisce nel fumo, riappare e colpisce tre volte, poi torna nell'ombra
    const sm=0x2a2438;
    if((p>0.7&&p<1.0)||(p>2.3&&p<2.6))S.hide=true;
    if(p>=1.0&&p<2.3){S.ox=0.7;S.rot=rot+0.4;}
    if(at(0.7)||at(2.3)){snd('dash');B([X+(p>2?0.7:0),Y+1,Z],sm,26,4,2,0.1);B([X+(p>2?0.7:0),Y+1,Z],col,12,3,1,0.1);}
    if(at(1.0)){B([X+0.7,Y+1,Z],sm,26,4,2,0.1);fxRing(X+0.7,Y+0.04,Z,col,1.4,0.5);}
    for(const k of [1.1,1.32,1.54])if(at(k)){swing('stab');fxSlash(X+0.7+Math.sin(rot+0.4)*0.8,Y+1.2,Z+Math.cos(rot+0.4)*0.8,col,0.9,rot+0.4+Math.PI/2,rand(-0.8,0.8),0.25);}
    if(at(1.9)){B([X+1.3,Y+1.2,Z+0.4],col,16,5,1,0);}
    if(at(2.6))B([X,Y+1,Z],sm,26,4,2,0.1);},
  mago(o){const {p,at,snd,seg,L,win,S,X,Y,Z,col,F,tipW,B,orbit,rot}=o;      // spirale di fuoco, palla che cresce sul bastone, lancio e meteora
    const g=win(0.4,2.05,0.3,0.1);if(g>0){L(g,{shF:-2.7,elF:-0.2,shB:-1.2,elB:-0.4,lean:-0.12,head:-0.25});orbit(0.9,0.2+seg(0.4,2)*1.6,col,7,3);}
    if(p>1.0&&p<2.05){const tp=tipW(),k=seg(1.0,2.0);B(tp,col,2,0.4+k,0.2,0);if(Math.random()<k)B(tp,0xffe0a0,1,0.6,0.3,0);}
    if(at(0.4))snd('ability');
    if(p>=2.05&&p<2.9){S.rot=rot;L(1,{shF:-1.6,elF:-0.1,lean:0.2,hF:-0.5,kF:0.4,hB:0.4});}
    if(at(2.1)){snd('orb');fxShot(tipW(),F(3.2,1.2),col,0.35,2.2,()=>{fxRing(...F(3.2,0.05),col,1.8,0.5);});}
    if(at(2.7)){const a=F(2.6,5),b=F(2.2,0.05);fxShot(a,b,col,0.4,2.6,()=>{fxPillar(...b,col,0.9,2.5,0.5);fxRing(...b,col,2.4,0.6);B(b,0xffd27a,30,6,4,0.5);snd('boom');});snd('roar');}},
  criomante(o){const {p,at,snd,seg,L,win,S,X,Y,Z,col,F,tipW,B,rot}=o;     // tocca terra e fa crescere il ghiaccio, gira su sé stessa, nova gelida e lancia
    const g=win(0.4,1.4);if(g>0)L(g,{crouch:0.32,lean:0.55,kF:1.3,kB:1.1,hF:-1.0,hB:-0.2,shB:-0.5,elB:-0.1,head:0.2});
    if(at(0.85)){snd('ability');fxSpikes(X,Y,Z,col,10,1.25,0.9,2.0);fxRing(X,Y+0.04,Z,col,1.8,0.6);B([X,Y+0.3,Z],0xffffff,16,3,2,0.4);}
    if(p>0.9&&p<2.6&&Math.random()<0.5)B([X+rand(-1.2,1.2),Y+rand(1.5,2.6),Z+rand(-0.6,0.6)],0xe8f6ff,1,0.3,0,-0.25);
    if(p>=1.6&&p<2.4){S.spin=easeInOutCubic(seg(1.6,2.4))*TAU;L(win(1.6,2.4),{shF:-1.5,elF:0,shB:-1.5,elB:0,crouch:0.05});}
    if(at(2.4)){snd('zap');fxRing(X,Y+0.04,Z,col,3.2,0.7);fxRing(X,Y+1.1,Z,0xffffff,2.2,0.5,true,rot);B([X,Y+1.1,Z],col,50,9,1,0.2);}
    if(p>2.9&&p<3.6){S.rot=rot;L(1,{shF:-1.6,elF:0,lean:0.15});}
    if(at(3.05)){snd('thrust');fxShot(tipW(),F(3.4,1.3),col,0.25,1.5);}},
  tempesta(o){const {p,at,snd,seg,L,win,S,X,Y,Z,col,F,tipW,B,rot}=o;      // richiama i fulmini sul bastone e li scaglia a catena
    const g=win(0.4,2.25,0.25,0.1);if(g>0){L(g,{shF:-3.05,elF:0,shB:-0.9,elB:-0.6,lean:-0.22,head:-0.4,crouch:0.06});if(Math.random()<0.4)B(tipW(),col,1,1.5,0.5,0);}
    for(const k of [0.75,1.15,1.45,1.7,1.9])if(at(k)){const tp=tipW();lightning(tp[0]+rand(-0.6,0.6),Y+6,tp[0],tp[1],tp[2]);B(tp,col,10,4,1,0);snd('zap');}
    if(p>=2.25&&p<3.5){S.rot=rot;L(1,{shF:-1.6,elF:0,lean:0.25,hF:-0.5,kF:0.4,hB:0.4});}
    if(at(2.3)){const tp=tipW(),a=F(2.4,1.2),b=F(3.3,0.3),c2=F(2.0,0.2);lightning(tp[0],tp[1],a[0],a[1],tp[2]);lightning(a[0],a[1],b[0],b[1],a[2]);lightning(a[0],a[1],c2[0],c2[1],a[2]);
      fxRing(...F(2.8,0.05),col,2,0.5);B(a,col,16,5,1,0);B(b,col,12,4,1,0);snd('zap');}
    if(at(2.9)){const b=F(2.5,0.05);lightning(b[0],Y+6,b[0],b[1],b[2]);fxPillar(...b,col,0.45,6,0.35);B(b,col,24,6,4,0.4);snd('boom');}},
  druido(o){const {p,at,snd,seg,L,win,S,X,Y,Z,col,F,B,swing,rot}=o;       // mani a terra, rovi e foglie, poi si trasforma in orso e graffia
    const g=win(0.4,1.4);if(g>0){L(g,{crouch:0.3,lean:0.5,kF:1.2,kB:1.0,hF:-0.9,hB:-0.2,shB:-0.4,elB:0,head:0.25});if(Math.random()<0.7)B([X+rand(-1,1),Y+0.1,Z+rand(-0.5,0.5)],[0x5fae4a,0x8fcf5a,0x3f8a3a][Math.floor(Math.random()*3)],1,0.6,2.2,-0.3);}
    if(at(0.8)){snd('ability');fxSpikes(X,Y,Z,0x5fae4a,8,1.3,1.1,1.6);fxRing(X,Y+0.04,Z,col,1.8,0.6);}
    const b=win(1.7,3.9,0.35,0.3);S.bear=b>0.3;
    if(b>0){S.rot=rot;L(b,{crouch:0.12,lean:0.4,head:-0.2,shF:-1.3,elF:-0.9,shB:-1.3,elB:-0.9,hF:-0.4,kF:0.5,hB:0.3,kB:0.4});}
    if(at(1.75)||at(3.75)){snd('roar');B([X,Y+1,Z],0x8a6a3a,40,7,3,0.4);B([X,Y+1,Z],0x7fe08a,20,5,3,0.4);fxRing(X,Y+0.04,Z,0x8a6a3a,2.4,0.6);}
    for(const k of [2.5,2.85])if(at(k)){swing('heavy');fxSlash(...F(0.9,1.2),col,1.2,rot+Math.PI/2,k>2.6?-0.7:0.7,0.3);}},
  astromante(o){const {p,at,snd,seg,L,win,S,X,Y,Z,col,F,tipW,B,orbit,rot}=o;   // levita tra stelle che orbitano, lancia stelle e scatena una supernova
    const g=win(0.4,3.3,0.4,0.35);S.oy=0.4*g+Math.sin(G.time*2.4)*0.06*g;
    if(g>0){L(g,{shF:-1.9,elF:-0.2,shB:-1.9,elB:-0.2,hF:-0.25,kF:0.55,hB:0.15,kB:0.8,head:-0.2,lean:-0.05});orbit(1.0,1.1+S.oy,col,3,3);orbit(0.7,1.6+S.oy,0xfff3c4,-4,2);}
    if(at(0.4))snd('ability');
    for(const [k,d] of [[1.3,-0.6],[1.55,0],[1.8,0.6]])if(at(k)){snd('orb');const tp=tipW();fxShot(tp,[tp[0]+Math.sin(rot+d)*2.6,tp[1]+1.8,tp[2]+Math.cos(rot+d)*2.6],0xc7a8ff,0.45,1);}
    if(p>2.1&&p<2.6){const k=seg(2.1,2.6);B([X,Y+1.1+S.oy,Z],0xffffff,2,0.2+k,0,0);L(1,{shF:-0.6,elF:-1.8,shB:-0.6,elB:-1.8,crouch:0.1});}
    if(at(2.6)){snd('boom');B([X,Y+1.1+S.oy,Z],0xffffff,50,12,1,0);B([X,Y+1.1+S.oy,Z],col,40,9,1,0);fxRing(X,Y+0.04,Z,col,3.4,0.7);fxRing(X,Y+1.1+S.oy,Z,0xffffff,2.4,0.5,true,rot);}
    if(p>2.6&&p<3.0)L(1,{shF:-2.8,shB:-2.8,elF:0,elB:0,head:-0.4});},
  negromante(o){const {p,at,snd,seg,L,win,S,X,Y,Z,col,F,tipW,B,swing,rot}=o;  // evoca anime e ossa dal terreno, raccolto con la falce, nube tossica
    const g=win(0.4,1.7);if(g>0){L(g,{shB:-1.6,elB:-0.3,wrB:0,lean:-0.1,head:-0.2});if(Math.random()<0.8)B([X+rand(-1.2,1.2),Y+0.1,Z+rand(-0.6,0.6)],col,1,0.4,2.5,-0.4);}
    if(at(0.8)){snd('bones');fxSpikes(X,Y,Z,0xe6dcc6,11,1.4,0.85,1.7);fxRing(X,Y+0.04,Z,col,2,0.6);}
    if(p>1.8&&p<3.0)S.rot=rot;
    if(at(1.85))swing('heavy');if(at(2.2)){swing('swing');fxSlash(...F(0.8,1.1),col,1.6,rot+Math.PI/2,0.2,0.35);B(F(1.4,1.1),col,20,5,1,0);}
    if(at(2.7)){snd('roar');for(let i=0;i<3;i++)B(F(1.6+i*0.5,0.4),0x6aff6a,16,2,1.5,-0.2);fxRing(...F(2,0.05),0x6aff6a,1.8,0.8);}},
  paladino(o){const {p,at,snd,seg,L,win,S,X,Y,Z,col,F,tipW,B,swing,rot}=o;    // martello al cielo, colonna di luce, schianto sacro e cura
    const g=win(0.4,2.0,0.3,0.1);if(g>0){L(g,{shF:-3.0,elF:-0.2,shB:-2.8,elB:-0.3,lean:-0.18,head:-0.35,crouch:0.05});if(Math.random()<0.5)B(tipW(),col,1,1,0.5,0);}
    if(at(0.65)){snd('ability');fxPillar(X,Y,Z,col,0.9,6,1.4);B([X,Y+2.2,Z],0xffffff,20,3,1,0);}
    if(p>2.0&&p<3.4)S.rot=rot;
    if(at(2.0))swing('heavy');
    if(at(2.25)){snd('slam');P.landT=0.16;const b=F(1.0,0.05);fxRing(...b,col,2.8,0.6);fxPillar(...b,col,0.5,3,0.4);B(b,col,30,6,3,0.5);B(b,0xffffff,12,4,2,0.3);}
    if(at(3.0)){fxRing(X,Y+0.04,Z,0x7fe08a,1.6,0.6);}if(p>3.0&&p<3.6&&Math.random()<0.6)B([X+rand(-.5,.5),Y+rand(0.2,1.8),Z],0x7fe08a,1,1,2,-0.4);},
  arciere(o){const {p,at,snd,seg,L,win,S,X,Y,Z,col,F,tipW,B,rot}=o;          // tre frecce rapide, poi tira in alto e fa piovere frecce
    const shots=[1.0,1.45,1.9];
    if(p>0.4&&p<2.1){S.rot=rot;let dr=1;for(const k of shots)if(p>k-0.05&&p<k+0.28)dr=Math.min(dr,(p-k-0.05)/0.23);dr=clamp(dr,0,1);
      L(1,{shF:-1.57,elF:0,shB:-1.45,elB:lerp(-0.4,-2.3,dr),lean:0.05,hF:-0.4,kF:0.3,hB:0.35,kB:0.2});}
    for(const k of shots)if(at(k)){snd('arrow');fxShot(tipW(),F(4,1.35),0xffffff,0.22,0.55);}
    if(p>=2.2&&p<2.9){S.rot=rot;L(win(2.2,2.9,0.2,0.1),{shF:-2.6,elF:0,shB:-2.4,elB:-1.8,lean:-0.2,head:-0.4});}
    if(at(2.75)){snd('arrow');const tp=tipW();fxShot(tp,[tp[0]+0.6,Y+6,tp[2]],0xffffff,0.3,0.7);}
    for(let i=0;i<7;i++)if(at(3.1+i*0.06)){const a=F(2.0+rand(-0.8,1.2),5),b=[a[0],Y+0.05,a[2]+rand(-0.3,0.3)];fxShot(a,b,0xd8f2c8,0.22,0.5);}
    if(at(3.4))fxRing(...F(2.2,0.05),col,1.8,0.5);},
  samurai(o){const {p,at,snd,seg,L,win,S,X,Y,Z,col,F,B,swing,rot}=o;         // posizione di guardia, iaido fulmineo, tagli che esplodono, tempesta di lame
    const g=win(0.4,1.75,0.3,0.05);if(g>0){S.rot=rot;L(g,{crouch:0.22,lean:0.3,hF:-0.7,kF:0.8,hB:0.6,kB:0.4,shF:0.2,elF:-1.7,wrF:0.4,shB:-0.4,elB:-1.6,head:0.1});if(Math.random()<0.15)B([X+rand(-1,1),Y+2.4,Z+rand(-.5,.5)],0xff9ab0,1,0.2,0,-0.2);}
    if(at(0.4))snd('ability');
    if(p>=1.75&&p<1.9){S.hide=true;}
    if(at(1.75)){snd('dash');B([X,Y+1,Z],col,14,4,0.5,0);}
    if(p>=1.9&&p<2.9){S.ox=1.3;S.rot=rot+0.6;}
    if(at(1.9)){swing('swing');fxSlash(X+0.6,Y+1.2,Z+0.3,col,1.8,rot+Math.PI/2,0,0.35);}
    if(at(2.15))for(const d of [0.4,0.8,1.2])B([X+d,Y+1.1+rand(-0.3,0.3),Z+0.2],col,14,5,1,0);
    if(at(2.2)){snd('heavy');fxSlash(X+0.7,Y+1.1,Z+0.3,0xffffff,1.4,rot+Math.PI/2,0.9,0.3);fxSlash(X+0.7,Y+1.1,Z+0.3,0xffffff,1.4,rot+Math.PI/2,-0.9,0.3);}
    if(p>=2.9&&p<3.15)S.hide=true;
    if(p>=3.15&&p<3.8){S.spin=easeInOutCubic(seg(3.15,3.8))*TAU*2;L(1,{shF:-1.57,elF:0,shB:-1.57,elB:-0.2,crouch:0.1});if(Math.random()<0.8)B([X+rand(-1,1),Y+rand(0.8,1.5),Z+rand(-.6,.6)],col,1,2,0.3,0);}
    if(at(3.15)){fxRing(X,Y+1.1,Z,col,1.8,0.6);snd('swing');}},
  monaco(o){const {p,at,snd,seg,L,win,S,X,Y,Z,col,F,B,swing,orbit,rot}=o;    // concentrazione, raffica di pugni, palmo con onda d'urto, ascesa
    const g=win(0.4,1.05,0.25,0.05);if(g>0){L(g,{crouch:0.25,hF:-0.55,kF:0.75,hB:0.55,kB:0.75,shF:-0.9,elF:-1.8,shB:-0.9,elB:-1.8});orbit(0.8,0.8,col,5,2);}
    if(at(0.45)){snd('ability');fxRing(X,Y+0.04,Z,col,1.6,0.6);}
    if(p>1.05&&p<2.45)S.rot=rot;
    for(let i=0;i<9;i++)if(at(1.1+i*0.09)){swing('stab');B(F(0.9,1.3+rand(-.2,.2)),col,3,4,0.5,0);}
    if(p>=2.0&&p<2.45)L(1,{shF:-1.6,elF:0,lean:0.3,hF:-0.7,kF:0.6,hB:0.6,kB:0.3,crouch:0.15});
    if(at(2.05)){snd('slam');fxRing(...F(1.1,1.3),col,1.7,0.45,true,rot);fxRing(...F(1.8,1.3),0xffffff,1.1,0.35,true,rot);B(F(1.2,1.3),col,24,6,0.5,0);}
    if(p>=2.6&&p<3.5){const k=seg(2.6,3.5);S.oy=Math.sin(k*Math.PI)*1.4;S.spin=easeInOutCubic(k)*TAU;L(1,{shF:-2.8,elF:0,shB:-0.4,elB:-0.4,hF:-1.0,kF:1.6,hB:-0.7,kB:1.4});if(Math.random()<0.8)B([X,Y+S.oy+0.8,Z],col,1,0.6,0,0);}
    if(at(2.6))snd('jump');
    if(at(3.5)){P.landT=0.16;fxRing(X,Y+0.04,Z,col,2.4,0.5);B([X,Y+0.1,Z],col,24,6,2,0.6);}},
};
function updHeroVisual(dt){
  const R=hero,m=R.model,st=G.state,T=WTYPES[G.weapon.type];
  let rx=P.x,ry=P.y,rz=P.z,rotY=P.face*Math.PI/2,sx=P.face,rootZ=0,special=null,show=null;
  const wr=WREST[G.weapon.type],br=BREST[G.cls.id]||BREST_DEF,t=tgBase();
  t.shF=wr.sh;t.elF=wr.el;t.wrF=wr.wr;t.shB=br.sh;t.elB=br.el;t.wrB=br.wr;
  if(false){}
  else if(false){   // (letto rimosso) sdraiato sulla schiena, di profilo; al risveglio ruota sui piedi e si alza
    const k=st==='waking'?easeInOutCubic(clamp((1.45-G.wakeT)/1.1,0,1)):0;
    rx=lerp(-9.3,P.x,k);ry=lerp(0.8,0,k);rz=lerp(-1.1,0,k);rotY=Math.PI/2;sx=1;rootZ=lerp(Math.PI/2,0,k);special=k<0.55?'sleep':'pose';
    if(cellarBlanket)setBlanket(cellarBlanket,k);
    if(!bedWpn&&!bedPicked)placeBedWeapon();
    const pick=k>0.86;if(k>0.66&&k<0.95&&bedWpn){const r=Math.sin(clamp((k-0.66)/0.29,0,1)*Math.PI);t.shF=lerp(t.shF,-0.5,r);t.elF=lerp(t.elF,-0.15,r);t.lean+=0.35*r;t.crouch+=0.12*r;}
    if(pick&&bedWpn&&!bedPicked){bedPicked=true;bedWpn.visible=false;sfx('equip');burst(-8.5,1.0,0xffe2b0,12,3,1,0.2,-0.55);}
    if(!pick)bedPicked=false;if(bedWpn)bedWpn.visible=!bedPicked;
    for(const o of [hero.wpnF,hero.wpnB])if(o)o.visible=!bedWpn||bedPicked;}
  else if(bedWpn){scene.remove(bedWpn);disposeObj(bedWpn);bedWpn=null;bedPicked=true;for(const o of [hero.wpnF,hero.wpnB])if(o)o.visible=true;}
  else if(st==='select'){const b=Math.sin(G.time*2);t.crouch=0.02+b*0.012;t.hF=-0.12;t.kF=0.2;t.hB=0.1;t.kB=0.12;t.head=-0.05+b*0.03;t.lean=-0.04;
    show=selShow(dt,t);rx=PED_X+show.ox;ry=0.52+show.oy;rz=PED_Z;
    {const tr=show.rot!=null?show.rot:0.55+Math.sin(G.time*0.7)*0.2;G.selRot=G.selRot==null?tr:lerp(G.selRot,tr,damp(dt,10));rotY=G.selRot+show.spin;}sx=1;special='pose';}
  else if(st==='climb'){rotY=lerp(P.face<0?-Math.PI/2:Math.PI/2,Math.PI,easeInOutCubic(P.climbTurn));sx=1;}
  else if(st==='enter'){rotY=lerp(0,P.face*Math.PI/2,easeInOutCubic(clamp((G.enterT-0.85)/0.4,0,1)));sx=P.face;}
  else if(st==='wardrobe'){const b=Math.sin(G.time*2);t.crouch=0.02+b*0.012;t.hF=-0.12;t.kF=0.2;t.hB=0.1;t.kB=0.12;t.head=b*0.03;rotY=Math.sin(G.time*0.5)*0.3;sx=1;special='pose';}
  const A=P.atk;
  R.root.position.set(rx,ry,rz);m.rotation.y=rotY;
  if(P.dead){R.root.rotation.z=approach(R.root.rotation.z,P.face*Math.PI/2,dt*5);R.root.position.y=ry+0.22*Math.abs(R.root.rotation.z)/(Math.PI/2);}else R.root.rotation.z=rootZ;
  // capriola del doppio salto
  R.spin.rotation.z=P.flipT>0&&!special?-P.face*TAU*easeInOutCubic(1-P.flipT/0.42):0;
  const stretch=P.stretchT>0?P.stretchT/0.16:0,land=P.landT>0?P.landT/0.16:0;
  m.scale.set(sx*(1-stretch*0.08+land*0.1),1+stretch*0.12-land*0.1,1-stretch*0.08+land*0.1);
  if(R.tick&&R.tick.length)for(const f of R.tick)f(R,G.time,dt);else if(R.orbit)R.orbit.rotation.y+=dt*1.8;if(R.wpnF&&R.wpnF.userData.rings)for(const r of R.wpnF.userData.rings)r.rotation.z+=dt*3;if(R.handRings)for(const r of R.handRings)r.rotation.z-=dt*3;
  if(G.weapon.type==='bastone'&&hero.tipF&&Math.random()<0.3){hero.tipF.getWorldPosition(vtmp);burst(vtmp.x,vtmp.y,G.cls.fx||0xb48cff,1,0.5,0.6,-0.2,vtmp.z);}if(R.halo)R.halo.position.y=0.48+Math.sin(G.time*2)*0.02;
  R.root.scale.setScalar(show?show.sc:1);
  const speed=Math.abs(P.vx),run=!special&&P.onGround&&speed>0.6&&!P.dead;
  P.walkT+=dt*speed*(st==='climb'?Math.PI/STAIR_W*0.5:1.6);
  if(special==='sleep'){const b=Math.sin(G.time*1.6);t.crouch=0;t.lean=b*0.02;t.hF=-0.08;t.kF=0.12;t.hB=0.04;t.kB=0.06;t.shF=-0.55;t.elF=-1.5;t.wrF=0;t.shB=0.08;t.elB=-0.12;t.wrB=0;t.head=-0.12+b*0.03;}
  else if(special==='pose'){if(land>0){t.crouch=0.3*land;t.kF=1.2*land;t.kB=1.2*land;t.hF=-0.65*land;t.hB=-0.55*land;}}
  else if(st==='climb'){   // salita: passo per gradino, ginocchia alte, busto in avanti
    const ph=P.walkT;walkTg(t,ph,1);t.kF+=0.45*Math.max(0,Math.cos(ph));t.kB+=0.45*Math.max(0,-Math.cos(ph));t.hF-=0.25*Math.max(0,Math.cos(ph));t.hB-=0.25*Math.max(0,-Math.cos(ph));
    t.lean=0.24;t.crouch=0.04+Math.abs(Math.sin(ph))*0.06;t.shF+=Math.sin(ph)*0.3;t.shB-=Math.sin(ph)*0.5;t.elB-=0.4;t.twist=Math.sin(ph)*0.15;}
  else if(run&&window.__ANIMV!==1){runPose2(t,speed,dt);}
  else if(run){const amp=Math.min(1,speed/6),ph=P.walkT;walkTg(t,ph,amp);t.lean=0.3*amp+(P.skidT>0?-0.55:0);
    runArms(t,ph,amp);
    t.head=-0.08+Math.abs(Math.cos(ph))*0.06*amp;t.twist=Math.sin(ph)*0.2*amp;t.crouch+=Math.abs(Math.cos(ph))*0.04*amp;
    if(P.skidT>0){t.hF=-0.9;t.kF=0.7;t.hB=0.5;t.kB=0.4;t.crouch=0.16;}
    const stp=Math.floor(ph/Math.PI);if(stp!==P.lastStep){P.lastStep=stp;if(speed>5)burst(P.x-P.face*0.25,P.y+0.05,0xb9ad98,2,1.4,0.5);}}
  else if(!P.onGround&&!P.dead&&window.__ANIMV!==1){airPose2(t,dt);}
  else if(!P.onGround&&!P.dead){const k=clamp(P.vy/14,-1,1);   // in salita gambe raccolte, in discesa si distendono
    if(k>0){t.hF=-0.25-0.95*k;t.kF=0.3+1.5*k;t.hB=-0.05-0.25*k;t.kB=0.3+1.1*k;t.lean=0.1*k;t.shB+=0.6*k;t.elB-=0.3;t.shF-=0.2*k;}
    else{const f=-k;t.hF=-0.5+0.25*f;t.kF=0.55-0.3*f;t.hB=0.25+0.15*f;t.kB=0.35+0.1*f;t.lean=-0.04-0.12*f;t.shB-=0.4+0.6*f;t.elB-=0.35;t.shF-=0.25*f;}}
  else if(!P.dead&&window.__ANIMV!==1){idlePose2(t,dt);}
  else if(!P.dead){const b=Math.sin(G.time*2.2);t.crouch=0.02+b*0.014;t.hF=-0.1;t.kF=0.2;t.hB=0.08;t.kB=0.16;t.head=b*0.03+Math.sin(G.time*0.37)*0.05;
    t.wrF+=Math.sin(G.time*1.7)*0.07;t.twist=Math.sin(G.time*0.9)*0.06;t.shB+=b*0.04;}
  if(window.__ANIMV!==1)locoPost(t,run,speed,dt,special);
  if(land>0&&!special&&window.__ANIMV===1){t.crouch=0.3*land;t.kF=lerp(t.kF,1.2,land);t.kB=lerp(t.kB,1.2,land);t.hF=lerp(t.hF,-0.65,land);t.hB=lerp(t.hB,-0.55,land);t.lean+=0.25*land;}
  if(P.dashT>0&&window.__ANIMV!==1)dashPose2(t,dt);
  else if(P.dashT>0){t.lean=0.55;t.hF=-0.7;t.kF=0.9;t.hB=0.8;t.kB=0.5;t.shB=1.1;t.elB=-0.2;t.crouch=0.12;}
  if(window.__ANIMV!==1)reactPose(t,dt);else if(P.hurtT>0)t.lean-=0.4*(P.hurtT/0.25);
  if(P.flipT>0&&!special){t.hF=-1.4;t.kF=2.0;t.hB=-1.3;t.kB=2.0;t.crouch=0.1;t.elB=-1.2;}
  if(P.dragon==='up'){t.hF=-1.2;t.kF=1.9;t.hB=-0.9;t.kB=1.7;t.shF=-2.5;t.elF=0;t.wrF=0;t.lean=-0.1;}
  else if(P.dragon==='down'){t.hF=-0.2;t.kF=0.2;t.hB=0.2;t.kB=0.1;t.shF=-1.9;t.elF=0;t.wrF=-1.2;t.lean=0.3;}
  if(P.shieldT>0&&G.cls.id==='cavaliere'){t.shB=-1.25;t.elB=-0.85;}
  if(P.chargeT>0){t.lean=0.6;t.hF=-0.9;t.kF=0.9;t.hB=0.8;t.kB=0.5;t.crouch=0.14;t.shB=-1.5;t.elB=-0.3;t.shF=-0.2;t.elF=-0.6;}
  if(P.spinT>0){t.shF=-1.57;t.elF=0;t.wrF=0;t.shB=-1.57;t.elB=-0.2;t.crouch=0.1;t.hF=-0.3;t.kF=0.4;t.hB=0.3;t.kB=0.4;rotY+=(1.4-P.spinT)*TAU*2.5;m.rotation.y=rotY;}
  if(P.throwT>0){const k=P.throwT/0.32;t.shF=lerp(-1.3,-2.9,k);t.elF=lerp(0,-0.5,k);t.wrF=lerp(-0.3,0,k);t.lean=lerp(0.35,-0.2,k);t.hF=-0.5;t.kF=0.4;t.hB=0.5;t.kB=0.3;}
  if(P.dead&&window.__ANIMV!==1)deathPose(t,dt);else if(P.dead){t.kF=0.9;t.kB=0.6;t.shF=-2.2;t.shB=-2.6;t.elF=-0.5;t.elB=-0.4;t.head=-0.3;}
  let ap=null;
  if(A&&special!=='sleep'){ap=atkPose(A);t.lean+=ap.lean;t.twist=ap.tw;t.hF=lerp(t.hF,-0.5,ap.st);t.kF=lerp(t.kF,0.45,ap.st);t.hB=lerp(t.hB,0.5,ap.st);t.kB=lerp(t.kB,0.22,ap.st);t.crouch=Math.max(t.crouch,(0.08+ap.cr)*ap.st);
    if(ap.cr){t.kF=lerp(t.kF,1.3,ap.st);t.hF=lerp(t.hF,-1.0,ap.st);t.kB=lerp(t.kB,1.1,ap.st);}
    if(A.mv==='da'){t.hF=-1.1;t.kF=1.7;t.hB=-0.9;t.kB=1.5;}
    if(window.__ANIMV!==1)atkBody2(t,A,ap,dt);}
  applyPose(R,t,damp(dt,land>0?30:18),damp(dt,16));
  {const sl=special==='sleep';for(const a of R.arms)a.wr.visible=!sl;if(R.cape)R.cape.visible=!sl;}
  if(ap){const arm=R.arms[A.hand==='B'?1:0];arm.sh.rotation.x=ap.sh;arm.el.rotation.x=ap.el;arm.wr.rotation.x=ap.wr;}
  if(R.wpnF){const off=ap&&A.hand!=='B'?ap.off:0;R.wpnF.position.y+=(-off-R.wpnF.position.y)*(ap?1:damp(dt,20));}
  if(R.cape)R.cape.rotation.x=window.__ANIMV!==1?capeRot2(speed,R):0.05+Math.min(0.5,speed*0.04)+(P.vy<-2?-0.15:P.vy>2?0.12:0);
  if(window.__ANIMV!==1)flows2(R,speed,dt);else{const sp=Math.min(1,speed/9),up=clamp(-P.vy*0.04,-0.5,0.7);
   for(const f of R.flows||[])f.segs.forEach((s,i)=>{const tg=(i===0?f.base:0.1)+sp*(i===0?0.8:0.22)*f.amp+up*(i===0?0.5:0.18)+Math.sin(G.time*(5+sp*7)-i*0.9)*(0.05+0.1*sp)*(1+i*0.5);
     s.rotation.x+=(tg-s.rotation.x)*damp(dt,13-i*2.5);});}
  m.visible=!(P.invul>0&&!P.dead&&st==='play'&&Math.floor(P.invul*16)%2===0)&&!(show&&show.hide);
  for(const mm of R.mats){if(P.rageT>0){mm.emissive.setHex(0xff2a10);mm.emissiveIntensity=0.25+Math.sin(G.time*12)*0.12;}else{mm.emissive.copy(mm.userData.baseE);mm.emissiveIntensity=mm.userData.baseI;}}
  if(P.rageT>0&&st!=='select'&&Math.random()<0.4)burst(P.x+rand(-.4,.4),P.y+rand(0.2,1.8),0xff4a2e,1,1,2,-0.4);
  bubble.visible=P.shieldT>0&&!(show&&show.hide);if(bubble.visible){bubble.position.set(R.root.position.x,R.root.position.y+1.05,R.root.position.z);bubble.scale.setScalar(1+Math.sin(G.time*10)*0.03);bubble.material.opacity=P.shieldT<0.5?0.18*(Math.floor(P.shieldT*12)%2):0.18;}
  updBear((st==='play'&&P.bearT>0&&!P.dead)||(show&&show.bear),R,dt,run,speed);
  updTrail(dt);
}
let bearM=null;
// coperta: una stoffa a griglia con trama a quadri, rimodellata ogni frame (respiro, corpo sotto, scivolata al risveglio)
function makeBlanket(par){const [c,g]=cv(64,64);for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=(x+y)%2?'#2f6b8a':'#24546e';g.fillRect(x*16,y*16,16,16);}
  g.strokeStyle='rgba(240,220,170,.55)';g.lineWidth=2;g.setLineDash([3,3]);for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*16,0);g.lineTo(i*16,64);g.stroke();g.beginPath();g.moveTo(0,i*16);g.lineTo(64,i*16);g.stroke();}
  const tx=new THREE.CanvasTexture(c);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(2,2);
  const geo=new THREE.PlaneGeometry(2.1,1.4,22,14),m=new THREE.Mesh(geo,mat(0xffffff,{map:tx,roughness:.95,side:THREE.DoubleSide}));
  m.position.set(-9.95,0,-1.1);m.castShadow=m.receiveShadow=true;par.add(m);setBlanket(m,0);return m;}
function setBlanket(m,k){const pos=m.geometry.attributes&&m.geometry.attributes.position;if(!pos||!pos.array)return;
  const a=pos.array,sx=22,sy=14,w=2.1,h=1.4,ss=(e0,e1,x)=>{const q=clamp((x-e0)/(e1-e0),0,1);return q*q*(3-2*q);};
  // il corpo esce da sotto mentre si mette seduto; la coperta viene ribaltata verso i piedi e ripiegata in due
  const out=ss(0.02,0.5,k),kf=easeInOutCubic(clamp((k-0.05)/0.55,0,1)),th=Math.PI*0.96*kf,fl=lerp(-1.05,0.02,kf),br=1+Math.sin((typeof G!=='undefined'?G.time:0)*1.6)*0.04*(1-out);
  const prof=(u,v)=>{const body=lerp(0.48,0.34,ss(-0.2,0.9,u))*(u<-0.9?0.75:1);return 0.58+(1-out)*body*br*Math.exp(-Math.pow(v/0.33,2))+0.018*Math.sin(u*8+v*6);};
  for(let iy=0;iy<=sy;iy++)for(let ix=0;ix<=sx;ix++){const i=(iy*(sx+1)+ix)*3,u=-w/2+ix*w/sx,v=-h/2+iy*h/sy;
    let x=u,y=prof(u,v),z=v+0.08*kf;
    if(u<fl){const d=fl-u,yf=prof(fl,v);x=fl-d*Math.cos(th);y=yf+d*Math.sin(th)*(1-0.15*kf)+0.035*kf+0.02*Math.sin(v*7+u*5)*kf;}   // parte ribaltata sopra l'altra metà
    if(x>1.0){const d=x-1.0;x=1.0+d*0.2;y-=d*1.15;}       // in fondo ricade giù dal giaciglio
    if(z>0.84){const d=z-0.84;z=0.84+d*0.22;y-=d*0.95;}   // e dal bordo davanti
    if(y<0.03)y=0.03;
    a[i]=x;a[i+1]=y;a[i+2]=z;}
  pos.needsUpdate=true;m.geometry.computeVertexNormals();}
// l'arma appoggiata accanto al giaciglio: l'eroe la prende appena si alza
const BED_LEN={spada:1.45,ascia:1.45,lancia:2.26,martello:1.37,falce:1.82,katana:1.52,pugnali:0.62,arco:0.62};
let bedWpn=null,bedPicked=false;
function placeBedWeapon(){if(bedWpn){scene.remove(bedWpn);disposeObj(bedWpn);bedWpn=null;}const w=G.weapon;if(!w||BED_LEN[w.type]==null)return;
  const a=applyVariant(buildWeaponMesh(w.type,w.rarity,w.effect),w);bedWpn=a.g;bedWpn.position.set(-8.5,BED_LEN[w.type],-0.55);bedWpn.rotation.set(0,0.5,0.16);scene.add(bedWpn);}
function buildBear(){const g=new THREE.Group();scene.add(g);g.visible=false;
  const fur=toon(0x6b4a2e),fur2=toon(0x4a3220),snout=toon(0xb08a5a),dark=toon(0x1a1410),leaf=toon(0x5fae4a),eye=new THREE.MeshBasicMaterial({color:0x9dff7a});
  const body=new THREE.Group();g.add(body);
  const torso=sphO(0.62,fur,0,1.05,0,body,24,18);torso.scale.set(0.95,0.85,1.35);
  const hump=sphO(0.42,fur2,0,1.42,-0.2,body,18,14);hump.scale.set(1,0.7,1.15);
  const rump=sphO(0.5,fur,0,1.0,-0.62,body,18,14);rump.scale.set(1,0.9,0.9);
  const head=new THREE.Group();head.position.set(0,1.32,0.92);body.add(head);
  sphO(0.36,fur,0,0,0,head,20,16);const sn=sphO(0.18,snout,0,-0.08,0.3,head,16,12);sn.scale.set(1,0.8,1.25);
  mesh(sph(0.07,10,8),dark,0,-0.02,0.52,head,true);
  for(const s of [-1,1]){sphO(0.11,fur2,s*0.24,0.28,-0.05,head,12,10);mesh(sph(0.045,8,6),eye,s*0.14,0.08,0.31,head,true);}
  for(let i=0;i<9;i++){const a=-1.2+i*0.3,l=mesh(new THREE.ConeGeometry(0.08,0.24,4),leaf,Math.sin(a)*0.5,1.3+Math.cos(a)*0.12,0.62,body);l.rotation.set(0.3,0,-a);l.scale.z=0.4;}
  const legs=[];for(const [x,z] of [[-0.36,0.62],[0.36,0.62],[-0.36,-0.6],[0.36,-0.6]]){const pv=new THREE.Group();pv.position.set(x,0.95,z);body.add(pv);capO(0.17,0.6,fur,0,-0.45,0,pv,14);
    const paw=sphO(0.2,fur2,0,-0.84,0.06,pv,14,10);paw.scale.set(1,0.6,1.3);for(let k=-1;k<=1;k++){const c=mesh(new THREE.ConeGeometry(0.03,0.12,5),toon(0xf2ead8),k*0.08,-0.88,0.3,pv,true);c.rotation.x=Math.PI/2;}legs.push(pv);}
  g.userData={body,head,legs,k:0};return g;}
function updBear(on,R,dt,run,speed){
  if(!bearM&&!on)return;if(!bearM)bearM=buildBear();const B=bearM.userData;
  B.p=approach(B.p||0,on?1:0,dt/0.95);const p=B.p;if(p<=0){bearM.visible=false;return;}
  // 1ª metà: l'eroe si gonfia, si curva e si copre di pelo; 2ª metà: l'eroe si ritira dentro l'orso che cresce al suo posto
  const k1=easeInOutCubic(clamp(p/0.55,0,1)),k2=clamp((p-0.42)/0.58,0,1),hs=p<0.55?1+0.3*k1:1.3*(1-easeInOutCubic(clamp((p-0.55)/0.25,0,1)));
  R.root.scale.setScalar(Math.max(0.001,hs));if(hs<0.03)R.model.visible=false;
  for(const mm of R.mats){mm.emissive.setHex(0x6b4a2e);mm.emissiveIntensity=0.85*k1;}
  if(p<1){const rp=R.root.position;for(let i=0;i<2;i++){const a=Math.random()*TAU,r=0.6+0.5*p;burst(rp.x+Math.cos(a)*r,rp.y+rand(0.2,1.8),i?0x7fe08a:0x8a6a3a,1,1.2,1.5,-0.2,rp.z+Math.sin(a)*r*0.5);}}
  bearM.visible=k2>0;bearM.position.copy(R.root.position);bearM.rotation.y=R.model.rotation.y;bearM.scale.setScalar(Math.max(0.02,lerp(0.4,1,easeOutBack(k2))));
  const ph=P.walkT,amp=run?Math.min(1,speed/6):0,s=Math.sin(ph),A=P.atk;
  const tg=[s*0.8*amp,-s*0.8*amp,-s*0.8*amp,s*0.8*amp];let bx=0,hx=0;
  if(A){const k=clamp(A.t/(A.wind+A.act+A.rec),0,1),w=Math.sin(Math.min(1,k*1.4)*Math.PI);bx=-0.5*w;hx=0.35*w;tg[0]=-1.7*w;tg[1]=-1.1*w;}
  else if(G.state==='play'&&!P.onGround){tg[0]=tg[1]=-0.7;tg[2]=tg[3]=0.6;bx=P.vy>0?-0.15:0.1;}
  B.legs.forEach((l,i)=>l.rotation.x=lerp(l.rotation.x,tg[i],damp(dt,18)));
  B.body.rotation.x=lerp(B.body.rotation.x,bx,damp(dt,14));B.head.rotation.x=lerp(B.head.rotation.x,hx+Math.sin(G.time*2)*0.04,damp(dt,12));
  B.body.position.y=Math.abs(s)*0.08*amp;
}
const RUN_TILT={spada:1.05,katana:1.15,ascia:1.0,martello:1.0,falce:1.35,lancia:1.3,arco:1.5};
function runArms(t,ph,amp){
  const ty=G.weapon.type,id=G.cls.id,sw=Math.sin(ph),bl=o=>{for(const k in o)t[k]=lerp(t[k],o[k],amp);};
  if(ty==='pugnali'){bl({shF:0.95+sw*0.08,elF:-0.25,wrF:0.4,shB:0.9-sw*0.08,elB:-0.25,wrB:0.4});return;}      // corsa del ninja: braccia tese all'indietro
  if(ty==='pugni'||ty==='bastone'){bl({shF:sw*0.8,elF:-1.5,wrF:0,shB:-sw*0.8,elB:-1.5,wrB:0});return;}       // pugni chiusi che pompano
  const tot=RUN_TILT[ty]||1.05,sh=0.35+sw*0.2,el=-0.35;                                                     // arma bassa, trascinata dietro
  bl({shF:sh,elF:el,wrF:tot-sh-el});
  if(id==='cavaliere')bl({shB:-0.55-sw*0.12,elB:-1.1});else bl({shB:-sw*0.85,elB:-0.9-Math.max(0,-sw)*0.5});
}
function updTrail(dt){
  const A=P.atk,u=trailMat.uniforms,su=streakMat.uniforms;
  u.uOpacity.value=Math.max(0,u.uOpacity.value-dt*6);su.uOpacity.value=Math.max(0,su.uOpacity.value-dt*6);
  if(!A||A.t<A.wind||G.state==='select')return;
  const An=ANIM[A.anim],inAct=A.t<A.wind+A.act,recK=inAct?0:Math.min(1,(A.t-A.wind-A.act)/(A.rec*0.7)),T=WTYPES[G.weapon.type];
  const tipObj=A.hand==='B'?hero.tipB:hero.tipF;if(!tipObj)return;tipObj.getWorldPosition(vB);
  if(An.kind==='line'){streak.position.set(vB.x,vB.y,0.75);const len=inAct?easeOutQuart((A.t-A.wind)/A.act)*An.len:An.len*(1-recK);
    streak.scale.set(P.face*Math.max(0.01,len),1,1);su.uOpacity.value=inAct?1:1-recK;return;}
  hero.arms[A.hand==='B'?1:0].sh.getWorldPosition(vA);
  const dx=(vB.x-vA.x)*P.face,dy=vB.y-vA.y,rad=Math.hypot(dx,dy),ang=Math.atan2(dy,dx);
  if(inAct){if(A.hLast==null){A.hLast=ang;A.hAcc=0;}else{A.hAcc+=wrapA(ang-A.hLast);A.hLast=ang;}A.head=ang;A.rad=rad;}
  if(A.hLast==null)return;
  trail.position.set(vA.x,vA.y,0.7);trail.scale.set(P.face,1,1);
  const outer=(A.rad||rad)+0.08,bl=(T.blade[1]-T.blade[0])*weaponScale();
  u.uHead.value=A.head;u.uDir.value=A.hAcc>=0?1:-1;u.uLen.value=Math.min(Math.abs(A.hAcc),A.anim==='heavy'?2.9:2.5);u.uOuter.value=outer;u.uInner.value=Math.max(0.1,outer-bl-0.1);u.uOpacity.value=inAct?1:1-recK;
}

