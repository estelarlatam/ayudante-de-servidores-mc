const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const pvp        = require('mineflayer-pvp').plugin;
const autoEat    = require('mineflayer-auto-eat').plugin;
const express    = require('express');
const config     = require('./config');
const movement   = require('./modules/movement');
const combat     = require('./modules/combat');
const equipment  = require('./modules/equipment');
const antiAfk    = require('./modules/antiAfk');
const authHandler= require('./modules/authHandler');

// ── Express keep-alive para UptimeRobot ─────────────────────────
const app = express();
app.get('/', (_, res) => res.send('MasterMC está vivo ✅'));
app.listen(config.expressPort, () =>
  console.log(`[Express] Escuchando en puerto ${config.expressPort}`)
);

// ── Función principal ────────────────────────────────────────────
function createBot() {
  const bot = mineflayer.createBot({
    host:     config.host,
    port:     config.port,
    username: config.username,
    version:  config.version,
    auth:     config.auth,
  });

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);
  bot.loadPlugin(autoEat);

  bot.once('spawn', () => {
    console.log('[Bot] Spawneado en el servidor');
    const mcData      = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    defaultMove.canDig = false;
    bot.pathfinder.setMovements(defaultMove);

    equipment.init(bot);
    combat.init(bot);
    movement.init(bot);
    antiAfk.init(bot);

    bot.autoEat.options.priority   = 'foodPoints';
    bot.autoEat.options.startAt    = config.hungerThreshold;
    bot.autoEat.options.bannedFood = [];
  });

  bot.on('chat', (username, message) => {
    authHandler.handle(bot, username, message, config);
  });

  bot.on('health', () => {
    combat.onHealthChange(bot);
  });

  bot.on('error', err => {
    console.error('[Bot] Error:', err.message);
  });

  bot.on('end', reason => {
    console.log(`[Bot] Desconectado (${reason}). Reconectando en ${config.reconnectDelay / 1000}s...`);
    antiAfk.stop();
    combat.stop();
    movement.stop();
    setTimeout(createBot, config.reconnectDelay);
  });

  bot.on('kicked', reason => {
    console.warn('[Bot] Expulsado:', reason);
  });
}

createBot();
