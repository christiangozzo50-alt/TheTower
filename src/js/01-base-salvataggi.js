/* =========================================================
   THE TOWER
   Indice: utilità → salvataggi → audio → dati → grafica (materiali
   cartoon, torre, seminterrato) → modelli (stickman, armi, nemici)
   → logica (fisica, eroe, abilità, nemici, XP, bende) → piani
   → premi → schermate → input → ciclo principale
   ========================================================= */
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, approach=(v,t,d)=>v<t?Math.min(v+d,t):Math.max(v-d,t);
const rand=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
const easeOutCubic=t=>1-Math.pow(1-t,3), easeOutQuart=t=>1-Math.pow(1-t,4), easeInOutCubic=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const easeOutBack=t=>{const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);};
const TAU=Math.PI*2, wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a)), damp=(dt,k)=>1-Math.exp(-dt*k);
const near=(a,ref)=>a+TAU*Math.round((ref-a)/TAU);
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const reduced=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
let isTouch=!!(window.matchMedia&&matchMedia('(pointer: coarse)').matches);
/* ---------- Intro di apertura: "The Tower" ---------- */
// scena disegnata in SVG: torre rotonda in pietra, luna, nuvole, nebbia, drago, pipistrelli, fulmini, braci
(function buildOpener(){
  const X=1040,B=840,T=330,rB=92,rT=76,rad=y=>rB+(rT-rB)*(B-y)/(B-T),bul=y=>Math.max(0,(700-y))*0.04+3;
  const arc=(y,r,b)=>`M${X-r} ${y} Q${X} ${y-2*b} ${X+r} ${y}`;
  let s=`<defs>
  <linearGradient id="oSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06050c"/><stop offset=".5" stop-color="#1a1330"/><stop offset=".78" stop-color="#43203c"/><stop offset="1" stop-color="#8a3f2a"/></linearGradient>
  <radialGradient id="oMoon"><stop offset="0" stop-color="#fff8e4"/><stop offset=".6" stop-color="#efe2c6"/><stop offset=".66" stop-color="#efe2c6" stop-opacity=".3"/><stop offset="1" stop-color="#efe2c6" stop-opacity="0"/></radialGradient>
  <linearGradient id="oStone" x1="0" x2="1"><stop offset="0" stop-color="#0b0911"/><stop offset=".3" stop-color="#1d1828"/><stop offset=".62" stop-color="#3a3049"/><stop offset=".86" stop-color="#6a5a7e"/><stop offset=".95" stop-color="#8d7aa4"/><stop offset="1" stop-color="#2a2236"/></linearGradient>
  <linearGradient id="oStoneD" x1="0" x2="1"><stop offset="0" stop-color="#08070c"/><stop offset=".6" stop-color="#2a2236"/><stop offset=".9" stop-color="#55486a"/><stop offset="1" stop-color="#1c1724"/></linearGradient>
  <linearGradient id="oRoof" x1="0" x2="1"><stop offset="0" stop-color="#14070a"/><stop offset=".55" stop-color="#4a1a1e"/><stop offset=".85" stop-color="#8a3a34"/><stop offset="1" stop-color="#2a0e10"/></linearGradient>
  <radialGradient id="oGlow"><stop offset="0" stop-color="#ffd890" stop-opacity=".9"/><stop offset=".4" stop-color="#ff8a3a" stop-opacity=".35"/><stop offset="1" stop-color="#ff6a1a" stop-opacity="0"/></radialGradient>
  <linearGradient id="oCliff" x1="0" x2="1"><stop offset="0" stop-color="#07060b"/><stop offset=".7" stop-color="#18131f"/><stop offset="1" stop-color="#2c2236"/></linearGradient>
  <filter id="oBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="oSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
  <clipPath id="oBody"><path d="M${X-rB} ${B} Q${X} ${B+10} ${X+rB} ${B} L${X+rT} ${T} Q${X} ${T-16} ${X-rT} ${T}Z"/></clipPath>
  <clipPath id="oCone"><path d="M${X-96} 300 Q${X} 284 ${X+96} 300 L${X} 112Z"/></clipPath></defs>
  <rect y="-40" width="1600" height="940" fill="url(#oSky)"/>`;
  for(let i=0;i<90;i++){const x=Math.random()*1600,y=Math.random()*560,r=Math.random()<.12?1.8:Math.random()*1.1+.4;s+=`<circle class="op-star" cx="${x|0}" cy="${y|0}" r="${r.toFixed(1)}" fill="#f3ead7" style="animation-delay:${(Math.random()*3).toFixed(2)}s;opacity:${(.4+Math.random()*.6).toFixed(2)}"/>`;}
  s+=`<circle cx="1250" cy="215" r="300" fill="url(#oMoon)" opacity=".28"/><circle cx="1250" cy="215" r="112" fill="url(#oMoon)"/>
  <g fill="#7a6a58" opacity=".14"><circle cx="1215" cy="190" r="22"/><circle cx="1285" cy="250" r="15"/><circle cx="1262" cy="168" r="9"/><circle cx="1225" cy="258" r="11"/></g>`;
  // drago in volo davanti alla luna
  s+=`<g class="op-dragon"><g fill="#0a0810">
    <path d="M0 52 Q40 40 72 46 Q104 38 134 44 L166 34 Q180 32 186 40 Q178 48 162 50 L134 56 Q102 64 72 60 Q40 62 0 52Z"/><path d="M0 52 L-22 42 L-10 56Z"/>
    <path d="M168 34 L176 18 L178 34Z"/>
    <path class="op-wing" d="M84 46 Q70 0 34 -46 Q80 -24 98 -38 Q104 -6 120 -20 Q122 18 112 46Z"/>
    <path class="op-wing" style="animation-delay:-.25s;opacity:.7" d="M96 46 Q90 6 66 -30 Q100 -14 112 -24 Q116 4 126 -6 Q126 24 120 46Z"/></g></g>`;
  // nuvole
  for(let i=0;i<6;i++){const y=90+Math.random()*320,w=180+Math.random()*240,d=40+Math.random()*50;s+=`<g class="op-cloud" style="animation-duration:${d|0}s;animation-delay:-${(Math.random()*d)|0}s"><ellipse cx="0" cy="${y|0}" rx="${w|0}" ry="${(w*.16)|0}" fill="#2c2142" opacity=".75" filter="url(#oBlur)"/></g>`;}
  // fulmine lontano
  s+=`<path class="op-bolt" d="M330 0 L352 120 L318 140 L372 300 L338 318 L400 470" stroke="#e8ecff" stroke-width="4" fill="none" stroke-linejoin="round" filter="url(#oSoft)"/>
  <path class="op-bolt" d="M330 0 L352 120 L318 140 L372 300 L338 318 L400 470" stroke="#fff" stroke-width="1.6" fill="none"/>`;
  // montagne e nebbia
  s+=`<path d="M0 640 L120 540 L210 600 L330 470 L460 590 L560 520 L700 640 L820 560 L940 640 L1120 520 L1260 610 L1400 500 L1600 600 L1600 900 L0 900Z" fill="#221935"/>
  <path d="M0 720 Q140 650 260 690 Q380 610 520 690 Q640 640 760 700 Q900 660 1000 720 L1600 700 L1600 900 L0 900Z" fill="#161126"/>
  <g class="op-fog"><ellipse cx="420" cy="720" rx="520" ry="60" fill="#4a3866" opacity=".35" filter="url(#oBlur)"/><ellipse cx="1300" cy="760" rx="480" ry="50" fill="#4a3866" opacity=".3" filter="url(#oBlur)"/></g>`;
  // rupe e alone della porta
  s+=`<path d="M780 900 L830 820 Q900 790 980 800 L1100 796 Q1190 790 1240 830 L1330 900Z" fill="url(#oCliff)"/>
  <ellipse cx="${X}" cy="${B+6}" rx="170" ry="36" fill="url(#oGlow)" opacity=".7"/>`;
  // corpo della torre
  s+=`<path d="M${X-rB} ${B} Q${X} ${B+10} ${X+rB} ${B} L${X+rT} ${T} Q${X} ${T-16} ${X-rT} ${T}Z" fill="url(#oStone)"/><g clip-path="url(#oBody)" stroke="#000" fill="none">`;
  for(let y=T+18,row=0;y<B;y+=22,row++){const r=rad(y)+2,b=bul(y);s+=`<path d="${arc(y,r,b)}" stroke-opacity=".38" stroke-width="1.6"/>`;
    for(let k=-6;k<=6;k++){const th=(k+(row%2)*.5)*.26;if(Math.abs(th)>1.5)continue;const x=X+r*Math.sin(th),off=b*(1-Math.sin(th)**2);s+=`<path d="M${x.toFixed(1)} ${(y-off).toFixed(1)} l0 22" stroke-opacity="${(.12+.2*Math.cos(th)).toFixed(2)}" stroke-width="1.3"/>`;}}
  s+=`</g><path d="M${X+rB} ${B} L${X+rT} ${T}" stroke="#b9a6d6" stroke-opacity=".45" stroke-width="3" filter="url(#oSoft)"/>`;
  // ballatoi con mensole
  for(const y of [610,450]){const r=rad(y)+13,b=bul(y);s+=`<path d="${arc(y,r,b)} L${X+r} ${y+13} Q${X} ${y+13-2*b} ${X-r} ${y+13}Z" fill="url(#oStoneD)"/>`;
    for(let th=-1.35;th<=1.36;th+=.27){const x=X+(r-3)*Math.sin(th),w=9*Math.cos(th),yy=y+13-b*(1-Math.sin(th)**2);s+=`<rect x="${(x-w/2).toFixed(1)}" y="${yy.toFixed(1)}" width="${w.toFixed(1)}" height="11" rx="2" fill="#120f19"/>`;}}
  // finestre accese
  const wins=[[-.3,780,0],[.45,720,1],[-.55,660,.3],[.15,560,.6],[-.2,500,.9],[.6,520,1.2],[-.45,390,1.4],[.3,370,1.7],[0,700,2],[.05,410,2.2]];
  for(const [th,y,d] of wins){const r=rad(y),x=X+r*Math.sin(th)*.92,w=17*Math.cos(th),yy=y-bul(y)*(1-Math.sin(th)**2);
    s+=`<g class="op-win" style="animation-delay:${(1+d*.5).toFixed(2)}s,${(2+d).toFixed(2)}s"><circle cx="${x.toFixed(1)}" cy="${(yy+12).toFixed(1)}" r="38" fill="url(#oGlow)"/><rect x="${(x-w/2).toFixed(1)}" y="${yy.toFixed(1)}" width="${w.toFixed(1)}" height="26" rx="${(w/2).toFixed(1)}" fill="#ffcf7a" stroke="#0a0810" stroke-width="2.5"/></g>`;}
  // porta
  s+=`<path d="M${X-18} ${B+4} L${X-18} ${B-30} A18 18 0 0 1 ${X+18} ${B-30} L${X+18} ${B+4}Z" fill="#ffb054" stroke="#0a0810" stroke-width="4"/><circle cx="${X}" cy="${B-20}" r="60" fill="url(#oGlow)" opacity=".8"/>`;
  // corona con merli arrotondati
  s+=`<path d="M${X-rT-14} ${T} Q${X} ${T-18} ${X+rT+14} ${T} L${X+rT+18} ${T-30} Q${X} ${T-50} ${X-rT-18} ${T-30}Z" fill="url(#oStone)"/>
  <path d="M${X-rT-14} ${T} Q${X} ${T-18} ${X+rT+14} ${T}" stroke="#000" stroke-opacity=".5" stroke-width="3" fill="none"/>`;
  for(let th=-1.4;th<=1.41;th+=.28){const r=rT+16,x=X+r*Math.sin(th),w=15*Math.cos(th)+2,yy=T-30-10*(1-Math.sin(th)**2);
    s+=`<rect x="${(x-w/2).toFixed(1)}" y="${(yy-24).toFixed(1)}" width="${w.toFixed(1)}" height="26" rx="5" fill="${th>.5?'#5a4b6e':th>0?'#3a3049':'#1d1828'}"/>`;}
  // tetto conico con tegole
  s+=`<path d="M${X-96} 300 Q${X} 284 ${X+96} 300 L${X} 112Z" fill="url(#oRoof)"/><g clip-path="url(#oCone)" stroke="#000" stroke-opacity=".4" fill="none" stroke-width="1.6">`;
  for(let i=1;i<9;i++){const y=300-i*21,r=96*(1-i*21/188);s+=`<path d="${arc(y,r,Math.max(1,8-i))}"/>`;}
  s+=`</g><path d="M${X+96} 300 L${X} 112" stroke="#d07a5a" stroke-opacity=".5" stroke-width="2.5"/>
  <circle class="op-eye" cx="${X+18}" cy="232" r="30" fill="url(#oGlow)"/><path d="M${X+10} 246 L${X+10} 232 A8 8 0 0 1 ${X+26} 232 L${X+26} 246Z" fill="#ffd27a" stroke="#0a0810" stroke-width="2"/>
  <path d="M${X} 112 L${X} 66" stroke="#2a2433" stroke-width="4"/><path class="op-flag" d="M${X+2} 68 L${X+52} 78 L${X+2} 92Z" fill="#ff8a3d"/>`;
  // pipistrelli
  for(const [x,y,d] of [[960,210,7],[1150,300,9],[900,330,8]])s+=`<g class="op-bat" style="animation-duration:${d}s"><path d="M${x} ${y} q8 -10 16 -2 q4 -6 8 0 q4 -6 8 0 q8 -8 16 2 q-12 -2 -16 6 q-4 -4 -8 0 q-4 -4 -8 0 q-4 -8 -16 -6Z" fill="#06050a"/></g>`;
  // primo piano scuro con alberi secchi
  s+=`<path d="M0 900 L0 790 Q120 760 260 800 Q360 820 440 900Z" fill="#050408"/><path d="M1600 900 L1600 800 Q1500 780 1420 820 Q1360 850 1320 900Z" fill="#050408"/>
  <path d="M150 800 L160 690 L128 640 M160 690 L196 650 L214 610 M174 668 L150 620" stroke="#050408" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M1500 812 L1494 720 L1530 676 M1496 744 L1462 700" stroke="#050408" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  $('opScene').innerHTML=s;opPixel();
  let e='';for(let i=0;i<34;i++)e+=`<i style="left:${(Math.random()*100).toFixed(1)}%;--s:${(2+Math.random()*3.5).toFixed(1)}px;--t:${(5+Math.random()*6).toFixed(1)}s;--d:${(Math.random()*8).toFixed(1)}s;--x:${((Math.random()-.5)*160)|0}px"></i>`;
  $('opEmbers').innerHTML=e;
})();
// trasforma la scena vettoriale in pixel art: livelli fermi pre-rasterizzati, parti animate ridisegnate ogni frame, poi posterizzazione con dithering
function opPixel(){
  const svgEl=$('opScene'),cv=$('opCanvas'),cx=cv.getContext('2d');let T0=performance.now();
  const defs=svgEl.querySelector('defs').outerHTML,ser=new XMLSerializer();
  const items=[];let cur=[];const flush=()=>{if(cur.length){items.push({k:'layer',parts:[cur.join('')],T:[0,0]});cur=[];}};
  const bb=el=>{try{return el.getBBox();}catch(e){return {x:0,y:0,width:0,height:0};}};
  const dl=el=>(el.style.animationDelay||'0s').split(',').map(v=>parseFloat(v)||0);
  for(const el of [...svgEl.children]){
    if(el.tagName==='defs')continue;const cls=el.getAttribute('class')||'',h=ser.serializeToString(el);
    if(cls.includes('op-star')){flush();items.push({k:'star',x:+el.getAttribute('cx'),y:+el.getAttribute('cy'),r:+el.getAttribute('r'),d:dl(el)[0]});}
    else if(cls.includes('op-dragon')){flush();const wings=[...el.querySelectorAll('.op-wing')];
      const body=el.cloneNode(true);body.querySelectorAll('.op-wing').forEach(w=>w.remove());
      const fill=el.firstElementChild.getAttribute('fill');
      items.push({k:'dragon',parts:[ser.serializeToString(body),...wings.map(w=>`<g fill="${fill}">${ser.serializeToString(w)}</g>`)],T:[420,320],
        pv:wings.map(w=>{const b=bb(w);return [b.x+b.width/2,b.y+b.height];}),wd:wings.map(w=>parseFloat(w.style.animationDelay)||0)});}
    else if(/op-(cloud|bolt|fog|win|eye|flag|bat)/.test(cls)){flush();const k=cls.match(/op-(cloud|bolt|fog|win|eye|flag|bat)/)[1],b=bb(el);
      items.push({k,parts:[h],T:k==='cloud'?[600,0]:[0,0],b,d:dl(el),dur:parseFloat(el.style.animationDuration)||0});}
    else cur.push(h);}
  flush();svgEl.innerHTML='';
  const head=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="940" viewBox="0 -40 1600 940">${defs}`;
  let pending=0,W=0,H=0,s=1,ox=0,oy=0,img=null,lut=null,bad=false;
  for(const it of items)if(it.parts){it.img=it.parts.map(h=>{const im=new Image();pending++;im.onload=im.onerror=()=>{pending--;if(!pending)size();};
    im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`${head}<g transform="translate(${it.T[0]},${it.T[1]})">${h}</g></svg>`);return im;});}
  function size(){if(pending)return;const px=clamp(innerHeight/230,1.6,4.5);W=Math.ceil(innerWidth/px);H=Math.ceil(innerHeight/px);cv.width=W;cv.height=H;
    s=Math.max(W/1600,H/940);ox=(W-1600*s)/2;oy=(H-940*s)/2;
    for(const it of items)if(it.img)it.cnv=it.img.map(im=>{const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');try{g.drawImage(im,ox,oy,1600*s,940*s);}catch(e){}return c;});}
  addEventListener('resize',()=>{if(!$('opener').hidden)size();});
  // livelli di colore per canale con matrice di Bayer 4x4
  const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],LV=9;lut=new Uint8Array(256*16);
  for(let b=0;b<16;b++)for(let v=0;v<256;v++){const q=Math.floor(Math.sqrt(v/255)*(LV-1)+0.5+((BAY[b]+0.5)/16-0.5)*0.7);lut[b*256+v]=Math.round(Math.pow(Math.min(q,LV-1)/(LV-1),2)*255);}
  // disegna un pezzo pre-rasterizzato con una trasformazione affine nelle coordinate della scena
  const M0x=()=>ox,M0y=()=>oy+40*s;
  function aff(c,T,a,b,cc,d,e,f,al){const mx=M0x(),my=M0y(),qx=mx+s*T[0],qy=my+s*T[1];
    cx.globalAlpha=al==null?1:al;cx.setTransform(a,b,cc,d,mx+s*e-(a*qx+cc*qy),my+s*f-(b*qx+d*qy));cx.drawImage(c,0,0);cx.setTransform(1,0,0,1,0,0);cx.globalAlpha=1;}
  const tri=(x)=>{const m=((x%2)+2)%2;return m<1?m:2-m;},ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
  function boltA(u){const k=((u%1)+1)%1*100;if(k<1)return k;if(k<2)return 1-0.85*(k-1);if(k<3.2)return 0.15+0.85*(k-2)/1.2;if(k<5.5)return 1-(k-3.2)/2.3;return 0;}
  function frame(){if($('opener').hidden)return;requestAnimationFrame(frame);if(!W)return;const tt=(performance.now()-T0)/1000;
    cx.fillStyle='#07060d';cx.fillRect(0,0,W,H);
    for(const it of items){const c=it.cnv;
      if(it.k==='star'){const a=0.15+0.85*(0.5+0.5*Math.cos((tt+it.d)/3*TAU));cx.globalAlpha=a;cx.fillStyle='#f3ead7';const sz=it.r>1.5?2:1;cx.fillRect(Math.round(ox+it.x*s),Math.round(M0y()+it.y*s),sz,sz);cx.globalAlpha=1;continue;}
      if(!c)continue;
      if(it.k==='layer'){cx.drawImage(c[0],0,0);continue;}
      if(it.k==='dragon'){if(tt<1.6)continue;const u=((tt-1.6)%13)/13;if(u>0.62)continue;let dx,dy;
        if(u<0.45){const k=u/0.45;dx=lerp(1850,500,k);dy=lerp(250,140,k);}else{const k=(u-0.45)/0.17;dx=lerp(500,-400,k);dy=lerp(140,200,k);}
        const sx=-0.9,sy=0.9;aff(c[0],it.T,sx,0,0,sy,dx,dy);
        for(let w=0;w<2;w++){const f=lerp(1,-0.55,ease(tri((tt-it.wd[w])/0.5))),pv=it.pv[w];aff(c[w+1],it.T,sx,0,0,sy*f,dx,dy+sy*pv[1]*(1-f));}continue;}
      if(it.k==='cloud'){const u=(((tt-it.d[0])/it.dur)%1+1)%1;aff(c[0],it.T,1,0,0,1,-520+2420*u,0);continue;}
      if(it.k==='bolt'){if(tt<2.3)continue;const a=boltA((tt-2.3)/9);if(a>0)aff(c[0],it.T,1,0,0,1,0,0,a);continue;}
      if(it.k==='fog'){aff(c[0],it.T,1,0,0,1,160*ease(tri(tt/14)),0);continue;}
      if(it.k==='win'){const lit=clamp((tt-it.d[0])/0.5,0,1),fl=tt>it.d[1]?1-0.28*ease(tri((tt-it.d[1])/2)):1;aff(c[0],it.T,1,0,0,1,0,0,0.08+0.92*lit*fl);continue;}
      if(it.k==='eye'){aff(c[0],it.T,1,0,0,1,0,0,1-0.65*ease(tri(tt/1.3)));continue;}
      if(it.k==='flag'){const k=ease(tri(tt/0.6)),sk=Math.tan(-9*Math.PI/180*k),bs=1-0.14*k,px=it.b.x,py=it.b.y+it.b.height/2;
        aff(c[0],it.T,bs,sk*bs,0,1,px-bs*px,-sk*bs*px);continue;}
      if(it.k==='bat'){const u=(tt/it.dur)%1,P4=[[0,0],[70,-30],[0,-55],[-70,-25],[0,0]],i=Math.min(3,Math.floor(u*4)),k=u*4-i;
        aff(c[0],it.T,1,0,0,1,lerp(P4[i][0],P4[i+1][0],k),lerp(P4[i][1],P4[i+1][1],k));continue;}}
    if(!bad){try{const d=cx.getImageData(0,0,W,H),a=d.data;for(let y=0,i=0;y<H;y++){const row=(y&3)*4;for(let x=0;x<W;x++,i+=4){const o=(row+(x&3))*256;a[i]=lut[o+a[i]];a[i+1]=lut[o+a[i+1]];a[i+2]=lut[o+a[i+2]];}}cx.putImageData(d,0,0);}catch(e){bad=true;}}}
  opPixel.restart=()=>requestAnimationFrame(frame);
  opPixel.t0=()=>{T0=performance.now();};
  requestAnimationFrame(frame);
}
let opDone=false,opReady=false,opGo=null,opWait=true;   // opWait: la sigla Flames Games è ancora a schermo
function opSkip(){if(opWait||opReady)return;opReady=true;$('opener').classList.add('skip');}
function opPlay(){if(opWait||opDone)return;if(!opReady){opSkip();return;}opDone=true;$('opener').classList.add('go');if(opGo)opGo();}
$('opener').addEventListener('pointerdown',e=>{if(e.target.closest('#opPlay'))return;e.preventDefault();opSkip();});
$('opPlay').addEventListener('click',()=>{opReady=true;opPlay();});

/* ---------- Salvataggi (solo su questo dispositivo) ---------- */
(function(){try{const V='2026-11-07a',K='torre-resetv';if(localStorage.getItem(K)!==JSON.stringify(V)){const keep=new Set(['torre-auth','torre-pid','torre-mpname','torre-nameok','torre-settings','torre-padkeys','torre-keys']);const del=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('torre-')&&!keep.has(k))del.push(k);}for(const k of del)localStorage.removeItem(k);localStorage.setItem(K,JSON.stringify(V));}}catch(e){}})();
const store={get(k,d){try{const v=localStorage.getItem('torre-'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem('torre-'+k,JSON.stringify(v));}catch(e){}}};
const SETTINGS=Object.assign({master:0.8,music:0.5,sfx:0.8,shake:true,rumble:true,q:'auto',zoom:100,pixel:true,tl:{}},store.get('settings',{}));
/* Sigla Flames Games (src/js/00-flames-games.js): parte all'apertura; la schermata del titolo comincia solo quando lei svanisce */
function opBegin(){opWait=false;document.body.classList.remove('fg-wait');if(opPixel.t0)opPixel.t0();setTimeout(()=>{opReady=true;},3100);}
if(window.FlamesGames&&!/coop-debug/.test(location.hash)){document.body.classList.add('fg-wait');FlamesGames.play({volume:SETTINGS.master*SETTINGS.sfx}).then(opBegin);}else opBegin();
const DEFAULT_KEYS={left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],up:['KeyW','ArrowUp'],down:['KeyS','ArrowDown'],jump:['Space','KeyC'],atk:['KeyJ','KeyX'],dash:['KeyK','ShiftLeft'],ability:['KeyL','KeyQ'],ability2:['KeyI','KeyR'],ability3:['KeyO','KeyF'],use:['KeyE','Enter'],pause:['Escape','KeyP']};
const ACTION_NAMES={left:'Sinistra',right:'Destra',up:'Su (attacchi in alto)',down:'Giù (attacchi in basso)',jump:'Salto',atk:'Attacco',dash:'Scatto',ability:'Abilità',ability2:'Abilità 2',ability3:'Abilità 3',use:'Interagisci',pause:'Pausa'};
function loadKeys(){const k=store.get('keys',null),o={};for(const a in DEFAULT_KEYS)o[a]=(k&&Array.isArray(k[a])&&k[a].length===2)?k[a].slice():DEFAULT_KEYS[a].slice();
  for(const a of ['jump','atk','dash','ability','ability2','use'])o[a]=o[a].map(c=>(o.up.includes(c)||o.down.includes(c))&&!DEFAULT_KEYS[a].includes(c)?DEFAULT_KEYS[a][1]:c);   // W/S ora servono a mirare
  if(o.jump.includes('KeyW'))o.jump=o.jump.map(c=>c==='KeyW'?'KeyC':c);return o;}
let KEYS=loadKeys();
const STATS=Object.assign({runs:0,best:0,kills:0,bosses:0,floors:0,time:0,weapons:0,legend:0,chests:0,wins:0,byClass:{}},store.get('stats',{}));
try{const old=parseInt(localStorage.getItem('torre-infinita-record')||'0',10);if(old>STATS.best)STATS.best=old;}catch(e){}
const PROG=store.get('prog',{});               // livello, esperienza e punti spesi di ogni classe
const prog=id=>{let p=PROG[id];if(!p)p=PROG[id]={lv:1,xp:0};
  if(p.pts==null){p.pts=Math.max(0,p.lv-1);p.alloc={};}if(!p.alloc)p.alloc={};return p;};
const XP_HARD=1.5;   // quanto è più difficile livellare gli eroi (1.5 = serve il 50% di esperienza in più)
const xpNeed=lv=>Math.round((18+lv*12+lv*lv*1.5+lv*lv*lv*0.04)*XP_HARD);   // ogni livello costa sempre di più
const MAX_LV=80, LV_ABIL2=40, LV_ABIL3=70;
// ogni livello dà un punto da spendere su una di queste statistiche
const PSTATS=[
  {id:'hp',  name:'Vita',               txt:n=>'+'+(10*n)},
  {id:'dmg', name:'Danno',              txt:n=>'+'+(4*n)+'%'},
  {id:'spd', name:'Velocità d\'attacco',txt:n=>'+'+(3*n)+'%'},
  {id:'arm', name:'Armatura',           txt:n=>'+'+String(+(1.5*n).toFixed(1)).replace('.',',')+'%'},
  {id:'crit',name:'Critico',            txt:n=>'+'+String(+(1.5*n).toFixed(1)).replace('.',',')+'%'},
  {id:'stam',name:'Stamina',            txt:n=>'+'+(8*n)},
  {id:'move',name:'Velocità',           txt:n=>'+'+(2*n)+'%'},
];
function applyPoint(s,id,n,cls){switch(id){case 'hp':s.maxHp+=10*n;break;case 'dmg':s.lvDmg+=0.04*n;break;case 'spd':s.atkSpd+=0.03*n;break;
  case 'arm':s.armor+=0.015*n;break;case 'crit':s.crit+=0.015*n;break;case 'stam':s.stamMax+=8*n;break;case 'move':s.speed+=cls.speed*0.02*n;break;}}
function saveStats(){store.set('stats',STATS);store.set('prog',PROG);}
function keyLabel(c){if(!c)return '—';const m={Space:'Spazio',Enter:'Invio',Escape:'Esc',ShiftLeft:'Shift',ShiftRight:'Shift dx',ControlLeft:'Ctrl',ControlRight:'Ctrl dx',AltLeft:'Alt',AltRight:'Alt Gr',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Tab:'Tab',Backspace:'Canc',CapsLock:'Bloc Maiusc'};
  if(m[c])return m[c];if(c.startsWith('Key'))return c.slice(3);if(c.startsWith('Digit'))return c.slice(5);if(c.startsWith('Numpad'))return 'Num '+c.slice(6);return c;}
const fmtTime=s=>{s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),ss=s%60;return h?`${h}h ${m}m`:`${m}:${String(ss).padStart(2,'0')}`;};
const pct=v=>Math.round(v*100)+'%';

