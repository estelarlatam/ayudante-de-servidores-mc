/**
 * Movimiento ultra-realista: caminata, sprint, saltos, mirar alrededor,
 * exploración aleatoria con pathfinder.
 */

const { goals } = require('mineflayer-pathfinder');
const { GoalNear } = goals;

let moveInterval = null;
let lookInterval = null;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randomNearbyGoal(bot, radius = 20) {
  const pos = bot.entity.position;
  const dx  = randomInt(-radius, radius);
  const dz  = randomInt(-radius, radius);
  return new GoalNear(pos.x + dx, pos.y, pos.z + dz, 2);
}

module.exports = {
  init(bot) {
    moveInterval = setInterval(async () => {
      if (bot.pathfinder.isMoving()) return;
      if (bot.food < 6) return;

      try {
        const goal = randomNearbyGoal(bot, 15);
        bot.pathfinder.setGoal(goal, true);

        bot.setSprinting(Math.random() < 0.6);

        if (Math.random() < 0.2) {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 400);
        }
      } catch (_) {}
    }, randomInt(8000, 20000));

    lookInterval = setInterval(() => {
      const yaw   = randomFloat(-Math.PI, Math.PI);
      const pitch = randomFloat(-0.5, 0.5);
      bot.look(yaw, pitch, false);
    }, randomInt(3000, 8000));

    console.log('[Movement] Módulo inicializado');
  },

  stop() {
    clearInterval(moveInterval);
    clearInterval(lookInterval);
    moveInterval = null;
    lookInterval = null;
  },
};
