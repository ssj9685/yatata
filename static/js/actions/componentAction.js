scripter("components/buttonComponent.js");

class ComponentActions{
    constructor(){
        customElements.define('button-component', ButtonComponent);
        customElements.define('video-container', VideoContainer);
    }
}