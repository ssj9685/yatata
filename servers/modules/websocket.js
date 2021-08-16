const crypto=  require('crypto');
/**
 * Reference
 * https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
 */
module.exports = function Websocket(socketManager){
	this.socketManager = socketManager;

	this.init = (req, socket) => {
		/**
		 * init data frame 1000(FIN) 0010(OP bin)
		 * 0x82 for change readyState connecting to open
		 */
		this.req = req;
		this.socket = socket;

		if(this.req.headers["upgrade"] === 'websocket'){
			this.eventBind();
			this.handshake();
			this.socketManager.set([this.req.url], this.socket);
			this.connect();
		}
		else{
			
		}
	}

	this.handshake = () => {
		const magicStr = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
		const websocketKey = this.req.headers["sec-websocket-key"] + magicStr;
		/**
		 * Key from client + magic string and hash(sha1 algo) and encode to base64
		 */
		const key = crypto.createHash("sha1")
		.update(websocketKey)
		.digest("base64");
		this.socket.write('HTTP/1.1 101 Switching Protocols\r\n'+
				'Upgrade: websocket\r\n'+
				'Connection: Upgrade\r\n'+
				'Sec-WebSocket-Accept: '+key+'\r\n'+
				'\r\n');
	}

	this.connect = () => {
		/**
		 * For initial connection packet
		 */
		const clientNum = this.socketManager.size([this.req.url]);
		const length = 1;
        const opcode = 0x82;
		const buf = Buffer.from([opcode, length, clientNum]);
		console.log(buf);
        this.socket.write(buf);
		console.log('Websocket connected');
	}
	
	this.onData = () => {
		this.socket.on('data',encoded=>{
			this.onWebRtcServiceData(encoded);
		});
	}

	this.onError = () => {
		this.socket.on('error',e=>{
			console.log(e);
		})
	}

	this.onEnd = () => {
		this.socket.on('end',()=>{
            this.socketManager.delete([this.req.url], this.socket);
			console.log('Websocket closed');
        })
	}

	this.eventBind = () => {
		this.onData();
		this.onError();
		this.onEnd();
	}

	this.onWebRtcServiceData = (encoded) => {
		/**
		 * 1(MASK) 0000010(length) & 0 1111111 for remove mask key
		 */
		let length = encoded[1]&0x7F;
		console.log("encoded:",encoded, "length:",length);
		if(encoded.readUInt16BE(0) === 0x8880){
			this.socket.end();
		}

		const mask = Buffer.alloc(4);
		let decoded;

		if(length < 126){
			let payloadLength = length;
			decoded = Buffer.alloc(payloadLength);
			for(let i=0;i<4;++i)mask[i]=encoded[i+2];
			for(let i=0;i<payloadLength;++i)decoded[i] = encoded[i+6] ^ mask[i%4];
			console.log(decoded.toString('utf8'));
			let sendBuf = Buffer.alloc(2);
			sendBuf[0] = 0x81;
			sendBuf[1] = length;
			sendBuf = Buffer.concat([sendBuf, decoded]);
			this.socketManager.broadcast([this.req.url], this.socket, sendBuf);
		}
		else if(length === 126){
			let payloadLength = encoded.readUInt16BE(2);
			decoded = Buffer.alloc(payloadLength);
			for(let i=0;i<4;++i)mask[i]=encoded[i+4];
			for(let i=0;i<payloadLength;++i)decoded[i] = encoded[i+8] ^ mask[i%4];
			console.log(decoded.toString('utf8'));
			let sendBuf = Buffer.alloc(4);
			sendBuf[0] = 0x81;
			sendBuf[1] = length;
			sendBuf[2] = encoded[2];
			sendBuf[3] = encoded[3];
			sendBuf = Buffer.concat([sendBuf, decoded]);
			this.socketManager.broadcast([this.req.url], this.socket, sendBuf);
		}
		else if(length === 127){
			let payloadLength = encoded.readBigUInt64BE(2);
			decoded = Buffer.alloc(payloadLength);
			for(let i=0;i<4;++i)mask[i]=encoded[i+8];
			for(let i=0;i<payloadLength;++i)decoded[i] = encoded[i+14] ^ mask[i%4];
			console.log(decoded.toString('utf8'));
		}
	}
}