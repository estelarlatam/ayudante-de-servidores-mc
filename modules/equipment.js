/**
 * Equipa automáticamente la mejor armadura y arma del inventario.
 */

const ARMOR_PRIORITY = [
  'netherite', 'diamond', 'iron', 'golden', 'chainmail', 'leather',
];

const WEAPON_PRIORITY = [
  'netherite_sword', 'diamond_sword', 'iron_sword', 'stone_sword',
  'wooden_sword', 'netherite_axe', 'diamond_axe', 'iron_axe',
];

const ARMOR_SLOTS = [
  { suffix: 'helmet',     dest: 'head'  },
  { suffix: 'chestplate', dest: 'torso' },
  { suffix: 'leggings',   dest: 'legs'  },
  { suffix: 'boots',      dest: 'feet'  },
];

function getBestItem(bot, candidates) {
  for (const name of candidates) {
    const item = bot.inventory.items().find(i => i.name === name);
    if (item) return item;
  }
  return null;
}

module.exports = {
  init(bot) {
    setTimeout(() => this.equip(bot), 3000);
    setInterval(() => this.equip(bot), 30000);
    console.log('[Equipment] Módulo inicializado');
  },

  async equip(bot) {
    // Armadura por slot
    for (const { suffix, dest } of ARMOR_SLOTS) {
      const candidates = ARMOR_PRIORITY.map(m => `${m}_${suffix}`);
      const best = getBestItem(bot, candidates);
      if (best) {
        try { await bot.equip(best, dest); } catch (_) {}
      }
    }

    // Mejor arma en mano
    const weapon = getBestItem(bot, WEAPON_PRIORITY);
    if (weapon) {
      try { await bot.equip(weapon, 'hand'); } catch (_) {}
    }
  },
};
