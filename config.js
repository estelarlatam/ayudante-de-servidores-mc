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
  lowHealthThreshold: 8,
  criticalHealth:     4,
  hungerThreshold:    16,
  modeDuration:       300000,

  // Railway asigna PORT automáticamente — CRÍTICO para que funcione
  expressPort: process.env.PORT || 3000,
};
