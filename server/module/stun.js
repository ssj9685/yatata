const dgram = require('dgram');

const udpSocket = dgram.createSocket('udp4');

udpSocket.on('error', err => console.log(err));

udpSocket.on('message', (udpMessage, rinfo) => {
    console.log(udpMessage, rinfo);
    const header = udpMessage;
    header.writeUInt16BE(0x0101,0);
    header.writeUInt16BE(address.length, 2);
    //const attrValue = Buffer.alloc(8);
    //attrValue.writeUIntBE(0x00,0,1);
    //const attribute = Buffer.alloc()
    let sendBuf = Buffer.concat([header, address]);
    udpSocket.send(sendBuf, rinfo.port, rinfo.address);
});

udpSocket.on('close', () => console.log('closed'));

udpSocket.bind(41234,()=>{
    console.log(udpSocket.address());
});