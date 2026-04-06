const { goals: { GoalBlock } } = require('mineflayer-pathfinder');
const WOODS = ['oak_log', 'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log'];
let active = false;

module.exports = {
  get active() { return active; },
  init(bot) { console.log('[Farmer] Inicializado'); },

  async startFarming(bot) {
    if (active) return;
    active = true;
    console.log('[Farmer] Farmeando madera...');
    for (let i = 0; i < 5 && active; i++) {
      let found = false;
      for (const name of WOODS) {
        const id = bot.registry.blocksByName[name]?.id;
        if (!id) continue;
        const block = bot.findBlock({ matching: id, maxDistance: 25 });
        if (block) {
          try {
            await bot.pathfinder.goto(new GoalBlock(block.position.x, block.position.y, block.position.z));
            await bot.dig(block);
            found = true;
            await new Promise(r => setTimeout(r, 500));
            break;
          } catch (_) {}
        }
      }
      if (!found) { console.log('[Farmer] Sin madera cerca'); break; }
    }
    active = false;
    console.log('[Farmer] Sesión terminada');
  },

  stopFarming() { active = false; },
  stop() { active = false; },
};
