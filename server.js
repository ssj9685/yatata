const https = require('https');
const http = require('http');
const fs = require('fs');
const Router = require('./servers/modules/router');
const log = require('./servers/modules/logger');
const SocketManager = require('./servers/modules/socketManager');
const Websocket = require('./servers/modules/websocket');
const Stun = require('./servers/stun');
const Turn = require('./servers/turn');
const Relay = require('./servers/relay');

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
    const websocket = new Websocket(websocketManager);
    websocket.init(req, socket);
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