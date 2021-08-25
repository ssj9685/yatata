import WebrtcService from "./services/webrtcService.js";
import ComponentActions from "./actions/componentAction.js";
import InitStyle from "./actions/initStyle.js";

window.webrtcService = new WebrtcService(['stun:chat.yatata.xyz:41233', 'stun:chat.yatata.xyz:41234']);
window.componentAction = new ComponentActions();
const initStyle = new InitStyle();
