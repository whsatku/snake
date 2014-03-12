"use strict";

var EventEmitter = require("events").EventEmitter;
var randy = require("randy");
var Snake = require("./snake");
var Powerup = require("./powerup");

var Game = function SnakeGame(){
	this.objects = [];
	this._snakes = [];
	this.state = {
		state: Game.STATES.PREPARE,
		powerUpCollected: 0,
		powerUpToEnd: 5,
		snakes: [],
		powerUp: [],
		width: 30,
		height: 20,
		updateRate: 500
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
	for(var index in this.objects){
		this.objects[index].update();
	}
	this.checkCollision();
	this.generatePowerup();
	this.emit("step");
};

Game.prototype.checkCollision = function(){
	var objects = this.objects.slice(0);
	for(var index in objects){
		var currentObject = objects[index];
		for(var otherIndex in objects){
			if(index === otherIndex){
				continue;
			}
			var otherObject = objects[otherIndex];
			if(currentObject.isCollideWith(otherObject)){
				currentObject.emit("collision", otherObject);
			}
		}
	}
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
		return;
	}

	snake.input(input);
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

module.exports = Game;