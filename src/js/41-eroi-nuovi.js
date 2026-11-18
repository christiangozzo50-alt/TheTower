
/* =========================================================
   EROI NUOVI (comportamento): tabelle prese dall'eroe "base", mosse speciali proprie
   ========================================================= */
for(const c of CLASSES){if(!c.base)continue;const b=c.base,id=c.id;
  if(SKINPICK[id]==null)SKINPICK[id]=0;
  for(const T of [ABTHEME,BREST,GEAR_STYLE,SHOP_POSE,SHOWS])if(T&&T[id]==null&&T[b]!=null)T[id]=T[b];
  if(CLS_COL[id]==null)CLS_COL[id]=c.fx||CLS_COL[b]||0x7ff0e4;
  if(typeof CINE_INFO!=='undefined'&&CINE_INFO[id]==null)CINE_INFO[id]=c.wname;}
Object.assign(GEAR_PAL,{ninja:{a:0x1e1e28,b:0x2a2a36,t:0xc0201e}});
// le armature hanno forme diverse per ogni eroe: gli eroi nuovi usano quelle della loro base
const _gbNew=gearBuild;
gearBuild=function(R,cls,gear){if(cls&&cls.base){const base=Object.assign({},cls,{id:cls.base});const P0=GEAR_PAL[cls.base];if(GEAR_PAL[cls.id])GEAR_PAL[cls.base]=GEAR_PAL[cls.id];
    try{return _gbNew(R,base,gear);}finally{GEAR_PAL[cls.base]=P0;}}return _gbNew(R,cls,gear);};

/* ---------- mosse speciali ---------- */
const NEWAB={
  // NINJA
  shuriken(){const f=P.face;P.throwT=0.25;sfx('stab');
    for(let i=0;i<3;i++)later(i*0.06,()=>pProj({x:P.x+f*0.6,y:P.y+1.05+i*0.3,vx:f*25,vy:(i-1)*1.2,w:0.55,h:0.5,dmg:weaponDamage()*0.85,life:0.85,kind:'knife',kb:3,pierce:true,col:0xff4a4a}));},
  fumogeno(){const x=P.x,y=P.y;sfx('dash');P.invul=Math.max(P.invul,1.2);G.ninjaCrit=G.time+3;
    for(let i=0;i<5;i++)burst(x+rand(-1.5,1.5),y+rand(0.3,2),0x8a8a96,14,3,0.6,-0.4);burst(x,y+1,0x3a3a44,30,5,0.5,-0.2);fxRing(x,y+0.06,0,0xb8b8c4,3.4,0.6);
    aoe(x,y+1,3.3,0.3,{stun:1.3,kb:2});spawnGhost(0xff4a4a);},
  sostituzione(){const f=P.face,x0=P.x,y0=P.y;sfx('dash');
    // il tronco lasciato al tuo posto
    const log=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.25,1.3,10),toon(0x7a5432));log.position.set(x0,y0+0.65,0);scene.add(log);burst(x0,y0+1,0xb8b8c4,20,4,1,-0.2);
    setTimeout(()=>{scene.remove(log);disposeObj(log);if(G.scene==='tower')boomAt(x0,y0+1,2.4,weaponDamage()*1.4,null,0xff7a2e);},650);
    const t=foes().filter(e=>(e.x-x0)*f>0&&Math.abs(e.x-x0)<13).sort((a,b)=>Math.abs(a.x-x0)-Math.abs(b.x-x0)).slice(0,6);
    P.invul=Math.max(P.invul,0.4+t.length*0.12);
    t.forEach((e,i)=>later(0.1*i,()=>{if(e.dead)return;spawnGhost(0xff4a4a);P.x=clamp(e.x+f*1.3,G.bounds.left+0.6,rightBound(P)-0.6);P.vx=0;
      hitEnemy(e,weaponDamage()*1.5,f,{crit:true,kb:6,unblockable:true});fxSlash(e.x,e.y+e.h*0.55,0,0xff4a4a,1.5,0,f*0.6,0.25);sfx('stab');}));
    if(!t.length){P.x=clamp(x0+f*6,G.bounds.left+0.6,rightBound(P)-0.6);spawnGhost(0xff4a4a);}}
};
const _doAbNew=doAbility;
doAbility=function(id){if(NEWAB[id])return NEWAB[id]();return _doAbNew(id);};
// fumogeno: per 3 secondi i colpi del ninja sono critici
const _hitNew=hitEnemy;
hitEnemy=function(e,base,dir,o){if(G.cls&&G.cls.id==='ninja'&&(G.ninjaCrit||0)>G.time&&o&&o.melee&&!o.crit)o=Object.assign({},o,{crit:true});return _hitNew(e,base,dir,o);};
