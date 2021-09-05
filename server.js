import Stun from "yatata/servers/stun.js";
import Turn from "yatata/servers/turn.js";
import Relay from "yatata/servers/relay.js";
import Wayor from "yatata/modules/wayor.js";
import SocketManager from "yatata/modules/socketManager.js";
import Websocket from "yatata/modules/websocket.js";
import Webrtc from "yatata/modules/webrtc.js";
import HtmlCreator from "yatata/modules/htmlCreator.js";

const webrtc = new Webrtc();
const websocketManager = new SocketManager();

const onHttpsServerUpgarde = (req, socket) => {
    const websocket = new Websocket(req, socket);

    websocket.on("connect", () => {
        websocketManager.set([req.url], socket);
        console.log("websocket connected");
    });

    websocket.on('data', data => {
        const decoded = webrtc.decode(data);
        websocketManager.broadcast([req.url], socket, decoded);
    });

    websocket.on('error', error => {
        console.log(error);
    });

    websocket.on('end',()=>{
        websocketManager.delete([req.url], socket);
        console.log('Websocket closed');
    });

    websocket.connect();
}

const htmlCreator = new HtmlCreator();
htmlCreator.scriptSrc = "static/js/main.js";
const html = htmlCreator.create();

const wayor = new Wayor();
wayor.add('GET', '/', ()=>{
    if(wayor.req.headers.host.replace('.yatata.xyz','') === "chat") {
        wayor.res.writeHead(200, {'Content-Type': 'text/html'});
        wayor.res.end(html);
    }
    else {
        wayor.res.writeHead(404, {'Content-Type': 'text/html'});
        wayor.res.end("404 page not found");
    }
});
wayor.setStaticPath("/static");
wayor.redirectPort = 80;
wayor.useRedirect = true;
wayor.on("upgrade", onHttpsServerUpgarde);
wayor.listen(443, () => console.log("Server running on port", 443));

const stun = new Stun();
stun.bind(41233);

const turn = new Turn();
turn.bind(41234);

const relaySocketManager = new SocketManager();

const relay = new Relay();
relay.on("message", (udpSocket, udpMessage, rinfo) => {
    const routes = [rinfo.address, rinfo.port];
    relaySocketManager.set(routes, udpSocket);
    relaySocketManager.relay(routes, udpSocket, udpMessage);
    //console.log("relay message: ", udpMessage);
});
relay.on("error", error => console.log(error));
relay.bind(41235);