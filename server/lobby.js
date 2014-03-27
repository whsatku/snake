"use strict";

var GameLogic = require("../rules/");
var _ = require("underscore");

var Lobby = function Lobby(){
	this.clients = [];
	this.state = Lobby.STATE.LOBBY;
};

Lobby.STATE = {
	"LOBBY": 0,
	"IN_GAME": 1,
	"FINISHED": 2
};

Lobby.prototype.addClient = function(spark){
	this.clients.push(spark);
	spark.lobby = this;
};

Lobby.prototype.removeClient = function(spark){
	if(spark.lobby !== this){
		return;
	}
	this.clients = _.without(this.clients, spark);
	delete spark.lobby;
};

Lobby.prototype.startGame = function(){
	this.state = Lobby.STATE.IN_GAME;
	this.game = new GameLogic.Game();

	for(var i = 0; i < this.clients.length; i++){
		this.clients[i].snake = this.game.addSnake();
		this.clients[i].snakeIndex = i;
	}

	// TODO: Lobby configuration
	this.game.loadMap("plain");
};

module.exports = Lobby;