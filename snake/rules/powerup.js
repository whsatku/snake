"use strict";

var Powerup = function Powerup(){
	Powerup.super_.apply(this, arguments);
	this.on("collision", this.onCollide.bind(this));
};

require("util").inherits(Powerup, require("./worldobject"));

Powerup.cls = "Powerup";
Powerup.prototype.deadly = false;
Powerup.prototype.growth = 4;

Powerup.prototype.onCollide = function(){
	this.world.removeChild(this);
};

module.exports = Powerup;
