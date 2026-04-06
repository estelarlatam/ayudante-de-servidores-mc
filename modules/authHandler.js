/**
 * authHandler.js — Compatible con LoginSecurity y AuthMe
 * LoginSecurity comandos: /register <pass> y /login <pass>
 * Los mensajes varían según el idioma del plugin
 */

let registered = false;
let loginAttempts = 0;

// Mensajes que LoginSecurity envía pidiendo registro
const REGISTER_TRIGGERS = [
  // LoginSecurity español
  'registra', 'registro', 'no estás registrado', 'no estas registrado',
  'debes registrarte', 'usa /register', 'escribe /register',
  'not registered', 'please register', 'register your',
  '/register', 'contraseña para registrar',
  // AuthMe por si acaso
  'you have to register', 'you need to register',
];

// Mensajes que LoginSecurity envía pidiendo login
const LOGIN_TRIGGERS = [
  // LoginSecurity español
  'inicia sesión', 'inicia sesion', 'iniciar sesión',
  'debes iniciar', 'usa /login', 'escribe /login',
  'ya estás registrado', 'ya estas registrado',
  'introduce tu contraseña', 'ingresa tu contraseña',
  'por favor inicia', 'please login', 'please log in',
  'not logged', 'log in to', '/login', 'identify',
  // AuthMe por si acaso
  'you have to login', 'you need to login',
];

// Mensajes que indican login exitoso
const SUCCESS_TRIGGERS = [
  'has iniciado sesión', 'sesión iniciada', 'logged in',
  'successfully logged', 'bienvenido', 'welcome back',
  'inicio de sesión correcto',
];

const has = (text, list) => list.some(k => text.toLowerCase().includes(k));

module.exports = {
  handle(bot, username, message, config) {
    // Solo mensajes del sistema (sin username o del propio bot)
    if (username && username !== bot.username) return;
    if (!message || message.trim() === '') return;

    const text = message.toString();

    // Login exitoso
    if (has(text, SUCCESS_TRIGGERS)) {
      console.log('[Auth] Login exitoso detectado');
      loginAttempts = 0;
      return;
    }

    // Pide registro
    if (!registered && has(text, REGISTER_TRIGGERS)) {
      console.log('[Auth] LoginSecurity pide registro — enviando /register');
      setTimeout(() => {
        try {
          // LoginSecurity: /register <password> (sin confirmación)
          bot.chat(`/register ${config.registerPassword}`);
          registered = true;
          console.log('[Auth] /register enviado');
          // Después de registrar, hacer login automáticamente
          setTimeout(() => {
            try { bot.chat(`/login ${config.loginPassword}`); } catch (_) {}
          }, 1500);
        } catch (_) {}
      }, 1000);
      return;
    }

    // Pide login
    if (has(text, LOGIN_TRIGGERS)) {
      loginAttempts++;
      console.log(`[Auth] LoginSecurity pide login (intento ${loginAttempts})`);
      setTimeout(() => {
        try {
          bot.chat(`/login ${config.loginPassword}`);
          console.log('[Auth] /login enviado');
        } catch (_) {}
      }, 1000);
    }
  },

  reset() {
    registered = false;
    loginAttempts = 0;
    console.log('[Auth] Estado reseteado');
  },
};
