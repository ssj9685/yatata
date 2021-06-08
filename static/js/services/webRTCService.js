class WebRTCService{
	constructor(){
		this.localPeers = new Array();
		this.targetPeer = null;
		this.webSocket = new WebSocket("wss://chat.yatata.xyz/webrtc");
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

	onMessage = e => {
		if(typeof e.data === "string"){
			const message = JSON.parse(e.data);
			console.log(message);
			if(this.targetPeer){
				if(message.type === "offer"){
					this.targetPeer.setRemoteDescription(message)
					.catch(e=>{
						alert("offer failaure: ",e.name);
					});

					this.targetPeer.createAnswer()
					.then(description => {
						this.targetPeer.setLocalDescription(description);
						this.webSocket.send(JSON.stringify(description));
					});
				}
				else if(message.type === "answer"){
					this.targetPeer.setRemoteDescription(message)
					.catch(e=>{
						alert("answer failaure: ",e.name);
					});
				} 
				else if(message.ice){
					this.targetPeer.addIceCandidate(message.ice)
					.catch(e=>{
						alert("ice failaure: ",e.name);
					});
				}
			}
		}
	}

	initPeer = () => {
		const pc = new RTCPeerConnection({
			iceServers:[
				{'urls': 'stun:chat.yatata.xyz:41234'}
			]
		});
		this.localPeers.push(pc);
		if(stream){
			this.stream.getTracks()
			.forEach(track => pc.addTrack(track, this.stream));
			pc.addEventListener('icecandidate', this.onIceCandidate);
		}
		return pc;
	}

	createLocalPeer = () => {
		this.webSocket.addEventListener('message', this.onMessage);
		const pc = this.initPeer();
		pc.addEventListener('track', this.onAddTrack);
		pc.addEventListener('negotiationneeded',this.localOnNegotiationNeeded);
	}

	createRemotePeer = () => {
		this.webSocket.addEventListener('message', this.onMessage);
		const pc = this.initPeer();
		pc.addEventListener('track', this.onAddTrack);
		pc.addEventListener('negotiationneeded',this.remoteOnNegotiationNeeded);
	}

	onAddTrack = e => {
		const prevVideo = document.getElementById("opponent");
		let video = null;
		if(prevVideo){
			prevVideo.srcObject = e.streams[0];
		}
		else{
			const container = document.querySelector('video-container').getShadow();
			video = document.createElement('video');
			video.id = "opponent";
			video.playsInline = true;
			video.autoplay = true;
			video.style.cssText = `
				width:33vw;
				height:33vh;
			`
			container.appendChild(div);
			video.srcObject = e.streams[0];
		}
		this.webSocket.close();
	}

	localOnNegotiationNeeded = e => {
		this.targetPeer = e.target;
		this.targetPeer.createOffer()
		.then(description => {
			this.targetPeer.setLocalDescription(description);
			this.webSocket.send(JSON.stringify(description));
		});
	}

	remoteOnNegotiationNeeded = e => {
		this.targetPeer = e.target;
	}

	onIceCandidate = e => {
		this.targetPeer = e.target;
		if(e.candidate){
			this.webSocket.send(JSON.stringify({ice:e.candidate}));
		}
	}
	
	closeAllPeerConnection = () => {
		for(const pc of this.localPeers){
			pc.close();
		}
		this.localPeers = new Array();
		this.targetPeer = null;
		const videos = document.querySelectorAll('video');
		for(const video of videos){
			document.body.removeChild(video);
			alert('all connection removed!');
		}
	}
}