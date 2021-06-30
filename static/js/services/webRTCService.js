class WebRTCService{
	constructor(stunUrls){
		this.currentPeers = new Array();
		this.targetPeer = null;
		this.channels = new Array();
		this.websocketUrl = "wss://chat.yatata.xyz/";
		this.websocket = null;
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
						this.websocket.send(JSON.stringify(description));
					});
				}
				else if(message.type === "answer"){
					this.targetPeer.setRemoteDescription(message)
					.catch(e=>alert("answer failaure: ", e.name));
				} 
				else if(message.ice){
					this.targetPeer.addIceCandidate(message.ice)
					.catch(e=>alert("ice failaure: ", e.name));
				}
			}
		}
	}

	initPeer = () => {
		this.initWebsocket();
		const pc = new RTCPeerConnection(
			{
				iceServers: [
					{
						urls: this.stunUrls
					}
				]
			}
		);
		this.currentPeers.push(pc);
		if(this.stream){
			this.stream.getTracks()
			.forEach(track => pc.addTrack(track, this.stream));
		}
		pc.addEventListener('icecandidate', this.onIceCandidate);
		pc.addEventListener('track', this.onAddTrack);
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

	initWebsocket = () => {
		let id = prompt('please input peer ID');
		this.websocket = new WebSocket(this.websocketUrl + id);
		this.websocket.addEventListener('message', this.onMessage);
	}

	createPeer = () => this.initPeer().addEventListener('negotiationneeded',this.onCreate);
	joinPeer = () => this.initPeer().addEventListener('negotiationneeded',this.onJoin);

	onCreate = e => {
		this.targetPeer = e.target;
		this.targetPeer.addEventListener('datachannel',e=>{
			let channel = e.channel;
			channel.addEventListener('open',e=>{
				channel.send('your join in');
			});
			channel.addEventListener('message',e=>{
				console.log(e.data);
			});
		})
	}

	onJoin = e => {
		this.targetPeer = e.target;
		let channel = this.targetPeer.createDataChannel('chat');
		channel.addEventListener('open',()=>{
			channel.send('your host');
			this.channels.push(channel);
		});
		channel.addEventListener('message', e=>{
			console.log(e.data);
		})
		this.websocket.addEventListener('open',()=>{
			this.targetPeer.createOffer()
			.then(description => {
				this.targetPeer.setLocalDescription(description);
				this.websocket.send(JSON.stringify(description));
			});
		})
	}

	onAddTrack = e => {
		this.addStream({
			id: 'remote',
			cssText: `
				max-width:100vw;
				max-height:calc(100vh - 80px);
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

	removeAllVideos = () => {
		const shadow = document.querySelector('video-container').getShadow();
		const videoContainer = shadow.getElementById('videoContainer');
		videoContainer.innerText = '';
	}

	onIceCandidate = e => {
		this.targetPeer = e.target;
		if(e.candidate){
			this.websocket.send(JSON.stringify({ice:e.candidate}));
		}
	}
	
	closeAllPeer = () => {
		for(const pc of this.currentPeers){
			pc.close();
		}
		for(const channel of this.channels){
			channel.close();
		}
		this.currentPeers = new Array();
		this.channels = new Array();
		this.targetPeer = null;
		const videos = document.querySelectorAll('video');
		for(const video of videos){
			document.body.removeChild(video);
		}
		this.removeAllVideos();
		console.log('all connection reset!');
		this.websocket.close();
	}
}