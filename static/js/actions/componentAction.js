scripter("components/buttonComponent.js");
scripter('components/videoContainer.js');

class ComponentActions{
    constructor(){
        customElements.define('button-component', ButtonComponent);
        customElements.define('video-container', VideoContainer);
    }
}