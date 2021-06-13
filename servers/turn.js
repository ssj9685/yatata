const dgram = require('dgram');

module.exports = function Turn(){
    this.udpSocket = dgram.createSocket('udp4');

    const magicCookieBuf = Buffer.from('2112a442','hex')
    const msb = magicCookieBuf.readUInt16BE(0); //most significant 16 bits

    this.udpSocket.on('error', err => console.log(err));

    this.udpSocket.on('message', (udpMessage, rinfo) => {
        const relayInfo = {address: '111.118.80.80', port:41234}
        console.log(udpMessage, );
        const header = udpMessage;
        header.writeUIntBE(0x0101,0, 2); //success response
        header.writeUIntBE(12,2,2);
        const attrValue = Buffer.alloc(8);
        attrValue.writeUIntBE(0x01,1,1);
        attrValue.writeUIntBE(relayInfo.port ^ msb, 2, 2);
        const ip = relayInfo.address.split('.');
        for(let i=0,j=ip.length;i<j;++i)
            attrValue.writeUIntBE(Number(ip[i])^magicCookieBuf[i],i+4,1);
        const attribute = Buffer.alloc(4);
        attribute.writeUIntBE(0x0020,0,2); //attribute type
        attribute.writeUIntBE(8,2,2);
        let sendBuf = Buffer.concat([header, attribute, attrValue]);
        this.udpSocket.send(sendBuf, rinfo.port, rinfo.address);
    });

    this.bind = port => this.udpSocket.bind(port);
}