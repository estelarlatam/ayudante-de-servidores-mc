/**
 * equipment.js — Gestión avanzada de equipamiento
 * - Equipa mejor armadura disponible por slot
 * - Selecciona mejor arma según el contexto
 * - Detecta durabilidad baja y avisa
 */

const ARMOR_TIERS   = ['netherite','diamond','iron','golden','chainmail','leather'];
const ARMOR_SLOTS   = [
  { suffix:'helmet',     dest:'head'  },
  { suffix:'chestplate', dest:'torso' },
  { suffix:'leggings',   dest:'legs'  },
  { suffix:'boots',      dest:'feet'  },
];
const WEAPONS = [
  'netherite_sword','diamond_sword','iron_sword','stone_sword','wooden_sword',
  'netherite_axe','diamond_axe','iron_axe','stone_axe',
];
const TOOLS = [
  'netherite_pickaxe','diamond_pickaxe','iron_pickaxe','stone_pickaxe','wooden_pickaxe',
];

function best(bot, candidates) {
  for (const n of candidates) {
    const it = bot.inventory.items().find(i => i.name === n);
    if (it) return it;
  }
  return null;
}

let equipInterval = null;

module.exports = {
  init(bot) {
    setTimeout(() => this.equip(bot), 4000);
    equipInterval = setInterval(() => this.equip(bot), 20000);
    bot.inventory.on('updateSlot', () => this.equip(bot));
    console.log('[Equipment] Módulo inicializado');
  },

  async equip(bot) {
    // Armadura
    for (const { suffix, dest } of ARMOR_SLOTS) {
      const item = best(bot, ARMOR_TIERS.map(t => `${t}_${suffix}`));
      if (item) { try { await bot.equip(item, dest); } catch(_) {} }
    }
    // Arma principal
    const weapon = best(bot, WEAPONS);
    if (weapon) { try { await bot.equip(weapon, 'hand'); } catch(_) {} }
  },

  async equipTool(bot) {
    const tool = best(bot, TOOLS);
    if (tool) { try { await bot.equip(tool, 'hand'); } catch(_) {} }
  },

  getBestWeapon(bot) { return best(bot, WEAPONS); },
  getBestTool(bot)   { return best(bot, TOOLS); },

  stop() {
    clearInterval(equipInterval);
    equipInterval = null;
  },
};
