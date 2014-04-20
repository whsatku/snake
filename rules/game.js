"use strict";

var EventEmitter = require("eventemitter2").EventEmitter2;
var randy = require("randy");
var Snake = require("./snake");
var Powerup = require("./powerup");
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
		powerUpCollected: 0,
		powerUpToEnd: 5,
		width: 40,
		height: 30,
		updateRate: 150,
		map: null,
		step: 0
	};
	this._seedRng();
};
Game.STATES = {
	PREPARE: 0,
	IN_PROGRESS: 1,
	END: 2
};

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
	var snake = new Snake(this);
	snake.name = data.name;
	snake.color = data.color;
	return snake;
};

Game.prototype.step = function(){
	this.state.state = Game.STATES.IN_PROGRESS;
	this.state.step++;
	var objects = this.objects.slice(0);
	for(var index in objects){
		objects[index].beforeStep();
	}
	for(var index in objects){
		objects[index].update();
	}
	this.checkAllCollision();
	this.generatePowerup();
	this.emit("step");
};

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
	}
	if(!this.hasActivePowerup(false)){
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
	if(!snake){
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
	this.state.width = map[0].length;
	this.state.height = map.length;

	this.objects = [];

	var Obstacle = require("./obstacle");

	for(var y = 0; y < this.state.height; y++){
		for(var x = 0; x < this.state.width; x++){
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

module.exports = Game;