# MasterMC Bot 🤖

Bot 24/7 ultra-realista para el servidor PaperMC 1.21.1 `estelar_oficial.aternos.me:52863`.

## Características

- ✅ Auto-registro y login con AuthMe
- ✅ Movimiento realista (caminar, sprint, saltar, explorar)
- ✅ Combate automático contra mobs hostiles
- ✅ Huida y recuperación con poca vida
- ✅ Auto-eat con mineflayer-auto-eat
- ✅ Equipamiento automático (mejor armadura y arma)
- ✅ Anti-AFK con mensajes y micro-movimientos
- ✅ Reconexión automática
- ✅ Servidor Express para UptimeRobot

## Instalación

```bash
git clone <tu-repo>
cd mastermc-bot
npm install
```

## Configuración

Edita `config.js` y ajusta:
- `username`: nombre del bot en el servidor
- `registerPassword` / `loginPassword`: contraseña para AuthMe

## Ejecución local

```bash
node index.js
```

## Deploy 24/7 (Railway / Render)

1. Sube el repositorio a GitHub
2. Conéctalo a Railway o Render (plan gratuito funciona)
3. En Railway: Start Command → `node index.js`
4. Configura UptimeRobot para hacer ping cada 5 minutos

## UptimeRobot

Crea un monitor tipo HTTP(s) apuntando a:

```
http://TU-APP-URL:3000/
```

Intervalo recomendado: cada 5 minutos.

## Estructura

```
mastermc-bot/
├── index.js              ← Punto de entrada principal
├── config.js             ← Toda la configuración aquí
├── package.json
├── .env.example
├── .gitignore
└── modules/
    ├── authHandler.js    ← /register y /login automáticos
    ├── movement.js       ← Movimiento realista
    ├── combat.js         ← Ataque a mobs hostiles
    ├── equipment.js      ← Equipamiento automático
    └── antiAfk.js        ← Anti-AFK
```
