import ButtonComponent from "./components/buttonComponent.js";
import VideoContainer from "./components/videoContainer.js";
import InitStyle from "./actions/initStyle.js";

const initStyle = new InitStyle();

const videoContainer = new VideoContainer();
const buttonComponent = new ButtonComponent();

document.body.appendChild(videoContainer);
document.body.appendChild(buttonComponent);
