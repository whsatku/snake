"use strict";

var EventEmitter = require("events").EventEmitter;
var randy = require("randy");
var MovingWorldObject = require("./movingworldobject");
var Snake = require("./snake");

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
		snake = new Snake(this);
		snake.randomStartingPosition();
	}
	this.objects.push(snake);
	this._snakes.push(snake);
	return snake;
};

Game.prototype.step = function(){
	for(var index in this.objects){
		this.objects[index].update();
	}
	this.checkCollision();
	this.emit("step");
};

Game.prototype.checkCollision = function(){
	for(var index in this.objects){
		for(var otherIndex in this.objects){
			if(index === otherIndex){
				continue;
			}
			if(this.objects[index].isCollideWith(this.objects[otherIndex])){
				this.objects[index].emit("collision", this.objects[otherIndex]);
			}
		}
	}
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
}

module.exports = Game;