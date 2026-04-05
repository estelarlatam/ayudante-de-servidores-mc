/**
 * social.js — Comportamiento social realista
 * Responde a jugadores, saluda, hace comandos básicos del servidor
 * Simula conversaciones naturales
 */

const GREETINGS    = ['hola','hi','hello','hey','buenas','saludos','ola'];
const GREET_REPLY  = ['hola!','hey!','buenas!','qué tal?','saludos!','holi'];
const GG_WORDS     = ['gg','buena','nice','bien hecho','wow'];
const GG_REPLY     = ['gg!','nice!','buena jugada','wp','genial!'];
const QUESTION_TRIGGERS = ['cómo estás','como estas','qué tal','que tal'];
const QUESTION_REPLY    = [
  'bien gracias!', 'todo bien por aquí :)',
  'aquí explorando', 'bien, farmeando un rato',
  'tranquilo, disfrutando el server',
];

const RANDOM_PHRASES = [
  'este server está genial', 'alguien quiere hacer equipo?',
  'qué día más tranquilo', ':)', 'buenas noches a todos',
  'voy a explorar un rato', 'hay algún warp interesante?',
  'me encanta este servidor', 'alguien online?', 'buen server',
];

let socialInterval = null;
let lastSpeakTime  = 0;
const SPEAK_COOLDOWN = 30000; // 30s entre mensajes propios

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function containsAny(text, words) {
  const l = text.toLowerCase();
  return words.some(w => l.includes(w));
}

module.exports = {
  init(bot, addChat) {
    // Responder a jugadores en el chat
    bot.on('chat', (username, message) => {
      if (username === bot.username) return;
      if (!message) return;

      const msg = message.toLowerCase();
      const now = Date.now();
      if (now - lastSpeakTime < 3000) return; // no responder demasiado rápido

      setTimeout(() => {
        try {
          if (containsAny(msg, GREETINGS)) {
            bot.chat(`${randomItem(GREET_REPLY)} ${username}!`);
            lastSpeakTime = Date.now();
          } else if (containsAny(msg, GG_WORDS)) {
            bot.chat(randomItem(GG_REPLY));
            lastSpeakTime = Date.now();
          } else if (containsAny(msg, QUESTION_TRIGGERS)) {
            bot.chat(randomItem(QUESTION_REPLY));
            lastSpeakTime = Date.now();
          } else if (msg.includes('mastermc') || msg.includes('bot')) {
            // Alguien le habló directamente
            bot.chat(`sí? aquí estoy ${username} :)`);
            lastSpeakTime = Date.now();
          }
        } catch(_) {}
      }, 1200 + Math.random() * 1500);
    });

    // Frases aleatorias periódicas
    socialInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastSpeakTime < SPEAK_COOLDOWN) return;
      if (Math.random() < 0.25) {
        try {
          bot.chat(randomItem(RANDOM_PHRASES));
          lastSpeakTime = now;
        } catch(_) {}
      }
    }, 60000 + Math.random() * 60000);

    console.log('[Social] Módulo inicializado');
  },

  stop() {
    clearInterval(socialInterval);
    socialInterval = null;
  },
};
