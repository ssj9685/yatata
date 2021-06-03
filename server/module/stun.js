const dgram = require('dgram');

module.exports = function Stun(){
    this.udpSocket = dgram.createSocket('udp4');

    const magicCookieBuf = Buffer.from('2112a442','hex')
    const msb = magicCookieBuf.readUInt16BE(0); //most significant 16 bits

    this.udpSocket.on('error', err => console.log(err));

    this.udpSocket.on('message', (udpMessage, rinfo) => {
        console.log(udpMessage, rinfo);
        const header = udpMessage;
        header.writeUIntBE(0x0101,0, 2); //success response
        header.writeUIntBE(12,2,2);
        const attrValue = Buffer.alloc(8);
        attrValue.writeUIntBE(0x01,1,1);
        attrValue.writeUIntBE(rinfo.port ^ msb, 2, 2);
        const ip = rinfo.address.split('.');
        for(let i=0,j=ip.length;i<j;++i)
            attrValue.writeUIntBE(Number(ip[i])^magicCookieBuf[i],i+4,1);
        const attribute = Buffer.alloc(4);
        attribute.writeUIntBE(0x0020,0,2); //attribute type
        attribute.writeUIntBE(8,2,2);
        let sendBuf = Buffer.concat([header, attribute, attrValue]);
        udpSocket.send(sendBuf, rinfo.port, rinfo.address);
    });
    
    this.udpSocket.bind(41234);
}