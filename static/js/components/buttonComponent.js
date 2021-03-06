import WebrtcService from "../services/webRTCService.js";

class ButtonComponent extends HTMLElement{
    static get observedAttributes() {
        return [];
    }
    constructor(){
        super();
        const shadow = this.attachShadow({mode: 'closed'});
        this.getShadow = () => shadow;
        const style = document.createElement('style');
        style.innerHTML = `
            #buttonContainer{
                display:flex;
                justify-content:center;
                align-items: center;
                margin-bottom:16px;
            }
            .callbtngroup{
                width:100px;
                height:60px;
            }
        `
        const div = document.createElement('div');
        div.id = 'buttonContainer';
        div.innerHTML = `
            <button class="callbtngroup" id="createbtn">create</button>
            <button class="callbtngroup" id="joinbtn">join</button>
            <button class="callbtngroup" id="closebtn">hangup</button>
        `
        shadow.appendChild(style);
        shadow.appendChild(div);
        this.webRtcHandler();
    }
    
    connectedCallback() {
        
    }

    disconnectedCallback() {
        
    }

    adoptedCallback() {
        
    }

    attributeChangedCallback(name, oldValue, newValue) {
        
    }

    
    webRtcHandler = () => {
        const shadow = this.getShadow();
        const createbtn = shadow.getElementById("createbtn");
        const joinbtn = shadow.getElementById("joinbtn");
        const closebtn = shadow.getElementById("closebtn");

        const webrtcService = new WebrtcService();
        
        createbtn.addEventListener('click', webrtcService.createPeer);
        joinbtn.addEventListener('click', webrtcService.joinPeer);
        closebtn.addEventListener('click', webrtcService.closeAllPeer);
    }
}
customElements.define('button-component', ButtonComponent);

export default ButtonComponent;
