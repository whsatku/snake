"use strict";

var EventEmitter = require("events").EventEmitter;

/**
 * Root of all objects in the world
 */
var WorldObject = function WorldObject(world){
	if(world === undefined){
		throw new Error("WorldObject constructor called without reference to world");
	}
	this.world = world;
};

require("util").inherits(WorldObject, EventEmitter);

WorldObject.cls = "WorldObject";
WorldObject.prototype.x = 0;
WorldObject.prototype.y = 0;

/**
 * Does it make snake dies when crash into?
 */
WorldObject.prototype.deadly = true;

/**
 * This function is called by the game every tick
 * Child class must always call parent's.
 */
WorldObject.prototype.update = function(){
};

WorldObject.prototype.isOffScreen = function(){
	if(this.x < 0 || this.y < 0){
		return true;
	}
	if(this.x > this.world.state.width - 1){
		return true;
	}
	if(this.y > this.world.state.height - 1){
		return true;
	}
	return false;
};

WorldObject.prototype.isCollideWith = function(b, crosscheck){
	if(b === this){
		return false;
	}
	if(!(b instanceof WorldObject)){
		throw new Error("isCollideWith called with object not type of WorldObject");
	}
	return (this.x === b.x && this.y === b.y) || (crosscheck === false ? false : b.isCollideWith(this, false));
};

WorldObject.prototype.randomPosition = function(){
	this.x = this.world.random.randInt(0, this.world.state.width);
	this.y = this.world.random.randInt(0, this.world.state.height);

	while(this.world.checkCollision(this).length > 0){
		this.randomPosition();
	}
};

WorldObject.prototype.getState = function(){
	return {
		x: this.x,
		y: this.y,
		deadly: this.deadly
	};
};

WorldObject.prototype.loadState = function(state){
	this.x = state.x;
	this.y = state.y;
	this.deadly = state.deadly;
};

module.exports = WorldObject;