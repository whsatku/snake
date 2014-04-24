"use strict";

var _ = require("underscore");
var Lobby = require("./lobby");
var winston = require("winston");

var SnakeServer = function SnakeServer(){
	this.lobby = {};
	this._id = 0;
	this.cleanupInterval = 60000;
	this.motd = "";
};

SnakeServer.prototype.id = function(){
	return this._id++;
};

SnakeServer.prototype.bind = function(primus){
	var self = this;
	this.primus = primus;
	this.primus.on("connection", function(spark){
		if(self.motd){
			spark.write({motd: self.motd});
		}
		spark.write({online: Object.keys(self.primus.connections).length});
		spark.on("data", function(data){
			self.handleMessage(spark, data);
		});
	});
	this.primus.on("disconnection", function(spark){
		winston.debug("Spark %s has disconnected", spark.address.ip);
		if(spark.lobby){
			spark.lobby.removeClient(spark);
		}
	});
};

SnakeServer.prototype.handleMessage = function(spark, data){
	switch(data.command){
		case "lobbycreate":
			this.createLobby(spark);
			break;
		case "lobbyjoin":
			this.joinLobby(spark, data.lobby);
			break;
		case "lobbylist":
			this.listLobby(spark);
			break;
		case "rtc":
			spark.useRTC = true;
			break;
	}
	if(spark.lobby){
		switch(data.command){
			case "ready":
				spark.lobby.setReady(spark, data.ready !== undefined ? !!data.ready : true);
				break;
			case "input":
				spark.lobby.input(spark, data.key);
				break;
			case "desync":
				winston.info("[Lobby %s] Desync player %s", spark.lobby.id, spark.snakeIndex);
				spark.lobby.sendState(spark);
				break;
			case "rtcOffer":
				this.relayRTCOffer(spark, data);
				break;
			case "lobbystart":
				this.startLobby(spark);
				break;
			case "lobbyleave":
				spark.lobby.removeClient(spark);
				break;
			case "lobbysettings":
				if(!spark.lobby.isLobbyHead(spark)){
					spark.write({error: "noperm"});
					winston.info("[Lobby %s] Spark %s tried to set settings", spark.lobby.id, spark.id);
					break;
				}
				spark.lobby.setSettings(data.settings);
				break;
			case "user":
				spark.lobby.setUserData(spark, data.user);
				break;
		}
	}
};

SnakeServer.prototype.createLobby = function(spark){
	var lobby = new Lobby(this.id());
	this.lobby[lobby.id] = lobby;
	this.joinLobby(spark, lobby.id);
	winston.info("[Lobby %s] Created", lobby.id, {ip: spark.address.ip});
	return lobby;
};

SnakeServer.prototype.joinLobby = function(spark, lobbyid){
	if(this.lobby[lobbyid] === undefined){
		spark.write({error: "nolobby"});
		return;
	}
	if(spark.lobby){
		spark.lobby.removeClient(spark);
	}
	var lobby = this.lobby[lobbyid];
	if(lobby.addClient(spark)){
		winston.info("[Lobby %s] %s has joined (%d clients)", lobby.id, spark.address.ip, lobby.clients.length);
		return lobby;
	}else{
		spark.write({error: "lobbyfull"});
	}
};

SnakeServer.prototype.startLobby = function(spark){
	if(spark.lobby.clients[0] !== spark){
		spark.write({error: "noperm"});
		winston.warn("[Lobby %s] Attempted start by %s", spark.lobby.id, spark.address.ip);
		return;
	}
	spark.lobby.startLobby();
	winston.info("[Lobby %s] Started by %s", spark.lobby.id, spark.address.ip);
};

SnakeServer.prototype.autoCleanup = function(){
	this._cleanupTimer = setInterval(this.cleanup.bind(this), this.cleanupInterval);
};

SnakeServer.prototype.cleanup = function(){
	this.lobby = _.filter(this.lobby, function(item){
		return item.clients.length > 0;
	});
};

SnakeServer.prototype.relayRTCOffer = function(spark, data){
	var target = _.filter(this.primus.connections, function(x){
		return x.id == data.to && x.lobby === spark.lobby;
	});
	if(target.length === 0){
		return;
	}
	target = target[0];
	data.from = spark.id;
	target.write(data);
};

SnakeServer.prototype.listLobby = function(spark){
	var lobbyList = _.map(this.lobby, function(lobby){
		if(lobby.state != Lobby.STATE.LOBBY){
			return;
		}
		return {
			"id": lobby.id,
			"name": lobby.settings.name,
			"map": lobby.settings.map,
			"players": lobby.clients.length,
			"maxPlayers": lobby.maxClients
		}
	});
	lobbyList = _.compact(lobbyList);
	spark.write({
		lobby: lobbyList
	});
};

SnakeServer.prototype.demoServer = function(){
	winston.debug("Demo mode enabled");
	clearInterval(this._cleanupTimer);
	var id = this.id();
	this.lobby[id] = new Lobby(id);
	this.lobby[id].startGame();
};

module.exports = SnakeServer;