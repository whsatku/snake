"use strict";

var _ = require("lodash");
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
	this.maxClients = Lobby.MAX_CLIENT;
	this.state = Lobby.STATE.LOBBY;
	this.on("ready", this.onReady.bind(this));
	this.on("playerReady", this.onPlayerReady.bind(this));
	this.lastTick = 0;
	this.cmdQueue = [];
	this.waitClients = false;
	this.settings = {
		game: "snake",
		name: Lobby.DEFAULT_NAME,
		map: Lobby.DEFAULT_MAP,
		fragLimit: 0,
		scoreLimit: 200,
		itemLimit: 100,
		perk: true
	};
};

Lobby.STATE = {
	"LOBBY": 0,
	"WAIT_FOR_LOAD": 1,
	"IN_GAME": 2,
	"FINISHED": 3
};

Lobby.MAX_CLIENT = 6;
Lobby.DEFAULT_NAME = "Untitled";
Lobby.DEFAULT_MAP = "plain";
Lobby.VALID_SETTINGS = ["game", "name", "map", "scoreLimit", "itemLimit", "fragLimit", "perk"];

require("util").inherits(Lobby, EventEmitter);

Lobby.prototype.addClient = function(spark){
	if(this.clients.length >= this.maxClients && this.maxClients > 0){
		return false;
	}
	if(this.state === Lobby.STATE.FINISHED){
		return false;
	}

	if(spark.useRTC){
		// TODO: Make this send after game started or mid-game joining
		this.broadcast({"rtc": spark.id});
	}

	spark.lobby = this;
	spark.ready = false;
	spark.color = this.getFreeColor();
	this.clients.push(spark);

	if(this.state === Lobby.STATE.IN_GAME){
		this.createSnakeForClient(spark);
	}

	var state = this.getState();
	state.playerIndex = this.clients.length - 1;
	spark.write(state);

	return true;
};

Lobby.prototype.createSnakeForClient = function(spark){
	spark.snake = this.game.addSnake({
		name: spark.name,
		color: spark.color
	});
	spark.snakeIndex = spark.snake.index;
	spark.write({
		lobby: this.id,
		snakeIndex: spark.snakeIndex
	});
	this.cmdQueue.push(["addSnake", {
		name: spark.name,
		color: spark.color
	}]);
};

Lobby.prototype.removeClient = function(spark){
	if(spark.lobby !== this){
		return;
	}

	if(spark.snake){
		var removeIndex = this.game.removeSnake(spark.snakeIndex);
		this.cmdQueue.push(["removeSnake", removeIndex]);
	}

	this.clients = _.without(this.clients, spark);
	delete spark.lobby;

	if(this.isAllReady()){
		this.emit("ready");
	}

	if(this.state == Lobby.STATE.LOBBY){
		this.sendStateToAll();
	}
};

Lobby.prototype.startLobby = function(){
	this.setAllReady(false);
	this.state = Lobby.STATE.WAIT_FOR_LOAD;

	switch(this.settings.game){
		case "snake":
			var GameLogic = require("./rules");
			this.game = new GameLogic.Game();
			break;
		case "nunin":
			this.game = new (require("./nunin"))();
			break;
	}

	this.game.setSettings(this.settings);
	this.game.on("gameOver", this.onGameOver.bind(this));

	this.sendStateToAll();
};

Lobby.prototype.startGame = function(){
	if(this.state === Lobby.STATE.IN_GAME){
		return;
	}
	this.setAllReady(false);
	this.state = Lobby.STATE.IN_GAME;

	for(var i = 0; i < this.clients.length; i++){
		this.createSnakeForClient(this.clients[i]);
	}

	this.lastTick = new Date().getTime();

	this.sendStateToAll(true);
	this._autoNextTick();
};

/**
 * Send message to all clients
 * @param Object Message
 * @param Function (optional) Message transform for each clients
 * note that message is reused between clients
 */
Lobby.prototype.broadcast = function(data, each){
	for(var i = 0; i < this.clients.length; i++){
		if(typeof each == "function"){
			each(data, this.clients[i], i);
		}
		this.clients[i].write(data);
	}
};

Lobby.prototype.sendStateToAll = function(hashed){
	var state = this.getState(hashed);
	this.broadcast(state, function(data, client, index){
		data.playerIndex = index;
	});
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
	if(this.state === Lobby.STATE.LOBBY || this.state === Lobby.STATE.WAIT_FOR_LOAD){
		state.settings = this.settings;
		state.players = [];
		for(var i = 0; i < this.clients.length; i++){
			var player = this.clients[i];
			state.players.push({
				name: player.name,
				color: player.color,
				ready: player.ready
			});
		}
	}
	if(this.state === Lobby.STATE.FINISHED){
		state.endscreen = this.game.getEndscreenData();
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

	this.emit("playerReady", spark);

	if(this.isAllReady()){
		this.emit("ready");
	}
};

Lobby.prototype.onPlayerReady = function(spark){
	if(this.state === Lobby.STATE.LOBBY && !spark.name){
		spark.ready = false;
	}
	if(this.state === Lobby.STATE.LOBBY || this.state === Lobby.STATE.WAIT_FOR_LOAD){
		this.sendStateToAll(true);
	}
};

Lobby.prototype.onReady = function(){
	switch(this.state){
		case Lobby.STATE.WAIT_FOR_LOAD:
			this.startGame();
			break;
		case Lobby.STATE.IN_GAME:
			if(this.waitTick){
				return;
			}

			var self = this;
			var timeSinceTick = new Date().getTime() - this.lastTick;

			if(this.waitClients){
				if(timeSinceTick >= this.game.state.updateRate){
					this.nextTick();
				}else{
					this.waitTick = true;
					setTimeout(function(){
						self.waitTick = false;
						self.nextTick();
					}, this.game.state.updateRate - timeSinceTick);
				}
			}
			break;
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
	this._autoNextTick();
};

Lobby.prototype._autoNextTick = function(){
	var self = this;
	if(this.waitClients){
		return;
	}
	if(this._autoNextTickTimer){
		return;
	}
	if(this.clients.length === 0){
		return;
	}
	this._autoNextTickTimer = setTimeout(function(){
		self.nextTick();
	}, this.game.state.updateRate);
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

Lobby.prototype.setUserData = function(spark, data){
	spark.name = data.name !== undefined ? data.name : spark.name;

	if(data.color !== undefined && data.color != spark.color){
		// check for duplicate color
		var freeColor = this.getFreeColors();
		data.color = parseInt(data.color);

		if(freeColor.indexOf(data.color) != -1){
			spark.color = data.color;
		}
	}

	this.sendStateToAll();
};

Lobby.prototype.getFreeColors = function(){
	var available = [1,2,3,4,5,6];
	var notAvail = [];
	this.clients.forEach(function(client){
		notAvail.push(client.color);
	});

	return _.difference(available, notAvail);
};

Lobby.prototype.getFreeColor = function(){
	return this.getFreeColors()[0];
};

Lobby.prototype.isLobbyHead = function(spark){
	return this.clients.indexOf(spark) === 0;
};

Lobby.prototype.setSettings = function(settings){
	_.extend(this.settings, _.pick(settings, Lobby.VALID_SETTINGS));
	this.sendStateToAll();
};

Lobby.prototype.onGameOver = function(){
	this.state = Lobby.STATE.FINISHED;

	this.sendStateToAll(true);

	this.kickAll();
};

Lobby.prototype.kickAll = function(){
	this.clients.forEach(function(spark){
		delete spark.lobby;
	}, this);
	this.clients = [];
};

module.exports = Lobby;