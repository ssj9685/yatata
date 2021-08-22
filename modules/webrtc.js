class Webrtc{
    constructor(){
        
    }
    decode = encoded => {
        /**
         * 1(MASK) 0000010(length) & 0 1111111 for remove mask key
         */
        const length = encoded[1] & 0x7F;

        encoded[1] = encoded[1] & 0x7F;

        let payloadLength;
        let maskIdx;
    
        if(length < 126){
            payloadLength = length;
            maskIdx = 2;
        }
        else if(length === 126){
            payloadLength = encoded.readUInt16BE(2);
            maskIdx = 4;
        }
        else if(length === 127){
            payloadLength = encoded.readBigUInt64BE(2);
            maskIdx = 10;
        }

        const unmasked = this.unmask(encoded, payloadLength, maskIdx);
        const head = encoded.slice(0, maskIdx);
        const decoded = Buffer.concat([head, unmasked]);
    
        return decoded;
    }

    unmask = (encoded, payloadLength, maskIdx) => {
        const mask = Buffer.alloc(4);
        const data = Buffer.alloc(payloadLength);
        for(let i = 0; i < 4; ++i){
            mask[i] = encoded[maskIdx + i];
        }
        for(let i = 0; i < payloadLength; ++i){
            data[i] = encoded[maskIdx + i + 4] ^ mask[i % 4];
        }
        return data
    }
}

export default Webrtc;