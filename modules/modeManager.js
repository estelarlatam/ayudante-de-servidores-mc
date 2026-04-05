const config  = require('../config');
const farmer  = require('./farmer');
const patrol  = require('./patrol');
const MODES   = ['FARMING','PATROL','SOCIAL'];
let currentMode='SOCIAL',modeTimer=null,modeIndex=0,onModeChange=null;

module.exports = {
  get mode(){return currentMode;},
  init(bot,alertCb,changeCb){
    onModeChange=changeCb;
    farmer.init(bot); patrol.init(bot);
    this.switchTo(bot,'SOCIAL',alertCb);
    modeTimer=setInterval(()=>{modeIndex=(modeIndex+1)%MODES.length;this.switchTo(bot,MODES[modeIndex],alertCb);},config.modeDuration);
    console.log('[ModeManager] Rotación iniciada');
  },
  switchTo(bot,mode,alertCb){
    console.log(`[Mode] ${currentMode} → ${mode}`);
    if(currentMode==='FARMING')farmer.stopFarming();
    if(currentMode==='PATROL')patrol.stopPatrol(bot);
    currentMode=mode;
    if(onModeChange)onModeChange(mode);
    if(mode==='FARMING')setTimeout(()=>farmer.startFarming(bot),2000);
    if(mode==='PATROL')setTimeout(()=>patrol.startPatrol(bot,alertCb),2000);
  },
  forceMode(bot,mode,alertCb){
    clearInterval(modeTimer);
    this.switchTo(bot,mode,alertCb);
    modeTimer=setInterval(()=>{modeIndex=(modeIndex+1)%MODES.length;this.switchTo(bot,MODES[modeIndex],alertCb);},config.modeDuration);
  },
  stop(bot){clearInterval(modeTimer);farmer.stopFarming();patrol.stopPatrol(bot);},
};
