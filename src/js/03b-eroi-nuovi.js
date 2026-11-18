
/* =========================================================
   EROI NUOVI (dati). Ogni eroe nuovo ha una "base": un eroe esistente da cui prende
   pose, stile delle armature e animazioni di presentazione. Mosse, aspetto e colori sono suoi.
   ========================================================= */
// finché non sono approvati si vedono solo in prova (indirizzo con #coop-debug o #eroi-nuovi)
const NEW_HEROES_ON=/coop-debug|eroi-nuovi/.test(location.hash);
if(NEW_HEROES_ON)CLASSES.push(
  {id:'ninja',base:'assassino',name:'Ninja',weapon:'pugnali',wname:'Kunai',hp:88,speed:9.8,armor:0,crit:0.15,jumps:1,fx:0xff4a4a,
   colors:{limb:0x1a1a22,trim:0x8a1a1f,accent:0xff4a4a,cape:0x15151c,main:0x22222c},
   ability:{id:'shuriken',name:'Pioggia di shuriken',short:'Shuriken',icon:'star',cd:5,desc:'Lanci tre shuriken che trapassano tutti i nemici sulla loro strada.'},
   ability2:{id:'fumogeno',name:'Bomba fumogena',short:'Fumo',icon:'ghost',cd:9,desc:'Una nube di fumo ti rende intoccabile per un attimo e stordisce i nemici vicini. Per 3 secondi i tuoi colpi sono tutti critici.'},
   ability3:{id:'sostituzione',name:'Tecnica della sostituzione',short:'Sostituzione',icon:'daggers',cd:15,desc:'Lasci al tuo posto un tronco che esplode e attraversi la fila di nemici davanti a te, colpendoli tutti con un critico.'}}
);
for(const c of CLASSES)if(c.base&&c.tier==null)c.tier=2;
Object.assign(UNLOCK,{ninja:{t:'floor',n:40}});
