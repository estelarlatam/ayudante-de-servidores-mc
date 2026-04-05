/**
 * antiAfk.js — Anti-AFK con micro movimientos físicos
 */
const config = require('../config');
const ri = (a,b) => Math.floor(Math.random()*(b-a+1))+a;

let microInterval = null;
let chatEnabled   = true;

const MESSAGES = [
  'gg','xd',':)','buenas','alguien online?','nice','ok',':D','buen server',
];

module.exports = {
  init(bot) {
    bot.on('message', msg => {
      const t = msg.toString().toLowerCase();
      if (t.includes('missing profile') || t.includes('chat disabled')) chatEnabled = false;
    });

    microInterval = setInterval(() => {
      try {
        bot.setControlState('sneak', true);
        setTimeout(()=>bot.setControlState('sneak',false), 500);
      } catch(_) {}
    }, ri(15000,30000));

    console.log('[AntiAFK] Módulo inicializado');
  },
  stop() {
    clearInterval(microInterval);
    microInterval = null;
  },
};
