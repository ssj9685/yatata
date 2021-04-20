module.exports = function Router(req, method){
    this.method = method;
    this.req = req;
    this.mimeLookup = {
        'js': 'text/javascript',
        'css': 'text/css',
        'png': 'image/png'
    }
    if(this.method === 'GET'){
        switch(this.url){
            case '/':
                res.writeHead(200, {'Content-Type': 'text/html'});
                fs.createReadStream('./index.html').pipe(res);
                //if(req.headers.host.replace('.yatata.xyz','') === "chat");
                break;
            default:
                const extName = url.split('.')[1];
                if(this.mimeLookup[extName]){
                    res.writeHead(200, {'Content-Type': this.mimeLookup[extName]});
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

function router(method, url, callback){
    
}