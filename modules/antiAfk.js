/**
 * Anti-AFK: mensajes de chat aleatorios + micro-movimientos
 * para evitar expulsión por inactividad.
 */

const config = require('../config');

const MESSAGES = [
  'gg', 'xd', 'jaja', 'hola', ':)', 'buenas',
  'qué tal todos?', 'buen server', 'alguien online?',
  'voy a minar un rato', 'linda noche en el server',
  'esto está tranquilo hoy', 'saludos desde spawn',
  'alguien quiere hacer equipo?', 'nice', 'ok',
];

let msgInterval   = null;
let microInterval = null;

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  init(bot) {
    msgInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        bot.chat(randomItem(MESSAGES));
      }
    }, config.antiAfkInterval + randomInt(-10000, 10000));

    microInterval = setInterval(() => {
      bot.setControlState('sneak', true);
      setTimeout(() => bot.setControlState('sneak', false), 600);
    }, randomInt(20000, 40000));

    console.log('[AntiAFK] Módulo inicializado');
  },

  stop() {
    clearInterval(msgInterval);
    clearInterval(microInterval);
    msgInterval   = null;
    microInterval = null;
  },
};
