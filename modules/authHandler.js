let registered = false;
const REGISTER_TRIGGERS = ['register','registrate','regístrate','not registered','no estás registrado','please register','debes registrarte'];
const LOGIN_TRIGGERS    = ['login','log in','iniciar sesión','please login','not logged','no has iniciado','identify yourself','debes iniciar','escribe /login'];
const has = (text, kws) => kws.some(k => text.toLowerCase().includes(k));

module.exports = {
  handle(bot, username, message, config) {
    if (username && username !== bot.username) return;
    if (!registered && has(message, REGISTER_TRIGGERS)) {
      console.log('[Auth] Registrando...');
      setTimeout(() => { bot.chat(`/register ${config.registerPassword} ${config.registerPassword}`); registered = true; }, 1200);
      return;
    }
    if (has(message, LOGIN_TRIGGERS)) {
      console.log('[Auth] Login...');
      setTimeout(() => bot.chat(`/login ${config.loginPassword}`), 1200);
    }
  },
  reset() { registered = false; },
};
