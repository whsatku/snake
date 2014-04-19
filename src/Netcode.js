(function(){
"use strict";

var Netcode = function(){
	if(!(this instanceof Netcode)){
		return new Netcode();
	}
	GameLogic.event.call(this);
};

Netcode.prototype = GameLogic.event.prototype;

Netcode.Const = {
	LobbyState: {
		"LOBBY": 0,
		"IN_GAME": 1,
		"FINISHED": 2
	}
};

/**
 * Get replaced by GameLayer's log implementation
 */
Netcode.prototype.log = function(txt){
	console.log(txt);
	this.emit("log", txt);
};

Netcode.prototype.getServer = function(){
	if(window.location.protocol == "file:"){
		return "http://localhost:45634/primus";
	}else{
		return window.location.protocol + "//" + window.location.hostname + ":45634/primus";
	}
};

Netcode.prototype.connect = function(){
	this.primus = Primus.connect(this.getServer());
	this.primus.on("open", this.onOpen.bind(this));
	this.primus.on("data", this.onData.bind(this));
	this.primus.on("close", this.onClose.bind(this));
};

Netcode.prototype.onOpen = function(){
	this.connected = true;
	this.log("Connected to server");
	this.emit("connected", true);
	if(WebRTC.isSupported()){
		this.send({command: "rtc"});
	}
};

Netcode.prototype.onClose = function(){
	this.connected = false;
	this.log("Connection lost! Attempting to reconnect...");
	this.emit("connected", false);
};

Netcode.prototype.onData = function(data){
	var self = this;

	if(data.state === Netcode.Const.LobbyState.IN_GAME){
		if(typeof data.game == "object"){
			this.game.loadState(data.game);
			this.send({command: "ready"});
		}else if(data.hash !== undefined){
			data.cmd.forEach(function(cmd){
				self.game[cmd[0]].apply(self.game, cmd.slice(1));
			});
			this.game.step();
			this.game.prepareState();
			var hash = this.game.hashState();
			if(hash != data.hash){
				console.error("desync", "local", hash, "server", data.hash);
				this.send({command: "desync"});
				this.emit("desync");
			}else{
				this.send({command: "ready"});
			}
		}
	}
	if(data.snakeIndex !== undefined){
		this.game.player = data.snakeIndex;
	}
	if(data.motd !== undefined){
		this.emit("motd", data.motd);
		this.motd = data.motd;
	}
	if(data.online !== undefined){
		this.emit("online", data.online);
		this.online = data.online;
	}
	// if(data.rtcOffer !== undefined){
	// 	this.rtcAnswer(data);
	// }
	// if(data.rtc !== undefined){
	// 	this.rtcCall(data.rtc);
	// }
	this.emit("data", data);
};

Netcode.prototype.send = function(data){
	return this.primus.write(data);
};

Netcode.prototype.input = function(key){
	return this.send({command: "input", key: key});
};

// Override these
Netcode.prototype.rtcAnswer = function(){};
Netcode.prototype.rtcCall = function(){};

Netcode.prototype.rtcCall = function(){

};

window.Netcode = Netcode;

})();