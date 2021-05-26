const dgram = require('dgram');

const udpSocket = dgram.createSocket('udp4');

udpSocket.on('error', err => {
    console.log(err);
});

udpSocket.on('message', (udpMessage, rinfo) => {
    console.log(udpMessage, rinfo);
});

udpSocket.on('listening',()=>{
    const {address,port} = udpSocket.address();
    console.log(address,port);
})

udpSocket.on('close', () => {
    console.log('closed');
});

udpSocket.bind(41234);