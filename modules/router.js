import fs from "fs";

class Router{
    constructor(){
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
    
    onRequest = (req, res) =>{
        const {method, url} = req;
        this.req = req;
        this.res = res;
        this.method = method;
        this.url = url;
        const resFunc = this.reqRoute[this.method][this.url];
        if(resFunc) resFunc();
        else this.defaultRes();
    }

    defaultRes = () => {
        const extName = this.url.split('.')[1];
        const mime = this.mimeLookup[extName];
        /**
         * this part will be refactored
         */
        const staticPath = this.url.split("/")[1]
        if(mime && staticPath === "static"){
            this.res.writeHead(200, {'Content-Type': mime});
            fs.createReadStream('.' + this.url).pipe(this.res);
        }
        else{
            this.res.writeHead(404, {'Content-Type': 'text/html'});
            this.res.end("404 page not found");
        }
    }
}

export default Router;