/* =========================================================
   FLAMES GAMES — sigla dello studio
   File autonomo: non dipende dal gioco, si può copiare identico in ogni progetto.

   Uso:   FlamesGames.play().then(()=>{ ...fai partire il gioco... });
   Opzioni (tutte facoltative):
     volume   0..1 (default 0.8)      suono della sigla
     hint     testo mostrato se il browser blocca l'audio (default "Tocca o premi un tasto")
     sound    false per farla muta
     skip     false per non farla saltare con tocco/tasto
     onEnd    funzione chiamata quando la sigla è sparita del tutto
   Se il browser blocca l'audio all'apertura, la sigla aspetta il primo tocco e poi parte col suono.
   La promessa si risolve quando la sigla comincia a dissolversi,
   così il gioco appare sotto mentre lei svanisce.
   ========================================================= */
(function(){
  if(window.FlamesGames)return;
  const CSS=`
#fgSigla{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:#0a0a0c;color:#f5f1ea;overflow:hidden;
  user-select:none;-webkit-user-select:none;touch-action:none;cursor:default;opacity:1;transition:opacity .55s ease}
#fgSigla.fg-out{opacity:0;pointer-events:none}
#fgSigla.fg-out.fg-fast{transition-duration:.22s}
#fgSigla .fg-box{display:flex;flex-direction:column;align-items:center;gap:clamp(18px,4.2vmin,40px);transform:translateY(-2%)}
#fgSigla .fg-mark{position:relative;height:clamp(84px,22vmin,170px);aspect-ratio:100/124}
#fgSigla .fg-mark svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
#fgSigla .fg-glow{position:absolute;left:50%;top:56%;width:330%;aspect-ratio:1;transform:translate(-50%,-50%) scale(.6);border-radius:50%;
  background:radial-gradient(closest-side,rgba(255,112,32,.30),rgba(255,84,32,.09) 45%,transparent 72%);opacity:0;
  animation:fg-glow 2.2s .8s cubic-bezier(.2,.7,.2,1) forwards}
#fgSigla .fg-line{fill:none;stroke:url(#fgGrad);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;
  animation:fg-draw .95s .15s cubic-bezier(.6,0,.2,1) forwards,fg-fade .5s 1.05s ease forwards}
#fgSigla .fg-body{fill:url(#fgGrad);opacity:0;transform-box:fill-box;transform-origin:50% 100%;
  animation:fg-fill .6s .9s cubic-bezier(.2,.8,.2,1) forwards}
#fgSigla .fg-core{fill:#0a0a0c;opacity:0;transform-box:fill-box;transform-origin:50% 100%;
  animation:fg-core .5s 1.1s cubic-bezier(.2,.8,.2,1) forwards,fg-flick 1.5s 1.6s ease-in-out infinite}
#fgSigla .fg-name{display:flex;gap:.62em;font:600 clamp(15px,3.3vmin,30px)/1 "Inter","Helvetica Neue","Segoe UI",Roboto,Arial,sans-serif;
  letter-spacing:.44em;margin-right:-.44em;text-transform:uppercase;white-space:nowrap}
#fgSigla .fg-name span{display:inline-block;opacity:0;transform:translateY(.55em);filter:blur(5px);
  animation:fg-letter .7s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(1.25s + var(--i)*45ms)}
#fgSigla .fg-name .fg-w2{font-weight:300}
#fgSigla .fg-name .fg-w2 span{--o:.66}
#fgSigla.fg-hold *{animation-play-state:paused!important}
#fgSigla .fg-hint{position:absolute;left:0;right:0;bottom:clamp(28px,11vh,90px);text-align:center;font:500 clamp(11px,2.2vmin,15px)/1 "Inter","Helvetica Neue","Segoe UI",Roboto,Arial,sans-serif;
  letter-spacing:.34em;text-transform:uppercase;color:#f5f1ea;opacity:0;transition:opacity .4s ease;pointer-events:none}
#fgSigla.fg-ask{cursor:pointer}
#fgSigla.fg-ask .fg-hint{opacity:.55;animation:fg-ask 1.8s ease-in-out infinite;animation-play-state:running!important}
@keyframes fg-ask{50%{opacity:.2}}
@keyframes fg-draw{to{stroke-dashoffset:0}}
@keyframes fg-fade{to{opacity:0}}
@keyframes fg-fill{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
@keyframes fg-core{from{opacity:0;transform:scaleY(.4)}to{opacity:1;transform:scaleY(1)}}
@keyframes fg-flick{0%,100%{transform:scale(1,1)}35%{transform:scale(.96,1.07)}70%{transform:scale(1.03,.97)}}
@keyframes fg-glow{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}30%{opacity:1}100%{opacity:.6;transform:translate(-50%,-50%) scale(1)}}
@keyframes fg-letter{to{opacity:var(--o,1);transform:none;filter:none}}
@media (prefers-reduced-motion:reduce){
  #fgSigla *{animation-duration:.01s!important;animation-delay:0s!important;animation-iteration-count:1!important}
}`;
  const letters=(w,from)=>[...w].map((c,i)=>`<span style="--i:${from+i}">${c}</span>`).join('');
  const FLAME='M50 4C55 27 86 45 86 79A36 36 0 0 1 14 79C14 62 24 52 31 38C35 50 41 54 44 47C48 36 45 20 50 4Z';
  const CORE='M50 66C57 77 65 85 65 95A15 15 0 0 1 35 95C35 85 43 77 50 66Z';
  const HTML=`<div class="fg-box" role="img" aria-label="Flames Games">
  <div class="fg-mark"><div class="fg-glow"></div>
    <svg viewBox="0 0 100 124" aria-hidden="true">
      <defs><linearGradient id="fgGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#ff3b2f"/><stop offset=".55" stop-color="#ff7a1a"/><stop offset="1" stop-color="#ffc247"/></linearGradient></defs>
      <path class="fg-body" d="${FLAME}"/><path class="fg-core" d="${CORE}"/>
      <path class="fg-line" pathLength="1" d="${FLAME}"/>
    </svg></div>
  <div class="fg-name" aria-hidden="true"><div>${letters('FLAMES',0)}</div><div class="fg-w2">${letters('GAMES',7)}</div></div>
</div>`;

  /* suono: un soffio che si accende e un accordo caldo, generati al volo (nessun file audio) */
  function makeCtx(){try{const C=window.AudioContext||window.webkitAudioContext;return C?new C():null;}catch(e){return null;}}
  function sound(c,vol){
    const t=c.currentTime+0.05,out=c.createGain(),lim=c.createDynamicsCompressor();out.gain.value=vol;out.connect(lim);lim.connect(c.destination);
    // soffio
    const n=c.sampleRate*1.4|0,buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
    const src=c.createBufferSource(),bp=c.createBiquadFilter(),ng=c.createGain();src.buffer=buf;bp.type='bandpass';bp.Q.value=0.8;
    bp.frequency.setValueAtTime(300,t+0.1);bp.frequency.exponentialRampToValueAtTime(3200,t+1.0);
    ng.gain.setValueAtTime(0.0001,t+0.1);ng.gain.exponentialRampToValueAtTime(0.5,t+0.85);ng.gain.exponentialRampToValueAtTime(0.0001,t+1.35);
    src.connect(bp);bp.connect(ng);ng.connect(out);src.start(t+0.1);src.stop(t+1.5);
    // accordo di re maggiore quando la fiamma si accende, poi due note alte sul nome
    // (frequenze medie: si devono sentire anche dall'altoparlante di un telefono)
    const tone=(f,at,dur,g,type)=>{const o=c.createOscillator(),e=c.createGain();o.type=type||'sine';o.frequency.value=f;
      e.gain.setValueAtTime(0.0001,t+at);e.gain.exponentialRampToValueAtTime(g,t+at+0.05);e.gain.exponentialRampToValueAtTime(0.0001,t+at+dur);
      o.connect(e);e.connect(out);o.start(t+at);o.stop(t+at+dur+0.05);};
    tone(73.42,0.9,2.2,0.30);tone(146.83,0.9,2.1,0.30,'triangle');tone(220,0.93,2.0,0.24,'triangle');tone(293.66,0.96,1.9,0.22);tone(369.99,0.99,1.8,0.18);
    tone(587.33,1.45,1.6,0.20);tone(880,1.55,1.4,0.10);
  }

  const FG={playing:false,play(o){
    o=o||{};
    if(FG.playing)return Promise.resolve();
    FG.playing=true;
    if(!document.getElementById('fgStyle')){const st=document.createElement('style');st.id='fgStyle';st.textContent=CSS;document.head.appendChild(st);}
    const el=document.createElement('div');el.id='fgSigla';el.className='fg-hold';
    el.innerHTML=HTML+'<div class="fg-hint">'+(o.hint||'Tocca o premi un tasto')+'</div>';document.body.appendChild(el);
    const ctx=o.sound===false?null:makeCtx(),vol=o.volume==null?0.8:Math.max(0,Math.min(1,o.volume));
    return new Promise(res=>{
      let started=false,closing=false,tm=0,tw=0;
      // I browser tengono l'audio fermo finché l'utente non tocca la pagina. Se l'audio è libero la sigla parte subito;
      // se è bloccato compare "Tocca o premi un tasto" e la sigla parte, col suono, al primo tocco.
      function start(){
        if(started)return;started=true;clearTimeout(tw);el.classList.remove('fg-hold','fg-ask');
        if(ctx&&ctx.state==='running')sound(ctx,vol);
        tm=setTimeout(()=>close(false),3200);
      }
      function unlock(){if(ctx&&ctx.state!=='running'){try{ctx.resume().then(()=>{if(!started)start();},start);}catch(e){start();}setTimeout(start,400);}else start();}
      function close(fast){
        if(closing)return;closing=true;clearTimeout(tm);
        removeEventListener('keydown',key,true);el.removeEventListener('pointerdown',tap);el.removeEventListener('click',click);
        if(fast)el.classList.add('fg-fast');el.classList.add('fg-out');
        FG.playing=false;res();
        setTimeout(()=>{el.remove();if(ctx){try{ctx.close();}catch(e){}}if(o.onEnd)o.onEnd();},fast?260:600);
      }
      const key=e=>{e.stopImmediatePropagation();e.preventDefault();if(e.repeat)return;if(!started)unlock();else if(o.skip!==false)close(true);};
      const tap=e=>{e.stopPropagation();e.preventDefault();if(started&&o.skip!==false)close(true);};
      const click=e=>{e.stopPropagation();if(!started)unlock();};   // "click" e non "pointerdown": sul touch è lui che sblocca l'audio
      addEventListener('keydown',key,true);el.addEventListener('pointerdown',tap);el.addEventListener('click',click);
      if(!ctx||ctx.state==='running')start();
      else{try{ctx.resume().then(()=>{if(!started&&ctx.state==='running')start();},()=>{});}catch(e){}
        tw=setTimeout(()=>{if(!started){if(ctx.state==='running')start();else el.classList.add('fg-ask');}},300);}
    });
  }};
  window.FlamesGames=FG;
})();
