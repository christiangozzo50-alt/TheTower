
/* =========================================================
   RUOLI DEGLI EROI (utili in co-op)
   Ogni eroe ha un ruolo. In co-op il ruolo aiuta la squadra:
   - Difensore:   i compagni vicini (entro 7 m) subiscono il 10% di danni in meno
   - Assaltatore: i compagni vicini fanno l'8% di danni in più
   - Tiratore:    fa il 15% di danni in più ai nemici che un compagno sta tenendo occupati (compagno a meno di 3,5 m dal nemico)
   - Supporto:    i compagni vicini recuperano il 2% della vita ogni 3 secondi
   - Controllo:   i nemici rallentati o storditi subiscono il 10% di danni in più da tutta la squadra
   Ogni giocatore calcola da sé gli effetti che riceve: niente messaggi in più sulla rete.
   ========================================================= */
const ROLES={
  difensore:  {name:'Difensore',  col:'#5aa9ff',desc:'In co-op i compagni vicini subiscono il 10% di danni in meno.'},
  assaltatore:{name:'Assaltatore',col:'#ff7a5a',desc:'In co-op i compagni vicini fanno l\'8% di danni in più.'},
  tiratore:   {name:'Tiratore',   col:'#ffd27a',desc:'In co-op fa il 15% di danni in più ai nemici vicini a un compagno.'},
  supporto:   {name:'Supporto',   col:'#7fe08a',desc:'In co-op i compagni vicini recuperano il 2% della vita ogni 3 secondi.'},
  controllo:  {name:'Controllo',  col:'#8fdcff',desc:'In co-op i nemici rallentati o storditi subiscono il 10% di danni in più da tutta la squadra.'},
};
const CLASS_ROLE={cavaliere:'difensore',paladino:'difensore',
  berserker:'assaltatore',samurai:'assaltatore',lanciere:'assaltatore',assassino:'assaltatore',
  mago:'tiratore',tempesta:'tiratore',astromante:'tiratore',
  arciere:'supporto',druido:'supporto',negromante:'supporto',
  criomante:'controllo',monaco:'controllo'};
for(const c of CLASSES)c.role=CLASS_ROLE[c.id]||'assaltatore';
const roleOf=c=>(c&&(c.role||CLASS_ROLE[c.id]))||null;
const ROLE_R=7;

// i compagni nella stessa stanza, vivi
function roleMates(){if(!MP.live()||G.scene!=='tower'||G.pvp)return [];const out=[];
  for(const R of MP.players.values())if(R&&R.cls&&!R.dead&&R.sc==='tower'&&R.fl===G.floor)out.push(R);return out;}
const mateNear=(role,x,r)=>roleMates().some(R=>roleOf(R.cls)===role&&Math.abs(R.x-x)<r);
const teamHas=role=>roleOf(G.cls)===role||roleMates().some(R=>roleOf(R.cls)===role);

// Difensore: meno danni a chi gli sta vicino
const _hurtRole=hurtPlayer;
hurtPlayer=function(d,fx,eff){if(!(MP.redir>=0)&&typeof d==='number'&&d>0&&mateNear('difensore',P.x,ROLE_R))d*=0.9;return _hurtRole(d,fx,eff);};

// Assaltatore, Tiratore, Controllo: più danni
const _hitRole=hitEnemy;
hitEnemy=function(e,base,dir,o){
  if(typeof base==='number'&&base>0&&e&&!e.dead&&e.pvp==null&&!MP.ghost){const mates=roleMates();
    if(mates.length){
      if(mates.some(R=>roleOf(R.cls)==='assaltatore'&&Math.abs(R.x-P.x)<ROLE_R))base*=1.08;
      if(roleOf(G.cls)==='tiratore'&&mates.some(R=>Math.abs(R.x-e.x)<3.5))base*=1.15;
      if((e.slowT>0||e.stunT>0)&&teamHas('controllo'))base*=1.1;}}
  return _hitRole(e,base,dir,o);};

// Supporto: cura i compagni vicini
setInterval(()=>{if(G.state!=='play'||P.dead||G.scene!=='tower'||G.pvp||document.hidden)return;
  if(mateNear('supporto',P.x,ROLE_R)&&P.hp<S.maxHp){heal(Math.max(1,Math.round(S.maxHp*0.02)),true);burst(P.x,P.y+1.2,0x7fe08a,6,2,2,0.3);}},3000);

// il ruolo nella scelta dell'eroe
const _rsRole=renderSelect;
renderSelect=function(){_rsRole.apply(this,arguments);const c=G.cls,ro=ROLES[roleOf(c)],box=$('cstats');if(!ro||!box)return;
  const sub=box.querySelector('.cs-sub');if(sub&&!sub.querySelector('.role-chip'))sub.insertAdjacentHTML('beforeend',` · <span class="role-chip" style="--rc:${ro.col}" title="${esc(ro.desc)}">${ro.name}</span><div class="role-desc">${esc(ro.desc)}</div>`);};
// il ruolo accanto al nome dei compagni
setInterval(()=>{if(!MP.live())return;for(const R of MP.players.values()){const ro=R&&R.cls&&ROLES[roleOf(R.cls)];if(!ro||!R.tag)continue;
  const t=`${R.name} · ${ro.name}`;if(R.tag.textContent!==t&&R.tag.textContent===R.name){R.tag.textContent=t;R.tagW=0;}}},500);
{const st=document.createElement('style');st.textContent=`
.role-chip{display:inline-block;padding:1px 7px;border:1px solid var(--rc);color:var(--rc);border-radius:9px;font-size:11px;letter-spacing:.04em}
.role-desc{margin-top:4px;font-weight:500;letter-spacing:0;color:var(--ink-2);font-size:11px}`;document.head.appendChild(st);}
if(/coop-debug/.test(location.hash))Object.assign(window.__F||(window.__F={}),{ROLES,CLASS_ROLE,roleMates});
