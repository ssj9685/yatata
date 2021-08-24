import https from "https";
import http from "http";
import fs from "fs";
import Stun from "yatata/servers/stun";
import Turn from "yatata/servers/turn"
import Relay from "yatata/servers/relay"
import Router from "yatata/modules/router"
import SocketManager from "yatata/modules/socketManager"
import Websocket from "yatata/modules/websocket"
import Webrtc from "yatata/modules/webrtc";

const options = {
    key: fs.readFileSync('./servers/ssl/keys/privkey1.pem'),
    cert: fs.readFileSync('./servers/ssl/keys/cert1.pem')
};

const router = new Router();
router.add('GET','/',()=>{
    if(router.req.headers.host.replace('.yatata.xyz','') === "chat"){
        router.res.writeHead(200, {'Content-Type': 'text/html'});
        fs.createReadStream('./index.html').pipe(router.res);
    }
    else{
        router.res.writeHead(404, {'Content-Type': 'text/html'});
        router.res.end("404 page not found");
    }
})

const websocketManager = new SocketManager();

const webrtc = new Webrtc();

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

const httpsServer = https.createServer(options);
httpsServer.on('request', router.onRequest);
httpsServer.on('upgrade', onHttpsServerUpgarde);
httpsServer.listen(443, () => console.log("Server running on port 443"));

http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
    res.end();
}).listen(80);

const stun = new Stun();
stun.bind(41233);

const turn = new Turn();
turn.bind(41234);

const relaySocketManager = new SocketManager();
const relay = new Relay(relaySocketManager);
relay.bind(41235);