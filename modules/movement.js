const { goals: { GoalNear } } = require('mineflayer-pathfinder');
let moveInterval = null, lookInterval = null;
const ri = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const rf = (a,b) => Math.random()*(b-a)+a;

function startMoving(bot) {
  moveInterval = setInterval(async () => {
    if (!bot.entity) return;
    if (bot.pathfinder.isMoving()) return;
    try {
      const p = bot.entity.position;
      bot.pathfinder.setGoal(new GoalNear(p.x+ri(-12,12), p.y, p.z+ri(-12,12), 2), true);
      bot.setSprinting(Math.random()<0.5);
      if (Math.random()<0.2) { bot.setControlState('jump',true); setTimeout(()=>bot.setControlState('jump',false),350); }
    } catch(_) {}
  }, ri(5000,12000));

  lookInterval = setInterval(() => {
    if (!bot.entity) return;
    try { bot.look(rf(-Math.PI,Math.PI), rf(-0.4,0.4), false); } catch(_) {}
  }, ri(2000,5000));
  console.log('[Movement] Activo');
}

module.exports = {
  init(bot) { console.log('[Movement] Esperando...'); setTimeout(()=>startMoving(bot),5000); },
  stop() { clearInterval(moveInterval); clearInterval(lookInterval); moveInterval=lookInterval=null; },
};
