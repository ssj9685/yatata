module.exports = function SocketManager(){
    this.connectedSockets = new Map();

    this.set = socket => this.connectedSockets.set(socket, this.connectedSockets.size);

    this.delete = socket => this.connectedSockets.delete(socket);

    this.sendBufToOthers = (socket, sendBuf) => {
        for(const sock of this.connectedSockets.keys()){
            if(socket!==sock){
                sock.write(sendBuf);
            }
        }
    }
}