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
const social      = require('./modules/social');
const modeManager = require('./modules/modeManager');

panel.start(config.expressPort);
panel.setModeManager(modeManager);

function createBot() {
  const bot = mineflayer.createBot({
    host:            config.host,
    port:            config.port,
    username:        config.username,
    version:         config.version,
    auth:            config.auth,
    skipValidation:  true,
    profilesFolder:  false,
    chatLengthLimit: 256,
  });

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);

  bot.once('spawn', () => {
    console.log('[Bot] Spawneado!');
    panel.onConnect(bot);

    const mcData      = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    defaultMove.canDig        = false;
    defaultMove.allowParkour  = true;
    defaultMove.allowSprinting = true;
    bot.pathfinder.setMovements(defaultMove);

    // Inicializar todos los módulos
    equipment.init(bot);
    combat.init(bot);
    movement.init(bot);
    antiAfk.init(bot);
    autoEat.init(bot);
    social.init(bot, panel.addChat);

    // ModeManager: rota entre FARMING, PATROL, SOCIAL
    modeManager.init(bot, panel.addAlert, (mode) => {
      panel.updateMode(mode);
    });

    // Inventario en tiempo real
    panel.updateInventory(bot);
    bot.on('playerCollect', () => panel.updateInventory(bot));
    bot.inventory.on('updateSlot', () => panel.updateInventory(bot));
  });

  // Mensajes del servidor → panel + authme
  bot.on('message', (jsonMsg) => {
    const text = jsonMsg.toString();
    console.log('[Chat]', text);
    panel.addChat(text);
    authHandler.handle(bot, '', text, config);
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    panel.addChat(`<${username}> ${message}`);
  });

  bot.on('health', () => {
    panel.updateHealth(bot, combat);
    combat.onHealthChange(bot);
  });

  bot.on('error', err => console.error('[Bot] Error:', err.message));

  bot.on('end', reason => {
    console.log(`[Bot] Desconectado: ${reason}. Reconectando...`);
    panel.onDisconnect(reason);
    authHandler.reset();
    [antiAfk, combat, movement, autoEat, equipment, social].forEach(m => {
      try { m.stop(); } catch(_) {}
    });
    try { modeManager.stop(bot); } catch(_) {}
    setTimeout(createBot, config.reconnectDelay);
  });

  bot.on('kicked', r => console.warn('[Bot] Expulsado:', r));
}

createBot();
