const { goals: { GoalNear } } = require('mineflayer-pathfinder');
let patrolInterval=null,active=false,points=[],idx=0,spawnPos=null;

function genPoints(center,r=18){
  return Array.from({length:6},(_,i)=>{
    const a=(i/6)*Math.PI*2;
    return{x:Math.round(center.x+Math.cos(a)*r),y:center.y,z:Math.round(center.z+Math.sin(a)*r)};
  });
}

module.exports = {
  get active(){return active;},
  init(bot){console.log('[Patrol] Inicializado');},
  startPatrol(bot,onAlert){
    if(active)return;
    active=true; spawnPos=bot.entity.position.clone(); points=genPoints(spawnPos); idx=0;
    console.log('[Patrol] Patrullando',points.length,'puntos');
    patrolInterval=setInterval(()=>{
      if(!active||!bot.entity)return;
      const near=Object.values(bot.entities).filter(e=>e.type==='player'&&e!==bot.entity&&bot.entity.position.distanceTo(e.position)<20);
      if(near.length>0&&onAlert)onAlert(`👤 Jugador detectado: ${near.map(p=>p.username||'?').join(', ')}`);
      const pt=points[idx];
      try{bot.pathfinder.setGoal(new GoalNear(pt.x,pt.y,pt.z,3),true);bot.setSprinting(false);}catch(_){}
      if(bot.entity.position.distanceTo({x:pt.x,y:pt.y,z:pt.z})<5)idx=(idx+1)%points.length;
    },3000);
  },
  stopPatrol(bot){
    active=false;clearInterval(patrolInterval);patrolInterval=null;
    try{bot.pathfinder.stop();}catch(_){}
  },
  stop(){active=false;clearInterval(patrolInterval);patrolInterval=null;},
};
