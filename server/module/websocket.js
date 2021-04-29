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
			this.onData();
			this.onError();
			this.onClose();
			this.handshake();
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
		this.socketManager.set(this.socket, this.socketManager.connectedSockets.size);
	}
	this.connect = () => {
		/**
		 * For initial connection packet
		 */
		const buf = Buffer.alloc(2);
        buf[0] = 0x82;
        this.socket.write(buf);
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
	this.onClose = () => {
		this.socket.on('close',()=>{
            this.socketManager.delete(this.socket);
        })
	}

	this.onWebRtcServiceData = (encoded) => {
		/**
		 * 1(MASK) 0000010(length) & 0 1111111 for remove mask key
		 */
		let length = encoded[1]&0x7F;
		const mask = Buffer.alloc(4);
		let decoded;
		if(length <= 125){
			decoded = Buffer.alloc(length);
			for(let i=0;i<4;++i)mask[i]=encoded[i+2];
			for(let i=0;i<length;++i)decoded[i] = encoded[i+6] ^ mask[i%4];
			let sendBuf = Buffer.alloc(2);
			sendBuf[0] = 0x81;
			sendBuf[1] = length;
			sendBuf = Buffer.concat([sendBuf, decoded]);
			this.socket.write(sendBuf);
		}
		else if(length === 126){
			length = encoded.readUInt16BE(2);
			decoded = Buffer.alloc(length);
			for(let i=0;i<4;++i)mask[i]=encoded[i+4];
			for(let i=0;i<length;++i)decoded[i] = encoded[i+8] ^ mask[i%4];
			let sendBuf = Buffer.alloc(4);
			sendBuf[0] = 0x81;
			sendBuf[1] = 126;
			sendBuf[2] = encoded[2];
			sendBuf[3] = encoded[3];
			sendBuf = Buffer.concat([sendBuf, decoded]);
			this.socketManager.sendBufToOthers(this.socket, sendBuf);
		}
		else if(length === 127){
			length = encoded.readBigUInt64BE(2);
			decoded = Buffer.alloc(length);
			for(let i=0;i<4;++i)mask[i]=encoded[i+8];
			for(let i=0;i<length;++i)decoded[i] = encoded[i+14] ^ mask[i%4];
		}
	}
}