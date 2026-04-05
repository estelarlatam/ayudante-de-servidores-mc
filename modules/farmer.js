/**
 * farmer.js — Farmeo automático de recursos
 * Corta árboles, recoge drops, gestiona inventario
 */

const { goals: { GoalNear, GoalBlock } } = require('mineflayer-pathfinder');

const WOOD_BLOCKS = [
  'oak_log','birch_log','spruce_log','jungle_log','acacia_log',
  'dark_oak_log','mangrove_log','cherry_log',
];
const STONE_BLOCKS = ['stone','cobblestone','deepslate'];

let farmInterval  = null;
let active        = false;
let currentTarget = null;

async function findAndMineBlock(bot, blockNames, maxDist = 20) {
  for (const name of blockNames) {
    const block = bot.findBlock({
      matching: bot.registry.blocksByName[name]?.id,
      maxDistance: maxDist,
    });
    if (block) {
      currentTarget = block.position;
      try {
        await bot.pathfinder.goto(new GoalBlock(block.position.x, block.position.y, block.position.z));
        await bot.dig(block);
        currentTarget = null;
        return true;
      } catch(_) { currentTarget = null; }
    }
  }
  return false;
}

module.exports = {
  get active() { return active; },
  get target() { return currentTarget; },

  init(bot) {
    console.log('[Farmer] Módulo inicializado');
  },

  async startFarming(bot) {
    if (active) return;
    active = true;
    console.log('[Farmer] Iniciando farmeo de madera...');

    // Intentar hasta 5 árboles por sesión
    for (let i = 0; i < 5 && active; i++) {
      const found = await findAndMineBlock(bot, WOOD_BLOCKS, 25);
      if (!found) {
        console.log('[Farmer] No hay más madera cerca');
        break;
      }
      await new Promise(r => setTimeout(r, 600));
    }
    active = false;
    console.log('[Farmer] Sesión de farmeo terminada');
  },

  stopFarming() {
    active = false;
    currentTarget = null;
  },

  stop() {
    this.stopFarming();
    clearInterval(farmInterval);
  },
};
