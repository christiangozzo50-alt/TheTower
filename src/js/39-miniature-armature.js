
/* =========================================================
   MINIATURE DELL'EQUIPAGGIAMENTO: elmo, guanti e corazza si vedono come sono davvero,
   cioè addosso al tuo eroe attuale (con la sua skin e il suo stile), inquadrati sul pezzo.
   Una miniatura per eroe+skin+pezzo+rarità, poi resta in memoria.
   ========================================================= */
const GTH={};
function gearThumbReal(o){const c=G.cls;if(!c||!o||!o.slot)return '';
  const key=`${c.id}|${skinOf(c.id)}|${typeof varOf==='function'?varOf(c.id)||'':''}|${o.slot}|${o.rarity|0}`;if(GTH[key]!=null)return GTH[key];
  let url='';
  try{const R=buildHero(c);poseShop(R,c);gearBuild(R,c,{[o.slot]:{rarity:o.rarity|0,slot:o.slot}});
    R.root.rotation.y=o.slot==='guanti'?0.9:0.55;R.root.updateMatrixWorld(true);
    const parts=(R.gearObjs||[]).filter(g=>g.parent);const box=new THREE.Box3();
    for(const g of o.slot==='guanti'?parts.slice(0,1):parts)box.expandByObject(g);
    if(box.isEmpty())box.setFromObject(R.root);
    const ctr=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3());
    const h=Math.max(sz.y,sz.x*0.95)*(o.slot==='corazza'?1.25:1.55);
    url=psURL(psShot(R.root,80,80,{cx:ctr.x,cy:ctr.y,h:Math.max(0.45,h),dist:7,oy:0.05},false));disposeObj(R.root);}
  catch(e){console.warn('miniatura armatura',e);url='';}
  return GTH[key]=url;}
const _thumbGear=thumb;
thumb=function(o){if(o&&o.slot){const u=gearThumbReal(o);if(u)return u;}return _thumbGear(o);};
