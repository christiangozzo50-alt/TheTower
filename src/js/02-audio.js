/* =========================================================
   AUDIO (suoni e musica generati al volo)
   ========================================================= */
const AU={ctx:null,lastXp:0};
function audioInit(){
  if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume().catch(()=>{});return;}
  try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C();AU.ctx=c;
    AU.master=c.createGain();AU.master.connect(c.destination);AU.music=c.createGain();AU.music.connect(AU.master);AU.sfx=c.createGain();AU.sfx.connect(AU.master);
    const len=c.sampleRate,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;AU.noise=b;
    applyVolumes();MUS.next=c.currentTime+0.1;
  }catch(e){AU.ctx=null;}
}
function applyVolumes(){if(!AU.ctx)return;const t=AU.ctx.currentTime;AU.master.gain.setTargetAtTime(SETTINGS.master,t,0.02);AU.music.gain.setTargetAtTime(SETTINGS.music*0.6,t,0.05);AU.sfx.gain.setTargetAtTime(SETTINGS.sfx,t,0.02);}
const audioOk=()=>AU.ctx&&AU.ctx.state==='running';
function note(f,o){o=o||{};const c=AU.ctx,t=o.at||c.currentTime,dur=o.dur||0.15;
  const osc=c.createOscillator(),g=c.createGain();osc.type=o.type||'sine';osc.frequency.setValueAtTime(f,t);if(o.f2)osc.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(o.vol||0.2,t+(o.attack||0.004));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  let n=osc;if(o.lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;osc.connect(fl);n=fl;}
  n.connect(g);g.connect(o.dest||AU.sfx);osc.start(t);osc.stop(t+dur+0.05);}
function hiss(o){o=o||{};const c=AU.ctx,t=o.at||c.currentTime,dur=o.dur||0.15;
  const s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;const fl=c.createBiquadFilter();fl.type=o.type||'bandpass';fl.Q.value=o.q||1;
  fl.frequency.setValueAtTime(o.f||1000,t);if(o.f2)fl.frequency.exponentialRampToValueAtTime(o.f2,t+dur);
  const g=c.createGain();g.gain.setValueAtTime(o.vol||0.2,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(fl);fl.connect(g);g.connect(o.dest||AU.sfx);s.start(t,Math.random()*0.5);s.stop(t+dur+0.05);}
const mtof=m=>440*Math.pow(2,(m-69)/12);
const arp=(notes,base,step,o)=>notes.forEach((n,i)=>note(mtof(base+n),Object.assign({at:AU.ctx.currentTime+i*step},o)));
const SFX={
  swing(){hiss({dur:.17,vol:.22,f:700,f2:2600,q:.9});},
  heavy(){hiss({dur:.28,vol:.3,f:300,f2:1500,q:.8});note(90,{dur:.2,vol:.12,f2:55});},
  stab(){hiss({dur:.08,vol:.16,f:2400,f2:4400,q:1.2});},
  thrust(){hiss({dur:.15,vol:.22,f:1100,f2:3200,q:1.4});},
  hit(){note(170,{type:'square',dur:.09,vol:.11,f2:70,lp:1200});hiss({dur:.05,vol:.18,f:2200,q:.7});},
  crit(){note(320,{type:'square',dur:.12,vol:.12,f2:120,lp:2000});hiss({dur:.08,vol:.2,f:3200,q:.7});note(1320,{type:'triangle',dur:.12,vol:.05});},
  hurt(){note(220,{type:'sawtooth',dur:.22,vol:.12,f2:90,lp:900});},
  jump(){note(330,{dur:.12,vol:.07,f2:620});},
  flip(){hiss({dur:.25,vol:.12,f:600,f2:2200,q:.7});note(500,{dur:.15,vol:.05,f2:900});},
  dash(){hiss({dur:.2,vol:.18,f:500,f2:2000,q:.6});},
  die(){hiss({dur:.3,vol:.2,f:900,f2:200,q:.8});note(140,{type:'triangle',dur:.25,vol:.1,f2:50});},
  bones(){for(let i=0;i<4;i++)note(rand(600,1100),{type:'square',dur:.04,vol:.04,lp:2500,at:AU.ctx.currentTime+i*0.05});},
  slam(){note(70,{dur:.5,vol:.35,f2:35});hiss({dur:.4,vol:.25,f:400,f2:80,type:'lowpass'});},
  gate(){hiss({dur:1.1,vol:.12,f:200,f2:700,q:3});note(98,{type:'sawtooth',dur:1,vol:.04,lp:500});},
  clear(){arp([0,4,7,12],69,.08,{type:'triangle',dur:.3,vol:.08});},
  pick(){arp([0,7,12],72,.06,{type:'triangle',dur:.25,vol:.08});},
  legend(){arp([0,4,7,11,14,19],67,.07,{type:'triangle',dur:.4,vol:.08});},
  equip(){note(880,{type:'triangle',dur:.2,vol:.07});hiss({dur:.1,vol:.1,f:5000,q:2});},
  ui(){note(660,{dur:.06,vol:.06});},
  ability(){arp([0,5,9,14],64,.04,{dur:.22,vol:.07});},
  block(){note(900,{type:'square',dur:.06,vol:.05,lp:3000});note(1300,{type:'triangle',dur:.12,vol:.05});},
  orb(){note(520,{dur:.2,vol:.04,f2:260});},
  zap(){hiss({dur:.12,vol:.12,f:4000,q:3});note(1800,{type:'square',dur:.06,vol:.03,f2:600});},
  land(){hiss({dur:.06,vol:.07,f:300,q:.8,type:'lowpass'});},
  wake(){arp([0,3,7],57,.12,{dur:.4,vol:.06});},
  xp(){note(rand(1100,1500),{type:'triangle',dur:.06,vol:.025});},
  lvl(){arp([0,4,7,12,16,19],72,.07,{type:'triangle',dur:.35,vol:.08});},
  bandage(){arp([0,5,9],76,.05,{dur:.18,vol:.06});},
  tired(){note(180,{type:'triangle',dur:.12,vol:.05,f2:120});},
  boom(){note(60,{dur:.6,vol:.4,f2:30});hiss({dur:.5,vol:.3,f:600,f2:60,type:'lowpass'});},
  roar(){note(90,{type:'sawtooth',dur:.9,vol:.12,f2:55,lp:700});hiss({dur:.8,vol:.15,f:300,f2:900,q:.6});},
  chest(){note(330,{type:'triangle',dur:.15,vol:.06});arp([0,4,7,12,16],67,.06,{type:'triangle',dur:.3,vol:.07});},
  chestRattle(){hiss({dur:.05,vol:.08,f:1700,q:3});note(120+Math.random()*70,{type:'square',dur:.04,vol:.03});},
  chestBurst(){note(130,{dur:.38,vol:.2,f2:48});hiss({dur:.45,vol:.16,f:900,f2:5200,q:.7});},
  chestEpic(){arp([0,7,12,19,24],72,.075,{type:'triangle',dur:.55,vol:.09});note(1568,{type:'sine',dur:1,vol:.05});},
  arrow(){hiss({dur:.1,vol:.12,f:3000,f2:1500,q:2});},
  fuse(){note(900,{type:'square',dur:.05,vol:.03});},
  win(){arp([0,4,7,12,16,19,24],60,.12,{type:'triangle',dur:.6,vol:.1});},
};
// armi: suono del fendente e dell'impatto diversi per ognuna
const WSND={
  spada:{sw(){hiss({dur:.16,vol:.22,f:900,f2:3200,q:1.1});note(1900,{type:'triangle',dur:.07,vol:.02,f2:2500});},hit:'slash'},
  katana:{sw(){hiss({dur:.11,vol:.24,f:2200,f2:6500,q:2.4});note(2800,{dur:.14,vol:.03,f2:3600});},hit:'slash'},
  ascia:{sw(){hiss({dur:.3,vol:.3,f:240,f2:1100,q:.7});note(115,{dur:.2,vol:.1,f2:70});},hit:'chop'},
  martello:{sw(){hiss({dur:.34,vol:.3,f:150,f2:650,q:.6});note(80,{dur:.26,vol:.14,f2:48});},hit:'blunt'},
  lancia:{sw(){hiss({dur:.12,vol:.22,f:1500,f2:4000,q:2.2});note(640,{type:'triangle',dur:.05,vol:.03});},hit:'pierce'},
  falce:{sw(){hiss({dur:.38,vol:.22,f:480,f2:2600,q:.9});note(210,{dur:.32,vol:.04,f2:430});},hit:'slash'},
  pugnali:{sw(){hiss({dur:.07,vol:.18,f:3200,f2:5600,q:1.7});},hit:'stabhit'},
  pugni:{sw(){hiss({dur:.08,vol:.16,f:700,f2:1500,q:.8,type:'lowpass'});},hit:'blunt'},
  arco:{sw(){note(170,{type:'triangle',dur:.14,vol:.12,f2:330});hiss({dur:.09,vol:.1,f:2600,f2:1200,q:3});},hit:'pierce'},
  bastone:{sw(){arp([0,7,12],79,.025,{dur:.16,vol:.04});hiss({dur:.18,vol:.08,f:3200,f2:6400,q:4});},hit:'magic'},
};
function wsfx(fin){if(!audioOk())return;try{(WSND[G.weapon.type]||WSND.spada).sw();if(fin){note(72,{dur:.32,vol:.16,f2:40});hiss({dur:.2,vol:.12,f:400,f2:150,type:'lowpass'});}}catch(e){}}
Object.assign(SFX,{
  slash(){hiss({dur:.07,vol:.22,f:3600,q:1.2});note(240,{type:'square',dur:.06,vol:.06,f2:110,lp:1500});},
  chop(){note(130,{type:'square',dur:.12,vol:.12,f2:60,lp:900});hiss({dur:.1,vol:.2,f:1400,q:.8});},
  blunt(){note(95,{dur:.16,vol:.26,f2:45});hiss({dur:.08,vol:.18,f:500,q:.6,type:'lowpass'});},
  pierce(){hiss({dur:.05,vol:.2,f:4800,q:2});note(320,{type:'square',dur:.05,vol:.05,f2:160,lp:2000});},
  stabhit(){hiss({dur:.04,vol:.18,f:5200,q:1.5});note(420,{type:'square',dur:.04,vol:.04,lp:2400});},
  magic(){arp([0,5],86,.03,{dur:.12,vol:.04});hiss({dur:.1,vol:.12,f:5000,f2:2000,q:3});},
  jump(){note(240,{dur:.1,vol:.07,f2:480});hiss({dur:.06,vol:.05,f:900,q:.6,type:'lowpass'});},
  flip(){hiss({dur:.26,vol:.12,f:900,f2:3000,q:1.4});note(620,{type:'triangle',dur:.12,vol:.04,f2:1240});},
  dash(){hiss({dur:.24,vol:.22,f:1800,f2:280,q:.5,type:'lowpass'});note(150,{dur:.14,vol:.08,f2:70});},
  land(){note(85,{dur:.1,vol:.12,f2:50});hiss({dur:.07,vol:.08,f:280,q:.8,type:'lowpass'});},
  hurt(){note(210,{type:'sawtooth',dur:.2,vol:.12,f2:110,lp:800});note(70,{dur:.12,vol:.12,f2:40});},
});
const ABTHEME={cavaliere:'shield',berserker:'rage',lanciere:'wind',assassino:'shadow',mago:'fire',criomante:'ice',tempesta:'thunder',druido:'nature',astromante:'star',negromante:'dark',paladino:'holy',arciere:'bow',samurai:'blade',monaco:'chi'};
function absnd(n){if(!audioOk())return;const k=n===3?1.6:n===2?1.25:1,t0=AU.ctx.currentTime;try{
  switch(ABTHEME[G.cls.id]){
  case 'shield':note(520,{type:'triangle',dur:.5*k,vol:.07});note(784,{type:'triangle',dur:.6*k,vol:.06});hiss({dur:.2,vol:.12,f:5200,q:5});break;
  case 'rage':note(85,{type:'sawtooth',dur:.8*k,vol:.14,f2:50,lp:650});hiss({dur:.7*k,vol:.16,f:280,f2:950,q:.6});break;
  case 'wind':hiss({dur:.55*k,vol:.2,f:380,f2:2600,q:.5});note(300,{dur:.3,vol:.05,f2:640});break;
  case 'shadow':hiss({dur:.45*k,vol:.18,f:2200,f2:180,q:.7,type:'lowpass'});note(110,{dur:.5*k,vol:.07,f2:55});break;
  case 'fire':hiss({dur:.7*k,vol:.28,f:700,f2:3200,q:.4,type:'lowpass'});for(let i=0;i<6;i++)hiss({at:t0+i*0.07,dur:.04,vol:.1,f:rand(2000,5000),q:3});note(90,{dur:.4,vol:.12,f2:60});break;
  case 'ice':arp([0,7,12,19,24],86,.045,{type:'triangle',dur:.4,vol:.05});hiss({dur:.45*k,vol:.1,f:6500,q:5});break;
  case 'thunder':hiss({dur:.16,vol:.4,f:3000,q:.4});note(55,{dur:1*k,vol:.28,f2:32});hiss({at:t0+0.08,dur:1*k,vol:.22,f:260,f2:90,type:'lowpass'});break;
  case 'nature':note(200,{type:'triangle',dur:.1,vol:.1});note(160,{type:'triangle',dur:.12,vol:.1,at:t0+0.09});hiss({dur:.6*k,vol:.14,f:1600,q:.6});break;
  case 'star':arp([0,4,7,11,14,19],84,.035,{dur:.35,vol:.05});hiss({dur:.5*k,vol:.08,f:8000,q:6});break;
  case 'dark':note(55,{type:'sawtooth',dur:1*k,vol:.14,lp:420});hiss({dur:.8*k,vol:.12,f:1200,q:6});break;
  case 'holy':[0,4,7,12].forEach(s=>note(mtof(72+s),{type:'triangle',dur:1*k,vol:.045,attack:.06}));note(mtof(96),{dur:.6,vol:.03});break;
  case 'bow':note(200,{type:'triangle',dur:.18,vol:.12,f2:140});hiss({dur:.12,vol:.12,f:3000,f2:1500,q:3});break;
  case 'blade':note(2400,{dur:.5*k,vol:.05,f2:2700});hiss({dur:.3,vol:.14,f:6000,q:8});break;
  case 'chi':note(120,{dur:.14,vol:.2,f2:60});note(110,{dur:.14,vol:.2,f2:55,at:t0+0.1});hiss({dur:.3*k,vol:.12,f:600,q:.6,type:'lowpass'});break;
  default:SFX.ability();}
  if(n===3){note(48,{dur:1.2,vol:.3,f2:28});hiss({at:t0+0.05,dur:.9,vol:.2,f:500,f2:60,type:'lowpass'});}
}catch(e){}}
function sfx(n){if(!audioOk())return;if(n==='xp'){const t=AU.ctx.currentTime;if(t-AU.lastXp<0.05)return;AU.lastXp=t;}try{SFX[n]();}catch(e){}}
const MUS={mood:'cellar',step:0,next:0};
const CHORDS=[[57,60,64],[53,57,60],[55,59,62],[52,55,59]];
// musica dei guardiani: re minore con progressione cupa (i–bVI–bII–V), basso martellante a sedicesimi, batteria e un tema minaccioso
const BOSS_CH=[[50,53,57],[46,50,53],[51,55,58],[45,49,52]];
const BOSS_LEAD=[12,12,13,12,15,13,12,11,12,12,13,15,17,15,13,12];
const BOSS_BASS=[0,0,12,0,0,0,12,0,0,0,12,0,7,0,12,0];
function bossMusic(s,t,d,final){
  const ch=BOSS_CH[Math.floor(s/32)%4],r=ch[0],sd=60/(final?166:152)/4;
  // basso a sedicesimi, accentato sul battere
  note(mtof(r-12+BOSS_BASS[s%16]),{type:'sawtooth',dur:sd*0.9,vol:s%4===0?.07:.045,at:t,dest:d,lp:s%4===0?700:480});
  // cassa (con sincope), rullante sul 2 e sul 4, charleston
  if(s%8===0||s%16===10){note(118,{dur:.2,vol:.3,f2:42,at:t,dest:d});}
  if(s%16===4||s%16===12){hiss({dur:.13,vol:.13,f:1900,q:.7,at:t,dest:d});note(200,{type:'triangle',dur:.07,vol:.06,f2:120,at:t,dest:d});}
  if(s%2===0)hiss({dur:.03,vol:s%4===2?.045:.025,f:8500,type:'highpass',at:t,dest:d});
  // coro d'organo cupo a ogni cambio di accordo
  if(s%32===0)for(const n of ch)note(mtof(n),{type:'sawtooth',dur:sd*30,vol:.022,at:t,dest:d,lp:900,attack:.25});
  if(s%32===0)note(mtof(r-24),{type:'triangle',dur:sd*30,vol:.12,at:t,dest:d,attack:.05});
  // tema minaccioso, una frase sì e una no (sempre nella battaglia finale)
  if(s%2===0&&(final||Math.floor(s/64)%2===1)){const k=(s%32)/2;note(mtof(r+BOSS_LEAD[k]),{type:'square',dur:sd*1.7,vol:.028,at:t,dest:d,lp:1700});}
  // campana a morto all'inizio di ogni giro
  if(s%128===0)note(mtof(r+24),{type:'triangle',dur:2.4,vol:.05,at:t,dest:d});
  // rullata di tamburi a fine frase
  if(s%32>=28&&(final||s%64>=60))note(150-(s%32-28)*12,{dur:.1,vol:.16,f2:70,at:t,dest:d});
  return sd;
}
// ingresso del guardiano: pulsazione lenta, battito del cuore e un bordone che sale
function introMusic(s,t,d){const sd=60/72/2;
  if(s%8===0){note(62,{dur:.22,vol:.32,f2:38,at:t,dest:d});note(58,{dur:.2,vol:.22,f2:36,at:t+0.22,dest:d});}
  if(s%16===0){note(mtof(38),{type:'sawtooth',dur:sd*16,vol:.05,at:t,dest:d,lp:300,attack:.4});note(mtof(39),{type:'sawtooth',dur:sd*16,vol:.03,at:t,dest:d,lp:260,attack:.6});}
  if(s%4===2)hiss({dur:.5,vol:.02,f:300,f2:900,q:4,at:t,dest:d});
  return sd;}
function musicTick(){
  if(!audioOk())return;const c=AU.ctx;
  if(MUS.mood!==MUS.last){MUS.last=MUS.mood;MUS.step=0;MUS.next=Math.max(MUS.next,c.currentTime+0.05);}
  const bpm=MUS.mood==='tower'?100:66,sd=60/bpm/2;
  if(MUS.next<c.currentTime-0.5)MUS.next=c.currentTime+0.05;
  while(MUS.next<c.currentTime+0.25){
    const s=MUS.step,t=MUS.next,ch=CHORDS[Math.floor(s/16)%4],d=AU.music;
    if(MUS.mood==='boss'||MUS.mood==='final'){MUS.next+=bossMusic(s,t,d,MUS.mood==='final');MUS.step++;continue;}
    if(MUS.mood==='bossintro'){MUS.next+=introMusic(s,t,d);MUS.step++;continue;}
    if(s%8===0)note(mtof(ch[0]-24),{type:'triangle',dur:sd*7.5,vol:.16,at:t,dest:d,attack:.02});
    if(MUS.mood==='cellar'){if(s%4===2)note(mtof(ch[(s>>2)%3]+12),{dur:sd*3,vol:.045,at:t,dest:d,attack:.02});}
    else{if(s%2===0)note(mtof(ch[(s>>1)%3]+(s%8>=4?12:0)),{type:'triangle',dur:sd*1.6,vol:.045,at:t,dest:d});
      if(s%4===0)note(mtof(ch[0]-12),{type:'sawtooth',dur:sd*1.5,vol:.022,at:t,dest:d,lp:600});if(typeof battleLayer==='function')battleLayer(s,t,sd,d,ch);}
    MUS.step++;MUS.next+=sd;
  }
}
setInterval(musicTick,100);

