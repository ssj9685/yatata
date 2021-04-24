scripter('actions/componentAction.js');
scripter("services/webRTCService.js");

window.addEventListener('load', ()=>{
    this.webRtcService =  new WebRTCService();
    this.componentAction = new ComponentActions();
})