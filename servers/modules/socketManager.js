module.exports = function SocketManager(){
    this.socketRoute = new Map();

    this.set = (routes, socket) => {
        let focus = this.socketRoute;
        for(const route of routes){
            if(!focus.has(route)){
                focus.set(route, new Map());
                focus = focus.get(route);
            }
            else{
                focus = focus.get(route);
            }
        }
        if(!focus.has(socket)){
            focus.set(socket, new Array());
        }
    }

    this.pushMessage = (routes, socket, message) => {
        const messages = this.focus(routes).get(socket);
        messages.push(message);
    }

    this.delete = (routes, socket) => {
        this.focus(routes).delete(socket);
    }

    this.relay = (routes, socket) => {
        let sockets = this.focus(routes);
        let message = sockets.get(socket).shift();
        for(const sock of sockets.keys()){
            if(socket!==sock){
                sock.write(message);
            }
        }
    }

    this.focus = routes => {
        let focus = this.socketRoute;
        for(const route of routes){
            focus = focus.get(route);
        }
        return focus;
    }
}