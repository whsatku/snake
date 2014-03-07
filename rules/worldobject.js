/**
 * Root of all objects in the world
 */
var WorldObject = function WorldObject(world){
	if(world === undefined){
		throw new Error("WorldObject constructor called without reference to world");
	}
	this.world = world;
};

WorldObject.prototype.x = 0;
WorldObject.prototype.y = 0;

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

module.exports = WorldObject;