const { goals: { GoalNear } } = require('mineflayer-pathfinder');
const config = require('../config');

const HOSTILE = new Set([
  'zombie', 'skeleton', 'creeper', 'spider', 'cave_spider', 'enderman',
  'witch', 'pillager', 'vindicator', 'phantom', 'drowned', 'husk', 'stray',
  'blaze', 'slime', 'magma_cube', 'zombie_villager', 'zombified_piglin',
  'hoglin', 'ravager', 'vex', 'evoker', 'guardian', 'wither_skeleton',
]);

let combatInterval = null, fleeing = false, kills = 0, deaths = 0;

function nearest(bot, r = 16) {
  let best = null, min = Infinity;
  for (const e of Object.values(bot.entities)) {
    if (!e || e === bot.entity || e.type !== 'mob' || !HOSTILE.has(e.name)) continue;
    const d = bot.entity.position.distanceTo(e.position);
    if (d < r && d < min) { min = d; best = e; }
  }
  return best;
}

module.exports = {
  get kills()  { return kills; },
  get deaths() { return deaths; },

  init(bot) {
    // PvP defensivo — contraatacar al jugador que te golpeó
    bot.on('entityHurt', (entity) => {
      if (entity !== bot.entity) return;
      const attacker = Object.values(bot.entities).find(e =>
        e.type === 'player' && e !== bot.entity &&
        bot.entity.position.distanceTo(e.position) < 8
      );
      if (attacker && !fleeing) {
        console.log(`[Combat] Contraatacando a ${attacker.username}`);
        bot.pvp.attack(attacker);
      }
    });

    bot.on('death', () => {
      deaths++;
      bot.pvp.stop();
      fleeing = false;
      console.log(`[Combat] Muerte #${deaths}`);
    });

    bot.on('entityDead', (e) => {
      if ((HOSTILE.has(e.name) || e.type === 'player') &&
          bot.entity.position.distanceTo(e.position) < 6) {
        kills++;
      }
    });

    combatInterval = setInterval(() => {
      if (fleeing) return;
      const mob = nearest(bot);
      if (!mob) { if (bot.pvp.target) bot.pvp.stop(); return; }
      if (bot.pvp.target !== mob) { bot.setSprinting(true); bot.pvp.attack(mob); }
    }, 400);

    console.log('[Combat] Inicializado');
  },

  onHealthChange(bot) {
    if (bot.health <= config.lowHealthThreshold && !fleeing) this.flee(bot);
  },

  flee(bot) {
    fleeing = true;
    bot.pvp.stop();
    bot.setSprinting(true);
    console.log(`[Combat] Huyendo! HP:${bot.health}`);
    const mob = nearest(bot, 30);
    if (mob) {
      const p = bot.entity.position, mp = mob.position;
      const dx = p.x - mp.x, dz = p.z - mp.z;
      const len = Math.sqrt(dx * dx + dz * dz) || 1;
      try {
        bot.pathfinder.setGoal(new GoalNear(
          p.x + (dx / len) * 25, p.y, p.z + (dz / len) * 25, 3
        ), true);
      } catch (_) {}
    }
    setTimeout(() => { fleeing = false; bot.setSprinting(false); console.log('[Combat] Recuperado'); }, 10000);
  },

  stop() { clearInterval(combatInterval); combatInterval = null; fleeing = false; },
};
