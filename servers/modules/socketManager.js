module.exports = function SocketManager(){
    this.socketInfos = new Map();

    this.set = (routes, socket) => {
        let focus = this.socketInfos;
        let route = routes.join(':');
        if(!focus.has(route)){
            focus.set(route, new Map());
            focus = focus.get(route);
        }
        else{
            focus = focus.get(route);
        }
        if(!focus.has(socket)){
            focus.set(socket, new Array());
        }
    }

    this.delete = (routes, socket) => {
        this.focus(routes).delete(socket);
    }

    this.broadcast = (routes, socket, message) => {
        let sockets = this.focus(routes);
        for(const sock of sockets.keys()){
            if(socket!==sock){
                sock.write(message);
            }
        }
    }

    this.relay = (routes, socket, message) => {
        let route = routes.join(':');
        for(const socketInfo of this.socketInfos){
            const [r, sockets] = socketInfo;
            if(route !== r){
                const [addr, port] = r.split(':');
                socket.send(message, Number(port), addr);
            }
        }
    }

    this.focus = routes => this.socketInfos.get(routes.join(':'));
}