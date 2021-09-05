class WebrtcService{
	constructor(){
		this.currentPeers = new Array();
		this.websocketUrl = "wss://chat.yatata.xyz/";
		this.websocket = null;
		this.videoTest = null;
		this.stunUrls = ['stun:chat.yatata.xyz:41233', 'stun:chat.yatata.xyz:41234'];
		this.stream = null;
		navigator.mediaDevices.getUserMedia(
			{
				audio: true,
				video: true
			}
		)
		.catch(e => alert("There is no camara. please connect and refresh"))
		.then(stream => this.stream = stream);
	}

	createPeer = async() => {
		const pc = await this.initPeer();
		if(this.stream){
			this.stream.getTracks()
			.forEach(track => pc.addTrack(track, this.stream));
		}
		
		pc.addEventListener("datachannel", e => {
			const channel = e.channel;
			channel.addEventListener("open", ()=>{
				console.log("data channel open");
				this.createPeer();
			});
			channel.addEventListener("message", e=>{
				console.log(e.data);
			});
		});
		pc.addEventListener("datachannelclose", e => channel.close());

		this.addStreamVideo({
			id: "local",
			cssText: `
				position: fixed;
				width: 25vw;
				height: auto;
				bottom: 0;
				right: 0;
			`,
			stream: this.stream,
			muted: true
		});
		
		return pc;
	}

	joinPeer = async () => {
		const pc = await this.initPeer();
		pc.addEventListener("negotiationneeded", async e => {
			const pc = e.target;
			const description = await pc.createOffer();
			pc.setLocalDescription(description);
			this.emit(pc, "descriptionsend", {
				description: description
			});
		});

		if(this.stream){
			this.stream.getTracks()
			.forEach(track => pc.addTrack(track, this.stream));
		}

		const channel = pc.createDataChannel("chat");
		pc.addEventListener("datachannelclose", e => channel.close());
		channel.addEventListener("open",()=>{
			console.log("join channel open");
		});
		channel.addEventListener("error", e => {
			console.log(e);
		});
		channel.addEventListener("message", async e=>{

		});

		this.addStreamVideo({
			id: "local",
			cssText: `
				position: fixed;
				width: 25vw;
				height: auto;
				bottom: 0;
				right: 0;
			`,
			stream: this.stream,
			muted: true
		});

		return pc;
	}

	initPeer = async() => {
		console.log("initPeer");
		const pc = new RTCPeerConnection({iceServers: [{urls: this.stunUrls}]});
		const websocket = await this.initWebsocket(pc);

		pc.addEventListener("icecandidate", this.onIceCandidate);
		pc.addEventListener("ice", this.onIce);
		pc.addEventListener("track", this.onAddTrack);
		pc.addEventListener("answer", this.onAnswer);
		pc.addEventListener("offer", this.onOffer);

		pc.addEventListener("icesend", e => {
			const ice = JSON.stringify({
				type: "ice",
				candidate:e.detail.candidate
			});
			websocket.send(ice);
		});
		pc.addEventListener("descriptionsend", e => {
			console.log("descriptionSend");
			const description = JSON.stringify(e.detail.description);
			websocket.send(description);
		});
		pc.addEventListener("iceend", e => websocket.close());
		pc.addEventListener("websocketclose", e => websocket.close());

		this.currentPeers.push(pc);
		
		return pc;
	}

	initWebsocket = pc => new Promise((resolve, reject) => {
		/**
		 * Must add modal for websocketId
		 */
		const websocketId = "test";

		const websocket = new WebSocket(this.websocketUrl + websocketId);
		
		websocket.addEventListener("offer", e => {
			this.emit(pc, "offer", e.detail);
		});
		websocket.addEventListener("answer", e => {
			this.emit(pc, "answer", e.detail);
		});
		websocket.addEventListener("ice", e => {
			this.emit(pc, "ice", e.detail);
		});
		websocket.addEventListener("open", e => {
			console.log("websocket open");
			resolve(websocket);
		});
		websocket.addEventListener("close", () => {
			console.log("websocket closed");
		})
		websocket.addEventListener("error", e => {
			reject(e);
		});
		websocket.addEventListener("message", this.onWebsocketMessage);
	});

	onWebsocketMessage = e => {
		if(typeof e.data === "string"){
			const websocket = e.target
			const message = JSON.parse(e.data);
			let eventType;
			switch(message.type){
				case "offer":
					eventType = "offer";
					break;
				case "answer":
					eventType = "answer";
					break;
				case "ice":
					eventType = "ice";
					break;
			}
			this.emit(websocket, eventType, {
				websocket: websocket,
				message: message
			});
		}
		else{
			//console.log(e.data);
			const fileReader = new FileReader();
			fileReader.addEventListener("load", e => {
				try{
					const dataview = new DataView(e.target.result);
					//this.userNum = dataview.getUint8(0);
				}
				catch(e){
					//console.error(e);
				}
			});
			fileReader.readAsArrayBuffer(e.data);
		}
	}

	onDatachannelMessage = e => {
		if(typeof e.data === "string"){
			const channel = e.target
			const message = JSON.parse(e.data);
			let eventType;
			switch(message.type){
				case "offer":
					eventType = "offer";
					break;
				case "answer":
					eventType = "answer";
					break;
				case "ice":
					eventType = "ice";
					break;
			}
			this.emit(channel, eventType, {
				channel: channel,
				message: message
			});
		}
		else{
			//console.log(e.data);
			const fileReader = new FileReader();
			fileReader.addEventListener("load", e => {
				try{
					const dataview = new DataView(e.target.result);
					//this.userNum = dataview.getUint8(0);
				}
				catch(e){
					//console.error(e);
				}
			});
			fileReader.readAsArrayBuffer(e.data);
		}
	}

	onOffer = async e => {
		console.log("onOffer");
		const pc = e.target;
		
		const {message, websocket} = e.detail;
		pc.setRemoteDescription(message);
		const description = await pc.createAnswer();
		this.answer = description;
		console.log("onAnswer");
		pc.setLocalDescription(description);
		console.log("descriptionSend");
		websocket.send(JSON.stringify(description));
	}

	onAnswer = e => {
		console.log("onAnswer");
		const pc = e.target;
		const {message, websocket} = e.detail;
		pc.setRemoteDescription(message);
	}

	onIce = e => {
		console.log("onIce");
		const pc = e.target;
		const {message, websocket} = e.detail;
		pc.addIceCandidate(message.candidate);
	}

	onIceCandidate = e => {
		const pc = e.target;
		if(e.candidate){
			this.emit(pc, "icesend", {
				candidate: e.candidate
			});
			console.log("onIceCanididate");
		}
		else{
			console.log("icecandidate ended");
			this.emit(pc, "iceend");
		}
	}

	onAddTrack = e => {
		console.log("add Track");
		const pc = e.target;
		e.streams.forEach(stream => {
			this.addStreamVideo({
				id: `remote${this.currentPeers.length}`,
				cssText: `
					max-width: 100%;
					max-height: 100vh;
				`,
				stream: stream,
				muted: false
			});
		});
	}

	addStreamVideo = ({id, cssText, stream, muted}) => {
		const shadow = document.querySelector("video-container").getShadow();
		const prevVideo = shadow.getElementById(id);
		if(prevVideo){
			prevVideo.srcObject = stream;
		}
		else{
			const videoContainer = shadow.getElementById("videoContainer");
			const video = document.createElement("video");
			video.id = id;
			video.playsInline = true;
			video.autoplay = true;
			video.muted = muted;
			video.style.cssText = cssText;
			videoContainer.appendChild(video);
			video.srcObject = stream;
		}
	}

	removeAllVideos = () => {
		const shadow = document.querySelector("video-container").getShadow();
		const videoContainer = shadow.getElementById("videoContainer");
		videoContainer.innerText = "";
	}
	
	closeAllPeer = () => {
		for(const pc of this.currentPeers){
			this.emit(pc, "datachannelclose");
			pc.close();
			this.emit(pc, "websocketclose");
		}
		this.currentPeers = new Array();
		const videos = document.querySelectorAll("video");
		for(const video of videos){
			document.body.removeChild(video);
		}
		this.removeAllVideos();
		console.log("all connection reset!");
	}

	emit = (target, eventType, obj) => {
		const event = new CustomEvent(eventType, {
			detail: obj
		})
		target.dispatchEvent(event);
	}
}

export default WebrtcService;