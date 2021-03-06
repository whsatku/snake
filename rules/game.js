"use strict";

var EventEmitter = require("eventemitter2").EventEmitter2;
var randy = require("randy");
var Snake = require("./snake");
var AISnake = require("./aisnake");
var Powerup = require("./powerup");
var MovingWorldObject = require("./movingworldobject");
var PerkPowerup = require("./perkpowerup");
var maps = require("./maps");
var crc32 = require("crc32");

var Game = function SnakeGame(){
	EventEmitter.call(this, {
		wildcard: true
	});

	this.objects = [];
	this._snakes = [];
	this.state = {
		state: Game.STATES.PREPARE,
		updateRate: 150,
		map: null,
		step: 0,
		countdown: (Game.COUNTDOWN_COUNT * Game.TICK_PER_COUNTDOWN) + 1,
		perk: true,
		scoreLimit: 0,
		itemLimit: 0,
		fragLimit: 0
	};
	// sometimes something doesn't need to be always synced
	// if this hit the limit, netcode would just send scoreboard to the client
	this.itemsSpawned = 0;
	this._seedRng();
	this.startTime = new Date().getTime();
	this.on("snake.dead", this.onSnakeDead.bind(this));
};
Game.STATES = {
	PREPARE: 0,
	IN_PROGRESS: 1,
	END: 2
};
// best: update_rate = 150, 6*150 = 900
// worst: update_rate = 200, 6*200 = 1200
Game.TICK_PER_COUNTDOWN = 6;
Game.COUNTDOWN_COUNT = 3;
Game.VALID_SETTINGS = ["map", "scoreLimit", "itemLimit", "fragLimit", "perk"];

require("util").inherits(Game, EventEmitter);

Game.prototype._seedRng = function(){
	this.random = randy.instance();
};

Game.prototype.addSnake = function(snake, alive){
	if(!(snake instanceof Snake)){
		snake = this._createSnake(snake);
	}
	this._bindSnake(snake);
	this.objects.push(snake);
	snake.index = this._snakes.length;
	this._snakes.push(snake);
	if(alive !== true){
		snake.die(true);
	}
	return snake;
};

Game.prototype._bindSnake = function(snake){
	var self = this;
	snake.onAny(function(){
		var args = Array.prototype.slice.call(arguments, 0);
		args.unshift(snake);
		args.unshift(["snake", this.event]);
		self.emit.apply(self, args);
	});
};

Game.prototype.removeSnake = function(snake){
	if(typeof snake != "number"){
		snake = this._snakes.indexOf(snake);
		if(snake === -1){
			return false;
		}
	}
	this.removeChild(this._snakes[snake]);
	this._snakes[snake] = undefined;

	return snake;
};

Game.prototype._createSnake = function(data){
	var snake;
	if(data.bot){
		snake = new AISnake(this);
	}else{
		snake = new Snake(this);
	}
	if(data instanceof Object){
		snake.name = data.name;
		snake.color = data.color;
	}
	return snake;
};

Game.prototype.step = function(){
	if(this.state.state !== Game.STATES.IN_PROGRESS){
		this.state.state = Game.STATES.IN_PROGRESS;
		this.emit("stateChange", Game.STATES.IN_PROGRESS);
	}

	if(this.state.countdown > 0){
		this._countdownStep();
	}else{
		this._gameStep();
	}
	this.emit("step");
};

Game.prototype._countdownStep = function(){
	var lastCd = Math.ceil(this.state.countdown / Game.TICK_PER_COUNTDOWN);
	this.state.countdown--;
	var currentCd = Math.ceil(this.state.countdown / Game.TICK_PER_COUNTDOWN);

	if(currentCd != lastCd){
		if(currentCd === 0){
			// if snakes are spawning, spawn them immediately
			this._spawnAllSnakes();
		}
		this.emit("countdown", currentCd);
	}
};

Game.prototype._gameStep = function(){
	this.state.step++;
	var objects = this.objects.slice(0);
	for(var index in objects){
		objects[index].beforeStep();
	}
	for(var index in objects){
		objects[index].update();
	}
	this.checkAllCollision();
	this.checkWinCondition();
	this.generatePowerup();
};

Game.prototype._spawnAllSnakes = function(){
	for(var i = 0; i < this._snakes.length; i++){
		var snake = this._snakes[i];
		if(!(snake instanceof Snake)){
			continue;
		}
		snake.removePerk("respawn");
	}
}

Game.prototype.checkAllCollision = function(){
	var objects = this.objects.slice(0);
	for(var index in objects){
		var currentObject = objects[index];
		var collisions = this.checkCollision(currentObject, objects);
		for(var cIndex in collisions){
			currentObject.emit("collision", collisions[cIndex]);
		}
	}
};

Game.prototype.checkCollision = function(object, objects){
	if(objects === undefined){
		objects = this.objects.slice(0);
	}
	var collisions = [];
	for(var index in objects){
		var otherObject = objects[index];
		if(object.isCollideWith(otherObject)){
			collisions.push(otherObject);
		}
	}
	return collisions;
};

Game.prototype.generatePowerup = function(){
	if(!this.hasActivePowerup(true)){
		var powerup = new Powerup(this);
		powerup.randomPosition();

		this.objects.push(powerup);
		this.itemsSpawned++;
	}
	if(!this.hasActivePowerup(false) && this.state.perk){
		if(this.random.random() < 0.01){
			var perk = this.getRandomPerk();
			if(perk !== undefined){
				var ppowerup = new PerkPowerup(this);
				ppowerup.perk = perk[0];
				ppowerup.perkTime = perk[1];
				ppowerup.randomPosition();

				this.objects.push(ppowerup);
			}
		}
	}
};

Game.prototype.getRandomPerk = function(){
	// [perkName, perkTimer]
	var perkList = [
		["bite", 100],
		["inverse_collect", 56],
		["reverse_collect", 1]
	];
	var perk;
	for(var i = 0; i<perkList.length * 2; i++){
		perk = this.random.choice(perkList);
		if(!this.hasActivePerk(perk[0])){
			break;
		}else{
			perk = undefined;
		}
	}
	return perk;
};

Game.prototype.hasActivePowerup = function(onlyNormal){
	for(var index in this.objects){
		if(onlyNormal === true){
			if(this.objects[index].constructor.cls == "Powerup"){
				return true;
			}
		}else if(onlyNormal === false){
			if(this.objects[index] instanceof Powerup && this.objects[index].constructor.cls != "Powerup"){
				return true;
			}
		}else{
			if(this.objects[index] instanceof Powerup){
				return true;
			}
		}
	}
	return false;
};

Game.prototype.hasActivePerk = function(perk){
	for(var index in this._snakes){
		if(!this._snakes[index]){
			continue;
		}else if(this._snakes[index].hasPerk(perk)){
			return true;
		}
	}
	return false;
};

Game.prototype.getSnake = function(id){
	return this._snakes[id];
};

Game.prototype.input = function(player, input){
	var snake = this.getSnake(player);
	if(!snake || snake.dead){
		return false;
	}

	return snake.input(input);
};

Game.prototype.removeChild = function(child){
	var index = this.objects.indexOf(child);
	if(index === -1){
		return;
	}
	child.cleanup();
	arrayRemove(this.objects, index);
};

// http://ejohn.org/blog/javascript-array-remove/
var arrayRemove = function(array, from, to){
	var rest = array.slice((to || from) + 1 || array.length);
	array.length = from < 0 ? array.length + from : from;
	return array.push.apply(array, rest);
};

Game.prototype.loadMap = function(mapName){
	if(maps[mapName] === undefined){
		throw new Error("Unknown map");
	}
	var map = maps[mapName].split("\n");
	this.state.map = mapName;
	this.width = map[0].length;
	this.height = map.length;

	this.objects = [];

	var Obstacle = require("./obstacle");

	for(var y = 0; y < this.height; y++){
		for(var x = 0; x < this.width; x++){
			if(map[y] && [undefined, null, " "].indexOf(map[y][x]) == -1){
				var instance = new Obstacle(this);
				instance.x = x;
				instance.y = y;
				instance.type = map[y][x];
				this.objects.push(instance);
			}
		}
	}
};

Game.prototype.prepareState = function(){
	var self = this;
	this.state.objects = [];
	this.objects.forEach(function(item){
		var state = item.getState();
		if(Object.keys(state).length === 0){
			// this object prefer not to be synced
			return;
		}
		state._type = item.constructor.cls;
		self.state.objects.push(state);
	});
	this.state.rng = this.random.getState();
	this.state.snake = [];
	this._snakes.forEach(function(snake){
		self.state.snake.push(snake ? snake.index : undefined);
	});
	return this.state;
};

Game.prototype.hashState = function(){
	return crc32(JSON.stringify(this.state));
};

Game.prototype.loadState = function(state){
	this.state = state;
	this.random = randy.instance(state.rng);

	var index = require("./index");
	var self = this;
	this._snakes = state.snake;
	this.loadMap(state.map);
	this.state.objects.forEach(function(item){
		if(!index[item._type]){
			console.error("unknown object type "+item._type);
			return;
		}
		var object = new index[item._type](self);
		object.loadState(item);

		self.objects.push(object);

		if(object instanceof Snake){
			self._snakes[object.index] = object;
			self._bindSnake(object);
		}
	});

	this.emit("loadState");
};

Game.prototype.setSettings = function(settings){
	for(var key in settings){
		if(Game.VALID_SETTINGS.indexOf(key) != -1){
			this.state[key] = settings[key];
		}
		if(key == "map"){
			this.loadMap(settings[key]);
		}
	}
};

Game.prototype.onSnakeDead = function(snake){
	if(this.state.fragLimit > 0 && snake.death >= this.state.fragLimit){
		snake.reset();
		snake.direction = MovingWorldObject.DIR.STOP;
		snake.hidden = true;
		snake.dead = true;
		this.emit("snake.gameOver", snake);
	}
	if(!this.hasSnakeAlive()){
		this.state.state = Game.STATES.END;
		this.emit("gameOver");
	}
};

Game.prototype.getEndscreenData = function(){
	var out = {
		settings: {},
		snakes: [],
		time: new Date().getTime() - this.startTime
	}

	Game.VALID_SETTINGS.forEach(function(item){
		out.settings[item] = this.state[item];
	}, this);

	this._snakes.forEach(function(snake){
		if(!(snake instanceof Snake)){
			return;
		}

		out.snakes.push(snake.getEndscreenData());
	});

	return out;
};

Game.prototype.hasSnakeAlive = function(){
	for(var i = 0; i < this._snakes.length; i++){
		if(this._snakes[i] instanceof Snake && !this._snakes[i].dead){
			return true;
		}
	}
	return false;
};

Game.prototype.checkWinCondition = function(){
	if(this.isGameWon()){
		this.state.state = Game.STATES.END;
		this.emit("gameOver");
	}
};

Game.prototype.isGameWon = function(){
	if(this.state.scoreLimit === 0 && this.state.itemLimit === 0){
		return false;
	}
	if(this.itemsSpawned > this.state.itemLimit){
		return true;
	}
	for(var i = 0; i < this._snakes.length; i++){
		var snake = this._snakes[i];
		if(!(snake instanceof Snake)){
			continue;
		}
		if(snake.score >= this.state.scoreLimit){
			return true;
		}
	}
	return false;
};

Game.prototype.getObjectAt = function(x, y){
	// note: does not work with multitile object (eg. snake)
	if(y === undefined){
		y = x[1];
		x = x[0];
	}
	for(var i = 0; i < this.objects.length; i++){
		var obj = this.objects[i];
		if(obj.x === x && obj.y === y){
			return obj;
		}
	}
	return null;
};

module.exports = Game;