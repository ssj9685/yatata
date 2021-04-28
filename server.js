const https = require('https');
const fs = require('fs');
const Router = require('./server/module/router');
const Websocket = require('./server/module/websocket');
const socketManager = require('./server/module/socketManager');
const log = require('./server/module/logger');

const options = {
    key: fs.readFileSync('./server/ssl/keys/privkey1.pem'),
    cert: fs.readFileSync('./server/ssl/keys/cert1.pem')
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

const httpsServer = https.createServer(options);
httpsServer.on('request',router.onRequest);
httpsServer.on('upgrade', onHttpsServerUpgarde);
httpsServer.listen(443, () => log("Server running on port 443"));

const socketManager = new SocketManager();
function onHttpsServerUpgarde(req, socket){
    const {url} = req;
    switch(url){
        case "/webrtc":
            const websocket = new Websocket(socketManager);
            websocket.init(req, socket);
            break;
        default:
    }
}

const http = require('http');
http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);