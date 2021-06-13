const dgram = require('dgram');

module.exports = function Relay(){
    this.sockets = new Map();
    this.udpSocket = dgram.createSocket('udp4');

    this.udpSocket.on('error', err => console.log(err));

    this.udpSocket.on('message', (udpMessage, rinfo) => {
        const fullAddress = `${rinfo.address}:${rinfo.port}`;
        this.sockets.set(fullAddress, udpMessage);
        for(const socket of this.sockets){
            const [fullAddr, message] = socket;
            if(fullAddr !== fullAddress){
                this.udpSocket.send(message, rinfo.port, rinfo.address);
            }
        }
    });

    this.bind = port => this.udpSocket.bind(port);
}