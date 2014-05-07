"use strict";

var pathfinder = require("a-star");
var Powerup = require("./powerup");
var WorldObject = require("./worldobject");

var AISnake = function AISnake(){
	AISnake.super_.apply(this, arguments);

	["isEnd", "neighbor", "distance", "heuristic", "hash"].forEach(function(fn){
		this[fn] = this[fn].bind(this);
	}, this);
};

AISnake.AI_BUDGET = 5;

// AI calculation should not be redone on other clients
AISnake.cls = "Snake";

require("util").inherits(AISnake, require("./snake"));

AISnake.prototype.beforeStep = function(){
	AISnake.super_.prototype.beforeStep.apply(this, arguments);

	this._powerup = this.getPowerup();
	var path = this.findPath(AISnake.AI_BUDGET);
	if(path.path.length > 1){
		var next = path.path[1];
		var input = this.getInputTo(next);
		if(input !== undefined && this.input(input)){
			this.emit("input", input);
		}
		console.log("AI", path, next, input);
	}
};

AISnake.prototype.getPowerup = function(){
	for(var i = 0; i < this.world.objects.length; i++){
		var obj = this.world.objects[i];
		// only simple powerup counts
		if(obj.constructor.cls == Powerup.cls){
			return obj;
		}
	}
};

AISnake.prototype.isEnd = function(node){
	var obj = this.world.getObjectAt(node);
	return obj instanceof Powerup;
};

var neighborMatrix = [
	[0, -1],
	[-1, 0], [1, 0],
	[0, 1]
];

AISnake.prototype.neighbor = function(node){
	var out = [];
	for(var i = 0; i < neighborMatrix.length; i++){
		var x = (node[0] + neighborMatrix[i][0] + this.world.width) % this.world.width;
		var y = (node[1] + neighborMatrix[i][1] + this.world.height) % this.world.height;
		var nNode = [x, y];
		if(!this.isWalkable(nNode)){
			continue;
		}
		out.push(nNode);
	}
	return out;
};
AISnake.prototype.distance = function(a, b){
	return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
};
AISnake.prototype.heuristic = function(node){
	if(!this._powerup){
		console.error("powerup not found");
		return 1000;
	}
	return this.distance(node, [this._powerup.x, this._powerup.y]);
};
AISnake.prototype.hash = function(node){
	return node.join(",");
};

AISnake.prototype.getStartNode = function(){
	return [this.x, this.y];
};

AISnake.prototype.findPath = function(timeout, start){
	return pathfinder({
		start: start !== undefined ? start : this.getStartNode(),
		isEnd: this.isEnd,
		neighbor: this.neighbor,
		distance: this.distance,
		heuristic: this.heuristic,
		hash: this.hash,
		timeout: timeout
	});
};

AISnake.prototype.isWalkable = function(node){
	var object = new WorldObject(this.world);
	object.x = node[0];
	object.y = node[1];
	var collision = this.world.checkCollision(object);
	for(var i = 0; i < collision.length; i++){
		if(collision[i].deadly){
			return false;
		}
	}
	return true;
};

AISnake.prototype.getInputTo = function(target, start){
	if(start === undefined){
		start = this.getStartNode();
	}

	var xDiff = start[0] - target[0];
	var yDiff = start[1] - target[1];

	if(xDiff == -1){
		return "right";
	}else if(xDiff == 1){
		return "left";
	}else if(yDiff == -1){
		return "down";
	}else if(yDiff == 1){
		return "up";
	}else if(xDiff < 0){ // wrap left
		return "left";
	}else if(xDiff > 0){
		return "right";
	}else if(yDiff < 0){
		return "up";
	}else if(yDiff > 0){
		return "down";
	}
};

module.exports = AISnake;