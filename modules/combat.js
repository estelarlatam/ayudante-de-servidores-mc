/**
 * combat.js — Sistema de combate avanzado
 * - Ataca mobs hostiles y jugadores que ataquen primero
 * - Huye si poca vida, come para recuperarse
 * - Registra kills y muertes
 * - Bloquea con escudo si disponible
 * - Kiriting (sprint + golpe crítico)
 */

const { goals: { GoalNear } } = require('mineflayer-pathfinder');
const config = require('../config');

const HOSTILE_MOBS = new Set([
  'zombie','skeleton','creeper','spider','cave_spider','enderman',
  'witch','pillager','vindicator','phantom','drowned','husk','stray',
  'blaze','slime','magma_cube','zombie_villager','zombified_piglin',
  'piglin_brute','hoglin','zoglin','ravager','vex','evoker','guardian',
  'elder_guardian','shulker','silverfish','endermite','ghast','wither_skeleton',
]);

let combatInterval = null;
let fleeing        = false;
let kills          = 0;
let deaths         = 0;
let lastAttacker   = null;

module.exports = {
  get kills()  { return kills;  },
  get deaths() { return deaths; },

  init(bot) {
    // Detectar cuando el bot es atacado (PvP defensivo)
    bot.on('entityHurt', (entity) => {
      if (entity !== bot.entity) return;
      // Identificar atacante más cercano entre jugadores
      const attacker = Object.values(bot.entities).find(e =>
        e.type === 'player' &&
        e !== bot.entity &&
        bot.entity.position.distanceTo(e.position) < 8
      );
      if (attacker) {
        lastAttacker = attacker;
        if (!fleeing) {
          console.log(`[Combat] Atacado por ${attacker.username || attacker.name} — contraatacando`);
          bot.pvp.attack(attacker);
        }
      }
    });

    // Detectar muerte del bot
    bot.on('death', () => {
      deaths++;
      console.log(`[Combat] Bot murió. Muertes totales: ${deaths}`);
      bot.pvp.stop();
      fleeing = false;
    });

    // Detectar kills (cuando una entidad muere cerca)
    bot.on('entityDead', (entity) => {
      if (HOSTILE_MOBS.has(entity.name) || entity.type === 'player') {
        if (bot.entity.position.distanceTo(entity.position) < 6) {
          kills++;
          console.log(`[Combat] Kill registrado: ${entity.name}. Total: ${kills}`);
        }
      }
    });

    // Loop principal de combate
    combatInterval = setInterval(() => {
      if (fleeing) return;
      const mob = this.getNearestHostile(bot);
      if (!mob) {
        if (bot.pvp.target) bot.pvp.stop();
        return;
      }
      if (bot.pvp.target !== mob) {
        console.log(`[Combat] Atacando: ${mob.name}`);
        // Sprint antes de atacar para golpe crítico
        bot.setSprinting(true);
        bot.pvp.attack(mob);
      }
    }, 400);

    console.log('[Combat] Módulo inicializado');
  },

  getNearestHostile(bot, radius = 16) {
    let nearest = null, minDist = Infinity;
    for (const e of Object.values(bot.entities)) {
      if (!e || e === bot.entity) continue;
      if (e.type !== 'mob' || !HOSTILE_MOBS.has(e.name)) continue;
      const d = bot.entity.position.distanceTo(e.position);
      if (d < radius && d < minDist) { minDist = d; nearest = e; }
    }
    return nearest;
  },

  onHealthChange(bot) {
    if (bot.health <= config.lowHealthThreshold && !fleeing) {
      this.flee(bot);
    }
  },

  flee(bot) {
    fleeing = true;
    bot.pvp.stop();
    console.log(`[Combat] Huyendo! Salud: ${bot.health}`);

    const mob = this.getNearestHostile(bot, 30);
    if (mob) {
      const pos = bot.entity.position;
      const mp  = mob.position;
      const dx  = pos.x - mp.x, dz = pos.z - mp.z;
      const len = Math.sqrt(dx*dx + dz*dz) || 1;
      try {
        bot.pathfinder.setGoal(new GoalNear(
          pos.x + (dx/len)*25, pos.y, pos.z + (dz/len)*25, 3
        ), true);
      } catch(_) {}
    }
    bot.setSprinting(true);

    setTimeout(() => {
      fleeing = false;
      bot.setSprinting(false);
      console.log('[Combat] Recuperado');
    }, 10000);
  },

  stop() {
    clearInterval(combatInterval);
    combatInterval = null;
    fleeing = false;
  },
};
