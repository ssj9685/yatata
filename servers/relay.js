import dgram from "dgram";
import EventEmitter from "events";

class Relay extends EventEmitter{
    constructor(){
        super();
        this.sockets = new Map();
        this.udpSocket = dgram.createSocket('udp4');
    
        this.udpSocket.on('error', error => this.emit("error", error));
    
        this.udpSocket.on('message', (udpMessage, rinfo) => {
            this.emit("message", this.udpSocket, udpMessage, rinfo);
        });
    
    }
    bind = port => this.udpSocket.bind(port);
}

export default Relay;