import ButtonComponent from "../components/buttonComponent.js";
import VideoContainer from "../components/videoContainer.js";

class ComponentActions{
    constructor(){
        customElements.define('button-component', ButtonComponent);
        customElements.define('video-container', VideoContainer);
    }
}

export default ComponentActions;
