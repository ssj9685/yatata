class WebRTCService{
	constructor(){
		this.localPeers = new Array();
		this.targetPeer = null;
		this.channels = new Array();
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
					let channel = this.targetPeer.createDataChannel('chat');
					console.log(channel);
					channel.addEventListener('open',()=>{
						this.webSocket.close();
						channel.send('offer');
					});
					channel.addEventListener('message', e=>{
						console.log(e.data);
					})
					this.channels.push(channel);
				}
				else if(message.type === "answer"){
					this.targetPeer.setRemoteDescription(message)
					.catch(e=>alert("answer failaure: ", e.name));
					this.targetPeer.addEventListener('datachannel',e=>{
						let channel = e.channel;
						channel.addEventListener('open',e=>{
							channel.send('answer');
						});
						channel.addEventListener('message',e=>{
							console.log(e.data);
						});
						this.channels.push(channel);
					})
				} 
				else if(message.ice){
					this.targetPeer.addIceCandidate(message.ice)
					.catch(e=>alert("ice failaure: ", e.name));
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
		if(this.stream){
			this.stream.getTracks()
			.forEach(track => pc.addTrack(track, this.stream));
		}
		pc.addEventListener('icecandidate', this.onIceCandidate);
		this.addStream({
			id: 'local',
			cssText: `
				position: fixed;
				bottom: 0;
				right: 0;
				width:33vw;
				height:auto;
			`,
			stream: this.stream
		});
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
		this.addStream({
			id: 'remote',
			cssText: `
				width:66vw;
				height:auto;
			`,
			stream: e.streams[0]
		});
	}

	addStream = ({id, cssText, stream}) => {
		const shadow = document.querySelector('video-container').getShadow();
		const prevVideo = shadow.getElementById(id);
		if(prevVideo){
			prevVideo.srcObject = stream;
		}
		else{
			const videoContainer = shadow.getElementById('videoContainer');
			const video = document.createElement('video');
			video.id = id;
			video.playsInline = true;
			video.autoplay = true;
			video.style.cssText = cssText;
			videoContainer.appendChild(video);
			video.srcObject = stream;
		}
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
		}
		alert('all connection reset!');
	}
}