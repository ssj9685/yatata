class WebRTCService{
	constructor(stunUrls){
		this.currentPeers = new Array();
		this.targetPeer = null;
		this.channels = new Array();
		this.websocketUrl = "wss://chat.yatata.xyz/";
		this.websocket = null;
		this.userNum = 0;
		this.stunUrls = stunUrls
		this.stream = null;
		navigator.mediaDevices.getUserMedia(
			{
				audio: true,
				video: true
			}
		)
		.catch(e=>alert("There is no camara. please connect and refresh"))
		.then(stream => this.stream = stream);
	}

	onWebsocketMessage = e => {
		if(typeof e.data === "string"){
			if(e.data === "")return;
			const message = JSON.parse(e.data);
			console.log(message);
			if(this.targetPeer){
				if(message.type === "offer"){
					this.channels.forEach(channel => {
						channel.send("create");
					});
					this.targetPeer.setRemoteDescription(message)
					.catch(e=>alert("offer failaure: ",e.name));

					this.targetPeer.createAnswer()
					.then(description => {
						this.targetPeer.setLocalDescription(description);
						this.websocket.send(JSON.stringify(description));
					});
				}
				else if(message.type === "answer"){
					this.targetPeer.setRemoteDescription(message)
					.catch(e=>{
						alert("answer failaure");
						console.log(e);
					});
				} 
				else if(message.ice){
					this.targetPeer.addIceCandidate(message.ice)
					.catch(e=>alert("ice failaure: ", e.name));
				}
			}
		}
		else{
			if(e.data === "")return;
			console.log(e.data);
			const fileReader = new FileReader();
			fileReader.addEventListener("load", e => {
				const dataview = new DataView(e.target.result);
				this.userNum = dataview.getUint8(0);
			});
			fileReader.readAsArrayBuffer(e.data);
		}
	}

	onChannelMessage = e => {

	}

	initPeer = () => {
		this.initWebsocket();
		const pc = new RTCPeerConnection({iceServers: [{urls: this.stunUrls}]});
		this.currentPeers.push(pc);

		this.addStream({
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

		pc.addEventListener("icecandidate", this.onIceCandidate);
		pc.addEventListener("track", this.onAddTrack);

		if(this.stream){
			this.stream.getTracks()
			.forEach(track => pc.addTrack(track, this.stream));
		}

		return pc;
	}

	initWebsocket = () => {
		if(!this.websocket){
			let id = prompt("please input peer ID");
			this.websocket = new WebSocket(this.websocketUrl + id);
			this.websocket.addEventListener("message", this.onWebsocketMessage);
			this.websocket.addEventListener("close", () => this.websocket = null);
		}
	}

	createPeer = () => {
		const pc = this.initPeer();
		pc.addEventListener("negotiationneeded", this.onCreate);
		return pc;
	}
	joinPeer = () => {
		const pc = this.initPeer();
		pc.addEventListener("negotiationneeded", this.onJoin);
		return pc;
	}

	onCreate = e => {
		this.targetPeer = e.target;
		e.target.addEventListener("datachannel", e=>{
			let channel = e.channel;
			channel.addEventListener("open", ()=>{
				this.channels.push(channel);
				this.websocket.close();
			});
			channel.addEventListener("message", e=>{
				if(e.data === "create"){
					const pc = this.createPeer();
				}
				console.log(e.data);
			});
		})
	}

	onJoin = e => {
		this.targetPeer = e.target;
		let channel = e.target.createDataChannel("chat");
		channel.addEventListener("open",()=>{
			this.channels.push(channel);
			this.websocket.close();
		});
		channel.addEventListener("message", e=>{
			console.log(e.data);
		});
		this.websocket.addEventListener("open",()=>{
			e.target.createOffer()
			.then(description => {
				e.target.setLocalDescription(description);
				this.websocket.send(JSON.stringify(description));
			});
		});
	}

	onAddTrack = e => {
		e.streams.forEach(stream => {
			this.addStream({
				id: `remote${this.currentPeers.length}`,
				cssText: `
					max-width:100vw;
					max-height:calc(100vh - 80px);
				`,
				stream: stream,
				muted: false
			});
		})
	}

	addStream = ({id, cssText, stream, muted}) => {
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

	onIceCandidate = e => {
		this.targetPeer = e.target;
		if(e.candidate){
			this.websocket.send(JSON.stringify({ice:e.candidate}));
		}
	}
	
	closeAllPeer = () => {
		for(const channel of this.channels){
			channel.close();
		}
		for(const pc of this.currentPeers){
			pc.close();
		}
		this.currentPeers = new Array();
		this.channels = new Array();
		this.targetPeer = null;
		const videos = document.querySelectorAll("video");
		for(const video of videos){
			document.body.removeChild(video);
		}
		this.removeAllVideos();
		console.log("all connection reset!");
		if(this.websocket)this.websocket.close();
	}
}