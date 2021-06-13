const fs = require('fs');

module.exports = function Router(){
    this.mimeLookup = {
        'js': 'text/javascript',
        'css': 'text/css',
        'png': 'image/png'
    }
    this.reqRoute = {
        'GET':{},
        'POST':{}
    }

    this.add = (method, url, callback) => this.reqRoute[method][url] = callback;

    this.onRequest = (req, res) =>{
        const {method, url} = req;
        this.req = req;
        this.res = res;
        this.method = method;
        this.url = url;
        const resFunc = this.reqRoute[this.method][this.url];
        if(resFunc) resFunc();
        else this.defaultRes();
    }

    this.defaultRes = () => {
        const extName = this.url.split('.')[1];
        if(this.mimeLookup[extName]){
            this.res.writeHead(200, {'Content-Type': this.mimeLookup[extName]});
            fs.createReadStream('.' + this.url).pipe(this.res);
        }
        else{
            this.res.writeHead(404, {'Content-Type': 'text/html'});
            this.res.end("404 page not found");
        }
    }
}