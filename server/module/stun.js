const dgram = require('dgram');

const udpSocket = dgram.createSocket('udp4');

udpSocket.on('error', err => console.log(err));

udpSocket.on('message', (udpMessage, rinfo) => {
    console.log(udpMessage, rinfo);
    const header = udpMessage;
    header.writeUInt16BE(0x0101,0);
    const address = Buffer.from(JSON.stringify(rinfo));
    header.writeUInt16BE(address.length, 2);
    let sendBuf = Buffer.concat([header, address]);
    udpSocket.send(sendBuf, rinfo.port, rinfo.address);
});

udpSocket.on('close', () => console.log('closed'));

udpSocket.bind(41234,()=>{
    console.log(udpSocket.address());
});