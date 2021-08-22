class VideoContainer extends HTMLElement{
    static get observedAttributes() {
        return [];
    }
    constructor(){
        super();
        const shadow = this.attachShadow({mode: 'closed'});
        this.getShadow = () => shadow;
        const style = document.createElement('style');
        style.innerHTML = `
            #videoContainer{
                display: grid;
                align-items: center;
                justify-content: center;
                justify-self: center;
                width: 100vw;
                z-index: -1;
            }
        `
        const div = document.createElement('div');
        div.id = 'videoContainer'
        shadow.appendChild(style);
        shadow.appendChild(div);
    }
}

export default VideoContainer;
