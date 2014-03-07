"use strict";

var Snake = require("./snake");
var EventEmitter = require('events').EventEmitter;

var Game = function SnakeGame(){
};
Game.STATES = {
	PREPARE: 0,
	IN_PROGRESS: 1,
	END: 2
};

require("util").inherits(Game, EventEmitter);

/**
 * Everything other clients need to sync up
 */
Game.prototype.state = {
	state: Game.STATES.PREPARE,
	powerUpCollected: 0,
	powerUpToEnd: 5,
	snakes: [],
	powerUp: [],
	width: 30,
	height: 20,
};

Game.prototype.objects = [];

Game.prototype.addSnake = function(snake){
	if(snake === undefined){
		snake = new Snake(this);
	}
	this.objects.push(snake);
	return snake;
};

Game.prototype.step = function(){
	for(var index in this.objects){
		this.objects[index].update();
	}
	this.emit("step");
};

module.exports = Game;