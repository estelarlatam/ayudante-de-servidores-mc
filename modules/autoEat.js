const config=require('../config');
const FOODS=['cooked_beef','cooked_porkchop','cooked_mutton','cooked_chicken','cooked_salmon','cooked_cod','bread','baked_potato','carrot','apple','melon_slice','beef','porkchop','chicken','salmon','cod','potato','beetroot','dried_kelp'];
let eatInterval=null,eating=false;
const getFood=bot=>{ for(const n of FOODS){const i=bot.inventory.items().find(x=>x.name===n);if(i)return i;} return null;};

module.exports = {
  init(bot) {
    eatInterval=setInterval(async()=>{
      if(eating||bot.food>=config.hungerThreshold&&bot.health>config.criticalHealth)return;
      const f=getFood(bot);if(!f)return;
      try{eating=true;await bot.equip(f,'hand');await bot.consume();console.log(`[AutoEat] ${f.name}`);}catch(_){}finally{eating=false;}
    },2000);
    bot.on('health',()=>{if(bot.food<=6){const f=getFood(bot);if(f&&!eating)bot.equip(f,'hand').then(()=>bot.consume()).catch(()=>{});}});
    console.log('[AutoEat] Inicializado');
  },
  stop(){clearInterval(eatInterval);eatInterval=null;eating=false;},
};
