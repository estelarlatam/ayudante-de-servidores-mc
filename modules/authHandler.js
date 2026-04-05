/**
 * Detecta mensajes de AuthMe y ejecuta /register o /login automáticamente.
 * Compatible con los mensajes más comunes en español e inglés.
 */

let registered = false;

const REGISTER_TRIGGERS = [
  'register', 'registrate', 'regístrate', 'not registered',
  'no estás registrado', 'please register', 'debes registrarte',
];

const LOGIN_TRIGGERS = [
  'login', 'log in', 'iniciar sesión', 'please login',
  'not logged', 'no has iniciado', 'identify yourself',
  'debes iniciar sesión', '/login',
];

function containsAny(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

module.exports = {
  handle(bot, username, message, config) {
    // Solo procesar mensajes del sistema
    if (username && username !== bot.username) return;

    if (!registered && containsAny(message, REGISTER_TRIGGERS)) {
      console.log('[Auth] Detectado mensaje de registro. Registrando...');
      setTimeout(() => {
        bot.chat(`/register ${config.registerPassword} ${config.registerPassword}`);
        registered = true;
      }, 1200);
      return;
    }

    if (containsAny(message, LOGIN_TRIGGERS)) {
      console.log('[Auth] Detectado mensaje de login. Iniciando sesión...');
      setTimeout(() => {
        bot.chat(`/login ${config.loginPassword}`);
      }, 1200);
    }
  },

  reset() {
    registered = false;
  },
};
