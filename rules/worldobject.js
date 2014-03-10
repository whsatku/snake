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

WorldObject.prototype.isCollideWith = function(b){
	if(!(b instanceof WorldObject)){
		throw new Error("isCollideWith called with object not type of WorldObject");
	}
	return this.x == b.x && this.y == b.y;
};

module.exports = WorldObject;