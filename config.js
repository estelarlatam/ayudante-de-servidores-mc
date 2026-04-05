module.exports = {
  host: 'estelar_oficial.aternos.me',
  port: 52863,
  username: 'MasterMC',
  version: '1.21.1',
  auth: 'offline',

  registerPassword: 'MasterMC_S3guro!',
  loginPassword:    'MasterMC_S3guro!',
  panelPassword:    'estelar2024',

  reconnectDelay:     10000,
  antiAfkInterval:    45000,
  lowHealthThreshold: 8,
  criticalHealth:     4,
  hungerThreshold:    16,
  modeDuration:       300000,

  // Railway asigna el puerto via variable de entorno PORT
  // Si no existe, usar 3000
  expressPort: process.env.PORT || 3000,
};
