"use strict";

var _ = require("underscore");
var Lobby = require("./lobby");

var SnakeServer = function SnakeServer(){
	this.lobby = {};
	this._id = 0;
	this.cleanupInterval = 60000;
};

SnakeServer.prototype.id = function(){
	return this._id++;
};

SnakeServer.prototype.bind = function(primus){
	var self = this;
	this.primus = primus;
	this.primus.on("connection", function(spark){
		spark.on("data", function(data){
			self.handleMessage(spark, data);
		});
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
		case "lobbystart":
			this.startLobby(spark);
			break;
	}
};

SnakeServer.prototype.createLobby = function(spark){
	var lobby = new Lobby();
	lobby.id = this.id();
	this.lobby[lobby.id] = lobby;
	this.joinLobby(spark, lobby.id);
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
	lobby.addClient(spark);
	return lobby;
};

SnakeServer.prototype.startLobby = function(spark){
	if(spark.lobby === undefined){
		return;
	}
	if(spark.lobby.clients[0] !== spark){
		spark.write({error: "noperm"});
		return;
	}
	spark.lobby.startGame();
};

SnakeServer.prototype.autoCleanup = function(){
	this._cleanupTimer = setInterval(this.cleanup.bind(this), this.cleanupInterval);
};

SnakeServer.prototype.cleanup = function(){
	this.lobby = _.filter(this.lobby, function(item){
		return item.clients.length > 0;
	});
};

module.exports = SnakeServer;