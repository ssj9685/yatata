scripter('actions/componentAction.js');
scripter("services/webRTCService.js");
scripter('actions/initStyle.js');

window.addEventListener('load', ()=>{
    this.webRtcService =  new WebRTCService(['stun:chat.yatata.xyz:41233', 'stun:chat.yatata.xyz:41234']);
    this.componentAction = new ComponentActions();
})