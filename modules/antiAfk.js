const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
let microInterval=null;

module.exports = {
  init(bot) {
    microInterval=setInterval(()=>{
      try{bot.setControlState('sneak',true);setTimeout(()=>bot.setControlState('sneak',false),500);}catch(_){}
    },ri(15000,30000));
    console.log('[AntiAFK] Inicializado');
  },
  stop(){clearInterval(microInterval);microInterval=null;},
};
