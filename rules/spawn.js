"use strict";

var Spawn = function Spawn(){
	Spawn.super_.apply(this, arguments);
};

require("util").inherits(Spawn, require("./worldobject"));

Spawn.cls = "Spawn";
Spawn.prototype.deadly = true;

Spawn.prototype.fromSnake = function(snake){
	this.owner = snake.index;
	this.x = snake.x;
	this.y = snake.y;
};

Spawn.prototype.getState = function(){
	var state = Spawn.super_.prototype.getState.apply(this);
	state.owner = this.owner;
	return state;
};

Spawn.prototype.loadState = function(state){
	Spawn.super_.prototype.loadState.call(this, state);
	this.owner = state.owner;
};

module.exports = Spawn;
