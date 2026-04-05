const TIERS=['netherite','diamond','iron','golden','chainmail','leather'];
const SLOTS=[{suffix:'helmet',dest:'head'},{suffix:'chestplate',dest:'torso'},{suffix:'leggings',dest:'legs'},{suffix:'boots',dest:'feet'}];
const WEAPONS=['netherite_sword','diamond_sword','iron_sword','stone_sword','wooden_sword','netherite_axe','diamond_axe','iron_axe'];
const best=(bot,list)=>{ for(const n of list){const i=bot.inventory.items().find(x=>x.name===n);if(i)return i;} return null;};
let equipInterval=null;

module.exports = {
  init(bot) {
    setTimeout(()=>this.equip(bot),4000);
    equipInterval=setInterval(()=>this.equip(bot),20000);
    bot.inventory.on('updateSlot',()=>this.equip(bot));
    console.log('[Equipment] Inicializado');
  },
  async equip(bot) {
    for(const{suffix,dest}of SLOTS){const it=best(bot,TIERS.map(t=>`${t}_${suffix}`));if(it)try{await bot.equip(it,dest);}catch(_){}}
    const w=best(bot,WEAPONS);if(w)try{await bot.equip(w,'hand');}catch(_){}
  },
  stop(){clearInterval(equipInterval);equipInterval=null;},
};
