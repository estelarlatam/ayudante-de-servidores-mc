/**
 * patrol.js — Patrullaje de zona y protección del spawn
 * Define puntos de patrulla alrededor de la posición inicial
 * Alerta en el panel cuando detecta jugadores o mobs peligrosos
 */

const { goals: { GoalNear } } = require('mineflayer-pathfinder');

let patrolInterval = null;
let active         = false;
let patrolPoints   = [];
let currentPoint   = 0;
let spawnPos       = null;

function generatePatrolPoints(center, radius = 20) {
  const points = [];
  const count  = 6;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    points.push({
      x: Math.round(center.x + Math.cos(angle) * radius),
      y: center.y,
      z: Math.round(center.z + Math.sin(angle) * radius),
    });
  }
  return points;
}

module.exports = {
  get active()  { return active; },
  get points()  { return patrolPoints; },
  get current() { return currentPoint; },

  init(bot) {
    console.log('[Patrol] Módulo inicializado');
  },

  startPatrol(bot, onAlert) {
    if (active) return;
    active    = true;
    spawnPos  = bot.entity.position.clone();
    patrolPoints = generatePatrolPoints(spawnPos, 18);
    currentPoint = 0;
    console.log('[Patrol] Iniciando patrullaje con', patrolPoints.length, 'puntos');

    patrolInterval = setInterval(async () => {
      if (!active || !bot.entity) return;

      // Detectar jugadores cercanos y alertar
      const nearPlayers = Object.values(bot.entities).filter(e =>
        e.type === 'player' && e !== bot.entity &&
        bot.entity.position.distanceTo(e.position) < 20
      );
      if (nearPlayers.length > 0 && onAlert) {
        onAlert(`👤 Jugador detectado: ${nearPlayers.map(p => p.username).join(', ')}`);
      }

      // Moverse al siguiente punto
      const pt = patrolPoints[currentPoint];
      try {
        bot.pathfinder.setGoal(new GoalNear(pt.x, pt.y, pt.z, 3), true);
        bot.setSprinting(false);
      } catch(_) {}

      // Avanzar al siguiente punto si llegamos cerca
      const dist = bot.entity.position.distanceTo({ x: pt.x, y: pt.y, z: pt.z });
      if (dist < 5) {
        currentPoint = (currentPoint + 1) % patrolPoints.length;
      }
    }, 3000);
  },

  stopPatrol(bot) {
    active = false;
    clearInterval(patrolInterval);
    patrolInterval = null;
    try { bot.pathfinder.stop(); } catch(_) {}
    console.log('[Patrol] Patrullaje detenido');
  },

  // Volver al spawn
  async returnToSpawn(bot) {
    if (!spawnPos) return;
    try {
      await bot.pathfinder.goto(
        new GoalNear(spawnPos.x, spawnPos.y, spawnPos.z, 3)
      );
    } catch(_) {}
  },

  stop() {
    active = false;
    clearInterval(patrolInterval);
    patrolInterval = null;
  },
};
