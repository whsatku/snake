"use strict";

var EventEmitter = require("events").EventEmitter;
var randy = require("randy");
var Snake = require("./snake");
var Powerup = require("./powerup");
var maps = require("./maps");

var Game = function SnakeGame(){
	this.objects = [];
	this._snakes = [];
	this.state = {
		state: Game.STATES.PREPARE,
		powerUpCollected: 0,
		powerUpToEnd: 5,
		width: 40,
		height: 30,
		updateRate: 100,
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

Game.prototype.addSnake = function(snake){
	if(snake === undefined){
		snake = this._createSnake();
	}
	this.objects.push(snake);
	this._snakes.push(snake);
	return snake;
};

Game.prototype._createSnake = function(){
	var snake = new Snake(this);
	snake.randomPosition();
	return snake;
};

Game.prototype.step = function(){
	this.state.state = Game.STATES.IN_PROGRESS;
	this.state.step++;
	for(var index in this.objects){
		this.objects[index].update();
	}
	this.checkAllCollision();
	this.generatePowerup();
	this.emit("step");
};

Game.prototype.checkAllCollision = function(){
	var objects = this.objects.slice(0);
	for(var index in objects){
		var currentObject = objects[index];
		var collisions = this.checkCollision(currentObject);
		for(var cIndex in collisions){
			currentObject.emit("collision", collisions[cIndex]);
		}
	}
};

Game.prototype.checkCollision = function(object){
	var objects = this.objects.slice(0);
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
	if(this.hasActivePowerup(true)){
		return;
	}

	var powerup = new Powerup(this);
	powerup.randomPosition();

	this.objects.push(powerup);
	return powerup;
};

Game.prototype.hasActivePowerup = function(onlyNormal){
	for(var index in this.objects){
		if(
			this.objects[index] instanceof Powerup &&
			(
				(onlyNormal === true && this.objects[index].constructor == Powerup) ||
				onlyNormal !== true
			)
		){
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

	var legend = {
		"#": require("./obstacle")
	};

	for(var y = 0; y < this.state.height; y++){
		for(var x = 0; x < this.state.width; x++){
			var Obj = legend[map[y][x]];
			if(Obj !== undefined){
				var instance = new Obj(this);
				instance.x = x;
				instance.y = y;
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
	return this.state;
};

Game.prototype.loadState = function(state){
	this.state = state;
	this.random = randy.instance(state.rng);

	var index = require("./index");
	var self = this;
	this._snakes = [];
	this.loadMap(state.map);
	this.state.objects.forEach(function(item){
		if(!index[item._type]){
			console.error("unknown object type "+item._type);
			return;
		}
		var object = new index[item._type](self);
		object.loadState(item);

		if(item._type == "Snake"){
			self.addSnake(object);
		}else{
			self.objects.push(object);
		}
	});

	this.emit("loadState");
};

module.exports = Game;