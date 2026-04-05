/**
 * autoEat.js — Comer automáticamente según hambre y salud
 */
const config = require('../config');

const FOOD_PRIORITY = [
  'cooked_beef','cooked_porkchop','cooked_mutton','cooked_chicken',
  'cooked_salmon','cooked_cod','bread','baked_potato',
  'carrot','apple','melon_slice','cookie',
  'beef','porkchop','chicken','salmon','cod',
  'potato','beetroot','dried_kelp',
];

let eatInterval = null;
let eating      = false;

function getBestFood(bot) {
  for (const name of FOOD_PRIORITY) {
    const item = bot.inventory.items().find(i => i.name === name);
    if (item) return item;
  }
  return null;
}

async function tryEat(bot) {
  if (eating) return;
  if (bot.food >= config.hungerThreshold && bot.health > config.criticalHealth) return;
  const food = getBestFood(bot);
  if (!food) return;
  try {
    eating = true;
    await bot.equip(food, 'hand');
    await bot.consume();
    console.log(`[AutoEat] Comió: ${food.name}`);
  } catch(_) {} finally { eating = false; }
}

module.exports = {
  init(bot) {
    eatInterval = setInterval(() => tryEat(bot), 2000);
    bot.on('health', () => { if (bot.food <= 6) tryEat(bot); });
    console.log('[AutoEat] Módulo inicializado');
  },
  stop() {
    clearInterval(eatInterval);
    eatInterval = null;
    eating = false;
  },
};
