module.exports = {
  host: 'estelar_oficial.aternos.me',
  port: 52863,
  username: 'MasterMC',
  version: '1.21.1',
  auth: 'offline',

  // AuthMe
  registerPassword: 'MasterMC_S3guro!',
  loginPassword:    'MasterMC_S3guro!',

  // Panel
  panelPassword: 'estelar2024',

  // Comportamiento
  reconnectDelay:     10000,
  antiAfkInterval:    45000,
  lowHealthThreshold: 8,      // huir si salud <= 8
  criticalHealth:     4,      // comer urgente si <= 4
  hungerThreshold:    16,     // comer si hambre <= 16

  // Modos de comportamiento (rotan automáticamente)
  modeDuration: 5 * 60 * 1000, // 5 min por modo

  expressPort: 3000,
};
