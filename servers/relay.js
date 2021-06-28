const dgram = require('dgram');

module.exports = function Relay(socketManager){
    this.sockets = new Map();
    this.udpSocket = dgram.createSocket('udp4');
    this.socketManager = socketManager;

    this.udpSocket.on('error', err => console.log(err));

    this.udpSocket.on('message', (udpMessage, rinfo) => {
        const routes = [rinfo.address, rinfo.port];
        this.socketManager.set(routes, this.udpSocket);
        this.socketManager.pushMessage(routes, this.udpSocket, udpMessage);
        this.socketManager.relay(routes, this.udpSocket);
    });

    this.bind = port => this.udpSocket.bind(port);
}