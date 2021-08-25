import fs from "fs";
import http from "http";
import https from "https";
import EventEmitter from "events";

class Wayor extends EventEmitter {
    set useHttp(isHttp){
        if(isHttp){
            this.server = http.createServer();
            this.server.on('request', this.onRequest);
            this.server.on('upgrade', (req, socket) => this.emit("upgrade", req, socket));
        }
        else{
            const options = {
                key: fs.readFileSync("./servers/ssl/keys/privkey1.pem"),
                cert: fs.readFileSync('./servers/ssl/keys/cert1.pem')
            };
            this.server = https.createServer(options);
            this.server.on('request', this.onRequest);
            this.server.on('upgrade', (req, socket) => this.emit("upgrade", req, socket));
        }
    }

    set useRedirect(isRedirect){
        if(isRedirect){
            this.redirectServer = http.createServer((req, res) => {
                res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
                res.end();
            }).listen(this.redirectPort);
        }
        else{
            if(this.redirectServer){
                this.redirectServer.close();
                this.redirectServer = null;
            }
        }
    }

    constructor(){
        super();
        this.redirectPort = 80;
        this.useRedirect = false;
        this.useHttp = false;
        this.mimeLookup = {
            'js': 'text/javascript',
            'css': 'text/css',
            'png': 'image/png'
        }
        this.reqRoute = {
            'GET':{},
            'POST':{}
        }
    }

    add = (method, url, callback) => this.reqRoute[method][url] = callback;

    setStaticPath = url => this.staticPath = url;

    onRequest = (req, res) => {
        const {method, url} = req;
        this.req = req;
        this.res = res;
        this.method = method;
        this.url = url;
        const resFunc = this.reqRoute[this.method][this.url];
        if(resFunc) {
            resFunc();
        }
        else {
            this.defaultRes();
        }
    }

    defaultRes = () => {
        const extName = this.url.split('.')[1];
        const mime = this.mimeLookup[extName];
        if(mime && this.url.includes(this.staticPath)) {
            this.res.writeHead(200, {'Content-Type': mime});
            fs.createReadStream('.' + this.url).pipe(this.res);
        }
        else {
            this.res.writeHead(404, {'Content-Type': 'text/html'});
            this.res.end("404 page not found");
        }
    }

    listen = (port, callback) => {
        this.server.listen(port, callback);
    }
}

export default Wayor;