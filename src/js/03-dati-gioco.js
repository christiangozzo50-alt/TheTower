/* =========================================================
   DATI DI GIOCO
   ========================================================= */
const W=50,HALF=W/2,GRAV=-42,CEIL=13;
const GATE_X=HALF-5,STAIR_X0=GATE_X+0.7,STAIR_N=5,STAIR_W=0.5,STAIR_RISE=0.6,LAND_X=STAIR_X0+STAIR_N*STAIR_W,STAIR_TOP=STAIR_N*STAIR_RISE,DOOR_X=HALF-1;
const DSC=(GATE_X+HALF)/31,MX=x=>-HALF+(x+18)*DSC;   // allarga gli arredi pensati per la stanza vecchia
const CH=13,CELLAR_CEIL=6.4,PED_X=2.2,PED_Z=-1.2;
const TOP_FLOOR=100;
// nemici per piano: crescono più piano di prima (8 al primo piano, massimo 50), ma ognuno è più forte in proporzione
const crowdN=f=>Math.min(8+Math.round((f-1)*0.75),50),crowdOld=f=>Math.min(8+(f-1),64),crowdK=f=>crowdOld(f)/crowdN(f);
const hpMul=f=>1+0.22*(f-1)+0.012*(f-1)*(f-1), dmgMul=f=>1+0.11*(f-1)+0.0018*(f-1)*(f-1), spdMul=f=>Math.min(1.6,1+0.008*(f-1));
// santuari ogni 13 piani (13, 26, 39, 52, 66, 78, 91): se il multiplo di 13 è un piano del guardiano (65) il santuario è subito dopo
const isBossFloor=f=>f%5===0,isSafeFloor=f=>f>=13&&((f%13===0&&f%5!==0)||((f-1)%13===0&&(f-1)%5===0));

// La torre cambia aspetto ogni 10 piani
const ZONES=[
  {name:'Cantine',       wall:'#4b505d',mortar:'#202229',floor:'#3e3a35',light:0xffa64a,accent:0x8a3a2a,sky:['#3b2a4a','#d9785a'],stars:4,  clouds:false,decor:'barrels'},
  {name:'Armeria',       wall:'#5a4b42',mortar:'#261d18',floor:'#483b33',light:0xff8a3d,accent:0x2a4a7a,sky:['#1e2348','#7a4a6a'],stars:18, clouds:false,decor:'racks'},
  {name:'Biblioteca',    wall:'#3f4a52',mortar:'#1a2025',floor:'#3a3530',light:0xffc56b,accent:0x5a2a5a,sky:['#0f1a33','#33507a'],stars:40, clouds:true, decor:'books'},
  {name:'Serra pensile', wall:'#3e5242',mortar:'#1a241c',floor:'#3b3a2c',light:0xd9ff9a,accent:0x3a6a2a,sky:['#16314a','#4e7a6a'],stars:30, clouds:true, decor:'plants'},
  {name:'Cripta',        wall:'#3b3842',mortar:'#141218',floor:'#2e2c33',light:0x9a7bff,accent:0x3a2a5a,sky:['#0b0a1a','#2a1e44'],stars:60, clouds:true, decor:'bones'},
  {name:'Fucina',        wall:'#4a3a34',mortar:'#1c120e',floor:'#3a2a24',light:0xff6a2a,accent:0x7a2a10,sky:['#2a0e08','#7a2a10'],stars:5,  clouds:false,decor:'lava'},
  {name:'Ghiacciaia',    wall:'#5a6e80',mortar:'#26323e',floor:'#4a5866',light:0xaee4ff,accent:0x2a5a7a,sky:['#0a1830','#3a6a90'],stars:80, clouds:true, decor:'ice'},
  {name:'Osservatorio',  wall:'#3c3b55',mortar:'#18182a',floor:'#33334a',light:0x9fb6ff,accent:0x2a2a6a,sky:['#070b1c','#1d2a5c'],stars:160,clouds:true, decor:'stars'},
  {name:'Sala del trono',wall:'#5a4a5a',mortar:'#241a24',floor:'#4a2a30',light:0xffd27a,accent:0x8a1a2a,sky:['#140a1c','#4a2a4a'],stars:120,clouds:true, decor:'royal'},
  {name:'Vetta',         wall:'#575862',mortar:'#24252b',floor:'#46464f',light:0xc9e6ff,accent:0x4a5a7a,sky:['#02030a','#0f1838'],stars:240,clouds:true, decor:'peak'},
];
const zoneIndex=f=>Math.min(Math.floor((f-1)/10),ZONES.length-1);

// from = piano da cui compare il nemico
const TYPES={
  slime: {hp:38, dmg:9, speed:2.6,w:1.1,h:0.9, color:0x86d46a,xp:3, from:1},
  guard: {hp:65, dmg:16,speed:3.0,w:0.9,h:2.0, color:0xe8e0cc,xp:6, from:2},
  mage:  {hp:42, dmg:13,speed:2.2,w:0.9,h:2.1, color:0xa77be0,xp:5, from:3},
  bat:   {hp:28, dmg:11,speed:4.0,w:0.9,h:0.8, color:0x6a5580,xp:4, from:4,fly:true},
  archer:{hp:45, dmg:12,speed:2.6,w:0.9,h:2.0, color:0xd8d0bc,xp:6, from:7},
  knight:{hp:110,dmg:18,speed:2.6,w:1.0,h:2.1, color:0x5a606c,xp:10,from:12},
  imp:   {hp:30, dmg:24,speed:5.2,w:0.7,h:0.9, color:0xe0503a,xp:6, from:18},
  wraith:{hp:60, dmg:15,speed:3.2,w:0.9,h:1.9, color:0xbfe6ff,xp:9, from:24,fly:true},
  brute: {hp:220,dmg:26,speed:1.8,w:1.4,h:2.9, color:0x7a9a5a,xp:18,from:33},
  shaman:{hp:80, dmg:14,speed:2.0,w:0.9,h:2.1, color:0x6aff9a,xp:12,from:44},
  spider:{hp:52, dmg:13,speed:4.2,w:1.4,h:0.9, color:0x4a3a5a,xp:7, from:9},
  fungus:{hp:85, dmg:14,speed:1.2,w:1.1,h:1.7, color:0xc8402e,xp:9, from:16},
  gargoyle:{hp:95,dmg:20,speed:3.4,w:1.2,h:1.5,color:0x7c7c88,xp:12,from:22,fly:true},
  shade: {hp:70, dmg:22,speed:3.6,w:0.9,h:2.0, color:0x2e2444,xp:12,from:28},
  scorpion:{hp:130,dmg:19,speed:3.0,w:1.8,h:1.1,color:0xb8862e,xp:14,from:37},
  salamander:{hp:120,dmg:12,speed:2.8,w:1.9,h:1.0,color:0xe0602a,xp:14,from:42},
  eye:   {hp:100,dmg:17,speed:2.6,w:1.2,h:1.2, color:0xc23a7a,xp:15,from:54,fly:true},
  minotaur:{hp:320,dmg:30,speed:2.3,w:1.5,h:3.0,color:0x6a3f2a,xp:26,from:63},
};
const TYPE_NAMES={archer:'Arciere scheletro',knight:'Cavaliere nero',imp:'Folletto esplosivo',wraith:'Spettro',brute:'Bruto',shaman:'Negromante',guard:'Guardia scheletro',mage:'Stregone',bat:'Pipistrello',spider:'Ragno delle cripte',fungus:'Fungo velenoso',gargoyle:'Gargoyle',shade:'Ombra',scorpion:'Scorpione gigante',salamander:'Salamandra',eye:'Occhio del Vuoto',minotaur:'Minotauro'};
// Guardiani: tutti diversi, uno ogni 5 piani, con la sua stanza a tema
const ARCH={golem:{hp:300,dmg:18,w:2.2,h:3.7,speed:3.2},slimeKing:{hp:280,dmg:16,w:3.0,h:2.6,speed:3},skelKing:{hp:330,dmg:20,w:1.5,h:3.8,speed:3},
  bknight:{hp:300,dmg:20,w:1.4,h:3.4,speed:3.4},archmage:{hp:250,dmg:16,w:1.2,h:3.2,speed:2.5,fly:true},batQueen:{hp:230,dmg:15,w:2.4,h:1.8,speed:5,fly:true},dragon:{hp:420,dmg:22,w:4.6,h:3.0,speed:6,fly:true},
  // guardiani dei nemici sbloccati prima di loro (modelli in 28-guardiani-nuovi.js)
  fungusKing:{hp:280,dmg:16,w:2.6,h:3.6,speed:2.2},gargoyleLord:{hp:270,dmg:18,w:2.4,h:3.2,speed:5,fly:true},shadeLord:{hp:280,dmg:20,w:1.3,h:3.8,speed:4},
  ogreKing:{hp:340,dmg:20,w:1.6,h:3.9,speed:2.8},scorpionKing:{hp:330,dmg:19,w:3.4,h:2.4,speed:3.6},salamanderKing:{hp:320,dmg:18,w:3.4,h:2.4,speed:3.2},
  eyeLord:{hp:300,dmg:17,w:2.6,h:3.0,speed:2.5,fly:true},minoKing:{hp:380,dmg:23,w:1.6,h:4.0,speed:3.4}};
// i guardiani nuovi si muovono e si animano come il loro nemico (o come un guardiano simile)
const BOSS_ANIM={fungusKing:'fungus',gargoyleLord:'gargoyle',shadeLord:'bknight',ogreKing:'archmage',scorpionKing:'scorpion',salamanderKing:'salamander',eyeLord:'eye',minoKing:'bknight'};
const BOSS_LOCO={fungusKing:'golem',gargoyleLord:'batQueen',shadeLord:'bknight',ogreKing:'skelKing',scorpionKing:'golem',salamanderKing:'skelKing',eyeLord:'archmage',minoKing:'bknight'};
const BOSS_LIST=[
  [5,'slimeKing','Il Re Melma',0x86d46a,{}],
  // ogni guardiano è il re del nemico che si sblocca nei piani prima di lui; il secondo nemico arriva come aiutante
  [10,'skelKing','Il Capitano Scheletro',0xc94a3a,{adds:'spider'}],
  [15,'bknight','Il Maestro d\'Armi',0x7a8090,{}],
  [20,'fungusKing','Il Fungo dell\'Abisso',0x6affd8,{eff:'poison',adds:'imp'}],
  [25,'gargoyleLord','Il Gargoyle d\'Ossidiana',0xb48cff,{adds:'wraith'}],
  [30,'shadeLord','Il Mietitore d\'Ombra',0x8a6aff,{}],
  [35,'ogreKing','Il Capotribù degli Orchi',0x7a9a5a,{}],
  [40,'scorpionKing','L\'Imperatore Scorpione',0xb8862e,{eff:'poison'}],
  [45,'salamanderKing','L\'Idra di Fuoco',0xe0602a,{eff:'burn',adds:'shaman'}],
  [50,'archmage','La Negromante',0x6aff9a,{adds:'guard'}],
  [55,'eyeLord','L\'Occhio Incoronato',0xc23a7a,{}],
  [60,'bknight','Il Cavaliere della Forgia',0xff8a3d,{eff:'burn',adds:'imp'}],
  [65,'minoKing','Il Re dei Minotauri',0x6a3f2a,{}],
  [70,'golem','Il Gigante di Ghiaccio',0x9ad0ff,{eff:'slow',adds:'wraith'}],
  [75,'archmage','L\'Astronomo',0x9fb6ff,{adds:'wraith'}],
  [80,'slimeKing','La Melma del Vuoto',0x7a5aff,{adds:'imp'}],
  [85,'bknight','Il Campione del Re',0xffd27a,{adds:'knight'}],
  [90,'skelKing','Il Re Senza Volto',0xffe6a0,{adds:'knight'}],
  [95,'golem','Il Colosso della Vetta',0xc9e6ff,{adds:'brute'}],
  [100,'dragon','Il Drago della Torre',0xc0402a,{eff:'burn',adds:'imp'}],
];
const bossFor=f=>{const b=BOSS_LIST.find(x=>x[0]===f)||BOSS_LIST[1];return {floor:b[0],arch:b[1],name:b[2],color:b[3],...b[4]};};
// presentazione dei guardiani: titolo e frase d'ingresso
const BOSS_INTRO={
  5:['Sovrano della fogna','Nessuno esce dal mio regno. Ti scioglierò lentamente.'],
  10:['Terrore della guarnigione','Le mie frecce e i miei ragni ti aspettavano. Benvenuto nella tela.'],
  15:['Lama mai sconfitta','Mille sfidanti. Mille tombe. Tu sarai la mille e una.'],
  20:['Bocca della muffa','Respira pure. Le mie spore cresceranno anche dentro di te.'],
  25:['Guardiano di pietra nera','Mille anni immobile su questo cornicione. Per te mi muovo.'],
  30:['Falce del silenzio','Non sentirai i miei passi. Sentirai solo la lama.'],
  35:['Voce degli antenati','Gli spiriti della tribù hanno sete. Oggi berranno te.'],
  40:['Sovrano delle sabbie','Il mio veleno è più antico di questa torre.'],
  45:['Tre bocche, una sola fame','Taglia una testa, se ci riesci. Ne restano altre due.'],
  50:['Regina dei sepolcri','Morirai. E poi ti rialzerai per servirmi.'],
  55:['Sguardo della corona','Vedo ogni tuo passo prima che tu lo faccia.'],
  60:['Martello della forgia','Ti batterò sull\'incudine finché non resterà niente.'],
  65:['Signore del labirinto','Nessuno è mai uscito dal mio labirinto. E questa torre è il mio labirinto.'],
  70:['Colosso del ghiaccio eterno','Il tuo ultimo respiro gelerà prima di toccare terra.'],
  75:['Lettore delle stelle','Ho letto il tuo destino nel cielo. Finisce qui.'],
  80:['Fame senza fondo','Io sono il vuoto. E il vuoto ha sempre fame.'],
  85:['Spada del re','Il re non riceve visite. Io me ne assicuro.'],
  90:['Colui che ha dimenticato il proprio volto','Dammi il tuo viso. Il mio l\'ho perso tanto tempo fa.'],
  95:['Ultima sentinella','Sopra di me c\'è solo il drago. E tu non ci arriverai.'],
  100:['Signore della torre','Cento piani per arrivare fin qui. Basta un respiro per bruciarti.'],
};
const bossIntro=f=>BOSS_INTRO[f]||['Guardiano della torre','Torna indietro, finché puoi.'];

const ICONS={
  sword:'<path d="M19 4l-9 9M19 4h-4M19 4v4M10 13l-2 2M6 12l6 6M5 19l2-2"/>',
  axe:'<path d="M5 20L16 9"/><path d="M13 6c3-3 7-2 8 1-2 0-3 1-4 3l-3-1z"/><path d="M13 6l4 4"/>',
  spear:'<path d="M4 20L15 9"/><path d="M15 9l1.5-5.5L21 3l-.5 4.5z"/><path d="M8 13l3 3"/>',
  daggers:'<path d="M4 20l7-7M11 13l6-8 1 5z"/><path d="M20 20l-5-5"/><path d="M8 10l-3-1"/>',
  heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  boot:'<path d="M8 3h5v9l6 3v5H6z M6 17h13"/>',
  wing:'<path d="M3 18c3-9 9-13 18-13-1 6-5 10-11 11l3-3-8 5"/>',
  drop:'<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
  star:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
  shield:'<path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z"/>',
  arc:'<path d="M4 19A14 14 0 0 1 19 4M8 19a10 10 0 0 1 11-11"/>',
  wave:'<path d="M3 12c3-6 6-6 9 0s6 6 9 0M3 17c3-6 6-6 9 0s6 6 9 0"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  fist:'<path d="M7 11V7a2 2 0 0 1 4 0v4M11 10V6a2 2 0 0 1 4 0v5M15 10a2 2 0 0 1 4 0v3a7 7 0 0 1-7 7h-1a6 6 0 0 1-6-6v-2a2 2 0 0 1 2-2h2"/>',
  clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  fire:'<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 2 1 3 3 3 5"/>',
  leap:'<path d="M12 3v13M7 11l5 5 5-5M4 21h16"/>',
  ghost:'<path d="M6 20V10a6 6 0 0 1 12 0v10l-3-2-3 2-3-2z"/><path d="M10 11h.01M14 11h.01"/>',
  wind:'<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  helm:'<path d="M4 16a8 8 0 0 1 16 0v3H4z"/><path d="M12 8v5M9 19v-3h6v3"/>',
  glove:'<path d="M7 21v-7l-2-3 2-1 2 2V6a1 1 0 0 1 2 0v5V4a1 1 0 0 1 2 0v7V5a1 1 0 0 1 2 0v8 1a7 7 0 0 1-3 7z"/>',
  chest:'<path d="M7 3l2 2h6l2-2 4 4-3 3v11H6V10L3 7z"/>',
  box:'<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 13h18M12 11v4M5 9a7 4 0 0 1 14 0"/>',
  charge:'<path d="M4 12h10M10 7l5 5-5 5"/><path d="M17 5v14"/>',
  spin:'<path d="M20 12a8 8 0 1 1-3-6.2"/><path d="M20 4v5h-5"/>',
  javelin:'<path d="M3 21L18 6"/><path d="M18 6l3-3-1 5z"/><path d="M6 15l3 3"/>',
  fan:'<path d="M12 20L5 6M12 20l7-14M12 20V4"/>',
  hammer:'<path d="M5 21l9-9"/><path d="M12 4l8 8-3 3-8-8z"/>',
  scythe:'<path d="M6 21L16 5"/><path d="M16 5c-4-2-9-1-12 3 4-1 8-1 11 1"/>',
  katana:'<path d="M3 21l3-3M6 18l2 2M7 17L20 4l-1 3L9 19"/>',
  bow:'<path d="M6 3c8 3 12 9 9 18"/><path d="M6 3l9 18"/><path d="M4 12h12M13 9l3 3-3 3"/>',
  staff:'<path d="M7 21L16 8"/><circle cx="17.5" cy="6" r="2.8"/><path d="M20 2l1 1M15 2l-1 1"/>',
  meteor:'<circle cx="15" cy="15" r="4"/><path d="M3 3l9 9M8 3l6 6M3 8l6 6"/>',
  snow:'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9 4l3 3 3-3M9 20l3-3 3 3"/>',
  leaf:'<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z"/><path d="M5 19L14 10"/>',
  skull:'<path d="M5 11a7 7 0 0 1 14 0v4h-3v4H8v-4H5z"/><circle cx="9.5" cy="11.5" r="1.5"/><circle cx="14.5" cy="11.5" r="1.5"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  orbit:'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="9" ry="4"/><circle cx="20" cy="10" r="1"/>',
  bear:'<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M5 13a7 7 0 0 1 14 0c0 4-3 7-7 7s-7-3-7-7z"/><circle cx="12" cy="15" r="1.5"/>',
};
const svg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;

// ability2 si sblocca al livello 10 della classe
const CLASSES=[
  {id:'cavaliere',name:'Cavaliere',weapon:'spada',wname:'Spada e scudo',hp:110,speed:8.4,armor:0.15,crit:0.05,jumps:0,
   colors:{limb:0x34507e,trim:0xc9ced8,accent:0xd9b45a,cape:0x274a7d,main:0x3d6fb6},
   ability:{id:'scudo',name:'Egida specchio',short:'Egida',icon:'shield',cd:9,desc:'Per 2 secondi non subisci danni e rimandi indietro le sfere magiche.'},
   ability3:{id:'bastione',name:'Fortezza vivente',short:'Fortezza',icon:'shield',cd:16,desc:'Pianti lo scudo a terra: un\'onda d\'urto respinge e stordisce i nemici vicini.'},
   ability2:{id:'carica',name:'Ariete d\'acciaio',short:'Ariete',icon:'charge',cd:7,desc:'Ti lanci in avanti dietro lo scudo: travolgi i nemici e li stordisci.'}},
  {id:'berserker',name:'Berserker',weapon:'ascia',wname:'Ascia a due mani',hp:135,speed:8.0,armor:0,crit:0.05,jumps:0,
   colors:{limb:0x7b2f24,trim:0x8a8f99,accent:0xe6dcc6,cape:0x5b3a24,main:0x9c3b2e},
   ability:{id:'furia',name:'Furia sanguinaria',short:'Furia',icon:'fire',cd:16,desc:'Per 6 secondi attacchi più veloce, fai il 30% di danno in più, consumi metà stamina e ti curi a ogni colpo.'},
   ability3:{id:'terremoto',name:'Spaccaterra',short:'Spaccaterra',icon:'leap',cd:15,desc:'Colpisci il suolo tre volte: onde d\'urto sempre più grandi.'},
   ability2:{id:'turbine',name:'Turbine di sangue',short:'Turbine',icon:'spin',cd:10,desc:'Ruoti su te stesso con l\'ascia: per un secondo e mezzo colpisci tutto ciò che hai intorno.'}},
  {id:'lanciere',name:'Lanciere',weapon:'lancia',wname:'Lancia',hp:100,speed:8.8,armor:0.05,crit:0.08,jumps:0,
   colors:{limb:0x237a70,trim:0xd5dbe3,accent:0xd94b3a,cape:0x1d6b62,main:0x2f9c8f},
   ability:{id:'drago',name:'Volo del drago',short:'Drago',icon:'leap',cd:8,desc:'Salti in alto e piombi a terra: l\'onda d\'urto colpisce tutti i nemici vicini.'},
   ability3:{id:'pioggialance',name:'Diluvio di lance',short:'Diluvio',icon:'javelin',cd:14,desc:'Dal cielo cadono lance di luce sui nemici davanti a te.'},
   ability2:{id:'giavellotto',name:'Lancia fulminea',short:'Fulminea',icon:'javelin',cd:6,desc:'Scagli una lancia di luce che trapassa tutti i nemici sulla sua strada.'}},
  {id:'assassino',name:'Assassino',weapon:'pugnali',wname:'Pugnali gemelli',hp:85,speed:9.6,armor:0,crit:0.2,jumps:1,
   colors:{limb:0x2e2840,trim:0x55506a,accent:0xb48cff,cape:0x221d33,main:0x3a3350},
   ability:{id:'ombra',name:'Passo del vuoto',short:'Vuoto',icon:'ghost',cd:5,desc:'Ti teletrasporti alle spalle del nemico più vicino e lo colpisci con un critico sicuro.'},
   ability3:{id:'mille',name:'Mille ombre',short:'Ombre',icon:'ghost',cd:14,desc:'Salti da un nemico all\'altro e li colpisci tutti con un critico.'},
   ability2:{id:'ventaglio',name:'Ventaglio mortale',short:'Ventaglio',icon:'fan',cd:6,desc:'Lanci cinque pugnali a ventaglio davanti a te.'}},
];

// 10 classi nuove: 6 magiche e 4 guerriere. fx = colore dei poteri, el = effetto dei colpi magici
const A_=(id,name,short,icon,cd,desc)=>({id,name,short,icon,cd,desc});
CLASSES.push(
  {id:'mago',name:'Mago del fuoco',weapon:'bastone',wname:'Bastone di fuoco',hp:80,speed:8.4,armor:0,crit:0.06,jumps:1,fx:0xff7a2e,el:'fuoco',
   colors:{limb:0x3a2030,trim:0xd9b45a,accent:0xffb347,cape:0x7a1a1a,main:0xb8322a},
   ability:A_('palla','Cometa infernale','Cometa','fire',6,'Una grande sfera infuocata che esplode e brucia tutto intorno.'),
   ability2:A_('meteora','Cataclisma','Cataclisma','meteor',14,'Meteore cadono dal cielo sui nemici più vicini.'),
   ability3:A_('fenice','Fenice ardente','Fenice','wing',18,'Diventi una fenice di fuoco e attraversi i nemici bruciandoli.')},
  {id:'criomante',name:'Strega del gelo',weapon:'bastone',wname:'Bastone di ghiaccio',hp:82,speed:8.4,armor:0.03,crit:0.05,jumps:1,fx:0x8fdcff,el:'gelo',
   colors:{limb:0x2a3a5a,trim:0xe6f4ff,accent:0x8fdcff,cape:0x2a5a8a,main:0x4a8acb},
   ability:A_('lanciaghiaccio','Zanna di ghiaccio','Zanna','snow',6,'Una lancia di ghiaccio che trapassa e rallenta i nemici.'),
   ability2:A_('nova','Zero assoluto','Zero','snow',12,'Un\'esplosione di gelo intorno a te congela i nemici.'),
   ability3:A_('bufera','Tormenta eterna','Tormenta','wind',18,'Per tre secondi piovono schegge di ghiaccio davanti a te.')},
  {id:'tempesta',name:'Evocatore del fulmine',weapon:'bastone',wname:'Bastone del tuono',hp:85,speed:8.8,armor:0,crit:0.08,jumps:1,fx:0xfff27a,el:'fulmine',
   colors:{limb:0x24264a,trim:0xc9ced8,accent:0xfff27a,cape:0x2a2a6a,main:0x4a4ab0},
   ability:A_('catena','Saetta serpente','Saetta','bolt',6,'Un fulmine salta da un nemico all\'altro, fino a cinque.'),
   ability2:A_('lampo','Passo del tuono','Tuono','charge',8,'Ti teletrasporti in avanti fulminando chi attraversi.'),
   ability3:A_('tempestafulmini','Ira del cielo','Ira','bolt',18,'Otto fulmini cadono sui nemici.')},
  {id:'druido',name:'Druido',weapon:'bastone',wname:'Bastone di quercia',hp:105,speed:8.2,armor:0.05,crit:0.05,jumps:0,fx:0x7fe08a,el:'vampiro',
   colors:{limb:0x3a3020,trim:0x8a6a3a,accent:0x7fe08a,cape:0x3a5a2a,main:0x5a7a3a},
   ability:A_('spine','Rovi divoratori','Rovi','leaf',7,'Rovi spuntano sotto i tre nemici più vicini e li lanciano in aria.'),
   ability2:A_('rigenera','Linfa vitale','Linfa','heart',16,'Recuperi vita per sei secondi.'),
   ability3:A_('orso','Bestia ancestrale','Bestia','bear',22,'Diventi un orso: più grosso, più forte e più resistente per otto secondi.')},
  {id:'astromante',name:'Astromante',weapon:'bastone',wname:'Scettro delle stelle',hp:80,speed:8.6,armor:0,crit:0.1,jumps:1,fx:0xc7a8ff,el:null,
   colors:{limb:0x1a1a3a,trim:0xd9b45a,accent:0xc7a8ff,cape:0x1a1a4a,main:0x2a2a6a},
   ability:A_('stelle','Sciame stellare','Sciame','star',7,'Cinque stelle cercano da sole i nemici.'),
   ability2:A_('gravita','Abisso stellare','Abisso','orbit',15,'Un buco nero risucchia i nemici e li schiaccia.'),
   ability3:A_('supernova','Supernova','Nova','sun',20,'Una stella esplode intorno a te: danno enorme.')},
  {id:'negromante',name:'Negromante',weapon:'falce',wname:'Falce',hp:95,speed:8.4,armor:0.02,crit:0.07,jumps:0,fx:0x9a6aff,el:null,
   colors:{limb:0x1e1a24,trim:0xe8e0cc,accent:0x9a6aff,cape:0x1a1420,main:0x2e2638},
   ability:A_('ossa','Lame d\'ossario','Ossario','skull',6,'Lanci un ventaglio di ossa affilate.'),
   ability2:A_('raccolto','Mietitura d\'anime','Mietitura','ghost',12,'Strappi l\'anima ai nemici vicini e ti curi per ognuno.'),
   ability3:A_('nube','Miasma della tomba','Miasma','skull',16,'Una nube velenosa resta a terra e consuma i nemici.')},
  {id:'paladino',name:'Paladino',weapon:'martello',wname:'Martello sacro',hp:130,speed:7.8,armor:0.18,crit:0.04,jumps:0,fx:0xffe08a,el:null,
   colors:{limb:0x8a7a5a,trim:0xf4f0e6,accent:0xffd27a,cape:0xf4f0e6,main:0xd9c08a},
   ability:A_('lucesacra','Aurora sacra','Aurora','sun',9,'Un\'onda di luce cura te e brucia i nemici vicini.'),
   ability2:A_('giudizio','Giudizio divino','Giudizio','hammer',8,'Scagli un martello di luce che trapassa tutto.'),
   ability3:A_('scudodivino','Egida celeste','Egida','shield',22,'Per quattro secondi sei invulnerabile e la luce ferisce chi ti sta intorno.')},
  {id:'arciere',name:'Arciere',weapon:'arco',wname:'Arco lungo',hp:90,speed:9.2,armor:0.02,crit:0.12,jumps:1,fx:0xd9e8a0,el:null,
   colors:{limb:0x3a3a24,trim:0x8a6a3a,accent:0xd94b3a,cape:0x2f5a2a,main:0x4a7a3a},
   ability:A_('raffica','Raffica del falco','Falco','bow',5,'Cinque frecce una dietro l\'altra.'),
   ability2:A_('pioggiafrecce','Cielo di frecce','Cielo','bow',12,'Una pioggia di frecce copre la zona davanti a te.'),
   ability3:A_('colpopreciso','Artiglio dell\'aquila','Aquila','star',16,'Una freccia gigante che trapassa tutto e fa danno enorme.')},
  {id:'samurai',name:'Samurai',weapon:'katana',wname:'Katana',hp:100,speed:9.0,armor:0.06,crit:0.15,jumps:0,fx:0xff4d6d,el:null,
   colors:{limb:0x2a1a1a,trim:0x2a2830,accent:0xd94b3a,cape:0x5a1a1a,main:0x9a2a2a},
   ability:A_('iaido','Lampo cremisi','Lampo','katana',6,'Uno scatto fulmineo che taglia tutti i nemici sulla tua strada.'),
   ability2:A_('tempestalame','Ciclone di lame','Ciclone','spin',10,'Giri su te stesso tagliando tutto intorno.'),
   ability3:A_('vuoto','Fendente del vuoto','Fendente','wave',16,'Un fendente gigante che vola attraverso la stanza.')},
  {id:'monaco',name:'Monaco',weapon:'pugni',wname:'Pugni',hp:105,speed:9.4,armor:0.05,crit:0.1,jumps:1,fx:0xffb347,el:null,
   colors:{limb:0xe0b08a,trim:0xd94b3a,accent:0xffb347,cape:0xd9772a,main:0xe08a2a},
   ability:A_('palmo','Palmo del drago','Palmo','fist',6,'Un colpo di palmo che spara un\'onda d\'urto in avanti.'),
   ability2:A_('centopugni','Cento pugni del tuono','Cento','fist',10,'Una raffica di pugni velocissimi davanti a te.'),
   ability3:A_('ascesa','Drago ascendente','Ascesa','leap',12,'Voli in alto e piombi giù con un colpo devastante.')}
);
// Armi: blade = [inizio, fine] della lama dalla mano; hit = [x da, x a, y da, y a] con l'eroe rivolto a destra; cost = stamina per colpo
const WTYPES={
  spada:  {label:'Spada',  anim:'swing', dmg:20,cd:0.34,kb:7, cost:14,hit:[0.1,2.25,-0.2,2.7], blade:[0.24,1.45],icon:'sword',  names:['Spada di ferro','Spada d\'acciaio','Lama runica','Lama d\'ossidiana','Lama dell\'Alba']},
  ascia:  {label:'Ascia',  anim:'heavy', dmg:34,cd:0.6, kb:11,cost:24,hit:[-0.5,2.45,-0.2,3.4],blade:[0.95,1.52],icon:'axe',    names:['Ascia da boscaiolo','Ascia da guerra','Ascia runica','Mietitrice','Ascia del Re dei Monti']},
  lancia: {label:'Lancia', anim:'thrust',dmg:22,cd:0.4, kb:6, cost:16,hit:[0.3,3.5,0.6,2.0],  blade:[1.75,2.25],icon:'spear',  names:['Lancia di frassino','Lancia d\'acciaio','Picca runica','Zanna di drago','Lancia delle Stelle']},
  martello:{label:'Martello',anim:'heavy',dmg:31,cd:0.56,kb:12,cost:21,hit:[-0.4,2.3,-0.2,3.2],blade:[0.95,1.4],icon:'hammer',names:['Mazza di ferro','Martello da guerra','Martello runico','Maglio del Giudizio','Martello dell\'Aurora']},
  falce:  {label:'Falce',  anim:'swing', dmg:23,cd:0.42,kb:6, cost:16,hit:[0.0,2.9,-0.2,2.9],  blade:[1.6,2.3],icon:'scythe', names:['Falce da campo','Falce nera','Falce runica','Mietitrice d\'anime','Falce del Vuoto']},
  katana: {label:'Katana', anim:'swing', dmg:16,cd:0.26,kb:5, cost:11,hit:[0.1,2.35,-0.2,2.6], blade:[0.25,1.55],icon:'katana',critBonus:0.08,names:['Katana di ferro','Katana d\'acciaio','Lama del vento','Lama del crepuscolo','Kusanagi']},
  pugni:  {label:'Pugni',  anim:'stab',  dmg:9, cd:0.15,kb:4, cost:7, hit:[0.1,1.3,0.3,2.0],   blade:[0.0,0.2],icon:'fist',   names:['Fasce di stoffa','Pugni di ferro','Pugni runici','Artigli della tigre','Pugni del drago']},
  arco:   {label:'Arco',   anim:'shoot', dmg:14,cd:0.36,kb:3, cost:9, hit:[0.1,1.2,0.4,2.0],   blade:[0,0.6],  icon:'bow',    cast:{kind:'arrow',spd:30},names:['Arco corto','Arco lungo','Arco runico','Arco del falco','Arco delle stelle']},
  bastone:{label:'Catalizzatore',anim:'cast',dmg:18,cd:0.42,kb:4, cost:12,hit:[0.1,1.6,0.2,2.6],   blade:[0,0.3],icon:'orbit',  cast:{kind:'bolt',spd:19},names:['Sfera dell\'apprendista','Cristallo d\'argento','Sfera runica','Occhio arcano','Cuore dell\'Eternità']},
  pugnali:{label:'Pugnali',anim:'stab',  dmg:11,cd:0.17,kb:3, cost:8, hit:[0.1,1.65,0.1,2.1],  blade:[0.12,0.62],icon:'daggers',critBonus:0.1,names:['Pugnali arrugginiti','Pugnali gemelli','Pugnali runici','Zanne d\'ombra','Sussurri della Notte']},
};
// Pose di riposo: braccio abbassato, arma tenuta in avanti (spalla, gomito, polso)
const WREST={martello:{sh:-0.3,el:-0.45,wr:-1.3},falce:{sh:-0.25,el:-0.55,wr:-1.0},katana:{sh:-0.25,el:-0.5,wr:-1.5},pugni:{sh:-0.7,el:-1.7,wr:0},arco:{sh:-0.15,el:-0.25,wr:1.6},bastone:{sh:-0.5,el:-1.0,wr:0},
  spada:{sh:-0.25,el:-0.5,wr:-1.53},ascia:{sh:-0.3,el:-0.45,wr:-1.35},lancia:{sh:-0.2,el:-0.6,wr:-1.02},pugnali:{sh:-0.35,el:-0.7,wr:-0.52}};
const BREST_DEF={sh:-0.35,el:-0.6,wr:0};
const BREST={monaco:{sh:-0.8,el:-1.8,wr:0},arciere:{sh:-0.5,el:-1.2,wr:0},cavaliere:{sh:-0.5,el:-1.35,wr:0},berserker:{sh:-0.35,el:-0.6,wr:0},lanciere:{sh:-0.1,el:-0.35,wr:0},assassino:{sh:-0.35,el:-0.7,wr:-0.52}};
// Attacchi: carica → colpo → ritorno
const ANIM={
  swing: {kind:'arc', wind:.07, act:.11,rec:.2, from:2.25,to:5.25,flip:[5.0,2.5],lunge:2.5,sfx:'swing'},
  heavy: {kind:'arc', wind:.18, act:.15,rec:.28,from:1.5, to:5.5, lunge:4,sfx:'heavy'},
  thrust:{kind:'line',wind:.09, act:.1, rec:.18,w:{sh:-1.2,el:-1.4},a:{sh:-1.57,el:0},push:0.45,len:1.8,lunge:6,sfx:'thrust'},
  stab:  {kind:'line',wind:.045,act:.07,rec:.11,w:{sh:0.2,el:-1.5}, a:{sh:-1.45,el:-0.05},push:0,len:1.0,alt:'hand',lunge:1.5,sfx:'stab'},
  cast:  {kind:'line',wind:.1,act:.09,rec:.2,w:{sh:-0.6,el:-1.6},a:{sh:-1.57,el:0},push:0.15,len:0.5,lunge:0.4,alt:'hand',sfx:'orb'},
  shoot: {kind:'line',wind:.12,act:.06,rec:.18,w:{sh:-1.5,el:-0.1},a:{sh:-1.57,el:0},push:0,len:0.4,lunge:0,vert:true,sfx:'arrow'},
  // mosse direzionali in stile picchiaduro (uguali per tutte le armi)
  lunge: {kind:'line',wind:.08,act:.12,rec:.2,w:{sh:-1.2,el:-1.4},a:{sh:-1.57,el:0},push:0.5,len:2.2,sfx:'thrust'},
  sweep: {kind:'arc', wind:.08,act:.13,rec:.22,from:7.6,to:4.85,cr:0.28,sfx:'swing'},
  upper: {kind:'arc', wind:.09,act:.13,rec:.24,from:5.5,to:2.7,leanK:-0.8,sfx:'heavy'},
  spin:  {kind:'arc', wind:.05,act:.2, rec:.18,from:2.25,to:2.25+TAU,sfx:'swing'},
  plunge:{kind:'arc', wind:.06,act:.08,rec:.2,from:-0.9,to:0.05,hold:true,sfx:'heavy'},
  uair:  {kind:'arc', wind:.06,act:.14,rec:.2,from:-1.4,to:-4.5,leanK:-0.6,sfx:'swing'},
};
// mosse: n = neutro, s = di lato, d = giù, u = su; l = a terra, a = in aria. box = [x da, x a] in lunghezze d'arma, [y da, y a] in metri
const MOVES={
  nl:{name:'Danza d\'acciaio'},
  sl:{name:'Zanna del lupo',anim:'lunge',dmg:1.05,kb:5,ky:3,hs:0.25,lunge:9,cd:1.3,box:[0.05,1.15,0.3,2.2]},
  dl:{name:'Falciata radente',anim:'sweep',dmg:0.85,kb:2,ky:13,hs:0.85,lunge:2,cd:1.35,box:[-0.35,1.0,-0.2,1.3],unblock:true},
  ul:{name:'Montante del drago',anim:'upper',dmg:1.0,kb:1.5,ky:16,hs:0.9,lunge:1,cd:1.45,box:[-0.2,0.8,0.8,3.9]},
  na:{name:'Vortice cremisi',anim:'spin',dmg:0.85,kb:4,ky:7,hs:0.6,cd:1.2,box:[-0.85,0.85,-0.4,3.0]},
  sa:{name:'Ala tagliente',dmg:1.0,kb:6,ky:4,hs:0.35,cd:1.05},
  da:{name:'Schianto meteora',anim:'plunge',dmg:1.25,kb:3,ky:-12,hs:0.3,cd:1.0,box:[-0.45,0.45,-1.4,0.8]},
  ua:{name:'Squarciacielo',anim:'uair',dmg:0.95,kb:1,ky:12,hs:0.7,cd:1.2,box:[-0.7,0.9,1.3,4.0]},
};
// poteri speciali delle armi rare: compaiono solo salendo
const PERKS={
  slancio: {name:'Slancio',  from:11,minR:2,desc:'il Montante del drago ti fa saltare e lancia i nemici più in alto'},
  sisma:   {name:'Sisma',    from:21,minR:2,desc:'lo Schianto meteora crea onde d\'urto ai lati'},
  eco:     {name:'Eco',      from:31,minR:3,desc:'ogni 4 colpi un fendente fantasma colpisce di nuovo'},
  tempesta:{name:'Tempesta', from:41,minR:3,desc:'i critici richiamano un fulmine dal cielo'},
  schegge: {name:'Schegge',  from:51,minR:3,desc:'i nemici sconfitti esplodono in lame'},
  onda:    {name:'Onda tagliente',from:61,minR:4,desc:'il terzo colpo della catena lancia un\'onda che trapassa i nemici'},
};
const RARITY=[
  {name:'Comune',     css:'#b4ab9b',glow:'rgba(180,171,155,.22)',hex:0xb4ab9b,mul:1},
  {name:'Non comune', css:'#7fe08a',glow:'rgba(127,224,138,.22)',hex:0x7fe08a,mul:1.25},
  {name:'Rara',       css:'#5aa9ff',glow:'rgba(90,169,255,.25)', hex:0x5aa9ff,mul:1.55},
  {name:'Epica',      css:'#c27bff',glow:'rgba(194,123,255,.25)',hex:0xc27bff,mul:1.9},
  {name:'Leggendaria',css:'#ffb347',glow:'rgba(255,179,71,.3)',  hex:0xffb347,mul:2.35},
  {name:'Mitica',     css:'#ff5470',glow:'rgba(255,84,112,.34)', hex:0xff5470,mul:3.1},
  {name:'Divina',     css:'#7ef9ff',glow:'rgba(126,249,255,.38)',hex:0x7ef9ff,mul:4},
];
const MAX_R=RARITY.length-1;
const EFFECTS={
  fuoco:  {desc:'brucia i nemici per 3 secondi',color:0xff7a2e},
  gelo:   {desc:'rallenta i nemici',color:0x8fdcff},
  fulmine:{desc:'il colpo salta a un nemico vicino',color:0xfff27a},
  vampiro:{desc:'ti cura a ogni colpo',color:0xff4d6d},
};

// Equipaggiamento trovato nei forzieri (vale per la scalata in corso)
const GEAR={
  elmo:   {label:'Elmo',   icon:'helm', names:['Elmo di cuoio','Elmo di ferro','Elmo runico','Elmo d\'ossidiana','Corona dell\'Alba','Elmo del Titano','Diadema degli Dèi'],make:(m,ff)=>({hp:Math.round(10*m*ff),armor:+(0.015*m).toFixed(3)})},
  guanti: {label:'Guanti', icon:'glove',names:['Guanti di cuoio','Guanti borchiati','Guanti runici','Artigli d\'ombra','Mani della Tempesta','Pugni del Titano','Mani degli Dèi'],make:(m)=>({atkSpd:+(0.04*m).toFixed(3),crit:+(0.02*m).toFixed(3)})},
  corazza:{label:'Corazza',icon:'chest',names:['Giubba imbottita','Cotta di maglia','Corazza runica','Corazza d\'ossidiana','Armatura dell\'Alba','Egida del Titano','Manto degli Dèi'],make:(m,ff)=>({hp:Math.round(18*m*ff),armor:+(0.03*m).toFixed(3)})},
};
function makeGear(slot,r,f){return Object.assign({slot,rarity:r,name:GEAR[slot].names[r]},GEAR[slot].make(RARITY[r].mul,1+0.04*(f-1)));}
// statistiche dell'equipaggiamento in punti (1 punto = 0,1%), non in percentuale
const statPt=v=>Math.round((v||0)*1000);
const gearDesc=g=>[g.hp?`+${g.hp} Vita`:'',g.armor?`+${statPt(g.armor)} Armatura`:'',g.atkSpd?`+${statPt(g.atkSpd)} Velocità d'attacco`:'',g.crit?`+${statPt(g.crit)} Critico`:''].filter(Boolean).join(' · ');
const pct1=v=>String(+(v*100).toFixed(1)).replace('.',',')+'%';
// Le armi più rare compaiono solo ai piani alti
const maxRarity=f=>f<3?0:f<11?1:f<31?2:f<61?3:f<86?4:f<100?5:6;
const RARITY_FROM=[1,3,11,31,61,86,100];

const CLASS_TIER={cavaliere:0,berserker:0,lanciere:0,arciere:0,assassino:1,monaco:1,druido:1,criomante:1,mago:2,tempesta:2,negromante:2,samurai:2,paladino:3,astromante:3};
const TIER_R=[0,2,3,4];   // Comune, Rara, Epica, Leggendaria
for(const c of CLASSES)c.tier=CLASS_TIER[c.id]||0;
const clsRar=c=>RARITY[TIER_R[c.tier||0]];
// ---- sblocco delle classi ----
const STARTERS=['cavaliere','berserker','lanciere'];
const UNLOCK={cavaliere:{t:'starter'},berserker:{t:'starter'},lanciere:{t:'starter'},arciere:{t:'floor',n:15},
  assassino:{t:'cage',n:20},monaco:{t:'cage',n:25},druido:{t:'cage',n:30},criomante:{t:'cage',n:35},
  mago:{t:'cage',n:45},tempesta:{t:'cage',n:55},negromante:{t:'cage',n:65},samurai:{t:'cage',n:80},
  paladino:{t:'win',k:15000},astromante:{t:'feat',k:30000}};
const UNL=Object.assign({u:{},frag:{},best:0,kills:0},store.get('unlock',{}));
if(!UNL.starter&&UNL.u.cavaliere)UNL.starter='cavaliere';
const starterIdx=()=>CLASSES.findIndex(c=>c.id===(UNL.starter||'cavaliere'));
function cageClassAt(f){const rest=STARTERS.filter(i=>i!==(UNL.starter||'cavaliere'));if(f===10)return rest[0];if(f===15)return rest[1];   // prima del piano 10 si gioca solo con l'eroe scelto
  const c=CLASSES.find(c=>UNLOCK[c.id]&&UNLOCK[c.id].t==='cage'&&UNLOCK[c.id].n===f);return c?c.id:null;}
const cageFloorOf=id=>{const u=UNLOCK[id];if(u.t==='cage')return u.n;const rest=STARTERS.filter(i=>i!==(UNL.starter||'cavaliere'));return rest.indexOf(id)===0?10:15;};
UNL.best=Math.max(UNL.best,STATS.best||0);UNL.kills=Math.max(UNL.kills,STATS.kills||0);
const saveUnl=()=>store.set('unlock',UNL);
const isUnlocked=c=>!!UNL.u[c.id]||(!UNL.starter&&c.id==='cavaliere');
function unlockReq(c){const u=UNLOCK[c.id];if(!u)return {txt:'',p:1};
  if(u.t==='floor')return {txt:`Raggiungi il piano ${u.n}`,p:Math.min(1,UNL.best/u.n),num:`${Math.min(UNL.best,u.n)}/${u.n}`};
  if(u.t==='cage'||u.t==='starter'){const n=cageFloorOf(c.id);return {txt:`Sconfiggi il boss del piano ${n} e liberalo dalla cella`,p:Math.min(1,UNL.best/n),num:`piano ${Math.min(UNL.best,n)}/${n}`};}
  if(u.t==='feat')return {txt:'Uccidi 30.000 nemici in totale e sconfiggi un guardiano dal piano 75 in su senza farti colpire',p:(Math.min(1,UNL.kills/u.k)+(UNL.nohit75?1:0))/2,num:`${Math.min(UNL.kills,u.k)}/${u.k} · guardiano ${UNL.nohit75?'fatto':'da fare'}`};
  if(u.t==='win'){const w=(STATS.wins||0)>0;return {txt:'Conquista la torre sconfiggendo il Drago e uccidi 15.000 nemici in totale',p:(Math.min(1,UNL.kills/u.k)+(w?1:0))/2,num:`${Math.min(UNL.kills,u.k)}/${u.k} · drago ${w?'sconfitto':'da sconfiggere'}`};}
  return {txt:'',p:1};}
function unlockClass(id,why){if(UNL.u[id])return;UNL.u[id]=true;saveUnl();const c=CLASSES.find(c=>c.id===id);if(!c)return;
  const RC=clsRar(c),el=$('unlockFx');el.style.setProperty('--rc',RC.css);$('unlockName').textContent=c.name;$('unlockRar').textContent=RC.name;$('unlockWhy').textContent=why||'';
  $('unlockIco').innerHTML=svg(WTYPES[c.weapon].icon);el.hidden=false;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');sfx('level');
  clearTimeout(unlockClass.tm);unlockClass.tm=setTimeout(()=>{el.classList.remove('on');setTimeout(()=>el.hidden=true,400);},3000);}
function checkUnlocks(){for(const c of CLASSES){const u=UNLOCK[c.id];if(!u||UNL.u[c.id])continue;
  if(u.t==='floor'&&UNL.best>=u.n)unlockClass(c.id,`Hai raggiunto il piano ${u.n}`);
  if(u.t==='feat'&&UNL.kills>=u.k&&UNL.nohit75)unlockClass(c.id,'30.000 nemici e un guardiano sconfitto senza un graffio');
  if(u.t==='win'&&UNL.kills>=u.k&&(STATS.wins||0)>0)unlockClass(c.id,'La torre è tua');}}
const fragNeed=c=>(c.tier||0)>=2?20:10;
function addFragment(f){const locked=CLASSES.filter(c=>!UNL.u[c.id]&&UNLOCK[c.id]&&(c.tier||0)<3);if(!locked.length)return;
  const c=pick(locked);UNL.frag[c.id]=(UNL.frag[c.id]||0)+1;saveUnl();if(UNL.frag[c.id]===fragNeed(c))toast(`${c.name}: frammenti completi!`,'Sbloccala al piedistallo nel seminterrato');popNum(P.x,P.y+2.6,`Frammento: ${c.name} ${Math.min(fragNeed(c),UNL.frag[c.id])}/${fragNeed(c)}`,'xp');sfx('pick');}
for(const c of CLASSES){const u=UNLOCK[c.id];if(u&&((u.t==='floor'&&UNL.best>=u.n)||(u.t==='feat'&&UNL.kills>=u.k&&UNL.nohit75)||(u.t==='win'&&UNL.kills>=u.k&&(STATS.wins||0)>0)))UNL.u[c.id]=true;}
function classStats(cls,pr){const tr=cls.tier||0,s={maxHp:Math.round(cls.hp*(1+0.1*tr)),lvDmg:0.08*tr,atkSpd:1,speed:cls.speed,armor:cls.armor,crit:cls.crit,stamMax:100,reach:1};
  for(const k in pr.alloc)applyPoint(s,k,pr.alloc[k],cls);return s;}
const S={};   // statistiche dell'eroe in questa scalata
function resetStats(){const c=G.cls;Object.assign(S,classStats(c,prog(c.id)),{dmgMul:1,jump:17,extraJumps:c.jumps,lifesteal:0,lsUp:0,wave:0,cdMul:1,stamRegen:46});
  if(G.gear)for(const k in G.gear)gearMod(G.gear[k],1);}
const nxLv=id=>(G.lv[id]||0)+1;
// ogni potenziamento ha un tetto: solo Forza, Cuore di ferro e Pozione si possono prendere sempre (servono a reggere i piani alti)
const UPG=[
  {id:'dmg',  name:"Forza",            icon:'fist',  max:5,  desc:()=>"+15% danno con qualsiasi arma", apply(){S.dmgMul+=0.15}},
  {id:'hp',   name:"Cuore di ferro",   icon:'heart', max:5,  desc:()=>"+30 vita massima e ne recuperi 30", apply(){S.maxHp+=30;P.hp=Math.min(S.maxHp,P.hp+30)}},
  {id:'spd',  name:"Polso rapido",     icon:'bolt',  max:3,  desc:()=>"Attacchi il 15% più veloce", apply(){S.atkSpd*=1.15}},
  {id:'stam', name:"Fiato lungo",      icon:'wind',  max:3,  desc:()=>"+25 stamina massima e recupero più rapido del 20%", apply(){S.stamMax+=25;S.stamRegen*=1.2;P.stam=Math.min(S.stamMax,P.stam+25)}},
  {id:'move', name:"Passo leggero",    icon:'boot',  max:2,  desc:()=>"+12% velocità di movimento", apply(){S.speed*=1.12}},
  {id:'jump', name:"Ali di piuma",     icon:'wing',  max:1,  desc:()=>"Un salto in più a mezz'aria", apply(){S.extraJumps++}},
  {id:'steal',name:"Sete di sangue",   icon:'drop',  max:2,  desc:()=>"I colpi ti curano di 1 vita, al massimo 2 volte al secondo", apply(){S.lsUp+=1}},
  {id:'crit', name:"Occhio del falco", icon:'star',  max:3,  desc:()=>"+10% probabilità di critico (danno doppio)", apply(){S.crit+=0.1}},
  {id:'armor',name:"Pelle di bronzo",  icon:'shield',max:3,  desc:()=>"-12% danni subiti", apply(){S.armor=Math.max(S.armor,Math.min(0.6,S.armor+0.12))}},
  {id:'reach',name:"Braccio lungo",    icon:'arc',   max:2,  desc:()=>"+20% portata dell'arma", apply(){S.reach*=1.2;refreshWeaponScale()}},
  {id:'cdr',  name:"Concentrazione",   icon:'clock', max:2,  desc:()=>"Le abilità si ricaricano il 20% più in fretta", apply(){S.cdMul*=0.8}},
  {id:'heal', name:"Pozione",          icon:'plus',  max:999,desc:()=>"Recuperi metà della vita massima", apply(){P.hp=Math.min(S.maxHp,P.hp+S.maxHp*0.5)}},
];

/* ---------- Stato ---------- */
const G={state:'intro',scene:'cellar',floor:1,clsIdx:clamp(store.get('class',0)|0,0,CLASSES.length-1),cls:null,weapon:null,gear:{elmo:null,guanti:null,corazza:null},
  enemies:[],corpses:[],projs:[],solids:[],queue:[],pickups:[],items:[],orbs:[],chests:[],warns:[],props:[],loot:null,won:false,winT:0,spawnT:0,cleared:false,gateY:0,gateOpen:false,hitstop:0,time:0,kills:0,runTime:0,runXp:0,lv:{},
  zoneBuilt:-1,boss:null,overT:0,climbT:0,climbFaded:false,fade:1,fadeTarget:0,fadeCb:null,bounds:{left:-CH+0.5,right:CH-0.5,ceil:CELLAR_CEIL},
  chunks:[],timers:[],zones:[],camPunch:0,capture:null,settingsFrom:'cellar',bumpT:0,statSave:0,selPrev:0,snapCam:true,cmb:0,cmbT:-9,selTab:'st'};
if(!UNL.u[CLASSES[G.clsIdx].id])G.clsIdx=starterIdx();G.cls=CLASSES[G.clsIdx];
const P={x:-1.6,y:0,z:0,vx:0,vy:0,w:0.8,h:2.05,face:1,onGround:false,hp:100,stam:100,stamDelay:0,dead:false,atk:null,atkCd:0,combo:0,comboT:0,dashT:0,dashCd:0,invul:0,
  coyote:0,jumpBuf:0,airJumps:0,kbT:0,walkT:0,landT:0,stretchT:0,flipT:0,hurtT:0,abilCd:0,abil2Cd:0,shieldT:0,rageT:0,dragon:null,blockT:0,tiredT:0,
  chargeT:0,spinT:0,spinTick:0,throwT:0,dot:null,slowT:0,climbTurn:0};
const input={left:false,right:false,up:false,down:false,jumpHeld:false,jumpPressed:false,atkHeld:false,atkPressed:false,dashPressed:false,abilPressed:false,abil2Pressed:false,abil3Pressed:false,usePressed:false};
function clearInput(){for(const k in input)input[k]=false;document.querySelectorAll('.on').forEach(e=>e.classList.remove('on'));}

