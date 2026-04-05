const { goals: { GoalBlock } } = require('mineflayer-pathfinder');
const WOODS=['oak_log','birch_log','spruce_log','jungle_log','acacia_log','dark_oak_log','mangrove_log','cherry_log'];
let active=false,currentTarget=null;

async function mineBlock(bot,names,maxDist=20){
  for(const name of names){
    const id=bot.registry.blocksByName[name]?.id;
    if(!id)continue;
    const block=bot.findBlock({matching:id,maxDistance:maxDist});
    if(block){
      currentTarget=block.position;
      try{
        await bot.pathfinder.goto(new GoalBlock(block.position.x,block.position.y,block.position.z));
        await bot.dig(block);
        currentTarget=null;
        return true;
      }catch(_){currentTarget=null;}
    }
  }
  return false;
}

module.exports = {
  get active(){return active;}, get target(){return currentTarget;},
  init(bot){console.log('[Farmer] Inicializado');},
  async startFarming(bot){
    if(active)return; active=true;
    console.log('[Farmer] Farmeando madera...');
    for(let i=0;i<5&&active;i++){
      const found=await mineBlock(bot,WOODS,25);
      if(!found){console.log('[Farmer] No hay madera');break;}
      await new Promise(r=>setTimeout(r,600));
    }
    active=false;
  },
  stopFarming(){active=false;currentTarget=null;},
  stop(){this.stopFarming();},
};
