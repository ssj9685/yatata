scripter('actions/componentAction.js');
scripter("services/webRTCService.js");

window.addEventListener('load', ()=>{
    this.webRtcService =  new WebRTCService({
        websocketUrl: "wss://chat.yatata.xyz/webrtc", 
        stunUrls: ['stun:chat.yatata.xyz:3478', 'stun:chat.yatata.xyz:41234']
    });
    this.componentAction = new ComponentActions();
})