(function(){
"use strict";

var Netcode = function(game){
	if(!(this instanceof Netcode)){
		return new Netcode(game);
	}
	this.game = game;
};

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
	this.log("Connected to server");
	if(WebRTC.isSupported()){
		this.send({command: "rtc"});
	}
	this.send({command: "lobbyjoin", lobby: 0});
};

Netcode.prototype.onClose = function(){
	this.log("Connection lost! Attempting to reconnect...");
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
			}else{
				this.send({command: "ready"});
			}
		}
	}
	if(data.snakeIndex !== undefined){
		this.game.player = data.snakeIndex;
	}
	if(data.motd !== undefined){
		this.log("Message of the Day:\n" + data.motd);
	}
	if(data.online !== undefined){
		this.log("Players online: " + data.online);
	}
	if(data.rtcOffer !== undefined){
		this.rtcAnswer(data);
	}
	if(data.rtc !== undefined){
		this.rtcCall(data.rtc);
	}
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