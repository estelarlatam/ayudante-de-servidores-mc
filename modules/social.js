const GREETINGS=['hola','hi','hello','hey','buenas','saludos','ola'];
const GG=['gg','buena','nice','bien hecho','wow'];
const QUESTIONS=['cómo estás','como estas','qué tal','que tal'];
const RANDOM=['este server está genial','alguien quiere hacer equipo?','voy a explorar un rato',':)','buenas noches','buen server','alguien online?'];
const ri=(arr)=>arr[Math.floor(Math.random()*arr.length)];
const has=(t,ws)=>ws.some(w=>t.toLowerCase().includes(w));
let socialInterval=null,lastSpeak=0;

module.exports = {
  init(bot) {
    bot.on('chat',(username,message)=>{
      if(username===bot.username||!message)return;
      if(Date.now()-lastSpeak<3000)return;
      const msg=message.toLowerCase();
      setTimeout(()=>{
        try{
          if(has(msg,GREETINGS)){bot.chat(`hola ${username}!`);lastSpeak=Date.now();}
          else if(has(msg,GG)){bot.chat(ri(['gg!','nice!','wp']));lastSpeak=Date.now();}
          else if(has(msg,QUESTIONS)){bot.chat(ri(['bien gracias!','todo bien :)','aquí explorando']));lastSpeak=Date.now();}
          else if(msg.includes('mastermc')||msg.includes('bot')){bot.chat(`sí? aquí estoy ${username} :)`);lastSpeak=Date.now();}
        }catch(_){}
      },1200+Math.random()*1500);
    });
    socialInterval=setInterval(()=>{
      if(Date.now()-lastSpeak<45000)return;
      if(Math.random()<0.25){try{bot.chat(ri(RANDOM));lastSpeak=Date.now();}catch(_){}}
    },60000);
    console.log('[Social] Inicializado');
  },
  stop(){clearInterval(socialInterval);socialInterval=null;},
};
