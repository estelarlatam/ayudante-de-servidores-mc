/**
 * Combate: detecta mobs hostiles cercanos, los ataca,
 * huye si tiene poca vida.
 */

const { goals } = require('mineflayer-pathfinder');
const { GoalNear } = goals;
const config = require('../config');

const HOSTILE_MOBS = new Set([
  'zombie', 'skeleton', 'creeper', 'spider', 'cave_spider',
  'enderman', 'witch', 'pillager', 'vindicator', 'phantom',
  'drowned', 'husk', 'stray', 'blaze', 'slime', 'magma_cube',
]);

let combatInterval = null;
let fleeing        = false;

function getNearestHostile(bot, radius = 16) {
  let nearest = null;
  let minDist = Infinity;

  for (const entity of Object.values(bot.entities)) {
    if (!entity || entity === bot.entity) continue;
    if (entity.type !== 'mob') continue;
    if (!HOSTILE_MOBS.has(entity.name)) continue;

    const dist = bot.entity.position.distanceTo(entity.position);
    if (dist < radius && dist < minDist) {
      minDist = dist;
      nearest = entity;
    }
  }
  return nearest;
}

module.exports = {
  init(bot) {
    combatInterval = setInterval(() => {
      if (fleeing) return;

      const mob = getNearestHostile(bot);
      if (!mob) {
        if (bot.pvp.target) bot.pvp.stop();
        return;
      }

      if (bot.pvp.target !== mob) {
        console.log(`[Combat] Atacando: ${mob.name}`);
        bot.pvp.attack(mob);
      }
    }, 500);

    console.log('[Combat] Módulo inicializado');
  },

  onHealthChange(bot) {
    if (bot.health <= config.lowHealthThreshold && !fleeing) {
      this.flee(bot);
    }
  },

  flee(bot) {
    fleeing = true;
    console.log('[Combat] Poca vida — huyendo...');
    bot.pvp.stop();

    const mob = getNearestHostile(bot, 30);
    if (mob) {
      const pos    = bot.entity.position;
      const mobPos = mob.position;
      const dx     = pos.x - mobPos.x;
      const dz     = pos.z - mobPos.z;
      const len    = Math.sqrt(dx * dx + dz * dz) || 1;
      const fleeGoal = new GoalNear(
        pos.x + (dx / len) * 20,
        pos.y,
        pos.z + (dz / len) * 20,
        3
      );
      bot.pathfinder.setGoal(fleeGoal, true);
    }

    setTimeout(() => {
      fleeing = false;
      console.log('[Combat] Recuperado, volviendo al estado normal');
    }, 8000);
  },

  stop() {
    clearInterval(combatInterval);
    combatInterval = null;
    fleeing = false;
  },
};
