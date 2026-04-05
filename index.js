const mineflayer  = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const pvp         = require('mineflayer-pvp').plugin;
const config      = require('./config');
const panel       = require('./server');
const movement    = require('./modules/movement');
const combat      = require('./modules/combat');
const equipment   = require('./modules/equipment');
const antiAfk     = require('./modules/antiAfk');
const authHandler = require('./modules/authHandler');
const autoEat     = require('./modules/autoEat');

// Iniciar servidor web
panel.start(config.expressPort);

// ── Función principal ─────────────────────────────────────────
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

  bot.once('spawn', () => {
    console.log('[Bot] Spawneado en el servidor');
    panel.onConnect(bot);

    const mcData      = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    defaultMove.canDig = false;
    bot.pathfinder.setMovements(defaultMove);

    equipment.init(bot);
    combat.init(bot);
    movement.init(bot);
    antiAfk.init(bot);
    autoEat.init(bot);

    // Actualizar inventario al inicio y al cambiar
    panel.updateInventory(bot);
    bot.on('playerCollect', () => panel.updateInventory(bot));
    bot.inventory.on('updateSlot', () => panel.updateInventory(bot));
  });

  // Chat del servidor → panel
  bot.on('message', (jsonMsg) => {
    const text = jsonMsg.toString();
    panel.addChat(text);
    // También procesar authme
    authHandler.handle(bot, '', text, config);
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    panel.addChat(`<${username}> ${message}`);
  });

  bot.on('health', () => {
    panel.updateHealth(bot);
    combat.onHealthChange(bot);
  });

  bot.on('error', err => {
    console.error('[Bot] Error:', err.message);
  });

  bot.on('end', reason => {
    console.log(`[Bot] Desconectado (${reason}). Reconectando en ${config.reconnectDelay / 1000}s...`);
    panel.onDisconnect(reason);
    antiAfk.stop();
    combat.stop();
    movement.stop();
    autoEat.stop();
    setTimeout(createBot, config.reconnectDelay);
  });

  bot.on('kicked', reason => {
    console.warn('[Bot] Expulsado:', reason);
  });
}

createBot();
