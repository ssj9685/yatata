import https from "https";
import http from "http";
import fs from "fs";
import Stun from "./servers/stun.js"
import Turn from "./servers/turn.js"
import Relay from "./servers/relay.js"
import Router from "./servers/modules/router.js"
//import log from "./servers/modules/logger.js"
import SocketManager from "./servers/modules/socketManager.js"
import Websocket from "./servers/modules/websocket.js"

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

const onHttpsServerUpgarde = (req, socket) => {
    const websocket = new Websocket(req, socket);

    websocket.on("connect", () => {
        websocketManager.set([req.url], socket);
        console.log("websocket connected");
    });

    websocket.on('data', data => {
        console.log("receieved data: ", data.toString("utf8"));
    });

    websocket.on('error', error => {
        console.log(error);
    });

    websocket.on('end',()=>{
        websocketManager.delete([req.url], socket);
        console.log('Websocket closed');
    });

    websocket.on("broadcast", (req, socket, sendBuf) => {
        websocketManager.broadcast([req.url], socket, sendBuf);
        console.log("broadcast");
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