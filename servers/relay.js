const dgram = require('dgram');

module.exports = function Relay(socketManager){
    this.sockets = new Map();
    this.udpSocket = dgram.createSocket('udp4');
    this.socketManager = socketManager;

    this.udpSocket.on('error', err => console.log(err));

    this.udpSocket.on('message', (udpMessage, rinfo) => {
        const routes = [rinfo.address, rinfo.port];
        this.socketManager.set(routes, socket);
        this.socketManager.pushMessage(routes, socket, udpMessage);
        this.socketManager.relay(routes, socket);
    });

    this.bind = port => this.udpSocket.bind(port);
}