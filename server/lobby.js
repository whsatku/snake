"use strict";

var GameLogic = require("../rules/");
var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;
var winston = require("winston");

/*
Flow:
(> .. = server)
1. lobbycreate
2. lobbystart
3. > startGame > sendStateToAll
4. ready
5. > setReady > onReady > nextTick > sendStateToAll(true)
*/

var Lobby = function Lobby(id){
	this.id = id;
	this.clients = [];
	this.state = Lobby.STATE.LOBBY;
	this.on("ready", this.onReady.bind(this));
	this.lastTick = 0;
	this.cmdQueue = [];
	this.waitClients = false;
};

Lobby.STATE = {
	"LOBBY": 0,
	"IN_GAME": 1,
	"FINISHED": 2
};

require("util").inherits(Lobby, EventEmitter);

Lobby.prototype.addClient = function(spark){
	spark.write(this.getState());

	if(this.state === Lobby.STATE.IN_GAME){
		this.createSnakeForClient(spark);
	}

	if(spark.useRTC){
		this.broadcast({"rtc": spark.id});
	}

	spark.lobby = this;
	this.clients.push(spark);
};

Lobby.prototype.createSnakeForClient = function(spark){
	spark.snake = this.game.addSnake();
	spark.snakeIndex = spark.snake.index;
	spark.write({
		lobby: this.id,
		snakeIndex: spark.snakeIndex
	});
	this.cmdQueue.push(["addSnake"]);
};

Lobby.prototype.removeClient = function(spark){
	if(spark.lobby !== this){
		return;
	}

	if(spark.snake){
		var removeIndex = this.game.removeSnake(spark.snakeIndex);
		this.cmdQueue.push(["removeSnake", removeIndex]);
	}

	this.broadcast({"disconnect": spark.snakeIndex});

	this.clients = _.without(this.clients, spark);
	delete spark.lobby;
};

Lobby.prototype.startGame = function(){
	if(this.state === Lobby.STATE.IN_GAME){
		return;
	}
	this.state = Lobby.STATE.IN_GAME;
	this.game = new GameLogic.Game();

	for(var i = 0; i < this.clients.length; i++){
		this.createSnakeForClient(this.clients[i]);
	}

	this.lastTick = new Date().getTime();

	// TODO: Lobby configuration
	this.game.loadMap("empty");

	this.sendStateToAll();
};

Lobby.prototype.broadcast = function(data){
	for(var i = 0; i < this.clients.length; i++){
		this.clients[i].write(data);
	}
};

Lobby.prototype.sendStateToAll = function(hashed){
	var state = this.getState(hashed);
	this.broadcast(state);
	this.cmdQueue = [];
};

Lobby.prototype.sendState = function(spark, hashed){
	var state = this.getState(hashed);
	spark.write(state);
};

Lobby.prototype.getState = function(hashed){
	var state = {
		lobby: this.id,
		state: this.state
	};
	if(this.game){
		state.game = this.game.prepareState();
		if(hashed === true){
			state.hash = this.game.hashState();
			state.cmd = this.cmdQueue;
			delete state.game;
		}
	}
	return state;
};

Lobby.prototype.setAllReady = function(val){
	for(var i = 0; i < this.clients.length; i++){
		this.clients[i].ready = val;
	}
	if(val){
		this.emit("ready");
	}
};

Lobby.prototype.isAllReady = function(){
	if(this.clients.length === 0){
		return false;
	}
	for(var i = 0; i < this.clients.length; i++){
		if(!this.clients[i].ready){
			return false;
		}
	}
	return true;
};

Lobby.prototype.setReady = function(spark, val){
	spark.ready = val;
	if(this.isAllReady()){
		this.emit("ready");
	}
};

Lobby.prototype.onReady = function(){
	if(this.state !== Lobby.STATE.IN_GAME){
		return;
	}else if(this.waitTick){
		return;
	}

	var self = this;
	var timeSinceTick = new Date().getTime() - this.lastTick;

	if(timeSinceTick >= this.game.state.updateRate){
		this.nextTick();
	}else{
		this.waitTick = true;
		setTimeout(function(){
			self.waitTick = false;
			self.nextTick();
		}, this.game.state.updateRate - timeSinceTick);
	}
};

Lobby.prototype.nextTick = function(){
	winston.debug("[Lobby %s] Tick after "+ (new Date().getTime() - this.lastTick) +" ms", this.id);

	if(this._autoNextTickTimer){
		clearTimeout(this._autoNextTickTimer);
		delete this._autoNextTickTimer;
	}

	this.lastTick = new Date().getTime();
	this.setAllReady(false);
	this.game.step();
	this.sendStateToAll(true);
	if(!this.waitClients){
		this._autoNextTick();
	}
};

Lobby.prototype._autoNextTick = function(){
	var self = this;
	if(this._autoNextTickTimer){
		return;
	}
	if(this.clients.length === 0){
		return;
	}
	this._autoNextTickTimer = setTimeout(function(){
		winston.warn("[Lobby %s] Client lags too much! Doing forcefully tick.", self.id);
		self.nextTick();
	}, this.game.state.updateRate + 20);
};

Lobby.prototype.input = function(spark, input){
	if(spark.snakeIndex === undefined){
		return;
	}
	var success = this.game.input(spark.snakeIndex, input);
	if(success){
		this.cmdQueue.push(["input", spark.snakeIndex, input]);
		winston.debug(["input", spark.snakeIndex, input]);
	}
};

module.exports = Lobby;