
/* =========================================================
   ASPETTO DEGLI EROI NUOVI
   ========================================================= */
// ninja: cappuccio stretto e maschera, fascia con piastra, sciarpa e nastri al vento
function ninjaMake(R,K,c){const wrap=K.ds(c.wrap),band=K.m(c.band),bandD=K.ds(c.bandD),steel=K.m(0xb8bec8);
  SP.hood(R,wrap,{r:0.198,depth:0.7,open:1.44,brow:0.34,peak:false,cy:0.025,cz:-0.008,rimT:0.012,cowlR:0.2,cowlY:0.06});SP.lowMask(R,K.m(c.mask));
  M(R.head,G3.hring(0.2,0.022,1.0),band,[0,0.1,-0.005]);M(R.head,G3.rb(0.12,0.05,0.02,0.01),steel,[0,0.1,0.198],{ol:0.008});
  flow2(R,R.head,[0.02,0.1,-0.19],3,0.14,0.05,0.04,bandD,0.4,1.3,0);flow2(R,R.head,[-0.03,0.09,-0.19],3,0.12,0.045,0.035,bandD,0.6,1.1,0);
  SP.strap(R,K.m(c.strap),[[-0.07,0.69],[0.02,0.5],[0.11,0.3]],{w:0.045,th:0.008});
  SP.belt(R,band,null,{t:0.04});flow2(R,R.pelvis,[-0.1,0.03,0.1],2,0.15,0.06,0.05,bandD,0.1,0.8,0);
  SP.bracer(R,K.m(c.bracer),{r0:0.066,r1:0.054,ring:steel});}
SKINS.ninja=[
  {name:'Ninja del clan rosso',desc:'Nero da capo a piedi, fascia e sciarpa rosso sangue: si muove senza far rumore.',
   body:{skin:0xd8b090,shirt:0x16161e,sleeve:0x16161e,fore:0x1e1e28,pants:0x16161e,boot:0x22222c,glove:0x16161e},
   make(R,K){ninjaMake(R,K,{wrap:0x16161e,mask:0x1a1a24,band:0xc0201e,bandD:0x9a1414,strap:0x2a2a36,bracer:0x2e2e3a});}},
  {name:'Ombra della neve',desc:'Bianco e grigio per sparire nelle tormente, nastri azzurri come il ghiaccio.',
   body:{skin:0xe0bc9c,shirt:0xe6e8ee,sleeve:0xe6e8ee,fore:0xcfd3dc,pants:0xd8dbe2,boot:0x9aa0ac,glove:0xcfd3dc},
   make(R,K){ninjaMake(R,K,{wrap:0xe6e8ee,mask:0xcfd3dc,band:0x4a8ad8,bandD:0x3a6ab0,strap:0x9aa0ac,bracer:0xb8bec8});}},
  {name:'Lama del tramonto',desc:'Viola e oro: l\'assassino della corte, che colpisce quando il sole cala.',
   body:{skin:0xc89a78,shirt:0x2a1a3a,sleeve:0x2a1a3a,fore:0x3a2450,pants:0x2a1a3a,boot:0x1a1224,glove:0x3a2450},
   make(R,K){ninjaMake(R,K,{wrap:0x2a1a3a,mask:0x22142e,band:0xe0a830,bandD:0xb07a18,strap:0x3a2450,bracer:0x4a3060});}}
];
