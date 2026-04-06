/**
 * server.js — Panel web con Express + Socket.IO
 * CLAVE: escuchar en 0.0.0.0 para que Railway pueda alcanzarlo
 */
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');
const config     = require('./config');

const app        = express();
const httpServer = http.createServer(app);
const io         = new Server(httpServer, { cors: { origin: '*' } });

let botState = {
  connected: false, username: config.username,
  health: 0, food: 0, position: { x: 0, y: 0, z: 0 },
  inventory: [], chatLog: [], alerts: [],
  kills: 0, deaths: 0, mode: 'SOCIAL',
  posHistory: [], status: 'Desconectado',
};

let botRef         = null;
let modeManagerRef = null;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz — igual al v2, para UptimeRobot
app.get('/ping', (_, res) => res.send('MasterMC está vivo ✅'));

// Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  res.json(password === config.panelPassword ? { ok: true } : { ok: false });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('[Panel] Cliente conectado');
  socket.emit('state', botState);

  socket.on('chat', (msg) => {
    if (!botRef || !botState.connected || typeof msg !== 'string' || !msg.trim()) return;
    try { botRef.chat(msg.trim().slice(0, 255)); } catch (_) {}
    addChat(`[Panel] ${msg.trim()}`);
  });

  socket.on('setMode', (mode) => {
    if (!modeManagerRef || !botRef || !['FARMING', 'PATROL', 'SOCIAL'].includes(mode)) return;
    modeManagerRef.forceMode(botRef, mode, addAlert);
  });

  socket.on('moveTo', ({ x, y, z }) => {
    if (!botRef || !botState.connected) return;
    try {
      const { GoalNear } = require('mineflayer-pathfinder').goals;
      botRef.pathfinder.setGoal(new GoalNear(x, y, z, 2), true);
      addChat(`[Panel] Moviendo a X:${x} Y:${y} Z:${z}`);
    } catch (e) { console.error('[moveTo]', e.message); }
  });

  socket.on('command', (cmd) => {
    if (!botRef || !botState.connected || typeof cmd !== 'string' || !cmd.trim()) return;
    try { botRef.chat(cmd.trim()); } catch (_) {}
    addChat(`[CMD] ${cmd.trim()}`);
  });

  socket.on('disconnect', () => console.log('[Panel] Cliente desconectado'));
});

function addChat(line) {
  const entry = { time: new Date().toLocaleTimeString('es-ES'), text: String(line) };
  botState.chatLog.unshift(entry);
  if (botState.chatLog.length > 100) botState.chatLog.pop();
  io.emit('chat', entry);
}

function addAlert(msg) {
  const entry = { time: new Date().toLocaleTimeString('es-ES'), text: String(msg) };
  botState.alerts.unshift(entry);
  if (botState.alerts.length > 30) botState.alerts.pop();
  io.emit('alert', entry);
  console.log('[Alerta]', msg);
}

function pushState() { io.emit('state', botState); }

module.exports = {
  setModeManager(mm) { modeManagerRef = mm; },

  onConnect(bot) {
    botRef = bot;
    botState.connected = true;
    botState.status    = 'Conectado';
    botState.username  = bot.username;
    pushState();
  },

  onDisconnect(reason) {
    botRef = null;
    botState.connected = false;
    botState.status    = `Reconectando... (${reason})`;
    botState.health = 0; botState.food = 0; botState.inventory = [];
    pushState();
  },

  updateHealth(bot, combat) {
    botState.health  = bot.health;
    botState.food    = bot.food;
    botState.kills   = combat?.kills  ?? botState.kills;
    botState.deaths  = combat?.deaths ?? botState.deaths;
    const pos = {
      x: Math.round(bot.entity.position.x),
      y: Math.round(bot.entity.position.y),
      z: Math.round(bot.entity.position.z),
    };
    botState.position = pos;
    botState.posHistory.push({ ...pos, t: Date.now() });
    if (botState.posHistory.length > 200) botState.posHistory.shift();
    pushState();
  },

  updateInventory(bot) {
    botState.inventory = bot.inventory.items().map(i => ({
      name: i.name, count: i.count, slot: i.slot,
    }));
    pushState();
  },

  updateMode(mode) { botState.mode = mode; pushState(); },
  addChat,
  addAlert,

  // CRÍTICO: 0.0.0.0 para que Railway lo exponga
  start(port) {
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`[Panel] Corriendo en puerto ${port}`);
    });
  },
};
