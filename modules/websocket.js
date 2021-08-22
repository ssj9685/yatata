import crypto from "crypto";
import EventEmitter from "events";

/**
 * Reference
 * https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
 */
class Websocket extends EventEmitter{
	constructor(req, socket){
		/**
		 * init data frame 1000(FIN) 0010(OP bin)
		 * 0x82 for change readyState connecting to open
		 */
		super();

		this.req = req;
		this.socket = socket;

		if(this.req.headers["upgrade"] === 'websocket'){
			this.socket.on('data', data => {
				if(data.readUInt8(0) === 0x88){
					this.socket.end();
				}
				else{
					this.emit("data", data);
				}
			});
			this.socket.on('error', error => {
				this.emit("error", error);
			});
			this.socket.on('end', () => {
				this.emit("end");
			});
			this.handshake();
		}
		else{
			
		}
	}

	handshake = () => {
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

	connect = () => {
		/**
		 * For initial connection packet
		 */
		const length = 0;
        const opcode = 0x82;
		const sendBuf = Buffer.from([opcode, length]);
        this.socket.write(sendBuf);
		this.emit("connect");
	}
}

export default Websocket;