(function(){
"use strict";

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
window.URL = window.URL || window.webkitURL || window.mozURL;
window.RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;

var WebRTC = function WebRTC(netcode){
	if(!(this instanceof WebRTC)){
		return new WebRTC(netcode);
	}
	this.connections = {};
	this.bind(netcode);
	navigator.getUserMedia({audio: true}, this.onGotStream.bind(this), function(err){
		console.error(err);
	});
};

WebRTC.isSupported = function(){
	return window.RTCPeerConnection !== undefined &&
		navigator.getUserMedia !== undefined;
};

WebRTC.prototype.log = function(txt){
	console.log(txt);
};

WebRTC.prototype.bind = function(netcode){
	var self = this;
	this.netcode = netcode;
	this.netcode.on("data", function(data){
		if(data.rtcOffer !== undefined){
			self.accept(data.from, data.rtcOffer);
		}
		if(data.rtc !== undefined){
			self.call(data.rtc);
		}
	});
};

WebRTC.prototype.call = function(id){
	var self = this;
	if(!this.stream){
		return setTimeout(function(){
			self.call(id);
		}, 100);
	}
	console.log("[WebRTC] Calling", id);

	var connection = this._createPeerConnection(id);
	connection.createOffer(function(offer){
		connection.setLocalDescription(offer);
		self.netcode.send({
			"command": "rtcOffer",
			"rtcOffer": offer,
			"to": id
		});
	}, function(err){
		console.error(err);
	});
};

WebRTC.prototype.accept = function(from, offer){
	var self = this;
	if(!this.stream){
		return setTimeout(function(){
			self.accept(from, offer);
		}, 100);
	}
	var desc = new RTCSessionDescription(offer);
	if(desc.type == "offer"){
		console.log("[WebRTC] Accepting offer from", from);
		var connection = this._createPeerConnection(from);
		connection.setRemoteDescription(desc);
		connection.createAnswer(function(answer){
			connection.setLocalDescription(answer);
			self.netcode.send({
				"command": "rtcOffer",
				"rtcOffer": answer,
				"to": from
			});
		}, function(err){
			console.error(err);
		});
	}else{
		console.log("[WebRTC] Completing call to", from);
		var connection = this.connections[from];
		if(!connection){
			return;
		}
		connection.setRemoteDescription(desc);
	}
};

WebRTC.prototype._createPeerConnection = function(id){
	var self = this;
	try{
		var connection = new RTCPeerConnection({
			"iceServers": [
				{"url": "stun:stun.l.google.com:19302"},
				{"url": "stun:stun1.l.google.com:19302"},
				{"url": "stun:stun2.l.google.com:19302"},
				{"url": "stun:stun3.l.google.com:19302"},
				{"url": "stun:stun4.l.google.com:19302"}
			]
		});
		connection.addStream(this.stream);
		connection.onaddstream = function(e){
			var audio = document.createElement("audio");
			audio.autoplay = true;
			audio.src = URL.createObjectURL(e.stream);
			document.body.appendChild(audio);
			connection.element = audio;
		};
		connection.onremovestream = function(){
			if(connection.element){
				console.log("[WebRTC] Stream remove "+id);
				document.body.removeChild(connection.element);
			}
		};
		connection.onsignalingstatechange = function(){
			if(connection.element && connection.signalingState == "closed"){
				console.log("[WebRTC] Closed "+id);
				document.body.removeChild(connection.element);
			}
		};
		this.connections[id] = connection;
		return connection;
	}catch(e){
		console.error(e);
	}
};

WebRTC.prototype.onGotStream = function(stream){
	this.stream = stream;
	this.muteMic(true);
	this.log("Voice enabled. Hold v to talk");
};

WebRTC.prototype.muteMic = function(val){
	if(!this.stream){
		return;
	}
	var tracks = this.stream.getAudioTracks();
	if(tracks.length === 0){
		return;
	}
	tracks[0].enabled = !val;
};

WebRTC.prototype.disconnectAll = function(){
	for(var key in this.connections){
		var peer = this.connections[key];
		peer.close();
		document.body.removeChild(peer.element);
		delete this.connections[key];
	}
};

window.WebRTC = WebRTC;

})();