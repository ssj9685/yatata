scripter("components/pages/buttonComponent.js");

class ComponentActions{
    constructor(){
        this.pageElementDefineHandler();
    }

    pageElementDefineHandler = () => {
        customElements.define('index-component', ButtonComponent);
    }
}