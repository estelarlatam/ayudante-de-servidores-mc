/**
 * modeManager.js — Gestiona los modos de comportamiento del bot
 * Rota entre: FARMING → PATROL → SOCIAL
 * Cada modo dura config.modeDuration ms
 */

const config  = require('../config');
const farmer  = require('./farmer');
const patrol  = require('./patrol');

const MODES = ['FARMING', 'PATROL', 'SOCIAL'];

let currentMode   = 'SOCIAL';
let modeTimer     = null;
let modeIndex     = 0;
let onModeChange  = null; // callback para el panel

module.exports = {
  get mode() { return currentMode; },

  init(bot, alertCallback, modeChangeCallback) {
    onModeChange = modeChangeCallback;
    farmer.init(bot);
    patrol.init(bot);
    this.switchTo(bot, 'SOCIAL', alertCallback);
    this.startRotation(bot, alertCallback);
    console.log('[ModeManager] Rotación de modos iniciada');
  },

  startRotation(bot, alertCallback) {
    modeTimer = setInterval(() => {
      modeIndex = (modeIndex + 1) % MODES.length;
      this.switchTo(bot, MODES[modeIndex], alertCallback);
    }, config.modeDuration);
  },

  switchTo(bot, mode, alertCallback) {
    console.log(`[ModeManager] Cambiando modo: ${currentMode} → ${mode}`);

    // Detener modo anterior
    if (currentMode === 'FARMING') farmer.stopFarming();
    if (currentMode === 'PATROL')  patrol.stopPatrol(bot);

    currentMode = mode;
    if (onModeChange) onModeChange(mode);

    // Iniciar nuevo modo
    switch (mode) {
      case 'FARMING':
        setTimeout(() => farmer.startFarming(bot), 2000);
        break;
      case 'PATROL':
        setTimeout(() => patrol.startPatrol(bot, alertCallback), 2000);
        break;
      case 'SOCIAL':
        // Modo social: el bot camina normalmente (movement.js lo maneja)
        break;
    }
  },

  // Forzar modo desde el panel
  forceMode(bot, mode, alertCallback) {
    clearInterval(modeTimer);
    this.switchTo(bot, mode, alertCallback);
    this.startRotation(bot, alertCallback); // reinicia rotación desde aquí
  },

  stop(bot) {
    clearInterval(modeTimer);
    farmer.stopFarming();
    patrol.stopPatrol(bot);
  },
};
