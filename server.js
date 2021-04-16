/**
 * TODO make function(method, url, callback) like express
 * TODO Add websocket server to client send
 */
const https = require('https');
const fs = require('fs');
const Websocket = require('./server/module/websocket/websocket');
const log = require('./server/module/logger');

const options = {
    key: fs.readFileSync('./server/ssl/keys/privkey1.pem'),
    cert: fs.readFileSync('./server/ssl/keys/cert1.pem')
};

const mimeLookup = {
    'js': 'text/javascript',
    'css': 'text/css',
    'png': 'image/png'
}

const httpsServer = https.createServer(options);
httpsServer.on('request',onHttpsServerRequest);
httpsServer.on('upgrade', onHttpsServerUpgarde);
httpsServer.listen(443, () => log("Server running on port 443"));

function onHttpsServerRequest(req, res){
    const {method, url} = req;
    if(method === 'GET'){
        switch(url){
            case '/':
                res.writeHead(200, {'Content-Type': 'text/html'});
                fs.createReadStream('./index.html').pipe(res);
                //if(req.headers.host.replace('.yatata.xyz','') === "chat");
                break;
            default:
                const extName = url.split('.')[1];
                if(mimeLookup[extName]){
                    res.writeHead(200, {'Content-Type': mimeLookup[extName]});
                    fs.createReadStream('.' + url).pipe(res);
                }
                else{
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    res.end("404 page not found");
                }
        }
    }
    else if(method === 'POST'){

    }
}

function onHttpsServerUpgarde(req, socket){
    const {url} = req;
    switch(url){
        case "/webrtc":
            const websocket = new Websocket(req, socket);
            websocket.init();
            break;
        default:
            log("nope");
    }
}

const http = require('http');
http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);