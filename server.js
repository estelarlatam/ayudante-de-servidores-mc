/**
 * server.js — Express + Socket.IO
 * Panel web en tiempo real para MasterMC
 */

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');
const config     = require('./config');

const app        = express();
const httpServer = http.createServer(app);
const io         = new Server(httpServer, {
  cors: { origin: '*' }
});

// Estado compartido del bot (actualizado desde index.js)
let botState = {
  connected: false,
  username:  config.username,
  health:    0,
  food:      0,
  position:  { x: 0, y: 0, z: 0 },
  inventory: [],
  chatLog:   [],
  status:    'Desconectado',
};

let botRef = null; // referencia al bot de Mineflayer

// ── Estáticos ─────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Login API ─────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === config.panelPassword) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: 'Contraseña incorrecta' });
  }
});

// ── Socket.IO ─────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('[Panel] Cliente conectado');

  // Enviar estado actual al conectar
  socket.emit('state', botState);

  // Recibir mensaje de chat desde el panel
  socket.on('chat', (msg) => {
    if (!botRef || !botState.connected) return;
    if (typeof msg !== 'string' || msg.trim() === '') return;
    botRef.chat(msg.trim().slice(0, 255));
    addChat('§7[Panel]§f ' + msg.trim());
  });

  socket.on('disconnect', () => {
    console.log('[Panel] Cliente desconectado');
  });
});

// ── Funciones internas ────────────────────────────────────────
function addChat(line) {
  botState.chatLog.unshift({ time: new Date().toLocaleTimeString('es-ES'), text: line });
  if (botState.chatLog.length > 80) botState.chatLog.pop();
  io.emit('chat', botState.chatLog[0]);
}

function pushState() {
  io.emit('state', botState);
}

// ── API para index.js ─────────────────────────────────────────
module.exports = {
  httpServer,
  io,

  setBot(bot) {
    botRef = bot;
  },

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
    botState.health    = 0;
    botState.food      = 0;
    botState.inventory = [];
    pushState();
  },

  updateHealth(bot) {
    botState.health   = bot.health;
    botState.food     = bot.food;
    botState.position = {
      x: Math.round(bot.entity.position.x),
      y: Math.round(bot.entity.position.y),
      z: Math.round(bot.entity.position.z),
    };
    pushState();
  },

  updateInventory(bot) {
    botState.inventory = bot.inventory.items().map(item => ({
      name:  item.name,
      count: item.count,
      slot:  item.slot,
    }));
    pushState();
  },

  addChat,

  start(port) {
    httpServer.listen(port, () => {
      console.log(`[Panel] Servidor web en puerto ${port}`);
    });
  },
};
