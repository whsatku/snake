"use strict";

var Obstacle = function Obstacle(){
	Obstacle.super_.apply(this, arguments);
	this.type = "#";
};

require("util").inherits(Obstacle, require("./worldobject"));

Obstacle.prototype.getState = function(){
	// obstacles are created from map and are not synced
	return {};
};
Obstacle.prototype.loadState = function(state){
	throw new Error("Obstacle loadState fire");
};

Obstacle.cls = "Obstacle";

module.exports = Obstacle;