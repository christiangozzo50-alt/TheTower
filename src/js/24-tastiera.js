
/* =========================================================
   TASTIERA DEL TELEFONO nei moduli (nome, account, amici, chat)
   - toccando un campo la tastiera si apre sempre (focus dentro il tocco, come vuole iPhone)
   - mentre scrivi i tasti non arrivano al gioco
   - con la tastiera aperta il modulo si stringe nella parte visibile dello schermo, così vedi cosa scrivi
   ========================================================= */
const isTextEl=el=>!!el&&(el.tagName==='TEXTAREA'||(el.tagName==='INPUT'&&!/^(range|checkbox|radio|button|submit)$/.test(el.type)));
addEventListener('touchend',e=>{const t=e.target;if(isTextEl(t)&&document.activeElement!==t){try{t.focus({preventScroll:true});}catch(_){t.focus();}}},{passive:true,capture:true});
const KB={on:false};
function kbFit(){const vv=window.visualViewport,f=document.activeElement,on=isTextEl(f)&&!!vv&&vv.height<innerHeight-80;
  const ov=[...document.querySelectorAll('#account,#nameGate,#friends,#coop')].filter(o=>!o.hidden);
  document.body.classList.toggle('kb-open',on);
  for(const o of ov){if(on){o.style.top=vv.offsetTop+'px';o.style.height=vv.height+'px';o.style.bottom='auto';}else{o.style.top='';o.style.height='';o.style.bottom='';}}
  if(on&&!KB.on)setTimeout(()=>{try{f.scrollIntoView({block:'center'});}catch(_){}} ,60);
  KB.on=on;}
if(window.visualViewport){visualViewport.addEventListener('resize',kbFit);visualViewport.addEventListener('scroll',kbFit);}
addEventListener('focusin',()=>setTimeout(kbFit,350));addEventListener('focusout',()=>setTimeout(kbFit,120));
{const st=document.createElement('style');st.textContent=`
body.kb-open #account .ig-lead,body.kb-open #nameGate .ig-lead,body.kb-open #nameGate .ig-ico{display:none}
body.kb-open #account,body.kb-open #nameGate{padding:8px 16px;align-items:start}
body.kb-open #account .ig-box,body.kb-open #nameGate .ig-box{gap:6px}
#ngIn,#acUser,#acPass,#frQ,#coopName,#coopCode,#scIn{-webkit-user-select:text!important;user-select:text!important;touch-action:manipulation}`;document.head.appendChild(st);}
