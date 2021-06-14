class WebRTCService{
	constructor(){
		this.localPeers = new Array();
		this.pcType = null;
		this.targetPeer = null;
		this.iceCount = 0;
		this.channels = new Array();
		this.webSocket = new WebSocket("wss://chat.yatata.xyz/webrtc");
		this.stunUrl = 'stun:chat.yatata.xyz:3478';
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

	initPeer = configure => {
		const pc = new RTCPeerConnection(configure);
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

	createLocalPeer = () => {
		this.webSocket.addEventListener('message', this.onMessage);
		this.pcType = 'local';
		const configure = {
			iceServers: [
				{
					urls: this.stunUrl
				}
			]
		}
		const pc = this.initPeer(configure);
		pc.addEventListener('track', this.onAddTrack);
		pc.addEventListener('negotiationneeded',this.localOnNegotiationNeeded);
	}

	createRemotePeer = () => {
		this.webSocket.addEventListener('message', this.onMessage);
		this.pcType = 'remote';
		const configure = {
			iceServers: [
				{
					urls: this.stunUrl
				}
			]
		}
		const pc = this.initPeer(configure);
		pc.addEventListener('track', this.onAddTrack);
		pc.addEventListener('negotiationneeded',this.remoteOnNegotiationNeeded);
	}

	onAddTrack = e => {
		this.addStream({
			id: 'remote',
			cssText: `
				width:auto;
				height:auto;
			`,
			stream: e.streams[0],
			muted: false
		});
	}

	addStream = ({id, cssText, stream, muted}) => {
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
			video.muted = muted;
			video.style.cssText = cssText;
			videoContainer.appendChild(video);
			video.srcObject = stream;
		}
	}

	removeAllStreams = () => {
		const shadow = document.querySelector('video-container').getShadow();
		const videoContainer = shadow.getElementById('videoContainer');
		videoContainer.innerText = '';
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
		if(this.iceCount < 20){
			if(e.candidate){
				this.webSocket.send(JSON.stringify({ice:e.candidate}));
				this.iceCount++;
			}
		}
		else{
			this.stunUrl = 'stun:chat.yatata.xyz:41234';
			this.closeAllPeerConnection();
			if(this.pcType === 'local'){
				setTimeout(this.createLocalPeer(), 1000);				  
			}
			else if(this.pcType === 'remote'){
				this.createRemotePeer();
			}
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
		this.removeAllStreams();
		alert('all connection reset!');
	}
}