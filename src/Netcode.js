(function(){
"use strict";

var Netcode = function(){
	if(!(this instanceof Netcode)){
		return new Netcode();
	}
	GameLogic.event.call(this);
	
	this.rtc = new WebRTC(this);

	// ease debugging
	window.netcode = this;
};

Netcode.prototype = GameLogic.event.prototype;

Netcode.Const = {
	LobbyState: {
		"LOBBY": 0,
		"WAIT_FOR_LOAD": 1,
		"IN_GAME": 2,
		"FINISHED": 3
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

	if(typeof data.state !== undefined && data.state !== this.lastLobbyState){
		this.lastLobbyState = data.state;
		delete this.lastEndScreen;
		this.emit("state", data.state);
	}
	if(typeof data.game == "object"){
		this.lastGameState = data.game;
	}
	if(typeof data.endscreen == "object"){
		this.lastEndScreen = data.endscreen;
	}
	if(typeof data.ping == "object"){
		this.ping = data.ping;
	}
	if(data.motd !== undefined){
		this.emit("motd", data.motd);
		this.motd = data.motd;
	}
	if(data.online !== undefined){
		this.emit("online", data.online);
		this.online = data.online;
	}
	this.emit("data", data);
};

Netcode.prototype.send = function(data){
	return this.primus.write(data);
};

Netcode.prototype.input = function(key){
	return this.send({command: "input", key: key});
};

window.Netcode = Netcode;

})();