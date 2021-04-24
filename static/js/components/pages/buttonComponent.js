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
            
        `
        const div = document.createElement('div');
        div.innerHTML = `
            <div>
                <button id="createbtn">create</button>
                <button id="joinbtn">join</button>                
                <button id="hangupbtn">hangup</button>
            </div>
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
        const joinbtn = shadow.getElementById("joinbtn");
        const createbtn = shadow.getElementById("createbtn");
        const hangupbtn = shadow.getElementById("hangupbtn");

        const webRtc = window.webRtcService;
        joinbtn.addEventListener('click', webRtc.createLocalPeer);
        createbtn.addEventListener('click', webRtc.createRemotePeer);
        hangupbtn.addEventListener('click', webRtc.closeAllPeerConnection);
    }
}