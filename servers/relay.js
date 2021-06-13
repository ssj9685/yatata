const dgram = require('dgram');

module.exports = function Relay(){
    this.sockets = new Map();
    this.udpSocket = dgram.createSocket('udp4');

    this.udpSocket.on('error', err => console.log(err));

    this.udpSocket.on('message', (udpMessage, rinfo) => {
        const fullAddress = `${rinfo.address}:${rinfo.port}`;
        if(!this.sockets.has(fullAddress)){
            this.sockets.set(fullAddress, [udpMessage]);
        }
        else{
            const messages = this.sockets.get(fullAddress);
            const lastMessage = messages[messages.length - 1];
            if(lastMessage){
                if(Buffer.compare(lastMessage, udpMessage) !== 0){
                    messages.push(udpMessage);
                }
            }
            else{
                messages.push(udpMessage);
            }
            if(this.sockets.size === 2){
                let peers = [];
                for(const socket of this.sockets){
                   peers.push(socket)
                }
                const [fa1, m1] = peers[0];
                const [a1, p1] = fa1.split(':');
                const [fa2, m2] = peers[1];
                const [a2, p2] = fa2.split(':');
                if(m1.length > 0)
                this.udpSocket.send(m1.shift(), Number(p2), a2);
                if(m2.length > 0)
                this.udpSocket.send(m2.shift(), Number(p1), a1);
            }
        }
    });

    this.bind = port => this.udpSocket.bind(port);
}