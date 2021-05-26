const dgram = require('dgram');

const udpSocket = dgram.createSocket('udp4');

udpSocket.on('error', err => {
    console.log(err);
});

udpSocket.on('message', (udpMessage, rinfo) => {
    console.log(udpMessage, rinfo);
    const header = udpMessage;
    header.writeUInt16BE(0x0101,0);
    udpSocket.send(header,rinfo.port,rinfo.address);
});

udpSocket.on('listening',()=>{
    const {address,port} = udpSocket.address();
    console.log(address,port);
})

udpSocket.on('close', () => {
    console.log('closed');
});

udpSocket.bind(41234);